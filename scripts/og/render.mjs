/**
 * Renders the social preview images from their HTML source.
 *
 * Playwright is not a dependency of this site — it is used from a global
 * install when an image needs regenerating, which is rare. The generated PNGs
 * are committed, so a normal build never runs this.
 *
 *   node scripts/og/render.mjs
 */
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "..", "public", "media", "lab");

const cards = [
  ["card-ru", "two-agent-review-ru.png"],
  ["card-en", "two-agent-review-en.png"],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1220, height: 700 } });
await page.goto(`file://${join(here, "lab-two-agent-review.html")}`);
await page.waitForTimeout(400);

for (const [id, file] of cards) {
  await page.locator(`#${id}`).screenshot({ path: join(outDir, file) });
  console.log("wrote", file);
}

await browser.close();
