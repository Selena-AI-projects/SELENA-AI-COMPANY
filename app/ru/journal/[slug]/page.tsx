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
  reachedStages,
  stageLabels,
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
      title: "Журнал видимости",
      description: "Публичный журнал замеров видимости по проектам Selena Systems.",
      path: "/ru/journal",
      locale: "ru_RU",
    });
  }
  return buildMetadata({
    title: `${project.name} — журнал видимости`,
    description: `Точка отсчёта, замеры и исправления по проекту ${project.name}: что показали цифры, что мы поменяли и что эти числа не доказывают.`,
    path: `/ru/journal/${project.slug}`,
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
              ? `предыдущие ${journalMeta.windowDays} дней — ${metrics.previousClicks}`
              : "предыдущего периода для сравнения нет",
        },
        {
          value: metrics.impressions.toLocaleString("ru-RU"),
          label: `${pluralizeRu(metrics.impressions, impressionForms)} в выдаче`,
          note: `${formatDate(metrics.windowStart)} — ${formatDate(metrics.windowEnd)}`,
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
            journalUrl: `${site.url}/ru/journal`,
            pageUrl: `${site.url}/ru/journal/${project.slug}`,
            journalTitle: "Журнал видимости",
            project,
            publishedAt: firstEntry.date,
            updatedAt: lastEntry.date,
          })}
        />
      ) : null}
      <PageHero eyebrow="Журнал видимости" title={project.name} intro={project.category}>
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
            <h2 className="text-h3 text-ink">Точка отсчёта</h2>
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
              href="/ru/journal"
              className="inline-flex items-center gap-2 py-4 font-medium text-copper transition-colors hover:text-ivory"
            >
              Все семь проектов
              <span aria-hidden>→</span>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
