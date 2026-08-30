const stages = [
  {
    title: "1. Владелец",
    text: "Задача · границы · стоп-условия",
    tone: "bg-copper-deep text-surface border-copper-deep",
  },
  {
    title: "2. ChatGPT и Codex",
    text: "ТЗ · реализация · отдельная ветка",
    tone: "bg-surface text-ink border-line",
  },
  {
    title: "3. GitHub",
    text: "Commit SHA · pull request · CI",
    tone: "bg-good text-surface border-good",
  },
  {
    title: "4. Claude Code",
    text: "Независимый read-only review exact diff",
    tone: "bg-surface text-ink border-line",
  },
] as const;

export function CrossReviewWorkflow() {
  return (
    <figure className="mt-8" aria-labelledby="cross-review-workflow-caption">
      <div className="rounded-xl border border-line bg-ivory p-4 sm:p-7">
        <ol className="mx-auto max-w-2xl">
          {stages.map((stage, index) => (
            <li key={stage.title}>
              <div className={`rounded-lg border px-5 py-5 text-center ${stage.tone}`}>
                <p className="font-serif text-2xl font-semibold">{stage.title}</p>
                <p className="mt-1 leading-relaxed opacity-85">{stage.text}</p>
              </div>
              {index < stages.length - 1 ? (
                <div className="py-2 text-center text-2xl text-muted" aria-hidden>↓</div>
              ) : null}
            </li>
          ))}
        </ol>

        <div className="mx-auto mt-3 max-w-2xl rounded-full border-2 border-copper px-5 py-4 text-center">
          <p className="font-serif text-2xl font-semibold text-ink">Есть замечания?</p>
        </div>

        <div className="mx-auto mt-5 grid max-w-3xl gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-copper bg-warn-soft p-5">
            <p className="font-semibold text-ink">Да → обратно в Codex</p>
            <p className="mt-2 leading-relaxed text-muted">Конкретная правка → новый commit → тесты и review заново.</p>
          </div>
          <div className="rounded-lg border border-good bg-good-soft p-5">
            <p className="font-semibold text-ink">Нет → owner-gate</p>
            <p className="mt-2 leading-relaxed text-muted">Владелец отдельно решает: merge, расходы, публикация или deploy.</p>
          </div>
        </div>

        <div className="mx-auto mt-5 max-w-3xl rounded-lg border border-dashed border-copper-deep bg-surface p-5 text-center">
          <p className="font-semibold text-ink">Лимит Claude Max → BLOCKED_PLAN_LIMIT</p>
          <p className="mt-2 leading-relaxed text-muted">
            Состояние сохраняется. После восстановления лимита запускается scheduled retry и проверка Claude Code продолжается с того же зафиксированного commit.
          </p>
        </div>
      </div>
      <figcaption id="cross-review-workflow-caption" className="mt-3 text-sm leading-relaxed text-muted">
        Адаптивная HTML-схема. Замечание возвращает задачу к Codex; перед merge или deploy всегда остаётся отдельный owner-gate.
      </figcaption>
    </figure>
  );
}
