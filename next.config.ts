/* eslint-disable @typescript-eslint/no-explicit-any */
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

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

  // Headers CORS otimizados
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value:
              process.env.BETTER_AUTH_URL ||
              "https://financeai-25bw.onrender.com",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Requested-With",
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
    // Reduzir uso de memória
    workerThreads: false,
    cpus: 1,
  },

  // Configurações de timeout para Render
  serverRuntimeConfig: {
    // Aumentar timeout para cold starts
    requestTimeout: 30000,
  },
};

module.exports = nextConfig;
