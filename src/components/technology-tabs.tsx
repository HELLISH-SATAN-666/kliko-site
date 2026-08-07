"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

const groups = [
  {
    label: "ИИ",
    items: ["Компьютерное зрение", "Генеративные модели", "Машинное обучение", "Обработка текста", "Рекомендации", "MLOps"],
  },
  {
    label: "Данные",
    items: ["Хранилища данных", "Потоковая обработка", "Витрины данных", "Аналитика", "ETL-процессы", "Качество данных"],
  },
  {
    label: "Автоматизация",
    items: ["Бизнес-процессы", "Документооборот", "Роботизация", "Интеграции", "Мониторинг", "Оркестрация"],
  },
  {
    label: "Облако",
    items: ["Облачная архитектура", "Контейнеры", "CI/CD", "Наблюдаемость", "Безопасность", "Масштабирование"],
  },
  {
    label: "Веб",
    items: ["Клиентские приложения", "Серверные системы", "API", "Личные кабинеты", "Порталы", "Дизайн-системы"],
  },
  {
    label: "Встраиваемые системы",
    items: ["Прототипирование", "Телеметрия", "Периферия", "Панели управления", "Интеграция устройств", "Диагностика"],
  },
];

export function TechnologyTabs() {
  const [selected, setSelected] = useState(0);
  const reduceMotion = useReducedMotion();
  const activeGroup = groups[selected];

  return (
    <div>
      <div
        className="-mx-5 flex overflow-x-auto border-b border-border px-5 md:mx-0 md:px-0"
        role="tablist"
        aria-label="Категории технологий"
      >
        {groups.map((group, index) => (
          <button
            key={group.label}
            id={`technology-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={selected === index}
            aria-controls="technology-panel"
            className="nav-type focus-ring relative shrink-0 px-5 py-5 text-muted-foreground transition-colors first:pl-0 hover:text-foreground aria-selected:text-foreground"
            onClick={() => setSelected(index)}
          >
            {group.label}
            {selected === index ? (
              <motion.span
                layoutId="technology-active-line"
                className="absolute inset-x-3 bottom-[-1px] h-0.5 bg-primary first:left-0"
                transition={{ duration: reduceMotion ? 0 : 0.25 }}
              />
            ) : null}
          </button>
        ))}
      </div>

      <motion.div
        key={activeGroup.label}
        id="technology-panel"
        role="tabpanel"
        aria-labelledby={`technology-tab-${selected}`}
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {activeGroup.items.map((item, index) => (
          <div
            key={item}
            className={index === 0 ? "min-h-28 bg-[#dff3ff] p-5" : "min-h-28 bg-muted p-5"}
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="grid size-7 place-items-center border border-foreground/15 text-[10px] font-bold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Заглушка
              </span>
            </div>
            <p className="card-title">{item}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
