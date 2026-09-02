import { NextResponse, type NextRequest } from "next/server";
import { contentSecurityPolicy } from "./lib/security-headers";

const russianOnlyPaths = new Set([
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/ai-training",
  "/ai-automation",
  "/ai-content",
]);

function documentLocale(pathname: string) {
  if (pathname === "/ru" || pathname.startsWith("/ru/")) return "ru";
  if (russianOnlyPaths.has(pathname)) return "ru";
  return "en";
}

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    "x-selena-document-locale",
    documentLocale(request.nextUrl.pathname),
  );

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  // No nonce: the site is prerendered, so a per-request nonce can never match
  // the frozen script tags — see the note in lib/security-headers.ts.
  response.headers.set("Content-Security-Policy", contentSecurityPolicy());
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
