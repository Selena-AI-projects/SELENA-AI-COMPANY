import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import sitemap from "@/app/sitemap";
import { nav, serviceNav, cta, enNav, enCta } from "@/lib/site";
import { homepage } from "@/lib/data/homepage";
import { ruHomepage } from "@/lib/data/homepage-ru";

/**
 * A Russian menu that opens an English page costs the visitor the language
 * they arrived in, and it is invisible in review: the label stays Russian.
 * The whole site was shipped that way once — the first item of the Russian
 * navigation opened /ai-systems — so the rule is checked rather than watched.
 */

/** The middleware's own list: Russian pages that live outside `/ru`. */
const russianPathsOutsideRu = new Set([
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/ai-training",
  "/ai-automation",
  "/ai-content",
]);

function pathOf(href: string): string {
  return href.split("#")[0] || "/";
}

function isRussian(href: string): boolean {
  const path = pathOf(href);
  return path === "/ru" || path.startsWith("/ru/") || russianPathsOutsideRu.has(path);
}

function isInternal(href: string): boolean {
  return href.startsWith("/");
}

const russianLinks = [
  ...nav,
  ...serviceNav,
  ...ruHomepage.nav,
  ruHomepage.cta,
  ...Object.values(cta),
];

const englishLinks = [...homepage.nav, homepage.cta, ...enNav, ...Object.values(enCta)];

test("every Russian menu and CTA opens a Russian page", () => {
  for (const link of russianLinks) {
    if (!isInternal(link.href)) continue;
    assert.ok(isRussian(link.href), `«${link.label}» → ${link.href} is an English page`);
  }
});

test("the service pages that have their own page are all offered somewhere", () => {
  // They were in the sitemap with nothing linking to them; the footer is that
  // link now, and it is built from the catalogue rather than retyped.
  assert.deepEqual(
    serviceNav.map((item) => item.href).sort(),
    ["/ai-automation", "/ai-content", "/ai-training"],
  );
});

test("every English menu and CTA opens an English page", () => {
  for (const link of englishLinks) {
    if (!isInternal(link.href)) continue;
    assert.ok(!isRussian(link.href), `"${link.label}" → ${link.href} is a Russian page`);
  }
});

/** `/ru/projects/[slug]` matches the literal directory or a dynamic one. */
function routeExists(path: string): boolean {
  return localeGroups.some((group) => servedFrom(join(process.cwd(), "app", group), path));
}

/** One language's route tree. A group name never appears in an address. */
const localeGroups = ["(en)", "(ru)"];

function servedFrom(root: string, path: string): boolean {
  let dir = root;
  for (const segment of path.split("/").filter(Boolean)) {
    const literal = join(dir, segment);
    if (existsSync(literal)) {
      dir = literal;
      continue;
    }
    if (!existsSync(dir)) return false;
    const dynamic = readdirSync(dir, { withFileTypes: true }).find(
      (entry) => entry.isDirectory() && entry.name.startsWith("["),
    );
    if (!dynamic) return false;
    dir = join(dir, dynamic.name);
  }
  return existsSync(join(dir, "page.tsx"));
}

test("every address in the sitemap is a page that exists", async () => {
  const entries = await sitemap();
  assert.ok(entries.length > 20);
  for (const entry of entries) {
    const path = new URL(entry.url).pathname;
    assert.ok(routeExists(path), `the sitemap offers ${path} and nothing serves it`);
  }
});

/** Every page file under a Russian route, including the ones outside `/ru`. */
function russianPageFiles(): string[] {
  const app = join(process.cwd(), "app");
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === "page.tsx") found.push(full);
    }
  };
  walk(join(app, "(ru)"));
  return found;
}

test("no Russian page hard-codes a link to an English page", () => {
  // The menu was not the only place this happened: each service page carried a
  // "Все услуги" button pointing at the English AI Systems page.
  for (const file of russianPageFiles()) {
    const source = readFileSync(file, "utf8");
    for (const [, href] of source.matchAll(/href="(\/[^"]*)"/g)) {
      if (href.startsWith("/api/")) continue;
      assert.ok(
        isRussian(href),
        `${file.replace(process.cwd(), "")} links to ${href}, an English page`,
      );
    }
  }
});

/**
 * The five Visibility tiers are one product; "Разберём вашу задачу" is the
 * brief for another one. Every paid tier on both home pages pointed at it, so
 * a visitor who clicked $49 landed in the AI Automation funnel.
 */
test("a measurement tier never opens the brief for a different service", () => {
  for (const [locale, content] of [
    ["ru", ruHomepage],
    ["en", homepage],
  ] as const) {
    const tiers = content.productPaths.visibility.items;
    assert.ok(tiers.length > 0, `${locale} has no Visibility tiers`);
    for (const tier of tiers) {
      if (!tier.cta) continue;
      assert.ok(
        !pathOf(tier.cta.href).includes("contact"),
        `${locale}: «${tier.name}» sends the visitor to ${tier.cta.href}`,
      );
    }
  }
});

/**
 * Two root layouts, one per language, and neither may read the request.
 *
 * The site had one root layout that took the language from a header the
 * middleware sets. That single call made every page dynamic, and Next streams
 * a dynamic page's title, canonical and hreflang into the body — where a
 * crawler that does not run JavaScript never counts them. The language now
 * comes from which group the route lives in, which is a build-time fact.
 */
test("each locale group declares its own language without reading the request", () => {
  for (const [group, lang] of [
    ["(en)", "en"],
    ["(ru)", "ru"],
  ] as const) {
    const layout = join(process.cwd(), "app", group, "layout.tsx");
    assert.ok(existsSync(layout), `${group} has no root layout`);
    const source = readFileSync(layout, "utf8");
    assert.match(source, new RegExp(`<html lang="${lang}"`), `${group} declares the wrong language`);
    assert.ok(
      !source.includes("next/headers"),
      `${group} reads the request, which moves every page's metadata out of <head>`,
    );
  }
  assert.ok(
    !existsSync(join(process.cwd(), "app", "layout.tsx")),
    "a third root layout would take both groups back to one language",
  );
});
