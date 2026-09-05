import type { SampleVerificationLoopSection } from "@/lib/visibility/sample-report-data";
import type { ActionLifecycleStatus, TelegramDeliveryStatus } from "@/lib/visibility/measurement";
import { SourceBadge } from "./EvidenceList";
import { cn } from "@/lib/cn";

const STATUS_CLASS: Record<ActionLifecycleStatus, string> = {
  NEW: "border-line bg-surface text-muted",
  STILL_OPEN: "border-copper/35 bg-copper/10 text-copper-deep",
  NEEDS_RECHECK: "border-copper/35 bg-copper/10 text-copper-deep",
  VERIFIED: "border-sage/40 bg-sage/15 text-[#5f6b52]",
  CLOSED: "border-sage/40 bg-sage/15 text-[#5f6b52]",
};

const TELEGRAM_CLASS: Record<TelegramDeliveryStatus, string> = {
  DELIVERED: "border-sage/40 bg-sage/15 text-[#5f6b52]",
  RETRY_SCHEDULED: "border-copper/35 bg-copper/10 text-copper-deep",
  DELAY_NOTICE: "border-copper/35 bg-copper/10 text-copper-deep",
  UNBOUND: "border-copper-deep/40 bg-copper-deep/10 text-copper-deep",
  PAUSED: "border-line bg-surface text-muted",
};

function Pill({ label, className }: { label: string; className: string }) {
  return (
    <span className={cn("inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold", className)}>
      {label}
    </span>
  );
}

/**
 * The weekly report's action table and the digest's own delivery record.
 * Rendered from sample data on the Visibility page and inside the sample
 * report, so the two surfaces show the same rows. Every status is written
 * out in text: the pill colour is never the only carrier of meaning.
 */
export function VerificationLoopReport({ section }: { section: SampleVerificationLoopSection }) {
  const { columns, statusLabels, telegramStatusLabels, delivery } = section;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <SourceBadge sourceStatus="sample" />
        <span>{section.window.lock}</span>
      </div>
      <p className="mt-2 text-sm text-muted">
        {section.window.baseline} · {section.window.recheck}
      </p>

      <figure className="mt-6 overflow-hidden rounded-xl border border-line bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[64rem] border-collapse text-sm">
            <caption className="sr-only">{section.question}</caption>
            <thead>
              <tr className="bg-ivory text-left">
                {[
                  columns.action,
                  columns.owner,
                  columns.status,
                  columns.evidenceIds,
                  columns.recheck,
                  columns.before,
                  columns.after,
                  columns.telegram,
                ].map((label) => (
                  <th key={label} scope="col" className="px-4 py-3 align-bottom font-semibold text-ink">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row) => (
                <tr key={row.id}>
                  <td className="border-t border-line px-4 py-4 align-top">
                    <p className="font-medium text-ink">{row.action}</p>
                    <p className="mt-1 font-mono text-xs text-muted">{row.id}</p>
                  </td>
                  <td className="border-t border-line px-4 py-4 align-top text-ink/80">{row.owner}</td>
                  <td className="border-t border-line px-4 py-4 align-top">
                    <Pill label={statusLabels[row.status]} className={STATUS_CLASS[row.status]} />
                    <p className="mt-1 font-mono text-xs text-muted">{row.status}</p>
                  </td>
                  <td className="border-t border-line px-4 py-4 align-top">
                    <ul className="space-y-1 font-mono text-xs text-ink/80">
                      {row.evidenceIds.map((id) => (
                        <li key={id}>{id}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="border-t border-line px-4 py-4 align-top text-muted">{row.recheck}</td>
                  <td className="border-t border-line px-4 py-4 align-top text-ink/80">{row.before}</td>
                  <td className="border-t border-line px-4 py-4 align-top text-ink/80">{row.after}</td>
                  <td className="border-t border-line px-4 py-4 align-top">
                    <p className="font-medium text-ink">{row.telegram.digest}</p>
                    <Pill
                      label={telegramStatusLabels[row.telegram.status]}
                      className={cn("mt-1", TELEGRAM_CLASS[row.telegram.status])}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </figure>

      <div className="mt-6 rounded-xl border border-line bg-surface/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="font-medium text-ink">{delivery.heading}</h4>
          <Pill label={telegramStatusLabels[delivery.status]} className={TELEGRAM_CLASS[delivery.status]} />
        </div>
        <p className="mt-2 text-sm text-muted">{delivery.recipient}</p>
        <p className="mt-1 text-sm text-muted">{delivery.dueAt}</p>
        <ol className="mt-4 space-y-1.5 text-sm">
          {delivery.attempts.map((attempt) => (
            <li key={attempt.attempt} className="flex gap-3">
              <span className="w-28 shrink-0 whitespace-nowrap font-mono text-xs text-muted">
                #{attempt.attempt} · {attempt.at}
              </span>
              <span className="text-ink/80">{attempt.result}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-muted">{delivery.note}</p>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-muted">{section.disclosure}</p>
    </div>
  );
}
