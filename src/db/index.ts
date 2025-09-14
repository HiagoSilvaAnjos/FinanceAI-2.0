import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Função para obter a URL do banco baseada no ambiente
function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL não encontrada nas variáveis de ambiente. " +
        "Verifique se o arquivo .env.local ou .env.production está configurado corretamente.",
    );
  }

  return databaseUrl;
}

// Configuração do pool de conexões
const pool = new Pool({
  connectionString: getDatabaseUrl(),
  // Configurações específicas para diferentes ambientes
  ...(process.env.NODE_ENV === "production" && {
    ssl: {
      rejectUnauthorized: false,
    },
    max: 20, // Máximo de conexões no pool para produção
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }),
  ...(process.env.NODE_ENV === "development" && {
    max: 10, // Menos conexões para desenvolvimento
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  }),
});

// Exportar a instância do Drizzle configurada
export const db = drizzle(pool);

// Exportar o pool para uso direto se necessário
export { pool };
