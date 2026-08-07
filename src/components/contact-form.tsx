"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fieldClassName =
  "focus-ring mt-2 min-h-12 w-full border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 hover:border-foreground/45";

export function ContactForm({ className }: { className?: string }) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.currentTarget.reset();
    setSubmitted(true);
  }

  return (
    <form
      className={cn("space-y-6", className)}
      onSubmit={handleSubmit}
      onInput={() => setSubmitted(false)}
    >
      <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
        <label className="text-sm font-semibold" htmlFor="contact-name">
          Имя
          <input
            className={fieldClassName}
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            minLength={2}
            maxLength={100}
            placeholder="Как к вам обращаться"
            required
          />
        </label>

        <label className="text-sm font-semibold" htmlFor="contact-company">
          Компания
          <input
            className={fieldClassName}
            id="contact-company"
            name="company"
            type="text"
            autoComplete="organization"
            maxLength={160}
            placeholder="Название компании"
            required
          />
        </label>

        <label className="text-sm font-semibold" htmlFor="contact-email">
          Электронная почта
          <input
            className={fieldClassName}
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            placeholder="ваша@почта.рф"
            required
          />
        </label>

        <label className="text-sm font-semibold" htmlFor="contact-phone">
          Телефон
          <input
            className={fieldClassName}
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            minLength={7}
            maxLength={40}
            placeholder="+7 900 000-00-00"
            required
          />
        </label>

        <label className="text-sm font-semibold md:col-span-2" htmlFor="contact-project-type">
          Тип проекта
          <select
            className={fieldClassName}
            id="contact-project-type"
            name="projectType"
            defaultValue=""
            required
          >
            <option value="" disabled>
              Выберите направление
            </option>
            <option value="website">Корпоративный сайт</option>
            <option value="service">Веб-сервис</option>
            <option value="commerce">Интернет-магазин</option>
            <option value="support">Поддержка и развитие</option>
            <option value="other">Другая задача</option>
          </select>
        </label>
      </div>

      <label className="block text-sm font-semibold" htmlFor="contact-description">
        Расскажите о задаче
        <textarea
          className={`${fieldClassName} min-h-36 resize-y py-3`}
          id="contact-description"
          name="description"
          minLength={20}
          maxLength={1600}
          placeholder="Коротко опишите продукт, цели и желаемые сроки"
          required
        />
      </label>

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Button type="submit" size="lg">
          Отправить заявку
        </Button>
        <p className="max-w-md text-xs leading-5 text-muted-foreground">
          Нажимая кнопку, вы соглашаетесь на обработку указанных данных в рамках этой
          демонстрации.
        </p>
      </div>

      {submitted ? (
        <p
          className="border border-primary/35 bg-primary/10 px-4 py-3 text-sm leading-6"
          role="status"
          aria-live="polite"
        >
          Это каркас сайта: данные никуда не отправлены. В рабочей версии здесь будет
          подключена отправка обращения.
        </p>
      ) : null}
    </form>
  );
}
