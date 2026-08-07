"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/about", label: "О нас" },
  { href: "/services", label: "Услуги" },
  { href: "/projects", label: "Проекты" },
  { href: "/articles", label: "Статьи" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="header-container flex h-24 items-center justify-between gap-10">
        <Link
          href="/"
          className="focus-ring relative text-[28px] font-black tracking-[-0.06em]"
          aria-label="KLIKO — на главную"
        >
          <span className="absolute -left-2 top-0 h-full w-1 bg-primary" />
          KLIKO
        </Link>

        <nav className="hidden items-center gap-10 lg:flex" aria-label="Основная навигация">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={cn(
                "nav-type focus-ring transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          <span className="top-nav-type font-semibold tracking-[0.14em] text-muted-foreground">RU</span>
          <Button asChild>
            <Link href="/contact">Обсудить проект</Link>
          </Button>
        </div>

        <button
          type="button"
          className="focus-ring -mr-2 grid size-11 place-items-center lg:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            id="mobile-navigation"
            className="absolute inset-x-0 top-24 bg-background lg:hidden"
            initial={reduceMotion ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="site-container flex flex-col py-5" aria-label="Мобильная навигация">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="focus-ring border-b border-border py-4 text-xl font-bold"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Button asChild className="mt-5 w-full">
                <Link href="/contact" onClick={() => setIsOpen(false)}>
                  Обсудить проект
                </Link>
              </Button>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
