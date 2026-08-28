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
export function ShellHead() {
  return (
    <head>
      {/* Without JS, scroll-reveal never fires — force content visible. */}
      <noscript>
        <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>
    </head>
  );
}
