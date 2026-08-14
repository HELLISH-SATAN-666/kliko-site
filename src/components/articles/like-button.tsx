"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type LikeButtonProps = {
  slug: string;
  initialLikes: number;
  initialLiked?: boolean;
  compact?: boolean;
  className?: string;
};

type LikeResponse = {
  likes?: number;
};

export function LikeButton({
  slug,
  initialLikes,
  initialLiked = false,
  compact = false,
  className,
}: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [pending, setPending] = useState(false);

  async function handleLike() {
    if (liked || pending) {
      return;
    }

    const previousLikes = likes;
    setPending(true);
    setLiked(true);
    setLikes((value) => value + 1);

    try {
      const response = await fetch(`/api/articles/${encodeURIComponent(slug)}/like`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Не удалось сохранить отметку");
      }

      const data = (await response.json()) as LikeResponse;
      if (typeof data.likes === "number") {
        setLikes(data.likes);
      }
    } catch {
      setLikes(previousLikes);
      setLiked(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      className={cn(
        "focus-ring inline-flex w-fit items-center justify-center border border-border bg-background text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-default disabled:opacity-70",
        compact ? "h-9 min-w-14 gap-1.5 px-2.5 text-xs" : "h-12 gap-2.5 px-5 text-sm font-medium",
        liked && "border-primary text-primary",
        className,
      )}
      onClick={handleLike}
      disabled={liked || pending}
      aria-label={liked ? `Материал отмечен. Лайков: ${likes}` : `Поставить лайк. Сейчас: ${likes}`}
      aria-pressed={liked}
    >
      <Heart
        className={cn(compact ? "size-3.5" : "size-4", liked && "fill-current")}
        aria-hidden="true"
      />
      <span>{likes}</span>
    </button>
  );
}
