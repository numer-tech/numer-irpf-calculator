import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createOrcamento,
  listOrcamentos,
  getOrcamentoById,
  updateOrcamentoStatus,
  updateOrcamentoComprovante,
  updateOrcamentoObservacoes,
  deleteOrcamento,
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
    /** Listar todos os orçamentos */
    list: protectedProcedure.query(async () => {
      return listOrcamentos();
    }),

    /** Buscar um orçamento por ID */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getOrcamentoById(input.id);
      }),

    /** Criar novo orçamento */
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

    /** Atualizar status do orçamento */
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pendente", "aprovado", "concluido", "cancelado"]),
        })
      )
      .mutation(async ({ input }) => {
        return updateOrcamentoStatus(input.id, input.status);
      }),

    /** Upload de comprovante de pagamento */
    uploadComprovante: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          fileBase64: z.string(),
          fileName: z.string(),
          mimeType: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.fileBase64, "base64");
        const suffix = nanoid(8);
        const fileKey = `comprovantes/${input.id}-${suffix}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        return updateOrcamentoComprovante(input.id, url, fileKey);
      }),

    /** Atualizar observações */
    updateObservacoes: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          observacoes: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return updateOrcamentoObservacoes(input.id, input.observacoes);
      }),

    /** Excluir orçamento */
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteOrcamento(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
