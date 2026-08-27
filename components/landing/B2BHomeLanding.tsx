import { homepage, type HomepageContent } from "@/lib/data/homepage";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { LabEntryTeaser } from "@/components/lab/LabEntryTeaser";
import type { VisibilityLocale } from "@/lib/visibility/types";
import { cn } from "@/lib/cn";

function Eyebrow({ children, tone = "dark" }: { children: React.ReactNode; tone?: "dark" | "light" }) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.24em]",
        tone === "light" ? "text-copper" : "text-copper-deep",
      )}
    >
      {children}
    </p>
  );
}

function SectionIntro({
  eyebrow,
  headline,
  intro,
  tone = "dark",
}: {
  eyebrow: string;
  headline: string;
  intro?: string;
  tone?: "dark" | "light";
}) {
  return (
    <div className="max-w-3xl">
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      <h2 className={cn("mt-5 text-h1", tone === "light" ? "text-ivory" : "text-ink")}>
        {headline}
      </h2>
      {intro ? (
        <p className={cn("mt-5 text-lg leading-relaxed", tone === "light" ? "text-ivory/68" : "text-muted")}>
          {intro}
        </p>
      ) : null}
    </div>
  );
}

type LadderItem = HomepageContent["productPaths"]["visibility"]["items"][number];

function LadderCard({ item, highlighted }: { item: LadderItem; highlighted?: boolean }) {
  return (
    <article
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-[1rem] border bg-ivory p-5 text-ink transition-transform duration-300 hover:-translate-y-1",
        highlighted ? "border-copper-deep shadow-[0_24px_60px_-30px_rgba(185,130,91,0.55)]" : "border-line",
      )}
    >
      {highlighted ? <div className="absolute inset-x-0 top-0 h-1.5 bg-copper" aria-hidden /> : null}
      <p className="font-serif text-3xl font-semibold leading-none text-copper-deep">{item.price}</p>
      <h3 className="mt-3 min-h-[3.5rem] text-lg font-semibold leading-snug text-ink">{item.name}</h3>
      {/* The systems measured by this step, still named one by one — but as a
          single quiet line: eight dark chips per card made five cards
          side by side unreadable. */}
      <p className="min-h-[4rem] border-t border-line pt-3 text-sm font-medium leading-relaxed text-ink/80">
        {item.systems.join(" · ")}
      </p>
      <ul className="space-y-2 border-t border-line pt-3">
        {item.includes.map((line) => (
          <li key={line} className="flex items-start gap-2 text-sm leading-snug text-ink/85">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-copper-deep" aria-hidden />
            <span className="font-medium">{line}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-5">
        <Button
          href={item.cta.href}
          variant={highlighted ? "primary" : "secondary"}
          className="w-full whitespace-nowrap px-4 py-2.5 text-sm"
        >
          {item.cta.label}
        </Button>
      </div>
    </article>
  );
}

/**
 * The four paid Visibility steps in their two sales groups. Shared by the
 * homepage hero and the /visibility page hero so the offer reads the same
 * everywhere and the numbers live in one place.
 */
export function VisibilityLadder({ content }: { content: HomepageContent }) {
  return (
    <>
      <Reveal delay={120} className="mt-12">
        <p className="text-base font-semibold uppercase tracking-[0.18em] text-copper">
          {content.hero.directions.visibility.ladderLabel}
        </p>
      </Reveal>

      <div className="mt-6 grid gap-6 pb-6">
        <div className="rounded-3xl border border-ivory/12 bg-ivory/[0.03] p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ivory/75">
            {content.hero.directions.visibility.ladderGroups.auto}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {content.productPaths.visibility.items.slice(1, 3).map((item, index) => (
              <Reveal key={`${item.price}-${item.name}`} delay={140 + index * 60} className="h-full">
                <LadderCard item={item} highlighted={index === 0} />
              </Reveal>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-ivory/12 bg-ivory/[0.03] p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ivory/75">
            {content.hero.directions.visibility.ladderGroups.expert}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {content.productPaths.visibility.items.slice(3).map((item, index) => (
              <Reveal key={`${item.price}-${item.name}`} delay={200 + index * 60} className="h-full">
                <LadderCard item={item} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function HeroSection({ content }: { content: HomepageContent }) {
  return (
    <section className="relative overflow-hidden bg-charcoal pt-28 text-ivory sm:pt-32 lg:pt-36">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(247,242,234,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(247,242,234,0.6) 1px, transparent 1px)",
          backgroundSize: "4rem 4rem",
        }}
        aria-hidden
      />
      <Container size="wide" className="relative">
        <Reveal className="max-w-4xl">
          <Eyebrow tone="light">{content.hero.eyebrow}</Eyebrow>
          <h1 className="mt-6 text-display text-ivory">{content.hero.headline}</h1>
          <p className="mt-6 text-lg leading-relaxed text-ivory/76 sm:text-xl">
            {content.hero.subheadline}
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button
              href={content.hero.primaryCta.href}
              size="lg"
              variant="onDark"
              className="shrink-0 whitespace-nowrap"
            >
              {content.hero.primaryCta.label}
            </Button>
            <a
              href={content.hero.secondaryCta.href}
              className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-ivory/25 px-8 py-4 text-base font-medium text-ivory/85 transition-colors duration-300 hover:border-copper hover:text-link-dark"
            >
              {content.hero.secondaryCta.label}
            </a>
          </div>
          <p className="mt-4 text-base leading-relaxed text-ivory/75">{content.hero.primaryNote}</p>
        </Reveal>


        {/* The whole ladder sits in the first screen: a visitor compares the
            free entry against every paid step without scrolling for it.
            The free check is its own product (the hero CTA above) — the
            ladder shows only the four paid steps, grouped the way the owner
            sells them: automatic first, expert-led after. */}
        <VisibilityLadder content={content} />

        {/* The second product speaks only after the first one has finished:
            the owner moved this door below the ladder on purpose. */}
        <Reveal delay={100} className="mt-9">
          <div className="flex max-w-4xl flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl border border-ivory/15 bg-ivory/5 px-6 py-5">
            <p className="min-w-64 flex-1 text-base leading-relaxed text-ivory/76">
              <span className="font-semibold text-ivory">{content.hero.systemsDoor.question}</span>{" "}
              {content.hero.systemsDoor.description}
            </p>
            <a
              href={content.hero.systemsDoor.cta.href}
              className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-copper/60 px-6 py-3 text-base font-medium text-link-dark transition-colors duration-300 hover:bg-copper hover:text-charcoal"
            >
              {content.hero.systemsDoor.cta.label} →
            </a>
          </div>
        </Reveal>


        <Reveal delay={180} className="border-t border-ivory/12 py-6">
          <p className="max-w-3xl text-base leading-relaxed text-ivory/75">{content.hero.trustLine}</p>
        </Reveal>
      </Container>
    </section>
  );
}

function VisibilityOverviewSection({ content }: { content: HomepageContent }) {
  const visibility = content.hero.directions.visibility;
  const plan = content.productPaths.visibility;

  return (
    <section id="visibility" className="border-t border-ivory/10 bg-charcoal py-20 text-ivory sm:py-28">
      <Container size="wide">
        <Reveal>
          <div className="grid gap-6 border-b border-ivory/12 pb-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <div>
              <Eyebrow tone="light">{visibility.eyebrow}</Eyebrow>
              <h2 className="mt-5 text-h1 text-ivory">{plan.name}</h2>
            </div>
            <div>
              <p className="text-xl font-semibold leading-relaxed text-ivory">{plan.promise}</p>
              <p className="mt-3 max-w-3xl leading-relaxed text-ivory/78">{visibility.description}</p>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button href={plan.primaryCta.href} size="lg" variant="onDark" className="w-full sm:w-auto">
            {plan.primaryCta.label}
          </Button>
          <a
            href={plan.secondaryCta.href}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-ivory/25 px-8 py-4 text-base font-medium text-ivory/85 transition-colors duration-300 hover:border-copper hover:text-link-dark sm:w-auto"
          >
            {plan.secondaryCta.label}
          </a>
        </Reveal>

        <Reveal delay={100} className="mt-12 border-t border-ivory/12 pt-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-copper">
            {visibility.outcomesLabel}
          </p>
          <ul className="mt-6 grid gap-6 md:grid-cols-3">
            {visibility.proof.map((item, index) => (
              <li key={item} className="border-t-2 border-copper/30 pt-4 text-lg leading-relaxed text-ivory/78">
                <span className="mr-2 font-semibold text-copper">0{index + 1}</span>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}

/**
 * The visual hand-off between the two products: everything above is
 * AI Visibility on dark, everything below is AI Automation on light.
 * The card straddles the boundary so the switch is impossible to miss.
 */
function ProductSwitchSection({ content }: { content: HomepageContent }) {
  const t = content.productSwitch;
  return (
    <section aria-label={t.headline} className="relative bg-charcoal">
      <div className="absolute inset-x-0 bottom-0 top-1/2 bg-surface" aria-hidden />
      <Container size="wide" className="relative">
        <Reveal>
          <div className="rounded-3xl border border-line bg-ivory px-6 py-10 text-center shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)] sm:px-10 sm:py-12">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">{t.kicker}</p>
            <h2 className="mt-4 text-h1 text-ink">{t.headline}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted">{t.text}</p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function ProblemSection({ content }: { content: HomepageContent }) {
  return (
    <section id="ai-systems" className="bg-surface py-20 sm:py-28">
      <Container size="wide">
        <Reveal>
          {/* The hand-off card above already names the product, so this
              section leads with what it does instead of repeating the name. */}
          <div className="mb-16 border-b border-line pb-12">
            <h2 className="max-w-4xl text-h1 text-ink">{content.productPaths.systems.promise}</h2>
            <p className="mt-6 max-w-3xl text-xl leading-relaxed text-muted">
              {content.productPaths.systems.description}
            </p>
          </div>
        </Reveal>

        <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr]">
          <Reveal>
            <SectionIntro
              eyebrow={content.problems.eyebrow}
              headline={content.problems.headline}
              intro={content.problems.intro}
            />
          </Reveal>

          <div className="border-y border-line">
            {content.problems.items.map((item, index) => (
              <Reveal key={item.title} delay={index * 55}>
                <div className="grid gap-4 border-b border-line py-6 last:border-b-0 sm:grid-cols-[7rem_1fr] sm:py-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-deep">
                    0{index + 1}
                  </p>
                  <div>
                    <h3 className="text-h3 text-ink">{item.title}</h3>
                    <p className="mt-2 max-w-2xl leading-relaxed text-muted">{item.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function SolutionSection({ content }: { content: HomepageContent }) {
  return (
    <section id="systems" className="border-t border-line bg-surface py-20 sm:py-28">
      <Container size="wide">
        <Reveal>
          <SectionIntro
            eyebrow={content.solution.eyebrow}
            headline={content.solution.headline}
            intro={content.solution.intro}
          />
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden border border-line bg-line lg:grid-cols-5">
          {content.solution.systems.map((system, index) => (
            <Reveal key={system.name} delay={index * 70}>
              <div className="h-full bg-ivory p-6 transition-colors duration-300 hover:bg-surface sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-deep">
                  0{index + 1}
                </p>
                <h3 className="mt-9 text-h3 text-ink">{system.name}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted">{system.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function SprintSection({ content }: { content: HomepageContent }) {
  return (
    <section id="sprint" className="bg-surface py-20 sm:py-28">
      <Container size="wide">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <Reveal>
            <SectionIntro
              eyebrow={content.sprint.eyebrow}
              headline={content.sprint.headline}
              intro={content.sprint.intro}
            />
            <Button href={content.cta.href} size="lg" className="mt-8 whitespace-nowrap">
              {content.cta.label}
            </Button>
          </Reveal>

          <Reveal delay={120}>
            <div className="border-y border-line">
              {content.sprint.deliverables.map((deliverable, index) => (
                <div key={deliverable} className="grid grid-cols-[3.5rem_1fr] border-b border-line py-5 last:border-b-0">
                  <span className="font-serif text-2xl font-semibold text-copper-deep">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-lg leading-relaxed text-ink/82">{deliverable}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function ProcessSection({ content }: { content: HomepageContent }) {
  return (
    <section className="bg-ivory py-20 sm:py-28">
      <Container size="wide">
        <Reveal>
          <SectionIntro
            eyebrow={content.processIntro.eyebrow}
            headline={content.processIntro.headline}
          />
        </Reveal>

        <ol className="mt-14 grid gap-4 lg:grid-cols-5">
          {content.process.map((step, index) => (
            <Reveal as="li" key={step.day} delay={index * 70}>
              <div className="relative h-full border border-line bg-surface p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-deep">
                  {step.day}
                </p>
                <h3 className="mt-6 text-h3 text-ink">{step.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}

function SprintTrackerSection({ content }: { content: HomepageContent }) {
  const doneCount = content.tracker.steps.filter((step) => step.status === "done").length;
  const progressPercent = Math.round((doneCount / content.tracker.steps.length) * 100);

  return (
    <section className="bg-surface pb-20 sm:pb-28">
      <Container size="wide">
        <Reveal>
          <SectionIntro
            eyebrow={content.tracker.eyebrow}
            headline={content.tracker.headline}
            intro={content.tracker.note}
          />
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-12 overflow-hidden border border-line bg-ivory">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4 sm:px-8">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-copper-deep" aria-hidden />
                <p className="text-sm font-semibold text-ink">{content.tracker.dayLabel}</p>
                <p className="text-sm text-muted">— {content.tracker.stageLabel}</p>
              </div>
              <p className="text-base font-semibold uppercase tracking-[0.16em] text-muted">
                {content.tracker.demoLabel}
              </p>
            </div>

            <div className="px-6 pt-6 sm:px-8">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-copper-deep"
                  style={{ width: `${progressPercent}%` }}
                  aria-hidden
                />
              </div>
            </div>

            <ol className="grid gap-px bg-line p-px pt-6 sm:grid-cols-5 sm:pt-6">
              {content.tracker.steps.map((step, index) => (
                <li
                  key={step.title}
                  className={cn(
                    "bg-ivory p-5",
                    step.status === "active" && "bg-surface",
                  )}
                >
                  <p
                    className={cn(
                      "flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]",
                      step.status === "done" && "text-copper-deep",
                      step.status === "active" && "text-ink",
                      step.status === "next" && "text-muted",
                    )}
                  >
                    {step.status === "done" ? (
                      <span aria-hidden>✓</span>
                    ) : (
                      <span aria-hidden>{String(index + 1).padStart(2, "0")}</span>
                    )}
                    {step.title}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export function PackagesSection({ content }: { content: HomepageContent }) {
  return (
    <section id="packages" className="border-t border-line bg-surface py-20 sm:py-28">
      <Container size="wide">
        <Reveal>
          <SectionIntro
            eyebrow={content.packagesIntro.eyebrow}
            headline={content.packagesIntro.headline}
            intro={content.packagesIntro.intro}
          />
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-10 border border-line bg-ivory p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-deep">
                  {content.strategyCall.format}
                </p>
                <h3 className="mt-2 font-serif text-3xl font-semibold text-ink">
                  {content.strategyCall.title}
                </h3>
                <p className="mt-2 text-lg font-semibold text-ink">{content.strategyCall.lead}</p>
              </div>
              <p className="font-serif text-4xl font-semibold text-ink">
                {content.strategyCall.price}
              </p>
            </div>

            <ol className="mt-7 grid gap-6 sm:grid-cols-3">
              {content.strategyCall.steps.map((step, index) => (
                <li key={step} className="border-t-2 border-copper/40 pt-3">
                  <span className="font-serif text-2xl font-semibold text-copper-deep">
                    {index + 1}
                  </span>
                  <p className="mt-2 text-base font-medium leading-snug text-ink/85">{step}</p>
                </li>
              ))}
            </ol>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
              <p className="text-sm font-semibold text-copper-deep">
                {content.strategyCall.note}
              </p>
              <a
                href={content.cta.href}
                className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border border-ink/25 px-5 py-2.5 text-sm font-medium text-ink/80 transition-colors duration-300 hover:border-copper-deep hover:text-link-deep"
              >
                {content.strategyCall.ctaLabel}
              </a>
            </div>
          </div>
        </Reveal>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {content.packages.map((pkg, index) => (
            <Reveal key={pkg.name} delay={index * 80}>
              <article
                className={cn(
                  "flex h-full flex-col border bg-ivory p-6 text-ink transition-transform duration-300 hover:-translate-y-1 sm:p-7",
                  pkg.featured ? "border-copper-deep" : "border-line",
                )}
              >
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-copper-deep">
                      {pkg.name}
                    </p>
                    <h3 className="mt-4 font-serif text-4xl font-semibold">{pkg.price}</h3>
                  </div>
                  {pkg.featured ? (
                    <span className="rounded-full bg-copper-deep px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-surface">
                      {content.packagesIntro.featuredLabel}
                    </span>
                  ) : null}
                </div>
                <p className="mt-6 text-[17px] font-semibold leading-snug text-ink">
                  {pkg.description}
                </p>
                <ol className="mt-7 pb-8">
                  {pkg.included.map((item, itemIndex) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 border-t border-line py-3 text-base leading-snug text-ink/85"
                    >
                      <span className="w-5 shrink-0 pt-px font-serif text-lg font-semibold leading-none text-copper-deep">
                        {itemIndex + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ol>
                <Button
                  href={content.cta.href}
                  variant={pkg.featured ? "primary" : "secondary"}
                  className="mt-auto whitespace-nowrap"
                >
                  {content.cta.label}
                </Button>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function ProofSection({ content }: { content: HomepageContent }) {
  return (
    <section id="proof" className="border-t border-line bg-surface py-20 sm:py-28">
      <Container size="wide">
        <Reveal>
          <SectionIntro
            eyebrow={content.proof.eyebrow}
            headline={content.proof.headline}
          />
          <p className="mt-5 max-w-2xl leading-relaxed text-muted">{content.proof.founderLine}</p>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-2">
          {content.proof.projects.map((project, index) => (
            <Reveal key={project.name} delay={index * 70}>
              <article className="group h-full bg-surface p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-deep">
                  {project.category}
                </p>
                <h3 className="mt-5 text-h2 text-ink">
                  {project.url ? (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-baseline gap-2 transition-colors hover:text-link-deep focus-visible:text-link"
                    >
                      {project.name}
                      <span
                        aria-hidden
                        className="text-base transition-transform group-hover:translate-x-1"
                      >
                        ↗
                      </span>
                    </a>
                  ) : (
                    project.name
                  )}
                </h3>
                <p className="mt-4 max-w-xl leading-relaxed text-muted">{project.text}</p>
                {project.metric ? (
                  <div className="mt-6 border-t border-line pt-5">
                    <p className="font-serif text-2xl font-semibold text-ink">
                      {project.metric.value}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted">
                      {project.metric.basis}
                    </p>
                  </div>
                ) : null}
                <ul className="mt-6 flex flex-wrap gap-2">
                  {project.layers.map((layer) => (
                    <li
                      key={layer}
                      className="rounded-full border border-line px-3 py-1 text-base font-semibold uppercase tracking-[0.14em] text-copper-deep"
                    >
                      {layer}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FinalCtaSection({ content }: { content: HomepageContent }) {
  return (
    <section className="border-t border-line bg-ivory py-20 sm:py-28">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-4xl text-center">
            <Eyebrow>{content.finalCta.eyebrow}</Eyebrow>
            <h2 className="mt-5 text-h1 text-ink">{content.finalCta.headline}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted">
              {content.finalCta.text}
            </p>
            <Button href={content.cta.href} size="lg" className="mt-9 whitespace-nowrap">
              {content.cta.label}
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export function B2BHomeLanding({
  content = homepage,
  locale = "en",
}: {
  content?: HomepageContent;
  locale?: VisibilityLocale;
}) {
  return (
    <>
      <HeroSection content={content} />
      <VisibilityOverviewSection content={content} />
      <ProductSwitchSection content={content} />
      <ProblemSection content={content} />
      <SolutionSection content={content} />
      <SprintSection content={content} />
      <ProcessSection content={content} />
      <SprintTrackerSection content={content} />
      <PackagesSection content={content} />
      <ProofSection content={content} />
      <LabEntryTeaser locale={locale} />
      <FinalCtaSection content={content} />
    </>
  );
}
