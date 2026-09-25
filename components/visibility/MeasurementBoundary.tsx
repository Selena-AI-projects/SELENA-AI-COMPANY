import type { MeasurementBoundaryContent, VisibilityLocale } from "@/lib/visibility/types";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The mandatory "what we measured / what we did not measure" trust block
 * (SSOT §7.3, §18.3, §29.5). Every Visibility surface that shows a metric
 * must carry this nearby — it is the honesty boundary, not decoration.
 */
const LABELS: Record<VisibilityLocale, { measured: string; notMeasured: string }> = {
  en: { measured: "What we measured", notMeasured: "What we did not measure" },
  ru: { measured: "Что мы измерили", notMeasured: "Что мы не измеряли" },
};

export function MeasurementBoundary({
  content,
  locale = "en",
}: {
  content: MeasurementBoundaryContent;
  locale?: VisibilityLocale;
}) {
  const labels = LABELS[locale];
  return (
    <Reveal>
      <Card hover={false} className="border-copper/25 bg-copper/[0.04]">
        <p className="font-serif text-h3 text-ink">{content.heading}</p>
        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper-deep">
              {labels.measured}
            </p>
            <ul className="mt-4 space-y-2.5">
              {content.whatWeMeasure.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-copper" aria-hidden />
                  <span className="text-base leading-relaxed text-ink/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose">
              {labels.notMeasured}
            </p>
            <ul className="mt-4 space-y-2.5">
              {content.whatWeDontMeasure.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-rose" aria-hidden />
                  <span className="text-base leading-relaxed text-muted">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </Reveal>
  );
}
