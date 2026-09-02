import Image, { type ImageProps } from "next/image";
import { blurFor } from "@/lib/data/blur-map";

/**
 * next/image for a cinematic frame.
 *
 * Frames are addressed by path from the content files, so Next cannot derive
 * a placeholder for them the way it does for a static import. This looks the
 * frame up in the generated blur map, so a frame fades up out of its own
 * colours instead of appearing in an empty box. A path with no entry — an
 * image from somewhere else — renders exactly as a plain next/image would.
 */
export function CinemaImage({ src, alt, ...props }: ImageProps) {
  const blurDataURL = typeof src === "string" ? blurFor(src) : undefined;

  return (
    <Image
      src={src}
      alt={alt}
      {...(blurDataURL ? { placeholder: "blur" as const, blurDataURL } : {})}
      {...props}
    />
  );
}
