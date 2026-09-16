import assert from "node:assert/strict";
import test from "node:test";
import {
  EVENT_NAMES,
  PUBLIC_EVENT_NAMES,
  trackPublicEvent,
} from "@/lib/diagnostics/analytics";

test("public analytics dictionary contains the approved no-PII event names", () => {
  assert.deepEqual([...PUBLIC_EVENT_NAMES], [
    "visibility_cta_click",
    "visibility_section_view",
    "hero_view",
    "route_select",
    "pricing_view",
    "form_view",
    "form_start",
    "form_error",
    "form_submit_success",
    "form_submit_error",
    "whatsapp_click",
    "telegram_discussion_click",
    "readiness_start",
    "readiness_complete",
  ]);
  for (const eventName of PUBLIC_EVENT_NAMES) {
    assert.ok(EVENT_NAMES.includes(eventName));
    assert.doesNotThrow(() => trackPublicEvent(eventName, { route: "/check" }));
  }
});
