import OpenAI from "openai";
import {
  buildExplanationResponseSchema,
  validateExplanationOutput,
  type ExplanationInput,
  type ExplanationOutput,
} from "./contract";

/**
 * OpenAI call wrapper for the personalized explanation layer (Decision Log
 * D-023, D-024). Every failure mode — missing key, disallowed model,
 * timeout, provider error, invalid JSON, an id outside the confirmed set,
 * an empty result — returns `null`. The caller renders the existing
 * deterministic report exactly as it does today; there is no user-facing
 * error path for this layer, because the audit must never depend on
 * OpenAI's availability (owner decision, "Failure behavior").
 */

/** Config only — never branch business logic on a literal model name. */
const DEFAULT_MODEL = "gpt-5-mini";
/**
 * Cost-protection allowlist (owner decision, "Cost protection: model
 * allowlist"). `VISIBILITY_EXPLANATION_MODEL` can select among these, but
 * cannot point at an arbitrary, unvetted, possibly-expensive model.
 */
const ALLOWED_MODELS = new Set(["gpt-5-mini", "gpt-5-nano"]);

const DEFAULT_TIMEOUT_MS = 6_000;
/**
 * §8.2 smoke run (2026-09-22, 22 real calls, 0% schema success): gpt-5-mini
 * is a reasoning model and its hidden reasoning tokens count against this
 * same budget. At 600 the model spent the whole allowance reasoning and
 * returned empty content with every single call — confirmed by every
 * failed call's `outputTokens` landing on exactly 600. Raised well above
 * the observed reasoning-token consumption, matched with `reasoning_effort:
 * "minimal"` below so a short paraphrase task does not need to reason much
 * in the first place.
 */
const MAX_OUTPUT_TOKENS = 2_500;
/** One retry, only for a transient-looking failure — not automatic multiple retries. */
const MAX_ATTEMPTS = 2;

export interface ExplanationCallRecord {
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  success: boolean;
  /** Set on failure: "no_api_key" | "model_not_allowed" | "timeout" | "provider_error" | "invalid_schema" | "empty_result" | "attempt_1_failed_retrying" */
  failureReason?: string;
}

function resolveModel(): string | null {
  const configured = (process.env.VISIBILITY_EXPLANATION_MODEL || DEFAULT_MODEL).trim();
  return ALLOWED_MODELS.has(configured) ? configured : null;
}

/**
 * Whether a provider call is even possible right now: a key exists and the
 * configured model is on the allowlist. Callers check this *before* they
 * spend a rate-limit slot or a unit of the daily budget — a request that
 * cannot succeed must not consume protection meant for requests that can.
 */
export function isExplanationProviderConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY) && resolveModel() !== null;
}

function systemPrompt(locale: ExplanationInput["locale"]): string {
  // The boundary is enforced twice: by the JSON schema (no field exists for
  // a score/severity/verdict) and here, in words, because a model can still
  // choose bad phrasing inside a schema-valid string.
  const rules =
    locale === "ru"
      ? [
          "Ты объясняешь уже подтверждённые находки бесплатной проверки сайта Selena Systems.",
          "Используй только факты, переданные в findings ниже. Никогда не добавляй новые находки, оценки, ранги, статистику, утверждения о видимости в AI, выручке или конкурентах.",
          "Не выноси общий вердикт (\"сайт готов\" / \"сайт не готов\"). Объясняй только конкретную находку в контексте цели визитёра.",
          "Каждое объяснение — не больше 1-2 коротких предложений. Если находка уже понятна из title/action без добавления контекста — верни явно пустую строку для неё, не сочиняй объяснение ради факта его наличия.",
        ]
      : [
          "You explain already-confirmed findings from a free website check by Selena Systems.",
          "Use only the facts supplied in findings below. Never introduce a new finding, score, ranking, statistic, or claim about AI visibility, revenue, or competitors.",
          "Never issue an overall verdict (\"the site is ready\" / \"not ready\"). Explain only the specific finding, in the context of the visitor's stated goal.",
          "Each explanation is at most 1-2 short sentences. If a finding is already clear from its title/action without added context, return an empty string for it rather than inventing text just to fill the field.",
        ];
  return rules.join(" ");
}

function userPrompt(input: ExplanationInput): string {
  const { businessContext, findings } = input;
  const lines = findings.map(
    (f) =>
      `- id: ${f.id}\n  severity: ${f.severity}\n  title: ${f.title}\n  action: ${f.action}\n  does_not_prove: ${f.doesNotProve}`,
  );
  return [
    `site_profile: ${businessContext.siteProfile}`,
    `primary_action: ${businessContext.primaryAction}`,
    "findings:",
    ...lines,
  ].join("\n");
}

export async function generateExplanation(
  input: ExplanationInput,
  options: { timeoutMs?: number; onCall?: (record: ExplanationCallRecord) => void } = {},
): Promise<ExplanationOutput | null> {
  const record = (partial: Partial<ExplanationCallRecord>) => {
    options.onCall?.({
      model: partial.model ?? "unknown",
      inputTokens: partial.inputTokens ?? 0,
      outputTokens: partial.outputTokens ?? 0,
      latencyMs: partial.latencyMs ?? 0,
      success: partial.success ?? false,
      failureReason: partial.failureReason,
    });
  };

  if (input.findings.length === 0) return null;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    record({ failureReason: "no_api_key" });
    return null;
  }

  const model = resolveModel();
  if (!model) {
    record({ failureReason: "model_not_allowed" });
    return null;
  }

  const confirmedIds = input.findings.map((f) => f.id);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const client = new OpenAI({ apiKey, timeout: timeoutMs, maxRetries: 0 });

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const startedAt = Date.now();
    try {
      const response = await client.chat.completions.create({
        model,
        max_completion_tokens: MAX_OUTPUT_TOKENS,
        // A short paraphrase of already-decided facts needs little
        // reasoning; keeping it low is a second, independent defense next
        // to the raised token budget above (community reports show
        // reasoning_effort is not always honored together with
        // max_completion_tokens, so this is a mitigation, not a guarantee).
        reasoning_effort: "minimal",
        messages: [
          { role: "system", content: systemPrompt(input.locale) },
          { role: "user", content: userPrompt(input) },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "personalized_explanation",
            strict: true,
            schema: buildExplanationResponseSchema(confirmedIds),
          },
        },
      });
      const latencyMs = Date.now() - startedAt;
      const inputTokens = response.usage?.prompt_tokens ?? 0;
      const outputTokens = response.usage?.completion_tokens ?? 0;

      const raw = response.choices[0]?.message?.content;
      if (!raw) {
        record({ model, inputTokens, outputTokens, latencyMs, failureReason: "empty_result" });
        return null; // schema-valid empty content is not worth retrying
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        record({ model, inputTokens, outputTokens, latencyMs, failureReason: "invalid_schema" });
        return null; // a well-formed model call that failed to parse will not parse on retry
      }

      const validated = validateExplanationOutput(parsed, confirmedIds);
      if (!validated || validated.findingExplanations.length === 0) {
        record({ model, inputTokens, outputTokens, latencyMs, failureReason: "empty_result" });
        return null; // a schema-valid but empty/all-filtered result is not worth retrying
      }

      record({ model, inputTokens, outputTokens, latencyMs, success: true });
      return validated;
    } catch (error) {
      const latencyMs = Date.now() - startedAt;
      const status = error instanceof OpenAI.APIError ? error.status : undefined;
      // Only a transient-looking failure (timeout or 5xx) is worth one retry;
      // a 4xx (bad request, auth) will not succeed on a second attempt.
      const retryable = status === undefined || status === 408 || status >= 500;
      const willRetry = retryable && attempt < MAX_ATTEMPTS;
      record({
        model,
        latencyMs,
        failureReason: willRetry ? "attempt_1_failed_retrying" : status === 408 ? "timeout" : "provider_error",
      });
      if (!willRetry) return null;
    }
  }
  return null;
}
