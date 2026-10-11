// A draft package is a folder a person can read without the script: the
// three texts, the evidence they rest on, the page text they were checked
// against, and a manifest that names the run, the model and the content hash.
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, appendFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

export function slugify(text, max = 6) {
  const ascii = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, max)
    .join("-");
  return ascii || "hook";
}

export function contentHash(output) {
  return createHash("sha256").update(JSON.stringify({ ru: output.ru, en: output.en, telegram_ru: output.telegram_ru })).digest("hex");
}

export async function loadLedger(draftsRoot) {
  const file = path.join(draftsRoot, "ledger.json");
  if (!existsSync(file)) return { entries: [] };
  return JSON.parse(await readFile(file, "utf8"));
}

export async function saveLedger(draftsRoot, ledger) {
  await mkdir(draftsRoot, { recursive: true });
  await writeFile(path.join(draftsRoot, "ledger.json"), `${JSON.stringify(ledger, null, 2)}\n`);
}

export async function appendRunLog(draftsRoot, entry) {
  await mkdir(draftsRoot, { recursive: true });
  await appendFile(path.join(draftsRoot, "runs.jsonl"), `${JSON.stringify(entry)}\n`);
}

function renderArticle(version, { lang, stamp, pack, hero, situation, takeaway, nextAction, testData, checks }) {
  const label = lang === "ru" ? "Черновик" : "Draft";
  const verification =
    lang === "ru"
      ? `структурные проверки: ${checks.ok ? "пройдены" : "не пройдены"}; смысловая сверка с источником: не выполнена`
      : `structural checks: ${checks.ok ? "passed" : "failed"}; meaning not yet checked against the source`;
  // The title is the first line: that is how the Lab converter reads a draft.
  return [
    `# ${version.title}`,
    "",
    `<!-- ${label}: ${stamp.local}; version ${version.contentHash.slice(0, 12)}; status draft; ${verification}; ${testData ? "TEST DATA" : "live sources"} -->`,
    "",
    `*${version.summary}*`,
    "",
    version.body_md.trim(),
    "",
    "---",
    "",
    lang === "ru" ? "## Служебные поля черновика (на страницу не переносятся)" : "## Draft fields (not published)",
    "",
    `- ${lang === "ru" ? "Герой" : "Hero"}: ${hero}`,
    `- ${lang === "ru" ? "Ситуация" : "Situation"}: ${situation}`,
    `- ${lang === "ru" ? "Главный вывод" : "Main takeaway"}: ${takeaway}`,
    `- ${lang === "ru" ? "Следующее действие" : "Next action"}: ${nextAction}`,
    `- ${lang === "ru" ? "Заголовок для поиска" : "Search title"}: ${version.meta_title}`,
    `- ${lang === "ru" ? "Подготовлено" : "Prepared"}: ${stamp.local}`,
    `- ${lang === "ru" ? "Источник" : "Source"}: ${pack.page.title} — ${pack.page.finalUrl} (${pack.page.publishedAt.slice(0, 10)})`,
    "",
    lang === "ru" ? "### Факты и доказательства" : "### Facts and evidence",
    "",
    ...version.facts.map((fact) => `- [${fact.evidence_id}] ${fact.text}`),
    "",
    lang === "ru" ? "### Гипотезы (не проверены)" : "### Hypotheses (unverified)",
    "",
    ...(version.hypotheses.length ? version.hypotheses.map((h) => `- ${h}`) : [lang === "ru" ? "- нет" : "- none"]),
    "",
  ].join("\n");
}

export async function savePackage(draftsRoot, { stamp, slug, pack, output, checks, writerMeta, testData, candidateReport, sourceReport }) {
  const dir = path.join(draftsRoot, `${stamp.date}-${slug}`);
  await mkdir(dir, { recursive: true });
  const hash = contentHash(output);
  const common = { stamp, pack, hero: output.hero, situation: output.situation, takeaway: output.main_takeaway, nextAction: output.next_action, testData, checks };
  // Structure is what the script checked; whether each sentence means what
  // its passage says is a reading nobody has done yet for this version.
  const semantic = {
    status: "pending-manual",
    scope: ["article.ru.md", "article.en.md", "telegram.ru.md"],
    note: "существенные утверждения всего текста сверяются с фрагментами page.txt вручную; автоматика смысл не проверяет",
    checkedAt: null,
    checkedBy: null,
    result: null,
  };
  const { text, ...pageWithoutText } = pack.page;
  // In the shape lib/lab/files.ts expects, so the Lab entry can cite them as they are.
  const labSources = [
    { title: pack.page.title, href: pack.page.finalUrl, publisher: pack.source.name },
    ...(pack.primaryIsOfficial || pack.primaryUrl === pack.page.finalUrl ? [] : [{ title: pack.page.title, href: pack.primaryUrl, publisher: new URL(pack.primaryUrl).hostname.replace(/^www\./, "") }]),
  ].filter((entry) => entry.href.startsWith("https://"));
  await writeFile(path.join(dir, "article.ru.md"), renderArticle({ ...output.ru, contentHash: hash }, { ...common, lang: "ru" }));
  await writeFile(path.join(dir, "article.en.md"), renderArticle({ ...output.en, contentHash: hash }, { ...common, lang: "en" }));
  await writeFile(
    path.join(dir, "telegram.ru.md"),
    `<!-- Анонс для Telegram, черновик ${stamp.local}; ${testData ? "ТЕСТОВЫЕ ДАННЫЕ" : "живые источники"} -->\n${output.telegram_ru.trim()}\n`,
  );
  await writeFile(path.join(dir, "page.txt"), text);
  await writeFile(
    path.join(dir, "hook.json"),
    `${JSON.stringify({ source: pack.source, page: pageWithoutText, quotes: pack.quotes, primaryUrl: pack.primaryUrl, primaryIsOfficial: pack.primaryIsOfficial, primaryLinks: pack.primaryLinks, eventKey: pack.eventKey, interest: pack.interest ?? null, candidate: pack.candidate, labSources }, null, 2)}\n`,
  );
  await writeFile(path.join(dir, "writer-output.json"), `${JSON.stringify(output, null, 2)}\n`);
  await writeFile(
    path.join(dir, "verification.md"),
    [
      `# Проверка черновика — ${stamp.local}`,
      "",
      `Структурные проверки: ${checks.ok ? "пройдены" : "НЕ пройдены"} · Смысловая сверка с источником: не выполнена${testData ? " · ТЕСТОВЫЕ ДАННЫЕ" : ""}`,
      "",
      "Автоматика проверяет только структуру: что каждый факт ссылается на существующий id доказательства, что числа и адреса есть в пакете, что нет фраз о собственных клиентах и замерах, что английская версия не добавляет id и чисел. Соответствует ли смысл утверждения источнику — например, не стало ли «тестируется в США» «доступно по всему миру» под тем же id, — она не проверяет. «Факты проверены» этот файл не означает.",
      "",
      "## Подтверждение события",
      "",
      `- Страница: ${pack.page.finalUrl}`,
      `- Дата публикации: ${pack.page.publishedAt} (источник даты: ${pack.page.dateSource})`,
      `- Хеш сохранённого текста страницы (page.txt): ${pack.page.textHash}`,
      `- Официальный первоисточник: ${pack.primaryUrl}${pack.primaryIsOfficial ? "" : " (не из списка официальных доменов)"}`,
      "",
      "## Подтверждающие места (найдены дословно в page.txt)",
      "",
      ...pack.quotes.map((quote) => `- [${quote.id}] смещение ${quote.offset}: «${quote.text}»`),
      "",
      "## Признаки интереса (отдельно от подтверждения события)",
      "",
      pack.interest ? "```json\n" + JSON.stringify(pack.interest.signals, null, 2) + "\n```" : "- не собирались",
      "",
      "## Структурные проверки текста (автоматически)",
      "",
      ...(checks.errors.length ? checks.errors.map((e) => `- ОШИБКА: ${e}`) : ["- ошибок нет"]),
      ...checks.warnings.map((w) => `- предупреждение: ${w}`),
      "",
      "## Смысловая сверка (вручную, весь текст)",
      "",
      "Статус: не выполнена.",
      "",
      "Порядок: каждое существенное утверждение в `article.ru.md`, `article.en.md` и `telegram.ru.md` — не только список фактов — сопоставить с конкретным фрагментом `page.txt`. Неподтверждённое исправить, обозначить гипотезой или убрать. Результат записать сюда: кто, когда, какие правки. До этой записи черновик не считается сверенным.",
      "",
      "## Модель и оценочный расход",
      "",
      "Расход — поле `total_cost_usd` из ответа CLI, суммированное по попыткам. Это оценка CLI, не фактическое списание; `--max-budget-usd` ограничивает вызов по этой же оценке и денежным потолком не является.",
      "",
      "```json\n" + JSON.stringify(writerMeta, null, 2) + "\n```",
      "",
    ].join("\n"),
  );
  const manifest = {
    status: "draft",
    testData,
    createdAt: stamp,
    slug,
    eventKey: pack.eventKey,
    contentHash: hash,
    versions: [{ contentHash: hash, createdAt: stamp }],
    writer: writerMeta,
    checks: { structural: { ok: checks.ok, errors: checks.errors, warnings: checks.warnings }, semantic },
    sourceReport,
    candidateReport,
    files: ["article.ru.md", "article.en.md", "telegram.ru.md", "hook.json", "page.txt", "writer-output.json", "verification.md"],
  };
  const manifestPath = path.join(dir, "manifest.json");
  if (existsSync(manifestPath)) {
    const previous = JSON.parse(await readFile(manifestPath, "utf8"));
    manifest.versions = [...(previous.versions ?? []), ...manifest.versions];
  }
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return { dir, hash };
}

export async function saveRefusal(draftsRoot, { stamp, reason, details, sourceReport, candidateReport, testData, extra = {} }) {
  let dir = path.join(draftsRoot, `${stamp.date}-refusal`);
  let n = 2;
  while (existsSync(dir)) dir = path.join(draftsRoot, `${stamp.date}-refusal-${n++}`);
  await mkdir(dir, { recursive: true });
  await writeFile(
    path.join(dir, "refusal.md"),
    [
      `# Отказ: ${reason}`,
      "",
      `Время: ${stamp.local}${testData ? " · ТЕСТОВЫЕ ДАННЫЕ" : ""}`,
      "",
      details,
      "",
      "## Источники",
      "",
      ...sourceReport.map((s) => `- ${s.id}: ${s.status}${s.items ? ` (${s.items} записей)` : ""}${s.detail ? ` — ${s.detail}` : ""}`),
      "",
      "## Кандидаты",
      "",
      ...(candidateReport.length ? candidateReport.map((c) => `- ${c.title} — ${c.outcome}`) : ["- нет"]),
      "",
    ].join("\n"),
  );
  await writeFile(path.join(dir, "refusal.json"), `${JSON.stringify({ reason, details, stamp, testData, sourceReport, candidateReport, ...extra }, null, 2)}\n`);
  return dir;
}
