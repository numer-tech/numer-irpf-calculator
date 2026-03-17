import { useState, useMemo, useCallback, useEffect } from "react";

export interface ClientData {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
}

export interface ChecklistState {
  // Rendimentos
  fontesRendimento: "1" | "2-3" | "4+";
  rendimentosIsentos: boolean;
  rendimentosTributacaoExclusiva: boolean;
  rendimentosRRA: boolean;

  // Bens e Patrimônio
  imoveis: "0" | "1-2" | "3+";
  veiculos: "0" | "1-2" | "3+";
  contasBancarias: "1-2" | "3-5" | "6+";
  criptoativos: boolean;

  // Investimentos e Operações Especiais
  rendaVariavel: boolean;
  dayTrade: boolean;
  ganhoCapital: boolean;
  rendimentosExterior: boolean;

  // Deduções e Dependentes
  dependentes: "0" | "1-2" | "3+";
  despesasMedicas: boolean;
  despesasEducacao: boolean;
  pensaoAlimenticia: boolean;
  doacoesIncentivadas: boolean;

  // Situações Especiais
  atividadeRural: boolean;
  espolio: boolean;
  dividasOnus: boolean;
  alugueisRecebidos: boolean;
}

export type ComplexityLevel = "simples" | "medio" | "complexo" | "muito_complexo";

export interface CalculationResult {
  pontos: number;
  nivel: ComplexityLevel;
  nivelLabel: string;
  valorMinimo: number;
  valorMaximo: number;
  valorSugerido: number;
  fichasIdentificadas: string[];
}

// --- Configuração de Pontuação ---
export interface PontosConfig {
  // Rendimentos
  fontesRendimento_1: number;
  fontesRendimento_2_3: number;
  fontesRendimento_4: number;
  rendimentosIsentos: number;
  rendimentosTributacaoExclusiva: number;
  rendimentosRRA: number;

  // Bens e Patrimônio
  imoveis_1_2: number;
  imoveis_3: number;
  veiculos_1_2: number;
  veiculos_3: number;
  contasBancarias_3_5: number;
  contasBancarias_6: number;
  criptoativos: number;

  // Investimentos
  rendaVariavel: number;
  dayTrade: number;
  ganhoCapital: number;
  rendimentosExterior: number;

  // Deduções
  dependentes_1_2: number;
  dependentes_3: number;
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

export interface FaixaPreco {
  label: string;
  pontosMax: number;
  valorMinimo: number;
  valorMaximo: number;
  valorSugerido: number;
}

export interface PricingConfig {
  pontos: PontosConfig;
  faixas: FaixaPreco[];
}

export const defaultPontosConfig: PontosConfig = {
  fontesRendimento_1: 2,
  fontesRendimento_2_3: 5,
  fontesRendimento_4: 12,
  rendimentosIsentos: 3,
  rendimentosTributacaoExclusiva: 4,
  rendimentosRRA: 8,
  imoveis_1_2: 5,
  imoveis_3: 12,
  veiculos_1_2: 3,
  veiculos_3: 7,
  contasBancarias_3_5: 5,
  contasBancarias_6: 10,
  criptoativos: 15,
  rendaVariavel: 15,
  dayTrade: 20,
  ganhoCapital: 12,
  rendimentosExterior: 18,
  dependentes_1_2: 4,
  dependentes_3: 8,
  despesasMedicas: 4,
  despesasEducacao: 3,
  pensaoAlimenticia: 5,
  doacoesIncentivadas: 3,
  atividadeRural: 15,
  espolio: 20,
  dividasOnus: 4,
  alugueisRecebidos: 8,
};

export const defaultFaixas: FaixaPreco[] = [
  { label: "Simples", pontosMax: 15, valorMinimo: 150, valorMaximo: 250, valorSugerido: 200 },
  { label: "Médio", pontosMax: 35, valorMinimo: 250, valorMaximo: 450, valorSugerido: 350 },
  { label: "Complexo", pontosMax: 60, valorMinimo: 450, valorMaximo: 750, valorSugerido: 600 },
  { label: "Muito Complexo", pontosMax: 90, valorMinimo: 750, valorMaximo: 1200, valorSugerido: 950 },
  { label: "Excepcional", pontosMax: 999, valorMinimo: 1200, valorMaximo: 2000, valorSugerido: 1500 },
];

const STORAGE_KEY = "numer-irpf-pricing-config";

function loadConfig(): PricingConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        pontos: { ...defaultPontosConfig, ...parsed.pontos },
        faixas: parsed.faixas?.length ? parsed.faixas : [...defaultFaixas],
      };
    }
  } catch {}
  return { pontos: { ...defaultPontosConfig }, faixas: [...defaultFaixas] };
}

function saveConfig(config: PricingConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

const initialChecklist: ChecklistState = {
  fontesRendimento: "1",
  rendimentosIsentos: false,
  rendimentosTributacaoExclusiva: false,
  rendimentosRRA: false,
  imoveis: "0",
  veiculos: "0",
  contasBancarias: "1-2",
  criptoativos: false,
  rendaVariavel: false,
  dayTrade: false,
  ganhoCapital: false,
  rendimentosExterior: false,
  dependentes: "0",
  despesasMedicas: false,
  despesasEducacao: false,
  pensaoAlimenticia: false,
  doacoesIncentivadas: false,
  atividadeRural: false,
  espolio: false,
  dividasOnus: false,
  alugueisRecebidos: false,
};

const initialClientData: ClientData = {
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
};

function calcularPontos(checklist: ChecklistState, pontos: PontosConfig): number {
  let total = 0;

  // Rendimentos
  if (checklist.fontesRendimento === "2-3") total += pontos.fontesRendimento_2_3;
  else if (checklist.fontesRendimento === "4+") total += pontos.fontesRendimento_4;
  else total += pontos.fontesRendimento_1;

  if (checklist.rendimentosIsentos) total += pontos.rendimentosIsentos;
  if (checklist.rendimentosTributacaoExclusiva) total += pontos.rendimentosTributacaoExclusiva;
  if (checklist.rendimentosRRA) total += pontos.rendimentosRRA;

  // Bens e Patrimônio
  if (checklist.imoveis === "1-2") total += pontos.imoveis_1_2;
  else if (checklist.imoveis === "3+") total += pontos.imoveis_3;

  if (checklist.veiculos === "1-2") total += pontos.veiculos_1_2;
  else if (checklist.veiculos === "3+") total += pontos.veiculos_3;

  if (checklist.contasBancarias === "3-5") total += pontos.contasBancarias_3_5;
  else if (checklist.contasBancarias === "6+") total += pontos.contasBancarias_6;

  if (checklist.criptoativos) total += pontos.criptoativos;

  // Investimentos e Operações Especiais
  if (checklist.rendaVariavel) total += pontos.rendaVariavel;
  if (checklist.dayTrade) total += pontos.dayTrade;
  if (checklist.ganhoCapital) total += pontos.ganhoCapital;
  if (checklist.rendimentosExterior) total += pontos.rendimentosExterior;

  // Deduções e Dependentes
  if (checklist.dependentes === "1-2") total += pontos.dependentes_1_2;
  else if (checklist.dependentes === "3+") total += pontos.dependentes_3;

  if (checklist.despesasMedicas) total += pontos.despesasMedicas;
  if (checklist.despesasEducacao) total += pontos.despesasEducacao;
  if (checklist.pensaoAlimenticia) total += pontos.pensaoAlimenticia;
  if (checklist.doacoesIncentivadas) total += pontos.doacoesIncentivadas;

  // Situações Especiais
  if (checklist.atividadeRural) total += pontos.atividadeRural;
  if (checklist.espolio) total += pontos.espolio;
  if (checklist.dividasOnus) total += pontos.dividasOnus;
  if (checklist.alugueisRecebidos) total += pontos.alugueisRecebidos;

  return total;
}

function determinarNivelComFaixas(
  pontosTotais: number,
  faixas: FaixaPreco[]
): { nivel: ComplexityLevel; label: string; faixa: FaixaPreco } {
  const niveis: ComplexityLevel[] = ["simples", "medio", "complexo", "muito_complexo", "muito_complexo"];
  for (let i = 0; i < faixas.length; i++) {
    if (pontosTotais <= faixas[i].pontosMax) {
      return {
        nivel: niveis[Math.min(i, niveis.length - 1)],
        label: faixas[i].label,
        faixa: faixas[i],
      };
    }
  }
  const last = faixas[faixas.length - 1];
  return { nivel: "muito_complexo", label: last.label, faixa: last };
}

function identificarFichas(checklist: ChecklistState): string[] {
  const fichas: string[] = ["Identificação do Contribuinte"];

  if (checklist.dependentes !== "0") fichas.push("Dependentes");

  fichas.push("Rendimentos Tributáveis");

  if (checklist.rendimentosIsentos) fichas.push("Rendimentos Isentos e Não Tributáveis");
  if (checklist.rendimentosTributacaoExclusiva) fichas.push("Rendimentos Sujeitos à Tributação Exclusiva");
  if (checklist.rendimentosRRA) fichas.push("Rendimentos Recebidos Acumuladamente (RRA)");

  fichas.push("Imposto Pago/Retido");

  if (checklist.despesasMedicas || checklist.despesasEducacao || checklist.pensaoAlimenticia)
    fichas.push("Pagamentos Efetuados");

  if (checklist.doacoesIncentivadas) fichas.push("Doações Efetuadas");

  if (checklist.imoveis !== "0" || checklist.veiculos !== "0" || checklist.criptoativos)
    fichas.push("Bens e Direitos");

  if (checklist.dividasOnus) fichas.push("Dívidas e Ônus Reais");
  if (checklist.espolio) fichas.push("Espólio");
  if (checklist.atividadeRural) fichas.push("Atividade Rural");
  if (checklist.ganhoCapital) fichas.push("Ganhos de Capital");
  if (checklist.rendaVariavel || checklist.dayTrade) fichas.push("Renda Variável");
  if (checklist.criptoativos) fichas.push("Criptoativos");
  if (checklist.rendimentosExterior) fichas.push("Rendimentos do Exterior");
  if (checklist.alugueisRecebidos) fichas.push("Aluguéis Recebidos (Carnê-Leão)");

  return fichas;
}

export function useIRPFCalculator() {
  const [clientData, setClientData] = useState<ClientData>(initialClientData);
  const [checklist, setChecklist] = useState<ChecklistState>(initialChecklist);
  const [valorAjustado, setValorAjustado] = useState<number | null>(null);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(loadConfig);

  // Persist config changes
  useEffect(() => {
    saveConfig(pricingConfig);
  }, [pricingConfig]);

  const resultado = useMemo<CalculationResult>(() => {
    const pontosTotais = calcularPontos(checklist, pricingConfig.pontos);
    const { nivel, label, faixa } = determinarNivelComFaixas(pontosTotais, pricingConfig.faixas);
    const fichas = identificarFichas(checklist);

    return {
      pontos: pontosTotais,
      nivel,
      nivelLabel: label,
      valorMinimo: faixa.valorMinimo,
      valorMaximo: faixa.valorMaximo,
      valorSugerido: faixa.valorSugerido,
      fichasIdentificadas: fichas,
    };
  }, [checklist, pricingConfig]);

  const valorFinal = valorAjustado ?? resultado.valorSugerido;

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

  const updatePontosConfig = useCallback(<K extends keyof PontosConfig>(
    key: K,
    value: PontosConfig[K]
  ) => {
    setPricingConfig((prev) => ({
      ...prev,
      pontos: { ...prev.pontos, [key]: value },
    }));
    setValorAjustado(null);
  }, []);

  const updateFaixa = useCallback((index: number, faixa: Partial<FaixaPreco>) => {
    setPricingConfig((prev) => {
      const newFaixas = [...prev.faixas];
      newFaixas[index] = { ...newFaixas[index], ...faixa };
      return { ...prev, faixas: newFaixas };
    });
    setValorAjustado(null);
  }, []);

  const resetConfig = useCallback(() => {
    setPricingConfig({
      pontos: { ...defaultPontosConfig },
      faixas: defaultFaixas.map((f) => ({ ...f })),
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
    updatePontosConfig,
    updateFaixa,
    resetConfig,
    resetAll,
  };
}
