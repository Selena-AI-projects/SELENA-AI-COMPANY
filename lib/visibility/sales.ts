import { commercialFacts } from "@/lib/commercial-facts";
import type { PricingTrackContent, VisibilityLocale } from "./types";

const offers = commercialFacts.aiVisibility;
export const discoverySystems = {
  visitor: ["ChatGPT", "Gemini", "Perplexity"],
  api: ["Claude", "DeepSeek", "Qwen", "Mistral", "Grok"],
} as const;

export const discoveryLinks = {
  free: "/check",
  plans: "/visibility#plans",
  snapshot: "/visibility#early-access",
  landscape: "/visibility#early-access",
  audit: "/visibility#audit-order",
  managed: "/visibility#managed-application",
  methodology: "/methodology",
} as const;

export function discoveryTracks(locale: VisibilityLocale): PricingTrackContent[] {
  const en = locale === "en";
  const visitor = en
    ? `Visitor View: ${discoverySystems.visitor.join(" · ")}`
    : `Как видит посетитель: ${discoverySystems.visitor.join(" · ")}`;
  const api = en
    ? `API / Model Landscape: ${discoverySystems.api.join(" · ")}`
    : `Через API (модели): ${discoverySystems.api.join(" · ")}`;
  return [
    {
      title: en ? "Monitoring · early access" : "Мониторинг · ранний доступ",
      intro: en
        ? "One landscape, two levels of coverage. Recurring subscriptions and weekly delivery are not yet activated."
        : "Один рынок, два уровня охвата. Регулярные подписки и еженедельная доставка пока не активированы.",
      plans: [
        {
          name: offers.snapshot.name[locale],
          audience: en ? "Try it first" : "Попробовать",
          price: offers.snapshot[locale],
          status: "founding_soon",
          statusLabel: en ? "Early access · recurring not yet live" : "Ранний доступ · регулярный режим ещё не запущен",
          description: en ? "See what guests see — and what to do next." : "Узнайте, что видят гости и что улучшить дальше.",
          systemsLabel: visitor,
          volumeLabel: en
            ? "Up to 25 guest-intent questions · one language · one repeat per measurement"
            : "До 25 вопросов гостей · один язык · один повтор на замер",
          progressionLabel: en ? "WHERE → WHO → SOURCES → CHANGE → NEXT ACTION" : "ГДЕ → КТО → ИСТОЧНИКИ → ИЗМЕНЕНИЯ → СЛЕДУЮЩИЙ ШАГ",
          features: en
            ? [
                "Answers and mentions; positions where applicable",
                "Businesses shown instead of you and discovered competitors",
                "Citations and sources supporting the measured answers",
                "Automatic recommendations included — what deserves attention next",
                "Report history; comparable movement when recurring mode is active",
                "Weekly Telegram and authenticated reports after delivery activation",
              ]
            : [
                "Ответы и упоминания; позиции, где применимо",
                "Бизнесы вместо вас и обнаруженные конкуренты",
                "Цитаты и источники измеренных ответов",
                "Автоматические рекомендации включены — что улучшить дальше",
                "История отчётов; сравнение после активации регулярного режима",
                "Еженедельный отчёт в Telegram и отчёты в кабинете после активации доставки",
              ],
          href: en ? discoveryLinks.snapshot : "/ru/visibility#early-access",
          ctaLabel: en ? "Request Snapshot early access" : "Запросить ранний доступ к Visibility Snapshot",
        },
        {
          name: offers.landscape.name[locale],
          audience: en ? "The main choice" : "Основной выбор",
          price: offers.landscape[locale],
          status: "founding_soon",
          featured: true,
          statusLabel: en ? "Recommended for hospitality · early access" : "Для гостеприимства · ранний доступ",
          description: en ? "See the whole competitive discovery landscape." : "Увидьте весь конкурентный рынок в AI и локальном поиске.",
          systemsLabel: `${visitor}. ${api}.`,
          volumeLabel: en
            ? "Up to 25 questions across up to two languages; Visitor/API reported separately"
            : "До 25 вопросов на одном или двух языках; «как видит посетитель» и «через API» — отдельно",
          progressionLabel: en
            ? "AI + LOCAL → COMPETITORS → SOURCES → OPPORTUNITIES → NEXT ACTION"
            : "AI И ЛОКАЛЬНЫЙ ПОИСК → КОНКУРЕНТЫ → ИСТОЧНИКИ → ВОЗМОЖНОСТИ → СЛЕДУЮЩИЙ ШАГ",
          features: en
            ? [
                "Google Maps / Local Visibility only where production-capable automated measurement is verified",
                "Competitors by guest intent: where you win, lose or are absent",
                "Expanded sources and cross-system competitor patterns",
                "Expanded recommendations included — opportunities to investigate or improve first",
                "API output is not the consumer experience; evidence classes are never blended",
              ]
            : [
                "Google Maps / локальная видимость — только там, где подтверждён автоматический замер в рабочем режиме",
                "Конкуренты по запросам гостей: где вы выигрываете, проигрываете или отсутствуете",
                "Расширенные источники и паттерны конкурентов в разных системах",
                "Расширенные рекомендации включены — что исследовать или улучшить первым",
                "API-ответ не равен потребительскому опыту; классы доказательств разделены",
              ],
          href: en ? discoveryLinks.landscape : "/ru/visibility#early-access",
          ctaLabel: en ? "Request Full Discovery early access" : "Запросить ранний доступ к Full Discovery Landscape",
        },
      ],
    },
    {
      title: en ? "Human-led decisions and execution" : "Решения и внедрение с экспертом",
      intro: en
        ? "Understand the evidence, choose the work, then verify what changed."
        : "Разберите доказательства, выберите действия и проверьте изменения.",
      plans: [
        {
          name: offers.expertVerified.name[locale],
          audience: en ? "Go deep once" : "Разобраться глубоко",
          price: offers.expertVerified[locale],
          status: "founding_soon",
          statusLabel: en ? "One-time · manual booking" : "Разово · запись вручную",
          description: en ? "Know why they win." : "Поймите, почему выигрывают конкуренты.",
          systemsLabel: en
            ? "Selena baseline + human review of AI, Local, reviews and source evidence"
            : "Исходный замер Selena + ручной анализ AI-ответов, локального поиска, отзывов и источников",
          volumeLabel: en
            ? "3–5 real discovery competitors · 60-minute Strategy Session"
            : "3–5 реальных конкурентов · стратегическая сессия 60 минут",
          progressionLabel: en ? "HUMAN INVESTIGATION → VERIFIED PRIORITIES → ACTION PLAN" : "ИССЛЕДОВАНИЕ АНАЛИТИКА → ПРОВЕРЕННЫЕ ПРИОРИТЕТЫ → ПЛАН ДЕЙСТВИЙ",
          features: en
            ? [
                "Manual competitor investigation and challenge of weak automatic recommendations",
                "Manual Google Ask Maps / Local AI investigation and other manual discovery checks where relevant",
                "Owner / GM / authorized decision-maker attends",
                "Final implementation-ready Action Plan within 3 business days after the session",
                "One comparable recheck, requested within 30 days",
                "Preparation, attendance and refund terms before booking",
              ]
            : [
                "Ручной анализ конкурентов и проверка слабых автоматических рекомендаций",
                "Ручное исследование Google Ask Maps / локального AI-поиска и других поверхностей поиска, где это релевантно",
                "Участие владельца, управляющего или уполномоченного руководителя",
                "Готовый к внедрению план действий за 3 рабочих дня после сессии",
                "Один сопоставимый повторный замер по запросу в течение 30 дней",
                "Подготовка, участие и условия возврата до записи",
              ],
          href: en ? discoveryLinks.audit : "/ru/visibility#audit-order",
          ctaLabel: en ? "Book my Competitive Audit — $399" : "Условия и запись на аудит — $399",
        },
        {
          name: offers.implementation90Days.name[locale],
          audience: en ? "We run it for you" : "Мы ведём за вас",
          price: `${offers.implementation90Days[locale]} · ${en ? "90 days" : "90 дней"}`,
          status: "active",
          statusLabel: en
            ? "Application · agreed scope · manual approval"
            : "Заявка · согласованный объём · ручное одобрение",
          description: en ? "Want us to implement the plan?" : "Хотите поручить нам внедрение плана?",
          systemsLabel: en
            ? "Full Discovery monitoring within the agreed production-capable scope"
            : "Мониторинг Full Discovery Landscape в согласованных границах рабочего режима",
          volumeLabel: en
            ? "90 days · scope, cycles and provider cap agreed before work"
            : "90 дней · объём, циклы и лимит провайдеров согласуются до работы",
          progressionLabel: en ? "EXECUTION → MONITORING → RECHECK → ADJUSTMENT" : "ВНЕДРЕНИЕ → МОНИТОРИНГ → ПОВТОРНЫЙ ЗАМЕР → КОРРЕКТИРОВКА",
          features: en
            ? [
                "Approved Action Plan and agreed Selena-owned implementation",
                "Automated-surface monitoring, progress tracking and comparable rechecks",
                "Manual Ask Maps baseline → implementation → comparable manual recheck, only where agreed in scope; not weekly automated measurement",
                "Client workspace/history; weekly Telegram only after delivery activation",
                "Adjustment, second implementation iteration and final before/after review",
                "We do not guarantee rankings, recommendation rate, traffic, bookings or revenue",
              ]
            : [
                "Утверждённый план действий и согласованное внедрение силами Selena",
                "Мониторинг автоматизированных поверхностей, статусы и сопоставимые повторные замеры",
                "Ручной Ask Maps: исходная проверка → внедрение → сопоставимая ручная перепроверка, только в согласованном объёме; не еженедельный автоматический замер",
                "Кабинет и история; еженедельный отчёт в Telegram — только после активации доставки",
                "Корректировка, вторая итерация и финальное сравнение до/после",
                "Без гарантий позиций, рекомендаций, трафика, бронирований и выручки",
              ],
          href: en ? discoveryLinks.managed : "/ru/visibility#managed-application",
          ctaLabel: en ? "Apply for Managed Discovery" : "Подать заявку на Managed Discovery",
        },
      ],
    },
  ];
}

export const auditTerms = [
  {
    title: "Preparation",
    body: "After booking you receive a short preparation form covering your website, Google Business Profile, languages, priority markets and the services that matter commercially. Submit it at least 48 hours before the session. Investigation cannot begin until the required information is complete.",
  },
  {
    title: "Attendance",
    body: "The owner, GM or another person authorized to approve changes should attend. If they cannot attend, reschedule instead.",
  },
  {
    title: "Rescheduling",
    body: "One free reschedule is available with at least 24 hours’ notice. A no-show forfeits the session. If the investigation has already been completed, you still receive the written preliminary analysis based on the evidence available.",
  },
  {
    title: "Delivery",
    body: "Final Action Plan within 3 business days after the completed session. One comparable verification measurement is included and may be requested within 30 days.",
  },
  {
    title: "Refunds",
    body: "The Audit is fully refundable before analyst investigation begins. Investigation begins when Selena accepts the completed preparation information and starts the analyst review. Once substantive analyst work has begun, the Audit is non-refundable, subject to mandatory applicable law.",
  },
] as const;
export const auditTermsRu = [
  {
    title: "Подготовка",
    body: "После записи вы получите короткую форму: сайт, Google Business Profile, языки, приоритетные рынки и коммерчески важные услуги. Отправьте её минимум за 48 часов до сессии. Исследование не начинается без полной информации.",
  },
  {
    title: "Участие",
    body: "На сессии нужен владелец, управляющий или руководитель с правом утверждать изменения. Если он не может присутствовать, перенесите встречу.",
  },
  {
    title: "Перенос",
    body: "Один бесплатный перенос при уведомлении минимум за 24 часа. При неявке сессия сгорает. Если исследование уже завершено, вы получите письменный предварительный анализ доступных доказательств.",
  },
  {
    title: "Результат",
    body: "Финальный план действий — в течение 3 рабочих дней после завершённой сессии. Включён один сопоставимый повторный замер, который можно запросить в течение 30 дней.",
  },
  {
    title: "Возврат",
    body: "Полный возврат возможен до начала исследования аналитиком. Начало исследования — Selena принимает заполненную форму подготовки и начинает аналитический разбор. После начала содержательной работы аудит не подлежит возврату с учётом обязательных норм применимого права.",
  },
] as const;

export const discoverySales = {
  hero: {
    eyebrow: "FOR HOTELS, VILLAS, RESTAURANTS, SPAS & EXPERIENCE BUSINESSES",
    title: "When guests ask AI where to stay, eat or book, do they find you — or your competitors?",
    intro:
      "Selena measures how your business appears across AI and local discovery, shows which competitors are winning instead, which sources support those answers, and what you should improve next.",
    gate: "Monitoring subscriptions are in early access. Weekly recurring measurements and Telegram delivery are not yet activated.",
  },
  problem: {
    title: "You can’t improve what you can’t see.",
    examples: [
      {
        query: "Best romantic restaurant near me?",
        finding: "AI recommends three competitors. Your restaurant isn’t there.",
      },
      {
        query: "Best family villa in Canggu?",
        finding: "Your villa may appear in one discovery surface and disappear in another.",
      },
      { query: "Best couples spa in Ubud?", finding: "A competitor repeatedly appears across AI and local discovery." },
    ],
  },
  surfaces: [
    { title: "AI Discovery", body: [...discoverySystems.visitor, ...discoverySystems.api].join(" · ") },
    {
      title: "Local Discovery",
      body: "Google Maps / Local Visibility where production-capable automated measurement is verified. Manual discovery investigation belongs to the human-led Audit.",
    },
    { title: "Evidence", body: "Citations · Sources · Reviews · Websites" },
  ],
  answers: [
    { label: "WHERE", question: "Do you appear?" },
    { label: "WHO", question: "Appears instead of you?" },
    { label: "WHICH SOURCES", question: "Support those answers?" },
    { label: "WHAT CHANGED", question: "Between comparable measurements?" },
    { label: "NEXT ACTION", question: "What should you do next?" },
  ],
  answersIntro: "You don't just get a visibility measurement. You see the businesses taking the recommendation, the evidence behind them, and Selena's recommended next actions.",
  preview: {
    label: "Illustrative demo · fictional businesses and values · not client results",
    intro: "Selena doesn't only track your business. It tracks the businesses appearing instead of you across the guest intents that matter.",
    concepts: [
      { title: "Your business", body: "Where you appear — and where you disappear." },
      { title: "Competitors", body: "Which businesses are being recommended instead." },
      { title: "Sources", body: "Which citations and third-party sources support those answers." },
      { title: "Patterns", body: "Which competitors repeatedly win particular guest intents across measured AI and verified Local discovery — only when comparable observations support a pattern." },
      { title: "Recommendations", body: "What Selena recommends improving next based on the observed evidence." },
    ],
    rows: [
      { intent: "Romantic dinner", visibility: "Absent", competitor: "Example Restaurant A", source: "Example sources X, Y", recommendation: "Strengthen evidence for special-occasion dining." },
      { intent: "Family villa", visibility: "Visible", competitor: "Example Villa B", source: "Example sources X, Z", recommendation: "Clarify verified family capacity and amenities." },
      { intent: "Couples spa", visibility: "Visible / lower", competitor: "Example Spa C", source: "Example sources Y, Z", recommendation: "Resolve inconsistent treatment information." },
    ],
    boundary: "Separate fictional scenarios, not one business competing across unrelated categories. This single-cycle demo establishes no recurring pattern or change. Recommendations are evidence-based suggestions, not proof of why a competitor wins or a promise of improvement. Verified before/after outcomes require comparable rechecks.",
  },
  telegram: {
    title: "Don’t check another dashboard. Selena comes to you.",
    preview: "Preview · weekly production delivery is not activated",
    intro:
      "The planned weekly digest brings what changed, what matters and what deserves action directly to Telegram. The full evidence stays in your workspace. This preview is not a live delivery promise.",
    lines: [
      "SELENA WEEKLY",
      "Your discovery landscape · illustrative week",
      "Visibility: 16/25 → 18/25",
      "New recurring competitor: 1",
      "New cited sources: 3",
      "Priority: Example Competitor X appears in a tracked high-value intent.",
    ],
    boundary:
      "Synthetic values, not client results. A report must be saved before a short digest goes to one verified recipient with an authenticated workspace link. Telegram never starts a measurement; delivery retries must not create duplicate measurements.",
  },
  free: {
    title: "Can AI understand your business before it can recommend it?",
    intro:
      "Selena Public Readiness checks whether AI systems can access, read and understand the public information on your website.",
    checks: [
      "Crawler access and indexability",
      "Sitemap and canonical signals",
      "Entity/business clarity and structured information",
      "Citability and major technical blockers",
    ],
    boundary:
      "Public Readiness is not an AI visibility measurement. It does not tell you where you rank, who appears instead or which competitors AI recommends. That starts with Visibility Snapshot.",
  },
  bridge:
    "But an automatic recommendation is not the same as a verified business decision. The $399 Verified Discovery & Competitive Audit investigates the 3–5 competitors actually beating you: their relevant pages, reviews, Local evidence, citations and important third-party sources. The $79 plan reports what the automatically measurable landscape shows. The $399 Audit investigates what requires human verification, including manual Google Ask Maps / Local AI where automated measurement is unavailable. A human analyst challenges Selena’s automatic recommendations and turns the strongest findings into an implementation-ready Action Plan with the owner / GM.",
  audit: {
    intro:
      "Selena measures the landscape first. Then an analyst investigates the competitors actually beating you, validates the evidence with you and turns it into an implementation-ready plan.",
    investigation: [
      "Verify Selena’s measurement and select 3–5 real discovery competitors",
      "Investigate relevant competitor pages, Google Maps evidence and public reviews",
      "Includes manual Google Ask Maps / Local AI investigation where relevant; other relevant manual discovery checks",
      "Inspect recurring attributes, citations and important third-party sources",
      "Compare public evidence, challenge automatic recommendations and reject weakly supported actions",
      "Prepare the preliminary diagnosis",
    ],
    session: [
      "Identify valuable guests, segments, rooms, services, dayparts and offers",
      "Agree priority markets and languages; remove commercially irrelevant recommendations",
      "Review real discovery competitors and why the strongest appear to win",
      "Agree what deserves action first with the owner, GM or authorized decision-maker",
    ],
    fields: [
      "PROBLEM",
      "LOCATION",
      "EVIDENCE",
      "COMPETITOR PROOF",
      "ACTION",
      "PRIORITY",
      "EXPECTED MECHANISM",
      "EFFORT",
      "OWNER",
      "RECHECK METHOD",
      "STATUS",
    ],
    classes: [
      "VERIFIED PRIORITY — evidence is strong enough to recommend action",
      "TEST — reasonable hypothesis that must be tested",
      "DO NOT PRIORITIZE — a difference exists but does not justify investment now",
    ],
    statuses: "Not started / In progress / Ready for recheck / Verified / No verified improvement",
  },
  actions: [
    {
      title: "Clarify the family-stay offer",
      fields: [
        "Problem: the public room page does not explain family capacity.",
        "Location: example villa /rooms/family page.",
        "Evidence: DEMO-01 — capacity is missing in the illustrative page review.",
        "Competitor proof: Example Villa B states capacity and room configuration.",
        "Action: add verified maximum occupancy, room layout and child-policy information to the family-room page.",
        "Priority: P1 · recommendation class: TEST.",
        "Expected mechanism: make the offer easier to understand; improved inclusion is a hypothesis.",
        "Effort: Low.",
        "Owner: Client / developer.",
        "Recheck method: review the edited page and repeat the same locked guest intents.",
        "Status: Not started.",
      ],
    },
    {
      title: "Make treatment information consistent",
      fields: [
        "Problem: the spa treatment duration differs across two public sources.",
        "Location: example spa treatment page + authorized business profile.",
        "Evidence: DEMO-02 — two conflicting descriptions in this fictional example.",
        "Competitor proof: Example Spa C publishes a consistent treatment description.",
        "Action: verify the actual duration with the operator, then correct the owned page and authorized profile.",
        "Priority: P2 · recommendation class: VERIFIED PRIORITY within this demo only.",
        "Expected mechanism: remove conflicting business information; discovery improvement is not assured.",
        "Effort: Medium.",
        "Owner: Client / marketing.",
        "Recheck method: inspect both sources and repeat the comparable AI + Local measurement where available.",
        "Status: Ready for recheck.",
      ],
    },
  ],
  diy: ["Website and business-information changes", "Developer fixes", "Operational changes and internal content"],
  execution: [
    "Discovery implementation and evidence/content work",
    "Source/citation work and authorized, supported Local improvements",
    "Coordination, monitoring and rechecks",
  ],
  trust:
    "The $399 Audit does not lock you into implementation with Selena. You own the plan and decide what your team handles and what Selena executes.",
  managed: {
    intro: "We implement the agreed plan while Selena keeps monitoring the discovery market.",
    cycle: "BASELINE → EXECUTE → RECHECK → ADJUST → EXECUTE → VERIFY",
    boundary:
      "The scope, cycle count, provider cost cap and delivery responsibilities are agreed before work. Weekly Telegram is included only when production delivery is activated. No ranking, recommendation-rate, traffic, bookings or revenue guarantee.",
  },
  methodology: [
    "Visitor View ≠ API View",
    "AI ≠ Maps",
    "Observation ≠ cause",
    "One cycle ≠ trend",
    "Recommendation ≠ verified outcome",
    "Unknown/unavailable is never silently converted to zero",
  ],
  case: [
    "Problem: unclear family-stay information in a fictional example.",
    "Selena found: a gap in public evidence, not a proven ranking cause.",
    "Action: clarify the verified room facts.",
    "Recheck: repeat the same Configuration Lock after implementation.",
    "Result: not measured. No verified outcome is claimed.",
  ],
  faq: [
    {
      q: "Is this SEO?",
      a: "It overlaps with SEO, but Selena measures discovery in named AI and local surfaces, their competitors and sources. Public Readiness checks website accessibility and clarity; it does not measure recommendations.",
    },
    {
      q: "Can Selena guarantee ChatGPT or Google rankings?",
      a: "No. Selena does not guarantee rankings, recommendation rate, traffic, bookings or revenue. A comparable recheck records what changed without inventing causality.",
    },
    {
      q: "Why do you separate Visitor View and API View?",
      a: "A consumer assistant and a model API are different evidence classes. API output is not identical to the guest’s consumer experience; they are never blended into one universal score.",
    },
    {
      q: "Which AI systems do you monitor?",
      a: "Visibility Snapshot covers ChatGPT, Gemini and Perplexity. Full Discovery adds Claude, DeepSeek, Qwen, Mistral and Grok in a separate API / Model Landscape. Recurring subscriptions are in early access.",
    },
    {
      q: "Does $79 include Local Discovery?",
      a: "Yes, only where production-capable automated Google Maps / Local Visibility measurement is verified. Manual Google Ask Maps / Local AI investigation is not included in the $79 subscription; it belongs to the $399 human-led Audit where relevant, or to an explicitly agreed Managed scope.",
    },
    {
      q: "What happens during the $399 session?",
      a: "The 60-minute Strategy Session brings the owner, GM or authorized decision-maker together with the analyst to validate the preliminary diagnosis, review 3–5 discovery competitors and agree commercial priorities before the final Action Plan.",
    },
    {
      q: "Can my team implement the Action Plan without Selena?",
      a: "Yes. You own the plan. Choose your team, another partner or Selena for the implementation; there is no obligation to buy Managed Discovery Growth.",
    },
    {
      q: "What does “verified” mean?",
      a: "A claim is supported by reviewable evidence and its disclosed scope. Evidence IDs, the Evidence Ledger, methodology/version disclosure and Configuration Lock make rechecks comparable. A recommendation is not a verified outcome.",
    },
    {
      q: "What happens if a measurement surface is unavailable?",
      a: "It is marked unavailable or UNKNOWN, with the coverage disclosed. Missing evidence is never silently recorded as zero visibility.",
    },
  ],
} as const;

export const discoveryHeadings = {
  surfaces: "See your business through the guest’s discovery journey.",
  preview: "See who is winning the guests you want.",
  plans: "One discovery landscape. Choose your coverage.",
  bridge: "Every $49 and $79 measurement includes recommendations.",
  audit: "Know why they win.",
  actions: "You leave knowing exactly what to change.",
  choice: "Your plan. Your choice.",
  managed: "Want us to implement the plan?",
  methodology: "Evidence, not mystery scores.",
  proof: "From measurement to action.",
  final: "Find out where guests are finding your competitors instead of you.",
} as const;

export function discoveryOrderCopy(locale: VisibilityLocale) {
  return locale === "en"
    ? {
        early: {
          title: "Request monitoring early access",
          body: `${offers.snapshot.name.en} — ${offers.snapshot.en}. ${offers.landscape.name.en} — ${offers.landscape.en}. Tell us your business, market and preferred plan. Recurring measurements and weekly Telegram are not yet activated; online payment is off. We will confirm available scope, renewal/cancellation terms and delivery before any order. This request starts no measurement and creates no subscription.`,
        },
        audit: {
          title: "Before you book, three things to know",
          body: `${offers.expertVerified.name.en} · ${offers.expertVerified.en}. Booking is arranged manually. Read the full terms before contacting Selena; sending a message does not reserve a session or take payment.`,
        },
        managed: {
          title: "Apply for Managed Discovery",
          body: `${offers.implementation90Days.en} · 90 days. Share your business, priorities and implementation owner. We agree the Action Plan, Selena-owned work, monitoring/recheck cycles and provider cost cap before accepting the engagement. This is a manual application, not a self-service purchase.`,
        },
      }
    : {
        early: {
          title: "Запросить ранний доступ к мониторингу",
          body: `${offers.snapshot.name.ru} — ${offers.snapshot.ru}. ${offers.landscape.name.ru} — ${offers.landscape.ru}. Укажите бизнес, рынок и тариф. Регулярные замеры и еженедельный отчёт в Telegram ещё не активированы; онлайн-оплата выключена. До заказа согласуем доступный объём, продление, отмену и доставку. Обращение не запускает замер и не создаёт подписку.`,
        },
        audit: {
          title: "Перед записью: подготовка, участие и результат",
          body: `${offers.expertVerified.name.ru} · ${offers.expertVerified.ru}. Запись согласуется вручную. Прочитайте условия до обращения: сообщение не бронирует сессию и не списывает оплату.`,
        },
        managed: {
          title: "Заявка на Managed Discovery",
          body: `${offers.implementation90Days.ru} · 90 дней. Укажите бизнес, приоритеты и ответственного за внедрение. До начала согласуем план действий, работу Selena, циклы мониторинга и повторных замеров, лимит провайдеров. Это ручная заявка, а не автоматическая покупка.`,
        },
      };
}


export const discoveryPlanOutcomes = [
  [
    { title: "Your visibility", body: "Where you appear and where you are absent. Mentions and positions where applicable." },
    { title: "Competitors", body: "Who appears instead of you." },
    { title: "Sources", body: "Which citations and sources support the measured answers." },
    { title: "Recommendations", body: "Automatic recommendations for what deserves attention next." },
  ],
  [
    { title: "Expanded AI", body: "Claude · DeepSeek · Qwen · Mistral · Grok. Visitor View and API / Model Landscape remain separate." },
    { title: "Local Discovery", body: "Google Maps / Local Visibility only where production-capable automated measurement is verified. The subscription includes automated surfaces only." },
    { title: "Competitive intelligence", body: "Which competitors win which guest intents across measured AI and Local discovery; where you win, lose or are absent." },
    { title: "Expanded sources", body: "Broader citation and source patterns across the measured landscape." },
    { title: "Expanded recommendations", body: "Opportunities Selena recommends investigating or improving first." },
  ],
] as const;

export const discoveryDecisionSteps = [
  { label: "MEASURE + COMPARE + RECOMMEND", body: "See what guests see, who appears instead and what Selena automatically recommends next." },
  { label: "EXPANDED AI + LOCAL → COMPARE + RECOMMEND", body: "See the broader AI + verified automated Local competitive landscape and expanded recommendations." },
  { label: "INVESTIGATE + VERIFY + PRIORITIZE", body: "A human analyst investigates the actual competitors, challenges automatic recommendations and builds the final Action Plan with the owner / GM." },
  { label: "EXECUTE + MONITOR + VERIFY", body: "Selena executes the agreed part of the plan, keeps measuring, rechecks and adjusts." },
] as const;
