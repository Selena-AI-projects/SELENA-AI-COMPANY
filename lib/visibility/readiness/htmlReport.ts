import type { AgentReadinessCheckResult, AgentReadinessResult } from "./agentReadiness";
import type { VisibilityLocale } from "../types";

export type AuditDocumentMode = "full" | "fixes";

/** Crawled-site strings (titles, evidence) may contain markup — always escape. */
function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function list(items: readonly string[]): string {
  return `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

const STATUS_LABELS: Record<VisibilityLocale, Record<AgentReadinessCheckResult["status"], string>> = {
  en: {
    passed: "Passed",
    warning: "Warning",
    failed: "Failed",
    not_applicable: "Not applicable",
    unknown: "Unknown",
  },
  ru: {
    passed: "Пройдено",
    warning: "Внимание",
    failed: "Проблема",
    not_applicable: "Не применяется",
    unknown: "Неизвестно",
  },
};

const COPY: Record<
  VisibilityLocale,
  {
    fullTitle: string;
    fixesTitle: string;
    brand: string;
    site: string;
    date: string;
    score: string;
    notMeasured: string;
    categories: string;
    checked: string;
    evidence: string;
    why: string;
    fix: string;
    verify: string;
    doesNotProve: string;
    boundary: string;
    printHint: string;
  }
> = {
  en: {
    fullTitle: "AI Visibility — Website Audit",
    fixesTitle: "AI Visibility — Fix Plan",
    brand: "Selena Systems · AI Visibility",
    site: "Website",
    date: "Checked",
    score: "Agent Readiness score",
    notMeasured: "not measured",
    categories: "Results by category",
    checked: "Checked",
    evidence: "Evidence",
    why: "Why it matters",
    fix: "How to fix",
    verify: "How to verify the fix",
    doesNotProve: "What this does not prove",
    boundary:
      "This document reports technical and content readiness of public pages. It is not observed AI visibility and does not prove that any AI system mentions or recommends the business.",
    printHint: "To save as PDF: open this file in a browser and print it (Cmd/Ctrl+P → Save as PDF).",
  },
  ru: {
    fullTitle: "AI Visibility — аудит сайта",
    fixesTitle: "AI Visibility — план исправлений",
    brand: "Selena Systems · AI Visibility",
    site: "Сайт",
    date: "Проверено",
    score: "Балл готовности для агентов",
    notMeasured: "не измерено",
    categories: "Результаты по категориям",
    checked: "Что проверялось",
    evidence: "Доказательства",
    why: "Почему это важно",
    fix: "Как исправить",
    verify: "Как проверить исправление",
    doesNotProve: "Что это не доказывает",
    boundary:
      "Документ описывает техническую и контентную готовность публичных страниц. Это не наблюдаемая AI-видимость: он не доказывает, что какая-либо AI-система упоминает или рекомендует бизнес.",
    printHint: "Чтобы сохранить в PDF: откройте файл в браузере и распечатайте (Cmd/Ctrl+P → «Сохранить как PDF»).",
  },
};

const STYLES = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 2.5rem 1.5rem; background: #f7f2ea; color: #161413;
    font: 16px/1.6 Georgia, "Times New Roman", serif; }
  main { max-width: 52rem; margin: 0 auto; }
  header { border-bottom: 2px solid #8f5c34; padding-bottom: 1.5rem; margin-bottom: 2rem; }
  .brand { font: 600 16px/1.4 system-ui, sans-serif; letter-spacing: 0.14em;
    text-transform: uppercase; color: #8f5c34; }
  h1 { font-size: 2.2rem; line-height: 1.1; margin: 0.75rem 0 0; }
  .meta { margin-top: 1rem; font-family: system-ui, sans-serif; }
  .meta div { margin-top: 0.25rem; }
  .meta b { color: #8f5c34; }
  .score { font-size: 2.6rem; font-weight: 600; color: #8f5c34; }
  .boundary { background: #fffdf8; border: 1px solid #e6ddd1; border-left: 4px solid #8f5c34;
    padding: 1rem 1.25rem; margin: 1.5rem 0; font-family: system-ui, sans-serif; }
  table { width: 100%; border-collapse: collapse; margin: 1rem 0 2rem;
    font-family: system-ui, sans-serif; }
  th, td { text-align: left; padding: 0.6rem 0.75rem; border-bottom: 1px solid #e6ddd1; }
  th { text-transform: uppercase; letter-spacing: 0.08em; font-size: 16px; color: #6e6258; }
  h2 { font-size: 1.6rem; border-bottom: 1px solid #e6ddd1; padding-bottom: 0.5rem;
    margin: 2.5rem 0 1rem; }
  article { background: #fffdf8; border: 1px solid #e6ddd1; border-radius: 0.75rem;
    padding: 1.5rem; margin: 1.25rem 0; page-break-inside: avoid; }
  article h3 { margin: 0; font-size: 1.25rem; }
  .status { display: inline-block; font: 600 16px/1 system-ui, sans-serif;
    padding: 0.35rem 0.8rem; border-radius: 999px; margin-bottom: 0.75rem; }
  .status.passed { background: #e9f2ea; color: #2e7d4f; }
  .status.warning { background: #f8efdb; color: #9a5f14; }
  .status.failed { background: #f9e6e1; color: #b23a2d; }
  .status.not_applicable, .status.unknown { background: #efe9df; color: #6e6258; }
  h4 { font: 600 16px/1.4 system-ui, sans-serif; text-transform: uppercase;
    letter-spacing: 0.1em; color: #8f5c34; margin: 1.25rem 0 0.4rem; }
  ul, ol { margin: 0.4rem 0; padding-left: 1.4rem; }
  li { margin: 0.3rem 0; }
  pre { background: #211e1b; color: #f7f2ea; padding: 1rem; border-radius: 0.5rem;
    overflow-x: auto; font-size: 16px; white-space: pre-wrap; word-break: break-word; }
  footer { margin-top: 3rem; border-top: 1px solid #e6ddd1; padding-top: 1rem;
    font-family: system-ui, sans-serif; color: #6e6258; }
  @media print {
    body { background: #fff; padding: 0; }
    article { border-color: #ccc; }
    .print-hint { display: none; }
  }
`;

function checkArticle(check: AgentReadinessCheckResult, locale: VisibilityLocale, mode: AuditDocumentMode): string {
  const t = COPY[locale];
  const steps = check.fix.steps.length
    ? `<h4>${t.fix}</h4><ol>${check.fix.steps.map((step) => `<li>${esc(step)}</li>`).join("")}</ol>${check.fix.codeBlocks
        .map((code) => `<pre>${esc(code)}</pre>`)
        .join("")}`
    : "";
  const fixable = check.status === "failed" || check.status === "warning";
  return `<article>
    <span class="status ${check.status}">${STATUS_LABELS[locale][check.status]}</span>
    <h3>${esc(check.checkId)} — ${esc(check.title)}</h3>
    <h4>${t.checked}</h4><p>${esc(check.checkedTarget)}</p>
    ${check.evidence.length ? `<h4>${t.evidence}</h4>${list(check.evidence)}` : ""}
    <h4>${t.why}</h4><p>${esc(check.explanation)}</p>
    ${fixable || mode === "fixes" ? steps : ""}
    ${fixable && check.verification.length ? `<h4>${t.verify}</h4>${list(check.verification)}` : ""}
    ${check.doesNotProve.length ? `<h4>${t.doesNotProve}</h4>${list(check.doesNotProve)}` : ""}
  </article>`;
}

export function buildAuditHtmlDocument(input: {
  readiness: AgentReadinessResult;
  locale: VisibilityLocale;
  siteUrl: string;
  checkedAt: string;
  mode: AuditDocumentMode;
}): string {
  const { readiness, locale, siteUrl, checkedAt, mode } = input;
  const t = COPY[locale];
  const title = mode === "fixes" ? t.fixesTitle : t.fullTitle;
  const checks =
    mode === "fixes"
      ? readiness.checks.filter((check) => check.status === "failed" || check.status === "warning")
      : readiness.checks;

  const categoriesTable =
    mode === "full"
      ? `<h2>${t.categories}</h2><table><thead><tr><th>${t.categories}</th><th>${t.score}</th></tr></thead><tbody>${readiness.categories
          .map(
            (category) =>
              `<tr><td>${esc(category.label)}</td><td>${category.score === null ? (locale === "ru" ? "н/д" : "N/A") : `${category.score}/100`}</td></tr>`,
          )
          .join("")}</tbody></table>`
      : "";

  const grouped =
    mode === "full"
      ? readiness.categories
          .map((category) => {
            const inCategory = checks.filter((check) => check.category === category.id);
            if (inCategory.length === 0) return "";
            return `<h2>${esc(category.label)}</h2>${inCategory.map((check) => checkArticle(check, locale, mode)).join("")}`;
          })
          .join("")
      : checks.map((check) => checkArticle(check, locale, mode)).join("");

  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — ${esc(siteUrl)}</title>
<style>${STYLES}</style>
</head>
<body>
<main>
  <header>
    <p class="brand">${esc(t.brand)}</p>
    <h1>${esc(title)}</h1>
    <div class="meta">
      <div><b>${t.site}:</b> ${esc(siteUrl)}</div>
      <div><b>${t.date}:</b> ${esc(checkedAt)}</div>
      <div><b>${t.score}:</b> <span class="score">${readiness.score === null ? t.notMeasured : `${readiness.score}/100`}</span></div>
    </div>
  </header>
  <div class="boundary">${esc(t.boundary)}</div>
  <p class="print-hint">${esc(t.printHint)}</p>
  ${categoriesTable}
  ${grouped}
  <footer>
    <div>${esc(t.brand)} · ${esc(readiness.registryVersion)}</div>
    <div>${esc(readiness.profileEvidence)}</div>
  </footer>
</main>
</body>
</html>`;
}
