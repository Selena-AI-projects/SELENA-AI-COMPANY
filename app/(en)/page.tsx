import { buildMetadata } from "@/lib/metadata";
import { buildHomeStructuredData } from "@/lib/structured-data";
import { B2BHomeLanding } from "@/components/landing/B2BHomeLanding";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = buildMetadata({
  title: "AI visibility and systems",
  description:
    "Measure how AI finds, understands and represents your business, then build practical systems for the workflows your team runs every day.",
  path: "/",
  locale: "en_US",
  languages: {
    "x-default": "/",
    en: "/",
    ru: "/ru",
  },
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={buildHomeStructuredData("en")} />
      <B2BHomeLanding />
    </>
  );
}
