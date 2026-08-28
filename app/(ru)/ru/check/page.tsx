import { buildMetadata } from "@/lib/metadata";
import { buildPublicReadinessStructuredData } from "@/lib/structured-data";
import { visibilityContentRu } from "@/lib/visibility/content.ru";
import { visibilityLanguages } from "@/lib/visibility/routes";
import { PageHero } from "@/components/sections/PageHero";
import { VisibilityCheckForm } from "@/components/visibility/VisibilityCheckForm";
import { MeasurementBoundary } from "@/components/visibility/MeasurementBoundary";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";

const content = visibilityContentRu;

export const metadata = buildMetadata({
  title: "Бесплатная Public Readiness",
  description:
    "Укажите адрес сайта и увидьте, что машинные читатели находят, понимают и могут использовать, с evidence проблем и первым исправлением. Бесплатно.",
  path: "/ru/check",
  locale: "ru_RU",
  languages: visibilityLanguages("check"),
});

export default function RussianCheckPage() {
  return (
    <>
      <JsonLd data={buildPublicReadinessStructuredData("ru")} />
      <PageHero
        eyebrow="Бесплатная Public Readiness"
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
                locale="ru"
              />
            </Reveal>
            <MeasurementBoundary content={content.freeMeasurementBoundary} />
          </div>
        </Container>
      </section>
    </>
  );
}
