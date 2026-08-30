import { BlogLandingPage } from "@/components/blog/BlogLandingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { buildLabSectionStructuredData } from "@/lib/structured-data";

const path = "/ru/blog";
const title = "Блог Selena Systems — AI-инструменты и личный опыт";
const description = "Статьи, личный опыт, разборы AI-инструментов, новости AI Visibility и практические обновления Selena Systems.";

export const metadata = {
  ...buildMetadata({ title, description, path, locale: "ru_RU" }),
  robots: { index: true, follow: true },
};

export default function RussianBlogPage() {
  return (
    <>
      <JsonLd data={buildLabSectionStructuredData({ locale: "ru", pageUrl: `${site.url}${path}`, title: "Блог", description })} />
      <BlogLandingPage />
    </>
  );
}
