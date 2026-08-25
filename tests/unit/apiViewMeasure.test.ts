import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classify,
  extractNames,
  findAlias,
  renderMarkdown,
  runMeasurement,
  tallyNames,
} from "../../scripts/api-view-measure";
import { korafoodhallScenario } from "@/lib/visibility-log/scenarios/korafoodhall";
import { scenarios, scenarioSlugs } from "@/lib/visibility-log/scenarios/all";
import { journalProjects } from "@/lib/visibility-log/data";

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

test("an invented business name never reaches the report", async () => {
  const fetchImpl = (async () =>
    new Response(
      JSON.stringify({
        choices: [{ message: { content: '["Locavore", "Completely Made Up Warung"]' } }],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    )) as unknown as typeof fetch;

  const names = await extractNames(
    "Where should I eat in Ubud?",
    ["Try Locavore, it is excellent."],
    "k",
    fetchImpl,
  );
  // Only the name that is actually in the answer survives.
  assert.deepEqual(names, ["Locavore"]);
});

test("names are counted by how many questions surfaced them", () => {
  const tally = tallyNames([
    { question: "q1", models: ["a", "b"], names: ["Locavore", "Hujan Locale"] },
    { question: "q2", models: ["a"], names: ["Locavore", "Locavore"] },
    { question: "q3", models: ["c"], names: ["Hujan Locale"] },
  ]);
  // Equal question counts fall back to alphabetical order.
  assert.deepEqual(tally[0], { name: "Hujan Locale", questions: 2, models: 3 });
  assert.deepEqual(tally[1], { name: "Locavore", questions: 2, models: 2 });
});

test("the competitor table only appears when there are names for it", () => {
  const empty = renderMarkdown(korafoodhallScenario, [], "2026-08-25T00:00:00.000Z", 0.2, []);
  assert.ok(!empty.includes("Кого называют вместо вас"));

  const filled = renderMarkdown(korafoodhallScenario, [], "2026-08-25T00:00:00.000Z", 0.2, [
    { name: "Locavore", questions: 7, models: 5 },
  ]);
  assert.match(filled, /Кого называют вместо вас/);
  assert.match(filled, /\| Locavore \| 7 из 25 \| 5 \|/);
});

test("every registered scenario is a complete, comparable configuration", () => {
  assert.ok(scenarioSlugs.length > 1);
  for (const slug of scenarioSlugs) {
    const scenario = scenarios[slug];
    assert.ok(scenario, `${slug} is registered but missing`);
    assert.equal(scenario.project, slug);
    // The catalog sells 25 questions per measurement; a set of any other size
    // is not the thing being sold.
    assert.equal(scenario.questions.length, 25, `${slug} has ${scenario.questions.length} questions`);
    assert.equal(new Set(scenario.questions).size, 25, `${slug} repeats a question`);
    assert.ok(scenario.strongAliases.length > 0, `${slug} has no name to look for`);
    assert.match(scenario.version, new RegExp(`^${slug}-`), `${slug} version does not name its project`);
    assert.ok(["search-console", "owner-brief", "category-draft"].includes(scenario.basis));
    assert.ok(["own", "third-party"].includes(scenario.ownership), `${slug} does not say whose it is`);
  }
});

test("someone else's business never reaches the public journal by itself", () => {
  const published = new Set<string>(journalProjects.map((project) => project.slug));
  for (const slug of scenarioSlugs) {
    const scenario = scenarios[slug];
    assert.ok(scenario);
    if (scenario.ownership !== "third-party") continue;
    // Measuring a third party is market research. Publishing that it is
    // invisible is a claim about them, and it waits for their yes.
    assert.ok(
      !published.has(slug),
      `${slug} is someone else's business and is published without a recorded consent`,
    );
  }
});
