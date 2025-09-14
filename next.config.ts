/* eslint-disable @typescript-eslint/no-explicit-any */
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Usar standalone apenas para Render/Docker
  output: process.env.VERCEL ? undefined : "standalone",

  webpack: (config: any, { isServer }: any) => {
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

  // Headers CORS otimizados para multi-plataforma
  async headers() {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.BETTER_AUTH_URL || "http://localhost:3000";

    return [
      {
        source: "/api/auth/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: baseUrl,
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "Content-Type, Authorization, X-Requested-With, Accept, Origin",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
        ],
      },
      // Health check sem CORS
      {
        source: "/api/health",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },

  experimental: {
    serverComponentsExternalPackages: ["pg"],
    ...(process.env.VERCEL
      ? {}
      : {
          workerThreads: false,
          cpus: 1,
        }),
  },

  serverRuntimeConfig: {
    requestTimeout: process.env.VERCEL ? 10000 : 30000,
  },
};

module.exports = nextConfig;
