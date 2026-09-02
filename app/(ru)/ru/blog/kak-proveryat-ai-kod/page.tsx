import { AiCodeCrossReviewArticle } from "@/components/school/AiCodeCrossReviewArticle";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/metadata";
import { aiCodeCrossReviewArticle } from "@/lib/school/ai-code-cross-review";
import { site } from "@/lib/site";
import { buildAiCodeCrossReviewStructuredData } from "@/lib/structured-data";

const article = aiCodeCrossReviewArticle;
const pageUrl = `${site.url}${article.path}`;

const baseMetadata = buildMetadata({
  title: article.seoTitle,
  description: article.description,
  path: article.path,
  locale: "ru_RU",
  image: article.socialImage,
  keywords: [...article.tags],
  article: {
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    authors: [`${site.url}/about`],
  },
});

// This page used to hand-write its own title with a pipe separator; it came out
// 61 characters, past the length the search-result gate allows, and used a
// separator no other page uses. buildMetadata already composes
// "<seoTitle> — Selena Systems", which fits and matches the rest of the site.
export const metadata = {
  ...baseMetadata,
  robots: { index: true, follow: true },
};

export default function AiCodeCrossReviewBlogPage() {
  return (
    <>
      <JsonLd
        data={buildAiCodeCrossReviewStructuredData({
          pageUrl,
          title: article.title,
          description: article.description,
          imageUrl: `${site.url}${article.socialImage.url}`,
          publishedAt: article.publishedAt,
          updatedAt: article.updatedAt,
          steps: article.workflowSteps,
          tags: article.tags,
        })}
      />
      <AiCodeCrossReviewArticle />
    </>
  );
}
