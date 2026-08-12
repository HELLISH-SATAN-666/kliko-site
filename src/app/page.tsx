import { ArrowRight, ArrowUpRight, Image as ImageIcon, Zap } from "lucide-react";
import Link from "next/link";

import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";
import { ServicesAccordion } from "@/components/services-accordion";
import { TechnologyTabs } from "@/components/technology-tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const partners = Array.from({ length: 8 }, (_, index) => `ЛОГО ${String(index + 1).padStart(2, "0")}`);

const projects = [
  { number: "01", placement: "project-bento-item-1", format: "Веб-платформа" },
  { number: "02", placement: "project-bento-item-2", format: "Мобильный продукт" },
  { number: "03", placement: "project-bento-item-3", format: "Корпоративная система" },
  { number: "04", placement: "project-bento-item-4", format: "Сервис аналитики" },
  { number: "05", placement: "project-bento-item-5", format: "Облачное решение" },
  { number: "06", placement: "project-bento-item-6", format: "Цифровая экосистема" },
];

const articles = Array.from({ length: 6 }, (_, index) => ({
  number: String(index + 1).padStart(2, "0"),
}));

const whyChooseCells = [
  { key: "expertise", kind: "stat", value: "XX", suffix: "+", label: "лет экспертизы" },
  { key: "team", kind: "stat", value: "XXX", suffix: "+", label: "специалистов" },
  {
    key: "onboarding",
    kind: "copy",
    title: "Быстрый старт и погружение",
    description:
      "Здесь будет текст о скорости подключения команды, изучении задачи и первых результатах.",
  },
  {
    key: "processes",
    kind: "copy",
    title: "Проверенные процессы",
    description:
      "Здесь будет описание подхода к качеству, прозрачности работы и управлению рисками.",
  },
  { key: "team-photo", kind: "media", label: "Фотография команды — заглушка" },
  { key: "retention", kind: "stat", value: "XX", suffix: "%", label: "повторных обращений" },
  { key: "office-photo", kind: "media", label: "Рабочий процесс — заглушка" },
  { key: "projects", kind: "stat", value: "XXX", suffix: "+", label: "реализованных проектов" },
  {
    key: "flexibility",
    kind: "copy",
    title: "Гибкость взаимодействия",
    description:
      "Здесь будет текст о форматах сотрудничества, коммуникации и адаптации к команде клиента.",
  },
] as const;

const heroDirections = [
  "Разработка ПО",
  "ИИ и данные",
  "Мобильные продукты",
  "Финтех",
  "Цифровое здравоохранение",
  "Усиление команд",
];

function SectionHeading({
  title,
  href,
  linkLabel = "Смотреть все",
  linkVariant = "arrow",
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  linkVariant?: "arrow" | "underline";
}) {
  return (
    <div className="mb-10 flex items-end justify-between gap-8 md:mb-14">
      <h2 className="section-title">{title}</h2>
      {href ? (
        <Link
          href={href}
          className={cn(
            "nav-type focus-ring mb-1 hidden items-center gap-2 transition-colors hover:text-primary sm:flex",
            linkVariant === "underline" &&
              "border-b border-foreground pb-1 hover:border-primary",
          )}
        >
          {linkLabel}
          {linkVariant === "arrow" ? (
            <ArrowRight className="size-4" aria-hidden="true" />
          ) : null}
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
            <Button asChild size="lg" className="h-16 w-full px-6 sm:w-[248px]">
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
            <SectionHeading title="Услуги по разработке программного обеспечения" />
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
            <SectionHeading title="Реализованные нами проекты" href="/projects" />
          </Reveal>

          <div className="projects-bento grid gap-3 sm:grid-cols-2">
            <div className="projects-bento-gradient" aria-hidden="true" />
            {projects.map((project, index) => (
              <Reveal
                key={project.number}
                delay={(index % 3) * 0.05}
                className={cn(
                  "project-bento-item min-h-0 min-w-0",
                  project.placement,
                )}
              >
                <Link
                  href="/projects"
                  className="project-bento-card focus-ring group relative flex aspect-[4/5] flex-col overflow-hidden p-7 lg:p-9"
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
                    <div className="placeholder-grid grid aspect-[4/2.4] place-items-center border border-foreground/10 bg-white/50">
                      <span className="top-nav-type flex items-center gap-2 bg-white/80 px-3 py-2 text-muted-foreground">
                        <ImageIcon className="size-4" aria-hidden="true" />
                        Изображение проекта
                      </span>
                    </div>
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
            <SectionHeading title="Статьи и материалы" href="/articles" />
          </Reveal>

          <div className="grid gap-3 md:grid-cols-2">
            {articles.map((article, index) => (
              <Reveal key={article.number} delay={(index % 2) * 0.05}>
                <Link
                  href="/articles"
                  className="article-card focus-ring group relative grid border border-border bg-background transition-colors hover:border-foreground"
                >
                  {index === 0 ? (
                    <Zap
                      className="pointer-events-none absolute left-[-14px] top-[-27px] z-10 h-20 w-12 -rotate-[8deg] fill-primary text-primary"
                      strokeWidth={1.2}
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="flex min-w-0 flex-col p-7 lg:p-8">
                    <h3 className="card-title max-w-[22ch]">
                      Заголовок материала-заглушки {article.number}
                    </h3>
                    <p className="top-nav-type mt-auto text-muted-foreground">Дата публикации</p>
                  </div>
                  <div
                    className="article-card-media placeholder-grid relative grid place-items-center overflow-hidden border-l border-border bg-muted"
                    aria-hidden="true"
                  >
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

      <section className="section-space" id="why-kliko">
        <div className="site-container">
          <Reveal>
            <SectionHeading
              title="Почему выбрать KLIKO?"
              href="/about"
              linkLabel="О нас"
              linkVariant="underline"
            />
          </Reveal>

          <Reveal delay={0.08} className="md:mt-6 lg:mt-8">
            <div className="why-kliko-grid">
              {whyChooseCells.map((cell) => {
                if (cell.kind === "stat") {
                  return (
                    <article key={cell.key} className="why-kliko-cell why-kliko-stat">
                      <p className="why-kliko-value">
                        <span>{cell.value}</span>
                        <span className="why-kliko-affix">{cell.suffix}</span>
                      </p>
                      <p className="nav-type text-muted-foreground">{cell.label}</p>
                    </article>
                  );
                }

                if (cell.kind === "media") {
                  return (
                    <div
                      key={cell.key}
                      className="why-kliko-cell why-kliko-media placeholder-grid"
                      role="img"
                      aria-label={cell.label}
                    >
                      <ImageIcon className="size-8 text-muted-foreground/55" aria-hidden="true" />
                      <span className="top-nav-type absolute bottom-5 left-5 bg-background px-3 py-2 text-muted-foreground">
                        {cell.label}
                      </span>
                    </div>
                  );
                }

                return (
                  <article key={cell.key} className="why-kliko-cell why-kliko-copy">
                    <h3 className="why-kliko-copy-title">{cell.title}</h3>
                    <p className="mt-5 max-w-md text-base leading-6 text-muted-foreground">
                      {cell.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-space" id="technologies">
        <div className="site-container">
          <Reveal>
            <SectionHeading title="Используемые нами технологии" />
            <TechnologyTabs />
          </Reveal>
        </div>
      </section>

      <section className="contact-section" id="contact" aria-labelledby="contact-section-title">
        <div className="site-container">
          <div className="contact-layout">
            <Reveal>
              <h2 className="section-title" id="contact-section-title">
                Связаться с нами
              </h2>
              <p className="body-copy contact-lead">
                <Link className="focus-ring text-primary underline underline-offset-2" href="/contact">
                  Назначьте звонок
                </Link>{" "}
                или заполните форму ниже — мы свяжемся с вами после обработки запроса.
              </p>
              <ContactForm className="mt-12" variant="reference" />
            </Reveal>

            <Reveal delay={0.08} className="contact-next-card contact-gradient">
              <h3 className="card-title">Что будет дальше?</h3>
              <ol>
                {[
                  "Получим и обработаем заявку, затем свяжемся с вами, чтобы уточнить детали проекта и согласовать конфиденциальность.",
                  "Изучим цели и ожидания, затем подготовим предложение с объёмом работ, командой, сроками и оценкой.",
                  "Организуем встречу, обсудим предложение и зафиксируем детали.",
                  "Подпишем договор и приступим к работе над вашим проектом.",
                ].map((step, index) => (
                  <li key={step}>
                    <span aria-hidden="true">{index + 1}</span>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
