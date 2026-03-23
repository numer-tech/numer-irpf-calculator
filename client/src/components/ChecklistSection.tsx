/*
 * ChecklistSection - Fichas Oficiais do IRPF agrupadas por categoria
 * Cores dinâmicas via CSS variables da empresa (white label)
 */

import { Minus, Plus } from "lucide-react";
import {
  Users,
  Heart,
  Building2,
  Globe,
  Gift,
  TrendingDown,
  Landmark,
  ReceiptText,
  CreditCard,
  HandCoins,
  Home,
  AlertTriangle,
  Scale,
  Vote,
  Banknote,
  BadgeDollarSign,
  FileText,
  PiggyBank,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChecklistState, ItemPrecoConfig, GrupoFicha } from "@/hooks/useIRPFCalculator";
import { GRUPOS_FICHAS } from "@/hooks/useIRPFCalculator";

interface ChecklistSectionProps {
  checklist: ChecklistState;
  onChange: <K extends keyof ChecklistState>(key: K, value: ChecklistState[K]) => void;
  itensPreco: ItemPrecoConfig[];
}

// Ícone e cor para cada ficha oficial - usando cores semânticas (não orange hardcoded)
const fichaVisuals: Record<keyof ChecklistState, { icon: React.ReactNode; color: string; bg: string }> = {
  dependentes: { icon: <Users className="w-4 h-4" />, color: "text-empresa", bg: "bg-empresa-light" },
  alimentandos: { icon: <Heart className="w-4 h-4" />, color: "text-rose-600", bg: "bg-rose-100" },
  rendTribPJ: { icon: <Building2 className="w-4 h-4" />, color: "text-empresa-dark", bg: "bg-empresa-light" },
  rendTribPFExterior: { icon: <Globe className="w-4 h-4" />, color: "text-amber-700", bg: "bg-amber-100" },
  rendimentosIsentos: { icon: <Gift className="w-4 h-4" />, color: "text-green-700", bg: "bg-green-100" },
  rendTributacaoExclusiva: { icon: <TrendingDown className="w-4 h-4" />, color: "text-empresa", bg: "bg-empresa-light" },
  rendExigibilidadeSuspensa: { icon: <Landmark className="w-4 h-4" />, color: "text-amber-600", bg: "bg-amber-100" },
  rendRecebidosAcumuladamente: { icon: <ReceiptText className="w-4 h-4" />, color: "text-empresa-dark", bg: "bg-empresa-light" },
  impostoPagoRetido: { icon: <CreditCard className="w-4 h-4" />, color: "text-gray-700", bg: "bg-gray-100" },
  pagamentosEfetuados: { icon: <HandCoins className="w-4 h-4" />, color: "text-empresa", bg: "bg-empresa-light" },
  doacoesEfetuadas: { icon: <Gift className="w-4 h-4" />, color: "text-amber-600", bg: "bg-amber-100" },
  bensEDireitos: { icon: <Home className="w-4 h-4" />, color: "text-empresa-dark", bg: "bg-empresa-light" },
  dividasOnus: { icon: <AlertTriangle className="w-4 h-4" />, color: "text-red-600", bg: "bg-red-100" },
  espolio: { icon: <Scale className="w-4 h-4" />, color: "text-gray-600", bg: "bg-gray-100" },
  doacoesPartidos: { icon: <Vote className="w-4 h-4" />, color: "text-blue-600", bg: "bg-blue-100" },
};

// Ícone e cor para cada grupo
const grupoVisuals: Record<GrupoFicha, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  "Rendimentos Tributáveis": {
    icon: <Banknote className="w-3.5 h-3.5" />,
    color: "text-empresa-dark",
    bg: "bg-empresa-lighter",
    border: "border-empresa-light",
  },
  "Rendimentos Isentos e Especiais": {
    icon: <BadgeDollarSign className="w-3.5 h-3.5" />,
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  "Imposto e Pagamentos": {
    icon: <PiggyBank className="w-3.5 h-3.5" />,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  "Dependentes e Alimentandos": {
    icon: <Users className="w-3.5 h-3.5" />,
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
  "Bens, Dívidas e Situações Especiais": {
    icon: <FileText className="w-3.5 h-3.5" />,
    color: "text-gray-700",
    bg: "bg-gray-50",
    border: "border-gray-200",
  },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function ChecklistSection({ checklist, onChange, itensPreco }: ChecklistSectionProps) {
  // Agrupar itens por grupo, na ordem definida em GRUPOS_FICHAS
  const itensPorGrupo = GRUPOS_FICHAS.map((grupo) => ({
    grupo,
    itens: itensPreco.filter((item) => item.grupo === grupo),
  })).filter((g) => g.itens.length > 0);

  // Número sequencial global por ficha
  let fichaIndex = 0;

  return (
    <div className="space-y-4">
      {itensPorGrupo.map(({ grupo, itens }) => {
        const visual = grupoVisuals[grupo as GrupoFicha] ?? {
          icon: <FileText className="w-3.5 h-3.5" />,
          color: "text-gray-700",
          bg: "bg-gray-50",
          border: "border-gray-200",
        };

        const grupoSubtotal = itens.reduce((sum, item) => {
          const qtdItem = checklist[item.key] as number;
          const franquiaItem = item.key === "rendTribPJ" ? 1 : 0;
          const qtdCobradoItem = Math.max(0, qtdItem - franquiaItem);
          return sum + qtdCobradoItem * item.precoUnitario;
        }, 0);

        const fichasAtivas = itens.filter((item) => (checklist[item.key] as number) > 0).length;

        return (
          <div
            key={grupo}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* Cabeçalho do grupo */}
            <div className={`px-5 py-3 ${visual.bg} border-b ${visual.border}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg bg-white/70 flex items-center justify-center ${visual.color}`}>
                    {visual.icon}
                  </div>
                  <h2
                    className={`text-sm font-semibold ${visual.color}`}
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    {grupo}
                  </h2>
                  {fichasAtivas > 0 && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white/70 ${visual.color}`}>
                      {fichasAtivas} ativa{fichasAtivas > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {grupoSubtotal > 0 && (
                  <span className="text-xs font-semibold text-empresa bg-empresa-light px-2.5 py-1 rounded-full">
                    {formatCurrency(grupoSubtotal)}
                  </span>
                )}
              </div>
            </div>

            {/* Fichas do grupo */}
            <div className="divide-y divide-gray-50">
              {itens.map((item) => {
                fichaIndex++;
                const currentIndex = fichaIndex;
                const qty = checklist[item.key] as number;
                // Franquia: rendTribPJ — 1ª unidade incluída no valor base
                const franquia = item.key === "rendTribPJ" ? 1 : 0;
                const qtdCobrado = Math.max(0, qty - franquia);
                const subtotal = qtdCobrado * item.precoUnitario;
                const isActive = qty > 0;
                const fv = fichaVisuals[item.key] ?? {
                  icon: <FileText className="w-4 h-4" />,
                  color: "text-gray-600",
                  bg: "bg-gray-100",
                };

                return (
                  <div
                    key={item.key}
                    className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${
                      isActive ? "bg-empresa-lighter" : "hover:bg-gray-50/50"
                    }`}
                  >
                    {/* Número sequencial */}
                    <div className="flex-shrink-0 w-6 text-center">
                      <span className="text-[11px] font-bold text-gray-300">
                        {String(currentIndex).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Ícone */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${fv.bg} flex items-center justify-center ${fv.color}`}>
                      {fv.icon}
                    </div>

                    {/* Nome da ficha e preço */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-tight ${isActive ? "text-gray-800 font-medium" : "text-gray-700"}`}>
                        {item.labelCompleto}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {formatCurrency(item.precoUnitario)} {item.descricaoUnidade}
                        {franquia > 0 && (
                          <span className="ml-1.5 text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
                            1ª incluída
                          </span>
                        )}
                        {isActive && (
                          <span className="text-empresa font-semibold ml-1.5">
                            — {qtdCobrado > 0 ? formatCurrency(subtotal) : <span className="text-green-600">incluído</span>}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Controles de quantidade */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-lg border-gray-200 hover:border-empresa-light hover-empresa disabled:opacity-30"
                        onClick={() => onChange(item.key, Math.max(0, qty - 1) as any)}
                        disabled={qty <= 0}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <div
                        className={`w-10 h-7 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                          isActive ? "bg-empresa text-empresa-on" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {qty}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-lg border-gray-200 hover:border-empresa-light hover-empresa"
                        onClick={() => onChange(item.key, (qty + 1) as any)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
