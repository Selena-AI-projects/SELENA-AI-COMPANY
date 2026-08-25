/**
 * Runs the free Public Readiness check against every project in the journal
 * and writes the result to `reports/readiness/`.
 *
 * This is rung one of the ladder and nothing more: it reads public pages and
 * makes no paid provider call, so it says nothing about whether an AI system
 * mentions the site.
 *
 * It exists as a script rather than a manual pass through /check because the
 * session environment's network policy refuses outbound connections to the
 * project domains. GitHub Actions can reach them, so the workflow runs there.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { runLiveCheck, type LiveReport } from "@/lib/visibility/liveReport";
import { journalProjects } from "@/lib/visibility-log/data";

const OUTPUT_DIR = "reports/readiness";
/** Well above the 20s API budget: nothing here is answering an HTTP request. */
const BUDGET_MS = 45_000;

export type ProjectReadiness = {
  slug: string;
  name: string;
  url: string;
  reachable: boolean;
  fetchError?: string;
  score: number | null;
  coverage: number;
  pagesChecked: number;
  topBlocker: string | null;
  nextActions: string[];
  failingFindings: { title: string; severity: string; pageUrl: string }[];
};

export function summarize(
  project: { slug: string; name: string; url: string },
  report: LiveReport,
): ProjectReadiness {
  const failing = report.findings.filter((finding) => finding.state === "fail");
  return {
    slug: project.slug,
    name: project.name,
    url: project.url,
    reachable: report.reachable,
    ...(report.fetchError ? { fetchError: report.fetchError } : {}),
    score: report.readiness.score,
    coverage: report.readiness.coverage,
    pagesChecked: report.pagesChecked.length,
    topBlocker: report.topBlocker?.title ?? null,
    nextActions: report.nextActions.map((finding) => finding.title),
    failingFindings: failing.map((finding) => ({
      title: finding.title,
      severity: finding.severity,
      pageUrl: finding.pageUrl,
    })),
  };
}

export function renderMarkdown(results: ProjectReadiness[], checkedAt: string): string {
  const lines = [
    "# Public Readiness по проектам журнала",
    "",
    `Проверено: ${checkedAt}`,
    "",
    "Это первая, бесплатная ступень лестницы: только публичные страницы,",
    "ни одного платного запроса к AI. О том, упоминают ли сайт AI-системы,",
    "здесь не сказано ничего.",
    "",
    "| Проект | Доступен | Балл | Покрытие | Страниц | Главный блокер |",
    "| --- | --- | --- | --- | --- | --- |",
  ];

  for (const result of results) {
    lines.push(
      `| ${result.name} | ${result.reachable ? "да" : `нет (${result.fetchError ?? "?"})`} | ` +
        `${result.score ?? "—"} | ${Math.round(result.coverage * 100)}% | ${result.pagesChecked} | ` +
        `${result.topBlocker ?? "—"} |`,
    );
  }

  for (const result of results) {
    lines.push("", `## ${result.name}`, "", result.url, "");
    if (!result.reachable) {
      lines.push(`Сайт не ответил: ${result.fetchError ?? "причина не определена"}.`);
      continue;
    }
    if (result.failingFindings.length === 0) {
      lines.push("Провалов среди проверенных правил нет.");
    } else {
      lines.push("Провалы:");
      for (const finding of result.failingFindings) {
        lines.push(`- [${finding.severity}] ${finding.title} — ${finding.pageUrl}`);
      }
    }
    if (result.nextActions.length > 0) {
      lines.push("", "Следующие шаги:");
      for (const action of result.nextActions) lines.push(`- ${action}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

async function main() {
  const checkedAt = new Date().toISOString();
  const results: ProjectReadiness[] = [];

  for (const project of journalProjects) {
    process.stdout.write(`${project.slug}… `);
    try {
      const report = await runLiveCheck({
        url: project.url,
        primaryAction: "other",
        siteProfile: "all_checks",
        locale: "ru",
        totalBudgetMs: BUDGET_MS,
      });
      results.push(summarize(project, report));
      process.stdout.write(`балл ${report.readiness.score ?? "—"}\n`);
    } catch (error) {
      // One unreachable site must not cost the other six their check.
      results.push({
        slug: project.slug,
        name: project.name,
        url: project.url,
        reachable: false,
        fetchError: error instanceof Error ? error.message : String(error),
        score: null,
        coverage: 0,
        pagesChecked: 0,
        topBlocker: null,
        nextActions: [],
        failingFindings: [],
      });
      process.stdout.write("не удалось\n");
    }
  }

  await mkdir(OUTPUT_DIR, { recursive: true });
  const stamp = checkedAt.slice(0, 10);
  await writeFile(
    `${OUTPUT_DIR}/readiness-${stamp}.json`,
    `${JSON.stringify({ checkedAt, results }, null, 2)}\n`,
  );
  await writeFile(`${OUTPUT_DIR}/readiness-${stamp}.md`, renderMarkdown(results, checkedAt));
  console.log(`\nЗаписано в ${OUTPUT_DIR}/readiness-${stamp}.{json,md}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
