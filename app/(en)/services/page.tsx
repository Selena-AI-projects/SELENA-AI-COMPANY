import { permanentRedirect } from "next/navigation";

/** Legacy services route; AI Systems is the single canonical service entry. */
export default function ServicesPage(): never {
  permanentRedirect("/ai-systems");
}
