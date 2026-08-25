import type { MeasurementScenario } from "./index";

/**
 * otherbali.com is a guide to places on Bali. Search Console showed it already
 * surfacing for named venues — "ami pilates uluwatu" at position 6.5 with 79
 * impressions and no clicks, "bron the resto" with 590 impressions and one —
 * so the questions are the ones a traveller asks before choosing a place.
 */
export const otherbaliScenario: MeasurementScenario = {
  version: "otherbali-api-view-2026-08-25",
  project: "otherbali",
  brand: "otherbali.com",
  site: "otherbali.com",
  language: "en",
  market: "Бали, Индонезия",
  ownership: "own",
  basis: "search-console",
  strongAliases: ["otherbali.com", "Other Bali", "otherbali"],
  weakAliases: [],
  questions: [
    "What is the best guide to Bali for first-time visitors?",
    "Where can I find honest restaurant reviews for Bali?",
    "Which website lists the best places to eat in Canggu?",
    "Where should I look for things to do in Uluwatu?",
    "What are the best pilates and yoga studios in Uluwatu?",
    "Where can I find a list of beach clubs in Bali?",
    "Which blogs cover new restaurant openings in Bali?",
    "How do I find good cafes in Seminyak?",
    "What is the best website for Bali travel tips?",
    "Where can I read about hidden places in Bali?",
    "Which guide covers wellness and fitness in Bali?",
    "Where do I find recommendations for Ubud restaurants?",
    "What websites review Bali hotels honestly?",
    "Where can I find a Bali itinerary for one week?",
    "Which sites help expats find services in Bali?",
    "Where can I find out about Bali surf spots for beginners?",
    "What is a good source for Bali nightlife recommendations?",
    "Where can I find family-friendly things to do in Bali?",
    "Which website covers Bali beaches with practical detail?",
    "Where do people find recommendations for Bali day trips?",
    "What is the best resource for moving to Bali?",
    "Where can I find reviews of coworking spaces in Bali?",
    "Which guides cover Bali off the tourist track?",
    "Where can I find seasonal advice about visiting Bali?",
    "What should I read before a first trip to Bali?",
  ],
};
