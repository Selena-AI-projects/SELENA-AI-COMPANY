import { buildMetadata } from "@/lib/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";
import { buildLegalPageStructuredData } from "@/lib/structured-data";
import { effectiveDateLine } from "@/lib/data/legal";

const title = "Terms of Use and Site Rules";
const description =
  "Terms for Selena Systems: public-site use, early-access requests, AI Visibility scope, human review boundaries and separate commercial agreements.";

export const metadata = buildMetadata({
  title,
  description,
  path: "/en/terms",
  locale: "en_US",
  languages: {
    "x-default": "/en/terms",
    en: "/en/terms",
    ru: "/terms",
  },
});

export default function EnglishTermsPage() {
  return (
    <div lang="en" className="bg-ivory py-32 sm:py-40">
      <JsonLd
        data={buildLegalPageStructuredData({
          locale: "en",
          kind: "terms",
          pageUrl: `${site.url}/en/terms`,
          name: title,
          description,
        })}
      />
      <Container>
        <article className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-copper-deep">
            Terms
          </p>
          <h1 className="mt-4 text-h1 text-ink">Terms of Use</h1>
          <div className="mt-8 space-y-6 leading-relaxed text-muted">
            <p>
              These terms govern the public website and early-access requests for
              Selena Systems. They do not open online checkout or create a paid
              order by themselves.
            </p>
            <p>
              The website describes consulting, training and implementation
              services related to AI workflows, automation, content systems and
              operating playbooks.
            </p>
            <p>
              AI Visibility is a Selena Systems product line operated by
              Selena Systems LLC (Wyoming, USA). Online checkout and live recurring
              billing are not currently open. A displayed price or early-access
              request does not create an order until scope, total amount and
              activation conditions are confirmed.
            </p>
            <p>
              Any examples on the site are illustrative. Selena Systems does not
              promise revenue growth, guaranteed savings or replacement of human
              judgment.
            </p>
            <p>
              A submitted brief does not create a service agreement. Scope,
              timing, deliverables and fees are agreed separately after the
              request is reviewed.
            </p>
            <p>
              AI systems can make mistakes. Production use should include
              appropriate review, testing and clear human responsibility.
            </p>
            <p className="border-t border-line pt-6 text-sm">
              {effectiveDateLine("terms", "en")} Separate payment, refund and commercial
              terms will be published and legally reviewed before live online
              payments are enabled.
            </p>
          </div>
        </article>
      </Container>
    </div>
  );
}
