import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { commercialFacts, COMMERCIAL_FACTS_VERSION } from "@/lib/commercial-facts";
import { homepage } from "@/lib/data/homepage";
import { ruHomepage } from "@/lib/data/homepage-ru";
import { buildHomeStructuredData } from "@/lib/structured-data";
import { getSampleReport } from "@/lib/visibility/sample-report-data";

test("one versioned registry owns current public prices", () => {
  assert.equal(COMMERCIAL_FACTS_VERSION, commercialFacts.version);
  assert.equal(commercialFacts.aiSystems.sprint.price, 4_500);
  assert.equal(homepage.packages.find((item) => item.name === "AI Sprint")?.price, commercialFacts.aiSystems.sprint.en);
  assert.equal(ruHomepage.packages.find((item) => item.name === "AI-спринт")?.price, commercialFacts.aiSystems.sprint.ru);

  for (const locale of ["en", "ru"] as const) {
    const serialized = JSON.stringify(buildHomeStructuredData(locale));
    assert.match(serialized, /"price":"4500"/);
    assert.ok(!serialized.includes('"price":"4000"'));
  }
});

test("commercial facts expose one complete typed catalog for both product lines", () => {
  const visibility = Object.values(commercialFacts.aiVisibility);
  const systems = Object.values(commercialFacts.aiSystems);

  assert.deepEqual(visibility.map((offer) => offer.price), [0, 49, 79, 399, 2_490]);
  assert.deepEqual(systems.map((offer) => offer.price), [100, 500, 4_500, 10_000]);
  assert.ok(visibility.every((offer) => offer.productLine === "ai-visibility"));
  assert.ok(systems.every((offer) => offer.productLine === "ai-systems"));
  assert.ok(visibility.every((offer) => offer.currency === "USD" && offer.isPublic));
  assert.ok(systems.every((offer) => offer.currency === "USD" && offer.isPublic));
  assert.equal(commercialFacts.aiVisibility.publicReadiness.availability, "free");
  assert.equal(commercialFacts.aiVisibility.implementation90Days.availability, "manual_approval");
  assert.equal(commercialFacts.aiSystems.businessOs.minPrice, 10_000);
  assert.equal(commercialFacts.aiVisibility.implementation90Days.ru, "$2,490");
});

test("sample-report routing uses the locked AI Visibility catalog", () => {
  for (const locale of ["en", "ru"] as const) {
    const report = getSampleReport(locale);
    assert.deepEqual(report.routing.options.map((item) => item.name), [
      "AI Visibility Snapshot",
      "AI Visibility Landscape",
      "Expert Verified",
      "Implementation + 90 days",
    ]);
    const serialized = JSON.stringify(report.routing.options);
    for (const stale of ["$9", "$4,000", "$4 000", "Visibility Sprint", "Visibility Audit"]) {
      assert.ok(!serialized.includes(stale), `${locale} still contains ${stale}`);
    }
  }
});

/**
 * The seller a buyer sees must be the same everywhere. The footer once named a
 * different company than the offer and privacy pages, which is a legal claim,
 * not a copy detail.
 */
test("every public page names one seller", () => {
  const { legalName } = commercialFacts.seller;
  const files = [
    "components/layout/Footer.tsx",
    "app/terms/page.tsx",
    "app/privacy/page.tsx",
    "app/en/terms/page.tsx",
    "app/en/privacy/page.tsx",
    "lib/visibility/content.ru.ts",
    "lib/visibility/content.en.ts",
  ];
  for (const file of files) {
    const source = readFileSync(join(process.cwd(), file), "utf8");
    assert.ok(
      source.includes(legalName) || source.includes("commercialFacts.seller") || source.includes("seller.legalName"),
      `${file} must name ${legalName} as the seller`,
    );
    assert.ok(!/PT Izi Jiza/i.test(source), `${file} still names a second legal entity`);
  }
});
