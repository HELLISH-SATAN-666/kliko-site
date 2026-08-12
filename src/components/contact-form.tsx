"use client";

import { CircleHelp, Mic, Upload } from "lucide-react";
import { type FormEvent, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const defaultFieldClassName =
  "focus-ring mt-2 min-h-12 w-full border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 hover:border-foreground/45";

const referenceFieldClassName =
  "focus-ring min-h-7 w-full border-0 bg-transparent p-0 text-foreground outline-none placeholder:text-muted-foreground/65";

export function ContactForm({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "reference";
}) {
  const formId = useId();
  const [status, setStatus] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(
      "Это демонстрационная форма: данные не отправлены. Рабочая отправка будет подключена позже.",
    );
  }

  if (variant === "reference") {
    const nameId = `${formId}-name`;
    const companyId = `${formId}-company`;
    const emailId = `${formId}-email`;
    const phoneId = `${formId}-phone`;
    const budgetId = `${formId}-budget`;
    const descriptionId = `${formId}-description`;

    return (
      <form
        className={cn("contact-reference-form", className)}
        onSubmit={handleSubmit}
        onInput={() => setStatus("")}
      >
        <fieldset>
          <legend className="sr-only">Контактные данные и описание задачи</legend>

          <div className="contact-reference-fields">
            <label className="contact-reference-field" htmlFor={nameId}>
              <span>Имя*</span>
              <input
                className={referenceFieldClassName}
                id={nameId}
                name="name"
                type="text"
                autoComplete="name"
                minLength={2}
                maxLength={100}
                required
              />
            </label>

            <label className="contact-reference-field" htmlFor={companyId}>
              <span>Компания*</span>
              <input
                className={referenceFieldClassName}
                id={companyId}
                name="company"
                type="text"
                autoComplete="organization"
                maxLength={160}
                required
              />
            </label>

            <label className="contact-reference-field" htmlFor={emailId}>
              <span>Корпоративная почта*</span>
              <input
                className={referenceFieldClassName}
                id={emailId}
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
              />
            </label>

            <label className="contact-reference-field" htmlFor={phoneId}>
              <span>Телефон*</span>
              <input
                className={referenceFieldClassName}
                id={phoneId}
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                minLength={7}
                maxLength={40}
                required
              />
            </label>

            <label className="contact-reference-field" htmlFor={budgetId}>
              <span>Бюджет проекта</span>
              <select
                className={cn(referenceFieldClassName, "cursor-pointer appearance-auto")}
                id={budgetId}
                name="budget"
                defaultValue=""
              >
                <option value="" disabled>
                  Выберите диапазон
                </option>
                <option value="unknown">Пока не определён</option>
                <option value="range-1">Диапазон 01 — заглушка</option>
                <option value="range-2">Диапазон 02 — заглушка</option>
                <option value="range-3">Диапазон 03 — заглушка</option>
              </select>
            </label>

            <label
              className="contact-reference-field contact-reference-description"
              htmlFor={descriptionId}
            >
              <span>Подробно опишите задачу*</span>
              <textarea
                className={cn(referenceFieldClassName, "resize-y")}
                id={descriptionId}
                name="description"
                rows={1}
                minLength={20}
                maxLength={1600}
                required
              />
            </label>
          </div>
        </fieldset>

        <div className="contact-reference-tools" aria-label="Дополнительные материалы">
          <div className="contact-reference-tool">
            <p>Отправить голосовое сообщение</p>
            <button
              type="button"
              className="contact-reference-tool-button focus-ring"
              aria-disabled="true"
              onClick={() => setStatus("Запись голосового сообщения пока недоступна в каркасе сайта.")}
            >
              <Mic className="size-4" aria-hidden="true" />
              <span className="sr-only">Записать голосовое сообщение</span>
            </button>
          </div>

          <div className="contact-reference-tool">
            <p>Прикрепить документы</p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                className="contact-reference-tool-button focus-ring"
                aria-disabled="true"
                onClick={() => setStatus("Загрузка документов пока недоступна в каркасе сайта.")}
              >
                <Upload className="size-4" aria-hidden="true" />
                Загрузить файл
              </button>
              <CircleHelp className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="contact-reference-submit-row">
          <p className="contact-reference-consent">
            Нажимая «Отправить», вы соглашаетесь на обработку указанных данных. В
            демонстрационной версии информация никуда не передаётся.
          </p>
          <Button className="h-12 min-w-[140px] px-7" type="submit">
            Отправить
          </Button>
        </div>

        <p className="contact-reference-alternative">
          Вы также можете отправить нам запрос
          <br />
          на <span>почту — заглушку</span>
        </p>

        {status ? (
          <p className="contact-reference-status" role="status" aria-live="polite" aria-atomic="true">
            {status}
          </p>
        ) : null}
      </form>
    );
  }

  return (
    <form
      className={cn("space-y-6", className)}
      onSubmit={handleSubmit}
      onInput={() => setStatus("")}
    >
      <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
        <label className="text-sm font-semibold" htmlFor="contact-name">
          Имя
          <input
            className={defaultFieldClassName}
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
            className={defaultFieldClassName}
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
            className={defaultFieldClassName}
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
            className={defaultFieldClassName}
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
            className={defaultFieldClassName}
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
          className={`${defaultFieldClassName} min-h-36 resize-y py-3`}
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

      {status ? (
        <p
          className="border border-primary/35 bg-primary/10 px-4 py-3 text-sm leading-6"
          role="status"
          aria-live="polite"
        >
          {status}
        </p>
      ) : null}
    </form>
  );
}
