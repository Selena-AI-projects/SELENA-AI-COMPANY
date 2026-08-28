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
  title: "AI-обучение для команд",
  description:
    "Практическое AI-обучение для предпринимателей, экспертов и команд: рабочие сценарии, промпты и инструкции на ваших задачах.",
  path: "/ai-training",
});

const forWhom = [
  {
    title: "Владелец или эксперт",
    text: "Вы сами ведёте контент, заявки и переписку — и хотите, чтобы AI снимал рутину системно, а не от случая к случаю.",
  },
  {
    title: "Команда",
    text: "Каждый использует AI по-своему и получает разный результат. Нужны общие сценарии, промпты и стандарты качества.",
  },
];

const included = [
  {
    title: "Практические сессии",
    text: "Разбираем ваши реальные задачи: контент, обращения клиентов, документы, рутину — и решаем их вместе с AI.",
  },
  {
    title: "Библиотека промптов",
    text: "Проверенные промпты под ваши процессы и ваш стиль — чтобы результат был предсказуемым у всех.",
  },
  {
    title: "Инструкции для команды",
    text: "Понятные регламенты: что делает AI, что проверяет человек, где границы применения.",
  },
  {
    title: "Форматы под вас",
    text: "Индивидуально с владельцем или сессии с командой — формат подбирается после брифа.",
  },
];

const trainingSteps = [
  {
    n: "01",
    title: "Разбор задач",
    text: "Смотрим, какие задачи повторяются и где AI даст эффект быстрее всего.",
  },
  {
    n: "02",
    title: "Программа под процессы",
    text: "Составляем программу на ваших сценариях — без абстрактных примеров.",
  },
  {
    n: "03",
    title: "Практика",
    text: "Работаем на реальных материалах: пишем, отвечаем, структурируем — сразу в ваших инструментах.",
  },
  {
    n: "04",
    title: "Материалы и поддержка",
    text: "Остаются промпты, инструкции и записи. Отвечаю на вопросы, пока навык закрепляется.",
  },
];

// Вопросы, релевантные обучению (см. lib/data/faq.ts).
const trainingFaq = [faq[0], faq[3], faq[6], faq[7]];

export default function AiTrainingPage() {
  const service = getService("training")!;

  return (
    <>
      <JsonLd data={buildServicePageStructuredData(service)} />
      <PageHero
        eyebrow="Обучение"
        title="AI-обучение на ваших реальных задачах"
        intro="Не курс «про нейросети», а практика: владелец и команда учатся применять AI в собственных процессах — контенте, коммуникациях и рутине."
      >
        <div className="flex flex-wrap gap-4">
          <Button href={cta.primary.href} size="lg">
            Хочу обучение
          </Button>
          <Button href="/ru#ai-systems" size="lg" variant="secondary">
            Все услуги
          </Button>
        </div>
      </PageHero>

      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeader
            eyebrow="Для кого"
            headline="Два сценария, где обучение окупается"
            intro="Обучение имеет смысл, когда AI уже пробовали — но результат нестабильный и держится на энтузиазме."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {forWhom.map((item, i) => (
              <Reveal key={item.title} delay={i * 80} className="h-full">
                <Card className="h-full">
                  <h3 className="text-h3 text-ink">{item.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted">{item.text}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-line bg-surface py-20 sm:py-28">
        <Container>
          <SectionHeader
            eyebrow="Что входит"
            headline="Не лекции, а рабочая система"
            intro="После обучения у вас остаются не конспекты, а промпты, инструкции и привычка решать задачи с AI."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {included.map((item, i) => (
              <Reveal key={item.title} delay={i * 80} className="h-full">
                <div className="card-premium h-full bg-ivory p-6 sm:p-7">
                  <h3 className="text-h3 text-ink">{item.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeader
            eyebrow="Как проходит"
            headline="Четыре шага — от разбора до закрепления"
          />
          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trainingSteps.map((step, i) => (
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
            <div className="card-premium max-w-3xl border-l-2 border-l-copper p-6 sm:p-8">
              <h3 className="text-xl font-semibold text-ink">
                Честно о результате
              </h3>
              <p className="mt-3 leading-relaxed text-muted">
                Результат обучения — умение применять AI в своих задачах: быстрее
                готовить контент, обрабатывать обращения, наводить порядок в
                знаниях. Обещаний быстрого дохода и гарантий по выручке здесь
                нет — это не то, что может дать обучение.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      <FAQSection items={trainingFaq} />
      <FinalCTA />
    </>
  );
}
