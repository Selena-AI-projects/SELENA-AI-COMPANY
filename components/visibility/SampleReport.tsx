import type { SampleReportContentV2 } from "@/lib/visibility/sample-report-data";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { EvidenceList, SourceBadge } from "./EvidenceList";
import { ActionReadinessCard } from "./ActionReadinessCard";
import { ActionPathTimeline } from "./ActionPathTimeline";
import { VerificationLoopReport } from "./VerificationLoopReport";

/**
 * Full sample report (Codex Execution TZ V1.2, section E) — nine required
 * sections. Everything rendered here comes from
 * lib/visibility/sample-report-data.ts, where every value carries
 * sourceStatus: "sample". No email is collected on this page and no
 * network request is made from it.
 */
export function SampleReport({ content }: { content: SampleReportContentV2 }) {
  const { identity } = content;

  return (
    <section className="bg-ivory pb-20 sm:pb-28">
      <Container size="narrow">
        {/* 1. Report identity */}
        <Reveal>
          <Card hover={false} className="border-copper/40 bg-copper/[0.05]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-copper-deep/40 bg-copper-deep/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-copper-deep">
                {identity.badge}
              </span>
              <SourceBadge sourceStatus={identity.sourceStatus} />
            </div>
            <div className="mt-5 grid gap-1 text-sm text-muted sm:grid-cols-2">
              <p>
                <span className="font-medium text-ink">Business:</span> {identity.businessName}
              </p>
              <p>
                <span className="font-medium text-ink">Domain:</span> {identity.domain}
              </p>
              <p>
                <span className="font-medium text-ink">Market:</span> {identity.market}
              </p>
              <p>
                <span className="font-medium text-ink">Language:</span> {identity.language}
              </p>
              <p>
                <span className="font-medium text-ink">Status:</span> {identity.status}
              </p>
              <p>{identity.methodologyVersion}</p>
            </div>
            <p className="mt-5 border-t border-copper/25 pt-4 text-sm leading-relaxed text-ink/80">
              {content.sampleDisclaimer}
            </p>
          </Card>
        </Reveal>

        {/* 2. Discoverability + 3. Understanding */}
        {[content.discoverability, content.understanding].map((section, i) => (
          <Reveal key={section.title} delay={(i + 1) * 60}>
            <div className="mt-10">
              <h2 className="text-h3 text-ink">{section.title}</h2>
              <p className="mt-2 leading-relaxed text-muted">{section.question}</p>
              <div className="mt-5">
                <EvidenceList rows={section.rows} />
              </div>
            </div>
          </Reveal>
        ))}

        {/* 4. Recommendation Evidence */}
        <Reveal delay={80}>
          <div className="mt-10">
            <h2 className="text-h3 text-ink">{content.recommendationEvidence.title}</h2>
            <p className="mt-2 leading-relaxed text-muted">{content.recommendationEvidence.question}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {content.recommendationEvidence.ratios.map((ratio) => (
                <div key={ratio.label} className="rounded-xl border border-line bg-surface/70 px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{ratio.label}</p>
                    <SourceBadge sourceStatus={ratio.sourceStatus} />
                  </div>
                  <p className="mt-2 font-serif text-2xl font-semibold text-ink">
                    {ratio.matched} / {ratio.total}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl border border-line bg-surface/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Source examples</p>
              <ul className="mt-3 space-y-2">
                {content.recommendationEvidence.citationExamples.map((example) => (
                  <li key={example.url} className="text-sm text-muted">
                    <span className="font-medium text-ink">{example.url}</span> — {example.note}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {content.recommendationEvidence.disclosure}
            </p>
          </div>
        </Reveal>

        {/* 5. Action Readiness */}
        <Reveal delay={100}>
          <div className="mt-10">
            <h2 className="text-h3 text-ink">{content.actionReadiness.title}</h2>
            <p className="mt-2 leading-relaxed text-muted">{content.actionReadiness.question}</p>
            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              {content.actionReadiness.states.map((state) => (
                <ActionReadinessCard key={state.id} state={state} />
              ))}
            </div>
            <Card hover={false} className="mt-6">
              <ActionPathTimeline
                title={content.actionReadiness.timelineTitle}
                steps={content.actionReadiness.timeline}
              />
            </Card>
            <p className="mt-4 rounded-xl border border-copper/30 bg-copper/[0.06] p-4 text-sm leading-relaxed text-ink/80">
              {content.actionReadiness.agentCaveat}
            </p>
          </div>
        </Reveal>

        {/* 6. Top blocker */}
        <Reveal delay={120}>
          <div className="mt-10">
            <h2 className="text-h3 text-ink">{content.topBlocker.heading}</h2>
            <Card hover={false} className="mt-5">
              <h3 className="font-serif text-lg font-semibold text-ink">{content.topBlocker.item.title}</h3>
              <dl className="mt-4 space-y-3 text-sm leading-relaxed">
                <div>
                  <dt className="font-medium text-ink">Evidence</dt>
                  <dd className="text-muted">{content.topBlocker.item.evidence}</dd>
                </div>
                <div>
                  <dt className="font-medium text-ink">Why it matters</dt>
                  <dd className="text-muted">{content.topBlocker.item.whyItMatters}</dd>
                </div>
                <div>
                  <dt className="font-medium text-ink">What this does NOT prove</dt>
                  <dd className="text-muted">{content.topBlocker.item.doesNotProve}</dd>
                </div>
              </dl>
            </Card>
          </div>
        </Reveal>

        {/* 7. Next three actions */}
        <Reveal delay={140}>
          <div className="mt-10">
            <h2 className="text-h3 text-ink">{content.nextActions.heading}</h2>
            <ol className="mt-5 space-y-4">
              {content.nextActions.items.map((item, i) => (
                <li key={item.title} className="card-premium flex gap-4 p-5">
                  <span className="font-serif text-xl font-semibold text-copper-deep">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-medium text-ink">{item.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        {/* 7. Verification loop */}
        <Reveal delay={140}>
          <div className="mt-10">
            <h2 className="text-h3 text-ink">{content.verificationLoop.title}</h2>
            <p className="mt-2 text-muted">{content.verificationLoop.question}</p>
            <ol className="mt-5 flex flex-wrap gap-2 text-sm">
              {content.verificationLoop.stages.map((stage, i) => (
                <li key={stage.id} className="rounded-full border border-line bg-surface px-3 py-1 text-ink/80">
                  <span className="mr-1.5 font-semibold text-copper-deep">{i + 1}</span>
                  {stage.label}
                </li>
              ))}
            </ol>
            <div className="mt-6">
              <VerificationLoopReport section={content.verificationLoop} />
            </div>
          </div>
        </Reveal>

        {/* 8. Measurement boundaries */}
        <Reveal delay={160}>
          <Card hover={false} className="mt-10 border-copper/25 bg-copper/[0.04]">
            <h2 className="font-serif text-lg font-semibold text-ink">{content.boundaries.heading}</h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper-deep">
                  What we measured
                </p>
                <ul className="mt-3 space-y-2 text-sm text-ink/80">
                  {content.boundaries.measured.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  What we did not measure
                </p>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  {content.boundaries.notMeasured.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </Reveal>

        {/* 9. Commercial routing */}
        <Reveal delay={180}>
          <div className="mt-10">
            <h2 className="text-h3 text-ink">{content.routing.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{content.routing.intro}</p>
            <div className="mt-5 space-y-4">
              {content.routing.options.map((option) => (
                <Card key={option.name} hover={false} className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3 className="text-lg font-semibold text-ink">{option.name}</h3>
                    <span className="font-serif text-xl font-semibold text-copper-deep">{option.price}</span>
                  </div>
                  <span className="inline-flex w-fit rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
                    {option.status}
                  </span>
                  <p className="text-sm leading-relaxed text-muted">{option.description}</p>
                  {option.href && option.ctaLabel ? (
                    <Button href={option.href} variant="secondary" size="md" className="mt-2 w-fit">
                      {option.ctaLabel}
                    </Button>
                  ) : null}
                </Card>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
