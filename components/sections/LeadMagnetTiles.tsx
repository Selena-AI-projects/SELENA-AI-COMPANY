import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

const tiles = [
  {
    marker: "01",
    title: "AI-карта возможностей",
    text: "Мини-бриф, после которого выбираем 3 процесса-кандидата для AI.",
    status: "доступно",
    href: "/check",
  },
  {
    marker: "02",
    title: "Чеклист «7 мест, где AI убирает рутину»",
    text: "Заявки, FAQ, контент, CRM, инструкции, follow-up и документы.",
    status: "скоро",
    href: "/check",
  },
  {
    marker: "03",
    title: "5-дневный мини-курс «AI без хаоса»",
    text: "Как выбрать первый процесс и не утонуть в инструментах.",
    status: "скоро",
    href: "/check",
  },
];

const shelf = [
  "Карта процесса",
  "FAQ база",
  "Сценарий ответа",
  "Правила передачи человеку",
];

export function LeadMagnetTiles() {
  return (
    <section className="bg-surface py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <Reveal>
            <Badge tone="copper">библиотека входа</Badge>
            <h2 className="mt-4 text-h2 text-ink">Начните не с курса. С карты процесса.</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Сначала фиксируем, где бизнес теряет время. Потом выбираем формат:
              чеклист, мини-курс, аудит или внедрение.
            </p>
            <div className="mt-8">
              <Button href="/check" size="lg">
                Получить AI-карту
              </Button>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative overflow-hidden rounded-[1.25rem] border border-line bg-ivory p-4 shadow-[0_24px_70px_-46px_rgba(24,22,20,0.45)] sm:p-6">
              <div className="relative grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[1rem] bg-charcoal p-5 text-ivory sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase text-copper">Selena Systems library</p>
                      <h3 className="mt-2 font-serif text-3xl font-semibold">AI-карта</h3>
                    </div>
                    <span className="rounded-full border border-line-dark px-3 py-1 text-xs text-ivory/55">
                      MVP
                    </span>
                  </div>
                  <div className="mt-8 space-y-4">
                    {shelf.map((item, i) => (
                      <div key={item} className="grid grid-cols-[2rem_1fr] items-center gap-3">
                        <span className="font-serif text-xl text-copper">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="border-b border-line-dark pb-3">
                          <p className="text-sm font-medium">{item}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-4 border-y border-line py-5 md:border-y-0 md:border-l md:py-0 md:pl-5">
                  <div>
                    <p className="text-xs font-medium uppercase text-copper-deep">выход</p>
                    <p className="mt-3 font-serif text-2xl font-semibold text-ink">
                      3 точки, где AI может сэкономить время без перестройки всего бизнеса.
                    </p>
                  </div>
                  <div className="space-y-2 text-sm text-muted">
                    <p>Не список сервисов.</p>
                    <p>Не “внедрим всё”.</p>
                    <p className="font-medium text-ink">Один понятный следующий шаг.</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-14 border-y border-line">
          {tiles.map((tile, i) => (
            <Reveal key={tile.title} delay={i * 80}>
              <div className="grid gap-4 border-b border-line py-6 last:border-b-0 md:grid-cols-[5rem_1fr_9rem] md:items-center">
                <span className="font-serif text-3xl text-copper-deep">{tile.marker}</span>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-h3 text-ink">{tile.title}</h3>
                    <Badge tone={tile.status === "доступно" ? "copper" : "neutral"}>
                      {tile.status}
                    </Badge>
                  </div>
                  <p className="mt-2 max-w-2xl leading-relaxed text-muted">{tile.text}</p>
                </div>
                <Button
                  href={tile.href}
                  variant={tile.status === "доступно" ? "primary" : "secondary"}
                  className="justify-self-start md:justify-self-end"
                >
                  {tile.status === "доступно" ? "Заполнить" : "В лист ожидания"}
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
