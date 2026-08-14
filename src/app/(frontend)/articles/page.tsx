import type { Metadata } from "next";
import { cookies } from "next/headers";

import { ArticleCard } from "@/components/articles/article-card";
import { getArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Последние материалы",
  description: "Статьи KLIKO о цифровых продуктах, технологиях и работе команд.",
};

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const [articles, cookieStore] = await Promise.all([getArticles(), cookies()]);

  return (
    <main className="pb-24 pt-40 lg:pb-32 lg:pt-48">
      <section className="site-container" aria-labelledby="latest-articles-title">
        <h1
          className="section-title max-w-none"
          id="latest-articles-title"
        >
          Последние материалы
        </h1>

        {articles.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-x-3 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:mt-14 lg:grid-cols-5">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                initialLiked={cookieStore.has(`kliko-liked-${article.id}`)}
              />
            ))}
          </div>
        ) : (
          <p className="body-copy mt-12 max-w-2xl text-muted-foreground">
            Новые материалы появятся здесь после публикации.
          </p>
        )}
      </section>
    </main>
  );
}
