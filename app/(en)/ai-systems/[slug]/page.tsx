import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/metadata";
import { commercialFacts } from "@/lib/commercial-facts";
import {
  buildAiAutomationOfferStructuredData,
  type AiAutomationOfferSlug,
} from "@/lib/structured-data";
import { PageHero } from "@/components/sections/PageHero";
import { FAQSection } from "@/components/sections/FAQSection";
import { OperatingRangeBand } from "@/components/sections/OperatingRangeBand";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { offerDetail } from "@/lib/data/ai-automation-detail";

const details = {
  "ai-audit": {
    title: "AI Audit",
    price: commercialFacts.aiSystems.audit.en,
    intro: "A focused diagnostic for founders who need clarity before they invest in a build.",
    answer:
      "An AI Audit is a pre-build review of one business workflow. It maps the current process, identifies where AI can help, records the human approval boundary and turns the evidence into a scoped next-step brief.",
    items: ["Workflow review", "AI opportunity map", "Priority recommendations", "A scoped next-step brief"],
    bestFor: [
      "A process is visibly slow or repetitive, but the cause is not yet clear",
      "Several tools or AI ideas are competing for budget and attention",
      "The team needs a practical scope before committing to implementation",
    ],
    steps: [
      { title: "Evidence", text: "Review the workflow, inputs, tools, handoffs, decisions and failure points." },
      { title: "Opportunity map", text: "Separate useful AI assistance from work that should stay manual or human-approved." },
      { title: "Decision", text: "Prioritize the first build, dependencies, risks and the boundary of the next engagement." },
    ],
  },
  "ai-sprint": {
    title: "4-Week AI Sprint",
    price: commercialFacts.aiSystems.sprint.en,
    intro:
      "In four focused weeks we take the one process that hurts most and hand over a working system your team is trained to run.",
    answer:
      "The 4-Week AI Sprint turns one approved workflow into a working operating layer. The engagement includes design, implementation, testing, team training and written handover instructions.",
    items: [
      "A working build: configured automations, prompts and rules — not a mockup",
      "Step-by-step instructions for your team, in plain language",
      "Training: we show your people how to run the system",
      "Edge-case testing and a documented handover",
    ],
    bestFor: [
      "One workflow has a clear owner and a measurable operating problem",
      "The required tools and decision-makers can be available during the build",
      "The team wants a working first system without expanding into a company-wide transformation",
    ],
    steps: [
      { title: "Design", text: "Confirm the workflow, data flow, approval rules, tools and acceptance criteria." },
      { title: "Build and test", text: "Configure the system, test normal and edge cases and record unresolved limits." },
      { title: "Handover", text: "Train the team, provide written instructions and confirm who owns daily operation." },
    ],
  },
  "business-os": {
    title: "AI Business OS",
    price: commercialFacts.aiSystems.businessOs.en,
    intro:
      "A turnkey 8-week implementation: connected sales, operations, knowledge and automation systems running inside your company.",
    answer:
      "AI Business OS is an eight-week implementation for connected workflows that cannot be solved as one isolated automation. It coordinates sales, operations, knowledge and approval rules as one operating model.",
    items: [
      "You say what has to work — we design it and implement it inside your company",
      "Written instructions for every role: what to do and how, in plain language",
      "Team training — you are not left alone with documentation",
      "Human approval boundaries and a full handover: the system runs, the rules are written down",
    ],
    bestFor: [
      "Several teams or workflows depend on the same customer, process or knowledge data",
      "Point automations already exist but ownership and handoffs remain fragmented",
      "Leadership can assign process owners and approve an eight-week implementation scope",
    ],
    steps: [
      { title: "Operating model", text: "Map shared sources, responsibilities, approvals and the order in which systems must change." },
      { title: "Connected implementation", text: "Build and test the agreed sales, operations, knowledge and automation layers." },
      { title: "Adoption", text: "Train each role, publish operating instructions and hand over ownership with known limits." },
    ],
  },
} as const;

type Slug = keyof typeof details;

export function generateStaticParams() {
  return Object.keys(details).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const detail = details[slug as Slug];
  const metadataDescriptions: Record<string, string> = {
    "ai-audit":
      "Map your workflows and AI opportunities before building, with a focused scope, deliverables and a practical next step for your team.",
    "ai-sprint":
      "Design, build and test one priority AI workflow in four focused weeks, with a practical handover your team can run after launch.",
    "business-os":
      "A turnkey 8-week implementation of a connected AI operating layer across sales, operations, knowledge and automation, with your team trained.",
  };
  return buildMetadata({
    title: detail ? `${detail.title} | AI Automation` : "AI Automation",
    description: metadataDescriptions[slug] ?? "Custom AI Automation work maps your workflows, priorities and approval boundaries before a practical build begins.",
    path: `/ai-systems/${slug}`,
    locale: "en_US",
  });
}

export default async function AISystemDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const detail = details[slug as Slug];
  if (!detail) notFound();
  const extra = offerDetail[slug as Slug];

  return (
    <>
      <JsonLd data={buildAiAutomationOfferStructuredData(slug as AiAutomationOfferSlug)} />
      <PageHero eyebrow="AI Automation" title={detail.title} intro={detail.intro}>
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-serif text-2xl font-semibold text-copper-deep">{detail.price}</span>
          <Button href="/en/contact" size="lg">Discuss the scope</Button>
        </div>
      </PageHero>
      <section className="bg-ivory py-20 sm:py-28">
        <Container size="narrow">
          <p className="text-lg leading-relaxed text-ink/85">{detail.answer}</p>
          <h2 className="mt-10 text-h2 text-ink">What the engagement covers</h2>
          <ul className="mt-8 grid gap-4">
            {detail.items.map((item) => (
              <li key={item} className="border-t border-line py-4 text-lg leading-relaxed text-ink/85">{item}</li>
            ))}
          </ul>
          <p className="mt-10 text-sm leading-relaxed text-muted">
            Final scope, timeline and implementation boundaries are confirmed in conversation. AI Automation is custom work, not an AI Visibility subscription.
          </p>
        </Container>
      </section>
      <section className="border-y border-line bg-surface py-20 sm:py-28">
        <Container size="narrow">
          <h2 className="text-h2 text-ink">When this scope fits</h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-3">
            {detail.bestFor.map((item) => (
              <li key={item} className="border-t-2 border-sage/60 pt-4 leading-relaxed text-ink/80">
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <section className="bg-ivory py-20 sm:py-28">
        <Container size="narrow">
          <h2 className="text-h2 text-ink">How the engagement works</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-3">
            {detail.steps.map((step, index) => (
              <li key={step.title} className="border-t border-line pt-5">
                <span className="font-serif text-xl font-semibold text-copper-deep">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* The steps above say what happens; this says when you hold what. A
          buyer of an expensive build asks the second question, and the page
          used to end before it. */}
      <section className="border-t border-line bg-charcoal py-20 text-ivory sm:py-28">
        <Container size="narrow">
          <h2 className="text-h2 text-ivory">{extra.timelineTitle}</h2>
          <p className="mt-5 max-w-2xl leading-relaxed text-ivory/70">{extra.timelineNote}</p>
          <ol className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line-dark bg-line-dark">
            {extra.timeline.map((point) => (
              <li key={point.when} className="grid gap-2 bg-charcoal-2 p-6 sm:grid-cols-[9rem_1fr] sm:gap-7 sm:p-7">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-copper">
                  {point.when}
                </p>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-ivory">{point.title}</h3>
                  <p className="mt-2 leading-relaxed text-ivory/72">{point.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <OperatingRangeBand />

      <FAQSection items={extra.faq} headline="Before you commit" />
    </>
  );
}
