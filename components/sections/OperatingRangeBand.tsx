import Link from "next/link";
import { homepage } from "@/lib/data/homepage";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

/**
 * What an AI Automation buyer can check before paying.
 *
 * There are no published outcome numbers for these engagements — none have
 * been measured and published yet — so this band does not imply any. It shows
 * the range the work has actually run in, names the operating layers built in
 * each project, and links the live sites so a reader can look. Where a project
 * carries a measured figure it is printed with the basis beside it; where it
 * does not, nothing stands in its place. The closing line states the gap
 * outright and points at the one place on this site where results are
 * published with dates — the AI Visibility journal — without implying that
 * those numbers describe automation work.
 */
export function OperatingRangeBand() {
  const { projects } = homepage.proof;

  return (
    <section className="border-y border-line bg-surface py-20 sm:py-28">
      <Container size="wide">
        <Reveal>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-copper-deep">
              Operating range
            </p>
            <h2 className="mt-5 text-h2 text-ink">
              Where these systems already run.
            </h2>
            <p className="mt-5 leading-relaxed text-muted">
              {homepage.proof.founderLine}
            </p>
          </div>
        </Reveal>

        <ul className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <Reveal as="li" key={project.name} delay={(index % 3) * 60} className="bg-ivory">
              <div className="flex h-full flex-col p-6 sm:p-7">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-serif text-xl font-semibold text-link underline decoration-link/35 underline-offset-4 transition-colors hover:text-ink"
                >
                  {project.name}
                </a>
                <p className="mt-1 text-sm text-muted">{project.category}</p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-ink/80">{project.text}</p>
                <p className="mt-5 border-t border-line pt-4 text-xs font-medium leading-relaxed text-muted">
                  {project.layers.join(" · ")}
                </p>
                {project.metric ? (
                  <p className="mt-3 text-sm font-semibold text-ink">
                    {project.metric.value}
                    <span className="mt-0.5 block text-xs font-normal text-muted">
                      {project.metric.basis}
                    </span>
                  </p>
                ) : null}
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={120}>
          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted">
            Outcome figures for AI Automation engagements are not published: they have not been
            measured on terms that would survive being printed next to a price. Where results{" "}
            <em>are</em> published on this site, they carry dates and keep their zeros — see the{" "}
            <Link
              href="/ru/projects"
              className="font-medium text-link underline decoration-link/40 underline-offset-2 transition-colors hover:text-ink"
            >
              measurement journal
            </Link>
            , which covers AI Visibility rather than this work.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
