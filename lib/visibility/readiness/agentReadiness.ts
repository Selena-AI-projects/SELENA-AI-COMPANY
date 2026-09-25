import { detectActionReadiness, MAPS_LINK_PATTERNS } from "../checks/actionReadiness";
import { extractHtmlSignals, findServicePageLink, htmlToVisibleText, type HtmlSignals } from "../checks/htmlSignals";
import type { CheckState } from "../checks/technicalChecks";
import type { DiscoveryResult, PublicTextResource } from "../crawler/discover";
import type { PrimaryAction } from "../measurement";
import type { SiteProfile, VisibilityLocale } from "../types";
import { detectPlatform, platformFixFor, type PlatformDetection } from "./platformAdapters";
import {
  AGENT_READINESS_REGISTRY_VERSION,
  agentReadinessRuleRegistry,
  localizedRule,
  type AgentCheckId,
  type AgentReadinessCategory,
  type AgentReadinessRule,
  type AgentReadinessStatus,
} from "./ruleRegistry";

export type AgentReadinessFix = {
  summary: string;
  steps: string[];
  files: string[];
  codeBlocks: string[];
  platform: string;
  platformConfidence: number;
  platformInstruction: string;
};

export type AgentReadinessCheckResult = {
  checkId: AgentCheckId;
  title: string;
  category: AgentReadinessCategory;
  status: AgentReadinessStatus;
  checkedTarget: string;
  evidence: string[];
  explanation: string;
  impact: string;
  fix: AgentReadinessFix;
  verification: string[];
  doesNotProve: string[];
  methodologyVersion: typeof AGENT_READINESS_REGISTRY_VERSION;
  capturedAt: string;
  weight: number;
  diagnosticOnly: boolean;
  references: readonly string[];
};

export type AgentReadinessCategoryScore = {
  id: AgentReadinessCategory;
  label: string;
  score: number | null;
  applicableChecks: number;
  passedChecks: number;
  warningChecks: number;
  failedChecks: number;
  notApplicableChecks: number;
  /** Checks the crawl could not decide either way. Never counted as failed. */
  unknownChecks: number;
};

export type AgentReadinessResult = {
  registryVersion: typeof AGENT_READINESS_REGISTRY_VERSION;
  profile: SiteProfile;
  profileEvidence: string;
  platform: PlatformDetection;
  score: number | null;
  categories: AgentReadinessCategoryScore[];
  checks: AgentReadinessCheckResult[];
};

export type SelenaDepthSummary = {
  technicalStates: CheckState[];
  indexabilityStates: CheckState[];
  structuredDataScore: number | null;
  entityClarityScore: number | null;
  contentReadinessScore: number | null;
  businessConsistencyScore: number | null;
  conversionReadinessScore: number | null;
  blockScores: number[];
};

const CATEGORY_LABELS: Record<VisibilityLocale, Record<AgentReadinessCategory, string>> = {
  en: {
    discoverability: "Discoverability & crawl access",
    content_accessibility: "Content & machine readability",
    bot_access: "Agent controls & trust",
    protocol_discovery: "Protocol & API readiness",
    commerce: "Action & commerce readiness",
    selena_depth: "Entity & citability — Selena layer",
    local_ai_readiness: "Local AI readiness",
  },
  ru: {
    discoverability: "Обнаружимость и доступ краулеров",
    content_accessibility: "Контент и машиночитаемость",
    bot_access: "Управление агентами и доверие",
    protocol_discovery: "Готовность протоколов и API",
    commerce: "Готовность к действиям и покупкам",
    selena_depth: "Сущность и цитируемость — слой Selena",
    local_ai_readiness: "Готовность к локальному AI-поиску",
  },
};

/**
 * "unknown" and "not_applicable" both stay outside scoring: unknown means
 * the crawl carried no decisive evidence, and an absent measurement is
 * never a failing one.
 */
type ScorableStatus = Exclude<AgentReadinessStatus, "not_applicable" | "unknown">;

const STATUS_SCORE: Record<ScorableStatus, number> = {
  passed: 100,
  warning: 50,
  failed: 0,
};

function isScorable(status: AgentReadinessStatus): status is ScorableStatus {
  return status !== "not_applicable" && status !== "unknown";
}

function redactEvidence(value: string): string {
  return value
    .replace(/-----BEGIN[\s\S]{0,120}?-----/gi, "[redacted key material]")
    .replace(/\b(?:sk-|ghp_|AKIA)[A-Za-z0-9_\-]{8,}\b/g, "[redacted token]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+\/-]{8,}/gi, "Bearer [redacted]")
    .replace(/(["']?(?:client_secret|access_token|refresh_token|password)["']?\s*[:=]\s*)["'][^"']+["']/gi, "$1[redacted]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

const RESOURCE_STATUS_RU: Record<PublicTextResource["status"], string> = {
  available: "доступен",
  not_found: "не найден",
  unavailable: "недоступен",
};

function resourceEvidence(resource: PublicTextResource, locale: VisibilityLocale = "en"): string[] {
  const ru = locale === "ru";
  const base = [
    ru
      ? `${resource.url} → ${resource.statusCode ?? "нет HTTP-статуса"} (${RESOURCE_STATUS_RU[resource.status] ?? resource.status})`
      : `${resource.url} → ${resource.statusCode ?? "no HTTP status"} (${resource.status})`,
  ];
  if (resource.body) base.push(redactEvidence(resource.body.slice(0, 500)));
  if (resource.error) base.push(`${ru ? "Предупреждение при сборе" : "Collection warning"}: ${redactEvidence(resource.error)}`);
  return base;
}

function parseObject(body: string | null): Record<string, unknown> | null {
  if (!body) return null;
  try {
    const parsed = JSON.parse(body) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function availableResourceStatus(
  resource: PublicTextResource,
  validator?: (body: string, parsed: Record<string, unknown> | null) => boolean,
): AgentReadinessStatus {
  if (resource.status === "unavailable") return "warning";
  if (resource.status === "not_found" || !resource.body?.trim()) return "failed";
  if (!validator) return "passed";
  return validator(resource.body, parseObject(resource.body)) ? "passed" : "warning";
}

function scoreStatus(score: number | null, passAt = 75, warningAt = 40): AgentReadinessStatus {
  if (score === null) return "warning";
  if (score >= passAt) return "passed";
  return score >= warningAt ? "warning" : "failed";
}

function stateGroupStatus(states: CheckState[]): AgentReadinessStatus {
  const measured = states.filter((state) => state !== "not_measured");
  if (measured.length === 0) return "warning";
  if (measured.some((state) => state === "fail")) return "failed";
  if (measured.some((state) => state === "warn") || measured.length !== states.length) return "warning";
  return "passed";
}

function hasCommerceEvidence(crawl: DiscoveryResult, profile: SiteProfile): boolean {
  if (profile === "commerce") return true;
  const homepage = crawl.pages.find((page) => page.role === "homepage")?.fetch.html ?? "";
  return /add to cart|buy now|checkout|shopping cart|product:price|"@type"\s*:\s*"(?:Product|Offer)"/i.test(homepage);
}

function isApplicable(rule: AgentReadinessRule, profile: SiteProfile, commerceEvidence: boolean): boolean {
  if (rule.category === "commerce" || rule.id === "SE-10") {
    return profile === "commerce" || (profile === "all_checks" && commerceEvidence);
  }
  return rule.applicableProfiles.includes(profile);
}

function codeSnippet(ruleId: AgentCheckId, locale: VisibilityLocale): string[] {
  const snippets: Partial<Record<AgentCheckId, string>> = {
    "CF-D01": "User-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /private/\n\nSitemap: https://example.com/sitemap.xml",
    "CF-D02": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n  <url><loc>https://example.com/</loc></url>\n</urlset>",
    "CF-D03": "Link: </sitemap.xml>; rel=\"sitemap\"",
    "CF-C01": "if (request.headers.get(\"accept\")?.includes(\"text/markdown\")) {\n  return new Response(markdown, { headers: { \"content-type\": \"text/markdown; charset=utf-8\", \"vary\": \"Accept\" } });\n}",
    "CF-B02": "Content-Signal: ai-train=no, search=yes, ai-input=no",
    "CF-P02": "{\n  \"issuer\": \"https://auth.example.com\",\n  \"authorization_endpoint\": \"https://auth.example.com/authorize\",\n  \"token_endpoint\": \"https://auth.example.com/token\"\n}",
    "CF-P03": "{\n  \"resource\": \"https://api.example.com\",\n  \"authorization_servers\": [\"https://auth.example.com\"]\n}",
    "CF-P06": "{\n  \"name\": \"Public agent name\",\n  \"description\": \"Verified public capability\",\n  \"url\": \"https://example.com/a2a\",\n  \"skills\": []\n}",
    "SE-03": "{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Organization\",\n  \"name\": \"[verified public name]\",\n  \"url\": \"https://example.com/\"\n}",
  };
  const snippet = snippets[ruleId];
  if (!snippet) return [];
  return [locale === "ru" ? `Шаблон — замените заглушки только подтверждёнными данными:\n${snippet}` : `Template — replace placeholders only with verified data:\n${snippet}`];
}

type Observation = { status: AgentReadinessStatus; evidence: string[]; explanation: string; impact: string };

/**
 * --- Local AI Readiness (LA-01…LA-09) ---
 *
 * A zero-weight diagnostic group built only from the crawl evidence that
 * was already collected for the other checks. Nothing here performs a
 * network request, and nothing here calls Google, Maps or any local AI
 * surface. Where the public pages do not carry enough evidence to decide,
 * the observation is "unknown" — which is honest, and never a failure.
 */

const LOCAL_BUSINESS_EXTRA_TYPES = new Set([
  "Store",
  "Restaurant",
  "CafeOrCoffeeShop",
  "FoodEstablishment",
  "Hotel",
  "LodgingBusiness",
  "DaySpa",
  "BeautySalon",
  "HealthClub",
  "Dentist",
  "MedicalClinic",
]);

function isLocalBusinessType(type: string): boolean {
  return type === "LocalBusiness" || type.endsWith("Business") || LOCAL_BUSINESS_EXTRA_TYPES.has(type);
}

function normalizeFact(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, " ").trim();
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

const PHONE_TEXT_PATTERN = /\+?\d[\d\s().-]{7,}\d/;
const ADDRESS_KEYWORD_PATTERN = /\b(?:ул\.?|улица|проспект|переулок|street|jalan|jl\.|road|rd\.|avenue|ave\.|boulevard|blvd\.?)\b/i;
const HOURS_TEXT_PATTERN = /\b\d{1,2}[:.]\d{2}\s*(?:[–—-]|to|до)\s*\d{1,2}[:.]\d{2}\b/;
const HOURS_KEYWORD_PATTERN = /opening hours|open daily|working hours|часы работы|режим работы|ежедневно с|открыто с/i;
const LOCATION_LINK_PATTERN = /\/location|\/contacts?|\/address/i;
const CYRILLIC_LANG_PREFIXES = ["ru", "uk", "bg", "sr", "mk", "be", "kk", "ky"];
const LATIN_LANG_PREFIXES = ["en", "id", "de", "fr", "es", "it", "pt", "nl", "pl", "tr", "vi", "ms", "da", "sv", "nb", "no", "fi", "cs", "ro", "hu", "hr", "sk", "et", "lv", "lt"];

type LocalBusinessNodeSummary = {
  name: string | null;
  hasAddress: boolean;
  hasTelephone: boolean;
  hasOpeningHours: boolean;
};

type LocalEntityFacts = {
  names: string[];
  addressTexts: string[];
  localityTexts: string[];
  telephones: string[];
  jsonLdHasOpeningHours: boolean;
  localBusinessNodes: LocalBusinessNodeSummary[];
  jsonLdBlockCount: number;
  jsonLdParseErrors: number;
  nameLocalityPairs: { name: string; locality: string }[];
};

function nodeTypes(record: Record<string, unknown>): string[] {
  const type = record["@type"];
  if (typeof type === "string") return [type];
  if (Array.isArray(type)) return type.filter((item): item is string => typeof item === "string");
  return [];
}

function collectAddressStrings(value: unknown, out: string[], localities: string[]): void {
  if (typeof value === "string") {
    if (value.trim()) out.push(value.trim());
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectAddressStrings(item, out, localities));
    return;
  }
  if (!value || typeof value !== "object") return;
  const record = value as Record<string, unknown>;
  for (const key of ["streetAddress", "addressLocality", "addressRegion", "postalCode", "addressCountry"]) {
    const part = record[key];
    if (typeof part === "string" && part.trim()) {
      out.push(part.trim());
      if (key === "addressLocality" || key === "addressRegion" || key === "addressCountry") localities.push(part.trim());
    }
  }
}

function collectLocalEntityFacts(pages: HtmlSignals[]): LocalEntityFacts {
  const facts: LocalEntityFacts = {
    names: [],
    addressTexts: [],
    localityTexts: [],
    telephones: [],
    jsonLdHasOpeningHours: false,
    localBusinessNodes: [],
    jsonLdBlockCount: 0,
    jsonLdParseErrors: 0,
    nameLocalityPairs: [],
  };
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    const types = nodeTypes(record);
    const name = typeof record.name === "string" ? record.name.trim() : null;
    if (name) facts.names.push(name);
    if (record.address !== undefined) collectAddressStrings(record.address, facts.addressTexts, facts.localityTexts);
    if (typeof record.telephone === "string" && record.telephone.trim()) facts.telephones.push(record.telephone.trim());
    const hasHours = record.openingHours !== undefined || record.openingHoursSpecification !== undefined;
    if (hasHours) facts.jsonLdHasOpeningHours = true;
    if (types.some(isLocalBusinessType)) {
      facts.localBusinessNodes.push({
        name,
        hasAddress: record.address !== undefined,
        hasTelephone: typeof record.telephone === "string" && record.telephone.trim().length > 0,
        hasOpeningHours: hasHours,
      });
    }
    if (name && types.some((type) => type === "Organization" || isLocalBusinessType(type))) {
      const localities: string[] = [];
      collectAddressStrings(record.address, [], localities);
      for (const locality of localities) facts.nameLocalityPairs.push({ name, locality });
    }
    for (const nested of Object.values(record)) visit(nested);
  };
  for (const signals of pages) {
    facts.jsonLdBlockCount += signals.jsonLdBlocks.length;
    facts.jsonLdParseErrors += signals.jsonLdParseErrors;
    signals.jsonLdBlocks.forEach(visit);
  }
  return facts;
}

type LocalScanAnalysis = {
  pagesRead: number;
  visibleText: string;
  normalizedText: string;
  visibleDigits: string;
  rawHtml: string;
  hasTelLink: boolean;
  homepageLang: string | null;
  homepageH1: string | null;
  hasServiceLink: boolean;
  contactPage: DiscoveryResult["pages"][number] | null;
  facts: LocalEntityFacts;
};

function analyzeLocalSignals(crawl: DiscoveryResult): LocalScanAnalysis {
  const readable = crawl.pages.filter(
    (page) => page.fetch.statusCode >= 200 && page.fetch.statusCode < 300 && Boolean(page.fetch.html),
  );
  const perPageSignals = readable.map((page) => extractHtmlSignals(page.fetch.html ?? ""));
  const homepageIndex = readable.findIndex((page) => page.role === "homepage");
  const homepageSignals = homepageIndex >= 0 ? perPageSignals[homepageIndex] : null;
  const visibleText = perPageSignals.map((signals) => signals.visibleText).join(" \n ");
  const contactPage = crawl.pages.find((page) => page.role === "contact") ?? null;
  return {
    pagesRead: readable.length,
    visibleText,
    normalizedText: normalizeFact(visibleText),
    visibleDigits: digitsOnly(visibleText),
    rawHtml: readable.map((page) => page.fetch.html ?? "").join("\n"),
    hasTelLink: perPageSignals.some((signals) => signals.links.some((link) => /^tel:/i.test(link.href))),
    homepageLang: homepageSignals?.htmlLang ?? null,
    homepageH1: homepageSignals?.h1Text ?? null,
    hasServiceLink: perPageSignals.some((signals) => Boolean(findServicePageLink(signals))),
    contactPage,
    facts: collectLocalEntityFacts(perPageSignals),
  };
}

function observeLocalAiRule(id: AgentCheckId, crawl: DiscoveryResult, locale: VisibilityLocale): Observation {
  const ru = locale === "ru";
  const t = (en: string, ruText: string): string => (ru ? ruText : en);
  const observed = (status: AgentReadinessStatus, evidence: string[], en: string, ruText: string): Observation => ({
    status,
    evidence: evidence.map(redactEvidence).filter(Boolean),
    explanation: ru ? ruText : en,
    impact: t(
      "This zero-weight diagnostic describes how clearly public pages state the business and its location. It never measures presence in Ask Maps or local AI answers, and it makes no Google or Maps request.",
      "Эта диагностика с нулевым весом описывает, насколько ясно публичные страницы называют бизнес и его локацию. Она не измеряет присутствие в Ask Maps или локальных AI-ответах и не делает запросов к Google или Maps.",
    ),
  });
  const analysis = analyzeLocalSignals(crawl);

  if (analysis.pagesRead === 0) {
    return observed(
      "unknown",
      [t(
        "Not enough data: no public page HTML could be read, so no local-readiness observation was made.",
        "Недостаточно данных: не удалось прочитать HTML публичных страниц, поэтому наблюдение о локальной готовности не сделано.",
      )],
      "The diagnostic needs readable public page content.",
      "Диагностике нужен читаемый публичный контент страниц.",
    );
  }
  const thinText = analysis.visibleText.trim().length < 40;
  const thinTextEvidence = t(
    `Not enough data: only ${analysis.visibleText.trim().length} visible characters were extracted from the pages read.`,
    `Недостаточно данных: из прочитанных страниц извлечено только ${analysis.visibleText.trim().length} видимых символов.`,
  );

  if (id === "LA-01") {
    if (thinText) return observed("unknown", [thinTextEvidence], "Visible page text was too thin to observe name, category or location.", "Видимого текста слишком мало, чтобы наблюдать имя, категорию или локацию.");
    const nameVisible = analysis.facts.names.some((name) => normalizeFact(name) && analysis.normalizedText.includes(normalizeFact(name))) || Boolean(analysis.homepageH1);
    const locationTokens = [...analysis.facts.localityTexts, ...analysis.facts.addressTexts];
    const locationVisible = locationTokens.some((token) => normalizeFact(token) && analysis.normalizedText.includes(normalizeFact(token)));
    const categoryEvidence = analysis.facts.localBusinessNodes.length > 0 || crawl.pages.some((page) => page.role === "service") || analysis.hasServiceLink;
    const evidence = [
      t(`Name signal visible: ${nameVisible ? "yes" : "no"}`, `Имя видно в тексте: ${nameVisible ? "да" : "нет"}`),
      t(`Location signal visible: ${locationVisible ? "yes" : "no"}`, `Локация видна в тексте: ${locationVisible ? "да" : "нет"}`),
      t(`Category evidence observed: ${categoryEvidence ? "yes" : "no"}`, `Доказательство категории найдено: ${categoryEvidence ? "да" : "нет"}`),
    ];
    if (!nameVisible && analysis.facts.names.length === 0) {
      return observed("warning", evidence, "No public business-name signal was found in headings, visible text or structured data of the pages read.", "На прочитанных страницах не найден публичный сигнал имени бизнеса — ни в заголовках, ни в тексте, ни в структурированных данных.");
    }
    if (nameVisible && locationVisible && categoryEvidence) {
      return observed("passed", evidence, "Name, location and category signals were all observed in visible page content.", "Сигналы имени, локации и категории наблюдаются в видимом контенте страниц.");
    }
    return observed(
      "unknown",
      [...evidence, t(
        "Not enough data to confirm every signal: the crawl found no comparable location or category token, which does not prove one is absent from the site.",
        "Недостаточно данных, чтобы подтвердить все сигналы: краул не нашёл сопоставимый токен локации или категории, но это не доказывает их отсутствие на сайте.",
      )],
      "Some of the three signals could not be confirmed from the crawled pages alone.",
      "Часть из трёх сигналов не удалось подтвердить только по прочитанным страницам.",
    );
  }

  if (id === "LA-02") {
    if (thinText) return observed("unknown", [thinTextEvidence], "Visible page text was too thin to observe address or phone.", "Видимого текста слишком мало, чтобы наблюдать адрес или телефон.");
    const phoneVisible =
      analysis.hasTelLink ||
      PHONE_TEXT_PATTERN.test(analysis.visibleText) ||
      analysis.facts.telephones.some((tel) => digitsOnly(tel).length >= 7 && analysis.visibleDigits.includes(digitsOnly(tel)));
    const addressVisible =
      analysis.facts.addressTexts.some((token) => normalizeFact(token) && analysis.normalizedText.includes(normalizeFact(token))) ||
      ADDRESS_KEYWORD_PATTERN.test(analysis.visibleText);
    const evidence = [
      t(`Phone visible in content: ${phoneVisible ? "yes" : "no"}`, `Телефон виден в контенте: ${phoneVisible ? "да" : "нет"}`),
      t(`Address visible in content: ${addressVisible ? "yes" : "no"}`, `Адрес виден в контенте: ${addressVisible ? "да" : "нет"}`),
    ];
    if (phoneVisible && addressVisible) {
      return observed("passed", evidence, "Both an address signal and a phone signal were observed in visible page content.", "И адрес, и телефон наблюдаются в видимом контенте страниц.");
    }
    return observed("warning", evidence, "At least one of address or phone was not found in the visible content of the pages read.", "Как минимум один из сигналов — адрес или телефон — не найден в видимом контенте прочитанных страниц.");
  }

  if (id === "LA-03") {
    if (thinText && !analysis.facts.jsonLdHasOpeningHours) return observed("unknown", [thinTextEvidence], "Neither text nor structured data carried an opening-hours observation.", "Ни текст, ни структурированные данные не дали наблюдения о часах работы.");
    const hoursInText = HOURS_TEXT_PATTERN.test(analysis.visibleText) || HOURS_KEYWORD_PATTERN.test(analysis.visibleText);
    const evidence = [
      t(`openingHours / openingHoursSpecification in JSON-LD: ${analysis.facts.jsonLdHasOpeningHours ? "present" : "not present"}`, `openingHours / openingHoursSpecification в JSON-LD: ${analysis.facts.jsonLdHasOpeningHours ? "есть" : "нет"}`),
      t(`Opening-hours pattern in visible text: ${hoursInText ? "found" : "not found"}`, `Паттерн часов работы в видимом тексте: ${hoursInText ? "найден" : "не найден"}`),
    ];
    if (analysis.facts.jsonLdHasOpeningHours || hoursInText) {
      return observed("passed", evidence, "An opening-hours signal was observed in visible text or structured data.", "Сигнал часов работы наблюдается в видимом тексте или структурированных данных.");
    }
    return observed("warning", evidence, "No opening-hours signal was found in visible text or JSON-LD of the pages read.", "Сигнал часов работы не найден ни в видимом тексте, ни в JSON-LD прочитанных страниц.");
  }

  if (id === "LA-04") {
    const contact = analysis.contactPage;
    if (contact && contact.fetch.statusCode >= 200 && contact.fetch.statusCode < 300 && contact.fetch.html) {
      return observed("passed", [`${contact.fetch.finalUrl} → HTTP ${contact.fetch.statusCode}`], "A dedicated contact-role page was read successfully within the bounded crawl.", "Отдельная страница контактов прочитана успешно в рамках ограниченного краула.");
    }
    if (contact) {
      return observed("warning", [`${contact.requestedUrl} → HTTP ${contact.fetch.statusCode || "no status"}`], "A contact page is linked, but it could not be read successfully.", "Страница контактов есть в ссылках, но её не удалось успешно прочитать.");
    }
    const locationLink = analysis.rawHtml
      ? crawl.pages
          .filter((page) => page.fetch.html)
          .flatMap((page) => extractHtmlSignals(page.fetch.html ?? "").links)
          .find((link) => LOCATION_LINK_PATTERN.test(link.href))
      : undefined;
    if (locationLink) {
      return observed(
        "unknown",
        [t(
          `A location/contact link was observed (${locationLink.href}), but the page itself was outside the bounded five-page crawl, so it was not read.`,
          `Найдена ссылка на локацию/контакты (${locationLink.href}), но сама страница осталась за пределами ограниченного краула из пяти страниц и не была прочитана.`,
        )],
        "The link exists; whether the page is indexable could not be observed within the crawl limit.",
        "Ссылка существует; индексируемость самой страницы нельзя наблюдать в пределах лимита краула.",
      );
    }
    return observed("warning", [t("No dedicated location/contact page or link was found on the pages read.", "На прочитанных страницах не найдено ни отдельной страницы локации/контактов, ни ссылки на неё.")], "No dedicated location or contact page was discoverable from the crawled pages.", "Отдельную страницу локации или контактов не удалось обнаружить по прочитанным страницам.");
  }

  if (id === "LA-05") {
    if (analysis.facts.jsonLdBlockCount === 0) {
      const evidence = [t(
        `No JSON-LD blocks were found on the pages read${analysis.facts.jsonLdParseErrors > 0 ? ` (${analysis.facts.jsonLdParseErrors} block(s) failed to parse)` : ""}.`,
        `На прочитанных страницах не найдено блоков JSON-LD${analysis.facts.jsonLdParseErrors > 0 ? ` (${analysis.facts.jsonLdParseErrors} блок(ов) не разобрались)` : ""}.`,
      )];
      return observed("warning", evidence, "There is no LocalBusiness-type structured data to inspect.", "Структурированных данных типа LocalBusiness для проверки нет.");
    }
    const nodes = analysis.facts.localBusinessNodes;
    if (nodes.length === 0) {
      return observed("warning", [t("Structured data is present, but no LocalBusiness-type entity was declared.", "Структурированные данные есть, но сущность типа LocalBusiness не объявлена.")], "Only non-local entity types were found in JSON-LD.", "В JSON-LD найдены только нелокальные типы сущностей.");
    }
    const complete = nodes.find((node) => node.name && node.hasAddress && (node.hasTelephone || node.hasOpeningHours));
    if (complete) {
      return observed("passed", [t(
        `A LocalBusiness-type entity declares name, address and ${complete.hasTelephone ? "telephone" : "openingHours"}.`,
        `Сущность типа LocalBusiness объявляет name, address и ${complete.hasTelephone ? "telephone" : "openingHours"}.`,
      )], "A LocalBusiness-type entity carries the minimum local fact set.", "Сущность типа LocalBusiness содержит минимальный набор локальных фактов.");
    }
    const first = nodes[0];
    const missing = [
      !first.name ? "name" : null,
      !first.hasAddress ? "address" : null,
      !first.hasTelephone && !first.hasOpeningHours ? "telephone/openingHours" : null,
    ].filter(Boolean);
    return observed("warning", [t(`A LocalBusiness-type entity exists but is missing: ${missing.join(", ")}.`, `Сущность типа LocalBusiness есть, но в ней не хватает: ${missing.join(", ")}.`)], "The declared LocalBusiness entity is incomplete.", "Объявленная сущность LocalBusiness неполна.");
  }

  if (id === "LA-06") {
    const declaredNames = analysis.facts.names.filter((name) => normalizeFact(name));
    const declaredPhones = analysis.facts.telephones.filter((tel) => digitsOnly(tel).length >= 7);
    const declaredLocalities = analysis.facts.localityTexts.filter((token) => normalizeFact(token));
    if (declaredNames.length === 0 && declaredPhones.length === 0 && declaredLocalities.length === 0) {
      return observed(
        "unknown",
        [t(
          "Not enough data: no comparable structured-data facts (name, telephone, locality) were declared, so no contradiction can be measured.",
          "Недостаточно данных: в структурированных данных не объявлено сопоставимых фактов (name, telephone, локация), поэтому противоречие измерить нечем.",
        )],
        "There is nothing declared to compare against the visible content.",
        "Нет заявленных фактов, которые можно сравнить с видимым контентом.",
      );
    }
    if (thinText) return observed("unknown", [thinTextEvidence], "Declared facts exist, but the visible text was too thin to compare against.", "Заявленные факты есть, но видимого текста слишком мало для сравнения.");
    const missing: string[] = [];
    for (const name of declaredNames) {
      if (!analysis.normalizedText.includes(normalizeFact(name))) missing.push(`name "${name}"`);
    }
    for (const tel of declaredPhones) {
      if (!analysis.visibleDigits.includes(digitsOnly(tel))) missing.push(`telephone ${tel}`);
    }
    for (const locality of declaredLocalities) {
      if (!analysis.normalizedText.includes(normalizeFact(locality))) missing.push(`locality "${locality}"`);
    }
    const unique = [...new Set(missing)];
    if (unique.length === 0) {
      return observed("passed", [t("Every declared structured-data fact was also found in the visible page text.", "Каждый заявленный в структурированных данных факт найден и в видимом тексте страниц.")], "Structured data and visible content agree on the compared facts.", "Структурированные данные и видимый контент согласованы по сравниваемым фактам.");
    }
    return observed("warning", [t(`Declared in structured data but not found in visible text: ${unique.slice(0, 4).join("; ")}.`, `Заявлено в структурированных данных, но не найдено в видимом тексте: ${unique.slice(0, 4).join("; ")}.`)], "Some declared facts are not corroborated by the visible content.", "Часть заявленных фактов не подтверждается видимым контентом.");
  }

  if (id === "LA-07") {
    const matched = MAPS_LINK_PATTERNS.filter((pattern) => pattern.test(analysis.rawHtml));
    const noRequestNote = t("Static HTML inspection only; no Google or Maps request was made.", "Только инспекция статического HTML; запросы к Google или Maps не выполнялись.");
    if (matched.length > 0) {
      return observed("passed", [t(`Maps link pattern observed in public HTML: ${matched.map(String).join(", ")}`, `Шаблон ссылки на Google Maps найден в публичном HTML: ${matched.map(String).join(", ")}`), noRequestNote], "A Maps reference link is present in the public HTML.", "Ссылка на Google Maps присутствует в публичном HTML как источник.");
    }
    return observed("warning", [t("No Maps reference link was observed in the public HTML of the pages read.", "Maps-ссылка не найдена в публичном HTML прочитанных страниц."), noRequestNote], "No Maps reference link was found; only add one for a confirmed listing.", "Maps-ссылка не найдена; добавляйте её только для подтверждённой карточки.");
  }

  if (id === "LA-08") {
    const lang = analysis.homepageLang?.toLowerCase() ?? null;
    if (!lang) {
      return observed("warning", [t("The homepage <html> tag declares no lang attribute.", "Тег <html> главной страницы не объявляет атрибут lang.")], "Without a declared language, machines must guess the content language.", "Без объявленного языка машинам приходится угадывать язык контента.");
    }
    const cyrillic = (analysis.visibleText.match(/[а-яё]/gi) ?? []).length;
    const latin = (analysis.visibleText.match(/[a-z]/gi) ?? []).length;
    const evidence = [
      `html lang="${lang}"`,
      t(`Visible letters — Cyrillic: ${cyrillic}, Latin: ${latin}`, `Видимые буквы — кириллица: ${cyrillic}, латиница: ${latin}`),
    ];
    if (cyrillic + latin < 40) {
      return observed("unknown", [...evidence, t("Not enough visible letters to classify the content language.", "Недостаточно видимых букв, чтобы классифицировать язык контента.")], "The content language could not be classified from the text volume read.", "Язык контента нельзя классифицировать по прочитанному объёму текста.");
    }
    const langPrefix = lang.split("-", 1)[0] ?? lang;
    const expectsCyrillic = CYRILLIC_LANG_PREFIXES.includes(langPrefix);
    const expectsLatin = LATIN_LANG_PREFIXES.includes(langPrefix);
    if (!expectsCyrillic && !expectsLatin) {
      return observed("unknown", [...evidence, t(`The declared language "${lang}" is outside the script classes this diagnostic can classify.`, `Объявленный язык "${lang}" вне классов письменности, которые различает эта диагностика.`)], "The declared language cannot be checked against the visible script.", "Объявленный язык нельзя сверить с видимой письменностью.");
    }
    const dominant = cyrillic > latin * 2 ? "cyrillic" : latin > cyrillic * 2 ? "latin" : "mixed";
    if (dominant === "mixed") {
      return observed("unknown", [...evidence, t("The visible text mixes scripts, so consistency could not be classified either way.", "Видимый текст смешивает письменности, поэтому согласованность нельзя классифицировать однозначно.")], "Mixed-script content cannot be classified deterministically.", "Контент со смешанной письменностью нельзя классифицировать детерминированно.");
    }
    const consistent = (expectsCyrillic && dominant === "cyrillic") || (expectsLatin && dominant === "latin");
    if (consistent) {
      return observed("passed", evidence, "The declared html lang matches the dominant script of the visible content.", "Объявленный html lang согласован с доминирующей письменностью видимого контента.");
    }
    return observed("warning", evidence, "The declared html lang does not match the dominant script of the visible content.", "Объявленный html lang не согласован с доминирующей письменностью видимого контента.");
  }

  if (id === "LA-09") {
    const byName = new Map<string, Set<string>>();
    for (const pair of analysis.facts.nameLocalityPairs) {
      const key = normalizeFact(pair.name);
      if (!key) continue;
      const set = byName.get(key) ?? new Set<string>();
      set.add(normalizeFact(pair.locality));
      byName.set(key, set);
    }
    const merged = [...byName.entries()].find(([, localities]) => localities.size > 1);
    if (merged) {
      return observed("warning", [t(
        `The same entity name is declared with ${merged[1].size} different localities in structured data.`,
        `Одно и то же имя сущности объявлено в структурированных данных с ${merged[1].size} разными локациями.`,
      )], "One entity name spans several localities; distinct concepts may be merged into one entity.", "Одно имя сущности покрывает несколько локаций; разные концепции могут быть слиты в одну сущность.");
    }
    const distinctNames = new Set(analysis.facts.names.map(normalizeFact).filter(Boolean));
    const evidence = distinctNames.size <= 1
      ? [t(
          "Not enough data: only one public entity name was observed, so whether separate sub-concepts exist cannot be determined from public pages alone.",
          "Недостаточно данных: наблюдается только одно публичное имя сущности, поэтому наличие отдельных дочерних концепций нельзя определить только по публичным страницам.",
        )]
      : [t(
          `Multiple entity names were observed (${[...distinctNames].slice(0, 4).join(", ")}); public pages alone cannot confirm whether each concept is a distinct entity.`,
          `Наблюдается несколько имён сущностей (${[...distinctNames].slice(0, 4).join(", ")}); только по публичным страницам нельзя подтвердить, что каждая концепция — отдельная сущность.`,
        )];
    return observed("unknown", evidence, "Public pages rarely carry enough evidence to decide this; unknown is the honest outcome.", "Публичные страницы редко содержат достаточно доказательств для вывода; «Неизвестно» — честный результат.");
  }

  return observed("unknown", [t("No deterministic local-readiness observation was produced.", "Детерминированное наблюдение локальной готовности не построено.")], "The diagnostic produced no observation.", "Диагностика не дала наблюдения.");
}

function observeRule(
  id: AgentCheckId,
  options: {
    crawl: DiscoveryResult;
    summary: SelenaDepthSummary;
    primaryAction: PrimaryAction;
    locale: VisibilityLocale;
    commerceEvidence: boolean;
  },
): Observation {
  const { crawl, summary, primaryAction, locale } = options;
  const ru = locale === "ru";
  const homepage = crawl.pages.find((page) => page.role === "homepage")?.fetch;
  const html = homepage?.html ?? "";
  const headers = homepage?.headers ?? {};
  const t = (en: string, ruText: string): string => (ru ? ruText : en);
  const none = t("none", "нет");
  const notMeasured = t("not measured", "не измерено");
  const observed = (status: AgentReadinessStatus, evidence: string[], en: string, ruText: string): Observation => ({
    status,
    evidence: evidence.map(redactEvidence).filter(Boolean),
    explanation: ru ? ruText : en,
    impact: ru
      ? "Этот сигнал влияет на способность машин обнаружить, прочитать или безопасно использовать публичный ресурс."
      : "This signal affects whether machines can discover, read or safely use the public resource.",
  });

  if (id === "CF-D01") {
    const status = crawl.robots.status === "available" ? "passed" : crawl.robots.status === "not_found" ? "failed" : "warning";
    return observed(status, resourceEvidence(crawl.robots, locale), "robots.txt was fetched and inspected for public crawler rules.", "robots.txt загружен и проверен на правила публичных краулеров.");
  }
  if (id === "CF-D02") {
    const status = availableResourceStatus(crawl.sitemap, (body) => /<(?:urlset|sitemapindex)\b/i.test(body));
    return observed(status, resourceEvidence(crawl.sitemap, locale), "The sitemap endpoint and XML root were inspected.", "Проверены адрес sitemap и корневой XML-элемент.");
  }
  if (id === "CF-D03") {
    const link = headers.link ?? "";
    return observed(link && /<[^>]+>\s*;\s*rel=/i.test(link) ? "passed" : "failed", [t(`Homepage Link header: ${link || "not present"}`, `Заголовок Link главной страницы: ${link || "отсутствует"}`)], "The homepage response was checked for typed discovery links.", "Ответ главной страницы проверен на типизированные ссылки для обнаружения ресурсов.");
  }
  if (id === "CF-D04") {
    const status = crawl.dnsAid.status === "available" ? "passed" : crawl.dnsAid.status === "not_found" ? "failed" : "warning";
    return observed(status, [...crawl.dnsAid.ownerNames.map((name) => t(`DNS query: ${name}`, `DNS-запрос: ${name}`)), ...crawl.dnsAid.records.slice(0, 4), crawl.dnsAid.error ?? ""], "DNS-AID owner names were queried without treating draft metadata as a trust signal.", "Имена владельцев DNS-AID запрошены; черновые метаданные не считаются сигналом доверия.");
  }
  if (id === "CF-C01") {
    const item = crawl.markdownRepresentation;
    const status = item.status === "unavailable" ? "warning" : item.status === "available" && /^text\/markdown/i.test(item.contentType ?? "") ? "passed" : "failed";
    return observed(status, [t(`GET ${item.url} with Accept: text/markdown → ${item.statusCode ?? "no status"}`, `GET ${item.url} с Accept: text/markdown → ${item.statusCode ?? "нет статуса"}`), `Content-Type: ${item.contentType ?? t("not present", "отсутствует")}`], "The homepage was requested with Markdown content negotiation.", "Главная страница запрошена с заголовком Accept: text/markdown.");
  }
  if (id === "CF-B01") {
    if (crawl.robots.status !== "available") return observed(crawl.robots.status === "not_found" ? "failed" : "warning", resourceEvidence(crawl.robots, locale), "Named AI bot policy could not be confirmed.", "Явную политику для AI-ботов подтвердить не удалось.");
    const body = crawl.robots.body ?? "";
    const agents = [...body.matchAll(/User-agent:\s*(OAI-SearchBot|ChatGPT-User|GPTBot|Google-Extended|ClaudeBot|PerplexityBot)/gi)].map((match) => match[1]);
    return observed(agents.length > 0 ? "passed" : "warning", [t(`Named AI user-agents found: ${agents.join(", ") || "none"}`, `Найдены правила для AI-краулеров: ${agents.join(", ") || "нет"}`)], "robots.txt was inspected for named AI user-agent groups and wildcard fallback.", "robots.txt проверен на группы правил для названных AI-краулеров и общее правило для всех (*).");
  }
  if (id === "CF-B02") {
    const combined = `${crawl.robots.body ?? ""}\n${headers["content-signal"] ?? headers["content-signals"] ?? ""}`;
    const matches = combined.match(/Content-Signal[^\n]*/gi) ?? [];
    return observed(matches.length > 0 ? "passed" : "warning", [`Content Signals: ${matches.slice(0, 3).join(" | ") || t("not observed", "не обнаружены")}`], "Public policy signals were inspected without inferring legal permission.", "Публичные сигналы о правилах использования контента проверены без вывода о юридическом разрешении.");
  }
  if (id === "CF-B03") {
    const resource = crawl.agentResources.webBotAuth;
    return observed(availableResourceStatus(resource), resourceEvidence(resource, locale), "The Web Bot Auth discovery directory was fetched.", "Запрошен каталог ключей Web Bot Auth.");
  }

  const resourceByProtocol: Partial<Record<AgentCheckId, keyof DiscoveryResult["agentResources"]>> = {
    "CF-P01": "apiCatalog",
    "CF-P02": "oauthDiscovery",
    "CF-P03": "oauthProtectedResource",
    "CF-P04": "authMd",
    "CF-P05": "mcpServerCard",
    "CF-P06": "a2aAgentCard",
    "CF-P07": "agentSkills",
  };
  const resourceKey = resourceByProtocol[id];
  if (resourceKey) {
    const resource = crawl.agentResources[resourceKey];
    const validators: Partial<Record<AgentCheckId, (body: string, parsed: Record<string, unknown> | null) => boolean>> = {
      "CF-P01": (body) => /api|openapi|href|url/i.test(body),
      "CF-P02": (_body, parsed) => Boolean(parsed?.issuer && parsed.authorization_endpoint && parsed.token_endpoint),
      "CF-P03": (_body, parsed) => Boolean(parsed?.resource && Array.isArray(parsed.authorization_servers)),
      "CF-P04": (body) => /auth|oauth|scope|token/i.test(body),
      "CF-P05": (_body, parsed) => Boolean(parsed && (parsed.capabilities || parsed.serverInfo || parsed.endpoint || parsed.protocolVersion)),
      "CF-P06": (_body, parsed) => Boolean(parsed?.name && parsed.url && Array.isArray(parsed.skills)),
      "CF-P07": (_body, parsed) => Boolean(parsed && (Array.isArray(parsed.skills) || Array.isArray(parsed.items))),
    };
    return observed(availableResourceStatus(resource, validators[id]), resourceEvidence(resource, locale), "The standardized public discovery resource was fetched and checked for minimum structure.", "Стандартизированный публичный ресурс для обнаружения загружен и проверен на минимальную структуру.");
  }
  if (id === "CF-P08") {
    const markers = ["navigator.modelContext", "modelContext.registerTool", "WebMCP"].filter((marker) => html.includes(marker));
    return observed(markers.length > 0 ? "passed" : "failed", [t(`Static HTML markers: ${markers.join(", ") || "none"}`, `Маркеры в статическом HTML: ${markers.join(", ") || "нет"}`), t("Scanned HTML only; page JavaScript was not executed.", "Проверен только HTML; JavaScript страницы не выполнялся.")], "Public HTML was inspected for explicit WebMCP capability registration.", "Публичный HTML проверен на явную регистрацию возможностей WebMCP.");
  }

  if (id === "CF-X01") {
    const combined = `${JSON.stringify(headers)} ${html.slice(0, 50_000)} ${crawl.agentResources.openApi.body ?? ""}`;
    const markers = combined.match(/x402|PAYMENT-REQUIRED|X-PAYMENT/gi) ?? [];
    return observed(markers.length > 0 ? "passed" : "failed", [t(`x402 markers: ${[...new Set(markers)].join(", ") || "none"}`, `Маркеры x402: ${[...new Set(markers)].join(", ") || "нет"}`)], "Public payment-discovery evidence was inspected; no transaction was attempted.", "Проверены публичные признаки платёжных протоколов; транзакция не выполнялась.");
  }
  if (id === "CF-X02") {
    const resource = crawl.agentResources.openApi;
    return observed(availableResourceStatus(resource, (body) => /x-payment-info|mpp/i.test(body)), resourceEvidence(resource, locale), "OpenAPI was inspected for MPP payment metadata; no payment was attempted.", "OpenAPI проверен на платёжные метаданные MPP; платёж не выполнялся.");
  }
  if (id === "CF-X03" || id === "CF-X04" || id === "CF-X05") {
    const key = id === "CF-X03" ? "ucp" : id === "CF-X04" ? "acp" : "ap2";
    const resource = crawl.agentResources[key];
    return observed(availableResourceStatus(resource, (_body, parsed) => Boolean(parsed)), resourceEvidence(resource, locale), "The public commerce discovery document was fetched; no checkout or payment was started.", "Публичный документ для обнаружения коммерческих возможностей загружен; оформление заказа и платёж не запускались.");
  }

  if (id.startsWith("LA-")) return observeLocalAiRule(id, crawl, locale);

  if (id === "SE-01") {
    const canonicalEvidence = crawl.pages.map((page) => {
      const canonical = page.fetch.html ? extractHtmlSignals(page.fetch.html).canonicalUrl : null;
      if (!canonical) return { line: t(`${page.fetch.finalUrl} → canonical not present`, `${page.fetch.finalUrl} → canonical отсутствует`), mismatch: false };
      try {
        const actual = new URL(page.fetch.finalUrl);
        const declared = new URL(canonical, actual);
        const normalized = (value: URL) => `${value.origin}${value.pathname.replace(/\/$/, "") || "/"}`;
        return {
          line: `${page.fetch.finalUrl} → canonical ${declared.toString()}`,
          mismatch: normalized(actual) !== normalized(declared),
        };
      } catch {
        return { line: t(`${page.fetch.finalUrl} → malformed canonical ${canonical}`, `${page.fetch.finalUrl} → некорректный canonical ${canonical}`), mismatch: true };
      }
    });
    const base = stateGroupStatus(summary.technicalStates);
    const status = canonicalEvidence.some((item) => item.mismatch) ? "failed" : base;
    return observed(status, [t(`Pages inspected: ${crawl.pages.length}`, `Проверено страниц: ${crawl.pages.length}`), ...crawl.pages.map((page) => `${page.requestedUrl} → ${page.fetch.finalUrl}`), ...canonicalEvidence.map((item) => item.line)], "Redirect outcomes and canonical evidence were compared across selected pages.", "Результаты редиректов и canonical-сигналы сопоставлены по выбранным страницам.");
  }
  if (id === "SE-02") return observed(stateGroupStatus(summary.indexabilityStates), crawl.pages.map((page) => `${page.fetch.finalUrl} → HTTP ${page.fetch.statusCode}`), "Status codes and indexability directives were checked per page.", "HTTP-статусы и директивы индексации проверены для каждой страницы.");
  if (id === "SE-03") return observed(scoreStatus(summary.structuredDataScore), [t(`Structured-data score: ${summary.structuredDataScore ?? "not measured"}`, `Балл структурированных данных: ${summary.structuredDataScore ?? notMeasured}`)], "Public JSON-LD was parsed and checked for entity-like types.", "Публичный JSON-LD разобран и проверен на типы сущностей.");
  if (id === "SE-04") return observed(scoreStatus(summary.entityClarityScore), [t(`Entity-clarity score: ${summary.entityClarityScore ?? "not measured"}`, `Балл ясности сущности: ${summary.entityClarityScore ?? notMeasured}`)], "Title, H1 and structured entity names were compared.", "Сопоставлены title, H1 и имена сущностей в структурированных данных.");
  if (id === "SE-05") return observed(scoreStatus(summary.contentReadinessScore), [t(`Content-readiness score: ${summary.contentReadinessScore ?? "not measured"}`, `Балл готовности контента: ${summary.contentReadinessScore ?? notMeasured}`), t(`Selected page roles: ${crawl.pages.map((page) => page.role).join(", ")}`, `Роли выбранных страниц: ${crawl.pages.map((page) => page.role).join(", ")}`)], "Up to five relevant public pages were inspected with provenance.", "До пяти релевантных публичных страниц проверены с указанием источника каждого наблюдения.");
  if (id === "SE-06") {
    const average = summary.blockScores.length ? Math.round(summary.blockScores.reduce((sum, value) => sum + value, 0) / summary.blockScores.length) : null;
    return observed(scoreStatus(average), [t(`Blocks measured: ${summary.blockScores.length}`, `Оценено блоков: ${summary.blockScores.length}`), t(`Average block readiness: ${average ?? "not measured"}`, `Средняя готовность блоков: ${average ?? notMeasured}`)], "Heading-anchored blocks were scored with versioned extractability heuristics.", "Блоки с заголовками оценены версионированными эвристиками извлекаемости.");
  }
  if (id === "SE-07") return observed(scoreStatus(summary.businessConsistencyScore, 70, 40), [t(`Business-consistency score: ${summary.businessConsistencyScore ?? "not measured"}`, `Балл согласованности бизнес-данных: ${summary.businessConsistencyScore ?? notMeasured}`)], "Public name, location and contact-path signals were compared.", "Сопоставлены публичные сигналы имени, локации и способа связи.");
  if (id === "SE-08") {
    const signals = html ? extractHtmlSignals(html) : null;
    const readiness = signals ? detectActionReadiness(signals, primaryAction, html) : null;
    return observed(readiness ? (readiness.humanReady.state === "pass" ? (readiness.machineReadable.state === "pass" ? "passed" : "warning") : "failed") : "warning", [t(`Primary action: ${primaryAction}`, `Основное действие: ${primaryAction}`), t(`Human-ready: ${readiness?.humanReady.state ?? "not measured"}`, `Готово для человека: ${readiness?.humanReady.state ?? notMeasured}`), t(`Machine-readable: ${readiness?.machineReadable.state ?? "not measured"}`, `Машиночитаемо: ${readiness?.machineReadable.state ?? notMeasured}`)], "The declared primary action was checked separately for human and machine readability.", "Заявленное основное действие отдельно проверено на понятность для человека и машиночитаемость.");
  }
  if (id === "SE-09") return observed(crawl.llmsTxt.status === "available" && Boolean(crawl.llmsTxt.body?.trim()) ? "passed" : crawl.llmsTxt.status === "unavailable" ? "warning" : "failed", resourceEvidence(crawl.llmsTxt, locale), "llms.txt is reported as a zero-weight diagnostic, never as a ranking factor.", "llms.txt показан как диагностика с нулевым весом, а не как фактор ранжирования.");
  if (id === "SE-10") {
    const visible = new Set((htmlToVisibleText(html).match(/(?:US\$|\$)\s?\d[\d,.]*/g) ?? []).map((value) => value.replace(/[^\d.]/g, "")));
    const signals = html ? extractHtmlSignals(html) : null;
    const structured = new Set<string>();
    const visit = (value: unknown): void => {
      if (Array.isArray(value)) return value.forEach(visit);
      if (!value || typeof value !== "object") return;
      const record = value as Record<string, unknown>;
      if (typeof record.price === "string" || typeof record.price === "number") structured.add(String(record.price).replace(/[^\d.]/g, ""));
      Object.values(record).forEach(visit);
    };
    signals?.jsonLdBlocks.forEach(visit);
    const missing = [...structured].filter((price) => price && !visible.has(price));
    const status: AgentReadinessStatus = structured.size === 0 || visible.size === 0 ? "warning" : missing.length === 0 ? "passed" : "failed";
    return observed(status, [t(`Visible USD values: ${[...visible].join(", ") || "none"}`, `Видимые суммы в USD: ${[...visible].join(", ") || none}`), t(`Structured prices: ${[...structured].join(", ") || "none"}`, `Цены в структурированных данных: ${[...structured].join(", ") || none}`), t(`Structured values absent from visible copy: ${missing.join(", ") || "none"}`, `Цены из разметки, которых нет в видимом тексте: ${missing.join(", ") || none}`)], "Visible and structured price values were compared without assuming that different offers should have the same price.", "Видимые цены и цены в структурированных данных сопоставлены без предположения, что разные предложения должны стоить одинаково.");
  }

  return observed("warning", [t("No deterministic observation was produced.", "Детерминированное наблюдение не получено.")], "The check could not be confirmed.", "Проверку не удалось подтвердить.");
}

const PROFILE_LABEL_RU: Record<SiteProfile, string> = {
  all_checks: "все проверки",
  content_site: "контентный сайт",
  api_application: "API / приложение",
  commerce: "коммерция",
};

function profileEvidence(profile: SiteProfile, commerceEvidence: boolean, locale: VisibilityLocale): string {
  const label = profile.replaceAll("_", " ");
  return locale === "ru"
    ? `Профиль выбран пользователем: ${PROFILE_LABEL_RU[profile]}. Признаки коммерции ${commerceEvidence ? "обнаружены" : "не обнаружены"}; неприменимые проверки исключены из балла.`
    : `User-selected profile: ${label}. Commerce evidence was ${commerceEvidence ? "observed" : "not observed"}; non-applicable checks are excluded from scoring.`;
}

export function buildAgentReadiness(options: {
  crawl: DiscoveryResult;
  siteProfile: SiteProfile;
  locale: VisibilityLocale;
  primaryAction: PrimaryAction;
  capturedAt: string;
  summary: SelenaDepthSummary;
}): AgentReadinessResult {
  const { crawl, siteProfile, locale, primaryAction, capturedAt, summary } = options;
  const commerceEvidence = hasCommerceEvidence(crawl, siteProfile);
  const platform = detectPlatform(crawl);
  const checks = agentReadinessRuleRegistry.map((rule): AgentReadinessCheckResult => {
    const copy = localizedRule(rule, locale);
    const applicable = isApplicable(rule, siteProfile, commerceEvidence);
    const observation = applicable
      ? observeRule(rule.id, { crawl, summary, primaryAction, locale, commerceEvidence })
      : {
          status: "not_applicable" as const,
          evidence: [locale === "ru" ? `Профиль «${PROFILE_LABEL_RU[siteProfile]}»: проверка не применяется и не влияет на балл.` : `Profile ${siteProfile}: this check is not applicable and does not affect the score.`],
          explanation: locale === "ru" ? "Проверка исключена по профилю и наблюдаемому типу сайта." : "The check is excluded by the selected profile and observed site type.",
          impact: locale === "ru" ? "«Не применяется» не является ошибкой." : "Not applicable is not a defect.",
        };
    const adapter = platformFixFor(rule.id, platform, locale);
    const checkedTarget = copy.checkedTarget
      .replace("<domain>", new URL(crawl.baseUrl).hostname);
    return {
      checkId: rule.id,
      title: copy.title,
      category: rule.category,
      status: observation.status,
      checkedTarget,
      evidence: observation.evidence,
      explanation: observation.explanation,
      impact: observation.impact,
      fix: {
        summary: copy.fix,
        steps: [copy.fix, adapter.instruction],
        files: checkedTarget.startsWith("/") ? [checkedTarget] : [],
        codeBlocks: codeSnippet(rule.id, locale),
        platform: adapter.platform,
        platformConfidence: adapter.confidence,
        platformInstruction: adapter.instruction,
      },
      verification: [copy.verification],
      doesNotProve: [copy.doesNotProve],
      methodologyVersion: AGENT_READINESS_REGISTRY_VERSION,
      capturedAt,
      weight: rule.weight,
      diagnosticOnly: rule.weight === 0,
      references: rule.references,
    };
  });

  const categories = (Object.keys(CATEGORY_LABELS[locale]) as AgentReadinessCategory[]).map((id) => {
    const items = checks.filter((item) => item.category === id);
    const weighted = items.filter((item) => isScorable(item.status) && item.weight > 0);
    const denominator = weighted.reduce((sum, item) => sum + item.weight, 0);
    const earned = weighted.reduce((sum, item) => sum + STATUS_SCORE[item.status as ScorableStatus] * item.weight, 0);
    return {
      id,
      label: CATEGORY_LABELS[locale][id],
      score: denominator > 0 ? Math.round(earned / denominator) : null,
      applicableChecks: items.filter((item) => item.status !== "not_applicable").length,
      passedChecks: items.filter((item) => item.status === "passed").length,
      warningChecks: items.filter((item) => item.status === "warning").length,
      failedChecks: items.filter((item) => item.status === "failed").length,
      notApplicableChecks: items.filter((item) => item.status === "not_applicable").length,
      unknownChecks: items.filter((item) => item.status === "unknown").length,
    };
  });
  const weighted = checks.filter((item) => isScorable(item.status) && item.weight > 0);
  const denominator = weighted.reduce((sum, item) => sum + item.weight, 0);
  const earned = weighted.reduce((sum, item) => sum + STATUS_SCORE[item.status as ScorableStatus] * item.weight, 0);

  return {
    registryVersion: AGENT_READINESS_REGISTRY_VERSION,
    profile: siteProfile,
    profileEvidence: profileEvidence(siteProfile, commerceEvidence, locale),
    platform,
    score: denominator > 0 ? Math.round(earned / denominator) : null,
    categories,
    checks,
  };
}
