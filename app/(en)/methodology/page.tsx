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
import { Button } from "@/components/ui/Button";
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

      <section className="bg-ivory py-12 sm:py-16">
        <Container size="narrow">
          <h2 className="font-serif text-h2 text-ink">How to compare AI visibility across markets and languages</h2>
          <p className="mt-6 text-base leading-relaxed text-muted">Agree the business location, search location and question language separately. A Russian-language question about a Bali hotel is not automatically a search from Russia. If a system cannot verify the search location, record that limitation.</p>
          <p className="mt-4 text-base leading-relaxed text-muted">Keep the same questions, systems, channel and repeat count for a recheck. Save the date, full answers and source links. Report missing or failed runs separately; one answer is not evidence of a stable trend or an effect caused by a website edit.</p>
          <p className="mt-4 text-base leading-relaxed text-muted">For restaurant, hotel, spa and beach club audits, guest questions test the venue’s discovery. Questions from business owners looking for an audit test the service provider’s discovery. Keep these two prompt sets separate.</p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Button href="/check">Start with a free website check</Button>
            <Button href="/visibility" variant="secondary">Review AI Visibility scope</Button>
          </div>
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
