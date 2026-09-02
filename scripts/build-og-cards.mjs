/**
 * Builds the social cards served as Open Graph images.
 *
 * A card is a cinematic frame from the site with the wordmark and the page's
 * own line over it. Rendering happens in Chromium against the running site so
 * the card uses the real brand faces — sharp's SVG text can only reach the
 * fonts installed in the machine, and none of them are ours.
 *
 * Usage: node scripts/build-og-cards.mjs [origin]   (default http://127.0.0.1:3100)
 */

import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const { chromium } = require("playwright-core");

const ORIGIN = process.argv[2] ?? "http://127.0.0.1:3100";
const OUT_DIR = path.resolve("public/og");
const WIDTH = 1200;
const HEIGHT = 630;

/** One card per surface a visitor is likely to share. */
const CARDS = [
  { name: "home", frame: "/media/cinematic/hero-poster.webp", eyebrow: "AI Visibility · AI Automation", title: "Ваш бизнес попадает в ответы AI?" },
  { name: "home-en", frame: "/media/cinematic/hero-poster.webp", eyebrow: "AI Visibility · AI Automation", title: "When customers ask AI, is your business in the answer?" },
  { name: "visibility", frame: "/media/cinematic/pages/visibility-window.webp", eyebrow: "AI Visibility", title: "Что AI-системы отвечают о вашем бизнесе" },
  { name: "automation", frame: "/media/cinematic/pages/gears.webp", eyebrow: "AI Automation", title: "Сначала процесс, потом инструмент" },
  { name: "pricing", frame: "/media/cinematic/pages/doors.webp", eyebrow: "Тарифы", title: "Бесплатный вход и четыре платных шага" },
  { name: "check", frame: "/media/cinematic/pages/loupe.webp", eyebrow: "Бесплатная проверка", title: "Что AI может прочитать на вашем сайте" },
  { name: "projects", frame: "/media/cinematic/pages/journal.webp", eyebrow: "Журнал замеров", title: "Мы измеряем себя первыми — и показываем результат целиком" },
  { name: "lab", frame: "/media/cinematic/pages/lab-bench.webp", eyebrow: "Selena Lab", title: "Исследования, руководства и эксперименты" },
  { name: "about", frame: "/media/cinematic/pages/about-studio.webp", eyebrow: "Обо мне", title: "Практическое внедрение AI — без хайпа" },
  { name: "contact", frame: "/media/cinematic/pages/contact-table.webp", eyebrow: "Связаться", title: "Разберём вашу задачу" },
];

const card = ({ frame, eyebrow, title }) => `<!doctype html>
<html lang="ru"><head><meta charset="utf-8">
<style>
  @font-face { font-family: "Cormorant Garamond"; font-weight: 400 600; font-display: block;
    src: url("${ORIGIN}/fonts/cormorant-garamond-cyrillic.woff2") format("woff2"); }
  @font-face { font-family: "Cormorant Garamond"; font-weight: 400 600; font-display: block;
    src: url("${ORIGIN}/fonts/cormorant-garamond-latin.woff2") format("woff2");
    unicode-range: U+0000-00FF, U+2000-206F; }
  @font-face { font-family: "Commissioner"; font-weight: 400 700; font-display: block;
    src: url("${ORIGIN}/fonts/commissioner-cyrillic.woff2") format("woff2"); }
  @font-face { font-family: "Commissioner"; font-weight: 400 700; font-display: block;
    src: url("${ORIGIN}/fonts/commissioner-latin.woff2") format("woff2");
    unicode-range: U+0000-00FF, U+2000-206F; }
  * { margin: 0; box-sizing: border-box; }
  body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden;
    font-family: "Commissioner", sans-serif; background: #0d1421; }
  .frame { position: absolute; inset: 0; }
  .frame img { width: 100%; height: 100%; object-fit: cover; }
  /* The copy sits on the left third, so the shade is heaviest there and the
     frame stays visible on the right. */
  .shade { position: absolute; inset: 0;
    background:
      linear-gradient(100deg, rgba(13,20,33,0.94) 0%, rgba(13,20,33,0.78) 40%, rgba(13,20,33,0.18) 70%, rgba(13,20,33,0) 100%),
      linear-gradient(to top, rgba(13,20,33,0.6), rgba(13,20,33,0) 45%); }
  .body { position: absolute; inset: 0; padding: 64px 72px;
    display: flex; flex-direction: column; justify-content: space-between; }
  .mark { display: flex; align-items: baseline; gap: 10px; color: #f7f2ea; }
  .mark .name { font-family: "Cormorant Garamond", Georgia, serif; font-size: 34px; font-weight: 600; }
  .mark .systems { font-size: 17px; font-weight: 600; letter-spacing: 0.22em;
    text-transform: uppercase; color: rgba(247,242,234,0.82); }
  .mark .dot { width: 8px; height: 8px; border-radius: 999px; background: #b9825b; }
  .eyebrow { font-size: 17px; font-weight: 600; letter-spacing: 0.2em;
    text-transform: uppercase; color: #cf9a70; }
  h1 { font-family: "Cormorant Garamond", Georgia, serif; font-weight: 600;
    font-size: 58px; line-height: 1.08; color: #f7f2ea; max-width: 17ch;
    margin-top: 20px; text-wrap: balance;
    text-shadow: 0 2px 24px rgba(13,20,33,0.55); }
  .foot { font-size: 19px; color: rgba(247,242,234,0.66); }
</style></head>
<body>
  <div class="frame"><img src="${ORIGIN}${frame}" alt=""></div>
  <div class="shade"></div>
  <div class="body">
    <div class="mark"><span class="name">Selena</span><span class="systems">Systems</span><span class="dot"></span></div>
    <div>
      <p class="eyebrow">${eyebrow}</p>
      <h1>${title}</h1>
    </div>
    <p class="foot">selenasystems.com</p>
  </div>
</body></html>`;

/**
 * The iOS home-screen icon. It has to be a raster file — Next.js only accepts
 * png/jpg for `apple-icon` — and it is drawn here rather than by sharp so the
 * letter is the real display serif and not whatever the machine has installed.
 */
const appleIcon = `<!doctype html>
<html><head><meta charset="utf-8">
<style>
  @font-face { font-family: "Cormorant Garamond"; font-weight: 600; font-display: block;
    src: url("${ORIGIN}/fonts/cormorant-garamond-latin.woff2") format("woff2"); }
  * { margin: 0; }
  /* iOS masks the corners itself, so this square is full-bleed. */
  body { width: 180px; height: 180px; background: #0d1421; overflow: hidden;
    display: flex; align-items: center; justify-content: center; }
  .glyph { position: relative; display: flex; align-items: baseline; }
  .s { font-family: "Cormorant Garamond", Georgia, serif; font-weight: 600; font-size: 130px;
    line-height: 1; color: #f7f2ea; }
  .dot { width: 20px; height: 20px; border-radius: 999px; background: #b9825b; margin-left: 8px; }
</style></head>
<body><div class="glyph"><span class="s">S</span><span class="dot"></span></div></body></html>`;

mkdirSync(OUT_DIR, { recursive: true });
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

{
  const page = await browser.newPage({ viewport: { width: 180, height: 180 } });
  await page.setContent(appleIcon, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: "app/apple-icon.png", type: "png" });
  await page.close();
  console.log("app/apple-icon.png — 180×180");
}

for (const spec of CARDS) {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
  await page.setContent(card(spec), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const png = await page.screenshot({ type: "png" });
  await page.close();

  // JPEG, not WebP: several chat clients still refuse a WebP link preview.
  const info = await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile(`${OUT_DIR}/${spec.name}.jpg`);
  console.log(`${spec.name}.jpg — ${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB`);
}

await browser.close();
