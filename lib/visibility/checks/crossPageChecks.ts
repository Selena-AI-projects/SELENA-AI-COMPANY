import { jsonLdNodes, type HtmlSignals } from "./htmlSignals";
import {
  decideByEveryMatchingGroup,
  decideBySpecificGroup,
  parseRobots,
} from "./robotsRules";
import type { CheckResult } from "./technicalChecks";

/**
 * The findings a page cannot produce on its own.
 *
 * Every technical check reads one page and judges it alone. Three of the
 * things that actually cost a business its answer are invisible from there:
 * two pages that state different facts about the same business, a robots.txt
 * that two crawlers read differently, and a page hidden in one language and
 * open in another. Each needs the whole crawl in front of it.
 *
 * Like the rest of the free check these results stay out of the score: a
 * number that changes meaning between two measurements cannot be compared.
 */

export interface CrossPageView {
  url: string;
  signals: HtmlSignals;
  headers: Record<string, string>;
}

export type CrossPageCheckResult = CheckResult & { pageUrl: string };

export const CROSS_PAGE_RULE_IDS = new Set([
  "identity.facts_agree",
  "access.robots_unambiguous",
  "access.noindex_covers_locales",
]);

/**
 * Facts that describe the business itself, so one value is expected wherever
 * they appear. Product and service names are deliberately absent: a service
 * page naming its own service is not a contradiction.
 */
const FACTS = ["telephone", "email", "address", "priceRange", "servesCuisine"] as const;
type Fact = (typeof FACTS)[number];

function normalizeFact(fact: Fact, value: string): string {
  const text = value.trim();
  if (!text) return "";
  if (fact === "telephone") return text.replace(/\D+/g, "");
  return text.toLowerCase().replace(/\s+/g, " ");
}

function textValues(value: unknown): string[] {
  if (typeof value === "string") return value.trim() ? [value.trim()] : [];
  if (Array.isArray(value)) return value.flatMap(textValues);
  return [];
}

function addressValues(value: unknown): string[] {
  if (typeof value === "string") return value.trim() ? [value.trim()] : [];
  if (Array.isArray(value)) return value.flatMap(addressValues);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const parts = ["streetAddress", "addressLocality", "postalCode"]
      .map((key) => (typeof record[key] === "string" ? (record[key] as string).trim() : ""))
      .filter(Boolean);
    return parts.length > 0 ? [parts.join(", ")] : [];
  }
  return [];
}

function factsOf(view: CrossPageView): Map<Fact, Set<string>> {
  const found = new Map<Fact, Set<string>>();
  const add = (fact: Fact, raw: string) => {
    const value = normalizeFact(fact, raw);
    if (!value) return;
    const set = found.get(fact) ?? new Set<string>();
    set.add(value);
    found.set(fact, set);
  };
  for (const node of jsonLdNodes(view.signals)) {
    for (const value of textValues(node.telephone)) add("telephone", value);
    for (const value of textValues(node.email)) add("email", value);
    for (const value of textValues(node.priceRange)) add("priceRange", value);
    for (const value of textValues(node.servesCuisine)) add("servesCuisine", value);
    for (const value of addressValues(node.address)) add("address", value);
  }
  for (const link of view.signals.links) {
    const href = link.href.trim();
    if (/^tel:/i.test(href)) add("telephone", href.slice(4));
    if (/^mailto:/i.test(href)) add("email", href.slice(7).split("?")[0] ?? "");
  }
  return found;
}

interface FactDisagreement {
  fact: Fact;
  pages: { url: string; values: string[] }[];
}

/**
 * Two pages disagree when neither shares a single value with the other. A page
 * that lists more of the same thing is not disagreeing with one that lists
 * less, so a homepage listing every phone number never accuses a contact page
 * that lists one of them.
 */
function factDisagreements(pages: CrossPageView[]): { compared: number; disagreements: FactDisagreement[] } {
  const perPage = pages.map((page) => ({ url: page.url, facts: factsOf(page) }));
  const disagreements: FactDisagreement[] = [];
  let compared = 0;
  for (const fact of FACTS) {
    const stated = perPage
      .map((page) => ({ url: page.url, values: page.facts.get(fact) }))
      .filter((page): page is { url: string; values: Set<string> } => Boolean(page.values?.size));
    if (stated.length < 2) continue;
    compared += 1;
    const disjoint = stated.some((page, index) =>
      stated.slice(index + 1).some((other) => [...page.values].every((value) => !other.values.has(value))),
    );
    if (disjoint) {
      disagreements.push({
        fact,
        pages: stated.map((page) => ({ url: page.url, values: [...page.values] })),
      });
    }
  }
  return { compared, disagreements };
}

function hidesFromIndex(view: CrossPageView): boolean {
  const meta = view.signals.metaRobots ?? "";
  const header = view.headers["x-robots-tag"] ?? "";
  return /noindex/i.test(meta) || /noindex/i.test(header);
}

/**
 * Which first path segments this site uses as language prefixes.
 *
 * Taken from the site itself, never from a list of every language: the codes
 * it declares in `<html lang>`, plus any two-letter segment that leads to a
 * path some other segment also leads to. `/hr` alone stays a department page,
 * because nothing else on the site serves the same page under another prefix.
 */
function localeCodes(pages: CrossPageView[], paths: string[]): Set<string> {
  const codes = new Set<string>();
  for (const page of pages) {
    const code = page.signals.htmlLang?.trim().toLowerCase().split("-")[0];
    if (code && /^[a-z]{2,3}$/.test(code)) codes.add(code);
  }
  const heads = new Map<string, Set<string>>();
  for (const path of paths) {
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 0) continue;
    const head = /^[a-z]{2}$/i.test(segments[0]!) ? segments[0]!.toLowerCase() : "";
    const tail = (head ? segments.slice(1) : segments).join("/");
    if (!tail) continue;
    heads.set(tail, (heads.get(tail) ?? new Set<string>()).add(head));
  }
  for (const reachedBy of heads.values()) {
    if (reachedBy.size < 2) continue;
    for (const head of reachedBy) if (head) codes.add(head);
  }
  return codes;
}

function pathOf(url: string): string | null {
  try {
    return new URL(url).pathname;
  } catch {
    return null;
  }
}

/** The same page, whatever language it is served in. */
function twinKey(url: string, codes: Set<string>): string | null {
  const path = pathOf(url);
  if (path === null) return null;
  const segments = path.split("/").filter(Boolean);
  if (segments.length > 0 && codes.has(segments[0]!.toLowerCase())) segments.shift();
  return `/${segments.join("/")}`;
}

function sitemapUrls(body: string | null): string[] {
  if (!body) return [];
  return [...body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((match) => match[1]!);
}

export function runCrossPageChecks(input: {
  baseUrl: string;
  pages: CrossPageView[];
  robotsBody: string | null;
  sitemapBody: string | null;
  crawlers: readonly { crawler: string; userAgent: string }[];
}): CrossPageCheckResult[] {
  const { baseUrl, pages, robotsBody, sitemapBody, crawlers } = input;
  const results: CrossPageCheckResult[] = [];

  const facts = factDisagreements(pages);
  const firstDisagreement = facts.disagreements[0];
  results.push({
    ruleId: "identity.facts_agree",
    dimension: "identity",
    pageUrl: firstDisagreement?.pages[0]?.url ?? baseUrl,
    state: firstDisagreement ? "warn" : facts.compared > 0 ? "pass" : "not_measured",
    evidence: firstDisagreement
      ? {
          fact: firstDisagreement.fact,
          observation: firstDisagreement.pages
            .map((page) => `${page.url} — ${page.values.join(", ")}`)
            .join(" | "),
          disagreements: facts.disagreements,
          factsCompared: facts.compared,
        }
      : { reason: facts.compared > 0 ? "no_disagreement" : "no_fact_stated_on_two_pages", factsCompared: facts.compared },
  });

  const groups = robotsBody?.trim() ? parseRobots(robotsBody) : null;
  const readerDisagreements = groups
    ? crawlers
        .map((entry) => {
          const specific = decideBySpecificGroup(groups, entry.userAgent);
          const everyGroup = decideByEveryMatchingGroup(groups, entry.userAgent);
          if (specific.blocked === everyGroup.blocked) return null;
          return {
            crawler: entry.crawler,
            userAgent: entry.userAgent,
            bySpecificGroup: specific.blocked ? "blocked" : "allowed",
            byEveryMatchingGroup: everyGroup.blocked ? "blocked" : "allowed",
            matchedRule: (specific.blocked ? specific.matchedRule : everyGroup.matchedRule) ?? null,
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    : [];
  results.push({
    ruleId: "access.robots_unambiguous",
    dimension: "access",
    pageUrl: new URL("/robots.txt", baseUrl).toString(),
    state: !groups ? "not_measured" : readerDisagreements.length > 0 ? "warn" : "pass",
    evidence: !groups
      ? { reason: "no_robots_txt_published" }
      : readerDisagreements.length > 0
        ? {
            observation: readerDisagreements
              .map((entry) => `${entry.userAgent}: ${entry.bySpecificGroup} / ${entry.byEveryMatchingGroup}`)
              .join(" | "),
            disagreeingCrawlers: readerDisagreements.length,
            readers: readerDisagreements,
          }
        : { crawlersChecked: crawlers.length },
  });

  const hidden = pages.filter(hidesFromIndex);
  if (hidden.length === 0) {
    results.push({
      ruleId: "access.noindex_covers_locales",
      dimension: "access",
      pageUrl: baseUrl,
      state: "not_measured",
      evidence: { reason: "no_page_asks_to_be_hidden" },
    });
    return results;
  }

  const offeredForCrawling = sitemapUrls(sitemapBody);
  const codes = localeCodes(
    pages,
    [...pages.map((page) => page.url), ...offeredForCrawling]
      .map(pathOf)
      .filter((path): path is string => path !== null),
  );
  const mixed: { key: string; hidden: string[]; indexable: string[] }[] = [];
  const byKey = new Map<string, CrossPageView[]>();
  for (const page of pages) {
    const key = twinKey(page.url, codes);
    if (key === null) continue;
    byKey.set(key, [...(byKey.get(key) ?? []), page]);
  }
  for (const [key, group] of byKey) {
    const hiddenPages = group.filter(hidesFromIndex).map((page) => page.url);
    const indexable = group.filter((page) => !hidesFromIndex(page)).map((page) => page.url);
    if (hiddenPages.length > 0 && indexable.length > 0) {
      mixed.push({ key, hidden: hiddenPages, indexable });
    }
  }

  const listedTwins = hidden.flatMap((page) => {
    const key = twinKey(page.url, codes);
    if (key === null) return [];
    return offeredForCrawling
      .filter((url) => url !== page.url && twinKey(url, codes) === key)
      .map((url) => ({ hiddenPage: page.url, listedInSitemap: url }));
  });

  const observation = [
    ...mixed.map((entry) => `${entry.hidden.join(", ")} → noindex; ${entry.indexable.join(", ")} → indexable`),
    ...listedTwins.map((entry) => `${entry.hiddenPage} → noindex; ${entry.listedInSitemap} → in sitemap`),
  ].join(" | ");

  results.push({
    ruleId: "access.noindex_covers_locales",
    dimension: "access",
    pageUrl: mixed[0]?.hidden[0] ?? listedTwins[0]?.hiddenPage ?? hidden[0]!.url,
    state: mixed.length > 0 || listedTwins.length > 0 ? "warn" : "pass",
    evidence:
      mixed.length > 0 || listedTwins.length > 0
        ? { observation, mixed, listedTwins, hiddenPages: hidden.length }
        : { hiddenPages: hidden.length },
  });

  return results;
}
