import Link from "next/link";
import { cn } from "@/lib/cn";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "onDark";
  size?: "md" | "lg";
  className?: string;
};

/**
 * CTA link styled as a button. Premium: solid copper primary,
 * outlined warm secondary, quiet ghost. All with visible focus.
 */
export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300",
        size === "md" && "px-6 py-3 text-base",
        size === "lg" && "px-8 py-4 text-base",
        variant === "primary" &&
          "bg-copper-deep text-surface shadow-[0_10px_24px_-12px_rgba(143,92,52,0.7)] hover:bg-copper-deeper hover:shadow-[0_14px_30px_-12px_rgba(110,69,38,0.75)] hover:-translate-y-px",
        variant === "secondary" &&
          "border border-line bg-surface text-ink hover:border-copper-deep/60 hover:text-link-deep",
        variant === "ghost" && "text-ink hover:text-link-deep",
        variant === "onDark" &&
          "bg-ivory text-ink hover:bg-surface hover:-translate-y-px shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)]",
        className,
      )}
    >
      {children}
    </Link>
  );
}
