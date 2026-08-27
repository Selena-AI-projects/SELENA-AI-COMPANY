import {
  type MeasurementDetail,
  systemLabel,
  systemTotals,
} from "@/lib/visibility-log/measurement-detail";
import { formatDate } from "@/lib/visibility-log/data";

/**
 * The whole measurement in one look: every question against every system.
 *
 * Cells carry marks rather than numbers. Each question is asked of each system
 * once, so the answer is not a quantity — and two hundred digits are a wall
 * nobody reads, while two hundred marks are a picture. The shapes differ, not
 * only the colours, so the table survives a colourblind reader and a bad
 * screen: a filled dot, a hollow ring, and a dash are three different objects.
 */

const marks = {
  named: {
    label: "назвали",
    node: (
      <span className="inline-block size-2.5 rounded-full bg-copper ring-2 ring-copper/35" />
    ),
  },
  missed: {
    label: "не назвали",
    node: (
      <span className="inline-block size-2.5 rounded-full border border-ivory/45" />
    ),
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
}: {
  detail: MeasurementDetail;
  number: number;
}) {
  const totals = systemTotals(detail);
  const visitorCount = detail.systems.filter((system) => system.channel === "VISITOR").length;

  return (
    <div>
      <p className="text-sm font-semibold tracking-[0.18em] text-copper uppercase">
        Замер №{number} · {formatDate(detail.date)}
      </p>
      <h2 className="mt-4 text-h2 text-ivory">
        Каждый вопрос, каждая система
      </h2>
      <p className="mt-5 max-w-3xl leading-relaxed text-ivory/75">
        Слева — {detail.questions.length} вопросов, которые мы задали. Сверху —{" "}
        {detail.systems.length} систем, которым задавали. Каждый вопрос задан
        каждой системе один раз, поэтому в клетке не число, а ответ: назвали или
        нет.
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
        Прочерк — это не ноль. Он значит, что ответ не вернулся и спросить было
        не о чем: молчание поставщика мы не записываем как молчание AI.
      </p>

      <div className="mt-9 overflow-x-auto">
        <table className="w-full min-w-[44rem] border-collapse text-left">
          <caption className="sr-only">
            Результат замера №{number}: {detail.questions.length} вопросов против{" "}
            {detail.systems.length} AI-систем
          </caption>
          <thead>
            <tr className="text-xs text-ivory/60 uppercase">
              <th scope="col" className="sticky left-0 z-10 bg-charcoal py-3 pr-4 font-semibold">
                Вопрос
              </th>
              <th scope="colgroup" colSpan={visitorCount} className="border-b border-line-dark px-2 py-3 text-center font-semibold tracking-[0.14em]">
                Что видит человек
              </th>
              <th scope="colgroup" colSpan={detail.systems.length - visitorCount} className="border-b border-line-dark px-2 py-3 text-center font-semibold tracking-[0.14em]">
                Что модель знает сама
              </th>
            </tr>
            <tr className="border-b border-line-dark text-sm text-ivory/75">
              <th scope="col" className="sticky left-0 z-10 bg-charcoal py-3 pr-4 font-semibold">
                <span className="sr-only">Текст вопроса</span>
              </th>
              {detail.systems.map((system, index) => (
                <th
                  key={system.systemId}
                  scope="col"
                  className={`px-2 py-3 text-center font-semibold whitespace-nowrap ${
                    index === visitorCount ? "border-l border-line-dark" : ""
                  }`}
                >
                  {systemLabel(system.systemId)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {detail.questions.map((question) => (
              <tr key={question.text} className="border-b border-line-dark/50">
                <th
                  scope="row"
                  className="sticky left-0 z-10 max-w-[18rem] bg-charcoal py-3 pr-4 text-sm font-normal text-ivory/90"
                >
                  {question.text}
                </th>
                {detail.systems.map((system, index) => {
                  const cell = question.cells.find(
                    (candidate) => candidate.systemId === system.systemId,
                  );
                  const state = cellState(cell?.mentioned ?? null, cell?.answered ?? false);
                  return (
                    <td
                      key={system.systemId}
                      className={`px-2 py-3 text-center ${
                        index === visitorCount ? "border-l border-line-dark" : ""
                      }`}
                    >
                      <span className="flex justify-center" title={`${systemLabel(system.systemId)}: ${marks[state].label}`}>
                        {marks[state].node}
                        <span className="sr-only">
                          {systemLabel(system.systemId)} — {marks[state].label}
                        </span>
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-line-dark text-sm">
              <th scope="row" className="sticky left-0 z-10 bg-charcoal py-4 pr-4 text-left font-semibold text-ivory">
                Назвали
              </th>
              {totals.map((total, index) => (
                <td
                  key={total.systemId}
                  className={`px-2 py-4 text-center font-semibold whitespace-nowrap ${
                    index === visitorCount ? "border-l border-line-dark" : ""
                  } ${total.mentioned > 0 ? "text-copper" : "text-ivory/60"}`}
                >
                  {total.answered === 0 ? "—" : `${total.mentioned} из ${total.answered}`}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      <h3 className="mt-14 text-h3 text-ivory">Кого назвали вместо вас</h3>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ivory/60">
        По каждому вопросу отдельно. Это и есть разговор: не «вас плохо видно», а
        «на этом вопросе вы проигрываете вот этому месту».
      </p>
      <div className="mt-7 divide-y divide-line-dark/50 border-y border-line-dark/50">
        {detail.questions.map((question) => {
          const named = question.cells
            .filter((cell) => cell.mentioned === true)
            .map((cell) => systemLabel(cell.systemId));
          return (
            <details key={question.text} className="group py-4">
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 text-ivory/90">
                <span>{question.text}</span>
                <span className="shrink-0 text-sm whitespace-nowrap text-ivory/60 group-open:text-copper">
                  {named.length === 0 ? "не назвали" : `назвали: ${named.length}`}
                </span>
              </summary>
              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="font-semibold text-ivory/60">Назвали вас</dt>
                  <dd className="mt-1 text-ivory/85">
                    {named.length === 0 ? "никто" : named.join(", ")}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-ivory/60">Вместо вас</dt>
                  <dd className="mt-1 text-ivory/85">
                    {question.namedInstead.length === 0
                      ? "никого не назвали"
                      : question.namedInstead.join(", ")}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-ivory/60">Ссылались на</dt>
                  <dd className="mt-1 text-ivory/85">
                    {question.citedDomains.length === 0
                      ? "ссылок не показали"
                      : question.citedDomains.join(", ")}
                  </dd>
                </div>
              </dl>
            </details>
          );
        })}
      </div>
    </div>
  );
}
