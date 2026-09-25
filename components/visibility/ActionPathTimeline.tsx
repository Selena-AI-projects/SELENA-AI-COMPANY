import type { ActionPathStep, EvidenceState } from "@/lib/visibility/measurement";
import type { VisibilityLocale } from "@/lib/visibility/types";
import { cn } from "@/lib/cn";

const STATE_LABEL: Record<VisibilityLocale, Record<EvidenceState, string>> = {
  en: {
    pass: "Completed",
    warn: "Partial",
    fail: "Blocked",
    info: "Info",
    not_measured: "Not measured",
  },
  ru: {
    pass: "Пройдено",
    warn: "Частично",
    fail: "Заблокировано",
    info: "Справка",
    not_measured: "Не измерено",
  },
};

const MARKER_CLASS: Record<EvidenceState, string> = {
  pass: "border-sage bg-sage/30",
  warn: "border-copper bg-copper/20",
  fail: "border-copper-deep bg-copper-deep/20",
  info: "border-line bg-surface",
  not_measured: "border-line bg-surface",
};

/**
 * The ordered action path (Codex Execution TZ V1.2, section E.5). Rendered
 * as an ordered list so the sequence survives without CSS and reads
 * correctly to a screen reader; each step states its own status in text.
 */
export function ActionPathTimeline({
  title,
  steps,
  locale = "en",
}: {
  title: string;
  steps: ActionPathStep[];
  locale?: VisibilityLocale;
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-copper-deep">{title}</h4>
      <ol className="mt-5 space-y-4">
        {steps.map((step, index) => (
          <li key={step.id} className="flex gap-4">
            <div className="flex flex-col items-center" aria-hidden>
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold text-ink",
                  MARKER_CLASS[step.state],
                )}
              >
                {index + 1}
              </span>
              {index < steps.length - 1 ? <span className="mt-1 w-px flex-1 bg-line" /> : null}
            </div>
            <div className="pb-1">
              <p className="font-medium text-ink">
                {step.label}{" "}
                <span className="text-sm font-normal text-muted">— {STATE_LABEL[locale][step.state]}</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{step.note}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
