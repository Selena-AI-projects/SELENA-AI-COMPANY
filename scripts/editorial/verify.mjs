// Verification means a passage, not a status code: the primary page is
// fetched, turned into text, and the run keeps the exact sentences that
// mention both the AI side and the restaurant/hotel side. Those sentences are
// the only facts the writer may use, and the saved page text lets anyone
// re-check them later.
import { createHash } from "node:crypto";
import { fetchText, FetchFailure } from "./http.mjs";
import { AI_TERMS, AUDIENCE_TERMS, canonicalUrl, eventKey, hostOf, matchTerms, tokens } from "./hooks.mjs";
import { normalizeDate, parseFeed } from "./feeds.mjs";

const ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&apos;": "'", "&nbsp;": " ", "&#160;": " " };

export function decodeEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&[a-z]+;|&#\d+;/gi, (entity) => ENTITIES[entity.toLowerCase()] ?? entity);
}

export function htmlToText(html) {
  const withoutBlocks = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  return decodeEntities(
    withoutBlocks
      .replace(/<\/(p|div|li|h[1-6]|tr|br|section|article|blockquote|nav|header|footer|aside|main|ul|ol|dl|dd|dt|td|th|figure|figcaption|summary|details|table)>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t ]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

export function extractMeta(html, pageUrl) {
  const attr = (pattern) => html.match(pattern)?.[1]?.trim() ?? "";
  const metaContent = (name) =>
    attr(new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["']`, "i")) ||
    attr(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${name}["']`, "i"));
  let jsonLdDate = "";
  for (const block of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    const match = block[1].match(/"datePublished"\s*:\s*"([^"]+)"/);
    if (match) {
      jsonLdDate = match[1];
      break;
    }
  }
  const title = decodeEntities(attr(/<title[^>]*>([\s\S]*?)<\/title>/i) || metaContent("og:title")).replace(/\s+/g, " ");
  const publishedRaw = metaContent("article:published_time") || jsonLdDate || attr(/<time[^>]+datetime=["']([^"']+)["']/i) || metaContent("date");
  const canonical = attr(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || metaContent("og:url") || pageUrl;
  const links = [...html.matchAll(/<a\b[^>]+href=["'](https?:\/\/[^"'#]+)["']/gi)].map((m) => decodeEntities(m[1]));
  return { title, publishedAt: normalizeDate(publishedRaw), dateSource: publishedRaw ? "page" : null, canonical, links };
}

export function sentences(text) {
  return text
    .split(/\n+|(?<=[.!?…])\s+(?=[A-ZА-ЯЁ«"“(])/u)
    .map((sentence) => sentence.replace(/\s+/g, " ").trim())
    .filter((sentence) => sentence.length >= 40 && sentence.length <= 400);
}

/**
 * Sentences that carry both sides of the story, verbatim, with their position
 * in the saved text. A headline is not a passage: a sentence that is the
 * page title (or sits inside it) is skipped, so a page has to say something
 * in its body before it counts.
 */
export function findQuotes(text, { max = 6, titleTokens = [], titles = [] } = {}) {
  const quotes = [];
  const headlines = titles.map(normalizeForMatch).filter((headline) => headline.length >= 25);
  for (const sentence of sentences(text)) {
    const normalized = normalizeForMatch(sentence);
    if (headlines.some((headline) => headline.includes(normalized) || normalized.includes(headline))) continue;
    const ai = matchTerms(sentence, AI_TERMS);
    const audience = matchTerms(sentence, AUDIENCE_TERMS);
    const strong = ai.length > 0 && audience.length > 0;
    const titled = ai.length > 0 && tokens(sentence).filter((token) => titleTokens.includes(token)).length >= 2;
    if (!strong && !titled) continue;
    const offset = text.indexOf(sentence);
    if (offset < 0 || quotes.some((quote) => quote.text === sentence)) continue;
    quotes.push({ id: `q${quotes.length + 1}`, text: sentence, offset, ai, audience, strength: strong ? "both-sides" : "ai-plus-title" });
    if (quotes.length >= max) break;
  }
  return quotes;
}

export function normalizeForMatch(text) {
  return text.replace(/[’'"“”«»]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

export function quoteFound(text, quote) {
  return normalizeForMatch(text).includes(normalizeForMatch(quote));
}

/**
 * Fetches the candidate's page and decides whether it carries at least one
 * verifiable passage. Returns a verdict either way; the run records refusals
 * with the reason, and nothing here invents a passage.
 */
export async function verifyCandidate(candidate, { fixtures = null, officialDomains = [], lookbackDays = 14, now = new Date() } = {}) {
  let response;
  try {
    response = await fetchText(candidate.link, { fixtures, accept: "text/html,application/xhtml+xml,*/*" });
  } catch (error) {
    const reason = error instanceof FetchFailure ? error.reason : String(error);
    return { ok: false, reason: `primary page not readable: ${reason}` };
  }
  const meta = extractMeta(response.body, response.url);
  const text = htmlToText(response.body);
  if (text.length < 400) return { ok: false, reason: `page text too short to verify (${text.length} chars)` };
  const quotes = findQuotes(text, { titleTokens: tokens(candidate.title), titles: [meta.title, candidate.title] });
  const bothSides = quotes.filter((quote) => quote.strength === "both-sides");
  if (bothSides.length === 0) {
    return {
      ok: false,
      reason: "insufficient evidence: no passage on the page mentions both AI search and restaurants/hotels",
      page: { url: candidate.link, finalUrl: response.url, title: meta.title, chars: text.length },
    };
  }
  const publishedAt = meta.publishedAt ?? candidate.publishedAt ?? null;
  const dateSource = meta.publishedAt ? "page" : candidate.publishedAt ? "feed" : null;
  if (!publishedAt) return { ok: false, reason: "no publication date on the page or in the feed" };
  const ageDays = (now.getTime() - new Date(publishedAt).getTime()) / 86_400_000;
  if (ageDays > lookbackDays) return { ok: false, reason: `page dated ${publishedAt.slice(0, 10)}, older than ${lookbackDays} days` };
  const officialSet = officialDomains.map((domain) => domain.toLowerCase());
  const isOfficial = (url) => officialSet.some((domain) => hostOf(url) === domain || hostOf(url).endsWith(`.${domain}`));
  const primaryLinks = [...new Set(meta.links.filter((link) => isOfficial(link) && hostOf(link) !== hostOf(response.url)))].slice(0, 10);
  const primaryUrl = isOfficial(response.url) ? response.url : (primaryLinks[0] ?? response.url);
  return {
    ok: true,
    page: {
      url: candidate.link,
      finalUrl: response.url,
      canonical: canonicalUrl(meta.canonical || response.url),
      title: meta.title,
      publishedAt,
      dateSource,
      chars: text.length,
      textHash: createHash("sha256").update(text).digest("hex"),
      text,
    },
    quotes,
    primaryLinks,
    primaryUrl,
    primaryIsOfficial: isOfficial(primaryUrl),
    eventKey: eventKey(primaryUrl),
  };
}

/**
 * Signs of interest are counted from free public search endpoints and kept
 * apart from the event itself: they say people are talking, not that the
 * event is true, and the article may cite them only with the numbers.
 */
export async function interestSignals(candidate, { fixtures = null } = {}) {
  const query = tokens(candidate.title).slice(0, 6).join(" ");
  const signals = {};
  const safely = async (name, url, parse) => {
    try {
      const response = await fetchText(url, { fixtures, accept: "application/json, application/rss+xml, */*" });
      signals[name] = { ...(await parse(response.body)), endpoint: url };
    } catch (error) {
      signals[name] = { unavailable: error instanceof FetchFailure ? error.reason : String(error), endpoint: url };
    }
  };
  await safely("hackerNews", `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=5`, (body) => {
    const json = JSON.parse(body);
    return { count: json.nbHits ?? 0, top: (json.hits ?? []).slice(0, 3).map((hit) => ({ title: hit.title, url: hit.url, points: hit.points, comments: hit.num_comments })) };
  });
  await safely("bluesky", `https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent(query)}&limit=25`, (body) => {
    const json = JSON.parse(body);
    return { count: (json.posts ?? []).length, capped: (json.posts ?? []).length >= 25 };
  });
  await safely("googleNews", `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`, (body) => {
    const items = parseFeed(body, "google-news");
    const outlets = new Set(items.map((item) => item.title.split(" - ").at(-1)?.trim()).filter(Boolean));
    return { items: items.length, outlets: outlets.size, sample: items.slice(0, 5).map((item) => item.title) };
  });
  return { query, signals };
}
