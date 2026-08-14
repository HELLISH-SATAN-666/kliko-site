import config from "@payload-config";
import { getPayload } from "payload";

import type { Article as PayloadArticle, Media } from "@/payload-types";

export type ArticleCover = {
  url: string;
  alt: string;
};

export type ArticleContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "image"; caption?: string };

export type ArticleBody = ArticleContentBlock[] | PayloadArticle["content"];

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  likes: number;
  cover?: ArticleCover;
  body: ArticleBody;
};

const baseBody: ArticleContentBlock[] = [
  {
    type: "paragraph",
    text: "Цифровой продукт начинается не с выбора технологии, а с ясного понимания задачи. На этом этапе команда фиксирует контекст, ограничения и критерии результата, чтобы дальнейшая работа оставалась управляемой.",
  },
  {
    type: "heading",
    level: 2,
    text: "Сначала — цель и сценарии",
  },
  {
    type: "paragraph",
    text: "Полезно описать ключевые пользовательские сценарии и проверить, какие из них действительно влияют на бизнес-результат. Такой подход помогает не перегружать первый релиз и быстрее получить обратную связь.",
  },
  {
    type: "quote",
    text: "Хороший первый релиз решает одну важную задачу целиком, а не десять задач наполовину.",
  },
  {
    type: "heading",
    level: 2,
    text: "Что стоит зафиксировать",
  },
  {
    type: "list",
    items: [
      "Для кого создаётся продукт и в каком контексте им пользуются.",
      "Какой результат должен получить пользователь.",
      "По каким показателям команда поймёт, что решение работает.",
      "Какие ограничения влияют на сроки, бюджет и архитектуру.",
    ],
  },
  {
    type: "image",
    caption: "Место для изображения, схемы или иллюстрации из редактора.",
  },
  {
    type: "heading",
    level: 3,
    text: "Пример структуры этапов",
  },
  {
    type: "table",
    headers: ["Этап", "Результат", "Фокус"],
    rows: [
      ["Исследование", "Карта задачи", "Пользователи и ограничения"],
      ["Проектирование", "Прототип", "Ключевые сценарии"],
      ["Разработка", "Рабочий релиз", "Качество и скорость"],
    ],
  },
  {
    type: "paragraph",
    text: "После первого релиза решение развивается на основе фактических данных: поведения пользователей, обратной связи и продуктовых показателей. Это позволяет планировать следующие шаги без лишних предположений.",
  },
];

export const demoArticles: Article[] = [
  {
    id: "article-01",
    slug: "kak-podgotovit-produkt-k-razrabotke",
    title: "Как подготовить цифровой продукт к разработке",
    excerpt: "Практический подход к постановке задачи, приоритизации сценариев и планированию первого релиза.",
    publishedAt: "2026-08-12T09:00:00.000Z",
    likes: 48,
    body: baseBody,
  },
  {
    id: "article-02",
    slug: "mvp-bez-lishnego",
    title: "MVP без лишнего: что действительно важно в первом релизе",
    excerpt: "Разбираемся, как ограничить объём продукта и при этом сохранить его ценность для пользователя.",
    publishedAt: "2026-08-06T09:00:00.000Z",
    likes: 37,
    body: baseBody,
  },
  {
    id: "article-03",
    slug: "arhitektura-dlya-rosta",
    title: "Архитектура продукта, готового к росту",
    excerpt: "Какие решения помогают развивать систему последовательно и не усложнять её раньше времени.",
    publishedAt: "2026-07-29T09:00:00.000Z",
    likes: 61,
    body: baseBody,
  },
  {
    id: "article-04",
    slug: "komanda-dlya-cifrovogo-produkta",
    title: "Какая команда нужна цифровому продукту",
    excerpt: "Роли, зоны ответственности и рабочие договорённости на разных этапах развития проекта.",
    publishedAt: "2026-07-21T09:00:00.000Z",
    likes: 29,
    body: baseBody,
  },
  {
    id: "article-05",
    slug: "dannye-v-produktovyh-resheniyah",
    title: "Как использовать данные в продуктовых решениях",
    excerpt: "От полезных метрик до решений, которые команда принимает на основании фактов.",
    publishedAt: "2026-07-14T09:00:00.000Z",
    likes: 54,
    body: baseBody,
  },
  {
    id: "article-06",
    slug: "ocenka-srokov-razrabotki",
    title: "Из чего складывается оценка сроков разработки",
    excerpt: "Почему точная оценка появляется постепенно и какие данные помогают сделать её надёжнее.",
    publishedAt: "2026-07-03T09:00:00.000Z",
    likes: 42,
    body: baseBody,
  },
  {
    id: "article-07",
    slug: "kachestvo-bez-tormozheniya",
    title: "Качество без торможения продуктовой команды",
    excerpt: "Как встроить проверку качества в процесс и не превращать её в отдельный длинный этап.",
    publishedAt: "2026-06-25T09:00:00.000Z",
    likes: 33,
    body: baseBody,
  },
  {
    id: "article-08",
    slug: "tehnicheskiy-dolg-pod-kontrolem",
    title: "Как держать технический долг под контролем",
    excerpt: "Способ принимать осознанные компромиссы и планировать улучшения без остановки развития.",
    publishedAt: "2026-06-16T09:00:00.000Z",
    likes: 46,
    body: baseBody,
  },
  {
    id: "article-09",
    slug: "integracii-bez-haosa",
    title: "Интеграции без хаоса: границы и ответственность",
    excerpt: "На что обратить внимание при подключении внешних сервисов и обмене данными между системами.",
    publishedAt: "2026-06-08T09:00:00.000Z",
    likes: 24,
    body: baseBody,
  },
  {
    id: "article-10",
    slug: "posle-zapuska-produkta",
    title: "Что происходит с продуктом после запуска",
    excerpt: "Наблюдение, поддержка и развитие решения после выхода первой рабочей версии.",
    publishedAt: "2026-05-28T09:00:00.000Z",
    likes: 39,
    body: baseBody,
  },
];

const canUseDemoArticles = process.env.NODE_ENV !== "production";

function mapCover(cover: number | Media | null | undefined): ArticleCover | undefined {
  if (!cover || typeof cover === "number") {
    return undefined;
  }

  const url = cover.sizes?.card?.url ?? cover.url;
  if (!url) {
    return undefined;
  }

  return {
    url,
    alt: cover.alt,
  };
}

function mapPayloadArticle(article: PayloadArticle): Article {
  return {
    id: String(article.id),
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    publishedAt: article.publishedAt ?? article.createdAt,
    likes: article.likes,
    cover: mapCover(article.cover),
    body: article.content,
  };
}

async function getCMS() {
  if (!process.env.DATABASE_URL || !process.env.PAYLOAD_SECRET) {
    return null;
  }

  try {
    return await getPayload({ config });
  } catch (error) {
    if (canUseDemoArticles) {
      console.warn("Payload недоступен, используются демонстрационные статьи.", error);
    } else {
      console.error("Payload недоступен: каталог статей временно не загружен.", error);
    }

    return null;
  }
}

export async function getArticles(): Promise<Article[]> {
  const cms = await getCMS();

  if (cms) {
    try {
      const result = await cms.find({
        collection: "articles",
        depth: 2,
        limit: 100,
        overrideAccess: false,
        sort: "-publishedAt",
        where: {
          _status: {
            equals: "published",
          },
        },
      });

      return result.docs.map(mapPayloadArticle);
    } catch (error) {
      if (canUseDemoArticles) {
        console.warn("Не удалось прочитать статьи из Payload.", error);
      } else {
        console.error("Не удалось прочитать статьи из Payload.", error);
      }
    }
  }

  return canUseDemoArticles
    ? [...demoArticles].sort(
        (left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt),
      )
    : [];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const cms = await getCMS();

  if (cms) {
    try {
      const result = await cms.find({
        collection: "articles",
        depth: 2,
        limit: 1,
        overrideAccess: false,
        where: {
          and: [
            { slug: { equals: slug } },
            { _status: { equals: "published" } },
          ],
        },
      });

      return result.docs[0] ? mapPayloadArticle(result.docs[0]) : null;
    } catch (error) {
      if (canUseDemoArticles) {
        console.warn("Не удалось открыть статью из Payload.", error);
      } else {
        console.error("Не удалось открыть статью из Payload.", error);
      }
    }
  }

  return canUseDemoArticles
    ? (demoArticles.find((article) => article.slug === slug) ?? null)
    : null;
}

export async function getArticleRecommendations(
  currentSlug: string,
  limit = 3,
): Promise<Article[]> {
  const articles = await getArticles();
  return articles.filter((article) => article.slug !== currentSlug).slice(0, limit);
}

export function formatArticleDate(
  value: string,
  variant: "long" | "short" = "long",
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Дата не указана";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: variant === "long" ? "long" : "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
