import type { DiscoveryResult } from "../crawler/discover";
import type { AgentCheckId } from "./ruleRegistry";
import type { VisibilityLocale } from "../types";

export type DetectedPlatform = "wordpress" | "nextjs" | "vercel" | "cloudflare" | "netlify" | "generic";

export type PlatformDetection = {
  platform: DetectedPlatform;
  confidence: number;
  evidence: string[];
};

export function detectPlatform(crawl: DiscoveryResult): PlatformDetection {
  const homepage = crawl.pages.find((page) => page.role === "homepage")?.fetch;
  const html = homepage?.html ?? "";
  const headers = homepage?.headers ?? {};
  const candidates: PlatformDetection[] = [];

  const add = (platform: DetectedPlatform, evidence: string[]) => {
    if (evidence.length > 0) candidates.push({ platform, confidence: Math.min(0.98, 0.62 + evidence.length * 0.16), evidence });
  };

  add("wordpress", [
    /wp-content|wp-includes/i.test(html) ? "HTML references a WordPress asset path." : "",
    /<meta[^>]+generator[^>]+wordpress/i.test(html) ? "The generator meta tag identifies WordPress." : "",
  ].filter(Boolean));
  add("nextjs", [
    /__NEXT_DATA__|\/_next\//i.test(html) ? "HTML contains a Next.js runtime marker." : "",
    /next\.js/i.test(headers["x-powered-by"] ?? "") ? "x-powered-by identifies Next.js." : "",
  ].filter(Boolean));
  add("vercel", [
    headers["x-vercel-id"] ? "x-vercel-id is present." : "",
    /vercel/i.test(headers.server ?? "") ? "The server header identifies Vercel." : "",
  ].filter(Boolean));
  add("cloudflare", [
    headers["cf-ray"] ? "cf-ray is present." : "",
    /cloudflare/i.test(headers.server ?? "") ? "The server header identifies Cloudflare." : "",
  ].filter(Boolean));
  add("netlify", [
    headers["x-nf-request-id"] ? "x-nf-request-id is present." : "",
    /netlify/i.test(headers.server ?? "") ? "The server header identifies Netlify." : "",
  ].filter(Boolean));

  return candidates.sort((left, right) => right.confidence - left.confidence)[0] ?? {
    platform: "generic",
    confidence: 0,
    evidence: ["No supported platform marker was confirmed from public HTML or response headers."],
  };
}

const PLATFORM_NAMES: Record<DetectedPlatform, string> = {
  wordpress: "WordPress",
  nextjs: "Next.js",
  vercel: "Vercel",
  cloudflare: "Cloudflare",
  netlify: "Netlify",
  generic: "Generic server",
};

export function platformFixFor(
  ruleId: AgentCheckId,
  detection: PlatformDetection,
  locale: VisibilityLocale,
): { platform: string; confidence: number; instruction: string } {
  const confirmed = detection.confidence >= 0.7 && detection.platform !== "generic";
  const platform = confirmed ? PLATFORM_NAMES[detection.platform] : PLATFORM_NAMES.generic;
  const target = ruleId === "CF-C01"
    ? locale === "ru"
      ? "добавьте серверную обработку заголовка Accept и возвращайте text/markdown без выполнения клиентского кода"
      : "add server-side Accept handling and return text/markdown without executing client code"
    : ruleId.startsWith("CF-P") || ruleId.startsWith("CF-X") || ruleId === "CF-B03"
      ? locale === "ru"
        ? "создайте статический маршрут /.well-known/ из несекретных версионированных данных"
        : "create a static well-known route from non-secret versioned data"
      : ruleId === "CF-D01" || ruleId === "CF-D02" || ruleId === "SE-09"
        ? locale === "ru"
          ? "опубликуйте файл из папки статических файлов (public/static) и проверьте заголовки ответа"
          : "publish the file from the public/static layer and verify its response headers"
        : locale === "ru"
          ? "внесите изменение в источник страницы или серверную конфигурацию, затем проверьте предпросмотр и запустите повторную проверку"
          : "make the change in the page source or server configuration, then preview and re-scan";

  const evidence = confirmed ? ` ${detection.evidence.join(" ")}` : "";
  return {
    platform,
    confidence: confirmed ? detection.confidence : 0,
    instruction: locale === "ru"
      ? `${confirmed ? `${platform} подтверждён публичными сигналами.` : "Платформа не подтверждена; используется безопасный общий вариант."} ${target}.${evidence}`
      : `${confirmed ? `${platform} is supported by public markers.` : "The platform was not confirmed; use the safe generic path."} ${target}.${evidence}`,
  };
}
