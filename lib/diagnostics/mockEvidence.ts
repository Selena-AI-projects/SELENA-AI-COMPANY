import type { MockRunPayload } from "./mockRun";
import { VERSIONS, singleRunConfidence, type Confidence } from "./contracts";
import { commercialFacts } from "@/lib/commercial-facts";

/**
 * Deterministic mock evidence generator for the Phase 1 "mocked
 * end-to-end MVP" (SSOT §20 Phase 1: "mock provider; score/report
 * rendering"). Every field the report renders states its own limits —
 * this generator produces plausible, stable-per-domain numbers, never a
 * claim about the real site. It must never be reachable once
 * VISIBILITY_LIVE_CRAWLER_ENABLED / VISIBILITY_AI_SAMPLE_ENABLED are on
 * for a given run (see app/api/checks/route.ts).
 */

export type ConversionPathLabel = "Clear" | "Partial" | "Weak" | "Not measured";

export interface MockIssue {
  title: string;
  severity: "critical" | "important" | "later";
  whatWeFound: string;
  whyItMatters: string;
  whatThisDoesNotProve: string;
  recommendedAction: string;
  availablePath: string;
}

export interface MockVisibilityReport {
  methodologyVersion: string;
  promptSetVersion: string;
  scoringVersion: string;
  domain: string;
  brand: string;
  market: string;
  language: string;
  generatedAt: string;
  publicReadiness: number;
  entityClarity: number;
  sampleSize: number;
  aiMentioned: number;
  ownedCited: number;
  conversionPath: ConversionPathLabel;
  confidence: Confidence;
  issues: MockIssue[];
}

/** FNV-1a string hash → 32-bit unsigned seed. Deterministic across runs/processes. */
function hashToSeed(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32 PRNG — small, dependency-free, deterministic given a seed. */
function createRng(seed: number) {
  let state = seed;
  return function next(): number {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInRange(rng: () => number, min: number, max: number): number {
  return Math.round(min + rng() * (max - min));
}

const ISSUE_POOL_EN: MockIssue[] = [
  {
    title: "Primary service definition is inconsistent",
    severity: "critical",
    whatWeFound: "Homepage copy, page metadata and structured data describe the core offer in three materially different ways.",
    whyItMatters: "Machines and people receive conflicting definitions of what the business actually sells.",
    whatThisDoesNotProve: "It does not prove that any AI engine will omit the brand from an answer.",
    recommendedAction: "Write one canonical service definition and reuse it across visible copy, metadata and structured data.",
    availablePath: `Expert Verified — ${commercialFacts.aiVisibility.expertVerified.en}`,
  },
  {
    title: "Contact and conversion path is partial",
    severity: "important",
    whatWeFound: "A contact method exists, but there is no clear single next step above the fold on the primary page.",
    whyItMatters: "Visitors and machine-readable signals both look for one unambiguous next action.",
    whatThisDoesNotProve: "It does not measure actual conversion rate — that requires first-party analytics.",
    recommendedAction: "Add one clear primary call to action near the top of the page checked.",
    availablePath: `Implementation + 90 days — ${commercialFacts.aiVisibility.implementation90Days.en}`,
  },
  {
    title: "Structured data is incomplete",
    severity: "important",
    whatWeFound: "Organization or LocalBusiness markup is present but missing some fields typically expected for this category.",
    whyItMatters: "Incomplete structured data is weaker machine-readable corroboration of who the business is.",
    whatThisDoesNotProve: "It does not prove or guarantee improved AI citation — schema is corroboration, not a ranking factor.",
    recommendedAction: "Complete the Organization/LocalBusiness schema fields relevant to this business category.",
    availablePath: `Implementation + 90 days — ${commercialFacts.aiVisibility.implementation90Days.en}`,
  },
  {
    title: "Brand mention sample is thin",
    severity: "later",
    whatWeFound: "The dated, limited AI sample mentioned the brand in fewer than half of valid answers.",
    whyItMatters: "A thin sample makes it harder to say whether visibility is stable or a one-off result.",
    whatThisDoesNotProve: "It does not prove the brand is invisible to AI systems in general — the sample is limited and dated.",
    recommendedAction: "Track a consistent prompt set over time before drawing conclusions from a single sample.",
    availablePath: `AI Visibility Snapshot — ${commercialFacts.aiVisibility.snapshot.en}`,
  },
  {
    title: "Key commercial page is missing or hard to find",
    severity: "critical",
    whatWeFound: "No dedicated service/product page was discoverable from the homepage within the crawl scope.",
    whyItMatters: "Both search engines and AI systems rely on a clear, linked page to describe a specific offer.",
    whatThisDoesNotProve: "It does not prove the page doesn't exist — only that it wasn't discoverable within this check's scope.",
    recommendedAction: "Link the primary service/product page clearly from the homepage navigation.",
    availablePath: `Expert Verified — ${commercialFacts.aiVisibility.expertVerified.en}`,
  },
];

const ISSUE_POOL_RU: MockIssue[] = [
  {
    title: "Описание основной услуги противоречиво",
    severity: "critical",
    whatWeFound: "Текст на главной странице, метаданные и структурированные данные описывают ключевое предложение тремя существенно разными способами.",
    whyItMatters: "Машины и люди получают противоречивые определения того, что именно продаёт бизнес.",
    whatThisDoesNotProve: "Это не доказывает, что какая-либо AI-система не упомянет бренд.",
    recommendedAction: "Сформулируйте одно каноничное описание услуги и используйте его везде: в тексте, метаданных и структурированных данных.",
    availablePath: `Expert Verified — ${commercialFacts.aiVisibility.expertVerified.ru}`,
  },
  {
    title: "Путь к контакту и конверсии частичный",
    severity: "important",
    whatWeFound: "Способ связи существует, но на основной странице нет одного ясного следующего шага в верхней части экрана.",
    whyItMatters: "И посетители, и машиночитаемые сигналы ищут одно однозначное следующее действие.",
    whatThisDoesNotProve: "Это не измеряет реальную конверсию — для этого нужна собственная аналитика.",
    recommendedAction: "Добавьте один ясный основной призыв к действию в верхней части проверенной страницы.",
    availablePath: `Implementation + 90 days — ${commercialFacts.aiVisibility.implementation90Days.ru}`,
  },
  {
    title: "Структурированные данные неполные",
    severity: "important",
    whatWeFound: "Разметка Organization или LocalBusiness присутствует, но без части полей, обычно ожидаемых для этой категории бизнеса.",
    whyItMatters: "Неполные структурированные данные — более слабое машиночитаемое подтверждение того, кто это.",
    whatThisDoesNotProve: "Это не доказывает и не гарантирует улучшение AI-цитирования — разметка Schema.org является подтверждением, а не фактором ранжирования.",
    recommendedAction: "Заполните поля схемы Organization/LocalBusiness, релевантные категории бизнеса.",
    availablePath: `Implementation + 90 days — ${commercialFacts.aiVisibility.implementation90Days.ru}`,
  },
  {
    title: "Выборка упоминаний бренда небольшая",
    severity: "later",
    whatWeFound: "В ограниченной датированной AI-выборке бренд упомянут менее чем в половине валидных ответов.",
    whyItMatters: "Небольшая выборка усложняет вывод о том, стабильна ли видимость или это разовый результат.",
    whatThisDoesNotProve: "Это не доказывает, что бренд невидим для AI-систем в целом — выборка ограничена и датирована.",
    recommendedAction: "Отслеживайте один и тот же набор запросов во времени, прежде чем делать выводы по одной выборке.",
    availablePath: `AI Visibility Snapshot — ${commercialFacts.aiVisibility.snapshot.ru}`,
  },
  {
    title: "Ключевая коммерческая страница отсутствует или её трудно найти",
    severity: "critical",
    whatWeFound: "В рамках проверки с главной страницы не удалось обнаружить отдельную страницу услуги/продукта.",
    whyItMatters: "И поисковые системы, и AI-системы полагаются на ясную связанную страницу, описывающую конкретное предложение.",
    whatThisDoesNotProve: "Это не доказывает, что страницы не существует — только то, что её не удалось найти в рамках этой проверки.",
    recommendedAction: "Свяжите основную страницу услуги/продукта явной ссылкой из навигации на главной странице.",
    availablePath: `Expert Verified — ${commercialFacts.aiVisibility.expertVerified.ru}`,
  },
];

function pickIssues(rng: () => number, count: number, language: string): MockIssue[] {
  const pool = [...(language.startsWith("ru") ? ISSUE_POOL_RU : ISSUE_POOL_EN)];
  const picked: MockIssue[] = [];
  while (picked.length < count && pool.length > 0) {
    const index = Math.floor(rng() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
}

function conversionPathFor(publicReadiness: number): ConversionPathLabel {
  if (publicReadiness >= 80) return "Clear";
  if (publicReadiness >= 60) return "Partial";
  if (publicReadiness >= 40) return "Weak";
  return "Not measured";
}

export function buildMockVisibilityReport(payload: MockRunPayload, generatedAt: string): MockVisibilityReport {
  const rng = createRng(hashToSeed(`${payload.registrableDomain}|${payload.market}|${payload.language}`));

  const publicReadiness = randomInRange(rng, 38, 92);
  const entityClarity = randomInRange(rng, 35, 90);
  const sampleSize = 6;
  const aiMentioned = randomInRange(rng, 0, sampleSize);
  const ownedCited = randomInRange(rng, 0, aiMentioned);

  return {
    methodologyVersion: VERSIONS.methodology,
    promptSetVersion: VERSIONS.promptSet,
    scoringVersion: VERSIONS.scoring,
    domain: payload.registrableDomain,
    brand: payload.brandName,
    market: payload.market,
    language: payload.language,
    generatedAt,
    publicReadiness,
    entityClarity,
    sampleSize,
    aiMentioned,
    ownedCited,
    conversionPath: conversionPathFor(publicReadiness),
    confidence: singleRunConfidence(aiMentioned > 0 ? sampleSize : 0, 2),
    issues: pickIssues(rng, 3, payload.language),
  };
}

const MEASUREMENT_BOUNDARY = {
  whatWeMeasured: [
    "Publicly available pages",
    "Technical accessibility and indexability signals",
    "Structured identity and service clarity",
    "A limited, dated sample of AI responses",
    "Public links and citations returned by supported providers",
  ],
  whatWeDidNotMeasure: [
    "Every possible prompt",
    "Every user location or personal context",
    "Private analytics",
    "CRM conversions",
    "Revenue impact",
    "Guaranteed future recommendations",
    "Causality between one website change and one AI answer",
  ],
} as const;

/**
 * Ungated view (SSOT §4.1 "Что показывается до email"): scores, sample
 * counts, issue titles/severity only — no evidence, no recommended
 * action, no availablePath. This is what /api/reports/:token/summary
 * returns and what /api/reports/:token returns before unlock.
 */
export function toSummaryJson(report: MockVisibilityReport) {
  return {
    isMock: true as const,
    methodologyVersion: report.methodologyVersion,
    scoringVersion: report.scoringVersion,
    domain: report.domain,
    brand: report.brand,
    market: report.market,
    language: report.language,
    generatedAt: report.generatedAt,
    publicReadiness: report.publicReadiness,
    entityClarity: report.entityClarity,
    aiSample: { mentioned: report.aiMentioned, of: report.sampleSize },
    ownedDomainCitation: { cited: report.ownedCited, of: report.sampleSize },
    conversionPath: report.conversionPath,
    confidence: report.confidence,
    topIssues: report.issues.map((issue) => ({ title: issue.title, severity: issue.severity })),
    measurementBoundary: MEASUREMENT_BOUNDARY,
  };
}

/** Gated view (SSOT §4.1 "Что открывается после email"): full issue detail. */
export function toFullJson(report: MockVisibilityReport) {
  return {
    ...toSummaryJson(report),
    issues: report.issues,
  };
}
