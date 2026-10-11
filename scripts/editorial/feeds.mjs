// RSS 2.0 and Atom, parsed with regular expressions on purpose: the run has
// no dependencies, and a feed that defeats this parser is reported as
// unreadable rather than silently empty.
import { fetchText } from "./http.mjs";

function decode(text) {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block, name) {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return match ? decode(match[1]) : "";
}

function atomLink(block) {
  const links = [...block.matchAll(/<link\b([^>]*)\/?>/gi)].map((m) => m[1]);
  const alternate = links.find((attrs) => /rel=["']alternate["']/i.test(attrs)) ?? links.find((attrs) => !/rel=/i.test(attrs));
  const href = alternate?.match(/href=["']([^"']+)["']/i)?.[1];
  return href ? decode(href) : "";
}

export function parseFeed(xml, sourceId) {
  const items = [];
  const rssItems = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map((m) => m[0]);
  const atomEntries = rssItems.length ? [] : [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)].map((m) => m[0]);
  for (const block of rssItems) {
    items.push({
      sourceId,
      title: tag(block, "title"),
      link: tag(block, "link") || block.match(/<guid[^>]*>([^<]+)<\/guid>/i)?.[1]?.trim() || "",
      summary: tag(block, "description") || tag(block, "content:encoded"),
      publishedAt: tag(block, "pubDate") || tag(block, "dc:date"),
    });
  }
  for (const block of atomEntries) {
    items.push({
      sourceId,
      title: tag(block, "title"),
      link: atomLink(block),
      summary: tag(block, "summary") || tag(block, "content"),
      publishedAt: tag(block, "published") || tag(block, "updated"),
    });
  }
  return items
    .filter((item) => item.title && item.link)
    .map((item) => ({ ...item, publishedAt: normalizeDate(item.publishedAt) }));
}

export function normalizeDate(text) {
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Reads every enabled source. A source that cannot be read is a finding of
 * the run (reported and counted), never an exception that hides the rest.
 */
export async function readSources(sources, { fixtures = null, log = () => {} } = {}) {
  const items = [];
  const report = [];
  for (const source of sources) {
    if (source.enabled === false) {
      report.push({ id: source.id, status: "disabled" });
      continue;
    }
    try {
      const response = await fetchText(source.feed, { fixtures, accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*" });
      const parsed = parseFeed(response.body, source.id);
      if (parsed.length === 0) {
        report.push({ id: source.id, status: "unreadable", detail: "feed fetched but no items parsed" });
        log(`source ${source.id}: fetched, 0 items parsed`);
        continue;
      }
      items.push(...parsed);
      report.push({ id: source.id, status: "ok", items: parsed.length });
      log(`source ${source.id}: ${parsed.length} items`);
    } catch (error) {
      report.push({ id: source.id, status: "unreachable", detail: error.message });
      log(`source ${source.id}: ${error.message}`);
    }
  }
  return { items, report };
}
