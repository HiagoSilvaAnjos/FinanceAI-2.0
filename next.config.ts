/* eslint-disable @typescript-eslint/no-explicit-any */
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    esmExternals: "loose",
  },
  webpack: (config: { resolve: { fallback: any } }, { isServer }: any) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  transpilePackages: ["tailwindcss"],
  // Otimizações para Docker
  compress: true,
  poweredByHeader: false,
  // Garantir que os assets sejam incluídos
  trailingSlash: false,
  generateEtags: false,
};

module.exports = nextConfig;
