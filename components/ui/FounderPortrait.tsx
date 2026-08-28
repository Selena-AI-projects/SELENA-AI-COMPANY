import Image from "next/image";
import { cn } from "@/lib/cn";
import { founder } from "@/lib/site";

export function FounderPortrait({
  className,
  locale = "ru",
}: {
  className?: string;
  locale?: "en" | "ru";
}) {
  const isEnglish = locale === "en";

  return (
    <figure
      className={cn(
        "overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_20px_60px_-36px_rgba(24,22,20,0.45)]",
        className,
      )}
    >
      <div className="relative aspect-[4/5] min-h-[24rem] sm:aspect-[5/4] lg:aspect-[4/5]">
        <Image
          src="/images/founder/selena-2026-08.jpg"
          alt={isEnglish
            ? `${founder.name.en}, founder of Selena Systems`
            : `${founder.name.ru} — основательница Selena Systems`}
          fill
          sizes="(min-width: 1024px) 38vw, (min-width: 640px) 84vw, 90vw"
          className="object-cover object-[46%_42%]"
        />
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/82 via-ink/42 to-transparent p-5 pt-16 text-surface sm:p-6">
          <p className="font-serif text-xl font-semibold">
            {founder.name[isEnglish ? "en" : "ru"]}
          </p>
          <p className="mt-0.5 text-sm font-medium text-surface/85">
            {founder.role[isEnglish ? "en" : "ru"]}, Selena Systems
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-surface/78">
            {isEnglish
              ? "A founder-led approach: process first, then the AI workflow, automation and team training."
              : "Живой founder-led подход: сначала процесс, потом AI-сценарий, автоматизация и обучение команды."}
          </p>
        </figcaption>
      </div>
    </figure>
  );
}
