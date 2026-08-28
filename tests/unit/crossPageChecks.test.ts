import assert from "node:assert/strict";
import test from "node:test";
import { extractHtmlSignals } from "@/lib/visibility/checks/htmlSignals";
import { runCrossPageChecks, type CrossPageView } from "@/lib/visibility/checks/crossPageChecks";
import { getRecommendation } from "@/lib/visibility/checks/recommendations";

/**
 * The three findings an audit of three real sites produced that no single
 * page could have produced: pages contradicting each other, a robots.txt two
 * crawlers read differently, and a page hidden in one language only.
 */

const CRAWLERS = [
  { crawler: "Anthropic", userAgent: "ClaudeBot" },
  { crawler: "Perplexity", userAgent: "PerplexityBot" },
] as const;

function page(url: string, body: string, headers: Record<string, string> = {}, lang = "ru"): CrossPageView {
  return {
    url,
    signals: extractHtmlSignals(`<html lang="${lang}"><head><title>x</title>${body}</head><body><h1>x</h1></body></html>`),
    headers,
  };
}

function jsonLd(value: unknown): string {
  return `<script type="application/ld+json">${JSON.stringify(value)}</script>`;
}

function run(input: Partial<Parameters<typeof runCrossPageChecks>[0]>) {
  const results = runCrossPageChecks({
    baseUrl: "https://example.com",
    pages: [],
    robotsBody: null,
    sitemapBody: null,
    crawlers: CRAWLERS,
    ...input,
  });
  return (ruleId: string) => results.find((result) => result.ruleId === ruleId);
}

const NEW_RULES = ["identity.facts_agree", "access.robots_unambiguous", "access.noindex_covers_locales"] as const;

test("two pages giving different phone numbers are reported as disagreeing", () => {
  const find = run({
    pages: [
      page("https://example.com/", jsonLd({ "@type": "LocalBusiness", telephone: "+7 900 111-11-11" })),
      page("https://example.com/contact", jsonLd({ "@type": "LocalBusiness", telephone: "+7 900 222-22-22" })),
    ],
  });
  const result = find("identity.facts_agree");
  assert.equal(result?.state, "warn");
  assert.equal(result?.evidence.fact, "telephone");
  // The finding has to point at a page the owner can open.
  assert.equal(result?.pageUrl, "https://example.com/");
});

test("the same number written two ways is not a disagreement", () => {
  const find = run({
    pages: [
      page("https://example.com/", jsonLd({ "@type": "LocalBusiness", telephone: "+7 900 111-11-11" })),
      page("https://example.com/contact", `<a href="tel:+79001111111">call</a>`),
    ],
  });
  assert.equal(find("identity.facts_agree")?.state, "pass");
});

test("a page that lists more of the same thing does not contradict one that lists less", () => {
  const find = run({
    pages: [
      page("https://example.com/", jsonLd({ "@type": "Restaurant", servesCuisine: ["Georgian", "Italian"] })),
      page("https://example.com/menu", jsonLd({ "@type": "Restaurant", servesCuisine: ["Italian"] })),
    ],
  });
  assert.equal(find("identity.facts_agree")?.state, "pass");
});

test("two menus with nothing in common are a disagreement", () => {
  const find = run({
    pages: [
      page("https://example.com/", jsonLd({ "@type": "Restaurant", servesCuisine: ["Georgian", "Italian"] })),
      page("https://example.com/menu", jsonLd({ "@type": "Restaurant", servesCuisine: ["Japanese"] })),
    ],
  });
  const result = find("identity.facts_agree");
  assert.equal(result?.state, "warn");
  assert.equal(result?.evidence.fact, "servesCuisine");
});

test("a site that states no fact twice is not accused of contradicting itself", () => {
  const find = run({ pages: [page("https://example.com/", "")] });
  assert.equal(find("identity.facts_agree")?.state, "not_measured");
});

test("a robots.txt the two readers disagree about is reported", () => {
  // The wildcard group closes the site; the named group opens it. A crawler
  // that resolves the most specific group comes in; a simpler one does not.
  const find = run({
    robotsBody: "User-agent: *\nDisallow: /\n\nUser-agent: ClaudeBot\nAllow: /\n",
  });
  const result = find("access.robots_unambiguous");
  assert.equal(result?.state, "warn");
  assert.equal(result?.evidence.disagreeingCrawlers, 1);
  assert.match(String(result?.evidence.observation), /ClaudeBot/);
});

test("a robots.txt both readers agree about passes", () => {
  const find = run({ robotsBody: "User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml\n" });
  assert.equal(find("access.robots_unambiguous")?.state, "pass");
});

test("a site with no robots.txt is not judged on one", () => {
  assert.equal(run({})("access.robots_unambiguous")?.state, "not_measured");
});

test("a page hidden in one language and open in another is reported", () => {
  const find = run({
    pages: [
      page("https://example.com/ru/pricing", `<meta name="robots" content="noindex">`, {}, "ru"),
      page("https://example.com/en/pricing", "", {}, "en"),
    ],
  });
  const result = find("access.noindex_covers_locales");
  assert.equal(result?.state, "warn");
  assert.equal(result?.pageUrl, "https://example.com/ru/pricing");
});

test("noindex sent as a header counts the same as noindex in the markup", () => {
  const find = run({
    pages: [
      page("https://example.com/ru/pricing", "", { "x-robots-tag": "noindex" }, "ru"),
      page("https://example.com/en/pricing", "", {}, "en"),
    ],
  });
  assert.equal(find("access.noindex_covers_locales")?.state, "warn");
});

test("a hidden page whose twin the sitemap still offers for crawling is reported", () => {
  const find = run({
    pages: [page("https://example.com/ru/draft", `<meta name="robots" content="noindex">`, {}, "ru")],
    sitemapBody: "<urlset><url><loc>https://example.com/en/draft</loc></url></urlset>",
  });
  assert.equal(find("access.noindex_covers_locales")?.state, "warn");
});

test("a path that only looks like a language the site does not speak is not a twin", () => {
  // `/hr` is a department here, not Croatian: the site declares only ru.
  const find = run({
    pages: [
      page("https://example.com/hr", `<meta name="robots" content="noindex">`, {}, "ru"),
      page("https://example.com/", "", {}, "ru"),
    ],
  });
  assert.equal(find("access.noindex_covers_locales")?.state, "pass");
});

test("a site that hides nothing is not judged on where its noindex reaches", () => {
  const find = run({ pages: [page("https://example.com/", "")] });
  assert.equal(find("access.noindex_covers_locales")?.state, "not_measured");
});

test("every cross-page rule can say what to do about it, in both languages", () => {
  for (const ruleId of NEW_RULES) {
    for (const locale of ["en", "ru"] as const) {
      const recommendation = getRecommendation(ruleId, locale);
      assert.ok(recommendation, `${ruleId} has no ${locale} recommendation`);
      assert.ok(recommendation.action.length > 20, `${ruleId} ${locale} action is not an action`);
      assert.ok(recommendation.doesNotProve.length > 20, `${ruleId} ${locale} claims too much`);
    }
  }
});
