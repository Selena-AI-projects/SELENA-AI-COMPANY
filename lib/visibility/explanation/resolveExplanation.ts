import { isFeatureEnabled } from "@/lib/diagnostics/flags";
import type { LiveFinding } from "../liveReport";
import type { PrimaryAction } from "../measurement";
import type { SiteProfile, VisibilityLocale } from "../types";
import {
  checkExplanationBestEffortDailyBudget,
  checkExplanationRateLimit,
} from "../security/rate-limit";
import {
  PERSONALIZED_EXPLANATION_EXPERIMENT_ID,
  resolveExperimentAssignment,
  type ExperimentAssignment,
} from "../security/bucketing";
import { buildExplanationInput } from "./buildInput";
import {
  generateExplanation,
  isExplanationProviderConfigured,
  type ExplanationCallRecord,
} from "./generate";
import type { ExplanationOutput, FindingExplanation } from "./contract";

/**
 * The whole experiment chain in one testable place: cookie → deterministic
 * variant → gates → provider call (or not) → what the response carries.
 *
 * It lives here rather than inside the route handler so the chain can be
 * exercised end to end in a unit test with a fake generator — proving, for
 * example, that the control arm never reaches the provider at all, rather
 * than only that the hashing function is deterministic.
 */

export interface ResolveExplanationOptions {
  cookieHeader: string | null | undefined;
  ip: string;
  nextActions: readonly LiveFinding[];
  siteProfile: SiteProfile;
  primaryAction: PrimaryAction;
  locale: VisibilityLocale;
  experimentId?: string;
  /** Test seam. Production passes nothing and gets the real OpenAI call. */
  generate?: (
    input: ReturnType<typeof buildExplanationInput>,
    options: { timeoutMs?: number; onCall?: (record: ExplanationCallRecord) => void },
  ) => Promise<ExplanationOutput | null>;
  timeoutMs?: number;
  onCall?: (record: ExplanationCallRecord) => void;
  /** Test seam for the provider-configuration gate. */
  providerConfigured?: () => boolean;
}

export interface ResolvedExplanation {
  assignment: ExperimentAssignment;
  experimentId: string;
  /** null whenever the report must render exactly as it does without this
   * layer: control arm, flag off, no provider configured, no findings,
   * over budget, or any provider failure. */
  explanation: FindingExplanation[] | null;
}

export async function resolveExplanation(
  options: ResolveExplanationOptions,
): Promise<ResolvedExplanation> {
  const experimentId = options.experimentId ?? PERSONALIZED_EXPLANATION_EXPERIMENT_ID;

  // Assignment is computed unconditionally, whether or not the explanation
  // flag is on — a visitor's bucket must not depend on which capabilities
  // happen to be enabled, or turning the flag on mid-experiment would
  // reshuffle who is in which arm.
  const assignment = resolveExperimentAssignment(options.cookieHeader, experimentId);
  const base = { assignment, experimentId };

  // Order matters: every gate that can rule the call out for free comes
  // before anything that consumes protection. A control-arm visitor, a
  // disabled flag, a missing API key or a model off the allowlist must
  // never spend a rate-limit slot or a unit of the daily budget.
  if (!isFeatureEnabled("VISIBILITY_PERSONALIZED_EXPLANATION_ENABLED")) {
    return { ...base, explanation: null };
  }
  if (assignment.variant !== "personalized_explanation") {
    return { ...base, explanation: null };
  }
  const providerConfigured = options.providerConfigured ?? isExplanationProviderConfigured;
  if (!providerConfigured()) {
    return { ...base, explanation: null };
  }
  if (options.nextActions.length === 0) {
    return { ...base, explanation: null };
  }

  if (!checkExplanationRateLimit(options.ip).allowed) {
    return { ...base, explanation: null };
  }
  if (!checkExplanationBestEffortDailyBudget()) {
    return { ...base, explanation: null };
  }

  const input = buildExplanationInput(
    options.nextActions,
    { siteProfile: options.siteProfile, primaryAction: options.primaryAction },
    options.locale,
  );

  const generate = options.generate ?? generateExplanation;
  const result = await generate(input, {
    timeoutMs: options.timeoutMs,
    onCall: options.onCall,
  });

  return { ...base, explanation: result?.findingExplanations ?? null };
}
