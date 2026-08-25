import { buildMetadata } from "@/lib/metadata";
import { buildAiVisibilityStructuredData } from "@/lib/structured-data";
import { ruHomepage } from "@/lib/data/homepage-ru";
import { visibilityContentRu } from "@/lib/visibility/content.ru";
import { visibilityLanguages } from "@/lib/visibility/routes";
import { PageHero } from "@/components/sections/PageHero";
import { PackagesSection } from "@/components/landing/B2BHomeLanding";
import { PricingDirectory, PricingTracks } from "@/components/visibility/PricingTracks";
import { PromotionBanner } from "@/components/visibility/PromotionBanner";
import { FAQSection } from "@/components/sections/FAQSection";
import { JsonLd } from "@/components/seo/JsonLd";

const content = visibilityContentRu;

export const metadata = buildMetadata({
  title: "Цены — AI Visibility и AI Automation",
  description:
    "Сравните бесплатную проверку и четыре варианта AI Visibility отдельно от четырёх индивидуальных услуг AI Automation и выберите следующий шаг.",
  path: "/ru/pricing",
  locale: "ru_RU",
  languages: visibilityLanguages("pricing"),
});

export default function RussianPricingPage() {
  return (
    <>
      <JsonLd data={buildAiVisibilityStructuredData("ru")} />
      <PageHero
        eyebrow="Цены Selena Systems"
        title="Два продукта — без смешения."
        intro="AI Visibility измеряет, как AI видит ваш бизнес. AI Automation диагностирует и строит процессы внутри него. Сначала выберите направление, затем сравнивайте только подходящие предложения."
        compact
      />
      <PromotionBanner locale="ru" />
      <PricingDirectory content={content.pricing.directory} />
      <PricingTracks content={content.pricing} showHeader={false} />
      <PackagesSection content={ruHomepage} />
      <FAQSection items={content.faq} withHeader={false} />
    </>
  );
}
