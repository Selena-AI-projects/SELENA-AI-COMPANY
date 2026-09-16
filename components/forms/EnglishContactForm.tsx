"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  createIdempotencyKey,
  formatLeadFallbackMessage,
  getLeadSubmitErrorMessage,
  submitLead,
} from "@/lib/leads";
import { createWhatsappHref } from "@/lib/site";
import { trackPublicEvent } from "@/lib/diagnostics/analytics";

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink placeholder:text-muted transition-colors focus:border-copper";

const labelCls = "mb-1.5 block text-sm font-medium text-ink";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm font-medium text-copper-deep">
      {message}
    </p>
  );
}

export function EnglishContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [fallbackHref, setFallbackHref] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  useEffect(() => {
    trackPublicEvent("form_view", { form_id: "contact_brief_en" });
  }, []);

  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    trackPublicEvent("form_start", { form_id: "contact_brief_en" });
    const form = event.currentTarget;
    const data = new FormData(form);
    const field = (name: string) => String(data.get(name) ?? "").trim();

    const next: Record<string, string> = {};
    if (!field("name")) next.name = "Please add your name.";
    if (!field("contact")) next.contact = "Please add an email, Telegram or WhatsApp contact.";
    if (!field("challenge")) next.challenge = "Describe the process or bottleneck you want to improve.";
    if (!data.get("consent")) next.consent = "Consent is required to process and answer your request.";

    setErrors(next);
    if (Object.keys(next).length > 0) {
      trackPublicEvent("form_error", {
        form_id: "contact_brief_en",
        field: Object.keys(next)[0] ?? "unknown",
        error_type: "validation",
      });
    }
    setSubmitError("");
    setFallbackHref(null);

    const firstInvalid = ["name", "contact", "challenge", "consent"].find((key) => next[key]);
    if (firstInvalid) {
      const element = form.elements.namedItem(firstInvalid);
      if (element instanceof HTMLElement) element.focus();
      return;
    }

    const leadFields = {
      name: field("name"),
      contact: field("contact"),
      business: field("business"),
      task: field("challenge"),
      tools: field("tools"),
      comment: field("comment"),
    };
    const fallbackMessage = formatLeadFallbackMessage("Selena Systems English inquiry", {
      Name: leadFields.name,
      Contact: leadFields.contact,
      Business: leadFields.business,
      Challenge: leadFields.task,
      Tools: leadFields.tools,
      Notes: leadFields.comment,
    });

    setIsSubmitting(true);
    try {
      const idempotencyKey =
        idempotencyKeyRef.current ??
        (idempotencyKeyRef.current = createIdempotencyKey());
      await submitLead({
        type: "contact_brief",
        consent: true,
        idempotencyKey,
        honeypot: field("website"),
        fields: leadFields,
      });
      trackPublicEvent("form_submit_success", {
        form_id: "contact_brief_en",
        product_line: "ai-systems",
      }, "transactional");
      setSubmitted(true);
    } catch (error) {
      trackPublicEvent("form_submit_error", {
        form_id: "contact_brief_en",
        error_type: error instanceof Error ? error.name : "unknown",
      }, "transactional");
      setSubmitError(getLeadSubmitErrorMessage(error, "en"));
      setFallbackHref(createWhatsappHref(fallbackMessage));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div ref={successRef} tabIndex={-1} className="card-premium p-8 sm:p-10">
        <p className="font-serif text-h3 text-ink">Brief received</p>
        <p className="mt-4 leading-relaxed text-muted">
          Thank you. I will review the process, prepare the first questions or a
          proposed format, and reply through the contact you provided.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card-premium p-6 sm:p-8">
      <h2 className="text-h3 text-ink">Tell me what is slowing the business down</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        No technical language needed. A plain description of the process is enough.
      </p>

      <input
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
      />

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="en-name" className={labelCls}>
            Name <span aria-hidden="true" className="text-copper-deep">*</span>
          </label>
          <input
            id="en-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "en-name-error" : undefined}
            className={cn(inputCls, errors.name && "border-copper")}
          />
          <FieldError id="en-name-error" message={errors.name} />
        </div>

        <div>
          <label htmlFor="en-contact" className={labelCls}>
            Email / Telegram / WhatsApp{" "}
            <span aria-hidden="true" className="text-copper-deep">*</span>
          </label>
          <input
            id="en-contact"
            name="contact"
            type="text"
            required
            placeholder="email or @username"
            aria-invalid={errors.contact ? true : undefined}
            aria-describedby={errors.contact ? "en-contact-error" : undefined}
            className={cn(inputCls, errors.contact && "border-copper")}
          />
          <FieldError id="en-contact-error" message={errors.contact} />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="en-business" className={labelCls}>
          What kind of business is it?
        </label>
        <input
          id="en-business"
          name="business"
          type="text"
          placeholder="Services, education, consulting, local business..."
          className={inputCls}
        />
      </div>

      <div className="mt-5">
        <label htmlFor="en-challenge" className={labelCls}>
          Which process should we look at first?{" "}
          <span aria-hidden="true" className="text-copper-deep">*</span>
        </label>
        <textarea
          id="en-challenge"
          name="challenge"
          rows={4}
          required
          placeholder="Requests, client replies, content, CRM, documents, team routines..."
          aria-invalid={errors.challenge ? true : undefined}
          aria-describedby={errors.challenge ? "en-challenge-error" : undefined}
          className={cn(inputCls, "resize-y", errors.challenge && "border-copper")}
        />
        <FieldError id="en-challenge-error" message={errors.challenge} />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="en-tools" className={labelCls}>
            Current tools
          </label>
          <input
            id="en-tools"
            name="tools"
            type="text"
            placeholder="Telegram, WhatsApp, Notion, CRM, sheets..."
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="en-comment" className={labelCls}>
            Notes
          </label>
          <input id="en-comment" name="comment" type="text" className={inputCls} />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-start gap-3">
          <input
            id="en-consent"
            name="consent"
            type="checkbox"
            required
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "en-consent-error" : undefined}
            className="mt-1 h-5 w-5 shrink-0 rounded border-line accent-copper"
          />
          <label htmlFor="en-consent" className="text-sm leading-relaxed text-muted">
            I agree that my data may be processed to answer this request. Details:{" "}
            <Link
              href="/en/privacy"
              className="font-medium text-link underline decoration-link/45 underline-offset-2 hover:decoration-link"
            >
              privacy policy
            </Link>
            .
          </label>
        </div>
        <FieldError id="en-consent-error" message={errors.consent} />
      </div>

      {submitError ? (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-copper/35 bg-copper/10 p-4 text-sm text-copper-deep"
        >
          <p className="font-medium">{submitError}</p>
          {fallbackHref ? (
            <a
              href={fallbackHref}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackPublicEvent("whatsapp_click", {
                placement: "contact_fallback",
                product_line: "ai-systems",
                locale: "en",
              }, "transactional")}
              className="mt-3 inline-flex rounded-full bg-copper px-4 py-2 font-medium text-surface transition-colors hover:bg-copper-deep"
            >
              Send in WhatsApp
            </a>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-copper-deep px-8 py-4 text-base font-medium text-surface shadow-[0_10px_24px_-12px_rgba(185,130,91,0.65)] transition-all duration-300 hover:-translate-y-px hover:bg-copper-deeper disabled:cursor-wait disabled:opacity-70 sm:w-auto"
      >
        {isSubmitting ? "Sending..." : "Send brief"}
      </button>
    </form>
  );
}
