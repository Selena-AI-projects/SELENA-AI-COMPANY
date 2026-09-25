export type LabLocale = "en" | "ru";
export type LabSectionId = "research" | "guides" | "experiments" | "articles" | "courses";

export type LabSource = {
  title: string;
  href: string;
  publisher: string;
};

export type LabTable = {
  caption: string;
  headers: string[];
  rows: string[][];
};

/** A verbatim excerpt from a file, shown so the reader can check it themselves. */
export type LabCode = {
  caption: string;
  content: string;
};

export type LabContentBlock = {
  heading: string;
  paragraphs: string[];
  points?: string[];
  /** Ordered where the order is the point — reproduction steps, not a list of facts. */
  steps?: string[];
  table?: LabTable;
  code?: LabCode;
  figure?: LabFigure;
};

export type LabDiagramId = "two-agent-review-before-after" | "two-agent-review-cycle";

/** Drawn inline as SVG, so the labels stay real text. */
export type LabFigure = {
  diagram: LabDiagramId;
  alt: string;
  caption: string;
};

export type LabRelatedLink = {
  title: string;
  href: string;
};

export type LabItem = {
  section: Extract<LabSectionId, "guides" | "articles" | "experiments">;
  slug: string;
  title: string;
  summary: string;
  label: string;
  readingTime: string;
  publishedAt: string;
  updatedAt: string;
  blocks: LabContentBlock[];
  sources: LabSource[];
  related?: LabRelatedLink[];
  /** 1200x630 card for link previews; rendered from scripts/og/. */
  socialImage?: { url: string; alt: string };
};

type LabSection = {
  id: LabSectionId;
  title: string;
  description: string;
  emptyState?: string;
};

type LabLocaleContent = {
  eyebrow: string;
  title: string;
  intro: string;
  supportingLine: string;
  browseLabel: string;
  featuredLabel: string;
  sectionEyebrow: string;
  backLabel: string;
  sourcesLabel: string;
  relatedLabel: string;
  updatedLabel: string;
  checkCta: { title: string; text: string; label: string; href: string };
  systemsCta: { title: string; text: string; label: string; href: string };
  coursesBoundary: string;
  sections: LabSection[];
  items: LabItem[];
};

const officialSources = {
  openAiSearch: {
    title: "Publishers and developers FAQ",
    href: "https://help.openai.com/en/articles/12627856-publishers-and-developers-faq",
    publisher: "OpenAI",
  },
  googleCrawling: {
    title: "Google crawling and indexing documentation",
    href: "https://developers.google.com/search/docs/crawling-indexing",
    publisher: "Google Search Central",
  },
  googleCanonical: {
    title: "How to specify a canonical URL",
    href: "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls",
    publisher: "Google Search Central",
  },
  googleStructuredData: {
    title: "General structured data guidelines",
    href: "https://developers.google.com/search/docs/appearance/structured-data/sd-policies",
    publisher: "Google Search Central",
  },
  schemaOrg: {
    title: "Schema.org documentation",
    href: "https://schema.org/docs/documents.html",
    publisher: "Schema.org",
  },
} satisfies Record<string, LabSource>;

export const labContent: Record<LabLocale, LabLocaleContent> = {
  en: {
    eyebrow: "Selena Lab",
    title: "Research, practical guides, experiments and articles for building with AI.",
    intro:
      "Selena Lab is the research and education layer of Selena Systems. We publish methods, evidence boundaries and practical work that support AI Visibility and our custom AI Systems practice.",
    supportingLine: "Research → useful content → trust → better decisions.",
    browseLabel: "Browse the Lab",
    featuredLabel: "Start here",
    sectionEyebrow: "Selena Lab library",
    backLabel: "Back to Selena Lab",
    sourcesLabel: "Primary references",
    relatedLabel: "Related reading",
    updatedLabel: "Updated",
    checkCta: {
      title: "Check the public readiness of your website",
      text: "Run the free evidence-based audit. It uses public website data only and makes zero paid AI-provider calls.",
      label: "Run Public Readiness",
      href: "/check",
    },
    systemsCta: {
      title: "Need a system, not only a diagnosis?",
      text: "Selena Systems maps the workflow, chooses the safe automation boundary and builds the operating layer with your team.",
      label: "Discuss an AI system",
      href: "/en/contact",
    },
    coursesBoundary:
      "No course is currently offered for sale. Public introductory lessons will stay in Selena Lab; paid enrolment will open only with a published syllabus, access period, price and refund terms. The future learning workspace will live at app.selenasystems.com/app/learn.",
    sections: [
      {
        id: "research",
        title: "Research",
        description: "Versioned studies, datasets and benchmarks with disclosed methodology, provenance and practical implications, with sources and limits.",
        emptyState: "The research register is being prepared. No dataset or benchmark is presented as published yet.",
      },
      {
        id: "guides",
        title: "Guides",
        description: "Concrete, evidence-safe ways to improve websites, workflows and AI systems with clear next steps, sources and limits included.",
      },
      {
        id: "experiments",
        title: "Experiments",
        description: "Reproducible tests of methods and tools, including what failed, what remains unknown and why it matters, with sources and limits.",
        emptyState: "Experiment notes will appear only after the setup, inputs and observed outcome can be reproduced.",
      },
      {
        id: "articles",
        title: "Articles",
        description: "Clear explanations of AI visibility, evidence and practical AI implementation for business teams, with sources and limits.",
      },
      {
        id: "courses",
        title: "Courses",
        description: "Free foundations and, later, separately purchased practical courses with one Selena account and published access terms.",
      },
    ],
    items: [
      {
        section: "articles",
        slug: "what-is-ai-visibility",
        title: "What is AI Visibility?",
        summary:
          "A practical definition of AI visibility, how it differs from website readiness, and which claims require a real measurement cycle.",
        label: "Foundation",
        readingTime: "6 min",
        publishedAt: "2026-08-16",
        updatedAt: "2026-08-16",
        blocks: [
          {
            heading: "A useful definition",
            paragraphs: [
              "AI Visibility is the observed presence and treatment of a brand in answers produced by defined AI systems for a defined set of scenarios. It is not a permanent property of a company and it is not one universal score.",
              "A defensible result names the system or surface, exact model where applicable, language, region, prompt family, repeat count, date and whether web search was available. Without that configuration, a percentage is difficult to interpret or reproduce.",
            ],
          },
          {
            heading: "Readiness and visibility answer different questions",
            paragraphs: [
              "Public Readiness asks whether machines can reach, parse and reuse information on a website. It can inspect HTTP access, robots rules, canonical URLs, structured data, entity clarity, content structure, contact consistency and block-level citability heuristics.",
              "Real AI Visibility asks what selected AI systems actually answered. That requires a separate measurement cycle and an Evidence Ledger. Improving readiness may make a site clearer, but it does not prove that ChatGPT, Gemini or Perplexity mentioned or recommended the brand.",
            ],
            points: [
              "Readiness evidence comes from the website and deterministic rules.",
              "Visibility evidence comes from dated AI answers collected under a Configuration Lock.",
              "The two can be compared side by side, but should never be merged into an opaque composite score.",
            ],
          },
          {
            heading: "Visitor View and API View are not interchangeable",
            paragraphs: [
              "A consumer-facing answer surface with search available is a different channel from a direct API response produced by a fixed model with web search off. Selena reports Visitor View and API View separately, then calculates divergence only between results that are genuinely comparable.",
              "This prevents a common mistake: presenting one API model response as everything a product or company 'knows'. It is only one response under one configuration.",
            ],
          },
          {
            heading: "What a sound measurement should preserve",
            paragraphs: [
              "The evidence needs both the answer and its context: prompt, system, model or surface, search status, language, region, repeat index, timestamps, citations and validation state. Cardinality must be planned before a run so missing or extra answers are visible rather than silently averaged away.",
              "The result is decision support. It can show where a brand appears, which competitors appear instead, which sources are cited and what should be investigated next. It cannot guarantee future rankings or recommendations.",
            ],
          },
        ],
        sources: [officialSources.openAiSearch],
      },
      {
        section: "guides",
        slug: "prepare-site-for-ai-systems",
        title: "How to prepare a website for AI systems",
        summary:
          "A safe checklist for access, indexability, entity clarity, structured data, answer-first content and verification, with evidence-led next steps.",
        label: "Practical guide",
        readingTime: "9 min",
        publishedAt: "2026-08-16",
        updatedAt: "2026-08-16",
        blocks: [
          {
            heading: "1. Make key pages reachable without a human session",
            paragraphs: [
              "Start with ordinary web access. Important public pages should return a successful HTTP response without login, CAPTCHA or a browser-only challenge. Review robots.txt and the CDN or WAF separately: an allowed robots rule does not help if infrastructure still returns 403.",
              "Crawler controls are not one switch. For example, OpenAI documents OAI-SearchBot for search discovery separately from GPTBot controls. Decide deliberately which public paths each named crawler may request, and keep private paths protected.",
            ],
          },
          {
            heading: "2. Establish one clear URL for each important page",
            paragraphs: [
              "Use stable HTTPS URLs, a self-referential canonical where appropriate and a sitemap containing the canonical pages you want discovered. Keep redirects, canonical declarations and sitemap URLs consistent.",
              "Do not use robots.txt as a substitute for noindex or authentication. Crawling, indexing and access control solve different problems.",
            ],
          },
          {
            heading: "3. State the business entity in visible content",
            paragraphs: [
              "The page should say who the business is, what it offers, for whom, where it operates and how a customer takes the next step. Keep the public name, location, contact paths and core offer consistent across the homepage, contact page and relevant service pages.",
              "Add truthful structured data that represents the visible page. JSON-LD can make entities and relationships more explicit, but valid markup does not guarantee a rich result, recommendation or ranking.",
            ],
          },
          {
            heading: "4. Write blocks that can stand on their own",
            paragraphs: [
              "Use descriptive headings followed by a direct answer. Add concrete scope, conditions, location, prices or dates when they are verified and relevant. A machine should not need decorative layout or three previous sections to understand the claim.",
              "Treat citability checks as versioned heuristics, not proven ranking factors. They help identify ambiguous blocks; only later measurements can show whether observed visibility changed.",
            ],
          },
          {
            heading: "5. Verify the exact fix",
            paragraphs: [
              "Record the URL, observed fragment and rule before editing. Preview the proposed change, publish it through the site's normal owner-controlled workflow, then run a new readiness check. Preserve the old result as the baseline.",
              "A readiness increase means the site meets more of the disclosed technical and content criteria. It does not by itself mean AI systems now mention the brand more often. That conclusion requires a separate measurement cycle with the same Configuration Lock.",
            ],
            points: [
              "Check up to five key pages rather than only the homepage.",
              "Keep llms.txt diagnostic-only; Selena gives it zero scoring weight.",
              "Do not expose private accounts or add paid provider calls to a free readiness check.",
            ],
          },
        ],
        sources: [
          officialSources.openAiSearch,
          officialSources.googleCrawling,
          officialSources.googleCanonical,
          officialSources.googleStructuredData,
          officialSources.schemaOrg,
        ],
      },
      {
        section: "guides",
        slug: "read-ai-visibility-report-evidence",
        title: "How to read an AI Visibility Report and verify the evidence",
        summary:
          "A field guide to Configuration Lock, denominators, citations, provenance and invalid runs, with practical checks for trustworthy recommendations.",
        label: "Evidence guide",
        readingTime: "8 min",
        publishedAt: "2026-08-16",
        updatedAt: "2026-08-16",
        blocks: [
          {
            heading: "Begin with the Configuration Lock",
            paragraphs: [
              "Before reading a headline metric, confirm what was measured: channel, system, exact API model or visitor surface, web-search status, language, region, prompt families, language scenarios, repeats and date. These fields define the result.",
              "If a later cycle changes those inputs, it is a new baseline version. A before/after chart is meaningful only when the relevant method stays fixed and the changed variables are disclosed.",
            ],
          },
          {
            heading: "Check the denominator, not only the percentage",
            paragraphs: [
              "A mention rate of 40% means different things at 2 of 5 answers and 80 of 200 answers. Look for planned answers, valid answers, technical invalids, retries and missing rows. One unexpected extra row should stop the cycle rather than disappear inside an average.",
              "Retries should belong to one specific technical invalid. Re-running a whole prompt family or system can create hidden fan-out and bias the sample.",
            ],
          },
          {
            heading: "Trace every claim back to evidence",
            paragraphs: [
              "For an AI-answer finding, open the prompt, raw answer snapshot, system, model or surface, timestamp, citation URLs and validation state. For a website-readiness finding, open the page URL, text or HTML fragment, selector, rule ID and rule version.",
              "A citation URL proves that the answer referenced that URL in the captured run. It does not automatically prove that every sentence in the answer is correct or that the cited page supports the exact claim. That needs semantic citation review.",
            ],
          },
          {
            heading: "Separate observation, interpretation and action",
            paragraphs: [
              "Observation states what the captured evidence contains. Interpretation explains why it may matter. Recommendation proposes a change. A strong report keeps those layers visible instead of presenting an inferred cause as a measured fact.",
              "Automated recommendations should be labelled as automated. An Expert Verified status requires an actual QC record covering semantic mentions, citations, factual errors and the approved priority actions.",
            ],
          },
          {
            heading: "Use the report as a controlled loop",
            paragraphs: [
              "Choose the highest-priority evidence-backed fix, preview it, implement it through an owner-controlled process and verify the exact page. Keep readiness before/after separate from AI visibility before/after.",
              "When the change is ready for a real re-measurement, use the same Configuration Lock. Report the observed delta with its denominator and date, then monitor only while the baseline remains comparable.",
            ],
          },
        ],
        sources: [officialSources.googleStructuredData],
      },
      {
        section: "experiments",
        slug: "two-agent-code-review",
        title: "Reviewing AI-written code: what two agents got wrong",
        summary:
          "Reviewing AI-written code with two independent agents: both explained the failing check confidently, both were wrong, and the workflow file settled it.",
        label: "Experiment",
        readingTime: "6 min",
        publishedAt: "2026-08-29",
        updatedAt: "2026-08-29",
        blocks: [
          {
            heading: "What we were testing",
            paragraphs: [
              "Reviewing AI-written code is the part of the workflow that decides whether the rest of it is worth anything. This note records one test of a two-agent review setup, including the part that failed: two agents produced confident, plausible and wrong explanations of the same problem before anyone opened the file that settled it.",
              "Experiment notes in this Lab are published only when the setup, the inputs and the observed outcome can be reproduced. This one can. It is a single observation rather than a study: n = 1.",
              "The hypothesis was that if two independent agents read the same source instead of reading each other's summaries, review quality improves and the owner stops acting as a message bus between chats.",
            ],
            figure: {
              diagram: "two-agent-review-before-after",
              alt: "Two-panel diagram. Before: the owner sits between ChatGPT Work, Codex and Claude Code, copying reports from one chat to another by hand. After: all three read the same GitHub repository directly, and the owner only decides what is irreversible.",
              caption: "Before and after. Reports used to travel between tools by hand; now the task, the code and the machine checks live in GitHub and each tool reads them itself.",
            },
          },
          {
            heading: "Setup",
            paragraphs: [
              "Claude Code runs from a workflow file using the published GitHub Action, and is triggered by writing @claude in a comment on a pull request or an issue. It is not fully automatic, but from that point on it reads the pull request, the diff and the CI results itself rather than receiving a pasted summary.",
              "The repository is a fork. It inherited the upstream project's workflows, including a Contributor License Agreement check.",
            ],
            table: {
              caption: "The four components and what each one was responsible for.",
              headers: ["Component", "Role", "Auth"],
              rows: [
                ["Project workspace", "Holds documents, data and the specification", "Subscription"],
                ["Codex", "Writes code and migrations; reviews its own diff", "Subscription"],
                ["Claude Code", "Independent audit and security review, running as a GitHub Action", "Subscription OAuth token, no API key"],
                ["GitHub", "Shared source: task, code, diff, machine checks", "—"],
              ],
            },
            figure: {
              diagram: "two-agent-review-cycle",
              alt: "Flow of a single task: the owner states the intent, the project holds documents and data, Codex and Claude Cowork review the plan independently, an approved specification is produced, Codex writes code in a branch, then GitHub CI, Codex and Claude Code review the same commit; errors loop back with a concrete fix; the owner only merges, spends and publishes.",
              caption: "The review happens twice: first the plan, before a line of code exists, then the code itself — with both reviewers looking at the same commit.",
            },
          },
          {
            heading: "Inputs",
            paragraphs: [
              "The whole experiment ran against four artifacts, each of which is still in place and can be inspected again.",
            ],
            points: [
              "One pull request, open since 26 August 2026.",
              "One consistently failing status check: Verify CLA signature.",
              "The repository's commit history.",
              "The CLA workflow file and the contributors file it reads.",
            ],
          },
          {
            heading: "Two confident explanations, both wrong",
            paragraphs: [
              "The first agent reported that the red check was cosmetic, that it always fails for agent-authored commits, and that it could be merged past. Plausible: a previous pull request had indeed been merged with the same red mark.",
              "Asked to verify that, the second agent examined the commit history, observed that owner commits and agent commits carried different author addresses, and concluded that the check compares the commit author against the CLA signatory — fixable with one line of git configuration. Also plausible. Also wrong.",
              "Neither agent had opened the workflow file. Both were reasoning about what a check of that name would probably do.",
            ],
          },
          {
            heading: "What the file actually said",
            paragraphs: [
              "The check does not read commit authors at all. It takes the GitHub login of the pull request author and looks for it in the contributors file.",
              "That file is the signature registry of the upstream project the repository was forked from. It lists ten logins belonging to that project's contributors. The current repository owner's login is not among them, and adding it would mean signing another company's legal agreement.",
              "So the check will stay red permanently. It is not fixed by a signature. It is fixed by correcting the inherited workflow — whose own header comment states that repository owners and collaborators are exempt, while its script exempts only bot accounts.",
            ],
            code: {
              caption: "The line that settled it, from the CLA workflow.",
              content: "AUTHOR: ${{ github.event.pull_request.user.login }}",
            },
          },
          {
            heading: "Result",
            paragraphs: [
              "The hypothesis held in a narrow sense and failed in a broader one.",
              "It held in that the process which produced the correct answer was reading the source. It failed as a claim about agents: adding a second agent did not produce the correct answer. Two agents produced two confident wrong answers, and the correct one came from opening the file.",
              "The practical rule we took from this is not \"use two agents\". It is that an explanation is not evidence, however fluent it sounds, and that both reviewers must be pointed at the same artifact — the same commit, the same file — or their agreement means nothing.",
            ],
          },
          {
            heading: "Limits",
            paragraphs: [
              "This is one incident, and it should be read as one.",
            ],
            points: [
              "n = 1. It shows that this failure mode exists, not how often it occurs.",
              "Not a controlled comparison. The two agents received different prompts and had different access. Nothing here compares model quality.",
              "Not evidence that agents are unreliable in general. It is evidence that reasoning about a file without reading it is unreliable — which is equally true of people.",
              "The always-red check is a contributing cause. A status that is permanently red stops being read. That failure is organisational, not technical.",
            ],
          },
          {
            heading: "What remains unknown",
            paragraphs: [
              "Two questions this experiment raises and does not answer.",
            ],
            points: [
              "Whether a second agent adds accuracy when both are explicitly required to cite the source lines they relied on. Not tested here.",
              "How often plausible-but-unsourced explanations survive a two-agent review when nobody opens the underlying file.",
            ],
          },
          {
            heading: "How to reproduce",
            paragraphs: [
              "Any repository forked from a project that carries its own CLA workflow will reproduce this.",
            ],
            steps: [
              "Fork a repository that carries its own CLA workflow.",
              "Open a pull request from an account not listed in the upstream contributors file.",
              "Ask an agent why the check fails, without giving it the workflow file.",
              "Ask a second agent to verify the first, again without the file.",
              "Read the workflow directory yourself and compare all three answers.",
            ],
          },
        ],
        sources: [
          {
            title: "claude-code-action",
            href: "https://github.com/anthropics/claude-code-action",
            publisher: "Anthropic",
          },
          {
            title: "Elmo Contributor License Agreement",
            href: "https://github.com/elmohq/elmo/blob/main/CLA.md",
            publisher: "Blue Whale Software",
          },
        ],
        socialImage: {
          url: "/media/lab/two-agent-review-en.png",
          alt: "Before and after: the owner as a bus between three chats, then GitHub as the shared source all three read themselves.",
        },
        related: [
          { title: "What is AI Visibility?", href: "/lab/articles/what-is-ai-visibility" },
          { title: "Verify the evidence behind an AI Visibility report", href: "/lab/guides/read-ai-visibility-report-evidence" },
          { title: "Prepare a website for AI systems", href: "/lab/guides/prepare-site-for-ai-systems" },
        ],
      },
    ],
  },
  ru: {
    eyebrow: "Selena Lab",
    title: "Исследования, инструменты и практический опыт создания AI-систем.",
    intro:
      "Selena Lab объединяет исследовательскую лабораторию и блог Selena Systems. Здесь публикуются методы, эксперименты, инструменты, проверяемые кейсы и практический опыт работы с AI Visibility и AI Systems.",
    supportingLine: "Исследования → полезный контент → доверие → лучшие решения.",
    browseLabel: "Разделы Selena Lab",
    featuredLabel: "С чего начать",
    sectionEyebrow: "Библиотека Selena Lab",
    backLabel: "Вернуться в Selena Lab",
    sourcesLabel: "Первичные источники",
    relatedLabel: "Смежное",
    updatedLabel: "Обновлено",
    checkCta: {
      title: "Проверьте публичную готовность сайта",
      text: "Запустите бесплатный аудит, основанный на доказательствах. Он использует только публичные данные сайта и делает 0 платных обращений к AI-провайдерам.",
      label: "Запустить проверку готовности",
      href: "/ru/check",
    },
    systemsCta: {
      title: "Нужна система, а не только диагностика?",
      text: "Selena Systems разбирает процесс, определяет безопасную границу автоматизации и строит рабочий контур вместе с вашей командой.",
      label: "Обсудить AI-систему",
      href: "/contact",
    },
    coursesBoundary:
      "Сейчас ни один курс не выставлен на продажу. Бесплатные вводные материалы останутся в Selena Lab; платная запись откроется только с опубликованной программой, сроком доступа, ценой и условиями возврата. Будущий учебный кабинет будет находиться на app.selenasystems.com/app/learn.",
    sections: [
      {
        id: "research",
        title: "Исследования",
        description: "Версионированные исследования, наборы данных и бенчмарки с раскрытой методологией, происхождением данных и практическими выводами. Здесь важны источники и границы вывода.",
        emptyState: "Реестр исследований готовится. Пока ни один набор данных или бенчмарк не обозначен как опубликованный.",
      },
      {
        id: "guides",
        title: "Руководства",
        description: "Конкретные и опирающиеся на доказательства способы улучшать сайты, процессы и AI-системы с понятными следующими шагами. Здесь важны источники и границы вывода.",
      },
      {
        id: "experiments",
        title: "Эксперименты",
        description: "Воспроизводимые тесты методов и инструментов — включая неудачи, неизвестные результаты и их практический смысл. Здесь важны источники и границы вывода.",
        emptyState: "Эксперимент появится здесь только вместе с воспроизводимыми настройками, входными данными и наблюдаемым результатом.",
      },
      {
        id: "articles",
        title: "Статьи",
        description: "Понятные объяснения AI Visibility, доказательств и практического внедрения AI для команд и владельцев бизнеса. Здесь важны источники и границы вывода.",
      },
      {
        id: "courses",
        title: "Курсы",
        description: "Бесплатная база и, позднее, отдельные платные практические курсы с единым аккаунтом Selena и ясными условиями доступа и программой.",
      },
    ],
    items: [
      {
        section: "articles",
        slug: "what-is-ai-visibility",
        title: "Что такое AI Visibility",
        summary:
          "Практическое определение AI-видимости, её отличие от готовности сайта, реального измерения и границ интерпретации. Здесь разобраны доказательства и методика.",
        label: "База",
        readingTime: "6 минут",
        publishedAt: "2026-08-16",
        updatedAt: "2026-08-16",
        blocks: [
          {
            heading: "Рабочее определение",
            paragraphs: [
              "AI Visibility — это наблюдаемое присутствие бренда и то, как его описывают выбранные AI-системы в ответах на зафиксированный набор сценариев. Это не постоянное свойство компании и не один универсальный балл.",
              "Проверяемый результат указывает канал, систему или поверхность, точную API-модель, если она используется, язык, регион, семейство запросов, число повторов, дату и статус веб-поиска. Без этой конфигурации процент трудно интерпретировать и воспроизвести.",
            ],
          },
          {
            heading: "Готовность и видимость отвечают на разные вопросы",
            paragraphs: [
              "Проверка публичной готовности сайта показывает, могут ли машины получить, разобрать и повторно использовать информацию сайта. Сюда относятся HTTP-доступ, robots.txt, canonical, структурированные данные, ясность сущности, структура контента, согласованность контактов и эвристики цитируемости на уровне блоков.",
              "Реальный замер AI Visibility проверяет, что выбранные AI-системы действительно ответили. Для этого нужен отдельный цикл замера и журнал доказательств. Улучшение готовности делает сайт понятнее, но не доказывает, что ChatGPT, Gemini или Perplexity начали чаще упоминать или рекомендовать бренд.",
            ],
            points: [
              "Доказательства готовности приходят с сайта и из детерминированных правил.",
              "Доказательства видимости приходят из датированных AI-ответов с фиксацией конфигурации.",
              "Метрики можно сравнивать рядом, но нельзя смешивать в непрозрачный сводный балл.",
            ],
          },
          {
            heading: "«Как видит посетитель» и «через API» — не один канал",
            paragraphs: [
              "Пользовательская AI-поверхность с доступным поиском отличается от прямого API-ответа фиксированной модели с выключенным веб-поиском. Selena показывает результаты «как видит посетитель» и «через API» отдельно, а расхождение считает только между действительно сопоставимыми результатами.",
              "Так мы не выдаём один API-ответ за всё, что модель якобы «знает». Это лишь один ответ при одной конфигурации.",
            ],
          },
          {
            heading: "Что должно сохраняться в корректном измерении",
            paragraphs: [
              "В журнале доказательств остаются ответ и его контекст: запрос, система, модель или поверхность, статус поиска, язык, регион, номер повтора, отметки времени, цитирования и статус валидации. Ожидаемое число ответов планируется до запуска, чтобы пропущенные или лишние ответы не исчезали внутри среднего значения.",
              "Результат помогает принимать решения: показывает, где бренд появляется, кого называют вместо него, какие источники цитируют и что исследовать дальше. Он не гарантирует будущие позиции или рекомендации.",
            ],
          },
        ],
        sources: [officialSources.openAiSearch],
      },
      {
        section: "guides",
        slug: "prepare-site-for-ai-systems",
        title: "Как подготовить сайт для AI-систем",
        summary:
          "Безопасный чек-лист: доступ, индексируемость, ясность сущности, структурированные данные, контент с прямым ответом в начале и проверка результата — с проверяемыми шагами.",
        label: "Практическое руководство",
        readingTime: "9 минут",
        publishedAt: "2026-08-16",
        updatedAt: "2026-08-16",
        blocks: [
          {
            heading: "1. Сделайте ключевые страницы доступными без пользовательской сессии",
            paragraphs: [
              "Начните с обычного веб-доступа. Важные публичные страницы должны возвращать успешный HTTP-ответ без логина, CAPTCHA или проверки, которую проходит только браузер. Проверьте robots.txt и CDN/WAF отдельно: разрешение в robots.txt не поможет, если инфраструктура всё равно возвращает 403.",
              "Управление доступом краулеров — не один переключатель. Например, OpenAI отдельно документирует OAI-SearchBot для обнаружения в поиске и настройки для GPTBot. Осознанно решите, какие публичные пути доступны каждому названному краулеру, а приватные пути оставьте защищёнными.",
            ],
          },
          {
            heading: "2. Зафиксируйте один понятный URL для каждой важной страницы",
            paragraphs: [
              "Используйте стабильные HTTPS URL, самоссылающийся canonical там, где он уместен, и sitemap с каноническими страницами, которые должны находить поисковые системы. Редиректы, canonical и sitemap не должны противоречить друг другу.",
              "Не используйте robots.txt вместо noindex или авторизации. Обход, индексация и контроль доступа решают разные задачи.",
            ],
          },
          {
            heading: "3. Опишите бизнес-сущность в видимом контенте",
            paragraphs: [
              "Страница должна прямо отвечать: кто вы, что предлагаете, для кого, где работаете и какое действие сделать дальше. Согласуйте публичное имя, локацию, контакты и основной оффер на главной, контактной и страницах услуг.",
              "Добавьте правдивые структурированные данные, соответствующие видимому содержанию страницы. JSON-LD может яснее описать сущности и связи, но валидная разметка не гарантирует расширенный результат в поиске, рекомендацию или позицию.",
            ],
          },
          {
            heading: "4. Пишите блоки, понятные без окружающего дизайна",
            paragraphs: [
              "После описательного заголовка дайте прямой ответ. Добавляйте конкретный объём услуги, условия, локацию, цены или даты, только когда они подтверждены и уместны. Машине не должно требоваться декоративное расположение и три предыдущих раздела, чтобы понять утверждение.",
              "Проверки цитируемости — версионированные эвристики, а не доказанные факторы ранжирования. Они находят неоднозначные блоки; только последующие замеры могут показать изменение наблюдаемой AI-видимости.",
            ],
          },
          {
            heading: "5. Перепроверьте конкретное исправление",
            paragraphs: [
              "До изменения сохраните URL, наблюдаемый фрагмент и правило. Посмотрите предпросмотр, опубликуйте правку через обычный контролируемый владельцем процесс сайта, затем запустите новую проверку готовности. Старый результат остаётся исходным замером.",
              "Рост готовности означает, что сайт лучше соответствует раскрытым техническим и контентным критериям. Он не означает автоматически, что AI-системы чаще упоминают бренд. Для такого вывода нужен отдельный цикл замера с той же фиксацией конфигурации.",
            ],
            points: [
              "Проверяйте до пяти ключевых страниц, а не только главную.",
              "Сохраняйте llms.txt диагностическим сигналом с нулевым весом.",
              "Не подключайте приватные аккаунты и платные обращения к провайдерам к бесплатной проверке готовности.",
            ],
          },
        ],
        sources: [
          officialSources.openAiSearch,
          officialSources.googleCrawling,
          officialSources.googleCanonical,
          officialSources.googleStructuredData,
          officialSources.schemaOrg,
        ],
      },
      {
        section: "guides",
        slug: "read-ai-visibility-report-evidence",
        title: "Как читать отчёт AI Visibility и проверять доказательства",
        summary:
          "Практика чтения фиксации конфигурации, знаменателей, цитирований, происхождения данных и невалидных запусков для проверяемых рекомендаций и решений.",
        label: "Руководство по доказательствам",
        readingTime: "8 минут",
        publishedAt: "2026-08-16",
        updatedAt: "2026-08-16",
        blocks: [
          {
            heading: "Начните с фиксации конфигурации",
            paragraphs: [
              "До главной метрики проверьте, что измерялось: канал, система, точная API-модель или пользовательская поверхность, статус веб-поиска, язык, регион, семейства запросов, языковые сценарии, повторы и дата. Эти поля определяют результат.",
              "Если в следующем цикле входные параметры изменились, это новая версия исходного замера. Сравнение «до/после» имеет смысл только при сохранении релевантной методики и раскрытии изменённых переменных.",
            ],
          },
          {
            heading: "Проверяйте знаменатель, а не только процент",
            paragraphs: [
              "Доля упоминаний 40% означает разное при 2 из 5 и при 80 из 200 ответов. Смотрите запланированные и валидные ответы, технически невалидные ответы, повторные попытки и отсутствующие строки. Одна неожиданная лишняя строка должна остановить цикл, а не раствориться в среднем.",
              "Повторная попытка относится только к одному конкретному технически невалидному ответу. Повтор всего семейства запросов или системы скрыто размножает запросы и может исказить выборку.",
            ],
          },
          {
            heading: "Сводите каждое утверждение к доказательству",
            paragraphs: [
              "Для находки по AI-ответу откройте запрос, снимок исходного ответа, систему, модель или поверхность, отметку времени, URL цитирований и статус валидации. Для находки по готовности сайта — URL страницы, текстовый или HTML-фрагмент, селектор, идентификатор и версию правила.",
              "URL цитирования доказывает, что ответ сослался на этот URL в сохранённом запуске. Это не доказывает автоматически корректность каждой фразы или поддержку конкретного утверждения источником — для этого нужна смысловая проверка цитирований.",
            ],
          },
          {
            heading: "Разделяйте наблюдение, интерпретацию и действие",
            paragraphs: [
              "Наблюдение описывает сохранённое доказательство. Интерпретация объясняет возможное значение. Рекомендация предлагает изменение. Сильный отчёт показывает эти слои отдельно и не выдаёт предполагаемую причину за измеренный факт.",
              "Автоматические рекомендации должны быть так и обозначены. Статус «Проверено экспертом» требует реальной записи о проверке качества: смысловые упоминания, цитирования, фактические ошибки и утверждённые приоритетные действия.",
            ],
          },
          {
            heading: "Используйте отчёт как контролируемый цикл",
            paragraphs: [
              "Выберите самое приоритетное исправление, подкреплённое доказательствами, посмотрите предпросмотр, внедрите его через процесс под контролем владельца и перепроверьте именно эту страницу. Готовность «до/после» хранится отдельно от AI-видимости «до/после».",
              "Для реального повторного замера сохраните ту же фиксацию конфигурации. Покажите наблюдаемое изменение со знаменателем и датой, а мониторинг продолжайте, только пока исходный замер остаётся сопоставимым.",
            ],
          },
        ],
        sources: [officialSources.googleStructuredData],
      },
      {
        section: "experiments",
        slug: "two-agent-code-review",
        title: "Проверка кода, написанного ИИ: как два агента ошиблись",
        summary:
          "Проверку кода вели два независимых агента. Оба уверенно объяснили красную проверку — и оба ошиблись. Вопрос закрыл сам файл сценария GitHub Actions.",
        label: "Опыт",
        readingTime: "6 мин",
        publishedAt: "2026-08-29",
        updatedAt: "2026-08-29",
        blocks: [
          {
            heading: "Что проверяли",
            paragraphs: [
              "Проверка кода, написанного ИИ, — то место, от которого зависит, стоит ли чего-нибудь весь остальной процесс. Ниже запись одного опыта с двумя независимыми проверяющими, включая ту часть, что не сработала: два агента подряд выдали уверенные, правдоподобные и неверные объяснения одной и той же проблемы — до того, как кто-то открыл файл, который закрыл вопрос.",
              "Записи опытов публикуются здесь только тогда, когда установку, входные данные и наблюдаемый результат можно воспроизвести. Этот — можно. Это одно наблюдение, а не исследование: n = 1.",
              "Гипотеза была такая: если два независимых агента читают один и тот же источник, а не пересказы друг друга, качество проверки растёт, а владелец перестаёт быть шиной между чатами.",
            ],
            figure: {
              diagram: "two-agent-review-before-after",
              alt: "Схема из двух частей. Было: владелец стоит между ChatGPT Work, Codex и Claude Code и вручную переносит отчёты из одного чата в другой. Стало: все трое читают один и тот же репозиторий GitHub напрямую, а владелец решает только то, что необратимо.",
              caption: "До и после. Раньше отчёты между инструментами переносил человек; теперь задача, код и машинные проверки лежат в GitHub, и каждый инструмент читает их сам.",
            },
          },
          {
            heading: "Установка",
            paragraphs: [
              "Claude Code запускается из файла сценария через опубликованный GitHub Action и срабатывает от упоминания @claude в комментарии к пул-реквесту или задаче. То есть вызывается вручную, но дальше читает сам пул-реквест, дифф и результаты CI, а не присланный пересказ.",
              "Репозиторий — форк. Вместе с ним достались чужие сценарии GitHub Actions, включая проверку подписи соглашения участника (CLA).",
            ],
            table: {
              caption: "Четыре компонента и зона ответственности каждого.",
              headers: ["Компонент", "Роль", "Оплата"],
              rows: [
                ["Рабочее пространство проекта", "Документы, данные, ТЗ", "Подписка"],
                ["Codex", "Пишет код и миграции, проверяет собственный дифф", "Подписка"],
                ["Claude Code", "Независимый аудит и проверка безопасности, запускается как GitHub Action", "OAuth-токен подписки, без API-ключа"],
                ["GitHub", "Общий источник: задача, код, дифф, машинные проверки", "—"],
              ],
            },
            figure: {
              diagram: "two-agent-review-cycle",
              alt: "Путь одной задачи: владелец формулирует замысел, проект хранит документы и данные, Codex и Claude Cowork независимо проверяют замысел, появляется утверждённое ТЗ, Codex пишет код в отдельной ветке, затем GitHub CI, Codex и Claude Code проверяют один и тот же коммит; ошибки возвращаются с конкретной правкой; владелец только мержит, тратит и публикует.",
              caption: "Проверка происходит дважды: сначала замысел, до первой строки кода, потом сам код — и оба проверяющих смотрят один и тот же коммит.",
            },
          },
          {
            heading: "Входные данные",
            paragraphs: [
              "Весь опыт шёл на четырёх артефактах — все они на месте, и каждый можно открыть заново.",
            ],
            points: [
              "Один пул-реквест, открыт с 26 августа 2026.",
              "Одна стабильно падающая проверка: «Verify CLA signature».",
              "История коммитов репозитория.",
              "Файл сценария с проверкой CLA и файл со списком подписантов, который он читает.",
            ],
          },
          {
            heading: "Два уверенных объяснения, оба неверные",
            paragraphs: [
              "Первый агент сообщил: красная отметка косметическая, у агентских коммитов она падает всегда, можно мержить мимо. Правдоподобно — предыдущий пул-реквест действительно был влит с той же красной отметкой.",
              "На перепроверку второй агент посмотрел историю коммитов, увидел, что коммиты владельца и коммиты агентов идут с разных адресов, и заключил: проверка сверяет автора коммита с подписантом соглашения, лечится одной строкой в настройках git. Тоже правдоподобно. Тоже неверно.",
              "Ни один из них не открыл файл сценария. Оба рассуждали о том, что проверка с таким названием, вероятно, делает.",
            ],
          },
          {
            heading: "Что сказал сам файл",
            paragraphs: [
              "Проверка не читает авторов коммитов вообще. Она берёт GitHub-логин автора пул-реквеста и ищет его в файле подписантов.",
              "Этот файл — реестр подписей проекта, от которого форкнут репозиторий. В нём десять логинов участников того проекта. Логина текущего владельца там нет, а вписать его означало бы подписать юридическое соглашение чужой компании.",
              "Значит, проверка останется красной навсегда. Она чинится не подписью, а правкой унаследованного сценария — в шапке которого написано, что владелец репозитория и коллабораторы освобождены от проверки, тогда как скрипт освобождает только ботов.",
            ],
            code: {
              caption: "Строка, которая закрыла вопрос, — из сценария проверки CLA.",
              content: "AUTHOR: ${{ github.event.pull_request.user.login }}",
            },
          },
          {
            heading: "Результат",
            paragraphs: [
              "Гипотеза подтвердилась в узком смысле и провалилась в широком.",
              "Подтвердилась в том, что верный ответ дало чтение источника. Провалилась как утверждение об агентах: второй агент верного ответа не дал. Два агента выдали два уверенных неверных ответа, а верный появился, когда открыли файл.",
              "Практическое правило отсюда не «используйте двух агентов». Оно такое: объяснение — не доказательство, каким бы гладким оно ни было, и оба проверяющих должны смотреть в один и тот же артефакт — тот же коммит, тот же файл, — иначе их согласие ничего не значит.",
            ],
          },
          {
            heading: "Границы",
            paragraphs: [
              "Это один случай, и читать его нужно как один случай.",
            ],
            points: [
              "n = 1. Он показывает, что такой отказ возможен, а не насколько часто он случается.",
              "Это не контролируемое сравнение. Агенты получили разные запросы и разный доступ. Качество моделей здесь не сравнивается.",
              "Это не доказательство ненадёжности агентов вообще. Это доказательство ненадёжности рассуждения о файле без чтения файла — что одинаково верно и для людей.",
              "Вечно красная проверка — сопутствующая причина. Статус, который всегда красный, перестают читать. Этот отказ организационный, а не технический.",
            ],
          },
          {
            heading: "Что осталось неизвестным",
            paragraphs: [
              "Два вопроса, которые этот опыт поднимает и не закрывает.",
            ],
            points: [
              "Добавляет ли второй проверяющий точности, если от обоих требовать ссылки на конкретные строки источника. Здесь это не проверялось.",
              "Как часто правдоподобные объяснения без источника переживают проверку двумя агентами, если никто не открывает исходный файл.",
            ],
          },
          {
            heading: "Как воспроизвести",
            paragraphs: [
              "Это воспроизводится на любом репозитории, форкнутом от проекта с собственной проверкой CLA.",
            ],
            steps: [
              "Форкните репозиторий, в котором есть собственная проверка CLA.",
              "Откройте пул-реквест с аккаунта, которого нет в списке подписантов исходного проекта.",
              "Спросите агента, почему проверка падает, не давая ему файл сценария.",
              "Попросите второго агента перепроверить первого — тоже без файла.",
              "Откройте каталог сценариев (.github/workflows) сами и сравните все три ответа.",
            ],
          },
        ],
        sources: [
          {
            title: "claude-code-action",
            href: "https://github.com/anthropics/claude-code-action",
            publisher: "Anthropic",
          },
          {
            title: "Elmo Contributor License Agreement",
            href: "https://github.com/elmohq/elmo/blob/main/CLA.md",
            publisher: "Blue Whale Software",
          },
        ],
        socialImage: {
          url: "/media/lab/two-agent-review-ru.png",
          alt: "До и после: владелец как шина между тремя чатами, затем GitHub как общий источник, который все трое читают сами.",
        },
        related: [
          { title: "Что такое AI Visibility", href: "/ru/lab/articles/what-is-ai-visibility" },
          { title: "Как проверить доказательства в отчёте AI Visibility", href: "/ru/lab/guides/read-ai-visibility-report-evidence" },
          { title: "Как подготовить сайт к работе ИИ-систем", href: "/ru/lab/guides/prepare-site-for-ai-systems" },
        ],
      },
    ],
  },
};

export const labSectionIds: LabSectionId[] = ["research", "guides", "experiments", "articles", "courses"];

export function labPath(locale: LabLocale, section?: LabSectionId, slug?: string) {
  const prefix = locale === "ru" ? "/ru/lab" : "/lab";
  return [prefix, section, slug].filter(Boolean).join("/");
}

export function labLanguages(section?: LabSectionId, slug?: string) {
  return {
    "x-default": labPath("en", section, slug),
    en: labPath("en", section, slug),
    ru: labPath("ru", section, slug),
  };
}

export function getLabSection(locale: LabLocale, section: string) {
  return labContent[locale].sections.find((item) => item.id === section) ?? null;
}

export function getLabItems(locale: LabLocale, section?: string) {
  return section ? labContent[locale].items.filter((item) => item.section === section) : labContent[locale].items;
}

export function getLabItem(locale: LabLocale, section: string, slug: string) {
  return labContent[locale].items.find((item) => item.section === section && item.slug === slug) ?? null;
}
