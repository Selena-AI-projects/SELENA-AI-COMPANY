import Link from "next/link";
import { labContent, labPath, type LabItem, type LabLocale, type LabSectionId } from "@/lib/lab/content";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { LabDiagram } from "@/components/lab/LabDiagram";

function ItemLink({ item, locale }: { item: LabItem; locale: LabLocale }) {
  return (
    <Link
      href={labPath(locale, item.section, item.slug)}
      className="group grid gap-4 border-b border-line py-7 first:border-t sm:grid-cols-[9rem_1fr_auto] sm:items-start"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper-deep">{item.label}</p>
      <div>
        <h3 className="font-serif text-2xl font-semibold text-ink transition-colors group-hover:text-copper-deep">
          {item.title}
        </h3>
        <p className="mt-2 max-w-2xl leading-relaxed text-muted">{item.summary}</p>
      </div>
      <span className="text-sm text-muted sm:text-right">{item.readingTime} <span aria-hidden>→</span></span>
    </Link>
  );
}

function LabNextSteps({ locale }: { locale: LabLocale }) {
  const content = labContent[locale];
  return (
    <section className="bg-charcoal py-20 text-ivory sm:py-24">
      <Container size="wide">
        <div className="grid gap-px overflow-hidden border border-line-dark bg-line-dark lg:grid-cols-2">
          {[content.checkCta, content.systemsCta].map((cta) => (
            <article key={cta.href} className="bg-charcoal p-7 sm:p-10">
              <h2 className="font-serif text-3xl font-semibold text-ivory">{cta.title}</h2>
              <p className="mt-4 max-w-xl leading-relaxed text-ivory/68">{cta.text}</p>
              <Button href={cta.href} variant="onDark" className="mt-7">
                {cta.label}
              </Button>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function LabLandingPage({ locale }: { locale: LabLocale }) {
  const content = labContent[locale];
  return (
    <>
      <PageHero eyebrow={content.eyebrow} title={content.title} intro={content.intro}>
        <div className="flex flex-wrap items-center gap-4">
          <Button href={labPath(locale, "guides")}>{locale === "ru" ? "Открыть руководства" : "Explore the guides"}</Button>
          <p className="text-sm font-medium text-muted">{content.supportingLine}</p>
        </div>
      </PageHero>

      <section className="bg-ivory py-20 sm:py-24">
        <Container size="wide">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-deep">{content.browseLabel}</p>
          </Reveal>
          <div className="mt-8 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-2 xl:grid-cols-5">
            {content.sections.map((section, index) => (
              <Reveal key={section.id} delay={index * 55}>
                <Link
                  href={labPath(locale, section.id)}
                  className="group block h-full bg-surface p-6 transition-colors hover:bg-ivory sm:p-7"
                >
                  <p className="text-xs font-semibold tracking-[0.2em] text-copper-deep">0{index + 1}</p>
                  <h2 className="mt-8 font-serif text-2xl font-semibold text-ink group-hover:text-copper-deep">{section.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{section.description}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-surface py-20 sm:py-24">
        <Container>
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-deep">{content.featuredLabel}</p>
            <h2 className="mt-5 text-h2 text-ink">
              {locale === "ru" ? "Три материала для правильного старта" : "Three foundations for a sound start"}
            </h2>
          </Reveal>
          <div className="mt-10">
            {content.items.map((item) => <ItemLink key={`${item.section}:${item.slug}`} item={item} locale={locale} />)}
          </div>
        </Container>
      </section>

      <LabNextSteps locale={locale} />
    </>
  );
}

export function LabSectionPage({ locale, sectionId }: { locale: LabLocale; sectionId: LabSectionId }) {
  const content = labContent[locale];
  const section = content.sections.find((item) => item.id === sectionId)!;
  const items = content.items.filter((item) => item.section === sectionId);
  return (
    <>
      <PageHero eyebrow={content.sectionEyebrow} title={section.title} intro={section.description}>
        <Link href={labPath(locale)} className="inline-flex min-h-11 items-center font-medium text-link underline decoration-link/45 underline-offset-4">
          ← {content.backLabel}
        </Link>
      </PageHero>
      <section className="bg-ivory py-20 sm:py-24">
        <Container>
          {items.length > 0 ? (
            items.map((item) => <ItemLink key={item.slug} item={item} locale={locale} />)
          ) : (
            <div className="border-y border-line py-10">
              <p className="max-w-2xl text-lg leading-relaxed text-muted">{section.emptyState ?? content.coursesBoundary}</p>
            </div>
          )}
          {sectionId === "courses" ? (
            <p className="mt-8 max-w-3xl border-l-2 border-copper pl-5 leading-relaxed text-muted">{content.coursesBoundary}</p>
          ) : null}
        </Container>
      </section>
      <LabNextSteps locale={locale} />
    </>
  );
}

export function LabArticlePage({ locale, item }: { locale: LabLocale; item: LabItem }) {
  const content = labContent[locale];
  return (
    <>
      <PageHero eyebrow={`${content.eyebrow} · ${item.label}`} title={item.title} intro={item.summary}>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
          <Link href={labPath(locale, item.section)} className="inline-flex min-h-11 items-center font-medium text-link underline decoration-link/45 underline-offset-4">
            ← {content.backLabel}
          </Link>
          <span>{item.readingTime}</span>
          <span>{content.updatedLabel}: {item.updatedAt}</span>
        </div>
      </PageHero>

      <article className="bg-surface py-16 sm:py-24">
        <Container size="narrow">
          <div className="space-y-14">
            {item.blocks.map((block, index) => (
              <section key={block.heading} aria-labelledby={`lab-block-${index}`}>
                <p className="text-xs font-semibold tracking-[0.22em] text-copper-deep">{String(index + 1).padStart(2, "0")}</p>
                <h2 id={`lab-block-${index}`} className="mt-4 font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                  {block.heading}
                </h2>
                <div className="mt-6 space-y-5 text-[1.04rem] leading-8 text-ink/78">
                  {block.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
                {block.figure ? (
                  <LabDiagram id={block.figure.diagram} alt={block.figure.alt} caption={block.figure.caption} />
                ) : null}
                {block.table ? (
                  <figure className="mt-7">
                    {/* Wide tables scroll inside their own box so the page body never does. */}
                    <div className="overflow-x-auto rounded-lg border border-line">
                      <table className="w-full min-w-[34rem] border-collapse text-left text-[0.97rem] leading-6">
                        <thead>
                          <tr className="border-b border-line bg-ink/[0.03]">
                            {block.table.headers.map((header) => (
                              <th key={header} scope="col" className="px-4 py-3 font-semibold text-ink">{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {block.table.rows.map((row) => (
                            <tr key={row.join("|")} className="border-b border-line/60 last:border-b-0">
                              {row.map((cell, cellIndex) => (
                                <td key={cell} className={cellIndex === 0 ? "px-4 py-3 font-medium text-ink" : "px-4 py-3 text-ink/78"}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <figcaption className="mt-3 text-sm text-muted">{block.table.caption}</figcaption>
                  </figure>
                ) : null}
                {block.code ? (
                  <figure className="mt-7">
                    <pre className="overflow-x-auto rounded-lg border border-line bg-ink/[0.04] px-4 py-4 text-[0.92rem] leading-6 text-ink">
                      <code>{block.code.content}</code>
                    </pre>
                    <figcaption className="mt-3 text-sm text-muted">{block.code.caption}</figcaption>
                  </figure>
                ) : null}
                {block.points ? (
                  <ul className="mt-7 space-y-3 border-l-2 border-copper pl-6 text-[1.02rem] leading-7 text-ink/78">
                    {block.points.map((point) => <li key={point}>{point}</li>)}
                  </ul>
                ) : null}
                {block.steps ? (
                  <ol className="mt-7 list-decimal space-y-3 pl-6 text-[1.02rem] leading-7 marker:font-semibold marker:text-copper-deep text-ink/78">
                    {block.steps.map((step) => <li key={step} className="pl-1">{step}</li>)}
                  </ol>
                ) : null}
              </section>
            ))}
          </div>

          {item.sources.length > 0 ? (
            <aside className="mt-16 border-t border-line pt-8" aria-labelledby="lab-sources">
              <h2 id="lab-sources" className="font-serif text-2xl font-semibold text-ink">{content.sourcesLabel}</h2>
              <ul className="mt-5 space-y-3">
                {item.sources.map((source) => (
                  <li key={source.href}>
                    <a href={source.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-link underline decoration-link/45 underline-offset-4 hover:decoration-link-deep">
                      {source.publisher}: {source.title} <span className="ml-2" aria-hidden>↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}

          {item.related?.length ? (
            <aside className="mt-12 border-t border-line pt-8" aria-labelledby="lab-related">
              <h2 id="lab-related" className="font-serif text-2xl font-semibold text-ink">{content.relatedLabel}</h2>
              <ul className="mt-5 space-y-3">
                {item.related.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="inline-flex min-h-11 items-center text-link underline decoration-link/45 underline-offset-4 hover:decoration-link-deep">
                      {link.title} <span className="ml-2" aria-hidden>→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </Container>
      </article>

      <LabNextSteps locale={locale} />
    </>
  );
}
