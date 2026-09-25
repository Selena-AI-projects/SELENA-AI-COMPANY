import type {
  ActionReadinessContent,
  LocalBusinessModeContent,
  NotClaimedContent,
  VisibilityLocale,
} from "@/lib/visibility/types";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";

const LABELS: Record<VisibilityLocale, { example: string; doesNotProve: string; mayInclude: string }> = {
  en: { example: "Example: ", doesNotProve: "Does not prove: ", mayInclude: "May include" },
  ru: { example: "Пример: ", doesNotProve: "Не доказывает: ", mayInclude: "Может включать" },
};

/** Explains the three Action Readiness states outside a report context. */
export function ActionReadinessSection({
  content,
  locale = "en",
}: {
  content: ActionReadinessContent;
  locale?: VisibilityLocale;
}) {
  const labels = LABELS[locale];
  return (
    <section className="bg-surface py-20 sm:py-28">
      <Container>
        <SectionHeader eyebrow={content.eyebrow} headline={content.headline} intro={content.intro} />
        <div className="mt-12 grid gap-6 sm:mt-14 lg:grid-cols-3">
          {content.states.map((state, i) => (
            <Reveal key={state.id} delay={i * 80}>
              <Card className="h-full">
                <h3 className="text-h3 text-ink">{state.label}</h3>
                <p className="mt-3 leading-relaxed text-ink/80">{state.definition}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  <span className="font-medium text-ink">{labels.example}</span>
                  {state.example}
                </p>
                <p className="mt-3 border-t border-line pt-3 text-sm leading-relaxed text-muted">
                  <span className="font-medium text-ink">{labels.doesNotProve}</span>
                  {state.doesNotProve}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
        <Reveal delay={160}>
          <p className="mt-8 rounded-2xl border border-copper/30 bg-copper/[0.06] p-6 leading-relaxed text-ink/80">
            {content.caveat}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}

export function LocalBusinessModeSection({
  content,
  locale = "en",
}: {
  content: LocalBusinessModeContent;
  locale?: VisibilityLocale;
}) {
  return (
    <section className="bg-ivory py-20 sm:py-28">
      <Container size="narrow">
        <SectionHeader eyebrow={content.eyebrow} headline={content.headline} intro={content.intro} />
        <Reveal>
          <Card hover={false} className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper-deep">{LABELS[locale].mayInclude}</p>
            <ul className="mt-4 space-y-2.5">
              {content.mayInclude.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-copper" aria-hidden />
                  <span className="text-base leading-relaxed text-ink/80">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
              {content.boundary}
            </p>
          </Card>
        </Reveal>
      </Container>
    </section>
  );
}

export function NotClaimedSection({ content }: { content: NotClaimedContent }) {
  return (
    <section className="bg-surface py-20 sm:py-28">
      <Container size="narrow">
        <Reveal>
          <Card hover={false} className="border-copper/25 bg-copper/[0.04]">
            <h2 className="font-serif text-h3 text-ink">{content.heading}</h2>
            <ul className="mt-5 space-y-3">
              {content.items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-line" aria-hidden />
                  <span className="leading-relaxed text-muted">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      </Container>
    </section>
  );
}
