import { buildMetadata } from "@/lib/metadata";
import Link from "next/link";
import { contactAvailability, contactChannels } from "@/lib/site";
import { commercialFacts } from "@/lib/commercial-facts";
import { faq } from "@/lib/data/faq";
import { PageHero } from "@/components/sections/PageHero";
import { FAQSection } from "@/components/sections/FAQSection";
import { ContactForm } from "@/components/forms/ContactForm";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { buildContactStructuredData } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageCinema } from "@/lib/data/page-cinema";

const cinema = pageCinema("ru").contact;

export const metadata = buildMetadata({
  title: "Связаться с Selena Systems",
  description:
    "Заполните бриф на AI-задачу: опишите процесс простыми словами — я разберу задачу и предложу формат работы. Без обязательств и навязывания лишнего.",
  path: "/contact",
  languages: {
    "x-default": "/en/contact",
    en: "/en/contact",
    ru: "/contact",
  },
});

const nextSteps = [
  {
    n: "01",
    title: "Бриф",
    text: "Вы описываете задачу простыми словами — без подготовки и терминов.",
  },
  {
    n: "02",
    title: "Короткий разбор",
    text: "Я смотрю на процесс и готовлю уточняющие вопросы или сразу варианты.",
  },
  {
    n: "03",
    title: "Предложение формата",
    text: "Предлагаю стартовую точку и формат работы под вашу задачу.",
  },
];

// Вопросы, релевантные перед отправкой брифа (см. lib/data/faq.ts).
const contactFaq = [faq[0], faq[1], faq[5], faq[6]];

export default function ContactPage() {
  return (
    <>
      <JsonLd data={buildContactStructuredData("ru")} />
      <PageHero
        eyebrow="Связаться"
        title="Разберём вашу задачу"
        intro="Опишите задачу простыми словами. Не нужно заранее знать, какой инструмент вам нужен — сначала разберём процесс."
        media={{
          video: { src: cinema.hero.video, poster: cinema.hero.poster },
          alt: cinema.hero.alt,
        }}
      />

      <section className="pb-20 sm:pb-28">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
            <Reveal>
              <ContactForm />
            </Reveal>

            <Reveal delay={150} className="lg:sticky lg:top-28">
              <aside aria-label="Что будет после отправки брифа">
                <h2 className="text-h3 text-ink">Что будет дальше</h2>
                <ol className="mt-6 space-y-5">
                  {nextSteps.map((step, i) => (
                    <li key={step.n} className="relative flex gap-4 pb-1">
                      {i < nextSteps.length - 1 ? (
                        <span
                          aria-hidden="true"
                          className="absolute top-10 left-[15px] h-[calc(100%-1.5rem)] w-px bg-line"
                        />
                      ) : null}
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-copper/40 bg-copper/10 font-serif text-sm font-semibold text-copper-deep">
                        {i + 1}
                      </span>
                      <div className="pt-0.5">
                        <h3 className="font-semibold text-ink">{step.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted">
                          {step.text}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>

                <address className="card-premium mt-8 p-5 not-italic">
                  <p className="text-sm font-semibold text-ink">Selena Systems</p>
                  <p className="mt-1 text-sm text-muted">
                    {commercialFacts.seller.legalName}
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {contactChannels.map((channel) => (
                      <li key={channel.key}>
                        <a
                          href={channel.href}
                          className="text-sm font-medium text-link underline decoration-link/45 underline-offset-2 transition-colors hover:text-ink hover:decoration-link"
                        >
                          {channel.label.ru}: {channel.value}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 border-t border-line pt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      Часовой пояс
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-ink/80">
                      {contactAvailability.ru}
                    </p>
                  </div>
                  <Link
                    href="/about"
                    className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-link underline decoration-link/45 underline-offset-2 transition-colors hover:text-ink"
                  >
                    Обо мне и подходе →
                  </Link>
                </address>
              </aside>
            </Reveal>
          </div>
        </Container>
      </section>

      <FAQSection items={contactFaq} />
    </>
  );
}
