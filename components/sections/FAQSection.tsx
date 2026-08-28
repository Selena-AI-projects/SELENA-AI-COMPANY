import { faq, type FaqItem } from "@/lib/data/faq";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildFaqStructuredData } from "@/lib/structured-data";

/**
 * Premium FAQ accordion (contract §Section components).
 * Native <details>/<summary> — fully accessible and keyboard-friendly
 * without any JS, so this stays a server component. The copper "plus"
 * rotates into a close mark via `group-open:` styling only.
 * Sub-pages pass a relevant `items` subset and `withHeader={false}`.
 */
export function FAQSection({
  items = faq,
  withHeader = true,
  headline = "Частые вопросы",
}: {
  items?: FaqItem[];
  withHeader?: boolean;
  headline?: string;
}) {
  return (
    <section className="bg-ivory py-20 sm:py-28">
      {/* The answers are written and visible; this is the same text, in the
          form an assistant can lift whole. */}
      <JsonLd data={buildFaqStructuredData(items)} />
      <Container size="narrow">
        {withHeader ? (
          <SectionHeader eyebrow="FAQ" headline={headline} />
        ) : null}

        <div className={cn("space-y-4", withHeader && "mt-12 sm:mt-14")}>
          {items.map((item, i) => (
            <Reveal key={item.q} delay={i * 80}>
              <details className="group card-premium">
                <summary
                  className="flex cursor-pointer select-none items-center justify-between gap-5 rounded-[inherit] px-6 py-5 list-none [&::-webkit-details-marker]:hidden sm:px-7"
                >
                  <span className="font-serif text-lg font-semibold leading-snug text-ink">
                    {item.q}
                  </span>
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-copper/40 text-copper transition-transform duration-300 group-open:rotate-45"
                    aria-hidden
                  >
                    <svg
                      viewBox="0 0 12 12"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <path d="M6 1v10M1 6h10" />
                    </svg>
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
  );
}
