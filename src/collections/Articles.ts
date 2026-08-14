import {
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { slugField, type CollectionConfig } from "payload";

import { authenticated, authenticatedOrPublished } from "./access";
import { slugifyRussian } from "./slugify";

export const Articles: CollectionConfig = {
  slug: "articles",
  labels: {
    singular: "Статья",
    plural: "Статьи",
  },
  defaultSort: "-publishedAt",
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    readVersions: authenticated,
    update: authenticated,
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "_status", "publishedAt", "likes", "updatedAt"],
    description: "Публикации KLIKO, их оформление, дата выхода и счётчик лайков.",
    group: "Материалы",
    listSearchableFields: ["title", "slug", "excerpt"],
  },
  defaultPopulate: {
    title: true,
    slug: true,
    excerpt: true,
    cover: true,
    publishedAt: true,
    likes: true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Заголовок",
      required: true,
      maxLength: 160,
      admin: {
        description: "Основной заголовок статьи на сайте.",
      },
    },
    slugField({
      useAsSlug: "title",
      position: "sidebar",
      slugify: ({ valueToSlugify }) => slugifyRussian(valueToSlugify),
      overrides: (field) => {
        if ("label" in field.fields[0]) {
          field.fields[0].label = "Формировать адрес автоматически";
        }
        field.fields[0].admin = {
          ...field.fields[0].admin,
          description: "Отключите, чтобы задать адрес статьи вручную.",
        };
        if ("label" in field.fields[1]) {
          field.fields[1].label = "Адрес статьи";
        }
        field.fields[1].admin = {
          ...field.fields[1].admin,
          description: "Уникальная часть ссылки после /articles/.",
        };
        return field;
      },
    }),
    {
      name: "excerpt",
      type: "textarea",
      label: "Краткое описание",
      required: true,
      maxLength: 280,
      admin: {
        description: "Анонс для каталога статей и блока рекомендаций.",
        rows: 4,
      },
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      label: "Обложка",
      admin: {
        description:
          "Необязательно для черновика. Для карточек автоматически создаётся квадратная версия изображения.",
      },
    },
    {
      name: "content",
      type: "richText",
      label: "Текст статьи",
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          FixedToolbarFeature(),
          EXPERIMENTAL_TableFeature(),
        ],
      }),
      admin: {
        description:
          "Заголовки, списки, цитаты, ссылки, изображения, таблицы и привычные Markdown-сочетания.",
      },
    },
    {
      name: "publishedAt",
      type: "date",
      label: "Дата публикации",
      admin: {
        position: "sidebar",
        description: "Можно изменить вручную, в том числе после публикации.",
        date: {
          pickerAppearance: "dayAndTime",
          displayFormat: "dd.MM.yyyy HH:mm",
        },
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === "published" && !value) {
              return new Date().toISOString();
            }

            return value;
          },
        ],
      },
    },
    {
      name: "likes",
      type: "number",
      label: "Лайки",
      defaultValue: 0,
      required: true,
      min: 0,
      validate: (value: number | null | undefined) =>
        typeof value === "number" && Number.isInteger(value) && value >= 0
          ? true
          : "Укажите целое неотрицательное количество лайков.",
      admin: {
        position: "sidebar",
        step: 1,
        description: "Счётчик можно скорректировать вручную.",
      },
    },
  ],
  versions: {
    drafts: {
      autosave: {
        interval: 2000,
      },
    },
    maxPerDoc: 30,
  },
};
