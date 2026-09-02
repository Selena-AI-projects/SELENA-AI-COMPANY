"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { CinemaLoop } from "@/components/ui/CinemaLoop";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import type { HomepageContent } from "@/lib/data/homepage";

type MeasurementContent = HomepageContent["cinema"]["measurement"];

/**
 * The measurement told as a filmstrip: four cinematic frames, one per step,
 * in a scroll-snap strip with arrows and dots. The frames are staged art
 * direction; the captions carry the real product facts, and the honesty
 * note under the strip keeps the section inside the evidence rules.
 */
export function MeasurementFilmstrip({ content }: { content: MeasurementContent }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);

  const slideStep = useCallback(() => {
    const track = trackRef.current;
    const first = track?.firstElementChild as HTMLElement | null;
    if (!track || !first) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
    return first.offsetWidth + gap;
  }, []);

  const scrollToSlide = useCallback(
    (target: number) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = Math.max(0, Math.min(content.slides.length - 1, target));
      track.scrollTo({ left: clamped * slideStep(), behavior: "smooth" });
    },
    [content.slides.length, slideStep],
  );

  const onScroll = useCallback(() => {
    const track = trackRef.current;
    const step = slideStep();
    if (!track || step === 0) return;
    setIndex(Math.max(0, Math.min(content.slides.length - 1, Math.round(track.scrollLeft / step))));
  }, [content.slides.length, slideStep]);

  return (
    <section
      id="how-measurement-works"
      className="border-t border-ivory/10 bg-charcoal py-20 text-ivory sm:py-28"
      aria-label={content.headline}
    >
      <Container size="wide">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-copper">
                {content.eyebrow}
              </p>
              <h2 className="mt-5 text-h1 text-ivory">{content.headline}</h2>
              <p className="mt-5 text-lg leading-relaxed text-ivory/68">{content.intro}</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => scrollToSlide(index - 1)}
                disabled={index === 0}
                aria-label={content.controls.prev}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-ivory/25 text-xl text-ivory/85 transition-colors duration-300 hover:border-copper hover:text-link-dark disabled:cursor-default disabled:opacity-35 disabled:hover:border-ivory/25 disabled:hover:text-ivory/85"
              >
                <span aria-hidden>←</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToSlide(index + 1)}
                disabled={index === content.slides.length - 1}
                aria-label={content.controls.next}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-ivory/25 text-xl text-ivory/85 transition-colors duration-300 hover:border-copper hover:text-link-dark disabled:cursor-default disabled:opacity-35 disabled:hover:border-ivory/25 disabled:hover:text-ivory/85"
              >
                <span aria-hidden>→</span>
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div
            ref={trackRef}
            onScroll={onScroll}
            className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {content.slides.map((slide, slideIndex) => (
              <figure
                key={slide.title}
                className="relative w-[86%] shrink-0 snap-start overflow-hidden rounded-3xl border border-ivory/12 sm:w-[64%] lg:w-[47%]"
              >
                <div className="relative aspect-[16/10]">
                  {"video" in slide && slide.video ? (
                    <CinemaLoop video={slide.video} poster={slide.image} alt={slide.alt} />
                  ) : (
                    <Image
                      src={slide.image}
                      alt={slide.alt}
                      fill
                      sizes="(min-width: 1024px) 47vw, (min-width: 640px) 64vw, 86vw"
                      className="object-cover"
                    />
                  )}
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal via-charcoal/55 to-transparent p-6 pt-20 sm:p-7">
                    <p className="font-serif text-2xl font-semibold text-copper">
                      0{slideIndex + 1}
                    </p>
                    <h3 className="mt-1.5 text-h3 text-ivory">{slide.title}</h3>
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-ivory/80">
                      {slide.text}
                    </p>
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
        </Reveal>

        <div className="mt-7 flex items-center justify-center gap-2.5">
          {content.slides.map((slide, dotIndex) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => scrollToSlide(dotIndex)}
              aria-label={`${content.controls.goTo} ${dotIndex + 1}`}
              aria-current={index === dotIndex}
              className={cn(
                "h-2.5 rounded-full transition-all duration-300",
                index === dotIndex ? "w-8 bg-copper" : "w-2.5 bg-ivory/25 hover:bg-ivory/45",
              )}
            />
          ))}
        </div>

        <Reveal delay={140}>
          <p className="mx-auto mt-10 max-w-3xl border-t border-ivory/12 pt-6 text-center text-base leading-relaxed text-ivory/75">
            {content.honestyNote}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
