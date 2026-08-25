/**
 * API View measurement over OpenRouter, run from CI.
 *
 * This asks the catalog's five API models the scenario's questions and records
 * whether the brand comes back. It measures what a model answers from its own
 * knowledge — not what a person sees on chatgpt.com, which is the Visitor View
 * channel and needs a different provider entirely.
 *
 * It runs beside the product, not through it: nothing here writes to the
 * evidence ledger, mints a permit or bills an order. It exists because the
 * session environment cannot reach the application, and a first real
 * measurement — and the first real cost per answer — is worth more than
 * another month of modelling one.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import type { MeasurementScenario } from "@/lib/visibility-log/scenarios/index";
import { scenarios, scenarioSlugs } from "@/lib/visibility-log/scenarios/all";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_KEY_URL = "https://openrouter.ai/api/v1/key";
const OUTPUT_DIR = "reports/api-view";

/** The catalog's API View models. A run measures the models the plan names. */
const API_MODELS = [
  "anthropic/claude-haiku-4.5",
  "deepseek/deepseek-v3.2",
  "qwen/qwen3.5-9b",
  "mistralai/mistral-small-2603",
  "x-ai/grok-4.5",
] as const;

const MAX_OUTPUT_TOKENS = 1200;
const CONCURRENCY = 4;
/** Hard stop mirroring the plan's providerBudgetCap: a loop must not outspend. */
const DEFAULT_MAX_COST_USD = 2;

/** Cheap catalog model used only to read names out of answers we already paid for. */
const EXTRACTION_MODEL = "anthropic/claude-haiku-4.5";

export type NamedBusiness = { name: string; questions: number; models: number };

export type AnswerRecord = {
  model: string;
  question: string;
  mentioned: boolean;
  needsHumanLook: boolean;
  excerpt: string | null;
  answer: string;
  costUsd: number | null;
  error?: string;
};

/** Word-boundary match, so "Kora" inside another word is not a mention. */
export function findAlias(answer: string, alias: string): string | null {
  const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`\\b${escaped}\\b`, "i").exec(answer);
  if (!match) return null;
  const start = Math.max(0, match.index - 90);
  return answer.slice(start, Math.min(answer.length, match.index + alias.length + 90)).replace(/\s+/g, " ").trim();
}

export function classify(answer: string, scenario: MeasurementScenario) {
  for (const alias of scenario.strongAliases) {
    const excerpt = findAlias(answer, alias);
    if (excerpt) return { mentioned: true, needsHumanLook: false, excerpt };
  }
  for (const alias of scenario.weakAliases) {
    const excerpt = findAlias(answer, alias);
    // A short alias can be someone else's name. The paid tier that resolves
    // this is the human pass; here it is flagged, never counted.
    if (excerpt) return { mentioned: false, needsHumanLook: true, excerpt };
  }
  return { mentioned: false, needsHumanLook: false, excerpt: null };
}

async function askOnce(
  model: string,
  question: string,
  scenario: MeasurementScenario,
  apiKey: string,
  fetchImpl: typeof fetch,
): Promise<AnswerRecord> {
  const base = { model, question };
  try {
    const response = await fetchImpl(OPENROUTER_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: question }],
        // Two runs of one question must differ because the answer changed,
        // not because of sampling.
        temperature: 0,
        max_tokens: MAX_OUTPUT_TOKENS,
        usage: { include: true },
      }),
    });
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300);
      return { ...base, mentioned: false, needsHumanLook: false, excerpt: null, answer: "", costUsd: null, error: `HTTP_${response.status}: ${detail}` };
    }
    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { cost?: number };
    };
    const answer = payload.choices?.[0]?.message?.content ?? "";
    return { ...base, ...classify(answer, scenario), answer, costUsd: payload.usage?.cost ?? null };
  } catch (error) {
    return {
      ...base,
      mentioned: false,
      needsHumanLook: false,
      excerpt: null,
      answer: "",
      costUsd: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * One request that proves the credential works before 125 spend it.
 *
 * Reports the key's shape without printing it: a value pasted with a prefix,
 * a quote or a whole "Authorization: Bearer ..." line is the usual cause of a
 * 401, and the length alone identifies it.
 */
export async function preflight(apiKey: string, fetchImpl: typeof fetch) {
  const shape = {
    length: apiKey.length,
    looksLikeOpenRouterKey: /^sk-or-/.test(apiKey),
    hasWhitespace: /\s/.test(apiKey),
    hasQuotes: /["']/.test(apiKey),
  };
  const response = await fetchImpl(OPENROUTER_KEY_URL, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  return { ok: response.ok, status: response.status, detail: (await response.text()).slice(0, 200), shape };
}

/**
 * Pulls the business names out of the answers, so a report can say who the
 * models name instead of the brand — the part a customer actually acts on.
 *
 * A model reading answers can invent a name, so every returned name must
 * appear verbatim in the text it was read from. Anything that does not is
 * dropped rather than published.
 */
export async function extractNames(
  question: string,
  answers: string[],
  apiKey: string,
  fetchImpl: typeof fetch,
): Promise<string[]> {
  const joined = answers.filter(Boolean).join("\n\n---\n\n").slice(0, 24_000);
  if (!joined) return [];
  const response = await fetchImpl(OPENROUTER_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: EXTRACTION_MODEL,
      temperature: 0,
      max_tokens: 700,
      usage: { include: true },
      messages: [
        {
          role: "user",
          content:
            `Below are AI answers to the question "${question}".\n\n` +
            "List every named restaurant, cafe, food hall, venue or business that appears. " +
            "Return only a JSON array of strings, exactly as each name is written. " +
            "No commentary, no categories, no places that are streets, villages or regions.\n\n" +
            joined,
        },
      ],
    }),
  });
  if (!response.ok) return [];
  const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = payload.choices?.[0]?.message?.content ?? "";
  const match = /\[[\s\S]*\]/.exec(raw);
  if (!match) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const haystack = joined.toLowerCase();
  return parsed
    .filter((name): name is string => typeof name === "string" && name.trim().length > 2)
    .map((name) => name.trim())
    // The guard against an invented name: it has to be in the text.
    .filter((name) => haystack.includes(name.toLowerCase()));
}

export function tallyNames(
  perQuestion: { question: string; models: string[]; names: string[] }[],
): NamedBusiness[] {
  const counts = new Map<string, { questions: number; models: Set<string> }>();
  for (const entry of perQuestion) {
    for (const name of new Set(entry.names)) {
      const current = counts.get(name) ?? { questions: 0, models: new Set<string>() };
      current.questions += 1;
      for (const model of entry.models) current.models.add(model);
      counts.set(name, current);
    }
  }
  return [...counts]
    .map(([name, value]) => ({ name, questions: value.questions, models: value.models.size }))
    .sort((a, b) => b.questions - a.questions || a.name.localeCompare(b.name));
}

export function renderMarkdown(
  scenario: MeasurementScenario,
  records: AnswerRecord[],
  measuredAt: string,
  totalCost: number | null,
  named: NamedBusiness[] = [],
): string {
  const answered = records.filter((record) => !record.error);
  const failed = records.filter((record) => record.error);
  const lines = [
    `# API View: ${scenario.brand}`,
    "",
    `Замер: ${measuredAt}`,
    `Конфигурация: ${scenario.version}`,
    `Вопросов: ${scenario.questions.length} · моделей: ${API_MODELS.length} · ответов: ${records.length}`,
    `Язык: ${scenario.language} · рынок: ${scenario.market}`,
    "",
    "Это API View — что модель отвечает из собственных знаний. Что видит человек",
    "на chatgpt.com, здесь не измерено: это Visitor View, другой канал и другой",
    "поставщик данных.",
    "",
    `Стоимость запуска: ${totalCost === null ? "не сообщена провайдером" : `$${totalCost.toFixed(4)}`}`,
    failed.length > 0 ? `Неудавшихся ответов: ${failed.length}` : "Неудавшихся ответов нет.",
    "",
    "## Упоминания по моделям",
    "",
    "| Модель | Упомянут | Из скольких | Требует проверки человеком |",
    "| --- | --- | --- | --- |",
  ];

  for (const model of API_MODELS) {
    const own = answered.filter((record) => record.model === model);
    const hits = own.filter((record) => record.mentioned).length;
    const flags = own.filter((record) => record.needsHumanLook).length;
    lines.push(`| ${model} | ${hits} | ${own.length} | ${flags} |`);
  }

  const hitRecords = answered.filter((record) => record.mentioned);
  lines.push("", "## Где упомянут", "");
  if (hitRecords.length === 0) {
    lines.push("Ни одна модель не назвала бренд ни на один вопрос.");
  } else {
    for (const record of hitRecords) {
      lines.push(`- **${record.question}** — ${record.model}`, `  > ${record.excerpt}`);
    }
  }

  if (named.length > 0) {
    lines.push(
      "",
      "## Кого называют вместо вас",
      "",
      "Названия взяты из тех же ответов и проверены на дословное присутствие в тексте.",
      "",
      "| Заведение | В скольких вопросах | Сколько моделей знают |",
      "| --- | --- | --- |",
    );
    for (const business of named.slice(0, 25)) {
      lines.push(`| ${business.name} | ${business.questions} из ${scenario.questions.length} | ${business.models} |`);
    }
  }

  const flagged = answered.filter((record) => record.needsHumanLook);
  if (flagged.length > 0) {
    lines.push("", "## Совпало короткое имя — нужен человек", "");
    for (const record of flagged) {
      lines.push(`- **${record.question}** — ${record.model}`, `  > ${record.excerpt}`);
    }
  }

  if (failed.length > 0) {
    lines.push("", "## Ошибки", "");
    for (const record of failed) lines.push(`- ${record.model} · ${record.question} — ${record.error}`);
  }

  return `${lines.join("\n")}\n`;
}

export async function runMeasurement({
  scenario,
  apiKey,
  fetchImpl = fetch,
  maxCostUsd = DEFAULT_MAX_COST_USD,
  onProgress = () => {},
}: {
  scenario: MeasurementScenario;
  apiKey: string;
  fetchImpl?: typeof fetch;
  maxCostUsd?: number;
  onProgress?: (done: number, total: number) => void;
}) {
  const tasks = API_MODELS.flatMap((model) =>
    scenario.questions.map((question) => ({ model, question })),
  );
  const records: AnswerRecord[] = [];
  let spent = 0;
  let stoppedForBudget = false;
  let cursor = 0;

  async function worker() {
    while (cursor < tasks.length) {
      if (spent >= maxCostUsd) {
        stoppedForBudget = true;
        return;
      }
      const task = tasks[cursor++];
      if (!task) return;
      const record = await askOnce(task.model, task.question, scenario, apiKey, fetchImpl);
      records.push(record);
      if (record.costUsd !== null) spent += record.costUsd;
      onProgress(records.length, tasks.length);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const reported = records.filter((record) => record.costUsd !== null);
  return {
    records,
    // Null rather than zero when the provider reported nothing: an unknown
    // cost must not read as a free run.
    totalCost: reported.length > 0 ? spent : null,
    costCoverage: records.length === 0 ? 0 : reported.length / records.length,
    stoppedForBudget,
  };
}

async function main() {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is required.");
  const slug = process.env.MEASURE_PROJECT?.trim() || "korafoodhall";
  const scenario = scenarios[slug];
  if (!scenario) throw new Error(`No scenario for "${slug}". Known: ${scenarioSlugs.join(", ")}`);

  const check = await preflight(apiKey, fetch);
  if (!check.ok) {
    console.error(`Ключ не принят OpenRouter: HTTP ${check.status} ${check.detail}`);
    console.error(
      `Форма ключа — длина ${check.shape.length}, начинается с "sk-or-": ${check.shape.looksLikeOpenRouterKey ? "да" : "нет"}` +
        `, есть пробелы: ${check.shape.hasWhitespace ? "да" : "нет"}` +
        `, есть кавычки: ${check.shape.hasQuotes ? "да" : "нет"}`,
    );
    throw new Error("Замер не запускался: ни один запрос не отправлен.");
  }

  const measuredAt = new Date().toISOString();
  console.log(`${scenario.brand}: ${scenario.questions.length} вопросов × ${API_MODELS.length} моделей`);
  const result = await runMeasurement({
    scenario,
    apiKey,
    maxCostUsd: Number(process.env.MEASURE_MAX_COST_USD ?? DEFAULT_MAX_COST_USD),
    onProgress: (done, total) => {
      if (done % 25 === 0 || done === total) console.log(`  ${done}/${total}`);
    },
  });

  if (result.stoppedForBudget) console.log("Остановлено: достигнут потолок расходов.");

  // Who the models name instead is the part a customer acts on, so it is read
  // out of the answers already paid for — one cheap call per question.
  const perQuestion: { question: string; models: string[]; names: string[] }[] = [];
  for (const question of scenario.questions) {
    const own = result.records.filter((record) => record.question === question && !record.error);
    const names = await extractNames(question, own.map((record) => record.answer), apiKey, fetch);
    perQuestion.push({ question, models: own.map((record) => record.model), names });
  }
  const named = tallyNames(perQuestion);

  await mkdir(OUTPUT_DIR, { recursive: true });
  const stamp = measuredAt.slice(0, 10);
  const base = `${OUTPUT_DIR}/${scenario.project}-${stamp}`;
  await writeFile(`${base}.json`, `${JSON.stringify({ measuredAt, scenario, named, ...result }, null, 2)}\n`);
  await writeFile(`${base}.md`, renderMarkdown(scenario, result.records, measuredAt, result.totalCost, named));

  if (named.length > 0) {
    console.log(`\nКого называют вместо вас (топ 15 из ${named.length}):`);
    for (const business of named.slice(0, 15)) {
      console.log(`  ${business.questions} вопросов · ${business.models} моделей · ${business.name}`);
    }
  }

  const hits = result.records.filter((record) => record.mentioned).length;
  const failures = result.records.filter((record) => record.error);
  console.log(`\nУпоминаний: ${hits} из ${result.records.length}`);
  console.log(`Стоимость: ${result.totalCost === null ? "не сообщена" : `$${result.totalCost.toFixed(4)}`}`);

  // A run where every request failed prints the same success line as a run
  // where the brand was simply absent. The failures have to reach the log, or
  // a broken key reads as "no model knows you".
  if (failures.length > 0) {
    const byReason = new Map<string, number>();
    for (const record of failures) {
      const reason = record.error?.slice(0, 120) ?? "unknown";
      byReason.set(reason, (byReason.get(reason) ?? 0) + 1);
    }
    console.log(`\nНеудавшихся ответов: ${failures.length} из ${result.records.length}`);
    for (const [reason, count] of [...byReason].sort((a, b) => b[1] - a[1]).slice(0, 5)) {
      console.log(`  ${count} × ${reason}`);
    }
  }
  console.log(`\nЗаписано в ${base}.{json,md}`);
  // Nothing measured is a failed run, not a quiet success.
  if (failures.length === result.records.length && result.records.length > 0) {
    throw new Error("Ни один ответ не получен — замер не состоялся.");
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
