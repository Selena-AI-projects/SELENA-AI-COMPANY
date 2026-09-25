import { buildMetadata } from "@/lib/metadata";
import { buildServicePageStructuredData } from "@/lib/structured-data";
import { getService } from "@/lib/data/services";
import { JsonLd } from "@/components/seo/JsonLd";
import { cta } from "@/lib/site";
import { faq } from "@/lib/data/faq";
import { PageHero } from "@/components/sections/PageHero";
import { FAQSection } from "@/components/sections/FAQSection";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export const metadata = buildMetadata({
  title: "AI-контент-система и упаковка",
  description:
    "Соберите AI-контент-систему: один экспертный материал превращается в форматы по шаблонам, а финальную редактуру сохраняет человек.",
  path: "/ai-content",
});

const pains = [
  "Идеи копятся в заметках, но до публикаций не доходят",
  "Контент выходит рывками — то густо, то месяц тишины",
  "Каждый пост пишется с нуля, силы уходят на рутину, а не на смысл",
];

const deliverables = [
  {
    title: "Система «1 материал → форматы»",
    result: "Один материал — все форматы",
    text: "Один экспертный материал раскладывается на посты, статьи, сценарии и рассылки — по понятной схеме, а не по вдохновению.",
  },
  {
    title: "Шаблоны и промпты под ваш стиль",
    result: "Черновики вашим голосом",
    text: "AI пишет черновики вашим голосом: структура, тон и темы настраиваются под вас, а не наоборот.",
  },
  {
    title: "Процесс с редактурой",
    result: "Ничего не выходит без проверки человеком",
    text: "Черновик готовит AI — смысл и финальную форму утверждает человек. Публичный контент без ручной проверки не выходит.",
  },
  {
    title: "Упаковка продукта и смыслов",
    result: "Понятный оффер и описания услуг",
    text: "Структура оффера, описания услуг и страниц: AI ускоряет черновики, финальные формулировки остаются вашими.",
  },
];

const forWhom = [
  {
    title: "Эксперты и личные бренды",
    text: "Контент и упаковка — постоянная нагрузка рядом с основной работой.",
  },
  {
    title: "Сервисный бизнес",
    text: "Нужен регулярный поток публикаций и понятные описания услуг.",
  },
  {
    title: "Небольшие команды",
    text: "Контент делают разные люди — нужен один стиль и одна система.",
  },
];

const steps = [
  {
    n: "01",
    title: "Разбор тем и форматов",
    text: "Смотрим, о чём вы говорите, где публикуетесь и что отнимает больше всего сил.",
  },
  {
    n: "02",
    title: "Структура системы",
    text: "Проектируем путь материала: от идеи до всех форматов и каналов.",
  },
  {
    n: "03",
    title: "Шаблоны и промпты",
    text: "Собираем библиотеку под ваш стиль и настраиваем рабочий процесс.",
  },
  {
    n: "04",
    title: "Запуск с редактурой",
    text: "Первые циклы проходим вместе: черновики AI, ваша редактура, публикация.",
  },
];

// Вопросы, релевантные контенту и упаковке (см. lib/data/faq.ts).
const contentFaq = [faq[0], faq[4], faq[5], faq[6]];

export default function AiContentPage() {
  const service = getService("content")!;

  return (
    <>
      <JsonLd data={buildServicePageStructuredData(service)} />
      <PageHero
        eyebrow="Контент"
        title="Контент-система и AI-упаковка"
        intro="Чтобы контент выходил регулярно, а упаковка отражала уровень эксперта — без выгорания и написания всего с нуля."
      >
        <div className="flex flex-wrap gap-4">
          <Button href={cta.primary.href} size="lg">
            Собрать контент-систему
          </Button>
          <Button href="/ru#ai-systems" size="lg" variant="secondary">
            Все услуги
          </Button>
        </div>
      </PageHero>

      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeader
            eyebrow="Проблема"
            headline="Контент рывками — это не лень, это отсутствие системы"
          />
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {pains.map((pain, i) => (
              <Reveal as="li" key={pain} delay={i * 80} className="h-full">
                <div
                  className="h-full rounded-xl border border-line bg-surface/80 px-5 py-4 text-base leading-relaxed text-muted shadow-sm"
                  style={{ transform: `rotate(${((i % 2) * 2 - 1) * 0.5}deg)` }}
                >
                  {pain}
                </div>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-y border-line bg-surface py-20 sm:py-28">
        <Container>
          <SectionHeader
            eyebrow="Что собираем"
            headline="Система, в которой контент — процесс, а не подвиг"
            intro="Четыре части одной системы. Что именно нужно вам — станет ясно после брифа."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {deliverables.map((item, i) => (
              <Reveal key={item.title} delay={(i % 2) * 80} className="h-full">
                <div className="card-premium h-full bg-ivory p-6 sm:p-7">
                  <h3 className="text-h3 text-ink">{item.title}</h3>
                  <p className="mt-2 text-lg font-semibold leading-snug text-rose">{item.result}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeader eyebrow="Для кого" headline="Кому это подходит" />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {forWhom.map((item, i) => (
              <Reveal key={item.title} delay={i * 80} className="h-full">
                <Card className="h-full">
                  <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">{item.text}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-line bg-surface py-20 sm:py-28">
        <Container>
          <SectionHeader eyebrow="Этапы" headline="Как собирается система" />
          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <Reveal as="li" key={step.n} delay={i * 80} className="h-full">
                <div className="h-full border-t-2 border-copper/50 pt-5">
                  <span className="font-serif text-2xl font-semibold text-copper-deep">
                    {step.n}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <FAQSection items={contentFaq} />
      <FinalCTA />
    </>
  );
}
