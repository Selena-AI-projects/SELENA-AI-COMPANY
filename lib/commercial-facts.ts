/**
 * One versioned source of public commercial facts for Selena Systems.
 *
 * Customer-facing copy, structured data and illustrative routing import
 * values from here. Historical paid orders remain governed by the immutable
 * catalog snapshot stored in the client application.
 */
export const COMMERCIAL_FACTS_VERSION = "selena-commercial-facts-2026-09-16-v3" as const;

export type CommercialLocale = "en" | "ru";
export type CommercialProductLine = "ai-systems" | "ai-visibility";
export type CommercialBillingPeriod = "month" | "one-time" | "custom";
export type CommercialAvailability = "free" | "early_access" | "manual_approval";

type LocalizedText = { en: string; ru: string };

export type FixedOffer = {
  id: string;
  productLine: CommercialProductLine;
  name: LocalizedText;
  description: LocalizedText;
  price: number;
  currency: "USD";
  en: string;
  ru: string;
  billingPeriod: CommercialBillingPeriod;
  availability: CommercialAvailability;
  url: LocalizedText;
  isPublic: true;
};

type FromOffer = FixedOffer & { qualifier: "from"; minPrice: number };

export const commercialFacts = {
  version: COMMERCIAL_FACTS_VERSION,
  seller: {
    legalName: "Selena Systems LLC",
    footerLine: "Selena Systems LLC, a Wyoming limited liability company",
    countryCode: "US",
    // The state is on the pricing disclosure and the legal pages, so it can be
    // in the markup too: an address of "US" alone joins no knowledge graph.
    regionCode: "WY",
    country: { en: "United States", ru: "США" },
  },
  aiSystems: {
    miniAudit: {
      id: "ai-systems-mini-audit",
      productLine: "ai-systems",
      name: { en: "60-minute mini-audit", ru: "Мини-аудит · 60 минут" },
      description: {
        en: "You send your questions and process details in advance, the hour on Zoom goes into the work itself, and after the call you get a short memo with the first practical moves.",
        ru: "Вы заранее присылаете вопросы и данные о процессе, час в Zoom уходит на разбор — а после звонка вы получаете короткую записку с первыми практическими шагами.",
      },
      price: 100,
      currency: "USD",
      en: "$100",
      ru: "$100",
      billingPeriod: "one-time",
      availability: "manual_approval",
      url: { en: "/en/contact", ru: "/contact" },
      isPublic: true,
    },
    audit: {
      id: "ai-systems-audit",
      productLine: "ai-systems",
      name: { en: "AI Audit", ru: "AI-аудит" },
      description: {
        en: "Map workflows, bottlenecks and the highest-leverage AI opportunities before building.",
        ru: "Разобрать процессы, узкие места и самые сильные возможности AI до начала сборки.",
      },
      price: 500,
      currency: "USD",
      en: "$500",
      ru: "$500",
      billingPeriod: "one-time",
      availability: "manual_approval",
      url: { en: "/ai-systems/ai-audit", ru: "/contact" },
      isPublic: true,
    },
    sprint: {
      id: "ai-systems-sprint",
      productLine: "ai-systems",
      name: { en: "4-Week AI Sprint", ru: "4-недельный AI Sprint" },
      description: {
        en: "A four-week build of one priority operating-system layer, handed over with team training and written instructions.",
        ru: "4-недельная сборка одного приоритетного контура — с обучением команды и письменными инструкциями при передаче.",
      },
      price: 4_500,
      currency: "USD",
      en: "$4,500",
      ru: "$4,500",
      billingPeriod: "one-time",
      availability: "manual_approval",
      url: { en: "/ai-systems/ai-sprint", ru: "/contact" },
      isPublic: true,
    },
    businessOs: {
      id: "ai-systems-business-os",
      productLine: "ai-systems",
      name: { en: "AI Business OS", ru: "AI Business OS" },
      description: {
        en: "A turnkey eight-week implementation of connected sales, operations, knowledge and automation systems, with the team trained.",
        ru: "Внедрение под ключ за восемь недель: связанные системы продаж, операций, знаний и автоматизации — с обучением команды.",
      },
      price: 10_000,
      minPrice: 10_000,
      currency: "USD",
      qualifier: "from",
      en: "from $10,000",
      ru: "от $10,000",
      billingPeriod: "custom",
      availability: "manual_approval",
      url: { en: "/ai-systems/business-os", ru: "/contact" },
      isPublic: true,
    } as FromOffer,
  },
  aiVisibility: {
    publicReadiness: {
      id: "public-readiness",
      productLine: "ai-visibility",
      name: { en: "Public Readiness", ru: "Public Readiness" },
      description: {
        en: "Free technical and content readiness check with no paid AI-provider calls.",
        ru: "Бесплатная техническая и контентная проверка без платных вызовов AI-провайдеров.",
      },
      price: 0,
      currency: "USD",
      en: "Free",
      ru: "Бесплатно",
      billingPeriod: "one-time",
      availability: "free",
      url: { en: "/check", ru: "/ru/check" },
      isPublic: true,
    },
    snapshot: {
      id: "ai-visibility-snapshot",
      productLine: "ai-visibility",
      name: { en: "Visibility Snapshot", ru: "Visibility Snapshot" },
      description: {
        en: "Early access to Visitor View monitoring across ChatGPT, Gemini and Perplexity; recurring delivery is not yet activated.",
        ru: "Ежемесячный замер Visitor View в ChatGPT, Gemini и Perplexity.",
      },
      price: 49,
      currency: "USD",
      en: "$49/month",
      ru: "$49/месяц",
      billingPeriod: "month",
      availability: "early_access",
      url: { en: "/pricing", ru: "/ru/pricing" },
      isPublic: true,
    },
    landscape: {
      id: "ai-visibility-landscape",
      productLine: "ai-visibility",
      name: { en: "Full Discovery Landscape", ru: "Full Discovery Landscape" },
      description: {
        en: "Expanded AI + Local Discovery where verified, with Visitor View and API View kept separate. Early access.",
        ru: "Ландшафт по восьми системам с конкурентами, citations и evidence источников.",
      },
      price: 79,
      currency: "USD",
      en: "$79/month",
      ru: "$79/месяц",
      billingPeriod: "month",
      availability: "early_access",
      url: { en: "/pricing", ru: "/ru/pricing" },
      isPublic: true,
    },
    expertVerified: {
      id: "ai-visibility-expert-verified",
      productLine: "ai-visibility",
      name: { en: "Verified Discovery & Competitive Audit", ru: "Verified Discovery & Competitive Audit" },
      description: {
        en: "Human-led competitive investigation, a 60-minute Strategy Session, an implementation-ready Action Plan and one comparable recheck.",
        ru: "Разовый замер с ручной semantic, citation и factual QC.",
      },
      price: 399,
      currency: "USD",
      en: "$399 one-time",
      ru: "$399 разово",
      billingPeriod: "one-time",
      availability: "early_access",
      url: { en: "/pricing", ru: "/ru/pricing" },
      isPublic: true,
    },
    implementation90Days: {
      id: "ai-visibility-implementation-90-days",
      productLine: "ai-visibility",
      name: { en: "Managed Discovery Growth", ru: "Managed Discovery Growth" },
      description: {
        en: "90 days of agreed implementation, monitoring, comparable rechecks and adjustment under manual scope approval.",
        ru: "Внедрение, мониторинг и повторные замеры после ручного согласования.",
      },
      price: 2_490,
      currency: "USD",
      en: "$2,490",
      ru: "$2,490",
      billingPeriod: "custom",
      availability: "manual_approval",
      url: { en: "/pricing", ru: "/ru/pricing" },
      isPublic: true,
    },
  },
} as const satisfies {
  version: typeof COMMERCIAL_FACTS_VERSION;
  seller: {
    legalName: string;
    footerLine: string;
    countryCode: string;
    regionCode: string;
    country: LocalizedText;
  };
  aiSystems: {
    miniAudit: FixedOffer;
    audit: FixedOffer;
    sprint: FixedOffer;
    businessOs: FromOffer;
  };
  aiVisibility: {
    publicReadiness: FixedOffer;
    snapshot: FixedOffer;
    landscape: FixedOffer;
    expertVerified: FixedOffer;
    implementation90Days: FixedOffer;
  };
};

/**
 * The launch promotion, as the owner set it on 2026-08-25: both measurement
 * plans free with a code until the end of August.
 *
 * The code has to match SELENA_PROMO_CODES in the application, which is where
 * it is actually honoured — this is only what the site tells people. And the
 * end date is a fact, not a countdown: after it passes the offer stops being
 * shown rather than being quietly extended.
 */
export const launchPromotion = {
  code: "AUGUST2026",
  endsOn: "2026-08-31",
  headline: {
    en: "Both measurement plans are free until 31 August",
    ru: "Оба тарифа замера — бесплатно до 31 августа",
  },
  body: {
    en: "Enter the code when you order a measurement. Nothing is charged, and no card is asked for.",
    ru: "Введите код при заказе замера. Ничего не списывается, карта не спрашивается.",
  },
} as const;

/** Null once the promotion has ended, so an expired offer never renders. */
export function activePromotion(now: Date = new Date()) {
  // End of the last day, in UTC: the offer is honoured through 31 August.
  const endsAt = new Date(`${launchPromotion.endsOn}T23:59:59.999Z`);
  return now.getTime() <= endsAt.getTime() ? launchPromotion : null;
}

export function amountForStructuredData(offer: FixedOffer): string {
  return String(offer.price);
}

export function localizedOfferName(offer: FixedOffer, locale: CommercialLocale) {
  return offer.name[locale];
}

export function localizedOfferUrl(offer: FixedOffer, locale: CommercialLocale) {
  return offer.url[locale];
}
