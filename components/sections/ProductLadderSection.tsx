import ladder from "@/data/offer-ladder-v3.json";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

const deliverables: Record<string, string[]> = {
  free: ["3 задачи-кандидата", "1 быстрый сценарий", "заметки по ручной проверке"],
  entry: ["карта процессов", "приоритеты", "что не автоматизировать"],
  education: ["практическая сессия", "промпты под задачи", "правила проверки"],
  core: ["дизайн workflow", "no-code связки", "тестирование и передача"],
  recurring: ["ежемесячные доработки", "новые сценарии", "поддержка команды"],
};

const hrefs: Record<string, string> = {
  free: "/check",
  entry: "/check",
  education: "/ai-training",
  core: "/ai-automation",
  recurring: "/contact",
};

export function ProductLadderSection() {
  return (
    <section className="relative overflow-hidden bg-surface py-20 sm:py-28">
      <Container>
        <SectionHeader
          eyebrow="Продуктовая лестница"
          headline="Начать можно с одного точного шага"
          intro="Не нужно сразу строить большую AI-систему. Сначала карта, затем диагностика, обучение или внедрение — ровно в том объёме, который выдержит процесс."
        />

        <ol className="relative mt-12 grid gap-0 border-y border-line bg-ivory/45 lg:grid-cols-5">
          {ladder.levels.map((item, i) => (
            <Reveal
              as="li"
              key={item.level}
              delay={i * 80}
              className="group flex h-full flex-col border-b border-line p-5 transition-colors duration-300 hover:bg-surface sm:p-6 lg:border-b-0 lg:border-r lg:last:border-r-0"
            >
              <div className="flex items-center justify-between gap-4">
                <Badge tone={item.level === "free" ? "copper" : "neutral"}>
                  {item.level === "free" ? "вход" : `0${i}`}
                </Badge>
                <span
                  className="h-px flex-1 bg-copper/30 transition-colors duration-300 group-hover:bg-copper"
                  aria-hidden
                />
              </div>
              <h3 className="mt-5 text-h3 text-ink">{item.name}</h3>
              <ul className="mt-6 space-y-3 pb-8">
                {(deliverables[item.level] ?? item.deliverable).slice(0, 3).map((point) => (
                  <li key={point} className="text-sm leading-relaxed text-muted">
                    <span className="mr-2 text-copper-deep" aria-hidden>
                      /
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <Button
                href={hrefs[item.level] ?? "/check"}
                variant="ghost"
                className="mt-auto justify-start px-0 text-link"
              >
                {item.cta} →
              </Button>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
