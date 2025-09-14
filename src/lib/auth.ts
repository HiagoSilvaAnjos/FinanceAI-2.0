import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/db";
import * as schema from "@/db/schema";

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
    },
  },

  // Configurações importantes para produção
  trustedOrigins: [
    process.env.BETTER_AUTH_URL as string,
    "https://financeai-25bw.onrender.com",
    "http://localhost:3000",
  ],

  // Configurações de CORS para produção
  cors: {
    origin: [
      process.env.BETTER_AUTH_URL as string,
      "https://financeai-25bw.onrender.com",
      "http://localhost:3000",
    ],
    credentials: true,
  },

  user: {
    modelName: "userTable",
  },

  verification: {
    modelName: "verificationTable",
  },

  // Configuração adicional para produção
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  // Configuração de segurança
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
  },
});
