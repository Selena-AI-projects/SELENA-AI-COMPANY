import Link from "next/link";
import { labContent, labPath, type LabItem, type LabLocale, type LabSectionId } from "@/lib/lab/content";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

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
                {block.points ? (
                  <ul className="mt-7 space-y-3 border-l-2 border-copper pl-6 text-[1.02rem] leading-7 text-ink/78">
                    {block.points.map((point) => <li key={point}>{point}</li>)}
                  </ul>
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
        </Container>
      </article>

      <LabNextSteps locale={locale} />
    </>
  );
}
