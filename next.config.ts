/* eslint-disable @typescript-eslint/no-explicit-any */
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Essencial para Docker

  webpack: (config: { resolve: { fallback: any } }, { isServer }: any) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },

  // Otimizações para produção
  compress: true,
  poweredByHeader: false,
  trailingSlash: false,
  generateEtags: false,

  // Importante: permitir conexões externas
  experimental: {
    serverComponentsExternalPackages: ["pg"],
  },
};

module.exports = nextConfig;
