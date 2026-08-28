import type { Metadata } from "next";
import { site } from "@/lib/site";
import { ShellHead, SiteShell } from "@/components/layout/SiteShell";
import NotFound from "./(ru)/not-found";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `Страница не нашлась — ${site.name}`,
  description: site.description,
};

/**
 * An address that matches no route belongs to neither locale group, so it has
 * no root layout to render inside. This is that layout: the same shell, and
 * the Russian 404, because a stranger arriving on a broken link is far more
 * likely to have come from the Russian side of the site.
 */
export default function GlobalNotFound() {
  return (
    <html lang="ru">
      <ShellHead />
      <body>
        <SiteShell>
          <NotFound />
        </SiteShell>
      </body>
    </html>
  );
}
