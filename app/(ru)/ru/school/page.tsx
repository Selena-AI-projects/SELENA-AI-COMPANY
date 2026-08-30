import { SchoolLandingPage } from "@/components/school/SchoolLandingPage";
import { buildMetadata } from "@/lib/metadata";

const path = "/ru/school";
const title = "Школа Selena Systems — раздел готовится";
const description =
  "Учебный раздел Selena Systems готовится и пока не участвует в публичной навигации или поисковой индексации.";

export const metadata = {
  ...buildMetadata({
    title,
    description,
    path,
    locale: "ru_RU",
  }),
  robots: { index: false, follow: true },
};

export default function RussianSchoolPage() {
  return <SchoolLandingPage />;
}
