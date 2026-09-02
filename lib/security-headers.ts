/**
 * Public-site transport policy.
 *
 * `script-src` deliberately does NOT use a per-request nonce. Nearly every
 * page of this site is prerendered at build time, so its HTML — including
 * the framework's inline boot scripts and `<script src>` chunks — is frozen
 * long before any request exists. A nonce minted in middleware can never
 * appear on those frozen tags, and with a nonce present browsers ignore
 * 'self', so the policy rejected every script on every static page: no
 * hydration, dead buttons, no lazy media. (That is also why `Reveal` grew
 * its CSS fail-open.) For a static marketing site the workable policy is
 * `'self' 'unsafe-inline'`: chunks come only from this origin, and
 * 'unsafe-inline' admits the framework's own inline flight/boot scripts.
 *
 * `style-src` keeps `'unsafe-inline'` on purpose: pages carry React
 * `style={{…}}` attributes whose values are computed at runtime, and CSP has
 * no nonce mechanism for style attributes.
 */
export function contentSecurityPolicy() {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "object-src 'none'",
    "form-action 'self' https://wa.me https://api.whatsapp.com",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline'",
    "connect-src 'self'",
    "media-src 'self' https:",
    "upgrade-insecure-requests",
  ].join("; ");
}

/**
 * Everything except CSP. The policy is emitted only from middleware so the
 * whole site gets exactly one `Content-Security-Policy` header — two copies
 * on one response are enforced as an intersection.
 */
export function publicSecurityHeaders(origin = "https://www.selenasystems.com") {
  return [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
    // The marketing site has no cross-origin browser API contract. Keep the
    // platform-injected wildcard from becoming the public document policy.
    { key: "Access-Control-Allow-Origin", value: origin },
  ];
}
