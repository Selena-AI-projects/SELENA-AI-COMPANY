"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { nav, cta, enCta, enNav } from "@/lib/site";
import { homepage } from "@/lib/data/homepage";
import { ruHomepage } from "@/lib/data/homepage-ru";
import { CLIENT_PORTAL_ENABLED, selenaAppRoutes } from "@/lib/visibility/routes";
import { alternateLocalePath, isEnglishPublicPath } from "@/lib/localized-routes";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { BrandWordmark } from "@/components/ui/BrandWordmark";

/**
 * Sticky header: transparent over the hero, turns into a warm glass bar
 * on scroll. Mobile: accessible disclosure menu with visible CTA,
 * no layout shift (menu overlays, doesn't push).
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const isEnglishLandingHome = pathname === "/";
  const isRussianLandingHome = pathname === "/ru";
  const isSalesLandingHome = isEnglishLandingHome || isRussianLandingHome;
  const isLegacyEnglishHome = pathname === "/en";
  const isEnglish = isEnglishPublicPath(pathname);
  const currentNav = isEnglishLandingHome
    ? homepage.nav
    : isRussianLandingHome
      ? ruHomepage.nav
      : isLegacyEnglishHome
        ? enNav
        : isEnglish
          ? homepage.nav
          : nav;
  const currentCta = isEnglishLandingHome
    ? homepage.cta
    : isRussianLandingHome
      ? ruHomepage.cta
      : isLegacyEnglishHome
        ? enCta.primary
        : isEnglish
          ? homepage.cta
          : cta.short;
  const homeHref = isEnglish ? "/" : "/ru";
  const languageHref = alternateLocalePath(pathname);
  const languageLabel = isEnglish ? "RU" : "EN";
  const darkHero = isSalesLandingHome && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // While the menu is open: lock body scroll, trap focus, handle Escape,
  // and auto-close if the viewport grows to the desktop breakpoint.
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    const menu = menuRef.current;
    const focusables = menu
      ? Array.from(
          menu.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
        )
      : [];
    focusables[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key === "Tab" && focusables.length) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled || open
            ? "border-b border-line bg-ivory/85 backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
          darkHero ? "text-ivory" : "text-ink",
        )}
      >
        <Container size="wide">
        <div className="flex h-16 items-center justify-between sm:h-[4.5rem]">
          {/* Wordmark */}
          <Link
            href={homeHref}
            className="inline-flex min-h-11 shrink-0 items-center"
            aria-label={isEnglish ? "Selena Systems — home" : "Selena Systems — на главную"}
          >
            <BrandWordmark tone={darkHero ? "light" : "dark"} />
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden items-center gap-5 xl:gap-7 lg:flex"
            aria-label={isEnglish ? "Main navigation" : "Основная навигация"}
          >
            {currentNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex min-h-11 items-center text-base font-medium transition-colors hover:text-copper-deep",
                  pathname === item.href
                    ? "text-copper-deep"
                    : darkHero
                      ? "text-ivory/76 hover:text-copper"
                      : "text-ink/80",
                )}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
            {CLIENT_PORTAL_ENABLED && (
              <Link
                href={selenaAppRoutes.login}
                className={cn(
                  "inline-flex min-h-11 items-center whitespace-nowrap text-base font-medium transition-colors hover:text-copper-deep",
                  darkHero ? "text-ivory/76 hover:text-copper" : "text-ink/80",
                )}
              >
                {isEnglish ? "Client login" : "Кабинет"}
              </Link>
            )}
            <Button href={currentCta.href} className="ml-2">
              {currentCta.label}
            </Button>
            {languageHref && (
              <Link
                href={languageHref}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full border px-3 py-2 text-xs font-semibold transition-colors hover:border-copper hover:text-copper-deep",
                  darkHero ? "border-ivory/16 text-ivory/70" : "border-line text-ink/70",
                )}
                hrefLang={isEnglish ? "ru" : "en"}
              >
                {languageLabel}
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            ref={toggleRef}
            type="button"
            className={cn(
              "relative z-50 -mr-2 flex h-11 w-11 items-center justify-center rounded-full lg:hidden",
              darkHero ? "text-ivory" : "text-ink",
            )}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={
              isEnglish
                ? open
                  ? "Close menu"
                  : "Open menu"
                : open
                  ? "Закрыть меню"
                  : "Открыть меню"
            }
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-3.5 w-6" aria-hidden>
              <span
                className={cn(
                  "absolute left-0 top-0 block h-0.5 w-6 rounded bg-current transition-transform duration-300",
                  open && "translate-y-[7px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-[7px] block h-0.5 w-6 rounded bg-current transition-opacity duration-200",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-[14px] block h-0.5 w-6 rounded bg-current transition-transform duration-300",
                  open && "-translate-y-[7px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
        </Container>
      </header>

      {/* Mobile menu overlay — kept OUT of <header>: the header's
          backdrop-filter would otherwise become the containing block for
          this fixed element and collapse it to the header's height. */}
      <div
        id="mobile-menu"
        ref={menuRef}
        className={cn(
          "fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-ivory transition-[opacity,visibility] duration-300 sm:top-[4.5rem] lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <Container>
          <nav
            className="flex flex-col py-6"
            aria-label={isEnglish ? "Mobile navigation" : "Мобильная навигация"}
          >
            {currentNav.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "border-b border-line py-4 font-serif text-2xl font-medium transition-colors",
                  pathname === item.href ? "text-copper-deep" : "text-ink",
                )}
                style={{ transitionDelay: open ? `${i * 30}ms` : undefined }}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
            {CLIENT_PORTAL_ENABLED && (
              <Link
                href={selenaAppRoutes.login}
                onClick={() => setOpen(false)}
                className="border-b border-line py-4 font-serif text-2xl font-medium text-copper-deep"
              >
                {isEnglish ? "Client login" : "Кабинет клиента"}
              </Link>
            )}
            <Button href={currentCta.href} size="lg" className="mt-8 w-full">
              {currentCta.label}
            </Button>
            {languageHref && (
              <Link
                href={languageHref}
                hrefLang={isEnglish ? "ru" : "en"}
                className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-line py-3 text-sm font-semibold text-ink/75"
              >
                {isEnglish ? "RU" : "English version"}
              </Link>
            )}
            <p className="mt-4 text-center text-sm text-muted">
              {isEnglish
                ? "Process first. Then the right tool."
                : "Сначала задача и процесс. Потом инструмент."}
            </p>
          </nav>
        </Container>
      </div>
    </>
  );
}
