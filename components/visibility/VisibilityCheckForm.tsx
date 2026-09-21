"use client";

import { useEffect, useState } from "react";
import type { CheckFormCopy, LiveReportCopy, SiteProfile, VisibilityLocale } from "@/lib/visibility/types";
import type { LiveReport } from "@/lib/visibility/liveReport";
import { PRIMARY_ACTIONS } from "@/lib/visibility/measurement";
import { LiveReportView, type ReadinessComparison } from "./LiveReportView";
import { cn } from "@/lib/cn";
import { trackPublicEvent } from "@/lib/diagnostics/analytics";
import type { FindingExplanation } from "@/lib/visibility/explanation/contract";

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink placeholder:text-muted transition-colors focus:border-copper";
const labelCls = "mb-1.5 block text-sm font-medium text-ink";
const hintCls = "mt-1.5 text-sm leading-relaxed text-muted";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm font-medium text-copper-deep">
      {message}
    </p>
  );
}

type CheckResponse = {
  ok?: boolean;
  error?: string;
  remainingChecks?: number;
  report?: LiveReport;
  /** Present only for the personalized-explanation experiment arm; absent
   * or null otherwise (flag off, control arm, or the LLM call failed) —
   * the report itself never depends on any of this (Decision Log D-023). */
  variant?: "control" | "personalized_explanation";
  explanation?: FindingExplanation[] | null;
};

const SITE_PROFILES: SiteProfile[] = ["all_checks", "content_site", "api_application", "commerce"];

/**
 * Free Visibility Check — the visitor gets a real result on this page.
 *
 * Submitting runs an actual check against the submitted site: our server
 * fetches up to five public pages and measures website readiness from what
 * is really there. It never calls a paid AI-answer provider and therefore
 * never presents observed mentions, citations or recommendations.
 *
 * The URL is the only required input. Profile and primary action are optional
 * context used to decide which checks apply; no contact, login or payment can
 * stand between the visitor and the complete result.
 */
export function VisibilityCheckForm({
  copy,
  reportCopy,
  locale,
}: {
  copy: CheckFormCopy;
  reportCopy: LiveReportCopy;
  locale: VisibilityLocale;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [report, setReport] = useState<LiveReport | null>(null);
  const [remainingChecks, setRemainingChecks] = useState<number | undefined>(undefined);
  const [baselineReport, setBaselineReport] = useState<LiveReport | null>(null);
  const [comparison, setComparison] = useState<ReadinessComparison | null>(null);
  const [lastRequest, setLastRequest] = useState<{ website: string; primaryAction: string; siteProfile: SiteProfile } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [explanation, setExplanation] = useState<FindingExplanation[] | null>(null);

  useEffect(() => {
    trackPublicEvent("form_view", { form_id: "public_readiness", locale });
  }, [locale]);

  function restart() {
    setReport(null);
    setSubmitError("");
    setErrors({});
    setBaselineReport(null);
    setComparison(null);
    setLastRequest(null);
    setIsVerifying(false);
    setVerificationError("");
    setExplanation(null);
  }

  async function requestReadiness(website: string, primaryAction: string, siteProfile: SiteProfile): Promise<CheckResponse> {
    const response = await fetch("/api/checks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ website, primaryAction, siteProfile, locale }),
    });
    const body = (await response.json().catch(() => null)) as CheckResponse | null;
    if (response.status === 429) throw new Error("RATE_LIMITED");
    if (!response.ok || body?.ok !== true || !body.report) throw new Error("CHECK_FAILED");
    return body;
  }

  async function verifyReadiness() {
    if (!baselineReport || !lastRequest || comparison || isVerifying) return;
    setIsVerifying(true);
    setVerificationError("");
    try {
      const body = await requestReadiness(lastRequest.website, lastRequest.primaryAction, lastRequest.siteProfile);
      const verified = body.report!;
      if (baselineReport.readiness.score === null || verified.readiness.score === null) {
        setVerificationError(reportCopy.errors.generic);
        return;
      }
      setReport(verified);
      setRemainingChecks(body.remainingChecks);
      setComparison({
        baselineScanId: baselineReport.id,
        verificationScanId: verified.id,
        baselineScore: baselineReport.readiness.score,
        verifiedScore: verified.readiness.score,
        delta: verified.readiness.score - baselineReport.readiness.score,
        aiVisibilityCompared: false,
      });
    } catch (error) {
      setVerificationError(error instanceof Error && error.message === "RATE_LIMITED"
        ? reportCopy.errors.rateLimited
        : reportCopy.errors.generic);
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    trackPublicEvent("form_start", { form_id: "public_readiness" });
    const form = event.currentTarget;
    const data = new FormData(form);
    const field = (name: string) => String(data.get(name) ?? "").trim();
    const next: Record<string, string> = {};

    if (!field("website")) next.website = copy.errors.website;
    setErrors(next);
    if (Object.keys(next).length > 0) {
      trackPublicEvent("form_error", {
        form_id: "public_readiness",
        field: Object.keys(next)[0] ?? "unknown",
        error_type: "validation",
      });
    }
    setSubmitError("");

    const firstInvalid = ["website"].find((key) => next[key]);
    if (firstInvalid) {
      const element = form.elements.namedItem(firstInvalid);
      if (element instanceof HTMLElement) element.focus();
      return;
    }

    const website = field("website");
    const primaryAction = field("primaryAction") || "other";
    const requestedProfile = field("siteProfile") as SiteProfile;
    const siteProfile = SITE_PROFILES.includes(requestedProfile) ? requestedProfile : "all_checks";

    setIsRunning(true);
    trackPublicEvent("readiness_start", { locale });
    try {
      const body = await requestReadiness(website, primaryAction, siteProfile);
      setReport(body.report!);
      setBaselineReport(body.report!);
      setLastRequest({ website, primaryAction, siteProfile });
      setRemainingChecks(body.remainingChecks);
      setExplanation(body.explanation ?? null);
      // Business context rides on the event that marks a genuinely completed
      // step, rather than inventing a "context completed" moment this
      // single-step form does not have. Both values are the visitor's own
      // selections from a fixed option list — never free text, never PII.
      trackPublicEvent("readiness_complete", {
        locale,
        result_class: body.report?.readiness.score === null ? "not_measured" : "measured",
        site_profile: siteProfile,
        primary_action: primaryAction,
      });
    } catch (error) {
      trackPublicEvent("form_submit_error", {
        form_id: "public_readiness",
        error_type: error instanceof Error ? error.message : "unknown",
      });
      setSubmitError(error instanceof Error && error.message === "RATE_LIMITED"
        ? reportCopy.errors.rateLimited
        : copy.networkError);
    }

    setIsRunning(false);
  }

  if (report) {
    return (
      <LiveReportView
        report={report}
        copy={reportCopy}
        remainingChecks={remainingChecks}
        comparison={comparison}
        isVerifying={isVerifying}
        verificationError={verificationError}
        onVerify={comparison ? undefined : verifyReadiness}
        onRestart={restart}
        explanation={explanation}
      />
    );
  }

  if (isRunning) {
    return (
      <div className="card-premium p-8 sm:p-10" role="status" aria-live="polite">
        <p className="font-serif text-h3 text-ink">{reportCopy.running.heading}</p>
        <ul className="mt-6 grid gap-2.5">
          {reportCopy.running.steps.map((step) => (
            <li key={step} className="flex items-start gap-3 leading-relaxed text-muted">
              <span aria-hidden="true" className="mt-1 text-copper">
                ·
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
        <div className="mt-7 h-1 overflow-hidden rounded-full bg-line">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-copper" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card-premium p-6 sm:p-8">
      <h2 className="text-h3 text-ink">{copy.formTitle}</h2>
      <p className="mt-2 leading-relaxed text-muted">{copy.formIntro}</p>

      <div className="mt-7 space-y-6">
        <div>
          <label htmlFor="check-website" className={labelCls}>
            {copy.fields.website} <span aria-hidden="true" className="text-copper-deep">*</span>
          </label>
          <input
            id="check-website"
            name="website"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="https://example.com"
            required
            aria-invalid={errors.website ? true : undefined}
            aria-describedby={errors.website ? "check-website-error" : "check-website-hint"}
            className={cn(inputCls, errors.website && "border-copper")}
          />
          <p id="check-website-hint" className={hintCls}>
            {copy.fields.websiteHint}
          </p>
          <FieldError id="check-website-error" message={errors.website} />
        </div>

        <div>
          <label htmlFor="check-site-profile" className={labelCls}>
            {copy.fields.siteProfile}
          </label>
          <select
            id="check-site-profile"
            name="siteProfile"
            defaultValue="all_checks"
            aria-describedby="check-site-profile-hint"
            className={inputCls}
          >
            {SITE_PROFILES.map((profile) => (
              <option key={profile} value={profile}>{copy.profileOptions[profile]}</option>
            ))}
          </select>
          <p id="check-site-profile-hint" className={hintCls}>{copy.fields.siteProfileHint}</p>
        </div>

        <div>
          <label htmlFor="check-primary-action" className={labelCls}>
            {copy.fields.primaryAction}
          </label>
          <select
            id="check-primary-action"
            name="primaryAction"
            defaultValue="other"
            aria-describedby="check-primary-action-hint"
            className={inputCls}
          >
            {PRIMARY_ACTIONS.map((action) => (
              <option key={action} value={action}>
                {copy.primaryActionOptions[action]}
              </option>
            ))}
          </select>
          <p id="check-primary-action-hint" className={hintCls}>
            {copy.fields.primaryActionHint}
          </p>
        </div>
      </div>

      {submitError ? (
        <p role="alert" className="mt-6 leading-relaxed font-medium text-copper-deep">
          {submitError}
        </p>
      ) : null}

      <button
        type="submit"
        className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-copper-deep px-8 py-4 text-base font-medium text-surface shadow-[0_10px_24px_-12px_rgba(185,130,91,0.65)] transition-all duration-300 hover:-translate-y-px hover:bg-copper-deeper sm:w-auto"
      >
        {copy.submitLabel}
      </button>

      <div className="mt-8 border-t border-line pt-6">
        <h3 className="font-serif text-lg font-semibold text-ink">{copy.whatYouGet.heading}</h3>
        <ul className="mt-4 grid gap-2.5">
          {copy.whatYouGet.items.map((item) => (
            <li key={item} className="flex items-start gap-3 leading-relaxed text-muted">
              <span aria-hidden="true" className="mt-1 text-copper">
                →
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
}
