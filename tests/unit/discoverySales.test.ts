import assert from "node:assert/strict";
import test from "node:test";
import { discoverySales, discoveryTracks, discoveryLinks, auditTerms, discoveryDecisionSteps, discoveryPlanOutcomes } from "@/lib/visibility/sales";
import { visibilityActivation } from "@/lib/visibility/activation";
import { CLIENT_PORTAL_ENABLED, visibilityLanguages } from "@/lib/visibility/routes";
import { buildAiVisibilityStructuredData } from "@/lib/structured-data";
import { homepage } from "@/lib/data/homepage";
import { visibilityContentEn } from "@/lib/visibility/content.en";

const [snapshot, landscape, audit, managed] = discoveryTracks("en").flatMap((track) => track.plans);

test("FREE is Public Readiness, with an explicit no-measurement boundary", () => {
  assert.equal(discoveryLinks.free, "/check");
  assert.equal(homepage.productPaths.visibility.primaryCta.href, "/check");
  assert.match(discoverySales.free.boundary, /Public Readiness is not an AI visibility measurement/);
  assert.doesNotMatch(discoveryLinks.free, /free-ai-visibility/);
});

test("Snapshot includes three consumer surfaces, competitors, answers and sources", () => {
  const text = JSON.stringify(snapshot);
  for (const term of ["ChatGPT", "Gemini", "Perplexity", "competitors", "sources", "Answers", "positions", "25"])
    assert.ok(text.includes(term), term);
  assert.doesNotMatch(snapshot.systemsLabel, /Claude|DeepSeek/);
});

test("Full Discovery adds separate API classes and qualified Local Discovery", () => {
  const text = JSON.stringify(landscape);
  for (const term of [
    "Claude",
    "DeepSeek",
    "Qwen",
    "Mistral",
    "Grok",
    "Google Maps",
    "Local Visibility",
    "Visitor View",
    "API / Model Landscape",
  ])
    assert.ok(text.includes(term), term);
  assert.match(text, /where.*verified/);
  assert.match(text, /API output is not the consumer experience/);
});

test("manual Ask Maps belongs to human work, never the automated subscriptions", () => {
  assert.equal(visibilityActivation.localAi, "MANUAL_ONLY");
  for (const locale of ["en", "ru"] as const) {
    const [basic, expanded, human, execution] = discoveryTracks(locale).flatMap(track => track.plans);
    assert.doesNotMatch(JSON.stringify([basic, expanded]), /Ask Maps|Local AI/);
    assert.match(expanded.features.join(" "), /automated measurement is verified|автоматическим production-замером/);
    assert.match(human.features.join(" "), /manual Google Ask Maps|Ручное исследование Google Ask Maps/i);
    assert.match(execution.features.join(" "), /only where agreed in scope|только в согласованном объёме/);
  }
  assert.doesNotMatch(JSON.stringify(discoveryPlanOutcomes), /Ask Maps|Local AI/);
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

test("every paid offer has a manual or early-access destination; known staging portal is blocked", () => {
  for (const locale of ["en", "ru"] as const) {
    for (const plan of discoveryTracks(locale).flatMap((track) => track.plans)) {
      assert.match(plan.href!, /\/visibility#(early-access|audit-order|managed-application)$/);
      assert.ok(plan.ctaLabel);
      assert.doesNotMatch(plan.href!, /staging|app\.selenasystems/);
    }
  }
  assert.equal(CLIENT_PORTAL_ENABLED, false);
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
  assert.equal(landscape.progressionLabel, "AI + LOCAL → COMPETITORS → SOURCES → OPPORTUNITIES → NEXT ACTION");
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
