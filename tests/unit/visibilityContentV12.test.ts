import { test } from "node:test";
import { appFile } from "./appRoutePath";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { visibilityContentEn } from "@/lib/visibility/content.en";
import { visibilityContentRu } from "@/lib/visibility/content.ru";
import { getSampleReport } from "@/lib/visibility/sample-report-data";
import { visibilityRoutes } from "@/lib/visibility/routes";
import { BUSINESS_MODELS, PRIMARY_ACTIONS, inferLocalBusinessMode } from "@/lib/visibility/measurement";
import { homepage } from "@/lib/data/homepage";
import { ruHomepage } from "@/lib/data/homepage-ru";

const LOCALES = [
  { name: "en", content: visibilityContentEn, routes: visibilityRoutes.en },
  { name: "ru", content: visibilityContentRu, routes: visibilityRoutes.ru },
] as const;

/** TZ L.2 — homepage primary CTA points at the locale-correct /check route. */
test("homepage primary CTA targets the locale-correct check route", () => {
  assert.equal(visibilityContentEn.homeTeaser.primaryCta.href, visibilityRoutes.en.check);
  assert.equal(visibilityContentRu.homeTeaser.primaryCta.href, visibilityRoutes.ru.check);
});

/** TZ C — exact required primary CTA labels. */
test("primary CTA labels match the binding owner copy", () => {
  assert.equal(visibilityContentEn.homeTeaser.primaryCta.label, "Run Free Visibility Check");
  assert.equal(visibilityContentRu.homeTeaser.primaryCta.label, "Проверить видимость бесплатно");
});

/** RC6 catalog — the homepage secondary CTA opens the locale-correct plans. */
test("secondary CTA routes to the current AI Visibility catalog", () => {
  assert.equal(visibilityContentEn.homeTeaser.secondaryCta.href, visibilityRoutes.en.pricing);
  assert.equal(visibilityContentRu.homeTeaser.secondaryCta.href, visibilityRoutes.ru.pricing);
  assert.match(visibilityContentEn.homeTeaser.secondaryCta.label, /plans/i);
  assert.match(visibilityContentRu.homeTeaser.secondaryCta.label, /тариф/i);
});

/** TZ decision 11 — four measurement layers, in both locales. */
test("all four measurement layers are defined in both locales", () => {
  const expected = ["discoverability", "understanding", "recommendation_evidence", "action_readiness"];
  for (const { name, content } of LOCALES) {
    assert.deepEqual(
      content.measurementLayers.layers.map((l) => l.id),
      expected,
      `${name} measurement layers`,
    );
  }
});

/** TZ decision 12 / L.12 — the three Action Readiness states stay separate. */
test("Action Readiness exposes exactly three distinct states in both locales", () => {
  const expected = ["human_ready", "machine_readable", "agent_executable"];
  for (const { name, content } of LOCALES) {
    assert.deepEqual(
      content.actionReadiness.states.map((s) => s.id),
      expected,
      `${name} action readiness states`,
    );
    for (const state of content.actionReadiness.states) {
      assert.ok(state.doesNotProve.length > 0, `${name}/${state.id} must state what it does not prove`);
    }
  }
});

/** TZ decision 13 / L.13 — a WhatsApp or button link is never called agent-executable. */
test("sample report does not label a contact link as agent-executable", () => {
  for (const locale of ["en", "ru"] as const) {
    const report = getSampleReport(locale);
    const agent = report.actionReadiness.states.find((s) => s.id === "agent_executable");
    assert.ok(agent, "agent_executable state must exist");
    // The sample deliberately fails this state; the point is that human-ready
    // passing must never be enough to mark agent-executable as met.
    const human = report.actionReadiness.states.find((s) => s.id === "human_ready");
    assert.equal(human?.state, "pass");
    assert.notEqual(agent?.state, "pass", "human-ready must not imply agent-executable");
    assert.match(report.actionReadiness.agentCaveat, /WhatsApp/i);
  }
});

/** TZ E — every value in the sample report is tagged as sample, never observed. */
test("every sample-report datum is tagged sourceStatus 'sample'", () => {
  for (const locale of ["en", "ru"] as const) {
    const report = getSampleReport(locale);
    assert.equal(report.identity.sourceStatus, "sample");
    for (const section of [report.discoverability, report.understanding]) {
      for (const row of section.rows) {
        assert.equal(row.sourceStatus, "sample", `${locale} ${section.title} ${row.label}`);
      }
    }
    for (const ratio of report.recommendationEvidence.ratios) {
      assert.equal(ratio.sourceStatus, "sample");
    }
    for (const state of report.actionReadiness.states) {
      assert.equal(state.sourceStatus, "sample");
    }
    for (const step of report.actionReadiness.timeline) {
      assert.equal(step.sourceStatus, "sample");
    }
  }
});

/** TZ E.5 — the action path timeline has all six ordered steps. */
test("action path timeline contains the six required steps in order", () => {
  const expected = [
    "discovery",
    "business_understood",
    "primary_action_found",
    "action_understandable",
    "action_completable",
    "confirmation_detected",
  ];
  for (const locale of ["en", "ru"] as const) {
    assert.deepEqual(
      getSampleReport(locale).actionReadiness.timeline.map((s) => s.id),
      expected,
    );
  }
});

/** TZ E.4 — recommendation evidence is ratios, not a score. */
test("recommendation evidence is reported as X/Y ratios with a denominator", () => {
  for (const locale of ["en", "ru"] as const) {
    const ratios = getSampleReport(locale).recommendationEvidence.ratios;
    assert.ok(ratios.length >= 3);
    for (const ratio of ratios) {
      assert.ok(ratio.total > 0, "every ratio needs a denominator");
      assert.ok(ratio.matched <= ratio.total, "matched can never exceed the denominator");
    }
  }
});

/**
 * TZ D, revised for the live check.
 *
 * The V1.2 intake asked for eight fields because a human was going to read
 * the brief. The check now runs on the page, so the form asks only for what
 * the check itself consumes. URL is the only required input; profile and
 * customer action are optional applicability context.
 */
test("check form asks only for what the live check needs, with every action labelled", () => {
  for (const { name, content } of LOCALES) {
    const f = content.checkForm.fields;
    for (const key of [
      "website",
      "websiteHint",
      "siteProfile",
      "siteProfileHint",
      "primaryAction",
      "primaryActionHint",
    ] as const) {
      assert.ok(f[key] && f[key].length > 0, `${name} field ${key}`);
    }
    for (const action of PRIMARY_ACTIONS) {
      assert.ok(content.checkForm.primaryActionOptions[action], `${name} primary action ${action}`);
    }
    assert.deepEqual(Object.keys(content.checkForm.profileOptions), [
      "all_checks",
      "content_site",
      "api_application",
      "commerce",
    ]);
    assert.ok(content.checkForm.whatYouGet.items.length >= 3, `${name} must state what is delivered`);
  }
  assert.equal(BUSINESS_MODELS.length, 6);
  assert.equal(PRIMARY_ACTIONS.length, 9);
});

test("the check form has concise task copy instead of repeating the page hero", () => {
  for (const { name, content } of LOCALES) {
    assert.ok(content.checkForm.formTitle.length > 0, `${name} form title`);
    assert.ok(content.checkForm.formIntro.length > 0, `${name} form intro`);
    assert.notEqual(content.checkForm.formTitle, content.checkForm.title);
    assert.notEqual(content.checkForm.formIntro, content.checkForm.intro);
  }
});

/** TZ decision 14 — Local Business Mode is inferred, and is a mode not a scanner. */
test("Local Business Mode is inferred for local and hospitality models only", () => {
  assert.equal(inferLocalBusinessMode("local_business"), true);
  assert.equal(inferLocalBusinessMode("hospitality"), true);
  assert.equal(inferLocalBusinessMode("saas"), false);
  assert.equal(inferLocalBusinessMode("ecommerce"), false);
  for (const { name, content } of LOCALES) {
    assert.ok(content.localBusinessMode.boundary.length > 0, `${name} needs an explicit boundary`);
    assert.match(
      content.localBusinessMode.boundary,
      /Google/i,
      `${name} boundary must say no Google/Maps integration exists`,
    );
  }
});

/** RC6 v1.2 — the free result is a readiness product, not a partial AI measurement. */
test("the live report keeps observed AI Visibility outside the free result", () => {
  for (const { name, content } of LOCALES) {
    assert.equal(content.liveReport.layerTitles.recommendation_evidence, undefined);
    assert.ok(content.liveReport.notMeasuredLabel.length > 0, `${name} needs a not-measured label`);
    assert.ok(content.liveReport.readinessDisclaimer.length > 0, `${name} needs the readiness boundary`);
    assert.match(content.liveReport.layersIntro, /separate|отдельн/i);
  }
  assert.match(visibilityContentEn.liveReport.readinessDisclaimer, /not observed AI visibility/i);
  assert.match(visibilityContentRu.liveReport.readinessDisclaimer, /не наблюдаемая AI-видимость/i);
});

/** RC6 owner catalog lock — pricing and delivery boundaries match exactly. */
test("pricing shows exactly the approved RC6 four-plan catalog", () => {
  for (const { name, content } of LOCALES) {
    const allPlans = content.pricing.tracks.flatMap((t) => t.plans);
    assert.deepEqual(
      allPlans.map((plan) => plan.name),
      ["AI Visibility Snapshot", "AI Visibility Landscape", "Expert Verified", "Implementation + 90 days"],
      `${name} plan names`,
    );
    const prices = allPlans.map((plan) => plan.price).join(" | ");
    assert.match(prices, /\$49\/(month|месяц)/, `${name} must show AI Visibility Snapshot`);
    assert.match(prices, /\$79\/(month|месяц)/, `${name} must show AI Visibility Landscape`);
    assert.match(prices, /\$399 (one-time|разово)/, `${name} must show Expert Verified`);
    assert.match(prices, /\$2[ ,]490/, `${name} must show Implementation + 90 days`);

    assert.match(allPlans[0].volumeLabel, /300/);
    assert.match(allPlans[1].volumeLabel, /800/);
    assert.match(allPlans[2].volumeLabel, /800/);
    assert.match(allPlans[3].volumeLabel, /(Custom|Индивидуальный)/);
    assert.ok(allPlans.every((plan) => plan.progressionLabel.length > 0), `${name} needs plan progression copy`);
    assert.equal(allPlans[1].featured, true);
    assert.notEqual(allPlans[0].status, "active", "self-service checkout must remain closed");
    assert.notEqual(allPlans[1].status, "active", "self-service checkout must remain closed");
    assert.notEqual(allPlans[2].status, "active", "self-service checkout must remain closed");
    assert.match(content.pricing.disclosure, /Selena Systems LLC/);
  }
});

test("pricing separates one free readiness entry from the four paid Visibility plans", () => {
  for (const { name, content } of LOCALES) {
    const allPlans = content.pricing.tracks.flatMap((track) => track.plans);
    assert.equal(allPlans.length, 4, `${name} paid Visibility plan count`);
    assert.equal(content.pricing.freePlan.features.length, 4, `${name} free scope must be explicit`);
    assert.match(content.pricing.freePlan.boundary, /0 .*provider|0 платн/i);
    assert.ok(!allPlans.some((plan) => /Free|Бесплат/i.test(plan.price)), `${name} Free must stay outside paid cards`);
    assert.match(content.pricing.directory.visibility.count, /1 .*free|1 бесплат/i);
    assert.match(content.pricing.directory.visibility.count, /4 .*paid|4 платн/i);
    assert.match(content.pricing.directory.systems.count, /4 /);
  }
});

test("the global pricing page keeps four Visibility offers separate from four AI Systems services", () => {
  for (const [name, content] of [["en", homepage], ["ru", ruHomepage]] as const) {
    assert.equal(content.strategyCall.price, "$100", `${name} mini-audit price`);
    assert.equal(content.packages.length, 3, `${name} AI Systems package count after mini-audit`);
    assert.deepEqual(
      content.packages.map((item) => item.price),
      name === "en" ? ["$500", "$4,500", "from $10,000"] : ["$500", "$4,500", "от $10,000"],
    );
    assert.equal(content.productPaths.visibility.name, "AI Visibility");
    assert.equal(content.productPaths.systems.name, "AI Automation");
    assert.equal(content.productPaths.visibility.items.length, 5, `${name} Visibility ladder count`);
    assert.equal(content.productPaths.systems.items.length, 4, `${name} AI Systems service count`);
    assert.deepEqual(
      content.productPaths.visibility.items.map((item) => item.price),
      name === "en"
        ? ["Free", "$49/mo", "$79/mo", "$399", "$2,490"]
        : ["Бесплатно", "$49/мес", "$79/мес", "$399", "$2,490"],
    );
  }

  const pricingComponent = executableSource("components/visibility/PricingTracks.tsx");
  assert.match(
    pricingComponent,
    /freeEntry,\s*\.\.\.content\.tracks/,
    "the free entry and all four paid plans must be compared in one place",
  );
  for (const route of ["app/pricing/page.tsx", "app/ru/pricing/page.tsx"]) {
    const source = executableSource(route);
    assert.match(source, /PricingDirectory/);
    assert.match(source, /PackagesSection/);
  }
});

/** Historical Visibility offers must not leak into the new RC6 catalog. */
test("legacy Monitor, Audit, Sprint and Business OS plans are absent from RC6 pricing", () => {
  for (const { name, content } of LOCALES) {
    const plans = content.pricing.tracks.flatMap((track) => track.plans);
    const serialized = JSON.stringify(plans);
    for (const banned of ["Monitor", "AI Audit", "AI Sprint", "AI Business OS", "$9/month", "$500", "$4,000"]) {
      assert.ok(!serialized.includes(banned), `${name} pricing still contains ${banned}`);
    }
  }
});

/** TZ L.10 + decision 3 — no regional provider claims in active product copy. */
test("no Yandex/Topvisor/Alice references in active visibility copy or sample reports", () => {
  const banned = /yandex|яндекс|topvisor|топвизор|alice ai|алиса/i;
  for (const { name, content } of LOCALES) {
    assert.ok(!banned.test(JSON.stringify(content)), `${name} visibility content mentions a regional provider`);
  }
  for (const locale of ["en", "ru"] as const) {
    assert.ok(
      !banned.test(JSON.stringify(getSampleReport(locale))),
      `${locale} sample report mentions a regional provider`,
    );
  }
});

/** TZ decision 20 + L — llms.txt is never described as a ranking factor. */
test("llms.txt is described as zero-weight, never as a ranking factor", () => {
  for (const locale of ["en", "ru"] as const) {
    const report = getSampleReport(locale);
    const row = report.discoverability.rows.find((r) => /llms\.txt/i.test(r.label));
    assert.ok(row, `${locale} sample should mention llms.txt`);
    assert.equal(row?.state, "info", "llms.txt must be informational, never pass/fail");
  }
  assert.match(visibilityContentEn.notClaimed.items.join(" "), /llms\.txt/i);
  assert.match(visibilityContentRu.notClaimed.items.join(" "), /llms\.txt/i);
});

/**
 * Sections whose entire purpose is to negate a claim ("we do NOT do X")
 * legitimately contain the banned phrases in negated form. Scanning them
 * for the raw phrase would fail the honest copy and pass the dishonest
 * copy, so they are excluded and asserted separately below.
 */
function promotionalCopy(content: typeof visibilityContentEn): string {
  const { notClaimed, ...rest } = content;
  void notClaimed;
  return JSON.stringify(rest);
}

/** TZ decision 19 — no revenue-loss estimate is ever asserted as a finding. */
test("no revenue-loss estimate is asserted in any visibility copy", () => {
  const revenueClaim = /(you are|вы) (are )?losing|теряете \$|losing \$\d|потерянн\w+ выручк\w+ составля/i;
  for (const { name, content } of LOCALES) {
    assert.ok(!revenueClaim.test(promotionalCopy(content)), `${name} asserts a revenue-loss estimate`);
  }
  // And the disclaimer explicitly refusing to estimate revenue must exist.
  assert.match(visibilityContentEn.notClaimed.items.join(" "), /does not estimate lost revenue/i);
  assert.match(visibilityContentRu.notClaimed.items.join(" "), /не оценивает потерянную выручку/i);
});

/** TZ C — forbidden marketing phrases must never be asserted as promises. */
test("forbidden marketing phrases are absent from promotional copy", () => {
  const forbidden = [
    /what ai thinks about your business/i,
    /guaranteed (ai )?(ranking|citation)/i,
    /get cited by chatgpt/i,
    /complete ai visibility/i,
  ];
  const haystack = [
    promotionalCopy(visibilityContentEn),
    promotionalCopy(visibilityContentRu),
    JSON.stringify(getSampleReport("en")),
    JSON.stringify(getSampleReport("ru")),
  ].join(" ");
  for (const pattern of forbidden) {
    assert.ok(!pattern.test(haystack), `forbidden phrase asserted as a promise: ${pattern}`);
  }
  // The negated forms belong in notClaimed and must actually be there.
  assert.match(visibilityContentEn.notClaimed.items.join(" "), /does not claim complete AI visibility/i);
});

/** Master Correction — legacy report/sample surfaces are retired and absent from the sitemap. */
test("legacy report surfaces are retired and absent from the sitemap", () => {
  for (const path of ["app/report/sample/page.tsx", "app/ru/report/sample/page.tsx"]) {
    const source = readFileSync(appFile(path), "utf8");
    assert.match(source, /notFound\(\)/, `${path} must be a retired tombstone`);
  }
  const sitemap = readFileSync(join(process.cwd(), "app/sitemap.ts"), "utf8");
  assert.ok(!/\/report/.test(sitemap), "sitemap must not include any /report route");
});

/** Strips comments so source assertions test executable code, not prose about it. */
function executableSource(relativePath: string): string {
  return readFileSync(appFile(relativePath), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

/**
 * The result the form shows must come from a real check of the submitted
 * site — never from a timer, and never from stored sample data.
 *
 * The earlier version of this test forbade a network request entirely,
 * because at the time there was nothing to request and any call would have
 * been theatre. The check is now real, so the rule inverts: the form MUST
 * call the check endpoint, and must still not fake elapsed time or invent
 * progress it cannot observe. See Decision Log DOC-021.
 */
test("check form runs a real check and simulates nothing", () => {
  const source = executableSource("components/visibility/VisibilityCheckForm.tsx");
  assert.match(source, /fetch\("\/api\/checks"/, "form must call the live check endpoint");
  assert.ok(!/setTimeout|setInterval/.test(source), "form must not simulate elapsed scan time");
  assert.ok(!/percent|Math\.random/i.test(source), "form must not invent progress it cannot observe");
  assert.ok(
    !/getSampleReport|sample-report-data/.test(source),
    "the free result must never be backed by sample data",
  );
});

/** Public Readiness must be complete before any lead-capture decision. */
test("check form requires only the URL and has no contact, consent, login or payment gate", () => {
  const source = executableSource("components/visibility/VisibilityCheckForm.tsx");
  assert.match(source, /name="website"[\s\S]{0,240}required/, "URL must remain required");
  assert.ok(!/name="contact"|name="consent"|submitLead|type="tel"/.test(source));
  assert.ok(!/auth|checkout|payment/i.test(JSON.stringify(LOCALES.map(({ content }) => content.checkForm))));
});

/** The promise made before submitting must be the promise kept after it. */
test("form copy promises an on-page result, not a review that arrives later", () => {
  assert.match(visibilityContentEn.checkForm.intro, /appear here/i);
  assert.match(visibilityContentRu.checkForm.intro, /появятся здесь/i);

  // And it must not resurrect the manual-review promise it replaced.
  for (const { name, content } of LOCALES) {
    const serialized = JSON.stringify(content.checkForm);
    assert.ok(!/by hand|вручную|руками/i.test(serialized), `${name} still promises a manual review`);
  }
});

/** RC6 Public Readiness boundary — Free never promises or exposes an AI sample. */
test("free surfaces contain no limited AI sample", () => {
  for (const { name, content } of LOCALES) {
    const freeCopy = JSON.stringify({
      homeTeaser: content.homeTeaser,
      checkForm: content.checkForm,
      liveReport: content.liveReport,
      boundary: content.freeMeasurementBoundary,
    });
    assert.ok(
      !/limited.{0,40}(ai|dated)|ai.{0,20}sample|ограниченн.{0,40}(ai|выборк)/i.test(freeCopy),
      `${name} Free copy still promises an AI sample`,
    );
    assert.match(
      content.homeTeaser.intro,
      name === "en" ? /No paid AI-answer providers are called/i : /Платные провайдеры AI-ответов не вызываются/i,
    );
  }

  const statusRoute = executableSource("app/api/checks/[id]/status/route.ts");
  assert.ok(!/ai_sampling|ai_sample/i.test(statusRoute), "Free status contract still exposes AI sampling");
  assert.match(statusRoute, /citability/, "Free status contract must expose citability");
});

/** The historical mocked AI report cannot be re-enabled by configuration. */
test("legacy mocked AI reports stay permanently disabled", () => {
  const flags = executableSource("lib/diagnostics/flags.ts");
  assert.match(flags, /isLegacyMockReportEnabled/);
  assert.match(flags, /return false/);

  for (const route of [
    "app/report/[token]/page.tsx",
    "app/ru/report/[token]/page.tsx",
    "app/api/reports/[token]/route.ts",
    "app/api/reports/[token]/summary/route.ts",
    "app/api/reports/[token]/unlock/route.ts",
  ]) {
    assert.match(executableSource(route), /REPORT_RETIRED|notFound\(\)/, `${route} must be retired`);
  }
});

/** Every finding must carry a concrete fix, in both locales. */
test("live report copy labels both the fix and its honest limit", () => {
  for (const { name, content } of LOCALES) {
    assert.ok(content.liveReport.howToFixLabel.length > 0, `${name} how-to-fix label`);
    assert.ok(content.liveReport.doesNotProveLabel.length > 0, `${name} does-not-prove label`);
    assert.ok(content.liveReport.unreachable.body.length > 0, `${name} unreachable explanation`);
  }
  // A failed check must not read as a verdict on the visitor's site.
  assert.match(visibilityContentEn.liveReport.errors.generic, /not yours/i);
  assert.match(visibilityContentRu.liveReport.errors.generic, /не на вашей/i);
});

test("the readiness endpoint accepts optional context without any lead-capture dependency", () => {
  const route = executableSource("app/api/checks/route.ts");
  assert.match(route, /record\.siteProfile/);
  assert.match(route, /record\.primaryAction/);
  assert.ok(!/record\.contact|record\.consent|submitLead/.test(route));
});

/** TZ E — the sample report page collects no email either. */
test("sample report components collect no email", () => {
  const dir = join(process.cwd(), "components/visibility");
  const sampleSources = ["SampleReport.tsx", "EvidenceList.tsx", "ActionReadinessCard.tsx", "ActionPathTimeline.tsx"]
    .map((f) => readFileSync(join(dir, f), "utf8"))
    .join("\n");
  assert.ok(!/type="email"/.test(sampleSources));
  assert.ok(!/fetch\(/.test(sampleSources));
});

/** Basic hygiene: every visibility page declares its own metadata. */
test("every visibility route declares unique title metadata", () => {
  const routes = [
    "app/visibility/page.tsx",
    "app/ru/visibility/page.tsx",
    "app/check/page.tsx",
    "app/ru/check/page.tsx",
    "app/methodology/page.tsx",
    "app/ru/methodology/page.tsx",
    "app/pricing/page.tsx",
    "app/ru/pricing/page.tsx",
  ];
  const titles = new Set<string>();
  for (const route of routes) {
    const source = readFileSync(appFile(route), "utf8");
    const match = source.match(/title:\s*"([^"]+)"/);
    assert.ok(match, `${route} must declare a title`);
    const title = match![1];
    assert.ok(!titles.has(title), `duplicate title "${title}" in ${route}`);
    titles.add(title);
  }
});

/** Master Correction — old AI Map is no longer a second public product entry. */
test("legacy /ru/ai-map route remains as a canonical redirect tombstone", () => {
  const path = appFile("app/ru/ai-map/page.tsx");
  const source = readFileSync(path, "utf8");
  assert.match(source, /(?:redirect|permanentRedirect)\(/, "/ru/ai-map must redirect to the canonical product path");
  assert.ok(!readFileSync(join(process.cwd(), "app/sitemap.ts"), "utf8").includes('path: "/ru/ai-map"'));
});
