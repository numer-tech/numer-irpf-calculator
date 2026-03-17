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
 * Empresas / Tenants - cada escritório de contabilidade
 */
export const empresas = mysqlTable("empresas", {
  id: int("id").autoincrement().primaryKey(),
  /** Nome do escritório */
  nome: varchar("nome", { length: 255 }).notNull(),
  /** CNPJ do escritório */
  cnpj: varchar("cnpj", { length: 30 }),
  /** CRC do responsável */
  crc: varchar("crc", { length: 50 }),
  /** Nome do responsável */
  responsavel: varchar("responsavel", { length: 255 }),
  /** E-mail de contato */
  email: varchar("email", { length: 320 }),
  /** Telefone de contato */
  telefone: varchar("telefone", { length: 30 }),
  /** WhatsApp para propostas */
  whatsapp: varchar("whatsapp", { length: 30 }),
  /** Endereço do escritório */
  endereco: text("endereco"),
  /** Site do escritório */
  site: varchar("site", { length: 500 }),
  /** URL da logo no S3 */
  logoUrl: text("logoUrl"),
  logoKey: varchar("logoKey", { length: 512 }),
  /** Cor primária (hex) */
  corPrimaria: varchar("corPrimaria", { length: 10 }).default("#F97316").notNull(),
  /** Cor secundária (hex) */
  corSecundaria: varchar("corSecundaria", { length: 10 }).default("#FB923C").notNull(),
  /** Cor de texto sobre a cor primária */
  corTextoPrimaria: varchar("corTextoPrimaria", { length: 10 }).default("#FFFFFF").notNull(),
  /** Configurações da proposta (JSON) */
  configProposta: json("configProposta"),
  /** Configurações de preços (JSON) */
  configPrecos: json("configPrecos"),
  /** Configurações de descontos (JSON) */
  configDescontos: json("configDescontos"),
  /** Ativo/inativo */
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Empresa = typeof empresas.$inferSelect;
export type InsertEmpresa = typeof empresas.$inferInsert;

/**
 * Usuários internos - vinculados a uma empresa (tenant).
 */
export const internalUsers = mysqlTable("internalUsers", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["user", "admin", "superadmin"]).default("user").notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  /** Empresa à qual o usuário pertence */
  empresaId: int("empresaId").references(() => empresas.id),
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
 * Orçamentos de IRPF - vinculados a uma empresa (tenant)
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
  /** Empresa à qual o orçamento pertence */
  empresaId: int("empresaId").references(() => empresas.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Orcamento = typeof orcamentos.$inferSelect;
export type InsertOrcamento = typeof orcamentos.$inferInsert;
