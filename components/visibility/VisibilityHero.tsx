import { homepage, type HomepageContent } from "@/lib/data/homepage";
import { ruHomepage } from "@/lib/data/homepage-ru";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CinemaLoop } from "@/components/ui/CinemaLoop";
import { Reveal } from "@/components/ui/Reveal";
import { VisibilityLadder } from "@/components/landing/B2BHomeLanding";
import type { VisibilityLocale } from "@/lib/visibility/types";

/**
 * Dark hero for the /visibility pages, mirroring the homepage hero:
 * question, free entry with its honest note, then the paid ladder in the
 * same two sales groups. Visibility always presents on dark. With
 * `backdrop`, a cinematic loop sits behind the first screen exactly as on
 * the homepage, fading to flat charcoal before the ladder.
 */
export function VisibilityHero({
  locale,
  eyebrow,
  title,
  intro,
  primaryCta,
  secondaryCta,
  backdrop,
}: {
  locale: VisibilityLocale;
  eyebrow: string;
  title: string;
  intro: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  backdrop?: { video: string; poster: string; alt: string };
}) {
  const home: HomepageContent = locale === "ru" ? ruHomepage : homepage;

  return (
    <section className="relative overflow-hidden bg-charcoal pb-10 pt-28 text-ivory sm:pt-32 lg:pt-36">
      {backdrop ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[46rem]" aria-hidden>
          <CinemaLoop
            video={backdrop.video}
            poster={backdrop.poster}
            alt={backdrop.alt}
            priority
            className="opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 via-charcoal/45 to-charcoal" />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/65 via-charcoal/20 to-transparent" />
        </div>
      ) : null}
      <Container size="wide" className="relative">
        <Reveal className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-copper">{eyebrow}</p>
          <h1 className="mt-6 text-display text-ivory">{title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ivory/76 sm:text-xl">{intro}</p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              href={primaryCta.href}
              size="lg"
              variant="onDark"
              className="max-w-full whitespace-normal text-center"
            >
              {primaryCta.label}
            </Button>
            <a
              href={secondaryCta.href}
              className="inline-flex max-w-full items-center justify-center gap-2 whitespace-normal text-center rounded-full border border-ivory/25 px-8 py-4 text-base font-medium text-ivory/85 transition-colors duration-300 hover:border-copper hover:text-link-dark"
            >
              {secondaryCta.label}
            </a>
          </div>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-ivory/75">
            {home.hero.primaryNote}
          </p>
        </Reveal>

        <VisibilityLadder content={home} />
      </Container>
    </section>
  );
}
