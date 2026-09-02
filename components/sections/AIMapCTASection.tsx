import aiMap from "@/data/free-ai-map.json";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";

export function AIMapCTASection() {
  return (
    <section className="relative overflow-hidden bg-charcoal py-20 text-ivory sm:py-28">
      <Container>
        <div className="relative grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <Badge tone="onDark">Бесплатный вход</Badge>
            <h2 className="mt-4 text-h2 text-ivory">{aiMap.headline}</h2>
            <p className="mt-5 text-lg leading-relaxed text-ivory/70">
              {aiMap.subheadline}
            </p>
            <Button href="/ai-systems" variant="onDark" size="lg" className="mt-8">
              Получить AI-карту возможностей
            </Button>
          </Reveal>

          <div className="rounded-[1.25rem] border border-line-dark bg-charcoal-2/78 p-4 shadow-[0_28px_80px_-54px_rgba(0,0,0,0.8)] sm:p-6">
            <p className="mb-5 flex items-center justify-between gap-4 border-b border-line-dark pb-4 text-base font-semibold uppercase tracking-[0.22em] text-ivory/50">
              <span>Карта возможностей</span>
              <span className="text-copper">Selena Systems</span>
            </p>
            {aiMap.whatUserGets.map((item, i) => (
              <Reveal key={item} delay={i * 90}>
                <div className="grid gap-4 border-b border-line-dark py-5 last:border-b-0 sm:grid-cols-[4rem_1fr]">
                  <span className="font-serif text-4xl leading-none text-copper/65">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="leading-relaxed text-ivory/85">{item}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
