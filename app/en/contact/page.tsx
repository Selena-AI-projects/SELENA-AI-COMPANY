import { buildMetadata } from "@/lib/metadata";
import { contactChannels } from "@/lib/site";
import { EnglishContactForm } from "@/components/forms/EnglishContactForm";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { buildContactStructuredData } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = buildMetadata({
  title: "Book an AI Audit",
  description:
    "Book an AI Audit with Selena Systems. Describe the manual workflow, bottleneck or customer process you want to improve and get a practical next step.",
  path: "/en/contact",
  locale: "en_US",
  languages: {
    "x-default": "/en/contact",
    en: "/en/contact",
    ru: "/contact",
  },
});

const nextSteps = [
  {
    title: "Brief review",
    text: "We review the workflow, business context and the manual work you want to reduce.",
  },
  {
    title: "Focused questions",
    text: "We clarify the inputs, tools, approval rules and the outcome the system needs to support.",
  },
  {
    title: "Recommended scope",
    text: "You receive a practical starting point: an AI Audit, a 4-Week Sprint or a broader Business OS build.",
  },
];

export default function EnglishContactPage() {
  return (
    <>
      <JsonLd data={buildContactStructuredData("en")} />
      <div lang="en">
      <PageHero
        eyebrow="Book an AI Audit"
        title="Start with one workflow that should not stay manual."
        intro="Describe the process in plain language. We will map the bottleneck, identify the right AI system and keep human approval where it matters."
      />

      <section className="pb-20 sm:pb-28">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
            <Reveal>
              <EnglishContactForm />
            </Reveal>

            <Reveal delay={150} className="lg:sticky lg:top-28">
              <aside aria-label="What happens after the brief">
                <h2 className="text-h3 text-ink">What happens next</h2>
                <ol className="mt-6 space-y-5">
                  {nextSteps.map((step, index) => (
                    <li key={step.title} className="relative flex gap-4 pb-1">
                      {index < nextSteps.length - 1 ? (
                        <span
                          aria-hidden="true"
                          className="absolute left-[15px] top-10 h-[calc(100%-1.5rem)] w-px bg-line"
                        />
                      ) : null}
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-copper/40 bg-copper/10 font-serif text-sm font-semibold text-copper-deep">
                        {index + 1}
                      </span>
                      <div className="pt-0.5">
                        <h3 className="font-semibold text-ink">{step.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted">{step.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                {contactChannels.length > 0 ? (
                  <div className="card-premium mt-8 p-5">
                    <p className="text-sm font-semibold text-ink">Direct contact</p>
                    <ul className="mt-3 space-y-2">
                      {contactChannels.map((channel) => (
                        <li key={channel.key}>
                          <a
                            href={channel.href}
                            className="text-sm font-medium text-copper-deep underline decoration-copper/40 underline-offset-2 transition-colors hover:text-ink hover:decoration-copper"
                          >
                            {channel.label}: {channel.value}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </aside>
            </Reveal>
          </div>
        </Container>
      </section>
      </div>
    </>
  );
}
