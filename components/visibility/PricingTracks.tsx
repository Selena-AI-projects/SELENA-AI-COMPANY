import { CinemaImage } from "@/components/ui/CinemaImage";
import type { PricingPlan, VisibilityContent } from "@/lib/visibility/types";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { CLIENT_PORTAL_ENABLED } from "@/lib/visibility/routes";

type DirectoryTile = { image: string; alt: string };

export function PricingDirectory({
  content,
  tiles,
}: {
  content: VisibilityContent["pricing"]["directory"];
  /** A staged frame per destination — the outward lens, the inward gears.
      The comparison table below stays typography on purpose. */
  tiles?: { visibility: DirectoryTile; systems: DirectoryTile };
}) {
  const destinations = [
    { ...content.visibility, tile: tiles?.visibility },
    { ...content.systems, tile: tiles?.systems },
  ];

  return (
    <section className="border-y border-line bg-ivory py-10 sm:py-12">
      <Container size="wide">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <Reveal>
            <h2 className="text-h2 text-ink">{content.heading}</h2>
            <p className="mt-4 max-w-xl leading-relaxed text-muted">{content.intro}</p>
          </Reveal>

          <div className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-2">
            {destinations.map((destination, index) => (
              <Reveal key={destination.title} delay={index * 90} className="h-full">
                <a
                  href={destination.href}
                  className="group flex h-full flex-col bg-surface p-5 transition-colors duration-300 hover:bg-warm-canvas sm:p-6"
                >
                  {destination.tile ? (
                    <div className="relative mb-5 aspect-[21/9] overflow-hidden rounded-xl border border-line">
                      <CinemaImage
                        src={destination.tile.image}
                        alt={destination.tile.alt}
                        fill
                        sizes="(min-width: 1024px) 32vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    </div>
                  ) : null}
                  <h3 className="text-h3 text-ink">{destination.title}</h3>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-copper-deep">
                    {destination.count}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted">{destination.description}</p>
                  <span className="mt-auto pt-5 text-sm font-semibold text-copper-deep underline decoration-copper/45 underline-offset-4 group-hover:decoration-copper-deep">
                    {destination.ctaLabel}
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export function PricingTracks({
  content,
  showHeader = true,
}: {
  content: VisibilityContent["pricing"];
  showHeader?: boolean;
}) {
  // The free entry is the first card of the same row as the paid plans, so a
  // visitor can compare what each next step adds without opening a page.
  const freeEntry: ComparedPlan = {
    plan: {
      name: content.freePlan.name,
      price: content.freePlan.price,
      status: "active",
      statusLabel: content.freePlan.statusLabel,
      description: content.freePlan.description,
      systemsLabel: content.freePlan.systemsLabel,
      volumeLabel: content.freePlan.volumeLabel,
      progressionLabel: content.freePlan.progressionLabel,
      features: content.freePlan.features,
      href: content.freePlan.href,
      ctaLabel: content.freePlan.ctaLabel,
    },
    trackTitle: content.freePlan.trackLabel,
    boundary: content.freePlan.boundary,
  };

  const plans: ComparedPlan[] = [
    freeEntry,
    ...content.tracks.flatMap((track) =>
      track.plans.map((plan) => ({ plan, trackTitle: track.title })),
    ),
  ];

  return (
    <section id="plans" className="bg-surface py-16 sm:py-20">
      <Container size="wide">
        {showHeader ? (
          <SectionHeader eyebrow={content.eyebrow} headline={content.title} intro={content.intro} />
        ) : null}

        <Reveal className={cn("max-w-3xl", showHeader && "mt-12")}>
          <h2 className="text-h2 text-ink">{content.paidPlans.heading}</h2>
          <p className="mt-4 leading-relaxed text-muted">{content.paidPlans.intro}</p>
        </Reveal>

        {/* Same five offers, two shapes. A five-column table only compares when
            all five columns are on screen at once; narrower than that it is a
            sideways scroll where the price of the plan you are reading about
            has already left the viewport, so below that width each offer is
            its own card carrying the same rows top to bottom. */}
        <Reveal className="mt-10">
          <PlanSummaryGrid plans={plans} labels={content.paidPlans.comparisonLabels} />
        </Reveal>

        {/* The summary above is the decision; the full comparison stays one
            click away for the visitor who wants to check the detail. */}
        <Reveal className="mt-8">
          <details className="group rounded-[1rem] border border-line bg-ivory">
            <summary className="cursor-pointer list-none px-5 py-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
              <span aria-hidden="true" className="mr-2 inline-block text-copper-deep transition-transform group-open:rotate-90">
                ›
              </span>
              {content.paidPlans.comparisonLabels.details}
              <span className="font-normal text-muted"> — {content.paidPlans.comparisonLabels.detailsHint}</span>
            </summary>
            <div className="border-t border-line p-4 sm:p-5">
              <div className="xl:hidden">
                <PlanCardList plans={plans} labels={content.paidPlans.comparisonLabels} />
              </div>
              <div className="hidden xl:block">
                <PlanComparisonTable
                  plans={plans}
                  labels={content.paidPlans.comparisonLabels}
                  caption={content.paidPlans.heading}
                />
              </div>
            </div>
          </details>
        </Reveal>

        <Reveal className="mt-12 border-t border-line pt-6">
          <p className="max-w-4xl text-sm leading-relaxed text-muted">{content.disclosure}</p>
        </Reveal>

        {CLIENT_PORTAL_ENABLED && (
          <Reveal className="mt-8 flex flex-col gap-5 border-y border-line py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-ink">{content.portal.note}</p>
            <Button href={content.portal.href} variant="secondary" className="w-full shrink-0 sm:w-auto">
              {content.portal.label}
            </Button>
          </Reveal>
        )}
      </Container>
    </section>
  );
}

/** "AI Visibility Snapshot" → "snapshot": stable, human-readable anchors. */
function planAnchor(name: string): string {
  return name
    .replace(/^AI Visibility\s+/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type ComparedPlan = { plan: PricingPlan; trackTitle: string; boundary?: string };
type ComparisonLabels = VisibilityContent["pricing"]["paidPlans"]["comparisonLabels"];

/**
 * The three rows that separate one offer from the next, in ladder order.
 * Declared once so the card and the table can never drift apart.
 */
const SPEC_ROWS: {
  label: (labels: ComparisonLabels) => string;
  value: (plan: PricingPlan) => string;
}[] = [
  { label: (labels) => labels.systems, value: (plan) => plan.systemsLabel },
  { label: (labels) => labels.scope, value: (plan) => plan.volumeLabel },
  { label: (labels) => labels.difference, value: (plan) => plan.progressionLabel },
];

function planCtaAttribute(plan: PricingPlan): string | undefined {
  if (plan.name === "Visibility Snapshot") return "snapshot";
  if (plan.name === "Full Discovery Landscape") return "landscape";
  if (plan.href?.endsWith("#audit-order")) return "audit";
  if (plan.href?.endsWith("#managed-application")) return "managed";
  return undefined;
}

/**
 * The decision in one row: price, who each offer is for, and the next step.
 * The main choice is the one dark card; everything else stays quiet.
 */
function PlanSummaryGrid({ plans, labels }: { plans: ComparedPlan[]; labels: ComparisonLabels }) {
  return (
    <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {plans.map(({ plan, trackTitle }) => {
        const featured = plan.featured === true;
        return (
          <article
            key={plan.name}
            id={planAnchor(plan.name)}
            className={cn(
              "flex min-w-0 scroll-mt-24 flex-col gap-2 rounded-[0.9rem] border p-4",
              featured
                ? "order-first border-charcoal bg-charcoal text-ivory shadow-[0_20px_40px_-24px_rgba(13,20,33,0.7)] sm:col-span-2 lg:order-none lg:col-span-1 lg:min-h-[19rem]"
                : "border-line bg-ivory lg:min-h-[16.5rem]",
            )}
          >
            {featured ? (
              <p className="self-start whitespace-nowrap rounded-full bg-rose-dark px-3 py-1 text-[0.75rem] font-bold uppercase leading-5 tracking-[0.12em] text-charcoal">
                {labels.mainChoice}
              </p>
            ) : null}
            <p className={cn("text-sm", featured ? "text-ivory/75" : "text-muted")}>{trackTitle}</p>
            <h3 className="font-sans text-base font-semibold leading-snug">{plan.name}</h3>
            <p className="font-serif text-[2rem] font-semibold leading-none tabular-nums">{plan.price}</p>
            <p className={cn("font-semibold leading-snug", featured ? "text-rose-dark" : "text-rose")}>
              {plan.description}
            </p>
            {plan.href && plan.ctaLabel ? (
              <a
                href={plan.href}
                data-visibility-cta={planCtaAttribute(plan)}
                className={cn(
                  "mt-auto flex min-h-11 items-center justify-center rounded-md border px-3 py-2 text-center text-sm font-semibold leading-tight transition-colors duration-300",
                  featured
                    ? "border-rose-dark bg-rose-dark text-charcoal hover:bg-ivory"
                    : "border-ink/25 text-ink hover:border-copper-deep hover:text-link-deep",
                )}
              >
                {plan.ctaLabel}
              </a>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

const featureListClass = (index: number) =>
  cn("py-2 leading-snug text-ink/85", index > 0 && "border-t border-line/70");

/**
 * The card shape of the comparison, for every screen narrower than the table.
 * The free entry leads at full width because it is where a visitor starts;
 * the four paid offers follow in ladder order, two across once there is room.
 */
function PlanCardList({ plans, labels }: { plans: ComparedPlan[]; labels: ComparisonLabels }) {
  const [entry, ...paid] = plans;

  return (
    <div className="grid gap-5">
      <PlanCard entry={entry} labels={labels} />
      <div className="grid gap-5 md:grid-cols-2">
        {paid.map((plan) => (
          <PlanCard key={plan.plan.name} entry={plan} labels={labels} />
        ))}
      </div>
    </div>
  );
}

function PlanCard({ entry, labels }: { entry: ComparedPlan; labels: ComparisonLabels }) {
  const { plan, trackTitle, boundary } = entry;
  // Marked the same way as its table column: a tint and a rule, never a
  // recoloured price and never a claim about how many people chose it.
  const featured = plan.featured === true;

  return (
    <article
      className={cn(
        "flex h-full flex-col border bg-surface p-5 sm:p-7",
        featured ? "border-copper-deep bg-copper/[0.06]" : "border-line",
      )}
    >
      <p className="text-sm text-muted">{trackTitle}</p>
      {plan.audience ? <p className="mt-2 text-sm font-semibold text-rose">{plan.audience}</p> : null}
      <h3 className="mt-2 font-sans text-lg font-semibold leading-snug text-ink">{plan.name}</h3>
      <p className="mt-3 font-serif text-4xl font-semibold leading-none tabular-nums text-ink">
        {plan.price}
      </p>
      <p className="mt-3 text-sm leading-snug text-copper-deep">{plan.statusLabel}</p>

      <p className="mt-6 text-lg font-semibold leading-snug text-ink">{plan.description}</p>
      {boundary ? <p className="mt-2 text-sm leading-relaxed text-muted">{boundary}</p> : null}

      <dl className="mt-6 border-t border-line">
        {SPEC_ROWS.map((spec) => (
          <div key={spec.label(labels)} className="border-b border-line py-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-copper-deep">
              {spec.label(labels)}
            </dt>
            <dd className="mt-1 leading-snug text-ink/85">{spec.value(plan)}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-copper-deep">
        {labels.included}
      </p>
      <ul className="mt-1">
        {plan.features.map((feature, index) => (
          <li key={feature} className={featureListClass(index)}>
            {feature}
          </li>
        ))}
      </ul>

      {plan.href && plan.ctaLabel ? (
        <a href={plan.href} data-visibility-cta={plan.name === "Visibility Snapshot" ? "snapshot" : plan.name === "Full Discovery Landscape" ? "landscape" : plan.href.endsWith("#audit-order") ? "audit" : plan.href.endsWith("#managed-application") ? "managed" : undefined} className={cn("mt-7", planCtaClass(featured))}>
          {plan.ctaLabel}
        </a>
      ) : null}
    </article>
  );
}

const planCtaClass = (featured: boolean) =>
  cn(
    "flex min-h-12 w-full items-center justify-center rounded-md border px-4 py-2 text-center font-semibold leading-tight transition-colors duration-300",
    featured
      ? "border-copper-deep bg-copper-deep text-surface hover:bg-copper-deeper"
      : "border-ink/25 text-ink hover:border-copper-deep hover:text-link-deep",
  );

/**
 * One table instead of five sales cards. Columns are the offers, rows are the
 * questions a buyer compares on. Everything that is not a row label is set in
 * ink so no cell competes with another for attention; the recommended column
 * is marked once, by a tint and a rule, and never by recolouring its price.
 */
function PlanComparisonTable({
  plans,
  labels,
  caption,
}: {
  plans: ComparedPlan[];
  labels: ComparisonLabels;
  caption: string;
}) {
  const rows: { label: string; render: (entry: ComparedPlan) => React.ReactNode }[] = [
    { label: labels.status, render: ({ plan }) => plan.statusLabel },
    {
      label: labels.bestFor,
      render: ({ plan, boundary }) => (
        <>
          <p className="font-semibold text-ink">{plan.description}</p>
          {boundary ? <p className="mt-2 text-muted">{boundary}</p> : null}
        </>
      ),
    },
    ...SPEC_ROWS.map((spec) => ({
      label: spec.label(labels),
      render: ({ plan }: ComparedPlan) => spec.value(plan),
    })),
    {
      label: labels.included,
      render: ({ plan }) => (
        <ul>
          {plan.features.map((feature, index) => (
            <li key={feature} className={featureListClass(index)}>
              {feature}
            </li>
          ))}
        </ul>
      ),
    },
  ];

  const columnClass = (plan: PricingPlan) =>
    cn("border-l border-line px-4 py-3.5 align-top lg:px-5", plan.featured === true && "bg-copper/[0.06]");

  return (
    <div className="overflow-x-auto rounded-[1rem] border border-line bg-ivory">
      <table className="w-full min-w-[68rem] table-fixed border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <colgroup>
          <col className="w-52" />
          {plans.map(({ plan }) => (
            <col key={plan.name} />
          ))}
        </colgroup>
        <thead>
          <tr className="bg-ivory">
            <th
              scope="col"
              className="sticky left-0 z-10 bg-ivory px-4 py-5 align-bottom text-xs font-semibold uppercase tracking-[0.14em] text-copper-deep lg:px-5"
            >
              {labels.offer}
            </th>
            {plans.map(({ plan, trackTitle }) => (
              <th
                key={plan.name}
                scope="col"
                className={cn(
                  columnClass(plan),
                  "py-5 align-bottom",
                  plan.featured === true && "border-t-2 border-t-copper-deep",
                )}
              >
                <p className="flex min-h-[3.2rem] items-start text-sm leading-snug text-muted">
                  {trackTitle}
                </p>
                <p className="mt-2 flex min-h-[3.5rem] items-start text-lg font-semibold leading-snug text-ink">
                  {plan.name}
                </p>
                <p className="mt-3 font-serif text-[2rem] font-semibold leading-none tabular-nums text-ink">
                  {plan.price}
                </p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const rowBg = index % 2 === 0 ? "bg-surface" : "bg-ivory";
            return (
              <tr key={row.label} className={cn("border-t border-line", rowBg)}>
                <th
                  scope="row"
                  className={cn(
                    "sticky left-0 z-10 px-4 py-3.5 align-top text-xs font-semibold uppercase tracking-[0.12em] text-copper-deep lg:px-5",
                    rowBg,
                  )}
                >
                  {row.label}
                </th>
                {plans.map((entry) => (
                  <td
                    key={entry.plan.name}
                    className={cn(columnClass(entry.plan), "leading-snug text-ink/85")}
                  >
                    {row.render(entry)}
                  </td>
                ))}
              </tr>
            );
          })}
          <tr className="border-t border-line bg-surface">
            <th scope="row" className="sticky left-0 z-10 bg-surface px-4 py-4 lg:px-5" aria-hidden />
            {plans.map(({ plan }) => (
              <td key={plan.name} className={cn(columnClass(plan), "py-4")}>
                {plan.href && plan.ctaLabel ? (
                  <a href={plan.href} data-visibility-cta={plan.name === "Visibility Snapshot" ? "snapshot" : plan.name === "Full Discovery Landscape" ? "landscape" : plan.href.endsWith("#audit-order") ? "audit" : plan.href.endsWith("#managed-application") ? "managed" : undefined} className={planCtaClass(plan.featured === true)}>
                    {plan.ctaLabel}
                  </a>
                ) : null}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
