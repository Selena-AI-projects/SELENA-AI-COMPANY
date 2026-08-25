/**
 * Measurement configurations, one per project.
 *
 * A re-measurement is comparable with an earlier one only when the questions,
 * the systems and the language are identical, so every set is versioned and
 * lives here rather than being retyped. Changing a set starts a new series.
 *
 * Where the questions come from matters and is recorded per set: some are
 * grounded in what Search Console already showed the project is surfacing for,
 * others are written from the project's category alone and are marked as such
 * until the owner confirms them.
 */
export type MeasurementScenario = {
  version: string;
  project: string;
  brand: string;
  site: string;
  language: string;
  market: string;
  /** Where the question set came from, published with the result. */
  basis: "search-console" | "owner-brief" | "category-draft";
  strongAliases: readonly string[];
  weakAliases: readonly string[];
  questions: readonly string[];
};
