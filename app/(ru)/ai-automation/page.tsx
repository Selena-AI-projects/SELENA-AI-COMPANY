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
import { Badge } from "@/components/ui/Badge";
import { CinemaFrame } from "@/components/ui/CinemaFrame";
import { pageCinema } from "@/lib/data/page-cinema";

const cinema = pageCinema("ru").automation;

export const metadata = buildMetadata({
  title: "AI-автоматизация",
  description:
    "Автоматизируйте заявки, коммуникации, CRM и повторяющиеся задачи с AI-сценариями, понятными правилами и проверкой человека.",
  path: "/ai-automation",
});

const automatable = [
  {
    title: "Заявки и обращения",
    result: "Ни одна заявка не теряется",
    text: "Обращение фиксируется автоматически, ничего не теряется в чатах и личных сообщениях.",
  },
  {
    title: "Клиентские коммуникации",
    result: "Ответ готов — человек только проверяет",
    text: "Черновики ответов на типовые вопросы — человек проверяет и отправляет.",
  },
  {
    title: "CRM, Notion и таблицы",
    result: "Без ручной копипасты",
    text: "Данные переносятся между инструментами сами, без ручной копипасты.",
  },
  {
    title: "Telegram / WhatsApp",
    result: "Команда узнаёт сразу",
    text: "Уведомления команде, сценарии ответов, передача диалога человеку.",
  },
  {
    title: "Сценарии на Make / Zapier",
    result: "Связки, которые остаются вашими",
    text: "Связки без сложного кода под ваш процесс — понятные, задокументированные, ваши.",
  },
  {
    title: "Рутинные документы",
    result: "Черновик по шаблону, а не с нуля",
    text: "Черновики типовых описаний и текстов по шаблонам — с финальной редактурой человеком.",
  },
];

const flowSteps = ["Заявка", "CRM", "Telegram", "Черновик ответа"];

const workSteps = [
  {
    n: "01",
    title: "Диагностика рутины",
    text: "Находим действия, которые повторяются каждый день и съедают время.",
  },
  {
    n: "02",
    title: "Сценарий",
    text: "Проектируем, что делает человек, что AI и что автоматизация — с границами.",
  },
  {
    n: "03",
    title: "Сборка и тест",
    text: "Собираем связку, прогоняем на реальных примерах, чиним узкие места.",
  },
  {
    n: "04",
    title: "Передача и обучение",
    text: "Система остаётся у вас: доступы, инструкции и обученная команда.",
  },
];

// Вопросы, релевантные автоматизации (см. lib/data/faq.ts).
const automationFaq = [faq[1], faq[2], faq[3], faq[6]];

export default function AiAutomationPage() {
  const service = getService("automation")!;

  return (
    <>
      <JsonLd data={buildServicePageStructuredData(service)} />
      <PageHero
        eyebrow="Автоматизация"
        title="AI-автоматизация без сложного кода"
        intro="Собираю связки без сложного кода, которые убирают ручную рутину из заявок, коммуникаций и данных — на Make, Zapier, Telegram/WhatsApp, CRM и Notion."
        media={{
          video: { src: cinema.hero.video, poster: cinema.hero.poster },
          alt: cinema.hero.alt,
        }}
      >
        <div className="flex flex-wrap gap-4">
          <Button href={cta.primary.href} size="lg">
            Хочу автоматизацию
          </Button>
          <Button href="/ru#ai-systems" size="lg" variant="secondary">
            Все услуги
          </Button>
        </div>
      </PageHero>

      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeader
            eyebrow="Что автоматизируем"
            headline="Рутина, которую не должен делать человек"
            intro="Каждый пункт — типовая зона, где ручную работу можно передать связке «автоматизация + AI + проверка человеком»."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {automatable.map((item, i) => (
              <Reveal key={item.title} delay={(i % 3) * 80} className="h-full">
                <Card className="h-full">
                  <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 text-lg font-semibold leading-snug text-rose">{item.result}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-line bg-surface py-20 sm:py-28">
        <Container>
          <SectionHeader
            eyebrow="Пример возможного решения"
            headline="Как выглядит одна связка"
            intro="Типовой сценарий обработки заявки — не кейс клиента, а схема, которая настраивается под ваш процесс."
          />
          <Reveal className="mt-12">
            <CinemaFrame tone="light" image={cinema.flow.image} alt={cinema.flow.alt} caption={cinema.flow.caption} />
          </Reveal>
          <Reveal className="mt-8">
            <div className="card-premium bg-ivory p-6 sm:p-10">
              <ol className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
                {flowSteps.map((step, i) => (
                  <li key={step} className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="card-premium w-full px-5 py-4 text-center">
                      <span className="font-serif text-lg font-semibold text-ink">
                        {step}
                      </span>
                    </div>
                    {i < flowSteps.length - 1 ? (
                      <span
                        aria-hidden="true"
                        className="rotate-90 self-center font-serif text-xl text-copper lg:rotate-0"
                      >
                        →
                      </span>
                    ) : null}
                  </li>
                ))}
              </ol>
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
                <Badge tone="sage">Проверка человеком</Badge>
                <p className="text-sm leading-relaxed text-muted">
                  Черновик ответа готовит AI, но проверяет и отправляет человек.
                  Клиент никогда не остаётся один на один с ботом в сложной
                  ситуации.
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeader eyebrow="Этапы работ" headline="От рутины до работающей связки" />
          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {workSteps.map((step, i) => (
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

          <Reveal className="mt-14">
            <div className="card-premium max-w-3xl border-l-2 border-l-sage p-6 sm:p-8">
              <h3 className="text-xl font-semibold text-ink">
                Не всё стоит автоматизировать
              </h3>
              <p className="mt-3 leading-relaxed text-muted">
                Сложные переговоры, чувствительные коммуникации и редкие задачи
                часто дешевле и надёжнее делать руками. Если автоматизация не
                окупает себя — я скажу об этом прямо на этапе диагностики.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      <FAQSection items={automationFaq} />
      <FinalCTA />
    </>
  );
}
