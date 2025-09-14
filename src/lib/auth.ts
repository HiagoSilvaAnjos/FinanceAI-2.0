import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/db";
import * as schema from "@/db/schema";

// Detectar a plataforma e configurar URLs dinamicamente
const getBaseUrl = () => {
  // Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Render ou outras plataformas
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }

  // Desenvolvimento local
  return "http://localhost:3000";
};

const baseUrl = getBaseUrl();

// URLs confiáveis baseadas na plataforma
const getTrustedOrigins = () => {
  const origins = [
    "http://localhost:3000", // desenvolvimento
  ];

  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
    origins.push("https://finance-ai-2-0.vercel.app");
  }

  if (process.env.BETTER_AUTH_URL) {
    origins.push(process.env.BETTER_AUTH_URL);
  }

  return origins;
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectURI: `${baseUrl}/api/auth/callback/google`,
    },
  },

  // URLs confiáveis dinâmicas
  trustedOrigins: getTrustedOrigins(),

  // Configurações de CORS mais permissivas
  cors: {
    origin: getTrustedOrigins(),
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },

  user: {
    modelName: "userTable",
  },

  verification: {
    modelName: "verificationTable",
  },

  // Base URL dinâmica
  baseURL: baseUrl,

  // Configurações de segurança para multi-plataforma
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
    cookiePrefix: "better-auth",
    generateId: () => crypto.randomUUID(),
  },

  // Secret dinâmico
  secret: process.env.BETTER_AUTH_SECRET || "fallback-secret-for-dev",

  // Configurações específicas para produção
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    },
  },
});
