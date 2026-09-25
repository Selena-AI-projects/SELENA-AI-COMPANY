import { createHash } from "node:crypto";
import readinessConfig from "@/data/visibility/public-readiness.rc6-v1.json";
import { detectActionReadiness } from "../checks/actionReadiness";
import {
  extractHtmlSignals,
  hasContactPath,
  hasOrgLikeJsonLd,
  htmlToVisibleText,
  type HtmlSignals,
} from "../checks/htmlSignals";
import { runCrossPageChecks } from "../checks/crossPageChecks";
import { decideBySpecificGroup, parseRobots } from "../checks/robotsRules";
import { runTechnicalChecks, type CheckResult, type CheckState } from "../checks/technicalChecks";
import type { DiscoveryResult, DiscoveredPage } from "../crawler/discover";
import type { PrimaryAction } from "../measurement";
import type { SiteProfile, VisibilityLocale } from "../types";
import { buildAgentReadiness, type AgentReadinessResult } from "./agentReadiness";

export type ReadinessComponentId =
  | "technical_accessibility"
  | "ai_crawler_accessibility"
  | "structured_data"
  | "entity_clarity"
  | "citability"
  | "content_readiness"
  | "business_information_consistency"
  | "conversion_readiness"
  | "llms_txt";

export interface ReadinessComponent {
  id: ReadinessComponentId;
  label: string;
  score: number | null;
  coverage: number;
  weight: number;
  status: "weighted" | "diagnostic_only";
  note: string;
}

export interface CrawlerAccessResult {
  crawler: string;
  userAgent: string;
  status: "allowed" | "blocked" | "unknown";
  sourceUrl: string;
  matchedRule: string | null;
  evidence: string;
}

export interface CitabilityRuleResult {
  ruleId: string;
  ruleVersion: string;
  passed: boolean;
  reason: string;
}

export interface ReadinessBlock {
  blockId: string;
  blockType: "hero" | "about" | "services" | "pricing" | "location_contact" | "faq" | "evidence" | "other";
  pageUrl: string;
  selectorOrPath: string;
  textSnapshot: string;
  citabilityScore: number;
  ruleResults: CitabilityRuleResult[];
  evidence: string;
}

export interface ReadinessPageEvidence {
  role: string;
  requestedUrl: string;
  url: string;
  status: number;
  title: string | null;
  contentHash: string | null;
  capturedAt: string;
}

export interface ReadinessSignalFinding {
  ruleId: string;
  ruleVersion: string;
  state: Extract<CheckState, "warn" | "fail">;
  pageUrl: string;
  blockId: string | null;
  selectorOrPath: string | null;
  evidenceType: string;
  evidence: Record<string, unknown>;
  htmlEvidence: string | null;
  textEvidence: string | null;
  sourceEngine: string;
  sourceVersion: string;
  capturedAt: string;
  generatedFixId: string | null;
  verificationStatus: "not_requested" | "pending" | "verified" | "failed";
}

export interface PublicReadinessAudit {
  scoringModelVersion: string;
  ruleVersion: string;
  score: number | null;
  coverage: number;
  components: ReadinessComponent[];
  crawlerAccess: CrawlerAccessResult[];
  blocks: ReadinessBlock[];
  pages: ReadinessPageEvidence[];
  findings: ReadinessSignalFinding[];
  checks: Array<CheckResult & { pageUrl: string }>;
  agentReadiness: AgentReadinessResult;
  paidProviderCalls: 0;
  visibilityClaim: string;
}

const COMPONENT_LABELS: Record<VisibilityLocale, Record<ReadinessComponentId, string>> = {
  en: {
    technical_accessibility: "Technical accessibility",
    ai_crawler_accessibility: "AI crawler accessibility",
    structured_data: "Structured data",
    entity_clarity: "Entity clarity",
    citability: "Citability readiness",
    content_readiness: "Content readiness",
    business_information_consistency: "Business information consistency",
    conversion_readiness: "Conversion readiness",
    llms_txt: "llms.txt diagnostic",
  },
  ru: {
    technical_accessibility: "Техническая доступность",
    ai_crawler_accessibility: "Доступ AI-краулеров",
    structured_data: "Структурированные данные",
    entity_clarity: "Ясность сущности",
    citability: "Готовность к цитированию",
    content_readiness: "Готовность контента",
    business_information_consistency: "Согласованность данных о бизнесе",
    conversion_readiness: "Готовность к целевому действию",
    llms_txt: "Диагностика llms.txt",
  },
};

const COMPONENT_NOTES: Record<VisibilityLocale, Record<ReadinessComponentId, string>> = {
  en: {
    technical_accessibility: "HTTP access, indexability, canonical, mobile metadata and sitemap evidence.",
    ai_crawler_accessibility: "robots.txt rules evaluated separately for named crawler user agents.",
    structured_data: "Presence and parseability of public JSON-LD entity data.",
    entity_clarity: "Whether public title, heading and entity-name signals identify the business consistently.",
    citability: "Versioned page/block heuristics for extractable, answer-first content; not a ranking factor.",
    content_readiness: "Readable text, descriptive headings, metadata and an explicit offer page.",
    business_information_consistency: "Public business name, service area and contact-path corroboration.",
    conversion_readiness: "Whether the stated primary customer action can be found and understood.",
    llms_txt: "Diagnostic only. It contributes zero weight to the readiness score.",
  },
  ru: {
    technical_accessibility: "HTTP-доступ, индексируемость, canonical, мобильные метаданные и наличие sitemap.",
    ai_crawler_accessibility: "Правила robots.txt проверены отдельно для каждого указанного краулера.",
    structured_data: "Наличие и разбираемость публичных JSON-LD данных о сущности.",
    entity_clarity: "Насколько title, заголовок и имя сущности согласованно описывают бизнес.",
    citability: "Версионированные эвристики контента, который начинается с прямого ответа и легко извлекается; это не фактор ранжирования.",
    content_readiness: "Читаемый текст, содержательные заголовки, метаданные и явная страница предложения.",
    business_information_consistency: "Согласование публичного имени, географии и пути к контакту.",
    conversion_readiness: "Можно ли найти и понять заявленное основное действие клиента.",
    llms_txt: "Только диагностика. Вес в балле готовности равен нулю.",
  },
};

const CRAWLERS = [
  { crawler: "OpenAI search", userAgent: "OAI-SearchBot" },
  { crawler: "ChatGPT user fetch", userAgent: "ChatGPT-User" },
  { crawler: "OpenAI training crawler", userAgent: "GPTBot" },
  { crawler: "Google AI controls", userAgent: "Google-Extended" },
  { crawler: "Anthropic", userAgent: "ClaudeBot" },
  { crawler: "Perplexity", userAgent: "PerplexityBot" },
] as const;

const STATE_SCORE: Record<CheckState, number | null> = {
  pass: 100,
  warn: 50,
  fail: 0,
  not_measured: null,
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function average(values: Array<number | null>): { score: number | null; coverage: number } {
  const measured = values.filter((value): value is number => value !== null);
  return {
    score: measured.length > 0 ? clampScore(measured.reduce((sum, value) => sum + value, 0) / measured.length) : null,
    coverage: values.length > 0 ? measured.length / values.length : 0,
  };
}

function stableHash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

const READINESS_SOURCE_ENGINE = "selena-public-readiness";

function findingProvenance(capturedAt: string, evidence: Record<string, unknown>): Pick<ReadinessSignalFinding, "ruleVersion" | "htmlEvidence" | "textEvidence" | "sourceEngine" | "sourceVersion" | "capturedAt" | "generatedFixId" | "verificationStatus"> {
  const serialized = JSON.stringify(evidence);
  return {
    ruleVersion: readinessConfig.ruleVersion,
    htmlEvidence: null,
    textEvidence: serialized ? serialized.slice(0, 1_200) : null,
    sourceEngine: READINESS_SOURCE_ENGINE,
    sourceVersion: readinessConfig.scoringModelVersion,
    capturedAt,
    generatedFixId: null,
    verificationStatus: "not_requested",
  };
}

function inferBlockType(heading: string): ReadinessBlock["blockType"] {
  const value = heading.toLowerCase();
  if (/faq|question|вопрос/.test(value)) return "faq";
  if (/price|pricing|tariff|cost|цена|тариф|стоим/.test(value)) return "pricing";
  if (/contact|location|address|visit|контакт|адрес|локац|где мы/.test(value)) return "location_contact";
  if (/proof|result|case|review|testimonial|evidence|результ|кейс|отзыв|доказ/.test(value)) return "evidence";
  if (/about|who we are|о нас|кто мы/.test(value)) return "about";
  if (/service|product|solution|offer|услуг|продукт|решен|предлож/.test(value)) return "services";
  return "other";
}

function scoreBlock(heading: string, text: string): { score: number; rules: CitabilityRuleResult[] } {
  const body = text.trim();
  const version = readinessConfig.ruleVersion;
  const checks = [
    {
      ruleId: "CITABILITY-BLOCK-HEADING",
      passed: heading.length >= 4 && heading.length <= 120,
      reason: "A concise descriptive heading identifies the block.",
    },
    {
      ruleId: "CITABILITY-BLOCK-ANSWER",
      passed: body.length >= 80,
      reason: "The block contains enough visible text to state a direct answer.",
    },
    {
      ruleId: "CITABILITY-BLOCK-SPECIFICITY",
      passed: /\b\d+[\d.,%$€£]*\b|\b(?:in|at|for|from|within|до|в|для|от)\b/i.test(body),
      reason: "The block contains at least one concrete qualifier, number or scope signal.",
    },
    {
      ruleId: "CITABILITY-BLOCK-SENTENCE",
      passed: /[.!?。！？](?:\s|$)/.test(body),
      reason: "The block contains a complete sentence that can be extracted without surrounding layout.",
    },
  ];
  const score = checks.reduce((sum, item, index) => sum + (item.passed ? [25, 35, 20, 20][index] : 0), 0);
  return {
    score,
    rules: checks.map((item) => ({ ...item, ruleVersion: version })),
  };
}

function extractBlocks(pageUrl: string, html: string): ReadinessBlock[] {
  const matches = [...html.matchAll(/<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>([\s\S]*?)(?=<h[1-3]\b|$)/gi)];
  return matches.slice(0, 24).map((match, index) => {
    const level = Number(match[1]);
    const heading = htmlToVisibleText(match[2] ?? "").slice(0, 160);
    const body = htmlToVisibleText(match[3] ?? "").slice(0, 1_200);
    const textSnapshot = [heading, body].filter(Boolean).join(" — ").slice(0, 600);
    const scored = scoreBlock(heading, body);
    const selectorOrPath = `h${level}:nth-heading(${index + 1})`;
    return {
      blockId: `block_${stableHash(`${pageUrl}:${selectorOrPath}:${heading}`).slice(0, 16)}`,
      blockType: index === 0 && level === 1 ? "hero" : inferBlockType(heading),
      pageUrl,
      selectorOrPath,
      textSnapshot,
      citabilityScore: scored.score,
      ruleResults: scored.rules,
      evidence: `Visible heading and following text captured at ${selectorOrPath}.`,
    };
  });
}

function evaluateCrawlerAccess(crawl: DiscoveryResult, locale: VisibilityLocale): CrawlerAccessResult[] {
  const ru = locale === "ru";
  if (crawl.robots.status === "unavailable") {
    return CRAWLERS.map((item) => ({
      ...item,
      status: "unknown" as const,
      sourceUrl: crawl.robots.url,
      matchedRule: null,
      evidence: crawl.robots.error ?? (ru ? "robots.txt не удалось прочитать" : "robots.txt could not be read"),
    }));
  }
  if (crawl.robots.status === "not_found" || !crawl.robots.body) {
    return CRAWLERS.map((item) => ({
      ...item,
      status: "allowed" as const,
      sourceUrl: crawl.robots.url,
      matchedRule: null,
      evidence: ru
        ? "robots.txt не опубликован; явных ограничений для краулеров не обнаружено."
        : "robots.txt is not published; no explicit crawler restriction was observed.",
    }));
  }

  const groups = parseRobots(crawl.robots.body);
  return CRAWLERS.map((item) => {
    const verdict = decideBySpecificGroup(groups, item.userAgent);
    return {
      ...item,
      status: verdict.blocked ? ("blocked" as const) : ("allowed" as const),
      sourceUrl: crawl.robots.url,
      matchedRule: verdict.matchedRule,
      evidence: verdict.matchedRule ?? (ru ? "Нет правила Disallow, закрывающего корень сайта." : "No matching Disallow rule for the site root."),
    };
  });
}

function jsonLdDetails(signals: HtmlSignals): { names: string[]; hasLocation: boolean } {
  const names = new Set<string>();
  let hasLocation = false;
  function visit(value: unknown): void {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!value || typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    if (typeof record.name === "string") names.add(record.name.trim());
    if (record.address || record.areaServed || record.location) hasLocation = true;
    if (record["@graph"]) visit(record["@graph"]);
  }
  signals.jsonLdBlocks.forEach(visit);
  return { names: [...names].filter(Boolean), hasLocation };
}

function normalized(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, " ").trim();
}

function entitySignalsScore(signals: HtmlSignals): number {
  const details = jsonLdDetails(signals);
  let score = 0;
  if (signals.title) score += 25;
  if (signals.h1Text) score += 25;
  if (details.names.length > 0) score += 30;
  const comparable = [signals.title, signals.h1Text].filter((value): value is string => Boolean(value));
  if (
    details.names.some((name) => comparable.some((value) => normalized(value).includes(normalized(name))))
  ) {
    score += 20;
  }
  return score;
}

function pageContentScore(page: DiscoveredPage, signals: HtmlSignals): number {
  let score = 0;
  if (signals.visibleText.length >= 500) score += 45;
  else if (signals.visibleText.length >= 180) score += 25;
  else if (signals.visibleText.length >= 80) score += 10;
  if (signals.headings.length >= 2) score += 25;
  else if (signals.headings.length === 1) score += 15;
  if (signals.metaDescription && signals.metaDescription.length >= 50) score += 15;
  if (page.role === "service" || signals.links.some((link) => /service|product|pricing|услуг|продукт|тариф/i.test(link.href))) score += 15;
  return clampScore(score);
}

function component(
  id: ReadinessComponentId,
  score: number | null,
  coverage: number,
  locale: VisibilityLocale,
): ReadinessComponent {
  const configured = readinessConfig.components.find((item) => item.id === id);
  if (!configured) throw new Error(`Missing Public Readiness component config: ${id}`);
  return {
    id,
    label: COMPONENT_LABELS[locale][id],
    score,
    coverage,
    weight: configured.weight,
    status: configured.status as ReadinessComponent["status"],
    note: COMPONENT_NOTES[locale][id],
  };
}

export function buildPublicReadinessAudit(options: {
  crawl: DiscoveryResult;
  primaryAction: PrimaryAction;
  siteProfile: SiteProfile;
  locale: VisibilityLocale;
  capturedAt: string;
}): PublicReadinessAudit {
  const { crawl, primaryAction, siteProfile, locale, capturedAt } = options;
  const successful = crawl.pages.filter(
    (page) => page.fetch.statusCode >= 200 && page.fetch.statusCode < 300 && Boolean(page.fetch.html),
  );
  const analyzed = successful.map((page) => {
    const signals = extractHtmlSignals(page.fetch.html ?? "");
    const checks = runTechnicalChecks(page.fetch, { sitemapFound: crawl.sitemapFound });
    const blocks = extractBlocks(page.fetch.finalUrl, page.fetch.html ?? "");
    return { page, signals, checks, blocks };
  });
  const homepage = analyzed.find((item) => item.page.role === "homepage") ?? analyzed[0];
  const allChecks = analyzed.flatMap((item) =>
    item.checks.map((check) => ({ ...check, pageUrl: item.page.fetch.finalUrl })),
  );

  // Contradictions between pages, a robots.txt two crawlers read differently
  // and a page hidden in one language only — none of which any single page
  // can show. They report and stay out of the score.
  allChecks.push(
    ...runCrossPageChecks({
      baseUrl: crawl.baseUrl,
      pages: analyzed.map(({ page, signals }) => ({
        url: page.fetch.finalUrl,
        signals,
        headers: page.fetch.headers,
      })),
      robotsBody: crawl.robots.status === "available" ? crawl.robots.body : null,
      sitemapBody: crawl.sitemap.status === "available" ? crawl.sitemap.body : null,
      crawlers: CRAWLERS,
    }),
  );

  const technicalRuleIds = new Set([
    "access.fetchable",
    "access.noindex",
    "access.canonical",
    "access.viewport",
    "access.sitemap_discovered",
  ]);
  const technical = average(
    allChecks
      .filter((check) => technicalRuleIds.has(check.ruleId))
      .filter((check, index, list) => check.ruleId !== "access.sitemap_discovered" || index === list.findIndex((item) => item.ruleId === check.ruleId))
      .map((check) => STATE_SCORE[check.state]),
  );

  const crawlerAccess = evaluateCrawlerAccess(crawl, locale);
  const crawler = average(
    crawlerAccess.map((item) => (item.status === "allowed" ? 100 : item.status === "blocked" ? 0 : null)),
  );

  const structured = average(
    analyzed.map(({ signals }) => {
      if (signals.jsonLdParseErrors > 0) return 0;
      if (hasOrgLikeJsonLd(signals)) return 100;
      if (signals.jsonLdBlocks.length > 0) return 60;
      return 20;
    }),
  );
  const entity = average(analyzed.map(({ signals }) => entitySignalsScore(signals)));
  const blocks = analyzed.flatMap((item) => item.blocks);
  const citability = average(blocks.length > 0 ? blocks.map((item) => item.citabilityScore) : successful.map(() => 0));
  const content = average(analyzed.map(({ page, signals }) => pageContentScore(page, signals)));

  const business = average(
    analyzed.map(({ signals }) => {
      const details = jsonLdDetails(signals);
      let score = 0;
      if (hasContactPath(signals)) score += 40;
      if (details.names.length > 0) score += 30;
      if (details.hasLocation) score += 30;
      return score;
    }),
  );

  let conversionScore: number | null = null;
  if (homepage?.page.fetch.html) {
    const action = detectActionReadiness(homepage.signals, primaryAction, homepage.page.fetch.html);
    conversionScore =
      (action.humanReady.state === "pass" ? 75 : action.humanReady.state === "warn" ? 35 : 0) +
      (hasContactPath(homepage.signals) ? 25 : 0);
  }

  const llmsScore = crawl.llmsTxt.status === "available" && Boolean(crawl.llmsTxt.body?.trim()) ? 100 : 0;
  const components = [
    component("technical_accessibility", technical.score, technical.coverage, locale),
    component("ai_crawler_accessibility", crawler.score, crawler.coverage, locale),
    component("structured_data", structured.score, structured.coverage, locale),
    component("entity_clarity", entity.score, entity.coverage, locale),
    component("citability", citability.score, citability.coverage, locale),
    component("content_readiness", content.score, content.coverage, locale),
    component("business_information_consistency", business.score, business.coverage, locale),
    component("conversion_readiness", conversionScore, conversionScore === null ? 0 : 1, locale),
    component("llms_txt", llmsScore, 1, locale),
  ];

  if (successful.length === 0) {
    for (const item of components) {
      if (item.status === "weighted") {
        item.score = null;
        item.coverage = 0;
      }
    }
  }

  const weighted = components.filter((item) => item.status === "weighted");
  const measuredWeight = weighted.reduce(
    (sum, item) => sum + (item.score === null ? 0 : item.weight * item.coverage),
    0,
  );
  const earned = weighted.reduce(
    (sum, item) => sum + (item.score === null ? 0 : item.score * item.weight * item.coverage),
    0,
  );
  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  const score = measuredWeight > 0 ? clampScore(earned / measuredWeight) : null;

  const findings: ReadinessSignalFinding[] = allChecks
    .filter((check): check is typeof check & { state: "warn" | "fail" } => check.state === "warn" || check.state === "fail")
    .map((check) => ({
      ruleId: check.ruleId,
      state: check.state,
      pageUrl: check.pageUrl,
      blockId: null,
      selectorOrPath: null,
      evidenceType: "technical_check",
      evidence: check.evidence,
      ...findingProvenance(capturedAt, check.evidence),
    }));

  for (const item of crawlerAccess.filter((entry) => entry.status === "blocked")) {
    findings.push({
      ruleId: "crawler.access",
      state: "fail",
      pageUrl: crawl.baseUrl,
      blockId: null,
      selectorOrPath: "/robots.txt",
      evidenceType: "robots_rule",
      evidence: { crawler: item.crawler, userAgent: item.userAgent, matchedRule: item.matchedRule },
      ...findingProvenance(capturedAt, { crawler: item.crawler, userAgent: item.userAgent, matchedRule: item.matchedRule }),
    });
  }
  for (const block of blocks.filter((item) => item.citabilityScore < 60)) {
    findings.push({
      ruleId: "citability.block",
      state: block.citabilityScore < 30 ? "fail" : "warn",
      pageUrl: block.pageUrl,
      blockId: block.blockId,
      selectorOrPath: block.selectorOrPath,
      evidenceType: "visible_text_snapshot",
      evidence: { citabilityScore: block.citabilityScore, textSnapshot: block.textSnapshot },
      ...findingProvenance(capturedAt, { citabilityScore: block.citabilityScore, textSnapshot: block.textSnapshot }),
    });
  }
  if (blocks.length === 0 && homepage) {
    findings.push({
      ruleId: "citability.block",
      state: "fail",
      pageUrl: homepage.page.fetch.finalUrl,
      blockId: null,
      selectorOrPath: "body",
      evidenceType: "heading_structure",
      evidence: {
        citabilityScore: 0,
        textSnapshot: locale === "ru"
          ? "Не найдено ни одного видимого блока с заголовком H1–H3."
          : "No visible H1–H3 anchored content block was found.",
      },
      ...findingProvenance(capturedAt, {
        citabilityScore: 0,
        textSnapshot: locale === "ru"
          ? "Не найдено ни одного видимого блока с заголовком H1–H3."
          : "No visible H1–H3 anchored content block was found.",
      }),
    });
  }
  if (content.score !== null && content.score < 50 && homepage) {
    findings.push({
      ruleId: "content.readiness",
      state: content.score < 30 ? "fail" : "warn",
      pageUrl: homepage.page.fetch.finalUrl,
      blockId: null,
      selectorOrPath: "body",
      evidenceType: "content_summary",
      evidence: { score: content.score, visibleCharacters: homepage.signals.visibleText.length },
      ...findingProvenance(capturedAt, { score: content.score, visibleCharacters: homepage.signals.visibleText.length }),
    });
  }
  if (business.score !== null && business.score < 60 && homepage) {
    findings.push({
      ruleId: "business.consistency",
      state: business.score < 30 ? "fail" : "warn",
      pageUrl: homepage.page.fetch.finalUrl,
      blockId: null,
      selectorOrPath: null,
      evidenceType: "business_signal_summary",
      evidence: { score: business.score },
      ...findingProvenance(capturedAt, { score: business.score }),
    });
  }

  const pages = crawl.pages.map((page) => ({
    role: page.role,
    requestedUrl: page.requestedUrl,
    url: page.fetch.finalUrl,
    status: page.fetch.statusCode,
    title: page.fetch.html ? extractHtmlSignals(page.fetch.html).title : null,
    contentHash: page.fetch.html ? stableHash(page.fetch.html) : null,
    capturedAt,
  }));

  const agentReadiness = buildAgentReadiness({
    crawl,
    siteProfile,
    locale,
    primaryAction,
    capturedAt,
    summary: {
      technicalStates: allChecks
        .filter((check) => check.ruleId === "access.fetchable" || check.ruleId === "access.canonical")
        .map((check) => check.state),
      indexabilityStates: allChecks
        .filter((check) => check.ruleId === "access.fetchable" || check.ruleId === "access.noindex")
        .map((check) => check.state),
      structuredDataScore: structured.score,
      entityClarityScore: entity.score,
      contentReadinessScore: content.score,
      businessConsistencyScore: business.score,
      conversionReadinessScore: conversionScore,
      blockScores: blocks.map((block) => block.citabilityScore),
    },
  });

  return {
    scoringModelVersion: readinessConfig.scoringModelVersion,
    ruleVersion: readinessConfig.ruleVersion,
    score,
    coverage: totalWeight > 0 ? measuredWeight / totalWeight : 0,
    components,
    crawlerAccess,
    blocks,
    pages,
    findings,
    checks: allChecks,
    agentReadiness,
    paidProviderCalls: 0,
    visibilityClaim:
      locale === "ru"
        ? "Готовность — это техническая и контентная готовность сайта, а не наблюдаемая AI-видимость или рекомендация ChatGPT."
        : "Readiness is technical and content readiness, not observed AI visibility or a ChatGPT recommendation.",
  };
}
