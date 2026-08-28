/**
 * Lightweight, targeted HTML signal extraction (SSOT §8.2, §8.3). This is
 * deliberately regex-based rather than a full DOM parser — CLAUDE.md asks
 * to avoid heavy dependencies, and every signal here is a single
 * well-known tag/attribute, not general-purpose HTML traversal. Treat
 * these as best-effort extraction: a `null`/`false` result from a
 * malformed page means `not_measured`, never a silent failing score.
 */

export interface HtmlSignals {
  /** Value of the <html lang> attribute, or null when it is not declared. */
  htmlLang: string | null;
  title: string | null;
  metaDescription: string | null;
  h1Count: number;
  h1Text: string | null;
  headings: { level: number; text: string; index: number }[];
  visibleText: string;
  canonicalUrl: string | null;
  metaRobots: string | null;
  hasViewportMeta: boolean;
  jsonLdBlocks: unknown[];
  jsonLdParseErrors: number;
  links: { href: string; text: string }[];
}

function matchAll(html: string, pattern: RegExp): RegExpMatchArray[] {
  return [...html.matchAll(pattern)];
}

function extractAttr(tag: string, attr: string): string | null {
  const match = tag.match(new RegExp(`${attr}\\s*=\\s*["']([^"']*)["']`, "i"));
  return match ? match[1] : null;
}

function decodeBasicEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#(?:39|x27);/gi, "'");
}

export function htmlToVisibleText(html: string): string {
  return decodeBasicEntities(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

export function extractHtmlSignals(html: string): HtmlSignals {
  const htmlTagMatch = html.match(/<html\b[^>]*>/i);
  const htmlLang = htmlTagMatch ? extractAttr(htmlTagMatch[0], "lang") : null;

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, " ") : null;

  const h1Matches = matchAll(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi);
  const h1Text = h1Matches[0] ? h1Matches[0][1].replace(/<[^>]+>/g, "").trim().replace(/\s+/g, " ") : null;

  const linkTags = matchAll(html, /<link\b[^>]*>/gi);
  const canonicalTag = linkTags.find((m) => /rel\s*=\s*["']canonical["']/i.test(m[0]));
  const canonicalUrl = canonicalTag ? extractAttr(canonicalTag[0], "href") : null;

  const metaTags = matchAll(html, /<meta\b[^>]*>/gi);
  const robotsTag = metaTags.find((m) => /name\s*=\s*["']robots["']/i.test(m[0]));
  const metaRobots = robotsTag ? extractAttr(robotsTag[0], "content") : null;
  const descriptionTag = metaTags.find((m) => /name\s*=\s*["']description["']/i.test(m[0]));
  const metaDescription = descriptionTag ? extractAttr(descriptionTag[0], "content") : null;
  const hasViewportMeta = metaTags.some((m) => /name\s*=\s*["']viewport["']/i.test(m[0]));

  const headingMatches = matchAll(html, /<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi);
  const headings = headingMatches
    .map((match, index) => ({
      level: Number(match[1]),
      text: htmlToVisibleText(match[2]),
      index: index + 1,
    }))
    .filter((heading) => Boolean(heading.text));

  const jsonLdMatches = matchAll(html, /<script[^>]+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  const jsonLdBlocks: unknown[] = [];
  let jsonLdParseErrors = 0;
  for (const match of jsonLdMatches) {
    try {
      jsonLdBlocks.push(JSON.parse(match[1].trim()));
    } catch {
      jsonLdParseErrors += 1;
    }
  }

  const anchorMatches = matchAll(html, /<a\b[^>]*href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi);
  const links = anchorMatches.map((m) => ({
    href: m[1],
    text: m[2].replace(/<[^>]+>/g, "").trim().replace(/\s+/g, " "),
  }));

  return {
    htmlLang,
    title,
    metaDescription,
    h1Count: h1Matches.length,
    h1Text,
    headings,
    visibleText: htmlToVisibleText(html),
    canonicalUrl,
    metaRobots,
    hasViewportMeta,
    jsonLdBlocks,
    jsonLdParseErrors,
    links,
  };
}

const CONTACT_HREF_PATTERNS = [/^mailto:/i, /^tel:/i, /wa\.me\//i, /whatsapp/i, /\/contact/i];

export function hasContactPath(signals: HtmlSignals): boolean {
  return signals.links.some((link) => CONTACT_HREF_PATTERNS.some((pattern) => pattern.test(link.href)));
}

const ABOUT_HREF_PATTERN = /\/about/i;

export function hasAboutLink(signals: HtmlSignals): boolean {
  return signals.links.some((link) => ABOUT_HREF_PATTERN.test(link.href));
}

const SERVICE_HREF_PATTERN = /\/(services?|products?|pricing|solutions?)/i;

export function findServicePageLink(signals: HtmlSignals): string | null {
  const match = signals.links.find((link) => SERVICE_HREF_PATTERN.test(link.href));
  return match ? match.href : null;
}

const ORG_JSONLD_TYPES = new Set([
  "Organization",
  "LocalBusiness",
  "Product",
  "Service",
  "Corporation",
  "Store",
]);

function collectTypes(node: unknown, out: Set<string>): void {
  if (Array.isArray(node)) {
    for (const item of node) collectTypes(item, out);
    return;
  }
  if (!node || typeof node !== "object") return;
  const record = node as Record<string, unknown>;
  const type = record["@type"];
  if (typeof type === "string") out.add(type);
  if (Array.isArray(type)) type.forEach((t) => typeof t === "string" && out.add(t));
  if (Array.isArray(record["@graph"])) collectTypes(record["@graph"], out);
}

export function hasOrgLikeJsonLd(signals: HtmlSignals): boolean {
  const types = new Set<string>();
  for (const block of signals.jsonLdBlocks) collectTypes(block, types);
  return [...types].some((t) => ORG_JSONLD_TYPES.has(t));
}

/** Every node of every JSON-LD block, `@graph` included, flattened once. */
function collectNodes(node: unknown, out: Record<string, unknown>[]): void {
  if (Array.isArray(node)) {
    for (const item of node) collectNodes(item, out);
    return;
  }
  if (!node || typeof node !== "object") return;
  const record = node as Record<string, unknown>;
  out.push(record);
  for (const value of Object.values(record)) {
    if (value && typeof value === "object") collectNodes(value, out);
  }
}

export function jsonLdNodes(signals: HtmlSignals): Record<string, unknown>[] {
  const nodes: Record<string, unknown>[] = [];
  for (const block of signals.jsonLdBlocks) collectNodes(block, nodes);
  return nodes;
}

function hasText(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasText);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    // An author given as `{ "@id": ... }` names an entity the page still has
    // to describe; a bare reference is not a name.
    return hasText(record.name);
  }
  return false;
}

/** A named author, as a person or an organization the page actually names. */
export function namesAnAuthor(signals: HtmlSignals): boolean {
  return jsonLdNodes(signals).some((node) => hasText(node.author) || hasText(node.creator));
}

/** A publication or revision date the page publishes in machine-readable form. */
export function publishesADate(signals: HtmlSignals): boolean {
  return jsonLdNodes(signals).some(
    (node) => hasText(node.datePublished) || hasText(node.dateModified) || hasText(node.uploadDate),
  );
}

/**
 * Whether the entity points at itself somewhere else.
 *
 * `sameAs` is how a model confirms that the name on this page and the profile
 * it has seen elsewhere are the same organization. Without it a brand exists
 * only inside its own domain.
 */
export function declaresSameAs(signals: HtmlSignals): string[] {
  const found: string[] = [];
  for (const node of jsonLdNodes(signals)) {
    const value = node.sameAs;
    if (typeof value === "string" && value.trim()) found.push(value.trim());
    if (Array.isArray(value)) {
      for (const item of value) if (typeof item === "string" && item.trim()) found.push(item.trim());
    }
  }
  return [...new Set(found)];
}

/** A page that compares things, and whether a machine can read the comparison. */
export function comparisonSignals(html: string, signals: HtmlSignals): {
  looksLikeComparison: boolean;
  hasTable: boolean;
} {
  const heading = `${signals.title ?? ""} ${signals.headings.map((item) => item.text).join(" ")}`;
  return {
    looksLikeComparison: /\bvs\.?\b|\bversus\b|сравнени|сравнить|comparison|compare\b/i.test(heading),
    hasTable: /<table[\s>]/i.test(html),
  };
}
