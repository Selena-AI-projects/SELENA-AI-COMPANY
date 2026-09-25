import type { VisibilityContent, VisibilityLocale } from "@/lib/visibility/types";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";

const LABELS: Record<VisibilityLocale, { supported: string; notYetSupported: string }> = {
  en: { supported: "Supported now", notYetSupported: "Not yet supported" },
  ru: { supported: "Уже поддерживается", notYetSupported: "Пока не поддерживается" },
};

export function MethodologySummary({
  content,
  locale = "en",
}: {
  content: VisibilityContent["methodology"];
  locale?: VisibilityLocale;
}) {
  const labels = LABELS[locale];
  return (
    <section className="bg-ivory py-20 sm:py-28">
      <Container>
        <SectionHeader eyebrow={content.eyebrow} headline={content.title} intro={content.intro} />

        <div className="mt-12 grid gap-6 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
          {content.evidenceKinds.map((kind, i) => (
            <Reveal key={kind.name} delay={i * 60}>
              <Card className="h-full">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper-deep">
                  {kind.name}
                </p>
                <p className="mt-3 leading-relaxed text-muted">{kind.description}</p>
              </Card>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <Reveal>
            <Card hover={false}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper-deep">
                {labels.supported}
              </p>
              <ul className="mt-4 space-y-2.5">
                {content.supported.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-copper" aria-hidden />
                    <span className="text-base leading-relaxed text-ink/80">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
          <Reveal delay={80}>
            <Card hover={false}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                {labels.notYetSupported}
              </p>
              <ul className="mt-4 space-y-2.5">
                {content.notYetSupported.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-line" aria-hidden />
                    <span className="text-base leading-relaxed text-muted">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        </div>

        <Reveal delay={140}>
          <div className="mt-10 space-y-4 rounded-2xl border border-line bg-surface/70 p-6 text-sm leading-relaxed text-muted">
            <p>{content.versioning}</p>
            <p>{content.privacyBoundary}</p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
