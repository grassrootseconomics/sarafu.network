/** @type {import('next').NextConfig} */
const nextConfig = {
  // TODO: Revert this when bug with Media stream not releasing is fixed
  reactStrictMode: false,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};

module.exports = nextConfig;
