import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const r2PublicURL = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  images: r2PublicURL
    ? {
        remotePatterns: [new URL(`${r2PublicURL}/**`)],
      }
    : undefined,
  reactStrictMode: true,
};

export default withPayload(nextConfig);
