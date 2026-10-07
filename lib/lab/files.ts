import fs from "node:fs";
import path from "node:path";
import type {
  LabCode,
  LabContentBlock,
  LabFlowItem,
  LabItem,
  LabLocale,
  LabRelatedLink,
  LabSource,
  LabTable,
} from "@/lib/lab/content";

/**
 * Lab entries kept one file each: `data/lab/<section>/<slug>.<en|ru>.json`.
 *
 * A file is what lets a release publish an article: the Control Room opens a
 * pull request that adds one, and the owner reads the diff before merging it.
 * Hand-written entries in content.ts keep working beside them.
 */
export const labFilesRoot = path.join(process.cwd(), "data", "lab");

export type LabFileItem = { locale: LabLocale; item: LabItem };

const SECTIONS = ["guides", "articles", "experiments"] as const;
const LOCALES: readonly LabLocale[] = ["en", "ru"];
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FILE_NAME = /^([a-z0-9-]+)\.(en|ru)\.json$/;
const ROOT_FILES = new Set(["README.md", "english-only.json"]);

// buildMetadata appends " — Selena Systems"; the owner's rule is 30–60
// characters for the whole title (docs/22-selena-lab-publishing.md).
const SITE_SUFFIX_LENGTH = " — Selena Systems".length;
const META_TITLE = { min: 30 - SITE_SUFFIX_LENGTH, max: 60 - SITE_SUFFIX_LENGTH };
const SUMMARY = { min: 120, max: 160 };

const ITEM_KEYS = new Set([
  "section",
  "slug",
  "title",
  "summary",
  "label",
  "readingTime",
  "publishedAt",
  "updatedAt",
  "intro",
  "metaTitle",
  "blocks",
  "cta",
  "sources",
  "related",
  "socialImage",
  "provenance",
]);
const BLOCK_KEYS = new Set(["heading", "paragraphs", "flow", "points", "steps", "table", "code"]);
const PROVENANCE_KEYS = new Set(["contentVersionId", "contentHash", "manifestHash", "releaseIntentId"]);

type Json = Record<string, unknown>;

class LabFileError extends Error {}

function fail(file: string, message: string): never {
  throw new LabFileError(`${file}: ${message}`);
}

function isRecord(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(file: string, value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) fail(file, `${field} must be non-empty text`);
  return value;
}

function texts(file: string, value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.length === 0) fail(file, `${field} must be a non-empty list`);
  return value.map((entry, index) => text(file, entry, `${field}[${index}]`));
}

function onlyKeys(file: string, value: Json, allowed: ReadonlySet<string>, field: string) {
  const unknown = Object.keys(value).filter((key) => !allowed.has(key));
  if (unknown.length > 0) fail(file, `${field} has unknown fields: ${unknown.join(", ")}`);
}

function date(file: string, value: unknown, field: string): string {
  const raw = text(file, value, field);
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T00:00:00Z`) : null;
  // A rolled-over date (February 30th read as March 2nd) is as wrong as no date.
  if (!parsed || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== raw)
    fail(file, `${field} must be a real date, YYYY-MM-DD`);
  return raw;
}

function source(file: string, value: unknown, field: string): LabSource {
  if (!isRecord(value)) fail(file, `${field} must be an object`);
  onlyKeys(file, value, new Set(["title", "href", "publisher"]), field);
  const href = text(file, value.href, `${field}.href`);
  if (!/^https:\/\/[^\s]+$/.test(href)) fail(file, `${field}.href must be an https link`);
  return { title: text(file, value.title, `${field}.title`), href, publisher: text(file, value.publisher, `${field}.publisher`) };
}

// Links inside an entry stay on the site and in the entry's own language.
function internalLink(file: string, locale: LabLocale, value: unknown, field: string): LabRelatedLink {
  if (!isRecord(value)) fail(file, `${field} must be an object`);
  onlyKeys(file, value, new Set(["title", "href"]), field);
  const href = text(file, value.href, `${field}.href`);
  const isRussian = href === "/ru" || href.startsWith("/ru/");
  if (!href.startsWith("/") || href.startsWith("//") || isRussian !== (locale === "ru"))
    fail(file, `${field}.href must be ${locale === "ru" ? "a Russian" : "an English"} page on this site`);
  return { title: text(file, value.title, `${field}.title`), href };
}

function flowItem(file: string, value: unknown, field: string): LabFlowItem {
  if (!isRecord(value)) fail(file, `${field} must be an object`);
  const keys = Object.keys(value);
  if ("paragraph" in value && keys.length === 1) return { paragraph: text(file, value.paragraph, `${field}.paragraph`) };
  if ("points" in value && keys.length === 1) return { points: texts(file, value.points, `${field}.points`) };
  if ("steps" in value && keys.length === 1) return { steps: texts(file, value.steps, `${field}.steps`) };
  if ("cite" in value && keys.length === 1) return { cite: source(file, value.cite, `${field}.cite`) };
  if ("subheading" in value && keys.every((key) => key === "subheading" || key === "tag")) {
    const subheading = text(file, value.subheading, `${field}.subheading`);
    return value.tag === undefined ? { subheading } : { subheading, tag: text(file, value.tag, `${field}.tag`) };
  }
  fail(file, `${field} must be exactly one of paragraph, points, steps, subheading or cite`);
}

function table(file: string, value: unknown, field: string): LabTable {
  if (!isRecord(value)) fail(file, `${field} must be an object`);
  onlyKeys(file, value, new Set(["caption", "headers", "rows"]), field);
  const headers = texts(file, value.headers, `${field}.headers`);
  if (!Array.isArray(value.rows) || value.rows.length === 0) fail(file, `${field}.rows must be a non-empty list`);
  const rows = value.rows.map((row, index) => {
    if (!Array.isArray(row) || row.some((cell) => typeof cell !== "string"))
      fail(file, `${field}.rows[${index}] must be a list of text cells`);
    if (row.length !== headers.length) fail(file, `${field}.rows[${index}] must have ${headers.length} cells`);
    return row as string[];
  });
  return { caption: text(file, value.caption, `${field}.caption`), headers, rows };
}

function code(file: string, value: unknown, field: string): LabCode {
  if (!isRecord(value)) fail(file, `${field} must be an object`);
  onlyKeys(file, value, new Set(["caption", "content"]), field);
  return { caption: text(file, value.caption, `${field}.caption`), content: text(file, value.content, `${field}.content`) };
}

function block(file: string, value: unknown, field: string): LabContentBlock {
  if (!isRecord(value)) fail(file, `${field} must be an object`);
  onlyKeys(file, value, BLOCK_KEYS, field);
  const paragraphs = Array.isArray(value.paragraphs)
    ? value.paragraphs.map((entry, index) => text(file, entry, `${field}.paragraphs[${index}]`))
    : fail(file, `${field}.paragraphs must be a list`);
  const result: LabContentBlock = { heading: text(file, value.heading, `${field}.heading`), paragraphs };
  if (value.flow !== undefined) {
    if (!Array.isArray(value.flow) || value.flow.length === 0) fail(file, `${field}.flow must be a non-empty list`);
    result.flow = value.flow.map((entry, index) => flowItem(file, entry, `${field}.flow[${index}]`));
  }
  if (value.points !== undefined) result.points = texts(file, value.points, `${field}.points`);
  if (value.steps !== undefined) result.steps = texts(file, value.steps, `${field}.steps`);
  if (value.table !== undefined) result.table = table(file, value.table, `${field}.table`);
  if (value.code !== undefined) result.code = code(file, value.code, `${field}.code`);
  if (paragraphs.length === 0 && !result.flow && !result.points && !result.steps && !result.table && !result.code)
    fail(file, `${field} has a heading and nothing under it`);
  return result;
}

/**
 * One file, checked strictly. A malformed file is thrown rather than skipped:
 * skipping would publish a Lab that quietly lacks an article the owner merged.
 */
export function parseLabFile(file: string, raw: string): LabFileItem {
  const match = FILE_NAME.exec(path.basename(file));
  const section = path.basename(path.dirname(file));
  if (!match) fail(file, "file name must be <slug>.<en|ru>.json");
  if (!(SECTIONS as readonly string[]).includes(section)) fail(file, `section must be one of ${SECTIONS.join(", ")}`);
  const slug = match[1];
  const locale = match[2] as LabLocale;

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    fail(file, "is not valid JSON");
  }
  if (!isRecord(value)) fail(file, "must hold one object");
  onlyKeys(file, value, ITEM_KEYS, "entry");

  if (value.section !== section) fail(file, `section must be "${section}", as its folder says`);
  if (value.slug !== slug || !SLUG.test(slug)) fail(file, `slug must be "${slug}", in lowercase Latin words joined by hyphens`);

  const metaTitle = text(file, value.metaTitle, "metaTitle");
  if (metaTitle.length < META_TITLE.min || metaTitle.length > META_TITLE.max)
    fail(file, `metaTitle must be ${META_TITLE.min}–${META_TITLE.max} characters before the site name is added`);
  const summary = text(file, value.summary, "summary");
  if (summary.length < SUMMARY.min || summary.length > SUMMARY.max)
    fail(file, `summary must be ${SUMMARY.min}–${SUMMARY.max} characters`);

  const publishedAt = date(file, value.publishedAt, "publishedAt");
  const updatedAt = date(file, value.updatedAt, "updatedAt");
  if (updatedAt < publishedAt) fail(file, "updatedAt cannot be earlier than publishedAt");

  if (!Array.isArray(value.blocks) || value.blocks.length === 0) fail(file, "blocks must be a non-empty list");
  const blocks = value.blocks.map((entry, index) => block(file, entry, `blocks[${index}]`));
  const headings = blocks.map((entry) => entry.heading);
  if (new Set(headings).size !== headings.length) fail(file, "block headings must be unique");

  if (!Array.isArray(value.sources)) fail(file, "sources must be a list");

  const item: LabItem = {
    section: section as LabItem["section"],
    slug,
    title: text(file, value.title, "title"),
    summary,
    label: text(file, value.label, "label"),
    readingTime: text(file, value.readingTime, "readingTime"),
    publishedAt,
    updatedAt,
    metaTitle,
    blocks,
    sources: value.sources.map((entry, index) => source(file, entry, `sources[${index}]`)),
  };
  if (value.intro !== undefined) item.intro = texts(file, value.intro, "intro");
  if (value.cta !== undefined) {
    if (!isRecord(value.cta)) fail(file, "cta must be an object");
    onlyKeys(file, value.cta, new Set(["paragraphs", "primary", "secondary"]), "cta");
    item.cta = {
      paragraphs: texts(file, value.cta.paragraphs, "cta.paragraphs"),
      primary: internalLink(file, locale, value.cta.primary, "cta.primary"),
      ...(value.cta.secondary === undefined
        ? {}
        : { secondary: internalLink(file, locale, value.cta.secondary, "cta.secondary") }),
    };
  }
  if (value.related !== undefined) {
    if (!Array.isArray(value.related) || value.related.length === 0) fail(file, "related must be a non-empty list");
    item.related = value.related.map((entry, index) => internalLink(file, locale, entry, `related[${index}]`));
  }
  if (value.socialImage !== undefined) {
    if (!isRecord(value.socialImage)) fail(file, "socialImage must be an object");
    onlyKeys(file, value.socialImage, new Set(["url", "alt"]), "socialImage");
    const url = text(file, value.socialImage.url, "socialImage.url");
    if (!(url.startsWith("/") && !url.startsWith("//")) && !url.startsWith("https://"))
      fail(file, "socialImage.url must be a site path or an https link");
    item.socialImage = { url, alt: text(file, value.socialImage.alt, "socialImage.alt") };
  }
  if (value.provenance !== undefined) {
    if (!isRecord(value.provenance)) fail(file, "provenance must be an object");
    onlyKeys(file, value.provenance, PROVENANCE_KEYS, "provenance");
    for (const [key, entry] of Object.entries(value.provenance)) text(file, entry, `provenance.${key}`);
  }
  return { locale, item };
}

/** Every Lab file on disk; anything unexpected under data/lab is an error, not a skip. */
export function readLabFiles(root: string = labFilesRoot): LabFileItem[] {
  if (!fs.existsSync(root)) return [];
  const items: LabFileItem[] = [];
  for (const entry of fs.readdirSync(root).sort()) {
    const full = path.join(root, entry);
    if (ROOT_FILES.has(entry)) continue;
    if (!fs.statSync(full).isDirectory() || !(SECTIONS as readonly string[]).includes(entry))
      throw new LabFileError(`data/lab/${entry}: only ${SECTIONS.join(", ")} folders may hold Lab entries`);
    for (const name of fs.readdirSync(full).sort()) {
      const file = `data/lab/${entry}/${name}`;
      items.push(parseLabFile(file, fs.readFileSync(path.join(full, name), "utf8")));
    }
  }
  return items;
}

function key(item: LabItem) {
  return `${item.section}/${item.slug}`;
}

/**
 * Hand-written entries first, then file entries by date. An entry may exist
 * once per language, and a Russian file needs its English edition: the owner
 * publishes English first (docs/22-selena-lab-publishing.md).
 */
export function mergeLabItems(
  handWritten: Record<LabLocale, LabItem[]>,
  files: LabFileItem[],
): Record<LabLocale, LabItem[]> {
  const merged = { en: [...handWritten.en], ru: [...handWritten.ru] };
  const ordered = [...files].sort(
    (left, right) =>
      left.item.publishedAt.localeCompare(right.item.publishedAt) || key(left.item).localeCompare(key(right.item)),
  );
  for (const locale of LOCALES) {
    for (const { item } of ordered.filter((file) => file.locale === locale)) {
      if (merged[locale].some((existing) => key(existing) === key(item)))
        throw new LabFileError(`data/lab/${item.section}/${item.slug}.${locale}.json: this entry already exists`);
      merged[locale].push(item);
    }
  }
  for (const item of merged.ru) {
    if (!merged.en.some((existing) => key(existing) === key(item)))
      throw new LabFileError(`${key(item)}: a Russian edition needs its English edition, which is published first`);
  }
  return merged;
}
