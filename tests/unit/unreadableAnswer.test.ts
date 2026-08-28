import assert from "node:assert/strict";
import test from "node:test";
import { readAnswer, type BrightDataAsk } from "@/lib/visibility-log/brightdata";
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
