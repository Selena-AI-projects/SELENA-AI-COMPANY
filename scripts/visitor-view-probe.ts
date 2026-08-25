/**
 * Reads what a Bright Data collector actually returns, once per surface.
 *
 * The measurement path builds its request and reads its response from field
 * names taken off the account's own scraper pages — a hypothesis. If the guess
 * is wrong, an order pays for answers it cannot read, so this asks the question
 * before a customer does.
 *
 * It measures nothing and reports no visibility. Three answers, about half a
 * cent, and a report of the shape that came back — including the provider's own
 * words when it said something instead of answering.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import {
  askBrightData,
  BRIGHTDATA_PRICE_PER_ANSWER_USD,
  type BrightDataAsk,
  brightDataSurfaceKeys,
  brightDataSurfaces,
} from "@/lib/visibility-log/brightdata";

const OUTPUT_DIR = "reports/visitor-view";

/** One question, asked once per surface: three answers is the whole spend. */
const PROMPT = "Which food halls in Ubud, Bali are worth visiting?";

/**
 * The collector ids were transcribed from the account's scraper pages by eye.
 * A wrong one answers 404 and costs a run to find out, so the probe asks the
 * account what it actually holds. Listing is metadata and bills nothing.
 */
const DATASET_LIST_ENDPOINTS = [
  "https://api.brightdata.com/datasets/list",
  "https://api.brightdata.com/datasets/v3/list",
];

export async function listDatasets(apiKey: string, fetchImpl: typeof fetch = fetch): Promise<string> {
  for (const endpoint of DATASET_LIST_ENDPOINTS) {
    const response = await fetchImpl(endpoint, { headers: { Authorization: `Bearer ${apiKey}` } }).catch(() => null);
    if (!response?.ok) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(await response.text());
    } catch {
      continue;
    }
    const rows = Array.isArray(parsed) ? parsed : (parsed as { datasets?: unknown[] } | null)?.datasets;
    if (!Array.isArray(rows)) continue;
    const body = rows.slice(0, 60).map((row) => {
      const record = (row ?? {}) as Record<string, unknown>;
      return `| ${record.id ?? record.dataset_id ?? "?"} | ${record.name ?? record.dataset_name ?? ""} |`;
    });
    return [`Listed from ${endpoint}`, "", "| Dataset id | Name |", "| --- | --- |", ...body].join("\n");
  }
  return "The account's collector list could not be read from either known endpoint.";
}

export function renderMarkdown(results: BrightDataAsk[]): string {
  const lines: string[] = [];
  lines.push("# Bright Data response probe");
  lines.push("");
  lines.push(`Prompt: _${PROMPT}_`);
  lines.push("");
  lines.push(
    `Answers requested: ${results.length} · estimated spend $${(results.length * BRIGHTDATA_PRICE_PER_ANSWER_USD).toFixed(4)}`,
  );
  lines.push("");
  lines.push("| Surface | Result | Delivery | Answer field | Chars | Sources | Cost | Bytes |");
  lines.push("| --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const r of results) {
    const sources = r.sourceField ? `${r.sourceField} (${r.sources.length})` : "—";
    lines.push(
      `| ${r.surface} | ${r.error ?? "ok"} | ${r.delivery ?? "—"} | ${r.answerField ?? "—"} | ${r.answer?.length ?? "—"} | ${sources} | ${r.costUsd ?? "—"} | ${r.bytes} |`,
    );
  }
  lines.push("");
  for (const r of results) {
    lines.push(`## ${r.surface}`);
    lines.push("");
    lines.push(`- Collector: ${brightDataSurfaces[r.surface].datasetId}`);
    lines.push(`- Result: ${r.error ?? "answer found"}`);
    if (r.keys.length > 0) lines.push(`- Keys: ${r.keys.join(", ")}`);
    if (r.statusText) lines.push(`- Provider said: ${r.statusText}`);
    if (r.sources.length > 0) lines.push(`- Domains: ${[...new Set(r.sources.map((s) => s.domain))].join(", ")}`);
    if (r.answer) {
      lines.push("");
      lines.push(`> ${r.answer.slice(0, 280).replace(/\s+/g, " ").trim()}…`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export async function run(): Promise<number> {
  const apiKey = process.env.BRIGHTDATA_API_TOKEN?.trim();
  if (!apiKey) {
    console.error("BRIGHTDATA_API_TOKEN is not set");
    return 1;
  }

  const results: BrightDataAsk[] = [];
  for (const surface of brightDataSurfaceKeys) {
    console.log(`asking ${surface}...`);
    results.push(await askBrightData(surface, PROMPT, apiKey));
  }

  const report = [
    renderMarkdown(results),
    "## Collectors this account holds",
    "",
    await listDatasets(apiKey),
  ].join("\n");

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(`${OUTPUT_DIR}/probe.md`, `${report}\n`, "utf8");
  console.log(`\n${report}`);

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) await writeFile(summaryPath, `${report}\n`, { flag: "a", encoding: "utf8" });

  // A probe that reached no surface is a failed probe: a green run that proved
  // nothing is worse than a red one, because it reads like an answer.
  return results.some((result) => result.error === null) ? 0 : 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  run().then(
    (code) => process.exit(code),
    (error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    },
  );
}
