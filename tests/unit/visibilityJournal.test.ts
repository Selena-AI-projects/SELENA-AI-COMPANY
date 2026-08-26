import { test } from "node:test";
import assert from "node:assert/strict";
import { commercialFacts } from "@/lib/commercial-facts";
import {
  buildJournalProjectStructuredData,
  buildJournalStructuredData,
} from "@/lib/structured-data";
import {
  clickForms,
  clickRate,
  impressionForms,
  pluralizeRu,
  formatDate,
  journalLadder,
  journalMeta,
  journalProjects,
  reachedStages,
  stageLabels,
  type JournalStage,
} from "@/lib/visibility-log/data";
import { renderMarkdown } from "../../scripts/journal-readiness";

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
  assert.equal(clickRate({ windowStart: "", windowEnd: "", clicks: 0, impressions: 0, previousClicks: null, previousImpressions: null }), null);
  assert.equal(clickRate({ windowStart: "", windowEnd: "", clicks: 29, impressions: 2_710, previousClicks: 1, previousImpressions: 620 }), 1.1);
});

test("growth is published as the earlier count, not as a percentage of one click", () => {
  const source = require("node:fs").readFileSync("lib/visibility-log/data.ts", "utf8");
  assert.ok(!source.includes("clicksChange"), "percentage change is back in the public data layer");

  for (const project of journalProjects) {
    if (!project.metrics) continue;
    assert.ok(project.metrics.clicks <= project.metrics.impressions);
    // A brand/non-brand split can only be taken over the query rows Google
    // shows, so it must not sit in the public layer as if it divided the total.
    assert.ok(!("nonBrandClicks" in project.metrics), `${project.slug} still publishes a non-brand count`);
  }
});

test("a measurement is one dated event, numbered in its own series", () => {
  for (const project of journalProjects) {
    for (const series of [project.visitorViews ?? [], project.apiViews ?? []]) {
      const dates = series.map((measurement) => measurement.date);
      assert.deepEqual(dates, [...dates].sort(), `${project.slug} measurements are out of order`);
      assert.equal(new Set(dates).size, dates.length, `${project.slug} has two measurements on one date`);
      for (const date of dates) {
        assert.match(date, /^\d{4}-\d{2}-\d{2}$/, `${project.slug} has an undated measurement`);
      }
    }
  }
});

test("the search window is the one the confirmed baseline was taken over", () => {
  for (const project of journalProjects) {
    if (!project.metrics) continue;
    assert.equal(project.metrics.windowStart, "2026-07-27", `${project.slug} reports a different window`);
    assert.equal(project.metrics.windowEnd, "2026-08-23", `${project.slug} reports a different window`);
  }
  // 27 July to 23 August inclusive is 28 days, which is what the page says.
  const start = Date.UTC(2026, 6, 27);
  const end = Date.UTC(2026, 7, 23);
  assert.equal((end - start) / 86_400_000 + 1, journalMeta.windowDays);
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

test("the readiness report never lets rung one read like an AI measurement", () => {
  const markdown = renderMarkdown(
    [
      {
        slug: "korafoodhall",
        name: "KORA Food Hall",
        url: "https://korafoodhall.com",
        reachable: true,
        score: 61,
        coverage: 0.8,
        pagesChecked: 4,
        topBlocker: "Нет описания в выдаче",
        nextActions: ["Написать описание"],
        failingFindings: [{ title: "Нет описания", severity: "high", pageUrl: "https://korafoodhall.com/" }],
      },
      {
        slug: "doki",
        name: "Doki.help",
        url: "https://doki.help",
        reachable: false,
        fetchError: "HTTP 403",
        score: null,
        coverage: 0,
        pagesChecked: 0,
        topBlocker: null,
        nextActions: [],
        failingFindings: [],
      },
    ],
    "2026-08-25T00:00:00.000Z",
  );

  assert.match(markdown, /ни одного платного запроса к AI/);
  assert.match(markdown, /упоминают ли сайт AI-системы/);
  // An unreachable site is reported as unreachable, never scored as a zero.
  assert.match(markdown, /Doki\.help \| нет \(HTTP 403\)/);
  assert.ok(!markdown.includes("| Doki.help | да"));
});

test("journal pages carry structured data a search engine can place", () => {
  const index = buildJournalStructuredData({
    locale: "ru",
    pageUrl: "https://www.selenasystems.com/ru/projects",
    title: "Наши проекты и замеры",
    description: "…",
    projects: journalProjects,
  });
  const list = index["@graph"].find((node) => node["@type"] === "ItemList") as
    | { numberOfItems: number; itemListElement: { item: string }[] }
    | undefined;
  assert.equal(list?.numberOfItems, journalProjects.length);
  assert.ok(list?.itemListElement.every((entry) => entry.item.startsWith("https://")));

  const project = journalProjects[0];
  assert.ok(project);
  const article = buildJournalProjectStructuredData({
    locale: "ru",
    journalUrl: "https://www.selenasystems.com/ru/projects",
    pageUrl: `https://www.selenasystems.com/ru/projects/${project.slug}`,
    journalTitle: "Проекты",
    project,
    publishedAt: project.entries[0]!.date,
    updatedAt: project.entries[project.entries.length - 1]!.date,
  });
  const node = article["@graph"].find((entry) => entry["@type"] === "Article") as
    | { about: { url: string }; spatialCoverage: { name: string }[]; datePublished: string }
    | undefined;
  // The page is about the measured site, not about Selena Systems.
  assert.equal(node?.about.url, project.url);
  assert.deepEqual(
    node?.spatialCoverage.map((place) => place.name),
    project.markets,
  );
  assert.match(node?.datePublished ?? "", /^\d{4}-\d{2}-\d{2}$/);
});
