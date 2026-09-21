import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CursorAura } from "@/components/ui/CursorAura";
import { DocumentLanguage } from "@/components/layout/DocumentLanguage";
import { SkipLink } from "@/components/layout/SkipLink";
import { PublicEventTracker } from "@/components/analytics/PublicEventTracker";

/**
 * Everything inside `<body>`, shared by both root layouts.
 *
 * The site has one shell and two root layouts because `<html lang>` has to be
 * decided on the server and cannot be changed by a page: a layout that reads
 * the language from the request is dynamic, and a dynamic layout makes Next
 * stream the page's title, canonical and hreflang into the body, where a
 * crawler that does not run JavaScript never counts them.
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DocumentLanguage />
      <PublicEventTracker />
      <Analytics />
      {/* Skip link for keyboard users */}
      <SkipLink />
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <CursorAura />
    </>
  );
}

/** The one style the page needs before any script runs. */
/**
 * The display serif is discovered only after the CSS parses, so `font-display:
 * swap` repaints every headline once it lands — the jump readers notice
 * without being able to name it. Preloading the two faces the page will
 * actually use (serif for headings, sans for body, in this document's script)
 * starts them with the stylesheet. Only this locale's subset is preloaded: the
 * other script's files would be dead weight on every visit.
 */
function FontPreloads({ script }: { script: "cyrillic" | "latin" }) {
  return (
    <>
      <link
        rel="preload"
        href={`/fonts/cormorant-garamond-${script}.woff2`}
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href={`/fonts/commissioner-${script}.woff2`}
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
    </>
  );
}

export function ShellHead({ script = "cyrillic" }: { script?: "cyrillic" | "latin" }) {
  return (
    <head>
      <FontPreloads script={script} />
      {/* Without JS, scroll-reveal never fires — force content visible. */}
      <noscript>
        <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>
    </head>
  );
}
