import { buildMetadata } from "@/lib/metadata";
import { buildPublicReadinessStructuredData } from "@/lib/structured-data";
import { visibilityContentEn } from "@/lib/visibility/content.en";
import { visibilityLanguages } from "@/lib/visibility/routes";
import { PageHero } from "@/components/sections/PageHero";
import { VisibilityCheckForm } from "@/components/visibility/VisibilityCheckForm";
import { MeasurementBoundary } from "@/components/visibility/MeasurementBoundary";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";

const content = visibilityContentEn;

export const metadata = buildMetadata({
  title: "Website Public Readiness — free check",
  description:
    "Check what machine readers can find, understand and reuse on your site, see evidence for the gaps, and get the first fix. Free, no login.",
  path: "/check",
  locale: "en_US",
  languages: visibilityLanguages("check"),
});

export default function CheckPage() {
  return (
    <>
      <JsonLd data={buildPublicReadinessStructuredData("en")} />
      <div lang="en">
      <PageHero
        eyebrow="Free Public Readiness"
        title={content.checkForm.title}
        intro={content.checkForm.intro}
      />

      <section className="bg-ivory pb-20 sm:pb-28">
        <Container size="narrow">
          <div className="grid gap-10">
            <Reveal>
              <VisibilityCheckForm
                copy={content.checkForm}
                reportCopy={content.liveReport}
                locale="en"
              />
            </Reveal>
            <MeasurementBoundary content={content.freeMeasurementBoundary} />
          </div>
        </Container>
      </section>
      </div>
    </>
  );
}
