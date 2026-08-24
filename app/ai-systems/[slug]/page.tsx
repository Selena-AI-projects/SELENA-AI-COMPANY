import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/metadata";
import { commercialFacts } from "@/lib/commercial-facts";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

const details = {
  "ai-audit": {
    title: "AI Audit",
    price: commercialFacts.aiSystems.audit.en,
    intro: "A focused diagnostic for founders who need clarity before they invest in a build.",
    items: ["Workflow review", "AI opportunity map", "Priority recommendations", "A scoped next-step brief"],
  },
  "ai-sprint": {
    title: "4-Week AI Sprint",
    price: commercialFacts.aiSystems.sprint.en,
    intro:
      "In four focused weeks we take the one process that hurts most and hand over a working system your team is trained to run.",
    items: [
      "A working build: configured automations, prompts and rules — not a mockup",
      "Step-by-step instructions for your team, in plain language",
      "Training: we show your people how to run the system",
      "Edge-case testing and a documented handover",
    ],
  },
  "business-os": {
    title: "AI Business OS",
    price: commercialFacts.aiSystems.businessOs.en,
    intro:
      "A turnkey 8-week implementation: connected sales, operations, knowledge and automation systems running inside your company.",
    items: [
      "You say what has to work — we design it and implement it inside your company",
      "Written instructions for every role: what to do and how, in plain language",
      "Team training — you are not left alone with documentation",
      "Human approval boundaries and a full handover: the system runs, the rules are written down",
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

  return (
    <>
      <PageHero eyebrow="AI Automation" title={detail.title} intro={detail.intro}>
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-serif text-2xl font-semibold text-copper-deep">{detail.price}</span>
          <Button href="/en/contact" size="lg">Discuss the scope</Button>
        </div>
      </PageHero>
      <section className="bg-ivory py-20 sm:py-28">
        <Container size="narrow">
          <h2 className="text-h2 text-ink">What the engagement covers</h2>
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
    </>
  );
}
