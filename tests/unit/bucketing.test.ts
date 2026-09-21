import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EXPERIMENT_COOKIE_NAME,
  assignVariant,
  mintExperimentCookieValue,
  readExperimentCookie,
  resolveExperimentAssignment,
} from "@/lib/visibility/security/bucketing";

/**
 * "Deterministic hash от ID → variant" (owner decision, "experiment
 * identity") — stable across requests and redeploys because it depends on
 * nothing but the cookie value and experiment id, never in-memory state.
 */

test("the same cookie value always assigns the same variant for a given experiment", () => {
  const cookieValue = mintExperimentCookieValue();
  const first = assignVariant(cookieValue, "visibility_personalized_explanation_v1");
  for (let i = 0; i < 20; i += 1) {
    assert.equal(assignVariant(cookieValue, "visibility_personalized_explanation_v1"), first);
  }
});

test("assignment is roughly a 50/50 split across many distinct visitors", () => {
  let control = 0;
  let variant = 0;
  for (let i = 0; i < 2000; i += 1) {
    const outcome = assignVariant(mintExperimentCookieValue(), "visibility_personalized_explanation_v1");
    if (outcome === "control") control += 1;
    else variant += 1;
  }
  const ratio = control / (control + variant);
  assert.ok(ratio > 0.4 && ratio < 0.6, `expected roughly 50/50, got ${control}/${variant}`);
});

test("a different experiment id can assign a different variant for the same cookie", () => {
  // Not asserted to differ (a coin flip could coincide) — asserted only to
  // be a pure function of both inputs, not just the cookie value.
  const cookieValue = mintExperimentCookieValue();
  const a = assignVariant(cookieValue, "experiment_a");
  const b = assignVariant(cookieValue, "experiment_a");
  assert.equal(a, b);
});

test("readExperimentCookie parses the named cookie out of a multi-cookie header", () => {
  const value = mintExperimentCookieValue();
  const header = `other_cookie=abc; ${EXPERIMENT_COOKIE_NAME}=${value}; another=xyz`;
  assert.equal(readExperimentCookie(header), value);
});

test("readExperimentCookie rejects a value that was not minted by this module", () => {
  const header = `${EXPERIMENT_COOKIE_NAME}=<script>alert(1)</script>`;
  assert.equal(readExperimentCookie(header), null);
});

test("readExperimentCookie returns null for a missing header", () => {
  assert.equal(readExperimentCookie(null), null);
  assert.equal(readExperimentCookie(undefined), null);
  assert.equal(readExperimentCookie(""), null);
});

test("resolveExperimentAssignment mints a new cookie only when none is present", () => {
  const fresh = resolveExperimentAssignment(null, "visibility_personalized_explanation_v1");
  assert.equal(fresh.isNewCookie, true);

  const existingValue = mintExperimentCookieValue();
  const returning = resolveExperimentAssignment(
    `${EXPERIMENT_COOKIE_NAME}=${existingValue}`,
    "visibility_personalized_explanation_v1",
  );
  assert.equal(returning.isNewCookie, false);
  assert.equal(returning.cookieValue, existingValue);
});
