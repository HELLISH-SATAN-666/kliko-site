import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ChatPlaceholder } from "@/components/chat-placeholder";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "KLIKO — цифровые решения для бизнеса",
    template: "%s — KLIKO",
  },
  description:
    "Каркас многостраничного сайта KLIKO: услуги, проекты, статьи и форма обращения.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <ChatPlaceholder />
      </body>
    </html>
  );
}
