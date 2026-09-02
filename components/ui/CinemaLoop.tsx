"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Decorative background video loop for cinematic sections. The poster
 * renders as a real image underneath, so reduced-motion users (the video
 * hides via CSS), JS-disabled clients and slow connections all still get
 * the frame. Non-priority loops only mount their <video> near the
 * viewport, so below-the-fold sections cost nothing up front.
 */
export function CinemaLoop({
  video,
  poster,
  alt,
  className,
  priority = false,
}: {
  video: string;
  poster: string;
  /** Describes the poster frame. Required: the site's SEO gate rejects
      images with a missing or empty alt, aria-hidden or not. */
  alt: string;
  className?: string;
  /** true only for the hero loop: loads with the page. */
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(priority);

  useEffect(() => {
    if (active) return;
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [active]);

  return (
    <div
      ref={ref}
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <Image src={poster} alt={alt} fill sizes="100vw" priority={priority} className="object-cover" />
      {active ? (
        <video
          className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
          autoPlay
          muted
          loop
          playsInline
          preload={priority ? "auto" : "metadata"}
          poster={poster}
          src={video}
        />
      ) : null}
    </div>
  );
}
