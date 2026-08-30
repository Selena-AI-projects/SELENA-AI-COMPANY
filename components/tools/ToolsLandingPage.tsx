import Link from "next/link";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function ToolsLandingPage() {
  return (
    <>
      <PageHero
        eyebrow="Selena Lab · Исследования и инструменты"
        title="Инструменты Selena Systems"
        intro="Работающие технические инструменты с ясным назначением, источниками данных и границами результата. В каталог попадают только доступные функции, а не планы."
      >
        <Link href="/ru/lab" className="inline-flex min-h-11 items-center font-medium text-link underline decoration-link/45 underline-offset-4">
          ← Вернуться в Selena Lab
        </Link>
      </PageHero>

      <section className="bg-surface py-16 sm:py-24" aria-labelledby="tools-catalog">
        <Container size="wide">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-deep">Каталог</p>
          <h2 id="tools-catalog" className="mt-5 text-h2 text-ink">Доступно сейчас</h2>
          <article className="mt-9 grid gap-6 border-y border-line py-9 lg:grid-cols-[12rem_1fr_auto] lg:items-start">
            <div>
              <p className="text-sm font-semibold text-forest">Доступно</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">Техническая проверка</p>
            </div>
            <div>
              <h3 className="font-serif text-3xl font-semibold text-ink">Public Readiness</h3>
              <p className="mt-4 max-w-3xl leading-7 text-muted">
                Проверяет по публичным данным, может ли сайт быть получен и разобран машинными системами. Результат описывает техническую готовность сайта и не является измерением фактических ответов ChatGPT, Gemini или Perplexity.
              </p>
              <ul className="mt-5 space-y-2 text-sm leading-6 text-ink/75">
                <li>• Не требует входа или передачи контактов.</li>
                <li>• Не выполняет платные AI-вызовы.</li>
                <li>• Не обещает упоминание или позицию в AI-поиске.</li>
              </ul>
            </div>
            <Button href="/ru/check">Запустить проверку</Button>
          </article>
          <p className="mt-8 max-w-3xl leading-7 text-muted">
            Другие инструменты появятся в каталоге только после публичного запуска и проверки их фактической доступности.
          </p>
        </Container>
      </section>
    </>
  );
}
