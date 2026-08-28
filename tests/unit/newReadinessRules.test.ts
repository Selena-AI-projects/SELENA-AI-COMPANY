import assert from "node:assert/strict";
import test from "node:test";
import { runTechnicalChecks } from "@/lib/visibility/checks/technicalChecks";
import { getRecommendation } from "@/lib/visibility/checks/recommendations";

/**
 * The rules an audit of three real sites found missing from the free check:
 * nobody is named, nothing is dated, the business points at no profile of its
 * own, a comparison a machine cannot read, and a page that forbids caching.
 */

const NEW_RULES = [
  "identity.author_named",
  "identity.dated",
  "identity.same_as",
  "offer.comparison_readable",
  "access.cacheable",
] as const;

function check(html: string | null, headers: Record<string, string> = {}) {
  const results = runTechnicalChecks(
    {
      requestedUrl: "https://example.com/",
      finalUrl: "https://example.com/",
      statusCode: 200,
      headers,
      html,
    },
    { sitemapFound: true },
  );
  return (ruleId: string) => results.find((result) => result.ruleId === ruleId);
}

const ORGANIZATION = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Example",
})}</script>`;

test("a page that names nobody and dates nothing is warned about both", () => {
  const find = check(`<html><head><title>Example</title></head><body><h1>Example</h1></body></html>`);
  assert.equal(find("identity.author_named")?.state, "warn");
  assert.equal(find("identity.dated")?.state, "warn");
});

test("an article that names its author and its dates passes", () => {
  const article = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Person", "@id": "https://example.com/#founder", name: "Real Name" },
      {
        "@type": "Article",
        author: { "@type": "Person", name: "Real Name" },
        datePublished: "2026-08-01",
        dateModified: "2026-08-20",
      },
    ],
  })}</script>`;
  const find = check(`<html><head><title>Example</title>${article}</head><body><h1>x</h1></body></html>`);
  assert.equal(find("identity.author_named")?.state, "pass");
  assert.equal(find("identity.dated")?.state, "pass");
});

test("an author given only as a reference is not a name", () => {
  const article = `<script type="application/ld+json">${JSON.stringify({
    "@type": "Article",
    author: { "@id": "https://example.com/#someone" },
  })}</script>`;
  const find = check(`<html><head>${article}</head><body><h1>x</h1></body></html>`);
  assert.equal(find("identity.author_named")?.state, "warn");
});

test("a business with no profiles of its own is warned, and one with them passes", () => {
  const without = check(`<html><head>${ORGANIZATION}</head><body><h1>x</h1></body></html>`);
  assert.equal(without("identity.same_as")?.state, "warn");

  const withProfiles = `<script type="application/ld+json">${JSON.stringify({
    "@type": "Organization",
    name: "Example",
    sameAs: ["https://www.linkedin.com/company/example"],
  })}</script>`;
  const found = check(`<html><head>${withProfiles}</head><body><h1>x</h1></body></html>`);
  assert.equal(found("identity.same_as")?.state, "pass");
  assert.deepEqual(found("identity.same_as")?.evidence.sameAs, ["https://www.linkedin.com/company/example"]);
});

test("a page describing no entity is not accused of hiding its profiles", () => {
  const find = check(`<html><head><title>Example</title></head><body><h1>x</h1></body></html>`);
  assert.equal(find("identity.same_as")?.state, "not_measured");
});

test("a comparison built from divs is warned, and one built as a table passes", () => {
  const divs = `<html><head><title>Us vs Them</title></head><body><h1>Us vs Them</h1><div>yes</div></body></html>`;
  assert.equal(check(divs)("offer.comparison_readable")?.state, "warn");

  const table = `<html><head><title>Us vs Them</title></head><body><h1>Us vs Them</h1><table><tr><th>a</th></tr></table></body></html>`;
  assert.equal(check(table)("offer.comparison_readable")?.state, "pass");
});

test("a page that compares nothing is not judged on a comparison it does not make", () => {
  const find = check(`<html><head><title>About</title></head><body><h1>About</h1></body></html>`);
  assert.equal(find("offer.comparison_readable")?.state, "not_measured");
});

test("no-store is a warning, an ordinary cache header is not", () => {
  const html = `<html><head><title>x</title></head><body><h1>x</h1></body></html>`;
  assert.equal(check(html, { "cache-control": "no-store" })("access.cacheable")?.state, "warn");
  assert.equal(check(html, { "cache-control": "public, max-age=600" })("access.cacheable")?.state, "pass");
});

test("a page that never arrived is not judged, only its header is", () => {
  const find = check(null, { "cache-control": "no-store" });
  for (const rule of ["identity.author_named", "identity.dated", "identity.same_as", "offer.comparison_readable"]) {
    assert.equal(find(rule)?.state, "not_measured", rule);
  }
  assert.equal(find("access.cacheable")?.state, "warn");
});

test("every new rule can say what to do about it, in both languages", () => {
  for (const ruleId of NEW_RULES) {
    for (const locale of ["en", "ru"] as const) {
      const recommendation = getRecommendation(ruleId, locale);
      assert.ok(recommendation, `${ruleId} has no ${locale} recommendation`);
      assert.ok(recommendation.action.length > 20, `${ruleId} ${locale} action is not an action`);
      // Every finding states its own limit; that is the product's contract.
      assert.ok(recommendation.doesNotProve.length > 20, `${ruleId} ${locale} claims too much`);
    }
  }
});
