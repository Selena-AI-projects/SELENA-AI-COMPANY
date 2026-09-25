import { buildMetadata } from "@/lib/metadata";
import { buildAboutStructuredData } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { FounderPortrait } from "@/components/ui/FounderPortrait";
import { CinemaFrame } from "@/components/ui/CinemaFrame";
import { pageCinema } from "@/lib/data/page-cinema";

const cinema = pageCinema("en").about;

export const metadata = buildMetadata({
  title: "About Selena Systems",
  description:
    "How Selena Systems designs AI Automation and measures AI Visibility with clear evidence, practical handover and human control.",
  path: "/en/about",
  locale: "en_US",
  languages: {
    "x-default": "/en/about",
    en: "/en/about",
    ru: "/about",
  },
});

const focusAreas = [
  { outcome: "Dated, disclosed measurement instead of a mystery score", area: "AI Visibility" },
  { outcome: "Practical workflows across sales, operations, content and knowledge", area: "AI Automation" },
  { outcome: "Working rules, testing, team training and written handover", area: "Implementation" },
  { outcome: "Methods, limits and evidence published in the open", area: "Research · Selena Lab" },
];

const method = [
  {
    title: "Diagnose the work",
    text: "Start with the real process, its inputs, decisions, handoffs and failure points before selecting a tool.",
  },
  {
    title: "Set the boundary",
    text: "Define what AI can assist with, what remains human-approved and what evidence will show whether the change works.",
  },
  {
    title: "Build and hand over",
    text: "Implement the approved scope, test edge cases and leave the team with clear operating instructions and ownership.",
  },
];

const principles = [
  "Evidence before interpretation",
  "One clear owner for every workflow",
  "Human approval where mistakes carry real cost",
  "No fabricated results, urgency or ranking guarantees",
];

// The two rules a visitor should take away first.
const keyPrinciples = new Set(["Evidence before interpretation", "No fabricated results, urgency or ranking guarantees"]);

export default function EnglishAboutPage() {
  return (
    <>
      <JsonLd data={buildAboutStructuredData("en")} />
      <PageHero
        eyebrow="About Selena Systems"
        title="AI systems built around real business work"
        intro="Selena Systems is a founder-led practice with two connected directions. AI Visibility measures what public evidence and named AI systems show. AI Automation designs and implements the internal workflows behind the business. Selena Lab supports both with research, guides and documented limits."
        media={{
          video: { src: cinema.hero.video, poster: cinema.hero.poster },
          alt: cinema.hero.alt,
        }}
      >
        <Button href="/en/contact" size="lg">
          Book an AI Audit
        </Button>
      </PageHero>

      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <Reveal delay={100}>
              <FounderPortrait locale="en" />
            </Reveal>
            <div>
              <SectionHeader
                eyebrow="What we do"
                headline="Turn scattered AI experiments into operating systems"
                intro="The work begins with the business process and the decision it needs to support. Tools, models and automations are selected only after the operating problem and evidence boundary are clear."
              />
              <Reveal delay={150}>
                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {focusAreas.map((item) => (
                    <li
                      key={item.outcome}
                      className="rounded-xl border border-l-4 border-line border-l-rose bg-surface px-5 py-4"
                    >
                      <p className="text-lg font-semibold leading-snug text-rose">{item.outcome}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{item.area}</p>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-line bg-surface py-20 sm:py-28">
        <Container>
          <SectionHeader
            eyebrow="Method"
            headline="Process first, then the right AI layer"
            intro="Every engagement follows the same decision logic while the implementation scope changes with the workflow."
          />
          <Reveal className="mt-10">
            <CinemaFrame
              image={cinema.method.image}
              alt={cinema.method.alt}
              caption={cinema.method.caption}
              sizes="(min-width: 1280px) 1200px, 100vw"
            />
          </Reveal>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {method.map((step, index) => (
              <Reveal as="li" key={step.title} delay={index * 70} className="border-t-2 border-copper/45 pt-5">
                <span className="font-serif text-xl font-semibold text-copper-deep">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container size="narrow">
          <SectionHeader
            eyebrow="Working principles"
            headline="Clear evidence and clear limits"
            intro="A useful system needs defined ownership, observable evidence and an honest statement of what the work cannot guarantee."
          />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {principles.map((principle) => (
              <li
                key={principle}
                className={keyPrinciples.has(principle) ? "border-t-2 border-ink pt-4 text-lg font-semibold text-rose" : "border-t-2 border-ink pt-4 text-lg font-medium text-ink"}
              >
                {principle}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-charcoal py-20 text-ivory sm:py-28">
        <Container size="narrow" className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-copper">Next step</p>
          <h2 className="mt-4 text-h2 text-ivory">Start with one workflow that should not stay manual</h2>
          <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-ivory/75">
            Describe the process in plain language. Selena Systems will map the bottleneck, the safe automation boundary and the practical first scope.
          </p>
          <Button href="/en/contact" variant="onDark" size="lg" className="mt-8">
            Book an AI Audit
          </Button>
        </Container>
      </section>
    </>
  );
}
