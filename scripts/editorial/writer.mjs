// The writing step is the official Claude Code CLI in print mode, signed in
// with the owner's subscription: no API key, no tools, no session on disk.
// What comes back is checked against the evidence pack before anything is
// saved, so a sentence the sources do not support never reaches a draft.
import { spawn } from "node:child_process";

/** Runs the CLI with the prompt on stdin; execFile has no stdin option. */
function run(command, args, { input, env }) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("error", reject);
    child.on("close", (code) => (code === 0 ? resolve({ stdout, stderr }) : reject(new Error(`${command} exited ${code}: ${stderr.slice(0, 2000)}`))));
    child.stdin.end(input);
  });
}

const LANG_SHAPE = {
  type: "object",
  properties: {
    title: { type: "string" },
    meta_title: { type: "string", description: "search title, 13-43 characters; the site appends the brand name" },
    summary: { type: "string", description: "120-160 characters" },
    body_md: { type: "string", description: "Markdown without an H1" },
    facts: {
      type: "array",
      description: "every factual statement in the text, each tied to one evidence id",
      items: { type: "object", properties: { text: { type: "string" }, evidence_id: { type: "string" } }, required: ["text", "evidence_id"] },
    },
    hypotheses: { type: "array", items: { type: "string" }, description: "statements marked in the text as hypotheses" },
  },
  required: ["title", "meta_title", "summary", "body_md", "facts", "hypotheses"],
};

export const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    hero: { type: "string", description: "the one reader this is written for, as a role, not a person" },
    situation: { type: "string" },
    main_takeaway: { type: "string" },
    next_action: { type: "string" },
    ru: LANG_SHAPE,
    en: LANG_SHAPE,
    telegram_ru: { type: "string", description: "at most 600 characters, Russian" },
  },
  required: ["hero", "situation", "main_takeaway", "next_action", "ru", "en", "telegram_ru"],
};

export function buildPrompt({ brief, pack }) {
  const evidence = pack.quotes.map((quote) => `[${quote.id}] ${quote.text}`).join("\n");
  const signals = pack.interest ? JSON.stringify(pack.interest.signals, null, 1) : "не собирались";
  return [
    brief,
    "",
    "## Повод",
    `Заголовок первоисточника: ${pack.page.title}`,
    `Адрес: ${pack.page.finalUrl}`,
    `Дата публикации: ${pack.page.publishedAt.slice(0, 10)} (источник даты: ${pack.page.dateSource})`,
    `Издание первоисточника: ${pack.source.name} (${pack.source.tier})`,
    pack.primaryUrl !== pack.page.finalUrl ? `Официальный первоисточник, на который ссылается страница: ${pack.primaryUrl}` : "",
    "",
    "## Доказательства (единственный разрешённый источник фактов; цитируй id)",
    evidence,
    "",
    "## Признаки интереса (не доказательство события; упоминай только с числами, иначе не упоминай)",
    signals,
    "",
    "## Формат ответа",
    "Верни один JSON-объект по заданной схеме. Поле facts в каждой версии перечисляет каждое фактическое утверждение текста и id доказательства. Английская версия не добавляет фактов: её facts ссылаются на те же id, что и русская.",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export async function runClaude(prompt, { model = null, budgetUsd = 1, maxTurns = 3, exec = run } = {}) {
  const args = [
    "-p",
    "--output-format",
    "json",
    "--json-schema",
    JSON.stringify(OUTPUT_SCHEMA),
    "--tools",
    "",
    "--no-session-persistence",
    "--max-turns",
    String(maxTurns),
    "--max-budget-usd",
    String(budgetUsd),
  ];
  if (model) args.push("--model", model);
  const started = Date.now();
  const { stdout } = await exec("claude", args, { input: prompt, env: process.env });
  const result = JSON.parse(stdout);
  if (result.is_error) throw new Error(`claude -p failed: ${result.result ?? result.subtype}`);
  let output = result.structured_output ?? null;
  if (!output) {
    const text = String(result.result ?? "");
    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    output = JSON.parse(json);
  }
  return {
    output,
    meta: {
      model: Object.keys(result.modelUsage ?? {}).join(",") || null,
      costUsd: result.total_cost_usd ?? null,
      durationMs: Date.now() - started,
      turns: result.num_turns ?? null,
      stopReason: result.stop_reason ?? null,
      authority: "claude-code-cli-print-mode",
    },
  };
}

const AI_SLOP = ["в современном мире", "в эпоху", "революци", "game-changer", "game changer", "unlock", "leverage", "delve", "в заключение", "не секрет, что", "как известно", "cutting-edge", "seamless"];
const FABRICATION = ["наши клиенты", "наш клиент", "мы измерили", "мы протестировали", "по нашим данным", "наш эксперимент", "our clients", "our client", "we measured", "we tested", "our data shows", "our experiment"];

function numbersIn(text) {
  return new Set((text.match(/\d[\d.,]*/g) ?? []).map((n) => n.replace(/[.,]$/, "").replace(/[,]/g, "")));
}

function urlsIn(text) {
  return new Set(text.match(/https?:\/\/[^\s)\]>"']+/g) ?? []);
}

/**
 * Deterministic checks on the writer's output. Errors stop the save;
 * warnings are kept in the package for the editor.
 */
export function checkOutput(output, pack, { allowedInternalLinks = [] } = {}) {
  const errors = [];
  const warnings = [];
  const evidenceIds = new Set(pack.quotes.map((quote) => quote.id));
  const evidenceText = pack.quotes.map((quote) => quote.text).join("\n");
  const allowedUrls = new Set([pack.page.url, pack.page.finalUrl, pack.primaryUrl, ...(pack.primaryLinks ?? []), ...allowedInternalLinks]);
  const packNumbers = new Set([...numbersIn(evidenceText), ...numbersIn(pack.page.publishedAt ?? ""), ...numbersIn(JSON.stringify(pack.interest?.signals ?? {}))]);
  for (const field of ["hero", "situation", "main_takeaway", "next_action", "telegram_ru"]) {
    if (!output[field] || !String(output[field]).trim()) errors.push(`${field} is empty`);
  }
  if ((output.telegram_ru ?? "").length > 700) errors.push(`telegram_ru is ${output.telegram_ru.length} characters, limit 700`);
  for (const lang of ["ru", "en"]) {
    const version = output[lang];
    if (!version) {
      errors.push(`${lang} version missing`);
      continue;
    }
    if (!version.body_md || version.body_md.trim().length < 1200) errors.push(`${lang} body too short`);
    if (/^#\s/m.test(version.body_md ?? "")) errors.push(`${lang} body contains an H1`);
    const summaryLength = (version.summary ?? "").length;
    if (summaryLength < 120 || summaryLength > 160) warnings.push(`${lang} summary is ${summaryLength} characters, Lab wants 120-160`);
    // Lab's file validator refuses these outright, so they are errors here, not warnings.
    const metaLength = (version.meta_title ?? "").trim().length;
    if (metaLength < 13 || metaLength > 43) errors.push(`${lang} meta_title is ${metaLength} characters, Lab allows 13-43`);
    if (!Array.isArray(version.facts) || version.facts.length === 0) errors.push(`${lang} lists no facts`);
    for (const fact of version.facts ?? []) {
      if (!evidenceIds.has(fact.evidence_id)) errors.push(`${lang} fact cites unknown evidence ${fact.evidence_id}: "${fact.text.slice(0, 80)}"`);
    }
    for (const url of urlsIn(`${version.body_md}\n${version.summary}`)) {
      const bare = url.replace(/[.,;:]+$/, "");
      if (!allowedUrls.has(bare) && ![...allowedUrls].some((allowed) => bare.startsWith(allowed))) errors.push(`${lang} links to a URL outside the evidence pack: ${bare}`);
    }
    const haystack = `${version.body_md} ${version.summary} ${version.title}`.toLowerCase();
    for (const phrase of FABRICATION) if (haystack.includes(phrase)) errors.push(`${lang} claims first-hand results ("${phrase}")`);
    for (const phrase of AI_SLOP) if (haystack.includes(phrase)) warnings.push(`${lang} uses "${phrase}"`);
  }
  if (output.ru && output.en) {
    const ruIds = new Set((output.ru.facts ?? []).map((fact) => fact.evidence_id));
    for (const fact of output.en.facts ?? []) {
      if (!ruIds.has(fact.evidence_id)) errors.push(`en fact cites evidence ${fact.evidence_id} that the ru version does not use: "${fact.text.slice(0, 80)}"`);
    }
    const ruNumbers = numbersIn(`${output.ru.body_md} ${output.ru.summary}`);
    for (const number of numbersIn(`${output.en.body_md} ${output.en.summary}`)) {
      if (Number(number) <= 12) continue;
      if (!ruNumbers.has(number) && !packNumbers.has(number)) errors.push(`en adds a number absent from ru and the evidence: ${number}`);
    }
    for (const number of ruNumbers) {
      if (Number(number) <= 12) continue;
      if (!packNumbers.has(number)) errors.push(`ru uses a number absent from the evidence: ${number}`);
    }
  }
  return { ok: errors.length === 0, errors, warnings };
}

/** A canned writer for tests; its output is labelled so it can never pass for a draft. */
export function fixtureWriter(pack) {
  const q = pack.quotes[0];
  const body = (lang) =>
    [
      `> ТЕСТОВЫЕ ДАННЫЕ / TEST DATA: this text was produced by the fixture writer, not by a model.`,
      "",
      `## ${lang === "ru" ? "Что произошло" : "What happened"}`,
      "",
      `${q.text} [${q.id}]`,
      "",
      `## ${lang === "ru" ? "Почему это важно владельцу" : "Why it matters to an owner"}`,
      "",
      lang === "ru"
        ? "Это гипотеза: владельцу стоит проверить, как его заведение описано в публичных источниках, которые читают ИИ-ассистенты. ".repeat(12)
        : "This is a hypothesis: an owner should check how the venue is described in the public sources AI assistants read. ".repeat(12),
      "",
      `## ${lang === "ru" ? "Что сделать" : "What to do next"}`,
      "",
      lang === "ru" ? "Проверить публичную готовность сайта на /ru/check." : "Run the public readiness check at /check.",
    ].join("\n");
  const summary = (lang) =>
    lang === "ru"
      ? "Тестовый черновик, собранный без модели: один подтверждённый повод, одна гипотеза и одно действие для владельца ресторана или отеля."
      : "A test draft assembled without a model: one verified hook, one hypothesis and one next action for a restaurant or hotel owner, nothing else.";
  return {
    hero: "владелец небольшого ресторана (тестовые данные)",
    situation: "тестовая ситуация",
    main_takeaway: "тестовый вывод",
    next_action: "проверить сайт на /ru/check",
    ru: { title: `Тест: ${pack.page.title}`.slice(0, 90), meta_title: "Тест: ИИ-помощник и отзывы", summary: summary("ru"), body_md: body("ru"), facts: [{ text: q.text, evidence_id: q.id }], hypotheses: ["тестовая гипотеза"] },
    en: { title: `Test: ${pack.page.title}`.slice(0, 90), meta_title: "Test: AI assistant and reviews", summary: summary("en"), body_md: body("en"), facts: [{ text: q.text, evidence_id: q.id }], hypotheses: ["test hypothesis"] },
    telegram_ru: "ТЕСТОВЫЕ ДАННЫЕ: анонс, собранный без модели. Ссылка на статью появится после публикации.",
  };
}
