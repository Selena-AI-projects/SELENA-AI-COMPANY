import type { LiveFinding } from "../liveReport";
import type { PrimaryAction } from "../measurement";
import type { SiteProfile, VisibilityLocale } from "../types";
import type { ConfirmedFinding, ExplanationInput } from "./contract";

/**
 * Pure, deterministic: narrows already-decided `LiveFinding`s down to the
 * fields an explanation may reference (Decision Log D-023, D-029). No
 * network call, no randomness, no raw crawl output — `pageUrl`,
 * `selectorOrPath`, `detail` (which echoes raw HTTP/HTML evidence) and
 * `generatedFix` are deliberately left out.
 *
 * Takes `report.nextActions` as-is — the same, already-limited (max 3),
 * already-prioritized list `LiveReportView.tsx` renders as "the one thing
 * to fix first" plus the next two. This function does not re-select or
 * re-rank anything.
 */
export function buildExplanationInput(
  nextActions: readonly LiveFinding[],
  businessContext: { siteProfile: SiteProfile; primaryAction: PrimaryAction },
  locale: VisibilityLocale,
): ExplanationInput {
  const findings: ConfirmedFinding[] = nextActions.map((finding) => ({
    id: finding.id,
    severity: finding.severity,
    title: finding.title,
    action: finding.action,
    doesNotProve: finding.doesNotProve,
  }));

  return { locale, businessContext, findings };
}
