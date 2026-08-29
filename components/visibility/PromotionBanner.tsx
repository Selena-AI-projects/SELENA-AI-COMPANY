import { activePromotion } from "@/lib/commercial-facts";
import { CLIENT_PORTAL_ENABLED, selenaAppRoutes } from "@/lib/visibility/routes";
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
          <div className="flex shrink-0 flex-col gap-3 sm:items-end">
            <p className="text-sm text-muted">
              {locale === "ru" ? "Промокод" : "Code"}{" "}
              <span className="rounded-md border border-copper-deep/40 bg-surface px-3 py-1.5 font-mono text-base font-semibold tracking-wide text-copper-deep">
                {promotion.code}
              </span>
            </p>
            {/* A code with nowhere to type it is not an offer. The account is
                where it is entered, and this was the only page naming the code. */}
            {CLIENT_PORTAL_ENABLED && (
              <a
                href={selenaAppRoutes.register}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-copper px-5 py-2.5 text-base font-medium text-surface transition-all duration-300 hover:-translate-y-px hover:bg-copper-deep"
              >
                {locale === "ru" ? "Завести кабинет" : "Create an account"}
              </a>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
