/**
 * Site-wide configuration: brand, navigation, CTAs, contact channels.
 * Single source of truth for links and labels used across the site.
 */

import { services } from "@/lib/data/services";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://www.selenasystems.com";

export const site = {
  name: "Selena Systems",
  // Public-facing tagline (Russian only, per CLAUDE.md).
  tagline: "AI-внедрение, автоматизация и обучение для бизнеса",
  description:
    "Selena Systems помогает предпринимателям, экспертам и небольшим командам находить повторяющиеся задачи, внедрять AI-сценарии, автоматизации, AI-консьержей и контент-системы без сложного кода.",
  // Used for canonical/OG/sitemap. Override with NEXT_PUBLIC_SITE_URL on custom domains.
  url: siteUrl,
  locale: "ru_RU",
} as const;

/**
 * Primary and secondary conversion labels (reused everywhere).
 *
 * The free check reads a site and says whether machines can fetch and
 * understand it. It never asks an AI system anything — there is no code path
 * from it to a paid provider. So the button says "готовность", not
 * "видимость": the second is what the $49 tier measures, and promising it on
 * a free button means the visitor learns the difference after clicking, which
 * is the moment they stop believing the rest of the page.
 */
export const cta = {
  primary: { label: "Проверить готовность сайта для AI — бесплатно", href: "/ru/check" },
  secondary: { label: "Обсудить AI-систему", href: "/contact" },
  brief: { label: "Проверить готовность сайта", href: "/ru/check" },
  short: { label: "Проверить готовность сайта", href: "/ru/check" },
  contact: { label: "Связаться", href: "/contact" },
} as const;

/**
 * Main navigation (desktop + mobile).
 *
 * This is the Russian menu, so every destination is a Russian page. AI
 * Automation is sold on the Russian home page rather than on a page of its
 * own; `/ai-systems` is the English twin of that block and belongs to the
 * English menu.
 */
export const nav: { label: string; href: string }[] = [
  { label: "AI Automation", href: "/ru#ai-systems" },
  { label: "AI Visibility", href: "/ru/visibility" },
  { label: "Тарифы", href: "/ru/pricing" },
  { label: "Selena Lab", href: "/ru/lab" },
  { label: "Проекты", href: "/ru/projects" },
  { label: "Обо мне", href: "/about" },
  { label: "Контакты", href: "/contact" },
];

/**
 * The service pages that have a page of their own.
 *
 * They are children of AI Automation rather than top-level sections, so they
 * live in the footer: the header row is already at the width it can hold. Read
 * from the service catalogue so a service that gains its own page appears here
 * without being retyped — before this, all three were in the sitemap with no
 * link on the site leading to them.
 */
export const serviceNav: { label: string; href: string }[] = services
  .filter((service) => service.href.startsWith("/ai-"))
  .map((service) => ({ label: service.name, href: service.href }))
  .filter(
    (item, index, all) => all.findIndex((other) => other.href === item.href) === index,
  );

export const enCta = {
  primary: { label: "Get an AI map", href: "/en#contact" },
  secondary: { label: "See services", href: "/en#services" },
  contact: { label: "Contact", href: "/en#contact" },
} as const;

export const enNav: { label: string; href: string }[] = [
  { label: "Diagnostic", href: "/en#diagnostic" },
  { label: "Services", href: "/en#services" },
  { label: "Process", href: "/en#process" },
  { label: "Visibility", href: "/visibility" },
  { label: "Selena Lab", href: "/lab" },
  { label: "Cases", href: "/en#cases" },
  { label: "Contact", href: "/en#contact" },
];

function cleanPublicEnv(value: string | undefined) {
  const next = value?.trim();
  return next ? next : null;
}

function toTelegramHref(value: string | null) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const handle = value.replace(/^@/, "").trim();
  return handle ? `https://t.me/${handle}` : null;
}

function toWhatsappHref(value: string | null) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const rawPhone = value.replace(/\D/g, "");
  const phone = /^8\d{10}$/.test(rawPhone)
    ? `7${rawPhone.slice(1)}`
    : rawPhone;
  return phone ? `https://wa.me/${phone}` : null;
}

function toEmailHref(value: string | null) {
  if (!value) return null;
  if (value.startsWith("mailto:")) return value;
  return value.includes("@") ? `mailto:${value}` : null;
}

const defaultPublicContact = {
  whatsapp: "+7 921 933-11-13",
} as const;

/** Public contact channels. Set these with NEXT_PUBLIC_CONTACT_* env vars. */
export const contact = {
  telegram: cleanPublicEnv(process.env.NEXT_PUBLIC_CONTACT_TELEGRAM),
  whatsapp:
    cleanPublicEnv(process.env.NEXT_PUBLIC_CONTACT_WHATSAPP) ??
    defaultPublicContact.whatsapp,
  email: cleanPublicEnv(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
} as const;

export const contactLinks = {
  telegram: toTelegramHref(contact.telegram),
  whatsapp: toWhatsappHref(contact.whatsapp),
  email: toEmailHref(contact.email),
} as const;

export function createWhatsappHref(message?: string) {
  const base = contactLinks.whatsapp;
  if (!base) return null;
  if (!message?.trim()) return base;

  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}text=${encodeURIComponent(message.trim())}`;
}

export type ContactChannel = {
  key: "telegram" | "whatsapp" | "email";
  label: string;
  value: string;
  href: string;
};

export const contactChannels = [
  {
    key: "telegram",
    label: "Telegram",
    value: contact.telegram,
    href: contactLinks.telegram,
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    value: contact.whatsapp,
    href: contactLinks.whatsapp,
  },
  {
    key: "email",
    label: "Email",
    value: contact.email,
    href: contactLinks.email,
  },
].filter((channel): channel is ContactChannel => Boolean(channel.value && channel.href));

export const footerNote =
  "Selena Systems — практическое внедрение AI в бизнес-процессы. Сначала задача и процесс, потом инструмент.";

export const enFooterNote =
  "Selena Systems — practical AI implementation for business operations. Process first, tools second.";
