import { TRPCError } from "@trpc/server";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import bcrypt from "bcryptjs";
import {
  createOrcamento,
  listOrcamentosByUser,
  listOrcamentosByEmpresa,
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
  listInternalUsersByEmpresa,
  updateInternalUser,
  deleteInternalUser,
  createSession,
  getSessionByToken,
  deleteSession,
  deleteUserSessions,
  createEmpresa,
  getEmpresaById,
  listEmpresas,
  updateEmpresa,
  deleteEmpresa,
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
  // Support pre-injected internalUser (e.g. in tests)
  if (ctx.internalUser && ctx.internalUser.ativo) {
    return next({ ctx });
  }
  const session = await getInternalSession(ctx.req);
  if (!session || !session.user.ativo) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Não autenticado" });
  }
  return next({ ctx: { ...ctx, internalUser: session.user } });
});

/** Procedure de admin interno (admin da empresa OU superadmin) */
const internalAdminProcedure = internalProtectedProcedure.use(async ({ ctx, next }) => {
  const role = ctx.internalUser!.role;
  if (role !== "admin" && role !== "superadmin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
  }
  return next({ ctx });
});

/** Procedure de superadmin (apenas Higor / dono do sistema) */
const superAdminProcedure = internalProtectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.internalUser!.role !== "superadmin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito ao super administrador" });
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
        const { token, expiresAt } = await createSession(user.id);
        ctx.res.cookie(SESSION_COOKIE, token, COOKIE_OPTIONS);

        // Buscar empresa do usuário
        let empresa = null;
        if (user.empresaId) {
          empresa = await getEmpresaById(user.empresaId);
        }

        return {
          id: user.id,
          nome: user.nome,
          email: user.email,
          role: user.role,
          empresaId: user.empresaId,
          empresa: empresa ? {
            id: empresa.id,
            nome: empresa.nome,
            logoUrl: empresa.logoUrl,
            corPrimaria: empresa.corPrimaria,
            corSecundaria: empresa.corSecundaria,
            corTextoPrimaria: empresa.corTextoPrimaria,
            responsavel: empresa.responsavel,
            telefone: empresa.telefone,
            whatsapp: empresa.whatsapp,
            email: empresa.email,
            cnpj: empresa.cnpj,
            crc: empresa.crc,
            endereco: empresa.endereco,
            site: empresa.site,
            configProposta: empresa.configProposta,
            configPrecos: empresa.configPrecos,
            configDescontos: empresa.configDescontos,
          } : null,
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

    /** Retorna o usuário logado com dados da empresa */
    me: publicProcedure.query(async ({ ctx }) => {
      const session = await getInternalSession(ctx.req);
      if (!session || !session.user.ativo) return null;

      let empresa = null;
      if (session.user.empresaId) {
        empresa = await getEmpresaById(session.user.empresaId);
      }

      return {
        id: session.user.id,
        nome: session.user.nome,
        email: session.user.email,
        role: session.user.role,
        empresaId: session.user.empresaId,
        empresa: empresa ? {
          id: empresa.id,
          nome: empresa.nome,
          logoUrl: empresa.logoUrl,
          corPrimaria: empresa.corPrimaria,
          corSecundaria: empresa.corSecundaria,
          corTextoPrimaria: empresa.corTextoPrimaria,
          responsavel: empresa.responsavel,
          telefone: empresa.telefone,
          whatsapp: empresa.whatsapp,
          email: empresa.email,
          cnpj: empresa.cnpj,
          crc: empresa.crc,
          endereco: empresa.endereco,
          site: empresa.site,
          configProposta: empresa.configProposta,
          configPrecos: empresa.configPrecos,
          configDescontos: empresa.configDescontos,
        } : null,
      };
    }),
  }),

  // ─── Empresas / Tenants ─────────────────────────────────────────────────
  empresa: router({
    /** Listar todas as empresas (superadmin) */
    list: superAdminProcedure.query(async () => {
      return listEmpresas();
    }),

    /** Buscar empresa por ID */
    getById: internalProtectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const user = ctx.internalUser!;
        // Apenas superadmin ou admin da própria empresa
        if (user.role !== "superadmin" && user.empresaId !== input.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão" });
        }
        return getEmpresaById(input.id);
      }),

    /** Criar nova empresa (superadmin) */
    create: superAdminProcedure
      .input(z.object({
        nome: z.string().min(2),
        cnpj: z.string().optional(),
        crc: z.string().optional(),
        responsavel: z.string().optional(),
        email: z.string().email().optional(),
        telefone: z.string().optional(),
        whatsapp: z.string().optional(),
        endereco: z.string().optional(),
        site: z.string().optional(),
        corPrimaria: z.string().optional(),
        corSecundaria: z.string().optional(),
        corTextoPrimaria: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return createEmpresa(input);
      }),

    /** Atualizar empresa (superadmin ou admin da empresa) */
    update: internalAdminProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().min(2).optional(),
        cnpj: z.string().nullable().optional(),
        crc: z.string().nullable().optional(),
        responsavel: z.string().nullable().optional(),
        email: z.string().nullable().optional(),
        telefone: z.string().nullable().optional(),
        whatsapp: z.string().nullable().optional(),
        endereco: z.string().nullable().optional(),
        site: z.string().nullable().optional(),
        corPrimaria: z.string().optional(),
        corSecundaria: z.string().optional(),
        corTextoPrimaria: z.string().optional(),
        configProposta: z.any().optional(),
        configPrecos: z.any().optional(),
        configDescontos: z.any().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = ctx.internalUser!;
        if (user.role !== "superadmin" && user.empresaId !== input.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão" });
        }
        const { id, ...data } = input;
        return updateEmpresa(id, data);
      }),

    /** Upload de logo da empresa */
    uploadLogo: internalAdminProcedure
      .input(z.object({
        id: z.number(),
        fileBase64: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = ctx.internalUser!;
        if (user.role !== "superadmin" && user.empresaId !== input.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão" });
        }
        const buffer = Buffer.from(input.fileBase64, "base64");
        const suffix = nanoid(8);
        const fileKey = `logos/${input.id}-${suffix}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        return updateEmpresa(input.id, { logoUrl: url, logoKey: fileKey });
      }),

    /** Branding público - retorna dados visuais da primeira empresa ativa (para login) */
    branding: publicProcedure.query(async () => {
      const empresasList = await listEmpresas();
      const ativa = empresasList.find((e: any) => e.ativo);
      if (!ativa) return null;
      return {
        nome: ativa.nome,
        logoUrl: ativa.logoUrl,
        corPrimaria: ativa.corPrimaria,
        corSecundaria: ativa.corSecundaria,
        corTextoPrimaria: ativa.corTextoPrimaria,
        responsavel: ativa.responsavel,
      };
    }),

    /** Desativar empresa (superadmin) */
    delete: superAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteEmpresa(input.id);
      }),
  }),

  // ─── Orçamentos ──────────────────────────────────────────────────────────
  orcamento: router({
    /** Listar orçamentos do usuário logado */
    list: internalProtectedProcedure.query(async ({ ctx }) => {
      return listOrcamentosByUser(ctx.internalUser!.id);
    }),

    /** Listar orçamentos da empresa (admin da empresa) */
    listByEmpresa: internalAdminProcedure
      .input(z.object({ userId: z.number().optional() }).optional())
      .query(async ({ input, ctx }) => {
        const user = ctx.internalUser!;
        if (user.role === "superadmin") {
          return listAllOrcamentos(input?.userId);
        }
        if (user.empresaId) {
          return listOrcamentosByEmpresa(user.empresaId, input?.userId);
        }
        return listOrcamentosByUser(user.id);
      }),

    /** Listar TODOS os orçamentos (somente superadmin) */
    listAll: superAdminProcedure
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
        // superadmin vê tudo
        if (user.role === "superadmin") return orc;
        // admin da empresa vê orçamentos da empresa
        if (user.role === "admin" && user.empresaId && orc.empresaId === user.empresaId) return orc;
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
          empresaId: ctx.internalUser!.empresaId ?? null,
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
        if (user.role !== "superadmin" && user.role !== "admin" && orc.criadoPor !== user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão" });
        }
        if (user.role === "admin" && user.empresaId && orc.empresaId !== user.empresaId) {
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
        if (user.role !== "superadmin" && user.role !== "admin" && orc.criadoPor !== user.id) {
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
        if (user.role !== "superadmin" && user.role !== "admin" && orc.criadoPor !== user.id) {
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
        if (user.role !== "superadmin" && user.role !== "admin" && orc.criadoPor !== user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissão" });
        }
        return deleteOrcamento(input.id);
      }),
  }),

  // ─── Gerenciamento de usuários (admin da empresa ou superadmin) ─────────
  usuario: router({
    /** Listar usuários (admin vê da empresa, superadmin vê todos) */
    list: internalAdminProcedure.query(async ({ ctx }) => {
      const user = ctx.internalUser!;
      if (user.role === "superadmin") {
        return listInternalUsers();
      }
      if (user.empresaId) {
        return listInternalUsersByEmpresa(user.empresaId);
      }
      return [];
    }),

    /** Criar novo usuário */
    create: internalAdminProcedure
      .input(z.object({
        nome: z.string().min(2),
        email: z.string().email(),
        senha: z.string().min(6),
        role: z.enum(["user", "admin"]).default("user"),
        empresaId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const existing = await getInternalUserByEmail(input.email);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "E-mail já cadastrado" });
        }
        const user = ctx.internalUser!;
        const passwordHash = await bcrypt.hash(input.senha, 12);

        // Admin da empresa só pode criar usuários na sua empresa
        let empresaId = input.empresaId ?? null;
        if (user.role === "admin" && user.empresaId) {
          empresaId = user.empresaId;
        }

        return createInternalUser({
          nome: input.nome,
          email: input.email,
          passwordHash,
          role: input.role,
          empresaId,
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
        empresaId: z.number().nullable().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, novaSenha, empresaId, ...rest } = input;
        const updateData: Parameters<typeof updateInternalUser>[1] = { ...rest };
        if (novaSenha) {
          updateData.passwordHash = await bcrypt.hash(novaSenha, 12);
        }
        // Superadmin pode mudar empresaId
        if (ctx.internalUser!.role === "superadmin" && empresaId !== undefined) {
          updateData.empresaId = empresaId;
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
