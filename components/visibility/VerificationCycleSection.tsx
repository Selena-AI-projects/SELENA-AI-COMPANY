import { visibilityActivation } from "@/lib/visibility/activation";
import type { VerificationCycleContent } from "@/lib/visibility/types";
import type { SampleVerificationLoopSection } from "@/lib/visibility/sample-report-data";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Badge, Eyebrow } from "@/components/ui/Badge";
import { VerificationLoopReport } from "./VerificationLoopReport";

/**
 * The seven-stage loop as an ordered list, then the sample weekly report
 * that shows what each stage leaves behind for one set of actions. The
 * stages are numbered in text so the order survives without CSS.
 */
export function VerificationCycleSection({
  content,
  sample,
}: {
  content: VerificationCycleContent;
  sample: SampleVerificationLoopSection;
}) {
  return (
    <section className="bg-ivory py-20 sm:py-28" id="verification-loop">
      <Container>
        {!visibilityActivation.recurring && <p className="mb-6 max-w-3xl font-semibold text-ink">{content.sampleReport.sampleLabel === "Sample data · not a measurement" ? "Preview workflow only. Weekly recurring measurements and Telegram production delivery are not activated." : "Пример процесса. Регулярные замеры и production-доставка в Telegram пока не активированы."}</p>}
        <SectionHeader eyebrow={content.eyebrow} headline={content.headline} intro={content.intro} />

        <ol className="mt-12 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
          {content.stages.map((stage, i) => (
            <Reveal key={stage.id} delay={i * 60} as="li" className="flex">
              <div className="card-premium relative flex w-full flex-col p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-2xl font-semibold text-copper-deep">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {i < content.stages.length - 1 ? (
                    <span aria-hidden className="text-lg text-copper-deep/60">
                      →
                    </span>
                  ) : (
                    <span aria-hidden className="text-lg text-copper-deep/60">
                      ↺
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-ink">{stage.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/80">{stage.produces}</p>
                <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-muted">{stage.rule}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-8">
          <p className="max-w-3xl text-base leading-relaxed text-muted">{content.loopRule}</p>
        </Reveal>

        <Reveal className="mt-16 sm:mt-20">
          <Eyebrow>{content.sampleReport.eyebrow}</Eyebrow>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-h3 text-ink">{content.sampleReport.heading}</h3>
            <Badge tone="copper">{content.sampleReport.sampleLabel}</Badge>
          </div>
          <p className="mt-4 max-w-3xl leading-relaxed text-muted">{content.sampleReport.intro}</p>
        </Reveal>

        <Reveal className="mt-8">
          <VerificationLoopReport section={sample} />
        </Reveal>
      </Container>
    </section>
  );
}
