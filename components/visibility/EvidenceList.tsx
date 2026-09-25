import type { EvidenceRow, EvidenceState, SourceStatus } from "@/lib/visibility/measurement";
import type { VisibilityLocale } from "@/lib/visibility/types";
import { cn } from "@/lib/cn";

const STATE_LABEL: Record<VisibilityLocale, Record<EvidenceState, string>> = {
  en: {
    pass: "Pass",
    warn: "Warn",
    fail: "Fail",
    info: "Info",
    not_measured: "Not measured",
  },
  ru: {
    pass: "Пройдено",
    warn: "Внимание",
    fail: "Не пройдено",
    info: "Справка",
    not_measured: "Не измерено",
  },
};

/** English pages show the raw provenance token, as they always have. */
const SOURCE_LABEL_RU: Record<SourceStatus, string> = {
  sample: "пример",
  observed: "наблюдение",
  provider: "провайдер",
  derived: "вычислено",
  unavailable: "недоступно",
};

const LIMITATION_LABEL: Record<VisibilityLocale, string> = {
  en: "Limitation: ",
  ru: "Ограничение: ",
};

const STATE_CLASS: Record<EvidenceState, string> = {
  pass: "border-sage/40 bg-sage/15 text-[#5f6b52]",
  warn: "border-copper/35 bg-copper/10 text-copper-deep",
  fail: "border-copper-deep/40 bg-copper-deep/10 text-copper-deep",
  info: "border-line bg-surface text-muted",
  not_measured: "border-line bg-surface text-muted",
};

/**
 * Renders evidence rows with an explicit state and source badge. State is
 * never communicated by colour alone — every row carries a text label too
 * (WCAG: "no information by colour only", SSOT §17.3).
 */
export function SourceBadge({
  sourceStatus,
  locale = "en",
}: {
  sourceStatus: SourceStatus;
  locale?: VisibilityLocale;
}) {
  return (
    <span className="rounded-full border border-line px-2 py-0.5 text-base font-semibold uppercase tracking-wide text-muted">
      {locale === "ru" ? SOURCE_LABEL_RU[sourceStatus] : sourceStatus}
    </span>
  );
}

export function EvidenceList({ rows, locale = "en" }: { rows: EvidenceRow[]; locale?: VisibilityLocale }) {
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.label} className="rounded-xl border border-line bg-surface/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-ink">{row.label}</p>
            <div className="flex items-center gap-2">
              <SourceBadge sourceStatus={row.sourceStatus} locale={locale} />
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-base font-semibold",
                  STATE_CLASS[row.state],
                )}
              >
                {STATE_LABEL[locale][row.state]}
              </span>
            </div>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">{row.value}</p>
          {row.limitation ? (
            <p className="mt-2 border-t border-line pt-2 text-xs leading-relaxed text-muted">
              {LIMITATION_LABEL[locale]}{row.limitation}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
