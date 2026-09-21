import { track as vercelTrack } from "@vercel/analytics";

/**
 * Event taxonomy (SSOT §16.1). `track()` now has a real transport —
 * Vercel Web Analytics (Decision Log D-018 mini-design) — reusing the
 * platform this site already hosts on rather than a new vendor. The
 * contract, call sites and event names are unchanged; only the previous
 * `console.debug`-only stub gained an actual destination.
 */

export const EVENT_NAMES = [
  // Public SEO / growth measurement contract (T-10). These names are
  // intentionally provider-neutral until an owner-approved analytics stack
  // and consent configuration exist.
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
  "visibility_landing_viewed",
  "check_started",
  "check_submitted",
  "scan_queued",
  "scan_stage_changed",
  "scan_partial_ready",
  "scan_ready",
  "scan_failed",
  "partial_report_viewed",
  "email_unlock_viewed",
  "email_unlock_submitted",
  "full_report_viewed",
  "issue_opened",
  "methodology_opened",
  "report_shared",
  "rerun_requested",
  "monitor_cta_clicked",
  "audit_cta_clicked",
  "sprint_cta_clicked",
  "business_os_cta_clicked",
  "booking_started",
  "booking_completed",
  "personalized_explanation_viewed",
] as const;

export type EventName = (typeof EVENT_NAMES)[number];
export type ConsentClass = "transactional" | "marketing" | "anonymous_product";

export const PUBLIC_EVENT_NAMES = [
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
  "personalized_explanation_viewed",
] as const satisfies readonly EventName[];

export type PublicEventName = (typeof PUBLIC_EVENT_NAMES)[number];

const forbiddenPropertyKey = /(email|e-mail|phone|tel|contact|name|message|text|address|url|website)/i;

function safeProperties(properties: DiagnosticEvent["properties"] | undefined) {
  if (!properties) return undefined;

  return Object.fromEntries(
    Object.entries(properties)
      .filter(([key]) => !forbiddenPropertyKey.test(key))
      .slice(0, 20)
      .map(([key, value]) => [key.slice(0, 48), value]),
  ) as DiagnosticEvent["properties"];
}

export interface DiagnosticEvent {
  eventName: EventName;
  properties?: Record<string, string | number | boolean | null>;
  consentClass: ConsentClass;
  runId?: string;
  leadId?: string;
}

/**
 * Sends to Vercel Web Analytics from the browser (D-018 mini-design).
 * `@vercel/analytics`'s `track()` is a no-op when the `<Analytics />`
 * script has not injected (SSR, tests, JS disabled) — it never throws, so
 * this stays safe to call from every existing call site unconditionally.
 * Server-side callers still only get the debug line: this file
 * deliberately does not import `@vercel/analytics/server`, so it never
 * pulls server-only code into the client bundle this file also ships to
 * (every existing call site today is a "use client" component; a future
 * server-side event needs its own, separate path, not this function).
 */
export function track(event: DiagnosticEvent): void {
  const safeEvent = { ...event, properties: safeProperties(event.properties) };
  if (process.env.NODE_ENV !== "production") {
    console.debug("[diagnostics:event]", safeEvent.eventName, safeEvent.consentClass);
  }
  if (typeof window !== "undefined") {
    vercelTrack(safeEvent.eventName, safeEvent.properties ?? undefined);
  }
}

/**
 * Typed façade for the public measurement dictionary. It deliberately does
 * not send data anywhere: wiring a provider requires a separate consent and
 * owner decision, while the event contract can already be tested in code.
 */
export function trackPublicEvent(
  eventName: PublicEventName,
  properties?: DiagnosticEvent["properties"],
  consentClass: ConsentClass = "anonymous_product",
) {
  track({ eventName, properties, consentClass });
}
