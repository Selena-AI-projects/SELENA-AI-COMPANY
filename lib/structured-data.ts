import { contact, founder, site } from "@/lib/site";
import { legalDocuments } from "@/lib/data/legal";
import type { Service } from "@/lib/data/services";
import {
  amountForStructuredData,
  commercialFacts,
  type FixedOffer,
  localizedOfferName,
  localizedOfferUrl,
} from "@/lib/commercial-facts";

type StructuredLocale = "en" | "ru";
export type AiAutomationOfferSlug = "ai-audit" | "ai-sprint" | "business-os";

function organizationNode(locale: StructuredLocale) {
  const isRussian = locale === "ru";
  const phone = getInternationalPhone(contact.phone);
  const organizationId = `${site.url}/#organization`;
  const contactPoint = phone
    ? {
        "@type": "ContactPoint",
        telephone: phone,
        email: contact.email,
        contactType: "sales",
        availableLanguage: ["English", "Russian"],
        url: `${site.url}${isRussian ? "/contact" : "/en/contact"}`,
      }
    : undefined;

  return {
    "@type": "Organization",
    "@id": organizationId,
    name: site.name,
    legalName: commercialFacts.seller.legalName,
    url: site.url,
    logo: `${site.url}/icon.svg`,
    address: {
      "@type": "PostalAddress",
      addressCountry: commercialFacts.seller.countryCode,
      addressRegion: commercialFacts.seller.regionCode,
    },
    founder: { "@id": `${site.url}/#founder` },
    description: isRussian
      ? "Selena Systems проектирует и внедряет AI-системы и помогает бизнесу измерять AI-видимость."
      : "Selena Systems designs and builds AI systems and helps businesses measure AI visibility.",
    ...(contactPoint ? { contactPoint } : {}),
  };
}

function websiteNode(locale: StructuredLocale) {
  return {
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: site.url,
    name: site.name,
    inLanguage: ["en", "ru"],
    publisher: { "@id": `${site.url}/#organization` },
    about: locale === "ru" ? "AI-автоматизация и AI-видимость" : "AI automation and AI visibility",
  };
}

function schemaAvailability(availability: FixedOffer["availability"]) {
  if (availability === "free") return "https://schema.org/InStock";
  if (availability === "manual_approval") return "https://schema.org/PreOrder";
  return "https://schema.org/LimitedAvailability";
}

function offerNode({
  offer,
  locale,
  url,
  category,
}: {
  offer: FixedOffer;
  locale: StructuredLocale;
  url?: string;
  category?: string;
}) {
  const price = amountForStructuredData(offer);
  const offerUrl = url ?? `${site.url}${localizedOfferUrl(offer, locale)}`;
  const priceSpecification =
    offer.billingPeriod === "custom"
      ? {
          "@type": "PriceSpecification",
          minPrice: "minPrice" in offer ? String(offer.minPrice) : price,
          priceCurrency: offer.currency,
        }
      : {
          "@type": "UnitPriceSpecification",
          price,
          priceCurrency: offer.currency,
          unitText: offer.billingPeriod,
        };

  // `price` is the price, not a starting point. An offer sold "from $10,000"
  // states its floor in the specification and leaves `price` unset, so a
  // reader is not told a number the seller never promised.
  const startsFrom = "qualifier" in offer && offer.qualifier === "from";

  return {
    "@type": "Offer",
    "@id": `${offerUrl}#offer-${offer.id}`,
    name: localizedOfferName(offer, locale),
    ...(startsFrom ? {} : { price }),
    priceCurrency: offer.currency,
    url: offerUrl,
    availability: schemaAvailability(offer.availability),
    description: offer.description[locale],
    priceSpecification,
    ...(category ? { category } : {}),
  };
}

/**
 * The founder as an entity of her own, so a statement can be attributed to a
 * person rather than to a company name. No biography and no profile links
 * here: they are not on the site, and this file publishes what the site says.
 */
function personNode(locale: StructuredLocale) {
  return {
    "@type": "Person",
    "@id": `${site.url}/#founder`,
    name: founder.name[locale],
    jobTitle: founder.role[locale],
    image: `${site.url}${founder.image}`,
    worksFor: { "@id": `${site.url}/#organization` },
    url: `${site.url}${locale === "ru" ? "/about" : "/en/about"}`,
  };
}

function webPageNode({
  locale,
  pageUrl,
  name,
  description,
  type = "WebPage",
}: {
  locale: StructuredLocale;
  pageUrl: string;
  name: string;
  description: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";
}) {
  return {
    "@type": type,
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name,
    description,
    inLanguage: locale,
    isPartOf: { "@id": `${site.url}/#website` },
    publisher: { "@id": `${site.url}/#organization` },
  };
}

function breadcrumbNode(items: Array<{ name: string; item: string }>, pageUrl: string) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      ...entry,
    })),
  };
}

function localizedContactUrl(locale: StructuredLocale) {
  return `${site.url}${locale === "ru" ? "/contact" : "/en/contact"}`;
}

function aiSystemsServiceNode(locale: StructuredLocale) {
  const isRussian = locale === "ru";
  // AI Systems has one page at /ai-systems (no /ru/ai-systems route exists);
  // pointing localized structured data at a non-existent URL yields a 404.
  const pageUrl = `${site.url}/ai-systems`;
  const systems = commercialFacts.aiSystems;

  return {
    "@type": "Service",
    "@id": `${pageUrl}#ai-systems-service`,
    url: pageUrl,
    name: "AI Automation",
    serviceType: "Custom AI systems design and implementation",
    description: isRussian
      ? "Индивидуальные AI-системы для процессов продаж, контента, знаний, автоматизации и операций."
      : "Custom AI systems for sales, content, knowledge, automation and operations.",
    provider: { "@id": `${site.url}/#organization` },
    areaServed: "Worldwide",
    inLanguage: locale,
    offers: {
      "@type": "OfferCatalog",
      name: isRussian ? "Форматы AI Automation" : "AI Automation formats",
      itemListElement: [
        offerNode({ offer: systems.miniAudit, locale }),
        offerNode({ offer: systems.audit, locale }),
        offerNode({ offer: systems.sprint, locale }),
        offerNode({ offer: systems.businessOs, locale }),
      ],
    },
  };
}

function aiVisibilityServiceNode(locale: StructuredLocale) {
  const isRussian = locale === "ru";
  const pageUrl = `${site.url}${isRussian ? "/ru/visibility" : "/visibility"}`;
  const pricingUrl = `${site.url}${isRussian ? "/ru/pricing" : "/pricing"}`;
  const visibility = commercialFacts.aiVisibility;

  return {
    "@type": "Service",
    "@id": `${pageUrl}#ai-visibility-service`,
    url: pageUrl,
    name: "AI Visibility",
    serviceType: "AI visibility measurement and website Public Readiness",
    description: isRussian
      ? "Public Readiness и отдельные платные AI-замеры с evidence, исправлениями и повторным измерением."
      : "Public Readiness and separate paid AI measurements with evidence, fixes and remeasurement.",
    provider: { "@id": `${site.url}/#organization` },
    areaServed: "Worldwide",
    inLanguage: locale,
    offers: {
      "@type": "OfferCatalog",
      name: isRussian ? "Варианты AI Visibility" : "AI Visibility options",
      itemListElement: [
        offerNode({ offer: visibility.publicReadiness, locale }),
        offerNode({ offer: visibility.snapshot, locale, url: pricingUrl, category: "AI Visibility" }),
        offerNode({ offer: visibility.landscape, locale, url: pricingUrl, category: "AI Visibility" }),
        offerNode({ offer: visibility.expertVerified, locale, url: pricingUrl, category: "AI Visibility" }),
        offerNode({ offer: visibility.implementation90Days, locale, url: pricingUrl, category: "AI Visibility" }),
      ],
    },
  };
}

function getInternationalPhone(value: string | null) {
  if (!value || /^https?:\/\//i.test(value)) return null;

  const digits = value.replace(/\D/g, "");
  const international = /^8\d{10}$/.test(digits)
    ? `7${digits.slice(1)}`
    : digits;

  return international ? `+${international}` : null;
}

export function buildHomeStructuredData(locale: "en" | "ru") {
  const isRussian = locale === "ru";
  const pageUrl = isRussian ? `${site.url}/ru` : site.url;

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(locale),
      websiteNode(locale),
      webPageNode({
        locale,
        pageUrl,
        name: isRussian ? "Selena Systems" : "Selena Systems",
        description: isRussian
          ? "AI-автоматизация и AI Visibility для современного бизнеса."
          : "AI automation and AI visibility for modern businesses.",
      }),
      aiSystemsServiceNode(locale),
      aiVisibilityServiceNode(locale),
    ],
  };
}

/** Structured data for the canonical AI Visibility product page. */
export function buildAiVisibilityStructuredData(locale: StructuredLocale) {
  const isRussian = locale === "ru";
  const pageUrl = isRussian ? `${site.url}/ru/visibility` : `${site.url}/visibility`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(locale),
      websiteNode(locale),
      webPageNode({
        locale,
        pageUrl,
        name: "AI Visibility",
        description: isRussian
          ? "AI Visibility измеряет, как AI-системы находят, понимают и представляют бизнес."
          : "AI Visibility measures how AI systems find, understand and represent a business.",
      }),
      breadcrumbNode(
        [
          { name: "Selena Systems", item: site.url },
          { name: "AI Visibility", item: pageUrl },
        ],
        pageUrl,
      ),
      aiVisibilityServiceNode(locale),
    ],
  };
}

/**
 * The pricing page describes itself.
 *
 * It used to publish the graphs of the two product pages instead — a WebPage
 * node claiming to be /visibility, a second claiming to be /ai-systems, and no
 * node for the page a reader was actually on. Both service nodes stay, because
 * both catalogues are sold here and their offers carry the prices; what is
 * added is the page itself, and the Russian side gains the AI Automation
 * offers it was not publishing at all.
 */
export function buildPricingStructuredData(locale: StructuredLocale) {
  const isRussian = locale === "ru";
  const pageUrl = isRussian ? `${site.url}/ru/pricing` : `${site.url}/pricing`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(locale),
      websiteNode(locale),
      webPageNode({
        locale,
        pageUrl,
        name: isRussian ? "Цены — AI Visibility и AI Automation" : "Pricing — AI Visibility and AI Automation",
        description: isRussian
          ? "Бесплатная проверка готовности, четыре платных варианта AI Visibility и четыре формата AI Automation."
          : "The free readiness check, four paid AI Visibility options and four AI Automation formats.",
      }),
      breadcrumbNode(
        [
          { name: "Selena Systems", item: site.url },
          { name: isRussian ? "Цены" : "Pricing", item: pageUrl },
        ],
        pageUrl,
      ),
      aiVisibilityServiceNode(locale),
      aiSystemsServiceNode(locale),
    ],
  };
}

/**
 * The questions a page already answers, in machine-readable form.
 *
 * Google stopped showing FAQ rich results for most sites in 2023, so this is
 * not for the search result — it is for the assistant that needs a whole,
 * quotable answer rather than a paragraph it has to cut down.
 */
export function buildFaqStructuredData(items: readonly { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/** Structured data for the free technical Public Readiness entry point. */
export function buildPublicReadinessStructuredData(locale: StructuredLocale) {
  const isRussian = locale === "ru";
  const pageUrl = isRussian ? `${site.url}/ru/check` : `${site.url}/check`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(locale),
      websiteNode(locale),
      webPageNode({
        locale,
        pageUrl,
        name: "Website Public Readiness",
        description: isRussian
          ? "Бесплатная проверка того, могут ли машины получить и понять публичную информацию сайта."
          : "A free check of whether machines can access and understand public website information.",
      }),
      breadcrumbNode(
        [
          { name: "Selena Systems", item: site.url },
          { name: "Public Readiness", item: pageUrl },
        ],
        pageUrl,
      ),
      {
        "@type": "Service",
        "@id": `${pageUrl}#public-readiness-service`,
        url: pageUrl,
        name: "Website Public Readiness",
        serviceType: "Website technical and content readiness check",
        description: isRussian
          ? "Бесплатная проверка того, могут ли машины получить и понять публичную информацию сайта."
          : "A free check of whether machines can access and understand public website information.",
        provider: { "@id": `${site.url}/#organization` },
        areaServed: "Worldwide",
        inLanguage: locale,
        offers: offerNode({ offer: commercialFacts.aiVisibility.publicReadiness, locale, url: pageUrl, category: "Free website readiness check" }),
      },
    ],
  };
}

/** Structured data for the canonical AI Systems service page. */
export function buildAiSystemsStructuredData(locale: StructuredLocale = "en") {
  const isRussian = locale === "ru";
  const pageUrl = `${site.url}/ai-systems`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(locale),
      websiteNode(locale),
      webPageNode({
        locale,
        pageUrl,
        name: "AI Automation",
        description: isRussian
          ? "Индивидуальные AI-системы для процессов продаж, контента, знаний, автоматизации и операций."
          : "Custom AI systems for sales, content, knowledge, automation and operations.",
      }),
      breadcrumbNode(
        [
          { name: "Selena Systems", item: site.url },
          { name: "AI Automation", item: pageUrl },
        ],
        pageUrl,
      ),
      aiSystemsServiceNode(locale),
    ],
  };
}

const aiAutomationOfferBySlug = {
  "ai-audit": commercialFacts.aiSystems.audit,
  "ai-sprint": commercialFacts.aiSystems.sprint,
  "business-os": commercialFacts.aiSystems.businessOs,
} as const;

/** Structured data for one canonical AI Automation commercial page. */
export function buildAiAutomationOfferStructuredData(slug: AiAutomationOfferSlug) {
  const offer = aiAutomationOfferBySlug[slug];
  const pageUrl = `${site.url}/ai-systems/${slug}`;
  const name = localizedOfferName(offer, "en");

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode("en"),
      websiteNode("en"),
      webPageNode({
        locale: "en",
        pageUrl,
        name,
        description: offer.description.en,
      }),
      breadcrumbNode(
        [
          { name: "Selena Systems", item: site.url },
          { name: "AI Automation", item: `${site.url}/ai-systems` },
          { name, item: pageUrl },
        ],
        pageUrl,
      ),
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        url: pageUrl,
        name,
        serviceType: "Custom AI systems design and implementation",
        description: offer.description.en,
        provider: { "@id": `${site.url}/#organization` },
        areaServed: "Worldwide",
        inLanguage: "en",
        offers: offerNode({ offer, locale: "en", url: pageUrl }),
      },
    ],
  };
}

/**
 * One of the three Russian service pages.
 *
 * They carried no structured data at all, and search sends people straight to
 * them. There is no `offers` node because these pages name no price: a price
 * in the markup that a reader cannot see on the page is a claim they cannot
 * check.
 */
export function buildServicePageStructuredData(service: Service) {
  const pageUrl = `${site.url}${service.href}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode("ru"),
      websiteNode("ru"),
      webPageNode({
        locale: "ru",
        pageUrl,
        name: service.name,
        description: service.promise,
      }),
      breadcrumbNode(
        [
          { name: "Selena Systems", item: `${site.url}/ru` },
          { name: "AI Automation", item: `${site.url}/ru#ai-systems` },
          { name: service.name, item: pageUrl },
        ],
        pageUrl,
      ),
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        url: pageUrl,
        name: service.name,
        serviceType: service.cardTitle,
        description: service.promise,
        provider: { "@id": `${site.url}/#organization` },
        areaServed: "Worldwide",
        inLanguage: "ru",
      },
    ],
  };
}

/** Structured data for the bilingual founder and company page. */
export function buildAboutStructuredData(locale: StructuredLocale) {
  const isRussian = locale === "ru";
  const pageUrl = `${site.url}${isRussian ? "/about" : "/en/about"}`;
  const name = isRussian ? "О Selena Systems" : "About Selena Systems";
  const description = isRussian
    ? "Как Selena Systems проектирует AI Automation и измеряет AI Visibility: процесс, доказательства и контроль человеком."
    : "How Selena Systems designs AI Automation and measures AI Visibility with clear evidence and human control.";

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(locale),
      websiteNode(locale),
      webPageNode({
        locale,
        pageUrl,
        type: "AboutPage",
        name,
        description,
      }),
      breadcrumbNode(
        [
          { name: "Selena Systems", item: site.url },
          { name, item: pageUrl },
        ],
        pageUrl,
      ),
      personNode(locale),
    ],
  };
}

/** Structured data for the public Selena Lab knowledge layer. */
export function buildLabStructuredData(locale: StructuredLocale) {
  const isRussian = locale === "ru";
  const pageUrl = isRussian ? `${site.url}/ru/lab` : `${site.url}/lab`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(locale),
      websiteNode(locale),
      webPageNode({
        locale,
        pageUrl,
        type: "CollectionPage",
        name: "Selena Lab",
        description: isRussian
          ? "Исследования, методики, эксперименты, инструменты, проверяемые кейсы и блог о создании AI-систем."
          : "Research, guides, experiments, tools and articles for building with AI.",
      }),
      breadcrumbNode(
        [
          { name: "Selena Systems", item: site.url },
          { name: "Selena Lab", item: pageUrl },
        ],
        pageUrl,
      ),
    ],
  };
}

/** Structured data for a Lab section index. */
export function buildLabSectionStructuredData({
  locale,
  pageUrl,
  title,
  description,
}: {
  locale: StructuredLocale;
  pageUrl: string;
  title: string;
  description: string;
}) {
  const labUrl = `${site.url}${locale === "ru" ? "/ru/lab" : "/lab"}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(locale),
      websiteNode(locale),
      webPageNode({ locale, pageUrl, type: "CollectionPage", name: title, description }),
      breadcrumbNode(
        [
          { name: "Selena Lab", item: labUrl },
          { name: title, item: pageUrl },
        ],
        pageUrl,
      ),
    ],
  };
}

/** Structured data for the public methodology page. */
export function buildMethodologyStructuredData(locale: StructuredLocale) {
  const isRussian = locale === "ru";
  const pageUrl = isRussian ? `${site.url}/ru/methodology` : `${site.url}/methodology`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(locale),
      websiteNode(locale),
      webPageNode({
        locale,
        pageUrl,
        name: isRussian ? "Методология AI Visibility" : "AI Visibility methodology",
        description: isRussian
          ? "Доказательства, выборка, версии правил и границы интерпретации результатов AI Visibility."
          : "Evidence, sampling, rule versions and interpretation limits behind AI Visibility results.",
      }),
      breadcrumbNode(
        [
          { name: "AI Visibility", item: `${site.url}${isRussian ? "/ru/visibility" : "/visibility"}` },
          { name: isRussian ? "Методология" : "Methodology", item: pageUrl },
        ],
        pageUrl,
      ),
    ],
  };
}

/** Structured data for the public contact form page. */
export function buildContactStructuredData(locale: StructuredLocale) {
  const isRussian = locale === "ru";
  const pageUrl = localizedContactUrl(locale);

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(locale),
      websiteNode(locale),
      webPageNode({
        locale,
        pageUrl,
        type: "ContactPage",
        name: isRussian ? "Связаться с Selena Systems" : "Contact Selena Systems",
        description: isRussian
          ? "Опишите задачу, чтобы обсудить AI Visibility или индивидуальную AI-систему."
          : "Describe your goal to discuss AI Visibility or a custom AI system.",
      }),
      breadcrumbNode(
        [
          { name: "Selena Systems", item: site.url },
          { name: isRussian ? "Контакты" : "Contact", item: pageUrl },
        ],
        pageUrl,
      ),
    ],
  };
}

/**
 * Structured data for the privacy and terms pages.
 *
 * These are the two pages an assistant reads to answer "who operates this and
 * what are the rules". The dates come from `legalDocuments` — the day each
 * document's own text was last published, not the build date.
 */
export function buildLegalPageStructuredData({
  locale,
  kind,
  pageUrl,
  name,
  description,
}: {
  locale: StructuredLocale;
  kind: "privacy" | "terms";
  pageUrl: string;
  name: string;
  description: string;
}) {
  const isRussian = locale === "ru";

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(locale),
      websiteNode(locale),
      {
        ...webPageNode({ locale, pageUrl, name, description }),
        about: { "@id": `${site.url}/#organization` },
        datePublished: legalDocuments[kind].effectiveDate,
        dateModified: legalDocuments[kind].effectiveDate,
        ...(kind === "privacy"
          ? { significantLink: localizedContactUrl(locale) }
          : {}),
      },
      breadcrumbNode(
        [
          { name: "Selena Systems", item: site.url },
          {
            name: isRussian
              ? kind === "privacy"
                ? "Политика конфиденциальности"
                : "Условия использования"
              : kind === "privacy"
                ? "Privacy Policy"
                : "Terms of Use",
            item: pageUrl,
          },
        ],
        pageUrl,
      ),
    ],
  };
}

/** Structured data for Lab articles and guides with explicit dates and provenance. */
/**
 * Structured data for the visibility journal index.
 *
 * The list is the point: seven named projects, each dated, each with its own
 * page. `Dataset` is deliberately not used — these are written entries about
 * measurements, not a downloadable data file.
 */
export function buildJournalStructuredData({
  locale,
  pageUrl,
  title,
  description,
  projects,
}: {
  locale: StructuredLocale;
  pageUrl: string;
  title: string;
  description: string;
  projects: { slug: string; name: string; url: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(locale),
      websiteNode(locale),
      webPageNode({ locale, pageUrl, type: "CollectionPage", name: title, description }),
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#projects`,
        numberOfItems: projects.length,
        itemListElement: projects.map((project, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: project.name,
          item: `${pageUrl}/${project.slug}`,
        })),
      },
      breadcrumbNode([{ name: title, item: pageUrl }], pageUrl),
    ],
  };
}

/**
 * Structured data for one project's journal page.
 *
 * `about` names the measured site so the page is understood as being about
 * that project rather than about Selena Systems, and `spatialCoverage` carries
 * the markets the measurement is actually scoped to.
 */
export function buildJournalProjectStructuredData({
  locale,
  journalUrl,
  pageUrl,
  journalTitle,
  project,
  publishedAt,
  updatedAt,
}: {
  locale: StructuredLocale;
  journalUrl: string;
  pageUrl: string;
  journalTitle: string;
  project: { name: string; url: string; category: string; markets: string[] };
  publishedAt: string;
  updatedAt: string;
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(locale),
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        mainEntityOfPage: pageUrl,
        headline: `${project.name} — проект и замеры`,
        description: `Замеры видимости проекта ${project.name}: точка отсчёта, пройденные ступени и то, чего эти числа не доказывают.`,
        datePublished: publishedAt,
        dateModified: updatedAt,
        inLanguage: locale,
        author: { "@id": `${site.url}/#founder` },
        publisher: { "@id": `${site.url}/#organization` },
        isPartOf: { "@id": `${site.url}/#website` },
        articleSection: journalTitle,
        about: {
          "@type": "WebSite",
          name: project.name,
          url: project.url,
          description: project.category,
        },
        spatialCoverage: project.markets.map((market) => ({ "@type": "Place", name: market })),
      },
      breadcrumbNode(
        [
          { name: journalTitle, item: journalUrl },
          { name: project.name, item: pageUrl },
        ],
        pageUrl,
      ),
    ],
  };
}

export function buildLabArticleStructuredData({
  locale,
  pageUrl,
  title,
  description,
  publishedAt,
  updatedAt,
}: {
  locale: StructuredLocale;
  pageUrl: string;
  title: string;
  description: string;
  publishedAt?: string;
  updatedAt: string;
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(locale),
      websiteNode(locale),
      personNode(locale),
      {
        "@type": "Article",
        "@id": `${pageUrl}/#article`,
        mainEntityOfPage: pageUrl,
        headline: title,
        description,
        ...(publishedAt ? { datePublished: publishedAt } : {}),
        dateModified: updatedAt,
        inLanguage: locale,
        author: { "@id": `${site.url}/#founder` },
        publisher: { "@id": `${site.url}/#organization` },
        isPartOf: { "@id": `${site.url}/#website` },
        articleSection: "Selena Lab",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}/#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Selena Lab", item: `${site.url}${locale === "ru" ? "/ru/lab" : "/lab"}` },
          { "@type": "ListItem", position: 2, name: title, item: pageUrl },
        ],
      },
    ],
  };
}

export function buildAiCodeCrossReviewStructuredData({
  pageUrl,
  title,
  description,
  imageUrl,
  publishedAt,
  updatedAt,
  steps,
  tags,
}: {
  pageUrl: string;
  title: string;
  description: string;
  imageUrl: string;
  publishedAt: string;
  updatedAt: string;
  steps: readonly string[];
  tags: readonly string[];
}) {
  const blogUrl = `${site.url}/ru/blog`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode("ru"),
      websiteNode("ru"),
      personNode("ru"),
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        url: pageUrl,
        mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
        headline: title,
        description,
        image: {
          "@type": "ImageObject",
          url: imageUrl,
          width: 1200,
          height: 630,
        },
        author: { "@id": `${site.url}/#founder` },
        publisher: { "@id": `${site.url}/#organization` },
        datePublished: publishedAt,
        dateModified: updatedAt,
        inLanguage: "ru",
        articleSection: "Блог · Личный опыт",
        keywords: tags.join(", "),
        isPartOf: { "@id": `${site.url}/#website` },
      },
      {
        "@type": "HowTo",
        "@id": `${pageUrl}#workflow`,
        url: pageUrl,
        name: "Как организовать перекрёстную проверку AI-кода",
        description:
          "Пошаговый workflow: от постановки задачи и реализации Codex до независимой проверки Claude Code и owner-gate.",
        image: imageUrl,
        inLanguage: "ru",
        author: { "@id": `${site.url}/#founder` },
        publisher: { "@id": `${site.url}/#organization` },
        mainEntityOfPage: pageUrl,
        step: steps.map((text, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: `Шаг ${index + 1}`,
          text,
          url: `${pageUrl}#workflow-step-${index + 1}`,
        })),
      },
      breadcrumbNode(
        [
          { name: "Selena Systems", item: `${site.url}/ru` },
          { name: "Блог", item: blogUrl },
          { name: title, item: pageUrl },
        ],
        pageUrl,
      ),
    ],
  };
}
