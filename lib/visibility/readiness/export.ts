import type { AgentReadinessCheckResult, AgentReadinessResult } from "./agentReadiness";
import type { VisibilityLocale } from "../types";

function fixable(check: AgentReadinessCheckResult): boolean {
  return check.status === "failed" || check.status === "warning";
}

const PROFILE_RU: Record<AgentReadinessResult["profile"], string> = {
  all_checks: "все проверки",
  content_site: "контентный сайт",
  api_application: "API / приложение",
  commerce: "коммерция",
};

const STATUS_RU: Record<AgentReadinessCheckResult["status"], string> = {
  passed: "пройдено",
  warning: "предупреждение",
  failed: "не пройдено",
  not_applicable: "не применяется",
  unknown: "неизвестно",
};

function checkMarkdown(check: AgentReadinessCheckResult, locale: VisibilityLocale): string {
  const evidence = check.evidence.map((item) => `- ${item}`).join("\n");
  const steps = check.fix.steps.map((item, index) => `${index + 1}. ${item}`).join("\n");
  const code = check.fix.codeBlocks.map((item) => `\n\`\`\`text\n${item}\n\`\`\``).join("\n");
  return locale === "ru"
    ? `## ${check.checkId} — ${check.title}\n\n**Статус:** ${STATUS_RU[check.status]}\n\n**Проверено:** ${check.checkedTarget}\n\n### Доказательства\n${evidence}\n\n### Почему это важно\n${check.explanation}\n\n### Как исправить\n${steps}${code}\n\n### Проверка\n${check.verification.map((item) => `- ${item}`).join("\n")}\n\n### Что это не доказывает\n${check.doesNotProve.map((item) => `- ${item}`).join("\n")}`
    : `## ${check.checkId} — ${check.title}\n\n**Status:** ${check.status}\n\n**Checked:** ${check.checkedTarget}\n\n### Evidence\n${evidence}\n\n### Why it matters\n${check.explanation}\n\n### How to fix\n${steps}${code}\n\n### Verification\n${check.verification.map((item) => `- ${item}`).join("\n")}\n\n### What this does not prove\n${check.doesNotProve.map((item) => `- ${item}`).join("\n")}`;
}

export function serializeFixInstructions(
  readiness: AgentReadinessResult,
  locale: VisibilityLocale,
): string {
  const checks = readiness.checks.filter(fixable);
  const heading = locale === "ru"
    ? `# Исправления: публичная готовность сайта\n\nВерсия реестра проверок: ${readiness.registryVersion}\nПрофиль: ${PROFILE_RU[readiness.profile]}\n\n`
    : `# Public Readiness fixes\n\nRegistry: ${readiness.registryVersion}\nProfile: ${readiness.profile}\n\n`;
  return `${heading}${checks.map((check) => checkMarkdown(check, locale)).join("\n\n---\n\n")}`;
}

export function serializeFullReadinessReport(
  readiness: AgentReadinessResult,
  locale: VisibilityLocale,
): string {
  const heading = locale === "ru"
    ? `# Отчёт: публичная готовность сайта\n\nОбщий балл готовности для агентов: ${readiness.score ?? "не измерен"}/100\n${readiness.profileEvidence}\n\n`
    : `# Public Readiness report\n\nOverall Agent Readiness: ${readiness.score ?? "not measured"}/100\n${readiness.profileEvidence}\n\n`;
  const categories = readiness.categories
    .map((item) => locale === "ru"
      ? `- ${item.label}: ${item.score ?? "н/д"}/100 (применимо: ${item.applicableChecks}, не применяется: ${item.notApplicableChecks})`
      : `- ${item.label}: ${item.score ?? "N/A"}/100 (${item.applicableChecks} applicable, ${item.notApplicableChecks} N/A)`)
    .join("\n");
  return `${heading}## ${locale === "ru" ? "Категории" : "Categories"}\n${categories}\n\n${readiness.checks.map((check) => checkMarkdown(check, locale)).join("\n\n---\n\n")}`;
}

export function serializeCodingAgentPrompt(
  readiness: AgentReadinessResult,
  locale: VisibilityLocale,
): string {
  const fixes = serializeFixInstructions(readiness, locale);
  const boundary = locale === "ru"
    ? "Работай только с перечисленными проблемами публичной готовности сайта. Сначала прочитай существующий код и конфигурацию. Не читай и не выводи секреты, не отключай защиту, не изменяй рабочую версию сайта автоматически. Подготовь ограниченный набор изменений, предпросмотр и план отката; затем выполни указанные проверки. Не трактуй рост готовности как доказанный рост AI Visibility."
    : "Work only on the listed public-readiness findings. Read the existing code and configuration first. Do not read or expose secrets, weaken security, or change production automatically. Prepare a scoped diff, preview and rollback; then run the listed verification checks. Do not treat improved readiness as proof of improved AI Visibility.";
  return `${boundary}\n\n${fixes}`;
}
