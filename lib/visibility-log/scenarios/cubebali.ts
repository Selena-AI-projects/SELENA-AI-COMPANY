import type { MeasurementScenario } from "./index";

/**
 * CUBE — restaurant, shisha lounge and 24/7 gaming arena in Jimbaran.
 *
 * Handed over by the owner as a link and nothing else; the categories and the
 * area come from what the venue publishes about itself, and the site could not
 * be read from here — the network policy refuses the domain.
 *
 * Three businesses share one roof here, and a traveller looking for each of
 * them types something different: food, shisha, and a place to play. The set
 * splits across all three rather than treating the venue as a restaurant with
 * extras — an answer that never names it for "gaming club in Bali" is a
 * different finding from one that never names it for "dinner in Jimbaran", and
 * they are worth telling apart.
 */
export const cubebaliScenario: MeasurementScenario = {
  version: "cubebali-2026-08-27",
  project: "cubebali",
  brand: "CUBE",
  site: "cubebali.id",
  language: "en",
  market: "Джимбаран, Бали",
  ownership: "third-party",
  basis: "category-draft",
  strongAliases: ["CUBE Bali", "cubebali.id", "The Cube Bali"],
  weakAliases: ["CUBE"],
  questions: [
    "Where can I play PlayStation or PC games in Bali?",
    "Is there a gaming club in Bali?",
    "Where can I find an esports or PC club in Bali?",
    "Where can I sing karaoke in Bali?",
    "Where can I smoke shisha in Jimbaran?",
    "Which bars in Bali serve cocktails with shisha?",
    "What is open 24 hours in Bali?",
    "Where should I eat in Jimbaran?",
    "Which places in Jimbaran are open late at night?",
    "Where can I find Pan-Asian food in Bali?",
    "Where can I host a birthday party in Bali?",
    "Which venues in Bali can host a corporate party?",
    "Where can I work with good wifi during the day in Jimbaran?",
    "Where can I play board games in Bali?",
    "What is there to do in Bali when it rains?",
    "Where can I go out at night in Jimbaran?",
    "Where can I book a private room for a party in Bali?",
    "What are the best late night spots in Bali?",
    "Where can a group of friends spend the evening in Bali?",
    "Where can I watch a film with friends in Bali?",
    "What are the best cocktail bars in Jimbaran?",
    "Where can I eat near Bali airport after a late flight?",
    "What is there to do in Jimbaran at night?",
    "Where can teenagers and older kids spend an evening in Bali?",
    "Which places in Bali are open all night for food?",
  ],
};
