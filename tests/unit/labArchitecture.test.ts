import { test } from "node:test";
import { appFile } from "./appRoutePath";
import assert from "node:assert/strict";
import { homepage } from "@/lib/data/homepage";
import { ruHomepage } from "@/lib/data/homepage-ru";
import {
  getLabItem,
  getLabItems,
  labContent,
  labLanguages,
  labPath,
  labSectionIds,
} from "@/lib/lab/content";
import { englishOnlyLabPaths } from "@/lib/lab/untranslated";
import { alternateLocalePath, isEnglishPublicPath } from "@/lib/localized-routes";
import sitemap from "@/app/sitemap";
import { readFileSync } from "node:fs";
import { join } from "node:path";

test("Selena Lab keeps its existing routes but publicly links the laboratory and blog structure", () => {
  assert.deepEqual(labSectionIds, ["research", "guides", "experiments", "articles", "courses"]);
  for (const locale of ["en", "ru"] as const) {
    assert.deepEqual(labContent[locale].sections.map((section) => section.id), labSectionIds);
  }

  const landing = readFileSync(join(process.cwd(), "components/lab/LabPages.tsx"), "utf8");
  assert.match(landing, /Исследования и инструменты/);
  assert.match(landing, /href="\/ru\/blog"/);
  assert.match(landing, /href: "\/ru\/tools"/);
  assert.match(landing, /href: "\/ru\/projects"/);
  assert.ok(!landing.includes('href="/ru/school"'));
});

test("the three owner-selected foundation topics are published in both languages", () => {
  const routes = [
    ["articles", "what-is-ai-visibility"],
    ["guides", "prepare-site-for-ai-systems"],
    ["guides", "read-ai-visibility-report-evidence"],
  ] as const;

  for (const [section, slug] of routes) {
    const en = getLabItem("en", section, slug);
    const ru = getLabItem("ru", section, slug);
    assert.ok(en, `missing English ${section}/${slug}`);
    assert.ok(ru, `missing Russian ${section}/${slug}`);
    assert.ok(en.blocks.length >= 4, `${slug} must be a useful article, not a placeholder`);
    assert.equal(en.blocks.length, ru.blocks.length, `${slug} must remain equivalent across locales`);
  }
});

test("a published experiment carries its reproduction steps and its limits", () => {
  for (const locale of ["en", "ru"] as const) {
    const entry = getLabItem(locale, "experiments", "two-agent-code-review");
    assert.ok(entry, `missing ${locale} experiments/two-agent-code-review`);

    // The section promises reproducibility, so an entry without steps a reader
    // can follow does not belong in it.
    const steps = entry.blocks.flatMap((block) => block.steps ?? []);
    assert.ok(steps.length >= 3, `${locale} experiment must publish reproduction steps`);

    // n = 1 is the honest denominator here; dropping it would turn one incident
    // into an implied pattern.
    assert.match(JSON.stringify(entry.blocks), /n = 1/);

    assert.ok((entry.related?.length ?? 0) >= 3, `${locale} experiment must link onward into the Lab`);

    // A diagram carries meaning the prose does not repeat, so it needs a
    // description for anyone who cannot see it.
    const figures = entry.blocks.flatMap((block) => (block.figure ? [block.figure] : []));
    assert.equal(figures.length, 2, `${locale} experiment must keep both diagrams`);
    for (const figure of figures) {
      assert.ok(figure.alt.length > 80, `${locale} figure ${figure.diagram} needs a real description`);
      assert.ok(figure.caption.length > 0);
    }
  }

  const en = getLabItem("en", "experiments", "two-agent-code-review")!;
  const ru = getLabItem("ru", "experiments", "two-agent-code-review")!;
  assert.equal(en.blocks.length, ru.blocks.length, "both locales must tell the same story");
  assert.equal(en.publishedAt, ru.publishedAt);

  const urls = sitemap().map((entry) => String(entry.url));
  assert.ok(urls.includes("https://www.selenasystems.com/lab/experiments/two-agent-code-review"));
  assert.ok(urls.includes("https://www.selenasystems.com/ru/lab/experiments/two-agent-code-review"));
});

test("the restaurant article is listed under Articles in both languages and links onward in its own language", () => {
  const expected = {
    en: { metaTitle: "Why AI Does Not Recommend Your Restaurant", links: ["/check", "/visibility", "/methodology", "/lab/guides/prepare-site-for-ai-systems"] },
    ru: { metaTitle: "Почему ИИ не рекомендует ваш ресторан", links: ["/ru/check", "/ru/visibility", "/ru/methodology", "/ru/lab/guides/prepare-site-for-ai-systems"] },
  } as const;

  for (const locale of ["en", "ru"] as const) {
    const article = getLabItem(locale, "articles", "restaurant-on-google-not-in-ai-recommendations");
    assert.ok(article, `missing ${locale} articles/restaurant-on-google-not-in-ai-recommendations`);
    assert.ok(getLabItems(locale, "articles").includes(article));
    assert.equal(article.metaTitle, expected[locale].metaTitle);
    assert.ok(article.summary.length <= 160, "the summary doubles as the meta description");

    const internal = [article.cta?.primary.href, ...(article.related ?? []).map((link) => link.href)];
    for (const href of expected[locale].links) {
      assert.ok(internal.includes(href), `${locale} article must link to ${href}`);
    }
    assert.equal(article.cta?.primary.href, expected[locale].links[0]);

    // Its claims rest on these two; dropping either leaves a figure without its origin.
    const sources = article.sources.map((source) => source.href);
    assert.ok(sources.includes("https://developers.google.com/search/docs/appearance/ai-features"));
    assert.ok(sources.includes("https://arxiv.org/abs/2609.23162"));
  }

  const en = getLabItem("en", "articles", "restaurant-on-google-not-in-ai-recommendations")!;
  const ru = getLabItem("ru", "articles", "restaurant-on-google-not-in-ai-recommendations")!;
  assert.equal(en.blocks.length, ru.blocks.length, "both editions must tell the same story");
});

test("the two editions of the restaurant article point at each other", () => {
  const en = labPath("en", "articles", "restaurant-on-google-not-in-ai-recommendations");
  const ru = labPath("ru", "articles", "restaurant-on-google-not-in-ai-recommendations");
  assert.deepEqual(labLanguages("articles", "restaurant-on-google-not-in-ai-recommendations"), { "x-default": en, en, ru });
  assert.equal(alternateLocalePath(en), ru);
  assert.equal(alternateLocalePath(ru), en);

  const urls = sitemap().map((entry) => String(entry.url));
  assert.ok(urls.includes(`https://www.selenasystems.com${en}`));
  assert.ok(urls.includes(`https://www.selenasystems.com${ru}`));
});

test("no Lab entry points search engines or visitors at an edition that does not exist", () => {
  const entries = sitemap();
  const urls = new Set(entries.map((entry) => String(entry.url)));
  for (const entry of entries) {
    for (const href of Object.values(entry.alternates?.languages ?? {}).map(String)) {
      assert.ok(urls.has(href), `${entry.url} names ${href}, which the sitemap does not publish`);
    }
  }

  // An entry written in one language so far carries no alternate and no switch.
  for (const item of labContent.en.items.filter((entry) => !getLabItem("ru", entry.section, entry.slug))) {
    assert.equal(labLanguages(item.section, item.slug), undefined);
    assert.ok(!urls.has(`https://www.selenasystems.com${labPath("ru", item.section, item.slug)}`));
    assert.equal(alternateLocalePath(labPath("en", item.section, item.slug)), null);
  }
});

test("the Russian Lab landing leads to the Articles section", () => {
  const landing = readFileSync(join(process.cwd(), "components/lab/LabPages.tsx"), "utf8");
  assert.match(landing, /\["research", "guides", "experiments", "articles"\]/);
});

test("the language switch knows exactly which English Lab entries are untranslated", () => {
  const untranslated = labContent.en.items
    .filter((item) => !getLabItem("ru", item.section, item.slug))
    .map((item) => labPath("en", item.section, item.slug));
  assert.deepEqual([...englishOnlyLabPaths].sort(), untranslated.sort());
});

test("Lab courses disclose that nothing is for sale and reserve the shared learning workspace", () => {
  for (const locale of ["en", "ru"] as const) {
    assert.equal(getLabItems(locale, "courses").length, 0);
    assert.match(labContent[locale].coursesBoundary, /app\.selenasystems\.com\/app\/learn/);
    assert.match(labContent[locale].coursesBoundary, locale === "en" ? /No course is currently offered for sale/ : /ни один курс не выставлен на продажу/i);
  }
  assert.ok(!sitemap().some((entry) => /\/lab\/courses$/.test(String(entry.url))));
  const landing = readFileSync(join(process.cwd(), "components/lab/LabPages.tsx"), "utf8");
  assert.match(landing, /section\.id !== "courses"/);
  for (const route of ["app/lab/[section]/page.tsx", "app/ru/lab/[section]/page.tsx"]) {
    const source = readFileSync(appFile(route), "utf8");
    assert.match(source, /section\.id === "courses"[\s\S]*index: false[\s\S]*follow: true/);
  }
});

test("Lab locale switching preserves section and article paths", () => {
  const enArticle = labPath("en", "guides", "prepare-site-for-ai-systems");
  const ruArticle = labPath("ru", "guides", "prepare-site-for-ai-systems");
  assert.equal(alternateLocalePath(enArticle), ruArticle);
  assert.equal(alternateLocalePath(ruArticle), enArticle);
  assert.equal(isEnglishPublicPath(enArticle), true);
  assert.equal(isEnglishPublicPath(ruArticle), false);
  assert.deepEqual(labLanguages("guides", "prepare-site-for-ai-systems"), {
    "x-default": enArticle,
    en: enArticle,
    ru: ruArticle,
  });
});

test("both home navigations expose Selena Lab as a supporting destination", () => {
  assert.ok(homepage.nav.some((item) => item.href === "/lab" && item.label === "Lab"));
  assert.ok(ruHomepage.nav.some((item) => item.href === "/ru/lab" && item.label === "Lab"));
});

test("technical Lab guidance cites primary official sources", () => {
  const guide = getLabItem("en", "guides", "prepare-site-for-ai-systems")!;
  assert.ok(guide.sources.length >= 4);
  for (const source of guide.sources) {
    const host = new URL(source.href).hostname;
    assert.ok(
      host === "help.openai.com" || host === "developers.google.com" || host === "schema.org",
      `unexpected non-primary technical source: ${host}`,
    );
  }
});
