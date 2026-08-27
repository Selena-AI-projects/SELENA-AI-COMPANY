import goalSelector from "@/data/goal-selector.json";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

const hrefByService: Record<string, string> = {
  "AI-консьерж": "/ai-systems",
  "AI-контент-система": "/ai-content",
  "AI-обучение": "/ai-training",
  "AI-автоматизация": "/ai-automation",
  "AI-аудит": "/ai-systems/ai-audit",
  "AI-база знаний": "/ai-systems",
};

export function BusinessGoalPaths() {
  return (
    <section className="bg-ivory py-20 sm:py-28">
      <Container>
        <SectionHeader
          eyebrow="Выберите задачу"
          headline={goalSelector.headline}
          intro={goalSelector.subheadline}
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {goalSelector.goals.map((item, i) => (
            <Reveal key={item.goal} delay={i * 70}>
              <Card className="flex h-full flex-col">
                <Badge tone={i % 2 === 0 ? "copper" : "sage"}>
                  {item.recommendedService}
                </Badge>
                <h3 className="mt-4 text-h3 text-ink">{item.goal}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  <span className="font-medium text-ink">Боль: </span>
                  {item.pain}
                </p>
                <p className="mt-4 leading-relaxed text-ink/80">{item.outcome}</p>
                <Button
                  href={hrefByService[item.recommendedService] ?? "/ai-systems"}
                  variant="ghost"
                  className="mt-auto justify-start px-0 pt-6 text-link"
                >
                  {item.cta} →
                </Button>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
