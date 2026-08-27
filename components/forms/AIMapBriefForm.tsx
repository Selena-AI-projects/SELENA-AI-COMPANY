"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import aiMap from "@/data/free-ai-map.json";
import { cn } from "@/lib/cn";
import {
  createIdempotencyKey,
  formatLeadFallbackMessage,
  getLeadSubmitErrorMessage,
  submitLead,
} from "@/lib/leads";
import { createWhatsappHref } from "@/lib/site";
import { trackPublicEvent } from "@/lib/diagnostics/analytics";

const TEAM_OPTIONS = ["Нет", "1–3 человека", "4–10 человек", "10+ человек"];

const PRIORITY_OPTIONS = [
  "Заявки и чаты",
  "Клиентские ответы",
  "Контент",
  "CRM / Notion / таблицы",
  "Командная работа",
  "Не знаю, нужна диагностика",
];

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

export function AIMapBriefForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [fallbackHref, setFallbackHref] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  useEffect(() => {
    trackPublicEvent("form_view", { form_id: "ai_map_brief" });
  }, []);

  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    trackPublicEvent("form_start", { form_id: "ai_map_brief" });
    const form = event.currentTarget;
    const data = new FormData(form);
    const field = (name: string) => String(data.get(name) ?? "").trim();
    const next: Record<string, string> = {};

    if (!field("name")) {
      next.name = "Напишите, как к вам обращаться.";
    }
    if (!field("contact")) {
      next.contact = "Оставьте Telegram, WhatsApp или email для ответа.";
    }
    if (!field("business")) {
      next.business = "Опишите, чем занимаетесь.";
    }
    if (!field("timeLoss")) {
      next.timeLoss = "Напишите, где сейчас уходит больше всего времени.";
    }
    if (!field("priority")) {
      next.priority = "Выберите, что хотите улучшить первым.";
    }
    if (!data.get("consent")) {
      next.consent = "Без согласия на обработку данных бриф принять нельзя.";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) {
      trackPublicEvent("form_error", {
        form_id: "ai_map_brief",
        field: Object.keys(next)[0] ?? "unknown",
        error_type: "validation",
      });
    }
    setSubmitError("");
    setFallbackHref(null);
    const firstInvalid = ["name", "contact", "business", "timeLoss", "priority", "consent"].find(
      (key) => next[key],
    );
    if (firstInvalid) {
      const element = form.elements.namedItem(firstInvalid);
      if (element instanceof HTMLElement) element.focus();
      return;
    }

    const leadFields = {
      name: field("name"),
      contact: field("contact"),
      business: field("business"),
      timeLoss: field("timeLoss"),
      tools: field("tools"),
      team: field("team"),
      priority: field("priority"),
      comment: field("comment"),
    };
    const fallbackMessage = formatLeadFallbackMessage("AI-карта возможностей", {
      Имя: leadFields.name,
      Контакт: leadFields.contact,
      Бизнес: leadFields.business,
      "Где уходит время": leadFields.timeLoss,
      Инструменты: leadFields.tools,
      Команда: leadFields.team,
      Приоритет: leadFields.priority,
      Комментарий: leadFields.comment,
    });

    setIsSubmitting(true);
    try {
      const idempotencyKey =
        idempotencyKeyRef.current ??
        (idempotencyKeyRef.current = createIdempotencyKey());
      await submitLead({
        type: "ai_map_brief",
        consent: true,
        idempotencyKey,
        honeypot: field("website"),
        fields: leadFields,
      });
      trackPublicEvent("form_submit_success", {
        form_id: "ai_map_brief",
        product_line: "ai-systems",
      }, "transactional");
      setSubmitted(true);
    } catch (error) {
      trackPublicEvent("form_submit_error", {
        form_id: "ai_map_brief",
        error_type: error instanceof Error ? error.name : "unknown",
      }, "transactional");
      setSubmitError(getLeadSubmitErrorMessage(error));
      setFallbackHref(createWhatsappHref(fallbackMessage));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div ref={successRef} tabIndex={-1} className="card-premium p-8 sm:p-10">
        <p className="font-serif text-h3 text-ink">Мини-бриф получен</p>
        <p className="mt-4 leading-relaxed text-muted">{aiMap.form.successMessage}</p>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Заявка ушла в канал обработки. Дальше я посмотрю контекст и вернусь с
          первыми точками применения AI.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card-premium p-6 sm:p-8">
      <h2 className="text-h3 text-ink">{aiMap.form.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Ответьте простыми словами. Нужна не техническая анкета, а контекст:
        где уходит время и что стоит проверить первым.
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
          <label htmlFor="map-name" className={labelCls}>
            Имя <span aria-hidden="true" className="text-copper-deep">*</span>
          </label>
          <input
            id="map-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "map-name-error" : undefined}
            className={cn(inputCls, errors.name && "border-copper")}
          />
          <FieldError id="map-name-error" message={errors.name} />
        </div>

        <div>
          <label htmlFor="map-contact" className={labelCls}>
            Контакт: Telegram / WhatsApp / email{" "}
            <span aria-hidden="true" className="text-copper-deep">*</span>
          </label>
          <input
            id="map-contact"
            name="contact"
            type="text"
            placeholder="@username или email"
            required
            aria-invalid={errors.contact ? true : undefined}
            aria-describedby={errors.contact ? "map-contact-error" : undefined}
            className={cn(inputCls, errors.contact && "border-copper")}
          />
          <FieldError id="map-contact-error" message={errors.contact} />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="map-business" className={labelCls}>
          Чем занимаетесь? <span aria-hidden="true" className="text-copper-deep">*</span>
        </label>
        <textarea
          id="map-business"
          name="business"
          rows={3}
          required
          placeholder="Например: сервисный бизнес, экспертные услуги, онлайн-обучение"
          aria-invalid={errors.business ? true : undefined}
          aria-describedby={errors.business ? "map-business-error" : undefined}
          className={cn(inputCls, "resize-y", errors.business && "border-copper")}
        />
        <FieldError id="map-business-error" message={errors.business} />
      </div>

      <div className="mt-5">
        <label htmlFor="map-time-loss" className={labelCls}>
          Где сейчас уходит больше всего времени?{" "}
          <span aria-hidden="true" className="text-copper-deep">*</span>
        </label>
        <textarea
          id="map-time-loss"
          name="timeLoss"
          rows={4}
          required
          placeholder="Заявки, FAQ, контент, таблицы, документы, команда..."
          aria-invalid={errors.timeLoss ? true : undefined}
          aria-describedby={errors.timeLoss ? "map-time-loss-error" : undefined}
          className={cn(inputCls, "resize-y", errors.timeLoss && "border-copper")}
        />
        <FieldError id="map-time-loss-error" message={errors.timeLoss} />
      </div>

      <div className="mt-5">
        <label htmlFor="map-tools" className={labelCls}>
          Какие инструменты уже используете?
        </label>
        <textarea
          id="map-tools"
          name="tools"
          rows={3}
          placeholder="Telegram, WhatsApp, Notion, CRM, Google-таблицы, Make/Zapier..."
          className={cn(inputCls, "resize-y")}
        />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="map-team" className={labelCls}>
            Есть ли команда?
          </label>
          <select id="map-team" name="team" defaultValue="" className={inputCls}>
            <option value="" disabled>
              Выберите вариант
            </option>
            {TEAM_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="map-priority" className={labelCls}>
            Что хотите улучшить первым?{" "}
            <span aria-hidden="true" className="text-copper-deep">*</span>
          </label>
          <select
            id="map-priority"
            name="priority"
            defaultValue=""
            required
            aria-invalid={errors.priority ? true : undefined}
            aria-describedby={errors.priority ? "map-priority-error" : undefined}
            className={cn(inputCls, errors.priority && "border-copper")}
          >
            <option value="" disabled>
              Выберите вариант
            </option>
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <FieldError id="map-priority-error" message={errors.priority} />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="map-comment" className={labelCls}>
          Комментарий
        </label>
        <textarea
          id="map-comment"
          name="comment"
          rows={3}
          className={cn(inputCls, "resize-y")}
        />
      </div>

      <div className="mt-6">
        <div className="flex items-start gap-3">
          <input
            id="map-consent"
            name="consent"
            type="checkbox"
            required
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "map-consent-error" : undefined}
            className="mt-1 h-5 w-5 shrink-0 rounded border-line accent-copper"
          />
          <label htmlFor="map-consent" className="text-sm leading-relaxed text-muted">
            Я согласна/согласен на обработку данных для ответа по заявке —{" "}
            <Link
              href="/privacy"
              className="font-medium text-link underline decoration-link/45 underline-offset-2 hover:decoration-link"
            >
              как обрабатываются данные
            </Link>
            .
          </label>
        </div>
        <FieldError id="map-consent-error" message={errors.consent} />
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
                placement: "ai_map_fallback",
                product_line: "ai-systems",
                locale: "ru",
              }, "transactional")}
              className="mt-3 inline-flex rounded-full bg-copper px-4 py-2 font-medium text-surface transition-colors hover:bg-copper-deep"
            >
              Отправить в WhatsApp
            </a>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-copper px-8 py-4 text-base font-medium text-surface shadow-[0_10px_24px_-12px_rgba(185,130,91,0.65)] transition-all duration-300 hover:-translate-y-px hover:bg-copper-deep disabled:cursor-wait disabled:opacity-70 sm:w-auto"
      >
        {isSubmitting ? "Отправляем..." : "Получить AI-карту возможностей"}
      </button>
    </form>
  );
}
