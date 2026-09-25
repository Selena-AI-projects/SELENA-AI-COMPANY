import { randomUUID } from "node:crypto";
import { isFeatureEnabled } from "@/lib/diagnostics/flags";
import { discoverAndCrawl } from "./crawler/discover";
import { CROSS_PAGE_RULE_IDS } from "./checks/crossPageChecks";
import { extractHtmlSignals } from "./checks/htmlSignals";
import { detectActionReadiness, type ReadinessEvidence } from "./checks/actionReadiness";
import {
  getRecommendation,
  getPassedTitle,
  sortBySeverity,
  describeReadinessEvidence,
  type Severity,
} from "./checks/recommendations";
import { computePublicReadiness } from "./scoring/publicReadiness";
import { computeEntityClarity } from "./scoring/entityClarity";
import type { CheckResult } from "./checks/technicalChecks";
import type { PrimaryAction } from "./measurement";
import type { SiteProfile, VisibilityLocale } from "./types";
import {
  buildPublicReadinessAudit,
  type PublicReadinessAudit,
  type ReadinessSignalFinding,
} from "./readiness/publicReadiness";

/**
 * Runs the canonical free Public Readiness check (RC6 v1.2).
 *
 * Everything in this result comes from public website evidence. Observed
 * AI mentions, citations and recommendations are intentionally absent:
 * those belong to a separately approved paid measurement cycle.
 */

export type LayerState = "pass" | "warn" | "fail" | "not_measured";

export interface LiveFinding {
  id: string;
  ruleId: string;
  ruleVersion: string;
  state: LayerState;
  severity: Severity;
  title: string;
  detail: string;
  action: string;
  doesNotProve: string;
  pageUrl: string;
  blockId: string | null;
  selectorOrPath: string | null;
  evidenceType: string;
  capturedAt: string;
  generatedFix: {
    id: string;
    title: string;
    instruction: string;
    before: string;
    proposedAfter: string;
    autoApply: false;
  };
}

export interface LiveLayer {
  id: "discoverability" | "understanding" | "action_readiness";
  score: number | null;
  coverage: number;
  measured: boolean;
  notMeasuredReason?: string;
  findings: LiveFinding[];
  passed: string[];
}

export interface LiveReport {
  id: string;
  kind: "public_readiness";
  locale: VisibilityLocale;
  url: string;
  finalUrl: string;
  checkedAt: string;
  reachable: boolean;
  fetchError?: string;
  pagesChecked: { role: string; url: string; status: number }[];
  readiness: PublicReadinessAudit;
  layers: LiveLayer[];
  findings: LiveFinding[];
  topBlocker: LiveFinding | null;
  nextActions: LiveFinding[];
  partial: boolean;
  siteProfile: SiteProfile;
  paidProviderCalls: 0;
  visibilityClaim: string;
  /**
   * Server-controlled: whether the Local AI section may render its CTA.
   * The unscored Local AI Readiness checks themselves always ship with the
   * report — only the call-to-action is gated by LOCAL_AI_DISCOVERY_ENABLED.
   */
  localAiCtaEnabled: boolean;
}

const DIMENSION_TO_LAYER: Record<string, "discoverability" | "understanding"> = {
  access: "discoverability",
  identity: "understanding",
  offer: "understanding",
  conversion: "understanding",
};

/**
 * Turns raw check evidence into something a business owner can read.
 * The report is shown to the site's owner, not to us — dumping the raw
 * JSON would technically be honest and practically useless.
 */
function describeEvidence(evidence: Record<string, unknown>, locale: VisibilityLocale): string {
  const parts: string[] = [];
  const labels: Record<string, string> = locale === "ru"
    ? {
        statusCode: "HTTP-статус",
        header: "HTTP-заголовок",
        metaRobots: "meta robots",
        canonicalUrl: "canonical URL",
        h1Count: "число H1",
        jsonLdParseErrors: "ошибок JSON-LD",
        observation: "наблюдение",
        crawler: "краулер",
        userAgent: "user-agent",
        matchedRule: "правило robots.txt",
        citabilityScore: "готовность к цитированию",
        textSnapshot: "фрагмент текста",
        score: "оценка",
        visibleCharacters: "видимых символов",
        fact: "факт",
        disagreeingCrawlers: "краулеров с расхождением",
        hiddenPages: "страниц закрыто от индексации",
      }
    : {};
  for (const [key, value] of Object.entries(evidence)) {
    if (value === null || value === undefined || value === "" || value === false) continue;
    if (key === "reason") continue;
    const label = labels[key] ?? key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
    if (value === true) {
      parts.push(label);
    } else if (typeof value === "number") {
      parts.push(`${label}: ${value}`);
    } else if (typeof value === "string") {
      parts.push(`${label}: ${value.length > 90 ? `${value.slice(0, 90)}…` : value}`);
    }
    if (parts.length >= 3) break;
  }
  return parts.join(" · ");
}

function proposedFix(ruleId: string, locale: VisibilityLocale): string {
  const ru = locale === "ru";
  const templates: Record<string, string> = {
    "offer.title_present": ru
      ? "<title>[Бренд] — [основное предложение] в [локации]</title>"
      : "<title>[Brand] — [primary offer] in [location]</title>",
    "offer.single_h1": ru
      ? "<h1>[Основное предложение] для [аудитории] в [локации]</h1>"
      : "<h1>[Primary offer] for [audience] in [location]</h1>",
    "identity.jsonld_valid": '{ "@context": "https://schema.org", "@type": "Organization", "name": "[Confirmed legal/public name]", "url": "[Canonical URL]" }',
    "identity.jsonld_entity_present": '{ "@context": "https://schema.org", "@type": "Organization", "name": "[Confirmed public name]", "url": "[Canonical URL]", "sameAs": [] }',
    "conversion.contact_path_present": ru
      ? '<a href="[подтверждённый URL контакта или бронирования]">[Основное действие]</a>'
      : '<a href="[confirmed contact or booking URL]">[Primary action]</a>',
    "crawler.access": "User-agent: [confirmed crawler]\nAllow: /\nDisallow: /[private-path]/",
    "citability.block": ru
      ? "[Прямой ответ одним предложением]. [Конкретные границы предложения, локация, условия и подтверждаемый факт]."
      : "[Direct answer in one sentence]. [Concrete scope, location, conditions and verifiable fact].",
    "content.readiness": ru
      ? "[Кто вы и что предлагаете]. [Для кого и где]. [Какое действие сделать дальше]."
      : "[Who you are and what you offer]. [For whom and where]. [What action to take next].",
  };
  return templates[ruleId] ?? (ru ? "Предлагаемое изменение: [примените инструкцию выше и сохраните подтверждаемый текст]." : "Proposed change: [apply the instruction above using verifiable business facts].");
}

function makeFinding(
  check: CheckResult,
  locale: VisibilityLocale,
  context: {
    pageUrl: string;
    blockId?: string | null;
    selectorOrPath?: string | null;
    evidenceType?: string;
    capturedAt: string;
  },
): LiveFinding | null {
  const rec = getRecommendation(check.ruleId, locale);
  if (!rec) return null;
  const detail = describeEvidence(check.evidence, locale);
  const identity = `${check.ruleId}:${context.pageUrl}:${context.blockId ?? "page"}`;
  return {
    id: identity,
    ruleId: check.ruleId,
    ruleVersion: "readiness-rules-rc6-v1.2",
    state: check.state,
    severity: rec.severity,
    title: rec.title,
    detail,
    action: rec.action,
    doesNotProve: rec.doesNotProve,
    pageUrl: context.pageUrl,
    blockId: context.blockId ?? null,
    selectorOrPath: context.selectorOrPath ?? null,
    evidenceType: context.evidenceType ?? "technical_check",
    capturedAt: context.capturedAt,
    generatedFix: {
      id: `fix:${identity}`,
      title: rec.title,
      instruction: rec.action,
      before: detail || (locale === "ru" ? "Сигнал отсутствует или не прошёл правило." : "The signal is missing or did not pass the rule."),
      proposedAfter: proposedFix(check.ruleId, locale),
      autoApply: false,
    },
  };
}

function signalToFinding(
  signal: ReadinessSignalFinding,
  locale: VisibilityLocale,
  capturedAt: string,
): LiveFinding | null {
  const dimension: CheckResult["dimension"] = signal.ruleId.startsWith("access.")
    ? "access"
    : signal.ruleId.startsWith("identity.") || signal.ruleId.startsWith("business.")
      ? "identity"
      : signal.ruleId.startsWith("conversion.") || signal.ruleId.startsWith("action.")
        ? "conversion"
        : "offer";
  return makeFinding(
    { ruleId: signal.ruleId, dimension, state: signal.state, evidence: signal.evidence },
    locale,
    {
      pageUrl: signal.pageUrl,
      blockId: signal.blockId,
      selectorOrPath: signal.selectorOrPath,
      evidenceType: signal.evidenceType,
      capturedAt,
    },
  );
}

const UNREADABLE_REASON: Record<VisibilityLocale, string> = {
  en: "The page could not be read, so this layer was not measured. Nothing here is a statement about the site itself.",
  ru: "Страницу не удалось прочитать, поэтому слой не измерялся. Это ничего не утверждает о самом сайте.",
};

export async function runLiveCheck(options: {
  url: string;
  primaryAction: PrimaryAction;
  siteProfile?: SiteProfile;
  locale: VisibilityLocale;
  totalBudgetMs?: number;
  /**
   * Test-only: lets the suite point the check at a local fixture server.
   * Never set from an API route — the value is not derived from request
   * input, only from a literal `true` in a test.
   */
  unsafeAllowPrivateHostsForTesting?: boolean;
}): Promise<LiveReport> {
  const { url, primaryAction, locale } = options;
  const siteProfile = options.siteProfile ?? "all_checks";
  const budget = options.totalBudgetMs ?? 20_000;
  const perRequestTimeout = Math.min(8_000, Math.floor(budget / 3));
  const startedAt = Date.now();
  const checkedAt = new Date().toISOString();

  const crawl = await discoverAndCrawl(url, {
    timeoutMs: perRequestTimeout,
    maxRedirects: 4,
    unsafeAllowPrivateHostsForTesting: options.unsafeAllowPrivateHostsForTesting,
  });
  const homepage = crawl.pages.find((p) => p.role === "homepage");
  const homepageStatus = homepage?.fetch.statusCode ?? 0;
  // HTML alone is not enough: a 403 block page, a 500 or a soft error page
  // all carry a body. Scoring one of those would report a WAF's markup as
  // if it were the owner's homepage.
  const reachable =
    Boolean(homepage?.fetch.html) && homepageStatus >= 200 && homepageStatus < 300;
  const partial = Date.now() - startedAt > budget;

  const fetchError =
    homepage?.fetch.fetchError ??
    (reachable || homepageStatus === 0 ? undefined : `HTTP ${homepageStatus}`);

  const readinessAudit = buildPublicReadinessAudit({
    crawl,
    primaryAction,
    siteProfile,
    locale,
    capturedAt: checkedAt,
  });

  const checks = crawl.homepageChecks;

  // --- Layers 1 & 2 from the deterministic technical checks ---
  const byLayer = new Map<"discoverability" | "understanding", CheckResult[]>([
    ["discoverability", []],
    ["understanding", []],
  ]);
  for (const check of checks) {
    const layer = DIMENSION_TO_LAYER[check.dimension];
    if (layer) byLayer.get(layer)!.push(check);
  }

  const readiness = computePublicReadiness(checks);
  const accessDim = readiness.dimensionScores.find((d) => d.id === "access");

  function buildLayer(
    id: "discoverability" | "understanding",
    score: number | null,
    coverage: number,
  ): LiveLayer {
    const layerChecks = byLayer.get(id) ?? [];
    const findings = layerChecks
      .filter((c) => c.state === "fail" || c.state === "warn")
      .map((c) =>
        makeFinding(c, locale, {
          pageUrl: homepage?.fetch.finalUrl ?? url,
          capturedAt: checkedAt,
        }),
      )
      .filter((f): f is LiveFinding => f !== null);
    // The cross-page rules read the whole crawl rather than one page, so their
    // passes are not in `layerChecks` — and a check that quietly never appears
    // is a check the owner has no reason to believe we ran.
    const passed = [
      ...layerChecks.filter((c) => c.state === "pass").map((c) => c.ruleId),
      ...readinessAudit.checks
        .filter(
          (c) =>
            CROSS_PAGE_RULE_IDS.has(c.ruleId) &&
            c.state === "pass" &&
            DIMENSION_TO_LAYER[c.dimension] === id,
        )
        .map((c) => c.ruleId),
    ].map((ruleId) => getPassedTitle(ruleId, locale) ?? ruleId);

    // Without the page itself, almost every check in these two layers is
    // `not_measured`. Scoring the handful that survive would put a number
    // like "17" next to a site we never actually read — technically derived,
    // practically a false statement about the site.
    if (!reachable) {
      return {
        id,
        score: null,
        coverage: 0,
        measured: false,
        notMeasuredReason: UNREADABLE_REASON[locale],
        findings: sortBySeverity(findings),
        passed: [],
      };
    }

    return { id, score, coverage, measured: true, findings: sortBySeverity(findings), passed };
  }

  const understandingCoverage =
    readiness.dimensionScores
      .filter((d) => d.id !== "access")
      .reduce((sum, d) => sum + d.coverage, 0) / 3;
  const understandingScore = Math.round(
    readiness.dimensionScores
      .filter((d) => d.id !== "access")
      .reduce((sum, d) => sum + d.score, 0) / 3,
  );

  const layers: LiveLayer[] = [
    buildLayer("discoverability", accessDim?.score ?? null, accessDim?.coverage ?? 0),
    buildLayer("understanding", understandingScore, understandingCoverage),
  ];

  // --- Action Readiness remains part of website readiness, not an AI measurement. ---
  const actionFindings: LiveFinding[] = [];
  const actionPassed: string[] = [];
  if (reachable && homepage?.fetch.html) {
    const signals = extractHtmlSignals(homepage.fetch.html);
    const detected = detectActionReadiness(signals, primaryAction, homepage.fetch.html);
    const entries: [string, { state: LayerState; found: ReadinessEvidence[] }][] = [
      ["action.human_ready", detected.humanReady],
      ["action.machine_readable", detected.machineReadable],
      ["action.agent_executable", detected.agentExecutable],
    ];
    for (const [ruleId, result] of entries) {
      const rec = getRecommendation(ruleId, locale);
      if (!rec) continue;
      if (result.state === "pass") {
        actionPassed.push(getPassedTitle(ruleId, locale) ?? rec.title);
        continue;
      }
      const detail = describeReadinessEvidence(result.found, locale);
      const created = makeFinding(
        {
          ruleId,
          dimension: "conversion",
          state: result.state,
          evidence: { observation: detail },
        },
        locale,
        { pageUrl: homepage.fetch.finalUrl, capturedAt: checkedAt },
      );
      if (created) actionFindings.push(created);
    }
  }

  layers.push({
    id: "action_readiness",
    score: null,
    coverage: reachable ? 1 : 0,
    measured: reachable,
    notMeasuredReason: reachable ? undefined : UNREADABLE_REASON[locale],
    findings: sortBySeverity(actionFindings),
    passed: actionPassed,
  });

  const auditFindings = readinessAudit.findings
    .map((finding) => signalToFinding(finding, locale, checkedAt))
    .filter((finding): finding is LiveFinding => finding !== null);
  const byId = new Map<string, LiveFinding>();
  for (const finding of [...auditFindings, ...actionFindings]) byId.set(finding.id, finding);
  const allFindings = sortBySeverity([...byId.values()]);

  return {
    id: randomUUID(),
    kind: "public_readiness",
    locale,
    url,
    finalUrl: homepage?.fetch.finalUrl ?? url,
    checkedAt,
    reachable,
    fetchError,
    // Only pages we genuinely read. A linked URL that 404s was attempted,
    // not read — counting it would inflate "pages read" with pages whose
    // content never reached any check.
    pagesChecked: crawl.pages
      .filter((p) => p.fetch.statusCode >= 200 && p.fetch.statusCode < 300 && !p.fetch.fetchError)
      .map((p) => ({
        role: p.role,
        url: p.fetch.finalUrl,
        status: p.fetch.statusCode,
      })),
    readiness: readinessAudit,
    layers,
    findings: allFindings,
    topBlocker: allFindings[0] ?? null,
    nextActions: allFindings.slice(0, 3),
    partial,
    siteProfile,
    paidProviderCalls: 0,
    visibilityClaim: readinessAudit.visibilityClaim,
    localAiCtaEnabled: isFeatureEnabled("LOCAL_AI_DISCOVERY_ENABLED"),
  };
}

/** Entity Clarity is computed but reported as supporting detail, not a headline score. */
export function entityClarityFor(html: string) {
  return computeEntityClarity(extractHtmlSignals(html));
}
