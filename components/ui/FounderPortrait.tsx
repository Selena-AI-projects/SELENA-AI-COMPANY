import Image from "next/image";
import { cn } from "@/lib/cn";

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
          alt={isEnglish ? "Founder of Selena Systems" : "Портрет основательницы Selena Systems"}
          fill
          sizes="(min-width: 1024px) 38vw, (min-width: 640px) 84vw, 90vw"
          className="object-cover object-[46%_42%]"
        />
        <div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/82 via-ink/42 to-transparent p-5 pt-16 text-surface sm:p-6"
          aria-hidden="true"
        >
          <p className="font-serif text-xl font-semibold">Selena Systems</p>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-surface/78">
            {isEnglish
              ? "A founder-led approach: process first, then the AI workflow, automation and team training."
              : "Живой founder-led подход: сначала процесс, потом AI-сценарий, автоматизация и обучение команды."}
          </p>
        </div>
      </div>
    </figure>
  );
}
