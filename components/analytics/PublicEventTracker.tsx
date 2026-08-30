"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPublicEvent } from "@/lib/diagnostics/analytics";

function localeForPath(pathname: string) {
  return pathname === "/ru" || pathname.startsWith("/ru/") ? "ru" : "en";
}

function routeForHref(href: string) {
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    if (/\/(?:visibility|pricing)(?:\/|$)/.test(url.pathname)) return "visibility" as const;
    if (/\/(?:check|free-ai-map|ai-map)(?:\/|$)/.test(url.pathname)) return "ai_map" as const;
    if (/\/ai-systems\/ai-sprint(?:\/|$)/.test(url.pathname)) return "sprint" as const;
    return null;
  } catch {
    return null;
  }
}

function telegramCampaignProperties() {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(
    ["utm_source", "utm_medium", "utm_campaign", "utm_content"]
      .map((key) => [key, params.get(key)?.slice(0, 96)] as const)
      .filter((entry): entry is readonly [string, string] => Boolean(entry[1])),
  );
}

/**
 * Provider-neutral public funnel instrumentation.
 *
 * This component only registers the approved event contract. The current
 * analytics boundary has no network transport, and event properties are
 * intentionally limited to route/product context without visitor content.
 */
export function PublicEventTracker() {
  const pathname = usePathname();
  const locale = localeForPath(pathname);

  useEffect(() => {
    if (pathname === "/" || pathname === "/ru" || pathname === "/en") {
      trackPublicEvent("hero_view", {
        locale,
        page: pathname === "/en" ? "/" : pathname,
        product_context: "selena_systems",
      });
    }

    if (pathname === "/ru/blog/kak-proveryat-ai-kod") {
      const campaign = telegramCampaignProperties();
      if (Object.keys(campaign).length > 0) {
        window.sessionStorage.setItem("selena:last_campaign", JSON.stringify(campaign));
      }
      trackPublicEvent("hero_view", {
        locale: "ru",
        page: "ai_code_cross_review",
        ...campaign,
      });
    }

    if (pathname === "/pricing" || pathname === "/ru/pricing") {
      trackPublicEvent("pricing_view", {
        locale,
        product_line: "catalog",
        plan: "all",
      });
    }

    if (pathname === "/visibility" || pathname === "/ru/visibility") {
      trackPublicEvent("pricing_view", {
        locale,
        product_line: "ai_visibility",
        plan: "all",
      });
    }
  }, [locale, pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      const route = routeForHref(link.href);
      if (!route) return;
      trackPublicEvent("route_select", { locale, route });
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [locale]);

  return null;
}
