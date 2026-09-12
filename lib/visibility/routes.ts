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
 * Emergency switch for every link into the client portal. The portal being
 * reachable is the normal state, so the links show unless
 * `NEXT_PUBLIC_CLIENT_PORTAL_ENABLED=false` is set — a deploy that forgets the
 * variable shows the site as intended rather than silently dropping the
 * portal. Set it to "false" if the portal goes down again, so visitors are not
 * sent to an error page. It is read on the client because the header and
 * footer are client components; it gates nothing but link visibility, so it is
 * deliberately not one of the server-only capability flags in
 * lib/diagnostics/flags.ts.
 */
export const CLIENT_PORTAL_ENABLED = process.env.NEXT_PUBLIC_CLIENT_PORTAL_ENABLED !== "false";

/** Public app entry points. The app can stay deployment-provider neutral while
 * the marketing site always links to the stable customer-facing hostname. */
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
