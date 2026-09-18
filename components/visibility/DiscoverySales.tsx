import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Badge";
import { FAQSection } from "@/components/sections/FAQSection";
import { commercialFacts } from "@/lib/commercial-facts";
import { contactChannels } from "@/lib/site";
import { cn } from "@/lib/cn";
import {
  auditTerms,
  auditTermsRu,
  discoveryHeadings,
  discoveryDecisionSteps,
  discoveryOrderCopy,
  discoveryLinks as links,
  discoverySales as copy,
  discoveryTracks,
} from "@/lib/visibility/sales";
import type { PricingPlan, VisibilityLocale } from "@/lib/visibility/types";

function Section({
  id,
  eyebrow,
  title,
  children,
  dark = false,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 py-16 sm:py-20 ${dark ? "bg-charcoal text-ivory" : "border-b border-line bg-ivory text-ink"}`}
    >
      <Container>
        {eyebrow ? <Eyebrow onDark={dark}>{eyebrow}</Eyebrow> : null}
        <h2 className="max-w-3xl text-h2">{title}</h2>
        <div className="mt-8 space-y-6 leading-relaxed">{children}</div>
      </Container>
    </section>
  );
}

function List({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="border-b border-line pb-3 last:border-0">
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Existing contact destinations, reached only after the offer and its terms.
 * This is manual intake, not a checkout or a confirmed reservation. */
function ContactOptions({ locale, offer }: { locale: VisibilityLocale; offer: string }) {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {contactChannels.length ? (
        contactChannels.map((channel) => (
          <Button key={channel.key} href={channel.href} variant="secondary">
            {locale === "en" ? `Discuss ${offer} via ${channel.label.en}` : `${offer}: ${channel.label.ru}`}
          </Button>
        ))
      ) : (
        <Button href={locale === "en" ? "/en/contact" : "/contact"}>
          {locale === "en" ? "Contact Selena" : "Написать Selena"}
        </Button>
      )}
    </div>
  );
}

export function DiscoveryOrderSections({
  locale,
  only,
}: {
  locale: VisibilityLocale;
  only?: "early" | "audit" | "managed";
}) {
  const en = locale === "en";
  const orderCopy = discoveryOrderCopy(locale);
  return (
    <>
      {(!only || only === "early") && (
        <Section id="early-access" title={orderCopy.early.title}>
          <p className="max-w-3xl">{orderCopy.early.body}</p>
          <ContactOptions locale={locale} offer={en ? "early access" : "Ранний доступ"} />
        </Section>
      )}
      {(!only || only === "audit") && (
        <Section id="audit-order" title={orderCopy.audit.title}>
          <p className="max-w-3xl">{orderCopy.audit.body}</p>
          <dl className="grid gap-x-12 gap-y-6 md:grid-cols-2" data-visibility-view="audit_terms">
            {(en ? auditTerms : auditTermsRu).map((term) => (
              <div key={term.title} className="border-t border-line pt-4">
                <dt className="font-semibold">{term.title}</dt>
                <dd className="mt-2 max-w-2xl">{term.body}</dd>
              </div>
            ))}
          </dl>
          <ContactOptions locale={locale} offer={en ? "the $399 Audit" : "Аудит $399"} />
        </Section>
      )}
      {(!only || only === "managed") && (
        <Section id="managed-application" title={orderCopy.managed.title}>
          <p className="max-w-3xl">{orderCopy.managed.body}</p>
          <ContactOptions locale={locale} offer={en ? "Managed Discovery" : "Managed Discovery"} />
        </Section>
      )}
    </>
  );
}

/** Ladder-stage names for the four-step progression (display only — the
 * underlying commercial shorthand and body copy stay in sales.ts). */
const PROGRESSION_STAGES = ["SEE", "SEE THE WHOLE MARKET", "UNDERSTAND WHY", "DO IT"] as const;

const ctaKeyForPlan = (plan: PricingPlan): string | undefined => {
  if (plan.name === "Visibility Snapshot") return "snapshot";
  if (plan.name === "Full Discovery Landscape") return "landscape";
  if (plan.href?.endsWith("#audit-order")) return "audit";
  if (plan.href?.endsWith("#managed-application")) return "managed";
  return undefined;
};

/**
 * One of the four paid product cards. Every fact rendered here (price,
 * systems, scope, features) comes straight from the plan object in
 * sales.ts / commercial-facts.ts — nothing is authored in this component.
 *
 * Each visible field (status, name, price, shorthand, description, systems,
 * scope, features, CTA) is its own CSS grid row. At the `lg` breakpoint,
 * where all four cards sit side by side, every card opts into the parent
 * grid's row tracks via `subgrid` — so "Systems" in card 1 shares the exact
 * same row as "Systems" in card 4, however many lines the card above it
 * took. Below `lg` each card stacks independently as a normal flex column.
 * Nine rows: status, name, price, shorthand, description, systems, scope,
 * features, CTA — the parent grid below must declare the same nine tracks.
 */
/** The one fact per card worth catching at a glance — the thing that most
 * distinguishes this tier from its neighbors. Matched against the existing
 * feature text verbatim; nothing here changes what a plan includes. */
const KEY_FEATURE_HINT: Record<string, string> = {
  "Visibility Snapshot": "Automatic recommendations included",
  "Full Discovery Landscape": "Expanded recommendations included",
  "Verified Discovery & Competitive Audit": "Manual Google Ask Maps",
  "Managed Discovery Growth": "Selena-owned implementation",
};

function PaidPlanCard({ plan, shorthand }: { plan: PricingPlan; shorthand: string }) {
  const featured = plan.featured === true;
  const keyHint = KEY_FEATURE_HINT[plan.name];
  return (
    <article
      className={cn(
        "flex flex-col rounded-lg border bg-surface p-6 sm:p-7",
        "lg:grid lg:[grid-row:1/-1] lg:[grid-template-rows:subgrid]",
        featured ? "border-copper-deep bg-copper/[0.06]" : "border-line",
      )}
    >
      <p className="text-sm leading-snug text-copper-deep">{plan.statusLabel}</p>
      <h3 className="mt-3 self-start text-h3">{plan.name}</h3>
      <p className="mt-3 self-start font-serif text-3xl font-semibold leading-none tabular-nums">{plan.price}</p>
      <p className="mt-4 self-start text-xs font-semibold uppercase tracking-[0.12em] text-copper-deep">{shorthand}</p>
      <p className="mt-5 self-start text-lg font-semibold leading-snug">{plan.description}</p>

      <div className="mt-5 self-start border-t border-line pt-4 text-sm">
        <p className="font-semibold text-copper-deep">Systems</p>
        <p className="mt-1 leading-snug">{plan.systemsLabel}</p>
      </div>
      <div className="mt-3 self-start border-b border-line pb-4 text-sm">
        <p className="font-semibold text-copper-deep">Scope</p>
        <p className="mt-1 leading-snug">{plan.volumeLabel}</p>
      </div>

      <ul className="mt-1">
        {plan.features.map((feature, index) => {
          const isKey = keyHint ? feature.includes(keyHint) : false;
          return (
            <li
              key={feature}
              className={cn(
                "py-2 text-sm leading-snug",
                index > 0 && "border-t border-line/70",
                isKey && "border-l-2 border-copper-deep pl-3 font-semibold text-ink",
              )}
            >
              {feature}
            </li>
          );
        })}
      </ul>

      {plan.href && plan.ctaLabel ? (
        <div className="mt-6 self-start" data-visibility-cta={ctaKeyForPlan(plan)}>
          <Button href={plan.href} variant={featured ? "primary" : "secondary"} className="w-full">
            {plan.ctaLabel}
          </Button>
        </div>
      ) : null}
    </article>
  );
}

export function DiscoverySales({ children }: { children?: ReactNode }) {
  const tracks = discoveryTracks("en");
  const [snapshot, landscape] = tracks[0].plans;
  const [audit, managed] = tracks[1].plans;
  const paidPlans = [snapshot, landscape, audit, managed];

  return (
    <div lang="en">
      {/* 1 — HERO */}
      <section className="bg-charcoal pb-14 pt-28 text-ivory sm:pt-32">
        <Container>
          <p className="max-w-3xl text-sm font-semibold text-ivory">{copy.hero.eyebrow}</p>
          <h1 className="mt-5 max-w-5xl text-h2 sm:text-h1">{copy.hero.title}</h1>
          <p className="mt-6 max-w-3xl text-lg">{copy.hero.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span data-visibility-cta="hero_mechanism">
              <Button href="#competitors" variant="onDark">
                See how Selena works
              </Button>
            </span>
            <span data-visibility-cta="hero_plans">
              <Button href="#plans" variant="secondary">
                View plans
              </Button>
            </span>
          </div>
          <p className="mt-8 max-w-3xl border-t border-line-dark pt-6 text-sm text-ivory/85">
            ChatGPT · Gemini · Perplexity · Expanded AI · Google Maps
          </p>
          <p className="mt-3 max-w-3xl text-sm text-ivory/60">
            {copy.hero.gate} Local Discovery where verified. No card required to check readiness.
          </p>
        </Container>
      </section>

      {/* 2 — FREE, separated from the paid ladder */}
      <Section id="readiness" eyebrow="START HERE" title="Check if AI can find and understand your website — free.">
        <p className="max-w-3xl text-lg">
          Before measuring who AI recommends, check whether AI systems can access and understand your website in the
          first place.
        </p>
        <List items={copy.free.checks} />
        <p className="max-w-3xl font-semibold">{copy.free.boundary}</p>
        <div className="flex flex-wrap items-center gap-4">
          <Button href={links.free}>Check AI readiness — free</Button>
          <p className="text-sm text-muted">No card required.</p>
        </div>
      </Section>

      {/* 3 — Competitive intelligence */}
      <Section id="competitors" eyebrow="COMPETITIVE INTELLIGENCE" title={discoveryHeadings.preview}>
        <p className="max-w-3xl text-lg">{copy.preview.intro}</p>
        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {copy.preview.concepts.map((concept) => (
            <div key={concept.title} className="border-t border-line pt-4">
              <dt className="font-semibold text-copper-deep">{concept.title}</dt>
              <dd className="mt-2">{concept.body}</dd>
            </div>
          ))}
        </dl>
        <p className="font-semibold">{copy.preview.label}</p>
        <div className="space-y-6 md:hidden">
          {copy.preview.rows.map((row) => (
            <article key={row.intent} className="border-y border-line bg-surface p-5">
              <h3 className="text-h3">{row.intent}</h3>
              <dl className="mt-4 space-y-3">
                {[
                  ["You", row.visibility],
                  ["Competitor shown", row.competitor],
                  ["Evidence", row.source],
                  ["Selena recommendation", row.recommendation],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="font-semibold text-copper-deep">{label}</dt>
                    <dd className="mt-1">{value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
        <div className="hidden overflow-x-auto border border-line bg-surface md:block">
          <table className="w-full min-w-[38rem] text-left">
            <caption className="p-4 text-left">
              Three independent guest-intent examples · suggested actions, not verified outcomes.
            </caption>
            <thead>
              <tr>
                {["Guest intent", "You", "Competitor shown", "Evidence", "Selena recommendation"].map((label) => (
                  <th key={label} scope="col" className="border-t border-line p-4">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {copy.preview.rows.map((row) => (
                <tr key={row.intent}>
                  <th scope="row" className="border-t border-line p-4 font-semibold">
                    {row.intent}
                  </th>
                  {[row.visibility, row.competitor, row.source, row.recommendation].map((value, index) => (
                    <td key={index} className="border-t border-line p-4">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-3xl text-sm text-muted">{copy.preview.boundary}</p>
      </Section>

      {/* 4 — Four-step commercial progression */}
      <Section eyebrow="FOUR WAYS TO GO FURTHER" title="From insight to action.">
        <p className="max-w-3xl text-lg">Choose how far you want Selena to go.</p>
        <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {discoveryDecisionSteps.map((step, index) => (
            <li key={step.label} className="border-t border-line pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-copper-deep">
                {index + 1} — {PROGRESSION_STAGES[index]}
              </p>
              <p className="mt-3 font-serif text-h2">{paidPlans[index].price}</p>
              <h3 className="mt-3 font-sans text-base font-semibold">{step.label}</h3>
              <p className="mt-3">{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="max-w-3xl font-semibold">MEASURE → COMPARE → RECOMMEND → INVESTIGATE → DECIDE → EXECUTE → RECHECK</p>
      </Section>

      {/* 5 — Four paid product cards */}
      <Section id="plans" eyebrow="PLANS" title={discoveryHeadings.plans}>
        <p className="max-w-3xl">
          {tracks[0].intro} Competitors, sources and automatic recommendations are included in Visibility Snapshot.
          They are not reserved for the higher-priced Audit.
        </p>
        <div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:[grid-template-rows:repeat(9,auto)]"
          data-visibility-view="pricing"
        >
          {paidPlans.map((plan, index) => (
            <PaidPlanCard key={plan.name} plan={plan} shorthand={discoveryDecisionSteps[index].label} />
          ))}
        </div>
        <p className="max-w-3xl text-sm text-muted">
          Local Maps is included only where production-capable automated measurement is verified for the agreed
          scope. Manual Google Ask Maps / Local AI investigation belongs to the $399 Audit or an explicitly agreed
          Managed scope — never to the $49 or $79 subscriptions.
        </p>
      </Section>

      <DiscoveryOrderSections locale="en" only="early" />
      <DiscoveryOrderSections locale="en" only="audit" />
      <DiscoveryOrderSections locale="en" only="managed" />

      <Section title={discoveryHeadings.methodology}>
        <div className="grid gap-8 md:grid-cols-2">
          <List items={copy.methodology} />
          <div>
            <p>
              Configuration Lock, Evidence Ledger, evidence IDs and methodology/version disclosure keep every
              comparable recheck tied to its original scope.
            </p>
            <div className="mt-6" data-visibility-cta="methodology">
              <Button href={links.methodology} variant="secondary">
                Read the methodology
              </Button>
            </div>
          </div>
        </div>
        <details className="border-t border-line pt-4">
          <summary className="min-h-11 cursor-pointer py-3 font-semibold">
            Explore the verification loop — illustrative workflow
          </summary>
          <p className="max-w-3xl">
            The weekly report is a preview. Production recurring execution and Telegram delivery remain gated.
          </p>
          {children}
        </details>
      </Section>

      <FAQSection items={[...copy.faq]} headline="Frequently asked questions" />

      {/* 6 — Final CTA */}
      <Section title="Turn AI discovery into real guests." dark>
        <p className="max-w-2xl text-lg">
          Choose a plan and start improving how your business appears across AI and Local discovery.
        </p>
        <div className="flex flex-wrap gap-3">
          <span data-visibility-cta="final_plans">
            <Button href="#plans" variant="onDark">
              View plans
            </Button>
          </span>
          <span data-visibility-cta="final_free">
            <Button href={links.free} variant="secondary">
              Check AI readiness — free
            </Button>
          </span>
        </div>
        <p className="text-sm">Prices in USD. {commercialFacts.seller.legalName}. Live online payments are off.</p>
      </Section>

      {/* 7 — Hospitality / experience industry strip */}
      <section className="border-t border-line bg-ivory py-10 sm:py-12">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-muted">Built for hospitality and experience businesses.</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/80">
              {["Hotels", "Villas & Resorts", "Restaurants & Cafés", "Spas & Wellness", "Beach Clubs", "Experiences"].map(
                (item) => (
                  <li key={item}>{item}</li>
                ),
              )}
            </ul>
          </div>
        </Container>
      </section>
    </div>
  );
}
