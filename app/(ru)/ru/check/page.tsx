import { buildMetadata } from "@/lib/metadata";
import { buildPublicReadinessStructuredData } from "@/lib/structured-data";
import { visibilityContentRu } from "@/lib/visibility/content.ru";
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

const content = visibilityContentRu;
const cinema = pageCinema("ru").check;

export const metadata = buildMetadata({
  title: "Бесплатная проверка готовности сайта к AI-поиску",
  description:
    "Проверьте доступность сайта, сигналы индексируемости, структурированные данные и ясность информации о бизнесе. Доказательства и исправления без регистрации; AI-рекомендации отдельно.",
  path: "/ru/check",
  locale: "ru_RU",
  languages: visibilityLanguages("check"),
});

export default function RussianCheckPage() {
  return (
    <>
      <JsonLd data={buildPublicReadinessStructuredData("ru")} />
      <PageHero
        eyebrow="Бесплатная проверка сайта"
        title={content.checkForm.title}
        intro={content.checkForm.intro}
        media={{
          video: { src: cinema.hero.video, poster: cinema.hero.poster },
          alt: cinema.hero.alt,
        }}
      />

      <PromotionBanner locale="ru" />

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
            <Reveal>
              <CinemaFrame tone="light" image={cinema.boundary.image} alt={cinema.boundary.alt} caption={cinema.boundary.caption} />
            </Reveal>
            <MeasurementBoundary content={content.freeMeasurementBoundary} />
            <div className="border-t border-line pt-8">
              <h2 className="font-serif text-h3 text-ink">Рекомендуют ли нейросети ваш бизнес? Это отдельная проверка.</h2>
              <p className="mt-4 text-base leading-relaxed text-muted">Для владельцев ресторанов, отелей, спа и beach clubs готовность сайта — первый шаг. AI Visibility исследует ответы на вопросы гостей, конкурентов и источники. Мониторинг находится в раннем доступе: изучите условия перед заявкой.</p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Button href="/ru/visibility">Посмотреть AI Visibility и варианты аудита</Button>
                <Button href="/ru/methodology" variant="secondary">Как устроено измерение</Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
