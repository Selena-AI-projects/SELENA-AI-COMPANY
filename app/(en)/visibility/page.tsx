import { buildMetadata } from "@/lib/metadata";
import { buildAiVisibilityStructuredData } from "@/lib/structured-data";
import { visibilityContentEn } from "@/lib/visibility/content.en";
import { visibilityLanguages, visibilityRoutes } from "@/lib/visibility/routes";
import { VisibilityHero } from "@/components/visibility/VisibilityHero";
import { MeasurementLayers } from "@/components/visibility/MeasurementLayers";
import {
  ActionReadinessSection,
  LocalBusinessModeSection,
  NotClaimedSection,
} from "@/components/visibility/ActionReadinessSection";
import { MeasurementBoundary } from "@/components/visibility/MeasurementBoundary";
import { ProductPath } from "@/components/visibility/ProductPath";
import { FAQSection } from "@/components/sections/FAQSection";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CinemaFrame } from "@/components/ui/CinemaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageCinema } from "@/lib/data/page-cinema";

const content = visibilityContentEn;
const cinema = pageCinema("en").visibility;

export const metadata = buildMetadata({
  title: "AI Visibility for your business",
  description:
    "Measure how AI finds and represents your business across readiness, recommendations, evidence and action readiness — with transparent methodology.",
  path: "/visibility",
  locale: "en_US",
  languages: visibilityLanguages("visibility"),
});

export default function VisibilityPage() {
  return (
    <>
      <JsonLd data={buildAiVisibilityStructuredData("en")} />
      <div lang="en">
      <VisibilityHero
        locale="en"
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        intro={content.hero.intro}
        primaryCta={content.cta.primary}
        secondaryCta={content.cta.secondary}
        backdrop={cinema.hero}
      />

      <MeasurementLayers content={content.measurementLayers} />

      <section className="bg-ivory pb-20 sm:pb-28">
        <Container>
          <Reveal>
            <CinemaFrame tone="light" image={cinema.layers.image} alt={cinema.layers.alt} caption={cinema.layers.caption} />
          </Reveal>
        </Container>
      </section>

      <section className="bg-surface pb-20 sm:pb-28 pt-20 sm:pt-28">
        <Container size="narrow">
          <Reveal className="mb-10">
            <CinemaFrame tone="light" image={cinema.boundary.image} alt={cinema.boundary.alt} caption={cinema.boundary.caption} />
          </Reveal>
          <MeasurementBoundary content={content.measurementBoundary} />
        </Container>
      </section>

      <ActionReadinessSection content={content.actionReadiness} />

      <section className="bg-surface pb-20 sm:pb-28">
        <Container>
          <Reveal>
            <CinemaFrame tone="light" image={cinema.readiness.image} alt={cinema.readiness.alt} caption={cinema.readiness.caption} />
          </Reveal>
        </Container>
      </section>

      <LocalBusinessModeSection content={content.localBusinessMode} />

      <section className="bg-ivory pb-20 sm:pb-28">
        <Container size="narrow">
          <Reveal>
            <CinemaFrame tone="light" image={cinema.local.image} alt={cinema.local.alt} caption={cinema.local.caption} aspect="aspect-[16/9]" />
          </Reveal>
        </Container>
      </section>

      <ProductPath
        eyebrow={content.productPath.eyebrow}
        headline={content.productPath.headline}
        intro={content.productPath.intro}
        steps={content.productPath.steps}
      />

      <section className="bg-surface pb-20 sm:pb-28">
        <Container>
          <Reveal>
            <CinemaFrame tone="light" image={cinema.path.image} alt={cinema.path.alt} caption={cinema.path.caption} />
          </Reveal>
        </Container>
      </section>

      <NotClaimedSection content={content.notClaimed} />

      <FAQSection items={content.faq} headline="Frequently asked questions" />

      <section className="bg-charcoal py-20 text-ivory sm:py-28">
        <Container size="narrow">
          <Reveal className="text-center">
            <h2 className="text-h2 text-ivory">{content.homeTeaser.headline}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ivory/75">
              {content.cta.compareNote}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button href={visibilityRoutes.en.check} size="lg" variant="onDark">
                {content.cta.primary.label}
              </Button>
              <Button href={content.cta.secondary.href} size="lg" variant="secondary">
                {content.cta.secondary.label}
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
      </div>
    </>
  );
}
