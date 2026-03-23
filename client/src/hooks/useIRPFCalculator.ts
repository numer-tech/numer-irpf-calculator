import { useState, useMemo, useCallback, useEffect } from "react";

// ─── Tipos de dados do cliente (sem e-mail) ───
export interface ClientData {
  nome: string;
  cpf: string;
  telefone: string;
}

// ─── Estado do checklist: fichas oficiais do IRPF ───
export interface ChecklistState {
  dependentes: number;
  alimentandos: number;
  rendTribPJ: number;
  rendTribPFExterior: number;
  rendimentosIsentos: number;
  rendTributacaoExclusiva: number;
  rendExigibilidadeSuspensa: number;
  rendRecebidosAcumuladamente: number;
  impostoPagoRetido: number;
  pagamentosEfetuados: number;
  doacoesEfetuadas: number;
  bensEDireitos: number;
  dividasOnus: number;
  espolio: number;
  doacoesPartidos: number;
}

// ─── Configuração de preço unitário por item ───
export interface ItemPrecoConfig {
  key: keyof ChecklistState;
  label: string;
  labelCompleto: string;
  precoUnitario: number;
  descricaoUnidade: string;
  grupo: string;
}

export interface PricingConfig {
  valorBase: number;
  itensPreco: ItemPrecoConfig[];
}

// ─── Descontos configuráveis ───
export interface DescontoConfig {
  id: string;
  descricao: string;
  tipo: "percentual" | "fixo";
  valor: number; // percentual (0-100) ou valor fixo em R$
}

export interface DescontoAplicado {
  id: string;
  descricao: string;
  tipo: "percentual" | "fixo";
  valor: number;
  valorDesconto: number; // valor calculado do desconto
  ativo: boolean;
}

// ─── Configurações da proposta ───
export interface PropostaConfig {
  formasPagamento: string;
  prazoValidade: string;
  condicoesGerais: string;
  observacoes: string;
}

export type ComplexityLevel = "simples" | "medio" | "complexo" | "muito_complexo";

export interface LineItem {
  label: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  descricaoUnidade: string;
  franquia?: number; // quantas unidades estão incluídas no valor base (sem cobrança extra)
  qtdCobrado?: number; // quantidade efetivamente cobrada (após franquia)
}

export interface CalculationResult {
  nivel: ComplexityLevel;
  nivelLabel: string;
  valorBase: number;
  valorItens: number;
  valorBruto: number;
  totalDescontos: number;
  valorTotal: number;
  totalItens: number;
  totalFichas: number;
  lineItems: LineItem[];
  fichasIdentificadas: string[];
  descontosAplicados: DescontoAplicado[];
}

// ─── Grupos de fichas (ordem de exibição) ───
export const GRUPOS_FICHAS = [
  "Rendimentos Tributáveis",
  "Rendimentos Isentos e Especiais",
  "Imposto e Pagamentos",
  "Dependentes e Alimentandos",
  "Bens, Dívidas e Situações Especiais",
] as const;

export type GrupoFicha = (typeof GRUPOS_FICHAS)[number];

// ─── Configuração padrão de preços unitários (fichas oficiais IRPF) ───
export const defaultItensPreco: ItemPrecoConfig[] = [
  {
    key: "rendTribPJ",
    label: "Rend. Trib. Receb. de PJ",
    labelCompleto: "Rend. Trib. Receb. de Pessoa Jurídica",
    precoUnitario: 15,
    descricaoUnidade: "por informe",
    grupo: "Rendimentos Tributáveis",
  },
  {
    key: "rendTribPFExterior",
    label: "Rend. Trib. Receb. de PF/Exterior",
    labelCompleto: "Rend. Trib. Recebidos de PF/Exterior (Carnê-Leão)",
    precoUnitario: 20,
    descricaoUnidade: "por fonte",
    grupo: "Rendimentos Tributáveis",
  },
  {
    key: "rendExigibilidadeSuspensa",
    label: "Rend. Trib. de PJ (Exig. Suspensa)",
    labelCompleto: "Rendimentos Tributáveis de PJ (Imposto com Exigibilidade Suspensa)",
    precoUnitario: 25,
    descricaoUnidade: "por processo",
    grupo: "Rendimentos Tributáveis",
  },
  {
    key: "rendRecebidosAcumuladamente",
    label: "Rendimentos Recebidos Acumuladamente",
    labelCompleto: "Rendimentos Recebidos Acumuladamente (RRA)",
    precoUnitario: 30,
    descricaoUnidade: "por processo",
    grupo: "Rendimentos Tributáveis",
  },
  {
    key: "rendimentosIsentos",
    label: "Rendimentos Isentos e Não Tributáveis",
    labelCompleto: "Rendimentos Isentos e Não Tributáveis",
    precoUnitario: 10,
    descricaoUnidade: "por informe",
    grupo: "Rendimentos Isentos e Especiais",
  },
  {
    key: "rendTributacaoExclusiva",
    label: "Tributação Exclusiva/Definitiva",
    labelCompleto: "Rendimentos Sujeitos à Tributação Exclusiva/Definitiva",
    precoUnitario: 10,
    descricaoUnidade: "por informe",
    grupo: "Rendimentos Isentos e Especiais",
  },
  {
    key: "impostoPagoRetido",
    label: "Imposto Pago/Retido",
    labelCompleto: "Imposto Pago/Retido",
    precoUnitario: 10,
    descricaoUnidade: "por fonte",
    grupo: "Imposto e Pagamentos",
  },
  {
    key: "pagamentosEfetuados",
    label: "Pagamentos Efetuados",
    labelCompleto: "Pagamentos Efetuados (médicos, educação, pensão, etc.)",
    precoUnitario: 8,
    descricaoUnidade: "por lançamento",
    grupo: "Imposto e Pagamentos",
  },
  {
    key: "doacoesEfetuadas",
    label: "Doações Efetuadas",
    labelCompleto: "Doações Efetuadas",
    precoUnitario: 10,
    descricaoUnidade: "por doação",
    grupo: "Imposto e Pagamentos",
  },
  {
    key: "doacoesPartidos",
    label: "Doações a Partidos Políticos",
    labelCompleto: "Doações a Partidos Políticos e Candidatos",
    precoUnitario: 15,
    descricaoUnidade: "por doação",
    grupo: "Imposto e Pagamentos",
  },
  {
    key: "dependentes",
    label: "Dependentes",
    labelCompleto: "Dependentes",
    precoUnitario: 15,
    descricaoUnidade: "por dependente",
    grupo: "Dependentes e Alimentandos",
  },
  {
    key: "alimentandos",
    label: "Alimentandos",
    labelCompleto: "Alimentandos",
    precoUnitario: 15,
    descricaoUnidade: "por alimentando",
    grupo: "Dependentes e Alimentandos",
  },
  {
    key: "bensEDireitos",
    label: "Bens e Direitos",
    labelCompleto: "Bens e Direitos (imóveis, veículos, contas, aplicações, criptos, etc.)",
    precoUnitario: 15,
    descricaoUnidade: "por bem",
    grupo: "Bens, Dívidas e Situações Especiais",
  },
  {
    key: "dividasOnus",
    label: "Dívidas e Ônus Reais",
    labelCompleto: "Dívidas e Ônus Reais",
    precoUnitario: 10,
    descricaoUnidade: "por dívida",
    grupo: "Bens, Dívidas e Situações Especiais",
  },
  {
    key: "espolio",
    label: "Espólio",
    labelCompleto: "Espólio",
    precoUnitario: 100,
    descricaoUnidade: "por espólio",
    grupo: "Bens, Dívidas e Situações Especiais",
  },
];

export const DEFAULT_VALOR_BASE = 150;

// ─── Descontos padrão ───
export const defaultDescontos: DescontoConfig[] = [
  {
    id: "desc-cliente-recorrente",
    descricao: "Desconto cliente recorrente",
    tipo: "percentual",
    valor: 10,
  },
];

// ─── Configurações padrão da proposta ───
export const defaultPropostaConfig: PropostaConfig = {
  formasPagamento: "PIX, Transferência Bancária ou Boleto",
  prazoValidade: "15 dias",
  condicoesGerais:
    "O valor poderá ser ajustado caso sejam identificadas informações adicionais durante a elaboração da declaração. O prazo de entrega é de até 5 dias úteis após o recebimento de toda a documentação.",
  observacoes: "",
};

const STORAGE_KEY = "numer-irpf-pricing-config-v4";
const DESCONTOS_KEY = "numer-irpf-descontos-v1";
const PROPOSTA_KEY = "numer-irpf-proposta-config-v1";

function loadConfig(): PricingConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const mergedItens = defaultItensPreco.map((def) => {
        const found = parsed.itensPreco?.find((p: ItemPrecoConfig) => p.key === def.key);
        return found ? { ...def, precoUnitario: found.precoUnitario } : { ...def };
      });
      return {
        valorBase: parsed.valorBase ?? DEFAULT_VALOR_BASE,
        itensPreco: mergedItens,
      };
    }
  } catch {}
  return {
    valorBase: DEFAULT_VALOR_BASE,
    itensPreco: defaultItensPreco.map((i) => ({ ...i })),
  };
}

function saveConfig(config: PricingConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

function loadDescontos(): DescontoConfig[] {
  try {
    const stored = localStorage.getItem(DESCONTOS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return defaultDescontos.map((d) => ({ ...d }));
}

function saveDescontos(descontos: DescontoConfig[]) {
  try {
    localStorage.setItem(DESCONTOS_KEY, JSON.stringify(descontos));
  } catch {}
}

function loadPropostaConfig(): PropostaConfig {
  try {
    const stored = localStorage.getItem(PROPOSTA_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { ...defaultPropostaConfig };
}

function savePropostaConfig(config: PropostaConfig) {
  try {
    localStorage.setItem(PROPOSTA_KEY, JSON.stringify(config));
  } catch {}
}

const initialChecklist: ChecklistState = {
  dependentes: 0,
  alimentandos: 0,
  rendTribPJ: 0,
  rendTribPFExterior: 0,
  rendimentosIsentos: 0,
  rendTributacaoExclusiva: 0,
  rendExigibilidadeSuspensa: 0,
  rendRecebidosAcumuladamente: 0,
  impostoPagoRetido: 0,
  pagamentosEfetuados: 0,
  doacoesEfetuadas: 0,
  bensEDireitos: 0,
  dividasOnus: 0,
  espolio: 0,
  doacoesPartidos: 0,
};

const initialClientData: ClientData = {
  nome: "",
  cpf: "",
  telefone: "",
};

function identificarFichas(checklist: ChecklistState): string[] {
  const fichas: string[] = [];
  if (checklist.dependentes > 0) fichas.push("Dependentes");
  if (checklist.alimentandos > 0) fichas.push("Alimentandos");
  if (checklist.rendTribPJ > 0) fichas.push("Rend. Trib. Receb. de Pessoa Jurídica");
  if (checklist.rendTribPFExterior > 0) fichas.push("Rend. Trib. Recebidos de PF/Exterior");
  if (checklist.rendimentosIsentos > 0) fichas.push("Rendimentos Isentos e Não Tributáveis");
  if (checklist.rendTributacaoExclusiva > 0) fichas.push("Rendimentos Sujeitos à Tributação Exclusiva/Definitiva");
  if (checklist.rendExigibilidadeSuspensa > 0) fichas.push("Rendimentos Tributáveis de PJ (Exig. Suspensa)");
  if (checklist.rendRecebidosAcumuladamente > 0) fichas.push("Rendimentos Recebidos Acumuladamente (RRA)");
  if (checklist.impostoPagoRetido > 0) fichas.push("Imposto Pago/Retido");
  if (checklist.pagamentosEfetuados > 0) fichas.push("Pagamentos Efetuados");
  if (checklist.doacoesEfetuadas > 0) fichas.push("Doações Efetuadas");
  if (checklist.bensEDireitos > 0) fichas.push("Bens e Direitos");
  if (checklist.dividasOnus > 0) fichas.push("Dívidas e Ônus Reais");
  if (checklist.espolio > 0) fichas.push("Espólio");
  if (checklist.doacoesPartidos > 0) fichas.push("Doações a Partidos Políticos e Candidatos");
  return fichas;
}

function determinarNivel(totalItens: number, totalFichas: number): { nivel: ComplexityLevel; label: string } {
  const score = totalItens + totalFichas * 2;
  if (score <= 10) return { nivel: "simples", label: "Simples" };
  if (score <= 25) return { nivel: "medio", label: "Médio" };
  if (score <= 50) return { nivel: "complexo", label: "Complexo" };
  return { nivel: "muito_complexo", label: "Muito Complexo" };
}

export function useIRPFCalculator() {
  const [clientData, setClientData] = useState<ClientData>(initialClientData);
  const [checklist, setChecklist] = useState<ChecklistState>(initialChecklist);
  const [valorAjustado, setValorAjustado] = useState<number | null>(null);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(loadConfig);
  const [descontosConfig, setDescontosConfig] = useState<DescontoConfig[]>(loadDescontos);
  const [descontosAtivos, setDescontosAtivos] = useState<Record<string, boolean>>({});
  const [propostaConfig, setPropostaConfig] = useState<PropostaConfig>(loadPropostaConfig);

  useEffect(() => {
    saveConfig(pricingConfig);
  }, [pricingConfig]);

  useEffect(() => {
    saveDescontos(descontosConfig);
  }, [descontosConfig]);

  useEffect(() => {
    savePropostaConfig(propostaConfig);
  }, [propostaConfig]);

  const resultado = useMemo<CalculationResult>(() => {
    const lineItems: LineItem[] = [];
    let valorItens = 0;
    let totalItens = 0;

    for (const item of pricingConfig.itensPreco) {
      const qtd = checklist[item.key];
      if (qtd > 0) {
        // Franquia: rendTribPJ — a 1ª unidade está incluída no valor base, cobra só a partir da 2ª
        const qtdCobrado = item.key === "rendTribPJ" ? Math.max(0, qtd - 1) : qtd;
        const subtotal = qtdCobrado * item.precoUnitario;
        valorItens += subtotal;
        totalItens += qtd;
        lineItems.push({
          label: item.label,
          quantidade: qtd,
          precoUnitario: item.precoUnitario,
          subtotal,
          descricaoUnidade: item.descricaoUnidade,
          franquia: item.key === "rendTribPJ" ? 1 : 0,
          qtdCobrado,
        });
      }
    }

    const fichas = identificarFichas(checklist);
    const { nivel, label } = determinarNivel(totalItens, fichas.length);
    const valorBruto = pricingConfig.valorBase + valorItens;

    // Calcular descontos
    const descontosAplicados: DescontoAplicado[] = [];
    let totalDescontos = 0;

    for (const desc of descontosConfig) {
      const ativo = descontosAtivos[desc.id] ?? false;
      let valorDesconto = 0;
      if (ativo) {
        if (desc.tipo === "percentual") {
          valorDesconto = Math.round((valorBruto * desc.valor) / 100 * 100) / 100;
        } else {
          valorDesconto = desc.valor;
        }
        totalDescontos += valorDesconto;
      }
      descontosAplicados.push({
        ...desc,
        valorDesconto,
        ativo,
      });
    }

    const valorTotal = Math.max(0, valorBruto - totalDescontos);

    return {
      nivel,
      nivelLabel: label,
      valorBase: pricingConfig.valorBase,
      valorItens,
      valorBruto,
      totalDescontos,
      valorTotal,
      totalItens,
      totalFichas: fichas.length,
      lineItems,
      fichasIdentificadas: fichas,
      descontosAplicados,
    };
  }, [checklist, pricingConfig, descontosConfig, descontosAtivos]);

  const valorFinal = valorAjustado ?? resultado.valorTotal;

  const updateChecklist = useCallback(<K extends keyof ChecklistState>(
    key: K,
    value: ChecklistState[K]
  ) => {
    setChecklist((prev) => ({ ...prev, [key]: value }));
    setValorAjustado(null);
  }, []);

  const updateClientData = useCallback(<K extends keyof ClientData>(
    key: K,
    value: ClientData[K]
  ) => {
    setClientData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateItemPreco = useCallback((key: keyof ChecklistState, precoUnitario: number) => {
    setPricingConfig((prev) => ({
      ...prev,
      itensPreco: prev.itensPreco.map((item) =>
        item.key === key ? { ...item, precoUnitario } : item
      ),
    }));
    setValorAjustado(null);
  }, []);

  const updateValorBase = useCallback((valor: number) => {
    setPricingConfig((prev) => ({ ...prev, valorBase: valor }));
    setValorAjustado(null);
  }, []);

  const resetConfig = useCallback(() => {
    setPricingConfig({
      valorBase: DEFAULT_VALOR_BASE,
      itensPreco: defaultItensPreco.map((i) => ({ ...i })),
    });
    setDescontosConfig(defaultDescontos.map((d) => ({ ...d })));
    setPropostaConfig({ ...defaultPropostaConfig });
    setValorAjustado(null);
  }, []);

  const resetAll = useCallback(() => {
    setChecklist(initialChecklist);
    setClientData(initialClientData);
    setValorAjustado(null);
    setDescontosAtivos({});
  }, []);

  // ─── Funções de descontos ───
  const toggleDesconto = useCallback((id: string) => {
    setDescontosAtivos((prev) => ({ ...prev, [id]: !prev[id] }));
    setValorAjustado(null);
  }, []);

  const addDesconto = useCallback(() => {
    const novoDesconto: DescontoConfig = {
      id: `desc_${Date.now()}`,
      descricao: "Novo desconto",
      tipo: "percentual",
      valor: 10,
    };
    setDescontosConfig((prev) => [...prev, novoDesconto]);
  }, []);

  const updateDesconto = useCallback((id: string, updates: Partial<DescontoConfig>) => {
    setDescontosConfig((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
    setValorAjustado(null);
  }, []);

  const removeDesconto = useCallback((id: string) => {
    setDescontosConfig((prev) => prev.filter((d) => d.id !== id));
    setDescontosAtivos((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setValorAjustado(null);
  }, []);

  // ─── Funções de configuração da proposta ───
  const updatePropostaConfig = useCallback(<K extends keyof PropostaConfig>(
    key: K,
    value: PropostaConfig[K]
  ) => {
    setPropostaConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  return {
    clientData,
    checklist,
    resultado,
    valorFinal,
    valorAjustado,
    pricingConfig,
    descontosConfig,
    descontosAtivos,
    propostaConfig,
    setValorAjustado,
    updateChecklist,
    updateClientData,
    updateItemPreco,
    updateValorBase,
    resetConfig,
    resetAll,
    toggleDesconto,
    addDesconto,
    updateDesconto,
    removeDesconto,
    updatePropostaConfig,
  };
}
