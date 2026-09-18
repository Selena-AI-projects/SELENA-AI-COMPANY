/**
 * Small line-icon set for the /visibility page: the hero systems row and
 * the hospitality industry strip. Hand-drawn as plain stroked SVG — no
 * icon library, and no brand logos (ChatGPT/Gemini/Perplexity/Google are
 * named in text; these marks are generic, not trademarked wordmarks).
 */
type IconProps = { className?: string };

const base = "h-5 w-5 shrink-0";

export function IconSparkChat({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className ?? base} aria-hidden>
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4 3.5v-3.5H6.5A2.5 2.5 0 0 1 4 13.5v-7Z" strokeLinejoin="round" />
      <path d="M8.5 9.5h7M8.5 12.5h4.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconTwinStar({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className ?? base} aria-hidden>
      <path d="M12 4.5c.6 2.7 1.4 3.9 4.5 4.5-3.1.6-3.9 1.8-4.5 4.5-.6-2.7-1.4-3.9-4.5-4.5 3.1-.6 3.9-1.8 4.5-4.5Z" strokeLinejoin="round" />
      <path d="M18 14c.35 1.5.8 2.15 2.5 2.5-1.7.35-2.15.8-2.5 2.5-.35-1.5-.8-2.15-2.5-2.5 1.7-.35 2.15-.8 2.5-2.5Z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCompassMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className ?? base} aria-hidden>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M14.6 9.4 13 13l-3.6 1.6L11 11l3.6-1.6Z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconLayers({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className ?? base} aria-hidden>
      <path d="m12 4 8 4.3L12 13 4 8.3 12 4Z" strokeLinejoin="round" />
      <path d="m4 12.5 8 4.3 8-4.3M4 16.7 12 21l8-4.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconMapPin({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className ?? base} aria-hidden>
      <path d="M12 21s6.5-6.1 6.5-11A6.5 6.5 0 0 0 5.5 10c0 4.9 6.5 11 6.5 11Z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.25" />
    </svg>
  );
}

export function IconHotel({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className ?? base} aria-hidden>
      <path d="M5 21V6.5L12 3l7 3.5V21" strokeLinejoin="round" />
      <path d="M9 21v-5h6v5M9 10h.01M9 13.5h.01M15 10h.01M15 13.5h.01" strokeLinecap="round" />
    </svg>
  );
}

export function IconPalm({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className ?? base} aria-hidden>
      <path d="M12 21V11" strokeLinecap="round" />
      <path d="M12 11c0-3 1.7-5 4.5-5.5-1.2 2.6-1.8 4-4.5 5.5ZM12 11c0-3-1.7-5-4.5-5.5 1.2 2.6 1.8 4 4.5 5.5ZM12 9.5c1.8-2 3.6-2.6 6-2-1.6 2-3 2.7-6 2ZM12 9.5c-1.8-2-3.6-2.6-6-2 1.6 2 3 2.7 6 2Z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconFork({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className ?? base} aria-hidden>
      <path d="M8 3v6.5a2 2 0 0 0 4 0V3M10 9.5V21M16 3c-1.4 0-2.2 1.4-2.2 4.2 0 2.4 1 3.3 2.2 3.6V21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconLotus({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className ?? base} aria-hidden>
      <path d="M12 20c-4-1-6.5-4-6.5-7.5 3 .3 5.1 1.7 6.5 4 1.4-2.3 3.5-3.7 6.5-4C18.5 16 16 19 12 20Z" strokeLinejoin="round" />
      <path d="M12 16.5c-1-2.2-1-5 0-9 1 4 1 6.8 0 9Z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconUmbrella({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className ?? base} aria-hidden>
      <path d="M4.5 11.5a7.5 7.5 0 0 1 15 0Z" strokeLinejoin="round" />
      <path d="M12 11.5V19a2 2 0 0 1-2 2M12 4.5v1" strokeLinecap="round" />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className ?? base} aria-hidden>
      <path d="M5 12.5 9.5 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconInfinity({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className ?? base} aria-hidden>
      <path d="M7.5 9a3.5 3.5 0 1 0 0 6c2 0 3-1.3 4.5-3C13.5 10.3 14.5 9 16.5 9a3.5 3.5 0 1 1 0 6c-2 0-3-1.3-4.5-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
