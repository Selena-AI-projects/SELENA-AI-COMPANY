import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { selenaAppRoutes } from "@/lib/visibility/routes";

test("readiness result links to the verified check without transferring the website", () => {
  const source = readFileSync(join(process.cwd(), "components/visibility/LiveReportView.tsx"), "utf8");

  assert.equal(selenaAppRoutes.freeAiVisibility, "https://app.selenasystems.com/free-ai-visibility");
  assert.match(source, /href=\{selenaAppRoutes\.freeAiVisibility\}/);
  assert.ok(!/free-ai-visibility\?/.test(source), "handoff must not put a submitted URL in a cross-domain query string");
  const handoff = source.slice(source.indexOf("href={selenaAppRoutes.freeAiVisibility}"), source.indexOf("href={selenaAppRoutes.freeAiVisibility}") + 300);
  assert.ok(!/report\.url|report\.finalUrl/.test(handoff), "handoff must not pass a report website");
});
