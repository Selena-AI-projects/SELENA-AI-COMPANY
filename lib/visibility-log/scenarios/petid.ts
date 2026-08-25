import type { MeasurementScenario } from "./index";

/**
 * PetID.care is measured in Russian: its market and its whole Search Console
 * footprint are Russian. The console showed it surfacing for veterinary
 * queries across several cities, so the questions are the ones an owner asks
 * before picking a service — plus the identification questions the project's
 * own category names.
 */
export const petidScenario: MeasurementScenario = {
  version: "petid-api-view-2026-08-25",
  project: "petid",
  brand: "PetID.care",
  site: "petid.care",
  language: "ru",
  market: "Россия",
  basis: "search-console",
  strongAliases: ["PetID.care", "petid.care", "PetID"],
  weakAliases: ["PetID", "ПетАйДи"],
  questions: [
    "Как найти хорошую ветклинику рядом?",
    "Что делать, если потерялась собака?",
    "Как оформить ветеринарный паспорт для собаки?",
    "Зачем чипировать питомца и как это делают?",
    "Как проверить, чипирован ли найденный кот?",
    "Где хранить документы и прививки питомца?",
    "Какие сервисы помогают найти потерявшегося питомца?",
    "Как вывезти собаку за границу: какие документы нужны?",
    "Как выбрать ветеринара для кошки?",
    "Есть ли приложения для учёта прививок питомца?",
    "Что нужно сделать сразу после того, как завели щенка?",
    "Как узнать владельца по номеру чипа?",
    "Какие бывают электронные паспорта для животных?",
    "Где посмотреть график прививок для собаки?",
    "Как найти передержку для собаки?",
    "Что делать, если питомец заболел ночью?",
    "Как оформить документы для перевозки кошки самолётом?",
    "Какие сервисы для владельцев животных есть в России?",
    "Как выбрать зоогостиницу?",
    "Где вести медицинскую карту питомца онлайн?",
    "Как найти грумера для собаки?",
    "Что делать, если нашёл чужого питомца на улице?",
    "Как поставить питомца на учёт?",
    "Какие есть базы данных чипированных животных?",
    "Как подготовить питомца к переезду в другую страну?",
  ],
};
