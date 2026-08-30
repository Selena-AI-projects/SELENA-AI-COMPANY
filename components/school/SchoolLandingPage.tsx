import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";

export function SchoolLandingPage() {
  return (
    <>
      <PageHero
        eyebrow="Selena Systems · Школа"
        title="Учебный раздел готовится"
        intro="Маршрут сохранён для будущего учебного продукта, но школа не запущена и сейчас не участвует в публичной навигации или поисковой индексации."
      />
      <section className="bg-surface py-16 sm:py-24">
        <Container>
          <h2 className="font-serif text-3xl font-semibold text-ink">Условия публичного запуска</h2>
          <p className="mt-5 max-w-3xl leading-7 text-muted">
            Школа откроется после появления минимум трёх бесплатных уроков, понятной программы, готового формата и условий доступа. Для платного продукта отдельно потребуются подтверждённые цена и условия возврата.
          </p>
        </Container>
      </section>
    </>
  );
}
