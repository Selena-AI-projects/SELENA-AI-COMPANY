import assert from "node:assert/strict";
import test from "node:test";
import {
  askBrightData,
  brightDataSurfaces,
  buildRequestBody,
  readAnswer,
  readSources,
} from "@/lib/visibility-log/brightdata";

test("each surface is asked the way its own collector takes input", () => {
  const chatgpt = buildRequestBody("chatgpt", "q") as { input: Record<string, unknown>[] };
  // Visitor View is the search-backed answer; with this off it would be API View.
  assert.equal(chatgpt.input[0].web_search, true);
  assert.equal(chatgpt.input[0].url, brightDataSurfaces.chatgpt.url);

  const gemini = buildRequestBody("gemini", "q") as { input: Record<string, unknown>[]; limit_per_input: null };
  assert.equal(gemini.input[0].index, 1);
  assert.equal(gemini.limit_per_input, null);

  const perplexity = buildRequestBody("perplexity", "q") as { input: Record<string, unknown>[] };
  assert.equal(perplexity.input[0].web_search, undefined);
  assert.equal(perplexity.input[0].index, undefined);
});

test("the answer is read from whichever known field holds text", () => {
  assert.deepEqual(readAnswer({ answer_text: "hello" }), { field: "answer_text", text: "hello" });
  // Order matters: the richest field wins when several are present.
  assert.equal(readAnswer({ text: "plain", answer_text_markdown: "rich" })?.field, "answer_text_markdown");
  assert.equal(readAnswer({ answer_text: "   " }), null);
  assert.equal(readAnswer({ unknown_field: "hello" }), null);
});

test("only real links the payload carried become sources", () => {
  const read = readSources({
    citations: [
      "https://korafoodhall.com/menu",
      { url: "https://www.tripadvisor.com/x" },
      "not-a-url",
      "https://korafoodhall.com/menu",
    ],
  });
  assert.equal(read?.field, "citations");
  // Deduplicated, www dropped, and the non-link is not invented into one.
  assert.deepEqual(
    read?.sources.map((source) => source.domain),
    ["korafoodhall.com", "tripadvisor.com"],
  );
});

test("an unreadable payload is an error, never a surface that said nothing", async () => {
  const jsonResponse = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

  const unknownShape = await askBrightData("chatgpt", "q", "token", {
    fetchImpl: async () => jsonResponse([{ status: "queued" }]),
  });
  assert.equal(unknownShape.error, "NO_KNOWN_ANSWER_FIELD");
  assert.equal(unknownShape.answer, null);

  const httpError = await askBrightData("chatgpt", "q", "token", {
    fetchImpl: async () => jsonResponse({ message: "bad token" }, 401),
  });
  assert.equal(httpError.error, "PROVIDER_HTTP_401");
  // The provider's error body can echo the request back, so nothing from it
  // reaches the result.
  assert.equal(httpError.answer, null);
  assert.deepEqual(httpError.keys, []);
});

test("the credential travels in the header and nowhere else", async () => {
  let seen: { url: string; init: RequestInit } | null = null;
  await askBrightData("perplexity", "какие виллы в убуде", "brd-secret", {
    fetchImpl: async (input, init) => {
      seen = { url: String(input), init: init ?? {} };
      return new Response(JSON.stringify([{ answer_text: "ok" }]), { status: 200 });
    },
  });
  const call = seen as unknown as { url: string; init: RequestInit };
  assert.equal((call.init.headers as Record<string, string>).Authorization, "Bearer brd-secret");
  assert.ok(!call.url.includes("brd-secret"));
  assert.ok(!String(call.init.body).includes("brd-secret"));
  // The collector is named in the query string, not the body.
  assert.ok(call.url.includes(`dataset_id=${brightDataSurfaces.perplexity.datasetId}`));
});

test("a receipt is followed to the snapshot instead of being read as silence", async () => {
  const calls: string[] = [];
  const ask = await askBrightData("chatgpt", "q", "brd-secret", {
    pollMs: 0,
    fetchImpl: async (input) => {
      const url = String(input);
      calls.push(url.split("brightdata.com")[1] ?? url);
      if (url.includes("/scrape")) {
        return new Response(JSON.stringify({ message: "Timeout, use snapshot_id", snapshot_id: "s_01" }));
      }
      if (url.includes("/progress/")) return new Response(JSON.stringify({ status: "ready" }));
      return new Response(JSON.stringify([{ answer_text: "Kora Food Hall is worth a visit." }]));
    },
  });
  assert.equal(ask.answer, "Kora Food Hall is worth a visit.");
  assert.equal(ask.delivery, "snapshot");
  // The surface and question survive the second leg — a snapshot answer must
  // not be filed under the wrong surface.
  assert.equal(ask.surface, "chatgpt");
  assert.equal(ask.question, "q");
  assert.ok(calls.some((c) => c.includes("/progress/s_01")));
});

test("a snapshot that never becomes ready is not an empty answer", async () => {
  const ask = await askBrightData("perplexity", "q", "brd-secret", {
    pollMs: 0,
    snapshotTimeoutMs: 0,
    fetchImpl: async (input) => {
      const url = String(input);
      if (url.includes("/scrape")) return new Response(JSON.stringify({ message: "queued", snapshot_id: "s_02" }));
      return new Response("nope", { status: 404 });
    },
  });
  assert.equal(ask.answer, null);
  assert.equal(ask.error, "NO_KNOWN_ANSWER_FIELD");
  // The provider's own words survive, so a refusal can be read without another run.
  assert.equal(ask.statusText, "queued");
});

test("the credential is stripped from anything the provider says back", async () => {
  const ask = await askBrightData("chatgpt", "q", "brd-secret", {
    waitForSnapshot: false,
    fetchImpl: async () => new Response("bad token brd-secret rejected", { status: 401 }),
  });
  assert.equal(ask.error, "PROVIDER_HTTP_401");
  assert.equal(ask.statusText, "bad token *** rejected");
});

test("an empty citations list is not an answer about sources", () => {
  // ChatGPT returns an empty `citations` beside a populated `search_sources`.
  // Stopping at the first array present would report a cited answer as uncited.
  const read = readSources({
    citations: [],
    search_sources: [{ url: "https://korafoodhall.com/" }, { url: "https://tripadvisor.com/x" }],
  });
  assert.equal(read?.field, "search_sources");
  assert.equal(read?.sources.length, 2);
  assert.equal(readSources({ citations: [], links_attached: [] }), null);
});

test("a surface with no known collector is refused before anything is spent", async () => {
  let called = false;
  const ask = await askBrightData("gemini", "q", "brd-secret", {
    fetchImpl: async () => {
      called = true;
      return new Response("{}");
    },
  });
  assert.equal(ask.error, "COLLECTOR_UNKNOWN");
  assert.equal(called, false);
});
