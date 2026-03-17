import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// vi.mock factory cannot reference top-level variables, so define data inline
vi.mock("./db", () => {
  const empresaData = {
    id: 1,
    nome: "Numer Contabilidade",
    cnpj: "12.345.678/0001-00",
    crc: "CRC-SP 123456/O",
    responsavel: "Higor Araujo",
    email: "contato@numer.com.br",
    telefone: "(11) 1234-5678",
    whatsapp: "(11) 91234-5678",
    endereco: "São Paulo - SP",
    site: "www.numer.com.br",
    logoUrl: "https://cdn.example.com/logo.png",
    logoKey: "logos/1-abc.png",
    corPrimaria: "#F97316",
    corSecundaria: "#FB923C",
    corTextoPrimaria: "#FFFFFF",
    configProposta: null,
    configPrecos: null,
    configDescontos: null,
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    getSessionByToken: vi.fn().mockResolvedValue(null),
    deleteSession: vi.fn().mockResolvedValue(undefined),
    createSession: vi.fn(),
    deleteUserSessions: vi.fn(),
    upsertUser: vi.fn(),
    getUserByOpenId: vi.fn(),
    getInternalUserByEmail: vi.fn(),
    getInternalUserById: vi.fn(),
    createInternalUser: vi.fn(),
    listInternalUsers: vi.fn().mockResolvedValue([]),
    listInternalUsersByEmpresa: vi.fn().mockResolvedValue([]),
    updateInternalUser: vi.fn(),
    deleteInternalUser: vi.fn(),
    createEmpresa: vi.fn(),
    getEmpresaById: vi.fn().mockImplementation(async (id: number) => {
      return id === 1 ? empresaData : null;
    }),
    listEmpresas: vi.fn().mockResolvedValue([empresaData]),
    updateEmpresa: vi.fn().mockImplementation(async (id: number, data: any) => {
      if (id !== 1) return null;
      return { ...empresaData, ...data };
    }),
    deleteEmpresa: vi.fn(),
    createOrcamento: vi.fn(),
    listOrcamentosByUser: vi.fn().mockResolvedValue([]),
    listOrcamentosByEmpresa: vi.fn().mockResolvedValue([]),
    listAllOrcamentos: vi.fn().mockResolvedValue([]),
    getOrcamentoById: vi.fn(),
    updateOrcamentoStatus: vi.fn(),
    updateOrcamentoComprovante: vi.fn(),
    updateOrcamentoObservacoes: vi.fn(),
    deleteOrcamento: vi.fn(),
  };
});

function createPublicContext(): TrpcContext {
  return {
    user: null,
    internalUser: null,
    req: {
      protocol: "https",
      headers: { cookie: "" },
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: null,
    internalUser: {
      id: 1,
      nome: "Higor",
      email: "higor@numer.com.br",
      passwordHash: "hashed",
      role: "admin" as const,
      empresaId: 1,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    req: {
      protocol: "https",
      headers: { cookie: "" },
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: null,
    internalUser: {
      id: 2,
      nome: "João",
      email: "joao@numer.com.br",
      passwordHash: "hashed",
      role: "user" as const,
      empresaId: 1,
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    req: {
      protocol: "https",
      headers: { cookie: "" },
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("empresa.branding", () => {
  it("returns branding data for the first active empresa (public, no auth)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.empresa.branding();

    expect(result).not.toBeNull();
    expect(result!.nome).toBe("Numer Contabilidade");
    expect(result!.corPrimaria).toBe("#F97316");
    expect(result!.corSecundaria).toBe("#FB923C");
    expect(result!.corTextoPrimaria).toBe("#FFFFFF");
    expect(result!.logoUrl).toBe("https://cdn.example.com/logo.png");
    expect(result!.responsavel).toBe("Higor Araujo");
  });
});

describe("empresa.update", () => {
  it("allows admin to update their own empresa", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.empresa.update({
      id: 1,
      nome: "Numer Contabilidade Atualizada",
      corPrimaria: "#0066FF",
    });

    expect(result).not.toBeNull();
    expect(result!.nome).toBe("Numer Contabilidade Atualizada");
    expect(result!.corPrimaria).toBe("#0066FF");
  });

  it("rejects non-admin users from updating empresa", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.empresa.update({ id: 1, nome: "Hack" })
    ).rejects.toThrow("Acesso restrito a administradores");
  });
});
