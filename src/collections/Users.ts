import type { CollectionConfig } from "payload";

import { authenticated } from "./access";

export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: "Пользователь",
    plural: "Пользователи",
  },
  access: {
    admin: ({ req }) => Boolean(req.user),
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "updatedAt"],
    description: "Учётные записи с доступом к защищённой панели KLIKO.",
    group: "Настройки",
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Имя",
      required: true,
      admin: {
        description: "Имя редактора, отображаемое в панели управления.",
      },
    },
  ],
  timestamps: true,
};
