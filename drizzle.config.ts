/* eslint-disable @typescript-eslint/no-require-imports */
import "dotenv/config";

import { defineConfig } from "drizzle-kit";

// Função para detectar o ambiente e carregar o arquivo correto
function getDatabaseUrl(): string {
  const nodeEnv = process.env.NODE_ENV;

  console.log(nodeEnv);

  // Se NODE_ENV não estiver definido, assume desenvolvimento
  if (!nodeEnv || nodeEnv === "development") {
    // Carrega .env.local para desenvolvimento
    require("dotenv").config({ path: ".env.local" });
  } else if (nodeEnv === "production") {
    // Carrega .env.production para produção
    require("dotenv").config({ path: ".env.production" });
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      `DATABASE_URL não encontrada para o ambiente ${nodeEnv || "development"}. ` +
        "Verifique se o arquivo .env.local ou .env.production está configurado.",
    );
  }

  return databaseUrl;
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});
