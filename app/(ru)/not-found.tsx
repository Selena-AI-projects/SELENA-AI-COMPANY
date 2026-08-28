import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Badge";
import { cta } from "@/lib/site";

/**
 * 404 — calm, on-palette, and useful: two clear ways out
 * (home or the brief). Accounts for the fixed header via pt-32.
 */
export default function NotFound() {
  return (
    <section className="bg-warm-canvas flex min-h-[70vh] items-center pb-20 pt-32 sm:pb-28 sm:pt-40">
      <Container size="narrow">
        <div className="mx-auto max-w-xl text-center">
          <div className="animate-drift-in" style={{ animationDelay: "0.05s" }}>
            <Eyebrow className="justify-center">Ошибка 404</Eyebrow>
          </div>

          <h1
            className="animate-drift-in text-h1 font-serif font-semibold text-ink"
            style={{ animationDelay: "0.15s" }}
          >
            Страница не нашлась
          </h1>

          <p
            className="animate-drift-in mt-5 text-lg leading-relaxed text-muted"
            style={{ animationDelay: "0.3s" }}
          >
            Такой страницы нет или её адрес изменился. Зато процессы, услуги и
            бриф — на месте.
          </p>

          <div
            className="animate-drift-in mt-9 flex flex-wrap items-center justify-center gap-4"
            style={{ animationDelay: "0.45s" }}
          >
            <Button href="/" size="lg">
              На главную
            </Button>
            <Button href={cta.short.href} size="lg" variant="secondary">
              {cta.short.label}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
