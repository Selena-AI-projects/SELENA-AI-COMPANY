"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  nav,
  serviceNav,
  footerNote,
  cta,
  contactChannels,
  enCta,
  enFooterNote,
  enNav,
} from "@/lib/site";
import { commercialFacts } from "@/lib/commercial-facts";
import { homepage } from "@/lib/data/homepage";
import { ruHomepage } from "@/lib/data/homepage-ru";
import { CLIENT_PORTAL_ENABLED, selenaAppRoutes } from "@/lib/visibility/routes";
import { isEnglishPublicPath } from "@/lib/localized-routes";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";
import { BrandWordmark } from "@/components/ui/BrandWordmark";

/**
 * Dark charcoal footer — the closing contrast moment of every page.
 */
export function Footer() {
  const pathname = usePathname();
  const isEnglishLandingHome = pathname === "/";
  const isRussianLandingHome = pathname === "/ru";
  const isLegacyEnglishHome = pathname === "/en";
  const isEnglish = isEnglishPublicPath(pathname);

  // The seller shown in the footer must be the same entity the offer,
  // privacy pages and structured data name — read it from the one source.
  const seller = commercialFacts.seller;
  const currentNav = isEnglishLandingHome
    ? homepage.nav
    : isRussianLandingHome
      ? ruHomepage.nav
      : isLegacyEnglishHome
        ? enNav
        : isEnglish
          ? homepage.nav
          : nav;
  // The Russian landing page keeps its own nav list, so the journal is added
  // there too — everywhere else it already arrives through the shared nav.
  const footerNavBase =
    !isEnglish && !currentNav.some((item) => item.href === "/ru/projects")
      ? [...currentNav, { href: "/ru/projects", label: "Журнал замеров" }]
      : currentNav;
  const footerNav = isEnglish
    ? footerNavBase
    : [
        ...footerNavBase,
        ...[
          { href: "/ru/blog", label: "Блог" },
          { href: "/ru/tools", label: "Инструменты" },
        ].filter((next) => !footerNavBase.some((item) => item.href === next.href)),
      ];
  const currentNote = isEnglishLandingHome
    ? homepage.footerNote
    : isRussianLandingHome
      ? ruHomepage.footerNote
      : isEnglish
        ? enFooterNote
        : footerNote;
  const currentCta = isEnglishLandingHome
    ? homepage.cta
    : isRussianLandingHome
      ? ruHomepage.cta
      : isLegacyEnglishHome
        ? enCta.primary
        : isEnglish
          ? homepage.cta
          : cta.brief;
  const legalLinks = isEnglish
    ? [
        { href: "/en/privacy", label: "Privacy" },
        { href: "/en/terms", label: "Terms" },
      ]
    : [
        { href: "/privacy", label: "Политика конфиденциальности" },
        { href: "/terms", label: "Условия" },
      ];

  // The AI Automation service pages are Russian-only and have no English
  // counterpart to list.
  const showServices = !isEnglish;

  return (
    <footer className="bg-charcoal text-ivory">
      <Container>
        <div
          className={cn(
            "grid gap-12 py-16 sm:py-20",
            showServices
              ? "md:grid-cols-2 lg:grid-cols-[1.25fr_0.9fr_0.9fr_1.05fr]"
              : "md:grid-cols-[1.4fr_1fr_1fr]",
          )}
        >
          {/* Brand column */}
          <div>
            <BrandWordmark tone="light" size="lg" />
            <p className="mt-4 max-w-sm leading-relaxed text-ivory/60">{currentNote}</p>
          </div>

          {/* Navigation */}
          <nav aria-label={isEnglish ? "Footer navigation" : "Навигация в подвале"}>
            <p className="text-base font-semibold uppercase tracking-[0.22em] text-ivory/60">
              {isEnglish ? "Navigation" : "Разделы"}
            </p>
            <ul className="mt-4 space-y-2.5">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-ivory/75 transition-colors hover:text-copper"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {showServices && (
            <nav aria-label="Услуги в подвале">
              <p className="text-base font-semibold uppercase tracking-[0.22em] text-ivory/60">
                Услуги
              </p>
              <ul className="mt-4 space-y-2.5">
                {serviceNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-ivory/75 transition-colors hover:text-copper"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Next step */}
          <div>
            <p className="text-base font-semibold uppercase tracking-[0.22em] text-ivory/60">
              {isEnglish ? "Next step" : "Следующий шаг"}
            </p>
            <p className="mt-4 leading-relaxed text-ivory/75">
              {isEnglishLandingHome
                ? "Book an AI Audit. We will map the workflow and show which system should be built first."
                : isRussianLandingHome
                  ? "Начните с AI-аудита. Разберём процесс и определим, какую систему строить первой."
                : isEnglish
                  ? "Describe the process in plain language. We will map where AI can help and where it should not."
                  : "Опишите задачу простыми словами — разберём процесс и найдём, где AI поможет."}
            </p>
            <Link
              href={currentCta.href}
              className="mt-4 inline-flex items-center gap-2 font-medium text-link-dark transition-colors hover:text-ivory"
            >
              {currentCta.label}
              <span aria-hidden>→</span>
            </Link>
            {contactChannels.length > 0 ? (
              <ul className="mt-5 space-y-2">
                {contactChannels.map((channel) => (
                  <li key={channel.key}>
                    <a
                      href={channel.href}
                      className="text-sm text-ivory/65 transition-colors hover:text-copper"
                    >
                      {channel.label}: {channel.value}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-line-dark py-7 text-sm text-ivory/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Selena Systems.{" "}
            {isEnglish
              ? "AI implementation, automation and training."
              : "AI-внедрение, автоматизация и обучение."}
            <span className="mt-1 block text-ivory/52">
              {isEnglish
                ? `Services are provided by ${seller.legalName}, ${seller.country.en}.`
                : `Услуги оказывает ${seller.legalName}, ${seller.country.ru}.`}
            </span>
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {CLIENT_PORTAL_ENABLED && (
              <>
                <Link href={selenaAppRoutes.login} className="transition-colors hover:text-ivory/80">
                  {isEnglish ? "Client portal" : "Кабинет"}
                </Link>
                {/*
                  A sign-in link on its own is a locked door: someone who has
                  never been here has nowhere to go from it. The app decides
                  whether the registration page opens; the link is what makes it
                  reachable at all.
                */}
                <Link href={selenaAppRoutes.register} className="transition-colors hover:text-ivory/80">
                  {isEnglish ? "Create an account" : "Создать кабинет"}
                </Link>
              </>
            )}
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-ivory/80">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
