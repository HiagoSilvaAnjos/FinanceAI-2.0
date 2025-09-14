import { relations } from "drizzle-orm";
import {
  decimal,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ENUMS

export const transactionTypeEnum = pgEnum("transaction_type", [
  "DEPOSIT",
  "EXPENSE",
  "INVESTIMENT",
]);

export const transactionCategoryEnum = pgEnum("transaction_category", [
  "HOUSING",
  "TRANSPORTATION",
  "FOOD",
  "ENTERTAINMENT",
  "HEALTH",
  "UTILITY",
  "SALARY",
  "EDUCATION",
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
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
});

export const transactionTable = pgTable("transaction", {
  id: uuid().primaryKey().defaultRandom(),
  name: text(),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: transactionCategoryEnum("category").notNull(),
  paymentMethod: transactionPaymentMethodEnum("payment_method").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: uuid("user_id")
    .references(() => userTable.id)
    .notNull(),
});

export const usersRelations = relations(userTable, ({ many }) => ({
  transactions: many(transactionTable),
}));

export const transactionsRelations = relations(transactionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [transactionTable.userId],
    references: [userTable.id],
  }),
}));
