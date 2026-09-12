import Link from "next/link";
import type { ReactNode } from "react";
import type { LiveFinding, LiveReport } from "@/lib/visibility/liveReport";
import type {
  AgentReadinessCategoryScore,
  AgentReadinessCheckResult,
} from "@/lib/visibility/readiness/agentReadiness";
import type { LiveReportCopy } from "@/lib/visibility/types";
import {
  serializeCodingAgentPrompt,
  serializeFixInstructions,
  serializeFullReadinessReport,
} from "@/lib/visibility/readiness/export";
import { buildAuditHtmlDocument } from "@/lib/visibility/readiness/htmlReport";
import { selenaAppRoutes } from "@/lib/visibility/routes";
import { cn } from "@/lib/cn";

export type ReadinessComparison = {
  baselineScanId: string;
  verificationScanId: string;
  baselineScore: number;
  verifiedScore: number;
  delta: number;
  aiVisibilityCompared: false;
};

/**
 * The result the visitor came for, rendered on the page that ran it.
 *
 * Everything here is measured from the submitted site. Where a layer could
 * not be measured it says so and explains why — a missing measurement is
 * never rendered as a zero, because a zero is a claim and we do not have
 * the evidence to make it (SSOT §8.3).
 */

const SEVERITY_STYLES: Record<LiveFinding["severity"], string> = {
  critical: "border-bad/40 bg-bad-soft text-bad",
  important: "border-warn/40 bg-warn-soft text-warn",
  later: "border-line bg-ivory text-muted",
};

/** Card accent per severity, so a critical card reads as red before the tag is. */
const CARD_STYLES: Record<LiveFinding["severity"], string> = {
  critical: "border-bad/30",
  important: "border-warn/30",
  later: "border-line",
};

const STANDARD_STATUS_STYLES = {
  passed: "border-good/30 bg-good-soft text-good",
  warning: "border-warn/30 bg-warn-soft text-warn",
  failed: "border-bad/30 bg-bad-soft text-bad",
  not_applicable: "border-line bg-ivory text-muted",
  /** Neutral by design: unknown means "not enough evidence", never a failure. */
  unknown: "border-line bg-ivory text-muted",
} as const;

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "site";
  }
}

function downloadFile(filename: string, body: string, type: string): void {
  const blob = new Blob([body], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function downloadMarkdown(filename: string, body: string): void {
  const blob = new Blob([body], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Traffic-light colour for a 0-100 layer score. */
function scoreColor(score: number): string {
  return score >= 80 ? "text-good" : score >= 50 ? "text-warn" : "text-bad";
}

function SeverityTag({ severity, copy }: { severity: LiveFinding["severity"]; copy: LiveReportCopy }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase",
        SEVERITY_STYLES[severity],
      )}
    >
      {copy.severityLabels[severity]}
    </span>
  );
}

function FindingCard({
  finding,
  copy,
  expanded,
}: {
  finding: LiveFinding;
  copy: LiveReportCopy;
  expanded?: boolean;
}) {
  return (
    <li className={cn("rounded-2xl border bg-surface p-5 sm:p-6", CARD_STYLES[finding.severity])}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="font-medium text-ink">{finding.title}</p>
        <SeverityTag severity={finding.severity} copy={copy} />
      </div>

      {finding.detail ? (
        <p className="mt-2 font-mono text-xs leading-relaxed break-words text-muted">
          {finding.detail}
        </p>
      ) : null}

      <dl className="mt-4 grid gap-1.5 border-t border-line pt-4 text-xs text-muted">
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-semibold text-ink/75">{copy.evidenceLabel}:</dt>
          <dd className="break-all">{finding.pageUrl}{finding.selectorOrPath ? ` · ${finding.selectorOrPath}` : ""}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-semibold text-ink/75">{copy.ruleLabel}:</dt>
          <dd className="font-mono">{finding.ruleId} · {finding.ruleVersion}</dd>
        </div>
      </dl>

      <div className="mt-4">
        <p className="text-xs font-semibold tracking-wide text-copper-deep uppercase">
          {copy.howToFixLabel}
        </p>
        <p className="mt-1.5 leading-relaxed text-ink/85">{finding.action}</p>
      </div>

      {expanded ? (
        <div className="mt-4 border-t border-line pt-4">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">
            {copy.doesNotProveLabel}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{finding.doesNotProve}</p>
        </div>
      ) : null}

      <details className="mt-4 border-t border-line pt-4">
        <summary className="cursor-pointer text-sm font-semibold text-copper-deep">
          {copy.generatedFixLabel}
        </summary>
        <div className="mt-3 rounded-xl bg-ivory p-4">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">{copy.beforeLabel}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{finding.generatedFix.before}</p>
          <p className="mt-4 text-xs font-semibold tracking-wide text-muted uppercase">{copy.proposedLabel}</p>
          <pre className="mt-1.5 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-ink">{finding.generatedFix.proposedAfter}</pre>
          <p className="mt-3 text-xs leading-relaxed text-muted">{copy.previewOnlyLabel}</p>
          <button
            type="button"
            onClick={() => void navigator.clipboard?.writeText(finding.generatedFix.proposedAfter)}
            className="mt-3 inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-copper-deep/60 hover:text-copper-deep"
          >
            {copy.copyFixLabel}
          </button>
        </div>
      </details>
    </li>
  );
}

function CategoryCard({ category, copy }: { category: AgentReadinessCategoryScore; copy: LiveReportCopy }) {
  return (
    <article className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-medium leading-snug text-ink">{category.label}</h4>
        <span className={cn("shrink-0 font-serif text-2xl font-semibold", category.score === null ? "text-muted" : scoreColor(category.score))}>
          {category.score ?? "N/A"}{category.score === null ? "" : "/100"}
        </span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        {category.applicableChecks} {copy.categorySummary.applicable} · {category.passedChecks} {copy.categorySummary.passed} · {category.warningChecks} {copy.categorySummary.warning} · {category.failedChecks} {copy.categorySummary.failed} · {category.notApplicableChecks} {copy.categorySummary.notApplicable}
        {category.unknownChecks > 0 ? <> · {category.unknownChecks} {copy.standardStatusLabels.unknown.toLowerCase()}</> : null}
      </p>
    </article>
  );
}

function StandardCheckRow({ check, copy }: { check: AgentReadinessCheckResult; copy: LiveReportCopy }) {
  return (
    <details className="group rounded-2xl border border-line bg-surface open:border-copper/40">
      <summary className="grid min-h-14 cursor-pointer list-none gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5">
        <span className="min-w-0">
          <span className="block font-medium text-ink">{check.checkId} · {check.title}</span>
          <span className="mt-1 block font-mono text-xs break-all text-muted">{check.checkedTarget}</span>
        </span>
        <span className={cn("w-fit rounded-full border px-2.5 py-1 text-xs font-semibold", STANDARD_STATUS_STYLES[check.status])}>
          {copy.standardStatusLabels[check.status]}
          {check.diagnosticOnly ? " · weight 0" : ""}
        </span>
      </summary>
      <div className="border-t border-line px-4 py-5 sm:px-5">
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">{copy.evidenceLabel}</p>
            <ul className="mt-2 grid gap-2 font-mono text-xs leading-relaxed text-muted">
              {check.evidence.map((item, index) => <li key={`${check.checkId}-evidence-${index}`} className="break-words">{item}</li>)}
            </ul>
            <p className="mt-5 text-xs font-semibold tracking-wide text-muted uppercase">{copy.explanationLabel}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">{check.explanation}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{check.doesNotProve.join(" ")}</p>
          </div>
          <div>
            {check.status === "failed" || check.status === "warning" ? (
              <>
                <p className="text-xs font-semibold tracking-wide text-copper-deep uppercase">{copy.howToFixLabel}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/85">{check.fix.summary}</p>
                <p className="mt-4 text-xs font-semibold tracking-wide text-muted uppercase">{copy.platformLabel}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{check.fix.platformInstruction}</p>
                {check.fix.codeBlocks.map((block, index) => (
                  <pre key={`${check.checkId}-code-${index}`} className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-xl bg-ivory p-4 font-mono text-xs leading-relaxed text-ink">{block}</pre>
                ))}
              </>
            ) : null}
            <p className="mt-5 text-xs font-semibold tracking-wide text-muted uppercase">{copy.verificationLabel}</p>
            <ul className="mt-2 grid gap-2 text-sm leading-relaxed text-muted">
              {check.verification.map((item, index) => <li key={`${check.checkId}-verification-${index}`}>{item}</li>)}
            </ul>
            {check.references.length > 0 ? (
              <p className="mt-4 font-mono text-xs leading-relaxed break-all text-muted">{check.references.join(" · ")}</p>
            ) : null}
          </div>
        </div>
      </div>
    </details>
  );
}

/**
 * A specialist-depth section, folded by default: the free report leads with
 * the checklist and the plan, and the deep evidence stays one click away
 * instead of stacking ten dense cards on a first-time visitor.
 */
function Collapsed({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="card-premium group p-6 sm:p-8">
      <summary className="flex cursor-pointer list-none items-center gap-2 font-serif text-xl font-semibold text-ink [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="inline-block text-copper-deep transition-transform group-open:rotate-90">›</span>
        {summary}
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

export function LiveReportView({
  report,
  copy,
  remainingChecks,
  comparison,
  isVerifying,
  verificationError,
  onVerify,
  onRestart,
}: {
  report: LiveReport;
  copy: LiveReportCopy;
  remainingChecks?: number;
  comparison?: ReadinessComparison | null;
  isVerifying?: boolean;
  verificationError?: string;
  onVerify?: () => void;
  onRestart: () => void;
}) {
  const passed = report.layers.flatMap((layer) => layer.passed);
  const problems = report.findings;
  const topBlocker = report.topBlocker;
  const rest = report.nextActions.filter((finding) => finding.id !== topBlocker?.id);
  const agentReadiness = report.readiness.agentReadiness;
  // Local AI Readiness is an unscored diagnostic group and renders in its
  // own section with a mandatory boundary disclaimer, so it is kept out of
  // the standards list to avoid showing the same checks twice.
  const standardsCategories = agentReadiness.categories.filter((category) => category.id !== "local_ai_readiness");
  const standardsChecks = agentReadiness.checks.filter((check) => check.category !== "local_ai_readiness");
  const localAiCategory = agentReadiness.categories.find((category) => category.id === "local_ai_readiness");
  const localAiChecks = agentReadiness.checks.filter((check) => check.category === "local_ai_readiness");
  const weakestBlocks = [...report.readiness.blocks]
    .sort((left, right) => left.citabilityScore - right.citabilityScore)
    .slice(0, 12);

  if (!report.reachable) {
    return (
      <div className="card-premium p-8 sm:p-10" role="status">
        <h2 className="font-serif text-h3 text-ink">{copy.unreachable.heading}</h2>
        <p className="mt-3 text-sm break-all text-muted">{report.url}</p>
        <p className="mt-4 leading-relaxed text-muted">{copy.unreachable.body}</p>
        {report.fetchError ? (
          <p className="mt-3 font-mono text-xs text-muted">{report.fetchError}</p>
        ) : null}
        <button
          type="button"
          onClick={onRestart}
          className="mt-7 inline-flex items-center justify-center rounded-full border border-line bg-surface px-6 py-3 text-base font-medium text-ink transition-all duration-300 hover:border-copper-deep/60 hover:text-copper-deep"
        >
          {copy.restartLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="grid min-w-0 gap-6 [&>*]:min-w-0" role="status">
      {/* --- Header: what was actually read --- */}
      <div className="card-premium p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <h2 className="font-serif text-h3 text-ink">{copy.heading}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{copy.readinessDisclaimer}</p>
          </div>
          {agentReadiness.score !== null ? (
            <div className="min-w-36 rounded-2xl border border-line bg-ivory px-5 py-4 text-right">
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">{copy.overallScoreLabel}</p>
              <p className={cn("mt-1 font-serif text-4xl font-semibold", scoreColor(agentReadiness.score))}>
                {agentReadiness.score}<span className="text-base text-muted">/100</span>
              </p>
            </div>
          ) : null}
        </div>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-muted">{copy.checkedLabel}</dt>
            <dd className="mt-0.5 font-medium break-all text-ink">{report.finalUrl}</dd>
          </div>
          <div>
            <dt className="text-muted">{copy.checkedAtLabel}</dt>
            <dd className="mt-0.5 font-medium text-ink">
              {new Date(report.checkedAt).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-muted">{copy.pagesLabel}</dt>
            <dd className="mt-0.5 font-medium text-ink">{report.pagesChecked.length}</dd>
          </div>
          <div>
            <dt className="text-muted">{copy.profileLabel}</dt>
            <dd className="mt-0.5 font-medium capitalize text-ink">{agentReadiness.profile.replaceAll("_", " ")}</dd>
          </div>
        </dl>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
          {report.pagesChecked.map((page) => (
            <li key={`${page.role}-${page.url}`} className="font-mono break-all">
              {page.role} · {page.status}
            </li>
          ))}
        </ul>
        <p className="mt-4 font-mono text-xs text-muted">
          {agentReadiness.registryVersion} · {report.readiness.scoringModelVersion} · {copy.coverageLabel}: {Math.round(report.readiness.coverage * 100)}% · {copy.providerCallsLabel}: {report.paidProviderCalls}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted">{agentReadiness.profileEvidence}</p>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-line bg-ivory px-4 py-3">
            <p className="font-serif text-2xl font-semibold text-ink tabular-nums">{agentReadiness.checks.length}</p>
            <p className="text-xs text-muted">{copy.freeMethod.checksLabel}</p>
          </div>
          <div className="rounded-2xl border border-line bg-ivory px-4 py-3">
            <p className="font-serif text-2xl font-semibold text-ink tabular-nums">{report.pagesChecked.length}</p>
            <p className="text-xs text-muted">{copy.freeMethod.pagesLabel}</p>
          </div>
          <div className="rounded-2xl border border-line bg-ivory px-4 py-3">
            <p className="font-serif text-2xl font-semibold text-ink tabular-nums">0</p>
            <p className="text-xs text-muted">{copy.freeMethod.aiAnswersLabel}</p>
          </div>
          <div className="rounded-2xl border border-line bg-ivory px-4 py-3">
            <p className="font-serif text-2xl font-semibold text-ink tabular-nums">$0</p>
            <p className="text-xs text-muted">{copy.freeMethod.priceLabel}</p>
          </div>
        </div>
        <div className="mt-6 border-t border-line pt-6">
          <h3 className="font-serif text-xl font-semibold text-ink">{copy.freeAiVisibility.heading}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{copy.freeAiVisibility.body}</p>
          <Link
            href={selenaAppRoutes.freeAiVisibility}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-copper bg-surface px-5 py-2.5 text-sm font-medium text-link transition-colors hover:bg-copper hover:text-surface"
          >
            {copy.freeAiVisibility.ctaLabel}
          </Link>
        </div>
      </div>



      {/* --- What works --- */}
      <section className="card-premium p-6 sm:p-8">
        <h3 className="font-serif text-xl font-semibold text-ink">{copy.goodHeading}</h3>
        <p className="mt-1.5 text-sm text-muted">{copy.goodIntro}</p>
        {passed.length > 0 ? (
          <ul className="mt-5 grid gap-2.5">
            {passed.map((item) => (
              <li key={item} className="flex items-start gap-3 text-ink/85">
                <span aria-hidden="true" className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-good-soft text-xs font-bold text-good">
                  ✓
                </span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 leading-relaxed text-muted">{copy.goodEmpty}</p>
        )}
      </section>

      {/* --- The one thing to fix first --- */}
      {topBlocker ? (
        <section className="card-premium p-6 sm:p-8">
          <h3 className="font-serif text-xl font-semibold text-ink">{copy.fixHeading}</h3>
          <p className="mt-1.5 text-sm text-muted">{copy.fixIntro}</p>
          <ul className="mt-5 grid gap-4">
            <FindingCard finding={topBlocker} copy={copy} expanded />
          </ul>
        </section>
      ) : null}

      <section className="card-premium p-6 sm:p-8">
        <h3 className="font-serif text-xl font-semibold text-ink">{copy.standardsHeading}</h3>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted">{copy.standardsIntro}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {standardsCategories.map((category) => (
            <CategoryCard key={category.id} category={category} copy={copy} />
          ))}
        </div>

        <div className="mt-7 grid gap-3">
          {standardsChecks.map((check) => (
            <StandardCheckRow key={check.checkId} check={check} copy={copy} />
          ))}
        </div>
      </section>

      {/* --- Local AI Readiness: unscored diagnostics, never an Ask Maps claim --- */}
      <section className="card-premium p-6 sm:p-8">
        <h3 className="font-serif text-xl font-semibold text-ink">{copy.localAi.heading}</h3>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted">{copy.localAi.intro}</p>
        <p className="mt-3 max-w-3xl rounded-xl border border-line bg-ivory p-4 text-sm leading-relaxed text-muted">
          {copy.localAi.disclaimer}
        </p>
        {localAiCategory ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <CategoryCard category={localAiCategory} copy={copy} />
          </div>
        ) : null}
        <div className="mt-5 grid gap-3">
          {localAiChecks.map((check) => (
            <StandardCheckRow key={check.checkId} check={check} copy={copy} />
          ))}
        </div>
        {report.localAiCtaEnabled ? (
          <div className="mt-6">
            <Link
              href={copy.localAi.ctaHref}
              className="inline-flex items-center justify-center rounded-full border border-copper bg-surface px-6 py-3 text-base font-medium text-link transition-colors hover:bg-copper hover:text-surface"
            >
              {copy.localAi.ctaLabel}
            </Link>
          </div>
        ) : null}
      </section>




      {/* --- Everything else that gets in the way --- */}
      <section className="card-premium p-6 sm:p-8">
        <h3 className="font-serif text-xl font-semibold text-ink">{copy.problemsHeading}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{copy.problemsIntro}</p>
        {problems.length > 0 ? (
          <ul className="mt-5 grid gap-4">
            {problems.map((finding) => (
              <FindingCard
                key={finding.id}
                finding={finding}
                copy={copy}
                expanded={rest.some((item) => item.id === finding.id)}
              />
            ))}
          </ul>
        ) : (
          <p className="mt-5 leading-relaxed text-muted">{copy.problemsEmpty}</p>
        )}
      </section>

      {/* --- Reproducible page/block evidence, separate from paid AI measurement --- */}
      <section className="card-premium p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl font-semibold text-ink">{copy.blocksHeading}</h3>
            <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted">{copy.blocksIntro}</p>
          </div>
          <p className="text-sm text-muted">{copy.shownLabel}: {weakestBlocks.length} / {report.readiness.blocks.length}</p>
        </div>
        {weakestBlocks.length > 0 ? (
          <div className="mt-5 grid gap-3">
            {weakestBlocks.map((block) => (
              <article key={block.blockId} className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-copper-deep uppercase">{copy.blockTypeLabels[block.blockType] ?? block.blockType}</p>
                    <p className="mt-1 font-mono text-xs break-all text-muted">{block.pageUrl} · {block.selectorOrPath}</p>
                  </div>
                  <p className={cn("font-serif text-2xl font-semibold", scoreColor(block.citabilityScore))}>
                    {block.citabilityScore}<span className="text-sm text-muted">/100</span>
                  </p>
                </div>
                <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-ink/80">{block.textSnapshot}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-5 leading-relaxed text-muted">{copy.notMeasuredLabel}</p>
        )}
      </section>

      <Collapsed summary={copy.componentsHeading}>
        <div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{copy.componentsIntro}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {report.readiness.components.map((item) => (
            <article key={item.id} className="rounded-2xl border border-line bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-medium text-ink">{item.label}</h4>
                {item.status === "diagnostic_only" ? (
                  <span className="shrink-0 rounded-full border border-line bg-ivory px-2 py-0.5 text-base font-semibold tracking-wide text-muted uppercase">
                    {copy.diagnosticOnlyLabel}
                  </span>
                ) : item.score !== null ? (
                  <span className={cn("shrink-0 font-serif text-xl font-semibold", scoreColor(item.score))}>{item.score}</span>
                ) : (
                  <span className="text-xs text-muted">{copy.notMeasuredLabel}</span>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.note}</p>
              {item.status === "weighted" ? (
                <p className="mt-2 text-xs text-muted">{copy.coverageLabel}: {Math.round(item.coverage * 100)}%</p>
              ) : null}
            </article>
          ))}
        </div>
        </div>
      </Collapsed>

      <Collapsed summary={copy.crawlerHeading}>
        <div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{copy.crawlerIntro}</p>
        <div className="mt-5 min-w-0 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-wide text-muted uppercase">
                <th className="pb-3 pr-4 font-semibold">{copy.crawlerColumns.crawler}</th>
                <th className="pb-3 pr-4 font-semibold">{copy.crawlerColumns.userAgent}</th>
                <th className="pb-3 pr-4 font-semibold">{copy.crawlerColumns.status}</th>
                <th className="pb-3 font-semibold">{copy.crawlerColumns.evidence}</th>
              </tr>
            </thead>
            <tbody>
              {report.readiness.crawlerAccess.map((item) => (
                <tr key={item.userAgent} className="border-b border-line/70 align-top last:border-0">
                  <td className="py-3 pr-4 font-medium text-ink">{item.crawler}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-muted">{item.userAgent}</td>
                  <td className="py-3 pr-4">
                    <span className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold",
                      item.status === "allowed" ? "bg-good-soft text-good" : item.status === "blocked" ? "bg-bad-soft text-bad" : "bg-ivory text-muted",
                    )}>
                      {copy.crawlerStatusLabels[item.status]}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-xs leading-relaxed text-muted">{item.evidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </Collapsed>

      <Collapsed summary={copy.instructionsHeading}>
        <div>
        <p className="mt-1.5 max-w-3xl leading-relaxed text-muted">{copy.instructionsIntro}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              downloadFile(
                `selena-audit-${safeHostname(report.finalUrl)}.html`,
                buildAuditHtmlDocument({
                  readiness: agentReadiness,
                  locale: report.locale,
                  siteUrl: report.finalUrl,
                  checkedAt: new Date(report.checkedAt).toLocaleString(),
                  mode: "full",
                }),
                "text/html;charset=utf-8",
              )
            }
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-copper px-7 py-3 text-base font-semibold text-surface transition-colors hover:bg-copper-deep"
          >
            {copy.downloadReportLabel}
          </button>
          <button
            type="button"
            onClick={() =>
              downloadFile(
                `selena-fixes-${safeHostname(report.finalUrl)}.html`,
                buildAuditHtmlDocument({
                  readiness: agentReadiness,
                  locale: report.locale,
                  siteUrl: report.finalUrl,
                  checkedAt: new Date(report.checkedAt).toLocaleString(),
                  mode: "fixes",
                }),
                "text/html;charset=utf-8",
              )
            }
            className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-copper-deep bg-surface px-7 py-3 text-base font-semibold text-copper-deep transition-colors hover:bg-copper hover:text-surface"
          >
            {copy.downloadFixesLabel}
          </button>
        </div>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted">{copy.downloadHint}</p>
        <div className="mt-5 flex flex-wrap gap-3 border-t border-line pt-5">
          <button
            type="button"
            onClick={() => void navigator.clipboard?.writeText(serializeFixInstructions(agentReadiness, report.locale))}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface px-5 py-2.5 text-base font-medium text-ink transition-colors hover:border-copper-deep/60 hover:text-copper-deep"
          >
            {copy.copyAllLabel}
          </button>
          <button
            type="button"
            onClick={() => downloadMarkdown(`${safeHostname(report.finalUrl)}-public-readiness.md`, serializeFullReadinessReport(agentReadiness, report.locale))}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface px-5 py-2.5 text-base font-medium text-ink transition-colors hover:border-copper-deep/60 hover:text-copper-deep"
          >
            {copy.downloadMarkdownLabel}
          </button>
          <button
            type="button"
            onClick={() => void navigator.clipboard?.writeText(serializeCodingAgentPrompt(agentReadiness, report.locale))}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface px-5 py-2.5 text-base font-medium text-ink transition-colors hover:border-copper-deep/60 hover:text-copper-deep"
          >
            {copy.copyAgentPromptLabel}
          </button>
        </div>
        </div>
      </Collapsed>

      {/* --- One immutable-baseline verification of Public Readiness only --- */}
      <section className="card-premium p-6 sm:p-8">
        <h3 className="font-serif text-xl font-semibold text-ink">{copy.verifyHeading}</h3>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted">{copy.verifyIntro}</p>

        {comparison ? (
          <div className="mt-5 rounded-2xl border border-line bg-ivory p-5">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">{copy.comparisonLabel}</p>
            <dl className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-muted">{copy.baselineLabel}</dt>
                <dd className="mt-1 font-serif text-3xl font-semibold text-ink">{comparison.baselineScore}/100</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">{copy.verifiedLabel}</dt>
                <dd className="mt-1 font-serif text-3xl font-semibold text-ink">{comparison.verifiedScore}/100</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">{copy.deltaLabel}</dt>
                <dd className={cn("mt-1 font-serif text-3xl font-semibold", comparison.delta >= 0 ? "text-good" : "text-bad")}>
                  {comparison.delta > 0 ? "+" : ""}{comparison.delta}
                </dd>
              </div>
            </dl>
            <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-muted">{copy.comparisonBoundary}</p>
          </div>
        ) : onVerify ? (
          <button
            type="button"
            onClick={onVerify}
            disabled={isVerifying}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-copper bg-surface px-6 py-3 text-base font-medium text-copper-deep transition-colors hover:bg-copper hover:text-surface disabled:cursor-wait disabled:opacity-60"
          >
            {isVerifying ? copy.verifyingLabel : copy.verifyLabel}
          </button>
        ) : null}

        {verificationError ? <p role="alert" className="mt-4 font-medium text-bad">{verificationError}</p> : null}
      </section>

      {/* --- Where this goes next --- */}
      <section className="card-premium p-6 sm:p-8">
        <h3 className="font-serif text-xl font-semibold text-ink">{copy.cta.heading}</h3>
        <p className="mt-3 leading-relaxed text-muted">{copy.cta.body}</p>
        <div className="mt-5 grid gap-2.5">
          {copy.lockedItems.map((item) => (
            <div key={item.title} className="rounded-2xl border border-dashed border-copper/50 bg-ivory px-4 py-3 text-sm text-muted">
              <b className="text-ink">{item.title}</b> — {item.body}
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={copy.cta.primary.href}
            className="inline-flex items-center justify-center rounded-full bg-copper px-6 py-3 text-base font-medium text-surface transition-all duration-300 hover:-translate-y-px hover:bg-copper-deep"
          >
            {copy.cta.primary.label}
          </Link>
          <Link
            href={copy.cta.secondary.href}
            className="inline-flex items-center justify-center rounded-full border border-line bg-surface px-6 py-3 text-base font-medium text-ink transition-all duration-300 hover:border-copper-deep/60 hover:text-link-deep"
          >
            {copy.cta.secondary.label}
          </Link>
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center justify-center rounded-full px-4 py-3 text-base font-medium text-muted underline decoration-line underline-offset-4 transition-colors hover:text-copper-deep"
          >
            {copy.restartLabel}
          </button>
        </div>

        <div className="mt-6 border-t border-line pt-5 text-sm text-muted">
          {typeof remainingChecks === "number" ? (
            <p className="mt-2">
              {copy.remainingLabel}: {remainingChecks}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
