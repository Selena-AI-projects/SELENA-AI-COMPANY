import type { MeasurementScenario } from "./index";

/**
 * VillaOps serves villa and guest-service operations on Bali. The questions
 * are written from that category and the market; the owner has not yet
 * confirmed them against how she describes the offer, so the basis says so and
 * the set is treated as a draft until she does.
 */
export const villaopsScenario: MeasurementScenario = {
  version: "villaops-api-view-2026-08-25",
  project: "villaops",
  brand: "VillaOps",
  site: "villaops.selenasystems.com",
  language: "en",
  market: "Бали, Индонезия",
  basis: "category-draft",
  strongAliases: ["VillaOps", "villaops.selenasystems.com", "Villa Ops"],
  weakAliases: [],
  questions: [
    "Who manages villa rentals in Bali?",
    "How do I find a property manager for my villa in Bali?",
    "What does villa management in Bali cost?",
    "How do I run a villa rental business in Ubud?",
    "What software do villa owners in Bali use to manage bookings?",
    "How do I handle guest communication for a villa rental?",
    "Who takes care of housekeeping and maintenance for Bali villas?",
    "How do I set up operations for a new villa in Bali?",
    "What is the best way to manage staff at a Bali villa?",
    "How do I automate guest check-in for a villa?",
    "Which companies offer villa operations services in Indonesia?",
    "How do I keep a villa fully booked in low season?",
    "What systems do boutique hotels in Bali use for operations?",
    "How do I manage multiple villas at once?",
    "Who helps foreign owners run property in Bali?",
    "What should be in a villa operations manual?",
    "How do I handle guest complaints at a villa rental?",
    "What are the standard operating procedures for villa housekeeping?",
    "How do I track expenses for a villa rental in Bali?",
    "Who provides concierge services for villa guests in Bali?",
    "How do I onboard new staff at a villa?",
    "What tools help with short-term rental operations in Indonesia?",
    "How do villa managers in Bali handle maintenance requests?",
    "What does a villa operations company actually do?",
    "How can AI help run a villa rental business?",
  ],
};
