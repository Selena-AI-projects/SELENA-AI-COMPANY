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
  | "villaops";

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
  nonBrandClicks: number;
};

export type JournalEntry = {
  date: string;
  stage: JournalStage;
  title: string;
  body: string;
  /** What this entry deliberately does not claim. Rendered as its own line. */
  doesNotProve?: string;
};

/**
 * One published API View measurement. The full result goes on the page — the
 * count, what it cost, and who the models named instead — because a report the
 * reader cannot see is not proof of anything.
 */
export type ApiViewMeasurement = {
  date: string;
  /** Same questions, models and language, or the comparison is meaningless. */
  configVersion: string;
  questions: number;
  models: number;
  answersRequested: number;
  answersReceived: number;
  brandMentions: number;
  costUsd: number;
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
  date: string;
  /** Same questions, surfaces and language, or the comparison is meaningless. */
  configVersion: string;
  questions: number;
  surfaces: VisitorViewSurfaceResult[];
  costUsd: number;
  /** What the answers pointed at, most-cited first. */
  citedDomains: { domain: string; answers: number }[];
  /** How many answers cited the project's own site. Often zero, and that is the finding. */
  ownDomainAnswers: number;
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
  apiView?: ApiViewMeasurement;
  visitorView?: VisitorViewMeasurement;
  entries: JournalEntry[];
};

export const journalMeta = {
  measuredAt: "2026-08-25",
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

const baselineWindow = { windowStart: "2026-07-26", windowEnd: "2026-08-22" };

export const journalProjects: JournalProject[] = [
  {
    slug: "korafoodhall",
    name: "KORA Food Hall",
    url: "https://korafoodhall.com",
    category: "Фуд-холл, гости и туристы",
    markets: ["Бали, Убуд"],
    languages: ["английский"],
    metrics: { ...baselineWindow, clicks: 2, impressions: 313, previousClicks: 1, nonBrandClicks: 2 },
    apiView: {
      date: "2026-08-25",
      configVersion: "korafoodhall-api-view-2026-08-25",
      questions: 25,
      models: 5,
      answersRequested: 125,
      answersReceived: 125,
      brandMentions: 0,
      costUsd: 0.2254,
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
    entries: [
      {
        date: "2026-08-25",
        stage: "readiness",
        title: "Точка отсчёта зафиксирована",
        body:
          "За 28 дней: 2 клика при 313 показах. Google показывает сайт, но переходят к нам шесть человек из тысячи. Самая заметная упущенная возможность — запрос «private events ubud»: 99 показов, 23-я позиция, ни одного клика. Для фуд-холла частные мероприятия — самый дорогой тип заказа, а отдельной страницы под него у сайта нет. Рядом лежит группа запросов про семейные и детские рестораны Убуда на 11–16 позициях: до первой страницы им не хватает немного.",
        doesNotProve:
          "Эти числа описывают обычный поиск Google. Упоминают ли KORA ChatGPT, Gemini и Perplexity — пока неизвестно: платный замер не запускался.",
      },
      {
        date: "2026-08-25",
        stage: "apiView",
        title: "Ноль из ста двадцати пяти",
        body:
          "Пять AI-моделей получили 25 вопросов о том, где поесть в Убуде: лучший фуд-холл, куда пойти с детьми, где провести частное мероприятие, где поужинать большой компанией. KORA Food Hall не была названа ни разу. При этом модели назвали 335 других заведений — Zest Ubud в 21 вопросе из 25, Karsa Kafe в 18, Warung Bodag Maliah в 16. Важно понимать, откуда этот ноль: сайт недавно создан, он дорабатывается, и для AI-видимости не делалось ничего. Это не провал усилий — это точка до начала работы. Замер стоил $0.23 и занял десять минут.",
        doesNotProve:
          "Замер сделан по каналу API View — это собственные знания моделей. Что ответит ChatGPT живому человеку с включённым веб-поиском, здесь не проверялось: это отдельный канал. Список названий взят из тех же ответов и проверен на дословное присутствие, но не приведён к единому виду: «Sayan House» и «The Sayan House» — одно место, посчитанное дважды. Такие склейки делает человек на платной проверке.",
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
    metrics: { ...baselineWindow, clicks: 29, impressions: 2710, previousClicks: 1, nonBrandClicks: 29 },
    entries: [
      {
        date: "2026-08-25",
        stage: "readiness",
        title: "Двадцать девять кликов вместо одного — и потолок",
        body:
          "За 28 дней: 29 кликов при 2 710 показах, месяцем раньше был один клик. Все 29 — небрендовые: люди искали места на Бали, а не наш сайт по имени. При этом переходит один человек из ста, и это главная проблема, а не позиции. «ami pilates uluwatu» — 6,5 позиция, 79 показов, ноль кликов; «bron the resto» — 590 показов и один клик. Заголовки и описания в выдаче не убеждают.",
        doesNotProve:
          "Рост показывает движение обычного поиска и не говорит ничего о том, цитируют ли сайт AI-ассистенты.",
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
    metrics: { ...baselineWindow, clicks: 34, impressions: 1915, previousClicks: 18, nonBrandClicks: 24 },
    entries: [
      {
        date: "2026-08-25",
        stage: "readiness",
        title: "Самый живой проект и та же болезнь",
        body:
          "За 28 дней: 34 клика при 1 915 показах, рост к предыдущему периоду 89%. Небрендовых кликов 24 — то есть спрос не только на имя. Сайт выходит по русским запросам о ветеринарных услугах в разных городах. Доля кликов 1,8% — лучше остальных, но всё ещё вдвое ниже нормальной для тех позиций, которые он занимает.",
        doesNotProve:
          "Рынок и язык здесь русские, поэтому эти числа нельзя складывать с балийскими проектами: это разные конфигурации.",
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
    metrics: { ...baselineWindow, clicks: 0, impressions: 0, previousClicks: null, nonBrandClicks: 0 },
    entries: [
      {
        date: "2026-08-25",
        stage: "readiness",
        title: "Ноль. И мы это показываем",
        body:
          "Ноль кликов, ноль показов. Ресурс в Search Console подтверждён сегодня, отсчёт начинается с этой даты. Компания, которая продаёт измерение AI-видимости, начинает с полного отсутствия собственной — и ставит это первой строкой журнала, а не прячет. Это самая длинная ветка из семи: новому домену нужны месяцы, и обещать здесь быстрый результат было бы нечестно.",
        doesNotProve:
          "Ноль показов означает, что Google пока не выводит сайт. Это не оценка качества сайта и не прогноз.",
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
    metrics: { ...baselineWindow, clicks: 0, impressions: 15, previousClicks: null, nonBrandClicks: 0 },
    entries: [
      {
        date: "2026-08-25",
        stage: "readiness",
        title: "День ноль",
        body:
          "15 показов, ни одного клика. Данных слишком мало для выводов — это честная стартовая точка, а не диагноз. Проект будет мериться на индонезийском и английском; какой язык окажется основным, покажут первые накопленные запросы.",
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
    metrics: { ...baselineWindow, clicks: 0, impressions: 0, previousClicks: null, nonBrandClicks: 0 },
    entries: [
      {
        date: "2026-08-25",
        stage: "readiness",
        title: "День ноль, и сразу два рынка",
        body:
          "Ноль показов. Особенность проекта в том, что рынков два — США и Россия, — а значит и замеров будет два: английский и русский отдельно. Их результаты будут показываться рядом, но никогда не складываться в одно число.",
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
    metrics: { ...baselineWindow, clicks: 0, impressions: 0, previousClicks: null, nonBrandClicks: 0 },
    entries: [
      {
        date: "2026-08-25",
        stage: "readiness",
        title: "День ноль",
        body:
          "Ноль показов. Проект обслуживает виллы на Бали, замер пойдёт на английском и индонезийском.",
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
