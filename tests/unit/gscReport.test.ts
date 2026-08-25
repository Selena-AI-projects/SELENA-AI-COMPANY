import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  buildDateWindows,
  buildOpportunities,
  classifyQuery,
  createGoogleAuthContext,
  createGscClient,
  generateGscReport,
  loadGscConfig,
  normalizeSearchText,
  percentChange,
  resolvePropertyConfig,
  runGscCli,
  writeGscReport,
} from "../../scripts/gsc-report";
import type { GscConfig, GscRow } from "../../scripts/gsc-report";

const TEST_SERVICE_ACCOUNT = "gsc-audit@example.invalid";
const UNEXPECTED_SERVICE_ACCOUNT = "unexpected@example.invalid";

test("GSC comparison uses two contiguous 28-day UTC windows", () => {
  const windows = buildDateWindows(new Date("2026-03-05T23:30:00-08:00"), 28, 3);

  assert.deepEqual(windows, {
    current: { startDate: "2026-02-04", endDate: "2026-03-03" },
    previous: { startDate: "2026-01-07", endDate: "2026-02-03" },
  });
});

test("GSC date windows stay exact across a leap-day boundary", () => {
  const windows = buildDateWindows(new Date("2024-03-03T01:00:00Z"), 3, 1);

  assert.deepEqual(windows, {
    current: { startDate: "2024-02-29", endDate: "2024-03-02" },
    previous: { startDate: "2024-02-26", endDate: "2024-02-28" },
  });
});

test("GSC percentage deltas distinguish zero baseline from no change", () => {
  assert.equal(percentChange(100, 80), 25);
  assert.equal(percentChange(0, 0), 0);
  assert.equal(percentChange(5, 0), null);
});

test("brand classification normalizes case, Unicode punctuation, and whitespace", () => {
  const terms = ["selena systems", "selenasystems"];

  assert.equal(classifyQuery("  SELENA—Systems   AI audit ", terms), "brand");
  assert.equal(classifyQuery("selenasystems reviews", terms), "brand");
  assert.equal(classifyQuery("ai automation audit", terms), "nonBrand");
  assert.equal(normalizeSearchText("DOKI.HELP — Indonesia"), "doki help indonesia");
});

test("queries stay unclassified when a property has no explicit brand terms", () => {
  assert.equal(classifyQuery("selena systems", undefined), "unclassified");
  assert.equal(classifyQuery("generic ai automation", []), "unclassified");
});

test("SEO opportunities distinguish snippet, near-page-one, and ranking work", () => {
  const opportunities = buildOpportunities([
    { keys: ["selena audit", "https://example.com/audit"], clicks: 0, impressions: 80, ctr: 0, position: 4.2 },
    { keys: ["ai automation", "https://example.com/automation"], clicks: 1, impressions: 100, ctr: 0.01, position: 9.4 },
    { keys: ["business operating system", "https://example.com/os"], clicks: 0, impressions: 50, ctr: 0, position: 23.1 },
    { keys: ["healthy result", "https://example.com/good"], clicks: 12, impressions: 100, ctr: 0.12, position: 3 },
  ]);

  assert.deepEqual(
    opportunities.map(({ focus, query, page }) => ({ focus, query, page })),
    [
      { focus: "snippet_and_intent", query: "selena audit", page: "https://example.com/audit" },
      { focus: "ranking_and_snippet", query: "ai automation", page: "https://example.com/automation" },
      { focus: "content_and_relevance", query: "business operating system", page: "https://example.com/os" },
    ],
  );
  assert.ok(opportunities.every((item) => !item.guidance.toLowerCase().includes("title problem")));
});

test("GSC client keeps aggregate totals separate and paginates dimension rows", async () => {
  const requests: Array<Record<string, unknown>> = [];
  const fetchImpl = async (_input: string | URL | Request, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    requests.push(body);

    if (!body.dimensions) {
      return Response.json({ rows: [{ clicks: 100, impressions: 1_000, ctr: 0.1, position: 7.5 }] });
    }
    if (body.startRow === 0) {
      return Response.json({
        rows: [
          { keys: ["first"], clicks: 20, impressions: 100 },
          { keys: ["second"], clicks: 10, impressions: 80 },
        ],
      });
    }
    return Response.json({ rows: [{ keys: ["third"], clicks: 5, impressions: 50 }] });
  };
  const client = createGscClient({
    fetchImpl: fetchImpl as typeof fetch,
    getAccessToken: async () => "test-token",
    rowLimit: 2,
  });
  const window = { startDate: "2026-01-01", endDate: "2026-01-28" };

  const aggregate = await client.queryAggregate("sc-domain:example.com", window);
  const rows = await client.queryAllRows("sc-domain:example.com", window, ["query"]);

  assert.deepEqual(aggregate, { clicks: 100, impressions: 1_000, ctr: 0.1, position: 7.5 });
  assert.deepEqual(rows.map((row) => row.keys?.[0]), ["first", "second", "third"]);
  assert.equal(requests[0].dimensions, undefined);
  assert.equal(requests[0].rowLimit, 1);
  assert.deepEqual(requests.slice(1).map((request) => request.startRow), [0, 2]);
});

test("changing GSC row pagination cannot change aggregate totals", async () => {
  async function aggregateFor(rowLimit: number) {
    const client = createGscClient({
      fetchImpl: (async () =>
        Response.json({ rows: [{ clicks: 123, impressions: 4_567, ctr: 0.0269, position: 8.4 }] })) as typeof fetch,
      getAccessToken: async () => "test-token",
      rowLimit,
    });
    return client.queryAggregate("sc-domain:example.com", {
      startDate: "2026-01-01",
      endDate: "2026-01-28",
    });
  }

  assert.deepEqual(await aggregateFor(1), await aggregateFor(25_000));
});

test("GSC client uses the maximum supported dimension page by default", async () => {
  let requestBody: Record<string, unknown> | undefined;
  const client = createGscClient({
    fetchImpl: (async (_input: string | URL | Request, init?: RequestInit) => {
      requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
      return Response.json({ rows: [] });
    }) as typeof fetch,
    getAccessToken: async () => "test-token",
  });

  await client.queryAllRows(
    "sc-domain:example.com",
    { startDate: "2026-01-01", endDate: "2026-01-28" },
    ["query"],
  );

  assert.equal(requestBody?.rowLimit, 25_000);
});

test("GSC client retries rate limits using Retry-After", async () => {
  let attempts = 0;
  const waits: number[] = [];
  const client = createGscClient({
    fetchImpl: (async () => {
      attempts += 1;
      if (attempts === 1) {
        return Response.json({ error: { message: "slow down" } }, { status: 429, headers: { "retry-after": "2" } });
      }
      return Response.json({ rows: [{ clicks: 9, impressions: 90, ctr: 0.1, position: 4 }] });
    }) as typeof fetch,
    getAccessToken: async () => "test-token",
    sleep: async (milliseconds) => {
      waits.push(milliseconds);
    },
  });

  const result = await client.queryAggregate("sc-domain:example.com", {
    startDate: "2026-01-01",
    endDate: "2026-01-28",
  });

  assert.equal(attempts, 2);
  assert.deepEqual(waits, [2_000]);
  assert.equal(result.clicks, 9);
});

test("GSC client retries server failures with bounded backoff", async () => {
  let attempts = 0;
  const waits: number[] = [];
  const client = createGscClient({
    fetchImpl: (async () => {
      attempts += 1;
      if (attempts === 1) return Response.json({}, { status: 503 });
      return Response.json({ rows: [{ clicks: 4, impressions: 40, ctr: 0.1, position: 5 }] });
    }) as typeof fetch,
    getAccessToken: async () => "test-token",
    sleep: async (milliseconds) => {
      waits.push(milliseconds);
    },
  });

  const result = await client.queryAggregate("sc-domain:example.com", {
    startDate: "2026-01-01",
    endDate: "2026-01-28",
  });

  assert.equal(attempts, 2);
  assert.deepEqual(waits, [500]);
  assert.equal(result.clicks, 4);
});

test("GSC client aborts a request after its timeout without leaking the fetch error", async () => {
  const client = createGscClient({
    fetchImpl: ((_input: string | URL | Request, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("secret network detail", "AbortError")));
      })) as typeof fetch,
    getAccessToken: async () => "test-token",
    maxRetries: 0,
    timeoutMs: 5,
  });

  await assert.rejects(
    client.queryAggregate("sc-domain:example.com", { startDate: "2026-01-01", endDate: "2026-01-28" }),
    (error: Error) => {
      assert.match(error.message, /timed out/i);
      assert.doesNotMatch(error.message, /secret network detail/);
      return true;
    },
  );
});

test("GSC client does not retry forbidden responses or expose their body", async () => {
  let attempts = 0;
  const client = createGscClient({
    fetchImpl: (async () => {
      attempts += 1;
      return Response.json({ error: { message: "credential secret-value was rejected" } }, { status: 403 });
    }) as typeof fetch,
    getAccessToken: async () => "test-token",
    sleep: async () => undefined,
  });

  await assert.rejects(
    client.queryAggregate("sc-domain:example.com", { startDate: "2026-01-01", endDate: "2026-01-28" }),
    (error: Error) => {
      assert.match(error.message, /HTTP 403/);
      assert.doesNotMatch(error.message, /secret-value/);
      return true;
    },
  );
  assert.equal(attempts, 1);
});

test("tracked GSC config contains portfolio properties but no account identity", async () => {
  const config = await loadGscConfig("config/gsc-properties.json");

  assert.equal("expectedServiceAccount" in config, false);
  assert.deepEqual(Object.keys(config.properties).sort(), [
    "https://2moonspa.com/",
    "https://villaops.selenasystems.com/",
    "sc-domain:arhidom.space",
    "sc-domain:doki.help",
    "sc-domain:korafoodhall.com",
    "sc-domain:nevapalace.ru",
    "sc-domain:otherbali.com",
    "sc-domain:petid.care",
    "sc-domain:remhaos.com",
    "sc-domain:selenasystems.com",
    "sc-domain:zimaleto2.ru",
    "sc-domain:zubilook.com",
  ]);
  assert.deepEqual(
    resolvePropertyConfig(config, "sc-domain:selenasystems.com")?.brandTerms,
    ["selena systems", "selenasystems"],
  );
  assert.deepEqual(resolvePropertyConfig(config, "https://villaops.selenasystems.com/")?.brandTerms, [
    "villaops",
    "villa ops",
  ]);
  assert.deepEqual(resolvePropertyConfig(config, "https://www.2moonspa.com/")?.brandTerms, [
    "2moonspa",
    "2 moon spa",
    "2moon spa",
  ]);
  assert.deepEqual(resolvePropertyConfig(config, "sc-domain:nevapalace.ru")?.brandTerms, [
    "neva palace",
    "nevapalace",
    "нева палас",
  ]);
  assert.deepEqual(resolvePropertyConfig(config, "sc-domain:zimaleto2.ru")?.brandTerms, [
    "zima leto",
    "zimaleto",
    "zimaleto2",
    "зима лето",
    "зима лето 2",
  ]);
  assert.equal(resolvePropertyConfig(config, "sc-domain:unknown.example"), undefined);
});

test("GSC report uses exact aggregates and exposes visible-query coverage", async () => {
  const current = { startDate: "2026-02-04", endDate: "2026-03-03" };
  const previous = { startDate: "2026-01-07", endDate: "2026-02-03" };
  const rows = new Map<string, GscRow[]>([
    [`${current.startDate}:query`, [
      { keys: ["selena systems"], clicks: 10, impressions: 40, ctr: 0.25, position: 1 },
      { keys: ["ai automation"], clicks: 50, impressions: 400, ctr: 0.125, position: 7 },
    ]],
    [`${previous.startDate}:query`, [
      { keys: ["selena systems"], clicks: 5, impressions: 30, ctr: 0.167, position: 1 },
      { keys: ["ai automation"], clicks: 35, impressions: 300, ctr: 0.117, position: 8 },
    ]],
    [`${current.startDate}:page`, [
      { keys: ["https://www.selenasystems.com/ai-automation"], clicks: 80, impressions: 700, ctr: 0.114, position: 6 },
    ]],
    [`${current.startDate}:query,page`, [
      { keys: ["automation operating system", "https://www.selenasystems.com/ai-automation"], clicks: 1, impressions: 100, ctr: 0.01, position: 9 },
    ]],
  ]);
  const fetchImpl = async (input: string | URL | Request, init?: RequestInit) => {
    if (String(input).endsWith("/sites")) {
      return Response.json({ siteEntry: [{ siteUrl: "sc-domain:selenasystems.com", permissionLevel: "siteFullUser" }] });
    }
    const body = JSON.parse(String(init?.body)) as {
      startDate: string;
      dimensions?: string[];
      startRow?: number;
      rowLimit?: number;
    };
    if (!body.dimensions) {
      const aggregate = body.startDate === current.startDate
        ? { clicks: 100, impressions: 1_000, ctr: 0.1, position: 7 }
        : { clicks: 80, impressions: 800, ctr: 0.1, position: 8 };
      return Response.json({ rows: [aggregate] });
    }
    const key = `${body.startDate}:${body.dimensions.join(",")}`;
    const sourceRows = rows.get(key) ?? [];
    const start = body.startRow ?? 0;
    return Response.json({ rows: sourceRows.slice(start, start + (body.rowLimit ?? 1)) });
  };
  const client = createGscClient({
    fetchImpl: fetchImpl as typeof fetch,
    getAccessToken: async () => "test-token",
    rowLimit: 1,
  });
  const config: GscConfig = {
    schemaVersion: 1,
    properties: {
      "sc-domain:selenasystems.com": {
        label: "Selena Systems",
        brandTerms: ["selena systems", "selenasystems"],
      },
    },
  };

  const report = await generateGscReport({
    client,
    config,
    serviceAccount: TEST_SERVICE_ACCOUNT,
    expectedServiceAccount: TEST_SERVICE_ACCOUNT,
    now: new Date("2026-03-06T00:00:00Z"),
    windowDays: 28,
    lagDays: 3,
  });

  assert.deepEqual(report.windows, { current, previous });
  assert.equal(report.sites[0].total.clicks, 100);
  assert.equal(report.sites[0].previousTotal.clicks, 80);
  assert.equal(report.sites[0].trend.clicksPercent, 25);
  assert.deepEqual(report.sites[0].queryCoverage, {
    visibleClicks: 60,
    totalClicks: 100,
    clickRatio: 0.6,
    visibleImpressions: 440,
    totalImpressions: 1_000,
    impressionRatio: 0.44,
  });
  assert.equal(report.sites[0].visibleQueryBreakdown.brand.clicks, 10);
  assert.equal(report.sites[0].visibleQueryBreakdown.nonBrand.clicks, 50);
  assert.equal(report.sites[0].opportunities[0].focus, "ranking_and_snippet");
});

test("GSC report rejects an account with no readable properties", async () => {
  const client = createGscClient({
    fetchImpl: (async (input: string | URL | Request) => {
      assert.ok(String(input).endsWith("/sites"));
      return Response.json({ siteEntry: [] });
    }) as typeof fetch,
    getAccessToken: async () => "test-token",
  });
  const config: GscConfig = {
    schemaVersion: 1,
    properties: {},
  };

  await assert.rejects(
    generateGscReport({
      client,
      config,
      serviceAccount: TEST_SERVICE_ACCOUNT,
      expectedServiceAccount: TEST_SERVICE_ACCOUNT,
      now: new Date("2026-03-06T00:00:00Z"),
    }),
    /no readable Search Console properties/i,
  );
});

test("one forbidden property does not stop the other properties", async () => {
  const fetchImpl = async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    if (url.endsWith("/sites")) {
      return Response.json({
        siteEntry: [
          { siteUrl: "sc-domain:blocked.example", permissionLevel: "siteRestrictedUser" },
          { siteUrl: "sc-domain:working.example", permissionLevel: "siteRestrictedUser" },
        ],
      });
    }
    if (url.includes(encodeURIComponent("sc-domain:blocked.example"))) {
      return Response.json({ error: { message: "private API detail" } }, { status: 403 });
    }
    const body = JSON.parse(String(init?.body)) as { dimensions?: string[] };
    return body.dimensions
      ? Response.json({ rows: [] })
      : Response.json({ rows: [{ clicks: 7, impressions: 70, ctr: 0.1, position: 4 }] });
  };
  const client = createGscClient({
    fetchImpl: fetchImpl as typeof fetch,
    getAccessToken: async () => "test-token",
  });
  const config: GscConfig = {
    schemaVersion: 1,
    properties: {},
  };

  const report = await generateGscReport({
    client,
    config,
    serviceAccount: TEST_SERVICE_ACCOUNT,
    expectedServiceAccount: TEST_SERVICE_ACCOUNT,
    now: new Date("2026-03-06T00:00:00Z"),
  });
  const blocked = report.sites.find((site) => site.siteUrl === "sc-domain:blocked.example");
  const working = report.sites.find((site) => site.siteUrl === "sc-domain:working.example");

  assert.ok(blocked && "error" in blocked);
  assert.match(blocked.error, /HTTP 403/);
  assert.doesNotMatch(blocked.error, /private API detail/);
  assert.equal(working?.total.clicks, 7);
});

test("GSC reports use timestamped private files", async () => {
  const root = await mkdtemp(join(tmpdir(), "gsc-report-test-"));
  const outputDir = join(root, "reports");
  const report = {
    schemaVersion: 2 as const,
    generatedAt: "2026-03-06T00:00:00.123Z",
    serviceAccount: TEST_SERVICE_ACCOUNT,
    windowDays: 28,
    windows: {
      current: { startDate: "2026-02-04", endDate: "2026-03-03" },
      previous: { startDate: "2026-01-07", endDate: "2026-02-03" },
    },
    limitations: ["Query rows can omit anonymized queries; aggregate totals are the source of truth."],
    sites: [],
  };

  try {
    const written = await writeGscReport(report, outputDir);
    assert.match(written.jsonPath, /gsc-2026-03-06T00-00-00-123Z\.json$/);
    assert.match(written.textPath, /gsc-2026-03-06T00-00-00-123Z\.txt$/);
    assert.equal((await stat(outputDir)).mode & 0o777, 0o700);
    assert.equal((await stat(written.jsonPath)).mode & 0o777, 0o600);
    assert.equal((await stat(written.textPath)).mode & 0o777, 0o600);
    assert.match(await readFile(written.textPath, "utf8"), /aggregate totals are the source of truth/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("Google auth prefers an absolute credential path and verifies the account", async () => {
  let capturedOptions: Record<string, unknown> | undefined;
  const context = await createGoogleAuthContext({
    env: { GOOGLE_APPLICATION_CREDENTIALS: "/secure/gsc-key.json" },
    expectedServiceAccount: TEST_SERVICE_ACCOUNT,
    authFactory: (options) => {
      capturedOptions = options;
      return {
        getCredentials: async () => ({ client_email: TEST_SERVICE_ACCOUNT }),
        getAccessToken: async () => "access-token",
      };
    },
  });

  assert.equal(capturedOptions?.keyFilename, "/secure/gsc-key.json");
  assert.equal(context.serviceAccount, TEST_SERVICE_ACCOUNT);
  assert.equal(await context.getAccessToken(), "access-token");
});

test("Google auth rejects account mismatch and redacts malformed inline credentials", async () => {
  await assert.rejects(
    createGoogleAuthContext({
      env: { GOOGLE_APPLICATION_CREDENTIALS: "/secure/gsc-key.json" },
      expectedServiceAccount: TEST_SERVICE_ACCOUNT,
      authFactory: () => ({
        getCredentials: async () => ({ client_email: UNEXPECTED_SERVICE_ACCOUNT }),
        getAccessToken: async () => "access-token",
      }),
    }),
    /does not match the configured account/i,
  );

  const inlineSecret = "not-json-private-secret";
  await assert.rejects(
    createGoogleAuthContext({
      env: { GOOGLE_SERVICE_ACCOUNT_JSON: inlineSecret },
      expectedServiceAccount: TEST_SERVICE_ACCOUNT,
      authFactory: () => {
        throw new Error("must not construct auth for invalid JSON");
      },
    }),
    (error: Error) => {
      assert.match(error.message, /not valid service-account JSON/i);
      assert.doesNotMatch(error.message, new RegExp(inlineSecret));
      return true;
    },
  );
});

test("CLI list-sites reports configured and unclassified properties without writing a report", async () => {
  const output: string[] = [];
  await runGscCli({
    args: ["--list-sites"],
    env: {
      GOOGLE_APPLICATION_CREDENTIALS: "/secure/gsc-key.json",
      GSC_EXPECTED_SERVICE_ACCOUNT: TEST_SERVICE_ACCOUNT,
    },
    authFactory: () => ({
      getCredentials: async () => ({ client_email: TEST_SERVICE_ACCOUNT }),
      getAccessToken: async () => "access-token",
    }),
    fetchImpl: (async (input: string | URL | Request) => {
      assert.ok(String(input).endsWith("/sites"));
      return Response.json({
        siteEntry: [
          { siteUrl: "sc-domain:selenasystems.com", permissionLevel: "siteFullUser" },
          { siteUrl: "sc-domain:unknown.example", permissionLevel: "siteRestrictedUser" },
        ],
      });
    }) as typeof fetch,
    stdout: (line) => output.push(line),
  });

  const rendered = output.join("\n");
  assert.match(rendered, /configured.*Selena Systems.*sc-domain:selenasystems\.com/i);
  assert.match(rendered, /unclassified.*sc-domain:unknown\.example/i);
  assert.doesNotMatch(rendered, /Отчёт сохранён|Report saved/i);
});

test("CLI requires an external expected service-account identity", async () => {
  await assert.rejects(
    runGscCli({
      args: ["--list-sites"],
      env: { GOOGLE_APPLICATION_CREDENTIALS: "/secure/gsc-key.json" },
      authFactory: () => {
        throw new Error("auth must not start without an approved identity");
      },
    }),
    /GSC_EXPECTED_SERVICE_ACCOUNT/,
  );
});

test("CLI keeps report contents out of stdout", async () => {
  const root = await mkdtemp(join(tmpdir(), "gsc-cli-private-"));
  const output: string[] = [];
  const sensitiveQuery = "confidential growth query";
  const sensitivePage = "https://private.example/internal-page";

  try {
    const result = await runGscCli({
      env: {
        GOOGLE_APPLICATION_CREDENTIALS: "/secure/gsc-key.json",
        GSC_EXPECTED_SERVICE_ACCOUNT: TEST_SERVICE_ACCOUNT,
        GSC_REPORT_DIR: root,
      },
      authFactory: () => ({
        getCredentials: async () => ({ client_email: TEST_SERVICE_ACCOUNT }),
        getAccessToken: async () => "access-token",
      }),
      fetchImpl: (async (input: string | URL | Request, init?: RequestInit) => {
        if (String(input).endsWith("/sites")) {
          return Response.json({
            siteEntry: [{ siteUrl: "sc-domain:selenasystems.com", permissionLevel: "siteFullUser" }],
          });
        }
        const body = JSON.parse(String(init?.body)) as { dimensions?: string[] };
        if (!body.dimensions) {
          return Response.json({ rows: [{ clicks: 10, impressions: 100, ctr: 0.1, position: 5 }] });
        }
        if (body.dimensions.length === 2) {
          return Response.json({
            rows: [{ keys: [sensitiveQuery, sensitivePage], clicks: 0, impressions: 50, ctr: 0, position: 8 }],
          });
        }
        return Response.json({
          rows: [{ keys: [body.dimensions[0] === "query" ? sensitiveQuery : sensitivePage], clicks: 4, impressions: 40 }],
        });
      }) as typeof fetch,
      stdout: (line) => output.push(line),
      now: new Date("2026-03-06T00:00:00Z"),
    });

    assert.equal(result.mode, "report");
    const renderedOutput = output.join("\n");
    assert.match(renderedOutput, /Report saved:/);
    assert.doesNotMatch(renderedOutput, new RegExp(sensitiveQuery));
    assert.doesNotMatch(renderedOutput, new RegExp(sensitivePage));
    assert.match(await readFile(result.textPath, "utf8"), new RegExp(sensitiveQuery));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("CLI fails after saving a private diagnostic when every property fails", async () => {
  const root = await mkdtemp(join(tmpdir(), "gsc-cli-failed-"));
  const output: string[] = [];

  try {
    await assert.rejects(
      runGscCli({
        env: {
          GOOGLE_APPLICATION_CREDENTIALS: "/secure/gsc-key.json",
          GSC_EXPECTED_SERVICE_ACCOUNT: TEST_SERVICE_ACCOUNT,
          GSC_REPORT_DIR: root,
        },
        authFactory: () => ({
          getCredentials: async () => ({ client_email: TEST_SERVICE_ACCOUNT }),
          getAccessToken: async () => "access-token",
        }),
        fetchImpl: (async (input: string | URL | Request) => {
          if (String(input).endsWith("/sites")) {
            return Response.json({
              siteEntry: [{ siteUrl: "sc-domain:blocked.example", permissionLevel: "siteRestrictedUser" }],
            });
          }
          return Response.json({ error: { message: "private failure detail" } }, { status: 403 });
        }) as typeof fetch,
        stdout: (line) => output.push(line),
        now: new Date("2026-03-06T00:00:00Z"),
      }),
      /All Search Console properties failed/,
    );

    assert.match(output.join("\n"), /Report saved:/);
    assert.doesNotMatch(output.join("\n"), /private failure detail|HTTP 403/);
    assert.deepEqual((await readdir(root)).sort(), [
      "gsc-2026-03-06T00-00-00-000Z.json",
      "gsc-2026-03-06T00-00-00-000Z.txt",
    ]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
