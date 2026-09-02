import { LabLandingPage } from "@/components/lab/LabPages";
import { labLanguages } from "@/lib/lab/content";
import { buildMetadata } from "@/lib/metadata";
import { buildLabStructuredData } from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = buildMetadata({
  title: "Selena Lab — исследования и инструменты",
  description:
    "Исследования, практические методики, эксперименты, инструменты и кейсы Selena Systems: как измерять AI-видимость и принимать решения по AI без догадок.",
  path: "/ru/lab",
  locale: "ru_RU",
  languages: labLanguages(),
});

export default function RussianLabPage() {
  return (
    <>
      <JsonLd data={buildLabStructuredData("ru")} />
      <LabLandingPage locale="ru" />
    </>
  );
}
