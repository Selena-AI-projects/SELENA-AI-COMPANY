import { notFound } from "next/navigation";
import { LabSectionPage } from "@/components/lab/LabPages";
import { buildMetadata } from "@/lib/metadata";
import { buildLabSectionStructuredData } from "@/lib/structured-data";
import { getLabSection, labLanguages, labSectionIds, type LabSectionId } from "@/lib/lab/content";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return labSectionIds.map((section) => ({ section }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) {
  const { section: sectionId } = await params;
  const section = getLabSection("ru", sectionId);
  if (!section) return {};
  const metadata = buildMetadata({
    title: `${section.title} | Selena Lab`,
    description: section.description,
    path: `/ru/lab/${section.id}`,
    locale: "ru_RU",
    languages: labLanguages(section.id),
  });
  return section.id === "courses"
    ? { ...metadata, robots: { index: false, follow: true } }
    : metadata;
}

export default async function RussianLabSectionRoute({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!labSectionIds.includes(section as LabSectionId)) notFound();
  const sectionData = getLabSection("ru", section);
  if (!sectionData) notFound();
  const pageUrl = `${site.url}/ru/lab/${sectionData.id}`;
  return (
    <>
      <JsonLd data={buildLabSectionStructuredData({
        locale: "ru",
        pageUrl,
        title: sectionData.title,
        description: sectionData.description,
      })} />
      <LabSectionPage locale="ru" sectionId={section as LabSectionId} />
    </>
  );
}
