import type { ActionReadinessState, EvidenceState } from "@/lib/visibility/measurement";
import type { VisibilityLocale } from "@/lib/visibility/types";
import { Card } from "@/components/ui/Card";
import { SourceBadge } from "./EvidenceList";
import { cn } from "@/lib/cn";

const STATE_LABEL: Record<VisibilityLocale, Record<EvidenceState, string>> = {
  en: {
    pass: "Met",
    warn: "Partial",
    fail: "Not met",
    info: "Info",
    not_measured: "Not measured",
  },
  ru: {
    pass: "Выполнено",
    warn: "Частично",
    fail: "Не выполнено",
    info: "Справка",
    not_measured: "Не измерено",
  },
};

const DOES_NOT_PROVE_LABEL: Record<VisibilityLocale, string> = {
  en: "Does not prove: ",
  ru: "Не доказывает: ",
};

const STATE_CLASS: Record<EvidenceState, string> = {
  pass: "border-sage/40 bg-sage/15 text-[#5f6b52]",
  warn: "border-copper/35 bg-copper/10 text-copper-deep",
  fail: "border-copper-deep/40 bg-copper-deep/10 text-copper-deep",
  info: "border-line bg-surface text-muted",
  not_measured: "border-line bg-surface text-muted",
};

/**
 * One Action Readiness state (Codex Execution TZ V1.2, decisions 12–13).
 * `doesNotProve` is rendered unconditionally — the whole point of
 * splitting these three states is that each one is routinely mistaken
 * for the others.
 */
export function ActionReadinessCard({
  state,
  locale = "en",
}: {
  state: ActionReadinessState;
  locale?: VisibilityLocale;
}) {
  return (
    <Card hover={false} className="h-full">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-serif text-lg font-semibold text-ink">{state.label}</h3>
        <div className="flex items-center gap-2">
          <SourceBadge sourceStatus={state.sourceStatus} locale={locale} />
          <span
            className={cn("rounded-full border px-2.5 py-0.5 text-base font-semibold", STATE_CLASS[state.state])}
          >
            {STATE_LABEL[locale][state.state]}
          </span>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink/80">{state.definition}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted">{state.finding}</p>
      <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-muted">
        {DOES_NOT_PROVE_LABEL[locale]}{state.doesNotProve}
      </p>
    </Card>
  );
}
