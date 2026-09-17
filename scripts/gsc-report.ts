import { GoogleAuth } from "google-auth-library";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const DAY_MS = 24 * 60 * 60 * 1000;
const SEARCH_CONSOLE_API = "https://searchconsole.googleapis.com/webmasters/v3";
const SEARCH_CONSOLE_READONLY_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

export type DateWindow = {
  startDate: string;
  endDate: string;
};

export type GscPropertyConfig = {
  projectId: string;
  canonicalSiteUrl: string;
  label: string;
  brandTerms: string[];
  aliases?: string[];
};

export type GscConfig = {
  schemaVersion: 2;
  properties: Record<string, GscPropertyConfig>;
};

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
  [key: string]: unknown;
};

type GoogleAuthLike = {
  getCredentials: () => Promise<{ client_email?: string | null }>;
  getAccessToken: () => Promise<string | null | undefined>;
};

type GoogleAuthFactory = (options: {
  scopes: string[];
  keyFilename?: string;
  credentials?: ServiceAccountCredentials;
}) => GoogleAuthLike;

type AuthContextOptions = {
  env: Record<string, string | undefined>;
  expectedServiceAccount: string;
  authFactory?: GoogleAuthFactory;
};

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function buildDateWindows(now: Date, windowDays: number, lagDays: number) {
  if (!Number.isInteger(windowDays) || windowDays < 1) {
    throw new Error("GSC window days must be a positive integer.");
  }
  if (!Number.isInteger(lagDays) || lagDays < 0) {
    throw new Error("GSC data lag days must be a non-negative integer.");
  }

  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const currentEnd = todayUtc - lagDays * DAY_MS;
  const currentStart = currentEnd - (windowDays - 1) * DAY_MS;
  const previousEnd = currentStart - DAY_MS;
  const previousStart = previousEnd - (windowDays - 1) * DAY_MS;

  return {
    current: {
      startDate: isoDay(new Date(currentStart)),
      endDate: isoDay(new Date(currentEnd)),
    },
    previous: {
      startDate: isoDay(new Date(previousStart)),
      endDate: isoDay(new Date(previousEnd)),
    },
  };
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("und")
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function loadGscConfig(configPath: string): Promise<GscConfig> {
  let value: unknown;
  try {
    value = JSON.parse(await readFile(resolve(configPath), "utf8"));
  } catch {
    throw new Error(`Unable to read a valid GSC config from ${configPath}.`);
  }

  if (!value || typeof value !== "object") throw new Error("GSC config must be an object.");
  const candidate = value as Partial<GscConfig>;
  if (candidate.schemaVersion !== 2) {
    throw new Error("GSC config has an unsupported schema.");
  }
  if (!candidate.properties || typeof candidate.properties !== "object") {
    throw new Error("GSC config must define properties.");
  }
  const projectIds = new Set<string>();
  const canonicalSiteUrls = new Set<string>();
  const configuredSiteUrls = new Set<string>();
  for (const [siteUrl, property] of Object.entries(candidate.properties)) {
    if (
      !siteUrl ||
      !property ||
      typeof property.projectId !== "string" ||
      property.projectId.trim().length === 0 ||
      typeof property.canonicalSiteUrl !== "string" ||
      property.canonicalSiteUrl.trim().length === 0 ||
      typeof property.label !== "string" ||
      property.label.trim().length === 0 ||
      !Array.isArray(property.brandTerms) ||
      property.brandTerms.length === 0 ||
      !property.brandTerms.every((term) => typeof term === "string" && term.trim().length > 0) ||
      (property.aliases !== undefined &&
        (!Array.isArray(property.aliases) ||
          !property.aliases.every((alias) => typeof alias === "string" && alias.trim().length > 0))) ||
      !new Set([siteUrl, ...(property.aliases ?? [])]).has(property.canonicalSiteUrl)
    ) {
      throw new Error(`GSC property config is invalid for ${siteUrl}.`);
    }
    if (projectIds.has(property.projectId)) {
      throw new Error(`GSC project ID is duplicated: ${property.projectId}.`);
    }
    if (canonicalSiteUrls.has(property.canonicalSiteUrl)) {
      throw new Error(`GSC canonical property is duplicated: ${property.canonicalSiteUrl}.`);
    }
    projectIds.add(property.projectId);
    canonicalSiteUrls.add(property.canonicalSiteUrl);

    for (const configuredSiteUrl of new Set([siteUrl, ...(property.aliases ?? [])])) {
      if (configuredSiteUrls.has(configuredSiteUrl)) {
        throw new Error(`GSC property or alias is duplicated: ${configuredSiteUrl}.`);
      }
      configuredSiteUrls.add(configuredSiteUrl);
    }
  }
  return candidate as GscConfig;
}

function parseInlineCredentials(raw: string): ServiceAccountCredentials {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not valid service-account JSON.");
  }
  if (
    !value ||
    typeof value !== "object" ||
    typeof (value as Partial<ServiceAccountCredentials>).client_email !== "string" ||
    typeof (value as Partial<ServiceAccountCredentials>).private_key !== "string"
  ) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not valid service-account JSON.");
  }
  return value as ServiceAccountCredentials;
}

export async function createGoogleAuthContext({
  env,
  expectedServiceAccount,
  authFactory = (options) => new GoogleAuth(options),
}: AuthContextOptions) {
  const keyFilename = env.GOOGLE_APPLICATION_CREDENTIALS;
  const inlineCredentials = env.GOOGLE_SERVICE_ACCOUNT_JSON;
  let auth: GoogleAuthLike;

  if (keyFilename) {
    if (!isAbsolute(keyFilename)) {
      throw new Error("GOOGLE_APPLICATION_CREDENTIALS must be an absolute path.");
    }
    auth = authFactory({ scopes: [SEARCH_CONSOLE_READONLY_SCOPE], keyFilename });
  } else if (inlineCredentials) {
    auth = authFactory({
      scopes: [SEARCH_CONSOLE_READONLY_SCOPE],
      credentials: parseInlineCredentials(inlineCredentials),
    });
  } else {
    throw new Error("No Google credentials configured. Set GOOGLE_APPLICATION_CREDENTIALS to an absolute path.");
  }

  let serviceAccount: string | null | undefined;
  try {
    serviceAccount = (await auth.getCredentials()).client_email;
  } catch {
    throw new Error("Google authentication could not read the configured credentials.");
  }
  if (!serviceAccount || serviceAccount !== expectedServiceAccount) {
    throw new Error("Authenticated service account does not match the configured account.");
  }

  return {
    serviceAccount,
    async getAccessToken() {
      try {
        const token = await auth.getAccessToken();
        if (!token) throw new Error("missing token");
        return token;
      } catch {
        throw new Error("Google authentication failed to obtain an access token.");
      }
    },
  };
}

export function resolvePropertyConfig(config: GscConfig, siteUrl: string): GscPropertyConfig | undefined {
  const direct = config.properties[siteUrl];
  if (direct) return direct;
  return Object.values(config.properties).find((property) => property.aliases?.includes(siteUrl));
}

export function classifyQuery(
  query: string,
  brandTerms: string[] | undefined,
): "brand" | "nonBrand" | "unclassified" {
  if (!brandTerms || brandTerms.length === 0) return "unclassified";

  const normalizedQuery = ` ${normalizeSearchText(query)} `;
  const isBrand = brandTerms.some((term) => {
    const normalizedTerm = normalizeSearchText(term);
    return normalizedTerm.length > 0 && normalizedQuery.includes(` ${normalizedTerm} `);
  });

  return isBrand ? "brand" : "nonBrand";
}

export type GscRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

export type GscMetrics = {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type GscSiteEntry = {
  siteUrl: string;
  permissionLevel: string;
};

type OpportunityFocus = "snippet_and_intent" | "ranking_and_snippet" | "content_and_relevance";

const OPPORTUNITY_GUIDANCE: Record<OpportunityFocus, string> = {
  snippet_and_intent: "Проверить соответствие интенту и то, как страница представлена в сниппете.",
  ranking_and_snippet: "Проверить релевантность страницы, внутренние ссылки и представление в сниппете.",
  content_and_relevance: "Проверить содержание, релевантность запросу и возможность усилить позиции.",
};

export function buildOpportunities(
  rows: GscRow[],
  { minImpressions = 30, maxCtr = 0.02 }: { minImpressions?: number; maxCtr?: number } = {},
) {
  const priorities: Record<OpportunityFocus, number> = {
    snippet_and_intent: 0,
    ranking_and_snippet: 1,
    content_and_relevance: 2,
  };

  return rows
    .filter((row) => (row.impressions ?? 0) >= minImpressions && (row.ctr ?? 0) <= maxCtr)
    .map((row) => {
      const position = row.position ?? 0;
      const focus: OpportunityFocus =
        position <= 5 ? "snippet_and_intent" : position <= 15 ? "ranking_and_snippet" : "content_and_relevance";
      return {
        query: row.keys?.[0] ?? "",
        page: row.keys?.[1] ?? "",
        clicks: row.clicks ?? 0,
        impressions: row.impressions ?? 0,
        ctr: row.ctr ?? 0,
        position: Number(position.toFixed(1)),
        focus,
        guidance: OPPORTUNITY_GUIDANCE[focus],
      };
    })
    .sort((a, b) => priorities[a.focus] - priorities[b.focus] || b.impressions - a.impressions);
}

function metricsOf(row: GscRow | undefined): GscMetrics {
  return {
    clicks: row?.clicks ?? 0,
    impressions: row?.impressions ?? 0,
    ctr: row?.ctr ?? 0,
    position: row?.position ?? 0,
  };
}

type GscClientOptions = {
  fetchImpl?: typeof fetch;
  getAccessToken: () => Promise<string>;
  rowLimit?: number;
  maxRetries?: number;
  timeoutMs?: number;
  sleep?: (milliseconds: number) => Promise<void>;
};

function defaultSleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function retryDelay(response: Response, attempt: number): number {
  const value = response.headers.get("retry-after");
  if (value) {
    const seconds = Number(value);
    if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1_000;
    const date = Date.parse(value);
    if (Number.isFinite(date)) return Math.max(0, date - Date.now());
  }
  return 500 * 2 ** attempt;
}

class GscApiError extends Error {
  constructor(public readonly status: number) {
    super(`Search Console request failed with HTTP ${status}.`);
    this.name = "GscApiError";
  }
}

export function createGscClient({
  fetchImpl = fetch,
  getAccessToken,
  rowLimit = 25_000,
  maxRetries = 3,
  timeoutMs = 15_000,
  sleep = defaultSleep,
}: GscClientOptions) {
  if (!Number.isInteger(rowLimit) || rowLimit < 1 || rowLimit > 25_000) {
    throw new Error("GSC row limit must be an integer between 1 and 25000.");
  }

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      const token = await getAccessToken();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      let response: Response;
      try {
        response = await fetchImpl(`${SEARCH_CONSOLE_API}${path}`, {
          ...init,
          headers: {
            authorization: `Bearer ${token}`,
            "content-type": "application/json",
            ...init.headers,
          },
          signal: controller.signal,
        });
      } catch {
        if (attempt < maxRetries) {
          await sleep(500 * 2 ** attempt);
          continue;
        }
        if (controller.signal.aborted) {
          throw new Error("Search Console request timed out.");
        }
        throw new Error("Search Console network request failed.");
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) {
        const retryable = response.status === 429 || response.status >= 500;
        if (retryable && attempt < maxRetries) {
          await sleep(retryDelay(response, attempt));
          continue;
        }
        throw new GscApiError(response.status);
      }

      try {
        return (await response.json()) as T;
      } catch {
        throw new Error("Search Console returned invalid JSON.");
      }
    }
    throw new Error("Search Console retry loop ended unexpectedly.");
  }

  async function query(siteUrl: string, body: Record<string, unknown>): Promise<GscRow[]> {
    const response = await request<{ rows?: GscRow[] }>(
      `/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      { method: "POST", body: JSON.stringify(body) },
    );
    return response.rows ?? [];
  }

  return {
    async listSites(): Promise<GscSiteEntry[]> {
      const response = await request<{ siteEntry?: GscSiteEntry[] }>("/sites");
      return response.siteEntry ?? [];
    },

    async queryAggregate(siteUrl: string, window: DateWindow): Promise<GscMetrics> {
      const rows = await query(siteUrl, {
        ...window,
        dataState: "final",
        rowLimit: 1,
      });
      return metricsOf(rows[0]);
    },

    async queryAllRows(siteUrl: string, window: DateWindow, dimensions: string[]): Promise<GscRow[]> {
      const allRows: GscRow[] = [];
      let startRow = 0;

      while (true) {
        const rows = await query(siteUrl, {
          ...window,
          dimensions,
          dataState: "final",
          rowLimit,
          startRow,
        });
        allRows.push(...rows);
        if (rows.length < rowLimit) return allRows;
        startRow += rows.length;
      }
    },
  };
}

export type GscClient = ReturnType<typeof createGscClient>;

type ClickImpressionTotals = {
  clicks: number;
  impressions: number;
};

function rowTotals(rows: GscRow[]): ClickImpressionTotals {
  return rows.reduce<ClickImpressionTotals>(
    (total, row) => ({
      clicks: total.clicks + (row.clicks ?? 0),
      impressions: total.impressions + (row.impressions ?? 0),
    }),
    { clicks: 0, impressions: 0 },
  );
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 10_000) / 100;
}

function ratio(visible: number, total: number): number | null {
  if (total === 0) return visible === 0 ? 1 : null;
  return Math.round((visible / total) * 10_000) / 10_000;
}

function splitVisibleQueries(rows: GscRow[], brandTerms: string[] | undefined) {
  const brand: GscRow[] = [];
  const nonBrand: GscRow[] = [];
  const unclassified: GscRow[] = [];

  for (const row of rows) {
    const classification = classifyQuery(row.keys?.[0] ?? "", brandTerms);
    if (classification === "brand") brand.push(row);
    else if (classification === "nonBrand") nonBrand.push(row);
    else unclassified.push(row);
  }

  return {
    brand: rowTotals(brand),
    nonBrand: rowTotals(nonBrand),
    unclassified: rowTotals(unclassified),
    nonBrandRows: nonBrand,
  };
}

async function auditSite(
  client: GscClient,
  siteEntry: GscSiteEntry,
  property: GscPropertyConfig | undefined,
  windows: { current: DateWindow; previous: DateWindow },
  includeRawRows = false,
) {
  const [total, previousTotal, currentQueries, previousQueries, pages, queryPages] = await Promise.all([
    client.queryAggregate(siteEntry.siteUrl, windows.current),
    client.queryAggregate(siteEntry.siteUrl, windows.previous),
    client.queryAllRows(siteEntry.siteUrl, windows.current, ["query"]),
    client.queryAllRows(siteEntry.siteUrl, windows.previous, ["query"]),
    client.queryAllRows(siteEntry.siteUrl, windows.current, ["page"]),
    client.queryAllRows(siteEntry.siteUrl, windows.current, ["query", "page"]),
  ]);
  let rawRows;
  if (includeRawRows) {
    const [previousPages, previousQueryPages, countries, previousCountries, devices,
      previousDevices, combined, previousCombined, dates, previousDates] = await Promise.all([
      client.queryAllRows(siteEntry.siteUrl, windows.previous, ["page"]),
      client.queryAllRows(siteEntry.siteUrl, windows.previous, ["query", "page"]),
      client.queryAllRows(siteEntry.siteUrl, windows.current, ["country"]),
      client.queryAllRows(siteEntry.siteUrl, windows.previous, ["country"]),
      client.queryAllRows(siteEntry.siteUrl, windows.current, ["device"]),
      client.queryAllRows(siteEntry.siteUrl, windows.previous, ["device"]),
      client.queryAllRows(siteEntry.siteUrl, windows.current, ["query", "page", "country", "device"]),
      client.queryAllRows(siteEntry.siteUrl, windows.previous, ["query", "page", "country", "device"]),
      client.queryAllRows(siteEntry.siteUrl, windows.current, ["date"]),
      client.queryAllRows(siteEntry.siteUrl, windows.previous, ["date"]),
    ]);
    rawRows = {
      current: { queries: currentQueries, pages, queryPages, countries, devices, combined, dates },
      previous: { queries: previousQueries, pages: previousPages, queryPages: previousQueryPages,
        countries: previousCountries, devices: previousDevices, combined: previousCombined, dates: previousDates },
      combinedDimensions: ["query", "page", "country", "device"],
    };
  }
  const currentSplit = splitVisibleQueries(currentQueries, property?.brandTerms);
  const previousSplit = splitVisibleQueries(previousQueries, property?.brandTerms);
  const visible = rowTotals(currentQueries);
  const nonBrandQueryPages = queryPages.filter(
    (row) => classifyQuery(row.keys?.[0] ?? "", property?.brandTerms) === "nonBrand",
  );

  return {
    ...(rawRows ? { rawRows } : {}),
    siteUrl: siteEntry.siteUrl,
    projectId: property?.projectId ?? null,
    canonical: property?.canonicalSiteUrl === siteEntry.siteUrl,
    label: property?.label ?? siteEntry.siteUrl,
    permission: siteEntry.permissionLevel,
    classification: property ? "configured" as const : "unclassified" as const,
    total,
    previousTotal,
    trend: {
      clicksPercent: percentChange(total.clicks, previousTotal.clicks),
      impressionsPercent: percentChange(total.impressions, previousTotal.impressions),
      visibleNonBrandClicksPercent: percentChange(currentSplit.nonBrand.clicks, previousSplit.nonBrand.clicks),
    },
    queryCoverage: {
      visibleClicks: visible.clicks,
      totalClicks: total.clicks,
      clickRatio: ratio(visible.clicks, total.clicks),
      visibleImpressions: visible.impressions,
      totalImpressions: total.impressions,
      impressionRatio: ratio(visible.impressions, total.impressions),
    },
    visibleQueryBreakdown: {
      brand: currentSplit.brand,
      nonBrand: currentSplit.nonBrand,
      unclassified: currentSplit.unclassified,
    },
    topNonBrand: [...currentSplit.nonBrandRows]
      .sort((a, b) => (b.clicks ?? 0) - (a.clicks ?? 0) || (b.impressions ?? 0) - (a.impressions ?? 0))
      .slice(0, 10)
      .map((row) => ({
        query: row.keys?.[0] ?? "",
        clicks: row.clicks ?? 0,
        impressions: row.impressions ?? 0,
        ctr: row.ctr ?? 0,
        position: Number((row.position ?? 0).toFixed(1)),
      })),
    opportunities: buildOpportunities(nonBrandQueryPages).slice(0, 10),
    topPages: [...pages]
      .sort((a, b) => (b.clicks ?? 0) - (a.clicks ?? 0) || (b.impressions ?? 0) - (a.impressions ?? 0))
      .slice(0, 10)
      .map((row) => ({
        page: row.keys?.[0] ?? "",
        clicks: row.clicks ?? 0,
        impressions: row.impressions ?? 0,
        ctr: row.ctr ?? 0,
        position: Number((row.position ?? 0).toFixed(1)),
      })),
  };
}

async function mapConcurrent<T, R>(items: T[], limit: number, mapper: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

type GenerateReportOptions = {
  client: GscClient;
  config: GscConfig;
  serviceAccount: string;
  expectedServiceAccount: string;
  now?: Date;
  windowDays?: number;
  lagDays?: number;
  concurrency?: number;
  selenaOnly?: boolean;
};

export async function generateGscReport({
  client,
  config,
  serviceAccount,
  expectedServiceAccount,
  now = new Date(),
  selenaOnly = false,
  windowDays = selenaOnly ? 90 : 28,
  lagDays = 3,
  concurrency = 3,
}: GenerateReportOptions) {
  if (serviceAccount !== expectedServiceAccount) {
    throw new Error("Authenticated service account does not match the configured account.");
  }
  const targetSiteUrl = "https://www.selenasystems.com/";
  const targetProperty = resolvePropertyConfig(config, targetSiteUrl);
  if (selenaOnly && (targetProperty?.projectId !== "selena-systems" || targetProperty.canonicalSiteUrl !== targetSiteUrl)) {
    throw new Error("Selena-only export requires the configured Selena Systems canonical property.");
  }
  // A scoped run never lists or queries the account's other properties.
  const siteEntries: GscSiteEntry[] = selenaOnly
    ? [{ siteUrl: targetSiteUrl, permissionLevel: "UNKNOWN (not queried; API authorizes each request)" }]
    : await client.listSites();
  if (siteEntries.length === 0) {
    throw new Error("The service account has no readable Search Console properties.");
  }
  const reportConfig: GscConfig = selenaOnly
    ? { schemaVersion: 2, properties: { [targetSiteUrl]: targetProperty! } }
    : config;
  let windowClock = now;
  if (selenaOnly) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(now).map(({ type, value }) => [type, value]));
    windowClock = new Date(`${parts.year}-${parts.month}-${parts.day}T00:00:00Z`);
  }
  const windows = buildDateWindows(windowClock, windowDays, lagDays);
  const sites = await mapConcurrent(siteEntries, concurrency, async (siteEntry) => {
    const property = resolvePropertyConfig(reportConfig, siteEntry.siteUrl);
    try {
      return await auditSite(client, siteEntry, property, windows, selenaOnly);
    } catch (error) {
      if (selenaOnly) {
        throw new Error(error instanceof GscApiError
          ? `Selena-only export failed: ${error.message}`
          : "Selena-only export failed; no baseline was written.");
      }
      return {
        siteUrl: siteEntry.siteUrl,
        projectId: property?.projectId ?? null,
        canonical: property?.canonicalSiteUrl === siteEntry.siteUrl,
        label: property?.label ?? siteEntry.siteUrl,
        permission: siteEntry.permissionLevel,
        classification: property ? "configured" as const : "unclassified" as const,
        error: error instanceof GscApiError ? error.message : "Unexpected error while reading this property.",
        total: metricsOf(undefined),
        previousTotal: metricsOf(undefined),
        trend: { clicksPercent: null, impressionsPercent: null, visibleNonBrandClicksPercent: null },
        queryCoverage: {
          visibleClicks: 0,
          totalClicks: 0,
          clickRatio: null,
          visibleImpressions: 0,
          totalImpressions: 0,
          impressionRatio: null,
        },
        visibleQueryBreakdown: {
          brand: { clicks: 0, impressions: 0 },
          nonBrand: { clicks: 0, impressions: 0 },
          unclassified: { clicks: 0, impressions: 0 },
        },
        topNonBrand: [],
        opportunities: [],
        topPages: [],
      };
    }
  });

  const sortedSites = sites.sort((a, b) => b.total.clicks - a.total.clicks);
  const availableSiteUrls = new Set(siteEntries.map((site) => site.siteUrl));
  const projects = sortedSites
    .filter((site) => site.canonical && site.projectId !== null)
    .map((site) => ({
      projectId: site.projectId as string,
      label: site.label,
      canonicalSiteUrl: site.siteUrl,
      status: "error" in site ? "error" as const : "ok" as const,
      ...("error" in site ? { error: site.error } : {}),
      total: site.total,
      previousTotal: site.previousTotal,
      trend: site.trend,
      queryCoverage: site.queryCoverage,
      visibleQueryBreakdown: site.visibleQueryBreakdown,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const missingCanonicalProperties = Object.values(reportConfig.properties)
    .filter((property) => !availableSiteUrls.has(property.canonicalSiteUrl))
    .map((property) => ({
      projectId: property.projectId,
      label: property.label,
      canonicalSiteUrl: property.canonicalSiteUrl,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return {
    schemaVersion: 3,
    generatedAt: now.toISOString(),
    serviceAccount: selenaOnly ? "REDACTED (identity verified before export)" : serviceAccount,
    ...(selenaOnly ? { scope: {
      siteUrl: targetSiteUrl,
      reportingTimeZone: "America/Los_Angeles",
      searchType: "web (API default)",
      dataState: "final",
      caveat: "API rows are limited and may omit anonymized queries; pagination is not a completeness guarantee. Country is search geography, not business location or language; Bali is not a country dimension.",
    } } : {}),
    windowDays,
    windows,
    limitations: [
      "Query rows can omit anonymized queries; aggregate totals are the source of truth.",
      "Opportunity labels are review prompts, not proof of a single ranking or CTR cause.",
      "Project totals use only the configured canonical property; aliases remain available for diagnostics.",
    ],
    projects,
    missingCanonicalProperties,
    sites: sortedSites,
  };
}

export type GscReport = Awaited<ReturnType<typeof generateGscReport>>;

function formatTrend(value: number | null): string {
  if (value === null) return "new against a zero baseline";
  return `${value >= 0 ? "+" : ""}${value}%`;
}

export function renderGscText(report: GscReport): string {
  const lines = [
    `Search Console report generated ${report.generatedAt}`,
    `Current window: ${report.windows.current.startDate} to ${report.windows.current.endDate}`,
    `Previous window: ${report.windows.previous.startDate} to ${report.windows.previous.endDate}`,
    "",
    "Limitations:",
    ...report.limitations.map((limitation) => `- ${limitation}`),
    "",
    "Canonical project summary:",
  ];

  if (report.projects.length === 0) {
    lines.push("- No canonical properties were available.");
  }
  for (const project of report.projects) {
    lines.push(
      `- ${project.label} (${project.canonicalSiteUrl}): ${project.total.clicks} clicks, ` +
        `${project.total.impressions} impressions, ${formatTrend(project.trend.clicksPercent)}`,
    );
    if (project.status === "error" && "error" in project) {
      lines.push(`  Error: ${project.error}`);
    }
  }

  if (report.missingCanonicalProperties.length > 0) {
    lines.push("", "Canonical properties not returned by sites.list:");
    for (const property of report.missingCanonicalProperties) {
      lines.push(`- ${property.label} (${property.canonicalSiteUrl})`);
    }
  }

  lines.push("", "All accessible properties:", "");

  for (const site of report.sites) {
    const role = site.projectId === null ? "unclassified" : site.canonical ? "canonical" : "alias";
    lines.push(`${site.label} (${site.siteUrl}) [${role}]`);
    if ("error" in site) {
      lines.push(`  Error: ${site.error}`, "");
      continue;
    }
    lines.push(
      `  Aggregate clicks: ${site.total.clicks} (${formatTrend(site.trend.clicksPercent)})`,
      `  Aggregate impressions: ${site.total.impressions} (${formatTrend(site.trend.impressionsPercent)})`,
      `  Visible query clicks: ${site.queryCoverage.visibleClicks}/${site.queryCoverage.totalClicks} ` +
        `(coverage ${site.queryCoverage.clickRatio === null ? "n/a" : `${Math.round(site.queryCoverage.clickRatio * 100)}%`})`,
      `  Visible query split: brand ${site.visibleQueryBreakdown.brand.clicks}, ` +
        `non-brand ${site.visibleQueryBreakdown.nonBrand.clicks}, ` +
        `unclassified ${site.visibleQueryBreakdown.unclassified.clicks}`,
    );
    if (site.classification === "unclassified") {
      lines.push("  Brand classification: unclassified until this exact property is configured.");
    }
    if (site.opportunities.length > 0) {
      lines.push("  Review opportunities:");
      for (const opportunity of site.opportunities) {
        lines.push(
          `    ${opportunity.query} -> ${opportunity.page} | position ${opportunity.position} | ${opportunity.guidance}`,
        );
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}

export async function writeGscReport(report: GscReport, outputDir: string) {
  await mkdir(outputDir, { recursive: true, mode: 0o700 });
  await chmod(outputDir, 0o700);
  const stamp = report.generatedAt.replace(/[:.]/g, "-");
  const jsonPath = resolve(outputDir, `gsc-${stamp}.json`);
  const textPath = resolve(outputDir, `gsc-${stamp}.txt`);
  const text = renderGscText(report);

  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  await writeFile(textPath, `${text}\n`, { mode: 0o600 });
  await Promise.all([chmod(jsonPath, 0o600), chmod(textPath, 0o600)]);

  return { jsonPath, textPath, text };
}

function argumentValue(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

function positiveInteger(value: string | undefined, fallback: number, name: string): number {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`${name} must be a positive integer.`);
  return parsed;
}

type RunCliOptions = {
  args?: string[];
  env?: Record<string, string | undefined>;
  authFactory?: GoogleAuthFactory;
  fetchImpl?: typeof fetch;
  stdout?: (line: string) => void;
  now?: Date;
};

export async function runGscCli({
  args = process.argv.slice(2),
  env = process.env,
  authFactory,
  fetchImpl = fetch,
  stdout = console.log,
  now = new Date(),
}: RunCliOptions = {}) {
  const selenaOnly = args.includes("--selena-only");
  if (selenaOnly && args.includes("--list-sites")) {
    throw new Error("Selena-only export cannot enumerate account properties.");
  }
  const configPath = argumentValue(args, "--config") ?? env.GSC_CONFIG_PATH ?? "config/gsc-properties.json";
  const config = await loadGscConfig(configPath);
  const expectedServiceAccount = env.GSC_EXPECTED_SERVICE_ACCOUNT?.trim();
  if (!expectedServiceAccount) {
    throw new Error("GSC_EXPECTED_SERVICE_ACCOUNT must identify the approved service account.");
  }
  const auth = await createGoogleAuthContext({
    env,
    expectedServiceAccount,
    authFactory,
  });
  const rowLimit = positiveInteger(env.GSC_ROW_LIMIT, 25_000, "GSC_ROW_LIMIT");
  const client = createGscClient({
    fetchImpl,
    getAccessToken: auth.getAccessToken,
    rowLimit,
    timeoutMs: positiveInteger(env.GSC_TIMEOUT_MS, 15_000, "GSC_TIMEOUT_MS"),
  });

  if (args.includes("--list-sites")) {
    const sites = await client.listSites();
    if (sites.length === 0) throw new Error("The service account has no readable Search Console properties.");
    const lines = ["Search Console properties:"];
    for (const site of sites) {
      const property = resolvePropertyConfig(config, site.siteUrl);
      lines.push(
        property
          ? `[configured][${property.canonicalSiteUrl === site.siteUrl ? "canonical" : "alias"}] ` +
            `${property.label} | ${site.siteUrl} | ${site.permissionLevel}`
          : `[unclassified] ${site.siteUrl} | ${site.permissionLevel}`,
      );
    }
    const availableSiteUrls = new Set(sites.map((site) => site.siteUrl));
    const missing = Object.values(config.properties)
      .filter((property) => !availableSiteUrls.has(property.canonicalSiteUrl))
      .map((property) => property.canonicalSiteUrl);
    if (missing.length > 0) lines.push("", "Configured properties not returned by sites.list:", ...missing.map((site) => `- ${site}`));
    stdout(lines.join("\n"));
    return { mode: "list-sites" as const, sites };
  }

  const report = await generateGscReport({
    client,
    selenaOnly,
    config,
    serviceAccount: auth.serviceAccount,
    expectedServiceAccount,
    now,
    windowDays: positiveInteger(env.GSC_WINDOW_DAYS, selenaOnly ? 90 : 28, "GSC_WINDOW_DAYS"),
    lagDays: positiveInteger(env.GSC_DATA_LAG_DAYS, 3, "GSC_DATA_LAG_DAYS"),
    concurrency: positiveInteger(env.GSC_CONCURRENCY, 3, "GSC_CONCURRENCY"),
  });
  const outputDir = resolve(env.GSC_REPORT_DIR ?? (selenaOnly ? "reports/gsc/selena-only" : "reports/gsc"));
  const written = await writeGscReport(report, outputDir);
  stdout(`Report saved: ${written.jsonPath} and ${written.textPath}`);
  if (report.sites.every((site) => "error" in site)) {
    throw new Error("All Search Console properties failed. Review the saved private report.");
  }
  return { mode: "report" as const, report, ...written };
}

const executedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === executedPath) {
  runGscCli().catch((error: unknown) => {
    console.error(`\nGSC report failed: ${error instanceof Error ? error.message : "Unknown error."}\n`);
    process.exitCode = 1;
  });
}
