"use client";

import { trackPublicEvent } from "@/lib/diagnostics/analytics";

export function TelegramDiscussionLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      onClick={() => {
        trackPublicEvent("telegram_discussion_click", {
          page: "ai_code_cross_review",
          placement: "article_footer",
        });
      }}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-ivory px-6 py-3 font-medium text-ink transition-colors hover:bg-surface"
    >
      Обсудить в Telegram <span aria-hidden>↗</span>
    </a>
  );
}
