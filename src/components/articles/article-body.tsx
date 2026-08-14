import { Image as ImageIcon } from "lucide-react";
import { RichText } from "@payloadcms/richtext-lexical/react";

import type { ArticleBody as ArticleBodyData, ArticleContentBlock } from "@/lib/articles";

type ArticleBodyProps = {
  blocks: ArticleBodyData;
};

export function ArticleBody({ blocks }: ArticleBodyProps) {
  if (!Array.isArray(blocks)) {
    return <RichText className="article-richtext" data={blocks} />;
  }

  return (
    <div className="mx-auto max-w-[850px] space-y-8 text-[18px] leading-8 text-foreground lg:text-[20px] lg:leading-9">
      {(blocks as ArticleContentBlock[]).map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "heading") {
          if (block.level === 3) {
            return (
              <h3
                key={key}
                className="pt-5 font-heading text-2xl font-medium leading-9 tracking-[-0.025em] lg:text-3xl lg:leading-10"
              >
                {block.text}
              </h3>
            );
          }

          return (
            <h2
              key={key}
              className="pt-8 font-heading text-3xl font-medium leading-10 tracking-[-0.035em] lg:text-[40px] lg:leading-[1.25]"
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={key}
              className="border-l-4 border-primary bg-muted px-7 py-6 font-heading text-xl font-medium leading-8 lg:px-10 lg:py-8 lg:text-2xl lg:leading-9"
            >
              {block.text}
            </blockquote>
          );
        }

        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List
              key={key}
              className={block.ordered ? "list-decimal space-y-3 pl-7" : "list-disc space-y-3 pl-7 marker:text-primary"}
            >
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </List>
          );
        }

        if (block.type === "table") {
          return (
            <div key={key} className="overflow-x-auto border border-border">
              <table className="w-full min-w-[620px] border-collapse text-left text-base leading-6">
                <thead className="bg-muted">
                  <tr>
                    {block.headers.map((header) => (
                      <th key={header} className="border-b border-r border-border px-5 py-4 font-semibold last:border-r-0">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={`${key}-row-${rowIndex}`}>
                      {row.map((cell, cellIndex) => (
                        <td key={`${key}-cell-${rowIndex}-${cellIndex}`} className="border-b border-r border-border px-5 py-4 last:border-r-0 last-of-type:border-r-0 [&:last-child]:border-r-0">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.type === "image") {
          return (
            <figure key={key} className="py-3">
              <div className="placeholder-grid grid aspect-[16/9] place-items-center bg-muted">
                <ImageIcon className="size-7 text-muted-foreground/50" aria-hidden="true" />
              </div>
              {block.caption ? (
                <figcaption className="mt-3 text-sm leading-6 text-muted-foreground">
                  {block.caption}
                </figcaption>
              ) : null}
            </figure>
          );
        }

        return <p key={key}>{block.text}</p>;
      })}
    </div>
  );
}
