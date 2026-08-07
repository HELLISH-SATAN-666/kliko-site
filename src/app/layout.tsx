import type { Metadata } from "next";
import { Inter, Unbounded } from "next/font/google";
import type { ReactNode } from "react";

import { ChatPlaceholder } from "@/components/chat-placeholder";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

const inter = Inter({
  subsets: ["cyrillic", "latin"],
  variable: "--font-inter",
  display: "swap",
});

const unbounded = Unbounded({
  subsets: ["cyrillic", "latin"],
  variable: "--font-unbounded",
  display: "swap",
});

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
    <html
      lang="ru"
      className={`${inter.variable} ${unbounded.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <ChatPlaceholder />
      </body>
    </html>
  );
}
