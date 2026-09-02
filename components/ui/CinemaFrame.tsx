import Image from "next/image";
import { cn } from "@/lib/cn";
import { CinemaLoop } from "@/components/ui/CinemaLoop";

/**
 * A framed cinematic still or loop inside a section: rounded media block
 * with an optional caption over a bottom gradient. The caption is the
 * explanatory voice of the frame — the image alone never carries a claim.
 */
export function CinemaFrame({
  alt,
  image,
  video,
  caption,
  aspect = "aspect-[21/9]",
  tone = "dark",
  sizes = "(min-width: 1280px) 1152px, 100vw",
  className,
  priority = false,
}: {
  alt: string;
  /** Still frame; ignored when `video` is set (the poster covers it). */
  image?: string;
  video?: { src: string; poster: string };
  caption?: string;
  /** Tailwind aspect-ratio class for the media box. */
  aspect?: string;
  /** Section background the frame sits on — picks the border color. */
  tone?: "dark" | "light";
  sizes?: string;
  className?: string;
  /** True for a frame in the first viewport (a page opener): the still
      loads eagerly and a loop mounts at once instead of waiting for the
      intersection observer. */
  priority?: boolean;
}) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-3xl border",
        tone === "dark"
          ? "border-ivory/12 shadow-[0_32px_80px_-40px_rgba(0,0,0,0.8)]"
          : "border-line shadow-[0_24px_60px_-36px_rgba(24,22,20,0.4)]",
        className,
      )}
    >
      <div className={cn("relative", aspect)}>
        {video ? (
          <CinemaLoop video={video.src} poster={video.poster} alt={alt} priority={priority} />
        ) : image ? (
          <Image src={image} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
        ) : null}
        {caption ? (
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/85 via-charcoal/40 to-transparent p-5 pt-14 sm:p-6">
            <p className="max-w-2xl text-sm font-medium leading-relaxed text-ivory/90 sm:text-base">
              {caption}
            </p>
          </figcaption>
        ) : null}
      </div>
    </figure>
  );
}
