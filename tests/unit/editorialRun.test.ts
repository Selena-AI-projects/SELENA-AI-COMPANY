/**
 * The editorial run against local fixtures: a feed, a page and a canned
 * writer, all generated here and labelled as test data. These tests prove the
 * pipeline's rules — relevance gate, verbatim passages, cross-run dedupe,
 * refusals — not the reachability of any live source.
 */
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { canonicalUrl, eventKey, rankCandidates, sameEvent, tokens } from "../../scripts/editorial/hooks.mjs";
import { parseFeed } from "../../scripts/editorial/feeds.mjs";
import { findQuotes, htmlToText, quoteFound, verifyCandidate } from "../../scripts/editorial/verify.mjs";
import { checkOutput, fixtureWriter } from "../../scripts/editorial/writer.mjs";
import { main } from "../../scripts/editorial/run.mjs";

const FEED_URL = "https://example.test/feed.xml";
const GOOD_URL = "https://example.test/news/maps-ai-restaurants";
const THIN_URL = "https://example.test/news/thin";
const OLD_URL = "https://example.test/news/old";
const UNRELATED_URL = "https://example.test/news/unrelated";

const TODAY = new Date();
const daysAgo = (days: number) => new Date(TODAY.getTime() - days * 86_400_000).toISOString();

function page({ title, published, body }: { title: string; published: string; body: string }) {
  return `<!doctype html><html><head><title>${title}</title>
<meta property="article:published_time" content="${published}">
<link rel="canonical" href="${GOOD_URL}"></head>
<body><nav>TEST DATA navigation</nav><article><h1>${title}</h1>${body}
<p>Read the announcement on <a href="https://blog.google/products/maps/test-announcement/">the official blog</a>.</p>
</article><footer>TEST DATA footer with enough words to pass the length gate: ${"filler ".repeat(80)}</footer></body></html>`;
}

const GOOD_BODY = `<p>TEST DATA. Google said on Tuesday that its Gemini-powered assistant in Google Maps now answers questions about restaurants and hotels using reviews and business profiles.</p>
<p>The company added that restaurant owners can see which review themes the AI summary draws on, and that the feature reaches hotels next month.</p>
<p>An unrelated paragraph about the weather in Zurich that mentions nothing of interest to anyone reading this test.</p>`;

async function fixtureRoot(options: { feedUnreachable?: boolean; feedItems?: string; unverified?: boolean } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), "editorial-test-"));
  const files = path.join(root, "fixtures");
  await mkdir(files, { recursive: true });
  const items =
    options.feedItems ??
    `
<item><title>Google Maps AI assistant now answers restaurant and hotel questions</title><link>${GOOD_URL}?utm_source=rss</link><pubDate>${daysAgo(2)}</pubDate><description>Gemini in Maps answers diners.</description></item>
<item><title>AI Overviews reach hotel searches, says report</title><link>${THIN_URL}</link><pubDate>${daysAgo(3)}</pubDate><description>Hotels and AI Overviews.</description></item>
<item><title>ChatGPT restaurant picks from last year</title><link>${OLD_URL}</link><pubDate>${daysAgo(90)}</pubDate><description>Old restaurant AI news.</description></item>
<item><title>Quarterly earnings of a chip maker</title><link>${UNRELATED_URL}</link><pubDate>${daysAgo(1)}</pubDate><description>Nothing about our audience.</description></item>`;
  await writeFile(path.join(files, "feed.xml"), `<?xml version="1.0"?><rss version="2.0"><channel><title>TEST DATA feed</title>${items}</channel></rss>`);
  await writeFile(path.join(files, "good.html"), page({ title: "Google Maps AI assistant now answers restaurant and hotel questions", published: daysAgo(2), body: GOOD_BODY }));
  await writeFile(
    path.join(files, "thin.html"),
    page({ title: "AI Overviews reach hotel searches, says report", published: daysAgo(3), body: `<p>TEST DATA. A page that is long enough but never puts the AI side and the hospitality side in one sentence. ${"Weather, sport, and a recipe. ".repeat(30)}</p>` }),
  );
  await writeFile(
    path.join(files, "fixtures.json"),
    JSON.stringify({
      [FEED_URL]: options.feedUnreachable ? "unreachable" : "feed.xml",
      [`${GOOD_URL}?utm_source=rss`]: "good.html",
      [THIN_URL]: "thin.html",
      [OLD_URL]: "status:404",
      [UNRELATED_URL]: "status:404",
    }),
  );
  await writeFile(
    path.join(root, "sources.json"),
    JSON.stringify({
      officialDomains: ["blog.google"],
      internalLinks: ["https://www.selenasystems.com/ru/check"],
      sources: [{ id: "test-feed", name: "TEST DATA feed", url: "https://example.test/", feed: FEED_URL, tier: "trade", origin: "test", feedVerified: options.unverified ? null : { at: "test", where: "test" } }],
    }),
  );
  await writeFile(path.join(root, "PROMPT.md"), "TEST DATA brief");
  return root;
}


/** The fixture map the run would build from fixtures.json, with files resolved to absolute paths. */
async function fixtureMap(root: string): Promise<Record<string, string>> {
  const map = JSON.parse(await readFile(path.join(root, "fixtures", "fixtures.json"), "utf8")) as Record<string, string>;
  return Object.fromEntries(Object.entries(map).map(([url, file]) => [url, file.startsWith("status:") ? file : path.join(root, "fixtures", file)]));
}

const silent = () => {};
const runArgs = (root: string, extra: string[] = []) => ["--root", root, "--fixtures", path.join(root, "fixtures", "fixtures.json"), "--writer", "fixture", "--no-interest", ...extra];

test("the same page under tracking parameters and a rephrased headline is one event", () => {
  assert.equal(canonicalUrl("https://www.Example.com/a/b/?utm_source=x&id=2#top"), "example.com/a/b?id=2");
  assert.equal(eventKey("https://example.com/a/b/?utm_source=x&id=2"), eventKey("https://example.com/a/b?id=2"));
  const entry: Record<string, unknown> = { eventKey: "other", title: "Google Maps AI assistant now answers restaurant and hotel questions", titleTokens: tokens("Google Maps AI assistant now answers restaurant and hotel questions"), publishedAt: daysAgo(2), terms: ["gemini", "restaurant"], primaryHost: "example.test" };
  assert.ok(sameEvent({ title: "Maps assistant from Google answers hotel and restaurant questions with AI", publishedAt: daysAgo(1), link: "https://other.test/x" }, entry as never));
  assert.equal(sameEvent({ title: "OpenTable adds a new cancellation policy for diners", publishedAt: daysAgo(1), link: "https://other.test/y" }, entry as never), null);
});

test("relevance needs both an AI-search term and a restaurant/hotel term inside the lookback", () => {
  const items = parseFeed(
    `<rss><channel>
<item><title>Perplexity adds hotel booking</title><link>https://a.test/1</link><pubDate>${daysAgo(1)}</pubDate></item>
<item><title>Perplexity raises money</title><link>https://a.test/2</link><pubDate>${daysAgo(1)}</pubDate></item>
<item><title>Restaurant week returns</title><link>https://a.test/3</link><pubDate>${daysAgo(1)}</pubDate></item>
<item><title>ChatGPT restaurant picks</title><link>https://a.test/4</link><pubDate>${daysAgo(40)}</pubDate></item>
</channel></rss>`,
    "s",
  );
  const ranked = rankCandidates(items, { lookbackDays: 14 });
  assert.deepEqual(
    ranked.map((item) => [item.title, item.eligible]),
    [
      ["Perplexity adds hotel booking", true],
      ["Perplexity raises money", false],
      ["Restaurant week returns", false],
      ["ChatGPT restaurant picks", false],
    ],
  );
});

test("a passage counts only when it is on the page verbatim and names both sides", async () => {
  const text = htmlToText(page({ title: "t", published: daysAgo(1), body: GOOD_BODY }));
  const quotes = findQuotes(text, { titleTokens: tokens("Google Maps AI assistant restaurants"), titles: ["Google Maps AI assistant now answers restaurant and hotel questions"] } as never);
  assert.ok(quotes.every((quote) => quote.text !== "Google Maps AI assistant now answers restaurant and hotel questions"), "a headline must not count as a passage");
  assert.ok(quotes.length >= 2);
  assert.equal(quotes[0].strength, "both-sides");
  assert.ok(quoteFound(text, quotes[0].text));
  assert.equal(quoteFound(text, "Restaurants reported a 40% rise in bookings"), false);
  const root = await fixtureRoot();
  const fixtures = await fixtureMap(root);
  const thin = await verifyCandidate({ title: "AI Overviews reach hotel searches, says report", link: THIN_URL, publishedAt: daysAgo(3) }, { fixtures, officialDomains: [] } as never);
  assert.equal(thin.ok, false);
  assert.match(String(thin.reason), /insufficient evidence/);
});

test("the text checks refuse new facts, new numbers and outside links in the English adaptation", async () => {
  const root = await fixtureRoot();
  const fixtures = await fixtureMap(root);
  const verdict = await verifyCandidate({ title: "Google Maps AI assistant now answers restaurant and hotel questions", link: `${GOOD_URL}?utm_source=rss`, publishedAt: daysAgo(2) }, { fixtures, officialDomains: ["blog.google"] } as never);
  assert.equal(verdict.ok, true);
  const pack = { ...verdict, source: { id: "t", name: "t", tier: "trade" }, interest: null };
  const good = fixtureWriter(pack);
  assert.equal(checkOutput(good, pack).ok, true, checkOutput(good, pack).errors.join("; "));
  const extraNumber = { ...good, en: { ...good.en, body_md: `${good.en.body_md}\n\nBookings rose 40% after the change.` } };
  assert.match(checkOutput(extraNumber, pack).errors.join("\n"), /en adds a number absent/);
  const unknownEvidence = { ...good, en: { ...good.en, facts: [{ text: "invented", evidence_id: "q9" }] } };
  assert.match(checkOutput(unknownEvidence, pack).errors.join("\n"), /unknown evidence q9/);
  const outsideLink = { ...good, ru: { ...good.ru, body_md: `${good.ru.body_md}\n\nСм. https://competitor.test/study` } };
  assert.match(checkOutput(outsideLink, pack).errors.join("\n"), /outside the evidence pack/);
  const fabricated = { ...good, ru: { ...good.ru, body_md: `${good.ru.body_md}\n\nНаши клиенты видят рост.` } };
  assert.match(checkOutput(fabricated, pack).errors.join("\n"), /first-hand results/);
});

test("a run saves one labelled package, a second run adds nothing, and a repeat adds a version", async () => {
  const root = await fixtureRoot();
  assert.equal(await main(runArgs(root), { log: silent }), 0);
  const drafts = path.join(root, "drafts");
  const dirs = (await readdir(drafts)).filter((name) => !name.endsWith(".json") && !name.endsWith(".jsonl"));
  assert.equal(dirs.length, 1);
  const dir = path.join(drafts, dirs[0]);
  for (const file of ["article.ru.md", "article.en.md", "telegram.ru.md", "hook.json", "page.txt", "verification.md", "manifest.json"]) assert.ok(existsSync(path.join(dir, file)), `${file} missing`);
  const manifest = JSON.parse(await readFile(path.join(dir, "manifest.json"), "utf8"));
  assert.equal(manifest.testData, true);
  assert.equal(manifest.status, "draft");
  assert.match(manifest.createdAt.local, /Asia\/Makassar/);
  const ru = await readFile(path.join(dir, "article.ru.md"), "utf8");
  assert.match(ru, /TEST DATA/);
  assert.ok(ru.startsWith("# "), "the title is the first line of a draft");
  assert.match(ru, /Заголовок для поиска: /);
  const hook = JSON.parse(await readFile(path.join(dir, "hook.json"), "utf8"));
  assert.equal(hook.primaryUrl, "https://blog.google/products/maps/test-announcement/");
  assert.equal(hook.page.dateSource, "page");
  const ledger = JSON.parse(await readFile(path.join(drafts, "ledger.json"), "utf8"));
  assert.equal(ledger.entries.length, 1);

  assert.equal(await main(runArgs(root), { log: silent }), 3);
  assert.deepEqual((await readdir(drafts)).filter((name) => !name.endsWith(".json") && !name.endsWith(".jsonl")), dirs);
  const runs = (await readFile(path.join(drafts, "runs.jsonl"), "utf8")).trim().split("\n").map((line) => JSON.parse(line));
  assert.deepEqual(runs.map((run) => run.outcome), ["draft-saved", "nothing-new"]);

  assert.equal(await main(runArgs(root, ["--allow-repeat"]), { log: silent }), 0);
  const after = JSON.parse(await readFile(path.join(dir, "manifest.json"), "utf8"));
  assert.equal(after.versions.length, 2);
  assert.equal(JSON.parse(await readFile(path.join(drafts, "ledger.json"), "utf8")).entries.length, 1);
});

test("an unverified feed is a candidate until --verify-sources --write has seen it parse", async () => {
  const root = await fixtureRoot({ unverified: true });
  assert.equal(await main(runArgs(root), { log: silent }), 2);
  const refusalDir = (await readdir(path.join(root, "drafts"))).find((name) => name.includes("refusal"));
  assert.match(await readFile(path.join(root, "drafts", refusalDir!, "refusal.md"), "utf8"), /рабочий набор источников пуст/);

  assert.equal(await main(runArgs(root, ["--verify-sources", "--write", "--verified-where", "unit-test"]), { log: silent }), 0);
  const sources = JSON.parse(await readFile(path.join(root, "sources.json"), "utf8"));
  assert.equal(sources.sources[0].feedVerified.where, "unit-test");
  assert.equal(sources.sources[0].feedVerified.items, 4);
  assert.equal(await main(runArgs(root), { log: silent }), 0);

  const dead = await fixtureRoot({ unverified: true, feedUnreachable: true });
  assert.equal(await main(runArgs(dead, ["--verify-sources", "--write"]), { log: silent }), 2);
  const deadSources = JSON.parse(await readFile(path.join(dead, "sources.json"), "utf8"));
  assert.equal(deadSources.sources[0].feedVerified, null);
  assert.match(deadSources.sources[0].lastFeedError.detail, /unreachable/);
});

test("an unreachable source and a page without evidence both end in a written refusal", async () => {
  const unreachable = await fixtureRoot({ feedUnreachable: true });
  assert.equal(await main(runArgs(unreachable), { log: silent }), 2);
  const refusalDir = (await readdir(path.join(unreachable, "drafts"))).find((name) => name.includes("refusal"));
  assert.ok(refusalDir);
  const refusal = await readFile(path.join(unreachable, "drafts", refusalDir, "refusal.md"), "utf8");
  assert.match(refusal, /ни один источник не прочитан/);
  assert.match(refusal, /unreachable/);
  assert.equal(existsSync(path.join(unreachable, "drafts", "ledger.json")), false);

  const thinOnly = await fixtureRoot({
    feedItems: `<item><title>AI Overviews reach hotel searches, says report</title><link>${THIN_URL}</link><pubDate>${daysAgo(3)}</pubDate><description>Hotels and AI Overviews.</description></item>`,
  });
  assert.equal(await main(runArgs(thinOnly), { log: silent }), 2);
  const thinRefusal = (await readdir(path.join(thinOnly, "drafts"))).find((name) => name.includes("refusal"));
  const text = await readFile(path.join(thinOnly, "drafts", thinRefusal!, "refusal.md"), "utf8");
  assert.match(text, /ни один повод не подтверждён/);
  assert.match(text, /insufficient evidence/);
});
