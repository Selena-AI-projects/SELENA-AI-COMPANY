import type { Severity } from "../checks/recommendations";
import type { PrimaryAction } from "../measurement";
import type { SiteProfile, VisibilityLocale } from "../types";

/**
 * Personalized explanation layer — contract (Decision Log D-023, D-029).
 *
 * The model explains facts that deterministic code has already decided. It
 * never contributes a finding, a severity, a score, an order, a headline or
 * a verdict — those fields simply do not exist on this contract, so there is
 * nothing for the model to fill in that would let it invent one.
 *
 * A `ConfirmedFinding` here is a narrowed view of `LiveFinding`
 * (lib/visibility/liveReport.ts): only what the model needs to phrase an
 * explanation, nothing that reveals raw crawl output. In particular
 * `pageUrl`/`selectorOrPath`/`generatedFix` are left out — they are UI
 * evidence, not context an explanation needs.
 */

export interface ConfirmedFinding {
  /** Stable id from LiveFinding — the only value the model may echo back. */
  id: string;
  severity: Severity;
  /** Already-decided problem title (human-authored, via getRecommendation()). */
  title: string;
  /** Already-decided fix instruction — source of truth, never replaced. */
  action: string;
  /** Already-decided honest limitation ("what this does not prove"). */
  doesNotProve: string;
}

export interface ExplanationInput {
  locale: VisibilityLocale;
  businessContext: {
    siteProfile: SiteProfile;
    primaryAction: PrimaryAction;
  };
  /** Confirmed findings, already selected and ordered by deterministic code
   * (report.nextActions) — the model receives at most this set and may not
   * reference any id outside it. */
  findings: ConfirmedFinding[];
}

export interface FindingExplanation {
  findingId: string;
  /** Short contextual sentence(s). May be omitted per-finding by the model
   * (see EXPLANATION_SYSTEM_PROMPT) when it adds nothing beyond the
   * deterministic title/action already shown. */
  explanation: string;
}

export interface ExplanationOutput {
  findingExplanations: FindingExplanation[];
}

/**
 * Whether a visitor is actually being shown an explanation right now —
 * the single condition the `personalized_explanation_viewed` event is
 * allowed to fire on. Being in the variant arm is not enough, and neither
 * is a response having arrived: an empty or absent list means nothing was
 * rendered, so nothing was viewed.
 */
export function shouldTrackExplanationView(
  explanation: readonly FindingExplanation[] | null | undefined,
): boolean {
  return Array.isArray(explanation) && explanation.length > 0;
}

/**
 * Strict JSON Schema for OpenAI Structured Outputs. `findingId` is
 * constrained to an enum of the confirmed ids passed in for this call — the
 * model cannot express an id it was not given, not just "should not".
 * This is the primary defense; `validateExplanationOutput` below is the
 * second, independent check on the parsed result.
 */
export function buildExplanationResponseSchema(confirmedIds: readonly string[]) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      findingExplanations: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            findingId: { type: "string", enum: [...confirmedIds] },
            explanation: { type: "string" },
          },
          required: ["findingId", "explanation"],
        },
      },
    },
    required: ["findingExplanations"],
  } as const;
}

/**
 * Defense in depth: even a schema-valid response is re-checked against the
 * exact set of ids this call was allowed to reference. Any entry naming an
 * id outside that set, or an empty explanation, is dropped rather than
 * trusted — never falls back to showing it anyway.
 */
export function validateExplanationOutput(
  output: unknown,
  confirmedIds: readonly string[],
): ExplanationOutput | null {
  if (!output || typeof output !== "object") return null;
  const candidate = (output as Record<string, unknown>).findingExplanations;
  if (!Array.isArray(candidate)) return null;

  const allowed = new Set(confirmedIds);
  const findingExplanations: FindingExplanation[] = [];
  for (const entry of candidate) {
    if (!entry || typeof entry !== "object") continue;
    const findingId = (entry as Record<string, unknown>).findingId;
    const explanation = (entry as Record<string, unknown>).explanation;
    if (typeof findingId !== "string" || !allowed.has(findingId)) continue;
    if (typeof explanation !== "string" || explanation.trim().length === 0) continue;
    findingExplanations.push({ findingId, explanation: explanation.trim() });
  }
  return { findingExplanations };
}
