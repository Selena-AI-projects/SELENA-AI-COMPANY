import { isBareEnglishVisibilityPath } from "@/lib/visibility/routes";

export function isBareEnglishLabPath(pathname: string) {
  return pathname === "/lab" || pathname.startsWith("/lab/");
}

/**
 * English pages that sit outside `/en`. Only AI Systems is one: the service
 * pages beside it are written in Russian and the middleware serves them as
 * Russian documents, so listing them here dressed a Russian page in the
 * English menu.
 */
const englishOnlyPublicRoutes = ["/ai-systems"];

function isEnglishOnlyPublicPath(pathname: string) {
  return englishOnlyPublicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isEnglishPublicPath(pathname: string) {
  return pathname === "/" ||
    pathname.startsWith("/en") ||
    isBareEnglishVisibilityPath(pathname) ||
    isBareEnglishLabPath(pathname) ||
    isEnglishOnlyPublicPath(pathname);
}

/** Locale switch that preserves the current product, Lab section or article. */
export function alternateLocalePath(pathname: string) {
  if (pathname === "/") return "/ru";
  if (pathname === "/ru") return "/";
  if (isBareEnglishLabPath(pathname) || isBareEnglishVisibilityPath(pathname)) return `/ru${pathname}`;
  if (pathname === "/ru/lab" || pathname.startsWith("/ru/lab/")) return pathname.slice(3);
  if (
    pathname === "/ru/visibility" ||
    pathname.startsWith("/ru/visibility/") ||
    pathname === "/ru/check" ||
    pathname.startsWith("/ru/check/") ||
    pathname === "/ru/methodology" ||
    pathname.startsWith("/ru/methodology/") ||
    pathname === "/ru/pricing" ||
    pathname.startsWith("/ru/pricing/")
  ) return pathname.slice(3);

  const explicit: Record<string, string> = {
    "/en/about": "/about",
    "/en/contact": "/contact",
    "/en/privacy": "/privacy",
    "/en/terms": "/terms",
    "/about": "/en/about",
    "/contact": "/en/contact",
    "/privacy": "/en/privacy",
    "/terms": "/en/terms",
  };
  // Pages with no translated counterpart (AI Systems, AI Training, ...)
  // return null so the caller can hide the switch instead of dropping the
  // visitor on the home page and losing their place.
  return explicit[pathname] ?? null;
}
