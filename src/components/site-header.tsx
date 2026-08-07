"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { Menu, X, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/about", label: "О нас" },
  { href: "/services", label: "Услуги" },
  { href: "/#technologies", label: "Технологии" },
  { href: "/projects", label: "Портфолио" },
  { href: "/articles", label: "Статьи", icon: "bolt" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const nextState = latest > 24;
    setIsScrolled((currentState) =>
      currentState === nextState ? currentState : nextState,
    );
  });

  return (
    <header
      className={cn(
        "site-header-shell fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300",
        isScrolled
          ? "bg-[rgba(235,238,241,0.78)] shadow-[0_1px_0_rgba(17,18,20,0.06)] backdrop-blur-xl backdrop-saturate-150"
          : "bg-transparent backdrop-blur-none",
      )}
      data-state={isScrolled ? "scrolled" : "top"}
    >
      <div className="header-container relative z-10 flex h-24 items-center justify-between gap-10">
        <Link
          href="/"
          className="focus-ring block shrink-0"
          aria-label="KLIKO — на главную"
        >
          <Image
            src="/kliko-logo.svg"
            alt="KLIKO"
            width={525}
            height={135}
            priority
            className="h-auto w-[158px]"
          />
        </Link>

        <div className="ml-auto hidden items-center gap-8 lg:flex">
          <nav className="flex items-center gap-9" aria-label="Основная навигация">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className={cn(
                  "nav-type focus-ring flex items-center gap-1.5 transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary" : "text-foreground",
                )}
              >
                {item.icon === "bolt" ? (
                  <Zap
                    className="size-4 fill-primary text-primary"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                ) : null}
                {item.label}
              </Link>
            ))}
          </nav>

          <Button asChild>
            <Link href="/contact">Обсудить проект</Link>
          </Button>
          <span className="top-nav-type font-semibold tracking-[0.14em] text-muted-foreground">
            RU
          </span>
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
            className="absolute inset-x-0 top-24 z-10 bg-[rgba(235,238,241,0.92)] shadow-[0_1px_0_rgba(17,18,20,0.08)] backdrop-blur-xl lg:hidden"
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
                  className="focus-ring flex items-center gap-2 border-b border-border py-4 text-xl font-bold"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon === "bolt" ? (
                    <Zap
                      className="size-4 fill-primary text-primary"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  ) : null}
                  {item.label}
                </Link>
              ))}
              <div className="mt-5 flex items-center gap-5">
                <Button asChild className="flex-1">
                  <Link href="/contact" onClick={() => setIsOpen(false)}>
                    Обсудить проект
                  </Link>
                </Button>
                <span className="top-nav-type font-semibold tracking-[0.14em] text-muted-foreground">
                  RU
                </span>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
