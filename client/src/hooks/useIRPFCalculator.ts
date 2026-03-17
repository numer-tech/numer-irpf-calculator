import { useState, useMemo, useCallback, useEffect } from "react";

// ─── Tipos de dados do cliente ───
export interface ClientData {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
}

// ─── Estado do checklist: quantidade de itens por ficha ───
export interface ChecklistState {
  // Rendimentos
  fontesRendimentoTributavel: number;
  rendimentosIsentos: number;
  rendimentosTributacaoExclusiva: number;
  rendimentosRRA: number;

  // Bens e Patrimônio
  imoveis: number;
  veiculos: number;
  contasBancarias: number;
  aplicacoesFinanceiras: number;
  criptoativos: number;

  // Investimentos e Operações Especiais
  operacoesRendaVariavel: number;
  operacoesDayTrade: number;
  ganhoCapital: number;
  rendimentosExterior: number;

  // Deduções e Dependentes
  dependentes: number;
  despesasMedicas: number;
  despesasEducacao: number;
  pensaoAlimenticia: number;
  doacoesIncentivadas: number;

  // Situações Especiais
  atividadeRural: number;
  espolio: number;
  dividasOnus: number;
  alugueisRecebidos: number;
}

// ─── Configuração de preço unitário por item ───
export interface ItemPrecoConfig {
  key: keyof ChecklistState;
  label: string;
  section: string;
  precoUnitario: number;
  descricaoUnidade: string; // ex: "por fonte", "por imóvel"
}

export interface PricingConfig {
  valorBase: number; // valor mínimo base da declaração
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

// ─── Configuração padrão de preços unitários ───
export const defaultItensPreco: ItemPrecoConfig[] = [
  // Rendimentos
  { key: "fontesRendimentoTributavel", label: "Fontes de rendimento tributável", section: "Rendimentos", precoUnitario: 15, descricaoUnidade: "por fonte" },
  { key: "rendimentosIsentos", label: "Rendimentos isentos / não tributáveis", section: "Rendimentos", precoUnitario: 10, descricaoUnidade: "por informe" },
  { key: "rendimentosTributacaoExclusiva", label: "Tributação exclusiva (13º, PLR, aplicações)", section: "Rendimentos", precoUnitario: 10, descricaoUnidade: "por informe" },
  { key: "rendimentosRRA", label: "Rendimentos recebidos acumuladamente (RRA)", section: "Rendimentos", precoUnitario: 25, descricaoUnidade: "por processo" },

  // Bens e Patrimônio
  { key: "imoveis", label: "Imóveis", section: "Bens e Patrimônio", precoUnitario: 20, descricaoUnidade: "por imóvel" },
  { key: "veiculos", label: "Veículos", section: "Bens e Patrimônio", precoUnitario: 15, descricaoUnidade: "por veículo" },
  { key: "contasBancarias", label: "Contas bancárias", section: "Bens e Patrimônio", precoUnitario: 8, descricaoUnidade: "por conta" },
  { key: "aplicacoesFinanceiras", label: "Aplicações financeiras", section: "Bens e Patrimônio", precoUnitario: 10, descricaoUnidade: "por aplicação" },
  { key: "criptoativos", label: "Criptoativos", section: "Bens e Patrimônio", precoUnitario: 30, descricaoUnidade: "por ativo" },

  // Investimentos e Operações Especiais
  { key: "operacoesRendaVariavel", label: "Operações em renda variável (ações, FIIs)", section: "Investimentos e Operações Especiais", precoUnitario: 25, descricaoUnidade: "por mês operado" },
  { key: "operacoesDayTrade", label: "Operações day trade", section: "Investimentos e Operações Especiais", precoUnitario: 35, descricaoUnidade: "por mês operado" },
  { key: "ganhoCapital", label: "Ganho de capital (venda de bens)", section: "Investimentos e Operações Especiais", precoUnitario: 40, descricaoUnidade: "por operação" },
  { key: "rendimentosExterior", label: "Rendimentos do exterior", section: "Investimentos e Operações Especiais", precoUnitario: 50, descricaoUnidade: "por fonte" },

  // Deduções e Dependentes
  { key: "dependentes", label: "Dependentes", section: "Deduções e Dependentes", precoUnitario: 10, descricaoUnidade: "por dependente" },
  { key: "despesasMedicas", label: "Despesas médicas", section: "Deduções e Dependentes", precoUnitario: 5, descricaoUnidade: "por despesa" },
  { key: "despesasEducacao", label: "Despesas com educação", section: "Deduções e Dependentes", precoUnitario: 5, descricaoUnidade: "por despesa" },
  { key: "pensaoAlimenticia", label: "Pensão alimentícia", section: "Deduções e Dependentes", precoUnitario: 15, descricaoUnidade: "por beneficiário" },
  { key: "doacoesIncentivadas", label: "Doações incentivadas (ECA, idoso, cultura)", section: "Deduções e Dependentes", precoUnitario: 10, descricaoUnidade: "por doação" },

  // Situações Especiais
  { key: "atividadeRural", label: "Atividade rural", section: "Situações Especiais", precoUnitario: 80, descricaoUnidade: "por atividade" },
  { key: "espolio", label: "Espólio / herança", section: "Situações Especiais", precoUnitario: 100, descricaoUnidade: "por espólio" },
  { key: "dividasOnus", label: "Dívidas e ônus reais", section: "Situações Especiais", precoUnitario: 10, descricaoUnidade: "por dívida" },
  { key: "alugueisRecebidos", label: "Aluguéis recebidos", section: "Situações Especiais", precoUnitario: 15, descricaoUnidade: "por imóvel" },
];

export const DEFAULT_VALOR_BASE = 150;

const STORAGE_KEY = "numer-irpf-pricing-config-v2";

function loadConfig(): PricingConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge com defaults para garantir que novos itens sejam incluídos
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
  fontesRendimentoTributavel: 1,
  rendimentosIsentos: 0,
  rendimentosTributacaoExclusiva: 0,
  rendimentosRRA: 0,
  imoveis: 0,
  veiculos: 0,
  contasBancarias: 1,
  aplicacoesFinanceiras: 0,
  criptoativos: 0,
  operacoesRendaVariavel: 0,
  operacoesDayTrade: 0,
  ganhoCapital: 0,
  rendimentosExterior: 0,
  dependentes: 0,
  despesasMedicas: 0,
  despesasEducacao: 0,
  pensaoAlimenticia: 0,
  doacoesIncentivadas: 0,
  atividadeRural: 0,
  espolio: 0,
  dividasOnus: 0,
  alugueisRecebidos: 0,
};

const initialClientData: ClientData = {
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
};

function identificarFichas(checklist: ChecklistState): string[] {
  const fichas: string[] = ["Identificação do Contribuinte"];

  if (checklist.dependentes > 0) fichas.push("Dependentes");
  if (checklist.fontesRendimentoTributavel > 0) fichas.push("Rendimentos Tributáveis");
  if (checklist.rendimentosIsentos > 0) fichas.push("Rendimentos Isentos e Não Tributáveis");
  if (checklist.rendimentosTributacaoExclusiva > 0) fichas.push("Rendimentos Sujeitos à Tributação Exclusiva");
  if (checklist.rendimentosRRA > 0) fichas.push("Rendimentos Recebidos Acumuladamente (RRA)");

  fichas.push("Imposto Pago/Retido");

  if (checklist.despesasMedicas > 0 || checklist.despesasEducacao > 0 || checklist.pensaoAlimenticia > 0)
    fichas.push("Pagamentos Efetuados");
  if (checklist.doacoesIncentivadas > 0) fichas.push("Doações Efetuadas");
  if (checklist.imoveis > 0 || checklist.veiculos > 0 || checklist.contasBancarias > 0 || checklist.aplicacoesFinanceiras > 0 || checklist.criptoativos > 0)
    fichas.push("Bens e Direitos");
  if (checklist.dividasOnus > 0) fichas.push("Dívidas e Ônus Reais");
  if (checklist.espolio > 0) fichas.push("Espólio");
  if (checklist.atividadeRural > 0) fichas.push("Atividade Rural");
  if (checklist.ganhoCapital > 0) fichas.push("Ganhos de Capital");
  if (checklist.operacoesRendaVariavel > 0 || checklist.operacoesDayTrade > 0) fichas.push("Renda Variável");
  if (checklist.criptoativos > 0) fichas.push("Criptoativos");
  if (checklist.rendimentosExterior > 0) fichas.push("Rendimentos do Exterior");
  if (checklist.alugueisRecebidos > 0) fichas.push("Aluguéis Recebidos (Carnê-Leão)");

  return fichas;
}

function determinarNivel(totalItens: number, totalFichas: number): { nivel: ComplexityLevel; label: string } {
  // Complexidade baseada na quantidade total de itens e fichas
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
