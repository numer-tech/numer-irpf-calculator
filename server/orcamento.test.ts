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
    checklist: { fontesRendimentoTributavel: 2, imoveis: 1 },
    resultado: { nivelLabel: "Simples", valorBase: 150, valorItens: 45, valorTotal: 195, totalItens: 3, totalFichas: 2, fichasIdentificadas: ["Rendimentos", "Bens"], lineItems: [] },
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
  listOrcamentos: vi.fn().mockResolvedValue([
    {
      id: 1,
      clienteNome: "João Silva",
      clienteCpf: "123.456.789-00",
      status: "pendente",
      valorFinal: "200.00",
      valorCalculado: "195.00",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      clienteNome: "Maria Santos",
      clienteCpf: "987.654.321-00",
      status: "concluido",
      valorFinal: "350.00",
      valorCalculado: "350.00",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getOrcamentoById: vi.fn().mockResolvedValue({
    id: 1,
    clienteNome: "João Silva",
    status: "pendente",
    valorFinal: "200.00",
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

function createAuthContext() {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return ctx;
}

describe("orcamento router", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    vi.clearAllMocks();
    const ctx = createAuthContext();
    caller = appRouter.createCaller(ctx);
  });

  it("should create a new orcamento", async () => {
    const result = await caller.orcamento.create({
      clienteNome: "João Silva",
      clienteCpf: "123.456.789-00",
      clienteTelefone: "(11) 99999-0000",
      clienteEmail: "joao@email.com",
      checklist: { fontesRendimentoTributavel: 2, imoveis: 1 },
      resultado: { nivelLabel: "Simples", valorBase: 150, valorItens: 45, valorTotal: 195 },
      valorCalculado: 195,
      valorFinal: 200,
    });

    expect(result).toBeDefined();
    expect(result?.clienteNome).toBe("João Silva");
    expect(result?.status).toBe("pendente");
  });

  it("should list all orcamentos", async () => {
    const result = await caller.orcamento.list();

    expect(result).toHaveLength(2);
    expect(result[0].clienteNome).toBe("João Silva");
    expect(result[1].clienteNome).toBe("Maria Santos");
  });

  it("should get orcamento by id", async () => {
    const result = await caller.orcamento.getById({ id: 1 });

    expect(result).toBeDefined();
    expect(result?.clienteNome).toBe("João Silva");
  });

  it("should update orcamento status", async () => {
    const result = await caller.orcamento.updateStatus({
      id: 1,
      status: "aprovado",
    });

    expect(result).toBeDefined();
    expect(result?.status).toBe("aprovado");
  });

  it("should upload comprovante", async () => {
    const base64Data = Buffer.from("fake-image-data").toString("base64");

    const result = await caller.orcamento.uploadComprovante({
      id: 1,
      fileBase64: base64Data,
      fileName: "comprovante.png",
      mimeType: "image/png",
    });

    expect(result).toBeDefined();
    expect(result?.comprovanteUrl).toContain("comprovante");
  });

  it("should update observacoes", async () => {
    const result = await caller.orcamento.updateObservacoes({
      id: 1,
      observacoes: "Cliente pagou via PIX",
    });

    expect(result).toBeDefined();
    expect(result?.observacoes).toBe("Cliente pagou via PIX");
  });

  it("should delete orcamento", async () => {
    const result = await caller.orcamento.delete({ id: 1 });

    expect(result).toEqual({ success: true });
  });

  it("should reject create with empty clienteNome", async () => {
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

  it("should reject invalid status", async () => {
    await expect(
      caller.orcamento.updateStatus({
        id: 1,
        status: "invalid_status" as any,
      })
    ).rejects.toThrow();
  });
});
