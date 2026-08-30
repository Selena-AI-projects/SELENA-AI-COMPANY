import { ToolsLandingPage } from "@/components/tools/ToolsLandingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { buildLabSectionStructuredData } from "@/lib/structured-data";

const path = "/ru/tools";
const title = "Инструменты Selena Systems";
const description = "Каталог доступных инструментов Selena Systems: технические проверки, назначение, источники данных и честные границы результата.";

export const metadata = {
  ...buildMetadata({ title, description, path, locale: "ru_RU" }),
  robots: { index: true, follow: true },
};

export default function RussianToolsPage() {
  return (
    <>
      <JsonLd data={buildLabSectionStructuredData({ locale: "ru", pageUrl: `${site.url}${path}`, title, description })} />
      <ToolsLandingPage />
    </>
  );
}
