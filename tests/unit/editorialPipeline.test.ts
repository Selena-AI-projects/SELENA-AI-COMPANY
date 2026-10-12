import { test } from "node:test";
import assert from "node:assert/strict";
// Чистые функции редакционного прогона (editorial/lib.mjs). Сеть и модель
// здесь не вызываются; данные ниже — синтетические, помечены как тестовые.
import { checkClaims, checkTelegram, dateMakassar, findCovered, htmlToText, stampMakassar, verifyQuotes } from "../../editorial/lib.mjs";

const SOURCES = { sources: [{ publisher: "Test Publisher", host: "example.test", href: "https://example.test/primary" }] };
const TRIGGER = { key: "test-key", url: "https://example.test/primary", quotes: ['Bots respect "do not crawl" signals.'] };

function article(locale: "ru" | "en", overrides: Record<string, unknown> = {}) {
  const ru = locale === "ru";
  return {
    section: "guides", slug: "test-slug", publishedAt: "2026-10-11",
    title: ru ? "Тестовая статья: 3 робота" : "Test article: 3 robots",
    summary: "s".repeat(130), intro: [ru ? "Вступление." : "Intro."],
    blocks: [{ heading: ru ? "Раздел" : "Section", paragraphs: [], flow: [
      { subheading: ru ? "Факт" : "Fact", tag: ru ? "ИЗВЛЕЧЕНО" : "EXTRACTED" },
      { paragraph: ru ? "Роботов три." : "There are 3 robots." },
      { cite: { title: "Primary", href: "https://example.test/primary", publisher: "Test Publisher" } },
    ] }],
    cta: { paragraphs: ["x"], primary: { title: "c", href: ru ? "/ru/check" : "/check" } },
    sources: [{ title: "Primary", href: "https://example.test/primary", publisher: "Test Publisher" }],
    related: [{ title: "m", href: ru ? "/ru/methodology" : "/methodology" }],
    ...overrides,
  };
}

test("verifyQuotes: dословная цитата найдена с учётом типографских кавычек; HTTP 200 без цитаты — не подтверждение", () => {
  const text = htmlToText("<html><body><p>Anthropic’s Bots respect “do not crawl” signals.</p><script>x()</script></body></html>");
  const ok = verifyQuotes(text, TRIGGER.quotes);
  assert.equal(ok.ok, true);
  assert.equal(ok.found.length, 1);
  const bad = verifyQuotes(text, ["Bots ignore robots.txt."]);
  assert.equal(bad.ok, false);
  assert.deepEqual(bad.missing, ["Bots ignore robots.txt."]);
  assert.equal(verifyQuotes(text, []).ok, false, "пустой список цитат ничего не подтверждает");
});

test("findCovered: повтор по key или url — тема уже выпускалась; другой повод — нет", () => {
  const registry = { entries: [{ key: "test-key", url: "https://example.test/primary", date: "2026-10-11", draftDir: "editorial/drafts/2026-10-11-test-slug" }] };
  assert.ok(findCovered(registry, { key: "test-key", url: "https://other.test" }));
  assert.ok(findCovered(registry, { key: "other", url: "https://example.test/primary" }));
  assert.equal(findCovered(registry, { key: "other", url: "https://other.test" }), null);
  assert.equal(findCovered({ entries: [] }, TRIGGER), null);
});

test("checkClaims: согласованная пара RU/EN проходит", () => {
  const r = checkClaims({ ru: article("ru"), en: article("en"), trigger: TRIGGER, sources: SOURCES });
  assert.deepEqual(r.problems, []);
  assert.equal(r.ok, true);
});

test("checkClaims: источник вне белого списка, число только в EN, метка не на языке версии, гарантии, кейсы — отказ", () => {
  const en = article("en", {
    sources: [{ title: "x", href: "https://unlisted.test/page", publisher: "Unknown" }],
    blocks: [{ heading: "Section", paragraphs: [], flow: [
      { subheading: "Fact", tag: "ИЗВЛЕЧЕНО" },
      { paragraph: "There are 3 robots and 42% of sites; we guarantee results; our client case study." },
      { cite: { title: "x", href: "https://unlisted.test/page", publisher: "Unknown" } },
    ] }],
    related: [{ title: "m", href: "/ru/methodology" }],
  });
  const r = checkClaims({ ru: article("ru"), en, trigger: TRIGGER, sources: SOURCES });
  assert.equal(r.ok, false);
  const text = r.problems.join("\n");
  assert.match(text, /вне белого списка/);
  assert.match(text, /нет повода/);
  assert.match(text, /«42%» отсутствует/);
  assert.match(text, /не на языке версии/);
  assert.match(text, /гарантии/);
  assert.match(text, /клиентов\/кейсов/);
  assert.match(text, /ссылка на русскую страницу/);
  assert.match(text, /наборы источников RU и EN различаются/);
});

test("checkTelegram: нужна ссылка на материал и на источник, без гарантий, не длиннее 700", () => {
  const good = "Anthropic описала три робота. https://www.selenasystems.com/ru/lab/guides/test-slug — источник: https://example.test/primary";
  assert.equal(checkTelegram(good, { section: "guides", slug: "test-slug", triggerUrl: TRIGGER.url }).ok, true);
  const bad = checkTelegram("Гарантируем рост. " + "x".repeat(700), { section: "guides", slug: "test-slug", triggerUrl: TRIGGER.url });
  assert.equal(bad.ok, false);
  assert.equal(bad.problems.length, 4);
});

test("время прогона — Asia/Makassar (UTC+8), не UTC и не Ташкент", () => {
  const d = new Date("2026-10-11T16:30:00Z");
  assert.equal(stampMakassar(d), "2026-10-12 00:30:00 +08:00");
  assert.equal(dateMakassar(d), "2026-10-12");
});
