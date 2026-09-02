import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sitemap from "@/app/sitemap";
import { metadata } from "@/app/(ru)/ru/blog/kak-proveryat-ai-kod/page";
import { metadata as schoolMetadata } from "@/app/(ru)/ru/school/page";
import {
  aiCodeCrossReviewArticle,
  aiCodeCrossReviewTelegramCampaignPath,
} from "@/lib/school/ai-code-cross-review";
import { buildAiCodeCrossReviewStructuredData } from "@/lib/structured-data";
import { communityLinks, site } from "@/lib/site";

function graphOf(value: { "@graph": unknown[] }) {
  return value["@graph"] as Array<Record<string, unknown>>;
}

test("the Russian blog article has the approved canonical metadata and no fake hreflang", () => {
  assert.equal(
    metadata.alternates?.canonical,
    "https://www.selenasystems.com/ru/blog/kak-proveryat-ai-kod",
  );
  assert.equal(metadata.alternates?.languages, undefined);
  assert.deepEqual(metadata.robots, { index: true, follow: true });
  assert.equal((metadata.openGraph as { type?: string })?.type, "article");
  assert.equal((metadata.twitter as { card?: string })?.card, "summary_large_image");
  assert.deepEqual(metadata.title, {
    absolute: "Как проверять AI-код без разработчика — Selena Systems",
  });
  // The rendered title has to survive the search-result gate the sitemap
  // validator enforces: 30–60 characters, brand suffix included.
  const renderedTitle = (metadata.title as { absolute: string }).absolute;
  assert.ok(renderedTitle.length >= 30 && renderedTitle.length <= 60, renderedTitle);
});

test("the Article and HowTo graphs match the visible workflow", () => {
  const pageUrl = `${site.url}${aiCodeCrossReviewArticle.path}`;
  const graph = graphOf(buildAiCodeCrossReviewStructuredData({
    pageUrl,
    title: aiCodeCrossReviewArticle.title,
    description: aiCodeCrossReviewArticle.description,
    imageUrl: `${site.url}${aiCodeCrossReviewArticle.socialImage.url}`,
    publishedAt: aiCodeCrossReviewArticle.publishedAt,
    updatedAt: aiCodeCrossReviewArticle.updatedAt,
    steps: aiCodeCrossReviewArticle.workflowSteps,
    tags: aiCodeCrossReviewArticle.tags,
  }));

  for (const type of ["Organization", "Person", "Article", "HowTo", "BreadcrumbList"]) {
    assert.ok(graph.some((node) => node["@type"] === type), `missing ${type}`);
  }
  assert.ok(!graph.some((node) => node["@type"] === "FAQPage"));

  const article = graph.find((node) => node["@type"] === "Article")!;
  assert.equal(article.url, pageUrl);
  assert.equal(article.mainEntityOfPage && (article.mainEntityOfPage as Record<string, string>)["@id"], pageUrl);
  assert.equal(article.inLanguage, "ru");
  assert.equal(article.datePublished, "2026-08-30");
  assert.equal(article.dateModified, "2026-08-30");

  const howTo = graph.find((node) => node["@type"] === "HowTo")!;
  assert.equal((howTo.step as unknown[]).length, aiCodeCrossReviewArticle.workflowSteps.length);

  const breadcrumbs = graph.find((node) => node["@type"] === "BreadcrumbList")!;
  assert.match(JSON.stringify(breadcrumbs), /\/ru\/blog/);
  assert.ok(!JSON.stringify(breadcrumbs).includes("/ru/school"));
});

test("the blog, tools and article are indexed while the future school stays hidden", () => {
  const entries = sitemap();
  for (const path of ["/ru/blog", "/ru/tools", aiCodeCrossReviewArticle.path]) {
    const entry = entries.find((item) => new URL(item.url).pathname === path);
    assert.ok(entry, `missing ${path}`);
    assert.equal(entry.alternates, undefined);
  }
  assert.ok(!entries.some((item) => new URL(item.url).pathname === "/ru/school"));
  assert.deepEqual(schoolMetadata.robots, { index: false, follow: true });
});

test("Telegram campaign attribution and the discussion event use the approved contract", () => {
  assert.equal(communityLinks.baliAiHorecaTelegram, "https://t.me/bali_ai_horeca");
  const url = new URL(aiCodeCrossReviewTelegramCampaignPath, site.url);
  assert.equal(url.searchParams.get("utm_source"), "telegram");
  assert.equal(url.searchParams.get("utm_medium"), "social");
  assert.equal(url.searchParams.get("utm_campaign"), "ai_code_cross_review");
  assert.equal(url.searchParams.get("utm_content"), "workflow_post");

  const tracker = readFileSync(join(process.cwd(), "components/analytics/PublicEventTracker.tsx"), "utf8");
  assert.match(tracker, /utm_source/);
  assert.match(tracker, /utm_medium/);
  assert.match(tracker, /utm_campaign/);
  assert.match(tracker, /utm_content/);

  const discussion = readFileSync(join(process.cwd(), "components/school/TelegramDiscussionLink.tsx"), "utf8");
  assert.match(discussion, /telegram_discussion_click/);
  assert.match(discussion, /page: "ai_code_cross_review"/);
  assert.match(discussion, /placement: "article_footer"/);
});

test("responsive AVIF, WebP and source images exist for both article figures", () => {
  for (const baseName of [
    "codex-claude-cross-review-workflow-ru",
    "ai-code-review-task-cycle-ru",
  ]) {
    for (const suffix of [".png", ".webp", "-640.webp", ".avif", "-640.avif"]) {
      const path = join(process.cwd(), "public/media/school", `${baseName}${suffix}`);
      assert.ok(existsSync(path), `missing ${path}`);
    }
  }
});
