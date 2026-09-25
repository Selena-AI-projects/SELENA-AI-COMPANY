import type { SiteProfile, VisibilityLocale } from "../types";

export const AGENT_READINESS_REGISTRY_VERSION = "selena-agent-readiness-2026-08-18-v2" as const;

export type AgentReadinessCategory =
  | "discoverability"
  | "content_accessibility"
  | "bot_access"
  | "protocol_discovery"
  | "commerce"
  | "selena_depth"
  | "local_ai_readiness";

/**
 * "unknown" is a first-class outcome, not a failure: the public crawl did
 * not carry enough evidence to decide either way. It is excluded from
 * scoring exactly like "not_applicable" and is never counted as failed.
 */
export type AgentReadinessStatus = "passed" | "warning" | "failed" | "not_applicable" | "unknown";

export type AgentCheckId =
  | `CF-D0${1 | 2 | 3 | 4}`
  | "CF-C01"
  | `CF-B0${1 | 2 | 3}`
  | `CF-P0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`
  | `CF-X0${1 | 2 | 3 | 4 | 5}`
  | `SE-${"01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10"}`
  | `LA-0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`;

type Localized = Record<VisibilityLocale, string>;

export type AgentReadinessRule = {
  id: AgentCheckId;
  methodologyVersion: typeof AGENT_READINESS_REGISTRY_VERSION;
  title: Localized;
  category: AgentReadinessCategory;
  applicableProfiles: SiteProfile[];
  weight: number;
  collectionMethod: string;
  checkedTarget: string;
  genericFix: Localized;
  verification: Localized;
  doesNotProve: Localized;
  references: readonly string[];
  experimental?: boolean;
};

const ALL: SiteProfile[] = ["all_checks", "content_site", "api_application", "commerce"];
const API: SiteProfile[] = ["all_checks", "api_application", "commerce"];
const COMMERCE: SiteProfile[] = ["all_checks", "commerce"];

function text(en: string, ru: string): Localized {
  return { en, ru };
}

function define(
  id: AgentCheckId,
  category: AgentReadinessCategory,
  title: Localized,
  checkedTarget: string,
  applicableProfiles: SiteProfile[],
  genericFix: Localized,
  verification: Localized,
  options: Pick<AgentReadinessRule, "weight" | "collectionMethod" | "doesNotProve" | "references" | "experimental">,
): AgentReadinessRule {
  return {
    id,
    methodologyVersion: AGENT_READINESS_REGISTRY_VERSION,
    title,
    category,
    applicableProfiles,
    checkedTarget,
    genericFix,
    verification,
    ...options,
  };
}

const WEBSITE_BOUNDARY = text(
  "Passing this check proves only that the public technical signal was observed; it does not prove real AI mentions, citations or recommendations.",
  "Успешная проверка доказывает только наличие публичного технического сигнала; она не доказывает реальные AI-упоминания, цитирования или рекомендации.",
);

const RESCAN = text(
  "Publish the change, then re-scan the same URL and confirm a 2xx response with the expected evidence.",
  "Опубликуйте изменение, затем повторно проверьте тот же URL и подтвердите ответ 2xx с ожидаемым доказательством.",
);

const DOCS = {
  robots: ["https://www.rfc-editor.org/rfc/rfc9309"],
  sitemap: ["https://www.sitemaps.org/protocol.html"],
  link: ["https://www.rfc-editor.org/rfc/rfc8288"],
  dnsAid: ["https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/"],
  markdown: ["https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/"],
  contentSignals: ["https://contentsignals.org/"],
  webBotAuth: ["https://datatracker.ietf.org/doc/draft-meunier-web-bot-auth-architecture/"],
  oauth: ["https://www.rfc-editor.org/rfc/rfc8414"],
  protectedResource: ["https://www.rfc-editor.org/rfc/rfc9728"],
  mcp: ["https://modelcontextprotocol.io/specification/draft/basic/authorization"],
  a2a: ["https://a2a-protocol.org/dev/specification/"],
  schema: ["https://schema.org/docs/documents.html"],
} as const;

const common = {
  weight: 1,
  doesNotProve: WEBSITE_BOUNDARY,
};

/**
 * Boundary for the unscored Local AI Readiness group: readiness of public
 * pages only. Nothing here queries Google, Maps or any local AI surface,
 * and nothing here proves presence in one.
 */
const LOCAL_AI_BOUNDARY = text(
  "This diagnostic reads public website evidence only. It does not prove the brand already appears in Ask Maps or any local AI answers, and no Google or Maps service is queried.",
  "Эта диагностика читает только публичные доказательства на сайте. Она не доказывает появление в Ask Maps / локальных AI-ответах, и запросы к Google или Maps не выполняются.",
);

const localAi = {
  weight: 0,
  doesNotProve: LOCAL_AI_BOUNDARY,
};

export const agentReadinessRuleRegistry: readonly AgentReadinessRule[] = [
  define("CF-D01", "discoverability", text("robots.txt", "robots.txt"), "/robots.txt", ALL,
    text("Publish a valid /robots.txt. Keep private paths disallowed and declare intentional rules for public crawlers.", "Опубликуйте валидный /robots.txt. Закройте приватные пути и явно задайте правила для публичных краулеров."), RESCAN,
    { ...common, collectionMethod: "HTTP GET and deterministic directive parsing", references: DOCS.robots }),
  define("CF-D02", "discoverability", text("Sitemap", "Sitemap"), "/sitemap.xml", ALL,
    text("Publish a valid XML sitemap of canonical public URLs and reference it from robots.txt.", "Опубликуйте валидный XML-файл sitemap с каноническими публичными URL и укажите его в robots.txt."), RESCAN,
    { ...common, collectionMethod: "HTTP GET and XML root inspection", references: DOCS.sitemap }),
  define("CF-D03", "discoverability", text("HTTP Link headers", "Заголовки HTTP Link"), "Homepage response headers", ALL,
    text("Add an HTTP Link header only for a real discovery resource, for example: Link: </sitemap.xml>; rel=\"sitemap\".", "Добавьте заголовок HTTP Link только для реально существующего ресурса для обнаружения, например: Link: </sitemap.xml>; rel=\"sitemap\"."), RESCAN,
    { ...common, collectionMethod: "Homepage response-header inspection", references: DOCS.link }),
  define("CF-D04", "discoverability", text("DNS for AI Discovery (DNS-AID)", "DNS для обнаружения AI-агентов (DNS-AID)"), "index._agents.<domain> / _agents.<domain>", API,
    text("If you operate a public agent, publish DNS-AID SVCB records under the _agents namespace. Otherwise select Content Site so this check is not applicable.", "Если у вас есть публичный агент, опубликуйте DNS-AID SVCB-записи в пространстве _agents. Иначе выберите профиль «Контентный сайт», чтобы проверка не применялась."), RESCAN,
    { ...common, collectionMethod: "Bounded DNS SVCB/HTTPS discovery", references: DOCS.dnsAid }),

  define("CF-C01", "content_accessibility", text("Markdown content negotiation", "Отдача Markdown по заголовку Accept"), "Homepage with Accept: text/markdown", ALL,
    text("Return a Markdown representation when Accept: text/markdown is requested, with Content-Type: text/markdown and the same public facts as the HTML page.", "Возвращайте Markdown-представление при Accept: text/markdown с Content-Type: text/markdown и теми же публичными фактами, что в HTML."), RESCAN,
    { ...common, collectionMethod: "HTTP content negotiation probe", references: DOCS.markdown }),

  define("CF-B01", "bot_access", text("AI bot rules", "Правила AI-ботов"), "/robots.txt", ALL,
    text("Add explicit, intentional rules for the AI user-agents you support. Do not open private or authenticated paths.", "Добавьте явные правила для поддерживаемых AI-краулеров (user-agent). Не открывайте приватные или авторизованные пути."), RESCAN,
    { ...common, collectionMethod: "robots.txt AI user-agent matrix", references: DOCS.robots }),
  define("CF-B02", "bot_access", text("Content Signals", "Content Signals"), "robots.txt / response headers", ALL,
    text("If policy signaling is required, publish valid Content-Signal directives for ai-train, search and ai-input. Keep the policy consistent across scopes.", "Если нужны сигналы о правилах использования контента, опубликуйте валидные директивы Content-Signal для ai-train, search и ai-input и согласуйте их для всех разделов сайта."), RESCAN,
    { ...common, collectionMethod: "robots.txt and HTTP-header token inspection", references: DOCS.contentSignals }),
  define("CF-B03", "bot_access", text("Web Bot Auth", "Web Bot Auth"), "/.well-known/http-message-signatures-directory", API,
    text("For authenticated bots, publish the HTTP Message Signatures directory at the well-known path. Do not expose signing secrets.", "Для аутентифицированных ботов опубликуйте каталог HTTP Message Signatures по стандартному пути /.well-known/. Не раскрывайте секреты подписи."), RESCAN,
    { ...common, collectionMethod: "Well-known resource availability and structure", references: DOCS.webBotAuth }),

  define("CF-P01", "protocol_discovery", text("API Catalog", "Каталог API (API Catalog)"), "/.well-known/api-catalog", API,
    text("Publish an API catalog that points only to maintained, public API descriptions.", "Опубликуйте каталог API со ссылками только на поддерживаемые публичные описания API."), RESCAN,
    { ...common, collectionMethod: "Well-known resource availability and JSON/text structure", references: ["https://www.ietf.org/archive/id/draft-ietf-httpapi-api-catalog-10.html"] }),
  define("CF-P02", "protocol_discovery", text("OAuth/OIDC discovery", "Обнаружение OAuth/OIDC"), "/.well-known/oauth-authorization-server", API,
    text("Publish authorization-server metadata with issuer, authorization_endpoint and token_endpoint, using your real HTTPS endpoints.", "Опубликуйте метаданные сервера авторизации с полями issuer, authorization_endpoint и token_endpoint, указав реальные HTTPS-адреса."), RESCAN,
    { ...common, collectionMethod: "OAuth metadata fetch and required-field validation", references: DOCS.oauth }),
  define("CF-P03", "protocol_discovery", text("OAuth Protected Resource Metadata", "Метаданные защищённого ресурса OAuth"), "/.well-known/oauth-protected-resource", API,
    text("Publish protected-resource metadata with the resource identifier and authorization_servers array.", "Опубликуйте метаданные защищённого ресурса с полем resource и массивом authorization_servers."), RESCAN,
    { ...common, collectionMethod: "RFC 9728 metadata fetch and required-field validation", references: DOCS.protectedResource }),
  define("CF-P04", "protocol_discovery", text("auth.md", "auth.md"), "/auth.md", API,
    text("Publish /auth.md with the supported authentication flow, scopes, public endpoints and safe setup steps. Never include secrets.", "Опубликуйте /auth.md с поддерживаемой схемой аутентификации, областями доступа, публичными адресами API и безопасными шагами настройки. Никогда не включайте секреты."), RESCAN,
    { ...common, collectionMethod: "Markdown resource availability and section inspection", references: DOCS.mcp }),
  define("CF-P05", "protocol_discovery", text("MCP Server Card", "MCP Server Card"), "/.well-known/mcp/server-card.json", API,
    text("Publish a valid MCP Server Card with protocol version, capabilities and public endpoint metadata.", "Опубликуйте валидную MCP Server Card с версией протокола, возможностями и метаданными публичного адреса."), RESCAN,
    { ...common, collectionMethod: "MCP card fetch and JSON structure validation", references: DOCS.mcp }),
  define("CF-P06", "protocol_discovery", text("A2A Agent Card", "A2A Agent Card"), "/.well-known/agent-card.json", API,
    text("Publish an A2A Agent Card with name, description, URL, capabilities and skills. Keep sensitive skills in an authenticated extended card.", "Опубликуйте A2A Agent Card с полями name, description, url, capabilities и skills. Чувствительные навыки держите в защищённой расширенной карточке."), RESCAN,
    { ...common, collectionMethod: "A2A well-known card fetch and JSON structure validation", references: DOCS.a2a }),
  define("CF-P07", "protocol_discovery", text("Agent Skills index", "Индекс навыков агента (Agent Skills)"), "/.well-known/agent-skills/index.json", API,
    text("Publish a versioned skills index that lists public skill names, descriptions and safe resource URLs.", "Опубликуйте версионированный индекс навыков со списком публичных названий, описаний и безопасных URL ресурсов."), RESCAN,
    { ...common, collectionMethod: "Skills index fetch and JSON structure validation", references: ["https://agentskills.io/home"] }),
  define("CF-P08", "protocol_discovery", text("WebMCP", "WebMCP"), "Homepage browser capabilities", API,
    text("Register only intentional browser-side tools through WebMCP, with clear input schemas and read/write annotations.", "Регистрируйте через WebMCP только намеренно открытые инструменты на стороне браузера — с ясными схемами входных данных и пометками чтения и записи."), RESCAN,
    { ...common, collectionMethod: "Static HTML capability-marker inspection; no page code is executed", references: ["https://webmachinelearning.github.io/webmcp/"] }),

  define("CF-X01", "commerce", text("x402", "x402"), "HTTP payment discovery evidence", COMMERCE,
    text("Add x402 only to intentionally paid API routes and document the payment requirements. Do not place wallet secrets in public metadata.", "Добавляйте x402 только на намеренно платные маршруты API и документируйте требования к оплате. Не помещайте секреты кошелька в публичные метаданные."), RESCAN,
    { ...common, collectionMethod: "Public headers, HTML and API-description token inspection", references: ["https://www.x402.org/"] }),
  define("CF-X02", "commerce", text("MPP", "MPP"), "/openapi.json payment metadata", COMMERCE,
    text("Describe payable operations in OpenAPI using the current MPP payment metadata and verify them in test mode before activation.", "Опишите платные операции в OpenAPI с актуальными платёжными метаданными MPP и проверьте их в тестовом режиме до активации."), RESCAN,
    { ...common, collectionMethod: "OpenAPI payment-extension inspection", references: ["https://mpp.dev/"] }),
  define("CF-X03", "commerce", text("UCP", "UCP"), "/.well-known/ucp", COMMERCE,
    text("Publish valid UCP discovery metadata for the commerce capabilities you actually support.", "Опубликуйте валидные метаданные UCP для обнаружения — только для реально поддерживаемых коммерческих возможностей."), RESCAN,
    { ...common, collectionMethod: "UCP well-known resource inspection", references: ["https://ucp.dev/"] }),
  define("CF-X04", "commerce", text("ACP", "ACP"), "/.well-known/acp.json", COMMERCE,
    text("Publish ACP discovery metadata with the real API base URL, protocol version and supported services.", "Опубликуйте метаданные ACP для обнаружения с реальным базовым URL API, версией протокола и поддерживаемыми сервисами."), RESCAN,
    { ...common, collectionMethod: "ACP well-known resource inspection", references: ["https://agenticcommerce.dev/"] }),
  define("CF-X05", "commerce", text("AP2 (experimental)", "AP2 (экспериментально)"), "/.well-known/ap2.json", COMMERCE,
    text("Do not add AP2 solely to raise a score. If an approved AP2 implementation exists, publish its non-secret discovery metadata and document its trust model.", "Не добавляйте AP2 только ради балла. Если есть утверждённая реализация, опубликуйте несекретные метаданные для обнаружения и опишите модель доверия."), RESCAN,
    { ...common, weight: 0, collectionMethod: "Experimental discovery probe; diagnostic only", references: ["https://github.com/google-agentic-commerce/AP2"], experimental: true }),

  define("SE-01", "selena_depth", text("Canonical URL and redirects", "Канонический URL и редиректы"), "Up to five selected pages", ALL,
    text("Use one canonical public URL per page and keep redirect chains short and same-purpose.", "Используйте один канонический публичный URL на страницу и короткие цепочки редиректов, ведущие на страницу того же назначения."), RESCAN,
    { ...common, collectionMethod: "Pinned HTTP crawl and canonical comparison", references: ["https://developers.google.com/search/docs/crawling-indexing/canonicalization"] }),
  define("SE-02", "selena_depth", text("Indexability and status", "Индексируемость и HTTP-статус"), "Up to five selected pages", ALL,
    text("Return a successful status for public pages and remove accidental noindex directives. Keep private pages protected.", "Возвращайте успешный HTTP-статус для публичных страниц и удалите случайные директивы noindex. Приватные страницы оставьте защищёнными."), RESCAN,
    { ...common, collectionMethod: "HTTP status, X-Robots-Tag and meta robots inspection", references: DOCS.robots }),
  define("SE-03", "selena_depth", text("Schema / JSON-LD", "Разметка Schema.org / JSON-LD"), "Public page JSON-LD", ALL,
    text("Add valid JSON-LD for the entity and offer types present on the page. Use only verified business facts.", "Добавьте валидный JSON-LD для сущности и предложений страницы. Используйте только подтверждённые факты бизнеса."), RESCAN,
    { ...common, collectionMethod: "JSON-LD parsing and entity-type inspection", references: DOCS.schema }),
  define("SE-04", "selena_depth", text("Entity clarity", "Ясность сущности"), "Title, H1 and public entity data", ALL,
    text("State one consistent public brand name, offer and location across title, H1, copy and structured data.", "Укажите одно согласованное публичное имя бренда, предложение и локацию в title, H1, тексте и структурированных данных."), RESCAN,
    { ...common, collectionMethod: "Cross-signal entity comparison", references: DOCS.schema }),
  define("SE-05", "selena_depth", text("Multi-page content readiness", "Готовность контента нескольких страниц"), "Homepage plus up to four relevant pages", ALL,
    text("Give each key page a descriptive heading, direct opening answer, verifiable scope and a clear next action.", "Дайте каждой ключевой странице содержательный заголовок, прямой первый ответ, проверяемые границы предложения и ясное следующее действие."), RESCAN,
    { ...common, collectionMethod: "Bounded multi-page content heuristics", references: [] }),
  define("SE-06", "selena_depth", text("Block-level citability", "Цитируемость блоков"), "Visible H1-H3 anchored blocks", ALL,
    text("Rewrite weak blocks so each can stand alone: direct answer, concrete scope, complete sentence and evidence-safe facts.", "Перепишите слабые блоки так, чтобы каждый был самостоятельным: прямой ответ, конкретные границы, законченное предложение и только подтверждённые факты."), RESCAN,
    { ...common, collectionMethod: "Versioned block-level content heuristics", references: [] }),
  define("SE-07", "selena_depth", text("Business fact consistency", "Согласованность бизнес-фактов"), "Public pages and entity data", ALL,
    text("Use the same verified name, location and contact path across public pages and structured data.", "Используйте одинаковые подтверждённые имя, локацию и контактный путь на публичных страницах и в структурированных данных."), RESCAN,
    { ...common, collectionMethod: "Multi-page business-signal comparison", references: DOCS.schema }),
  define("SE-08", "selena_depth", text("Primary action path", "Путь к основному действию"), "Homepage links, forms and machine-readable actions", ALL,
    text("Expose the primary action as a visible labelled control and, where appropriate, a documented machine-readable endpoint.", "Покажите основное действие как видимый подписанный элемент управления и, где уместно, как документированный машиночитаемый API-метод."), RESCAN,
    { ...common, collectionMethod: "Human-readable and machine-readable action detection", references: [] }),
  define("SE-09", "selena_depth", text("llms.txt diagnostic", "Диагностика llms.txt"), "/llms.txt", ALL,
    text("Optionally publish a concise llms.txt that links to canonical public documentation. This diagnostic has zero score weight.", "При желании опубликуйте краткий llms.txt со ссылками на каноническую публичную документацию. Эта диагностика имеет нулевой вес."), RESCAN,
    { ...common, weight: 0, collectionMethod: "HTTP GET; diagnostic only", references: ["https://llmstxt.org/"] }),
  define("SE-10", "selena_depth", text("Commercial fact consistency", "Согласованность коммерческих фактов"), "Visible prices and JSON-LD offers", COMMERCE,
    text("Generate visible prices, metadata, JSON-LD and checkout quotes from one versioned commercial-facts source.", "Формируйте видимые цены, метаданные, JSON-LD и суммы при оформлении заказа из одного версионированного источника коммерческих фактов."), RESCAN,
    { ...common, collectionMethod: "Visible-price and structured-price comparison", references: DOCS.schema }),

  define("LA-01", "local_ai_readiness", text("Business name, category and location in page text", "Имя, категория и локация в тексте страниц"), "Visible text of the crawled public pages", ALL,
    text("State the public business name, what the business does and where it works in plain visible text, not only in markup.", "Назовите публичное имя бизнеса, чем он занимается и где работает обычным видимым текстом, а не только в разметке."), RESCAN,
    { ...localAi, collectionMethod: "Visible-text and structured-name comparison over crawled pages; diagnostic only", references: DOCS.schema }),
  define("LA-02", "local_ai_readiness", text("Address and phone visible in content", "Адрес и телефон видимы в контенте"), "Visible text and links of the crawled public pages", ALL,
    text("Publish the confirmed address and phone as visible page content, for example in the footer or on the contact page.", "Опубликуйте подтверждённые адрес и телефон видимым контентом страницы, например в футере или на странице контактов."), RESCAN,
    { ...localAi, collectionMethod: "Visible-text pattern and tel-link inspection; diagnostic only", references: [] }),
  define("LA-03", "local_ai_readiness", text("Opening hours stated", "Часы работы указаны"), "Visible text and JSON-LD of the crawled public pages", ALL,
    text("State real opening hours in visible text and, where structured data exists, in openingHours or openingHoursSpecification.", "Укажите реальные часы работы видимым текстом и, если есть структурированные данные, в openingHours или openingHoursSpecification."), RESCAN,
    { ...localAi, collectionMethod: "Opening-hours text-pattern and JSON-LD inspection; diagnostic only", references: DOCS.schema }),
  define("LA-04", "local_ai_readiness", text("Dedicated indexable location/contact page", "Отдельная индексируемая страница локации/контактов"), "Crawled contact-role page and location/contact links", ALL,
    text("Publish one indexable location or contact page with the address, contact path and service area, and link it from the homepage.", "Опубликуйте одну индексируемую страницу локации или контактов с адресом, способом связи и географией и дайте на неё ссылку с главной."), RESCAN,
    { ...localAi, collectionMethod: "Crawled-page role and internal-link inspection; diagnostic only", references: [] }),
  define("LA-05", "local_ai_readiness", text("LocalBusiness structured-data completeness", "Полнота структурированных данных LocalBusiness"), "Public page JSON-LD", ALL,
    text("Declare a LocalBusiness-type JSON-LD entity with verified name, address and telephone or openingHours. Use only confirmed business facts.", "Объявите в JSON-LD сущность типа LocalBusiness с подтверждёнными полями name, address и telephone или openingHours. Используйте только подтверждённые факты бизнеса."), RESCAN,
    { ...localAi, collectionMethod: "JSON-LD LocalBusiness field inspection; diagnostic only", references: DOCS.schema }),
  define("LA-06", "local_ai_readiness", text("Structured data matches visible content", "Структурированные данные согласованы с видимым контентом"), "JSON-LD facts versus visible page text", ALL,
    text("Keep every declared structured-data fact — name, phone, locality — repeated in the visible page text so markup and content cannot contradict each other.", "Повторяйте каждый заявленный в структурированных данных факт — имя, телефон, локацию — в видимом тексте страницы, чтобы разметка и контент не противоречили друг другу."), RESCAN,
    { ...localAi, collectionMethod: "Declared-fact versus visible-text comparison; diagnostic only", references: DOCS.schema }),
  define("LA-07", "local_ai_readiness", text("Confirmed Maps link present as reference", "Есть подтверждённая ссылка на Google Maps как источник"), "Public page HTML", ALL,
    text("If a confirmed business Maps listing exists, link it from the site as a public reference. Do not add a link to a listing you do not control.", "Если подтверждённая карточка бизнеса в Google Maps существует, дайте на неё ссылку с сайта как на публичный источник. Не ссылайтесь на карточку, которой не управляете."), RESCAN,
    { ...localAi, collectionMethod: "Static HTML Maps-link pattern inspection; no Google request is made; diagnostic only", references: [] }),
  define("LA-08", "local_ai_readiness", text("Language signals consistent", "Языковые сигналы согласованы"), "html lang attribute versus visible text", ALL,
    text("Declare the page language in <html lang> and keep it consistent with the language of the visible content.", "Объявите язык страницы в <html lang> и держите его согласованным с языком видимого контента."), RESCAN,
    { ...localAi, collectionMethod: "html lang attribute and visible-script comparison; diagnostic only", references: [] }),
  define("LA-09", "local_ai_readiness", text("Parent brand and sub-concepts distinguishable", "Родительский бренд и дочерние концепции различимы"), "Entity names across crawled pages and JSON-LD", ALL,
    text("If one brand operates several distinct concepts, give each its own public name, description and page instead of merging them into one entity.", "Если один бренд ведёт несколько разных концепций, дайте каждой собственное публичное имя, описание и страницу, а не сливайте их в одну сущность."), RESCAN,
    { ...localAi, collectionMethod: "Cross-page entity-name comparison; usually inconclusive from public pages alone; diagnostic only", references: DOCS.schema }),
] as const;

export function getAgentReadinessRule(id: AgentCheckId): AgentReadinessRule {
  const rule = agentReadinessRuleRegistry.find((item) => item.id === id);
  if (!rule) throw new Error(`Missing Agent Readiness rule: ${id}`);
  return rule;
}

/**
 * Russian wording for the checked targets that are descriptions rather than
 * literal paths. Paths and file names are shown verbatim in both locales.
 */
const CHECKED_TARGET_RU: Partial<Record<string, string>> = {
  "Homepage response headers": "Заголовки ответа главной страницы",
  "Homepage with Accept: text/markdown": "Главная страница с заголовком Accept: text/markdown",
  "robots.txt / response headers": "robots.txt / заголовки ответа",
  "Homepage browser capabilities": "Возможности главной страницы в браузере",
  "HTTP payment discovery evidence": "Признаки платёжных протоколов в HTTP-ответах",
  "Up to five selected pages": "До пяти выбранных страниц",
  "Public page JSON-LD": "JSON-LD публичных страниц",
  "Title, H1 and public entity data": "Title, H1 и публичные данные о сущности",
  "Homepage plus up to four relevant pages": "Главная и до четырёх релевантных страниц",
  "Visible H1-H3 anchored blocks": "Видимые блоки под заголовками H1–H3",
  "Public pages and entity data": "Публичные страницы и данные о сущности",
  "Homepage links, forms and machine-readable actions": "Ссылки, формы и машиночитаемые действия главной страницы",
  "Visible prices and JSON-LD offers": "Видимые цены и предложения в JSON-LD",
  "Visible text of the crawled public pages": "Видимый текст прочитанных публичных страниц",
  "Visible text and links of the crawled public pages": "Видимый текст и ссылки прочитанных публичных страниц",
  "Visible text and JSON-LD of the crawled public pages": "Видимый текст и JSON-LD прочитанных публичных страниц",
  "Crawled contact-role page and location/contact links": "Страница контактов и ссылки на локацию и контакты",
  "JSON-LD facts versus visible page text": "Факты в JSON-LD против видимого текста страницы",
  "Public page HTML": "HTML публичных страниц",
  "html lang attribute versus visible text": "Атрибут html lang против языка видимого текста",
  "Entity names across crawled pages and JSON-LD": "Названия сущностей на прочитанных страницах и в JSON-LD",
};

export function localizedRule(rule: AgentReadinessRule, locale: VisibilityLocale) {
  return {
    checkedTarget: locale === "ru" ? CHECKED_TARGET_RU[rule.checkedTarget] ?? rule.checkedTarget : rule.checkedTarget,
    title: rule.title[locale],
    fix: rule.genericFix[locale],
    verification: rule.verification[locale],
    doesNotProve: rule.doesNotProve[locale],
  };
}
