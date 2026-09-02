import contentEngine from "@/data/content-engine.json";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { NewsletterSignupForm } from "@/components/forms/NewsletterSignupForm";

const issueRubrics = contentEngine.rubrics.slice(0, 4);
const issueTopics = contentEngine.firstTopics.slice(0, 3);

export function NewsletterCTASection() {
  return (
    <section className="bg-charcoal py-20 text-ivory sm:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <Reveal>
            <Badge tone="onDark">{contentEngine.name}</Badge>
            <h2 className="mt-4 text-h2 text-ivory">Один разбор в неделю. Без ленты инструментов.</h2>
            <p className="mt-5 text-lg leading-relaxed text-ivory/70">
              Берём одну бизнес-задачу: заявки, контент, CRM или командную рутину.
              На выходе — сценарий, инструмент и ошибка, которую лучше не повторять.
            </p>
            <div className="mt-8">
              <NewsletterSignupForm />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative overflow-hidden border-y border-line-dark py-5">
              <div className="relative rounded-[1.25rem] border border-line-dark bg-charcoal-2/90 p-5 shadow-[0_22px_80px_-48px_rgba(0,0,0,0.9)] sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line-dark pb-5">
                  <div>
                    <p className="text-xs font-medium uppercase text-copper">редакционный выпуск</p>
                    <h3 className="mt-2 font-serif text-3xl font-semibold text-ivory">
                      Заявки не должны жить в голове
                    </h3>
                  </div>
                  <p className="rounded-full border border-line-dark px-3 py-1 text-xs text-ivory/55">
                    issue 01
                  </p>
                </div>

                <div className="mt-7 grid gap-8 md:grid-cols-[0.88fr_1.12fr]">
                  <div>
                    <div className="grid grid-cols-3 border-y border-line-dark text-center text-base font-medium uppercase text-ivory/55">
                      {["задача", "сценарий", "граница"].map((item) => (
                        <span key={item} className="border-r border-line-dark py-3 last:border-r-0">
                          {item}
                        </span>
                      ))}
                    </div>
                    <p className="mt-5 text-sm leading-relaxed text-ivory/68">
                      Не “обзор AI-сервисов”, а рабочий разбор: где теряется время,
                      что можно доверить сценарию и где нужна проверка человеком.
                    </p>
                    <ul className="mt-6 space-y-3">
                      {issueTopics.map((topic) => (
                        <li key={topic} className="flex gap-3 text-sm text-ivory/74">
                          <span className="mt-2 h-px w-8 shrink-0 bg-copper" aria-hidden />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <ol className="divide-y divide-line-dark border-y border-line-dark">
                    {issueRubrics.map((rubric, i) => (
                      <li key={rubric.title} className="grid grid-cols-[2.5rem_1fr] gap-4 py-4">
                        <span className="font-serif text-2xl text-copper">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <p className="font-medium text-ivory">{rubric.title}</p>
                          <p className="mt-1 text-sm text-ivory/55">{rubric.goal}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
