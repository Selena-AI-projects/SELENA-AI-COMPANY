export const aiCodeCrossReviewArticle = {
  path: "/ru/blog/kak-proveryat-ai-kod",
  title: "Как проверять код, если вы не разработчик",
  seoTitle: "Как проверять AI-код без разработчика",
  description:
    "Практический workflow перекрёстной проверки AI-разработки: Codex, Claude Code, GitHub, автоматические тесты и обязательные решения владельца.",
  subtitle:
    "Мой workflow перекрёстной проверки: Codex реализует задачу, Claude Code независимо проверяет результат, а автоматические тесты подтверждают ключевые сценарии.",
  publishedAt: "2026-08-30",
  updatedAt: "2026-08-30",
  author: "Селена Нигматуллаева",
  authorRole: "Основатель и AI Systems Architect",
  pageKey: "ai_code_cross_review",
  tags: [
    "AI-разработка",
    "Codex",
    "Claude Code",
    "GitHub",
    "AI workflow",
    "Перекрёстная проверка",
    "AI safety",
    "Для владельцев бизнеса",
  ],
  workflowSteps: [
    "Владелец формулирует задачу, ограничения и стоп-условия.",
    "ChatGPT помогает собрать контекст и подготовить понятное техническое задание.",
    "Codex реализует задачу в отдельной feature-ветке и добавляет нужные тесты.",
    "Изменения фиксируются точным commit SHA.",
    "GitHub запускает предусмотренные проектом проверки: типы, тесты, сборку и другие CI-gates.",
    "Claude Code получает то же ТЗ и проверяет тот же commit или exact diff в read-only режиме.",
    "Если найдены проблемы, Codex получает конкретные замечания со ссылкой на проверяемый код.",
    "После исправлений создаётся новый commit, поэтому предыдущая проверка помечается устаревшей.",
    "Тесты и независимая проверка изменённого diff запускаются повторно.",
    "Merge, deploy, расходы и production остаются owner-gates.",
  ],
  socialImage: {
    url: "/media/school/codex-claude-cross-review-workflow-ru.png",
    alt: "Сравнение ручного переноса заданий между AI-системами и workflow с GitHub как единым источником истины.",
    width: 1200,
    height: 630,
  },
} as const;

const campaignQuery = new URLSearchParams({
  utm_source: "telegram",
  utm_medium: "social",
  utm_campaign: "ai_code_cross_review",
  utm_content: "workflow_post",
}).toString();

export const aiCodeCrossReviewTelegramCampaignPath =
  `${aiCodeCrossReviewArticle.path}?${campaignQuery}` as const;
