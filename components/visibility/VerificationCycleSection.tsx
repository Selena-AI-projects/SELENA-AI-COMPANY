import { visibilityActivation } from "@/lib/visibility/activation";
import type { VerificationCycleContent, VisibilityLocale } from "@/lib/visibility/types";
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
  const locale: VisibilityLocale =
    content.sampleReport.sampleLabel === "Sample data · not a measurement" ? "en" : "ru";
  return (
    <section className="bg-ivory py-20 sm:py-28" id="verification-loop">
      <Container>
        {!visibilityActivation.recurring && <p className="mb-6 max-w-3xl font-semibold text-ink">{locale === "en" ? "Preview workflow only. Weekly recurring measurements and Telegram production delivery are not activated." : "Пример процесса. Регулярные замеры и доставка в Telegram в рабочем режиме пока не активированы."}</p>}
        <SectionHeader eyebrow={content.eyebrow} headline={content.headline} intro={content.intro} />

        {/* Seven stages in their normative order. The three core stages carry
            the page at full size; the support stages between them stay small,
            so the reader sees measure → recommendation → verified outcome at
            a glance. Each card shows one line: what the owner gets. */}
        <ol className="mt-12 grid gap-x-4 gap-y-6 sm:mt-14 sm:grid-cols-2 lg:grid-cols-12">
          {content.stages.map((stage, i) => {
            const core = stage.tier === "core";
            const last = stage.id === "verified_outcome";
            return (
              <Reveal
                key={stage.id}
                delay={i * 60}
                as="li"
                className={core ? "flex lg:col-span-4 lg:row-start-1" : "flex lg:col-span-3 lg:row-start-2"}
              >
                <div
                  className={
                    core
                      ? last
                        ? "flex w-full flex-col rounded-2xl bg-charcoal p-6 text-ivory sm:p-7"
                        : "flex w-full flex-col rounded-2xl border border-line bg-surface p-6 sm:p-7"
                      : "flex w-full flex-col border-t-2 border-rose pt-3"
                  }
                >
                  <div className="flex items-baseline gap-3">
                    <span
                      className={
                        core
                          ? "font-serif text-4xl font-semibold leading-none text-copper"
                          : "text-sm font-semibold text-muted"
                      }
                    >
                      {i + 1}
                    </span>
                    <h3 className={core ? "font-serif text-2xl font-semibold" : "font-sans text-base font-semibold text-ink"}>
                      {stage.label}
                    </h3>
                  </div>
                  <p
                    className={
                      core
                        ? `mt-4 text-lg font-semibold leading-snug ${last ? "text-rose-dark" : "text-rose"}`
                        : "mt-1 text-sm leading-relaxed text-muted"
                    }
                  >
                    {stage.benefit}
                  </p>
                  {last ? (
                    <ul className="mt-5 flex flex-wrap gap-2" aria-label={content.statuses.join(", ")}>
                      {content.statuses.map((status) => (
                        <li
                          key={status}
                          className="rounded-md bg-charcoal-2 px-2.5 py-1 text-sm font-semibold text-rose-dark"
                        >
                          {status}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </Reveal>
            );
          })}
        </ol>

        <Reveal className="mt-8">
          <details className="rounded-xl border border-line bg-surface p-5 sm:p-6">
            <summary className="cursor-pointer text-base font-semibold text-rose">{content.detailsLabel}</summary>
            <ol className="mt-5 grid gap-5 sm:grid-cols-2">
              {content.stages.map((stage, i) => (
                <li key={stage.id} className="border-t border-line pt-3">
                  <p className="font-semibold text-ink">
                    {i + 1}. {stage.label}
                  </p>
                  <p className="mt-1 text-base leading-relaxed text-ink/80">{stage.produces}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{stage.rule}</p>
                </li>
              ))}
            </ol>
          </details>
        </Reveal>

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
          <VerificationLoopReport section={sample} locale={locale} />
        </Reveal>
      </Container>
    </section>
  );
}
