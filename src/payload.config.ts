import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { ru } from "@payloadcms/translations/languages/ru";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Articles, Media, Users } from "@/collections";
import { migrations } from "@/migrations";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const r2Settings = {
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  bucket: process.env.R2_BUCKET,
  endpoint: process.env.R2_ENDPOINT,
  publicURL: process.env.R2_PUBLIC_URL,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
};
const r2Values = Object.values(r2Settings);
const r2Enabled = r2Values.every(Boolean);

if (r2Values.some(Boolean) && !r2Enabled) {
  throw new Error(
    "Cloudflare R2 настроен частично. Укажите R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT и R2_PUBLIC_URL.",
  );
}

export default buildConfig({
  admin: {
    user: Users.slug,
    theme: "light",
    importMap: {
      baseDir: dirname,
    },
    components: {
      graphics: {
        Logo: "/components/admin/admin-logo",
        Icon: "/components/admin/admin-icon",
      },
      beforeDashboard: ["/components/admin/admin-welcome"],
      afterNavLinks: ["/components/admin/admin-nav-footer"],
    },
    meta: {
      titleSuffix: " — KLIKO",
    },
  },
  collections: [Users, Media, Articles],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    prodMigrations: migrations,
  }),
  editor: lexicalEditor(),
  i18n: {
    fallbackLanguage: "ru",
    supportedLanguages: { ru },
  },
  plugins: [
    s3Storage({
      alwaysInsertFields: true,
      bucket: r2Settings.bucket ?? "local-disabled",
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename: mediaFilename, prefix }) => {
            const baseURL = (r2Settings.publicURL ?? "").replace(/\/+$/, "");
            const objectKey = [prefix, mediaFilename].filter(Boolean).join("/");
            return `${baseURL}/${objectKey}`;
          },
        },
      },
      config: {
        credentials: {
          accessKeyId: r2Settings.accessKeyId ?? "local-disabled",
          secretAccessKey: r2Settings.secretAccessKey ?? "local-disabled",
        },
        endpoint: r2Settings.endpoint,
        forcePathStyle: true,
        region: "auto",
      },
      enabled: r2Enabled,
    }),
  ],
  secret: process.env.PAYLOAD_SECRET ?? "",
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
