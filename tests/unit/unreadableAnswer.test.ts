import assert from "node:assert/strict";
import test from "node:test";
import {
  SNAPSHOT_PATIENCE_MS,
  fetchSnapshot,
  readAnswer,
  snapshotStillWorking,
  type BrightDataAsk,
} from "@/lib/visibility-log/brightdata";
import { renderMarkdown, toRecord } from "../../scripts/visitor-view-measure";
import { eskqbarScenario } from "@/lib/visibility-log/scenarios/eskqbar";

/**
 * A measurement of ESKQ paid for 75 answers and reported 53. All 22 missing
 * ones were Perplexity, and all were recorded as a payload nobody could read —
 * while the same account, the same day, read Perplexity fine through a reader
 * that looked for more field names.
 *
 * Two things went wrong, and only one of them was the field list. The other is
 * that the run threw away what the payload contained, so the only way left to
 * learn why was to buy the answers again.
 */

test("an answer the collector filed under its own name is still an answer", () => {
  assert.deepEqual(readAnswer({ response: "hello" }), { field: "response", text: "hello" });
  assert.deepEqual(readAnswer({ response_raw: "hello" }), { field: "response_raw", text: "hello" });
  // A richer field still wins when both are present.
  assert.equal(readAnswer({ response: "plain", answer_text_markdown: "rich" })?.field, "answer_text_markdown");
});

function ask(overrides: Partial<BrightDataAsk>): BrightDataAsk {
  return {
    surface: "perplexity",
    question: "Where can I get a good steak in Canggu?",
    answer: null,
    answerField: null,
    sources: [],
    sourceField: null,
    requestId: null,
    costUsd: null,
    bytes: 120,
    keys: [],
    statusText: null,
    delivery: null,
    waitedMs: 0,
    error: null,
    ...overrides,
  };
}

test("a payload that could not be read reports what it did contain", () => {
  const record = toRecord(
    ask({ error: "NO_KNOWN_ANSWER_FIELD", keys: ["prompt", "surprise_field", "url"] }),
    eskqbarScenario,
  );
  const markdown = renderMarkdown(eskqbarScenario, [record], "2026-08-28T00:00:00.000Z", 0.0015);

  assert.match(markdown, /NO_KNOWN_ANSWER_FIELD/);
  // The field names are the whole point: with them the fix is one line, without
  // them it is another paid run.
  assert.match(markdown, /surprise_field/);
});

test("a refusal the provider explained is quoted, not summarised away", () => {
  const record = toRecord(
    ask({ error: "NO_KNOWN_ANSWER_FIELD", keys: ["status"], statusText: "collector is warming up" }),
    eskqbarScenario,
  );
  const markdown = renderMarkdown(eskqbarScenario, [record], "2026-08-28T00:00:00.000Z", 0.0015);
  assert.match(markdown, /collector is warming up/);
});

test("an unreadable answer is still never counted as a surface that said nothing", () => {
  const record = toRecord(ask({ error: "NO_KNOWN_ANSWER_FIELD", keys: ["status"] }), eskqbarScenario);
  assert.equal(record.mentioned, false);
  assert.equal(record.error, "NO_KNOWN_ANSWER_FIELD");
  const markdown = renderMarkdown(eskqbarScenario, [record], "2026-08-28T00:00:00.000Z", 0.0015);
  // One answer, and it did not come back: a share here would be a claim about
  // Perplexity built on nothing.
  assert.doesNotMatch(markdown, /\| 0% \|/);
});

/**
 * The second ESKQ measurement named the real cause. The payload was not
 * unreadable at all: it read `{ message: "Snapshot is not ready yet, try again
 * in 30s", status: … }` — a receipt for an answer still being produced, and
 * one already paid for. Twenty of them were written off instead of waited for.
 */

test("a snapshot that says it is still working is not mistaken for an answer", () => {
  assert.equal(snapshotStillWorking({ message: "Snapshot is not ready yet, try again in 30s" }), true);
  assert.equal(snapshotStillWorking({ status: "running" }), true);
  assert.equal(snapshotStillWorking({ answer_text: "a real answer" }), false);
});

test("the collector that needs longest is given longest", () => {
  // ChatGPT and Gemini answer in seconds; Perplexity ran past ten minutes on
  // every answer it lost. Waiting costs time, not money: the job is billed
  // when it is submitted, so giving up early only throws the answer away.
  assert.ok(SNAPSHOT_PATIENCE_MS.perplexity > SNAPSHOT_PATIENCE_MS.chatgpt);
});

test("giving up on a slow collector is reported as giving up, with the wait", async () => {
  let polls = 0;
  const fetchImpl = (async (url: string | URL) => {
    const address = String(url);
    if (address.includes("/progress/")) {
      return new Response(JSON.stringify({ status: "running" }), { status: 200 });
    }
    polls += 1;
    return new Response(JSON.stringify([{ message: "Snapshot is not ready yet, try again in 30s" }]), { status: 200 });
  }) as unknown as typeof fetch;

  const result = await fetchSnapshot("snap-1", "token", { fetchImpl, snapshotTimeoutMs: 300, pollMs: 5 });
  assert.equal(result.ask, null, "a receipt is not an answer");
  assert.ok(polls >= 2, "the snapshot itself is asked again, not only the progress endpoint");
  assert.ok(result.waitedMs >= 0);
});

test("an answer that arrives late is still the answer", async () => {
  let turn = 0;
  const fetchImpl = (async (url: string | URL) => {
    const address = String(url);
    if (address.includes("/progress/")) {
      return new Response(JSON.stringify({ status: "running" }), { status: 200 });
    }
    turn += 1;
    const body =
      turn === 1
        ? [{ message: "Snapshot is not ready yet, try again in 30s" }]
        : [{ answer_text: "ESKQ Bar is a steakhouse in Canggu." }];
    return new Response(JSON.stringify(body), { status: 200 });
  }) as unknown as typeof fetch;

  const result = await fetchSnapshot("snap-2", "token", { fetchImpl, snapshotTimeoutMs: 5_000, pollMs: 5 });
  assert.equal(result.ask?.answer, "ESKQ Bar is a steakhouse in Canggu.");
});
