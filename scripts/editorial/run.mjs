#!/usr/bin/env node
// One command from sources to a saved draft package. Exit codes:
//   0  a draft package was saved
//   2  refused: no usable hook, source unreadable, or the text failed its checks
//   3  nothing new: every eligible hook is already in the ledger
//   1  the run itself broke
import { readFile } from "node:fs/promises";
import path from "node:path";
import { readSources } from "./feeds.mjs";
import { findCovered, ledgerEntry, rankCandidates } from "./hooks.mjs";
import { appendRunLog, loadLedger, saveLedger, savePackage, saveRefusal, slugify } from "./package.mjs";
import { stamp } from "./time.mjs";
import { interestSignals, verifyCandidate } from "./verify.mjs";
import { buildPrompt, checkOutput, fixtureWriter, runClaude } from "./writer.mjs";

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
    else if (arg === "--help" || arg === "-h") {
      console.log(`usage: node scripts/editorial/run.mjs [--lookback-days 14] [--dry-run] [--allow-repeat] [--only-source id] [--candidate-url url]
       [--fixtures map.json] [--writer claude|fixture] [--budget-usd 1] [--model name] [--no-interest] [--root editorial]`);
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

export async function main(argv = process.argv.slice(2), { log = console.error } = {}) {
  const options = parseArgs(argv);
  const root = path.resolve(options.root);
  const draftsRoot = path.join(root, "drafts");
  const started = stamp();
  const fixtures = await loadFixtures(options.fixtures);
  const testData = Boolean(fixtures) || options.writer === "fixture";
  const config = JSON.parse(await readFile(path.join(root, "sources.json"), "utf8"));
  const brief = await readFile(path.join(root, "PROMPT.md"), "utf8");
  const ledger = await loadLedger(draftsRoot);
  const sources = config.sources.filter((source) => !options.onlySource || source.id === options.onlySource);
  log(`editorial run ${started.local}${testData ? " [TEST DATA]" : ""}: ${sources.length} source(s), lookback ${options.lookbackDays} days`);

  const runEntry = { startedAt: started, options: { ...options, fixtures: options.fixtures ? "yes" : null }, testData };
  const finish = async (outcome, extra = {}) => {
    await appendRunLog(draftsRoot, { ...runEntry, outcome, finishedAt: stamp(), ...extra });
    return outcome;
  };

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
  if (options.writer === "fixture") {
    output = fixtureWriter(pack);
    writerMeta = { model: "fixture", costUsd: 0, authority: "fixture-writer (TEST DATA)" };
    checks = checkOutput(output, pack, { allowedInternalLinks });
  } else {
    const prompt = buildPrompt({ brief, pack });
    let attempt = await runClaude(prompt, { model: options.model, budgetUsd: options.budgetUsd });
    output = attempt.output;
    writerMeta = { ...attempt.meta, attempts: 1 };
    checks = checkOutput(output, pack, { allowedInternalLinks });
    if (!checks.ok) {
      log(`writer output failed checks, one retry: ${checks.errors.join(" | ")}`);
      const retryPrompt = `${prompt}\n\n## Исправь ошибки предыдущей версии\n${checks.errors.map((e) => `- ${e}`).join("\n")}`;
      attempt = await runClaude(retryPrompt, { model: options.model, budgetUsd: options.budgetUsd });
      output = attempt.output;
      writerMeta = { ...attempt.meta, attempts: 2, firstAttemptErrors: checks.errors };
      checks = checkOutput(output, pack, { allowedInternalLinks });
    }
  }

  if (!checks.ok) {
    const dir = await saveRefusal(draftsRoot, {
      stamp: started,
      reason: "текст не прошёл проверку по источникам",
      details: checks.errors.map((e) => `- ${e}`).join("\n"),
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

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  main().then(
    (code) => process.exit(code),
    (error) => {
      console.error(`editorial run failed: ${error.stack ?? error}`);
      process.exit(1);
    },
  );
}
