import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { LabItem } from "@/lib/lab/content";
import { mergeLabItems, parseLabFile, readLabFiles } from "@/lib/lab/files";

const SUMMARY =
  "Why a restaurant that ranks on Google can still be missing from AI recommendations, and the three checks that show where it drops out.";

function entry(overrides: Record<string, unknown> = {}) {
  return {
    section: "articles",
    slug: "ai-recommendations-check",
    title: "Why AI assistants skip a restaurant that ranks on Google",
    summary: SUMMARY,
    label: "Article",
    readingTime: "6 min",
    publishedAt: "2026-10-07",
    updatedAt: "2026-10-07",
    metaTitle: "Missing from AI recommendations",
    intro: ["A restaurant can rank first on Google and still be absent from AI answers."],
    blocks: [
      { heading: "What the assistants read", paragraphs: ["They repeat what a few pages already say."] },
      {
        heading: "Three checks",
        paragraphs: [],
        flow: [{ subheading: "Listings", tag: "EXTRACTED" }, { points: ["Maps", "Review sites"] }],
      },
    ],
    cta: {
      paragraphs: ["Run the free check on your own site."],
      primary: { title: "Free check", href: "/check" },
    },
    sources: [{ title: "AI features and your website", href: "https://developers.google.com/search", publisher: "Google" }],
    related: [{ title: "Methodology", href: "/methodology" }],
    provenance: { contentVersionId: "11111111-1111-1111-1111-111111111111", contentHash: "a".repeat(64) },
    ...overrides,
  };
}

const FILE = "data/lab/articles/ai-recommendations-check.en.json";

function parse(overrides: Record<string, unknown> = {}, file = FILE) {
  return parseLabFile(file, JSON.stringify(entry(overrides)));
}

test("a Lab file becomes an entry in the language its name gives, without the release metadata", () => {
  const { locale, item } = parse();
  assert.equal(locale, "en");
  assert.equal(item.slug, "ai-recommendations-check");
  assert.equal(item.metaTitle, "Missing from AI recommendations");
  assert.deepEqual(item.blocks[1].flow, [{ subheading: "Listings", tag: "EXTRACTED" }, { points: ["Maps", "Review sites"] }]);
  assert.ok(!("provenance" in item));
});

test("a Lab file that breaks the owner's publishing rules is refused, naming the rule", () => {
  const refusals: Array<[Record<string, unknown>, RegExp]> = [
    [{ subtitle: "x" }, /unknown fields: subtitle/],
    [{ section: "guides" }, /section must be "articles"/],
    [{ slug: "another-slug" }, /slug must be "ai-recommendations-check"/],
    [{ metaTitle: "A search title that runs far past the sixty characters the owner allows" }, /metaTitle must be 13–43/],
    [{ summary: "Too short." }, /summary must be 120–160/],
    [{ publishedAt: "2026-02-30" }, /publishedAt must be a real date/],
    [{ publishedAt: "2026-10-08" }, /updatedAt cannot be earlier/],
    [{ sources: [{ title: "Plain", href: "http://example.com", publisher: "Ex" }] }, /must be an https link/],
    [{ related: [{ title: "Русская страница", href: "/ru/methodology" }] }, /must be an English page/],
    [{ blocks: [{ heading: "Empty", paragraphs: [] }] }, /a heading and nothing under it/],
    [{ blocks: [{ heading: "Twice", paragraphs: ["a"] }, { heading: "Twice", paragraphs: ["b"] }] }, /headings must be unique/],
    [
      { blocks: [{ heading: "Mixed", paragraphs: [], flow: [{ paragraph: "a", points: ["b"] }] }] },
      /exactly one of paragraph, points, steps, subheading or cite/,
    ],
  ];
  for (const [overrides, reason] of refusals) {
    assert.throws(() => parse(overrides), reason, JSON.stringify(overrides));
  }
  assert.throws(() => parse({}, "data/lab/research/ai-recommendations-check.en.json"), /section must be one of/);
  assert.throws(() => parse({}, "data/lab/articles/ai-recommendations-check.de.json"), /file name must be/);
  assert.throws(() => parseLabFile(FILE, "{"), /is not valid JSON/);
});

test("a Russian Lab file keeps its links on Russian pages", () => {
  const ruFile = "data/lab/articles/ai-recommendations-check.ru.json";
  const ru = { cta: { paragraphs: ["Проверьте сайт."], primary: { title: "Проверка", href: "/ru/check" } }, related: [{ title: "Методология", href: "/ru/methodology" }] };
  assert.equal(parse(ru, ruFile).locale, "ru");
  assert.throws(() => parse({ ...ru, related: [{ title: "Methodology", href: "/methodology" }] }, ruFile), /must be a Russian page/);
});

function handWritten(slug: string): LabItem {
  return { ...parse().item, slug, publishedAt: "2026-01-01", updatedAt: "2026-01-01" };
}

test("file entries join the hand-written ones once per language, English before Russian", () => {
  const english = parse().item;
  const later = { ...english, slug: "a-later-article", publishedAt: "2026-11-01", updatedAt: "2026-11-01" };
  const merged = mergeLabItems({ en: [handWritten("existing")], ru: [handWritten("existing")] }, [
    { locale: "en", item: later },
    { locale: "en", item: english },
    { locale: "ru", item: english },
  ]);
  assert.deepEqual(merged.en.map((item) => item.slug), ["existing", "ai-recommendations-check", "a-later-article"]);
  assert.deepEqual(merged.ru.map((item) => item.slug), ["existing", "ai-recommendations-check"]);

  assert.throws(
    () => mergeLabItems({ en: [handWritten("ai-recommendations-check")], ru: [] }, [{ locale: "en", item: english }]),
    /already exists/,
  );
  assert.throws(() => mergeLabItems({ en: [], ru: [] }, [{ locale: "ru", item: english }]), /needs its English edition/);
});

test("only entry folders live under data/lab, so a stray file is an error rather than a silent skip", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "lab-files-"));
  try {
    fs.mkdirSync(path.join(root, "articles"));
    fs.writeFileSync(path.join(root, "README.md"), "notes");
    fs.writeFileSync(path.join(root, "english-only.json"), "[]");
    fs.writeFileSync(path.join(root, "articles", "ai-recommendations-check.en.json"), JSON.stringify(entry()));
    assert.deepEqual(readLabFiles(root).map(({ locale, item }) => `${locale}:${item.slug}`), ["en:ai-recommendations-check"]);

    fs.mkdirSync(path.join(root, "research"));
    assert.throws(() => readLabFiles(root), /only guides, articles, experiments folders/);
  } finally {
    fs.rmSync(root, { force: true, recursive: true });
  }
});
