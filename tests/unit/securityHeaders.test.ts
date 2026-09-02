import assert from "node:assert/strict";
import test from "node:test";
import { contentSecurityPolicy, publicSecurityHeaders } from "@/lib/security-headers";

test("public transport policy is restrictive", () => {
  const headers = Object.fromEntries(publicSecurityHeaders().map(({ key, value }) => [key, value]));
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headers["X-Frame-Options"], "DENY");
  assert.equal(headers["Referrer-Policy"], "strict-origin-when-cross-origin");
  assert.match(headers["Permissions-Policy"], /camera=\(\)/);
  assert.equal(headers["Access-Control-Allow-Origin"], "https://www.selenasystems.com");
});

test("CSP ships from middleware only, so a response never carries two policies", () => {
  const keys = publicSecurityHeaders().map(({ key }) => key.toLowerCase());
  assert.ok(!keys.includes("content-security-policy"));
  assert.ok(!keys.includes("content-security-policy-report-only"));
});

test("the policy is enforcing and same-origin by default", () => {
  const policy = contentSecurityPolicy();
  assert.match(policy, /default-src 'self'/);
  assert.match(policy, /object-src 'none'/);
  assert.match(policy, /frame-ancestors 'none'/);
});

// The site is prerendered: a per-request nonce can never match the frozen
// script tags, and once a nonce is present browsers ignore 'self' — the
// policy then rejects every script on every static page. Guard against that
// regression: script-src must work for build-time HTML.
test("script-src works for prerendered pages: self + inline, no nonce, no strict-dynamic", () => {
  const scriptSrc = contentSecurityPolicy()
    .split("; ")
    .find((directive) => directive.startsWith("script-src "));
  assert.ok(scriptSrc, "script-src directive is present");
  assert.match(scriptSrc, /'self'/);
  assert.match(scriptSrc, /'unsafe-inline'/);
  assert.ok(!scriptSrc.includes("nonce-"));
  assert.ok(!scriptSrc.includes("strict-dynamic"));
});
