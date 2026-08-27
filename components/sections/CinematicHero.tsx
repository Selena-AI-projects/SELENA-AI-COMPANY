import Image from "next/image";
import { cta } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

/**
 * Cinematic hero: one stable premium media frame instead of loose floating
 * cards. The hero must communicate the core promise at a glance:
 * messy business inputs become an AI map, automation and playbook.
 */
/** The calculator sits on this same landing, a few sections down. */
const calculatorCta = { label: "Посчитать рутину", href: "#calculator" };

export function CinematicHero() {
  return (
    <section className="bg-warm-canvas relative overflow-hidden pt-28 sm:pt-36">
      <div
        className="grid-texture pointer-events-none absolute -right-36 top-8 hidden h-[42rem] w-[42rem] lg:block"
        aria-hidden
      />

      <Container size="wide" className="relative">
        <div className="grid items-center gap-12 pb-16 sm:pb-24 lg:grid-cols-[0.88fr_1.12fr] lg:gap-12">
          <div className="max-w-2xl">
            <div className="animate-drift-in" style={{ animationDelay: "0.05s" }}>
              <Badge tone="copper">AI-внедрение и обучение для бизнеса</Badge>
            </div>

            <h1
              className="animate-drift-in mt-6 font-serif text-display font-semibold text-ink"
              style={{ animationDelay: "0.15s" }}
            >
              Где бизнес теряет время, а где AI действительно нужен?
            </h1>

            <p
              className="animate-drift-in mt-6 max-w-xl text-lg leading-relaxed text-muted"
              style={{ animationDelay: "0.3s" }}
            >
              Разбираю заявки, ответы, контент, CRM и командную рутину. Затем
              собираю AI-сценарии, автоматизации и правила работы без сложного кода.
            </p>

            <div
              className="animate-drift-in mt-9 flex flex-wrap items-center gap-4"
              style={{ animationDelay: "0.45s" }}
            >
              <Button href={cta.primary.href} size="lg">
                {cta.primary.label}
              </Button>
              <Button href={calculatorCta.href} size="lg" variant="secondary">
                {calculatorCta.label}
              </Button>
            </div>

            <div
              className="animate-drift-in mt-8 hidden max-w-xl grid-cols-3 gap-3 border-y border-line py-4 sm:grid"
              style={{ animationDelay: "0.6s" }}
            >
              {[
                ["01", "AI-карта"],
                ["02", "Автоматизация"],
                ["03", "Playbook"],
              ].map(([n, label]) => (
                <div key={n}>
                  <p className="font-serif text-2xl font-semibold leading-none text-copper-deep">
                    {n}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <p
              className="animate-drift-in mt-7 flex items-center gap-3 text-sm font-medium text-ink/70"
              style={{ animationDelay: "0.75s" }}
            >
              <span className="inline-block h-px w-8 bg-copper" aria-hidden />
              Сначала процесс. Потом инструмент, автоматизация или человек.
            </p>
          </div>

          <div
            className="animate-drift-in relative lg:mt-20 lg:self-start"
            style={{ animationDelay: "0.25s" }}
          >
            <div
              className="grid-texture pointer-events-none absolute -inset-10 opacity-55"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-[1.25rem] border border-line bg-surface shadow-[0_34px_90px_-58px_rgba(24,22,20,0.58)]">
              <Image
                src="/media/selena-systems-process-visual.png"
                width={1600}
                height={1100}
                priority
                sizes="(min-width: 1024px) 54vw, 100vw"
                alt="Selena Systems process visual: messy business inputs become an AI map, automation and playbook."
                className="h-auto w-full"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/10 via-transparent to-transparent"
                aria-hidden
              />
            </div>

            <div className="absolute -bottom-5 left-5 right-5 rounded-[1rem] border border-line bg-surface/88 px-4 py-3 shadow-[0_16px_48px_-32px_rgba(24,22,20,0.5)] backdrop-blur-sm sm:left-auto sm:right-6 sm:w-[22rem]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-copper-deep">
                Selena Systems process
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Из хаоса заявок, FAQ, CRM и контента — в один понятный AI-сценарий.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
