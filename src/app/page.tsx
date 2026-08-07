import { ArrowRight, ArrowUpRight, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";
import { ServicesAccordion } from "@/components/services-accordion";
import { TechnologyTabs } from "@/components/technology-tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const partners = Array.from({ length: 8 }, (_, index) => `ЛОГО ${String(index + 1).padStart(2, "0")}`);

const projects = [
  { number: "01", tone: "project-card-blue", format: "Веб-платформа" },
  { number: "02", tone: "project-card-mint", format: "Мобильный продукт" },
  { number: "03", tone: "project-card-rose", format: "Корпоративная система" },
  { number: "04", tone: "project-card-neutral", format: "Сервис аналитики" },
  { number: "05", tone: "project-card-blue", format: "Облачное решение" },
  { number: "06", tone: "project-card-rose", format: "Цифровая экосистема" },
];

const articles = Array.from({ length: 6 }, (_, index) => ({
  number: String(index + 1).padStart(2, "0"),
  category: index % 2 === 0 ? "Практика" : "Материалы",
}));

const heroDirections = [
  "Разработка ПО",
  "ИИ и данные",
  "Мобильные продукты",
  "Финтех",
  "Цифровое здравоохранение",
  "Усиление команд",
];

function SectionHeading({
  eyebrow,
  title,
  href,
}: {
  eyebrow: string;
  title: string;
  href?: string;
}) {
  return (
    <div className="mb-10 flex items-end justify-between gap-8 md:mb-14">
      <div>
        <p className="eyebrow mb-5 text-primary">{eyebrow}</p>
        <h2 className="section-title">{title}</h2>
      </div>
      {href ? (
        <Link
          href={href}
          className="nav-type focus-ring mb-1 hidden items-center gap-2 transition-colors hover:text-primary sm:flex"
        >
          Смотреть все
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

function PartnerRow({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className="partner-marquee overflow-hidden" aria-label="Заглушки логотипов партнёров">
      <div className={cn("partner-track flex", reverse && "partner-track-reverse")}>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex gap-3 pr-3" aria-hidden={copy === 1 ? "true" : undefined}>
            {partners.map((partner) => (
              <div
                key={`${partner}-${copy}`}
                className="grid h-16 w-36 shrink-0 place-items-center border border-border bg-background text-[11px] font-black tracking-[0.14em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                {partner}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main>
      <section className="hero-background">
        <div className="hero-content site-container flex min-h-svh flex-col">
          <Reveal>
            <h1 className="display-title hero-title">
              <span className="block lg:whitespace-nowrap">Создаём цифровые</span>
              <span className="block lg:whitespace-nowrap">решения для бизнеса</span>
            </h1>
          </Reveal>

          <Reveal
            delay={0.08}
            className="mt-12 grid items-center gap-6 sm:grid-cols-[248px_minmax(0,640px)] sm:gap-12"
          >
            <Button asChild size="lg" className="h-20 w-full px-6 sm:w-[248px]">
              <Link href="/contact">Обсудить проект</Link>
            </Button>
            <p className="body-copy max-w-[640px] text-foreground">
              <span className="block">Разработка программного обеспечения</span>
              <span className="block">В срок и рамки вашего бюджета</span>
            </p>
          </Reveal>

          <Reveal delay={0.14} className="hero-directions-grid grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
            {heroDirections.map((direction) => (
              <Link
                key={direction}
                href="/services"
                className="hero-glass-card focus-ring group flex items-center px-7 md:px-8"
              >
                <span className="relative z-10 text-2xl font-medium leading-8 text-foreground">
                  {direction}
                </span>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section-space" id="services">
        <div className="site-container">
          <Reveal>
            <SectionHeading
              eyebrow="Что мы делаем"
              title="Услуги по разработке программного обеспечения"
            />
            <ServicesAccordion />
          </Reveal>
        </div>
      </section>

      <section className="py-14" aria-label="Партнёры и клиенты">
        <div className="site-container space-y-3 overflow-hidden">
          <PartnerRow />
          <PartnerRow reverse />
        </div>
      </section>

      <section className="section-space" id="projects">
        <div className="site-container">
          <Reveal>
            <SectionHeading eyebrow="Выбранные работы" title="Реализованные нами проекты" href="/projects" />
          </Reveal>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <Reveal key={project.number} delay={(index % 3) * 0.05}>
                <Link
                  href="/projects"
                  className={cn(
                    "focus-ring group relative flex aspect-[4/5] flex-col overflow-hidden p-7",
                    project.tone,
                  )}
                  aria-label={`Открыть проект-заглушку ${project.number}`}
                >
                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">
                        Кейс {project.number}
                      </p>
                      <h3 className="card-title mt-3 max-w-[14ch]">
                        Название проекта-заглушки
                      </h3>
                    </div>
                    <ArrowUpRight
                      className="size-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="absolute left-1/2 top-[55%] w-[72%] -translate-x-1/2 -translate-y-1/2 border border-foreground/20 bg-white/70 p-2 shadow-[0_22px_45px_rgba(17,18,20,0.08)] transition-transform duration-300 group-hover:-translate-y-[54%]">
                    <div className="mb-2 flex gap-1">
                      <span className="size-1.5 bg-foreground/20" />
                      <span className="size-1.5 bg-foreground/20" />
                      <span className="size-1.5 bg-foreground/20" />
                    </div>
                    <div className="placeholder-grid aspect-[4/2.4] border border-foreground/10 bg-white/50" />
                  </div>

                  <p className="nav-type relative z-10 mt-auto text-muted-foreground">
                    {project.format}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>

          <Link
            href="/projects"
            className="focus-ring mt-7 flex items-center gap-2 text-sm font-bold sm:hidden"
          >
            Смотреть все проекты
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="section-space" id="articles">
        <div className="site-container">
          <Reveal>
            <SectionHeading eyebrow="База знаний" title="Статьи и материалы" href="/articles" />
          </Reveal>

          <div className="grid gap-3 md:grid-cols-2">
            {articles.map((article, index) => (
              <Reveal key={article.number} delay={(index % 2) * 0.05}>
                <Link
                  href="/articles"
                  className="focus-ring group grid min-h-[220px] grid-cols-[1.2fr_0.8fr] border border-border bg-background transition-colors hover:border-foreground"
                >
                  <div className="flex flex-col p-7">
                    <p className="top-nav-type flex items-center gap-2 font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                      <span className="size-1.5 bg-primary" />
                      {article.category}
                    </p>
                    <h3 className="card-title mt-5">
                      Заголовок материала-заглушки {article.number}
                    </h3>
                    <p className="top-nav-type mt-auto text-muted-foreground">Дата публикации</p>
                  </div>
                  <div className="placeholder-grid relative grid place-items-center overflow-hidden border-l border-border bg-muted">
                    <ImageIcon className="size-5 text-muted-foreground/60" aria-hidden="true" />
                    <span className="absolute bottom-2 right-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                      Изображение
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <Link
            href="/articles"
            className="focus-ring mt-7 flex items-center gap-2 text-sm font-bold sm:hidden"
          >
            Смотреть все материалы
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="section-space" id="technologies">
        <div className="site-container">
          <Reveal>
            <SectionHeading eyebrow="Компетенции" title="Используемые нами технологии" />
            <TechnologyTabs />
          </Reveal>
        </div>
      </section>

      <section className="section-space" id="contact">
        <div className="site-container">
          <Reveal className="grid border border-border bg-[#fafafa] lg:grid-cols-[1.58fr_1fr]">
            <div className="p-6 sm:p-9 lg:p-14">
              <p className="eyebrow mb-5 text-primary">Связаться с нами</p>
              <h2 className="section-title">Расскажите о вашей задаче</h2>
              <p className="body-copy mt-6 max-w-2xl text-muted-foreground">
                Оставьте контакты и краткое описание. Это демонстрационный каркас формы без отправки данных.
              </p>
              <div className="mt-9">
                <ContactForm />
              </div>
            </div>

            <aside className="contact-gradient border-t border-border p-6 sm:p-9 lg:border-l lg:border-t-0 lg:p-12">
              <h3 className="card-title">Что будет дальше?</h3>
              <ol className="mt-8 space-y-7">
                {[
                  "Получим и уточним вводные",
                  "Предложим формат работы",
                  "Подготовим следующий шаг",
                ].map((step, index) => (
                  <li key={step} className="grid grid-cols-[28px_1fr] gap-3">
                    <span className="grid size-7 place-items-center border border-foreground/30 text-[10px] font-bold">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="card-title">{step}</p>
                      <p className="mt-2 text-base leading-6 text-muted-foreground">
                        Краткое пояснение этапа будет добавлено позже.
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </aside>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
