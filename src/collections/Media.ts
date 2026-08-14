import path from "node:path";

import type { CollectionConfig } from "payload";

import { anyone, authenticated } from "./access";

export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: "Изображение",
    plural: "Медиатека",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: "alt",
    defaultColumns: ["filename", "alt", "updatedAt"],
    description: "Обложки и изображения, которые можно вставлять в статьи.",
    group: "Материалы",
  },
  upload: {
    staticDir: path.resolve(process.cwd(), "public", "media"),
    adminThumbnail: "thumbnail",
    crop: true,
    focalPoint: true,
    mimeTypes: ["image/*"],
    imageSizes: [
      {
        name: "thumbnail",
        width: 320,
        height: 320,
        position: "centre",
      },
      {
        name: "card",
        width: 720,
        height: 720,
        position: "centre",
      },
      {
        name: "content",
        width: 1440,
      },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Альтернативный текст",
      required: true,
      admin: {
        description:
          "Кратко опишите изображение для доступности и случаев, когда оно не загрузилось.",
      },
    },
    {
      name: "caption",
      type: "textarea",
      label: "Подпись",
      maxLength: 500,
      admin: {
        description: "Необязательная подпись или источник изображения.",
        rows: 3,
      },
    },
  ],
};
