import {
  type MeasurementDetail,
  citedDomains,
  isApiChannel,
  systemLabel,
  systemTotals,
} from "@/lib/visibility-log/measurement-detail";
import { formatDate } from "@/lib/visibility-log/data";

/**
 * The whole measurement in one look, and every answer one click below it.
 *
 * The question is written once. An earlier version drew the grid and then
 * repeated all twenty-five questions underneath to carry the detail, which
 * made the page twice as long and said the same thing twice; the row now
 * opens in place instead.
 *
 * Marks rather than numbers: each question is asked of each system once, so
 * the answer is not a quantity, and two hundred digits are a wall nobody
 * reads. The three states differ in shape as well as colour, so the table
 * survives a colourblind reader and a bad screen.
 */

const marks = {
  named: {
    label: "назвали",
    node: <span className="inline-block size-2.5 rounded-full bg-copper ring-2 ring-copper/35" />,
  },
  missed: {
    label: "не назвали",
    node: <span className="inline-block size-2.5 rounded-full border border-ivory/45" />,
  },
  silent: {
    label: "ответа не было",
    node: <span className="inline-block h-px w-3 bg-ivory/45" />,
  },
} as const;

function cellState(mentioned: boolean | null, answered: boolean): keyof typeof marks {
  if (!answered || mentioned === null) return "silent";
  return mentioned ? "named" : "missed";
}

export function MeasurementGrid({
  detail,
  number,
  ownDomain,
}: {
  detail: MeasurementDetail;
  number: number;
  /** The project's own site, so the list can say whether it is in there. */
  ownDomain?: string;
}) {
  const totals = systemTotals(detail);
  const sources = citedDomains(detail);
  const ownAnswers = ownDomain
    ? (sources.find((source) => source.domain === ownDomain)?.answers ?? 0)
    : null;
  const topAnswers = sources[0]?.answers ?? 0;
  const columns = `minmax(13rem, 1fr) repeat(${detail.systems.length}, 2.75rem)`;
  const minWidth = `${13 + detail.systems.length * 2.75}rem`;

  return (
    <div>
      <p className="text-sm font-semibold tracking-[0.18em] text-copper uppercase">
        Замер №{number} · {formatDate(detail.date)}
      </p>
      <h2 className="mt-4 text-h2 text-ivory">Каждый вопрос, каждая система</h2>
      <p className="mt-5 max-w-3xl leading-relaxed text-ivory/75">
        {detail.questions.length} вопросов, {detail.systems.length} систем, каждый
        вопрос задан каждой системе один раз.{" "}
        <strong className="font-semibold text-ivory">Откройте строку</strong> — под
        ней будет видно по каждой системе: назвали вас или нет, кого назвали
        вместо и на какие источники сослались.
      </p>

      <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ivory/75">
        {(["named", "missed", "silent"] as const).map((key) => (
          <li key={key} className="flex items-center gap-2.5">
            <span className="flex w-4 justify-center">{marks[key].node}</span>
            <span>{marks[key].label}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ivory/55">
        Прочерк — это не ноль. Он значит, что ответ не вернулся: молчание
        поставщика мы не записываем как молчание AI.
      </p>

      <div className="mt-9 overflow-x-auto">
        <div style={{ minWidth }}>
          <div
            className="grid items-end gap-x-1 border-b border-line-dark pb-3 text-xs text-ivory/60 uppercase"
            style={{ gridTemplateColumns: columns }}
          >
            <span className="font-semibold">Вопрос</span>
            {detail.systems.map((system) => (
              <span
                key={system.systemId}
                className="[writing-mode:vertical-rl] rotate-180 justify-self-center font-semibold whitespace-nowrap"
              >
                {systemLabel(system.systemId)}
              </span>
            ))}
          </div>

          {detail.questions.map((question, index) => (
            <details key={question.text} className="group border-b border-line-dark/50">
              <summary
                className="grid cursor-pointer list-none items-center gap-x-1 py-3.5 transition-colors hover:bg-ivory/5"
                style={{ gridTemplateColumns: columns }}
              >
                <span className="pr-3 text-sm text-ivory/90 group-open:text-ivory">
                  <span className="mr-2 text-ivory/40 tabular-nums">{index + 1}</span>
                  {question.text}
                </span>
                {detail.systems.map((system) => {
                  const cell = question.cells.find((c) => c.systemId === system.systemId);
                  const state = cellState(cell?.mentioned ?? null, cell?.answered ?? false);
                  return (
                    <span key={system.systemId} className="flex justify-center">
                      {marks[state].node}
                      <span className="sr-only">
                        {systemLabel(system.systemId)} — {marks[state].label}
                      </span>
                    </span>
                  );
                })}
              </summary>

              <div className="grid gap-px bg-line-dark/40 pb-4">
                {detail.systems.map((system) => {
                  const cell = question.cells.find((c) => c.systemId === system.systemId);
                  const state = cellState(cell?.mentioned ?? null, cell?.answered ?? false);
                  const instead = cell?.namedInstead ?? [];
                  const sources = cell?.citedDomains ?? [];
                  const isApi = isApiChannel(detail, system.systemId);
                  return (
                    <div
                      key={system.systemId}
                      className="grid gap-x-6 gap-y-1 bg-charcoal px-3 py-3 text-sm sm:grid-cols-[9rem_1fr]"
                    >
                      <p className="flex items-center gap-2.5 font-semibold text-ivory">
                        <span className="flex w-4 justify-center">{marks[state].node}</span>
                        {systemLabel(system.systemId)}
                      </p>
                      <div className="text-ivory/75">
                        <p>{marks[state].label}</p>
                        {state !== "silent" ? (
                          <>
                            {instead.length > 0 ? (
                              <p className="mt-1">
                                <span className="text-ivory/50">Вместо вас: </span>
                                {instead.join(", ")}
                              </p>
                            ) : null}
                            <p className="mt-1">
                              <span className="text-ivory/50">Источники: </span>
                              {sources.length > 0
                                ? sources.join(", ")
                                : isApi
                                  ? "их нет — это ответ из памяти модели, без веб-поиска"
                                  : "ответ не показал ни одной ссылки"}
                            </p>
                          </>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>
          ))}

          <div
            className="grid gap-x-1 border-t-2 border-line-dark py-4 text-sm"
            style={{ gridTemplateColumns: columns }}
          >
            <span className="font-semibold text-ivory">Назвали</span>
            {totals.map((total) => (
              <span
                key={total.systemId}
                className={`justify-self-center text-center text-xs font-semibold tabular-nums ${
                  total.mentioned > 0 ? "text-copper" : "text-ivory/60"
                }`}
              >
                {total.answered === 0 ? "—" : `${total.mentioned}/${total.answered}`}
              </span>
            ))}
          </div>
        </div>
      </div>

      {sources.length > 0 ? (
        <div className="mt-16">
          <h3 className="text-h3 text-ivory">Откуда AI берёт ответы</h3>
          <p className="mt-4 max-w-3xl leading-relaxed text-ivory/75">
            Модель не придумывает рекомендацию — она пересказывает то, что уже
            написано на нескольких страницах. Вот эти страницы. Всего{" "}
            {sources.length} сайтов; показаны те, на которые сослались чаще всего.
          </p>
          {ownDomain ? (
            <p className="mt-4 max-w-3xl leading-relaxed text-ivory">
              Ваш сайт <span className="font-semibold">{ownDomain}</span> —{" "}
              {ownAnswers === 0 ? (
                <span className="font-semibold text-copper">ни одного ответа</span>
              ) : (
                <span className="font-semibold text-copper">
                  {ownAnswers} {ownAnswers === 1 ? "ответ" : "ответов"}
                </span>
              )}
              . Чтобы вас называли, надо попасть туда, куда смотрят машины.
            </p>
          ) : null}
          <ul className="mt-8 space-y-2.5">
            {sources.slice(0, 12).map((source) => {
              const own = source.domain === ownDomain;
              return (
                <li key={source.domain} className="grid grid-cols-[1fr_auto] items-center gap-4">
                  <span className="grid grid-cols-[minmax(9rem,14rem)_1fr] items-center gap-4">
                    <span className={own ? "font-semibold text-copper" : "text-ivory/90"}>
                      {source.domain}
                    </span>
                    <span aria-hidden className="hidden h-1.5 rounded-full bg-ivory/10 sm:block">
                      <span
                        className={`block h-full rounded-full ${own ? "bg-copper" : "bg-ivory/35"}`}
                        style={{ width: `${Math.round((source.answers / topAnswers) * 100)}%` }}
                      />
                    </span>
                  </span>
                  <span className="text-sm tabular-nums text-ivory/60">
                    {source.answers}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
