import { and, eq, gte, sql } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { aiUsageTable } from "@/db/schema";
import { auth } from "@/lib/auth";

//  limites
export const AI_LIMITS = {
  AI_TRANSACTION: {
    limit: 10,
    resetPeriod: "daily" as const,
    resetHours: 24,
  },
  AI_REPORT: {
    limit: 5,
    resetPeriod: "monthly" as const,
    resetHours: 24 * 30,
  },
} as const;

export type AIFeatureType = keyof typeof AI_LIMITS;

interface QuotaCheck {
  hasQuota: boolean;
  currentUsage: number;
  limit: number;
  resetDate: Date;
  timeUntilReset: string;
}

/**
 * Verifica se o usuário ainda tem quota disponível
 */
export async function checkAIQuota(
  featureType: AIFeatureType,
): Promise<QuotaCheck> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const config = AI_LIMITS[featureType];

  // Calcular data de reset baseada no tipo de limite
  const now = new Date();
  let resetDate: Date;
  let checkDate: Date;

  if (config.resetPeriod === "daily") {
    resetDate = new Date(now);
    resetDate.setDate(resetDate.getDate() + 1);
    resetDate.setHours(0, 0, 0, 0);

    checkDate = new Date(now);
    checkDate.setHours(0, 0, 0, 0);
  } else {
    // monthly
    resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
    checkDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  }

  // Buscar uso atual
  const currentUsage = await db
    .select({
      total: sql<number>`COALESCE(SUM(${aiUsageTable.usageCount}), 0)`,
    })
    .from(aiUsageTable)
    .where(
      and(
        eq(aiUsageTable.userId, userId),
        eq(aiUsageTable.featureType, featureType),
        gte(aiUsageTable.usageDate, checkDate.toISOString().split("T")[0]),
      ),
    );

  const usage = Number(currentUsage[0]?.total || 0);
  const hasQuota = usage < config.limit;

  // Calcular tempo até reset
  const timeUntilReset = formatTimeUntilReset(now, resetDate);

  return {
    hasQuota,
    currentUsage: usage,
    limit: config.limit,
    resetDate,
    timeUntilReset,
  };
}

/**
 * Incrementa o uso da funcionalidade
 */
export async function incrementAIUsage(
  featureType: AIFeatureType,
  count: number = 1,
): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const today = new Date().toISOString().split("T")[0];

  // Usar UPSERT para incrementar ou criar
  await db
    .insert(aiUsageTable)
    .values({
      userId,
      featureType,
      usageDate: today,
      usageCount: count,
    })
    .onConflictDoUpdate({
      target: [
        aiUsageTable.userId,
        aiUsageTable.featureType,
        aiUsageTable.usageDate,
      ],
      set: {
        usageCount: sql`${aiUsageTable.usageCount} + ${count}`,
        updatedAt: new Date(),
      },
    });
}

/**
 * Formatar tempo até reset
 */
function formatTimeUntilReset(now: Date, resetDate: Date): string {
  const diffMs = resetDate.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days} dia${days !== 1 ? "s" : ""}`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }

  return `${minutes} minutos`;
}

/**
 * Obter estatísticas de uso
 */
export async function getAIUsageStats(): Promise<{
  transactions: QuotaCheck;
  reports: QuotaCheck;
}> {
  const [transactions, reports] = await Promise.all([
    checkAIQuota("AI_TRANSACTION"),
    checkAIQuota("AI_REPORT"),
  ]);

  return { transactions, reports };
}
