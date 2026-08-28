import { buildMetadata } from "@/lib/metadata";
import { visibilityContentRu } from "@/lib/visibility/content.ru";
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

const content = visibilityContentRu;

export const metadata = buildMetadata({
  title: "Методология AI Visibility",
  description:
    "Как AI Visibility измеряет публичную готовность и AI-ответы: типы доказательств, версионирование, размер выборки и то, чего балл не доказывает.",
  path: "/ru/methodology",
  locale: "ru_RU",
  languages: visibilityLanguages("methodology"),
});

export default function RussianMethodologyPage() {
  return (
    <>
      <JsonLd data={buildMethodologyStructuredData("ru")} />
      <PageHero
        eyebrow="Методология"
        title="Сначала доказательства. Каждый результат показывает, что проверено, когда и чего он не доказывает."
        intro="Эта страница — контракт честности за каждым отчётом AI Visibility."
      />

      <section className="bg-ivory pb-4 sm:pb-8">
        <Container size="narrow">
          <MeasurementBoundary content={content.measurementBoundary} />
        </Container>
      </section>

      <MetricDefinitionGrid
        eyebrow="Определения метрик"
        headline="Что означает каждая цифра."
        metrics={content.metrics}
      />

      <MeasurementLayers content={content.measurementLayers} background="surface" />

      <ActionReadinessSection content={content.actionReadiness} />

      <LocalBusinessModeSection content={content.localBusinessMode} />

      <MethodologySummary content={content.methodology} />

      <NotClaimedSection content={content.notClaimed} />
    </>
  );
}
