/**
 * The measurement configuration for KORA Food Hall, versioned on purpose.
 *
 * A re-measurement may only be compared with an earlier one when the questions,
 * the systems and the language are identical, so the question set lives in the
 * repository rather than being retyped. Changing anything here starts a new
 * series; it does not continue the old one.
 *
 * The questions are grounded in what Search Console already showed on
 * 2026-08-25: "private events ubud" drew 99 impressions at position 23 with no
 * clicks, and a cluster of family and kids queries sat at 11–16.
 */
import type { MeasurementScenario } from "./index";

export const korafoodhallScenario: MeasurementScenario = {
  version: "korafoodhall-api-view-2026-08-25",
  project: "korafoodhall",
  brand: "KORA Food Hall",
  site: "korafoodhall.com",
  language: "en",
  market: "Ubud, Bali",
  basis: "search-console",
  /**
   * Aliases are matched on word boundaries. "KORA" alone is short enough to
   * collide with unrelated words, so a match on it is reported as needing a
   * human look rather than counted as a mention.
   */
  strongAliases: ["KORA Food Hall", "korafoodhall.com", "korafoodhall"],
  weakAliases: ["KORA"],
  questions: [
    "Where should I eat in Ubud, Bali?",
    "What is the best food hall in Ubud?",
    "Which restaurants in Ubud are good for families?",
    "Where can I eat with kids in Ubud?",
    "Where should I go for dinner in Ubud, Bali?",
    "Where can I host a private event in Ubud?",
    "What are the private event venues in Ubud, Bali?",
    "Where can I have a birthday party in Ubud?",
    "Where can a large group have dinner together in Ubud?",
    "What is the best casual dining in Ubud?",
    "Is there a food court in Ubud, Bali?",
    "Where can I eat near the centre of Ubud?",
    "What are the affordable restaurants in Ubud?",
    "Are there restaurants in Ubud with a playground?",
    "Where can a group with different diets eat together in Ubud?",
    "Where in Ubud can vegetarians and meat eaters eat in the same place?",
    "Where is the best brunch in Ubud?",
    "Which restaurants in Ubud have live music?",
    "Where do expats eat in Ubud?",
    "What is the best food hall in Bali?",
    "Where can I organise a corporate event in Ubud?",
    "Where can I hold a wedding reception in Ubud?",
    "What are the new restaurants in Ubud worth trying?",
    "Where can I eat late at night in Ubud?",
    "What should I not miss when eating in Ubud?",
  ],
};
