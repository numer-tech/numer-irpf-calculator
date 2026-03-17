import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Orçamentos de IRPF - armazena cada orçamento gerado
 */
export const orcamentos = mysqlTable("orcamentos", {
  id: int("id").autoincrement().primaryKey(),
  /** Dados do cliente */
  clienteNome: varchar("clienteNome", { length: 255 }).notNull(),
  clienteCpf: varchar("clienteCpf", { length: 20 }),
  clienteTelefone: varchar("clienteTelefone", { length: 30 }),
  clienteEmail: varchar("clienteEmail", { length: 320 }),
  /** Checklist de itens (JSON com as quantidades de cada item) */
  checklist: json("checklist").notNull(),
  /** Resultado calculado (JSON com lineItems, fichas, etc.) */
  resultado: json("resultado").notNull(),
  /** Valor calculado automaticamente */
  valorCalculado: decimal("valorCalculado", { precision: 10, scale: 2 }).notNull(),
  /** Valor final (pode ser ajustado manualmente) */
  valorFinal: decimal("valorFinal", { precision: 10, scale: 2 }).notNull(),
  /** Status do orçamento */
  status: mysqlEnum("status", ["pendente", "aprovado", "concluido", "cancelado"]).default("pendente").notNull(),
  /** URL do comprovante de pagamento no S3 */
  comprovanteUrl: text("comprovanteUrl"),
  comprovanteKey: varchar("comprovanteKey", { length: 512 }),
  /** Observações do contador */
  observacoes: text("observacoes"),
  /** Quem criou o orçamento */
  criadoPor: int("criadoPor").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Orcamento = typeof orcamentos.$inferSelect;
export type InsertOrcamento = typeof orcamentos.$inferInsert;
