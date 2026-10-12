// Чистые функции редакционного прогона: без сети, без LLM, без записи на диск.
// Их проверяют tests/unit/editorialPipeline.test.ts. Оркестрация — pipeline.mjs.
import { createHash } from "node:crypto";

export const ZONE = "Asia/Makassar"; // владелец — Бали, UTC+8

/** «2026-10-11 21:56:26 +08:00» — время владельца, не UTC и не время сборки. */
export function stampMakassar(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONE, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(date).reduce((acc, p) => ((acc[p.type] = p.value), acc), {});
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second} +08:00`;
}
export function dateMakassar(date = new Date()) { return stampMakassar(date).slice(0, 10); }

export function sha256(text) { return createHash("sha256").update(text).digest("hex"); }

/** Прямые кавычки и один пробел: цитата ищется по смыслу знаков, а не по типографике сайта. */
export function normalizeText(text) {
  return text
    .replace(/[‘’‚′]/g, "'")
    .replace(/[“”„″]/g, '"')
    .replace(/ /g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…", mdash: "—", ndash: "–" };
export function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m)
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

/**
 * Подтверждение повода: каждая ожидаемая цитата должна стоять в тексте
 * источника дословно (после нормализации знаков). HTTP 200 и совпадение
 * ключевых слов подтверждением не считаются.
 */
export function verifyQuotes(sourceText, quotes) {
  const haystack = normalizeText(sourceText);
  const found = []; const missing = [];
  for (const quote of quotes) {
    const needle = normalizeText(quote);
    const index = haystack.indexOf(needle);
    if (index >= 0) found.push({ quote, index, context: haystack.slice(Math.max(0, index - 80), index + needle.length + 80) });
    else missing.push(quote);
  }
  return { ok: missing.length === 0 && quotes.length > 0, found, missing };
}

/** Тема уже выпускалась: совпал key повода или его url. Хеш текста — версия, не признак новизны. */
export function findCovered(registry, trigger) {
  return (registry.entries ?? []).find((e) => e.key === trigger.key || e.url === trigger.url) ?? null;
}

function flowTexts(item) {
  const out = [item.title, item.metaTitle ?? "", item.summary, ...(item.intro ?? [])];
  for (const block of item.blocks ?? []) {
    out.push(block.heading, ...(block.paragraphs ?? []));
    for (const f of block.flow ?? []) {
      if (f.paragraph) out.push(f.paragraph);
      if (f.subheading) out.push(f.subheading);
      if (f.points) out.push(...f.points);
      if (f.steps) out.push(...f.steps);
    }
    if (block.points) out.push(...block.points);
    if (block.steps) out.push(...block.steps);
  }
  for (const p of item.cta?.paragraphs ?? []) out.push(p);
  return out.filter(Boolean);
}
export function numbersIn(item) {
  const set = new Set();
  for (const t of flowTexts(item)) for (const m of String(t).matchAll(/\d[\d.,]*%?/g)) set.add(m[0].replace(/[.,]$/, ""));
  return set;
}
function tagsIn(item) {
  const tags = [];
  for (const block of item.blocks ?? []) for (const f of block.flow ?? []) if (f.tag) tags.push(f.tag);
  return tags;
}
function citesIn(item) {
  const cites = [];
  for (const block of item.blocks ?? []) for (const f of block.flow ?? []) if (f.cite) cites.push(f.cite);
  return cites;
}

const FORBIDDEN = [
  { re: /(наш(его|и|их)? клиент|our client|клиентск(ий|ие) кейс|case stud|кейс[а-я]*\b)/i, why: "упоминание клиентов/кейсов — в репозитории их нет (правило честности)" },
  // Запрещены наши гарантии; отрицание («не гарантирует») и цитата источника — нет.
  { re: /(мы гарантируем|гарантируем (рост|результат|позици|трафик|попадани)|гарантированн(ый|ое|о|ая) (рост|результат|попадани|трафик)|we guarantee|guaranteed (growth|results|rankings|traffic|visibility))/i, why: "гарантии результата запрещены (sales.ts: без гарантий позиций и трафика)" },
  { re: /(мы измерили|we measured|по нашим данным|our data shows|наш эксперимент показал|our experiment showed)/i, why: "ссылка на собственный замер/эксперимент, которого в этом прогоне не было" },
];

/**
 * Сверка утверждений с источниками для пары RU/EN:
 *  - все ссылки sources и cite — только из белого списка, повод среди них;
 *  - факты/цифры EN ⊆ RU (адаптация не добавляет чисел);
 *  - метки доказательности на языке версии; внутренние ссылки — на страницы своего языка;
 *  - запретные формулировки (клиенты, гарантии, несуществующие замеры).
 */
export function checkClaims({ ru, en, trigger, sources }) {
  const problems = [];
  const allowed = new Set((sources.sources ?? []).map((s) => s.href));
  const check = (item, locale) => {
    const hrefs = (item.sources ?? []).map((s) => s.href);
    for (const h of hrefs) if (!allowed.has(h)) problems.push(`${locale}: источник вне белого списка: ${h}`);
    if (!hrefs.includes(trigger.url)) problems.push(`${locale}: среди источников нет повода ${trigger.url}`);
    const cites = citesIn(item);
    if (cites.length === 0) problems.push(`${locale}: нет ни одной ссылки cite («Источник») в разделах`);
    for (const c of cites) {
      const href = typeof c === "object" && c ? c.href : undefined;
      if (!href) problems.push(`${locale}: cite без ссылки`);
      else if (!allowed.has(href)) problems.push(`${locale}: cite ведёт вне белого списка: ${href}`);
    }
    const okTags = locale === "ru" ? ["ИЗВЛЕЧЕНО", "ИНТЕРПРЕТИРОВАНО"] : ["EXTRACTED", "INTERPRETED"];
    const tags = tagsIn(item);
    if (tags.length === 0) problems.push(`${locale}: нет меток доказательности`);
    for (const t of tags) if (!okTags.includes(t)) problems.push(`${locale}: метка «${t}» не на языке версии`);
    const internal = [item.cta?.primary?.href, item.cta?.secondary?.href, ...(item.related ?? []).map((r) => r.href)].filter(Boolean);
    for (const h of internal) {
      if (!h.startsWith("/")) problems.push(`${locale}: внутренняя ссылка не на страницу сайта: ${h}`);
      else if (locale === "ru" && !h.startsWith("/ru/")) problems.push(`ru: ссылка не на русскую страницу: ${h}`);
      else if (locale === "en" && h.startsWith("/ru/")) problems.push(`en: ссылка на русскую страницу: ${h}`);
    }
    const text = flowTexts(item).join("\n");
    for (const f of FORBIDDEN) if (f.re.test(text)) problems.push(`${locale}: ${f.why}`);
  };
  check(ru, "ru"); check(en, "en");
  if (ru.slug !== en.slug) problems.push(`slug различается: ${ru.slug} / ${en.slug}`);
  if (ru.section !== en.section) problems.push(`section различается: ${ru.section} / ${en.section}`);
  if (ru.publishedAt !== en.publishedAt) problems.push("publishedAt различается между версиями");
  const ruSrc = JSON.stringify((ru.sources ?? []).map((s) => s.href).sort());
  const enSrc = JSON.stringify((en.sources ?? []).map((s) => s.href).sort());
  if (ruSrc !== enSrc) problems.push("наборы источников RU и EN различаются");
  const ruNumbers = numbersIn(ru);
  for (const n of numbersIn(en)) if (!ruNumbers.has(n)) problems.push(`en: число «${n}» отсутствует в русской версии`);
  return { ok: problems.length === 0, problems };
}

/** Анонс в Telegram: короткий, со ссылкой на материал на сайте и на первичный источник, без гарантий. */
export function checkTelegram(text, { section, slug, triggerUrl }) {
  const problems = [];
  if (text.length > 700) problems.push(`анонс длиннее 700 знаков: ${text.length}`);
  if (!text.includes(`/ru/lab/${section}/${slug}`)) problems.push("нет ссылки на материал /ru/lab/…");
  if (!text.includes(triggerUrl)) problems.push("нет ссылки на первичный источник");
  for (const f of FORBIDDEN) if (f.re.test(text)) problems.push(f.why);
  return { ok: problems.length === 0, problems };
}
