import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/db";
import * as schema from "@/db/schema";

// Detectar se está na Vercel e ajustar URL
const getBaseUrl = () => {
  // Para Vercel, sempre usar o domínio principal
  if (process.env.VERCEL) {
    return "https://finance-ai-2-0.vercel.app";
  }
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }
  return "http://localhost:3000";
};

const baseUrl = getBaseUrl();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // Better Auth gerencia o callback automaticamente
    },
  },

  // Configurações importantes para produção - EXPANDIDAS para Vercel
  trustedOrigins: [
    baseUrl,
    "https://financeai-25bw.onrender.com",
    "https://finance-ai-2-0.vercel.app", // seu dominio da vercel
    "http://localhost:3000",
  ],

  // Configurações de CORS mais permissivas para Vercel
  cors: {
    origin: [
      baseUrl,
      "https://financeai-25bw.onrender.com",
      "https://finance-ai-2-0.vercel.app",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
  },

  user: {
    modelName: "userTable",
  },

  verification: {
    modelName: "verificationTable",
  },

  // Base URL dinâmica
  baseURL: baseUrl,

  // Configuração adicional para produção
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
    // Configurações específicas para Vercel
    ...(process.env.VERCEL && {
      cookiePrefix: "better-auth",
      generateId: () => crypto.randomUUID(),
    }),
  },

  // Configurações de sessão mais robustas
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    },
  },
});
