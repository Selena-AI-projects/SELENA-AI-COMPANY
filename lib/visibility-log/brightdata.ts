/**
 * Talking to Bright Data's answer collectors.
 *
 * This is Visitor View: the answer a person is actually shown on ChatGPT,
 * Gemini or Perplexity. It is a different observation from API View — the model
 * answering from its own knowledge — and the two are never pooled into one
 * number.
 *
 * The request shape mirrors the measurement adapter in the application
 * repository exactly. That is the point: a probe or a measurement run here is
 * only evidence about the product if it sends what the product sends.
 *
 * The token appears in one header. It is never put in a body, a URL, a result
 * or an error, and a non-2xx body is reported by size alone — Bright Data's
 * error bodies can echo request material back.
 */

export const BRIGHTDATA_ENDPOINT = "https://api.brightdata.com/datasets/v3/scrape";

/** One collector per sold surface, with the surface URL each one takes. */
export const brightDataSurfaces = {
  chatgpt: { datasetId: "gd_m7aof0k82r803d5bjm", url: "https://chatgpt.com/", label: "ChatGPT" },
  gemini: { datasetId: "gd_mbz66armZmf9cu856y", url: "https://gemini.google.com/", label: "Gemini" },
  perplexity: { datasetId: "gd_m7dhdot1vw9a7gc1n", url: "https://www.perplexity.ai", label: "Perplexity" },
} as const;

export type BrightDataSurface = keyof typeof brightDataSurfaces;
export const brightDataSurfaceKeys = Object.keys(brightDataSurfaces) as BrightDataSurface[];

/** Bright Data bills per answer; this is what the account's pricing showed. */
export const BRIGHTDATA_PRICE_PER_ANSWER_USD = 0.0015;

/** What a response might call the answer, in the order it is looked for. */
export const ANSWER_FIELDS = [
  "answer_text_markdown",
  "answer_text",
  "answer",
  "response_text",
  "text",
  "content",
] as const;
export const SOURCE_FIELDS = ["citations", "links_attached", "sources"] as const;
export const REQUEST_ID_FIELDS = ["snapshot_id", "request_id", "response_id", "id"] as const;

/**
 * The three collectors do not take the same input: Gemini carries an `index`
 * and a top-level `limit_per_input`, ChatGPT takes the search toggle, and
 * Perplexity takes neither.
 */
export function buildRequestBody(surface: BrightDataSurface, prompt: string): Record<string, unknown> {
  const url = brightDataSurfaces[surface].url;
  if (surface === "gemini") return { input: [{ url, prompt, index: 1 }], limit_per_input: null };
  // Visitor View is the search-backed answer a person is shown. With the
  // toggle off this would be another API View under a name nobody bought.
  if (surface === "chatgpt") return { input: [{ url, prompt, country: "", web_search: true }] };
  return { input: [{ url, prompt, country: "" }] };
}

export function firstRecord(parsed: unknown): Record<string, unknown> | null {
  if (Array.isArray(parsed)) {
    const first = parsed.find((entry) => typeof entry === "object" && entry !== null);
    return (first as Record<string, unknown>) ?? null;
  }
  if (typeof parsed === "object" && parsed !== null) return parsed as Record<string, unknown>;
  return null;
}

export function readAnswer(record: Record<string, unknown>): { field: string; text: string } | null {
  for (const field of ANSWER_FIELDS) {
    const value = record[field];
    if (typeof value === "string" && value.trim() !== "") return { field, text: value };
  }
  return null;
}

export type BrightDataSource = { url: string; domain: string };

function domainOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Only real links the payload carried, deduplicated. Nothing is inferred from
 * the answer text: a citation is evidence that the surface displayed a source,
 * and a domain guessed from prose is not that.
 */
export function readSources(record: Record<string, unknown>): { field: string; sources: BrightDataSource[] } | null {
  for (const field of SOURCE_FIELDS) {
    const value = record[field];
    if (!Array.isArray(value)) continue;
    const seen = new Set<string>();
    const sources: BrightDataSource[] = [];
    for (const entry of value) {
      const raw =
        typeof entry === "string"
          ? entry
          : typeof entry === "object" && entry !== null
            ? ((entry as Record<string, unknown>).url ?? (entry as Record<string, unknown>).link)
            : null;
      if (typeof raw !== "string" || !/^https?:\/\//i.test(raw) || seen.has(raw)) continue;
      const domain = domainOf(raw);
      if (!domain) continue;
      seen.add(raw);
      sources.push({ url: raw, domain });
    }
    return { field, sources };
  }
  return null;
}

export type BrightDataAsk = {
  surface: BrightDataSurface;
  question: string;
  answer: string | null;
  answerField: string | null;
  sources: BrightDataSource[];
  sourceField: string | null;
  requestId: string | null;
  costUsd: number | null;
  bytes: number;
  keys: string[];
  error: string | null;
};

/** One question to one surface. One request, no retry, no polling loop. */
export async function askBrightData(
  surface: BrightDataSurface,
  question: string,
  apiKey: string,
  options: { fetchImpl?: typeof fetch; timeoutMs?: number; maxBytes?: number } = {},
): Promise<BrightDataAsk> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? 180_000;
  const maxBytes = options.maxBytes ?? 4 * 1024 * 1024;
  const base: BrightDataAsk = {
    surface,
    question,
    answer: null,
    answerField: null,
    sources: [],
    sourceField: null,
    requestId: null,
    costUsd: null,
    bytes: 0,
    keys: [],
    error: null,
  };

  const url = new URL(BRIGHTDATA_ENDPOINT);
  url.searchParams.set("dataset_id", brightDataSurfaces[surface].datasetId);
  url.searchParams.set("notify", "false");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    response = await fetchImpl(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(buildRequestBody(surface, question)),
      signal: controller.signal,
    });
  } catch {
    // Never quoted: a thrown request error can carry the headers.
    return { ...base, error: controller.signal.aborted ? "TIMEOUT" : "TRANSPORT_ERROR" };
  } finally {
    clearTimeout(timer);
  }

  const raw = await response.text();
  const bytes = Buffer.byteLength(raw, "utf8");
  if (!response.ok) return { ...base, bytes, error: `PROVIDER_HTTP_${response.status}` };
  if (bytes > maxBytes) return { ...base, bytes, error: "RESPONSE_TOO_LARGE" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ...base, bytes, error: "MALFORMED_RESPONSE" };
  }

  const record = firstRecord(parsed);
  if (!record) return { ...base, bytes, error: "MALFORMED_RESPONSE" };

  const answer = readAnswer(record);
  const sources = readSources(record);
  return {
    surface,
    question,
    answer: answer?.text ?? null,
    answerField: answer?.field ?? null,
    sources: sources?.sources ?? [],
    sourceField: sources?.field ?? null,
    requestId: REQUEST_ID_FIELDS.map((field) => record[field]).find((v): v is string => typeof v === "string") ?? null,
    costUsd: typeof record.cost === "number" ? record.cost : null,
    bytes,
    keys: Object.keys(record).sort(),
    // An unreadable payload is never reported as a surface that said nothing.
    error: answer ? null : "NO_KNOWN_ANSWER_FIELD",
  };
}
