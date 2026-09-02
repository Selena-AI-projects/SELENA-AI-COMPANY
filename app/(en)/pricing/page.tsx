import { buildMetadata } from "@/lib/metadata";
import { buildPricingStructuredData } from "@/lib/structured-data";
import { homepage } from "@/lib/data/homepage";
import { visibilityContentEn } from "@/lib/visibility/content.en";
import { visibilityLanguages } from "@/lib/visibility/routes";
import { PageHero } from "@/components/sections/PageHero";
import { PackagesSection } from "@/components/landing/B2BHomeLanding";
import { PricingDirectory, PricingTracks } from "@/components/visibility/PricingTracks";
import { PromotionBanner } from "@/components/visibility/PromotionBanner";
import { FAQSection } from "@/components/sections/FAQSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageCinema } from "@/lib/data/page-cinema";

const content = visibilityContentEn;
const cinema = pageCinema("en").pricing;

export const metadata = buildMetadata({
  title: "Pricing — AI Visibility and AI Automation",
  description:
    "Compare AI Visibility's free check and four paid options separately from Selena Systems' four custom AI Automation services.",
  path: "/pricing",
  locale: "en_US",
  languages: visibilityLanguages("pricing"),
});

export default function PricingPage() {
  return (
    <>
      <JsonLd data={buildPricingStructuredData("en")} />
      <div lang="en">
      <PageHero
        eyebrow="Selena Systems pricing"
        title="Two products, clearly separated."
        intro="AI Visibility measures how AI sees your business. AI Automation diagnoses and builds the workflows inside it. Start with the map below, then compare only the offers that match your goal."
        compact
        media={{
          video: { src: cinema.hero.video, poster: cinema.hero.poster },
          alt: cinema.hero.alt,
        }}
      />
      <PromotionBanner locale="en" />
      <PricingDirectory content={content.pricing.directory} />
      <PricingTracks content={content.pricing} showHeader={false} />
      <PackagesSection content={homepage} />
      <FAQSection items={content.faq} headline="Frequently asked questions" />
      </div>
    </>
  );
}
