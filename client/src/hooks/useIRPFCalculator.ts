import { useState, useMemo, useCallback } from "react";

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

function calcularPontos(checklist: ChecklistState): number {
  let pontos = 0;

  // Rendimentos
  if (checklist.fontesRendimento === "2-3") pontos += 5;
  else if (checklist.fontesRendimento === "4+") pontos += 12;
  else pontos += 2;

  if (checklist.rendimentosIsentos) pontos += 3;
  if (checklist.rendimentosTributacaoExclusiva) pontos += 4;
  if (checklist.rendimentosRRA) pontos += 8;

  // Bens e Patrimônio
  if (checklist.imoveis === "1-2") pontos += 5;
  else if (checklist.imoveis === "3+") pontos += 12;

  if (checklist.veiculos === "1-2") pontos += 3;
  else if (checklist.veiculos === "3+") pontos += 7;

  if (checklist.contasBancarias === "3-5") pontos += 5;
  else if (checklist.contasBancarias === "6+") pontos += 10;

  if (checklist.criptoativos) pontos += 15;

  // Investimentos e Operações Especiais
  if (checklist.rendaVariavel) pontos += 15;
  if (checklist.dayTrade) pontos += 20;
  if (checklist.ganhoCapital) pontos += 12;
  if (checklist.rendimentosExterior) pontos += 18;

  // Deduções e Dependentes
  if (checklist.dependentes === "1-2") pontos += 4;
  else if (checklist.dependentes === "3+") pontos += 8;

  if (checklist.despesasMedicas) pontos += 4;
  if (checklist.despesasEducacao) pontos += 3;
  if (checklist.pensaoAlimenticia) pontos += 5;
  if (checklist.doacoesIncentivadas) pontos += 3;

  // Situações Especiais
  if (checklist.atividadeRural) pontos += 15;
  if (checklist.espolio) pontos += 20;
  if (checklist.dividasOnus) pontos += 4;
  if (checklist.alugueisRecebidos) pontos += 8;

  return pontos;
}

function determinarNivel(pontos: number): { nivel: ComplexityLevel; label: string } {
  if (pontos <= 15) return { nivel: "simples", label: "Simples" };
  if (pontos <= 35) return { nivel: "medio", label: "Médio" };
  if (pontos <= 60) return { nivel: "complexo", label: "Complexo" };
  return { nivel: "muito_complexo", label: "Muito Complexo" };
}

function calcularValor(pontos: number): { min: number; max: number; sugerido: number } {
  if (pontos <= 15) return { min: 150, max: 250, sugerido: 200 };
  if (pontos <= 35) return { min: 250, max: 450, sugerido: 350 };
  if (pontos <= 60) return { min: 450, max: 750, sugerido: 600 };
  if (pontos <= 90) return { min: 750, max: 1200, sugerido: 950 };
  return { min: 1200, max: 2000, sugerido: 1500 };
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

  const resultado = useMemo<CalculationResult>(() => {
    const pontos = calcularPontos(checklist);
    const { nivel, label } = determinarNivel(pontos);
    const { min, max, sugerido } = calcularValor(pontos);
    const fichas = identificarFichas(checklist);

    return {
      pontos,
      nivel,
      nivelLabel: label,
      valorMinimo: min,
      valorMaximo: max,
      valorSugerido: sugerido,
      fichasIdentificadas: fichas,
    };
  }, [checklist]);

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
    setValorAjustado,
    updateChecklist,
    updateClientData,
    resetAll,
  };
}
