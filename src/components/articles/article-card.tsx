import Link from "next/link";

import type { Article } from "@/lib/articles";
import { formatArticleDate } from "@/lib/articles";

import { ArticleCover } from "./article-cover";
import { LikeButton } from "./like-button";

type ArticleCardProps = {
  article: Article;
  coverSizes?: string;
  headingAs?: "h2" | "h3";
  initialLiked?: boolean;
};

export function ArticleCard({
  article,
  coverSizes = "(min-width: 1024px) 20vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, calc(100vw - 40px)",
  headingAs: Heading = "h2",
  initialLiked = false,
}: ArticleCardProps) {
  return (
    <article className="group flex min-w-0 flex-col">
      <Link
        href={`/articles/${article.slug}`}
        className="focus-ring block overflow-hidden bg-muted"
        aria-label={`Открыть материал «${article.title}»`}
      >
        <ArticleCover
          article={article}
          sizes={coverSizes}
        />
      </Link>

      <div className="flex flex-1 flex-col pt-5">
        <Link
          href={`/articles/${article.slug}`}
          className="focus-ring block transition-colors group-hover:text-primary"
        >
          <Heading className="font-heading text-[18px] font-medium leading-[1.45] tracking-[-0.025em]">
            {article.title}
          </Heading>
        </Link>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-3">
          <time
            className="text-xs leading-5 text-muted-foreground"
            dateTime={article.publishedAt}
          >
            {formatArticleDate(article.publishedAt, "short")}
          </time>
          <LikeButton
            compact
            initialLiked={initialLiked}
            initialLikes={article.likes}
            slug={article.slug}
          />
        </div>
      </div>
    </article>
  );
}
