import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// ENUMS

export const transactionTypeEnum = pgEnum("transaction_type", [
  "DEPOSIT",
  "EXPENSE",
]);

export const transactionCategoryEnum = pgEnum("transaction_category", [
  // Categorias para DESPESAS (EXPENSE)
  "HOUSING",
  "TRANSPORTATION",
  "FOOD",
  "SHOPPING",
  "ENTERTAINMENT",
  "HEALTH",
  "UTILITY",
  "EDUCATION",
  "PETS",
  "BEAUTY",
  "INSURANCE",
  "TAXES",
  "LOAN_EXPENSE",
  // Categorias para DEPÓSITOS (DEPOSIT)
  "SALARY",
  "FREELANCE",
  "BUSINESS",
  "INVESTMENT",
  "BONUS",
  "GIFT",
  "REFUND",
  "RENTAL",
  "SIDE_HUSTLE",
  "LOAN_INCOME",
  // Fallback
  "OTHER",
]);

export const transactionPaymentMethodEnum = pgEnum(
  "transaction_payment_method",
  [
    "CREDIT_CARD",
    "DEBIT_CARD",
    "BANK_TRANSFER",
    "BANK_SLIP",
    "CASH",
    "PIX",
    "OTHER",
  ],
);

//   TABLES
export const userTable = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verificationTable = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

// Nova tabela para grupos de parcelas
export const installmentGroupTable = pgTable("installment_group", {
  id: uuid().primaryKey().defaultRandom(),
  originalName: text("original_name").notNull(), // Nome original da transação
  originalAmount: decimal("original_amount", {
    precision: 10,
    scale: 2,
  }).notNull(), // Valor total original
  totalInstallments: integer("total_installments").notNull(), // Total de parcelas
  type: transactionTypeEnum("type").notNull(),
  category: transactionCategoryEnum("category").notNull(),
  paymentMethod: transactionPaymentMethodEnum("payment_method").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: text("user_id")
    .references(() => userTable.id, { onDelete: "cascade" })
    .notNull(),
});

export const transactionTable = pgTable("transaction", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: transactionCategoryEnum("category").notNull(),
  paymentMethod: transactionPaymentMethodEnum("payment_method").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: text("user_id")
    .references(() => userTable.id, { onDelete: "cascade" })
    .notNull(),

  // Campos para vincular às parcelas
  installmentGroupId: uuid("installment_group_id").references(
    () => installmentGroupTable.id,
    { onDelete: "cascade" },
  ),
  installmentNumber: integer("installment_number"),
});

export const installmentGroupRelations = relations(
  installmentGroupTable,
  ({ one, many }) => ({
    user: one(userTable, {
      fields: [installmentGroupTable.userId],
      references: [userTable.id],
    }),
    transactions: many(transactionTable),
  }),
);

export const transactionsRelations = relations(transactionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [transactionTable.userId],
    references: [userTable.id],
  }),
  installmentGroup: one(installmentGroupTable, {
    fields: [transactionTable.installmentGroupId],
    references: [installmentGroupTable.id],
  }),
}));

export const aiUsageTable = pgTable(
  "ai_usage",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    featureType: text("feature_type", {
      enum: ["AI_TRANSACTION", "AI_REPORT"],
    }).notNull(),
    usageDate: date("usage_date").defaultNow().notNull(),
    usageCount: integer("usage_count").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    uniqueUserFeatureDate: unique().on(
      table.userId,
      table.featureType,
      table.usageDate,
    ),
    userFeatureIdx: index().on(table.userId, table.featureType),
    dateIdx: index().on(table.usageDate),
  }),
);

// Relações
export const aiUsageRelations = relations(aiUsageTable, ({ one }) => ({
  user: one(userTable, {
    fields: [aiUsageTable.userId],
    references: [userTable.id],
  }),
}));

// Adicionar às relações do usuário
export const usersRelations = relations(userTable, ({ many }) => ({
  transactions: many(transactionTable),
  installmentGroups: many(installmentGroupTable),
  aiUsage: many(aiUsageTable),
}));
