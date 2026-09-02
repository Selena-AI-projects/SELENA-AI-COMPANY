import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Badge";
import { CinemaFrame } from "@/components/ui/CinemaFrame";
import { cn } from "@/lib/cn";

/**
 * A staged still or loop beside the opener: the same cinema language as
 * the homepage, one frame per page, never a screenshot or fake data.
 */
export type PageHeroMedia = {
  alt: string;
  image?: string;
  video?: { src: string; poster: string };
  caption?: string;
};

/**
 * Shared cinematic sub-page opener (contract §Section components).
 * Warm canvas + faint grid, editorial eyebrow, serif h1, optional intro
 * and a `children` slot for CTAs or extra elements. Entrance uses the
 * global drift-in keyframes (reduced motion handled in globals.css).
 * With `media`, the opener becomes a two-column stage on large screens:
 * copy on the left, the frame on the right, stacked on phones.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  children,
  compact = false,
  media,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
  compact?: boolean;
  media?: PageHeroMedia;
}) {
  return (
    <section
      className={cn(
        "bg-warm-canvas relative overflow-hidden",
        compact ? "pb-10 pt-28 sm:pb-12 sm:pt-32" : "pb-16 pt-32 sm:pb-20 sm:pt-40",
      )}
    >
      <div
        className="grid-texture pointer-events-none absolute -top-16 -right-40 hidden h-[34rem] w-[34rem] lg:block"
        aria-hidden
      />
      <Container className={cn("relative", media && "grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center")}>
        {media ? (
          <div
            className="animate-drift-in order-last lg:order-none lg:col-start-2"
            style={{ animationDelay: "0.35s" }}
          >
            <CinemaFrame
              tone="light"
              image={media.image}
              video={media.video}
              alt={media.alt}
              caption={media.caption}
              aspect="aspect-[4/3] sm:aspect-[16/10]"
              sizes="(min-width: 1024px) 46vw, 100vw"
              priority
            />
          </div>
        ) : null}
        <div className={cn("max-w-3xl", media && "lg:col-start-1 lg:row-start-1")}>
          <div className="animate-drift-in" style={{ animationDelay: "0.05s" }}>
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>
          <h1
            className="animate-drift-in text-h1 text-ink"
            style={{ animationDelay: "0.15s" }}
          >
            {title}
          </h1>
          {intro ? (
            <p
              className="animate-drift-in mt-5 max-w-2xl text-lg leading-relaxed text-muted"
              style={{ animationDelay: "0.3s" }}
            >
              {intro}
            </p>
          ) : null}
          {children ? (
            <div className="animate-drift-in mt-8" style={{ animationDelay: "0.45s" }}>
              {children}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
