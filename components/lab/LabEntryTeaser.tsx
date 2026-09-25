import { labContent, labPath, type LabLocale } from "@/lib/lab/content";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function LabEntryTeaser({ locale }: { locale: LabLocale }) {
  const content = labContent[locale];
  const labels = locale === "ru"
    ? ["Исследования с раскрытой методологией", "Практические руководства", "Курсы — позднее, отдельно"]
    : ["Research with methodology", "Practical guides", "Courses later, separately"];
  return (
    <section className="bg-ivory py-20 sm:py-24">
      <Container size="wide">
        <Reveal>
          <div className="grid gap-10 border-y border-line py-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-deep">Selena Lab</p>
              <h2 className="mt-5 max-w-3xl text-h2 text-ink">
                {locale === "ru"
                  ? "Исследуем, проверяем и объясняем, как строить с AI."
                  : "See what we are testing, learning and publishing."}
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{content.intro}</p>
            </div>
            <div>
              <ul className="space-y-3 text-sm text-ink/78">
                {labels.map((label) => <li key={label} className="border-b border-line pb-3">{label}</li>)}
              </ul>
              <Button href={labPath(locale)} variant="secondary" className="mt-7">
                {locale === "ru" ? "Открыть Selena Lab" : "Explore Selena Lab"}
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
