type ResponsiveArticleFigureProps = {
  baseName: string;
  alt: string;
  title: string;
  caption: string;
  width: number;
  height: number;
  smallWidth?: number;
};

export function ResponsiveArticleFigure({
  baseName,
  alt,
  title,
  caption,
  width,
  height,
  smallWidth = 640,
}: ResponsiveArticleFigureProps) {
  const basePath = `/media/school/${baseName}`;

  return (
    <figure className="mt-8">
      <a
        href={`${basePath}.png`}
        className="group block overflow-hidden rounded-lg border border-line bg-surface focus-visible:outline-offset-4"
        aria-label={`${title}. Открыть изображение в полном размере`}
      >
        <picture>
          <source
            type="image/avif"
            srcSet={`${basePath}-${smallWidth}.avif ${smallWidth}w, ${basePath}.avif ${width}w`}
            sizes="(max-width: 720px) calc(100vw - 40px), 760px"
          />
          <source
            type="image/webp"
            srcSet={`${basePath}-${smallWidth}.webp ${smallWidth}w, ${basePath}.webp ${width}w`}
            sizes="(max-width: 720px) calc(100vw - 40px), 760px"
          />
          <img
            src={`${basePath}.png`}
            alt={alt}
            title={title}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
            className="h-auto w-full transition-transform duration-300 group-hover:scale-[1.01]"
          />
        </picture>
      </a>
      <figcaption className="mt-3 text-sm leading-relaxed text-muted">
        {caption} <span className="text-link">Открывается в полном размере.</span>
      </figcaption>
    </figure>
  );
}
