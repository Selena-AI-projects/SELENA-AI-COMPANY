import type {
  ActionLifecycleStatus,
  ActionPathStep,
  ActionReadinessState,
  EvidenceRatio,
  EvidenceRow,
  SourceStatus,
  TelegramDeliveryAttempt,
  TelegramDeliveryStatus,
  VerificationStageId,
  VerifiedActionRow,
} from "./measurement";
import type { VisibilityLocale } from "./types";
import { commercialFacts } from "@/lib/commercial-facts";

/**
 * Static sample-report content (Codex Execution TZ V1.2, section E).
 *
 * Every value here is illustrative. `sourceStatus` is `"sample"` on every
 * row without exception — nothing in this file is, or may be presented
 * as, an observed measurement of any real website. PR-01 performs no
 * live scan, so a sample is the only honest thing to render.
 */

export interface SampleReportIdentity {
  badge: string;
  businessName: string;
  domain: string;
  market: string;
  language: string;
  status: string;
  methodologyVersion: string;
  sourceStatus: SourceStatus;
}

export interface SampleLayerSection {
  title: string;
  question: string;
  rows: EvidenceRow[];
}

export interface SampleRecommendationSection {
  title: string;
  question: string;
  ratios: EvidenceRatio[];
  citationExamples: { url: string; note: string }[];
  disclosure: string;
}

export interface SampleActionReadinessSection {
  title: string;
  question: string;
  states: ActionReadinessState[];
  timelineTitle: string;
  timeline: ActionPathStep[];
  agentCaveat: string;
}

export interface SampleTopBlocker {
  title: string;
  evidence: string;
  whyItMatters: string;
  doesNotProve: string;
}

export interface SampleNextAction {
  title: string;
  detail: string;
}

/**
 * The verification loop as the weekly report shows it: the seven stages in
 * normative order, the action rows with owner, status, evidence IDs, recheck
 * method and before/after, and the delivery record of the digest itself.
 */
export interface SampleVerificationLoopSection {
  title: string;
  question: string;
  stages: { id: VerificationStageId; label: string }[];
  window: { baseline: string; recheck: string; lock: string };
  columns: {
    action: string;
    owner: string;
    status: string;
    evidenceIds: string;
    recheck: string;
    before: string;
    after: string;
  };
  statusLabels: Record<ActionLifecycleStatus, string>;
  telegramStatusLabels: Record<TelegramDeliveryStatus, string>;
  rows: VerifiedActionRow[];
  delivery: {
    heading: string;
    recipient: string;
    dueAt: string;
    status: TelegramDeliveryStatus;
    attempts: TelegramDeliveryAttempt[];
    note: string;
  };
  disclosure: string;
}

export interface SampleBoundaries {
  heading: string;
  measured: string[];
  notMeasured: string[];
}

export interface SampleRoutingOption {
  name: string;
  price: string;
  status: string;
  description: string;
  href?: string;
  ctaLabel?: string;
}

export interface SampleReportContentV2 {
  identity: SampleReportIdentity;
  discoverability: SampleLayerSection;
  understanding: SampleLayerSection;
  recommendationEvidence: SampleRecommendationSection;
  actionReadiness: SampleActionReadinessSection;
  topBlocker: { heading: string; item: SampleTopBlocker };
  nextActions: { heading: string; items: SampleNextAction[] };
  verificationLoop: SampleVerificationLoopSection;
  boundaries: SampleBoundaries;
  routing: { heading: string; intro: string; options: SampleRoutingOption[] };
  sampleDisclaimer: string;
}

const EN: SampleReportContentV2 = {
  identity: {
    badge: "SAMPLE REPORT",
    businessName: "Sample Villa Co (illustrative business)",
    domain: "sample-villa-co.example",
    market: "Indonesia / Bali",
    language: "English",
    status: "Sample — not a live scan",
    methodologyVersion: "Methodology v1.2 · sample data set",
    sourceStatus: "sample",
  },
  discoverability: {
    title: "1. Discoverability",
    question: "Can public search and AI systems reach and find this business?",
    rows: [
      {
        label: "Public page reachable",
        value: "Homepage returned 200 over HTTPS",
        state: "pass",
        sourceStatus: "sample",
        limitation: "Reachability at one moment in time, from one location.",
      },
      {
        label: "Crawler access (robots.txt)",
        value: "Crawler access is not visibly blocked",
        state: "pass",
        sourceStatus: "sample",
        limitation: "Not blocked is not the same as read, indexed, or recommended.",
      },
      {
        label: "Sitemap",
        value: "sitemap.xml found and parseable",
        state: "pass",
        sourceStatus: "sample",
        limitation: "Presence of a sitemap does not prove any URL was indexed.",
      },
      {
        label: "Canonical",
        value: "Self-referencing canonical present on the homepage",
        state: "pass",
        sourceStatus: "sample",
      },
      {
        label: "Indexability signals",
        value: "No noindex in meta robots or X-Robots-Tag",
        state: "pass",
        sourceStatus: "sample",
        limitation: "Index status itself can only be confirmed in Search Console.",
      },
      {
        label: "llms.txt",
        value: "Not present — informational only, zero weight",
        state: "info",
        sourceStatus: "sample",
        limitation: "llms.txt is a proposed convention, not a ranking or citation factor.",
      },
    ],
  },
  understanding: {
    title: "2. Understanding",
    question: "Can they understand who this is, what it offers, for whom and where?",
    rows: [
      {
        label: "Brand identity consistency",
        value: "Brand name consistent across title, H1 and Organization schema",
        state: "pass",
        sourceStatus: "sample",
      },
      {
        label: "Primary service clarity",
        value: "Homepage and metadata describe the service in two materially different ways",
        state: "warn",
        sourceStatus: "sample",
        limitation: "Inconsistency is observable; its effect on any AI answer is not.",
      },
      {
        label: "Market / location clarity",
        value: "Service area stated in copy and in structured data",
        state: "pass",
        sourceStatus: "sample",
      },
      {
        label: "Entity / schema evidence",
        value: "LocalBusiness schema valid; missing sameAs and opening hours",
        state: "warn",
        sourceStatus: "sample",
        limitation: "Structured data is machine-readable corroboration, not a guarantee of citation.",
      },
      {
        label: "Direct-answer coverage",
        value: "No page directly answers common pre-purchase questions",
        state: "fail",
        sourceStatus: "sample",
      },
    ],
  },
  recommendationEvidence: {
    title: "3. Recommendation Evidence",
    question: "Is the brand mentioned or cited in a limited, disclosed sample of AI answers?",
    ratios: [
      { label: "Mentioned in sampled answers", matched: 2, total: 6, sourceStatus: "sample" },
      { label: "Cited (owned domain) in sampled answers", matched: 1, total: 6, sourceStatus: "sample" },
      { label: "Primary competitor mentioned", matched: 4, total: 6, sourceStatus: "sample" },
      { label: "Entity consistency across checked pages", matched: 3, total: 5, sourceStatus: "sample" },
    ],
    citationExamples: [
      { url: "sample-directory.example/bali-villas", note: "Third-party directory listing (sample)" },
      { url: "sample-villa-co.example/services", note: "Owned-domain service page (sample)" },
    ],
    disclosure:
      "Sample figures only. A real run discloses the exact prompt set, the AI environments used, the date, and counts every valid answer in the denominator. Zero valid answers is reported as \"not measured\", never as 0% visibility.",
  },
  actionReadiness: {
    title: "4. Action Readiness",
    question: "Can a customer — or an agent acting for them — actually complete the next action?",
    states: [
      {
        id: "human_ready",
        label: "Human-ready",
        definition: "A person can find and complete the intended action unaided.",
        state: "pass",
        sourceStatus: "sample",
        finding: "Primary action (Book) is visible above the fold and reachable in one tap on mobile.",
        doesNotProve: "Does not prove a machine can parse the action, or that an agent could execute it.",
      },
      {
        id: "machine_readable",
        label: "Machine-readable",
        definition: "The action and its parameters are exposed in structured, parseable form.",
        state: "warn",
        sourceStatus: "sample",
        finding: "Booking link is present but exposes no structured action markup or parameters.",
        doesNotProve: "Machine-readable markup does not prove the action can be completed programmatically.",
      },
      {
        id: "agent_executable",
        label: "Agent-executable",
        definition:
          "An autonomous agent can complete the action end to end and receive a confirmation it can verify.",
        state: "fail",
        sourceStatus: "sample",
        finding: "No documented API, no structured action endpoint, and confirmation is human-only email.",
        doesNotProve:
          "A visible button, a WhatsApp link or JSON-LD is not evidence of agent execution — these are independent states.",
      },
    ],
    timelineTitle: "Action path",
    timeline: [
      { id: "discovery", label: "Discovery", state: "pass", sourceStatus: "sample", note: "Business is findable from a public entry point." },
      { id: "business_understood", label: "Business understood", state: "warn", sourceStatus: "sample", note: "Offer described inconsistently across surfaces." },
      { id: "primary_action_found", label: "Primary action found", state: "pass", sourceStatus: "sample", note: "Booking path is clearly presented." },
      { id: "action_understandable", label: "Action understandable", state: "warn", sourceStatus: "sample", note: "Required inputs are not stated before starting." },
      { id: "action_completable", label: "Action completable", state: "fail", sourceStatus: "sample", note: "Flow requires steps that cannot be completed programmatically." },
      { id: "confirmation_detected", label: "Confirmation detected", state: "fail", sourceStatus: "sample", note: "No machine-verifiable confirmation is returned." },
    ],
    agentCaveat:
      "A visible CTA, a phone number or a WhatsApp link demonstrates human readiness only. Agent-executable is a separate, stricter claim and is measured separately.",
  },
  topBlocker: {
    heading: "5. Top blocker",
    item: {
      title: "The primary action cannot be completed without a human",
      evidence:
        "Sample evidence: booking flow exposes no structured endpoint or parameters, and the only confirmation is a human-readable email.",
      whyItMatters:
        "Customers using an assistant to act on their behalf reach a dead end at the last step, after discovery has already succeeded.",
      doesNotProve:
        "This does not prove lost revenue, and it does not prove any specific AI system attempted the action and failed.",
    },
  },
  nextActions: {
    heading: "6. Next three actions",
    items: [
      { title: "Unify the service definition", detail: "Write one canonical description and reuse it in visible copy, metadata and structured data." },
      { title: "State the action's inputs up front", detail: "List what a booking requires (dates, party size, contact) before the flow starts." },
      { title: "Add direct-answer content", detail: "Publish plain answers to the questions asked before booking, on a page that is linked from the homepage." },
    ],
  },
  verificationLoop: {
    title: "7. Verification loop",
    question: "What happened to each action after the report, and was the change observed in a comparable cycle?",
    stages: [
      { id: "measure", label: "Measure" },
      { id: "evidence", label: "Evidence" },
      { id: "recommendation", label: "Recommendation" },
      { id: "assigned_action", label: "Assigned action" },
      { id: "recheck", label: "Recheck" },
      { id: "verified_outcome", label: "Verified outcome" },
      { id: "weekly_telegram_report", label: "Weekly Telegram report" },
    ],
    window: {
      baseline: "Baseline: cycle C1, 10 Aug 2026 (sample)",
      recheck: "Recheck: cycle C2, 17 Aug 2026 (sample)",
      lock: "Lock v1 · 25 questions · 3 systems · 4 repeats · comparable",
    },
    columns: {
      action: "Action",
      owner: "Owner",
      status: "Status",
      evidenceIds: "Evidence IDs",
      recheck: "Recheck method",
      before: "Before",
      after: "After",
    },
    statusLabels: {
      NEW: "New",
      STILL_OPEN: "Still open",
      NEEDS_RECHECK: "Needs recheck",
      VERIFIED: "Verified",
      CLOSED: "Closed",
    },
    telegramStatusLabels: {
      DELIVERED: "Delivered",
      RETRY_SCHEDULED: "Retry scheduled",
      DELAY_NOTICE: "Delay notice sent",
      UNBOUND: "Recipient unbound",
      PAUSED: "Delivery paused",
    },
    rows: [
      {
        id: "ACT-C1-01",
        action: "Publish one canonical service description on the homepage and About page",
        owner: "Client owner",
        status: "VERIFIED",
        evidenceIds: ["EV-C1-0412", "EV-C1-0418", "EV-C2-0507"],
        recheck: "Re-crawl of the same 3 pages, then the same 25 questions on the same 3 systems under Lock v1 in C2",
        before: "Description differed on 2 of 3 pages; brand named in 3 of 25 answers (C1)",
        after: "One description on 3 of 3 pages; brand named in 6 of 25 answers (C2)",
        sourceStatus: "sample",
      },
      {
        id: "ACT-C1-02",
        action: "State the booking inputs (dates, guests, contact) before the flow starts",
        owner: "Client developer",
        status: "NEEDS_RECHECK",
        evidenceIds: ["EV-C1-0431"],
        recheck: "Action-path check of the booking page in C3; the C2 crawl ran before the change was deployed",
        before: "Action understandable: partial — required inputs not stated (C1)",
        after: "Deployed 19 Aug; not yet observed in a cycle, so no outcome is claimed",
        sourceStatus: "sample",
      },
      {
        id: "ACT-C1-03",
        action: "Publish a direct-answer FAQ page linked from the homepage",
        owner: "Client owner",
        status: "STILL_OPEN",
        evidenceIds: ["EV-C1-0407", "EV-C1-0409"],
        recheck: "Same 25 questions under Lock v1 in C3; owned-page citations counted per system",
        before: "0 of 25 answers cite an owned page (C1)",
        after: "Not started — carried over from W34, not re-issued as a new finding",
        sourceStatus: "sample",
      },
      {
        id: "ACT-C1-04",
        action: "Remove the robots.txt rule that blocked /rooms/ for every crawler",
        owner: "Client developer",
        status: "CLOSED",
        evidenceIds: ["EV-C1-0402", "EV-C2-0501"],
        recheck: "robots.txt fetched again and the 4 room pages re-crawled in C2",
        before: "/rooms/ disallowed; 0 of 4 room pages fetchable (C1)",
        after: "Rule removed; 4 of 4 room pages fetched (C2). Verified in C2, closed in W35",
        sourceStatus: "sample",
      },
      {
        id: "ACT-C2-05",
        action: "Decide how to answer the two questions where a competitor is cited instead",
        owner: "Unassigned — needs an owner before C3",
        status: "NEW",
        evidenceIds: ["EV-C2-0519", "EV-C2-0523"],
        recheck: "Same 2 questions under Lock v1 in C3, competitor citations counted per system",
        before: "Competitor cited in 5 of 12 answers to these 2 questions (C2)",
        after: "No recheck yet — the action was created in C2",
        sourceStatus: "sample",
      },
    ],
    delivery: {
      heading: "Digest delivery · W35",
      recipient: "One verified recipient, private chat, bound by one-time link (sample)",
      dueAt: "Due Monday 09:00 project time; deadline due_at + 6 h",
      status: "RETRY_SCHEDULED",
      attempts: [
        { attempt: 1, at: "Mon 09:00", result: "Failed — Telegram API timeout" },
        { attempt: 2, at: "Mon 09:01", result: "Failed — Telegram API timeout" },
        { attempt: 3, at: "Mon 09:06", result: "Scheduled — next retry in 30 min; report already readable in the workspace" },
      ],
      note: "Up to 5 attempts (1 min, 5 min, 30 min, 2 h, 12 h). No attempt repeats a measurement. A 403 or missing chat unbinds the recipient and stops retries.",
    },
    disclosure:
      "Verified means the same locked question set, systems and repeats observed the change in a later cycle. It does not prove the action caused the change, and it does not predict the next cycle.",
  },
  boundaries: {
    heading: "8. Measurement boundaries",
    measured: [
      "Publicly available pages",
      "Technical accessibility and indexability signals",
      "Structured identity and service clarity",
      "A limited, dated sample of AI responses",
      "Public links and citations returned by supported providers",
      "Whether the primary action is human-ready, machine-readable and agent-executable",
    ],
    notMeasured: [
      "Every possible prompt",
      "Every user location or personal context",
      "Private analytics",
      "CRM conversions",
      "Revenue impact",
      "Guaranteed future recommendations",
      "Causality between one website change and one AI answer",
    ],
  },
  routing: {
    heading: "9. Where this leads",
    intro: "Routing shown for the sample. A real report routes on its own evidence.",
    options: [
      {
        name: "AI Visibility Snapshot",
        price: commercialFacts.aiVisibility.snapshot.en,
        status: "Early access · checkout closed",
        description: "A locked three-system Visitor View measurement with 300 planned answers.",
        href: "/en/contact",
        ctaLabel: "Request Snapshot access",
      },
      {
        name: "AI Visibility Landscape",
        price: commercialFacts.aiVisibility.landscape.en,
        status: "Early access · checkout closed",
        description: "Eight systems with Visitor View and API View reported separately.",
        href: "/en/contact",
        ctaLabel: "Request Landscape access",
      },
      {
        name: "Expert Verified",
        price: commercialFacts.aiVisibility.expertVerified.en,
        status: "Manual review required",
        description: "An 800-answer baseline with semantic, citation and factual QC by an analyst.",
        href: "/en/contact",
        ctaLabel: "Request Expert Verified",
      },
      {
        name: "Implementation + 90 days",
        price: commercialFacts.aiVisibility.implementation90Days.en,
        status: "Manual scope approval",
        description: "Implementation and remeasurement against an immutable approved baseline.",
        href: "/en/contact",
        ctaLabel: "Discuss the 90-day scope",
      },
    ],
  },
  sampleDisclaimer:
    "Live checks are being calibrated on Selena Systems projects. This sample shows the report structure and evidence boundaries; it is not a result for any submitted website.",
};

const RU: SampleReportContentV2 = {
  identity: {
    badge: "ПРИМЕР ОТЧЁТА",
    businessName: "Sample Villa Co (иллюстративный бизнес)",
    domain: "sample-villa-co.example",
    market: "Индонезия / Бали",
    language: "Английский",
    status: "Пример — не живое сканирование",
    methodologyVersion: "Методология v1.2 · демонстрационный набор данных",
    sourceStatus: "sample",
  },
  discoverability: {
    title: "1. Discoverability — обнаружимость",
    question: "Могут ли публичный поиск и AI-системы получить доступ к бизнесу и найти его?",
    rows: [
      {
        label: "Публичная страница доступна",
        value: "Главная страница вернула 200 по HTTPS",
        state: "pass",
        sourceStatus: "sample",
        limitation: "Доступность в один момент времени и из одной локации.",
      },
      {
        label: "Доступ краулера (robots.txt)",
        value: "Доступ краулера видимо не заблокирован",
        state: "pass",
        sourceStatus: "sample",
        limitation: "«Не заблокирован» не равно «прочитан», «проиндексирован» или «рекомендован».",
      },
      {
        label: "Sitemap",
        value: "sitemap.xml найден и разбирается",
        state: "pass",
        sourceStatus: "sample",
        limitation: "Наличие sitemap не доказывает индексацию ни одного URL.",
      },
      {
        label: "Canonical",
        value: "Самоссылающийся canonical присутствует на главной",
        state: "pass",
        sourceStatus: "sample",
      },
      {
        label: "Сигналы индексируемости",
        value: "Нет noindex ни в meta robots, ни в X-Robots-Tag",
        state: "pass",
        sourceStatus: "sample",
        limitation: "Сам факт индексации подтверждается только в Search Console.",
      },
      {
        label: "llms.txt",
        value: "Отсутствует — только информационно, вес ноль",
        state: "info",
        sourceStatus: "sample",
        limitation: "llms.txt — предлагаемая конвенция, а не фактор ранжирования или цитирования.",
      },
    ],
  },
  understanding: {
    title: "2. Understanding — понимание",
    question: "Могут ли они понять, кто это, что предлагает, кому и где?",
    rows: [
      {
        label: "Согласованность бренда",
        value: "Название бренда согласовано в title, H1 и схеме Organization",
        state: "pass",
        sourceStatus: "sample",
      },
      {
        label: "Ясность основной услуги",
        value: "Главная страница и метаданные описывают услугу двумя существенно разными способами",
        state: "warn",
        sourceStatus: "sample",
        limitation: "Несогласованность наблюдаема; её влияние на конкретный AI-ответ — нет.",
      },
      {
        label: "Ясность рынка / локации",
        value: "Зона обслуживания указана в тексте и в структурированных данных",
        state: "pass",
        sourceStatus: "sample",
      },
      {
        label: "Доказательства сущности / схемы",
        value: "Схема LocalBusiness валидна; отсутствуют sameAs и часы работы",
        state: "warn",
        sourceStatus: "sample",
        limitation: "Структурированные данные — машиночитаемое подтверждение, а не гарантия цитирования.",
      },
      {
        label: "Покрытие прямыми ответами",
        value: "Ни одна страница не отвечает прямо на типичные вопросы до покупки",
        state: "fail",
        sourceStatus: "sample",
      },
    ],
  },
  recommendationEvidence: {
    title: "3. Recommendation Evidence — доказательства рекомендаций",
    question: "Упоминается или цитируется ли бренд в ограниченной, раскрытой выборке AI-ответов?",
    ratios: [
      { label: "Упомянут в выборке ответов", matched: 2, total: 6, sourceStatus: "sample" },
      { label: "Процитирован (собственный домен) в выборке", matched: 1, total: 6, sourceStatus: "sample" },
      { label: "Основной конкурент упомянут", matched: 4, total: 6, sourceStatus: "sample" },
      { label: "Согласованность сущности по проверенным страницам", matched: 3, total: 5, sourceStatus: "sample" },
    ],
    citationExamples: [
      { url: "sample-directory.example/bali-villas", note: "Стороннее отраслевое размещение (пример)" },
      { url: "sample-villa-co.example/services", note: "Страница услуги на собственном домене (пример)" },
    ],
    disclosure:
      "Только демонстрационные цифры. Реальный запуск раскрывает точный набор запросов, использованные AI-среды, дату и учитывает каждый валидный ответ в знаменателе. Ноль валидных ответов сообщается как «не измерено», а не как 0% видимости.",
  },
  actionReadiness: {
    title: "4. Action Readiness — готовность к действию",
    question: "Может ли клиент — или агент, действующий за него — действительно выполнить следующее действие?",
    states: [
      {
        id: "human_ready",
        label: "Human-ready — готово для человека",
        definition: "Человек может найти и выполнить целевое действие самостоятельно.",
        state: "pass",
        sourceStatus: "sample",
        finding: "Основное действие («Забронировать») видно в первом экране и доступно в одно касание на мобильном.",
        doesNotProve: "Не доказывает, что машина разберёт действие или что агент сможет его выполнить.",
      },
      {
        id: "machine_readable",
        label: "Machine-readable — машиночитаемо",
        definition: "Действие и его параметры представлены в структурированном, разбираемом виде.",
        state: "warn",
        sourceStatus: "sample",
        finding: "Ссылка на бронирование есть, но структурированной разметки действия и параметров нет.",
        doesNotProve: "Машиночитаемая разметка не доказывает, что действие можно выполнить программно.",
      },
      {
        id: "agent_executable",
        label: "Agent-executable — выполнимо агентом",
        definition:
          "Автономный агент может выполнить действие от начала до конца и получить проверяемое подтверждение.",
        state: "fail",
        sourceStatus: "sample",
        finding: "Нет документированного API, нет структурированного endpoint действия, подтверждение — только письмо для человека.",
        doesNotProve:
          "Видимая кнопка, ссылка WhatsApp или JSON-LD не являются доказательством выполнения агентом — это независимые состояния.",
      },
    ],
    timelineTitle: "Путь действия",
    timeline: [
      { id: "discovery", label: "Обнаружение", state: "pass", sourceStatus: "sample", note: "Бизнес находится из публичной точки входа." },
      { id: "business_understood", label: "Бизнес понят", state: "warn", sourceStatus: "sample", note: "Предложение описано несогласованно на разных поверхностях." },
      { id: "primary_action_found", label: "Основное действие найдено", state: "pass", sourceStatus: "sample", note: "Путь бронирования ясно представлен." },
      { id: "action_understandable", label: "Действие понятно", state: "warn", sourceStatus: "sample", note: "Необходимые данные не указаны до начала." },
      { id: "action_completable", label: "Действие выполнимо", state: "fail", sourceStatus: "sample", note: "Поток требует шагов, которые нельзя выполнить программно." },
      { id: "confirmation_detected", label: "Подтверждение обнаружено", state: "fail", sourceStatus: "sample", note: "Машинопроверяемое подтверждение не возвращается." },
    ],
    agentCaveat:
      "Видимый CTA, номер телефона или ссылка WhatsApp демонстрируют только готовность для человека. Agent-executable — отдельное, более строгое утверждение, и измеряется отдельно.",
  },
  topBlocker: {
    heading: "5. Главный блокер",
    item: {
      title: "Основное действие невозможно выполнить без участия человека",
      evidence:
        "Демонстрационное доказательство: поток бронирования не предоставляет структурированного endpoint или параметров, а единственное подтверждение — письмо для человека.",
      whyItMatters:
        "Клиенты, использующие ассистента для действий от своего имени, упираются в тупик на последнем шаге — уже после успешного обнаружения.",
      doesNotProve:
        "Это не доказывает потерянную выручку и не доказывает, что какая-либо конкретная AI-система пыталась выполнить действие и не смогла.",
    },
  },
  nextActions: {
    heading: "6. Три следующих действия",
    items: [
      { title: "Унифицировать описание услуги", detail: "Написать одно каноничное описание и использовать его в тексте, метаданных и структурированных данных." },
      { title: "Указать входные данные действия заранее", detail: "Перечислить, что нужно для бронирования (даты, число гостей, контакт), до начала потока." },
      { title: "Добавить контент с прямыми ответами", detail: "Опубликовать понятные ответы на вопросы, которые задают до бронирования, на странице со ссылкой с главной." },
    ],
  },
  verificationLoop: {
    title: "7. Цикл верификации",
    question: "Что произошло с каждой задачей после отчёта и было ли изменение зафиксировано в сопоставимом цикле?",
    stages: [
      { id: "measure", label: "Measure · замер" },
      { id: "evidence", label: "Evidence · доказательства" },
      { id: "recommendation", label: "Recommendation · рекомендация" },
      { id: "assigned_action", label: "Assigned Action · задача" },
      { id: "recheck", label: "Recheck · повторная проверка" },
      { id: "verified_outcome", label: "Verified Outcome · результат" },
      { id: "weekly_telegram_report", label: "Weekly Telegram Report" },
    ],
    window: {
      baseline: "Baseline: цикл C1, 10 августа 2026 (пример)",
      recheck: "Recheck: цикл C2, 17 августа 2026 (пример)",
      lock: "Lock v1 · 25 вопросов · 3 системы · 4 повтора · сопоставимо",
    },
    columns: {
      action: "Задача",
      owner: "Владелец",
      status: "Статус",
      evidenceIds: "Evidence IDs",
      recheck: "Способ повторной проверки",
      before: "До",
      after: "После",
    },
    statusLabels: {
      NEW: "Новая",
      STILL_OPEN: "Ещё открыта",
      NEEDS_RECHECK: "Нужна повторная проверка",
      VERIFIED: "Проверено",
      CLOSED: "Закрыта",
    },
    telegramStatusLabels: {
      DELIVERED: "Доставлен",
      RETRY_SCHEDULED: "Повтор запланирован",
      DELAY_NOTICE: "Отправлено уведомление о задержке",
      UNBOUND: "Получатель отвязан",
      PAUSED: "Доставка на паузе",
    },
    rows: [
      {
        id: "ACT-C1-01",
        action: "Опубликовать одно каноничное описание услуги на главной и странице «О нас»",
        owner: "Владелец бизнеса",
        status: "VERIFIED",
        evidenceIds: ["EV-C1-0412", "EV-C1-0418", "EV-C2-0507"],
        recheck: "Повторный обход тех же 3 страниц, затем те же 25 вопросов в тех же 3 системах под Lock v1 в C2",
        before: "Описание расходится на 2 из 3 страниц; бренд назван в 3 из 25 ответов (C1)",
        after: "Одно описание на 3 из 3 страниц; бренд назван в 6 из 25 ответов (C2)",
        sourceStatus: "sample",
      },
      {
        id: "ACT-C1-02",
        action: "Указать входные данные бронирования (даты, гости, контакт) до начала потока",
        owner: "Разработчик клиента",
        status: "NEEDS_RECHECK",
        evidenceIds: ["EV-C1-0431"],
        recheck: "Проверка action path страницы бронирования в C3; обход C2 прошёл до выкладки изменения",
        before: "Понятность действия: частично — входные данные не указаны (C1)",
        after: "Выложено 19 августа; ещё не наблюдалось ни в одном цикле, поэтому результат не заявляется",
        sourceStatus: "sample",
      },
      {
        id: "ACT-C1-03",
        action: "Опубликовать FAQ-страницу с прямыми ответами и ссылкой с главной",
        owner: "Владелец бизнеса",
        status: "STILL_OPEN",
        evidenceIds: ["EV-C1-0407", "EV-C1-0409"],
        recheck: "Те же 25 вопросов под Lock v1 в C3; цитирования собственных страниц считаются по каждой системе",
        before: "0 из 25 ответов цитируют собственную страницу (C1)",
        after: "Не начато — перенесено из W34, а не выдано заново как новая находка",
        sourceStatus: "sample",
      },
      {
        id: "ACT-C1-04",
        action: "Убрать правило robots.txt, закрывавшее /rooms/ для всех краулеров",
        owner: "Разработчик клиента",
        status: "CLOSED",
        evidenceIds: ["EV-C1-0402", "EV-C2-0501"],
        recheck: "robots.txt запрошен заново, 4 страницы номеров повторно обойдены в C2",
        before: "/rooms/ закрыт; 0 из 4 страниц номеров доступны (C1)",
        after: "Правило убрано; 4 из 4 страниц получены (C2). Проверено в C2, закрыто в W35",
        sourceStatus: "sample",
      },
      {
        id: "ACT-C2-05",
        action: "Решить, как отвечать на два вопроса, где вместо бренда цитируется конкурент",
        owner: "Не назначен — нужен владелец до C3",
        status: "NEW",
        evidenceIds: ["EV-C2-0519", "EV-C2-0523"],
        recheck: "Те же 2 вопроса под Lock v1 в C3, цитирования конкурента считаются по каждой системе",
        before: "Конкурент процитирован в 5 из 12 ответов на эти 2 вопроса (C2)",
        after: "Повторной проверки ещё не было — задача создана в C2",
        sourceStatus: "sample",
      },
    ],
    delivery: {
      heading: "Доставка дайджеста · W35",
      recipient: "Один подтверждённый получатель, приватный чат, привязан одноразовой ссылкой (пример)",
      dueAt: "Срок: понедельник 09:00 по времени проекта; дедлайн due_at + 6 ч",
      status: "RETRY_SCHEDULED",
      attempts: [
        { attempt: 1, at: "Пн 09:00", result: "Ошибка — таймаут Telegram API" },
        { attempt: 2, at: "Пн 09:01", result: "Ошибка — таймаут Telegram API" },
        { attempt: 3, at: "Пн 09:06", result: "Запланировано — следующая попытка через 30 мин; отчёт уже доступен в кабинете" },
      ],
      note: "До 5 попыток (1 мин, 5 мин, 30 мин, 2 ч, 12 ч). Ни одна попытка не повторяет замер. Ошибка 403 или отсутствие чата отвязывает получателя и останавливает повторы.",
    },
    disclosure:
      "Verified означает, что тот же зафиксированный набор вопросов, систем и повторов наблюдал изменение в более позднем цикле. Это не доказывает, что изменение вызвала именно задача, и не предсказывает следующий цикл.",
  },
  boundaries: {
    heading: "8. Границы измерения",
    measured: [
      "Публично доступные страницы",
      "Техническая доступность и сигналы индексируемости",
      "Структурированная идентичность и ясность услуг",
      "Ограниченная, датированная выборка AI-ответов",
      "Публичные ссылки и источники от поддерживаемых провайдеров",
      "Является ли основное действие human-ready, machine-readable и agent-executable",
    ],
    notMeasured: [
      "Все возможные запросы",
      "Каждая локация или личный контекст пользователя",
      "Приватная аналитика",
      "Конверсии в CRM",
      "Влияние на выручку",
      "Гарантированные будущие рекомендации",
      "Причинно-следственная связь между одним изменением сайта и одним AI-ответом",
    ],
  },
  routing: {
    heading: "9. К чему это ведёт",
    intro: "Маршрутизация показана для примера. Реальный отчёт направляет по собственным доказательствам.",
    options: [
      {
        name: "AI Visibility Snapshot",
        price: commercialFacts.aiVisibility.snapshot.ru,
        status: "Ранний доступ · оплата закрыта",
        description: "Зафиксированный Visitor View замер трёх систем на 300 плановых ответов.",
        href: "/contact",
        ctaLabel: "Запросить доступ к Snapshot",
      },
      {
        name: "AI Visibility Landscape",
        price: commercialFacts.aiVisibility.landscape.ru,
        status: "Ранний доступ · оплата закрыта",
        description: "Восемь систем с раздельными Visitor View и API View.",
        href: "/contact",
        ctaLabel: "Запросить доступ к Landscape",
      },
      {
        name: "Expert Verified",
        price: commercialFacts.aiVisibility.expertVerified.ru,
        status: "Нужна ручная проверка",
        description: "Baseline из 800 ответов со смысловым, citation и factual QC аналитика.",
        href: "/contact",
        ctaLabel: "Запросить Expert Verified",
      },
      {
        name: "Implementation + 90 days",
        price: commercialFacts.aiVisibility.implementation90Days.ru,
        status: "Ручное согласование scope",
        description: "Внедрение и повторный замер по неизменяемому утверждённому baseline.",
        href: "/contact",
        ctaLabel: "Обсудить программу на 90 дней",
      },
    ],
  },
  sampleDisclaimer:
    "Живые проверки калибруются на проектах Selena Systems. Этот пример показывает структуру отчёта и границы доказательности; это не результат проверки какого-либо введённого сайта.",
};

export function getSampleReport(locale: VisibilityLocale): SampleReportContentV2 {
  return locale === "ru" ? RU : EN;
}
