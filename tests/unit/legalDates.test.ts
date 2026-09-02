import assert from "node:assert/strict";
import test from "node:test";
import sitemap from "@/app/sitemap";
import { effectiveDateLine, formatEffectiveDate, legalDocuments } from "@/lib/data/legal";
import { buildLegalPageStructuredData } from "@/lib/structured-data";

const LEGAL_URLS = {
  privacy: ["https://www.selenasystems.com/privacy", "https://www.selenasystems.com/en/privacy"],
  terms: ["https://www.selenasystems.com/terms", "https://www.selenasystems.com/en/terms"],
} as const;

/**
 * The dates were hand-written into four pages and had drifted six days behind
 * the text they described. One source now feeds the visible line, the markup
 * and the sitemap, so they cannot disagree again.
 */
test("every legal date is a real ISO date from the single source", () => {
  for (const [kind, doc] of Object.entries(legalDocuments)) {
    assert.match(doc.effectiveDate, /^\d{4}-\d{2}-\d{2}$/, `${kind} date is not ISO`);
    assert.ok(
      !Number.isNaN(Date.parse(doc.effectiveDate)),
      `${kind} date is not a real calendar date`,
    );
  }
});

test("the visible line names the date in the page's own language", () => {
  assert.equal(formatEffectiveDate("2026-08-21", "ru"), "21 августа 2026");
  assert.equal(formatEffectiveDate("2026-08-21", "en"), "21 August 2026");

  const ru = effectiveDateLine("privacy", "ru");
  const en = effectiveDateLine("privacy", "en");
  assert.ok(ru.includes(formatEffectiveDate(legalDocuments.privacy.effectiveDate, "ru")), ru);
  assert.ok(en.includes(formatEffectiveDate(legalDocuments.privacy.effectiveDate, "en")), en);
  // The line says what the date means; a bare date reads as "last touched".
  assert.ok(/Действует с/.test(ru), ru);
  assert.ok(/In effect since/.test(en), en);
});

test("the markup publishes the document's date, never the build's", () => {
  for (const kind of ["privacy", "terms"] as const) {
    for (const locale of ["en", "ru"] as const) {
      const graph = buildLegalPageStructuredData({
        locale,
        kind,
        pageUrl: LEGAL_URLS[kind][locale === "ru" ? 0 : 1],
        name: "Document",
        description: "Document description.",
      })["@graph"] as Array<Record<string, unknown>>;

      const page = graph.find((node) => node["@type"] === "WebPage");
      assert.ok(page, `${locale} ${kind} has no WebPage node`);
      assert.equal(page.dateModified, legalDocuments[kind].effectiveDate);
      assert.equal(page.datePublished, legalDocuments[kind].effectiveDate);
    }
  }
});

test("the sitemap carries the same date for all four legal URLs", () => {
  const entries = new Map(sitemap().map((entry) => [entry.url, entry]));

  for (const [kind, urls] of Object.entries(LEGAL_URLS)) {
    for (const url of urls) {
      const entry = entries.get(url);
      assert.ok(entry, `${url} is missing from the sitemap`);
      assert.ok(entry.lastModified, `${url} publishes no lastmod`);
      assert.equal(
        new Date(entry.lastModified as Date).toISOString().slice(0, 10),
        legalDocuments[kind as keyof typeof legalDocuments].effectiveDate,
        `${url} publishes a date the document does not claim`,
      );
    }
  }
});
