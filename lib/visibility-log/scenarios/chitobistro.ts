import type { MeasurementScenario } from "./index";

/**
 * Chito Bistro — a working restaurant on Bali that is not ours.
 *
 * The area it sits in is not known here and the site could not be read: the
 * network policy refuses the domain. A restaurant's visibility is mostly
 * local, so four of the questions name the main areas outright — whichever one
 * Chito is in, at least one question covers it — and the rest ask at the level
 * of Bali. Once the area is known the set should be rewritten around it and
 * the measurement re-run; at $0.23 that is cheap, and nothing here is
 * published, so a rough first pass costs nothing but the run.
 */
export const chitobistroScenario: MeasurementScenario = {
  version: "chitobistro-api-view-2026-08-25",
  project: "chitobistro",
  brand: "Chito Bistro",
  site: "chitobistro.com",
  language: "en",
  market: "Бали",
  ownership: "third-party",
  basis: "category-draft",
  strongAliases: ["Chito Bistro", "chitobistro.com", "Chito"],
  weakAliases: [],
  questions: [
    "What are the best bistros in Bali?",
    "Where can I find European food in Bali?",
    "What are the best brunch spots in Bali?",
    "Which restaurants in Bali have a good wine list?",
    "Where should I go for a date night dinner in Bali?",
    "Where can I eat well in Bali away from the beach club scene?",
    "What are the best small restaurants in Bali?",
    "Where do locals and long-term expats eat in Bali?",
    "Which places in Bali serve both good coffee and good food?",
    "Where can I find a quiet dinner in Bali?",
    "What are the best new restaurants in Bali?",
    "Where should I eat in Canggu?",
    "Where should I eat in Seminyak?",
    "Where should I eat in Ubud?",
    "Where should I eat in Uluwatu?",
    "Which restaurants in Bali work well for a group?",
    "Where can I find comfort food in Bali?",
    "Which restaurants in Bali have the best atmosphere?",
    "Where should I have lunch in Bali?",
    "Which restaurants in Bali are good for vegetarians?",
    "Where can I find fresh pasta in Bali?",
    "Which restaurants in Bali take reservations?",
    "Where do people go for a special occasion dinner in Bali?",
    "What are the most recommended places to eat in Bali?",
    "Which bistro should I try in Bali?",
  ],
};
