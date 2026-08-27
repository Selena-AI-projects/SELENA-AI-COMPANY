import type { MeasurementScenario } from "./index";

/**
 * AVLI — a modern Greek restaurant in Uluwatu, on the Bukit peninsula.
 *
 * Handed over by the owner as a link and nothing else. The cuisine and the area
 * come from what the restaurant publishes about itself; the site could not be
 * read from here, the network policy refuses the domain. Both facts carry the
 * question set, so the basis stays a draft until they are confirmed.
 *
 * Greek food is a narrow category on this island, which cuts both ways: few
 * questions name it, and the ones that do are winnable. The set asks both — the
 * cuisine by name, and the ordinary "where do I eat in Uluwatu" a traveller
 * actually types.
 */
export const avlibaliScenario: MeasurementScenario = {
  version: "avlibali-2026-08-27",
  project: "avlibali",
  brand: "AVLI",
  site: "avlibali.com",
  language: "en",
  market: "Улувату, Бали",
  ownership: "third-party",
  basis: "category-draft",
  strongAliases: ["AVLI Bali", "avlibali.com", "AVLI modern Greek"],
  weakAliases: ["AVLI", "Avli"],
  questions: [
    "Where can I eat Greek food in Bali?",
    "Are there any Greek restaurants in Uluwatu?",
    "Where should I have dinner in Uluwatu?",
    "What are the best Mediterranean restaurants in Bali?",
    "Where can I find souvlaki or gyros in Bali?",
    "Which restaurants in Bali serve mezze made for sharing?",
    "What are the best new restaurants in Bali?",
    "Where should I go for a special occasion dinner in Uluwatu?",
    "Which restaurants on the Bukit peninsula are worth the drive?",
    "Where can I find good seafood in Uluwatu?",
    "Which Uluwatu restaurants take reservations?",
    "Where can I eat well in Uluwatu away from the beach clubs?",
    "What are the best date night restaurants in Bali?",
    "Where can I find lamb dishes in Bali?",
    "Which restaurants in Bali have an open-air courtyard setting?",
    "Where should I have dinner near Bingin or Padang Padang?",
    "Where can a group of eight eat dinner in Uluwatu?",
    "Where can I find wood-fired pita or flatbread in Bali?",
    "What are the most recommended restaurants in Uluwatu?",
    "Which Bali restaurants are best for dinner at sunset?",
    "Where can I find a Mediterranean menu in Uluwatu?",
    "Which upscale restaurants in Bali are worth the price?",
    "Where should I eat in Bali if I want something other than Indonesian food?",
    "Which restaurants in Uluwatu are open for dinner every day?",
    "Where do people go for dinner after a day at Uluwatu beach?",
  ],
};
