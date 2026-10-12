import assert from "node:assert/strict";
import test from "node:test";
import { discoverySales, discoveryTracks, discoveryLinks, auditTerms, discoveryDecisionSteps, discoveryPlanOutcomes } from "@/lib/visibility/sales";
import { visibilityActivation } from "@/lib/visibility/activation";
import { isClientPortalEnabled, visibilityLanguages } from "@/lib/visibility/routes";
import { buildAiVisibilityStructuredData } from "@/lib/structured-data";
import { homepage } from "@/lib/data/homepage";
import { visibilityContentEn } from "@/lib/visibility/content.en";
import { visibilityContentRu } from "@/lib/visibility/content.ru";
import { commercialFacts } from "@/lib/commercial-facts";

const [snapshot, landscape, audit, managed] = discoveryTracks("en").flatMap((track) => track.plans);

test("FREE is Public Readiness, with an explicit no-measurement boundary", () => {
  assert.equal(discoveryLinks.free, "/check");
  assert.equal(homepage.productPaths.visibility.primaryCta.href, "/check");
  assert.match(discoverySales.free.boundary, /Public Readiness is not an AI visibility measurement/);
  assert.doesNotMatch(discoveryLinks.free, /free-ai-visibility/);
});

test("Snapshot measures ChatGPT, Gemini and Perplexity, with competitors, answers and sources", () => {
  const text = JSON.stringify(snapshot);
  for (const term of ["ChatGPT", "Gemini", "Perplexity", "competitors", "sources", "Answers", "positions", "25"])
    assert.ok(text.includes(term), term);
  assert.doesNotMatch(snapshot.systemsLabel, /Claude|DeepSeek/);
});

/**
 * Perplexity is measured through its API, so wherever a plan names it, the
 * clause it sits in has to say API — in its own label or in the API list it
 * belongs to — and never sell it as Visitor View or as still pending.
 */
function perplexityIsLabelledApi(text: string): boolean {
  return [...text.matchAll(/Perplexity/g)].every(({ index = 0 }) => {
    const before = text.slice(0, index).split(/[.;]\s/).pop() ?? "";
    const after = text.slice(index).split(/[.;](?:\s|$)/)[0];
    return /API/.test(before + after);
  });
}

test("Perplexity is sold as an API system wherever a plan names it", () => {
  const ru = discoveryTracks("ru").flatMap((track) => track.plans);
  const offers = [
    ...[snapshot, landscape].map((plan) => plan.systemsLabel),
    ...ru.slice(0, 2).map((plan) => plan.systemsLabel),
    commercialFacts.aiVisibility.snapshot.description.en,
    commercialFacts.aiVisibility.snapshot.description.ru,
    commercialFacts.aiVisibility.landscape.description.en,
    commercialFacts.aiVisibility.landscape.description.ru,
    ...discoverySales.faq.map((item) => item.a),
    ...visibilityContentRu.faq.map((item) => item.a),
    ...(visibilityContentRu.hero.answers ?? []).map((item) => item.answer),
    ...visibilityContentEn.liveReport.lockedItems.map((item) => item.body),
    ...visibilityContentRu.liveReport.lockedItems.map((item) => item.body),
    ...[visibilityContentEn, visibilityContentRu].flatMap((content) => content.methodology.supported),
    ...discoveryPlanOutcomes.flat().map((item) => item.body),
  ].filter((text) => text.includes("Perplexity"));
  assert.ok(offers.length >= 10, "the plans no longer name Perplexity");
  for (const text of offers) {
    assert.ok(perplexityIsLabelledApi(text), text);
    assert.doesNotMatch(text, /not measured yet|пока не измеряется|being connected|подключается/, text);
    assert.doesNotMatch(text, /Perplexity \((?:Visitor View|как видит посетитель)\)/, text);
  }

  assert.equal(snapshot.systemsLabel, "ChatGPT · Gemini (Visitor View) · Perplexity (API)");
  assert.equal(ru[0].systemsLabel, "ChatGPT · Gemini (как видит посетитель) · Perplexity (через API)");
  assert.equal(
    landscape.systemsLabel,
    "Visitor View: ChatGPT · Gemini. API / Model Landscape: Claude · DeepSeek · Qwen · Mistral · Grok · Perplexity.",
  );
  assert.equal(
    ru[1].systemsLabel,
    "Как видит посетитель: ChatGPT · Gemini. Через API (модели): Claude · DeepSeek · Qwen · Mistral · Grok · Perplexity.",
  );

  const contract = [visibilityContentEn, visibilityContentRu].map((content) =>
    content.methodology.supported.filter((item) => item.includes("Perplexity")).join(" "),
  );
  assert.match(contract[0], /eight-system measurement contract.*Perplexity measured through its API/);
  assert.match(contract[1], /восьми систем.*Perplexity — через API/);
});

test("Full Discovery adds separate API classes and promises no Local measurement", () => {
  const text = JSON.stringify(landscape);
  for (const term of ["Claude", "DeepSeek", "Qwen", "Mistral", "Grok", "Visitor View", "API / Model Landscape"])
    assert.ok(text.includes(term), term);
  assert.match(text, /API output is not the consumer experience/);
  assert.match(commercialFacts.aiVisibility.landscape.description.en, /Local Visibility is not included yet/);
  assert.match(commercialFacts.aiVisibility.landscape.description.ru, /локальная видимость пока не входят/);
});

test("manual Ask Maps belongs to human work, never the automated subscriptions", () => {
  assert.equal(visibilityActivation.localAi, "MANUAL_ONLY");
  for (const locale of ["en", "ru"] as const) {
    const [basic, expanded, human, execution] = discoveryTracks(locale).flatMap(track => track.plans);
    assert.doesNotMatch(JSON.stringify([basic, expanded]), /Ask Maps|Local AI|Google Maps|Local Visibility|LOCAL|локальн/i);
    assert.match(human.features.join(" "), /manual Google Ask Maps|Ручное исследование Google Ask Maps/i);
    assert.match(execution.features.join(" "), /only where agreed in scope|только в согласованном объёме/);
  }
  assert.doesNotMatch(JSON.stringify(discoveryPlanOutcomes), /Ask Maps|Local AI/);
  const localFaq = [discoverySales.faq, visibilityContentRu.faq].map(
    (faq) => faq.find((item) => /\$79/.test(item.q))?.a ?? "",
  );
  assert.match(localFaq[0], /^Not yet\./);
  assert.match(localFaq[1], /^Пока нет\./);
  assert.match(discoverySales.audit.investigation.join(" "), /Includes manual Google Ask Maps \/ Local AI investigation where relevant/);
});

test("subscriptions and Telegram fail closed with a visible preview boundary", () => {
  assert.equal(visibilityActivation.recurring, false);
  assert.equal(visibilityActivation.telegram, false);
  assert.match(discoverySales.hero.gate, /not yet activated/);
  assert.match(discoverySales.telegram.preview, /Preview.*not activated/);
  assert.match(discoverySales.telegram.boundary, /saved before.*verified recipient.*authenticated workspace/);
  assert.match(discoverySales.telegram.boundary, /never starts a measurement.*must not create duplicate measurements/);
  assert.match(snapshot.statusLabel, /Early access/);
  assert.match(landscape.statusLabel, /early access/);
});

test("Audit is human-led with 3–5 competitors and a 60-minute session, without analyst-hour marketing", () => {
  const text = JSON.stringify({ plan: audit, offer: discoverySales.audit });
  assert.match(text, /3–5/);
  assert.match(text, /60-minute Strategy Session/);
  assert.match(text, /owner|Owner/);
  assert.doesNotMatch(text, /\bhours?\b|800|2000/i);
  assert.match(text, /reject weakly supported/);
  assert.equal(discoverySales.audit.fields.length, 11);
});

test("Audit terms preserve preparation, attendance, reschedule, delivery, recheck and refund trigger", () => {
  const terms = auditTerms.map((term) => term.body).join(" ");
  for (const term of [
    "48 hours",
    "24 hours",
    "no-show",
    "preliminary analysis",
    "3 business days",
    "30 days",
    "authorized",
    "fully refundable before analyst investigation begins",
    "accepts the completed preparation information",
    "starts the analyst review",
    "mandatory applicable law",
  ])
    assert.ok(terms.includes(term), term);
});

test("Managed Discovery is 90 days with monitoring, repeated rechecks and no outcome guarantee", () => {
  const text = JSON.stringify(managed);
  assert.match(managed.price, /\$2,490.*90 days/);
  for (const term of ["monitoring", "rechecks", "second implementation iteration", "do not guarantee", "provider cap"])
    assert.ok(text.includes(term), term);
  assert.equal(managed.href, discoveryLinks.managed);
});

test("proof is fictional, no client identity or unverified result is published", () => {
  const proof = JSON.stringify({
    preview: discoverySales.preview,
    actions: discoverySales.actions,
    case: discoverySales.case,
    telegram: discoverySales.telegram,
  });
  assert.doesNotMatch(proof, /AVLI|KORA|Usha/i);
  assert.match(discoverySales.preview.label, /fictional.*not client results/);
  assert.equal(visibilityActivation.clientProof, false);
  assert.match(proof, /Result: not measured/);
});

test("two-cycle materiality rule is not presented as an implemented fact", () => {
  assert.equal(visibilityActivation.materialityRule, false);
  assert.doesNotMatch(JSON.stringify(discoverySales), /two consecutive cycles|noise band/);
});

test("one adapter supplies the same four paid plans to pricing, homepage and sales", () => {
  const names = discoveryTracks("en")
    .flatMap((track) => track.plans)
    .map((plan) => plan.name);
  assert.deepEqual(
    visibilityContentEn.pricing.tracks.flatMap((track) => track.plans).map((plan) => plan.name),
    names,
  );
  assert.deepEqual(
    homepage.productPaths.visibility.items.slice(1).map((plan) => plan.name),
    names,
  );
});

test("every paid offer has a manual or early-access destination; portal is closed by default", () => {
  for (const locale of ["en", "ru"] as const) {
    for (const plan of discoveryTracks(locale).flatMap((track) => track.plans)) {
      assert.match(plan.href!, /\/visibility#(early-access|audit-order|managed-application)$/);
      assert.ok(plan.ctaLabel);
      assert.doesNotMatch(plan.href!, /staging|app\.selenasystems/);
    }
  }
  assert.equal(isClientPortalEnabled({}), false);
});

test("EN/RU pairing stays exact and inactive paid checkout has no Offer schema", () => {
  assert.deepEqual(visibilityLanguages("visibility"), {
    "x-default": "/visibility",
    en: "/visibility",
    ru: "/ru/visibility",
  });
  assert.equal(visibilityActivation.payments, false);
  for (const locale of ["en", "ru"] as const) {
    const schema = JSON.stringify(buildAiVisibilityStructuredData(locale));
    assert.match(schema, /"price":"0"/);
    assert.doesNotMatch(schema, /"price":"(?:49|79|399|2490)"/);
  }
});


test("the company hero offers both product destinations without changing free readiness", () => {
  assert.equal(homepage.hero.primaryCta.href, "/visibility");
  assert.equal(homepage.hero.secondaryCta.href, "/ai-systems");
  assert.match(homepage.hero.eyebrow, /AI VISIBILITY.*AI AUTOMATION/);
  assert.equal(homepage.productPaths.visibility.items[0].cta.href, "/check");
});

test("recommendations and competitors are explicit before the human audit", () => {
  assert.match(discoverySales.hero.intro, /competitors.*sources.*improve next/);
  assert.equal(discoverySales.answers.length, 5);
  assert.match(snapshot.features.join(" "), /Automatic recommendations included/);
  assert.match(landscape.features.join(" "), /Expanded recommendations included/);
  assert.equal(snapshot.progressionLabel, "WHERE → WHO → SOURCES → CHANGE → NEXT ACTION");
  assert.equal(landscape.progressionLabel, "EXPANDED AI → COMPETITORS → SOURCES → OPPORTUNITIES → NEXT ACTION");
  assert.match(JSON.stringify(discoveryPlanOutcomes[0]), /Competitors.*Sources.*Recommendations/);
  assert.match(discoverySales.bridge, /automatic recommendation is not the same as a verified business decision/);
  assert.match(discoveryDecisionSteps[2].body, /human analyst.*challenges.*Action Plan/i);
});

test("every competitor demo includes a next action without inventing client proof or a trend", () => {
  for (const row of discoverySales.preview.rows) {
    assert.match(row.competitor, /^Example /);
    assert.match(row.source, /^Example /);
    assert.ok(row.recommendation.length > 20);
  }
  assert.match(discoverySales.preview.label, /fictional.*not client results/);
  assert.match(discoverySales.preview.boundary, /single-cycle demo establishes no recurring pattern or change/);
  assert.match(discoverySales.preview.boundary, /not proof of why/);
});


test("company homepage routes to independent products without a first-then promise", () => {
  assert.equal(homepage.hero.eyebrow, "AI VISIBILITY + AI AUTOMATION");
  assert.equal(homepage.hero.headline, "AI for how customers find you — and how your business runs.");
  assert.equal(homepage.company.doors.length, 2);
  assert.equal(homepage.company.principles.length, 4);
  assert.match(homepage.company.heroDescriptions[0], /competitors.*sources.*improve/);
  assert.match(homepage.company.heroDescriptions[1], /workflows/);
  for (const door of homepage.company.doors) assert.equal(door.outcomes.length, 4);
  assert.doesNotMatch(JSON.stringify(homepage.company), /Trusted by|first Visibility.*then Automation/i);
  assert.doesNotMatch(JSON.stringify(homepage.company), /Hospitality & Experience focus/i);
  assert.match(homepage.company.heroDescriptions[0], /sources support those answers/);
  assert.match(homepage.company.doors[0]?.audience ?? "", /Hotels.*Experience/);
  assert.doesNotMatch(homepage.company.doors[1]?.audience ?? "", /Hotels|Hospitality/i);
});
