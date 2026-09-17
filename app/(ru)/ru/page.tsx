import { buildMetadata } from "@/lib/metadata";
import { ruHomepage } from "@/lib/data/homepage-ru";
import { buildHomeStructuredData } from "@/lib/structured-data";
import { CompanyHomeLanding } from "@/components/landing/B2BHomeLanding";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = buildMetadata({
  title: "AI-системы и AI Visibility",
  description:
    "AI Visibility показывает, как клиенты находят ваш бизнес. AI Automation строит практичные процессы для команды. Два независимых продукта Selena Systems.",
  path: "/ru",
  locale: "ru_RU",
  languages: {
    "x-default": "/",
    en: "/",
    ru: "/ru",
  },
});

export default function RussianHomePage() {
  return (
    <>
      <JsonLd data={buildHomeStructuredData("ru")} />
      <CompanyHomeLanding content={ruHomepage} />
    </>
  );
}
