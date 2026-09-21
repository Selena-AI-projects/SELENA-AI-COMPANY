import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveExplanation } from "@/lib/visibility/explanation/resolveExplanation";
import {
  EXPERIMENT_COOKIE_NAME,
  PERSONALIZED_EXPLANATION_EXPERIMENT_ID,
  assignVariant,
  mintExperimentCookieValue,
} from "@/lib/visibility/security/bucketing";
import {
  EXPLANATION_RATE_LIMIT_CONFIG,
  resetRateLimitForTests,
} from "@/lib/visibility/security/rate-limit";
import type { LiveFinding } from "@/lib/visibility/liveReport";
import type { ExplanationOutput } from "@/lib/visibility/explanation/contract";

/**
 * The experiment end to end: cookie → deterministic variant → gates →
 * whether the provider is called at all → what the response carries.
 *
 * Proving the hash is deterministic is not enough. What matters
 * commercially is that the control arm never reaches a paid provider and
 * never spends budget, that a disabled flag overrides everything, and that
 * the metadata a visitor receives matches the arm they were actually put
 * in.
 */

const FLAG = "VISIBILITY_PERSONALIZED_EXPLANATION_ENABLED";

function finding(id: string): LiveFinding {
  return {
    id,
    ruleId: "offer.title_present",
    ruleVersion: "readiness-rules-rc6-v1.2",
    state: "fail",
    severity: "critical",
    title: "The page has no usable title",
    detail: "title: (missing)",
    action: "Write a title that names the business and what it actually sells.",
    doesNotProve: "A good title does not by itself change how any AI system answers.",
    pageUrl: "https://example.com/",
    blockId: null,
    selectorOrPath: null,
    evidenceType: "technical_check",
    capturedAt: "2026-09-21T00:00:00.000Z",
    generatedFix: {
      id: `fix:${id}`,
      title: "The page has no usable title",
      instruction: "Write a title.",
      before: "(missing)",
      proposedAfter: "<title>[Brand] — [primary offer]</title>",
      autoApply: false,
    },
  };
}

/** A cookie value that lands in the requested arm, found by trying values. */
function cookieValueForVariant(target: "control" | "personalized_explanation"): string {
  for (let i = 0; i < 500; i += 1) {
    const candidate = mintExperimentCookieValue();
    if (assignVariant(candidate, PERSONALIZED_EXPLANATION_EXPERIMENT_ID) === target) return candidate;
  }
  throw new Error(`could not find a cookie value for ${target}`);
}

type Call = { called: boolean; count: number };

function spyGenerator(output: ExplanationOutput | null) {
  const calls: Call = { called: false, count: 0 };
  const generate = async () => {
    calls.called = true;
    calls.count += 1;
    return output;
  };
  return { calls, generate };
}

function baseOptions(cookieValue: string | null, findings: LiveFinding[] = [finding("f-1")]) {
  return {
    cookieHeader: cookieValue ? `${EXPERIMENT_COOKIE_NAME}=${cookieValue}` : null,
    ip: `198.51.100.${Math.floor(Math.random() * 200) + 1}`,
    nextActions: findings,
    siteProfile: "all_checks" as const,
    primaryAction: "book" as const,
    locale: "en" as const,
    providerConfigured: () => true,
  };
}

async function withFlag<T>(value: "true" | undefined, run: () => Promise<T>): Promise<T> {
  const previous = process.env[FLAG];
  if (value === undefined) delete process.env[FLAG];
  else process.env[FLAG] = value;
  try {
    return await run();
  } finally {
    previous === undefined ? delete process.env[FLAG] : (process.env[FLAG] = previous);
  }
}

test("control arm never calls the provider and never spends budget", async () => {
  resetRateLimitForTests();
  const { calls, generate } = spyGenerator({ findingExplanations: [{ findingId: "f-1", explanation: "x" }] });
  const cookieValue = cookieValueForVariant("control");

  const result = await withFlag("true", () =>
    resolveExplanation({ ...baseOptions(cookieValue), generate }),
  );

  assert.equal(result.assignment.variant, "control");
  assert.equal(calls.called, false, "control must not reach the provider");
  assert.equal(result.explanation, null, "control must carry no explanation");

  // The budget the control request did not spend is still fully available.
  const { calls: secondCalls, generate: secondGenerate } = spyGenerator({
    findingExplanations: [{ findingId: "f-1", explanation: "y" }],
  });
  const variantCookie = cookieValueForVariant("personalized_explanation");
  const second = await withFlag("true", () =>
    resolveExplanation({ ...baseOptions(variantCookie), generate: secondGenerate }),
  );
  assert.equal(secondCalls.called, true);
  assert.ok(second.explanation);
});

test("personalized_explanation arm calls the provider and returns its explanation", async () => {
  resetRateLimitForTests();
  const { calls, generate } = spyGenerator({
    findingExplanations: [{ findingId: "f-1", explanation: "Because booking is your goal." }],
  });
  const cookieValue = cookieValueForVariant("personalized_explanation");

  const result = await withFlag("true", () =>
    resolveExplanation({ ...baseOptions(cookieValue), generate }),
  );

  assert.equal(result.assignment.variant, "personalized_explanation");
  assert.equal(calls.called, true);
  assert.deepEqual(result.explanation, [
    { findingId: "f-1", explanation: "Because booking is your goal." },
  ]);
});

test("experiment metadata matches the assignment the visitor actually got", async () => {
  resetRateLimitForTests();
  const cookieValue = cookieValueForVariant("personalized_explanation");
  const result = await withFlag("true", () =>
    resolveExplanation({ ...baseOptions(cookieValue), generate: spyGenerator(null).generate }),
  );

  assert.equal(result.experimentId, PERSONALIZED_EXPLANATION_EXPERIMENT_ID);
  assert.equal(result.assignment.cookieValue, cookieValue);
  assert.equal(
    result.assignment.variant,
    assignVariant(cookieValue, PERSONALIZED_EXPLANATION_EXPERIMENT_ID),
  );
});

test("feature flag OFF means no provider call in either arm", async () => {
  for (const target of ["control", "personalized_explanation"] as const) {
    resetRateLimitForTests();
    const { calls, generate } = spyGenerator({ findingExplanations: [{ findingId: "f-1", explanation: "x" }] });
    const result = await withFlag(undefined, () =>
      resolveExplanation({ ...baseOptions(cookieValueForVariant(target)), generate }),
    );
    assert.equal(calls.called, false, `${target} must not call the provider with the flag off`);
    assert.equal(result.explanation, null);
    // Assignment still happens, so turning the flag on later does not reshuffle arms.
    assert.equal(result.assignment.variant, target);
  }
});

test("a missing cookie mints a valid one, and the response says it is new", async () => {
  resetRateLimitForTests();
  const result = await withFlag("true", () =>
    resolveExplanation({ ...baseOptions(null), generate: spyGenerator(null).generate }),
  );

  assert.equal(result.assignment.isNewCookie, true);
  assert.match(result.assignment.cookieValue, /^[0-9a-f-]{16,64}$/i);
  assert.equal(
    result.assignment.variant,
    assignVariant(result.assignment.cookieValue, PERSONALIZED_EXPLANATION_EXPERIMENT_ID),
  );
});

test("an existing valid cookie is reused, not replaced", async () => {
  resetRateLimitForTests();
  const cookieValue = mintExperimentCookieValue();
  const first = await withFlag("true", () =>
    resolveExplanation({ ...baseOptions(cookieValue), generate: spyGenerator(null).generate }),
  );
  const second = await withFlag("true", () =>
    resolveExplanation({ ...baseOptions(cookieValue), generate: spyGenerator(null).generate }),
  );

  assert.equal(first.assignment.isNewCookie, false);
  assert.equal(first.assignment.cookieValue, cookieValue);
  assert.equal(second.assignment.variant, first.assignment.variant, "assignment must be stable");
});

test("a malformed cookie is replaced with a freshly minted one rather than trusted", async () => {
  resetRateLimitForTests();
  const result = await withFlag("true", () =>
    resolveExplanation({
      ...baseOptions(null),
      cookieHeader: `${EXPERIMENT_COOKIE_NAME}=<script>alert(1)</script>`,
      generate: spyGenerator(null).generate,
    }),
  );

  assert.equal(result.assignment.isNewCookie, true);
  assert.ok(!result.assignment.cookieValue.includes("<script>"));
  assert.match(result.assignment.cookieValue, /^[0-9a-f-]{16,64}$/i);
});

test("an unconfigured provider is ruled out before any budget is spent", async () => {
  resetRateLimitForTests();
  const cookieValue = cookieValueForVariant("personalized_explanation");
  const { calls, generate } = spyGenerator({ findingExplanations: [{ findingId: "f-1", explanation: "x" }] });

  const blocked = await withFlag("true", () =>
    resolveExplanation({
      ...baseOptions(cookieValue),
      providerConfigured: () => false,
      generate,
    }),
  );
  assert.equal(calls.called, false);
  assert.equal(blocked.explanation, null);

  // The per-IP allowance must be untouched: a full run of allowed calls
  // still succeeds afterwards on that same IP.
  const ip = "203.0.113.50";
  for (let i = 0; i < EXPLANATION_RATE_LIMIT_CONFIG.EXPLANATION_MAX_PER_WINDOW; i += 1) {
    const spy = spyGenerator({ findingExplanations: [{ findingId: "f-1", explanation: "ok" }] });
    const allowed = await withFlag("true", () =>
      resolveExplanation({ ...baseOptions(cookieValue), ip, generate: spy.generate }),
    );
    assert.equal(spy.calls.called, true, `call ${i + 1} should have reached the provider`);
    assert.ok(allowed.explanation);
  }
});

test("no findings means no provider call", async () => {
  resetRateLimitForTests();
  const { calls, generate } = spyGenerator({ findingExplanations: [] });
  const result = await withFlag("true", () =>
    resolveExplanation({ ...baseOptions(cookieValueForVariant("personalized_explanation"), []), generate }),
  );
  assert.equal(calls.called, false);
  assert.equal(result.explanation, null);
});

test("a provider failure leaves the report without an explanation, never an error", async () => {
  resetRateLimitForTests();
  const result = await withFlag("true", () =>
    resolveExplanation({
      ...baseOptions(cookieValueForVariant("personalized_explanation")),
      generate: async () => null,
    }),
  );
  assert.equal(result.explanation, null);
  assert.equal(result.assignment.variant, "personalized_explanation");
});

test("the per-IP explanation allowance stops further provider calls", async () => {
  resetRateLimitForTests();
  const ip = "203.0.113.77";
  const cookieValue = cookieValueForVariant("personalized_explanation");

  for (let i = 0; i < EXPLANATION_RATE_LIMIT_CONFIG.EXPLANATION_MAX_PER_WINDOW; i += 1) {
    const spy = spyGenerator({ findingExplanations: [{ findingId: "f-1", explanation: "ok" }] });
    await withFlag("true", () =>
      resolveExplanation({ ...baseOptions(cookieValue), ip, generate: spy.generate }),
    );
    assert.equal(spy.calls.called, true);
  }

  const blocked = spyGenerator({ findingExplanations: [{ findingId: "f-1", explanation: "no" }] });
  const result = await withFlag("true", () =>
    resolveExplanation({ ...baseOptions(cookieValue), ip, generate: blocked.generate }),
  );
  assert.equal(blocked.calls.called, false, "over the allowance, the provider must not be called");
  assert.equal(result.explanation, null);
});
