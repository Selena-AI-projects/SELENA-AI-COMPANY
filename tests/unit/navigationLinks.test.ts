import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import sitemap from "@/app/sitemap";
import { nav, cta, enNav, enCta } from "@/lib/site";
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

test("every English menu and CTA opens an English page", () => {
  for (const link of englishLinks) {
    if (!isInternal(link.href)) continue;
    assert.ok(!isRussian(link.href), `"${link.label}" → ${link.href} is a Russian page`);
  }
});

/** `/ru/projects/[slug]` matches the literal directory or a dynamic one. */
function routeExists(path: string): boolean {
  let dir = join(process.cwd(), "app");
  for (const segment of path.split("/").filter(Boolean)) {
    const literal = join(dir, segment);
    if (existsSync(literal)) {
      dir = literal;
      continue;
    }
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
