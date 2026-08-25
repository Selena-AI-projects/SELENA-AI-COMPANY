/**
 * Reads what a Bright Data collector actually returns, once per surface.
 *
 * The measurement adapter in the application repository builds its request and
 * reads its response from field names taken off the account's own scraper
 * pages — a hypothesis, never yet checked against a real call. If the guess is
 * wrong, an order pays for answers it cannot read, so this asks the question
 * before a customer does.
 *
 * It measures nothing and reports no visibility. It sends one prompt per
 * surface, using exactly the request the adapter would send, and prints the
 * shape that came back: which field held the answer, which held the sources,
 * whether a cost was named. That is the whole purpose — the answer text is
 * quoted only far enough to confirm a real answer arrived.
 *
 * The token appears in one header and in no output. Bright Data's error bodies
 * can echo request material, so they are summarized, never printed whole.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const ENDPOINT = "https://api.brightdata.com/datasets/v3/scrape";
const OUTPUT_DIR = "reports/visitor-view";

/** Mirrors the adapter's own map; a probe of a different collector proves nothing. */
const SURFACES = {
  chatgpt: { datasetId: "gd_m7aof0k82r803d5bjm", url: "https://chatgpt.com/" },
  gemini: { datasetId: "gd_mbz66armZmf9cu856y", url: "https://gemini.google.com/" },
  perplexity: { datasetId: "gd_m7dhdot1vw9a7gc1n", url: "https://www.perplexity.ai" },
} as const;

type Surface = keyof typeof SURFACES;

/** One question, asked once per surface: three answers is the whole spend. */
const PROMPT = "Which food halls in Ubud, Bali are worth visiting?";

/** Bright Data bills per answer; three surfaces is three answers. */
const PRICE_PER_ANSWER_USD = 0.0015;

const TIMEOUT_MS = 180_000;
const MAX_RESPONSE_BYTES = 4 * 1024 * 1024;

/** What the adapter looks for, in the order it looks. */
const ANSWER_FIELDS = ["answer_text_markdown", "answer_text", "answer", "response_text", "text", "content"];
const SOURCE_FIELDS = ["citations", "links_attached", "sources"];
const REQUEST_ID_FIELDS = ["snapshot_id", "request_id", "response_id", "id"];

/** The adapter's own body builder, copied so the probe sends the real request. */
function buildRequestBody(system: Surface, prompt: string): Record<string, unknown> {
  const url = SURFACES[system].url;
  if (system === "gemini") return { input: [{ url, prompt, index: 1 }], limit_per_input: null };
  if (system === "chatgpt") return { input: [{ url, prompt, country: "", web_search: true }] };
  return { input: [{ url, prompt, country: "" }] };
}

type ProbeResult = {
  surface: Surface;
  ok: boolean;
  httpStatus: number | null;
  note: string;
  bytes: number;
  isJson: boolean;
  topLevel: "array" | "object" | "other" | null;
  keys: string[];
  answerField: string | null;
  answerChars: number;
  answerExcerpt: string;
  sourceField: string | null;
  sourceCount: number;
  requestIdField: string | null;
  costField: number | null;
};

function firstRecord(parsed: unknown): Record<string, unknown> | null {
  if (Array.isArray(parsed)) {
    const first = parsed.find((entry) => typeof entry === "object" && entry !== null);
    return (first as Record<string, unknown>) ?? null;
  }
  if (typeof parsed === "object" && parsed !== null) return parsed as Record<string, unknown>;
  return null;
}

function readAnswer(record: Record<string, unknown>): { field: string; text: string } | null {
  for (const field of ANSWER_FIELDS) {
    const value = record[field];
    if (typeof value === "string" && value.trim() !== "") return { field, text: value };
  }
  return null;
}

function readSources(record: Record<string, unknown>): { field: string; count: number } | null {
  for (const field of SOURCE_FIELDS) {
    const value = record[field];
    if (Array.isArray(value)) return { field, count: value.length };
  }
  return null;
}

async function probe(surface: Surface, apiKey: string): Promise<ProbeResult> {
  const base: ProbeResult = {
    surface,
    ok: false,
    httpStatus: null,
    note: "",
    bytes: 0,
    isJson: false,
    topLevel: null,
    keys: [],
    answerField: null,
    answerChars: 0,
    answerExcerpt: "",
    sourceField: null,
    sourceCount: 0,
    requestIdField: null,
    costField: null,
  };

  const url = new URL(ENDPOINT);
  url.searchParams.set("dataset_id", SURFACES[surface].datasetId);
  url.searchParams.set("notify", "false");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(buildRequestBody(surface, PROMPT)),
      signal: controller.signal,
    });
  } catch (error) {
    // Never quoted: a request error can carry the headers, and this is printed.
    const aborted = controller.signal.aborted;
    return { ...base, note: aborted ? `no response within ${TIMEOUT_MS / 1000}s` : "transport error" };
  } finally {
    clearTimeout(timer);
  }

  const raw = await response.text();
  const bytes = Buffer.byteLength(raw, "utf8");
  if (!response.ok) {
    // The body can echo request material back, so only its size is reported.
    return { ...base, httpStatus: response.status, bytes, note: `HTTP ${response.status}, body ${bytes} bytes` };
  }
  if (bytes > MAX_RESPONSE_BYTES) {
    return { ...base, httpStatus: response.status, bytes, note: "larger than the adapter's cap would allow" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ...base, httpStatus: response.status, bytes, note: "body is not JSON" };
  }

  const record = firstRecord(parsed);
  if (!record) {
    return { ...base, httpStatus: response.status, bytes, isJson: true, note: "JSON holds no object" };
  }

  const answer = readAnswer(record);
  const sources = readSources(record);
  const cost = typeof record.cost === "number" ? record.cost : null;

  return {
    surface,
    ok: answer !== null,
    httpStatus: response.status,
    note: answer ? "answer found" : "no known field held an answer",
    bytes,
    isJson: true,
    topLevel: Array.isArray(parsed) ? "array" : "object",
    keys: Object.keys(record).sort(),
    answerField: answer?.field ?? null,
    answerChars: answer?.text.length ?? 0,
    answerExcerpt: answer ? answer.text.slice(0, 280).replace(/\s+/g, " ").trim() : "",
    sourceField: sources?.field ?? null,
    sourceCount: sources?.count ?? 0,
    requestIdField: REQUEST_ID_FIELDS.find((field) => typeof record[field] === "string") ?? null,
    costField: cost,
  };
}

function render(results: ProbeResult[]): string {
  const lines: string[] = [];
  lines.push("# Bright Data response probe");
  lines.push("");
  lines.push(`Prompt: _${PROMPT}_`);
  lines.push("");
  lines.push(`Answers requested: ${results.length} · estimated spend $${(results.length * PRICE_PER_ANSWER_USD).toFixed(4)}`);
  lines.push("");
  lines.push("| Surface | Result | Answer field | Chars | Sources | Request id | Cost | Bytes |");
  lines.push("| --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const r of results) {
    lines.push(
      `| ${r.surface} | ${r.ok ? "ok" : r.note} | ${r.answerField ?? "—"} | ${r.answerChars || "—"} | ${
        r.sourceField ? `${r.sourceField} (${r.sourceCount})` : "—"
      } | ${r.requestIdField ?? "—"} | ${r.costField ?? "—"} | ${r.bytes} |`,
    );
  }
  lines.push("");
  for (const r of results) {
    lines.push(`## ${r.surface}`);
    lines.push("");
    lines.push(`- HTTP: ${r.httpStatus ?? "no response"} · ${r.note}`);
    lines.push(`- Top level: ${r.topLevel ?? "—"}`);
    if (r.keys.length > 0) lines.push(`- Keys: \`${r.keys.join("`, `")}\``);
    if (r.answerExcerpt !== "") {
      lines.push("");
      lines.push(`> ${r.answerExcerpt}…`);
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

  const results: ProbeResult[] = [];
  for (const surface of Object.keys(SURFACES) as Surface[]) {
    console.log(`asking ${surface}…`);
    results.push(await probe(surface, apiKey));
  }

  const report = render(results);
  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(`${OUTPUT_DIR}/probe.md`, `${report}\n`, "utf8");
  console.log(`\n${report}`);

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) await writeFile(summaryPath, `${report}\n`, { flag: "a", encoding: "utf8" });

  // A probe that reached no surface is a failed probe: a green run that proved
  // nothing is worse than a red one, because it reads like an answer.
  return results.some((result) => result.ok) ? 0 : 1;
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
