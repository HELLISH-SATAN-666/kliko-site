import Link from "next/link";

export type InnerPageFact = {
  value: string;
  label: string;
};

export type InnerPageItem = {
  title: string;
  description: string;
  label?: string;
  meta?: string;
  mediaLabel?: string;
};

export type InnerPageSection = {
  eyebrow: string;
  title: string;
  description?: string;
  columns?: 2 | 3;
  items: InnerPageItem[];
};

type InnerPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  visualLabel: string;
  facts: InnerPageFact[];
  sections: InnerPageSection[];
  ctaTitle?: string;
  ctaDescription?: string;
};

const columnClasses = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
} as const;

export function InnerPage({
  eyebrow,
  title,
  description,
  visualLabel,
  facts,
  sections,
  ctaTitle = "Есть задача для KLIKO?",
  ctaDescription =
    "Расскажите о будущем проекте. Детали, сроки и формат работы будут согласованы после знакомства.",
}: InnerPageProps) {
  return (
    <main>
      <section className="bg-background">
        <div className="site-container grid gap-12 py-20 md:py-24 lg:min-h-[520px] lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:items-end lg:py-28">
          <div>
            <p className="eyebrow text-primary">{eyebrow}</p>
            <h1 className="display-title mt-7">{title}</h1>
            <p className="body-copy mt-8 max-w-3xl text-muted-foreground">
              {description}
            </p>
          </div>

          <aside className="border border-border bg-muted p-4" aria-label={visualLabel}>
            <div className="bg-primary px-4 py-3 text-xs font-bold uppercase tracking-[0.13em] text-primary-foreground">
              Визуальный материал
            </div>
            <div className="placeholder-grid mt-4 flex aspect-[4/3] items-end border border-border bg-background p-4">
              <p className="max-w-[18rem] bg-background px-3 py-2 text-xs leading-5 text-muted-foreground">
                {visualLabel}
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-background" aria-label="Краткие сведения">
        <div className="site-container grid border-l border-t border-border sm:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label} className="min-h-36 border-b border-r border-border p-6 md:p-8">
              <p className="text-3xl font-black tracking-[-0.04em] text-primary">{fact.value}</p>
              <p className="mt-5 max-w-[20rem] text-base leading-6 text-muted-foreground">{fact.label}</p>
            </div>
          ))}
        </div>
      </section>

      {sections.map((section, sectionIndex) => (
        <section
          key={section.title}
          className={`section-space ${sectionIndex % 2 === 1 ? "bg-muted/45" : "bg-background"}`}
        >
          <div className="site-container">
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(260px,0.6fr)] md:items-end">
              <div>
                <p className="eyebrow text-primary">{section.eyebrow}</p>
                <h2 className="section-title mt-5">{section.title}</h2>
              </div>
              {section.description ? (
                <p className="body-copy max-w-2xl text-muted-foreground md:justify-self-end">
                  {section.description}
                </p>
              ) : null}
            </div>

            <div className={`mt-12 grid border-l border-t border-border ${columnClasses[section.columns ?? 3]}`}>
              {section.items.map((item, itemIndex) => (
                <article key={`${section.title}-${item.title}`} className="flex min-h-full flex-col border-b border-r border-border bg-background">
                  {item.mediaLabel ? (
                    <div className="placeholder-grid flex aspect-[4/3] items-end border-b border-border bg-muted p-4">
                      <span className="bg-background px-3 py-2 text-xs leading-5 text-muted-foreground">
                        {item.mediaLabel}
                      </span>
                    </div>
                  ) : null}

                  <div className="flex flex-1 flex-col p-6 md:p-8">
                    <div className="flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.12em] text-primary">
                      <span>{item.label ?? String(itemIndex + 1).padStart(2, "0")}</span>
                      {item.meta ? <span className="text-right text-muted-foreground">{item.meta}</span> : null}
                    </div>
                    <h3 className="card-title mt-7">{item.title}</h3>
                    <p className="mt-5 text-base leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="section-space bg-background">
        <div className="site-container grid gap-8 bg-primary p-8 text-primary-foreground md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:p-12">
          <div>
            <p className="eyebrow">Следующий шаг</p>
            <h2 className="mt-5 max-w-xl text-3xl font-black tracking-[-0.04em] md:text-4xl">{ctaTitle}</h2>
            <p className="body-copy mt-5 max-w-3xl text-primary-foreground/75">{ctaDescription}</p>
          </div>
          <Link
            href="/contact"
            className="button-type focus-ring inline-flex min-h-14 items-center justify-center bg-foreground px-8 text-background transition-colors hover:bg-[#252525]"
          >
            Обсудить проект
          </Link>
        </div>
      </section>
    </main>
  );
}
