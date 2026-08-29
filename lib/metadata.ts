import type { Metadata } from "next";
import { site } from "@/lib/site";

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
}: {
  title: string;
  description: string;
  path?: string;
  locale?: string;
  languages?: Record<string, string>;
  /** Page-specific social card. Falls back to the site-wide visual. */
  image?: { url: string; alt: string };
}): Metadata {
  const url = `${site.url}${path === "/" ? "" : path}`;
  const fullTitle = path === "/" ? `${site.name} — ${title}` : `${title} — ${site.name}`;
  const socialImage = image
    ? { url: image.url, width: 1200, height: 630, alt: image.alt }
    : {
        url: "/media/selena-systems-process-visual.png",
        width: 1600,
        height: 1100,
        alt: `${site.name} AI systems workflow`,
      };

  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      type: "website",
      locale,
      siteName: site.name,
      title: fullTitle,
      description,
      url,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [socialImage.url],
    },
  };
}
