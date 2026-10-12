#!/usr/bin/env node
// Редакционный прогон Selena Lab (локально, без публикации):
//   проверяемый повод → редакционный замысел → статья RU → английская
//   адаптация → анонс Telegram → сохранённый черновик.
//
// Запуск:  node editorial/pipeline.mjs --trigger editorial/triggers/<повод>.json
// Повтор с тем же поводом новой статьи не создаёт (журнал editorial/registry.json).
// Отказ (источник недоступен / цитаты не найдены / проверки не прошли) —
// REFUSAL.md в каталоге прогона и ненулевой код; журнал не меняется.
//
// Границы: только публичные первичные источники из editorial/sources.json;
// тексты пишет `claude -p` по подписке (OAuth) — без API-ключей и платных
// вызовов; сеть — только curl к адресу повода. Ничего не публикуется.
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkClaims, checkTelegram, dateMakassar, findCovered, htmlToText, sha256, stampMakassar, verifyQuotes } from "./lib.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => (a.startsWith("--") ? [a.slice(2), all[i + 1] && !all[i + 1].startsWith("--") ? all[i + 1] : "true"] : [])).filter((p) => p.length));
if (!args.trigger) { console.error("usage: node editorial/pipeline.mjs --trigger <trigger.json> [--drafts editorial/drafts] [--registry editorial/registry.json]"); process.exit(64); }

const trigger = JSON.parse(fs.readFileSync(path.resolve(ROOT, args.trigger), "utf8"));
const sources = JSON.parse(fs.readFileSync(path.join(HERE, "sources.json"), "utf8"));
const registryPath = path.resolve(ROOT, args.registry ?? "editorial/registry.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const draftsRoot = path.resolve(ROOT, args.drafts ?? "editorial/drafts");
const startedAt = stampMakassar();
const runDir = path.join(draftsRoot, `${dateMakassar()}-${trigger.slug}`);
const run = { trigger: trigger.key, url: trigger.url, startedAt, zone: "Asia/Makassar", steps: [], llm: [] };
const log = (m) => { console.log(`[${stampMakassar().slice(11, 19)}] ${m}`); run.steps.push({ at: stampMakassar(), m }); };
const write = (name, data) => { fs.mkdirSync(runDir, { recursive: true }); fs.writeFileSync(path.join(runDir, name), typeof data === "string" ? data : `${JSON.stringify(data, null, 2)}\n`); };
const finish = (code) => { run.finishedAt = stampMakassar(); run.exitCode = code; write("run.json", run); process.exit(code); };
const refuse = (reason, extra = {}) => {
  log(`ОТКАЗ: ${reason}`);
  write("REFUSAL.md", `# Отказ редакционного прогона\n\n- Повод: ${trigger.key} — ${trigger.url}\n- Время: ${stampMakassar()} (Asia/Makassar)\n- Причина: ${reason}\n\n${Object.entries(extra).map(([k, v]) => `## ${k}\n\n\`\`\`\n${typeof v === "string" ? v : JSON.stringify(v, null, 2)}\n\`\`\`\n`).join("\n")}\nЖурнал тем не изменён, статья не создана.\n`);
  finish(2);
};

// 0. Дедупликация — до любой сети и любых вызовов модели.
const covered = findCovered(registry, trigger);
if (covered) {
  log(`тема уже выпускалась ${covered.date}: ${covered.draftDir} (key=${covered.key}). Новая статья не создаётся.`);
  console.log(`ALREADY_COVERED ${covered.draftDir}`);
  process.exit(0);
}

// 1. Белый список и способ оплаты модели — тоже до сети.
if (!sources.sources.some((s) => s.href === trigger.url)) refuse(`адрес повода не входит в editorial/sources.json: ${trigger.url}`);
if (process.env.ANTHROPIC_API_KEY) refuse("в окружении задан ANTHROPIC_API_KEY — платные вызовы API запрещены, прогон только по подписке (claude auth: oauth_token)");
let auth = {};
try { auth = JSON.parse(execFileSync("claude", ["auth", "status"], { encoding: "utf8" })); } catch (e) { refuse(`claude auth status недоступен: ${e.message.split("\n")[0]}`); }
if (!auth.loggedIn || auth.authMethod !== "oauth_token") refuse(`claude не вошёл по подписке (authMethod=${auth.authMethod ?? "?"})`);
run.claude = { version: execFileSync("claude", ["--version"], { encoding: "utf8" }).trim(), authMethod: auth.authMethod, apiProvider: auth.apiProvider };
log(`claude ${run.claude.version}, auth=${auth.authMethod}, provider=${auth.apiProvider}`);

// 2. Повод: загрузка публичного источника (curl: прокси и CA окружения) и дословные цитаты.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "editorial-"));
const htmlPath = path.join(tmp, "source.html");
let httpCode = "000"; let curlError = "";
try {
  httpCode = execFileSync("curl", ["-sS", "-L", "--max-time", "40", "-A", "SelenaEditorialRun/0.1 (local; owner review)", "-o", htmlPath, "-w", "%{http_code}", trigger.url], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
} catch (e) { curlError = (e.stderr || e.message || "").toString().trim().split("\n").slice(-2).join(" "); }
if (httpCode !== "200") refuse(`источник недоступен: HTTP ${httpCode}${curlError ? ` — ${curlError}` : ""}`, { curl: curlError || `HTTP ${httpCode}` });
const sourceText = htmlToText(fs.readFileSync(htmlPath, "utf8"));
const verification = verifyQuotes(sourceText, trigger.quotes ?? []);
const evidence = { url: trigger.url, fetchedAt: stampMakassar(), httpCode, textSha256: sha256(sourceText), textLength: sourceText.length, datedOnPage: trigger.datedOnPage, datedFound: trigger.datedOnPage ? sourceText.includes(trigger.datedOnPage) : null, quotesFound: verification.found, quotesMissing: verification.missing };
write("trigger-evidence.json", evidence);
if (!verification.ok) refuse(`повод не подтверждён: ${verification.missing.length} из ${trigger.quotes.length} цитат не найдены дословно в источнике`, { missing: verification.missing });
if (trigger.datedOnPage && !evidence.datedFound) refuse(`дата на странице источника не найдена: «${trigger.datedOnPage}»`);
log(`повод подтверждён: HTTP 200, ${verification.found.length}/${trigger.quotes.length} цитат найдены дословно, дата «${trigger.datedOnPage}» на странице`);
fs.writeFileSync(path.join(runDir, "source-text.txt"), sourceText);

// 3. Модель: только структурированный ответ, без инструментов, без сессии.
function ask(label, system, prompt, schema) {
  const started = Date.now();
  const r = spawnSync("claude", ["-p", prompt, "--output-format", "json", "--no-session-persistence", "--max-turns", "1", "--tools", "", "--json-schema", JSON.stringify(schema), "--system-prompt", system], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) refuse(`claude -p (${label}) завершился кодом ${r.status}`, { stderr: (r.stderr || "").slice(-2000), stdout: (r.stdout || "").replace(/eyJ[A-Za-z0-9_-]{20,}/g, "<token>").slice(-1500) });
  let out; try { out = JSON.parse(r.stdout); } catch { refuse(`claude -p (${label}): ответ не JSON`, { stdout: r.stdout.slice(0, 2000) }); }
  const usage = Object.fromEntries(Object.entries(out.modelUsage ?? {}).map(([m, u]) => [m, { in: u.inputTokens, out: u.outputTokens, cacheRead: u.cacheReadInputTokens, cacheCreate: u.cacheCreationInputTokens, costUSD: u.costUSD }]));
  run.llm.push({ label, at: stampMakassar(), seconds: Math.round((Date.now() - started) / 100) / 10, subtype: out.subtype, isError: out.is_error, totalCostUsdReported: out.total_cost_usd, modelUsage: usage });
  if (out.is_error || out.subtype !== "success" || !out.structured_output) refuse(`claude -p (${label}): ${out.subtype} ${String(out.result ?? "").slice(0, 300)}`);
  log(`${label}: ${Object.keys(usage).join("+")}, ${run.llm.at(-1).seconds} с, cost_reported=$${out.total_cost_usd}`);
  return out.structured_output;
}
const HONESTY = `Ты — редактор Selena Lab (Selena Systems, selenasystems.com): измерение видимости бизнеса в ответах ИИ. Правила честности — часть продукта:
— никаких придуманных клиентов, кейсов, цифр, отзывов, экспериментов и результатов; у Selena Systems в этом материале нет собственных замеров;
— каждое фактическое утверждение опирается только на приведённые дословные цитаты источника; интерпретации помечаются отдельно;
— никаких гарантий позиций, трафика, рекомендаций и выручки; никаких обещаний функций продукта, кроме бесплатной проверки готовности сайта (/ru/check, /check) и диагностики видимости в раннем доступе (/ru/visibility, /visibility);
— сдержанный практический тон без хайпа, без «революции ИИ»; названия роботов, продуктов и robots.txt — как в оригинале.`;
const quotesBlock = trigger.quotes.map((q, i) => `[Q${i + 1}] "${q}"`).join("\n");

const brief = ask("замысел", HONESTY, `Повод (первичный источник ${trigger.publisher}, ${trigger.datedOnPage}): ${trigger.sourceTitle}\n${trigger.url}\n\nДословные цитаты, подтверждённые в тексте источника:\n${quotesBlock}\n\nПредлагаемый угол: ${trigger.angle}\n\nСформулируй редакционный замысел на русском: angle (1–2 предложения), audience (кто читает: владельцы сайтов заведений и услуг), claims — 4–7 фактических утверждений, каждое с номером цитаты Q, на которую опирается (quote: номер без буквы), interpretations — 1–3 вывода, которые НЕ следуют дословно из цитат и будут помечены как интерпретация, notPromised — что статья обещать не должна. Если цитат недостаточно для честной статьи — refusalReason с причиной, остальное пустое.`, {
  type: "object", additionalProperties: false,
  properties: { angle: { type: "string" }, audience: { type: "string" }, claims: { type: "array", items: { type: "object", additionalProperties: false, properties: { claim: { type: "string" }, quote: { type: "integer" } }, required: ["claim", "quote"] } }, interpretations: { type: "array", items: { type: "string" } }, notPromised: { type: "array", items: { type: "string" } }, refusalReason: { type: "string" } },
  required: ["angle", "audience", "claims", "interpretations", "notPromised", "refusalReason"],
});
write("brief.json", brief);
if (brief.refusalReason) refuse(`модель считает повод недостаточным: ${brief.refusalReason}`);
if (brief.claims.some((c) => c.quote < 1 || c.quote > trigger.quotes.length)) refuse("в замысле есть утверждение без опоры на цитату");
log(`замысел: ${brief.claims.length} утверждений с опорой на цитаты, ${brief.interpretations.length} интерпретаций`);

// Схема статьи — поля формата Лаборатории (docs/22-selena-lab-publishing.md); flow как плоский список.
const FLOW = { type: "object", additionalProperties: false, properties: { type: { type: "string", enum: ["paragraph", "points", "steps", "subheading", "cite"] }, text: { type: "string" }, items: { type: "array", items: { type: "string" } }, tag: { type: "string" } }, required: ["type", "text", "items", "tag"] };
const LINK = { type: "object", additionalProperties: false, properties: { title: { type: "string" }, href: { type: "string" } }, required: ["title", "href"] };
const ARTICLE = {
  type: "object", additionalProperties: false,
  properties: {
    title: { type: "string" }, metaTitle: { type: "string" }, summary: { type: "string" }, label: { type: "string" }, readingTime: { type: "string" },
    intro: { type: "array", items: { type: "string" } },
    blocks: { type: "array", items: { type: "object", additionalProperties: false, properties: { heading: { type: "string" }, flow: { type: "array", items: FLOW } }, required: ["heading", "flow"] } },
    ctaParagraphs: { type: "array", items: { type: "string" } }, ctaPrimary: LINK, ctaSecondary: LINK, related: { type: "array", items: LINK },
  },
  required: ["title", "metaTitle", "summary", "label", "readingTime", "intro", "blocks", "ctaParagraphs", "ctaPrimary", "ctaSecondary", "related"],
};
const today = dateMakassar();
const toLab = (a, locale) => ({
  section: trigger.section, slug: trigger.slug, title: a.title, metaTitle: a.metaTitle, summary: a.summary, label: a.label, readingTime: a.readingTime,
  publishedAt: today, updatedAt: today, intro: a.intro,
  blocks: a.blocks.map((b) => ({ heading: b.heading, paragraphs: [], flow: b.flow.map((f) => f.type === "paragraph" ? { paragraph: f.text } : f.type === "points" ? { points: f.items } : f.type === "steps" ? { steps: f.items } : f.type === "subheading" ? (f.tag ? { subheading: f.text, tag: f.tag } : { subheading: f.text }) : { cite: { title: trigger.sourceTitle, href: trigger.url, publisher: trigger.publisher } }) })),
  cta: { paragraphs: a.ctaParagraphs, primary: a.ctaPrimary, secondary: a.ctaSecondary },
  sources: [{ title: trigger.sourceTitle, href: trigger.url, publisher: trigger.publisher }],
  related: a.related,
  provenance: undefined,
});
const FORMAT_RU = `Формат (строго): metaTitle 13–43 знака (сайт добавит « — Selena Systems»); summary 120–160 знаков; label «Руководство»; readingTime вида «6 мин»; intro — 1–2 абзаца; blocks — 4–6 разделов, у каждого heading и flow. В flow допустимы элементы type: paragraph (text), points (items), steps (items), subheading (text + tag «ИЗВЛЕЧЕНО» для фактов из цитат или «ИНТЕРПРЕТИРОВАНО» для выводов), cite (ссылка на источник; text оставь пустым — сайт подставит название, издателя и адрес сам). Каждый раздел с фактами завершай элементом cite. Для элемента без items передавай items: [], без tag — tag: "". Внутренние ссылки — только /ru/check, /ru/visibility, /ru/methodology, /ru/lab/...; ctaPrimary: {"title":"Запустить проверку готовности","href":"/ru/check"}, ctaSecondary: {"title":"Подробнее о диагностике видимости","href":"/ru/visibility"}; related — 2 ссылки на русские страницы. Как можно меньше английских слов, кроме имён роботов, продуктов и robots.txt. Числа и даты — только из цитат и из даты источника (${trigger.datedOnPage}).`;
const ruRaw = ask("статья RU", HONESTY, `Напиши русскую статью Лаборатории по замыслу.\n\nЗамысел: ${JSON.stringify(brief, null, 1)}\n\nИсточник: ${trigger.sourceTitle} (${trigger.publisher}, ${trigger.datedOnPage}) — ${trigger.url}\nЦитаты:\n${quotesBlock}\n\n${FORMAT_RU}`, ARTICLE);
const ru = toLab(ruRaw, "ru");
write(`${trigger.slug}.ru.json`, ru);
const FORMAT_EN = `Format (strict): same structure as the Russian version, same number of blocks and the same claims and numbers — an adaptation, not a new article; metaTitle 13–43 characters; summary 120–160 characters; label "Guide"; readingTime like "6 min"; tags "EXTRACTED" / "INTERPRETED"; cite elements with empty text (the site renders the source itself); internal links only /check, /visibility, /methodology, /lab/...; ctaPrimary {"title":"Run Public Readiness","href":"/check"}, ctaSecondary {"title":"Explore AI Visibility","href":"/visibility"}; related — 2 English pages. Do not add facts, numbers or promises absent from the Russian text.`;
const enRaw = ask("адаптация EN", HONESTY, `Prepare the English adaptation of this approved-for-adaptation Russian Lab article.\n\nRussian version (JSON): ${JSON.stringify(ru)}\n\nSource quotes (verbatim):\n${quotesBlock}\n\n${FORMAT_EN}`, ARTICLE);
const en = toLab(enRaw, "en");
write(`${trigger.slug}.en.json`, en);
const tg = ask("анонс Telegram", HONESTY, `Напиши анонс для Telegram-канала Selena Systems к русской статье (до 600 знаков, без хештегов-спама, без гарантий): 2–4 предложения о том, что нового говорит источник и зачем это владельцу сайта, затем ссылка на материал https://www.selenasystems.com/ru/lab/${trigger.section}/${trigger.slug} и ссылка на первичный источник ${trigger.url}.\n\nСтатья: ${ru.title}. ${ru.summary}`, { type: "object", additionalProperties: false, properties: { text: { type: "string" } }, required: ["text"] });
write("telegram.ru.md", `${tg.text}\n`);

// 4. Проверки: формат Лаборатории тем же парсером, что публикует сайт; утверждения ↔ источники; анонс.
const labCheck = {};
for (const [locale, file] of [["ru", `${trigger.slug}.ru.json`], ["en", `${trigger.slug}.en.json`]]) {
  const r = spawnSync("node", ["--import", "tsx", path.join(HERE, "validate-lab.ts"), trigger.section, trigger.slug, locale, path.join(runDir, file)], { cwd: ROOT, encoding: "utf8" });
  labCheck[locale] = { ok: r.status === 0, out: (r.stdout + r.stderr).trim() };
}
const claims = checkClaims({ ru, en, trigger, sources });
const telegram = checkTelegram(tg.text, { section: trigger.section, slug: trigger.slug, triggerUrl: trigger.url });
write("checks.json", { lab: labCheck, claims, telegram });
const failed = [...Object.entries(labCheck).filter(([, v]) => !v.ok).map(([k, v]) => `формат ${k}: ${v.out}`), ...claims.problems.map((p) => `сверка: ${p}`), ...telegram.problems.map((p) => `анонс: ${p}`)];
if (failed.length) refuse(`черновик не прошёл проверки (${failed.length})`, { problems: failed });
log(`проверки: формат RU/EN — парсер Лаборатории OK; сверка утверждений — OK; анонс — OK`);

// 5. Манифест и журнал тем.
const manifest = fs.readdirSync(runDir).filter((f) => f !== "manifest.sha256" && f !== "run.json").sort().map((f) => `${sha256(fs.readFileSync(path.join(runDir, f)))}  ${f}`).join("\n");
write("manifest.sha256", `${manifest}\n`);
registry.entries.push({ key: trigger.key, url: trigger.url, slug: trigger.slug, section: trigger.section, date: today, at: stampMakassar(), draftDir: path.relative(ROOT, runDir), sourceTextSha256: evidence.textSha256, status: "draft_for_owner_review" });
fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
log(`черновик сохранён: ${path.relative(ROOT, runDir)} (статус: на согласование владельцу; не опубликован)`);
console.log(`DRAFT_SAVED ${path.relative(ROOT, runDir)}`);
finish(0);
