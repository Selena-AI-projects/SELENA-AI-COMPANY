import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAboutStructuredData,
  buildAiAutomationOfferStructuredData,
  buildAiSystemsStructuredData,
  buildAiVisibilityStructuredData,
  buildLabArticleStructuredData,
  buildPricingStructuredData,
  buildPublicReadinessStructuredData,
} from "@/lib/structured-data";

function graphOf(value: { "@graph": unknown[] }) {
  return value["@graph"] as Array<Record<string, unknown>>;
}

test("AI Visibility structured data keeps free readiness separate from paid measurement", () => {
  const graph = graphOf(buildAiVisibilityStructuredData("en"));
  const service = graph.find((item) => item["@type"] === "Service");
  assert.ok(service);

  const catalog = service.offers as { itemListElement: Array<Record<string, string>> };
  assert.deepEqual(
    catalog.itemListElement.map((offer) => offer.name),
    [
      "Public Readiness",
      "AI Visibility Snapshot",
      "AI Visibility Landscape",
      "Expert Verified",
      "Implementation + 90 days",
    ],
  );
  assert.equal(catalog.itemListElement[0].price, "0");
  assert.equal(catalog.itemListElement[1].price, "49");
  assert.equal(catalog.itemListElement[2].price, "79");
  assert.equal(catalog.itemListElement[3].price, "399");
  assert.equal(catalog.itemListElement[4].price, "2490");
});

test("AI Systems structured data exposes the four custom service offers", () => {
  const graph = graphOf(buildAiSystemsStructuredData("en"));
  const service = graph.find((item) => item["@type"] === "Service");
  assert.ok(service);
  const catalog = service.offers as {
    itemListElement: Array<Record<string, string | Record<string, string>>>;
  };
  assert.deepEqual(catalog.itemListElement.map((offer) => offer.price), ["100", "500", "4500", undefined]);

  // Business OS is sold "from $10,000": the floor belongs in the specification,
  // and `price` stays unset so the number is not read as the final one.
  const businessOs = catalog.itemListElement[3];
  const specification = businessOs.priceSpecification as Record<string, string>;
  assert.equal(specification.minPrice, "10000");
  assert.equal(specification.priceCurrency, "USD");
});

test("Organization structured data uses the public legal entity consistently", () => {
  const graph = graphOf(buildAiSystemsStructuredData("en"));
  const organization = graph.find((item) => item["@type"] === "Organization");
  assert.equal(organization?.legalName, "Selena Systems LLC");
  const address = organization?.address as Record<string, string>;
  assert.equal(address.addressCountry, "US");
  // The legal pages name the state; the markup has to name the same one.
  assert.equal(address.addressRegion, "WY");
});

test("AI Audit detail exposes one canonical service offer", () => {
  const graph = graphOf(buildAiAutomationOfferStructuredData("ai-audit"));
  const service = graph.find((item) => item["@type"] === "Service");
  const offer = service?.offers as Record<string, string>;
  assert.equal(offer.price, "500");
  assert.equal(offer.url, "https://www.selenasystems.com/ai-systems/ai-audit");
});

test("English About structured data identifies the canonical AboutPage", () => {
  const graph = graphOf(buildAboutStructuredData("en"));
  const page = graph.find((item) => item["@type"] === "AboutPage");
  assert.equal(page?.url, "https://www.selenasystems.com/en/about");
  assert.equal(page?.inLanguage, "en");
});

test("Public Readiness structured data contains a zero-price offer only", () => {
  const graph = graphOf(buildPublicReadinessStructuredData("ru"));
  const service = graph.find((item) => item["@type"] === "Service");
  assert.ok(service);
  assert.equal((service.offers as Record<string, string>).price, "0");
});

test("Lab article structured data records modification date and breadcrumb", () => {
  const graph = graphOf(buildLabArticleStructuredData({
    locale: "en",
    pageUrl: "https://www.selenasystems.com/lab/articles/example",
    title: "Example article",
    description: "Evidence-safe article summary.",
    updatedAt: "2026-08-16",
  }));
  const article = graph.find((item) => item["@type"] === "Article");
  const breadcrumb = graph.find((item) => item["@type"] === "BreadcrumbList");
  assert.equal(article?.dateModified, "2026-08-16");
  assert.equal((breadcrumb?.itemListElement as Array<Record<string, string>>).length, 2);
});

/**
 * The pricing page published the graphs of the two product pages and no node
 * for itself: a reader on /pricing was told they were on /visibility.
 */
test("each pricing page describes itself and publishes every offer it sells", () => {
  for (const [locale, expected] of [
    ["en", "https://www.selenasystems.com/pricing"],
    ["ru", "https://www.selenasystems.com/ru/pricing"],
  ] as const) {
    const graph = graphOf(buildPricingStructuredData(locale));
    const page = graph.find((item) => item["@type"] === "WebPage");
    assert.ok(page, `${locale} pricing has no page node`);
    assert.equal(page.url, expected, `${locale} pricing describes another page`);

    // Both catalogues are sold here, so both must be readable here: five
    // Visibility offers and four AI Automation ones.
    const offers = JSON.stringify(graph).match(/"@type":"Offer"/g) ?? [];
    assert.equal(offers.length, 9, `${locale} pricing publishes ${offers.length} of 9 offers`);
  }
});
