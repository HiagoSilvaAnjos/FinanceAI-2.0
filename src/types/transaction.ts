import { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { transactionTable } from "@/db/schema"; // ajuste o path conforme sua estrutura

export type Transaction = InferSelectModel<typeof transactionTable>;
export type NewTransaction = InferInsertModel<typeof transactionTable>;
