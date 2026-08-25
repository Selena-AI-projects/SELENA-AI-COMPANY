import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Badge";
import { journalProjects } from "@/lib/visibility-log/data";

/**
 * Links the product page to the journal by name, one anchor per project.
 * The proof and the offer belong next to each other: a visitor reading what
 * a measurement is should be one click from seeing seven of them.
 */
export function JournalTeaser() {
  return (
    <section className="border-y border-line bg-ivory py-20 sm:py-28">
      <Container>
        <div className="max-w-3xl">
          <Eyebrow>Доказательства</Eyebrow>
          <h2 className="text-h2 text-ink">Сначала мы измеряем себя</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            Семь наших проектов проходят ту же лестницу публично: с датами, с числами
            и с отдельной строкой о том, чего эти числа не доказывают. Включая тот
            проект, у которого на старте ноль показов.
          </p>
        </div>

        <ul className="mt-10 flex flex-wrap gap-3">
          {journalProjects.map((project) => (
            <li key={project.slug}>
              <Link
                href={`/ru/journal/${project.slug}`}
                className="inline-flex rounded-md border border-line bg-surface px-4 py-2.5 text-base text-ink transition-colors hover:border-copper-deep/60 hover:text-copper-deep"
              >
                {project.name}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/ru/journal"
          className="mt-9 inline-flex items-center gap-2 font-medium text-copper-deep hover:text-copper-deeper"
        >
          Открыть журнал видимости
          <span aria-hidden>→</span>
        </Link>
      </Container>
    </section>
  );
}
