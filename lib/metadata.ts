import type { Metadata } from "next";
import { site } from "@/lib/site";

/**
 * Social cards, keyed by the longest address prefix they cover.
 *
 * A shared link is the first thing most people ever see of this site, so the
 * card is a frame from the page it opens rather than one diagram for
 * everything. Built by scripts/build-og-cards.mjs; order matters, since the
 * first matching prefix wins.
 */
const SOCIAL_CARDS: { prefix: string; url: string; alt: string }[] = [
  { prefix: "/ru/visibility", url: "/og/visibility.jpg", alt: "AI Visibility — тёплая витрина сквозь мокрое стекло ночной улицы" },
  { prefix: "/visibility", url: "/og/visibility.jpg", alt: "AI Visibility — a warm shop window seen through rain at night" },
  { prefix: "/ru/ai-automation", url: "/og/automation.jpg", alt: "AI Automation — латунные шестерни в зацеплении" },
  { prefix: "/ai-automation", url: "/og/automation.jpg", alt: "AI Automation — brass gears meshing" },
  { prefix: "/ai-systems", url: "/og/automation.jpg", alt: "AI Automation — brass gears meshing" },
  { prefix: "/ru/pricing", url: "/og/pricing.jpg", alt: "Тарифы — две освещённые двери в тёмном коридоре" },
  { prefix: "/pricing", url: "/og/pricing.jpg", alt: "Pricing — two lit doorways in a dark corridor" },
  { prefix: "/ru/check", url: "/og/check.jpg", alt: "Бесплатная проверка — латунная лупа в луче света" },
  { prefix: "/check", url: "/og/check.jpg", alt: "Free check — a brass loupe standing in a beam of light" },
  { prefix: "/ru/projects", url: "/og/projects.jpg", alt: "Журнал замеров — раскрытый журнал и перо под тёплой лампой" },
  { prefix: "/ru/lab", url: "/og/lab.jpg", alt: "Selena Lab — латунный объектив на оптической скамье" },
  { prefix: "/lab", url: "/og/lab.jpg", alt: "Selena Lab — a brass lens on an optical bench" },
  { prefix: "/en/about", url: "/og/about.jpg", alt: "About — a desk by a wide window at dusk under one lamp" },
  { prefix: "/about", url: "/og/about.jpg", alt: "Обо мне — стол у широкого окна в сумерках под одной лампой" },
  { prefix: "/en/contact", url: "/og/contact.jpg", alt: "Contact — two chairs at a small table under a brass lamp" },
  { prefix: "/contact", url: "/og/contact.jpg", alt: "Связаться — два стула у столика под латунной лампой" },
];

/** The home card carries the brand image, so it also covers pages without one of their own. */
const HOME_CARD_RU = { url: "/og/home.jpg", alt: "Selena Systems — тёплый луч находит одну освещённую витрину" };
const HOME_CARD_EN = { url: "/og/home-en.jpg", alt: "Selena Systems — a warm beam finds one lit storefront" };

function socialCardFor(path: string, locale: string) {
  const match = SOCIAL_CARDS.find((card) => path === card.prefix || path.startsWith(`${card.prefix}/`));
  if (match) return match;
  return locale.startsWith("ru") ? HOME_CARD_RU : HOME_CARD_EN;
}

/**
 * Build consistent per-page metadata (title, description, canonical, OG).
 * Keeps SEO wiring in one place so every route stays consistent.
 */
export function buildMetadata({
  title,
  description,
  path = "/",
  locale = site.locale,
  languages,
  image,
  article,
  keywords,
}: {
  title: string;
  description: string;
  path?: string;
  locale?: string;
  languages?: Record<string, string>;
  /** Page-specific social card. Falls back to the site-wide visual. */
  image?: { url: string; alt: string };
  article?: {
    publishedTime: string;
    modifiedTime: string;
    authors: string[];
  };
  keywords?: string[];
}): Metadata {
  const url = `${site.url}${path === "/" ? "" : path}`;
  const fullTitle = path === "/" ? `${site.name} — ${title}` : `${title} — ${site.name}`;
  const card = image ?? socialCardFor(path, locale);
  const socialImage = { url: card.url, width: 1200, height: 630, alt: card.alt };

  return {
    title: { absolute: fullTitle },
    description,
    keywords,
    alternates: { canonical: url, languages },
    openGraph: {
      type: article ? "article" : "website",
      locale,
      siteName: site.name,
      title: fullTitle,
      description,
      url,
      images: [socialImage],
      ...(article
        ? {
            publishedTime: article.publishedTime,
            modifiedTime: article.modifiedTime,
            authors: article.authors,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [socialImage.url],
    },
  };
}
