import { buildMetadata } from "@/lib/metadata";
import { buildAiSystemsStructuredData } from "@/lib/structured-data";
import { commercialFacts } from "@/lib/commercial-facts";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = buildMetadata({
  title: "AI Automation for your business",
  description:
    "Selena Systems designs and builds practical AI systems for sales, content, knowledge, automation and operations. Separate from AI Visibility.",
  path: "/ai-systems",
  locale: "en_US",
});

const offers = [
  {
    name: "60-minute mini-audit",
    price: commercialFacts.aiSystems.miniAudit.en,
    description:
      "You send questions and process details in advance, the hour on Zoom goes into the work itself, and a short memo follows.",
    href: "/en/contact",
  },
  {
    name: "AI Audit",
    price: commercialFacts.aiSystems.audit.en,
    description: "Map the workflows, bottlenecks and highest-leverage AI opportunities before building.",
    href: "/ai-systems/ai-audit",
  },
  {
    name: "4-Week AI Sprint",
    price: commercialFacts.aiSystems.sprint.en,
    description:
      "We take one priority process and hand over a working, tested system your team is trained to run — in four focused weeks.",
    href: "/ai-systems/ai-sprint",
  },
  {
    name: "AI Business OS",
    price: commercialFacts.aiSystems.businessOs.en,
    description:
      "A turnkey 8-week implementation: connected sales, operations, knowledge and automation systems running inside your company, with your team trained.",
    href: "/ai-systems/business-os",
  },
] as const;

export default function AISystemsPage() {
  return (
    <>
      <JsonLd data={buildAiSystemsStructuredData("en")} />
      <PageHero
        eyebrow="AI Automation"
        title="Build the AI system your business actually needs."
        intro="AI Automation is Selena Systems' custom work: we diagnose, design and implement practical workflows inside your business. It is separate from AI Visibility, which measures how AI sees your public presence."
      >
        <div className="flex flex-wrap gap-4">
          <Button href="/en/contact" size="lg">Book an AI Audit</Button>
          <Button href="/visibility" variant="secondary" size="lg">Measure AI Visibility</Button>
        </div>
      </PageHero>

      <section className="bg-ivory py-20 sm:py-28">
        <Container size="wide">
          <div className="grid gap-5 md:grid-cols-2">
            {offers.map((offer, index) => (
              <Reveal key={offer.name} delay={index * 70} className="h-full">
                <Card className="flex h-full flex-col">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
                    <h2 className="text-h3 text-ink">{offer.name}</h2>
                    <span className="font-serif text-2xl font-semibold text-copper-deep">{offer.price}</span>
                  </div>
                  <p className="mt-5 flex-1 leading-relaxed text-muted">{offer.description}</p>
                  <Button href={offer.href} variant="secondary" className="mt-7 w-fit">
                    Discuss this format
                  </Button>
                </Card>
              </Reveal>
            ))}
          </div>
          <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-relaxed text-muted">
            Every engagement is scoped around your workflows, data and human approval boundaries. No guaranteed revenue or “automate everything” promise.
          </p>
        </Container>
      </section>
    </>
  );
}
