/**
 * Per-question, per-system results for one measurement.
 *
 * The summary record next to this one says how many answers named the brand.
 * This says which ones — the question, the system, and who was named there
 * instead. It is the difference between "you are hard to find" and "on this
 * question you lose to this place", and only the second is a conversation.
 *
 * Each question is asked of each system once, so a cell is not a count: it is
 * answered/not answered and named/not named. Three states, never two — an
 * answer that never came back is not a zero, and collapsing it into one would
 * turn provider silence into AI silence.
 *
 * Written by the measurement run, not by hand. Until a run has published its
 * detail, a project simply has none and the page shows the summary alone.
 */
import fs from "node:fs";
import path from "node:path";
import type { ProjectSlug } from "./data";

export type MeasurementChannel = "VISITOR" | "API";

export type MeasurementCell = {
  systemId: string;
  /** Whether the provider returned anything to read at all. */
  answered: boolean;
  /** Null when nothing came back: UNKNOWN, not false. */
  mentioned: boolean | null;
};

export type MeasurementQuestion = {
  text: string;
  cells: MeasurementCell[];
  /** Businesses named on this question while the brand was not. */
  namedInstead: string[];
  /** Domains the answers to this question pointed at, most cited first. */
  citedDomains: string[];
};

export type MeasurementSystem = {
  /** The id as measured; the label is resolved for display. */
  systemId: string;
  channel: MeasurementChannel;
};

export type MeasurementDetail = {
  date: string;
  configVersion: string;
  /** Column order, visitor surfaces first — what a person sees comes first. */
  systems: MeasurementSystem[];
  questions: MeasurementQuestion[];
};

/** Human names for the model ids the catalog measures. */
const systemLabels: Record<string, string> = {
  "anthropic/claude-haiku-4.5": "Claude",
  "deepseek/deepseek-v3.2": "DeepSeek",
  "qwen/qwen3.5-9b": "Qwen",
  "mistralai/mistral-small-2603": "Mistral",
  "x-ai/grok-4.5": "Grok",
};

export function systemLabel(systemId: string): string {
  return systemLabels[systemId] ?? systemId;
}

export type SystemTotals = {
  systemId: string;
  channel: MeasurementChannel;
  answered: number;
  mentioned: number;
};

export function systemTotals(detail: MeasurementDetail): SystemTotals[] {
  return detail.systems.map((system) => {
    let answered = 0;
    let mentioned = 0;
    for (const question of detail.questions) {
      const cell = question.cells.find((candidate) => candidate.systemId === system.systemId);
      if (!cell?.answered) continue;
      answered += 1;
      if (cell.mentioned) mentioned += 1;
    }
    return { systemId: system.systemId, channel: system.channel, answered, mentioned };
  });
}

/**
 * Details come from `data/journal/<slug>/<date>.json`, written by the
 * measurement run and never by hand. Reading them from disk rather than from a
 * TypeScript literal is what lets a job publish one: a machine can add a file,
 * and a person can read the diff before it goes out.
 */
const journalRoot = path.join(process.cwd(), "data", "journal");

export function parseDetail(file: string, raw: string): MeasurementDetail {
  const value = JSON.parse(raw) as MeasurementDetail;
  // A malformed file is thrown rather than skipped. Skipping would publish a
  // page that quietly omits a measurement, which reads as a measurement that
  // found nothing.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.date)) throw new Error(`${file}: no date`);
  if (!value.configVersion) throw new Error(`${file}: no configuration version`);
  if (!Array.isArray(value.systems) || value.systems.length === 0)
    throw new Error(`${file}: no systems`);
  if (!Array.isArray(value.questions) || value.questions.length === 0)
    throw new Error(`${file}: no questions`);
  for (const question of value.questions) {
    if (!question.text) throw new Error(`${file}: a question has no text`);
    for (const system of value.systems) {
      if (!question.cells.some((cell) => cell.systemId === system.systemId))
        throw new Error(`${file}: "${question.text}" has no cell for ${system.systemId}`);
    }
  }
  return value;
}

function readDetails(): Partial<Record<ProjectSlug, MeasurementDetail[]>> {
  if (!fs.existsSync(journalRoot)) return {};
  const byProject: Partial<Record<ProjectSlug, MeasurementDetail[]>> = {};
  for (const slug of fs.readdirSync(journalRoot)) {
    const dir = path.join(journalRoot, slug);
    if (!fs.statSync(dir).isDirectory()) continue;
    const details = fs
      .readdirSync(dir)
      .filter((file) => file.endsWith(".json"))
      .sort()
      .map((file) => parseDetail(`${slug}/${file}`, fs.readFileSync(path.join(dir, file), "utf8")));
    if (details.length > 0) byProject[slug as ProjectSlug] = details;
  }
  return byProject;
}

export const measurementDetails = readDetails();

export function detailsFor(slug: ProjectSlug): MeasurementDetail[] {
  return measurementDetails[slug] ?? [];
}
