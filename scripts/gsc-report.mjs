import { createSign } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * Pulls Search Console performance for every property the service account can
 * read and writes one report per run.
 *
 * The credential is a Google service account key, read from the environment so
 * it never reaches a file in the repository or a chat transcript. Grant the
 * service account access per property in Search Console → Settings → Users and
 * permissions.
 *
 * Signing the assertion by hand keeps this dependency-free: the googleapis
 * client would pull a large tree for two endpoints.
 */

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const API = "https://searchconsole.googleapis.com/webmasters/v3";
const WINDOW_DAYS = Number(process.env.GSC_WINDOW_DAYS ?? 28);
const ROW_LIMIT = Number(process.env.GSC_ROW_LIMIT ?? 250);
const outputDir = resolve(process.env.GSC_REPORT_DIR ?? "reports/gsc");

/** Search Console lags ~2 days; asking for today returns a half-empty window. */
const DATA_LAG_DAYS = 3;

function readCredential() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON is not set. Put the service-account key in the environment settings, never in the repository.",
    );
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON — paste the whole key file, including the braces.");
  }
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("The key is missing client_email or private_key — it is probably not a service-account key file.");
  }
  return parsed;
}

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

async function getAccessToken({ client_email, private_key, token_uri }) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: client_email,
      scope: SCOPE,
      aud: token_uri ?? "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const signature = signer.sign(private_key.replace(/\\n/g, "\n"), "base64url");

  const response = await fetch(token_uri ?? "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${signature}`,
    }),
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`Token request failed (${response.status}): ${body.error_description ?? JSON.stringify(body)}`);
  }
  return body.access_token;
}

async function api(path, token, init = {}) {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...(init.headers ?? {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body?.error?.message ?? `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return body;
}

function isoDay(offsetDays) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - offsetDays);
  return date.toISOString().slice(0, 10);
}

/**
 * Brand queries prove the site is findable by name; non-brand queries are the
 * only evidence of demand the business did not already own, so they are
 * counted apart rather than blended into one total.
 */
function brandTerms(siteUrl) {
  const host = siteUrl.replace(/^sc-domain:/, "").replace(/^https?:\/\//, "").replace(/\/$/, "").replace(/^www\./, "");
  const [name] = host.split(".");
  const words = name.split(/[-_]/).filter((word) => word.length > 2);
  return [name.replace(/[-_]/g, " "), name.replace(/[-_]/g, ""), ...words];
}

function isBrand(query, terms) {
  const normalized = query.toLowerCase().replace(/\s+/g, " ");
  return terms.some((term) => term.length > 2 && normalized.includes(term.toLowerCase()));
}

async function queryRows(token, siteUrl, { startDate, endDate, dimensions }) {
  const body = await api(`/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, token, {
    method: "POST",
    body: JSON.stringify({ startDate, endDate, dimensions, rowLimit: ROW_LIMIT, dataState: "final" }),
  });
  return body.rows ?? [];
}

function totals(rows) {
  return rows.reduce(
    (sum, row) => ({
      clicks: sum.clicks + (row.clicks ?? 0),
      impressions: sum.impressions + (row.impressions ?? 0),
    }),
    { clicks: 0, impressions: 0 },
  );
}

function delta(current, previous) {
  if (previous === 0) return current === 0 ? "0%" : "новое";
  const change = Math.round(((current - previous) / previous) * 100);
  return `${change >= 0 ? "+" : ""}${change}%`;
}

async function auditSite(token, siteEntry) {
  const siteUrl = siteEntry.siteUrl;
  const current = { startDate: isoDay(DATA_LAG_DAYS + WINDOW_DAYS), endDate: isoDay(DATA_LAG_DAYS) };
  const previous = {
    startDate: isoDay(DATA_LAG_DAYS + WINDOW_DAYS * 2),
    endDate: isoDay(DATA_LAG_DAYS + WINDOW_DAYS + 1),
  };

  const [queriesNow, queriesBefore, pages] = await Promise.all([
    queryRows(token, siteUrl, { ...current, dimensions: ["query"] }),
    queryRows(token, siteUrl, { ...previous, dimensions: ["query"] }),
    queryRows(token, siteUrl, { ...current, dimensions: ["page"] }),
  ]);

  const terms = brandTerms(siteUrl);
  const split = (rows) => {
    const brand = rows.filter((row) => isBrand(row.keys[0], terms));
    const nonBrand = rows.filter((row) => !isBrand(row.keys[0], terms));
    return { brand: totals(brand), nonBrand: totals(nonBrand), nonBrandRows: nonBrand };
  };

  const now = split(queriesNow);
  const before = split(queriesBefore);

  return {
    siteUrl,
    permission: siteEntry.permissionLevel,
    window: current,
    previousWindow: previous,
    total: totals(queriesNow),
    brand: now.brand,
    nonBrand: now.nonBrand,
    trend: {
      clicks: delta(totals(queriesNow).clicks, totals(queriesBefore).clicks),
      nonBrandClicks: delta(now.nonBrand.clicks, before.nonBrand.clicks),
    },
    topNonBrand: now.nonBrandRows
      .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
      .slice(0, 10)
      .map((row) => ({
        query: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        position: Number(row.position?.toFixed(1)),
      })),
    // Impressions without clicks mean Google shows the page but nobody picks
    // it — a title/description problem, not a ranking problem.
    missedOpportunities: now.nonBrandRows
      .filter((row) => row.impressions >= 30 && row.clicks === 0)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 10)
      .map((row) => ({
        query: row.keys[0],
        impressions: row.impressions,
        position: Number(row.position?.toFixed(1)),
      })),
    topPages: pages
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)
      .map((row) => ({ page: row.keys[0], clicks: row.clicks, impressions: row.impressions })),
  };
}

function renderText(report) {
  const lines = [
    `Search Console — отчёт за ${report.generatedAt}`,
    `Окно: ${WINDOW_DAYS} дней, сравнение с предыдущими ${WINDOW_DAYS}`,
    "",
  ];
  for (const site of report.sites) {
    if (site.error) {
      lines.push(`✗ ${site.siteUrl}: ${site.error}`, "");
      continue;
    }
    lines.push(
      `■ ${site.siteUrl}`,
      `  клики: ${site.total.clicks} (${site.trend.clicks}) · показы: ${site.total.impressions}`,
      `  бренд: ${site.brand.clicks} кликов · небренд: ${site.nonBrand.clicks} кликов (${site.trend.nonBrandClicks})`,
    );
    if (site.topNonBrand.length > 0) {
      lines.push("  небрендовые запросы с кликами:");
      for (const row of site.topNonBrand) {
        lines.push(`    ${row.clicks} кл · ${row.impressions} показов · поз. ${row.position} — ${row.query}`);
      }
    }
    if (site.missedOpportunities.length > 0) {
      lines.push("  показывают, но не кликают (проверить заголовок и описание):");
      for (const row of site.missedOpportunities) {
        lines.push(`    ${row.impressions} показов · поз. ${row.position} — ${row.query}`);
      }
    }
    lines.push("");
  }
  return lines.join("\n");
}

async function main() {
  const credential = readCredential();
  const token = await getAccessToken(credential);
  const { siteEntry = [] } = await api("/sites", token);

  if (siteEntry.length === 0) {
    throw new Error(
      `The service account ${credential.client_email} can read no properties yet. Add it in Search Console → Settings → Users and permissions.`,
    );
  }

  const sites = [];
  for (const entry of siteEntry) {
    try {
      sites.push(await auditSite(token, entry));
    } catch (error) {
      sites.push({ siteUrl: entry.siteUrl, error: error.message });
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    serviceAccount: credential.client_email,
    windowDays: WINDOW_DAYS,
    sites: sites.sort((a, b) => (b.total?.clicks ?? 0) - (a.total?.clicks ?? 0)),
  };

  await mkdir(outputDir, { recursive: true });
  const stamp = report.generatedAt.slice(0, 10);
  await writeFile(resolve(outputDir, `gsc-${stamp}.json`), `${JSON.stringify(report, null, 2)}\n`);
  const text = renderText(report);
  await writeFile(resolve(outputDir, `gsc-${stamp}.txt`), `${text}\n`);
  console.log(text);
  console.log(`Отчёт сохранён: ${outputDir}/gsc-${stamp}.json и .txt`);
}

main().catch((error) => {
  console.error(`\n✗ ${error.message}\n`);
  process.exitCode = 1;
});
