import Link from "next/link";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { aiCodeCrossReviewArticle } from "@/lib/school/ai-code-cross-review";

const entries = [
  {
    label: "Личный опыт · 12 минут",
    title: aiCodeCrossReviewArticle.title,
    description: aiCodeCrossReviewArticle.description,
    href: aiCodeCrossReviewArticle.path,
  },
  {
    label: "Статья · 6 минут",
    title: "Что такое AI Visibility",
    description: "Практическое определение AI-видимости, её отличие от готовности сайта, реального измерения и границ интерпретации.",
    href: "/ru/lab/articles/what-is-ai-visibility",
  },
] as const;

export function BlogLandingPage() {
  return (
    <>
      <PageHero
        eyebrow="Selena Lab · Блог"
        title="Практический опыт, статьи и обновления Selena Systems"
        intro="Здесь собраны личный опыт, разборы AI-инструментов, материалы об AI Visibility и короткие выводы, которые можно применить в работе."
      >
        <Link href="/ru/lab" className="inline-flex min-h-11 items-center font-medium text-link underline decoration-link/45 underline-offset-4">
          ← Вернуться в Selena Lab
        </Link>
      </PageHero>

      <section className="bg-surface py-16 sm:py-24" aria-labelledby="blog-materials">
        <Container size="wide">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-deep">Опубликовано</p>
            <h2 id="blog-materials" className="mt-5 text-h2 text-ink">Материалы блога</h2>
          </Reveal>
          <div className="mt-9 border-y border-line">
            {entries.map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                className="group grid gap-4 border-b border-line py-8 last:border-b-0 sm:grid-cols-[10rem_1fr_auto] sm:items-start"
              >
                <p className="text-sm font-semibold text-copper-deep">{entry.label}</p>
                <div>
                  <h3 className="font-serif text-2xl font-semibold text-ink transition-colors group-hover:text-copper-deep sm:text-3xl">
                    {entry.title}
                  </h3>
                  <p className="mt-3 max-w-3xl leading-7 text-muted">{entry.description}</p>
                </div>
                <span className="text-sm text-muted sm:text-right">Читать <span aria-hidden>→</span></span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-ivory py-16 sm:py-20">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-deep">Связанный эксперимент</p>
          <h2 className="mt-4 font-serif text-3xl font-semibold text-ink">Как два AI-агента ошиблись при проверке одного изменения</h2>
          <p className="mt-4 max-w-3xl leading-7 text-muted">
            Эксперимент остаётся в исследовательской части Selena Lab: там опубликованы условия, воспроизводимые шаги, наблюдаемый результат и ограничения вывода.
          </p>
          <Link href="/ru/lab/experiments/two-agent-code-review" className="mt-5 inline-flex min-h-11 items-center font-medium text-link underline decoration-link/45 underline-offset-4">
            Открыть эксперимент <span className="ml-2" aria-hidden>→</span>
          </Link>
        </Container>
      </section>
    </>
  );
}
