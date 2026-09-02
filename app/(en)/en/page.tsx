import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { contactLinks, enCta, site } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { EnglishContactForm } from "@/components/forms/EnglishContactForm";

const title = "AI implementation and automation for practical business operations";
const description =
  "Selena Systems helps service businesses map routine work, choose useful AI scenarios, and implement automations, AI concierge flows, playbooks and training without heavy code.";

export const metadata: Metadata = {
  title: { absolute: `Selena Systems — ${title}` },
  description,
  alternates: {
    canonical: `${site.url}/en`,
    languages: {
      ru: `${site.url}/ru`,
      en: `${site.url}/en`,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: site.name,
    title: `Selena Systems — ${title}`,
    description,
    url: `${site.url}/en`,
  },
  twitter: {
    card: "summary_large_image",
    title: `Selena Systems — ${title}`,
    description,
  },
};

const timeLeaks = [
  "Requests sit between WhatsApp, Telegram, Instagram and CRM.",
  "The same client questions are answered manually every day.",
  "Content starts from a blank page and appears in bursts.",
  "Team knowledge lives in chats, voice notes and someone’s head.",
  "AI tools are used, but everyone gets a different result.",
];

const goalPaths = [
  {
    title: "I need a first AI use case",
    text: "Start with an opportunity map and pick one process worth testing.",
  },
  {
    title: "I want fewer repeated replies",
    text: "Build a concierge-style flow for FAQ, intake and handoff to a person.",
  },
  {
    title: "I need a content system",
    text: "Turn expert knowledge into repeatable posts, emails and lead magnets.",
  },
  {
    title: "My team needs shared rules",
    text: "Create prompts, review habits and a simple operating playbook.",
  },
];

const process = [
  {
    title: "Map the workflow",
    text: "What comes in, who touches it, where it stalls and what data already exists.",
  },
  {
    title: "Choose the AI scenario",
    text: "One useful automation or assistant, not a catalogue of tools.",
  },
  {
    title: "Build the first version",
    text: "No-code where possible, custom logic only when it is justified.",
  },
  {
    title: "Add review rules",
    text: "Define what AI can handle, what must be checked and when a person steps in.",
  },
];

const ladder = [
  {
    title: "AI opportunity map",
    label: "entry",
    text: "A short diagnostic that shows 3 starting points and what not to automate yet.",
  },
  {
    title: "AI audit",
    label: "diagnostic",
    text: "A deeper review of processes, tools, effort and first implementation plan.",
  },
  {
    title: "Implementation sprint",
    label: "build",
    text: "Automation, concierge flow, content engine or knowledge base prototype.",
  },
  {
    title: "Training and support",
    label: "adoption",
    text: "Prompts, playbooks and review habits so the system keeps working.",
  },
];

const services = [
  {
    title: "AI audit",
    text: "Find the tasks where AI can save time instead of adding another layer of chaos.",
    included: ["workflow map", "3-5 priority scenarios", "first-step plan"],
  },
  {
    title: "AI training",
    text: "Teach founders and teams to use AI on real business tasks, not abstract demos.",
    included: ["practical sessions", "prompt library", "team instructions"],
  },
  {
    title: "AI automation",
    text: "Remove manual work from requests, replies, CRM updates and document flows.",
    included: ["Make/Zapier flows", "draft replies", "CRM/Notion/sheet sync"],
  },
  {
    title: "AI content system",
    text: "Turn one expert idea into multiple formats without starting from zero every time.",
    included: ["content workflow", "tone prompts", "human editing step"],
  },
  {
    title: "AI concierge",
    text: "Handle repeated client questions with clear boundaries and handoff rules.",
    included: ["FAQ capture", "reply scenarios", "handoff conditions"],
  },
  {
    title: "AI knowledge base",
    text: "Organize team knowledge so both people and AI work from one source.",
    included: ["Notion structure", "team rules", "update process"],
  },
  {
    title: "AI product packaging",
    text: "Shape offers, pages and lead magnets using AI without losing human judgment.",
    included: ["offer structure", "page drafts", "editorial materials"],
  },
  {
    title: "AI support",
    text: "Improve the system after launch: test, adjust and train new people.",
    included: ["review sessions", "prompt updates", "team onboarding"],
  },
];

const cases = [
  {
    title: "Service business",
    before: "Admin answers price, booking and preparation questions one by one.",
    after: "FAQ flow drafts the answer and flags cases that need a person.",
  },
  {
    title: "Expert brand",
    before: "Posts, emails and lead magnets depend on mood and last-minute effort.",
    after: "One expert idea becomes a repeatable content package with review.",
  },
  {
    title: "Small team",
    before: "Every person writes prompts differently and stores knowledge separately.",
    after: "Shared prompts, knowledge base and review rules make output predictable.",
  },
];

const libraryItems = [
  "AI opportunity map",
  "7 places where AI removes manual routine",
  "5-day AI without chaos mini-course",
  "Tool-by-task guide for service businesses",
];

const trustRules = [
  "No revenue guarantees or fake savings claims.",
  "No sensitive client communication without human review.",
  "No automation before the process is clear enough.",
  "No endless tool catalogue: the workflow decides the stack.",
];

const faq = [
  {
    q: "Do I need to know which AI tool I want?",
    a: "No. Describe the process and what is not working. Tool choice comes after the diagnostic.",
  },
  {
    q: "Can we start with one task?",
    a: "Yes. That is usually the best start: one repeated process, one prototype, one review rule.",
  },
  {
    q: "Will AI replace my team?",
    a: "That is not the promise. AI removes routine and supports people. Judgment and responsibility stay human.",
  },
  {
    q: "Does this require coding?",
    a: "Often no. Many useful scenarios can be built with no-code tools and clear operating rules.",
  },
  {
    q: "Can you guarantee growth?",
    a: "No. Honest outcomes are time saved, clearer processes and more consistent execution.",
  },
];

function SectionIntro({
  eyebrow,
  title,
  text,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  text: string;
  dark?: boolean;
}) {
  return (
    <Reveal>
      <Badge tone={dark ? "onDark" : "copper"}>{eyebrow}</Badge>
      <h2 className={`mt-4 text-h2 ${dark ? "text-ivory" : "text-ink"}`}>{title}</h2>
      <p className={`mt-5 text-lg leading-relaxed ${dark ? "text-ivory/70" : "text-muted"}`}>
        {text}
      </p>
    </Reveal>
  );
}

export default function EnglishPage() {
  return (
    <div lang="en">
      <section className="bg-warm-canvas relative overflow-hidden pt-28 sm:pt-36">
        <Container size="wide" className="relative">
          <div className="grid items-center gap-12 pb-20 sm:pb-28 lg:grid-cols-[0.88fr_1.12fr]">
            <Reveal>
              <Badge tone="copper">AI implementation for business operations</Badge>
              <h1 className="mt-6 font-serif text-display font-semibold text-ink">
                Find where AI actually belongs in your business.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                We map requests, replies, content, CRM and team routines. Then
                we build AI scenarios, automations and working rules without
                heavy code.
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <Button href={enCta.primary.href} size="lg">
                  {enCta.primary.label}
                </Button>
                <Button href={enCta.secondary.href} size="lg" variant="secondary">
                  {enCta.secondary.label}
                </Button>
              </div>
              <p className="mt-7 flex items-center gap-3 text-sm font-medium text-ink/70">
                <span className="inline-block h-px w-8 bg-copper" aria-hidden />
                Process first. Then the right tool.
              </p>
            </Reveal>

            <Reveal delay={120}>
              <Image
                src="/media/selena-systems-process-visual.png"
                width={1600}
                height={1100}
                alt="Selena Systems process visual showing messy business inputs becoming an AI map, automation and playbook."
                priority
                className="h-auto w-full rounded-[1.25rem] border border-line shadow-[0_28px_80px_-52px_rgba(24,22,20,0.55)]"
              />
            </Reveal>
          </div>
        </Container>
      </section>

      <section id="diagnostic" className="bg-surface py-20 sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionIntro
              eyebrow="diagnostic"
              title="The first question is not “which tool?”"
              text="The first question is where time leaks, where the process is stable enough, and where a person still needs to stay in control."
            />
            <div className="border-y border-line">
              {timeLeaks.map((item, index) => (
                <Reveal key={item} delay={index * 70}>
                  <div className="grid gap-4 border-b border-line py-5 last:border-b-0 md:grid-cols-[4rem_1fr]">
                    <span className="font-serif text-3xl text-copper-deep">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-lg leading-relaxed text-ink/82">{item}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-ivory py-20 sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <Reveal>
              <Badge tone="copper">choose a starting point</Badge>
              <h2 className="mt-4 text-h2 text-ink">Different goals, different first scenarios</h2>
              <p className="mt-5 text-lg leading-relaxed text-muted">
                Selena Systems is not a single product. It is a way to choose the right
                first AI use case for the business in front of us.
              </p>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              {goalPaths.map((goal, index) => (
                <Reveal key={goal.title} delay={index * 80}>
                  <div className="h-full rounded-[1rem] border border-line bg-surface p-5">
                    <p className="font-serif text-2xl text-copper-deep">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-4 text-h3 text-ink">{goal.title}</h3>
                    <p className="mt-3 leading-relaxed text-muted">{goal.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-charcoal py-20 text-ivory sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <SectionIntro
              dark
              eyebrow="free entry"
              title="Start with an AI opportunity map"
              text="A short brief turns scattered context into a first map: what can be tested, what needs preparation and what should not be automated yet."
            />
            <Reveal delay={120}>
              <div className="rounded-[1.25rem] border border-line-dark bg-charcoal-2 p-6 shadow-[0_22px_80px_-48px_rgba(0,0,0,0.9)] sm:p-8">
                <div className="grid gap-6 sm:grid-cols-3">
                  {["3 candidates", "1 first step", "clear limits"].map((item) => (
                    <div key={item} className="border-y border-line-dark py-5">
                      <p className="font-serif text-3xl text-copper">{item}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ivory/72">
                  The map is not a full audit and not a promise of savings. It
                  is a clean way to decide where the first conversation should go.
                </p>
                <div className="mt-8">
                  <Button href="#contact" variant="onDark" size="lg">
                    Get the map
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section id="process" className="bg-surface py-20 sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <SectionIntro
              eyebrow="method"
              title="A calm implementation loop"
              text="No tool catalogue. No magic claims. One business process, one useful scenario, one working habit at a time."
            />
            <ol className="border-y border-line">
              {process.map((item, index) => (
                <Reveal key={item.title} as="li" delay={index * 80}>
                  <div className="grid gap-4 border-b border-line py-6 last:border-b-0 md:grid-cols-[5rem_1fr]">
                    <span className="font-serif text-3xl text-copper-deep">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-h3 text-ink">{item.title}</h3>
                      <p className="mt-2 leading-relaxed text-muted">{item.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="bg-ivory py-20 sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr]">
            <SectionIntro
              eyebrow="offer ladder"
              title="From free map to working system"
              text="The path can stay small. We only move to implementation when the process and expected behavior are clear."
            />
            <div className="border-y border-line">
              {ladder.map((item, index) => (
                <Reveal key={item.title} delay={index * 80}>
                  <div className="grid gap-4 border-b border-line py-6 last:border-b-0 md:grid-cols-[4rem_1fr_8rem] md:items-center">
                    <span className="font-serif text-3xl text-copper-deep">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-h3 text-ink">{item.title}</h3>
                      <p className="mt-2 leading-relaxed text-muted">{item.text}</p>
                    </div>
                    <span className="rounded-full border border-line px-3 py-1 text-center text-xs font-semibold uppercase text-muted">
                      {item.label}
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section id="services" className="bg-surface py-20 sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr]">
            <SectionIntro
              eyebrow="services"
              title="The full service layer"
              text="Selena Systems covers diagnostic work, training, automation, content systems, concierge flows, knowledge bases, packaging and ongoing support."
            />
            <div className="grid gap-5 md:grid-cols-2">
              {services.map((service, index) => (
                <Reveal key={service.title} delay={index * 55}>
                  <div className="card-premium flex h-full flex-col p-6">
                    <span className="font-serif text-sm font-semibold tracking-[0.18em] text-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-4 text-h3 text-ink">{service.title}</h3>
                    <p className="mt-3 leading-relaxed text-muted">{service.text}</p>
                    <ul className="mt-5 space-y-2 border-t border-line pt-4 text-sm text-ink/78">
                      {service.included.map((included) => (
                        <li key={included} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-copper" />
                          <span>{included}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section id="cases" className="bg-charcoal py-20 text-ivory sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr]">
            <SectionIntro
              dark
              eyebrow="examples"
              title="What changes in the business"
              text="The examples are intentionally plain. The value is not in drama; it is in removing repeated work and making decisions easier."
            />
            <div className="space-y-5">
              {cases.map((item, index) => (
                <Reveal key={item.title} delay={index * 90}>
                  <div className="grid gap-5 border-y border-line-dark py-6 md:grid-cols-[10rem_1fr_1fr]">
                    <h3 className="font-serif text-2xl font-semibold text-ivory">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-ivory/58">
                      <span className="block text-xs font-semibold uppercase text-copper">before</span>
                      {item.before}
                    </p>
                    <p className="text-sm leading-relaxed text-ivory/78">
                      <span className="block text-xs font-semibold uppercase text-copper">after</span>
                      {item.after}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section id="library" className="bg-ivory py-20 sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <Reveal>
              <Image
                src="/media/selena-systems-library-visual.png"
                width={1500}
                height={1000}
                alt="Selena Systems lead library visual with AI playbooks and diagnostic assets."
                className="h-auto w-full rounded-[1.25rem] border border-line shadow-[0_24px_70px_-48px_rgba(24,22,20,0.45)]"
              />
            </Reveal>
            <Reveal delay={120}>
              <Badge tone="copper">library and waitlist</Badge>
              <h2 className="mt-4 text-h2 text-ink">Lead magnets become an operating library</h2>
              <p className="mt-5 text-lg leading-relaxed text-muted">
                Start with the AI opportunity map. Then build checklists,
                playbooks and content assets that teach the business how to use
                AI without chaos.
              </p>
              <ol className="mt-8 border-y border-line">
                {libraryItems.map((item, index) => (
                  <li key={item} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-line py-4 last:border-b-0">
                    <span className="font-serif text-2xl text-copper-deep">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-medium text-ink">{item}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="bg-surface py-20 sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <Reveal>
              <Image
                src="/images/founder/selena.jpg"
                width={900}
                height={1100}
                alt="Selena, founder of Selena Systems."
                className="mx-auto h-auto max-h-[34rem] w-full max-w-md rounded-[1.25rem] border border-line object-cover shadow-[0_24px_70px_-48px_rgba(24,22,20,0.45)]"
              />
            </Reveal>
            <Reveal delay={120}>
              <Badge tone="copper">founder-led</Badge>
              <h2 className="mt-4 text-h2 text-ink">Small enough to stay close to the process</h2>
              <p className="mt-5 text-lg leading-relaxed text-muted">
                Selena Systems is built for entrepreneurs, experts and small teams that
                need practical AI adoption, not a heavy transformation program.
                The work starts with the real routine: messages, documents,
                content, CRM and team decisions.
              </p>
              <p className="mt-5 text-lg leading-relaxed text-muted">
                Every useful AI system needs boundaries. That is why the work
                includes prompts, data structure, handoff rules and human review.
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="bg-charcoal py-20 text-ivory sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr]">
            <SectionIntro
              dark
              eyebrow="trust boundaries"
              title="What Selena Systems will not promise"
              text="Premium AI work needs restraint. Clear limits protect the client, the team and the end user."
            />
            <ul className="border-y border-line-dark">
              {trustRules.map((rule, index) => (
                <Reveal key={rule} as="li" delay={index * 80}>
                  <div className="grid gap-4 border-b border-line-dark py-5 last:border-b-0 md:grid-cols-[4rem_1fr]">
                    <span className="font-serif text-3xl text-copper">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-lg leading-relaxed text-ivory/78">{rule}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="bg-ivory py-20 sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <SectionIntro
              eyebrow="AI without chaos"
              title="A weekly breakdown, not a feed of tools"
              text="One business task, one AI scenario, one tool or link, one mistake to avoid. That is the content engine behind the library."
            />
            <Reveal delay={120}>
              <div className="rounded-[1.25rem] border border-line bg-surface p-6 sm:p-8">
                <div className="grid grid-cols-3 border-y border-line text-center text-base font-semibold uppercase text-muted">
                  {["task", "scenario", "boundary"].map((item) => (
                    <span key={item} className="border-r border-line py-3 last:border-r-0">
                      {item}
                    </span>
                  ))}
                </div>
                <h3 className="mt-7 font-serif text-3xl font-semibold text-ink">
                  Requests should not live in someone’s head
                </h3>
                <p className="mt-4 leading-relaxed text-muted">
                  Each issue turns a repeated workflow into a practical
                  decision: automate, document, delegate or leave it human.
                </p>
                <div className="mt-7">
                  <Button href="#contact">Join the waitlist</Button>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="bg-surface py-20 sm:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Badge tone="copper">FAQ</Badge>
            <h2 className="mt-4 text-h2 text-ink">Questions before the first brief</h2>
          </div>
          <div className="mx-auto mt-12 max-w-3xl space-y-4">
            {faq.map((item, index) => (
              <Reveal key={item.q} delay={index * 70}>
                <details className="group card-premium">
                  <summary className="flex cursor-pointer select-none items-center justify-between gap-5 rounded-[inherit] px-6 py-5 list-none [&::-webkit-details-marker]:hidden sm:px-7">
                    <span className="font-serif text-lg font-semibold leading-snug text-ink">
                      {item.q}
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-copper/40 text-copper transition-transform duration-300 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="px-6 pb-6 sm:px-7">
                    <p className="border-t border-line pt-4 leading-relaxed text-muted">
                      {item.a}
                    </p>
                  </div>
                </details>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section id="contact" className="bg-charcoal py-20 text-ivory sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <Reveal>
              <Badge tone="onDark">contact</Badge>
              <h2 className="mt-4 text-h2 text-ivory">
                Send one process. We will find the first AI use case.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-ivory/70">
                Share where time is leaking: requests, replies, content, CRM,
                documentation or team routines.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                {contactLinks.whatsapp ? (
                  <a
                    href={contactLinks.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-full bg-ivory px-6 py-3 font-medium text-ink transition-colors hover:bg-surface"
                  >
                    WhatsApp direct
                  </a>
                ) : null}
                <Link
                  href="/ru"
                  hrefLang="ru"
                  className="inline-flex rounded-full border border-line-dark px-6 py-3 font-medium text-ivory/78 transition-colors hover:border-copper hover:text-link-dark"
                >
                  Russian version
                </Link>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <EnglishContactForm />
            </Reveal>
          </div>
        </Container>
      </section>
    </div>
  );
}
