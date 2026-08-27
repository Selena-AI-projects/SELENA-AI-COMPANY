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

/**
 * «Бриф на AI-задачу» — фронтенд-MVP по контракту (docs/12, TZ §11).
 * Валидация на клиенте, состояния ошибок, success-state, согласие на
 * обработку данных. Отправка идёт через /api/leads: Telegram/webhook
 * подключаются серверными env-переменными.
 */

const TEAM_OPTIONS = [
  "Работаю один/одна",
  "Команда 2–5",
  "Команда 6–15",
  "Больше 15",
];

const FORMAT_OPTIONS = [
  "Пока не знаю — разобрать задачу",
  "AI-аудит",
  "Обучение",
  "Автоматизация",
  "Контент-система",
  "AI-консьерж",
  "Другое",
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

export function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [fallbackHref, setFallbackHref] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  // После успешной отправки переводим фокус на карточку подтверждения:
  // сама форма (вместе с кнопкой) размонтируется, и без этого фокус
  // «падает» на <body>, а скринридер молчит.
  useEffect(() => {
    trackPublicEvent("form_view", { form_id: "contact_brief" });
  }, []);

  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    trackPublicEvent("form_start", { form_id: "contact_brief" });
    const form = event.currentTarget;
    const data = new FormData(form);
    const field = (name: string) => String(data.get(name) ?? "").trim();

    const next: Record<string, string> = {};
    if (!field("name")) {
      next.name = "Напишите, как к вам обращаться.";
    }
    if (!field("contact")) {
      next.contact = "Оставьте Telegram, WhatsApp или email — иначе не получится ответить.";
    }
    if (!field("task")) {
      next.task = "Опишите задачу хотя бы в паре предложений — простыми словами.";
    }
    if (!data.get("consent")) {
      next.consent = "Без согласия на обработку данных бриф принять нельзя.";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) {
      trackPublicEvent("form_error", {
        form_id: "contact_brief",
        field: Object.keys(next)[0] ?? "unknown",
        error_type: "validation",
      });
    }
    setSubmitError("");
    setFallbackHref(null);

    const firstInvalid = ["name", "contact", "task", "consent"].find((k) => next[k]);
    if (firstInvalid) {
      const el = form.elements.namedItem(firstInvalid);
      if (el instanceof HTMLElement) el.focus();
      return;
    }

    const leadFields = {
      name: field("name"),
      contact: field("contact"),
      business: field("business"),
      task: field("task"),
      broken: field("broken"),
      tools: field("tools"),
      team: field("team"),
      format: field("format"),
      comment: field("comment"),
    };
    const fallbackMessage = formatLeadFallbackMessage("Бриф на AI-задачу", {
      Имя: leadFields.name,
      Контакт: leadFields.contact,
      Бизнес: leadFields.business,
      Задача: leadFields.task,
      "Что не работает": leadFields.broken,
      Инструменты: leadFields.tools,
      Команда: leadFields.team,
      Формат: leadFields.format,
      Комментарий: leadFields.comment,
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
        form_id: "contact_brief",
        product_line: "ai-systems",
      }, "transactional");
      setSubmitted(true);
    } catch (error) {
      trackPublicEvent("form_submit_error", {
        form_id: "contact_brief",
        error_type: error instanceof Error ? error.name : "unknown",
      }, "transactional");
      setSubmitError(getLeadSubmitErrorMessage(error));
      setFallbackHref(createWhatsappHref(fallbackMessage));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      {/* Live-region смонтирован с первого рендера: условно вставленный
          элемент с role="status" скринридеры озвучивают ненадёжно. */}
      <p role="status" className="sr-only">
        {submitted
          ? "Бриф получен. Я разберу задачу и свяжусь с вами по указанному контакту."
          : ""}
      </p>

      {submitted ? (
        <div ref={successRef} tabIndex={-1} className="card-premium p-8 sm:p-10">
          <p className="font-serif text-h3 text-ink">Бриф получен</p>
          <p className="mt-4 leading-relaxed text-muted">
            Спасибо, что описали задачу. Дальше — короткий разбор: я посмотрю на
            процесс, подготовлю уточняющие вопросы или сразу предложу формат
            работы и свяжусь с вами по указанному контакту.
          </p>
          <p className="mt-4 text-sm text-muted">
            Каждый бриф разбирается вручную, без автоответов.
          </p>
        </div>
      ) : (
    <form onSubmit={handleSubmit} noValidate className="card-premium p-6 sm:p-8">
      <h2 className="text-h3 text-ink">Бриф на AI-задачу</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Не нужно технических терминов — опишите, как есть. Каждый бриф
        разбирается вручную.
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
          <label htmlFor="brief-name" className={labelCls}>
            Имя <span aria-hidden="true" className="text-copper-deep">*</span>
          </label>
          <input
            id="brief-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "brief-name-error" : undefined}
            className={cn(inputCls, errors.name && "border-copper")}
          />
          <FieldError id="brief-name-error" message={errors.name} />
        </div>

        <div>
          <label htmlFor="brief-contact" className={labelCls}>
            Контакт: Telegram / WhatsApp / email{" "}
            <span aria-hidden="true" className="text-copper-deep">*</span>
          </label>
          <input
            id="brief-contact"
            name="contact"
            type="text"
            placeholder="@username или email"
            required
            aria-invalid={errors.contact ? true : undefined}
            aria-describedby={errors.contact ? "brief-contact-error" : undefined}
            className={cn(inputCls, errors.contact && "border-copper")}
          />
          <FieldError id="brief-contact-error" message={errors.contact} />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="brief-business" className={labelCls}>
          Чем занимаетесь?
        </label>
        <input
          id="brief-business"
          name="business"
          type="text"
          placeholder="Например: студия массажа, онлайн-курсы, консалтинг"
          className={inputCls}
        />
      </div>

      <div className="mt-5">
        <label htmlFor="brief-task" className={labelCls}>
          Какая задача сейчас важнее всего?{" "}
          <span aria-hidden="true" className="text-copper-deep">*</span>
        </label>
        <textarea
          id="brief-task"
          name="task"
          rows={4}
          required
          aria-invalid={errors.task ? true : undefined}
          aria-describedby={errors.task ? "brief-task-error" : undefined}
          className={cn(inputCls, "resize-y", errors.task && "border-copper")}
        />
        <FieldError id="brief-task-error" message={errors.task} />
      </div>

      <div className="mt-5">
        <label htmlFor="brief-broken" className={labelCls}>
          Что сейчас не работает?
        </label>
        <textarea
          id="brief-broken"
          name="broken"
          rows={3}
          className={cn(inputCls, "resize-y")}
        />
      </div>

      <div className="mt-5">
        <label htmlFor="brief-tools" className={labelCls}>
          Какие инструменты уже используете?
        </label>
        <input
          id="brief-tools"
          name="tools"
          type="text"
          placeholder="Например: Telegram, Notion, CRM, таблицы"
          className={inputCls}
        />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="brief-team" className={labelCls}>
            Есть ли команда?
          </label>
          <select id="brief-team" name="team" defaultValue="" className={inputCls}>
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
          <label htmlFor="brief-format" className={labelCls}>
            Какой формат интересен?
          </label>
          <select id="brief-format" name="format" defaultValue="" className={inputCls}>
            <option value="" disabled>
              Выберите вариант
            </option>
            {FORMAT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="brief-comment" className={labelCls}>
          Комментарий
        </label>
        <textarea
          id="brief-comment"
          name="comment"
          rows={3}
          className={cn(inputCls, "resize-y")}
        />
      </div>

      <div className="mt-6">
        <div className="flex items-start gap-3">
          <input
            id="brief-consent"
            name="consent"
            type="checkbox"
            required
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "brief-consent-error" : undefined}
            className="mt-1 h-5 w-5 shrink-0 rounded border-line accent-copper"
          />
          <label htmlFor="brief-consent" className="text-sm leading-relaxed text-muted">
            Согласен(на) на обработку персональных данных для ответа на заявку —{" "}
            <Link
              href="/privacy"
              className="font-medium text-link underline decoration-link/45 underline-offset-2 hover:decoration-link"
            >
              как обрабатываются данные
            </Link>
            .
          </label>
        </div>
        <FieldError id="brief-consent-error" message={errors.consent} />
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
        className={cn(
          "mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-copper px-8 py-4 text-base font-medium text-surface shadow-[0_10px_24px_-12px_rgba(185,130,91,0.65)] transition-all duration-300 hover:-translate-y-px hover:bg-copper-deep disabled:cursor-wait disabled:opacity-70 sm:w-auto",
        )}
      >
        {isSubmitting ? "Отправляем..." : "Отправить бриф"}
      </button>
    </form>
      )}
    </div>
  );
}
