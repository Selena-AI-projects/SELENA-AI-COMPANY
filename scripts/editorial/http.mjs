// One place for every outbound request: a short timeout, a size cap, an
// identifiable User-Agent and nothing paid. Node's fetch ignores HTTPS_PROXY
// unless Node is started with --use-env-proxy (NODE_OPTIONS=--use-env-proxy);
// a machine without a proxy needs nothing.
import { readFile } from "node:fs/promises";

export const USER_AGENT = "Selena Systems editorial research (+https://www.selenasystems.com/)";
const TIMEOUT_MS = 20_000;
const MAX_BYTES = 2_000_000;

export class FetchFailure extends Error {
  constructor(url, reason, status = null) {
    super(`${reason}: ${url}`);
    this.name = "FetchFailure";
    this.url = url;
    this.reason = reason;
    this.status = status;
  }
}

/**
 * `fixtures` maps a URL to a local file; when set, no network request is
 * made. Every package built from fixtures is marked as test data.
 */
export async function fetchText(url, { fixtures = null, accept = "*/*" } = {}) {
  if (fixtures) {
    const file = fixtures[url];
    if (!file) throw new FetchFailure(url, "fixture missing");
    if (file === "unreachable") throw new FetchFailure(url, "unreachable (fixture)");
    if (/^status:\d{3}$/.test(file)) throw new FetchFailure(url, "http error (fixture)", Number(file.slice(7)));
    return { status: 200, url, body: await readFile(file, "utf8"), contentType: "text/html" };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { "user-agent": USER_AGENT, accept },
      redirect: "follow",
      signal: controller.signal,
    });
    if (!response.ok) throw new FetchFailure(url, "http error", response.status);
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MAX_BYTES) throw new FetchFailure(url, "response too large", response.status);
    return {
      status: response.status,
      url: response.url || url,
      body: buffer.toString("utf8"),
      contentType: response.headers.get("content-type") ?? "",
    };
  } catch (error) {
    if (error instanceof FetchFailure) throw error;
    // A refused proxy tunnel arrives as a cancelled request with code 0, so
    // the message says more than the code does.
    const cause = error?.cause;
    const detail = typeof cause?.code === "string" && cause.code ? cause.code : (cause?.message ?? error?.message ?? "fetch failed");
    const reason = error?.name === "AbortError" ? "timeout" : `unreachable (${detail})`;
    throw new FetchFailure(url, reason);
  } finally {
    clearTimeout(timer);
  }
}
