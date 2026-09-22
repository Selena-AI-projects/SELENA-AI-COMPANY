import { NextRequest, NextResponse } from "next/server";
import { generateExplanation, type ExplanationCallRecord } from "@/lib/visibility/explanation/generate";
import { getRecommendation } from "@/lib/visibility/checks/recommendations";
import type { ConfirmedFinding, ExplanationInput } from "@/lib/visibility/explanation/contract";
import type { SiteProfile, VisibilityLocale } from "@/lib/visibility/types";
import type { PrimaryAction } from "@/lib/visibility/measurement";

export const runtime = "nodejs";
export const maxDuration = 90;

/**
 * §8.2 staging acceptance (docs/visibility/SELENA_VISIBILITY_PERSONALIZED_DIAGNOSIS_DISCOVERY_V1.md):
 * a controlled smoke run against the real provider, without turning the
 * public `VISIBILITY_PERSONALIZED_EXPLANATION_ENABLED` flag on in
 * production — the owner explicitly withheld that permission for Phase 2.
 * This route calls `generateExplanation()` directly, gated by its own
 * one-off secret rather than the public experiment flag, so the public
 * gate order in `resolveExplanation.ts` is untouched and never exercised
 * here.
 *
 * Delete this route (and `EXPLANATION_SMOKE_TEST_SECRET`) once the run is
 * recorded in the discovery doc. It exists only for that one measurement.
 */

const PRICE_PER_TOKEN_USD = {
  // UNVERIFIED ESTIMATE — cross-checked across several non-primary pricing
  // trackers on 2026-09-22, not confirmed against the OpenAI billing
  // console (platform.openai.com is blocked from the dev environment).
  input: 0.25 / 1_000_000,
  output: 2.0 / 1_000_000,
};

interface SmokeCase {
  label: string;
  locale: VisibilityLocale;
  siteProfile: SiteProfile;
  primaryAction: PrimaryAction;
  ruleIds: string[];
}

// 24 cases: every siteProfile and most primaryAction values appear more
// than once, both locales are covered (the ru cases are the non-Latin
// content the spec asks for), severities span critical/important/later,
// and two cases carry zero findings to exercise the free no-call path.
const SMOKE_TEST_CASES: SmokeCase[] = [
  { label: "en/all_checks/call — 1 critical", locale: "en", siteProfile: "all_checks", primaryAction: "call", ruleIds: ["access.fetchable"] },
  { label: "en/all_checks/book — 3 mixed severity", locale: "en", siteProfile: "all_checks", primaryAction: "book", ruleIds: ["identity.facts_agree", "access.noindex", "access.cacheable"] },
  { label: "en/content_site/whatsapp — 1 important", locale: "en", siteProfile: "content_site", primaryAction: "whatsapp", ruleIds: ["access.robots_unambiguous"] },
  { label: "en/content_site/order — 5 findings", locale: "en", siteProfile: "content_site", primaryAction: "order", ruleIds: ["identity.author_named", "identity.dated", "identity.same_as", "offer.comparison_readable", "access.canonical"] },
  { label: "en/api_application/request_quote — 1 critical", locale: "en", siteProfile: "api_application", primaryAction: "request_quote", ruleIds: ["action.human_ready"] },
  { label: "en/api_application/schedule_demo — 2 findings", locale: "en", siteProfile: "api_application", primaryAction: "schedule_demo", ruleIds: ["action.machine_readable", "action.agent_executable"] },
  { label: "en/commerce/apply — 1 later", locale: "en", siteProfile: "commerce", primaryAction: "apply", ruleIds: ["access.sitemap_discovered"] },
  { label: "en/commerce/visit — 3 findings", locale: "en", siteProfile: "commerce", primaryAction: "visit", ruleIds: ["offer.title_present", "offer.single_h1", "offer.service_page_discovered"] },
  { label: "en/all_checks/other — 0 findings (free path)", locale: "en", siteProfile: "all_checks", primaryAction: "other", ruleIds: [] },
  { label: "en/content_site/call — 1 critical", locale: "en", siteProfile: "content_site", primaryAction: "call", ruleIds: ["identity.brand_name_consistent"] },
  { label: "en/api_application/whatsapp — 1 important", locale: "en", siteProfile: "api_application", primaryAction: "whatsapp", ruleIds: ["citability.block"] },
  { label: "en/commerce/book — 4 findings", locale: "en", siteProfile: "commerce", primaryAction: "book", ruleIds: ["conversion.contact_path_present", "conversion.about_page_discovered", "business.consistency", "crawler.access"] },
  { label: "en/all_checks/book — already-clear title (empty-string case)", locale: "en", siteProfile: "all_checks", primaryAction: "book", ruleIds: ["access.viewport"] },
  { label: "en/content_site/whatsapp — 1 critical", locale: "en", siteProfile: "content_site", primaryAction: "whatsapp", ruleIds: ["offer.service_page_discovered"] },
  { label: "en/commerce/request_quote — 4 mixed severity", locale: "en", siteProfile: "commerce", primaryAction: "request_quote", ruleIds: ["content.readiness", "business.consistency", "identity.jsonld_valid", "identity.jsonld_entity_present"] },
  { label: "ru/all_checks/call — 1 critical (non-Latin)", locale: "ru", siteProfile: "all_checks", primaryAction: "call", ruleIds: ["access.fetchable"] },
  { label: "ru/content_site/order — 3 mixed severity", locale: "ru", siteProfile: "content_site", primaryAction: "order", ruleIds: ["identity.facts_agree", "access.noindex", "identity.dated"] },
  { label: "ru/api_application/request_quote — 1 important", locale: "ru", siteProfile: "api_application", primaryAction: "request_quote", ruleIds: ["access.robots_unambiguous"] },
  { label: "ru/commerce/whatsapp — 5 findings", locale: "ru", siteProfile: "commerce", primaryAction: "whatsapp", ruleIds: ["identity.author_named", "identity.same_as", "offer.comparison_readable", "access.canonical", "access.viewport"] },
  { label: "ru/all_checks/schedule_demo — 1 critical", locale: "ru", siteProfile: "all_checks", primaryAction: "schedule_demo", ruleIds: ["action.human_ready"] },
  { label: "ru/content_site/apply — 0 findings (free path)", locale: "ru", siteProfile: "content_site", primaryAction: "apply", ruleIds: [] },
  { label: "ru/api_application/visit — 2 findings", locale: "ru", siteProfile: "api_application", primaryAction: "visit", ruleIds: ["action.machine_readable", "action.agent_executable"] },
  { label: "ru/commerce/other — 1 later", locale: "ru", siteProfile: "commerce", primaryAction: "other", ruleIds: ["access.sitemap_discovered"] },
  { label: "ru/api_application/call — 1 critical", locale: "ru", siteProfile: "api_application", primaryAction: "call", ruleIds: ["crawler.access"] },
];

function isAuthorized(req: NextRequest): boolean {
  const configured = process.env.EXPLANATION_SMOKE_TEST_SECRET;
  if (!configured) return false;
  const provided = req.headers.get("x-smoke-test-secret") ?? req.nextUrl.searchParams.get("token");
  return typeof provided === "string" && provided.length > 0 && provided === configured;
}

function buildFindings(ruleIds: string[], locale: VisibilityLocale): ConfirmedFinding[] {
  return ruleIds.map((ruleId, index) => {
    const rec = getRecommendation(ruleId, locale);
    if (!rec) throw new Error(`smoke test fixture references an unknown rule id: ${ruleId}`);
    return {
      id: `${ruleId}:smoke-test:${index}`,
      severity: rec.severity,
      title: rec.title,
      action: rec.action,
      doesNotProve: rec.doesNotProve,
    };
  });
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

interface CaseResult {
  label: string;
  findingsSupplied: number;
  findingsExplained: number;
  calledProvider: boolean;
  success: boolean;
  failureReason: string | null;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  samplePreview: string | null;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return new NextResponse(null, { status: 404 });
  }

  const startedAt = Date.now();

  const results = await mapWithConcurrency(SMOKE_TEST_CASES, 5, async (testCase): Promise<CaseResult> => {
    const findings = buildFindings(testCase.ruleIds, testCase.locale);
    const input: ExplanationInput = {
      locale: testCase.locale,
      businessContext: { siteProfile: testCase.siteProfile, primaryAction: testCase.primaryAction },
      findings,
    };

    const captured: { record: ExplanationCallRecord | null } = { record: null };
    const output = await generateExplanation(input, {
      onCall: (r) => {
        captured.record = r;
      },
    });
    const record = captured.record;

    return {
      label: testCase.label,
      findingsSupplied: findings.length,
      findingsExplained: output?.findingExplanations.length ?? 0,
      calledProvider: findings.length > 0,
      success: record?.success ?? false,
      failureReason: record?.failureReason ?? (findings.length === 0 ? "no_findings_no_call" : "no_record"),
      latencyMs: record?.latencyMs ?? 0,
      inputTokens: record?.inputTokens ?? 0,
      outputTokens: record?.outputTokens ?? 0,
      samplePreview: output?.findingExplanations[0]?.explanation ?? null,
    };
  });

  const attempted = results.filter((r) => r.calledProvider);
  const succeeded = attempted.filter((r) => r.success);
  const latencies = attempted.map((r) => r.latencyMs);
  const inputTokenCounts = attempted.map((r) => r.inputTokens);
  const outputTokenCounts = attempted.map((r) => r.outputTokens);
  const totalInputTokens = inputTokenCounts.reduce((a, b) => a + b, 0);
  const totalOutputTokens = outputTokenCounts.reduce((a, b) => a + b, 0);
  const totalCostUsd = totalInputTokens * PRICE_PER_TOKEN_USD.input + totalOutputTokens * PRICE_PER_TOKEN_USD.output;
  const avgCostPerCallUsd = attempted.length > 0 ? totalCostUsd / attempted.length : 0;
  const schemaSuccessRate = attempted.length > 0 ? succeeded.length / attempted.length : null;

  const failureReasons = attempted
    .filter((r) => !r.success)
    .reduce<Record<string, number>>((acc, r) => {
      const key = r.failureReason ?? "unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

  const summary =
    `${succeeded.length}/${attempted.length} provider calls succeeded ` +
    `(${schemaSuccessRate !== null ? Math.round(schemaSuccessRate * 100) : 0}% schema success rate). ` +
    `p50 latency ${percentile(latencies, 50)}ms, p95 ${percentile(latencies, 95)}ms. ` +
    `Estimated cost for this run: $${totalCostUsd.toFixed(4)}. ` +
    `Projected cost / 1,000 explanations: $${(avgCostPerCallUsd * 1000).toFixed(2)} (UNVERIFIED ESTIMATE — ` +
    `public pricing trackers, not the OpenAI billing console).`;

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      model: process.env.VISIBILITY_EXPLANATION_MODEL?.trim() || "gpt-5-mini",
      wallMs: Date.now() - startedAt,
      summary,
      aggregate: {
        casesTotal: SMOKE_TEST_CASES.length,
        casesCalledProvider: attempted.length,
        casesSkippedNoFindings: SMOKE_TEST_CASES.length - attempted.length,
        schemaSuccessRate,
        fallbackRate: attempted.length > 0 ? (attempted.length - succeeded.length) / attempted.length : null,
        failureReasons,
        latencyMsP50: percentile(latencies, 50),
        latencyMsP95: percentile(latencies, 95),
        inputTokensP50: percentile(inputTokenCounts, 50),
        inputTokensP95: percentile(inputTokenCounts, 95),
        outputTokensP50: percentile(outputTokenCounts, 50),
        outputTokensP95: percentile(outputTokenCounts, 95),
        totalInputTokens,
        totalOutputTokens,
        totalCostUsd,
        projectedCostPer1000Usd: avgCostPerCallUsd * 1000,
      },
      cases: results,
    },
    { status: 200 },
  );
}
