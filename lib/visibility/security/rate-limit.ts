import { createHash, randomBytes } from "node:crypto";

/**
 * Per-IP rate limiting for the public check endpoint (architecture §14.4).
 *
 * This endpoint makes our server fetch an arbitrary URL on request, which
 * is an abuse vector regardless of how safe the fetch itself is. A cap is
 * mandatory before it can be opened publicly.
 *
 * KNOWN LIMITATION: state lives in process memory, so on serverless each
 * instance counts separately and a cold start resets the window. That
 * meaningfully slows a single abusive client but is not a hard global
 * guarantee. Durable, shared rate limiting needs a store — it lands with
 * Supabase (Decision Log D-005). Documented rather than silently assumed.
 */

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
/**
 * Public default stays 5/hour/IP. A workshop where a room shares one Wi-Fi IP
 * needs a higher ceiling for a few hours: set CHECK_RATE_LIMIT_PER_HOUR to
 * raise it, and unset it afterwards. An unset, zero, or unparseable value
 * keeps the safe default, so production behaviour is unchanged until it is
 * deliberately set.
 */
function resolveMaxPerWindow(): number {
  const raw = Number(process.env.CHECK_RATE_LIMIT_PER_HOUR);
  return Number.isInteger(raw) && raw > 0 ? raw : 5;
}
const MAX_PER_WINDOW = resolveMaxPerWindow();
const MAX_TRACKED_CLIENTS = 10_000;

/** Rotating per-process salt: stored client keys are not reversible to an IP. */
const SALT = randomBytes(16).toString("hex");

type Entry = { count: number; windowStart: number };

const buckets = new Map<string, Entry>();

function hashClient(ip: string): string {
  return createHash("sha256").update(`${SALT}:${ip}`).digest("hex").slice(0, 32);
}

/** Best-effort client IP from proxy headers, falling back to a shared bucket. */
export function clientIpFrom(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(ip: string, now = Date.now()): RateLimitResult {
  // Cheap eviction so a long-lived process cannot grow this map without bound.
  if (buckets.size > MAX_TRACKED_CLIENTS) {
    for (const [key, entry] of buckets) {
      if (now - entry.windowStart > WINDOW_MS) buckets.delete(key);
    }
  }

  const key = hashClient(ip);
  const entry = buckets.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_PER_WINDOW - 1, retryAfterSeconds: 0 };
  }

  if (entry.count >= MAX_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil((entry.windowStart + WINDOW_MS - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_PER_WINDOW - entry.count, retryAfterSeconds: 0 };
}

/**
 * Second, stricter limiter for the personalized-explanation LLM call
 * (Decision Log D-024). Separate from `checkRateLimit` above because the
 * two protect different costs — a check is a handful of public GETs, an
 * explanation is a paid OpenAI call — and a visitor who is within the
 * check limit should not automatically be within the explanation limit.
 *
 * Same KNOWN LIMITATION as above: in-memory, per-process, resets on cold
 * start. This is documented as a pre-production guardrail (owner decision,
 * "Cost protection"), not a durable production control — a real production
 * rollout needs Supabase (D-005) or equivalent before it can rely on this
 * alone.
 */
const EXPLANATION_WINDOW_MS = 60 * 60 * 1000; // 1 hour
function resolveExplanationMaxPerWindow(): number {
  const raw = Number(process.env.VISIBILITY_EXPLANATION_PER_IP_PER_HOUR);
  return Number.isInteger(raw) && raw > 0 ? raw : 3;
}
const EXPLANATION_MAX_PER_WINDOW = resolveExplanationMaxPerWindow();
const explanationBuckets = new Map<string, Entry>();

export function checkExplanationRateLimit(ip: string, now = Date.now()): RateLimitResult {
  if (explanationBuckets.size > MAX_TRACKED_CLIENTS) {
    for (const [key, entry] of explanationBuckets) {
      if (now - entry.windowStart > EXPLANATION_WINDOW_MS) explanationBuckets.delete(key);
    }
  }

  const key = hashClient(ip);
  const entry = explanationBuckets.get(key);

  if (!entry || now - entry.windowStart > EXPLANATION_WINDOW_MS) {
    explanationBuckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: EXPLANATION_MAX_PER_WINDOW - 1, retryAfterSeconds: 0 };
  }

  if (entry.count >= EXPLANATION_MAX_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil((entry.windowStart + EXPLANATION_WINDOW_MS - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  entry.count += 1;
  return { allowed: true, remaining: EXPLANATION_MAX_PER_WINDOW - entry.count, retryAfterSeconds: 0 };
}

/**
 * Process-global, UTC-day-scoped counter. Named `BestEffort*` deliberately
 * — on serverless with multiple instances this is N separate counters, not
 * one, so it slows a runaway cost incident but does not bound it exactly.
 * Treat any number derived from it as a guardrail, never a hard spend cap.
 */
function resolveExplanationDailySoftCap(): number {
  const raw = Number(process.env.VISIBILITY_EXPLANATION_DAILY_SOFT_CAP);
  return Number.isInteger(raw) && raw > 0 ? raw : 200;
}
const EXPLANATION_DAILY_SOFT_CAP = resolveExplanationDailySoftCap();
let dailyExplanationCount = 0;
let dailyExplanationDay = "";

function currentUtcDay(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

/** Returns false once today's best-effort soft cap is reached. Call only
 * right before an explanation call actually starts, not speculatively. */
export function checkExplanationBestEffortDailyBudget(now = Date.now()): boolean {
  const day = currentUtcDay(now);
  if (day !== dailyExplanationDay) {
    dailyExplanationDay = day;
    dailyExplanationCount = 0;
  }
  if (dailyExplanationCount >= EXPLANATION_DAILY_SOFT_CAP) return false;
  dailyExplanationCount += 1;
  return true;
}

/** Test helper — never called from application code. */
export function resetRateLimitForTests(): void {
  buckets.clear();
  explanationBuckets.clear();
  dailyExplanationCount = 0;
  dailyExplanationDay = "";
}

export const RATE_LIMIT_CONFIG = { WINDOW_MS, MAX_PER_WINDOW } as const;
export const EXPLANATION_RATE_LIMIT_CONFIG = {
  EXPLANATION_WINDOW_MS,
  EXPLANATION_MAX_PER_WINDOW,
  EXPLANATION_DAILY_SOFT_CAP,
} as const;
