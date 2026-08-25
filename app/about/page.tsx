import { buildMetadata } from "@/lib/metadata";
import { coreLoop, trust, process } from "@/lib/data/content";
import { PageHero } from "@/components/sections/PageHero";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { FounderPortrait } from "@/components/ui/FounderPortrait";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildAboutStructuredData } from "@/lib/structured-data";
import { cta } from "@/lib/site";

export const metadata = buildMetadata({
  title: "О Selena Systems",
  description:
    "Selena Systems помогает русскоязычному бизнесу внедрять AI: сначала процесс, потом инструмент, честные границы и без выдуманных обещаний.",
  path: "/about",
  locale: "ru_RU",
  languages: {
    "x-default": "/en/about",
    en: "/en/about",
    ru: "/about",
  },
});

// ВАЖНО (контракт docs/12): на этой странице только позиционирование,
// подход и принципы. Никаких выдуманных фактов биографии, лет опыта,
// количества клиентов, регалий и образования.

const focusAreas = [
  "Контент и упаковка: системный выпуск вместо рывков",
  "Заявки и клиентские коммуникации: порядок вместо потерянных чатов",
  "Автоматизация рутины: связки CRM, Notion, Telegram/WhatsApp, Make/Zapier",
  "Обучение: владелец и команда работают с AI одинаково и по делу",
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={buildAboutStructuredData("ru")} />
      <PageHero
        eyebrow="Обо мне"
        title="Помогаю бизнесу внедрять AI спокойно и по делу"
        intro="Selena Systems — это практическое внедрение AI для предпринимателей, экспертов и небольших команд: диагностика, автоматизация, обучение и сопровождение. Без хайпа и обещаний магии."
      >
        <Button href={cta.primary.href} size="lg">
          {cta.primary.label}
        </Button>
      </PageHero>

      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <Reveal delay={100}>
              <FounderPortrait locale="ru" />
            </Reveal>
            <div>
              <SectionHeader
                eyebrow="Чем занимаюсь"
                headline="Превращаю хаотичные AI-эксперименты в рабочие процессы"
                intro="Большинству бизнесов не нужна «стратегия внедрения нейросетей». Нужно, чтобы контент выходил, заявки не терялись, а команда не изобретала промпты заново каждый день. Этим я и занимаюсь."
              />
              <Reveal delay={150}>
                <ul className="mt-8 space-y-3">
                  {focusAreas.map((area) => (
                    <li
                      key={area}
                      className="flex gap-3 rounded-xl border border-line bg-surface px-5 py-4 leading-relaxed text-ink/85"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-copper"
                      />
                      {area}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-line bg-surface py-20 sm:py-28">
        <Container>
          <SectionHeader
            eyebrow="Подход"
            headline={coreLoop.headline}
            intro={coreLoop.intro}
          />
          <ol className="mt-12 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {coreLoop.steps.map((step, i) => (
              <Reveal as="li" key={step.n} delay={i * 60}>
                <div className="flex gap-4">
                  <span className="font-serif text-xl font-semibold text-copper-deep">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-ink">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{step.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeader
            eyebrow="Принципы"
            headline="На чём строится доверие"
            intro="Эти принципы — не маркетинг, а рабочие правила. Они одинаковы для всех задач и всех клиентов."
          />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trust.cards.map((card, i) => (
              <Reveal as="li" key={card.title} delay={(i % 3) * 80} className="h-full">
                <div className="h-full border-t-2 border-sage/60 pt-5">
                  <h3 className="text-lg font-semibold text-ink">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{card.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-y border-line bg-surface py-20 sm:py-28">
        <Container>
          <SectionHeader
            eyebrow="Как я работаю"
            headline="Коротко о процессе"
            intro="Полный путь — от брифа до сопровождения — выглядит так."
          />
          <Reveal className="mt-10">
            <ol className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {process.steps.map((step, i) => (
                <li key={step.n} className="flex items-center gap-3">
                  <span className="rounded-full border border-line bg-ivory px-4 py-2 text-sm font-medium text-ink">
                    {step.title}
                  </span>
                  {i < process.steps.length - 1 ? (
                    <span aria-hidden="true" className="text-copper">
                      →
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      </section>

      <FinalCTA />
    </>
  );
}
