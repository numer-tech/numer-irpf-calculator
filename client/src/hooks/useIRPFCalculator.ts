import { useState, useMemo, useCallback, useEffect } from "react";

// ─── Tipos de dados do cliente ───
export interface ClientData {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
}

// ─── Estado do checklist: fichas oficiais do IRPF ───
// Cada campo representa a quantidade de itens/informes em cada ficha oficial
export interface ChecklistState {
  // Ficha 1: Dependentes
  dependentes: number;

  // Ficha 2: Alimentandos
  alimentandos: number;

  // Ficha 3: Rend. Trib. Receb. de Pessoa Jurídica
  rendTribPJ: number;

  // Ficha 4: Rend. Trib. Recebidos de PF/Exterior (Carnê-Leão)
  rendTribPFExterior: number;

  // Ficha 5: Rendimentos Isentos e Não Tributáveis
  rendimentosIsentos: number;

  // Ficha 6: Rendimentos Sujeitos à Tributação Exclusiva/Definitiva
  rendTributacaoExclusiva: number;

  // Ficha 7: Rendimentos Tributáveis de PJ (Imposto com Exigibilidade Suspensa)
  rendExigibilidadeSuspensa: number;

  // Ficha 8: Rendimentos Recebidos Acumuladamente (RRA)
  rendRecebidosAcumuladamente: number;

  // Ficha 9: Imposto Pago/Retido
  impostoPagoRetido: number;

  // Ficha 10: Pagamentos Efetuados (médicos, educação, pensão, etc.)
  pagamentosEfetuados: number;

  // Ficha 11: Doações Efetuadas
  doacoesEfetuadas: number;

  // Ficha 12: Bens e Direitos (imóveis, veículos, contas, aplicações, criptos, etc.)
  bensEDireitos: number;

  // Ficha 13: Dívidas e Ônus Reais
  dividasOnus: number;

  // Ficha 14: Espólio
  espolio: number;

  // Ficha 15: Doações a Partidos Políticos e Candidatos
  doacoesPartidos: number;
}

// ─── Configuração de preço unitário por item ───
export interface ItemPrecoConfig {
  key: keyof ChecklistState;
  label: string;
  labelCompleto: string;
  precoUnitario: number;
  descricaoUnidade: string;
}

export interface PricingConfig {
  valorBase: number;
  itensPreco: ItemPrecoConfig[];
}

export type ComplexityLevel = "simples" | "medio" | "complexo" | "muito_complexo";

export interface LineItem {
  label: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  descricaoUnidade: string;
}

export interface CalculationResult {
  nivel: ComplexityLevel;
  nivelLabel: string;
  valorBase: number;
  valorItens: number;
  valorTotal: number;
  totalItens: number;
  totalFichas: number;
  lineItems: LineItem[];
  fichasIdentificadas: string[];
}

// ─── Configuração padrão de preços unitários (fichas oficiais IRPF) ───
export const defaultItensPreco: ItemPrecoConfig[] = [
  {
    key: "dependentes",
    label: "Dependentes",
    labelCompleto: "Dependentes",
    precoUnitario: 15,
    descricaoUnidade: "por dependente",
  },
  {
    key: "alimentandos",
    label: "Alimentandos",
    labelCompleto: "Alimentandos",
    precoUnitario: 15,
    descricaoUnidade: "por alimentando",
  },
  {
    key: "rendTribPJ",
    label: "Rend. Trib. Receb. de PJ",
    labelCompleto: "Rend. Trib. Receb. de Pessoa Jurídica",
    precoUnitario: 15,
    descricaoUnidade: "por informe",
  },
  {
    key: "rendTribPFExterior",
    label: "Rend. Trib. Receb. de PF/Exterior",
    labelCompleto: "Rend. Trib. Recebidos de PF/Exterior (Carnê-Leão)",
    precoUnitario: 20,
    descricaoUnidade: "por fonte",
  },
  {
    key: "rendimentosIsentos",
    label: "Rendimentos Isentos e Não Tributáveis",
    labelCompleto: "Rendimentos Isentos e Não Tributáveis",
    precoUnitario: 10,
    descricaoUnidade: "por informe",
  },
  {
    key: "rendTributacaoExclusiva",
    label: "Tributação Exclusiva/Definitiva",
    labelCompleto: "Rendimentos Sujeitos à Tributação Exclusiva/Definitiva",
    precoUnitario: 10,
    descricaoUnidade: "por informe",
  },
  {
    key: "rendExigibilidadeSuspensa",
    label: "Rend. Trib. de PJ (Exig. Suspensa)",
    labelCompleto: "Rendimentos Tributáveis de PJ (Imposto com Exigibilidade Suspensa)",
    precoUnitario: 25,
    descricaoUnidade: "por processo",
  },
  {
    key: "rendRecebidosAcumuladamente",
    label: "Rendimentos Recebidos Acumuladamente",
    labelCompleto: "Rendimentos Recebidos Acumuladamente (RRA)",
    precoUnitario: 30,
    descricaoUnidade: "por processo",
  },
  {
    key: "impostoPagoRetido",
    label: "Imposto Pago/Retido",
    labelCompleto: "Imposto Pago/Retido",
    precoUnitario: 10,
    descricaoUnidade: "por fonte",
  },
  {
    key: "pagamentosEfetuados",
    label: "Pagamentos Efetuados",
    labelCompleto: "Pagamentos Efetuados (médicos, educação, pensão, etc.)",
    precoUnitario: 8,
    descricaoUnidade: "por lançamento",
  },
  {
    key: "doacoesEfetuadas",
    label: "Doações Efetuadas",
    labelCompleto: "Doações Efetuadas",
    precoUnitario: 10,
    descricaoUnidade: "por doação",
  },
  {
    key: "bensEDireitos",
    label: "Bens e Direitos",
    labelCompleto: "Bens e Direitos (imóveis, veículos, contas, aplicações, criptos, etc.)",
    precoUnitario: 15,
    descricaoUnidade: "por bem",
  },
  {
    key: "dividasOnus",
    label: "Dívidas e Ônus Reais",
    labelCompleto: "Dívidas e Ônus Reais",
    precoUnitario: 10,
    descricaoUnidade: "por dívida",
  },
  {
    key: "espolio",
    label: "Espólio",
    labelCompleto: "Espólio",
    precoUnitario: 100,
    descricaoUnidade: "por espólio",
  },
  {
    key: "doacoesPartidos",
    label: "Doações a Partidos Políticos",
    labelCompleto: "Doações a Partidos Políticos e Candidatos",
    precoUnitario: 15,
    descricaoUnidade: "por doação",
  },
];

export const DEFAULT_VALOR_BASE = 150;

const STORAGE_KEY = "numer-irpf-pricing-config-v3";

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

const initialChecklist: ChecklistState = {
  dependentes: 0,
  alimentandos: 0,
  rendTribPJ: 1,
  rendTribPFExterior: 0,
  rendimentosIsentos: 0,
  rendTributacaoExclusiva: 0,
  rendExigibilidadeSuspensa: 0,
  rendRecebidosAcumuladamente: 0,
  impostoPagoRetido: 1,
  pagamentosEfetuados: 0,
  doacoesEfetuadas: 0,
  bensEDireitos: 1,
  dividasOnus: 0,
  espolio: 0,
  doacoesPartidos: 0,
};

const initialClientData: ClientData = {
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
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

  useEffect(() => {
    saveConfig(pricingConfig);
  }, [pricingConfig]);

  const resultado = useMemo<CalculationResult>(() => {
    const lineItems: LineItem[] = [];
    let valorItens = 0;
    let totalItens = 0;

    for (const item of pricingConfig.itensPreco) {
      const qtd = checklist[item.key];
      if (qtd > 0) {
        const subtotal = qtd * item.precoUnitario;
        valorItens += subtotal;
        totalItens += qtd;
        lineItems.push({
          label: item.label,
          quantidade: qtd,
          precoUnitario: item.precoUnitario,
          subtotal,
          descricaoUnidade: item.descricaoUnidade,
        });
      }
    }

    const fichas = identificarFichas(checklist);
    const { nivel, label } = determinarNivel(totalItens, fichas.length);
    const valorTotal = pricingConfig.valorBase + valorItens;

    return {
      nivel,
      nivelLabel: label,
      valorBase: pricingConfig.valorBase,
      valorItens,
      valorTotal,
      totalItens,
      totalFichas: fichas.length,
      lineItems,
      fichasIdentificadas: fichas,
    };
  }, [checklist, pricingConfig]);

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
    setValorAjustado(null);
  }, []);

  const resetAll = useCallback(() => {
    setChecklist(initialChecklist);
    setClientData(initialClientData);
    setValorAjustado(null);
  }, []);

  return {
    clientData,
    checklist,
    resultado,
    valorFinal,
    valorAjustado,
    pricingConfig,
    setValorAjustado,
    updateChecklist,
    updateClientData,
    updateItemPreco,
    updateValorBase,
    resetConfig,
    resetAll,
  };
}
