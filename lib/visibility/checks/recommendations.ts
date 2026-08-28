import type { VisibilityLocale } from "../types";
import type { ReadinessEvidence, ReadinessEvidenceKey } from "./actionReadiness";

/**
 * One concrete fix per rule (V1.2: the report must say not only what is
 * wrong, but what to do about it). Every recommendation states an action
 * the owner can actually take — never "improve your AI visibility".
 */

export type Severity = "critical" | "important" | "later";

export interface Recommendation {
  severity: Severity;
  title: string;
  action: string;
  /** The honest limit — what fixing this does and does not achieve. */
  doesNotProve: string;
}

type RuleId = string;

const EN: Record<RuleId, Recommendation> = {
  "identity.facts_agree": {
    severity: "important",
    title: "Two pages state different facts about the same business",
    action:
      "Choose one source of truth for the phone, address, price range and menu facts, publish it in the structured data of every page, and correct the pages that say something else.",
    doesNotProve:
      "Pages that agree remove a contradiction a model would otherwise resolve on its own; they do not make the facts themselves correct.",
  },
  "access.robots_unambiguous": {
    severity: "important",
    title: "robots.txt says different things to different crawlers",
    action:
      "Give each crawler exactly one group in robots.txt: merge the duplicate User-agent blocks and remove the rules a wildcard group already contradicts, so every reader reaches the same verdict.",
    doesNotProve:
      "One clear verdict tells you who is allowed in; it does not mean the crawlers that are allowed in will come.",
  },
  "access.noindex_covers_locales": {
    severity: "important",
    title: "A page is hidden in one language and open in another",
    action:
      "Decide whether this page should be indexed at all, then apply the same directive to every language version of it, including the addresses the sitemap offers for crawling.",
    doesNotProve:
      "Matching directives make the intent readable; they do not decide which of the two versions was right.",
  },
  "identity.author_named": {
    severity: "important",
    title: "Nothing on the page says who wrote it",
    action:
      "Name a person as the author in the page markup and show the same name on the page, linked to a profile that describes them.",
    doesNotProve: "An author's name makes a claim attributable; it does not make the claim authoritative.",
  },
  "identity.dated": {
    severity: "important",
    title: "The page publishes no date",
    action:
      "Publish datePublished and dateModified in the page markup, and show the same dates to the reader.",
    doesNotProve: "A date proves when the page changed, not that the content is correct or current.",
  },
  "identity.same_as": {
    severity: "important",
    title: "The business points at no profile of its own anywhere else",
    action:
      "Add sameAs to the organization markup, listing the profiles that are really yours, and link them from the page as well.",
    doesNotProve: "Linked profiles let a model connect the name to you; they do not make it mention you.",
  },
  "offer.comparison_readable": {
    severity: "important",
    title: "The comparison is not built as a table",
    action:
      "Rebuild the comparison as a real table with header cells, and give every mark a text equivalent instead of an icon alone.",
    doesNotProve: "A readable table makes the comparison parsable; it does not make it persuasive.",
  },
  "access.cacheable": {
    severity: "later",
    title: "The page forbids caching",
    action:
      "Drop no-store from the cache-control header on public pages, or replace it with a short max-age, so a repeated fetch is not a full round trip.",
    doesNotProve: "Caching affects speed and crawl cost; it does not affect whether a page is understood.",
  },
  "access.fetchable": {
    severity: "critical",
    title: "The page could not be fetched cleanly",
    action:
      "Check that the homepage returns HTTP 200 over HTTPS without a redirect chain, and that bot protection is not blocking well-behaved crawlers.",
    doesNotProve: "A clean fetch does not prove the page is indexed or used by any AI system.",
  },
  "access.noindex": {
    severity: "critical",
    title: "The page asks search engines not to index it",
    action:
      "Remove the noindex directive from the meta robots tag and the X-Robots-Tag header on pages you want discovered.",
    doesNotProve: "Removing noindex does not by itself cause indexing or recommendation.",
  },
  "access.canonical": {
    severity: "important",
    title: "No canonical URL is declared",
    action:
      "Add a self-referencing canonical link on the homepage so machines know which URL is authoritative.",
    doesNotProve: "A canonical tag is a hint, not a guarantee of which URL gets used.",
  },
  "access.viewport": {
    severity: "important",
    title: "No mobile viewport is declared",
    action: "Add a viewport meta tag so the page renders correctly on phones.",
    doesNotProve: "A viewport tag does not make the layout itself usable — check it on a real phone.",
  },
  "access.sitemap_discovered": {
    severity: "later",
    title: "No sitemap.xml was found",
    action:
      "Publish a sitemap.xml listing your canonical URLs and reference it from robots.txt.",
    doesNotProve: "A sitemap does not force indexing; it only makes discovery easier.",
  },
  "identity.jsonld_valid": {
    severity: "important",
    title: "Structured data is missing or does not parse",
    action:
      "Add valid JSON-LD, or fix the syntax error in the existing block so it can be read at all.",
    doesNotProve: "Valid schema is machine-readable corroboration — it is not a ranking or citation factor.",
  },
  "identity.jsonld_entity_present": {
    severity: "important",
    title: "No Organization or LocalBusiness entity is declared",
    action:
      "Add an Organization (or LocalBusiness) JSON-LD block with name, url, logo and sameAs links to your real profiles.",
    doesNotProve: "Declaring an entity does not prove any system will use it to describe you.",
  },
  "identity.brand_name_consistent": {
    severity: "critical",
    title: "The brand name is inconsistent across surfaces",
    action:
      "Pick one canonical brand name and use it identically in the page title, the H1 and the structured data.",
    doesNotProve: "Consistency does not prove an AI engine will name the brand correctly.",
  },
  "offer.title_present": {
    severity: "critical",
    title: "The page has no usable title",
    action: "Write a title that names the business and what it actually sells, in under 60 characters.",
    doesNotProve: "A good title does not by itself change how any AI system answers.",
  },
  "offer.single_h1": {
    severity: "important",
    title: "The page does not have exactly one H1",
    action:
      "Use a single H1 that states the primary offer. Demote the rest to H2 so the hierarchy is unambiguous.",
    doesNotProve: "Heading structure is a clarity signal, not a guarantee of comprehension.",
  },
  "offer.service_page_discovered": {
    severity: "critical",
    title: "No dedicated service or product page was discoverable",
    action:
      "Publish a page describing the primary offer and link it directly from the homepage navigation.",
    doesNotProve: "Its existence does not prove it will be found or cited.",
  },
  "conversion.contact_path_present": {
    severity: "critical",
    title: "No clear contact path was found",
    action:
      "Put a direct contact method — phone, WhatsApp, email or a form — in the header or above the fold.",
    doesNotProve: "A visible contact path proves human readiness only, not agent execution.",
  },
  "conversion.about_page_discovered": {
    severity: "later",
    title: "No About page was discoverable",
    action: "Publish an About page describing who runs the business, and link it from the homepage.",
    doesNotProve: "An About page supports trust signals; it does not establish authority by itself.",
  },
  "action.human_ready": {
    severity: "critical",
    title: "A customer cannot easily complete the primary action",
    action:
      "Make the chosen primary action reachable in one step from the homepage, with the required inputs stated before the flow starts.",
    doesNotProve: "Human readiness says nothing about whether a machine or agent can complete the same action.",
  },
  "action.machine_readable": {
    severity: "important",
    title: "The primary action is not exposed in structured form",
    action:
      "Describe the action in JSON-LD — for a booking, a ReserveAction or Reservation with the parameters it needs.",
    doesNotProve: "Structured markup does not prove the action can actually be completed programmatically.",
  },
  "action.agent_executable": {
    severity: "later",
    title: "An agent cannot complete the action end to end",
    action:
      "If agent traffic matters to you, expose a documented endpoint with a schema.org potentialAction / EntryPoint and return a machine-verifiable confirmation.",
    doesNotProve:
      "Most sites fail this today. It is a forward-looking capability, not a current ranking factor — treat it as optional unless agent traffic is part of your strategy.",
  },
  "crawler.access": {
    severity: "critical",
    title: "robots.txt blocks a named AI crawler",
    action:
      "Review the matched robots.txt group and remove the root-level Disallow only for crawlers you intentionally want to permit. Keep private paths blocked explicitly.",
    doesNotProve:
      "Allowing a crawler permits access; it does not prove crawling, indexing, citation or recommendation.",
  },
  "citability.block": {
    severity: "important",
    title: "This content block is difficult to extract as a standalone answer",
    action:
      "Open with one direct answer sentence, then add concrete scope, location, conditions or evidence in the same block under a descriptive heading.",
    doesNotProve:
      "A more citable block is a readiness improvement, not proof that any AI system will cite it.",
  },
  "content.readiness": {
    severity: "important",
    title: "The visible content is too thin or weakly structured",
    action:
      "Add a concise answer-first description of the business, its offer, audience, location and next action, split under descriptive headings.",
    doesNotProve: "More complete content does not guarantee rankings, mentions or citations.",
  },
  "business.consistency": {
    severity: "important",
    title: "Public business signals are incomplete or hard to corroborate",
    action:
      "Use the same business name, service area and contact path in visible copy and valid Organization or LocalBusiness structured data.",
    doesNotProve: "Consistent business data does not establish authority or recommendation by itself.",
  },
  "LA-01": {
    severity: "later",
    title: "Business name, category or location is not stated in visible page text",
    action:
      "State the public business name, what the business does and where it works in plain visible text on the pages machines read first.",
    doesNotProve:
      "Clear name, category and location copy does not prove the brand appears in Ask Maps or local AI answers.",
  },
  "LA-02": {
    severity: "later",
    title: "Address or phone is not visible in page content",
    action:
      "Publish the confirmed address and phone as visible content — for example in the footer or on the contact page — not only inside markup.",
    doesNotProve:
      "A visible address and phone do not prove the brand appears in Ask Maps or local AI answers.",
  },
  "LA-03": {
    severity: "later",
    title: "Opening hours are not stated",
    action:
      "State real opening hours in visible text and, where structured data exists, in openingHours or openingHoursSpecification.",
    doesNotProve: "Published opening hours do not prove the brand appears in Ask Maps or local AI answers.",
  },
  "LA-04": {
    severity: "later",
    title: "No dedicated indexable location or contact page was confirmed",
    action:
      "Publish one indexable location or contact page with the address, contact path and service area, and link it from the homepage.",
    doesNotProve:
      "A dedicated location page does not prove the brand appears in Ask Maps or local AI answers.",
  },
  "LA-05": {
    severity: "later",
    title: "LocalBusiness structured data is missing or incomplete",
    action:
      "Declare a LocalBusiness-type JSON-LD entity with verified name, address and telephone or openingHours, using only confirmed facts.",
    doesNotProve:
      "Complete LocalBusiness markup does not prove the brand appears in Ask Maps or local AI answers.",
  },
  "LA-06": {
    severity: "later",
    title: "Structured data facts are not corroborated by visible content",
    action:
      "Repeat every declared structured-data fact — name, phone, locality — in the visible page text so markup and content cannot contradict each other.",
    doesNotProve:
      "Agreement between markup and content does not prove the brand appears in Ask Maps or local AI answers.",
  },
  "LA-07": {
    severity: "later",
    title: "No confirmed Maps reference link was found in the public HTML",
    action:
      "If a confirmed business Maps listing exists, link it from the site as a public reference. Never add a link to a listing you do not control.",
    doesNotProve:
      "A Maps reference link does not prove the brand appears in Ask Maps or local AI answers; this check never queries Google.",
  },
  "LA-08": {
    severity: "later",
    title: "Language signals are inconsistent or undeclared",
    action:
      "Declare the page language in the <html lang> attribute and keep it consistent with the language of the visible content.",
    doesNotProve:
      "Consistent language signals do not prove the brand appears in Ask Maps or local AI answers.",
  },
  "LA-09": {
    severity: "later",
    title: "Parent brand and sub-concepts may not be distinguishable",
    action:
      "If one brand operates several distinct concepts, give each its own public name, description and page instead of merging them into one entity.",
    doesNotProve:
      "Distinct entities do not prove the brand appears in Ask Maps or local AI answers; public pages alone rarely settle this either way.",
  },
};

const RU: Record<RuleId, Recommendation> = {
  "identity.facts_agree": {
    severity: "important",
    title: "Две страницы сообщают разные факты об одном бизнесе",
    action:
      "Выберите один источник правды для телефона, адреса, диапазона цен и состава предложения, опубликуйте его в структурированных данных каждой страницы и исправьте страницы, которые говорят другое.",
    doesNotProve:
      "Согласованные страницы убирают противоречие, которое модель иначе разрешает сама; они не делают сами факты верными.",
  },
  "access.robots_unambiguous": {
    severity: "important",
    title: "robots.txt отвечает разным краулерам по-разному",
    action:
      "Оставьте каждому краулеру ровно одну группу в robots.txt: объедините повторяющиеся блоки User-agent и уберите правила, которым уже противоречит группа со звёздочкой, чтобы любой читатель приходил к одному выводу.",
    doesNotProve:
      "Однозначный ответ показывает, кого пускают; он не означает, что допущенные краулеры придут.",
  },
  "access.noindex_covers_locales": {
    severity: "important",
    title: "Страница закрыта на одном языке и открыта на другом",
    action:
      "Решите, должна ли эта страница индексироваться вообще, и примените одну и ту же директиву ко всем её языковым версиям, включая адреса, которые sitemap отдаёт на обход.",
    doesNotProve:
      "Совпадающие директивы делают намерение читаемым; они не решают, какая из двух версий была права.",
  },
  "identity.author_named": {
    severity: "important",
    title: "На странице не сказано, кто её написал",
    action:
      "Укажите человека автором в разметке страницы и покажите то же имя в тексте со ссылкой на страницу, где о нём написано.",
    doesNotProve: "Имя автора делает утверждение приписываемым, но не делает его авторитетным.",
  },
  "identity.dated": {
    severity: "important",
    title: "Страница не публикует дату",
    action:
      "Добавьте datePublished и dateModified в разметку и покажите те же даты читателю.",
    doesNotProve: "Дата говорит, когда страница менялась, но не о том, что содержание верное или актуальное.",
  },
  "identity.same_as": {
    severity: "important",
    title: "Бизнес нигде не ссылается на свои профили",
    action:
      "Добавьте sameAs в разметку организации, перечислив профили, которые действительно ваши, и поставьте на них ссылки со страницы.",
    doesNotProve: "Связанные профили позволяют модели привязать имя к вам, но не заставляют её вас называть.",
  },
  "offer.comparison_readable": {
    severity: "important",
    title: "Сравнение свёрстано не таблицей",
    action:
      "Соберите сравнение настоящей таблицей с заголовочными ячейками и дайте каждой отметке текстовый эквивалент, а не только значок.",
    doesNotProve: "Читаемая таблица делает сравнение разбираемым, но не делает его убедительным.",
  },
  "access.cacheable": {
    severity: "later",
    title: "Страница запрещает кэширование",
    action:
      "Уберите no-store из заголовка cache-control на публичных страницах или замените его коротким max-age, чтобы повторный запрос не шёл до сервера целиком.",
    doesNotProve: "Кэш влияет на скорость и стоимость обхода, но не на то, понята ли страница.",
  },
  "access.fetchable": {
    severity: "critical",
    title: "Страницу не удалось корректно загрузить",
    action:
      "Проверьте, что главная отдаёт HTTP 200 по HTTPS без цепочки редиректов и что защита от ботов не блокирует добросовестные краулеры.",
    doesNotProve: "Успешная загрузка не доказывает, что страница проиндексирована или используется AI.",
  },
  "access.noindex": {
    severity: "critical",
    title: "Страница просит поисковые системы её не индексировать",
    action:
      "Уберите директиву noindex из meta robots и заголовка X-Robots-Tag на страницах, которые должны находиться.",
    doesNotProve: "Снятие noindex само по себе не вызывает индексацию или рекомендацию.",
  },
  "access.canonical": {
    severity: "important",
    title: "Не объявлен canonical URL",
    action:
      "Добавьте самоссылающийся canonical на главной, чтобы машинам был понятен основной адрес страницы.",
    doesNotProve: "Canonical — это подсказка, а не гарантия того, какой URL будет использован.",
  },
  "access.viewport": {
    severity: "important",
    title: "Не объявлен мобильный viewport",
    action: "Добавьте meta viewport, чтобы страница корректно отображалась на телефонах.",
    doesNotProve: "Тег viewport не делает саму вёрстку удобной — проверьте на реальном телефоне.",
  },
  "access.sitemap_discovered": {
    severity: "later",
    title: "Не найден sitemap.xml",
    action: "Опубликуйте sitemap.xml с каноническими URL и сошлитесь на него из robots.txt.",
    doesNotProve: "Sitemap не заставляет индексировать — он только облегчает обнаружение.",
  },
  "identity.jsonld_valid": {
    severity: "important",
    title: "Структурированные данные отсутствуют или не разбираются",
    action: "Добавьте валидный JSON-LD или исправьте синтаксическую ошибку в существующем блоке.",
    doesNotProve:
      "Валидная schema — машиночитаемое подтверждение, а не фактор ранжирования или цитирования.",
  },
  "identity.jsonld_entity_present": {
    severity: "important",
    title: "Не объявлена сущность Organization или LocalBusiness",
    action:
      "Добавьте блок JSON-LD Organization (или LocalBusiness) с name, url, logo и sameAs на ваши реальные профили.",
    doesNotProve: "Объявление сущности не доказывает, что её используют для описания вас.",
  },
  "identity.brand_name_consistent": {
    severity: "critical",
    title: "Название бренда несогласовано между поверхностями",
    action:
      "Выберите одно каноничное название и используйте его одинаково в title, H1 и структурированных данных.",
    doesNotProve: "Согласованность не доказывает, что AI-система назовёт бренд правильно.",
  },
  "offer.title_present": {
    severity: "critical",
    title: "У страницы нет пригодного title",
    action: "Напишите title, который называет бизнес и то, что он продаёт, в пределах 60 символов.",
    doesNotProve: "Хороший title сам по себе не меняет то, как отвечает AI-система.",
  },
  "offer.single_h1": {
    severity: "important",
    title: "На странице не ровно один H1",
    action:
      "Оставьте один H1 с основным предложением, остальные заголовки понизьте до H2 — иерархия станет однозначной.",
    doesNotProve: "Структура заголовков — сигнал ясности, а не гарантия понимания.",
  },
  "offer.service_page_discovered": {
    severity: "critical",
    title: "Не найдена отдельная страница услуги или продукта",
    action:
      "Опубликуйте страницу с описанием основного предложения и дайте на неё прямую ссылку из навигации на главной.",
    doesNotProve: "Её существование не доказывает, что её найдут или процитируют.",
  },
  "conversion.contact_path_present": {
    severity: "critical",
    title: "Не найден понятный путь к контакту",
    action:
      "Разместите прямой способ связи — телефон, WhatsApp, email или форму — в шапке или в первом экране.",
    doesNotProve: "Видимый контакт доказывает только готовность для человека, но не выполнение агентом.",
  },
  "conversion.about_page_discovered": {
    severity: "later",
    title: "Не найдена страница «О нас»",
    action: "Опубликуйте страницу о том, кто стоит за бизнесом, и сошлитесь на неё с главной.",
    doesNotProve: "Страница «О нас» поддерживает доверие, но сама по себе не создаёт экспертность.",
  },
  "action.human_ready": {
    severity: "critical",
    title: "Клиенту сложно выполнить основное действие",
    action:
      "Сделайте выбранное основное действие доступным в один шаг с главной и укажите нужные данные до начала оформления.",
    doesNotProve: "Готовность для человека ничего не говорит о том, справится ли машина или агент.",
  },
  "action.machine_readable": {
    severity: "important",
    title: "Основное действие не представлено в структурированном виде",
    action:
      "Опишите действие в JSON-LD — для бронирования это ReserveAction или Reservation с нужными параметрами.",
    doesNotProve: "Разметка не доказывает, что действие реально выполнимо программно.",
  },
  "action.agent_executable": {
    severity: "later",
    title: "Агент не может выполнить действие от начала до конца",
    action:
      "Если агентский трафик для вас важен — откройте документированный endpoint с schema.org potentialAction / EntryPoint и возвращайте машинопроверяемое подтверждение.",
    doesNotProve:
      "Сегодня это не проходят почти все сайты. Это задел на будущее, а не текущий фактор ранжирования — считайте опциональным, если агенты не входят в вашу стратегию.",
  },
  "crawler.access": {
    severity: "critical",
    title: "robots.txt блокирует указанный AI-краулер",
    action:
      "Проверьте совпавшую группу robots.txt и снимите корневой Disallow только для тех краулеров, которым осознанно разрешаете доступ. Приватные пути оставьте явно закрытыми.",
    doesNotProve:
      "Разрешение даёт технический доступ, но не доказывает обход, индексацию, цитирование или рекомендацию.",
  },
  "citability.block": {
    severity: "important",
    title: "Этот блок сложно извлечь как самостоятельный ответ",
    action:
      "Начните с одного прямого предложения-ответа, затем в том же блоке добавьте конкретный scope, локацию, условия или evidence под содержательным заголовком.",
    doesNotProve:
      "Более цитируемый блок улучшает readiness, но не доказывает, что AI-система его процитирует.",
  },
  "content.readiness": {
    severity: "important",
    title: "Видимый контент слишком краткий или слабо структурирован",
    action:
      "Добавьте короткое answer-first описание бизнеса, предложения, аудитории, локации и следующего действия и разделите его содержательными заголовками.",
    doesNotProve: "Более полный контент не гарантирует позиции, упоминания или цитирование.",
  },
  "business.consistency": {
    severity: "important",
    title: "Публичные данные о бизнесе неполны или плохо подтверждают друг друга",
    action:
      "Используйте одинаковое имя бизнеса, географию и путь к контакту в видимом тексте и валидной разметке Organization или LocalBusiness.",
    doesNotProve: "Согласованные данные сами по себе не создают авторитет или рекомендацию.",
  },
  "LA-01": {
    severity: "later",
    title: "Имя, категория или локация бизнеса не названы в видимом тексте страниц",
    action:
      "Назовите публичное имя бизнеса, чем он занимается и где работает обычным видимым текстом на страницах, которые машины читают первыми.",
    doesNotProve:
      "Ясные имя, категория и локация не доказывают появление бренда в Ask Maps или локальных AI-ответах.",
  },
  "LA-02": {
    severity: "later",
    title: "Адрес или телефон не виден в контенте страниц",
    action:
      "Опубликуйте подтверждённые адрес и телефон видимым контентом — например, в футере или на странице контактов, — а не только в разметке.",
    doesNotProve:
      "Видимые адрес и телефон не доказывают появление бренда в Ask Maps или локальных AI-ответах.",
  },
  "LA-03": {
    severity: "later",
    title: "Часы работы не указаны",
    action:
      "Укажите реальные часы работы видимым текстом и, если есть structured data, в openingHours или openingHoursSpecification.",
    doesNotProve: "Опубликованные часы работы не доказывают появление бренда в Ask Maps или локальных AI-ответах.",
  },
  "LA-04": {
    severity: "later",
    title: "Отдельная индексируемая страница локации или контактов не подтверждена",
    action:
      "Опубликуйте одну индексируемую страницу локации или контактов с адресом, способом связи и географией и дайте на неё ссылку с главной.",
    doesNotProve:
      "Отдельная страница локации не доказывает появление бренда в Ask Maps или локальных AI-ответах.",
  },
  "LA-05": {
    severity: "later",
    title: "Structured data типа LocalBusiness отсутствует или неполна",
    action:
      "Объявите JSON-LD сущность типа LocalBusiness с подтверждёнными name, address и telephone или openingHours, используя только подтверждённые факты.",
    doesNotProve:
      "Полная разметка LocalBusiness не доказывает появление бренда в Ask Maps или локальных AI-ответах.",
  },
  "LA-06": {
    severity: "later",
    title: "Факты из structured data не подтверждаются видимым контентом",
    action:
      "Повторяйте каждый заявленный в structured data факт — имя, телефон, локацию — в видимом тексте страницы, чтобы разметка и контент не противоречили друг другу.",
    doesNotProve:
      "Согласие разметки и контента не доказывает появление бренда в Ask Maps или локальных AI-ответах.",
  },
  "LA-07": {
    severity: "later",
    title: "Подтверждённая Maps-ссылка не найдена в публичном HTML",
    action:
      "Если подтверждённая Maps-карточка бизнеса существует, дайте на неё ссылку с сайта как публичный reference. Никогда не ссылайтесь на карточку, которой не управляете.",
    doesNotProve:
      "Maps-ссылка не доказывает появление бренда в Ask Maps или локальных AI-ответах; эта проверка не делает запросов к Google.",
  },
  "LA-08": {
    severity: "later",
    title: "Языковые сигналы не согласованы или не объявлены",
    action:
      "Объявите язык страницы в атрибуте <html lang> и держите его согласованным с языком видимого контента.",
    doesNotProve:
      "Согласованные языковые сигналы не доказывают появление бренда в Ask Maps или локальных AI-ответах.",
  },
  "LA-09": {
    severity: "later",
    title: "Родительский бренд и дочерние концепции могут быть неразличимы",
    action:
      "Если один бренд ведёт несколько разных концепций, дайте каждой собственное публичное имя, описание и страницу, а не сливайте их в одну сущность.",
    doesNotProve:
      "Различимые сущности не доказывают появление бренда в Ask Maps или локальных AI-ответах; по одним публичным страницам это редко решается в любую сторону.",
  },
};

export function getRecommendation(ruleId: string, locale: VisibilityLocale): Recommendation | null {
  const table = locale === "ru" ? RU : EN;
  return table[ruleId] ?? null;
}

/**
 * What to show when a check PASSES. The recommendation titles above are
 * phrased as problems, so reusing them for a pass would read as
 * "OK: No canonical URL is declared" — the opposite of the truth.
 */
const PASSED_EN: Record<RuleId, string> = {
  "identity.facts_agree": "Pages state the same facts about the business",
  "access.robots_unambiguous": "robots.txt reads the same to every crawler",
  "access.noindex_covers_locales": "Indexing directives match across languages",
  "identity.author_named": "The page names its author",
  "identity.dated": "The page publishes a date",
  "identity.same_as": "The business links to its own profiles elsewhere",
  "offer.comparison_readable": "The comparison is a readable table",
  "access.cacheable": "The page can be cached",
  "access.fetchable": "The page loads cleanly",
  "access.noindex": "Indexing is not blocked",
  "access.canonical": "A canonical URL is declared",
  "access.viewport": "A mobile viewport is declared",
  "access.sitemap_discovered": "sitemap.xml was found",
  "identity.jsonld_valid": "Structured data is present and parses",
  "identity.jsonld_entity_present": "An Organization or LocalBusiness entity is declared",
  "identity.brand_name_consistent": "The brand name is consistent",
  "offer.title_present": "The page has a title",
  "offer.single_h1": "The page has exactly one H1",
  "offer.service_page_discovered": "A service or product page was found",
  "conversion.contact_path_present": "A contact path was found",
  "conversion.about_page_discovered": "An About page was found",
  "action.human_ready": "A customer can complete the primary action",
  "action.machine_readable": "The action is exposed in structured form",
  "action.agent_executable": "An agent could complete the action end to end",
  "LA-01": "Business name, category and location are stated in visible text",
  "LA-02": "Address and phone are visible in page content",
  "LA-03": "Opening hours are stated",
  "LA-04": "A dedicated location/contact page was read",
  "LA-05": "LocalBusiness structured data carries the minimum fact set",
  "LA-06": "Structured data agrees with the visible content",
  "LA-07": "A Maps reference link is present in the public HTML",
  "LA-08": "Language signals are consistent",
  "LA-09": "Parent brand and sub-concepts are distinguishable",
};

const PASSED_RU: Record<RuleId, string> = {
  "identity.facts_agree": "Страницы сообщают одни и те же факты о бизнесе",
  "access.robots_unambiguous": "robots.txt читается одинаково всеми краулерами",
  "access.noindex_covers_locales": "Директивы индексации совпадают на всех языках",
  "identity.author_named": "Страница называет автора",
  "identity.dated": "Страница публикует дату",
  "identity.same_as": "Бизнес ссылается на свои профили",
  "offer.comparison_readable": "Сравнение собрано читаемой таблицей",
  "access.cacheable": "Страницу можно кэшировать",
  "access.fetchable": "Страница загружается корректно",
  "access.noindex": "Индексация не заблокирована",
  "access.canonical": "Canonical URL объявлен",
  "access.viewport": "Мобильный viewport объявлен",
  "access.sitemap_discovered": "sitemap.xml найден",
  "identity.jsonld_valid": "Структурированные данные есть и разбираются",
  "identity.jsonld_entity_present": "Сущность Organization или LocalBusiness объявлена",
  "identity.brand_name_consistent": "Название бренда согласовано",
  "offer.title_present": "У страницы есть title",
  "offer.single_h1": "На странице ровно один H1",
  "offer.service_page_discovered": "Страница услуги или продукта найдена",
  "conversion.contact_path_present": "Путь к контакту найден",
  "conversion.about_page_discovered": "Страница «О нас» найдена",
  "action.human_ready": "Клиент может выполнить основное действие",
  "action.machine_readable": "Действие представлено в структурированном виде",
  "action.agent_executable": "Агент смог бы выполнить действие целиком",
  "LA-01": "Имя, категория и локация бизнеса названы в видимом тексте",
  "LA-02": "Адрес и телефон видны в контенте страниц",
  "LA-03": "Часы работы указаны",
  "LA-04": "Отдельная страница локации/контактов прочитана",
  "LA-05": "Structured data LocalBusiness содержит минимальный набор фактов",
  "LA-06": "Structured data согласована с видимым контентом",
  "LA-07": "Maps-ссылка присутствует в публичном HTML",
  "LA-08": "Языковые сигналы согласованы",
  "LA-09": "Родительский бренд и дочерние концепции различимы",
};

export function getPassedTitle(ruleId: string, locale: VisibilityLocale): string | null {
  const table = locale === "ru" ? PASSED_RU : PASSED_EN;
  return table[ruleId] ?? null;
}

const SEVERITY_ORDER: Record<Severity, number> = { critical: 0, important: 1, later: 2 };

export function sortBySeverity<T extends { severity: Severity }>(items: T[]): T[] {
  return [...items].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

/**
 * Localized phrasing for the Action Readiness evidence keys. The detector
 * returns keys so the same result can be rendered in either language;
 * this is where they become sentences.
 */
const READINESS_EVIDENCE: Record<VisibilityLocale, Record<ReadinessEvidenceKey, string>> = {
  en: {
    direct_action_link: "A direct path for the chosen action was found",
    generic_contact_only: "Only a generic contact path was found, not the chosen action",
    form_present: "A form is present on the page",
    action_schema_present: "Action-related structured data",
    schema_without_action: "Structured data is present, but it does not describe the action",
    no_schema: "No structured data was found on the page",
    potential_action: "schema.org potentialAction is declared",
    entry_point: "EntryPoint / urlTemplate describes how to invoke the action",
    api_description: "A machine-readable API description is referenced",
    no_agent_signal:
      "No documented endpoint, action entry point or machine-verifiable confirmation was found",
  },
  ru: {
    direct_action_link: "Найден прямой путь к выбранному действию",
    generic_contact_only: "Найден только общий контакт, а не выбранное действие",
    form_present: "На странице есть форма",
    action_schema_present: "Структурированные данные, связанные с действием",
    schema_without_action: "Структурированные данные есть, но действие в них не описано",
    no_schema: "Структурированные данные на странице не найдены",
    potential_action: "Объявлен schema.org potentialAction",
    entry_point: "EntryPoint / urlTemplate описывает, как вызвать действие",
    api_description: "Есть ссылка на машиночитаемое описание API",
    no_agent_signal:
      "Не найдено ни документированного endpoint, ни точки входа действия, ни машинопроверяемого подтверждения",
  },
};

export function describeReadinessEvidence(
  evidence: ReadinessEvidence[],
  locale: VisibilityLocale,
): string {
  const table = READINESS_EVIDENCE[locale];
  return evidence
    .map(({ key, count, detail }) => {
      const base = table[key];
      if (detail) return `${base}: ${detail}`;
      if (typeof count === "number") return `${base} (${count})`;
      return base;
    })
    .join(" · ");
}
