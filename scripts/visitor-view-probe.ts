/**
 * Reads what a Bright Data collector actually returns, once per surface.
 *
 * The measurement path builds its request and reads its response from field
 * names taken off the account's own scraper pages — a hypothesis, never yet
 * checked against a real call. If the guess is wrong, an order pays for answers
 * it cannot read, so this asks the question before a customer does.
 *
 * It measures nothing and reports no visibility. Three answers, about half a
 * cent, and a report of the shape that came back.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import {
  askBrightData,
  BRIGHTDATA_PRICE_PER_ANSWER_USD,
  type BrightDataAsk,
  brightDataSurfaceKeys,
} from "@/lib/visibility-log/brightdata";

const OUTPUT_DIR = "reports/visitor-view";

/** One question, asked once per surface: three answers is the whole spend. */
const PROMPT = "Which food halls in Ubud, Bali are worth visiting?";

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
  lines.push("| Surface | Result | Answer field | Chars | Sources | Request id | Cost | Bytes |");
  lines.push("| --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const r of results) {
    lines.push(
      `| ${r.surface} | ${r.error ?? "ok"} | ${r.answerField ?? "—"} | ${r.answer?.length ?? "—"} | ${
        r.sourceField ? `${r.sourceField} (${r.sources.length})` : "—"
      } | ${r.requestId ? "yes" : "—"} | ${r.costUsd ?? "—"} | ${r.bytes} |`,
    );
  }
  lines.push("");
  for (const r of results) {
    lines.push(`## ${r.surface}`);
    lines.push("");
    lines.push(`- Result: ${r.error ?? "answer found"}`);
    if (r.keys.length > 0) lines.push(`- Keys: \`${r.keys.join("`, `")}\``);
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
    console.log(`asking ${surface}…`);
    results.push(await askBrightData(surface, PROMPT, apiKey));
  }

  const report = renderMarkdown(results);
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
