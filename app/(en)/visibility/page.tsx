import { buildMetadata } from "@/lib/metadata";
import { buildAiVisibilityStructuredData } from "@/lib/structured-data";
import { visibilityContentEn } from "@/lib/visibility/content.en";
import { visibilityLanguages } from "@/lib/visibility/routes";
import { VerificationCycleSection } from "@/components/visibility/VerificationCycleSection";
import { getSampleReport } from "@/lib/visibility/sample-report-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { DiscoverySales } from "@/components/visibility/DiscoverySales";

export const metadata = buildMetadata({
  title: "AI Visibility for Hotels, Villas & Restaurants",
  description:
    "See where guests find your hotel, villa, restaurant or spa across AI and local discovery, who appears instead, which sources matter, and what to do next.",
  path: "/visibility",
  locale: "en_US",
  languages: visibilityLanguages("visibility"),
});

export default function VisibilityPage() {
  return (
    <>
      <JsonLd data={buildAiVisibilityStructuredData("en")} />
      <DiscoverySales>
        <VerificationCycleSection
          content={visibilityContentEn.verificationCycle}
          sample={getSampleReport("en").verificationLoop}
        />
      </DiscoverySales>
    </>
  );
}
