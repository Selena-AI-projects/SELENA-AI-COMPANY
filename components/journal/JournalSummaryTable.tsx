import Link from "next/link";
import {
  clickRate,
  formatDate,
  journalMeta,
  stageLabels,
  type JournalProject,
} from "@/lib/visibility-log/data";
import { detailsFor, systemTotals } from "@/lib/visibility-log/measurement-detail";

/**
 * Every project in the journal as one table.
 *
 * The cards below say what happened on each project; this says what the
 * numbers are, side by side, so a reader can see the whole set at once —
 * including the rows that read zero. A zero is printed as a zero, never as a
 * dash: a dash reads as "no data" and would quietly hide the very result the
 * journal exists to publish. "Нет данных" is reserved for the project that
 * genuinely has none, and says why on the same line.
 */

/** The last AI-answer measurement, read from the same source the project page uses. */
function lastMeasurement(project: JournalProject) {
  const details = detailsFor(project.slug);
  const last = details[details.length - 1];
  if (last) {
    const mentions = systemTotals(last).reduce((total, system) => total + system.mentioned, 0);
    return { number: details.length, date: last.date, mentions };
  }
  const views = project.visitorViews ?? [];
  const view = views[views.length - 1];
  return view ? { number: views.length, date: view.date, mentions: view.brandMentions } : null;
}

/** Numbers align right so they compare down the column; labels align left. */
function Cell({
  value,
  note,
  muted,
  align = "right",
}: {
  value: string;
  note?: string;
  muted?: boolean;
  align?: "right" | "left";
}) {
  return (
    <td
      className={`border-t border-line px-4 py-4 align-top tabular-nums ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      <span className={muted ? "text-muted" : "font-semibold text-ink"}>{value}</span>
      {note ? <span className="mt-0.5 block text-xs font-normal text-muted">{note}</span> : null}
    </td>
  );
}

export function JournalSummaryTable({ projects }: { projects: JournalProject[] }) {
  return (
    <figure className="mt-10 overflow-hidden rounded-xl border border-line bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-sm">
          <caption className="sr-only">
            Показатели поиска за {journalMeta.windowDays} дней и последний замер AI-ответов по каждому
            проекту журнала
          </caption>
          <thead>
            <tr className="bg-ivory text-left">
              <th scope="col" className="px-4 py-3 font-semibold text-ink">
                Проект
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-ink">
                Показы
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-ink">
                Клики
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-ink">
                Доля кликов
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-ink">
                Последний замер AI
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-ink">
                Ступень
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const metrics = project.metrics;
              const rate = metrics ? clickRate(metrics) : null;
              const measurement = lastMeasurement(project);
              const latest = project.entries[project.entries.length - 1];

              return (
                <tr key={project.slug} className="transition-colors hover:bg-ivory/70">
                  <td className="border-t border-line px-4 py-4 align-top">
                    <Link
                      href={`/ru/projects/${project.slug}`}
                      className="font-semibold text-link underline decoration-link/40 underline-offset-2 transition-colors hover:text-ink"
                    >
                      {project.name}
                    </Link>
                    <span className="mt-0.5 block text-xs text-muted">
                      {project.publishedByPermission ? "не наш · с разрешения владельца" : project.category}
                    </span>
                  </td>

                  {metrics ? (
                    <>
                      <Cell
                        value={metrics.impressions.toLocaleString("ru-RU")}
                        note={
                          metrics.previousImpressions === null
                            ? undefined
                            : `было ${metrics.previousImpressions.toLocaleString("ru-RU")}`
                        }
                      />
                      <Cell
                        value={String(metrics.clicks)}
                        note={metrics.previousClicks === null ? undefined : `было ${metrics.previousClicks}`}
                      />
                      <Cell value={rate === null ? "0%" : `${rate}%`} />
                    </>
                  ) : (
                    <td className="border-t border-line px-4 py-4 text-right align-top text-muted" colSpan={3}>
                      нет данных
                      <span className="mt-0.5 block text-xs">
                        Search Console — это доступ к сайту, брать его ради замера незачем
                      </span>
                    </td>
                  )}

                  <Cell
                    value={measurement ? `№${measurement.number}` : "—"}
                    note={
                      measurement
                        ? `${formatDate(measurement.date)} · ${
                            measurement.mentions === 0 ? "бренд не назван" : `назван ${measurement.mentions}×`
                          }`
                        : "замер не проводился"
                    }
                    muted={!measurement}
                  />

                  <Cell
                    value={latest ? stageLabels[latest.stage] : "—"}
                    note={latest ? formatDate(latest.date) : undefined}
                    muted
                    align="left"
                  />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <figcaption className="border-t border-line bg-ivory px-4 py-3 text-xs leading-relaxed text-muted">
        Поиск: {journalMeta.source}, окно {journalMeta.windowDays} дней, данные сняты{" "}
        {formatDate(journalMeta.measuredAt)}. «Было» — то же окно, сдвинутое на {journalMeta.windowDays} дней
        назад. Замеры AI-ответов — отдельные события со своей датой; они не связаны с окном поиска.
      </figcaption>
    </figure>
  );
}
