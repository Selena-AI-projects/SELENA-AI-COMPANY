import { NextResponse } from "next/server";
import { isExplanationProviderConfigured } from "@/lib/visibility/explanation/generate";

export const runtime = "nodejs";

/**
 * No-secret, no-cost diagnostic for the §8.2 smoke-test route. It reveals
 * only booleans — never a value, never a network call — so it carries none
 * of the risk the smoke-test route itself needs a secret against.
 *
 * It exists purely to tell apart, from the outside, the two things that
 * otherwise look identical as an HTTP 404 on the smoke-test route itself:
 * the deployed build not having the secret yet, versus the token used at
 * the URL being wrong. Delete this alongside the smoke-test route once
 * the run is done.
 */
export async function GET() {
  return NextResponse.json({
    smokeTestSecretConfigured: Boolean(process.env.EXPLANATION_SMOKE_TEST_SECRET),
    // Reuses the real gate from generate.ts — doubles as a live check of
    // §8.4 (OPENAI_API_KEY present, model on the allowlist) at no cost.
    explanationProviderConfigured: isExplanationProviderConfigured(),
  });
}
