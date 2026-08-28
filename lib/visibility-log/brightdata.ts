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
export const brightDataSurfaces: Record<
  "chatgpt" | "gemini" | "perplexity",
  { datasetId: string | null; url: string; label: string }
> = {
  chatgpt: { datasetId: "gd_m7aof0k82r803d5bjm", url: "https://chatgpt.com/", label: "ChatGPT" },
  // Read off the account's own scraper page. The id transcribed by eye before
  // it carried a capital Z where the real one has a digit 2, which the account
  // answered as "dataset does not exist".
  gemini: { datasetId: "gd_mbz66arm2mf9cu856y", url: "https://gemini.google.com/", label: "Gemini" },
  perplexity: { datasetId: "gd_m7dhdot1vw9a7gc1n", url: "https://www.perplexity.ai", label: "Perplexity" },
};

export type BrightDataSurface = keyof typeof brightDataSurfaces;
export const brightDataSurfaceKeys = Object.keys(brightDataSurfaces) as BrightDataSurface[];
/** The surfaces a run can actually reach today. */
export const measurableBrightDataSurfaces = brightDataSurfaceKeys.filter(
  (surface) => brightDataSurfaces[surface].datasetId !== null,
);
export const unreachableBrightDataSurfaces = brightDataSurfaceKeys.filter(
  (surface) => brightDataSurfaces[surface].datasetId === null,
);

/** Bright Data bills per answer; this is what the account's pricing showed. */
export const BRIGHTDATA_PRICE_PER_ANSWER_USD = 0.0015;

/**
 * The scrape call waits for the answer and, when the collector takes longer
 * than its window, hands back a snapshot handle instead. The answer is then
 * fetched separately — so a Visitor View measurement is a two-step exchange,
 * not one request, and code that reads only the first reply sees a status
 * message where it expected prose.
 */
/**
 * How long each collector is waited on before its answer is abandoned.
 *
 * The job is already submitted and already billed by the time we are waiting,
 * so giving up early does not save money — it throws away an answer that was
 * paid for. Perplexity ran past ten minutes on every one of the twenty answers
 * it lost; ChatGPT and Gemini come back in seconds.
 */
export const SNAPSHOT_PATIENCE_MS: Record<"chatgpt" | "gemini" | "perplexity", number> = {
  chatgpt: 600_000,
  gemini: 600_000,
  perplexity: 1_500_000,
};

export const BRIGHTDATA_PROGRESS_ENDPOINT = "https://api.brightdata.com/datasets/v3/progress";
export const BRIGHTDATA_SNAPSHOT_ENDPOINT = "https://api.brightdata.com/datasets/v3/snapshot";

/**
 * Provider status text is worth reading and the credential must never be in
 * what gets read. Redacting by value rather than trusting the provider not to
 * echo it is the only version of that guarantee we control.
 */
export function redact(text: string, secret: string): string {
  return secret.trim() === "" ? text : text.split(secret).join("***");
}

/**
 * What a response might call the answer, in the order it is looked for.
 *
 * A collector does not use one name. Perplexity returned answers this list did
 * not include while the same account, the same day, read them fine through a
 * longer list — 22 of 25 answers were paid for and thrown away as unreadable.
 * A name costs nothing to look for and a missing one costs a measurement.
 */
export const ANSWER_FIELDS = [
  "answer_text_markdown",
  "answer_text",
  "answer",
  "response_raw",
  "response",
  "response_text",
  "text",
  "content",
] as const;
/**
 * Ordered by how directly each names a source the answer displayed. ChatGPT
 * returns an empty `citations` beside a populated `search_sources`, so an empty
 * array is not an answer about sources — the search continues past it.
 */
export const SOURCE_FIELDS = [
  "citations",
  "search_sources",
  "references",
  "links_attached",
  "sources",
] as const;
export const REQUEST_ID_FIELDS = ["snapshot_id", "request_id", "response_id", "id"] as const;
/** Where the provider puts a human-readable status or refusal. */
export const STATUS_FIELDS = ["message", "error", "status", "detail"] as const;

export function readStatusText(record: Record<string, unknown>, secret: string): string | null {
  for (const field of STATUS_FIELDS) {
    const value = record[field];
    if (typeof value === "string" && value.trim() !== "") return redact(value.slice(0, 400), secret);
  }
  return null;
}

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
    if (!Array.isArray(value) || value.length === 0) continue;
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
    if (sources.length > 0) return { field, sources };
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
  /** The provider's own words when it said something instead of answering. */
  statusText: string | null;
  /** How the answer arrived: straight back, or fetched from a snapshot. */
  delivery: "direct" | "snapshot" | null;
  /** How long the collector was waited on before it answered or was given up on. */
  waitedMs: number;
  error: string | null;
};

/** One question to one surface. One request, no retry, no polling loop. */
export async function askBrightData(
  surface: BrightDataSurface,
  question: string,
  apiKey: string,
  options: {
    fetchImpl?: typeof fetch;
    timeoutMs?: number;
    maxBytes?: number;
    waitForSnapshot?: boolean;
    snapshotTimeoutMs?: number;
    pollMs?: number;
  } = {},
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
    statusText: null,
    delivery: null,
    waitedMs: 0,
    error: null,
  };

  const datasetId = brightDataSurfaces[surface].datasetId;
  if (datasetId === null) return { ...base, error: "COLLECTOR_UNKNOWN" };

  const url = new URL(BRIGHTDATA_ENDPOINT);
  url.searchParams.set("dataset_id", datasetId);
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
  if (!response.ok) {
    // Redacted by value, not by trust: a refusal nobody can read costs another
    // round trip to diagnose, and the credential is removed before it is shown.
    return { ...base, bytes, statusText: redact(raw.slice(0, 400), apiKey), error: `PROVIDER_HTTP_${response.status}` };
  }
  if (bytes > maxBytes) return { ...base, bytes, error: "RESPONSE_TOO_LARGE" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ...base, bytes, error: "MALFORMED_RESPONSE" };
  }

  const record = firstRecord(parsed);
  if (!record) return { ...base, bytes, error: "MALFORMED_RESPONSE" };

  const direct = describe(record, surface, question, bytes, apiKey, "direct");
  if (direct.answer !== null) return direct;

  // No answer, but a handle to one: the collector went long and the reply is a
  // receipt. Following it is the difference between a measurement and a row
  // that says the surface stayed silent.
  if (direct.requestId && options.waitForSnapshot !== false) {
    const waited = await fetchSnapshot(direct.requestId, apiKey, {
      ...options,
      snapshotTimeoutMs: options.snapshotTimeoutMs ?? SNAPSHOT_PATIENCE_MS[surface],
    });
    if (waited.ask) return { ...waited.ask, surface, question, delivery: "snapshot", waitedMs: waited.waitedMs };
    // An answer that was produced and billed but did not arrive in time is a
    // different fact from a payload nobody could read, and only one of them is
    // fixed by waiting longer. Reporting both as the same thing hides which.
    return { ...direct, error: "SNAPSHOT_NOT_READY", waitedMs: waited.waitedMs };
  }
  return direct;
}

function describe(
  record: Record<string, unknown>,
  surface: BrightDataSurface,
  question: string,
  bytes: number,
  apiKey: string,
  delivery: "direct" | "snapshot",
): BrightDataAsk {
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
    statusText: readStatusText(record, apiKey),
    delivery: answer ? delivery : null,
    waitedMs: 0,
    // An unreadable payload is never reported as a surface that said nothing.
    error: answer ? null : "NO_KNOWN_ANSWER_FIELD",
  };
}

/**
 * Waits for a snapshot and reads it. Polling is bounded: an answer that never
 * becomes ready is reported as not ready, never as an answer that was empty.
 */
/**
 * A body that is a receipt for work still running, not an answer.
 *
 * The snapshot endpoint answers a request for an unfinished job with a note
 * saying so. Read as a record it has no field any answer would have, so it was
 * reported as a payload nobody could read — and twenty answers ESKQ had already
 * paid for were written off as unreadable rather than waited for.
 */
export function snapshotStillWorking(record: Record<string, unknown>): boolean {
  const status = typeof record.status === "string" ? record.status : "";
  const message = typeof record.message === "string" ? record.message : "";
  return /not ready|running|building|pending|in progress|collecting/i.test(`${status} ${message}`);
}

/**
 * Waits for one submitted job and returns its answer, or nothing and how long
 * it waited. The progress endpoint is asked first, but it is not trusted to be
 * the only word: the snapshot itself is read on every turn, because a job can
 * hold its answer before progress admits it is ready.
 */
export async function fetchSnapshot(
  snapshotId: string,
  apiKey: string,
  options: { fetchImpl?: typeof fetch; snapshotTimeoutMs?: number; pollMs?: number } = {},
): Promise<{ ask: BrightDataAsk | null; waitedMs: number }> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const startedAt = Date.now();
  const deadline = startedAt + (options.snapshotTimeoutMs ?? 600_000);
  const pollMs = options.pollMs ?? 10_000;
  const headers = { Authorization: `Bearer ${apiKey}` };
  const waited = () => Date.now() - startedAt;

  for (;;) {
    const progress = await fetchImpl(`${BRIGHTDATA_PROGRESS_ENDPOINT}/${snapshotId}`, { headers }).catch(() => null);
    const state = progress?.ok ? ((await progress.json().catch(() => null)) as { status?: string } | null) : null;
    if (state?.status === "failed") return { ask: null, waitedMs: waited() };

    const snapshot = await fetchImpl(`${BRIGHTDATA_SNAPSHOT_ENDPOINT}/${snapshotId}?format=json`, { headers }).catch(
      () => null,
    );
    if (snapshot?.ok) {
      const raw = await snapshot.text();
      let parsed: unknown = null;
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = null;
      }
      const record = parsed === null ? null : firstRecord(parsed);
      if (record && !snapshotStillWorking(record)) {
        const described = describe(record, "chatgpt", "", Buffer.byteLength(raw, "utf8"), apiKey, "snapshot");
        // Only an answer ends the wait. A record with no answer and no note
        // about being unfinished is genuinely unreadable, and saying so early
        // is better than saying it after another twenty minutes of nothing.
        if (described.answer !== null || described.keys.length > 2) {
          return { ask: described, waitedMs: waited() };
        }
      }
    }

    if (Date.now() >= deadline) return { ask: null, waitedMs: waited() };
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
}
