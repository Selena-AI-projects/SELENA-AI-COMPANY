import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { buildJournalProjectStructuredData } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import {
  clickForms,
  clickRate,
  findProject,
  formatDate,
  impressionForms,
  pluralizeRu,
  journalLadder,
  journalMeta,
  journalProjects,
  minVisitorCoverage,
  reachedStages,
  stageLabels,
  visitorMentionRate,
} from "@/lib/visibility-log/data";

export function generateStaticParams() {
  return journalProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) {
    return buildMetadata({
      title: "Наши проекты и замеры",
      description: "Открытые замеры видимости по собственным проектам Selena Systems.",
      path: "/ru/projects",
      locale: "ru_RU",
    });
  }
  return buildMetadata({
    title: `${project.name} — проект и замеры`,
    description: `Точка отсчёта, замеры и исправления по проекту ${project.name}: что показали цифры, что мы поменяли и что эти числа не доказывают.`,
    path: `/ru/projects/${project.slug}`,
    locale: "ru_RU",
  });
}

export default async function JournalProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) notFound();

  const metrics = project.metrics;
  const rate = metrics ? clickRate(metrics) : null;
  const reached = reachedStages(project);
  const currentStageIndex = journalLadder.reduce(
    (last, rung, index) => (reached.has(rung.stage) ? index : last),
    -1,
  );

  const facts = metrics
    ? [
        {
          value: String(metrics.clicks),
          label: `${pluralizeRu(metrics.clicks, clickForms)} из поиска`,
          note:
            metrics.previousClicks !== null
              ? `за предыдущие ${journalMeta.windowDays} дней — ${metrics.previousClicks}`
              : "предыдущего периода для сравнения нет",
        },
        {
          value: metrics.impressions.toLocaleString("ru-RU"),
          label: `${pluralizeRu(metrics.impressions, impressionForms)} в выдаче`,
          note: "сколько раз сайт показали в результатах",
        },
        {
          value: rate === null ? "—" : `${rate}%`,
          label: "доля кликов",
          note: rate === null ? "показов нет, считать не из чего" : "сколько показов стали переходом",
        },
        {
          value: String(metrics.nonBrandClicks),
          label: `небрендовых ${pluralizeRu(metrics.nonBrandClicks, clickForms)}`,
          note: "искали задачу, а не сайт по имени",
        },
      ]
    : [];

  const firstEntry = project.entries[0];
  const lastEntry = project.entries[project.entries.length - 1];

  return (
    <>
      {firstEntry && lastEntry ? (
        <JsonLd
          data={buildJournalProjectStructuredData({
            locale: "ru",
            journalUrl: `${site.url}/ru/projects`,
            pageUrl: `${site.url}/ru/projects/${project.slug}`,
            journalTitle: "Проекты",
            project,
            publishedAt: firstEntry.date,
            updatedAt: lastEntry.date,
          })}
        />
      ) : null}
      <PageHero eyebrow="Проект" title={project.name} intro={project.category}>
        {project.publishedByPermission ? (
          <div className="mb-8 max-w-2xl rounded-xl border border-line bg-surface p-6">
            <p className="text-sm font-semibold tracking-[0.16em] text-copper-deep uppercase">
              Не наш проект
            </p>
            <p className="mt-3 leading-relaxed text-ink/85">
              {project.publishedByPermission.note}
            </p>
            <p className="mt-3 text-sm text-muted">
              Разрешение записано {formatDate(project.publishedByPermission.recordedOn)} —{" "}
              {project.publishedByPermission.owner}.
            </p>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted">
          <span>{project.markets.join(" · ")}</span>
          <span>Языки замера: {project.languages.join(", ")}</span>
          <a
            href={project.url}
            className="font-medium text-copper-deep underline-offset-4 hover:underline"
            rel="noopener"
          >
            {project.url.replace(/^https?:\/\//, "")}
          </a>
        </div>
      </PageHero>

      {metrics ? (
        <section className="border-y border-line bg-surface py-16 sm:py-20">
          <Container>
            <h2 className="text-h3 text-ink">
              Поиск Google за {journalMeta.windowDays} дней
            </h2>
            <p className="mt-2 text-muted">
              {formatDate(metrics.windowStart)} — {formatDate(metrics.windowEnd)}
            </p>
            <dl className="mt-9 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.label} className="border-t border-line pt-5">
                  <dd className="font-serif text-[2.4rem] leading-none font-semibold text-ink">
                    {fact.value}
                  </dd>
                  <dt className="mt-3 font-semibold text-ink">{fact.label}</dt>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{fact.note}</p>
                </div>
              ))}
            </dl>
            <p className="mt-10 max-w-3xl text-sm leading-relaxed text-muted">
              Источник — {journalMeta.source}, окно {journalMeta.windowDays} дней. Это обычный поиск
              Google. Как проект выглядит в ответах ChatGPT, Gemini и Perplexity, покажет платный
              замер, и он появится здесь отдельной записью.
            </p>
          </Container>
        </section>
      ) : null}

      {project.visitorView ? (
        <section className="bg-charcoal py-20 text-ivory sm:py-28">
          <Container>
            <div className="max-w-3xl">
              <p className="text-sm font-semibold tracking-[0.18em] text-copper uppercase">
                Замер Visitor View · {formatDate(project.visitorView.date)}
              </p>
              <h2 className="mt-4 text-h2 text-ivory">Что видит человек на живой поверхности</h2>
              <p className="mt-5 leading-relaxed text-ivory/75">
                {project.visitorView.questions} вопросов заданы{" "}
                {project.visitorView.surfaceCount} поверхностям — ChatGPT, Gemini и Perplexity. Это
                то, что показывают живому человеку, а не то, что модель помнит.
              </p>
            </div>

            <dl className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  value: String(project.visitorView.brandMentions),
                  label: "упоминаний бренда",
                  note: `из ${project.visitorView.answersReceived} прочитанных ответов`,
                },
                {
                  value: `${project.visitorView.answersReceived} / ${project.visitorView.answersRequested}`,
                  label: "ответов дошло",
                  note: "остальные не вернулись вовремя",
                },
                {
                  value: String(project.visitorView.questions),
                  label: "вопросов",
                  note: "один и тот же список при каждом замере",
                },
                {
                  value: `$${project.visitorView.costUsd.toFixed(2)}`,
                  label: "стоил замер",
                  note: "мы публикуем и это",
                },
              ].map((fact) => (
                <div key={fact.label} className="border-t border-line-dark pt-5">
                  <dd className="font-serif text-[2.4rem] leading-none font-semibold text-ivory">
                    {fact.value}
                  </dd>
                  <dt className="mt-3 font-semibold text-ivory">{fact.label}</dt>
                  <p className="mt-1 text-sm leading-relaxed text-ivory/60">{fact.note}</p>
                </div>
              ))}
            </dl>

            <p className="mt-8 max-w-3xl text-sm leading-relaxed text-ivory/60">
              Здесь намеренно нет одной общей доли. ChatGPT, Gemini и Perplexity отвечают
              по-разному и возвращают разное количество ответов — процент, усреднённый по всем
              трём, не был бы правдой ни об одной из них. Счётчики складываются честно, доли — нет.
            </p>

            {project.visitorView.surfaces.length > 0 ? (
              <>
                <div className="mt-10 overflow-x-auto">
              <table className="w-full min-w-[38rem] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line-dark text-sm text-ivory/60">
                    <th className="py-3 pr-4 font-semibold">Поверхность</th>
                    <th className="py-3 pr-4 font-semibold">Ответов получено</th>
                    <th className="py-3 pr-4 font-semibold">Бренд назван</th>
                    <th className="py-3 font-semibold">Доля</th>
                  </tr>
                </thead>
                <tbody>
                  {project.visitorView.surfaces.map((surface) => {
                    const rate = visitorMentionRate(surface);
                    return (
                      <tr key={surface.surface} className="border-b border-line-dark/60">
                        <td className="py-3 pr-4 text-ivory">{surface.surface}</td>
                        <td className="py-3 pr-4 text-ivory/75">
                          {surface.answersReceived} из {surface.answersRequested}
                        </td>
                        <td className="py-3 pr-4 text-ivory/75">{surface.brandMentions}</td>
                        <td className="py-3 text-ivory/75">
                          {rate === null ? "мало данных" : `${Math.round(rate * 100)}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

                <p className="mt-6 max-w-3xl text-sm leading-relaxed text-ivory/60">
                  Доля показывается только там, где вернулось не меньше{" "}
                  {Math.round(minVisitorCoverage * 100)}% ответов. Ниже этого порога стоит «мало
                  данных»: процент, посчитанный по неполной выборке, — это не приблизительная
                  правда, а другое число с тем же знаком.
                </p>
              </>
            ) : null}

            {project.visitorView.citedDomains.length > 0 ? (
              <div className="mt-14">
                <h3 className="text-h3 text-ivory">На что ссылались ответы</h3>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ivory/60">
                  Только ссылки, которые поверхность реально показала рядом с ответом. Домены,
                  выведенные из текста, сюда не попадают — это разные вещи, и смешивать их нельзя.
                </p>
                <div className="mt-7 overflow-x-auto">
                  <table className="w-full min-w-[30rem] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-line-dark text-sm text-ivory/60">
                        <th className="py-3 pr-4 font-semibold">Домен</th>
                        <th className="py-3 font-semibold">В скольких ответах</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.visitorView.citedDomains.slice(0, 12).map((domain) => (
                        <tr key={domain.domain} className="border-b border-line-dark/60">
                          <td className="py-3 pr-4 text-ivory">{domain.domain}</td>
                          <td className="py-3 text-ivory/75">{domain.answers}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {project.visitorView.ownDomainAnswers !== null ? (
                  <p className="mt-5 max-w-3xl text-sm leading-relaxed text-ivory/60">
                    Собственный сайт проекта попал в{" "}
                    {project.visitorView.ownDomainAnswers === 0
                      ? "ноль ответов"
                      : `${project.visitorView.ownDomainAnswers} ответов`}
                    . Чаще машины опираются на подборки и каталоги — попасть в них важнее, чем
                    дописать ещё одну страницу у себя.
                  </p>
                ) : null}
              </div>
            ) : null}

            <p className="mt-12 max-w-3xl text-sm leading-relaxed text-ivory/60">
              Стоимость замера: ${project.visitorView.costUsd.toFixed(2)}. Конфигурация:{" "}
              {project.visitorView.configVersion}. Один замер — это один момент: поверхности
              отвечают иначе завтра, и число упоминаний не говорит, сколько людей задали эти
              вопросы.
            </p>
          </Container>
        </section>
      ) : null}

      {project.apiView ? (
        <section className="bg-charcoal py-20 text-ivory sm:py-28">
          <Container>
            <div className="max-w-3xl">
              <p className="text-sm font-semibold tracking-[0.18em] text-copper uppercase">
                Замер AI-ответов · {formatDate(project.apiView.date)}
              </p>
              <h2 className="mt-4 text-h2 text-ivory">Что AI отвечает о проекте</h2>
              <p className="mt-5 leading-relaxed text-ivory/75">
                {project.apiView.questions} вопросов заданы {project.apiView.models} моделям.
                Получено {project.apiView.answersReceived} ответов из {project.apiView.answersRequested}.
                Бренд назван {project.apiView.brandMentions} раз.
              </p>
            </div>

            <dl className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { value: String(project.apiView.brandMentions), label: "упоминаний бренда", note: `из ${project.apiView.answersReceived} ответов` },
                { value: String(project.apiView.questions), label: "вопросов", note: "один и тот же список при каждом замере" },
                { value: String(project.apiView.models), label: "моделей", note: "канал API View" },
                { value: `$${project.apiView.costUsd.toFixed(2)}`, label: "стоил замер", note: "мы публикуем и это" },
              ].map((fact) => (
                <div key={fact.label} className="border-t border-line-dark pt-5">
                  <dd className="font-serif text-[2.4rem] leading-none font-semibold text-ivory">{fact.value}</dd>
                  <dt className="mt-3 font-semibold text-ivory">{fact.label}</dt>
                  <p className="mt-1 text-sm leading-relaxed text-ivory/60">{fact.note}</p>
                </div>
              ))}
            </dl>

            {project.apiView.namedInstead.length > 0 ? (
              <div className="mt-14">
                <h3 className="text-h3 text-ivory">Кого модели называют вместо нас</h3>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ivory/60">
                  Названия взяты из тех же ответов и проверены на дословное присутствие в тексте.
                  Выдуманное название в отчёте хуже, чем его отсутствие.
                </p>
                <div className="mt-7 overflow-x-auto">
                  <table className="w-full min-w-[34rem] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-line-dark text-sm text-ivory/60">
                        <th className="py-3 pr-4 font-semibold">Заведение</th>
                        <th className="py-3 pr-4 font-semibold">В скольких вопросах</th>
                        <th className="py-3 font-semibold">Сколько моделей знают</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.apiView.namedInstead.map((business) => (
                        <tr key={business.name} className="border-b border-line-dark/60">
                          <td className="py-3 pr-4 text-ivory">{business.name}</td>
                          <td className="py-3 pr-4 text-ivory/75">
                            {business.questions} из {project.apiView!.questions}
                          </td>
                          <td className="py-3 text-ivory/75">{business.models}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            <p className="mt-12 max-w-3xl text-sm leading-relaxed text-ivory/60">
              Канал API View — это знания самих моделей. Что ответит ChatGPT живому человеку с
              включённым веб-поиском, здесь не проверялось: это отдельный канал Visitor View.
              Конфигурация замера: {project.apiView.configVersion}.
            </p>
          </Container>
        </section>
      ) : null}

      <section className="bg-ivory py-20 sm:py-28">
        <Container>
          <h2 className="text-h2 text-ink">Где проект сейчас</h2>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {journalLadder.map((rung, index) => {
              const done = index <= currentStageIndex;
              return (
                <li key={rung.stage} className={done ? "bg-surface p-7" : "bg-ivory p-7"}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span
                      className={
                        done
                          ? "font-serif text-xl font-semibold text-copper-deep"
                          : "font-serif text-xl font-semibold text-muted/60"
                      }
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={done ? "text-sm font-semibold text-ink" : "text-sm text-muted"}>
                      {rung.price}
                    </span>
                  </div>
                  <h3 className={done ? "mt-4 text-lg font-semibold text-ink" : "mt-4 text-lg font-semibold text-muted"}>
                    {stageLabels[rung.stage]}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{rung.what}</p>
                  <p
                    className={
                      done
                        ? "mt-4 text-sm font-semibold text-copper-deep"
                        : "mt-4 text-sm text-muted/80"
                    }
                  >
                    {done ? "Пройдено" : "Ещё не проходили"}
                  </p>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      <section className="border-t border-line bg-surface py-20 sm:py-28">
        <Container size="narrow">
          <h2 className="text-h2 text-ink">Записи</h2>
          <ol className="mt-12 grid gap-14">
            {project.entries.map((entry) => (
              <li key={`${entry.date}-${entry.title}`} className="border-t border-line pt-7">
                <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                  <time dateTime={entry.date} className="font-semibold text-copper-deep">
                    {formatDate(entry.date)}
                  </time>
                  <span className="text-sm text-muted">{stageLabels[entry.stage]}</span>
                </div>
                <h3 className="mt-4 font-serif text-2xl font-semibold text-ink">{entry.title}</h3>
                <p className="mt-5 text-lg leading-relaxed text-ink/85">{entry.body}</p>
                {entry.doesNotProve ? (
                  <div className="mt-7 border-l-2 border-copper-deep/50 pl-5">
                    <p className="text-sm font-semibold tracking-[0.14em] text-muted uppercase">
                      Чего это не доказывает
                    </p>
                    <p className="mt-2 leading-relaxed text-muted">{entry.doesNotProve}</p>
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-charcoal py-20 text-ivory sm:py-28">
        <Container size="narrow">
          <h2 className="text-h2 text-ivory">Тот же путь для вашего сайта</h2>
          <p className="mt-5 leading-relaxed text-ivory/75">
            Начинается он с бесплатной ступени — без платных запросов к AI и без обязательств.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Button href="/ru/check" variant="onDark" size="lg">
              Начать с бесплатной проверки
            </Button>
            <Link
              href="/ru/projects"
              className="inline-flex items-center gap-2 py-4 font-medium text-copper transition-colors hover:text-ivory"
            >
              Все проекты журнала
              <span aria-hidden>→</span>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
