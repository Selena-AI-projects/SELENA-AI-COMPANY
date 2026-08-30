/**
 * Event taxonomy (SSOT §16.1). `track()` is a stub until an analytics
 * provider and consent class are chosen (Decision Log D-018,
 * NEEDS_OWNER) — it never calls an external endpoint on its own.
 */

export const EVENT_NAMES = [
  // Public SEO / growth measurement contract (T-10). These names are
  // intentionally provider-neutral until an owner-approved analytics stack
  // and consent configuration exist.
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
] as const;

export type EventName = (typeof EVENT_NAMES)[number];
export type ConsentClass = "transactional" | "marketing" | "anonymous_product";

export const PUBLIC_EVENT_NAMES = [
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
 * No provider is configured yet (D-018). Server-side callers should still
 * call this so instrumentation sites exist and are easy to wire up later
 * — it intentionally does not throw, log PII, or call any network host.
 */
export function track(event: DiagnosticEvent): void {
  const safeEvent = { ...event, properties: safeProperties(event.properties) };
  if (process.env.NODE_ENV !== "production") {
    console.debug("[diagnostics:event]", safeEvent.eventName, safeEvent.consentClass);
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
