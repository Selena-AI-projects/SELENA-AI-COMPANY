import { DiscoveryOrderSections } from "@/components/visibility/DiscoverySales";
import { buildMetadata } from "@/lib/metadata";
import { buildAiVisibilityStructuredData } from "@/lib/structured-data";
import { visibilityContentRu } from "@/lib/visibility/content.ru";
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
import { VerificationCycleSection } from "@/components/visibility/VerificationCycleSection";
import { getSampleReport } from "@/lib/visibility/sample-report-data";
import { JournalTeaser } from "@/components/visibility/JournalTeaser";
import { FAQSection } from "@/components/sections/FAQSection";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CinemaFrame } from "@/components/ui/CinemaFrame";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageCinema } from "@/lib/data/page-cinema";

const content = visibilityContentRu;
const cinema = pageCinema("ru").visibility;

export const metadata = buildMetadata({
  title: "AI Visibility для бизнеса",
  description:
    "AI Visibility от Selena Systems показывает, как AI находит и представляет ваш бизнес: готовность сайта, рекомендации, доказательства и готовность к действию.",
  path: "/ru/visibility",
  locale: "ru_RU",
  languages: visibilityLanguages("visibility"),
});

export default function RussianVisibilityPage() {
  return (
    <>
      <JsonLd data={buildAiVisibilityStructuredData("ru")} />
      <VisibilityHero
        locale="ru"
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        intro={content.hero.intro}
        answers={content.hero.answers}
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
          <MeasurementBoundary content={content.measurementBoundary} locale="ru" />
        </Container>
      </section>

      <ActionReadinessSection content={content.actionReadiness} locale="ru" />

      <section className="bg-surface pb-20 sm:pb-28">
        <Container>
          <Reveal>
            <CinemaFrame tone="light" image={cinema.readiness.image} alt={cinema.readiness.alt} caption={cinema.readiness.caption} />
          </Reveal>
        </Container>
      </section>

      <LocalBusinessModeSection content={content.localBusinessMode} locale="ru" />

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

      <VerificationCycleSection content={content.verificationCycle} sample={getSampleReport("ru").verificationLoop} />

      <JournalTeaser />

      <NotClaimedSection content={content.notClaimed} />

      <FAQSection items={content.faq} />
      <DiscoveryOrderSections locale="ru" />

      <section className="bg-charcoal py-20 text-ivory sm:py-28">
        <Container size="narrow">
          <Reveal className="text-center">
            <h2 className="text-h2 text-ivory">{content.homeTeaser.headline}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ivory/75">
              {content.cta.compareNote}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button href={visibilityRoutes.ru.check} size="lg" variant="onDark">
                {content.cta.primary.label}
              </Button>
              <Button href={content.cta.secondary.href} size="lg" variant="secondary">
                {content.cta.secondary.label}
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
