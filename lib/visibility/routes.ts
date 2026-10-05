/**
 * Visibility route contract. Single source of truth for hreflang pairing
 * between the EN and RU Visibility pages (SSOT §6.2, §29).
 */
export const visibilityRoutes = {
  en: {
    visibility: "/visibility",
    check: "/check",
    methodology: "/methodology",
    pricing: "/pricing",
    contact: "/en/contact",
  },
  ru: {
    visibility: "/ru/visibility",
    check: "/ru/check",
    methodology: "/ru/methodology",
    pricing: "/ru/pricing",
    contact: "/contact",
  },
} as const;

/**
 * Only the literal "true" (any case, surrounding whitespace ignored) opens the
 * portal. Anything else, including an unset variable, keeps it closed, so a
 * deploy that never sets the variable publishes no portal link.
 */
export function isClientPortalEnabled(env: { readonly NEXT_PUBLIC_CLIENT_PORTAL_ENABLED?: string }) {
  return env.NEXT_PUBLIC_CLIENT_PORTAL_ENABLED?.trim().toLowerCase() === "true";
}

/**
 * Every link into the client portal hangs off this one switch. It is driven by
 * the environment so the owner can open the portal from Vercel once
 * app.selenasystems.com stops serving the staging cabinet, and close it again,
 * without a code release. The variable is spelled out as a static
 * `process.env.NEXT_PUBLIC_*` access because Next.js inlines only that form
 * into the client bundle; passing `process.env` itself would leave the header
 * and footer (client components) reading an empty object in the browser.
 */
export const CLIENT_PORTAL_ENABLED = isClientPortalEnabled({
  NEXT_PUBLIC_CLIENT_PORTAL_ENABLED: process.env.NEXT_PUBLIC_CLIENT_PORTAL_ENABLED,
});

/** Portal entry points, published only while CLIENT_PORTAL_ENABLED is true.
 * The hostname currently resolves to the staging cabinet. */
export const selenaAppRoutes = {
  home: "https://app.selenasystems.com",
  login: "https://app.selenasystems.com/auth/login",
  register: "https://app.selenasystems.com/auth/register",
  freeAiVisibility: "https://app.selenasystems.com/free-ai-visibility",
  workspace: "https://app.selenasystems.com/app/selena",
} as const;

export function visibilityLanguages(key: keyof typeof visibilityRoutes.en) {
  return {
    "x-default": visibilityRoutes.en[key],
    en: visibilityRoutes.en[key],
    ru: visibilityRoutes.ru[key],
  };
}

/**
 * The site's locale convention treats bare root paths as Russian except
 * for a few explicit exceptions ("/", "/en/*"). These four Visibility
 * routes are new bare-root *English* pages, so Header/DocumentLanguage
 * need to recognize them explicitly instead of falling through to the
 * Russian default (SSOT §6.2 puts English Visibility at bare paths,
 * mirroring "/ru/ai-map" having no bare-root English sibling to clash with).
 */
const bareEnglishVisibilityPaths = [
  visibilityRoutes.en.visibility,
  visibilityRoutes.en.check,
  visibilityRoutes.en.methodology,
  visibilityRoutes.en.pricing,
];

export function isBareEnglishVisibilityPath(pathname: string) {
  return bareEnglishVisibilityPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}
