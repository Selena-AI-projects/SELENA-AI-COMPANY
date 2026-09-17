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
import { Button } from "@/components/ui/Button";
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

      <section className="bg-ivory py-12 sm:py-16">
        <Container size="narrow">
          <h2 className="font-serif text-h2 text-ink">Как сравнивать AI-видимость по рынкам и языкам</h2>
          <p className="mt-6 text-base leading-relaxed text-muted">Отдельно согласуйте страну бизнеса, географию поиска и язык вопроса. Вопрос на русском об отеле на Бали не означает поиск из России. Если система не позволяет подтвердить географию поиска, это ограничение нужно указать.</p>
          <p className="mt-4 text-base leading-relaxed text-muted">При повторной проверке сохраняйте вопросы, системы, канал и число повторов. Фиксируйте дату, полные ответы и ссылки на источники. Отсутствующие ответы и ошибки учитывайте отдельно: один ответ не доказывает устойчивый тренд или эффект правки сайта.</p>
          <p className="mt-4 text-base leading-relaxed text-muted">В аудите ресторана, отеля, спа или beach club вопросы гостей проверяют видимость заведения. Вопросы владельцев, которые ищут аудит, проверяют видимость поставщика услуги. Это два отдельных набора вопросов.</p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Button href="/ru/check">Начать с бесплатной проверки сайта</Button>
            <Button href="/ru/visibility" variant="secondary">Изучить условия AI Visibility</Button>
          </div>
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
