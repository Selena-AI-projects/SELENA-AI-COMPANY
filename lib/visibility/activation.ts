/** Public claims fail closed until production receipts satisfy the owner gates.
 * Source: website TZ 2026-09-16; contract 03fb41a; OS status 4e4aaff.
 * These describe publication permission, not runtime feature switches. */
export const visibilityActivation = Object.freeze({
  recurring: false,
  telegram: false,
  localMaps: "PARTIAL",
  localAi: "MANUAL_ONLY",
  payments: false,
  clientProof: false,
  materialityRule: false,
} as const);
