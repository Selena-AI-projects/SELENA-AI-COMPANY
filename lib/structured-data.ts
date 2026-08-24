import { contact, contactLinks, site } from "@/lib/site";
import {
  amountForStructuredData,
  commercialFacts,
  type FixedOffer,
  localizedOfferName,
  localizedOfferUrl,
} from "@/lib/commercial-facts";

type StructuredLocale = "en" | "ru";

function organizationNode(locale: StructuredLocale) {
  const isRussian = locale === "ru";
  const phone = getInternationalPhone(contact.whatsapp);
  const organizationId = `${site.url}/#organization`;
  const contactPoint = phone
    ? {
        "@type": "ContactPoint",
        telephone: phone,
        contactType: "sales",
        availableLanguage: ["English", "Russian"],
        ...(contactLinks.whatsapp ? { url: contactLinks.whatsapp } : {}),
      }
    : undefined;

  return {
    "@type": "Organization",
    "@id": organizationId,
    name: site.name,
    url: site.url,
    logo: `${site.url}/icon.svg`,
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

  return {
    "@type": "Offer",
    "@id": `${offerUrl}#offer-${offer.id}`,
    name: localizedOfferName(offer, locale),
    price,
    priceCurrency: offer.currency,
    url: offerUrl,
    availability: schemaAvailability(offer.availability),
    description: offer.description[locale],
    priceSpecification,
    ...(category ? { category } : {}),
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
  type?: "WebPage" | "ContactPage" | "CollectionPage";
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
        offerNode({ offer: systems.businessOs, locale, category: "From" }),
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

/** Structured data for the free technical Public Readiness entry point. */
export function buildPublicReadinessStructuredData(locale: StructuredLocale) {
  const isRussian = locale === "ru";
  const pageUrl = isRussian ? `${site.url}/ru/check` : `${site.url}/check`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(locale),
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

/** Structured data for the public Selena Lab knowledge layer. */
export function buildLabStructuredData(locale: StructuredLocale) {
  const isRussian = locale === "ru";
  const pageUrl = isRussian ? `${site.url}/ru/lab` : `${site.url}/lab`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(locale),
      webPageNode({
        locale,
        pageUrl,
        type: "CollectionPage",
        name: "Selena Lab",
        description: isRussian
          ? "Исследования, руководства, эксперименты, статьи и курсы о создании AI-систем."
          : "Research, guides, experiments, articles and courses for building with AI.",
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

/** Structured data for Lab articles and guides with explicit dates and provenance. */
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
      {
        "@type": "Article",
        "@id": `${pageUrl}/#article`,
        mainEntityOfPage: pageUrl,
        headline: title,
        description,
        ...(publishedAt ? { datePublished: publishedAt } : {}),
        dateModified: updatedAt,
        inLanguage: locale,
        author: { "@id": `${site.url}/#organization` },
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
