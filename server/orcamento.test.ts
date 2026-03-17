import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db functions
vi.mock("./db", () => ({
  createOrcamento: vi.fn().mockResolvedValue({
    id: 1,
    clienteNome: "João Silva",
    clienteCpf: "123.456.789-00",
    clienteTelefone: "(11) 99999-0000",
    clienteEmail: "joao@email.com",
    checklist: { dependentes: 2, bensEDireitos: 1 },
    resultado: {
      nivelLabel: "Simples",
      valorBase: 150,
      valorItens: 45,
      valorTotal: 195,
      totalItens: 3,
      totalFichas: 2,
      fichasIdentificadas: ["Dependentes", "Bens e Direitos"],
      lineItems: [],
    },
    valorCalculado: "195.00",
    valorFinal: "200.00",
    status: "pendente",
    comprovanteUrl: null,
    comprovanteKey: null,
    observacoes: null,
    criadoPor: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  listOrcamentosByUser: vi.fn().mockResolvedValue([
    {
      id: 1,
      clienteNome: "João Silva",
      clienteCpf: "123.456.789-00",
      status: "pendente",
      valorFinal: "200.00",
      valorCalculado: "195.00",
      criadoPor: 1,
      criadorNome: "Test User",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  listAllOrcamentos: vi.fn().mockResolvedValue([
    {
      id: 1,
      clienteNome: "João Silva",
      status: "pendente",
      valorFinal: "200.00",
      valorCalculado: "195.00",
      criadoPor: 1,
      criadorNome: "Test User",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      clienteNome: "Maria Santos",
      status: "concluido",
      valorFinal: "350.00",
      valorCalculado: "350.00",
      criadoPor: 2,
      criadorNome: "Other User",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  listOrcamentos: vi.fn().mockResolvedValue([]),
  getOrcamentoById: vi.fn().mockResolvedValue({
    id: 1,
    clienteNome: "João Silva",
    status: "pendente",
    valorFinal: "200.00",
    criadoPor: 1,
  }),
  updateOrcamentoStatus: vi.fn().mockResolvedValue({
    id: 1,
    clienteNome: "João Silva",
    status: "aprovado",
    valorFinal: "200.00",
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
  listUsers: vi.fn().mockResolvedValue([
    { id: 1, name: "Test User", email: "test@example.com", role: "user", createdAt: new Date() },
    { id: 99, name: "Admin User", email: "admin@example.com", role: "admin", createdAt: new Date() },
  ]),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({
    key: "comprovantes/1-abc-comprovante.png",
    url: "https://cdn.example.com/comprovante.png",
  }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(overrides?: Partial<AuthenticatedUser>): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-1",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return createContext({
    id: 99,
    openId: "admin-user",
    name: "Admin User",
    role: "admin",
  });
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("orcamento router - CRUD operations", () => {
  let adminCaller: ReturnType<typeof appRouter.createCaller>;
  let userCaller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    vi.clearAllMocks();
    adminCaller = appRouter.createCaller(createAdminContext());
    userCaller = appRouter.createCaller(createContext());
  });

  it("should create a new orcamento", async () => {
    const result = await userCaller.orcamento.create({
      clienteNome: "João Silva",
      clienteCpf: "123.456.789-00",
      clienteTelefone: "(11) 99999-0000",
      clienteEmail: "joao@email.com",
      checklist: { dependentes: 2, bensEDireitos: 1 },
      resultado: { nivelLabel: "Simples", valorBase: 150, valorItens: 45, valorTotal: 195 },
      valorCalculado: 195,
      valorFinal: 200,
    });

    expect(result).toBeDefined();
    expect(result?.clienteNome).toBe("João Silva");
    expect(result?.status).toBe("pendente");
  });

  it("user should list own orcamentos", async () => {
    const result = await userCaller.orcamento.list();
    expect(result).toHaveLength(1);
    expect(result[0].clienteNome).toBe("João Silva");
  });

  it("should get orcamento by id", async () => {
    const result = await userCaller.orcamento.getById({ id: 1 });
    expect(result).toBeDefined();
    expect(result?.clienteNome).toBe("João Silva");
  });

  it("should update orcamento status", async () => {
    const result = await userCaller.orcamento.updateStatus({
      id: 1,
      status: "aprovado",
    });
    expect(result).toBeDefined();
    expect(result?.status).toBe("aprovado");
  });

  it("should upload comprovante", async () => {
    const base64Data = Buffer.from("fake-image-data").toString("base64");
    const result = await userCaller.orcamento.uploadComprovante({
      id: 1,
      fileBase64: base64Data,
      fileName: "comprovante.png",
      mimeType: "image/png",
    });
    expect(result).toBeDefined();
    expect(result?.comprovanteUrl).toContain("comprovante");
  });

  it("should update observacoes", async () => {
    const result = await userCaller.orcamento.updateObservacoes({
      id: 1,
      observacoes: "Cliente pagou via PIX",
    });
    expect(result).toBeDefined();
    expect(result?.observacoes).toBe("Cliente pagou via PIX");
  });

  it("should delete orcamento", async () => {
    const result = await userCaller.orcamento.delete({ id: 1 });
    expect(result).toEqual({ success: true });
  });

  it("should reject create with empty clienteNome", async () => {
    await expect(
      userCaller.orcamento.create({
        clienteNome: "",
        checklist: {},
        resultado: {},
        valorCalculado: 0,
        valorFinal: 0,
      })
    ).rejects.toThrow();
  });

  it("should reject invalid status", async () => {
    await expect(
      userCaller.orcamento.updateStatus({
        id: 1,
        status: "invalid_status" as any,
      })
    ).rejects.toThrow();
  });
});

describe("orcamento router - access control", () => {
  it("orcamento.list requires authentication", async () => {
    const caller = appRouter.createCaller(createUnauthContext());
    await expect(caller.orcamento.list()).rejects.toThrow();
  });

  it("orcamento.create requires authentication", async () => {
    const caller = appRouter.createCaller(createUnauthContext());
    await expect(
      caller.orcamento.create({
        clienteNome: "Test",
        checklist: { dependentes: 1 },
        resultado: {},
        valorCalculado: 150,
        valorFinal: 150,
      })
    ).rejects.toThrow();
  });

  it("orcamento.listAll requires admin role", async () => {
    const userCaller = appRouter.createCaller(createContext());
    await expect(userCaller.orcamento.listAll()).rejects.toThrow();
  });

  it("admin.listUsers requires admin role", async () => {
    const userCaller = appRouter.createCaller(createContext());
    await expect(userCaller.admin.listUsers()).rejects.toThrow();
  });

  it("admin can access listAll", async () => {
    const adminCaller = appRouter.createCaller(createAdminContext());
    const result = await adminCaller.orcamento.listAll();
    expect(result).toHaveLength(2);
  });

  it("admin can filter listAll by userId", async () => {
    const adminCaller = appRouter.createCaller(createAdminContext());
    const result = await adminCaller.orcamento.listAll({ userId: 1 });
    expect(result).toHaveLength(1);
    expect(result[0].criadoPor).toBe(1);
  });

  it("admin can list users", async () => {
    const adminCaller = appRouter.createCaller(createAdminContext());
    const result = await adminCaller.admin.listUsers();
    expect(result).toHaveLength(2);
  });

  it("orcamento.delete requires authentication", async () => {
    const caller = appRouter.createCaller(createUnauthContext());
    await expect(caller.orcamento.delete({ id: 1 })).rejects.toThrow();
  });

  it("orcamento.updateStatus requires authentication", async () => {
    const caller = appRouter.createCaller(createUnauthContext());
    await expect(
      caller.orcamento.updateStatus({ id: 1, status: "aprovado" })
    ).rejects.toThrow();
  });
});
