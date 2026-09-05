import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { appFile } from "./appRoutePath";
import { visibilityContentEn } from "@/lib/visibility/content.en";
import { visibilityContentRu } from "@/lib/visibility/content.ru";
import { getSampleReport } from "@/lib/visibility/sample-report-data";
import {
  ACTION_LIFECYCLE_STATUSES,
  TELEGRAM_DELIVERY_STATUSES,
  VERIFICATION_STAGE_IDS,
} from "@/lib/visibility/measurement";

const LOCALES = [
  { name: "en", content: visibilityContentEn },
  { name: "ru", content: visibilityContentRu },
] as const;

/**
 * Architecture v1.4 §4.1 / §11 / §14.4 — the loop is normative and ordered:
 * Measure → Evidence → Recommendation → Assigned Action → Recheck →
 * Verified Outcome → Weekly Telegram Report. Both the page and the sample
 * report show all seven, in that order, in both languages.
 */
test("the Visibility page shows the seven verification stages in normative order", () => {
  const expected = [
    "measure",
    "evidence",
    "recommendation",
    "assigned_action",
    "recheck",
    "verified_outcome",
    "weekly_telegram_report",
  ];
  assert.deepEqual([...VERIFICATION_STAGE_IDS], expected);
  for (const { name, content } of LOCALES) {
    assert.deepEqual(
      content.verificationCycle.stages.map((s) => s.id),
      expected,
      `${name} verification stages`,
    );
    for (const stage of content.verificationCycle.stages) {
      assert.ok(stage.label.trim(), `${name} ${stage.id} label`);
      assert.ok(stage.produces.trim(), `${name} ${stage.id} produces`);
      assert.ok(stage.rule.trim(), `${name} ${stage.id} rule`);
    }
  }
  for (const locale of ["en", "ru"] as const) {
    assert.deepEqual(
      getSampleReport(locale).verificationLoop.stages.map((s) => s.id),
      expected,
      `${locale} sample report stages`,
    );
  }
});

/** Both Visibility pages render the loop together with the sample rows. */
test("both Visibility pages render the verification cycle from the sample report", () => {
  for (const route of ["app/visibility/page.tsx", "app/ru/visibility/page.tsx"]) {
    const source = readFileSync(appFile(route), "utf8");
    assert.ok(source.includes("<VerificationCycleSection"), `${route} renders the cycle`);
    assert.ok(source.includes(".verificationLoop"), `${route} passes the sample loop`);
  }
});

/**
 * Every row of the sample weekly report carries what the owner asked to see:
 * owner, status, evidence IDs, recheck method and before/after — and every
 * value is tagged as sample. Delivery is a property of the digest, so it is
 * recorded once per report, never per row.
 */
test("every sample action row is complete and tagged as sample", () => {
  for (const locale of ["en", "ru"] as const) {
    const loop = getSampleReport(locale).verificationLoop;
    assert.ok(loop.rows.length >= 4, `${locale} shows enough rows to demonstrate the lifecycle`);
    const ids = new Set<string>();
    for (const row of loop.rows) {
      const where = `${locale} ${row.id}`;
      assert.ok(!ids.has(row.id), `${where} duplicated`);
      ids.add(row.id);
      assert.ok(row.action.trim(), `${where} action`);
      assert.ok(row.owner.trim(), `${where} owner`);
      assert.doesNotMatch(row.owner, /unassigned|не назначен/i, `${where} is tracked, so it must have an owner`);
      assert.ok(ACTION_LIFECYCLE_STATUSES.includes(row.status), `${where} status ${row.status}`);
      assert.ok(row.evidenceIds.length > 0, `${where} needs at least one evidence ID`);
      for (const id of row.evidenceIds) assert.match(id, /^EV-C\d+-\d{4}$/, `${where} evidence id ${id}`);
      assert.ok(row.recheck.trim(), `${where} recheck method`);
      assert.ok(row.before.trim(), `${where} before`);
      assert.ok(row.after.trim(), `${where} after`);
      assert.equal(row.sourceStatus, "sample", where);
    }
  }
});

/** §14.4 — the sample demonstrates every lifecycle state, not only the happy one. */
test("the sample weekly report demonstrates every action lifecycle status", () => {
  for (const locale of ["en", "ru"] as const) {
    const seen = new Set(getSampleReport(locale).verificationLoop.rows.map((r) => r.status));
    for (const status of ACTION_LIFECYCLE_STATUSES) {
      assert.ok(seen.has(status), `${locale} sample lacks a ${status} row`);
    }
  }
});

/**
 * §11.3 — the digest's delivery record is bounded: at most five attempts,
 * a status from the delivery vocabulary, and a note that no attempt repeats
 * a measurement.
 */
test("the sample digest delivery record follows the delivery rules", () => {
  for (const locale of ["en", "ru"] as const) {
    const { delivery, rows, statusLabels, telegramStatusLabels } = getSampleReport(locale).verificationLoop;
    assert.ok(TELEGRAM_DELIVERY_STATUSES.includes(delivery.status));
    for (const row of rows) assert.ok(!("telegram" in row), `${locale} ${row.id} carries a per-row delivery status`);
    assert.ok(delivery.attempts.length >= 1 && delivery.attempts.length <= 5, `${locale} attempts`);
    assert.deepEqual(
      delivery.attempts.map((a) => a.attempt),
      delivery.attempts.map((_, i) => i + 1),
      `${locale} attempts are numbered in order`,
    );
    for (const status of ACTION_LIFECYCLE_STATUSES) assert.ok(statusLabels[status].trim());
    for (const status of TELEGRAM_DELIVERY_STATUSES) assert.ok(telegramStatusLabels[status].trim());
  }
});

/** v1.4 §19.2 — sample data on a marketing page carries the exact marker. */
test("the sample weekly report on the Visibility page is marked as sample, not a measurement", () => {
  assert.equal(visibilityContentEn.verificationCycle.sampleReport.sampleLabel, "Sample data · not a measurement");
  assert.match(visibilityContentRu.verificationCycle.sampleReport.sampleLabel, /не замер/);
});

/** §5 OUTCOMES — a verified outcome is observed, never causal or guaranteed. */
test("the verification loop never promises causality or guaranteed results", () => {
  const banned = /guarantee|гарантир|caused by|will rank|будет в топ/i;
  for (const { name, content } of LOCALES) {
    assert.ok(!banned.test(JSON.stringify(content.verificationCycle)), `${name} verification cycle copy`);
  }
  for (const locale of ["en", "ru"] as const) {
    const loop = getSampleReport(locale).verificationLoop;
    assert.ok(!banned.test(JSON.stringify(loop)), `${locale} sample loop`);
    assert.match(loop.disclosure, /not prove|не доказывает/i);
  }
});
