import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";

import type { Article } from "@/lib/articles";
import { cn } from "@/lib/utils";

type ArticleCoverProps = {
  article: Pick<Article, "cover" | "title">;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function ArticleCover({
  article,
  className,
  priority = false,
  sizes = "100vw",
}: ArticleCoverProps) {
  return (
    <div
      className={cn(
        "placeholder-grid relative aspect-square w-full overflow-hidden bg-[linear-gradient(145deg,rgba(0,119,148,0.14),rgba(255,255,255,0.74)_52%,rgba(222,230,234,0.78))]",
        className,
      )}
    >
      {article.cover ? (
        <Image
          src={article.cover.url}
          alt={article.cover.alt || article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
          priority={priority}
          sizes={sizes}
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_20%,rgba(0,119,148,0.2),transparent_34%),radial-gradient(circle_at_20%_84%,rgba(255,218,226,0.72),transparent_38%)]" />
          <div className="absolute inset-0 grid place-items-center">
            <ImageIcon className="size-6 text-foreground/35" aria-hidden="true" />
          </div>
          <span className="absolute bottom-4 left-4 right-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Обложка материала
          </span>
        </>
      )}
    </div>
  );
}
