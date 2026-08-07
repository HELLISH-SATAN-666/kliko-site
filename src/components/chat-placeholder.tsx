import { MessageCircle } from "lucide-react";
import Link from "next/link";

export function ChatPlaceholder() {
  return (
    <Link
      href="/contact"
      className="focus-ring fixed bottom-5 right-5 z-40 flex h-12 items-center gap-2 bg-foreground px-4 text-sm font-bold text-background shadow-lg transition-transform hover:-translate-y-0.5 sm:bottom-7 sm:right-7"
      aria-label="Открыть чат — временная заглушка"
    >
      <MessageCircle aria-hidden="true" className="size-4 text-primary" />
      <span className="hidden sm:inline">Чат</span>
    </Link>
  );
}
