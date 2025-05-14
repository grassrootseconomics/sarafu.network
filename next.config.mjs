/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import createJiti from "jiti";
const jiti = createJiti(new URL(import.meta.url).pathname);

jiti("./src/env");

import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});
/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    // Discord.js
    config.module.rules.push({
      test: /\.node/,
      use: "node-loader",
    });
    return config;
  },

  async redirects() {
    return [
      // Basic redirect
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
let nextConfig = {};

const sentryConfig = {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "grassroots-economics-l5",
  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
};

if (process.env.NODE_ENV === "production") {
  const { withSentryConfig } = await import("@sentry/nextjs");
  nextConfig = withSentryConfig(bundleAnalyzer(config), sentryConfig);
} else {
  nextConfig = bundleAnalyzer(config);
}
export default nextConfig;
