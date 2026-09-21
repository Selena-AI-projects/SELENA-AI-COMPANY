import { test } from "node:test";
import assert from "node:assert/strict";
import { trackPublicEvent } from "@/lib/diagnostics/analytics";

/**
 * Proves the transport end to end without deploying: our sanitizer runs,
 * and what survives it is what the real `@vercel/analytics` `track()`
 * forwards. The SDK dispatches custom events through `window.va`, so a
 * fake `window` with a spy captures exactly what would leave the browser.
 *
 * This is deliberately not a mock of the SDK — mocking it would only prove
 * our own code calls something. Driving the real SDK proves the payload
 * that actually reaches the wire carries no submitted contact details.
 */

type Captured = { event: string; payload: { name: string; data?: Record<string, unknown> } };

function withFakeBrowser(run: (captured: Captured[]) => void): void {
  const captured: Captured[] = [];
  const previousWindow = (globalThis as { window?: unknown }).window;

  (globalThis as { window?: unknown }).window = {
    va: (event: string, payload: Captured["payload"]) => {
      captured.push({ event, payload });
    },
  };

  try {
    run(captured);
  } finally {
    if (previousWindow === undefined) delete (globalThis as { window?: unknown }).window;
    else (globalThis as { window?: unknown }).window = previousWindow;
  }
}

test("experiment properties reach the transport intact", () => {
  withFakeBrowser((captured) => {
    trackPublicEvent("personalized_explanation_viewed", {
      experiment_id: "visibility_personalized_explanation_v1",
      variant: "personalized_explanation",
      audit_id: "f2b1c8e0",
      site_profile: "all_checks",
      primary_action: "book",
      finding_count: 3,
    });

    assert.equal(captured.length, 1, "exactly one event must reach the transport");
    const { event, payload } = captured[0]!;
    assert.equal(event, "event");
    assert.equal(payload.name, "personalized_explanation_viewed");
    assert.equal(payload.data?.experiment_id, "visibility_personalized_explanation_v1");
    assert.equal(payload.data?.variant, "personalized_explanation");
    assert.equal(payload.data?.audit_id, "f2b1c8e0");
    assert.equal(payload.data?.site_profile, "all_checks");
    assert.equal(payload.data?.primary_action, "book");
    assert.equal(payload.data?.finding_count, 3);
  });
});

test("submitted contact details never reach the transport", () => {
  withFakeBrowser((captured) => {
    trackPublicEvent("readiness_complete", {
      // Allowed, must survive.
      variant: "control",
      experiment_id: "visibility_personalized_explanation_v1",
      locale: "en",
      // Every one of these must be stripped before the SDK is called.
      email: "someone@example.com",
      name: "A Real Person",
      phone: "+1 555 0100",
      contact: "@telegram_handle",
      website: "https://a-visitors-site.example",
      url: "https://a-visitors-site.example/page",
      address: "1 Somewhere Street",
      message: "free text a visitor typed",
    });

    const data = captured[0]!.payload.data ?? {};
    const serialized = JSON.stringify(data);

    assert.equal(data.variant, "control");
    assert.equal(data.experiment_id, "visibility_personalized_explanation_v1");
    assert.equal(data.locale, "en");

    for (const forbidden of ["email", "name", "phone", "contact", "website", "url", "address", "message"]) {
      assert.equal(data[forbidden], undefined, `"${forbidden}" must not reach the transport`);
    }
    for (const value of [
      "someone@example.com",
      "A Real Person",
      "+1 555 0100",
      "@telegram_handle",
      "a-visitors-site.example",
      "1 Somewhere Street",
      "free text a visitor typed",
    ]) {
      assert.ok(!serialized.includes(value), `the value "${value}" must not reach the transport`);
    }
  });
});

test("nothing is sent from a server context, where there is no window", () => {
  const previousWindow = (globalThis as { window?: unknown }).window;
  delete (globalThis as { window?: unknown }).window;
  try {
    // The SDK throws outside production when called server-side; our guard
    // must stop us before reaching it.
    assert.doesNotThrow(() => {
      trackPublicEvent("readiness_complete", { variant: "control" });
    });
  } finally {
    if (previousWindow !== undefined) (globalThis as { window?: unknown }).window = previousWindow;
  }
});
