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

const socialTitle = "Как проверять AI-код, если вы не разработчик | Selena Systems";

export const metadata = {
  ...baseMetadata,
  title: { absolute: socialTitle },
  robots: { index: true, follow: true },
  openGraph: { ...baseMetadata.openGraph, title: socialTitle },
  twitter: { ...baseMetadata.twitter, title: socialTitle },
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
