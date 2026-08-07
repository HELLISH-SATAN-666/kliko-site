"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

const services = [
  {
    title: "Разработка программных продуктов",
    description:
      "Здесь будет краткое описание подхода, отраслевой экспертизы и результата для бизнеса.",
    points: [
      "Корпоративные системы",
      "Веб-приложения",
      "Мобильные продукты",
      "Облачные решения",
      "Интеграции и API",
      "Продукты по модели SaaS",
    ],
  },
  {
    title: "Тестирование и контроль качества",
    description:
      "Заглушка описания процесса проверки продукта, стабильности и пользовательских сценариев.",
    points: ["Функциональные проверки", "Автоматизация", "Нагрузочные тесты", "Аудит качества"],
  },
  {
    title: "Поддержка и развитие",
    description:
      "Заглушка описания сопровождения, улучшения и планового развития цифрового продукта.",
    points: ["Мониторинг", "Обновления", "Поддержка пользователей", "Развитие функциональности"],
  },
  {
    title: "Технологический консалтинг",
    description:
      "Заглушка описания аналитики, выбора архитектуры и подготовки дорожной карты.",
    points: ["Аудит", "Архитектура", "Стратегия", "Дорожная карта"],
  },
  {
    title: "Усиление продуктовых команд",
    description:
      "Заглушка описания подключения специалистов KLIKO к внутренней команде заказчика.",
    points: ["Разработчики", "Дизайнеры", "Аналитики", "Тестировщики"],
  },
];

export function ServicesAccordion() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const reduceMotion = useReducedMotion();

  return (
    <div className="border-b border-border">
      {services.map((service, index) => {
        const isOpen = activeIndex === index;
        const panelId = `service-panel-${index}`;
        const buttonId = `service-button-${index}`;

        return (
          <div key={service.title} className="border-t border-border">
            <h3>
              <button
                id={buttonId}
                type="button"
                className="card-title focus-ring flex w-full items-center justify-between gap-6 py-6 text-left transition-colors hover:text-primary md:py-8"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setActiveIndex(isOpen ? null : index)}
              >
                <span className="flex items-start gap-4">
                  <span className="mt-1 text-xs font-bold text-primary">0{index + 1}</span>
                  {service.title}
                </span>
                {isOpen ? (
                  <Minus className="size-4 shrink-0 text-primary" aria-hidden="true" />
                ) : (
                  <Plus className="size-4 shrink-0 text-primary" aria-hidden="true" />
                )}
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-8 pb-10 pl-9 md:grid-cols-[1fr_1.15fr] md:gap-16 md:pb-12">
                    <p className="body-copy max-w-xl text-muted-foreground">
                      {service.description}
                    </p>
                    <ul className="nav-type grid gap-x-8 gap-y-4 sm:grid-cols-2">
                      {service.points.map((point) => (
                        <li key={point} className="flex items-start gap-2">
                          <span className="mt-[0.55em] size-1 shrink-0 bg-primary" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
