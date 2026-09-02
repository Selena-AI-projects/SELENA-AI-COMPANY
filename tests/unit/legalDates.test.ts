import assert from "node:assert/strict";
import test from "node:test";
import sitemap from "@/app/sitemap";
import {
  formatLegalDate,
  isRealCalendarDate,
  legalDocuments,
  revisionLine,
} from "@/lib/data/legal";
import { buildLegalPageStructuredData } from "@/lib/structured-data";

const LEGAL_URLS = {
  privacy: ["https://www.selenasystems.com/privacy", "https://www.selenasystems.com/en/privacy"],
  terms: ["https://www.selenasystems.com/terms", "https://www.selenasystems.com/en/terms"],
} as const;

/**
 * `Date.parse("2026-02-30")` returns 2 March, so the obvious assertion passes
 * on a date that does not exist: the page would print "30 февраля" while the
 * sitemap published 2 March. The validator builds the date from its parts and
 * reads them back, which is the only way to catch it.
 */
test("a date that does not exist is rejected, not silently rolled forward", () => {
  for (const bad of ["2026-02-30", "2026-02-29", "2026-04-31", "2026-13-01", "2026-8-21", "not-a-date"]) {
    assert.equal(isRealCalendarDate(bad), false, `${bad} was accepted`);
    assert.throws(() => formatLegalDate(bad, "ru"), /not a real calendar date/, bad);
  }
  for (const good of ["2026-08-21", "2026-09-02", "2028-02-29"]) {
    assert.equal(isRealCalendarDate(good), true, `${good} was rejected`);
  }
});

test("every published legal date is a real calendar date", () => {
  for (const [kind, doc] of Object.entries(legalDocuments)) {
    assert.equal(isRealCalendarDate(doc.revisionPublished), true, `${kind}: ${doc.revisionPublished}`);
  }
});

test("the visible line names the date in the page's own language and says what it means", () => {
  assert.equal(formatLegalDate("2026-09-02", "ru"), "2 сентября 2026");
  assert.equal(formatLegalDate("2026-09-02", "en"), "2 September 2026");

  const ru = revisionLine("privacy", "ru");
  const en = revisionLine("privacy", "en");
  assert.ok(ru.includes(formatLegalDate(legalDocuments.privacy.revisionPublished, "ru")), ru);
  assert.ok(en.includes(formatLegalDate(legalDocuments.privacy.revisionPublished, "en")), en);
  // The claim is about this revision, not about a first publication the site
  // has never recorded.
  assert.ok(/Эта редакция опубликована и действует с/.test(ru), ru);
  assert.ok(/This revision is published and in effect from/.test(en), en);
});

test("the markup publishes only the date the site can check", () => {
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
      assert.equal(page.dateModified, legalDocuments[kind].revisionPublished);
      // No first-publication date was ever recorded, so none is claimed.
      assert.equal(page.datePublished, undefined, `${locale} ${kind} invents a datePublished`);
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
        legalDocuments[kind as keyof typeof legalDocuments].revisionPublished,
        `${url} publishes a date the document does not claim`,
      );
    }
  }
});
