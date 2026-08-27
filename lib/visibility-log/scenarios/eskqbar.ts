import type { MeasurementScenario } from "./index";

/**
 * ESKQ Bar — a steak house, grill and wine lounge in Canggu.
 *
 * Handed over by the owner as a link and nothing else, so the category and the
 * area come from what the venue publishes about itself in public listings: the
 * site could not be read from here, the network policy refuses the domain. Two
 * facts carry the question set — steak and wine, and Canggu — and both are the
 * venue's own words. Until they are confirmed the basis stays a draft.
 *
 * A bar's visibility is bought by area, so most questions name Canggu outright;
 * the rest ask at the level of Bali, where the venue competes with everything.
 */
export const eskqbarScenario: MeasurementScenario = {
  version: "eskqbar-2026-08-27",
  project: "eskqbar",
  brand: "ESKQ Bar",
  site: "eskq.bar",
  language: "en",
  market: "Чангу, Бали",
  ownership: "third-party",
  basis: "category-draft",
  strongAliases: ["ESKQ Bar", "ESKQbar", "eskq.bar"],
  weakAliases: ["ESKQ"],
  questions: [
    "Where can I get a good steak in Bali?",
    "Where can I get a good steak in Canggu?",
    "What are the best wine bars in Bali?",
    "Which bar in Canggu has a good wine list?",
    "Where can I find a steakhouse in Canggu?",
    "Where can I smoke shisha in Canggu?",
    "Which places in Canggu are open late at night?",
    "Where can I eat after midnight in Bali?",
    "What are the best bars in Canggu?",
    "Where should I go for dinner and drinks in Canggu?",
    "Which restaurants in Canggu serve grilled meat?",
    "Where can I take a date for dinner in Canggu?",
    "Where do long-term expats go out in Canggu?",
    "Which restaurants near Jalan Raya Babakan in Canggu are worth visiting?",
    "Where can I order a ribeye or tenderloin in Bali?",
    "Which places in Bali serve both dinner and shisha?",
    "Where can I book a table for a group dinner in Canggu?",
    "What are the best new bars in Canggu?",
    "Where can I find a quiet bar in Canggu?",
    "Where should I celebrate a birthday dinner in Bali?",
    "Where should I go for barbecue in Bali?",
    "Which wine bars in Bali have the largest selection?",
    "Where can I eat well in Canggu away from the beach club scene?",
    "What are the most recommended bars in Canggu?",
    "Which bars in Bali stay open until 2am?",
  ],
};
