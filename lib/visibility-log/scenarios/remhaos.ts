import type { MeasurementScenario } from "./index";

/**
 * remhaos.com, as the owner describes it: designer, architect and foreman work
 * on one renovation in one place. A change made once changes everywhere, and
 * the client follows the site through the app. It is for interior designers,
 * small studios, and people having a renovation done.
 *
 * Measured in Russian first, because that is the market where the owner can
 * read the answers and say whether they are the questions her buyers ask. The
 * English set for the US market follows once this one has a baseline.
 */
export const remhaosScenario: MeasurementScenario = {
  version: "remhaos-ru-api-view-2026-08-25",
  project: "remhaos",
  brand: "remhaos.com",
  site: "remhaos.com",
  language: "ru",
  market: "Россия",
  ownership: "own",
  basis: "owner-brief",
  strongAliases: ["remhaos.com", "RemHaos", "remhaos", "Рем Хаус", "РемХаус"],
  weakAliases: [],
  questions: [
    "Как контролировать ремонт квартиры, если я не строитель?",
    "Какие программы помогают вести ремонт?",
    "Как дизайнеру интерьера вести несколько проектов одновременно?",
    "Где хранить все документы и чертежи по ремонту в одном месте?",
    "Как согласовывать изменения между дизайнером и прорабом?",
    "Что делать, если дизайнер и строители говорят разное?",
    "Как отслеживать смету по ремонту, чтобы она не росла незаметно?",
    "Какие сервисы есть для дизайн-студий интерьера?",
    "Как вести технический надзор за ремонтом удалённо?",
    "Как контролировать ремонт, если я живу в другом городе?",
    "Чем заменить таблицы Excel при управлении ремонтом?",
    "Как организовать работу архитектора, дизайнера и прораба на одном объекте?",
    "Какие CRM подходят для студии дизайна интерьера?",
    "Как вести график работ по ремонту?",
    "Где вести спецификацию материалов по проекту?",
    "Как принимать работы у строительной бригады?",
    "Какие приложения помогают следить за ходом стройки?",
    "Как не потерять изменения в проекте ремонта?",
    "Как показывать клиенту прогресс ремонта?",
    "Какие есть сервисы управления ремонтом под ключ?",
    "Как маленькой дизайн-студии выстроить процессы?",
    "Как считать закупку материалов на объект?",
    "Что использовать вместо переписки в мессенджерах при ремонте?",
    "Как вести несколько объектов ремонта одновременно?",
    "Как контролировать сроки ремонта?",
  ],
};
