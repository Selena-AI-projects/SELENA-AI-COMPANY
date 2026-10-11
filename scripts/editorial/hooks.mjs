// A hook is a feed item that (a) is about AI search or assistants, (b) touches
// restaurants or hotels, and (c) is recent. The two term lists are the whole
// relevance model: a candidate needs at least one hit in each. Interest
// signals are gathered later and never decide relevance.
import { createHash } from "node:crypto";

export const AI_TERMS = [
  "ai overviews",
  "ai overview",
  "ai mode",
  "ai search",
  "ai-powered search",
  "ai assistant",
  "ai agent",
  "ai agents",
  "agentic",
  "chatgpt",
  "openai",
  "gemini",
  "perplexity",
  "copilot",
  "claude",
  "answer engine",
  "generative ai",
  "generative engine",
  "large language model",
  "llm",
  "ask maps",
  "google ai",
  "ai recommendations",
  "ai-generated",
  "ai summaries",
  "ai summary",
  "ии-поиск",
  "ии-ассистент",
  "нейросет",
];

export const AUDIENCE_TERMS = [
  "restaurant",
  "restaurants",
  "restaurateur",
  "dining",
  "diners",
  "menu",
  "hotel",
  "hotels",
  "hotelier",
  "hospitality",
  "guest",
  "guests",
  "booking",
  "bookings",
  "reservation",
  "reservations",
  "opentable",
  "tripadvisor",
  "booking.com",
  "expedia",
  "airbnb",
  "michelin",
  "google maps",
  "business profile",
  "local business",
  "local businesses",
  "reviews",
  "travel",
  "traveler",
  "travellers",
  "travelers",
  "tourism",
  "ресторан",
  "отел",
  "гостиниц",
  "бронирован",
];

const STOPWORDS = new Set(
  "a an the and or of to in on for with from by at as is are was were be been it its this that these those into over about after before new how why what when your you we our their they he she his her not no yes vs via per than then more most less least up out off now just also only very can will may might should could would do does did has have had having been being".split(
    " ",
  ),
);

export function canonicalUrl(raw) {
  let url;
  try {
    url = new URL(raw.trim());
  } catch {
    return raw.trim().toLowerCase();
  }
  const host = url.hostname.toLowerCase().replace(/^www\./, "").replace(/^amp\./, "");
  const params = [...url.searchParams.entries()].filter(
    ([key]) => !/^(utm_|fbclid|gclid|mc_cid|mc_eid|ref$|source$|igshid|_ga)/i.test(key),
  );
  params.sort(([a], [b]) => a.localeCompare(b));
  const query = params.length ? `?${params.map(([k, v]) => `${k}=${v}`).join("&")}` : "";
  const path = url.pathname.replace(/\/+$/, "").replace(/\/amp$/, "") || "";
  return `${host}${path}${query}`;
}

export function eventKey(url) {
  return createHash("sha256").update(canonicalUrl(url)).digest("hex").slice(0, 24);
}

export function hostOf(url) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function tokens(text) {
  return [
    ...new Set(
      (text ?? "")
        .toLowerCase()
        .replace(/[’'"“”«»]/g, "")
        .split(/[^\p{L}\p{N}.]+/u)
        .map((word) => word.replace(/^\.+|\.+$/g, ""))
        .filter((word) => word.length > 2 && !STOPWORDS.has(word))
        .map((word) => (word.length > 6 && !word.includes(".") ? word.slice(0, 6) : word)),
    ),
  ];
}

export function jaccard(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let shared = 0;
  for (const item of setA) if (setB.has(item)) shared += 1;
  return shared / (setA.size + setB.size - shared);
}

export function matchTerms(text, terms) {
  const haystack = ` ${(text ?? "").toLowerCase().replace(/\s+/g, " ")} `;
  return terms.filter((term) => haystack.includes(term.toLowerCase()));
}

function daysBetween(a, b) {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 86_400_000;
}

/**
 * Relevance is a gate, not a ranking trick: both term groups must hit. Among
 * the gated candidates, an official source outranks trade press, and newer
 * outranks older. The score is printed so a choice can be argued with.
 */
export function rankCandidates(items, { now = new Date(), lookbackDays = 14, sources = [] } = {}) {
  const tierOf = new Map(sources.map((source) => [source.id, source.tier ?? "press"]));
  const ranked = [];
  for (const item of items) {
    const text = `${item.title} ${item.summary ?? ""}`;
    const ai = matchTerms(text, AI_TERMS);
    const audience = matchTerms(text, AUDIENCE_TERMS);
    const ageDays = item.publishedAt ? daysBetween(now, item.publishedAt) : null;
    const reasons = [];
    if (ai.length === 0) reasons.push("no AI-search term");
    if (audience.length === 0) reasons.push("no restaurant/hotel term");
    if (ageDays === null) reasons.push("no publication date");
    else if (ageDays > lookbackDays) reasons.push(`older than ${lookbackDays} days`);
    const tier = tierOf.get(item.sourceId) ?? "press";
    const score =
      reasons.length > 0
        ? 0
        : Math.min(ai.length, 3) * 2 + Math.min(audience.length, 3) * 2 + (tier === "official" ? 4 : tier === "trade" ? 2 : 0) + Math.max(0, lookbackDays - ageDays) / lookbackDays;
    ranked.push({ ...item, ai, audience, ageDays, tier, score: Number(score.toFixed(2)), eligible: reasons.length === 0, reasons });
  }
  return ranked.sort((a, b) => b.score - a.score || (a.ageDays ?? 1e9) - (b.ageDays ?? 1e9));
}

/**
 * The same event under a new headline is still the same event. Three tests,
 * any one of which is enough: the same primary page; a headline that shares
 * most of its words with an entry from the last 45 days; or the same source
 * within three days naming the same two or more AI/audience terms.
 */
export function sameEvent(candidate, entry, { titleThreshold = 0.5 } = {}) {
  if (candidate.eventKey && entry.eventKey && candidate.eventKey === entry.eventKey) return "same primary page";
  const similarity = jaccard(tokens(candidate.title), entry.titleTokens ?? tokens(entry.title));
  const daysApart = candidate.publishedAt && entry.publishedAt ? daysBetween(candidate.publishedAt, entry.publishedAt) : 0;
  if (similarity >= titleThreshold && daysApart <= 45) return `headline ${Math.round(similarity * 100)}% the same`;
  const candidateTerms = new Set([...(candidate.ai ?? []), ...(candidate.audience ?? [])]);
  const sharedTerms = (entry.terms ?? []).filter((term) => candidateTerms.has(term));
  if (hostOf(candidate.primaryUrl ?? candidate.link) === entry.primaryHost && daysApart <= 3 && sharedTerms.length >= 2)
    return `same source, same days, same terms (${sharedTerms.join(", ")})`;
  return null;
}

export function findCovered(candidate, ledger) {
  for (const entry of ledger.entries ?? []) {
    const why = sameEvent(candidate, entry);
    if (why) return { entry, why };
  }
  return null;
}

export function ledgerEntry(candidate, { draftDir, contentHash, runAt }) {
  return {
    eventKey: candidate.eventKey,
    primaryUrl: candidate.primaryUrl ?? candidate.link,
    primaryHost: hostOf(candidate.primaryUrl ?? candidate.link),
    title: candidate.title,
    titleTokens: tokens(candidate.title),
    terms: [...new Set([...(candidate.ai ?? []), ...(candidate.audience ?? [])])],
    publishedAt: candidate.publishedAt,
    firstRunAt: runAt,
    draftDir,
    versions: [contentHash],
  };
}
