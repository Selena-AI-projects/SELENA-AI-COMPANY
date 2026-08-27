import Link from "next/link";
import { packages } from "@/lib/data/content";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

/**
 * Packages / starting points (contract §Section components, brief §4.8).
 * Five honest entry points — no prices, no tiers: the format is estimated
 * after the brief. The priceNote is rendered visibly right under the
 * header so the "no fixed price lists" promise is impossible to miss.
 * Grid balances 5 cards as 2 + 3 on large screens.
 */
export function PackageCards() {
  return (
    <section className="bg-ivory py-20 sm:py-28">
      <Container>
        <SectionHeader eyebrow={packages.eyebrow} headline={packages.headline} />

        {/* Honest pricing note — must stay visible (no fake prices). */}
        <Reveal delay={80}>
          <p className="mt-6 inline-flex max-w-2xl items-start gap-3 rounded-xl border border-line bg-surface/70 px-4 py-3 text-sm leading-relaxed text-muted">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" aria-hidden />
            {packages.priceNote}
          </p>
        </Reveal>

        {/* 5 cards: 1 col → 2 cols → 2 + 3 flow on lg (6-col grid) */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:mt-14 sm:grid-cols-2 sm:gap-7 lg:grid-cols-6">
          {packages.items.map((p, i) => (
            <Reveal
              key={p.id}
              delay={i * 80}
              className={cn(
                i < 2 ? "lg:col-span-3" : "lg:col-span-2",
                // On the 2-col breakpoint the 5th card fills its row.
                i === 4 && "sm:col-span-2",
              )}
            >
              <Card className="flex h-full flex-col">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-h3 text-ink">{p.name}</h3>
                  <span className="h-px w-8 shrink-0 bg-copper/40" aria-hidden />
                </div>

                <p className="mt-3 leading-relaxed text-muted">{p.outcome}</p>

                {/* pb keeps a minimum gap above the footer when mt-auto collapses */}
                <ul className="mt-6 space-y-2.5 pb-7">
                  {p.points.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span
                        className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-copper"
                        aria-hidden
                      />
                      <span className="text-base leading-relaxed text-ink/80">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto border-t border-line pt-4">
                  <Link
                    href={p.href}
                    className="group/link inline-flex items-center gap-2 text-sm font-semibold text-link transition-colors hover:text-link-deep"
                  >
                    <span
                      className="transition-transform duration-300 group-hover/link:translate-x-1"
                      aria-hidden
                    >
                      →
                    </span>
                    Начать с брифа
                  </Link>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
