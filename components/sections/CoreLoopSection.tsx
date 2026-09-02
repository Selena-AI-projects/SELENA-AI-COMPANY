import { coreLoop } from "@/lib/data/content";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Selena Systems core loop (cinematic brief §4.3) — the dark contrast moment.
 * Six method steps as a quiet editorial grid on charcoal: hairline-topped
 * columns, oversized low-opacity serif numerals, copper accents.
 */
export function CoreLoopSection() {
  return (
    <section className="relative overflow-hidden bg-charcoal py-20 text-ivory sm:py-28">
      {/* Subtle texture + warm glow — decoration only */}
      <div
        className="pointer-events-none absolute -left-32 bottom-[-8rem] h-96 w-96 rounded-full bg-copper/10 blur-3xl"
        aria-hidden
      />

      <Container className="relative">
        <SectionHeader
          eyebrow={coreLoop.eyebrow}
          headline={coreLoop.headline}
          intro={coreLoop.intro}
          onDark
        />

        <ol className="mt-14 grid grid-cols-1 gap-x-10 gap-y-12 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {coreLoop.steps.map((step, i) => (
            <Reveal as="li" key={step.n} delay={i * 80}>
              <div className="border-t border-line-dark pt-6">
                <span
                  className="block font-serif text-[3.25rem] font-semibold leading-none text-copper/35 sm:text-[3.75rem]"
                  aria-hidden
                >
                  {step.n}
                </span>
                <h3 className="mt-4 text-h3 text-ivory">{step.title}</h3>
                <p className="mt-2.5 leading-relaxed text-ivory/70">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
