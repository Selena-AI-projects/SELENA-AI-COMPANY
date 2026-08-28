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
  const section = getLabSection("en", sectionId);
  if (!section) return {};
  const metadata = buildMetadata({
    title: `${section.title} | Selena Lab`,
    description: section.description,
    path: `/lab/${section.id}`,
    locale: "en_US",
    languages: labLanguages(section.id),
  });
  return section.id === "courses"
    ? { ...metadata, robots: { index: false, follow: true } }
    : metadata;
}

export default async function LabSectionRoute({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!labSectionIds.includes(section as LabSectionId)) notFound();
  const sectionData = getLabSection("en", section);
  if (!sectionData) notFound();
  const pageUrl = `${site.url}/lab/${sectionData.id}`;
  return (
    <>
      <JsonLd data={buildLabSectionStructuredData({
        locale: "en",
        pageUrl,
        title: sectionData.title,
        description: sectionData.description,
      })} />
      <LabSectionPage locale="en" sectionId={section as LabSectionId} />
    </>
  );
}
