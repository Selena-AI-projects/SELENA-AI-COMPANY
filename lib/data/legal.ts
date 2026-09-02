/**
 * Effective dates for the published legal documents.
 *
 * These are not build dates and not guesses. Each is the day the document's
 * own text last changed in the repository and was deployed — for both
 * documents, the commit that named Selena Systems LLC (Wyoming, USA) as the
 * AI Visibility seller. A later commit touched the same files to move them
 * into a route group and to add structured data; neither changed a word of
 * what the documents say, so neither moves the date.
 *
 * Change a date here only when the document's text actually changes, and
 * change it in the same commit that changes the text.
 */

export type LegalDocumentKey = "privacy" | "terms";

export const legalDocuments: Record<LegalDocumentKey, { effectiveDate: string }> = {
  privacy: { effectiveDate: "2026-08-21" },
  terms: { effectiveDate: "2026-08-21" },
};

const RU_MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const EN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "21 августа 2026" / "21 August 2026" from an ISO date, without a Date parse. */
export function formatEffectiveDate(iso: string, locale: "en" | "ru") {
  const [year, month, day] = iso.split("-");
  const months = locale === "ru" ? RU_MONTHS : EN_MONTHS;
  const name = months[Number(month) - 1];
  return `${Number(day)} ${name} ${year}`;
}

/** The line printed under the document heading. */
export function effectiveDateLine(key: LegalDocumentKey, locale: "en" | "ru") {
  const formatted = formatEffectiveDate(legalDocuments[key].effectiveDate, locale);
  return locale === "ru"
    ? `Действует с ${formatted} — с даты публикации текущей редакции.`
    : `In effect since ${formatted}, the date this version was published.`;
}
