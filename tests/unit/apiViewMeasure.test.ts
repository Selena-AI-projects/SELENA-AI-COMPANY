import { test } from "node:test";
import assert from "node:assert/strict";
import { classify, findAlias, renderMarkdown, runMeasurement } from "../../scripts/api-view-measure";
import { korafoodhallScenario } from "@/lib/visibility-log/scenarios/korafoodhall";

test("a short brand name inside another word is not a match", () => {
  assert.equal(findAlias("Try Korawa Warung in Ubud.", "KORA"), null);
  assert.equal(findAlias("Kora-Kora is a boat.", "KORA")?.includes("Kora-Kora"), true);
  assert.ok(findAlias("We loved KORA Food Hall last night.", "KORA Food Hall"));
});

test("only the full name counts as a mention; the bare one asks for a human", () => {
  const strong = classify("Head to KORA Food Hall in Ubud.", korafoodhallScenario);
  assert.equal(strong.mentioned, true);
  assert.equal(strong.needsHumanLook, false);

  const weak = classify("KORA is worth a look.", korafoodhallScenario);
  // A bare short name may belong to someone else — flagged, never counted.
  assert.equal(weak.mentioned, false);
  assert.equal(weak.needsHumanLook, true);

  const absent = classify("Try Locavore and Hujan Locale.", korafoodhallScenario);
  assert.equal(absent.mentioned, false);
  assert.equal(absent.needsHumanLook, false);
});

test("the run stops at its spend ceiling instead of finishing the list", async () => {
  let calls = 0;
  const fetchImpl = (async () => {
    calls += 1;
    return new Response(
      JSON.stringify({ choices: [{ message: { content: "No idea." } }], usage: { cost: 0.5 } }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }) as unknown as typeof fetch;

  const result = await runMeasurement({ scenario: korafoodhallScenario, apiKey: "k", fetchImpl, maxCostUsd: 1 });
  assert.equal(result.stoppedForBudget, true);
  assert.ok(calls < korafoodhallScenario.questions.length * 5, "the ceiling did not stop the run");
});

test("a provider error is recorded, not counted as an answer without a mention", async () => {
  const fetchImpl = (async () =>
    new Response("rate limited", { status: 429 })) as unknown as typeof fetch;

  const result = await runMeasurement({ scenario: korafoodhallScenario, apiKey: "k", fetchImpl, maxCostUsd: 5 });
  assert.ok(result.records.every((record) => record.error?.startsWith("HTTP_429")));
  assert.equal(result.totalCost, null);

  const markdown = renderMarkdown(korafoodhallScenario, result.records, "2026-08-25T00:00:00.000Z", result.totalCost);
  // An unknown cost must never render as a free run.
  assert.match(markdown, /не сообщена провайдером/);
  assert.ok(!markdown.includes("$0.0000"));
  assert.match(markdown, /Неудавшихся ответов: \d+/);
});

test("the report says what it did not measure", () => {
  const markdown = renderMarkdown(korafoodhallScenario, [], "2026-08-25T00:00:00.000Z", 0.42);
  assert.match(markdown, /Visitor View/);
  assert.match(markdown, /Замер: 2026-08-25/);
  assert.match(markdown, /korafoodhall-api-view-2026-08-25/);
});
