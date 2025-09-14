/* eslint-disable @typescript-eslint/no-explicit-any */
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  webpack: (config: { resolve: { fallback: any } }, { isServer }: any) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  // Otimizações para Docker
  compress: true,
  poweredByHeader: false,
  trailingSlash: false,
  generateEtags: false,
};

module.exports = nextConfig;
