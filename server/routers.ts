import { TRPCError } from "@trpc/server";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import bcrypt from "bcryptjs";
import {
  createOrcamento,
  listOrcamentosByUser,
  listAllOrcamentos,
  getOrcamentoById,
  updateOrcamentoStatus,
  updateOrcamentoComprovante,
  updateOrcamentoObservacoes,
  deleteOrcamento,
  getInternalUserByEmail,
  getInternalUserById,
  createInternalUser,
  listInternalUsers,
  updateInternalUser,
  deleteInternalUser,
  createSession,
  getSessionByToken,
  deleteSession,
  deleteUserSessions,
  getConfigPrecos,
  upsertConfigPrecos,
} from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

const SESSION_COOKIE = "numer_session";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  path: "/",
  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
};

/** Middleware que extrai e valida a sessão interna do cookie */
async function getInternalSession(req: any) {
  const cookieHeader = req.headers?.cookie ?? "";
  const cookies: Record<string, string> = {};
  for (const part of cookieHeader.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k) cookies[k.trim()] = decodeURIComponent(v.join("="));
  }
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;
  return getSessionByToken(token);
}

/** Procedure protegida com autenticação interna */
const internalProtectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (ctx.internalUser && ctx.internalUser.ativo) {
    return next({ ctx });
  }
  const session = await getInternalSession(ctx.req);
  if (!session || !session.user.ativo) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Não autenticado" });
  }
  return next({ ctx: { ...ctx, internalUser: session.user } });
});

/** Procedure de admin (apenas admins da Numer) */
const internalAdminProcedure = internalProtectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.internalUser!.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  // ─── Autenticação interna ────────────────────────────────────────────────
  auth: router({
    /** Login com e-mail e senha */
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        senha: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await getInternalUserByEmail(input.email);
        if (!user || !user.ativo) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "E-mail ou senha incorretos" });
        }
        const valid = await bcrypt.compare(input.senha, user.passwordHash);
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "E-mail ou senha incorretos" });
        }
        const { token } = await createSession(user.id);
        ctx.res.cookie(SESSION_COOKIE, token, COOKIE_OPTIONS);

        return {
          id: user.id,
          nome: user.nome,
          email: user.email,
          role: user.role,
        };
      }),

    /** Logout */
    logout: publicProcedure.mutation(async ({ ctx }) => {
      const session = await getInternalSession(ctx.req);
      if (session) {
        await deleteSession(session.session.token);
      }
      ctx.res.clearCookie(SESSION_COOKIE, { ...COOKIE_OPTIONS, maxAge: -1 });
      return { success: true };
    }),

    /** Retorna o usuário logado */
    me: publicProcedure.query(async ({ ctx }) => {
      const session = await getInternalSession(ctx.req);
      if (!session || !session.user.ativo) return null;

      return {
        id: session.user.id,
        nome: session.user.nome,
        email: session.user.email,
        role: session.user.role,
      };
    }),
  }),

  // ─── Configurações de Preços ─────────────────────────────────────────────
  config: router({
    /** Buscar configuração de preços atual */
    getPrecos: internalProtectedProcedure.query(async () => {
      return getConfigPrecos();
    }),

    /** Salvar configuração de preços (admin) */
    savePrecos: internalAdminProcedure
      .input(z.object({
        valorBase: z.number().min(0),
        itensPreco: z.record(z.string(), z.number()),
      }))
      .mutation(async ({ input, ctx }) => {
        return upsertConfigPrecos({
          valorBase: input.valorBase,
          itensPreco: input.itensPreco,
          updatedBy: ctx.internalUser!.id,
        });
      }),
  }),

  // ─── Orçamentos ──────────────────────────────────────────────────────────
  orcamento: router({
    /** Listar orçamentos do usuário logado */
    list: internalProtectedProcedure.query(async ({ ctx }) => {
      return listOrcamentosByUser(ctx.internalUser!.id);
    }),

    /** Listar TODOS os orçamentos (admin) */
    listAll: internalAdminProcedure
      .input(z.object({ userId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return listAllOrcamentos(input?.userId);
      }),

    /** Buscar um orçamento por ID */
    getById: internalProtectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const orc = await getOrcamentoById(input.id);
        if (!orc) return null;
        const user = ctx.internalUser!;
        // admin vê tudo
        if (user.role === "admin") return orc;
        // usuário vê apenas os seus
        if (orc.criadoPor !== user.id) return null;
        return orc;
      }),

    /** Criar novo orçamento */
    create: internalProtectedProcedure
      .input(z.object({
        clienteNome: z.string().min(1),
        clienteCpf: z.string().optional(),
        clienteTelefone: z.string().optional(),
        clienteEmail: z.string().optional(),
        checklist: z.record(z.string(), z.number()),
        resultado: z.any(),
        valorCalculado: z.number(),
        valorFinal: z.number(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return createOrcamento({
          clienteNome: input.clienteNome,
          clienteCpf: input.clienteCpf ?? null,
          clienteTelefone: input.clienteTelefone ?? null,
          clienteEmail: input.clienteEmail ?? null,
          checklist: input.checklist,
          resultado: input.resultado,
          valorCalculado: String(input.valorCalculado),
          valorFinal: String(input.valorFinal),
          observacoes: input.observacoes ?? null,
          criadoPor: ctx.internalUser!.id,
        });
      }),

    /** Atualizar status */
    updateStatus: internalProtectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pendente", "aprovado", "concluido", "cancelado"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const orc = await getOrcamentoById(input.id);
        if (!orc) throw new TRPCError({ code: "NOT_FOUND", message: "Orçamento não encontrado" });
        const user = ctx.internalUser!;
        if (user.role !== "admin" && orc.criadoPor !== user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão" });
        }
        return updateOrcamentoStatus(input.id, input.status);
      }),

    /** Upload de comprovante */
    uploadComprovante: internalProtectedProcedure
      .input(z.object({
        id: z.number(),
        fileBase64: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const orc = await getOrcamentoById(input.id);
        if (!orc) throw new TRPCError({ code: "NOT_FOUND", message: "Orçamento não encontrado" });
        const user = ctx.internalUser!;
        if (user.role !== "admin" && orc.criadoPor !== user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão" });
        }
        const buffer = Buffer.from(input.fileBase64, "base64");
        const suffix = nanoid(8);
        const fileKey = `comprovantes/${input.id}-${suffix}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        return updateOrcamentoComprovante(input.id, url, fileKey);
      }),

    /** Atualizar observações */
    updateObservacoes: internalProtectedProcedure
      .input(z.object({ id: z.number(), observacoes: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const orc = await getOrcamentoById(input.id);
        if (!orc) throw new TRPCError({ code: "NOT_FOUND", message: "Orçamento não encontrado" });
        const user = ctx.internalUser!;
        if (user.role !== "admin" && orc.criadoPor !== user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão" });
        }
        return updateOrcamentoObservacoes(input.id, input.observacoes);
      }),

    /** Excluir orçamento */
    delete: internalProtectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const orc = await getOrcamentoById(input.id);
        if (!orc) throw new TRPCError({ code: "NOT_FOUND", message: "Orçamento não encontrado" });
        const user = ctx.internalUser!;
        if (user.role !== "admin" && orc.criadoPor !== user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão" });
        }
        return deleteOrcamento(input.id);
      }),
  }),

  // ─── Gerenciamento de usuários (admin) ───────────────────────────────────
  usuario: router({
    /** Listar todos os usuários */
    list: internalAdminProcedure.query(async () => {
      return listInternalUsers();
    }),

    /** Criar novo usuário */
    create: internalAdminProcedure
      .input(z.object({
        nome: z.string().min(2),
        email: z.string().email(),
        senha: z.string().min(6),
        role: z.enum(["user", "admin"]).default("user"),
      }))
      .mutation(async ({ input }) => {
        const existing = await getInternalUserByEmail(input.email);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "E-mail já cadastrado" });
        }
        const passwordHash = await bcrypt.hash(input.senha, 12);
        return createInternalUser({
          nome: input.nome,
          email: input.email,
          passwordHash,
          role: input.role,
        });
      }),

    /** Atualizar usuário */
    update: internalAdminProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().min(2).optional(),
        email: z.string().email().optional(),
        novaSenha: z.string().min(6).optional(),
        role: z.enum(["user", "admin"]).optional(),
        ativo: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, novaSenha, ...rest } = input;
        const updateData: Parameters<typeof updateInternalUser>[1] = { ...rest };
        if (novaSenha) {
          updateData.passwordHash = await bcrypt.hash(novaSenha, 12);
        }
        return updateInternalUser(id, updateData);
      }),

    /** Excluir usuário */
    delete: internalAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteUserSessions(input.id);
        return deleteInternalUser(input.id);
      }),

    /** Resetar senha do usuário */
    resetSenha: internalAdminProcedure
      .input(z.object({ id: z.number(), novaSenha: z.string().min(6) }))
      .mutation(async ({ input }) => {
        const passwordHash = await bcrypt.hash(input.novaSenha, 12);
        await deleteUserSessions(input.id);
        return updateInternalUser(input.id, { passwordHash });
      }),
  }),

});

export type AppRouter = typeof appRouter;
