import { buildMetadata } from "@/lib/metadata";
import { permanentRedirect } from "next/navigation";

export const metadata = buildMetadata({
  title: "AI-карта возможностей для бизнеса",
  description:
    "Диагностический путь Selena Systems: оцените ручную рутину, выберите приоритет и получите карту процессов-кандидатов для AI и автоматизации.",
  path: "/ru/ai-map",
  locale: "ru_RU",
});

export default function RussianAIMapPage() {
  permanentRedirect("/ru#ai-systems");
}
