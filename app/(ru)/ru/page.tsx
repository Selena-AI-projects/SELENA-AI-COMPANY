import { buildMetadata } from "@/lib/metadata";
import { ruHomepage } from "@/lib/data/homepage-ru";
import { buildHomeStructuredData } from "@/lib/structured-data";
import { B2BHomeLanding } from "@/components/landing/B2BHomeLanding";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = buildMetadata({
  title: "AI-системы и AI Visibility",
  description:
    "Измеряйте, как AI находит, понимает и представляет ваш бизнес, а затем создавайте практичные системы для ежедневных процессов команды.",
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
      <B2BHomeLanding content={ruHomepage} locale="ru" />
    </>
  );
}
