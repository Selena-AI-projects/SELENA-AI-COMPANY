import { buildMetadata } from "@/lib/metadata";
import { buildHomeStructuredData } from "@/lib/structured-data";
import { CompanyHomeLanding } from "@/components/landing/B2BHomeLanding";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = buildMetadata({
  title: "AI visibility and systems",
  description:
    "AI Visibility shows how customers discover your business. AI Automation builds practical workflows for your team. Explore two independent Selena Systems products.",
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
      <CompanyHomeLanding />
    </>
  );
}
