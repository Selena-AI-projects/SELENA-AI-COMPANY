import { buildMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/Container";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "Privacy policy for Selena Systems: what public-form and readiness-check data we collect, why we use it and how to request deletion.",
  path: "/en/privacy",
  locale: "en_US",
  languages: {
    "x-default": "/en/privacy",
    en: "/en/privacy",
    ru: "/privacy",
  },
});

export default function EnglishPrivacyPage() {
  return (
    <div lang="en" className="bg-ivory py-32 sm:py-40">
      <Container>
        <article className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-copper-deep">
            Privacy
          </p>
          <h1 className="mt-4 text-h1 text-ink">Privacy Policy</h1>
          <div className="mt-8 space-y-6 leading-relaxed text-muted">
            <p>
              This page explains how Selena Systems handles information submitted
              through its public forms and free website check during early access.
            </p>
            <p>
              The disclosed operator for AI Visibility is Selena Systems LLC (Wyoming, USA). The official privacy-request channel is the contact form
              linked on this site. Registered business details and payment-specific
              disclosures will be included in the applicable contract or invoice
              before any paid order is accepted.
            </p>
            <p>
              We collect only the information needed to answer a request:
              name, contact details, business context and the process or
              challenge described in the form.
            </p>
            <p>
              The free Public Readiness check requires only a public website
              address. Optional site-profile and customer-action selections are
              used in the browser request to decide which checks apply; they are
              not contact details. Our server fetches up to five linked public
              pages and public discovery resources, then reads their markup and
              response headers. Private areas, forms and personal data are not
              requested. The complete result is shown on the page and is not
              sent to a lead channel.
            </p>
            <p>
              Form submissions may be delivered to a configured lead channel,
              such as Telegram or a webhook. If that channel is not configured,
              the site offers a WhatsApp fallback controlled by the visitor.
            </p>
            <p>
              We do not sell submitted data. We use it to review the request,
              prepare questions, suggest a format of work and maintain basic
              communication history.
            </p>
            <p>
              Early-access enquiries are reviewed at least quarterly and removed
              no later than 12 months after the last contact, unless a service
              agreement, dispute or legal obligation requires a longer period.
              Delivery providers such as Telegram or a configured CRM may retain
              their own copies under their published policies.
            </p>
            <p>
              To request correction or deletion of submitted information, use
              the contact form shown on the site and identify the contact detail
              used in the original request.
            </p>
            <p className="border-t border-line pt-6 text-sm">
              Last updated: 15 August 2026.
            </p>
          </div>
        </article>
      </Container>
    </div>
  );
}
