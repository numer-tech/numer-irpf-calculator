import { boolean, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow (Manus OAuth - mantida para compatibilidade).
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
 * Usuários internos da Numer Contabilidade.
 */
export const internalUsers = mysqlTable("internalUsers", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InternalUser = typeof internalUsers.$inferSelect;
export type InsertInternalUser = typeof internalUsers.$inferInsert;

/**
 * Sessões de autenticação interna.
 */
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => internalUsers.id),
  token: varchar("token", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * Orçamentos de IRPF - Numer Contabilidade
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
  /** Quem criou o orçamento (usuário interno) */
  criadoPor: int("criadoPor").references(() => internalUsers.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Orcamento = typeof orcamentos.$inferSelect;
export type InsertOrcamento = typeof orcamentos.$inferInsert;

/**
 * Configurações de preços da calculadora IRPF - Numer Contabilidade
 * Uma única linha global (id=1) com os preços configurados pelo admin.
 */
export const configPrecos = mysqlTable("configPrecos", {
  id: int("id").autoincrement().primaryKey(),
  /** Valor base da declaração */
  valorBase: decimal("valorBase", { precision: 10, scale: 2 }).default("150.00").notNull(),
  /** Preços unitários de cada item (JSON: { itemId: preco }) */
  itensPreco: json("itensPreco").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy").references(() => internalUsers.id),
});

export type ConfigPrecos = typeof configPrecos.$inferSelect;
export type InsertConfigPrecos = typeof configPrecos.$inferInsert;
