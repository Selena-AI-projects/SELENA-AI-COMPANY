import assert from "node:assert/strict";
import test from "node:test";
import {
  alternateLocalePath,
  isEnglishPublicPath,
} from "../../lib/localized-routes";

test("home and legal pages keep a real locale alternate", () => {
  assert.equal(alternateLocalePath("/"), "/ru");
  assert.equal(alternateLocalePath("/ru"), "/");
  assert.equal(alternateLocalePath("/en/contact"), "/contact");
  assert.equal(alternateLocalePath("/contact"), "/en/contact");
  assert.equal(alternateLocalePath("/en/about"), "/about");
  assert.equal(alternateLocalePath("/about"), "/en/about");
  assert.equal(alternateLocalePath("/ru/visibility"), "/visibility");
  assert.equal(alternateLocalePath("/lab/articles/what-is-ai-visibility"), "/ru/lab/articles/what-is-ai-visibility");
});

test("pages without a translation return null instead of dumping to home", () => {
  for (const path of ["/ai-systems", "/ai-systems/ai-audit", "/ai-training", "/ai-automation", "/ai-content"]) {
    assert.equal(alternateLocalePath(path), null, `${path} must not switch to a wrong page`);
  }
});

test("English-only product routes keep English navigation and footer copy", () => {
  for (const path of ["/ai-systems", "/ai-systems/ai-audit"]) {
    assert.equal(isEnglishPublicPath(path), true, `${path} must render as English`);
  }
});

test("the Russian service pages are served with the Russian navigation", () => {
  // Their content is Russian and the middleware serves them as Russian
  // documents; the header has to agree, or a visitor arriving from search
  // reads Russian under an English menu.
  for (const path of ["/ai-training", "/ai-automation", "/ai-content"]) {
    assert.equal(isEnglishPublicPath(path), false, `${path} is a Russian page`);
    // Still no English twin to switch to.
    assert.equal(alternateLocalePath(path), null, `${path} must not switch to a wrong page`);
  }
});
