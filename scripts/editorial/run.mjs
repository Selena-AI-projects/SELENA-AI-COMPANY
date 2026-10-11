#!/usr/bin/env node
// One command from sources to a saved draft package. Exit codes:
//   0  a draft package was saved
//   2  refused: no usable hook, source unreadable, or the text failed its checks
//   3  nothing new: every eligible hook is already in the ledger
//   1  the run itself broke
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { readSources } from "./feeds.mjs";
import { findCovered, ledgerEntry, rankCandidates } from "./hooks.mjs";
import { appendRunLog, loadLedger, saveLedger, savePackage, saveRefusal, slugify } from "./package.mjs";
import { stamp } from "./time.mjs";
import { interestSignals, verifyCandidate } from "./verify.mjs";
import { buildPrompt, checkAuth, checkOutput, fixtureWriter, runClaude } from "./writer.mjs";

const roundUsd = (value) => Math.round(value * 10_000) / 10_000;

function parseArgs(argv) {
  const options = {
    root: "editorial",
    lookbackDays: 14,
    dryRun: false,
    fixtures: null,
    writer: "claude",
    allowRepeat: false,
    budgetUsd: 1,
    model: null,
    interest: true,
    maxVerify: 6,
    onlySource: null,
    candidateUrl: null,
    verifySources: false,
    write: false,
    includeUnverified: false,
    verifiedWhere: "local",
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => argv[++i];
    if (arg === "--root") options.root = next();
    else if (arg === "--lookback-days") options.lookbackDays = Number(next());
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--fixtures") options.fixtures = next();
    else if (arg === "--writer") options.writer = next();
    else if (arg === "--allow-repeat") options.allowRepeat = true;
    else if (arg === "--budget-usd") options.budgetUsd = Number(next());
    else if (arg === "--model") options.model = next();
    else if (arg === "--no-interest") options.interest = false;
    else if (arg === "--max-verify") options.maxVerify = Number(next());
    else if (arg === "--only-source") options.onlySource = next();
    else if (arg === "--candidate-url") options.candidateUrl = next();
    else if (arg === "--verify-sources") options.verifySources = true;
    else if (arg === "--write") options.write = true;
    else if (arg === "--include-unverified") options.includeUnverified = true;
    else if (arg === "--verified-where") options.verifiedWhere = next();
    else if (arg === "--help" || arg === "-h") {
      console.log(`usage: node scripts/editorial/run.mjs [--lookback-days 14] [--dry-run] [--allow-repeat] [--only-source id] [--candidate-url url]
       [--include-unverified] [--fixtures map.json] [--writer claude|fixture] [--budget-usd 1] [--model name] [--no-interest] [--root editorial]
       node scripts/editorial/run.mjs --verify-sources [--write] [--verified-where label]   # read every feed, record which parse`);
      process.exit(0);
    } else throw new Error(`unknown argument ${arg}`);
  }
  return options;
}

async function loadFixtures(file) {
  if (!file) return null;
  const map = JSON.parse(await readFile(file, "utf8"));
  const base = path.dirname(path.resolve(file));
  return Object.fromEntries(Object.entries(map).map(([url, target]) => [url, target === "unreachable" || /^status:\d{3}$/.test(target) ? target : path.resolve(base, target)]));
}

export async function main(argv = process.argv.slice(2), { log = console.error, runWriter = runClaude, checkWriterAuth = checkAuth } = {}) {
  const options = parseArgs(argv);
  const root = path.resolve(options.root);
  const draftsRoot = path.join(root, "drafts");
  const started = stamp();
  const fixtures = await loadFixtures(options.fixtures);
  const testData = Boolean(fixtures) || options.writer === "fixture";
  const sourcesFile = path.join(root, "sources.json");
  const config = JSON.parse(await readFile(sourcesFile, "utf8"));
  const brief = await readFile(path.join(root, "PROMPT.md"), "utf8");
  const ledger = await loadLedger(draftsRoot);
  const named = config.sources.filter((source) => !options.onlySource || source.id === options.onlySource);

  if (options.verifySources) return verifySources({ config, named, sourcesFile, fixtures, options, started, log });

  // The working set is what has been read and parsed somewhere before; a feed
  // address nobody has seen work is a candidate, not a source.
  const sources = named.filter((source) => source.enabled !== false && (source.feedVerified || options.includeUnverified));
  log(`editorial run ${started.local}${testData ? " [TEST DATA]" : ""}: ${sources.length} source(s) in the working set of ${named.length}, lookback ${options.lookbackDays} days`);

  const runEntry = { startedAt: started, options: { ...options, fixtures: options.fixtures ? "yes" : null }, testData };
  const finish = async (outcome, extra = {}) => {
    await appendRunLog(draftsRoot, { ...runEntry, outcome, finishedAt: stamp(), ...extra });
    return outcome;
  };

  if (sources.length === 0 && !options.candidateUrl) {
    const dir = await saveRefusal(draftsRoot, {
      stamp: started,
      reason: "рабочий набор источников пуст",
      details: "Ни одна лента не подтверждена чтением (`feedVerified`), и флаг --include-unverified не задан. Это технический отказ до проверки источников, не отсутствие новостей. Запустите `node scripts/editorial/run.mjs --verify-sources --write`.",
      sourceReport: named.map((source) => ({ id: source.id, status: source.enabled === false ? "disabled" : "unverified" })),
      candidateReport: [],
      testData,
    });
    log(`refused: working set empty → ${dir}`);
    await appendRunLog(draftsRoot, { startedAt: started, options: { ...options, fixtures: options.fixtures ? "yes" : null }, testData, outcome: "refused:no-verified-sources", dir, finishedAt: stamp() });
    return 2;
  }

  let items;
  let sourceReport;
  if (options.candidateUrl) {
    items = [{ sourceId: "manual", title: "(manual candidate)", link: options.candidateUrl, summary: "", publishedAt: null }];
    sourceReport = [{ id: "manual", status: "ok", items: 1, detail: options.candidateUrl }];
  } else {
    ({ items, report: sourceReport } = await readSources(sources, { fixtures, log }));
  }
  const readable = sourceReport.filter((entry) => entry.status === "ok");
  if (readable.length === 0 && !options.candidateUrl) {
    const dir = await saveRefusal(draftsRoot, {
      stamp: started,
      reason: "ни один источник не прочитан",
      details: "Все настроенные источники недоступны или не разобраны. Статья не писалась.",
      sourceReport,
      candidateReport: [],
      testData,
    });
    log(`refused: no readable source → ${dir}`);
    await finish("refused:sources-unreachable", { dir });
    return 2;
  }

  let ranked = rankCandidates(items, { lookbackDays: options.lookbackDays, sources });
  if (options.candidateUrl) ranked = ranked.map((item) => ({ ...item, eligible: true, reasons: [], ai: item.ai ?? [], audience: item.audience ?? [] }));
  const eligible = ranked.filter((item) => item.eligible);
  log(`${items.length} item(s) read, ${eligible.length} eligible`);
  for (const item of ranked.slice(0, 8)) log(`  ${item.eligible ? "✓" : "✗"} ${item.score.toFixed(1).padStart(5)}  ${item.title.slice(0, 90)}${item.reasons.length ? `  [${item.reasons.join("; ")}]` : ""}`);

  const candidateReport = [];
  let selected = null;
  let coveredCount = 0;
  for (const candidate of eligible.slice(0, options.maxVerify)) {
    const verdict = await verifyCandidate(candidate, { fixtures, officialDomains: config.officialDomains ?? [], lookbackDays: options.lookbackDays });
    if (!verdict.ok) {
      candidateReport.push({ title: candidate.title, link: candidate.link, outcome: verdict.reason });
      log(`  ✗ ${candidate.title.slice(0, 70)}: ${verdict.reason}`);
      continue;
    }
    const enriched = {
      ...candidate,
      title: candidate.sourceId === "manual" ? verdict.page.title || candidate.link : candidate.title,
      eventKey: verdict.eventKey,
      primaryUrl: verdict.primaryUrl,
      publishedAt: verdict.page.publishedAt,
    };
    const covered = findCovered(enriched, ledger);
    if (covered && !options.allowRepeat) {
      coveredCount += 1;
      candidateReport.push({ title: candidate.title, link: candidate.link, outcome: `already covered: ${covered.why} (${covered.entry.draftDir})` });
      log(`  = ${candidate.title.slice(0, 70)}: already covered, ${covered.why}`);
      continue;
    }
    selected = { candidate: enriched, verdict, covered };
    candidateReport.push({ title: candidate.title, link: candidate.link, outcome: "selected" });
    break;
  }

  if (!selected) {
    // A hook that verified but is already in the ledger is the run's answer:
    // nothing new. Candidates that failed verification are not hooks at all,
    // so they do not turn that answer into a refusal.
    if (coveredCount > 0) {
      log(`nothing new: ${coveredCount} verified hook(s) already covered, no other hook verified`);
      await finish("nothing-new", { candidateReport });
      return 3;
    }
    const dir = await saveRefusal(draftsRoot, {
      stamp: started,
      reason: eligible.length === 0 ? "нет подходящего повода" : "ни один повод не подтверждён",
      details:
        eligible.length === 0
          ? `Из ${items.length} записей ни одна не упоминает одновременно ИИ-поиск и рестораны/отели за последние ${options.lookbackDays} дней.`
          : "Подходящие по теме записи не прошли проверку первоисточника или уже были в работе. Причины по каждому кандидату ниже.",
      sourceReport,
      candidateReport,
      testData,
      extra: { ranked: ranked.slice(0, 20).map(({ title, link, score, eligible: ok, reasons }) => ({ title, link, score, eligible: ok, reasons })) },
    });
    log(`refused → ${dir}`);
    await finish("refused:no-hook", { dir, candidateReport });
    return 2;
  }

  const { candidate, verdict } = selected;
  const source = sources.find((entry) => entry.id === candidate.sourceId) ?? { id: candidate.sourceId, name: candidate.sourceId, tier: "manual" };
  const interest = options.interest ? await interestSignals(candidate, { fixtures }) : null;
  const pack = {
    source: { id: source.id, name: source.name, tier: source.tier ?? "press", url: source.url ?? null },
    candidate: { title: candidate.title, link: candidate.link, feedPublishedAt: candidate.publishedAt, score: candidate.score, ai: candidate.ai, audience: candidate.audience },
    page: verdict.page,
    quotes: verdict.quotes,
    primaryUrl: verdict.primaryUrl,
    primaryIsOfficial: verdict.primaryIsOfficial,
    primaryLinks: verdict.primaryLinks,
    eventKey: verdict.eventKey,
    interest,
  };
  log(`selected: ${candidate.title} (${pack.quotes.length} passage(s), event ${pack.eventKey})`);

  if (options.dryRun) {
    console.log(JSON.stringify({ ...pack, page: { ...pack.page, text: `[${pack.page.chars} chars]` } }, null, 2));
    await finish("dry-run", { eventKey: pack.eventKey });
    return 0;
  }

  const allowedInternalLinks = config.internalLinks ?? [];
  let output;
  let writerMeta;
  let checks;
  let budgetStop = null;
  if (options.writer === "fixture") {
    output = fixtureWriter(pack);
    writerMeta = { model: "fixture", authority: "fixture-writer (TEST DATA)", attempts: [], attemptCount: 1, budgetUsd: options.budgetUsd, estimatedCostUsd: 0, remainingBudgetUsd: options.budgetUsd };
    checks = checkOutput(output, pack, { allowedInternalLinks });
  } else {
    const auth = await checkWriterAuth();
    if (!auth.ok) {
      const dir = await saveRefusal(draftsRoot, {
        stamp: started,
        reason: "способ авторизации модели не подтверждён",
        details: `Запуск пишет только под подписочным входом Claude Code (loggedIn, authMethod oauth_token, apiProvider firstParty) и без ANTHROPIC_API_KEY в окружении. Сейчас: ${auth.reason}. Модель не вызывалась; на API или другой платный режим запуск не переключается.`,
        sourceReport,
        candidateReport,
        testData,
        extra: { auth },
      });
      log(`refused: writer auth not confirmed (${auth.reason}) → ${dir}`);
      await finish("refused:auth", { dir, auth });
      return 2;
    }
    const prompt = buildPrompt({ brief, pack });
    const attempts = [];
    const costKnown = () => attempts.every((entry) => typeof entry.estimatedCostUsd === "number");
    const spent = () => roundUsd(attempts.reduce((sum, entry) => sum + (entry.estimatedCostUsd ?? 0), 0));
    let attempt = await runWriter(prompt, { model: options.model, budgetUsd: options.budgetUsd });
    output = attempt.output;
    attempts.push({ ...attempt.meta, budgetUsd: options.budgetUsd });
    checks = checkOutput(output, pack, { allowedInternalLinks });
    if (!checks.ok) {
      // The retry gets only what the first attempt left of the estimate; a
      // first attempt whose cost the CLI did not report counts as all of it.
      const remaining = costKnown() ? roundUsd(options.budgetUsd - spent()) : 0;
      if (remaining <= 0) {
        budgetStop = costKnown()
          ? `оценочный бюджет ${options.budgetUsd} USD исчерпан первой попыткой (оценка CLI ${spent()} USD); повтор не выполнялся`
          : "оценка расхода первой попытки от CLI не получена; повтор не выполнялся";
        log(`writer output failed checks, no retry: ${budgetStop}`);
      } else {
        log(`writer output failed checks, one retry within ${remaining} USD: ${checks.errors.join(" | ")}`);
        const retryPrompt = `${prompt}\n\n## Исправь ошибки предыдущей версии\n${checks.errors.map((e) => `- ${e}`).join("\n")}`;
        attempt = await runWriter(retryPrompt, { model: options.model, budgetUsd: remaining });
        output = attempt.output;
        attempts.push({ ...attempt.meta, budgetUsd: remaining, fixes: checks.errors });
        checks = checkOutput(output, pack, { allowedInternalLinks });
      }
    }
    const last = attempts.at(-1);
    writerMeta = {
      authority: last.authority,
      model: last.model,
      auth: { loggedIn: auth.loggedIn, authMethod: auth.authMethod, apiProvider: auth.apiProvider, apiKeyInEnv: auth.apiKeyInEnv, checkedAt: auth.checkedAt },
      attempts,
      attemptCount: attempts.length,
      budgetUsd: options.budgetUsd,
      estimatedCostUsd: costKnown() ? spent() : null,
      remainingBudgetUsd: costKnown() ? roundUsd(options.budgetUsd - spent()) : null,
      costBasis: "сумма total_cost_usd по оценке Claude Code CLI за все попытки; не фактическое списание и не гарантированный денежный потолок",
      ...(budgetStop ? { budgetStop } : {}),
    };
  }

  if (!checks.ok) {
    const dir = await saveRefusal(draftsRoot, {
      stamp: started,
      reason: "текст не прошёл структурную проверку по источникам",
      details: [...checks.errors.map((e) => `- ${e}`), ...(budgetStop ? ["", `Повтор: ${budgetStop}.`] : [])].join("\n"),
      sourceReport,
      candidateReport,
      testData,
      extra: { writerOutput: output, writerMeta, pack: { ...pack, page: { ...pack.page, text: undefined } } },
    });
    log(`refused: writer output failed verification → ${dir}`);
    await finish("refused:checks-failed", { dir, errors: checks.errors });
    return 2;
  }

  const slug = slugify(pack.page.title || candidate.title);
  const { dir, hash } = await savePackage(draftsRoot, { stamp: started, slug, pack, output, checks, writerMeta, testData, candidateReport, sourceReport });
  const existing = selected.covered?.entry;
  if (existing && options.allowRepeat) {
    existing.versions = [...new Set([...(existing.versions ?? []), hash])];
    existing.draftDir = path.relative(root, dir);
  } else {
    ledger.entries.push(ledgerEntry({ ...candidate, eventKey: pack.eventKey, primaryUrl: pack.primaryUrl }, { draftDir: path.relative(root, dir), contentHash: hash, runAt: started.utc }));
  }
  await saveLedger(draftsRoot, ledger);
  log(`saved draft package → ${dir} (version ${hash.slice(0, 12)}${checks.warnings.length ? `, ${checks.warnings.length} warning(s)` : ""})`);
  await finish("draft-saved", { dir, contentHash: hash, eventKey: pack.eventKey, warnings: checks.warnings });
  return 0;
}

/**
 * Reads every named feed, disabled ones included, and says which parse. With
 * --write the result is recorded in sources.json, which is what admits a
 * source into the working set.
 */
async function verifySources({ config, named, sourcesFile, fixtures, options, started, log }) {
  log(`verifying ${named.length} feed(s) at ${started.local}`);
  const { report } = await readSources(named, { fixtures, log, includeDisabled: true });
  let ok = 0;
  for (const entry of report) {
    const source = config.sources.find((candidate) => candidate.id === entry.id);
    if (!source) continue;
    if (entry.status === "ok") {
      ok += 1;
      source.feedVerified = { at: started.local, where: options.verifiedWhere, items: entry.items, newest: entry.newest, finalUrl: entry.finalUrl };
    } else {
      source.feedVerified = null;
      source.lastFeedError = { at: started.local, where: options.verifiedWhere, status: entry.status, detail: entry.detail ?? null };
    }
  }
  for (const entry of report) log(`  ${entry.status === "ok" ? "✓" : "✗"} ${entry.id}: ${entry.status}${entry.items ? ` · ${entry.items} items · newest ${entry.newest ?? "?"}` : ""}${entry.detail ? ` · ${entry.detail}` : ""}`);
  if (options.write) {
    await writeFile(sourcesFile, `${JSON.stringify(config, null, 2)}\n`);
    log(`sources.json updated: ${ok} verified feed(s)`);
  } else log(`${ok} feed(s) parse; pass --write to record it`);
  console.log(JSON.stringify({ verifiedAt: started, ok, report }, null, 2));
  return ok > 0 ? 0 : 2;
}

// Verified on 22.22 and 24.21; the proxy flag the README relies on exists from 22.21.
const MIN_NODE_MAJOR = 22;

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const major = Number(process.versions.node.split(".")[0]);
  if (major < MIN_NODE_MAJOR) {
    console.error(`editorial run needs Node.js ${MIN_NODE_MAJOR} or newer (running ${process.versions.node})`);
    process.exit(1);
  }
  main().then(
    (code) => process.exit(code),
    (error) => {
      console.error(`editorial run failed: ${error.stack ?? error}`);
      process.exit(1);
    },
  );
}
