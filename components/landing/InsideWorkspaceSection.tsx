"use client";

import { CinemaImage } from "@/components/ui/CinemaImage";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

/**
 * "Inside the workspace": the one place on the homepage where the product
 * shows its own screens instead of a metaphor. Three layers move at their
 * own pace as the visitor scrolls — the copper glow behind everything, the
 * device frame that tilts flat as it arrives, and two stacked cards that
 * drift apart — while the closing statement lights up paragraph by
 * paragraph. Every screen is the real client-workspace interface rendered
 * on sample data and is labelled as such on the frame itself, so it can
 * never read as a live measurement. Reduced motion turns every layer
 * static and lights the statement in full.
 */

export type WorkspaceContent = {
  eyebrow: string;
  headline: string;
  intro: string;
  demoLabel: string;
  frameCaption: string;
  tabsLabel: string;
  tabs: { id: string; label: string; image: string; alt: string }[];
  cards: {
    kicker: string;
    title: string;
    text: string;
    image: string;
    alt: string;
    tone: "copper" | "sage";
  }[];
  statement: { kicker: string; paragraphs: string[] };
  ctaNote: string;
};

type Cta = { label: string; href: string };

const REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * Drives the section's scroll progress (0 → 1 while it crosses the
 * viewport) into a CSS variable and lights statement paragraphs once
 * their top passes the reading line. One rAF-throttled listener for all
 * layers; nothing runs when the visitor prefers reduced motion.
 */
function useSceneProgress(
  sectionRef: React.RefObject<HTMLElement | null>,
  paragraphRefs: React.MutableRefObject<(HTMLParagraphElement | null)[]>,
  paragraphCount: number,
) {
  const [lit, setLit] = useState<number>(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia(REDUCED).matches) {
      setReduced(true);
      setLit(paragraphCount);
      return;
    }
    const section = sectionRef.current;
    if (!section) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
      section.style.setProperty("--scene", progress.toFixed(4));

      const line = vh * 0.62;
      let count = 0;
      for (const p of paragraphRefs.current) {
        if (p && p.getBoundingClientRect().top < line) count += 1;
      }
      setLit((prev) => (prev === count ? prev : count));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [sectionRef, paragraphRefs, paragraphCount]);

  return { lit, reduced };
}

/** The device frame tilts flat once it is on screen — a one-shot arrival. */
function useArrived<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [arrived, setArrived] = useState(false);
  useEffect(() => {
    if (arrived) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setArrived(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setArrived(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [arrived]);
  return { ref, arrived };
}

export function InsideWorkspaceSection({ content, cta }: { content: WorkspaceContent; cta: Cta }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const paragraphRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const { lit, reduced } = useSceneProgress(sectionRef, paragraphRefs, content.statement.paragraphs.length);
  const { ref: frameRef, arrived } = useArrived<HTMLDivElement>();
  const [active, setActive] = useState(content.tabs[0]?.id);
  const tabsId = useId();

  const layer = useCallback(
    (px: number): React.CSSProperties =>
      reduced ? {} : { transform: `translate3d(0, calc((var(--scene, 0.5) - 0.5) * ${px}px), 0)` },
    [reduced],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const ids = content.tabs.map((t) => t.id);
    const index = ids.indexOf(active ?? ids[0]);
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const next = (index + (event.key === "ArrowRight" ? 1 : -1) + ids.length) % ids.length;
      setActive(ids[next]);
      document.getElementById(`${tabsId}-tab-${ids[next]}`)?.focus();
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-ivory/10 bg-charcoal py-20 text-ivory sm:py-28"
      style={{ "--scene": 0.5 } as React.CSSProperties}
    >
      {/* Layer 0: the copper glow, drifting slowest. */}
      <div className="pointer-events-none absolute inset-0 will-change-transform" style={layer(-90)} aria-hidden>
        <div
          className="absolute inset-x-0 -top-40 h-[42rem]"
          style={{
            background:
              "radial-gradient(ellipse 60% 55% at 50% 0%, rgba(185,130,91,0.34), rgba(13,20,33,0) 70%)",
          }}
        />
      </div>

      <Container size="wide" className="relative">
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-16">
            <div>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-copper">
                <span className="inline-block h-px w-7 bg-copper" aria-hidden />
                {content.eyebrow}
              </p>
              <h2 className="mt-5 text-h1 text-ivory">{content.headline}</h2>
            </div>
            <p className="max-w-xl text-lg leading-relaxed text-ivory/72 lg:pb-2">{content.intro}</p>
          </div>
        </Reveal>

        {/* Layer 1: tabs and the device frame. */}
        <Reveal delay={80} className="mt-12 sm:mt-14">
          <div
            role="tablist"
            aria-label={content.tabsLabel}
            onKeyDown={onKeyDown}
            className="mx-auto flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-line-dark bg-charcoal-2 p-1.5"
          >
            {content.tabs.map((tab) => {
              const selected = tab.id === active;
              return (
                <button
                  key={tab.id}
                  id={`${tabsId}-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`${tabsId}-panel-${tab.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(tab.id)}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-300 sm:px-7 sm:py-2.5 sm:text-[15px]",
                    selected ? "bg-ivory/12 text-ivory" : "text-ivory/60 hover:text-ivory",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="mt-8 [perspective:1600px]">
            <div
              ref={frameRef}
              className={cn(
                "relative mx-auto aspect-[4/3] w-full max-w-[1200px] overflow-hidden rounded-[1.375rem] border border-ivory/10 bg-charcoal-2 shadow-[0_50px_140px_rgba(0,0,0,0.6)] sm:aspect-[16/7]",
                !reduced && "transition-[transform,opacity] duration-[1100ms] ease-out will-change-transform",
                !reduced && !arrived && "translate-y-10 opacity-60 [transform:rotateX(9deg)_translateY(2.5rem)]",
              )}
            >
              {content.tabs.map((tab) => {
                const selected = tab.id === active;
                return (
                  <div
                    key={tab.id}
                    id={`${tabsId}-panel-${tab.id}`}
                    role="tabpanel"
                    aria-labelledby={`${tabsId}-tab-${tab.id}`}
                    hidden={!selected}
                    className={cn("absolute inset-0", !reduced && "transition-opacity duration-500")}
                  >
                    <CinemaImage
                      src={tab.image}
                      alt={tab.alt}
                      fill
                      sizes="(min-width: 1280px) 1200px, 100vw"
                      className="object-cover object-left-top"
                    />
                  </div>
                );
              })}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-charcoal/90"
                aria-hidden
              />
              <p className="absolute left-4 top-4 rounded-full border border-ivory/20 bg-charcoal/75 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-ivory/85 backdrop-blur sm:left-6 sm:top-6">
                {content.demoLabel}
              </p>
            </div>
          </div>
          <p className="mx-auto mt-5 max-w-2xl text-center text-sm leading-relaxed text-ivory/55">
            {content.frameCaption}
          </p>
        </Reveal>

        {/* Layer 2: two cards that drift apart as the visitor scrolls. */}
        <div className="relative mx-auto mt-20 max-w-[1200px] sm:mt-28">
          <div className="flex flex-col gap-6 lg:block lg:h-[47.5rem]">
            {content.cards.map((card, index) => (
              <Reveal
                key={card.title}
                delay={index * 120}
                className={cn(
                  "lg:absolute lg:w-[53.75rem]",
                  index === 0 ? "lg:left-0 lg:top-0" : "lg:left-[21.25rem] lg:top-[20rem] lg:z-10",
                )}
              >
                <article
                  className={cn(
                    "grid overflow-hidden rounded-[1.375rem] border border-line-dark bg-charcoal-2 will-change-transform sm:grid-cols-2",
                    index === 1 && "shadow-[0_40px_120px_rgba(0,0,0,0.55)]",
                  )}
                  style={layer(index === 0 ? 36 : -44)}
                >
                  <div className="flex flex-col justify-center gap-4 p-7 sm:p-10">
                    <p className="flex items-center gap-2.5 text-sm text-ivory/60">
                      <span
                        className={cn(
                          "inline-block h-2 w-2 rounded-full",
                          card.tone === "copper" ? "bg-copper" : "bg-sage",
                        )}
                        aria-hidden
                      />
                      {card.kicker}
                    </p>
                    <h3 className="font-serif text-[2rem] leading-[1.1] text-ivory sm:text-[2.2rem]">{card.title}</h3>
                    <p className="text-base leading-relaxed text-ivory/66">{card.text}</p>
                  </div>
                  <div className="relative min-h-56 sm:min-h-0">
                    <CinemaImage
                      src={card.image}
                      alt={card.alt}
                      fill
                      sizes="(min-width: 1024px) 430px, 100vw"
                      className={cn("object-cover", index === 0 ? "object-left-top" : "object-center")}
                    />
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>

        {/* The statement lights up paragraph by paragraph past the reading line. */}
        <div className="mx-auto mt-24 max-w-3xl sm:mt-32">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-line-dark bg-ivory/5 px-3.5 py-2 text-sm text-ivory/70">
            <span className="inline-block h-2 w-2 rounded-full bg-copper" aria-hidden />
            {content.statement.kicker}
          </p>
          <div className="mt-7 flex flex-col gap-7">
            {content.statement.paragraphs.map((paragraph, index) => (
              <p
                key={paragraph}
                ref={(el) => {
                  paragraphRefs.current[index] = el;
                }}
                className={cn(
                  "text-2xl leading-snug text-ivory sm:text-[1.7rem] sm:leading-[1.4]",
                  !reduced && "transition-opacity duration-700 ease-out",
                  index < lit ? "opacity-100" : "opacity-30",
                )}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <Reveal className="mt-20 flex flex-col items-center gap-4 sm:mt-24">
          <Button href={cta.href} size="lg" variant="onDark">
            {cta.label}
          </Button>
          <p className="text-sm text-ivory/55">{content.ctaNote}</p>
        </Reveal>
      </Container>
    </section>
  );
}
