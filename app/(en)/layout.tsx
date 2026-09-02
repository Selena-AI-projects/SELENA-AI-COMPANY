import type { Metadata } from "next";
import { site } from "@/lib/site";
import { ShellHead, SiteShell } from "@/components/layout/SiteShell";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
};

export default function EnglishRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <ShellHead script="latin" />
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
