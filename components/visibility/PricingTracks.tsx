import type { PricingPlan, VisibilityContent } from "@/lib/visibility/types";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { CLIENT_PORTAL_ENABLED } from "@/lib/visibility/routes";

export function PricingDirectory({
  content,
}: {
  content: VisibilityContent["pricing"]["directory"];
}) {
  const destinations = [content.visibility, content.systems];

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
          <h3 className="text-h2 text-ink">{content.paidPlans.heading}</h3>
          <p className="mt-4 leading-relaxed text-muted">{content.paidPlans.intro}</p>
        </Reveal>

        {/* The hero ladders already sell each step one card at a time. This
            page exists to compare, so the same five offers become one table
            the eye can read across a single criterion at a time. */}
        <Reveal className="mt-10">
          <PlanComparisonTable
            plans={plans}
            labels={content.paidPlans.comparisonLabels}
            caption={content.paidPlans.heading}
            scrollHint={content.paidPlans.scrollHint}
          />
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
 * One table instead of five sales cards. Columns are the offers, rows are the
 * questions a buyer compares on. Everything that is not a row label is set in
 * ink so no cell competes with another for attention; the recommended column
 * is marked once, by a tint and a rule, and never by recolouring its price.
 */
function PlanComparisonTable({
  plans,
  labels,
  caption,
  scrollHint,
}: {
  plans: ComparedPlan[];
  labels: ComparisonLabels;
  caption: string;
  scrollHint: string;
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
    { label: labels.systems, render: ({ plan }) => plan.systemsLabel },
    { label: labels.scope, render: ({ plan }) => plan.volumeLabel },
    { label: labels.difference, render: ({ plan }) => plan.progressionLabel },
    {
      label: labels.included,
      render: ({ plan }) => (
        <ul>
          {plan.features.map((feature, index) => (
            <li
              key={feature}
              className={cn("py-2", index > 0 && "border-t border-line/70")}
            >
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
    <div>
      <p className="mb-3 text-sm text-muted lg:hidden">{scrollHint}</p>
      <div className="overflow-x-auto rounded-[1rem] border border-line bg-ivory">
        <table className="w-full min-w-[64rem] table-fixed border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <colgroup>
            <col className="w-36 lg:w-52" />
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
                  id={planAnchor(plan.name)}
                  className={cn(
                    columnClass(plan),
                    "scroll-mt-24 py-5 align-bottom",
                    plan.featured === true && "border-t-2 border-t-copper-deep",
                  )}
                >
                  <p className="flex min-h-[2.2rem] items-start text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {trackTitle}
                  </p>
                  <p className="mt-2 flex min-h-[2.75rem] items-start text-base font-semibold leading-snug text-ink">
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
                      className={cn(columnClass(entry.plan), "text-[15px] leading-snug text-ink/85")}
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
                    <a
                      href={plan.href}
                      className={cn(
                        "flex min-h-11 w-full items-center justify-center rounded-md border px-3 text-center text-sm font-semibold leading-tight transition-colors duration-300",
                        plan.featured === true
                          ? "border-copper-deep bg-copper-deep text-surface hover:bg-copper-deeper"
                          : "border-ink/25 text-ink hover:border-copper-deep hover:text-copper-deep",
                      )}
                    >
                      {plan.ctaLabel}
                    </a>
                  ) : null}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
