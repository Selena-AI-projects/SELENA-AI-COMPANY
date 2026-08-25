import { test } from "node:test";
import assert from "node:assert/strict";
import { commercialFacts } from "@/lib/commercial-facts";
import {
  clickForms,
  clickRate,
  impressionForms,
  pluralizeRu,
  formatDate,
  journalLadder,
  journalProjects,
  reachedStages,
  stageLabels,
  type JournalStage,
} from "@/lib/visibility-log/data";

test("every published entry is dated and named as a stage a reader can place", () => {
  assert.ok(journalProjects.length > 0);

  for (const project of journalProjects) {
    assert.ok(project.entries.length > 0, `${project.slug} has nothing published`);
    for (const entry of project.entries) {
      assert.match(entry.date, /^\d{4}-\d{2}-\d{2}$/, `${project.slug} entry is undated`);
      assert.ok(stageLabels[entry.stage], `${project.slug} entry has an unlabelled stage`);
      assert.ok(entry.title.length > 0 && entry.body.length > 0);
    }

    const dates = project.entries.map((entry) => entry.date);
    assert.deepEqual(dates, [...dates].sort(), `${project.slug} entries are out of order`);
  }
});

test("no project skips a rung of the ladder it has not paid for", () => {
  const order = journalLadder.map((rung) => rung.stage);

  for (const project of journalProjects) {
    const reached = reachedStages(project);
    const highest = order.reduce((last, stage, index) => (reached.has(stage) ? index : last), -1);
    for (let index = 0; index <= highest; index += 1) {
      assert.ok(
        reached.has(order[index] as JournalStage),
        `${project.slug} shows ${order[highest]} without ever publishing ${order[index]}`,
      );
    }
  }
});

test("the ladder quotes the one commercial registry, never its own numbers", () => {
  const registry = commercialFacts.aiVisibility;
  assert.equal(journalLadder[0]?.price, registry.publicReadiness.ru);
  assert.equal(journalLadder[1]?.price, registry.snapshot.ru);
  assert.equal(journalLadder[2]?.price, registry.landscape.ru);
  assert.equal(journalLadder[3]?.price, registry.expertVerified.ru);
  assert.equal(journalLadder[4]?.price, registry.implementation90Days.ru);
});

test("a click rate is only reported when there were impressions to divide by", () => {
  assert.equal(clickRate({ windowStart: "", windowEnd: "", clicks: 0, impressions: 0, previousClicks: null, nonBrandClicks: 0 }), null);
  assert.equal(clickRate({ windowStart: "", windowEnd: "", clicks: 29, impressions: 2_710, previousClicks: 1, nonBrandClicks: 29 }), 1.1);
});

test("growth is published as the earlier count, not as a percentage of one click", () => {
  const source = require("node:fs").readFileSync("lib/visibility-log/data.ts", "utf8");
  assert.ok(!source.includes("clicksChange"), "percentage change is back in the public data layer");

  for (const project of journalProjects) {
    if (!project.metrics) continue;
    assert.ok(project.metrics.nonBrandClicks <= project.metrics.clicks);
    assert.ok(project.metrics.clicks <= project.metrics.impressions);
  }
});

test("dates render in Russian, since the journal is Russian first", () => {
  assert.equal(formatDate("2026-08-25"), "25 августа 2026");
});

test("counts agree with the number in front of them", () => {
  assert.equal(`1 ${pluralizeRu(1, clickForms)}`, "1 клик");
  assert.equal(`2 ${pluralizeRu(2, clickForms)}`, "2 клика");
  assert.equal(`29 ${pluralizeRu(29, clickForms)}`, "29 кликов");
  assert.equal(`34 ${pluralizeRu(34, clickForms)}`, "34 клика");
  assert.equal(`0 ${pluralizeRu(0, clickForms)}`, "0 кликов");
  // The teens are the exception every naive implementation gets wrong.
  assert.equal(`313 ${pluralizeRu(313, impressionForms)}`, "313 показов");
  assert.equal(`15 ${pluralizeRu(15, impressionForms)}`, "15 показов");
  assert.equal(`2710 ${pluralizeRu(2_710, impressionForms)}`, "2710 показов");
  assert.equal(`21 ${pluralizeRu(21, impressionForms)}`, "21 показ");
});
