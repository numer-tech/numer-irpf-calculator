import { eq, desc, and, gt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  orcamentos, InsertOrcamento, Orcamento,
  internalUsers,
  sessions,
  configPrecos,
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { nanoid } from "nanoid";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Manus OAuth Users (mantido para compatibilidade) ──────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot get user: database not available"); return undefined; }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Internal Users (autenticação própria) ─────────────────────────────────

export async function getInternalUserByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(internalUsers).where(eq(internalUsers.email, email.toLowerCase())).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getInternalUserById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(internalUsers).where(eq(internalUsers.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createInternalUser(data: {
  nome: string;
  email: string;
  passwordHash: string;
  role?: "user" | "admin";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(internalUsers).values({
    nome: data.nome,
    email: data.email.toLowerCase(),
    passwordHash: data.passwordHash,
    role: data.role ?? "user",
    ativo: true,
  });
  return getInternalUserById(result[0].insertId);
}

export async function listInternalUsers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select({
    id: internalUsers.id,
    nome: internalUsers.nome,
    email: internalUsers.email,
    role: internalUsers.role,
    ativo: internalUsers.ativo,
    createdAt: internalUsers.createdAt,
  }).from(internalUsers).orderBy(desc(internalUsers.createdAt));
}

export async function updateInternalUser(id: number, data: Partial<{
  nome: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  ativo: boolean;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(internalUsers).set(data).where(eq(internalUsers.id, id));
  return getInternalUserById(id);
}

export async function deleteInternalUser(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(internalUsers).where(eq(internalUsers.id, id));
  return { success: true };
}

// ─── Sessions ──────────────────────────────────────────────────────────────

export async function createSession(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const token = nanoid(64);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.insert(sessions).values({ userId, token, expiresAt });
  return { token, expiresAt };
}

export async function getSessionByToken(token: string) {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  const result = await db
    .select({ session: sessions, user: internalUsers })
    .from(sessions)
    .innerJoin(internalUsers, eq(sessions.userId, internalUsers.id))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, now)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function deleteSession(token: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(sessions).where(eq(sessions.token, token));
}

export async function deleteUserSessions(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

// ─── Orçamentos ────────────────────────────────────────────────────────────

export async function createOrcamento(data: InsertOrcamento) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orcamentos).values(data);
  return getOrcamentoById(result[0].insertId);
}

export async function listOrcamentosByUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const rows = await db
    .select({ orcamento: orcamentos, criadorNome: internalUsers.nome })
    .from(orcamentos)
    .leftJoin(internalUsers, eq(orcamentos.criadoPor, internalUsers.id))
    .where(eq(orcamentos.criadoPor, userId))
    .orderBy(desc(orcamentos.createdAt));

  return rows.map((r) => ({ ...r.orcamento, criadorNome: r.criadorNome ?? "Desconhecido" }));
}

export async function listAllOrcamentos(filterUserId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const rows = filterUserId
    ? await db
        .select({ orcamento: orcamentos, criadorNome: internalUsers.nome })
        .from(orcamentos)
        .leftJoin(internalUsers, eq(orcamentos.criadoPor, internalUsers.id))
        .where(eq(orcamentos.criadoPor, filterUserId))
        .orderBy(desc(orcamentos.createdAt))
    : await db
        .select({ orcamento: orcamentos, criadorNome: internalUsers.nome })
        .from(orcamentos)
        .leftJoin(internalUsers, eq(orcamentos.criadoPor, internalUsers.id))
        .orderBy(desc(orcamentos.createdAt));

  return rows.map((r) => ({ ...r.orcamento, criadorNome: r.criadorNome ?? "Desconhecido" }));
}

export async function getOrcamentoById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(orcamentos).where(eq(orcamentos.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateOrcamentoStatus(id: number, status: Orcamento["status"]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orcamentos).set({ status }).where(eq(orcamentos.id, id));
  return getOrcamentoById(id);
}

export async function updateOrcamentoComprovante(id: number, comprovanteUrl: string, comprovanteKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orcamentos).set({ comprovanteUrl, comprovanteKey }).where(eq(orcamentos.id, id));
  return getOrcamentoById(id);
}

export async function updateOrcamentoObservacoes(id: number, observacoes: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orcamentos).set({ observacoes }).where(eq(orcamentos.id, id));
  return getOrcamentoById(id);
}

export async function deleteOrcamento(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(orcamentos).where(eq(orcamentos.id, id));
  return { success: true };
}

// ─── Configurações de Preços ───────────────────────────────────────────────

/** Retorna a configuração de preços global (id=1) */
export async function getConfigPrecos() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(configPrecos).where(eq(configPrecos.id, 1)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/** Salva/atualiza a configuração de preços global (upsert na linha id=1) */
export async function upsertConfigPrecos(data: {
  valorBase: number;
  itensPreco: Record<string, number>;
  updatedBy?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getConfigPrecos();
  if (existing) {
    await db.update(configPrecos).set({
      valorBase: String(data.valorBase),
      itensPreco: data.itensPreco,
      updatedBy: data.updatedBy ?? null,
    }).where(eq(configPrecos.id, 1));
  } else {
    await db.insert(configPrecos).values({
      valorBase: String(data.valorBase),
      itensPreco: data.itensPreco,
      updatedBy: data.updatedBy ?? null,
    });
  }
  return getConfigPrecos();
}
