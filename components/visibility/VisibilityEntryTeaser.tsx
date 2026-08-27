import type { HomepageContent } from "@/lib/data/homepage";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

export function ProductDirections({ content }: { content: HomepageContent }) {
  const directions = [content.productPaths.visibility, content.productPaths.systems];

  return (
    <section id="product-paths" className="bg-ivory py-16 sm:py-20">
      <Container size="wide">
        <Reveal className="grid gap-5 border-b border-line pb-9 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <h2 className="max-w-xl text-h1 text-ink">{content.productPaths.heading}</h2>
          <p className="max-w-2xl text-lg leading-relaxed text-muted lg:justify-self-end">
            {content.productPaths.intro}
          </p>
        </Reveal>

        <div className="mt-8 grid gap-px overflow-hidden border border-line bg-line lg:grid-cols-2">
          {directions.map((direction, index) => {
            const dark = index === 1;

            return (
              <Reveal key={direction.name} delay={index * 100} className="h-full">
                <article
                  className={cn(
                    "flex h-full flex-col p-6 sm:p-8",
                    dark ? "bg-charcoal text-ivory" : "bg-surface text-ink",
                  )}
                >
                  <h3 className={cn("text-h2", dark ? "text-ivory" : "text-ink")}>{direction.name}</h3>
                  <p
                    className={cn(
                      "mt-4 max-w-xl text-lg font-semibold leading-relaxed",
                      dark ? "text-ivory" : "text-ink",
                    )}
                  >
                    {direction.promise}
                  </p>
                  <p className={cn("mt-3 max-w-xl text-sm leading-relaxed", dark ? "text-ivory/66" : "text-muted")}>
                    {direction.description}
                  </p>

                  <ul className={cn("mt-6 border-y", dark ? "border-line-dark" : "border-line")}>
                    {direction.items.map((item) => (
                      <li
                        key={`${item.price}-${item.name}`}
                        className={cn(
                          "grid grid-cols-[6.5rem_1fr] gap-4 border-b py-3 text-sm last:border-b-0 sm:grid-cols-[7.25rem_1fr]",
                          dark ? "border-line-dark text-ivory/74" : "border-line text-ink/75",
                        )}
                      >
                        <span className={cn("font-semibold", dark ? "text-copper" : "text-copper-deep")}>
                          {item.price}
                        </span>
                        <span className="font-medium">{item.name}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
                    <Button
                      href={direction.primaryCta.href}
                      variant={dark ? "onDark" : "primary"}
                      className="w-full sm:w-auto"
                    >
                      {direction.primaryCta.label}
                    </Button>
                    {dark ? (
                      <a
                        href={direction.secondaryCta.href}
                        className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-ivory/20 px-6 py-3 text-base font-medium text-ivory transition-colors duration-300 hover:border-copper hover:text-link-dark sm:w-auto"
                      >
                        {direction.secondaryCta.label}
                      </a>
                    ) : (
                      <Button href={direction.secondaryCta.href} variant="secondary" className="w-full sm:w-auto">
                        {direction.secondaryCta.label}
                      </Button>
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
