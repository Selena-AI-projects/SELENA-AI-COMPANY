import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { visibilityLanguages } from "@/lib/visibility/routes";
import { labContent, labLanguages, labPath, labSectionIds } from "@/lib/lab/content";
import { journalProjects } from "@/lib/visibility-log/data";
import { aiCodeCrossReviewArticle } from "@/lib/school/ai-code-cross-review";
import { legalDocuments } from "@/lib/data/legal";

type PublicRoute = {
  path: string;
  priority: number;
  languages?: Record<string, string>;
  /** Only set where a real publication date exists, never invented. */
  lastModified?: string;
  changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
};

function latestEntryDate(project: (typeof journalProjects)[number]) {
  return project.entries[project.entries.length - 1]?.date;
}

const journalLastModified = journalProjects
  .map(latestEntryDate)
  .filter((date): date is string => Boolean(date))
  .sort()
  .at(-1);

const routes: PublicRoute[] = [
  { path: "/", priority: 1, languages: { "x-default": "/", en: "/", ru: "/ru" } },
  { path: "/ru", priority: 0.95, languages: { "x-default": "/", en: "/", ru: "/ru" } },
  { path: "/ai-systems", priority: 0.9 },
  { path: "/ai-systems/ai-audit", priority: 0.75 },
  { path: "/ai-systems/ai-sprint", priority: 0.75 },
  { path: "/ai-systems/business-os", priority: 0.75 },
  { path: "/ai-training", priority: 0.8 },
  { path: "/ai-automation", priority: 0.8 },
  { path: "/ai-content", priority: 0.8 },
  { path: "/visibility", priority: 0.9, languages: visibilityLanguages("visibility") },
  { path: "/ru/visibility", priority: 0.9, languages: visibilityLanguages("visibility") },
  { path: "/check", priority: 0.9, languages: visibilityLanguages("check") },
  { path: "/ru/check", priority: 0.9, languages: visibilityLanguages("check") },
  { path: "/methodology", priority: 0.5, languages: visibilityLanguages("methodology") },
  { path: "/ru/methodology", priority: 0.5, languages: visibilityLanguages("methodology") },
  { path: "/pricing", priority: 0.7, languages: visibilityLanguages("pricing") },
  { path: "/ru/pricing", priority: 0.7, languages: visibilityLanguages("pricing") },
  { path: "/lab", priority: 0.75, languages: labLanguages() },
  { path: "/ru/lab", priority: 0.75, languages: labLanguages() },
  // The blog and tools catalog are Russian-only. Do not publish hreflang until real
  // English counterpart exists.
  { path: "/ru/blog", priority: 0.75 },
  { path: "/ru/tools", priority: 0.75 },
  {
    path: aiCodeCrossReviewArticle.path,
    priority: 0.75,
    lastModified: aiCodeCrossReviewArticle.updatedAt,
  },
  ...labSectionIds.filter((section) => section !== "courses").flatMap((section) => [
    { path: labPath("en", section), priority: 0.65, languages: labLanguages(section) },
    { path: labPath("ru", section), priority: 0.65, languages: labLanguages(section) },
  ]),
  // Lab items carry the date they were written and the date they changed, so
  // they can say when they changed. Pages without such a date stay silent
  // rather than publish the build's date as if it were an edit.
  ...labContent.en.items.flatMap((item) => [
    {
      path: labPath("en", item.section, item.slug),
      priority: 0.7,
      lastModified: item.updatedAt,
      languages: labLanguages(item.section, item.slug),
    },
    {
      path: labPath("ru", item.section, item.slug),
      priority: 0.7,
      lastModified: item.updatedAt,
      languages: labLanguages(item.section, item.slug),
    },
  ]),
  // The journal is Russian-first by decision; the English mirror follows later,
  // so these routes deliberately carry no hreflang alternates yet.
  {
    path: "/ru/projects",
    priority: 0.8,
    changeFrequency: "weekly" as const,
    ...(journalLastModified ? { lastModified: journalLastModified } : {}),
  },
  ...journalProjects.map((project) => ({
    path: `/ru/projects/${project.slug}`,
    priority: 0.6,
    changeFrequency: "weekly" as const,
    ...(latestEntryDate(project) ? { lastModified: latestEntryDate(project) } : {}),
  })),
  { path: "/about", priority: 0.6, languages: { "x-default": "/en/about", en: "/en/about", ru: "/about" } },
  { path: "/en/about", priority: 0.6, languages: { "x-default": "/en/about", en: "/en/about", ru: "/about" } },
  { path: "/contact", priority: 0.9, languages: { "x-default": "/en/contact", en: "/en/contact", ru: "/contact" } },
  { path: "/en/contact", priority: 0.9, languages: { "x-default": "/en/contact", en: "/en/contact", ru: "/contact" } },
  // The legal pages now state when their current text took effect, so they can
  // say it here too. The date is the document's, not the build's.
  { path: "/en/privacy", priority: 0.2, lastModified: legalDocuments.privacy.effectiveDate, languages: { "x-default": "/en/privacy", en: "/en/privacy", ru: "/privacy" } },
  { path: "/en/terms", priority: 0.2, lastModified: legalDocuments.terms.effectiveDate, languages: { "x-default": "/en/terms", en: "/en/terms", ru: "/terms" } },
  { path: "/privacy", priority: 0.2, lastModified: legalDocuments.privacy.effectiveDate, languages: { "x-default": "/en/privacy", en: "/en/privacy", ru: "/privacy" } },
  { path: "/terms", priority: 0.2, lastModified: legalDocuments.terms.effectiveDate, languages: { "x-default": "/en/terms", en: "/en/terms", ru: "/terms" } },
];

function absoluteUrl(path: string) {
  return path === "/" ? site.url : `${site.url}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, priority, languages, lastModified, changeFrequency }) => ({
    url: absoluteUrl(path),
    changeFrequency: changeFrequency ?? "monthly",
    priority,
    ...(lastModified ? { lastModified: new Date(lastModified) } : {}),
    ...(languages
      ? {
          alternates: {
            languages: Object.fromEntries(
              Object.entries(languages).map(([language, href]) => [language, absoluteUrl(href)]),
            ),
          },
        }
      : {}),
  }));
}
