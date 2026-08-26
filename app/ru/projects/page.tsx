import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { buildJournalStructuredData } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import {
  clickForms,
  clickRate,
  formatDate,
  impressionForms,
  pluralizeRu,
  journalLadder,
  journalMeta,
  journalProjects,
  stageLabels,
} from "@/lib/visibility-log/data";

const journalPath = "/ru/projects";
const journalTitle = "Наши проекты и замеры";
const journalDescription =
  "Собственные проекты проходят весь путь замера публично: с чего начали, что показали цифры, что мы поправили и что получилось после. С датами и без задним числом переписанных выводов. Один проект в журнале не наш — он опубликован с разрешения владельца.";

export const metadata = buildMetadata({
  title: journalTitle,
  description: journalDescription,
  path: journalPath,
  locale: "ru_RU",
});

const rules = [
  "У каждой записи есть дата. Ничего не переписывается задним числом — если вывод оказался неверным, появляется новая запись, а старая остаётся.",
  "Цифры и слова разделены. Числа приходят из Search Console и обновляются сами. Утверждения о том, что сработало, пишет и подтверждает человек.",
  "Сравниваем только одинаковые замеры: тот же список вопросов, те же системы, тот же язык. Иначе сравнивать нечего.",
  "Публикуем общие числа по проекту. Сам список запросов остаётся закрытым — в нём попадаются чужие бренды.",
  "Ноль — это тоже результат. У трёх проектов на старте ноль показов, и он остаётся на странице.",
  "Чужой бизнес попадает в журнал только с записанного разрешения владельца. Сказать, что заведение не называют в AI-ответах, — это утверждение о нём, а не о нас.",
];

export default function JournalIndexPage() {
  return (
    <>
      <JsonLd
        data={buildJournalStructuredData({
          locale: "ru",
          pageUrl: `${site.url}${journalPath}`,
          title: journalTitle,
          description: journalDescription,
          projects: journalProjects,
        })}
      />
      <PageHero
        eyebrow="Проекты"
        title="Наши проекты — и один чужой, с его разрешения."
        intro="Мы продаём измерение видимости в поиске и в AI-ответах. Поэтому первыми через него проходим сами: фиксируем точку отсчёта, показываем каждый следующий шаг лестницы и публикуем результат — включая тот, где результата пока нет. Один проект в списке не наш: мы помогаем ему с видимостью, и он разрешил показать свой замер."
      >
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Источник: {journalMeta.source}. Окно — {journalMeta.windowDays} дней, а не месяц:
          это ровно четыре недели, поэтому в сравнении с прошлым периодом совпадают дни
          недели. У «30 дней» они сдвигаются, и часть движения оказывается календарной,
          а не настоящей.
        </p>
      </PageHero>

      <section className="border-y border-line bg-surface py-20 sm:py-28">
        <Container size="narrow">
          <h2 className="text-h2 text-ink">Как мы это ведём</h2>
          <ol className="mt-10 grid gap-7">
            {rules.map((rule, index) => (
              <li key={rule} className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-line pt-5">
                <span className="font-serif text-xl font-semibold text-copper-deep">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="leading-relaxed text-ink/85">{rule}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-ivory py-20 sm:py-28">
        <Container>
          <div className="max-w-3xl">
            <h2 className="text-h2 text-ink">Лестница, по которой идёт каждый проект</h2>
            <p className="mt-5 leading-relaxed text-muted">
              Ступени идут по порядку и не перепрыгиваются. Пока проект не прошёл ступень,
              на его странице она отмечена как непройденная — а не расписана заранее.
            </p>
          </div>
          <ol className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {journalLadder.map((rung, index) => (
              <li key={rung.stage} className="bg-surface p-7">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-serif text-xl font-semibold text-copper-deep">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-right text-sm font-semibold text-ink">{rung.price}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink">{stageLabels[rung.stage]}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{rung.what}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-t border-line bg-surface py-20 sm:py-28">
        <Container>
          <div className="max-w-3xl">
            <h2 className="text-h2 text-ink">Проекты</h2>
            <p className="mt-5 leading-relaxed text-muted">
              Числа ниже — обычный поиск Google за {journalMeta.windowDays} дней: это окно, за
              которое Google отдаёт данные, а не срок работы. Замеры AI-ответов — отдельные
              события: у каждого свой номер и своя дата, и они лежат внутри карточек. У чужого
              проекта чисел из поиска нет: Search Console — это доступ к сайту, и брать его ради
              замера незачем.
            </p>
          </div>

          <ul className="mt-12 grid gap-6">
            {journalProjects.map((project) => {
              const metrics = project.metrics;
              const rate = metrics ? clickRate(metrics) : null;
              const latest = project.entries[project.entries.length - 1];
              const measurements = project.visitorViews ?? [];
              const last = measurements[measurements.length - 1];
              const lastMeasurement = last ? { ...last, number: measurements.length } : null;
              return (
                <li key={project.slug}>
                  <Link
                    href={`/ru/projects/${project.slug}`}
                    className="group block rounded-xl border border-line bg-ivory p-7 transition-all duration-300 hover:-translate-y-px hover:border-copper-deep/50 sm:p-9"
                  >
                    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
                      <div>
                        <h3 className="font-serif text-2xl font-semibold text-ink">{project.name}</h3>
                        {project.publishedByPermission ? (
                          <p className="mt-2 inline-flex rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold tracking-wide text-copper-deep uppercase">
                            Не наш проект · опубликовано с разрешения
                          </p>
                        ) : null}
                        <p className="mt-2 text-sm text-muted">{project.category}</p>
                        <p className="mt-1 text-sm text-muted">
                          {project.markets.join(" · ")} — {project.languages.join(", ")}
                        </p>
                        {lastMeasurement ? (
                          <p className="mt-3 text-sm font-semibold text-copper-deep">
                            Замер №{lastMeasurement.number} · {formatDate(lastMeasurement.date)} —{" "}
                            {lastMeasurement.brandMentions === 0
                              ? "бренд не назван"
                              : `бренд назван ${lastMeasurement.brandMentions} раз`}
                          </p>
                        ) : null}
                        {latest ? (
                          <p className="mt-5 border-t border-line pt-4 leading-relaxed text-ink/85">
                            <span className="font-semibold">{latest.title}.</span>{" "}
                            <span className="text-muted">
                              {stageLabels[latest.stage]}, {formatDate(latest.date)}
                            </span>
                          </p>
                        ) : null}
                      </div>

                      {metrics ? (
                        <div className="self-start border-t border-line pt-5 lg:border-t-0 lg:border-l lg:border-line lg:pt-0 lg:pl-8">
                        <p className="text-sm font-semibold text-ink">
                          За {journalMeta.windowDays} дней
                          <span className="ml-2 font-normal text-muted">
                            {formatDate(metrics.windowStart)} — {formatDate(metrics.windowEnd)}
                          </span>
                        </p>
                        <dl className="mt-4 grid grid-cols-3 gap-4">
                          <div>
                            <dd className="font-serif text-[2rem] leading-none font-semibold text-ink">
                              {metrics.clicks}
                            </dd>
                            <dt className="mt-2 text-sm text-muted">
                              {pluralizeRu(metrics.clicks, clickForms)}
                              {metrics.previousClicks !== null
                                ? ` · было ${metrics.previousClicks}`
                                : ""}
                            </dt>
                          </div>
                          <div>
                            <dd className="font-serif text-[2rem] leading-none font-semibold text-ink">
                              {metrics.impressions.toLocaleString("ru-RU")}
                            </dd>
                            <dt className="mt-2 text-sm text-muted">
                              {pluralizeRu(metrics.impressions, impressionForms)}
                            </dt>
                          </div>
                          <div>
                            <dd className="font-serif text-[2rem] leading-none font-semibold text-ink">
                              {rate === null ? "—" : `${rate}%`}
                            </dd>
                            <dt className="mt-2 text-sm text-muted">доля кликов</dt>
                          </div>
                        </dl>
                        </div>
                      ) : null}
                    </div>

                    <span className="mt-6 inline-flex items-center gap-2 font-medium text-copper-deep">
                      Открыть журнал проекта
                      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <section className="bg-charcoal py-20 text-ivory sm:py-28">
        <Container size="narrow">
          <h2 className="text-h2 text-ivory">Хотите такую же точку отсчёта для своего сайта?</h2>
          <p className="mt-5 leading-relaxed text-ivory/75">
            Первая ступень бесплатная и не требует платных запросов к AI: показывает, что о сайте
            вообще можно узнать до начала замеров.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Button href="/ru/check" variant="onDark" size="lg">
              Начать с бесплатной проверки
            </Button>
            <Link
              href="/ru/methodology"
              className="inline-flex items-center gap-2 py-4 font-medium text-copper transition-colors hover:text-ivory"
            >
              Как считается каждая цифра
              <span aria-hidden>→</span>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
