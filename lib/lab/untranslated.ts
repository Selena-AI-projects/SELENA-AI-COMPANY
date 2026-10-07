import englishOnly from "@/data/lab/english-only.json";

/**
 * English Lab entries with no Russian edition. Kept out of lib/lab/content.ts
 * because the header's language switch is a client component and should not
 * ship every article to read one list; a test keeps the two in step. The list
 * is data rather than code so that a release adding an English-only article
 * can add its path in the same pull request.
 */
export const englishOnlyLabPaths: ReadonlySet<string> = new Set<string>(englishOnly);
