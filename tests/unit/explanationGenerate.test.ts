import { test } from "node:test";
import assert from "node:assert/strict";
import { generateExplanation } from "@/lib/visibility/explanation/generate";
import type { ExplanationInput } from "@/lib/visibility/explanation/contract";

/**
 * The audit must never depend on OpenAI's availability (owner decision,
 * "Failure behavior"). These cover every gate that returns `null` before
 * any network call is attempted — the ones this sandbox can actually
 * exercise without a live API key. A real call (schema success rate,
 * latency, measured cost) needs a real key and belongs to the staging
 * acceptance run, not this suite.
 */

function sampleInput(): ExplanationInput {
  return {
    locale: "en",
    businessContext: { siteProfile: "all_checks", primaryAction: "book" },
    findings: [
      {
        id: "action.human_ready:https://example.com:page",
        severity: "critical",
        title: "A customer cannot easily complete the primary action",
        action: "Make the chosen primary action reachable in one step from the homepage.",
        doesNotProve: "Human readiness says nothing about whether a machine or agent can complete the same action.",
      },
    ],
  };
}

test("returns null without calling OpenAI when OPENAI_API_KEY is unset", async () => {
  const previous = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const result = await generateExplanation(sampleInput());
    assert.equal(result, null);
  } finally {
    if (previous !== undefined) process.env.OPENAI_API_KEY = previous;
  }
});

test("returns null for a model outside the allowlist, even with a key present", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.VISIBILITY_EXPLANATION_MODEL;
  process.env.OPENAI_API_KEY = "test-key-not-a-real-secret";
  process.env.VISIBILITY_EXPLANATION_MODEL = "gpt-5.5-pro-unvetted-and-expensive";
  try {
    const result = await generateExplanation(sampleInput());
    assert.equal(result, null);
  } finally {
    previousKey === undefined ? delete process.env.OPENAI_API_KEY : (process.env.OPENAI_API_KEY = previousKey);
    previousModel === undefined
      ? delete process.env.VISIBILITY_EXPLANATION_MODEL
      : (process.env.VISIBILITY_EXPLANATION_MODEL = previousModel);
  }
});

test("returns null immediately when there are no findings to explain", async () => {
  const previous = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "test-key-not-a-real-secret";
  try {
    const result = await generateExplanation({ ...sampleInput(), findings: [] });
    assert.equal(result, null);
  } finally {
    previous === undefined ? delete process.env.OPENAI_API_KEY : (process.env.OPENAI_API_KEY = previous);
  }
});
