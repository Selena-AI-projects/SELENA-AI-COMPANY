import { activePromotion } from "@/lib/commercial-facts";
import { Container } from "@/components/ui/Container";

/**
 * The launch offer, shown only while it is running. An expired promotion is
 * worse than none — it tells a visitor the page is not maintained — so this
 * renders nothing once the end date has passed.
 */
export function PromotionBanner({ locale }: { locale: "en" | "ru" }) {
  const promotion = activePromotion();
  if (!promotion) return null;

  return (
    <section className="border-y border-copper-deep/25 bg-copper/10">
      <Container>
        <div className="flex flex-col gap-3 py-6 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <p className="font-serif text-xl font-semibold text-ink">{promotion.headline[locale]}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{promotion.body[locale]}</p>
          </div>
          <p className="shrink-0 text-sm text-muted">
            {locale === "ru" ? "Промокод" : "Code"}{" "}
            <span className="rounded-md border border-copper-deep/40 bg-surface px-3 py-1.5 font-mono text-base font-semibold tracking-wide text-copper-deep">
              {promotion.code}
            </span>
          </p>
        </div>
      </Container>
    </section>
  );
}
