import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, orcamentos, InsertOrcamento, Orcamento } from "../drizzle/schema";
import { ENV } from './_core/env';

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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
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

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/** Lista todos os usuários (para admin) */
export async function listUsers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    createdAt: users.createdAt,
  }).from(users).orderBy(desc(users.createdAt));
}

// ─── Orçamentos ────────────────────────────────────────────

export async function createOrcamento(data: InsertOrcamento) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(orcamentos).values(data);
  const insertId = result[0].insertId;
  return getOrcamentoById(insertId);
}

/** Lista orçamentos de um usuário específico */
export async function listOrcamentosByUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const rows = await db
    .select({
      orcamento: orcamentos,
      criadorNome: users.name,
    })
    .from(orcamentos)
    .leftJoin(users, eq(orcamentos.criadoPor, users.id))
    .where(eq(orcamentos.criadoPor, userId))
    .orderBy(desc(orcamentos.createdAt));

  return rows.map((r) => ({
    ...r.orcamento,
    criadorNome: r.criadorNome ?? "Desconhecido",
  }));
}

/** Lista TODOS os orçamentos (admin) com nome do criador */
export async function listAllOrcamentos() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const rows = await db
    .select({
      orcamento: orcamentos,
      criadorNome: users.name,
    })
    .from(orcamentos)
    .leftJoin(users, eq(orcamentos.criadoPor, users.id))
    .orderBy(desc(orcamentos.createdAt));

  return rows.map((r) => ({
    ...r.orcamento,
    criadorNome: r.criadorNome ?? "Desconhecido",
  }));
}

/** Mantém listOrcamentos para compatibilidade */
export async function listOrcamentos() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(orcamentos).orderBy(desc(orcamentos.createdAt));
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
