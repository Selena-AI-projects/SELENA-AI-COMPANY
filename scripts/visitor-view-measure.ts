/**
 * Visitor View measurement over Bright Data, run from CI.
 *
 * This asks the three sold surfaces the project's questions and records what a
 * person would have been shown: whether the brand came back, who was named
 * instead, and which sources the answer displayed. It is the $49 tier's
 * observation, produced beside the product rather than through it — nothing
 * here writes to the evidence ledger, mints a permit or bills an order.
 *
 * It exists for the same reason the API View script does: the session
 * environment cannot reach a provider, and a real measurement is worth more
 * than another month of modelling one.
 *
 * A third-party project may be measured — the answers are public and the cost
 * is ours — but its result never reaches the public journal without that
 * owner's yes. The report says so on its own first line.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import {
  askBrightData,
  BRIGHTDATA_PRICE_PER_ANSWER_USD,
  type BrightDataAsk,
  type BrightDataSurface,
  brightDataSurfaces,
  measurableBrightDataSurfaces,
  unreachableBrightDataSurfaces,
} from "@/lib/visibility-log/brightdata";
import type { MeasurementScenario } from "@/lib/visibility-log/scenarios/index";
import { scenarios, scenarioSlugs } from "@/lib/visibility-log/scenarios/all";
import { classify } from "./api-view-measure";

const OUTPUT_DIR = "reports/visitor-view";

/**
 * A collector can take minutes. Enough in flight to finish a project inside a
 * CI job, few enough that a wrong token fails on a handful rather than on all
 * seventy-five.
 */
/**
 * Measured, not guessed: at six in flight Perplexity delivered two answers in
 * twenty-five — the rest were still producing when their window closed. The
 * collector is the bottleneck, so fewer at once finishes more.
 */
const CONCURRENCY = 3;

/** 75 answers cost about $0.11; the ceiling leaves room and still bounds a loop. */
const DEFAULT_MAX_COST_USD = 0.5;

export type SurfaceRecord = {
  surface: BrightDataSurface;
  question: string;
  mentioned: boolean;
  needsHumanLook: boolean;
  excerpt: string | null;
  answerChars: number;
  sourceDomains: string[];
  requestId: string | null;
  error: string | null;
};

export function toRecord(ask: BrightDataAsk, scenario: MeasurementScenario): SurfaceRecord {
  if (ask.answer === null) {
    return {
      surface: ask.surface,
      question: ask.question,
      mentioned: false,
      needsHumanLook: false,
      excerpt: null,
      answerChars: 0,
      sourceDomains: [],
      requestId: ask.requestId,
      error: ask.error ?? "NO_ANSWER",
    };
  }
  const verdict = classify(ask.answer, scenario);
  return {
    surface: ask.surface,
    question: ask.question,
    mentioned: verdict.mentioned,
    needsHumanLook: verdict.needsHumanLook,
    excerpt: verdict.excerpt,
    answerChars: ask.answer.length,
    sourceDomains: [...new Set(ask.sources.map((source) => source.domain))],
    requestId: ask.requestId,
    error: null,
  };
}

export function tallyDomains(records: SurfaceRecord[]): { domain: string; answers: number }[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    for (const domain of record.sourceDomains) counts.set(domain, (counts.get(domain) ?? 0) + 1);
  }
  return [...counts]
    .map(([domain, answers]) => ({ domain, answers }))
    .sort((a, b) => b.answers - a.answers || a.domain.localeCompare(b.domain));
}

/**
 * A rate over a fraction of the sample is not a small version of the real rate,
 * it is a different number wearing the same sign. Below this coverage the
 * report shows the counts and withholds the percentage.
 */
const MIN_COVERAGE = 0.8;

function rate(part: number, answered: number, asked: number): string {
  if (answered === 0 || asked === 0) return "—";
  if (answered / asked < MIN_COVERAGE) return "мало данных";
  return `${Math.round((part / answered) * 100)}%`;
}

export function renderMarkdown(
  scenario: MeasurementScenario,
  records: SurfaceRecord[],
  measuredAt: string,
  spentUsd: number,
): string {
  const answered = records.filter((record) => record.error === null);
  const failed = records.filter((record) => record.error !== null);
  const mentions = answered.filter((record) => record.mentioned);
  const flagged = answered.filter((record) => record.needsHumanLook);

  const lines: string[] = [];
  lines.push(`# Visitor View: ${scenario.brand}`);
  lines.push("");
  if (scenario.ownership === "third-party") {
    lines.push(
      "**Чужой бизнес.** Замер сделан за наш счёт по публичным ответам. Публиковать этот результат нельзя, пока владелец не сказал «да».",
    );
    lines.push("");
  }
  lines.push(`Замер: ${measuredAt}`);
  lines.push(`Конфигурация: ${scenario.version} · основание вопросов: ${scenario.basis}`);
  lines.push(
    `Вопросов: ${scenario.questions.length} · поверхностей: ${measurableBrightDataSurfaces.length} · ответов запрошено: ${records.length}`,
  );
  lines.push(`Язык: ${scenario.language} · рынок: ${scenario.market}`);
  if (unreachableBrightDataSurfaces.length > 0) {
    lines.push("");
    lines.push(
      `Не замерено: ${unreachableBrightDataSurfaces
        .map((surface) => brightDataSurfaces[surface].label)
        .join(", ")} — коллектор этой поверхности недоступен. Это не «бренд не назван», это «не спрашивали».`,
    );
  }
  lines.push("");
  lines.push("Это Visitor View — то, что видит человек на живой поверхности. Что модель");
  lines.push("отвечает из собственных знаний, здесь не измерено: это API View, другой");
  lines.push("канал. Два канала не усредняются.");
  lines.push("");
  lines.push(`Потрачено: $${spentUsd.toFixed(4)} (по прайсу $${BRIGHTDATA_PRICE_PER_ANSWER_USD} за ответ)`);
  lines.push(
    failed.length > 0 ? `Ответов не получено: ${failed.length} из ${records.length}` : "Все ответы получены.",
  );
  lines.push("");

  lines.push("## Упоминания по поверхностям");
  lines.push("");
  lines.push("| Поверхность | Ответов | Бренд назван | Доля | Требует глаза |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const surface of measurableBrightDataSurfaces) {
    const asked = records.filter((record) => record.surface === surface);
    const own = answered.filter((record) => record.surface === surface);
    const named = own.filter((record) => record.mentioned).length;
    const look = own.filter((record) => record.needsHumanLook).length;
    lines.push(
      `| ${brightDataSurfaces[surface].label} | ${own.length} из ${asked.length} | ${named} | ${rate(named, own.length, asked.length)} | ${look} |`,
    );
  }
  lines.push(
    `| **Всего** | **${answered.length} из ${records.length}** | **${mentions.length}** | **${rate(mentions.length, answered.length, records.length)}** | **${flagged.length}** |`,
  );
  lines.push("");
  lines.push(
    `Доля считается только там, где вернулось не меньше ${Math.round(MIN_COVERAGE * 100)}% ответов. Ниже этого порога доля не показывается: ${100 - Math.round(MIN_COVERAGE * 100)}% недостающих ответов способны перевернуть любой процент.`,
  );
  lines.push("");

  const domains = tallyDomains(answered);
  lines.push("## На что ссылались ответы");
  lines.push("");
  if (domains.length === 0) {
    lines.push("Ни один ответ не показал источников — или поверхность их не показывает, или они пришли в поле, которого мы не знаем.");
  } else {
    lines.push("| Домен | В скольких ответах |");
    lines.push("| --- | --- |");
    for (const entry of domains.slice(0, 25)) lines.push(`| ${entry.domain} | ${entry.answers} |`);
    if (domains.length > 25) lines.push(`| … ещё ${domains.length - 25} доменов | |`);
  }
  lines.push("");

  if (mentions.length > 0) {
    lines.push("## Где бренд назван");
    lines.push("");
    for (const record of mentions) {
      lines.push(`- **${brightDataSurfaces[record.surface].label}** — ${record.question}`);
      if (record.excerpt) lines.push(`  > …${record.excerpt}…`);
    }
    lines.push("");
  }

  if (flagged.length > 0) {
    lines.push("## Совпало слабое имя — нужен человек");
    lines.push("");
    lines.push("Короткое имя может принадлежать кому-то другому. Это не засчитано как упоминание.");
    lines.push("");
    for (const record of flagged) {
      lines.push(`- **${brightDataSurfaces[record.surface].label}** — ${record.question}`);
      if (record.excerpt) lines.push(`  > …${record.excerpt}…`);
    }
    lines.push("");
  }

  if (failed.length > 0) {
    lines.push("## Что не вернулось");
    lines.push("");
    const byReason = new Map<string, number>();
    for (const record of failed) byReason.set(record.error ?? "", (byReason.get(record.error ?? "") ?? 0) + 1);
    for (const [reason, count] of [...byReason].sort((a, b) => b[1] - a[1])) lines.push(`- \`${reason}\` — ${count}`);
    lines.push("");
  }

  lines.push("## Чего это не доказывает");
  lines.push("");
  lines.push("- Один замер — это один момент. Ответы поверхностей меняются день ото дня.");
  lines.push("- Замер не говорит, сколько людей задали эти вопросы. Он говорит, что ответили тем, кто задал.");
  lines.push("- Ноль упоминаний не значит, что бизнес плохой. Он значит, что в этих ответах его не было.");
  return lines.join("\n");
}

async function inBatches<T, R>(items: T[], size: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let index = 0; index < items.length; index += size) {
    results.push(...(await Promise.all(items.slice(index, index + size).map(worker))));
  }
  return results;
}

export async function runMeasurement(options: {
  scenario: MeasurementScenario;
  apiKey: string;
  maxCostUsd: number;
  measuredAt: string;
}): Promise<{ records: SurfaceRecord[]; spentUsd: number; report: string }> {
  const { scenario, apiKey, maxCostUsd, measuredAt } = options;
  const asks = measurableBrightDataSurfaces.flatMap((surface) =>
    scenario.questions.map((question) => ({ surface, question })),
  );
  const planned = asks.length * BRIGHTDATA_PRICE_PER_ANSWER_USD;
  if (planned > maxCostUsd) {
    throw new Error(
      `Ceiling too low: ${asks.length} answers cost about $${planned.toFixed(4)}, ceiling is $${maxCostUsd.toFixed(4)}`,
    );
  }

  let done = 0;
  const results = await inBatches(asks, CONCURRENCY, async (ask) => {
    const answer = await askBrightData(ask.surface, ask.question, apiKey);
    done += 1;
    if (done % CONCURRENCY === 0 || done === asks.length) console.log(`  ${done}/${asks.length}`);
    return answer;
  });

  const records = results.map((ask) => toRecord(ask, scenario));
  // The provider bills every answer it was asked for, including the ones that
  // came back unreadable: spend is what was requested, not what parsed.
  const spentUsd = records.length * BRIGHTDATA_PRICE_PER_ANSWER_USD;
  return { records, spentUsd, report: renderMarkdown(scenario, records, measuredAt, spentUsd) };
}

async function main(): Promise<number> {
  const apiKey = process.env.BRIGHTDATA_API_TOKEN?.trim();
  if (!apiKey) {
    console.error("BRIGHTDATA_API_TOKEN is not set");
    return 1;
  }
  const slug = (process.env.MEASURE_PROJECT ?? "").trim();
  const scenario = scenarios[slug as keyof typeof scenarios] as MeasurementScenario | undefined;
  if (!scenario) {
    console.error(`Unknown project "${slug}". Known: ${scenarioSlugs.join(", ")}`);
    return 1;
  }
  const maxCostUsd = Number(process.env.MEASURE_MAX_COST_USD ?? DEFAULT_MAX_COST_USD);
  if (!Number.isFinite(maxCostUsd) || maxCostUsd <= 0) {
    console.error("MEASURE_MAX_COST_USD must be a positive number");
    return 1;
  }

  const measuredAt = new Date().toISOString().slice(0, 10);
  console.log(`Visitor View: ${scenario.brand} — ${scenario.questions.length} questions × 3 surfaces`);
  const { records, report } = await runMeasurement({ scenario, apiKey, maxCostUsd, measuredAt });

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(`${OUTPUT_DIR}/${measuredAt}-${slug}.md`, `${report}\n`, "utf8");
  console.log(`\n${report}`);

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) await writeFile(summaryPath, `${report}\n`, { flag: "a", encoding: "utf8" });

  // A run where nothing came back is a failed run, not a zero-visibility
  // result: silence from the provider must never read like silence from the AI.
  return records.some((record) => record.error === null) ? 0 : 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().then(
    (code) => process.exit(code),
    (error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    },
  );
}
