import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FAQSection } from "@/components/sections/FAQSection";
import { commercialFacts } from "@/lib/commercial-facts";
import { contactChannels } from "@/lib/site";
import { visibilityActivation } from "@/lib/visibility/activation";
import {
  auditTerms,
  auditTermsRu,
  discoveryHeadings,
  discoveryOrderCopy,
  discoveryLinks as links,
  discoverySales as copy,
  discoverySystems,
  discoveryTracks,
} from "@/lib/visibility/sales";
import type { VisibilityLocale } from "@/lib/visibility/types";

function Section({
  id,
  title,
  children,
  dark = false,
}: {
  id?: string;
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

export function DiscoverySales({ children }: { children: ReactNode }) {
  const tracks = discoveryTracks("en");
  const [snapshot, landscape] = tracks[0].plans;
  const [audit, managed] = tracks[1].plans;
  return (
    <div lang="en">
      <section className="bg-charcoal pb-12 pt-28 text-ivory sm:pt-32">
        <Container>
          <p className="max-w-3xl text-sm font-semibold text-ivory">{copy.hero.eyebrow}</p>
          <h1 className="mt-5 max-w-5xl text-h2 sm:text-h1">{copy.hero.title}</h1>
          <p className="mt-6 max-w-3xl text-lg">{copy.hero.intro}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <span data-visibility-cta="hero_free">
              <Button href={links.free} variant="onDark">
                Check AI readiness — free
              </Button>
            </span>
            <span data-visibility-cta="hero_plans">
              <Button href="#plans" variant="secondary">
                See plans
              </Button>
            </span>
          </div>
          <p className="mt-4 max-w-3xl text-sm">No card required. {copy.hero.gate}</p>
          <p className="mt-7 max-w-4xl text-sm">
            {[...discoverySystems.visitor, ...discoverySystems.api, "Google Maps", "Local AI"].join(" · ")}
          </p>
          <p className="mt-2 text-sm">Local Discovery where verified. Ask Maps: manual observation only.</p>
          <ul
            className="mt-8 grid gap-4 border-t border-line-dark pt-6 sm:grid-cols-2 lg:grid-cols-5"
            aria-label="The Selena product ladder"
          >
            {[
              ["FREE", "Can AI understand my website?", "#readiness"],
              [snapshot.price, "Where / who / sources / change", "#plans"],
              [landscape.price, "Full AI + Local landscape", "#plans"],
              [audit.price, "Why + what exactly", "#competitive-audit"],
              [managed.price, "Do + verify", "#managed"],
            ].map(([price, purpose, href]) => (
              <li key={price}>
                <a href={href} className="block min-h-11 py-2 underline decoration-ivory/40 underline-offset-4">
                  <strong className="block">{price}</strong>
                  <span className="mt-1 block text-sm">{purpose}</span>
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Section title={copy.problem.title}>
        <p>
          Illustrative scenarios — not measured findings. Selena serves hospitality and experience businesses globally;
          Bali is an initial operating market.
        </p>
        <div className="grid gap-8 md:grid-cols-3">
          {copy.problem.examples.map((example) => (
            <blockquote key={example.query} className="border-t border-line pt-5">
              <p className="font-serif text-h3">“{example.query}”</p>
              <p className="mt-3">{example.finding}</p>
            </blockquote>
          ))}
        </div>
      </Section>

      <Section title={discoveryHeadings.surfaces}>
        <p className="max-w-3xl">
          Hotels · Villas · Restaurants & Cafés · Spas & Wellness · Beach Clubs · Experience Businesses
        </p>
        <div className="grid gap-8 md:grid-cols-3">
          {copy.surfaces.map((surface) => (
            <div key={surface.title}>
              <h3 className="text-h3">{surface.title}</h3>
              <p className="mt-3">{surface.body}</p>
            </div>
          ))}
        </div>
        <List items={copy.answers} />
        <p className="font-semibold">One product. Multiple discovery surfaces.</p>
        <p>SEE → UNDERSTAND → DECIDE → DO → VERIFY</p>
      </Section>

      <Section title={discoveryHeadings.preview}>
        <p className="font-semibold">{copy.preview.label}</p>
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[38rem] text-left">
            <caption className="p-4 text-left">
              Three illustrative guest intents · visible: 1 · absent: 2. These are synthetic values.
            </caption>
            <thead>
              <tr>
                {["Tracked guest intent", "Tracked business", "Business shown", "Cited source"].map((label) => (
                  <th key={label} scope="col" className="border-t border-line p-4">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {copy.preview.rows.map((row) => (
                <tr key={row.intent}>
                  {Object.values(row).map((value) => (
                    <td key={value} className="border-t border-line p-4">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-h3">Sources by demo frequency</h3>
            <div className="mt-4">
              <List items={copy.preview.sources} />
            </div>
          </div>
          <div>
            <h3 className="text-h3">Competitive gap</h3>
            <p className="mt-4">{copy.preview.gap}</p>
            <p className="mt-3">
              Recurring competitors and movement: not established in this single-cycle demo. No real comparable history
              is shown.
            </p>
          </div>
        </div>
        <p className="max-w-3xl">{copy.preview.boundary}</p>
      </Section>

      <Section title={copy.telegram.title} dark>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="font-semibold">{!visibilityActivation.telegram && copy.telegram.preview}</p>
            <p className="mt-4 max-w-2xl">{copy.telegram.intro}</p>
            <p className="mt-5 max-w-2xl text-sm">{copy.telegram.boundary}</p>
          </div>
          <figure className="rounded-lg border border-line-dark bg-charcoal-2 p-6">
            <figcaption className="mb-5 font-semibold">Telegram digest · demo preview</figcaption>
            {copy.telegram.lines.map((line) => (
              <p key={line} className="mt-3">
                {line}
              </p>
            ))}
            <div className="mt-6" data-visibility-cta="telegram_preview">
              <Button href="#action-plan" variant="onDark">
                See sample recommended actions
              </Button>
            </div>
            <p className="mt-4 text-sm">
              Authenticated “Open full evidence” link: available after production delivery activation.
            </p>
          </figure>
        </div>
      </Section>

      <Section id="readiness" title={copy.free.title}>
        <p className="max-w-3xl">{copy.free.intro}</p>
        <List items={copy.free.checks} />
        <Button href={links.free}>Check AI readiness — free</Button>
        <p>No card required.</p>
        <p className="max-w-3xl font-semibold">{copy.free.boundary}</p>
        <Button href="#plans" variant="secondary">
          See Visibility Snapshot — $49/mo
        </Button>
      </Section>

      <Section id="plans" title={discoveryHeadings.plans}>
        <p className="max-w-3xl">
          {tracks[0].intro} Competitors and sources are included already in Visibility Snapshot.
        </p>
        <div className="grid gap-8 lg:grid-cols-2" data-visibility-view="pricing">
          {[snapshot, landscape].map((plan, i) => (
            <article
              key={plan.name}
              className={`flex flex-col rounded-lg border bg-surface p-6 sm:p-8 ${plan.featured ? "border-copper-deep" : "border-line"}`}
            >
              <p className="font-semibold text-copper-deep">{plan.statusLabel}</p>
              <h3 className="mt-3 text-h3">{plan.name}</h3>
              <p className="mt-3 font-serif text-h2">{plan.price}</p>
              <p className="mt-6 text-lg font-semibold">{plan.description}</p>
              <p className="mt-4">{plan.systemsLabel}</p>
              <p className="mt-4 text-sm">{plan.volumeLabel}</p>
              <div className="my-6">
                <List items={plan.features} />
              </div>
              <p className="mb-6 font-semibold">{plan.progressionLabel}</p>
              <div className="mt-auto" data-visibility-cta={i === 0 ? "snapshot" : "landscape"}>
                <Button href={plan.href!}>{plan.ctaLabel}</Button>
              </div>
            </article>
          ))}
        </div>
        <p className="max-w-3xl">
          Local Maps availability is confirmed per scope before an order. A verified owner/report flow does not
          establish a fully activated new-customer payment and measurement path.
        </p>
      </Section>

      <Section title={discoveryHeadings.bridge}>
        <p className="max-w-3xl text-lg">{copy.bridge}</p>
      </Section>

      <Section id="competitive-audit" title={discoveryHeadings.audit}>
        <p className="font-semibold">
          {audit.name} · {audit.price}
        </p>
        <p className="max-w-3xl text-lg">{copy.audit.intro}</p>
        <div className="grid gap-10 lg:grid-cols-3">
          <div>
            <h3 className="text-h3">Step 1 — We investigate.</h3>
            <div className="mt-5">
              <List items={copy.audit.investigation} />
            </div>
          </div>
          <div>
            <h3 className="text-h3">Step 2 — 60-minute Strategy Session</h3>
            <p className="mt-4">
              60 minutes with the owner, GM or authorized decision-maker. This is part of the product, not a free sales
              call.
            </p>
            <div className="mt-5">
              <List items={copy.audit.session} />
            </div>
          </div>
          <div>
            <h3 className="text-h3">Step 3 — Final Action Plan</h3>
            <p className="mt-4">Every approved action specifies:</p>
            <ul className="mt-4 space-y-2">
              {copy.audit.fields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
            <p className="mt-4">Priority: P1 / P2 / P3. Effort: Low / Medium / High.</p>
          </div>
        </div>
        <p className="max-w-3xl">Tracked status: {copy.audit.statuses}.</p>
        <List items={copy.audit.classes} />
        <div data-visibility-cta="audit">
          <Button href={links.audit}>{audit.ctaLabel}</Button>
        </div>
      </Section>
      <DiscoveryOrderSections locale="en" only="audit" />

      <Section id="action-plan" title={discoveryHeadings.actions}>
        <p className="font-semibold">
          Demo Action Plan · fictional examples, not client recommendations or verified outcomes.
        </p>
        <div className="grid gap-8 lg:grid-cols-2">
          {copy.actions.map((action) => (
            <article key={action.title} className="rounded-lg border border-line bg-surface p-6">
              <h3 className="text-h3">{action.title}</h3>
              <div className="mt-5">
                <List items={action.fields} />
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title={discoveryHeadings.choice}>
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="text-h3">Your team can execute</h3>
            <div className="mt-5">
              <List items={copy.diy} />
            </div>
          </div>
          <div>
            <h3 className="text-h3">Selena can execute</h3>
            <div className="mt-5">
              <List items={copy.execution} />
            </div>
          </div>
        </div>
        <p className="max-w-3xl font-semibold">{copy.trust}</p>
      </Section>

      <Section id="managed" title={discoveryHeadings.managed}>
        <p className="font-semibold">
          {managed.name} · {managed.price}
        </p>
        <p className="max-w-3xl text-lg">{copy.managed.intro}</p>
        <p className="font-semibold">{copy.managed.cycle}</p>
        <List items={managed.features} />
        <p className="max-w-3xl">{copy.managed.boundary}</p>
        <div data-visibility-cta="managed">
          <Button href={links.managed}>{managed.ctaLabel}</Button>
        </div>
      </Section>
      <DiscoveryOrderSections locale="en" only="managed" />

      <Section title={discoveryHeadings.methodology}>
        <div className="grid gap-8 md:grid-cols-2">
          <List items={copy.methodology} />
          <div>
            <p>
              Configuration Lock, Evidence Ledger, evidence IDs and methodology/version disclosure keep every comparable
              recheck tied to its original scope.
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

      <Section title={discoveryHeadings.proof}>
        <p className="font-semibold">Illustrative case · not a customer result.</p>
        <List items={copy.case} />
      </Section>
      <FAQSection items={[...copy.faq]} headline="Frequently asked questions" />
      <DiscoveryOrderSections locale="en" only="early" />

      <Section title={discoveryHeadings.final} dark>
        <p>START WITH EVIDENCE</p>
        <div className="flex flex-wrap gap-3">
          <Button href={links.free} variant="onDark">
            Check AI readiness — free
          </Button>
          <span data-visibility-cta="landscape">
            <Button href={links.landscape} variant="secondary">
              Request Full Discovery — $79/mo early access
            </Button>
          </span>
          <span data-visibility-cta="audit">
            <Button href={links.audit} variant="secondary">
              Book Competitive Audit — $399
            </Button>
          </span>
        </div>
        <p className="text-sm">Prices in USD. {commercialFacts.seller.legalName}. Live online payments are off.</p>
      </Section>
    </div>
  );
}
