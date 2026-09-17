import { buildMetadata } from "@/lib/metadata";
import { buildPublicReadinessStructuredData } from "@/lib/structured-data";
import { visibilityContentEn } from "@/lib/visibility/content.en";
import { visibilityLanguages } from "@/lib/visibility/routes";
import { PageHero } from "@/components/sections/PageHero";
import { PromotionBanner } from "@/components/visibility/PromotionBanner";
import { VisibilityCheckForm } from "@/components/visibility/VisibilityCheckForm";
import { MeasurementBoundary } from "@/components/visibility/MeasurementBoundary";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CinemaFrame } from "@/components/ui/CinemaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageCinema } from "@/lib/data/page-cinema";

const content = visibilityContentEn;
const cinema = pageCinema("en").check;

export const metadata = buildMetadata({
  title: "Free AI Readiness Check for Your Website",
  description:
    "Check public website access, indexability, structured data and business clarity. Get evidence and fixes without login. AI recommendations are measured separately.",
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
        eyebrow="Free website check"
        title={content.checkForm.title}
        intro={content.checkForm.intro}
        media={{
          video: { src: cinema.hero.video, poster: cinema.hero.poster },
          alt: cinema.hero.alt,
        }}
      />

      <PromotionBanner locale="en" />

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
            <Reveal>
              <CinemaFrame tone="light" image={cinema.boundary.image} alt={cinema.boundary.alt} caption={cinema.boundary.caption} />
            </Reveal>
            <MeasurementBoundary content={content.freeMeasurementBoundary} />
            <div className="border-t border-line pt-8">
              <h2 className="font-serif text-h3 text-ink">Does AI recommend your business? That needs a separate check.</h2>
              <p className="mt-4 text-base leading-relaxed text-muted">For restaurant, hotel, spa and beach club owners: website readiness is the starting point. AI Visibility investigates answers to guest questions, competing businesses and cited sources. Monitoring is in early access; review the scope before requesting it.</p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Button href="/visibility">Explore AI Visibility and audit options</Button>
                <Button href="/methodology" variant="secondary">See how measurement works</Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
      </div>
    </>
  );
}
