import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { ArticleBody } from "@/components/articles/article-body";
import { ArticleCard } from "@/components/articles/article-card";
import { ArticleCover } from "@/components/articles/article-cover";
import { LikeButton } from "@/components/articles/like-button";
import {
  formatArticleDate,
  getArticleBySlug,
  getArticleRecommendations,
} from "@/lib/articles";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Материал не найден" };
  }

  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const [recommendations, cookieStore] = await Promise.all([
    getArticleRecommendations(article.slug, 3),
    cookies(),
  ]);

  return (
    <main className="pb-24 pt-36 lg:pb-32 lg:pt-44">
      <article>
        <header className="site-container">
          <Link
            href="/articles"
            className="focus-ring top-nav-type inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Все материалы
          </Link>

          <div className="mt-10 grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,500px)] lg:gap-16">
            <div>
              <p className="top-nav-type text-muted-foreground">
                {formatArticleDate(article.publishedAt)}
              </p>
              <h1 className="mt-5 max-w-[17ch] font-heading text-[clamp(2.4rem,5vw,4.5rem)] font-medium leading-[1.08] tracking-[-0.045em]">
                {article.title}
              </h1>
              <p className="body-copy mt-7 max-w-[720px] text-muted-foreground">
                {article.excerpt}
              </p>
              <LikeButton
                className="mt-9"
                initialLiked={cookieStore.has(`kliko-liked-${article.id}`)}
                initialLikes={article.likes}
                slug={article.slug}
              />
            </div>

            <ArticleCover
              article={article}
              priority
              sizes="(min-width: 1024px) 500px, calc(100vw - 40px)"
            />
          </div>
        </header>

        <div className="site-container mt-16 lg:mt-24">
          <ArticleBody blocks={article.body} />
        </div>
      </article>

      {recommendations.length > 0 ? (
        <section
          className="site-container mt-24 border-t border-border pt-16 lg:mt-32 lg:pt-20"
          aria-labelledby="article-recommendations-title"
        >
          <div className="flex items-end justify-between gap-6">
            <h2 className="section-title" id="article-recommendations-title">
              Читайте также
            </h2>
            <Link
              href="/articles"
              className="focus-ring nav-type hidden border-b border-foreground pb-1 transition-colors hover:border-primary hover:text-primary sm:block"
            >
              Все материалы
            </Link>
          </div>

          <div className="mt-10 grid gap-x-3 gap-y-10 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
            {recommendations.map((recommendation) => (
              <ArticleCard
                key={recommendation.id}
                article={recommendation}
                coverSizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, calc(100vw - 40px)"
                headingAs="h3"
                initialLiked={cookieStore.has(`kliko-liked-${recommendation.id}`)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
