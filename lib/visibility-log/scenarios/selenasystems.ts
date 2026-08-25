import type { MeasurementScenario } from "./index";

/**
 * Selena Systems measures itself in English: the market it sells into is
 * Australia, New Zealand and the United States. Russian is the second language
 * and gets its own set once this one has a baseline to compare against.
 *
 * The questions are the ones a buyer asks before they know the category has a
 * name, which is where a new entrant can appear at all.
 */
export const selenasystemsScenario: MeasurementScenario = {
  version: "selenasystems-api-view-2026-08-25",
  project: "selenasystems",
  brand: "Selena Systems",
  site: "selenasystems.com",
  language: "en",
  market: "Австралия и Новая Зеландия, США",
  ownership: "own",
  basis: "owner-brief",
  strongAliases: ["Selena Systems", "selenasystems.com", "selenasystems"],
  weakAliases: ["Selena"],
  questions: [
    "How do I find out whether ChatGPT mentions my business?",
    "How can I check if AI assistants recommend my company?",
    "What tools track brand mentions in AI answers?",
    "How do I measure AI visibility for a small business?",
    "What is answer engine optimisation?",
    "Who helps businesses show up in ChatGPT answers?",
    "How do I get my business recommended by Perplexity?",
    "Is there a service that audits how AI describes my brand?",
    "How do I know if my competitors appear in AI answers and I do not?",
    "What should a small business do about AI search?",
    "How do I prepare my website so AI systems can read it?",
    "Who offers AI visibility audits for service businesses?",
    "What is the difference between SEO and AI visibility?",
    "How do I track whether Gemini recommends my business?",
    "Can I measure how often AI mentions my brand each month?",
    "What agencies specialise in AI search visibility?",
    "How much does an AI visibility report cost?",
    "How do I find out which sources AI cites about my industry?",
    "Is there a free check for how AI sees my website?",
    "What does it mean when AI does not mention my business at all?",
    "Who can help a restaurant get into AI recommendations?",
    "How do I improve how ChatGPT describes my company?",
    "What is AI visibility monitoring?",
    "How do I audit my brand's presence across AI assistants?",
    "Which companies help with AI answer optimisation?",
  ],
};
