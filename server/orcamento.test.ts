import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext, InternalUser } from "./_core/context";

// Mock db functions
vi.mock("./db", () => ({
  createOrcamento: vi.fn().mockResolvedValue({
    id: 1,
    clienteNome: "João Silva",
    clienteCpf: "123.456.789-00",
    clienteTelefone: null,
    clienteEmail: null,
    checklist: { dependentes: 2 },
    resultado: { nivelLabel: "Simples", valorBase: 150, valorItens: 30, valorTotal: 180 },
    valorCalculado: "180.00",
    valorFinal: "180.00",
    status: "pendente",
    comprovanteUrl: null,
    comprovanteKey: null,
    observacoes: null,
    criadoPor: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  listOrcamentosByUser: vi.fn().mockResolvedValue([
    {
      id: 1,
      clienteNome: "João Silva",
      status: "pendente",
      valorFinal: "180.00",
      criadoPor: 2,
      criadorNome: "Maria Silva",
      createdAt: new Date(),
    },
  ]),
  listAllOrcamentos: vi.fn().mockResolvedValue([
    { id: 1, clienteNome: "João Silva", status: "pendente", valorFinal: "180.00", criadoPor: 2, criadorNome: "Maria Silva", createdAt: new Date() },
    { id: 2, clienteNome: "Pedro Santos", status: "concluido", valorFinal: "350.00", criadoPor: 3, criadorNome: "Carlos Lima", createdAt: new Date() },
  ]),
  getOrcamentoById: vi.fn().mockResolvedValue({
    id: 1,
    clienteNome: "João Silva",
    status: "pendente",
    valorFinal: "180.00",
    criadoPor: 2,
  }),
  updateOrcamentoStatus: vi.fn().mockResolvedValue({
    id: 1,
    clienteNome: "João Silva",
    status: "aprovado",
    valorFinal: "180.00",
  }),
  updateOrcamentoComprovante: vi.fn().mockResolvedValue({
    id: 1,
    comprovanteUrl: "https://cdn.example.com/comprovante.png",
    comprovanteKey: "comprovantes/1-abc-comprovante.png",
  }),
  updateOrcamentoObservacoes: vi.fn().mockResolvedValue({
    id: 1,
    observacoes: "Cliente pagou via PIX",
  }),
  deleteOrcamento: vi.fn().mockResolvedValue({ success: true }),
  listInternalUsers: vi.fn().mockResolvedValue([
    { id: 1, nome: "Higor Araujo", email: "higor@numer.com.br", role: "admin", ativo: true },
    { id: 2, nome: "Maria Silva", email: "maria@numer.com.br", role: "user", ativo: true },
  ]),
  createInternalUser: vi.fn().mockResolvedValue({ id: 3, nome: "Novo User", email: "novo@numer.com.br", role: "user", ativo: true }),
  updateInternalUser: vi.fn().mockResolvedValue({ id: 2, nome: "Maria Silva Atualizada" }),
  deleteInternalUser: vi.fn().mockResolvedValue({ success: true }),
  deleteUserSessions: vi.fn().mockResolvedValue(undefined),
  getInternalUserByEmail: vi.fn().mockResolvedValue(null),
  getInternalUserById: vi.fn().mockResolvedValue(null),
  createSession: vi.fn().mockResolvedValue({ token: "tok123", expiresAt: new Date() }),
  getSessionByToken: vi.fn().mockResolvedValue(null),
  deleteSession: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({
    key: "comprovantes/1-abc-comprovante.png",
    url: "https://cdn.example.com/comprovante.png",
  }),
}));

const adminUser: InternalUser = {
  id: 1,
  nome: "Higor Araujo",
  email: "higor@numer.com.br",
  role: "admin",
  ativo: true,
};

const regularUser: InternalUser = {
  id: 2,
  nome: "Maria Silva",
  email: "maria@numer.com.br",
  role: "user",
  ativo: true,
};

function createCtx(internalUser?: InternalUser | null): TrpcContext {
  return {
    user: null,
    internalUser: internalUser ?? null,
    req: {
      protocol: "https",
      headers: {},
      cookies: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("auth.me", () => {
  it("retorna null quando não há sessão", async () => {
    const caller = appRouter.createCaller(createCtx(null));
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

describe("auth.logout", () => {
  it("retorna success ao fazer logout", async () => {
    const caller = appRouter.createCaller(createCtx(null));
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
  });
});

describe("orcamento.create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("cria orçamento quando autenticado como usuário", async () => {
    const caller = appRouter.createCaller(createCtx(regularUser));
    const result = await caller.orcamento.create({
      clienteNome: "João Silva",
      clienteCpf: "123.456.789-00",
      checklist: { dependentes: 2 },
      resultado: { nivelLabel: "Simples", valorBase: 150, valorItens: 30, valorTotal: 180 },
      valorCalculado: 180,
      valorFinal: 180,
    });
    expect(result).toBeDefined();
    expect(result?.clienteNome).toBe("João Silva");
  });

  it("lança UNAUTHORIZED quando não autenticado", async () => {
    const caller = appRouter.createCaller(createCtx(null));
    await expect(
      caller.orcamento.create({
        clienteNome: "Test",
        checklist: {},
        resultado: {},
        valorCalculado: 150,
        valorFinal: 150,
      })
    ).rejects.toThrow();
  });

  it("rejeita clienteNome vazio", async () => {
    const caller = appRouter.createCaller(createCtx(regularUser));
    await expect(
      caller.orcamento.create({
        clienteNome: "",
        checklist: {},
        resultado: {},
        valorCalculado: 0,
        valorFinal: 0,
      })
    ).rejects.toThrow();
  });
});

describe("orcamento.list", () => {
  beforeEach(() => vi.clearAllMocks());

  it("usuário comum lista seus próprios orçamentos", async () => {
    const caller = appRouter.createCaller(createCtx(regularUser));
    const result = await caller.orcamento.list();
    expect(result).toHaveLength(1);
    expect(result[0].clienteNome).toBe("João Silva");
  });

  it("lança erro quando não autenticado", async () => {
    const caller = appRouter.createCaller(createCtx(null));
    await expect(caller.orcamento.list()).rejects.toThrow();
  });
});

describe("orcamento.listAll (admin only)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("admin lista todos os orçamentos", async () => {
    const caller = appRouter.createCaller(createCtx(adminUser));
    const result = await caller.orcamento.listAll();
    expect(result).toHaveLength(2);
  });

  it("usuário comum não pode acessar listAll", async () => {
    const caller = appRouter.createCaller(createCtx(regularUser));
    await expect(caller.orcamento.listAll()).rejects.toThrow();
  });

  it("não autenticado não pode acessar listAll", async () => {
    const caller = appRouter.createCaller(createCtx(null));
    await expect(caller.orcamento.listAll()).rejects.toThrow();
  });
});

describe("orcamento.updateStatus", () => {
  beforeEach(() => vi.clearAllMocks());

  it("usuário pode atualizar status do próprio orçamento", async () => {
    const caller = appRouter.createCaller(createCtx(regularUser));
    const result = await caller.orcamento.updateStatus({ id: 1, status: "aprovado" });
    expect(result?.status).toBe("aprovado");
  });

  it("rejeita status inválido", async () => {
    const caller = appRouter.createCaller(createCtx(regularUser));
    await expect(
      caller.orcamento.updateStatus({ id: 1, status: "invalido" as any })
    ).rejects.toThrow();
  });

  it("lança erro quando não autenticado", async () => {
    const caller = appRouter.createCaller(createCtx(null));
    await expect(
      caller.orcamento.updateStatus({ id: 1, status: "aprovado" })
    ).rejects.toThrow();
  });
});

describe("orcamento.delete", () => {
  beforeEach(() => vi.clearAllMocks());

  it("usuário pode excluir seu próprio orçamento", async () => {
    const caller = appRouter.createCaller(createCtx(regularUser));
    const result = await caller.orcamento.delete({ id: 1 });
    expect(result).toEqual({ success: true });
  });

  it("admin pode excluir qualquer orçamento", async () => {
    const caller = appRouter.createCaller(createCtx(adminUser));
    const result = await caller.orcamento.delete({ id: 1 });
    expect(result).toEqual({ success: true });
  });

  it("lança erro quando não autenticado", async () => {
    const caller = appRouter.createCaller(createCtx(null));
    await expect(caller.orcamento.delete({ id: 1 })).rejects.toThrow();
  });
});

describe("usuario (admin only)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("admin pode listar usuários", async () => {
    const caller = appRouter.createCaller(createCtx(adminUser));
    const result = await caller.usuario.list();
    expect(result).toHaveLength(2);
  });

  it("usuário comum não pode listar usuários", async () => {
    const caller = appRouter.createCaller(createCtx(regularUser));
    await expect(caller.usuario.list()).rejects.toThrow();
  });

  it("admin pode criar usuário", async () => {
    const caller = appRouter.createCaller(createCtx(adminUser));
    const result = await caller.usuario.create({
      nome: "Novo User",
      email: "novo@numer.com.br",
      senha: "senha123",
      role: "user",
    });
    expect(result).toBeDefined();
  });

  it("admin pode excluir usuário", async () => {
    const caller = appRouter.createCaller(createCtx(adminUser));
    const result = await caller.usuario.delete({ id: 2 });
    expect(result).toEqual({ success: true });
  });

  it("usuário comum não pode criar usuários", async () => {
    const caller = appRouter.createCaller(createCtx(regularUser));
    await expect(
      caller.usuario.create({ nome: "Test", email: "test@test.com", senha: "123456", role: "user" })
    ).rejects.toThrow();
  });
});
