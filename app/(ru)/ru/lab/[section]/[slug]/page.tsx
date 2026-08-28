import { notFound } from "next/navigation";
import { LabArticlePage } from "@/components/lab/LabPages";
import { buildMetadata } from "@/lib/metadata";
import { buildLabArticleStructuredData } from "@/lib/structured-data";
import { site } from "@/lib/site";
import { getLabItem, labContent, labLanguages, labPath } from "@/lib/lab/content";
import { JsonLd } from "@/components/seo/JsonLd";

export function generateStaticParams() {
  return labContent.ru.items.map((item) => ({ section: item.section, slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string; slug: string }> }) {
  const { section, slug } = await params;
  const item = getLabItem("ru", section, slug);
  if (!item) return {};
  const metadataTitles: Record<string, string> = {
    "prepare-site-for-ai-systems": "Как подготовить сайт к AI",
    "read-ai-visibility-report-evidence": "Читать AI Visibility Report",
  };
  return buildMetadata({
    title: `${metadataTitles[item.slug] ?? item.title} — Selena Lab`,
    description: item.summary,
    path: labPath("ru", item.section, item.slug),
    locale: "ru_RU",
    languages: labLanguages(item.section, item.slug),
  });
}

export default async function RussianLabArticleRoute({ params }: { params: Promise<{ section: string; slug: string }> }) {
  const { section, slug } = await params;
  const item = getLabItem("ru", section, slug);
  if (!item) notFound();
  const pagePath = labPath("ru", item.section, item.slug);
  return (
    <>
      <JsonLd
        data={buildLabArticleStructuredData({
          locale: "ru",
          pageUrl: `${site.url}${pagePath}`,
          title: item.title,
          description: item.summary,
          publishedAt: item.publishedAt,
          updatedAt: item.updatedAt,
        })}
      />
      <LabArticlePage locale="ru" item={item} />
    </>
  );
}
