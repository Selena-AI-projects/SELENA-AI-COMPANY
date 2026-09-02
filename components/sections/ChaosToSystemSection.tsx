import { chaos } from "@/lib/data/content";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Signature storytelling section (cinematic brief §4.2): the "before" state
 * as scattered, slightly rotated notes that visually resolve into an ordered
 * numbered sequence — the chaos → system metaphor, readable at a glance.
 * Deterministic rotations/offsets by index (no randomness, stable SSR).
 */

/* Deterministic "scattered notes" geometry, indexed by position. */
const NOTE_ROTATIONS = [-2.4, 1.6, -1.4, 2.2, -1.8, 1.2, -2] as const;
const NOTE_OFFSETS = [0, 26, 8, 34, 14, 22, 4] as const;

function FlowArrow() {
  return (
    <svg
      viewBox="0 0 64 24"
      className="h-6 w-16 rotate-90 text-copper lg:rotate-0"
      fill="none"
      aria-hidden
    >
      <path
        d="M2 12 H48"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="6 6"
        className="animate-flow-dash"
      />
      <path
        d="M46 5 L56 12 L46 19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChaosToSystemSection() {
  return (
    <section className="relative overflow-hidden bg-ivory py-20 sm:py-28">
      <Container>
        <SectionHeader
          eyebrow={chaos.eyebrow}
          headline={chaos.headline}
          intro={chaos.intro}
        />

        <div className="mt-14 grid items-center gap-10 sm:mt-16 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
          {/* ---------- Before: scattered notes ---------- */}
          <div className="relative">

            <Reveal className="relative">
              <p className="flex items-center gap-3 text-base font-semibold uppercase tracking-[0.22em] text-muted">
                <span className="inline-block h-px w-8 bg-current opacity-60" aria-hidden />
                Как это выглядит сейчас
              </p>
            </Reveal>

            <ul className="relative mt-6 space-y-3">
              {chaos.before.map((item, i) => (
                <Reveal as="li" key={item} delay={i * 80}>
                  <div
                    className="inline-flex max-w-md items-start gap-2.5 rounded-xl border border-line bg-surface/80 px-4 py-3 text-sm leading-snug text-muted shadow-sm"
                    style={{
                      transform: `rotate(${NOTE_ROTATIONS[i % NOTE_ROTATIONS.length]}deg)`,
                      marginLeft: `${NOTE_OFFSETS[i % NOTE_OFFSETS.length]}px`,
                    }}
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted/50"
                      aria-hidden
                    />
                    {item}
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>

          {/* ---------- Transition arrow ---------- */}
          <Reveal
            delay={chaos.before.length * 80}
            className="flex justify-center py-2 lg:py-0"
          >
            <FlowArrow />
          </Reveal>

          {/* ---------- After: ordered sequence ---------- */}
          <div>
            <Reveal>
              <p className="flex items-center gap-3 text-base font-semibold uppercase tracking-[0.22em] text-copper-deep">
                <span className="inline-block h-px w-8 bg-current opacity-60" aria-hidden />
                Как появляется система
              </p>
            </Reveal>

            <div className="relative mt-6">
              {/* Connecting spine behind the numbered pills (decorative) */}
              <span
                className="absolute bottom-5 left-[1.125rem] top-5 border-l border-dashed border-copper/40"
                aria-hidden
              />
              <ol className="relative">
                {chaos.transformation.map((step, i) => (
                  <Reveal as="li" key={step} delay={i * 80} className="relative">
                    <div className="flex items-center gap-4 py-3">
                      <span
                        className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-copper-deep text-sm font-semibold text-surface shadow-sm"
                        aria-hidden
                      >
                        {i + 1}
                      </span>
                      <p className="font-medium text-ink">{step}</p>
                    </div>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
