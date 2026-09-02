/**
 * The date each legal document's current revision goes live.
 *
 * The first attempt at this took the date from `c62be14`, the commit that
 * named Selena Systems LLC as the AI Visibility seller. That was wrong twice
 * over: a commit date is when a file changed on someone's machine, not when
 * readers could see it, and that commit's own message says "not yet pushed to
 * the live site". An inferred publication date is an invented one.
 *
 * So this holds the one date that can actually be checked: the day the
 * revision now in the repository is published. It is written by hand, in the
 * same commit that changes the document, and it means what it says — this
 * text, live from this day. Nothing derives it from the build clock, and
 * nothing infers it from history.
 *
 * When you change a word of either document, change its date here in the same
 * commit. If a revision sits unmerged for days, move the date to the day it
 * actually ships.
 */

export type LegalDocumentKey = "privacy" | "terms";

export const legalDocuments: Record<LegalDocumentKey, { revisionPublished: string }> = {
  privacy: { revisionPublished: "2026-09-02" },
  terms: { revisionPublished: "2026-09-02" },
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

/**
 * True only for a date that exists on the calendar.
 *
 * `Date.parse` is not this check: it reads "2026-02-30" as 2 March, so a typo
 * would print "30 февраля" on the page while the sitemap published 2 March.
 * Building the date from its parts and reading them back catches that.
 */
export function isRealCalendarDate(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

/** "2 сентября 2026" / "2 September 2026". Refuses a date that does not exist. */
export function formatLegalDate(iso: string, locale: "en" | "ru") {
  if (!isRealCalendarDate(iso)) {
    throw new Error(`Legal document date "${iso}" is not a real calendar date`);
  }
  const [year, month, day] = iso.split("-");
  const months = locale === "ru" ? RU_MONTHS : EN_MONTHS;
  return `${Number(day)} ${months[Number(month) - 1]} ${year}`;
}

/**
 * The line printed under the document.
 *
 * It claims one thing: this revision is live from this date. It does not claim
 * a first-publication date for the document, because the site has never
 * recorded one.
 */
export function revisionLine(key: LegalDocumentKey, locale: "en" | "ru") {
  const formatted = formatLegalDate(legalDocuments[key].revisionPublished, locale);
  return locale === "ru"
    ? `Эта редакция опубликована и действует с ${formatted}.`
    : `This revision is published and in effect from ${formatted}.`;
}
