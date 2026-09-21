import { createHash, randomUUID } from "node:crypto";

/**
 * Deterministic A/B assignment for `visibility_personalized_explanation_v1`
 * (Decision Log — experiment identity). A first-party, opaque, non-PII
 * cookie identifies a returning visitor across requests; no IP-based
 * bucketing (shared Wi-Fi/NAT/VPN would put many visitors in one bucket)
 * and no fingerprinting — the cookie value is the only signal.
 *
 * Framework-agnostic on purpose: it takes/returns plain strings so it can
 * be unit-tested without a Next.js request context. `app/api/checks/route.ts`
 * is the only caller that touches actual cookie headers.
 */

export const EXPERIMENT_COOKIE_NAME = "selena_exp";
export const EXPERIMENT_COOKIE_MAX_AGE_SECONDS = 90 * 24 * 60 * 60; // 90 days
export const PERSONALIZED_EXPLANATION_EXPERIMENT_ID = "visibility_personalized_explanation_v1";

export type Variant = "control" | "personalized_explanation";

/** Opaque UUID shape only — anything else was not set by `mintExperimentCookieValue`. */
function isValidCookieValue(value: string): boolean {
  return /^[0-9a-f-]{16,64}$/i.test(value);
}

/** Reads the experiment cookie out of a raw `Cookie` request header. */
export function readExperimentCookie(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex === -1) continue;
    const name = part.slice(0, separatorIndex).trim();
    if (name !== EXPERIMENT_COOKIE_NAME) continue;
    const value = part.slice(separatorIndex + 1).trim();
    return isValidCookieValue(value) ? value : null;
  }
  return null;
}

export function mintExperimentCookieValue(): string {
  return randomUUID();
}

/**
 * Deterministic 50/50 split from `cookieValue + experimentId` alone — same
 * input always produces the same variant, so a visitor's bucket is stable
 * across visits and survives a redeploy (no in-memory state involved).
 */
export function assignVariant(cookieValue: string, experimentId: string): Variant {
  const digest = createHash("sha256").update(`${cookieValue}:${experimentId}`).digest();
  return digest[0]! % 2 === 0 ? "control" : "personalized_explanation";
}

export interface ExperimentAssignment {
  cookieValue: string;
  /** True when no valid cookie was present and one had to be minted — the
   * caller must send it back via `Set-Cookie`. */
  isNewCookie: boolean;
  variant: Variant;
}

export function resolveExperimentAssignment(
  cookieHeader: string | null | undefined,
  experimentId: string = PERSONALIZED_EXPLANATION_EXPERIMENT_ID,
): ExperimentAssignment {
  const existing = readExperimentCookie(cookieHeader);
  const cookieValue = existing ?? mintExperimentCookieValue();
  return {
    cookieValue,
    isNewCookie: existing === null,
    variant: assignVariant(cookieValue, experimentId),
  };
}
