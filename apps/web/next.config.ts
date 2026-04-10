/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env";

import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const config: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@upstash/redis", "uncrypto", "discord.js", "zlib-sync"],
  webpack: (config: {
    resolve: { fallback: Record<string, boolean> };
    externals: string[];
  }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },

  redirects() {
    return [
      {
        source: "/create",
        destination: "/vouchers/create",
        permanent: true,
      },
    ];
  },
  output: Boolean(process.env.DOCKER) ? "standalone" : undefined,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "content.sarafu.network",
      },
    ],
  },
};

const sentryConfig = {
  org: "grassroots-economics-l5",
  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors.
  automaticVercelMonitors: true,
};

const nextConfig =
  process.env.NODE_ENV === "production"
    ? withSentryConfig(bundleAnalyzer(config), sentryConfig)
    : bundleAnalyzer(config);

export default nextConfig;
