import type { Metadata } from "next";

import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Связаться с нами",
  description: "Обсудите с командой KLIKO будущий цифровой продукт.",
};

const nextSteps = [
  {
    title: "Изучим задачу",
    description: "Разберём вводные, цели проекта и ожидаемый результат.",
  },
  {
    title: "Уточним детали",
    description: "Свяжемся с вами, чтобы обсудить сроки, команду и формат работы.",
  },
  {
    title: "Предложим план",
    description: "Подготовим понятный следующий шаг и предварительный план запуска.",
  },
];

export default function ContactPage() {
  return (
    <main className="pt-24">
      <div className="section-space">
        <div className="site-container">
        <Reveal>
          <section
            className="grid overflow-hidden border border-border bg-background lg:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.9fr)]"
            aria-labelledby="contact-title"
          >
            <div className="p-6 sm:p-8 lg:p-10 xl:p-12">
              <p className="eyebrow text-primary">Связаться с нами</p>
              <h1 id="contact-title" className="display-title mt-7">
                Расскажите о вашем проекте
              </h1>
              <p className="body-copy mt-7 max-w-3xl text-muted-foreground">
                Заполните форму — мы изучим запрос и вернёмся с ответом. Сейчас это
                интерактивный каркас без внешней отправки данных.
              </p>

              <ContactForm className="mt-10" />
            </div>

            <aside className="contact-gradient border-t border-border p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10 xl:p-12">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                После обращения
              </p>
              <h2 className="card-title mt-4">
                Что будет дальше?
              </h2>

              <ol className="mt-10 space-y-8">
                {nextSteps.map((step, index) => (
                  <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-4">
                    <span
                      className="grid size-10 place-items-center border border-foreground/25 bg-background/65 text-sm font-bold"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="card-title">{step.title}</h3>
                      <p className="mt-3 text-base leading-6 text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="nav-type mt-12 border-t border-foreground/15 pt-6 text-muted-foreground">
                Срок первичного ответа будет указан после настройки рабочего процесса.
              </p>
            </aside>
          </section>
        </Reveal>
        </div>
      </div>
    </main>
  );
}
