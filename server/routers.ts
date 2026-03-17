import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createOrcamento,
  listOrcamentosByUser,
  listAllOrcamentos,
  getOrcamentoById,
  updateOrcamentoStatus,
  updateOrcamentoComprovante,
  updateOrcamentoObservacoes,
  deleteOrcamento,
  listUsers,
} from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  orcamento: router({
    /** Listar orçamentos do usuário logado */
    list: protectedProcedure.query(async ({ ctx }) => {
      return listOrcamentosByUser(ctx.user.id);
    }),

    /** Listar TODOS os orçamentos (somente admin) */
    listAll: adminProcedure
      .input(
        z.object({
          userId: z.number().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        const all = await listAllOrcamentos();
        if (input?.userId) {
          return all.filter((o) => o.criadoPor === input.userId);
        }
        return all;
      }),

    /** Buscar um orçamento por ID (verifica permissão) */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const orc = await getOrcamentoById(input.id);
        if (!orc) return null;
        // Admin pode ver qualquer orçamento, usuário só o seu
        if (ctx.user.role !== "admin" && orc.criadoPor !== ctx.user.id) {
          return null;
        }
        return orc;
      }),

    /** Criar novo orçamento (vinculado ao usuário logado) */
    create: protectedProcedure
      .input(
        z.object({
          clienteNome: z.string().min(1),
          clienteCpf: z.string().optional(),
          clienteTelefone: z.string().optional(),
          clienteEmail: z.string().optional(),
          checklist: z.record(z.string(), z.number()),
          resultado: z.any(),
          valorCalculado: z.number(),
          valorFinal: z.number(),
          observacoes: z.string().optional(),
        })
      )
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
          criadoPor: ctx.user.id,
        });
      }),

    /** Atualizar status do orçamento (verifica permissão) */
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pendente", "aprovado", "concluido", "cancelado"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const orc = await getOrcamentoById(input.id);
        if (!orc) throw new Error("Orçamento não encontrado");
        if (ctx.user.role !== "admin" && orc.criadoPor !== ctx.user.id) {
          throw new Error("Sem permissão");
        }
        return updateOrcamentoStatus(input.id, input.status);
      }),

    /** Upload de comprovante de pagamento (verifica permissão) */
    uploadComprovante: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          fileBase64: z.string(),
          fileName: z.string(),
          mimeType: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const orc = await getOrcamentoById(input.id);
        if (!orc) throw new Error("Orçamento não encontrado");
        if (ctx.user.role !== "admin" && orc.criadoPor !== ctx.user.id) {
          throw new Error("Sem permissão");
        }
        const buffer = Buffer.from(input.fileBase64, "base64");
        const suffix = nanoid(8);
        const fileKey = `comprovantes/${input.id}-${suffix}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        return updateOrcamentoComprovante(input.id, url, fileKey);
      }),

    /** Atualizar observações (verifica permissão) */
    updateObservacoes: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          observacoes: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const orc = await getOrcamentoById(input.id);
        if (!orc) throw new Error("Orçamento não encontrado");
        if (ctx.user.role !== "admin" && orc.criadoPor !== ctx.user.id) {
          throw new Error("Sem permissão");
        }
        return updateOrcamentoObservacoes(input.id, input.observacoes);
      }),

    /** Excluir orçamento (verifica permissão) */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const orc = await getOrcamentoById(input.id);
        if (!orc) throw new Error("Orçamento não encontrado");
        if (ctx.user.role !== "admin" && orc.criadoPor !== ctx.user.id) {
          throw new Error("Sem permissão");
        }
        return deleteOrcamento(input.id);
      }),
  }),

  /** Rotas administrativas */
  admin: router({
    /** Listar todos os usuários */
    listUsers: adminProcedure.query(async () => {
      return listUsers();
    }),
  }),
});

export type AppRouter = typeof appRouter;
