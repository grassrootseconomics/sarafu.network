/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import withBundleAnalyzer from "@next/bundle-analyzer";
import createJiti from "jiti";

const jiti = createJiti(new URL(import.meta.url).pathname);

jiti("./src/env");

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});
/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
      config.module.rules.push({
        test: /\.node/,
        use: 'node-loader'
      })
    return config;
  },
  transpilePackages: [
    "@grassroots/paper-wallet",
    "@grassroots/shared",
    "@grassroots/contracts",
    "@grassroots/auth",
  ],
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

  /**
   * If you have `experimental: { appDir: true }` set, then you must comment the below `i18n` config
   * out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
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

export default bundleAnalyzer(config);
