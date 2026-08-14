import config from "@payload-config";
import { getPayload } from "payload";

import type { ArticleContentBlock } from "@/lib/articles";
import { demoArticles } from "@/lib/articles";
import type { Article as PayloadArticle } from "@/payload-types";

type LexicalNode = PayloadArticle["content"]["root"]["children"][number];

function textNode(text: string) {
  return {
    detail: 0,
    format: 0,
    mode: "normal",
    style: "",
    text,
    type: "text",
    version: 1,
  };
}

function elementNode(type: "paragraph" | "quote", text: string): LexicalNode {
  return {
    children: [textNode(text)],
    direction: "ltr",
    format: "",
    indent: 0,
    type,
    version: 1,
  } as LexicalNode;
}

function headingNode(level: 2 | 3, text: string): LexicalNode {
  return {
    children: [textNode(text)],
    direction: "ltr",
    format: "",
    indent: 0,
    tag: `h${level}`,
    type: "heading",
    version: 1,
  } as LexicalNode;
}

function blockToNodes(block: ArticleContentBlock): LexicalNode[] {
  if (block.type === "heading") {
    return [headingNode(block.level, block.text)];
  }

  if (block.type === "quote") {
    return [elementNode("quote", block.text)];
  }

  if (block.type === "list") {
    return block.items.map((item, index) =>
      elementNode("paragraph", `${block.ordered ? `${index + 1}.` : "•"} ${item}`),
    );
  }

  if (block.type === "table") {
    return [
      headingNode(3, "Таблица"),
      elementNode("paragraph", block.headers.join(" · ")),
      ...block.rows.map((row) => elementNode("paragraph", row.join(" · "))),
    ];
  }

  if (block.type === "image") {
    return block.caption ? [elementNode("paragraph", block.caption)] : [];
  }

  return [elementNode("paragraph", block.text)];
}

function toLexical(blocks: ArticleContentBlock[]): PayloadArticle["content"] {
  return {
    root: {
      type: "root",
      children: blocks.flatMap(blockToNodes),
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1,
    },
  };
}

async function seed() {
  const payload = await getPayload({ config });

  for (const article of demoArticles) {
    const existing = await payload.find({
      collection: "articles",
      limit: 1,
      overrideAccess: true,
      where: {
        slug: {
          equals: article.slug,
        },
      },
    });

    if (existing.docs.length > 0 || !Array.isArray(article.body)) {
      continue;
    }

    await payload.create({
      collection: "articles",
      data: {
        _status: "published",
        title: article.title,
        slug: article.slug,
        generateSlug: false,
        excerpt: article.excerpt,
        content: toLexical(article.body),
        publishedAt: article.publishedAt,
        likes: article.likes,
      },
      draft: false,
      overrideAccess: true,
    });
  }

  payload.logger.info("Демонстрационные статьи KLIKO добавлены в Payload.");
  process.exit(0);
}

await seed();
