import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { shouldTrackExplanationView } from "@/lib/visibility/explanation/contract";

/**
 * `personalized_explanation_viewed` has to mean an explanation was really
 * put in front of the visitor. If it fires on the API response, on being
 * assigned to the variant arm, or on an empty result, the experiment's
 * headline metric silently counts people who saw nothing.
 */

const EVENT = "personalized_explanation_viewed";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

test("the view predicate is false unless at least one explanation exists", () => {
  assert.equal(shouldTrackExplanationView(null), false, "null must not count as viewed");
  assert.equal(shouldTrackExplanationView(undefined), false, "absent must not count as viewed");
  assert.equal(shouldTrackExplanationView([]), false, "an empty result must not count as viewed");
  assert.equal(
    shouldTrackExplanationView([{ findingId: "f-1", explanation: "Because booking is your goal." }]),
    true,
  );
});

test("the event fires only from the component that renders explanations", () => {
  const view = source("components/visibility/LiveReportView.tsx");
  assert.ok(view.includes(EVENT), "the rendering component must be where the event fires");
  assert.equal(view.split(EVENT).length - 1, 1, "the event must have exactly one call site");
});

test("the event does not fire when the API response arrives", () => {
  // The form owns the fetch. If the event name appears there, it is being
  // fired on a response rather than on something the visitor was shown.
  const form = source("components/visibility/VisibilityCheckForm.tsx");
  assert.ok(!form.includes(EVENT), "the event must not fire from the fetch/response path");
});

test("the event does not fire server-side on experiment assignment", () => {
  for (const path of [
    "app/api/checks/route.ts",
    "lib/visibility/explanation/resolveExplanation.ts",
    "lib/visibility/security/bucketing.ts",
  ]) {
    assert.ok(!source(path).includes(EVENT), `${path} must not fire a view event on assignment`);
  }
});

test("the call site is guarded by the render condition, not by the variant", () => {
  const view = source("components/visibility/LiveReportView.tsx");
  const guardIndex = view.indexOf("shouldTrackExplanationView");
  const eventIndex = view.indexOf(EVENT);
  assert.ok(guardIndex !== -1, "the render condition must come from the shared predicate");
  assert.ok(guardIndex < eventIndex, "the guard must be established before the event can fire");
  // A variant check at the call site would mean firing on assignment rather
  // than on what was rendered.
  assert.ok(
    !view.includes('variant === "personalized_explanation"'),
    "the view event must not be gated on the variant",
  );
});
