import { buildMetadata } from "@/lib/metadata";
import { visibilityContentEn } from "@/lib/visibility/content.en";
import { visibilityLanguages } from "@/lib/visibility/routes";
import { PageHero } from "@/components/sections/PageHero";
import { MethodologySummary } from "@/components/visibility/MethodologySummary";
import { MeasurementLayers } from "@/components/visibility/MeasurementLayers";
import {
  ActionReadinessSection,
  LocalBusinessModeSection,
  NotClaimedSection,
} from "@/components/visibility/ActionReadinessSection";
import { MeasurementBoundary } from "@/components/visibility/MeasurementBoundary";
import { MetricDefinitionGrid } from "@/components/visibility/MetricDefinitionGrid";
import { Container } from "@/components/ui/Container";
import { buildMethodologyStructuredData } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";

const content = visibilityContentEn;

export const metadata = buildMetadata({
  title: "Methodology for AI Visibility",
  description:
    "How AI Visibility measures public readiness and AI answers: evidence types, versioning, sample-size disclosure and what the score cannot prove.",
  path: "/methodology",
  locale: "en_US",
  languages: visibilityLanguages("methodology"),
});

export default function MethodologyPage() {
  return (
    <>
      <JsonLd data={buildMethodologyStructuredData("en")} />
      <div lang="en">
      <PageHero
        eyebrow="Methodology"
        title="Evidence first. Every result shows what was checked, when, and what it does not prove."
        intro="This page is the honesty contract behind every AI Visibility report."
      />

      <section className="bg-ivory pb-4 sm:pb-8">
        <Container size="narrow">
          <MeasurementBoundary content={content.measurementBoundary} />
        </Container>
      </section>

      <MetricDefinitionGrid
        eyebrow="Metric definitions"
        headline="What each number means."
        metrics={content.metrics}
      />

      <MeasurementLayers content={content.measurementLayers} background="surface" />

      <ActionReadinessSection content={content.actionReadiness} />

      <LocalBusinessModeSection content={content.localBusinessMode} />

      <MethodologySummary content={content.methodology} />

      <NotClaimedSection content={content.notClaimed} />
      </div>
    </>
  );
}
