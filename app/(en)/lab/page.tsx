import { LabLandingPage } from "@/components/lab/LabPages";
import { labLanguages } from "@/lib/lab/content";
import { buildMetadata } from "@/lib/metadata";
import { buildLabStructuredData } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = buildMetadata({
  title: "Selena Lab — research, tools and articles",
  description:
    "Research, practical guides, experiments, tools and articles from Selena Systems for clearer AI decisions and stronger evidence.",
  path: "/lab",
  locale: "en_US",
  languages: labLanguages(),
});

export default function LabPage() {
  return (
    <>
      <JsonLd data={buildLabStructuredData("en")} />
      <LabLandingPage locale="en" />
    </>
  );
}
