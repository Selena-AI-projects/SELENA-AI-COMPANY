import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Badge";
import { CinemaImage } from "@/components/ui/CinemaImage";
import { Reveal } from "@/components/ui/Reveal";
import { FAQSection } from "@/components/sections/FAQSection";
import { commercialFacts } from "@/lib/commercial-facts";
import { contactChannels } from "@/lib/site";
import { cn } from "@/lib/cn";
import {
  IconSparkChat,
  IconTwinStar,
  IconCompassMark,
  IconLayers,
  IconMapPin,
  IconHotel,
  IconPalm,
  IconFork,
  IconLotus,
  IconUmbrella,
  IconInfinity,
  IconCheck,
} from "./DiscoveryIcons";
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

const SYSTEM_BADGES = [
  { label: "ChatGPT", Icon: IconSparkChat },
  { label: "Gemini", Icon: IconTwinStar },
  { label: "Perplexity", Icon: IconCompassMark },
  { label: "Expanded AI", Icon: IconLayers },
  { label: "Google Maps", Icon: IconMapPin },
] as const;

const INDUSTRY_BADGES = [
  { label: "Hotels", Icon: IconHotel },
  { label: "Villas & Resorts", Icon: IconPalm },
  { label: "Restaurants & Cafés", Icon: IconFork },
  { label: "Spas & Wellness", Icon: IconLotus },
  { label: "Beach Clubs", Icon: IconUmbrella },
  { label: "Experiences", Icon: IconInfinity },
] as const;

/** Round step/level badge — "1", "2", "3", "4" — reused by the progression
 * band and echoed on each paid card so a visitor can match a card to its
 * step without rereading either. */
function StepBadge({ n, tone = "dark" }: { n: number; tone?: "dark" | "copper" }) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif text-base font-semibold",
        tone === "dark" ? "bg-charcoal text-ivory" : "bg-copper-deep text-surface",
      )}
    >
      {n}
    </span>
  );
}

/** A short copper bar marking "a new block starts here" — the page's one
 * repeating cue for where information changes topic, echoed at the top of
 * every major section so a reader can scan the page by these alone. */
function SectionMark({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={cn("mb-5 block h-[3px] w-12 rounded-full", dark ? "bg-link-dark" : "bg-copper-deep")}
      aria-hidden
    />
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
  dark = false,
  tint = false,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  dark?: boolean;
  /** A faint warm band, the way the reference composition separates blocks by fill instead of only by rule. */
  tint?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 py-14 sm:py-16",
        dark ? "bg-charcoal text-ivory" : tint ? "border-b border-line bg-warm-canvas text-ink" : "border-b border-line bg-ivory text-ink",
      )}
    >
      <Container>
        {/* Two beats per section — the opener, then its content — rather than
            each element arriving on its own, which reads as scattered. */}
        <Reveal>
          <SectionMark dark={dark} />
          {eyebrow ? <Eyebrow onDark={dark}>{eyebrow}</Eyebrow> : null}
          <h2 className="max-w-3xl text-h2">{title}</h2>
        </Reveal>
        <Reveal delay={90} className="mt-6 space-y-5 leading-relaxed">
          {children}
        </Reveal>
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

/** The one fact per card worth catching at a glance — the thing that most
 * distinguishes this tier from its neighbors. Matched against the existing
 * feature text verbatim; nothing here changes what a plan includes. */
const KEY_FEATURE_HINT: Record<string, string> = {
  "Visibility Snapshot": "Automatic recommendations included",
  "Full Discovery Landscape": "Expanded recommendations included",
  "Verified Discovery & Competitive Audit": "Manual Google Ask Maps",
  "Managed Discovery Growth": "Selena-owned implementation",
};

/**
 * One of the four paid product cards, in the tighter, numbered-badge shape
 * the reference composition uses. Every fact rendered here (price, systems,
 * scope, features) comes straight from the plan object in sales.ts /
 * commercial-facts.ts — nothing is authored in this component. Rows still
 * share one subgrid at `lg` so Systems/Scope/features line up card to card.
 */
function PaidPlanCard({ plan, shorthand, step }: { plan: PricingPlan; shorthand: string; step: number }) {
  const featured = plan.featured === true;
  const keyHint = KEY_FEATURE_HINT[plan.name];
  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border bg-surface p-5 shadow-[0_20px_45px_-28px_rgba(38,26,14,0.35)] sm:p-6",
        "lg:grid lg:[grid-row:1/-1] lg:[grid-template-rows:subgrid]",
        featured
          ? "border-copper-deep bg-copper/[0.06] shadow-[0_24px_55px_-24px_rgba(143,92,52,0.4)]"
          : "border-line",
      )}
    >
      <div className="flex items-center gap-3">
        <StepBadge n={step} tone="copper" />
        <p
          className={cn(
            "inline-flex rounded-full px-2.5 py-1 text-xs font-medium leading-snug",
            featured ? "bg-copper-deep/15 text-copper-deep" : "bg-line/60 text-ink/70",
          )}
        >
          {plan.statusLabel}
        </p>
      </div>
      <h3 className="mt-3 self-start text-h3">{plan.name}</h3>
      <p className="mt-2 self-start font-serif text-3xl font-semibold leading-none tabular-nums">{plan.price}</p>
      <p className="mt-3 self-start text-xs font-semibold uppercase tracking-[0.1em] text-copper-deep">{shorthand}</p>
      <p className="mt-4 self-start text-base font-semibold leading-snug">{plan.description}</p>

      <div className="mt-4 self-start border-t border-line pt-3 text-xs">
        <p className="font-semibold text-copper-deep">Systems</p>
        <p className="mt-1 leading-snug text-ink/85">{plan.systemsLabel}</p>
      </div>
      <div className="mt-2.5 self-start border-b border-line pb-3 text-xs">
        <p className="font-semibold text-copper-deep">Scope</p>
        <p className="mt-1 leading-snug text-ink/85">{plan.volumeLabel}</p>
      </div>

      <ul className="mt-1 space-y-2">
        {plan.features.map((feature) => {
          const isKey = keyHint ? feature.includes(keyHint) : false;
          return (
            <li
              key={feature}
              className={cn(
                "flex items-start gap-2 text-xs leading-snug",
                isKey ? "font-semibold text-ink" : "text-ink/85",
              )}
            >
              <IconCheck className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", isKey ? "text-copper-deep" : "text-copper/70")} />
              <span>{feature}</span>
            </li>
          );
        })}
      </ul>

      {plan.href && plan.ctaLabel ? (
        <div className="mt-5 self-start" data-visibility-cta={ctaKeyForPlan(plan)}>
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
      {/* 1 — HERO: text left, photo bleeding to the edge on the right — matching the approved reference's split fold */}
      <section className="relative overflow-hidden bg-charcoal pb-0 pt-28 text-ivory sm:pt-32">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <div className="px-5 pb-12 sm:px-8 lg:py-16 lg:pl-8 lg:pr-0 lg:pb-24">
            <div className="mx-auto max-w-xl lg:mx-0">
              <p className="text-sm font-semibold text-ivory">{copy.hero.eyebrow}</p>
              <h1 className="mt-5 text-h2 sm:text-h1">{copy.hero.title}</h1>
              <p className="mt-6 text-lg">{copy.hero.intro}</p>
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
              <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-t border-line-dark pt-6 text-sm text-ivory/85">
                {SYSTEM_BADGES.map(({ label, Icon }) => (
                  <li key={label} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0 text-copper" />
                    {label}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-ivory/60">
                {copy.hero.gate} Local Discovery where verified. No card required to check readiness.
              </p>
            </div>
          </div>
          <div className="relative min-h-[22rem] w-full overflow-hidden rounded-bl-[3rem] lg:min-h-full">
            <CinemaImage
              src="/media/cinematic/pages/visibility-hero-terrace.webp"
              alt="A table set for dinner on a seaside terrace at golden hour, warm light over the water"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent" />
            <div className="absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-charcoal/70 to-transparent lg:block" />
          </div>
        </div>
      </section>

      {/* 2 — FREE, a single compact band the way the reference sets it apart from the paid ladder */}
      <section id="readiness" className="scroll-mt-24 border-b border-line bg-copper/[0.05] py-10 sm:py-12">
        <Container>
          <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <SectionMark />
              <Eyebrow>START HERE</Eyebrow>
              <h2 className="text-h2">Check if AI can find and understand your website — free.</h2>
              <p className="mt-4 text-lg leading-relaxed">
                Before measuring who AI recommends, check whether AI systems can access and understand your website
                in the first place.
              </p>
              <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                {copy.free.checks.map((check) => (
                  <li key={check} className="flex items-start gap-2 text-sm leading-snug">
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-copper-deep" />
                    <span>{check}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 max-w-2xl text-sm font-semibold text-muted">{copy.free.boundary}</p>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
              <Button href={links.free}>Check AI readiness — free</Button>
              <p className="text-sm text-muted">No card required.</p>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* 3 — Competitive intelligence */}
      <Section id="competitors" eyebrow="COMPETITIVE INTELLIGENCE" title={discoveryHeadings.preview} tint>
        <p className="max-w-3xl text-lg">{copy.preview.intro}</p>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-5">
          {copy.preview.concepts.map((concept, index) => (
            <Reveal key={concept.title} delay={index * 80} className="border-t-2 border-copper-deep pt-4">
              <dt className="font-semibold text-copper-deep">{concept.title}</dt>
              <dd className="mt-2 text-sm leading-relaxed">{concept.body}</dd>
            </Reveal>
          ))}
        </dl>
        <p className="font-semibold">{copy.preview.label}</p>
        <div className="space-y-6 md:hidden">
          {copy.preview.rows.map((row) => (
            <article key={row.intent} className="rounded-xl border border-line bg-surface p-5">
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
        <div className="hidden overflow-x-auto rounded-xl border border-line bg-surface md:block">
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

      {/* 4 — Four-step commercial progression, numbered like the reference composition */}
      <Section eyebrow="FOUR WAYS TO GO FURTHER" title="From insight to action.">
        <p className="max-w-3xl text-lg">Choose how far you want Selena to go.</p>
        <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {discoveryDecisionSteps.map((step, index) => (
            <Reveal key={step.label} as="li" delay={index * 80}>
              <div className="flex items-center gap-3">
                <StepBadge n={index + 1} tone="copper" />
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-copper-deep">{PROGRESSION_STAGES[index]}</p>
              </div>
              <p className="mt-4 font-serif text-h2">{paidPlans[index].price}</p>
              <h3 className="mt-2 font-sans text-base font-semibold">{step.label}</h3>
              <p className="mt-3 text-sm leading-relaxed">{step.body}</p>
            </Reveal>
          ))}
        </ol>
        <p className="max-w-3xl font-semibold">MEASURE → COMPARE → RECOMMEND → INVESTIGATE → DECIDE → EXECUTE → RECHECK</p>
      </Section>

      {/* 5 — Four paid product cards */}
      <Section id="plans" eyebrow="PLANS" title={discoveryHeadings.plans} tint>
        <p className="max-w-3xl">
          {tracks[0].intro} Competitors, sources and automatic recommendations are included in Visibility Snapshot.
          They are not reserved for the higher-priced Audit.
        </p>
        <div
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:[grid-template-rows:repeat(9,auto)]"
          data-visibility-view="pricing"
        >
          {paidPlans.map((plan, index) => (
            <PaidPlanCard key={plan.name} plan={plan} shorthand={discoveryDecisionSteps[index].label} step={index + 1} />
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
          <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-muted">Built for hospitality and experience businesses.</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink/80">
              {INDUSTRY_BADGES.map(({ label, Icon }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon className="h-5 w-5 shrink-0 text-copper-deep" />
                  {label}
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
