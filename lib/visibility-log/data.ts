/**
 * Public data for the visibility journal.
 *
 * Two layers on purpose (see docs/visibility-log/DECISIONS.md):
 *
 * `metrics` are facts pulled from Search Console and may refresh on their own —
 * only per-project aggregates ever become public, never the query list, which
 * carries other companies' brand names.
 *
 * `entries` are claims about what was done and why. They are written and
 * approved by a person before publication, and none of them may say a number
 * improved unless the same locked configuration was measured again.
 */
import { commercialFacts } from "@/lib/commercial-facts";

export type ProjectSlug =
  | "korafoodhall"
  | "otherbali"
  | "petid"
  | "selenasystems"
  | "doki"
  | "remhaos"
  | "villaops"
  | "bigdragonvillas";

export type JournalStage =
  | "readiness"
  | "apiView"
  | "snapshot"
  | "landscape"
  | "expert"
  | "work"
  | "remeasure";

export type ProjectMetrics = {
  /** Window the numbers describe, so a reader never has to guess the period. */
  windowStart: string;
  windowEnd: string;
  clicks: number;
  impressions: number;
  /**
   * Clicks in the previous window of equal length, null when Search Console
   * has no prior data. Stored as the raw count rather than a percentage:
   * 1 → 2 clicks is "+100%", which reads like a result and is not one.
   */
  previousClicks: number | null;
  /** Impressions in that same previous window, on the same terms. */
  previousImpressions: number | null;
};

/*
 * There is deliberately no non-brand click count here. Google hides part of
 * the query list, so a brand/non-brand split can only be computed over the
 * rows it does show — which makes it a share of a sample, not of the total.
 * Printing it beside the total clicks invited exactly the subtraction it
 * cannot support, so it is not published until the split can be stated on the
 * same terms as the number next to it.
 */

/**
 * A block of an entry.
 *
 * Entries used to be one string each, and they rendered as one paragraph of
 * six sentences that nobody read to the end. Where a sentence enumerates —
 * the models asked, the questions asked, who was named instead — it belongs in
 * a list, and the reader should be able to find it without reading the
 * sentence around it.
 */
export type JournalBlock =
  | { kind: "text"; text: string }
  | { kind: "list"; title?: string; items: string[] };

export type JournalEntry = {
  date: string;
  stage: JournalStage;
  title: string;
  body: JournalBlock[];
  /** What this entry deliberately does not claim. Rendered as its own block. */
  doesNotProve?: JournalBlock[];
};

/** Shorthand for the common case: a run of plain paragraphs. */
export function text(...paragraphs: string[]): JournalBlock[] {
  return paragraphs.map((paragraph) => ({ kind: "text", text: paragraph }));
}

/**
 * One published API View measurement. The full result goes on the page — the
 * counts and who the models named instead — because a report the reader cannot
 * see is not proof of anything.
 *
 * What a measurement cost us is deliberately not here. It is a real number and
 * it stays in the run record, but on a public page beside a price it stops
 * being evidence and starts being an argument about margin, which is not what
 * the journal is for.
 */
export type ApiViewMeasurement = {
  /** The one day it ran. A measurement is an event, not a period. */
  date: string;
  /** Same questions, models and language, or the comparison is meaningless. */
  configVersion: string;
  questions: number;
  models: number;
  answersRequested: number;
  answersReceived: number;
  brandMentions: number;
  namedInstead: { name: string; questions: number; models: number }[];
};

/**
 * One Visitor View measurement: what a person was shown on the sold surfaces.
 *
 * Coverage is stored per surface rather than as one total, because the
 * surfaces fail independently — a complete ChatGPT sample beside a third of a
 * Perplexity one is two different observations, and a single averaged rate
 * would be about neither.
 */
export type VisitorViewSurfaceResult = {
  surface: string;
  answersRequested: number;
  answersReceived: number;
  brandMentions: number;
};

export type VisitorViewMeasurement = {
  /** The one day it ran. A measurement is an event, not a period. */
  date: string;
  /** Same questions, surfaces and language, or the comparison is meaningless. */
  configVersion: string;
  questions: number;
  surfaceCount: number;
  answersRequested: number;
  answersReceived: number;
  brandMentions: number;
  /**
   * Empty until the per-surface split is published. There is deliberately no
   * project-level rate: ChatGPT, Gemini and Perplexity answer differently and
   * return different amounts, so one percentage over all three would be about
   * none of them. Counts pool honestly; rates do not.
   */
  surfaces: VisitorViewSurfaceResult[];
  /** What the answers pointed at, most-cited first. Empty until published. */
  citedDomains: { domain: string; answers: number }[];
  /** How many answers cited the project's own site. Often zero, and that is the finding. */
  ownDomainAnswers: number | null;
};

/**
 * Below this share of the sample a rate is not a rough version of the real
 * one — it is a different number wearing the same sign. The page shows the
 * counts instead.
 */
export const minVisitorCoverage = 0.8;

export function visitorMentionRate(result: VisitorViewSurfaceResult): number | null {
  if (result.answersRequested === 0 || result.answersReceived === 0) return null;
  if (result.answersReceived / result.answersRequested < minVisitorCoverage) return null;
  return result.brandMentions / result.answersReceived;
}

export function visitorCoverage(result: VisitorViewSurfaceResult): number {
  return result.answersRequested === 0 ? 0 : result.answersReceived / result.answersRequested;
}

export type JournalProject = {
  slug: ProjectSlug;
  name: string;
  url: string;
  category: string;
  markets: string[];
  languages: string[];
  metrics: ProjectMetrics | null;
  /**
   * Present only when the business is not ours. A reader must not take a
   * third party's measurement for a client result of ours, and the same line
   * that says whose it is also states the permission that put it here.
   */
  publishedByPermission?: { owner: string; recordedOn: string; note: string };
  /**
   * Measurements in the order they were run, oldest first. A list rather than
   * a single record because the number is what a reader needs: "замер №1" says
   * this is one day's reading and the start of a series, where a bare date
   * beside a 28-day search window reads as a month of work.
   */
  apiViews?: ApiViewMeasurement[];
  visitorViews?: VisitorViewMeasurement[];
  entries: JournalEntry[];
};

export const journalMeta = {
  measuredAt: "2026-08-26",
  source: "Google Search Console",
  windowDays: 28,
} as const;

export const stageLabels: Record<JournalStage, string> = {
  readiness: "Техническая проверка",
  // Not a rung of the ladder: API View is the models' own knowledge, and the
  // $49 rung sells Visitor View. Labelling this one "Замер · 3 системы" would
  // claim a tier that has not run.
  apiView: "Замер AI-ответов · 5 моделей",
  snapshot: "Замер · 3 системы",
  landscape: "Замер · 8 систем",
  expert: "Проверка человеком",
  work: "Исправления",
  remeasure: "Повторный замер",
};

/*
 * The confirmed baseline of 26 August (docs/visibility-log/BASELINE-2026-08-26.md):
 * one canonical Search Console property per project, two windows of exactly 28
 * days each. The 25 August snapshot it replaced was collected over 29 days from
 * the first 250 query rows, so its totals were both short and mislabelled.
 */
const baselineWindow = { windowStart: "2026-07-27", windowEnd: "2026-08-23" };

export const journalProjects: JournalProject[] = [
  {
    slug: "korafoodhall",
    name: "KORA Food Hall",
    url: "https://korafoodhall.com",
    category: "Фуд-холл, гости и туристы",
    markets: ["Бали, Убуд"],
    languages: ["английский"],
    metrics: { ...baselineWindow, clicks: 11, impressions: 926, previousClicks: 17, previousImpressions: 869 },
    apiViews: [
      {
        date: "2026-08-25",
        configVersion: "korafoodhall-api-view-2026-08-25",
        questions: 25,
        models: 5,
        answersRequested: 125,
        answersReceived: 125,
        brandMentions: 0,
        namedInstead: [
          { name: "Zest Ubud", questions: 21, models: 5 },
          { name: "Karsa Kafe", questions: 18, models: 5 },
          { name: "Warung Bodag Maliah", questions: 16, models: 5 },
          { name: "Sayan House", questions: 15, models: 5 },
          { name: "Bridges Bali", questions: 14, models: 5 },
          { name: "Warung Sopa", questions: 14, models: 5 },
          { name: "Warung Biah Biah", questions: 13, models: 5 },
          { name: "Moksa", questions: 12, models: 5 },
          { name: "Warung Babi Guling Ibu Oka", questions: 12, models: 5 },
          { name: "Bebek Bengil", questions: 11, models: 5 },
          { name: "Locavore", questions: 11, models: 5 },
          { name: "Mozaic", questions: 11, models: 5 },
          { name: "Warung Pulau Kelapa", questions: 11, models: 5 },
          { name: "Alchemy Bali", questions: 10, models: 5 },
        ],
      },
    ],
    visitorViews: [
      {
        date: "2026-08-26",
        configVersion: "korafoodhall-api-view-2026-08-25",
        questions: 25,
        surfaceCount: 3,
        answersRequested: 75,
        answersReceived: 60,
        brandMentions: 4,
        surfaces: [],
        citedDomains: [],
        ownDomainAnswers: null,
      },
    ],
    entries: [
      {
        date: "2026-08-25",
        stage: "readiness",
        title: "Точка отсчёта зафиксирована",
        body: [
          { kind: "text", text:
            "За 28 дней — 2 клика при 313 показах. Google показывает сайт, но переходят к нам шесть человек из тысячи." },
          { kind: "text", text:
            "Самая заметная упущенная возможность — запрос «private events ubud»: 99 показов, 23-я позиция, ни одного клика. Для фуд-холла частные мероприятия — самый дорогой тип заказа, а отдельной страницы под него у сайта нет." },
          { kind: "list", title: "Рядом лежит группа запросов на 11–16 позициях — до первой страницы им не хватает немного", items: [
            "семейные рестораны Убуда",
            "рестораны для детей",
            "рестораны рядом с Monkey Forest",
          ] },
        ],
        doesNotProve: [
          { kind: "text", text:
            "Эти числа описывают обычный поиск Google. Упоминают ли KORA ChatGPT, Gemini и Perplexity — здесь неизвестно: платный замер не запускался." },
        ],
      },
      {
        date: "2026-08-25",
        stage: "apiView",
        title: "Ноль из ста двадцати пяти",
        body: [
          { kind: "text", text:
            "Пять AI-моделей получили 25 вопросов о том, где поесть в Убуде. KORA Food Hall не была названа ни разу — ноль из ста двадцати пяти ответов." },
          { kind: "list", title: "Спрашивали", items: [
            "Claude",
            "DeepSeek",
            "Qwen",
            "Mistral",
            "Grok",
          ] },
          { kind: "list", title: "О чём спрашивали", items: [
            "лучший фуд-холл Убуда",
            "куда пойти с детьми",
            "где провести частное мероприятие",
            "где поужинать большой компанией",
          ] },
          { kind: "list", title: "Кого назвали вместо — всего 335 заведений", items: [
            "Zest Ubud — в 21 вопросе из 25",
            "Karsa Kafe — в 18",
            "Warung Bodag Maliah — в 16",
            "Sayan House — в 15",
            "Bridges Bali — в 14",
          ] },
          { kind: "text", text:
            "Важно понимать, откуда этот ноль. Сайт недавно создан, он дорабатывается, и для AI-видимости не делалось ничего. Это не провал усилий — это точка до начала работы." },
        ],
        doesNotProve: [
          { kind: "text", text:
            "Замер сделан по каналу API View — это собственные знания моделей. Что ответит ChatGPT живому человеку с включённым веб-поиском, здесь не проверялось: это отдельный канал." },
          { kind: "text", text:
            "Список названий взят из тех же ответов и проверен на дословное присутствие, но не приведён к единому виду: «Sayan House» и «The Sayan House» — одно место, посчитанное дважды. Такие склейки делает человек на платной проверке." },
        ],
      },
      {
        date: "2026-08-26",
        stage: "readiness",
        title: "Первый сбор Search Console был неверным — вот исправленные числа",
        body: [
          { kind: "text", text:
            "Числа, опубликованные 25 августа, собирала первая версия скрипта. Окно она называла 28-дневным, а на деле брала 29 дней, и общую сумму складывала из первых 250 строк запросов вместо всех." },
          { kind: "text", text:
            "Пересобрали по одной канонической property, два окна ровно по 28 дней." },
          { kind: "list", title: "За 27 июля — 23 августа", items: [
            "11 кликов при 926 показах",
            "месяцем раньше — 17 кликов при 869 показах",
            "то есть показов стало больше, а переходов меньше",
          ] },
          { kind: "text", text:
            "Вчерашняя запись со старыми числами остаётся на странице: журнал не переписывается задним числом." },
        ],
        doesNotProve: [
          { kind: "text", text:
            "Разница между 17 и 11 кликами — это разница между двумя окнами, а не следствие чего-то, что мы сделали. Причину эти числа не показывают." },
        ],
      },
    ],
  },
  {
    slug: "otherbali",
    name: "otherbali.com",
    url: "https://otherbali.com",
    category: "Travel-медиа и гиды",
    markets: ["Бали, Индонезия"],
    languages: ["английский"],
    metrics: { ...baselineWindow, clicks: 141, impressions: 43_399, previousClicks: 12, previousImpressions: 620 },
    visitorViews: [
      {
        date: "2026-08-26",
        configVersion: "otherbali-api-view-2026-08-25",
        questions: 25,
        surfaceCount: 3,
        answersRequested: 75,
        answersReceived: 54,
        brandMentions: 1,
        surfaces: [],
        citedDomains: [],
        ownDomainAnswers: null,
      },
    ],
    entries: [
      {
        date: "2026-08-25",
        stage: "readiness",
        title: "Двадцать девять кликов вместо одного — и потолок",
        body: [
          { kind: "text", text:
            "За 28 дней — 29 кликов при 2 710 показах, месяцем раньше был один клик. Все 29 небрендовые: люди искали места на Бали, а не наш сайт по имени." },
          { kind: "text", text:
            "При этом переходит один человек из ста, и это главная проблема, а не позиции." },
          { kind: "list", title: "Где это видно лучше всего", items: [
            "«ami pilates uluwatu» — 6,5 позиция, 79 показов, ноль кликов",
            "«bron the resto» — 590 показов и один клик",
          ] },
          { kind: "text", text:
            "Заголовки и описания в выдаче не убеждают." },
        ],
        doesNotProve: [
          { kind: "text", text:
            "Рост показывает движение обычного поиска и не говорит ничего о том, цитируют ли сайт AI-ассистенты." },
        ],
      },
      {
        date: "2026-08-26",
        stage: "readiness",
        title: "Исправленный сбор: 141 клик при 43 399 показах",
        body: [
          { kind: "text", text:
            "Первая версия скрипта читала только первые 250 строк запросов и считала окно в 29 дней вместо 28. Поэтому вчерашние 29 кликов и 2 710 показов были неполной суммой." },
          { kind: "list", title: "Пересобрали по канонической property", items: [
            "27 июля — 23 августа: 141 клик при 43 399 показах",
            "предыдущее окно: 12 кликов при 620 показах",
          ] },
          { kind: "text", text:
            "Переходит трое человек из тысячи. Показов теперь много, и именно поэтому доля кликов стала главной проблемой проекта." },
        ],
        doesNotProve: [
          { kind: "text", text:
            "Что вызвало такой скачок показов, эти числа не объясняют. И они по-прежнему ничего не говорят о том, цитируют ли сайт AI-ассистенты." },
        ],
      },
    ],
  },
  {
    slug: "petid",
    name: "PetID.care",
    url: "https://petid.care",
    category: "Сервисная инфраструктура для животных",
    markets: ["Россия"],
    languages: ["русский"],
    metrics: { ...baselineWindow, clicks: 115, impressions: 5_623, previousClicks: 97, previousImpressions: 7_317 },
    visitorViews: [
      {
        date: "2026-08-26",
        configVersion: "petid-api-view-2026-08-25",
        questions: 25,
        surfaceCount: 3,
        answersRequested: 75,
        answersReceived: 59,
        brandMentions: 2,
        surfaces: [],
        citedDomains: [],
        ownDomainAnswers: null,
      },
    ],
    entries: [
      {
        date: "2026-08-25",
        stage: "readiness",
        title: "Самый живой проект и та же болезнь",
        body: [
          { kind: "text", text:
            "За 28 дней — 34 клика при 1 915 показах, рост к предыдущему периоду 89%. Небрендовых кликов 24, то есть спрос не только на имя." },
          { kind: "text", text:
            "Сайт выходит по русским запросам о ветеринарных услугах в разных городах. Доля кликов 1,8% — лучше остальных, но всё ещё вдвое ниже нормальной для тех позиций, которые он занимает." },
        ],
        doesNotProve: [
          { kind: "text", text:
            "Рынок и язык здесь русские, поэтому эти числа нельзя складывать с балийскими проектами: это разные конфигурации." },
        ],
      },
      {
        date: "2026-08-26",
        stage: "readiness",
        title: "Исправленный сбор: переходов больше, показов меньше",
        body: [
          { kind: "text", text:
            "Пересобрали по канонической property, два окна ровно по 28 дней." },
          { kind: "list", title: "Что получилось", items: [
            "27 июля — 23 августа: 115 кликов при 5 623 показах",
            "предыдущее окно: 97 кликов при 7 317 показах",
            "Google показывает сайт реже, а переходят чаще",
          ] },
          { kind: "text", text:
            "Вчерашние 34 клика были неполной суммой первой версии скрипта." },
        ],
        doesNotProve: [
          { kind: "text", text:
            "Рынок и язык здесь русские, поэтому эти числа нельзя складывать с балийскими проектами: это разные конфигурации." },
        ],
      },
    ],
  },
  {
    slug: "selenasystems",
    name: "Selena Systems",
    url: "https://www.selenasystems.com",
    category: "Сам продукт",
    markets: ["Русскоязычная аудитория", "Бали", "Австралия и Новая Зеландия", "США"],
    languages: ["русский", "английский"],
    metrics: { ...baselineWindow, clicks: 0, impressions: 0, previousClicks: 0, previousImpressions: 0 },
    visitorViews: [
      {
        date: "2026-08-26",
        configVersion: "selenasystems-api-view-2026-08-25",
        questions: 25,
        surfaceCount: 3,
        answersRequested: 75,
        answersReceived: 55,
        brandMentions: 0,
        surfaces: [],
        citedDomains: [],
        ownDomainAnswers: null,
      },
    ],
    entries: [
      {
        date: "2026-08-25",
        stage: "readiness",
        title: "Ноль. И мы это показываем",
        body: [
          { kind: "text", text:
            "Ноль кликов, ноль показов. Ресурс в Search Console подтверждён сегодня, отсчёт начинается с этой даты." },
          { kind: "text", text:
            "Компания, которая продаёт измерение AI-видимости, начинает с полного отсутствия собственной — и ставит это первой строкой журнала, а не прячет." },
          { kind: "text", text:
            "Это самая длинная ветка из семи: новому домену нужны месяцы, и обещать здесь быстрый результат было бы нечестно." },
        ],
        doesNotProve: [
          { kind: "text", text:
            "Ноль показов означает, что Google пока не выводит сайт. Это не оценка качества сайта и не прогноз." },
        ],
      },
    ],
  },
  {
    slug: "doki",
    name: "Doki.help",
    url: "https://doki.help",
    category: "Документы и поддержка",
    markets: ["Индонезия"],
    languages: ["индонезийский", "английский"],
    metrics: { ...baselineWindow, clicks: 0, impressions: 44, previousClicks: 4, previousImpressions: 29 },
    entries: [
      {
        date: "2026-08-25",
        stage: "readiness",
        title: "День ноль",
        body: [
          { kind: "text", text:
            "15 показов, ни одного клика. Данных слишком мало для выводов — это честная стартовая точка, а не диагноз." },
          { kind: "text", text:
            "Проект будет мериться на индонезийском и английском. Какой язык окажется основным, покажут первые накопленные запросы." },
        ],
      },
      {
        date: "2026-08-26",
        stage: "readiness",
        title: "Исправленный сбор: 44 показа и ноль кликов",
        body: [
          { kind: "list", title: "За 27 июля — 23 августа", items: [
            "44 показа, ни одного клика",
            "предыдущее окно: 29 показов и 4 клика",
          ] },
          { kind: "text", text:
            "Вчерашние 15 показов были неполной суммой первой версии скрипта." },
        ],
        doesNotProve: [
          { kind: "text", text:
            "Четыре клика против нуля на таком объёме — это шум, а не тенденция." },
        ],
      },
    ],
  },
  {
    slug: "remhaos",
    name: "remhaos.com",
    url: "https://remhaos.com",
    category: "Управление ремонтом: дизайнер, архитектор и прораб в одном месте",
    markets: ["США", "Россия"],
    languages: ["английский", "русский"],
    metrics: { ...baselineWindow, clicks: 0, impressions: 0, previousClicks: 0, previousImpressions: 0 },
    visitorViews: [
      {
        date: "2026-08-26",
        configVersion: "remhaos-ru-api-view-2026-08-25",
        questions: 25,
        surfaceCount: 3,
        answersRequested: 75,
        answersReceived: 53,
        brandMentions: 0,
        surfaces: [],
        citedDomains: [],
        ownDomainAnswers: null,
      },
    ],
    entries: [
      {
        date: "2026-08-25",
        stage: "readiness",
        title: "День ноль, и сразу два рынка",
        body: [
          { kind: "text", text:
            "Ноль показов." },
          { kind: "text", text:
            "Особенность проекта в том, что рынков два — США и Россия. Значит и замеров будет два: английский и русский отдельно." },
          { kind: "text", text:
            "Их результаты будут показываться рядом, но никогда не складываться в одно число." },
        ],
      },
    ],
  },
  {
    slug: "villaops",
    name: "VillaOps",
    url: "https://villaops.selenasystems.com",
    category: "Операции для вилл и гостевого сервиса",
    markets: ["Индонезия, Бали"],
    languages: ["английский", "индонезийский"],
    metrics: { ...baselineWindow, clicks: 0, impressions: 0, previousClicks: 1, previousImpressions: 1 },
    visitorViews: [
      {
        date: "2026-08-26",
        configVersion: "villaops-api-view-2026-08-25",
        questions: 25,
        surfaceCount: 3,
        answersRequested: 75,
        answersReceived: 55,
        brandMentions: 0,
        surfaces: [],
        citedDomains: [],
        ownDomainAnswers: null,
      },
    ],
    entries: [
      {
        date: "2026-08-25",
        stage: "readiness",
        title: "День ноль",
        body: [
          { kind: "text", text: "Ноль показов." },
          { kind: "text", text:
            "Проект обслуживает виллы на Бали. Замер пойдёт на английском и индонезийском." },
        ],
      },
    ],
  },
  {
    slug: "bigdragonvillas",
    name: "Big Dragon Villas Ubud",
    url: "https://bigdragonvillasubud.com",
    category: "Виллы и размещение, гости и туристы",
    markets: ["Бали, Убуд"],
    languages: ["английский"],
    publishedByPermission: {
      owner: "Big Dragon Villas Ubud",
      recordedOn: "2026-08-26",
      note:
        "Это не наш проект. Мы помогаем им разобраться с видимостью, и они разрешили опубликовать результат замера. Без такого разрешения строчка о чужом бизнесе на сайте не появляется.",
    },
    // Not our Search Console property, so there is no click and impression
    // window to show. Everything published here comes from the measurements.
    metrics: null,
    visitorViews: [
      {
        date: "2026-08-26",
        configVersion: "bigdragonvillas-api-view-2026-08-25",
        questions: 25,
        surfaceCount: 3,
        answersRequested: 75,
        answersReceived: 61,
        brandMentions: 0,
        surfaces: [],
        citedDomains: [],
        ownDomainAnswers: null,
      },
    ],
    entries: [
      {
        date: "2026-08-25",
        stage: "apiView",
        title: "Ноль из ста двадцати пяти — и полный список тех, кого назвали",
        body: [
          { kind: "text", text:
            "Пять AI-моделей получили 25 вопросов о том, где остановиться в Убуде. Big Dragon Villas не назвали ни разу — ноль из ста двадцати пяти ответов." },
          { kind: "list", title: "Спрашивали", items: [
            "Claude",
            "DeepSeek",
            "Qwen",
            "Mistral",
            "Grok",
          ] },
          { kind: "list", title: "О чём спрашивали", items: [
            "вилла с бассейном",
            "с видом на рисовые террасы",
            "с детьми",
            "на месяц",
            "для йоги",
            "для небольшой свадьбы",
          ] },
          { kind: "list", title: "Кого называют вместо", items: [
            "Kamandalu Ubud — в 21 вопросе из 25",
            "Puri Garden Hotel & Hostel — в 19",
            "Capella Ubud — в 18",
            "Four Seasons Sayan — в 17",
            "The Kayon Resort — в 16",
            "Alaya Resort Ubud — в 13",
          ] },
          { kind: "text", text:
            "Отдельно стоит заметить Airbnb — 18 вопросов, и Booking.com — 16. Почти на треть вопросов модель отвечает не отелем, а площадкой бронирования: то есть отправляет гостя туда, где вилла платит комиссию." },
        ],
        doesNotProve: [
          { kind: "text", text:
            "Замер сделан по каналу API View — это собственные знания моделей, без веб-поиска." },
          { kind: "text", text:
            "Названия взяты из тех же ответов и проверены на дословное присутствие, но не сведены к единому виду: «Kayon» и «The Kayon Resort» могли посчитаться дважды. Здесь названы шесть самых частых имён, а не весь список." },
        ],
      },
    ],
  },
];

/**
 * The rungs every project walks in public, in order, priced from the one
 * commercial source so the journal can never quote a stale number.
 * `remeasure` has no price of its own — it is included in the implementation
 * engagement above it.
 */
export const journalLadder: { stage: JournalStage; price: string; what: string }[] = [
  {
    stage: "readiness",
    price: commercialFacts.aiVisibility.publicReadiness.ru,
    what: "Что о сайте вообще можно узнать без платных запросов к AI.",
  },
  {
    stage: "snapshot",
    price: commercialFacts.aiVisibility.snapshot.ru,
    what: "25 вопросов в трёх системах, каждую неделю.",
  },
  {
    stage: "landscape",
    price: commercialFacts.aiVisibility.landscape.ru,
    what: "Те же вопросы в восьми системах, с конкурентами и источниками.",
  },
  {
    stage: "expert",
    price: commercialFacts.aiVisibility.expertVerified.ru,
    what: "Человек перечитывает ответы и отделяет совпадение имени от настоящего упоминания.",
  },
  {
    stage: "work",
    price: commercialFacts.aiVisibility.implementation90Days.ru,
    what: "Правки на сайте и в источниках — то, ради чего всё измерялось.",
  },
  {
    stage: "remeasure",
    price: "входит в исправления",
    what: "Тот же список вопросов, те же системы, тот же язык — иначе сравнивать нечего.",
  },
];

/** Stages a project has actually published, used to mark the ladder. */
export function reachedStages(project: JournalProject): Set<JournalStage> {
  return new Set(project.entries.map((entry) => entry.stage));
}

export function findProject(slug: string): JournalProject | undefined {
  return journalProjects.find((project) => project.slug === slug);
}

/** Clicks per hundred impressions — the number that exposes a title problem. */
export function clickRate(metrics: ProjectMetrics): number | null {
  if (metrics.impressions === 0) return null;
  return Math.round((metrics.clicks / metrics.impressions) * 1000) / 10;
}

/**
 * Russian counts agree with the number in front of them, so "2 кликов" reads
 * as a translation error to the audience this journal is written for.
 */
export function pluralizeRu(count: number, forms: [string, string, string]): string {
  const mod100 = Math.abs(count) % 100;
  const mod10 = mod100 % 10;
  if (mod100 >= 12 && mod100 <= 14) return forms[2];
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}

export const clickForms: [string, string, string] = ["клик", "клика", "кликов"];
export const impressionForms: [string, string, string] = ["показ", "показа", "показов"];

export function formatDate(iso: string): string {
  const months = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
  ];
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${months[month - 1]} ${year}`;
}
