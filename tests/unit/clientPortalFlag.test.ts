import assert from "node:assert/strict";
import test from "node:test";
import { CLIENT_PORTAL_ENABLED, selenaAppRoutes } from "@/lib/visibility/routes";

test("the portal shows unless the env var explicitly hides it", () => {
  assert.equal(CLIENT_PORTAL_ENABLED, process.env.NEXT_PUBLIC_CLIENT_PORTAL_ENABLED !== "false");
});

test("no link into the portal is rendered outside the flag", async () => {
  const { readFile } = await import("node:fs/promises");
  const files = [
    "components/layout/Header.tsx",
    "components/layout/Footer.tsx",
    "components/visibility/PricingTracks.tsx",
    "components/visibility/PromotionBanner.tsx",
  ];
  for (const file of files) {
    const source = await readFile(new URL(`../../${file}`, import.meta.url), "utf8");
    const links = source.match(/selenaAppRoutes\.(login|register)|content\.portal\.href/g) ?? [];
    assert.ok(links.length > 0, `${file} still owns a portal link to guard`);
    assert.ok(source.includes("CLIENT_PORTAL_ENABLED"), `${file} links to the portal without reading the flag`);

    // One guard may cover several links, so counting them proves nothing. What
    // has to hold is that no link sits ahead of every guard — the import line
    // is the only mention of the routes module allowed there.
    const beforeFirstGuard = source.slice(0, source.indexOf("CLIENT_PORTAL_ENABLED &&"));
    const unguarded = beforeFirstGuard
      .split("\n")
      .filter((line) => !line.startsWith("import") && /selenaAppRoutes\.(login|register)|content\.portal\.href/.test(line));
    assert.deepEqual(unguarded, [], `${file}: a portal link is rendered before any CLIENT_PORTAL_ENABLED guard`);
  }
});

test("registration is reachable from the site, not only from the login form", async () => {
  // The address existed in code and nothing linked to it: the only way in was
  // the login page's own "create one", which a visitor has to guess at.
  const { readFile } = await import("node:fs/promises");
  const offered = await Promise.all(
    ["components/layout/Header.tsx", "components/layout/Footer.tsx", "components/visibility/PromotionBanner.tsx"].map(
      async (file) => (await readFile(new URL(`../../${file}`, import.meta.url), "utf8")).includes("selenaAppRoutes.register"),
    ),
  );
  assert.deepEqual(offered, [true, true, true]);
});

test("the portal hostname is reachable from one module only", () => {
  assert.match(selenaAppRoutes.login, /^https:\/\/app\.selenasystems\.com\//);
});
