/*
 * ChecklistSection - Fichas Oficiais do IRPF
 * Lista as 15 fichas oficiais com controles de quantidade e preço unitário
 * Identidade: Numer Contabilidade (laranja, branco, cinza)
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
  FileText,
  Vote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChecklistState, ItemPrecoConfig } from "@/hooks/useIRPFCalculator";

interface ChecklistSectionProps {
  checklist: ChecklistState;
  onChange: <K extends keyof ChecklistState>(key: K, value: ChecklistState[K]) => void;
  itensPreco: ItemPrecoConfig[];
}

// Ícone e cor para cada ficha oficial
const fichaVisuals: Record<keyof ChecklistState, { icon: React.ReactNode; color: string; bg: string }> = {
  dependentes: {
    icon: <Users className="w-4 h-4" />,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
  alimentandos: {
    icon: <Heart className="w-4 h-4" />,
    color: "text-rose-600",
    bg: "bg-rose-100",
  },
  rendTribPJ: {
    icon: <Building2 className="w-4 h-4" />,
    color: "text-orange-700",
    bg: "bg-orange-100",
  },
  rendTribPFExterior: {
    icon: <Globe className="w-4 h-4" />,
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
  rendimentosIsentos: {
    icon: <Gift className="w-4 h-4" />,
    color: "text-green-700",
    bg: "bg-green-100",
  },
  rendTributacaoExclusiva: {
    icon: <TrendingDown className="w-4 h-4" />,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
  rendExigibilidadeSuspensa: {
    icon: <Landmark className="w-4 h-4" />,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  rendRecebidosAcumuladamente: {
    icon: <ReceiptText className="w-4 h-4" />,
    color: "text-orange-700",
    bg: "bg-orange-100",
  },
  impostoPagoRetido: {
    icon: <CreditCard className="w-4 h-4" />,
    color: "text-gray-700",
    bg: "bg-gray-100",
  },
  pagamentosEfetuados: {
    icon: <HandCoins className="w-4 h-4" />,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
  doacoesEfetuadas: {
    icon: <Gift className="w-4 h-4" />,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  bensEDireitos: {
    icon: <Home className="w-4 h-4" />,
    color: "text-orange-700",
    bg: "bg-orange-100",
  },
  dividasOnus: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: "text-red-600",
    bg: "bg-red-100",
  },
  espolio: {
    icon: <Scale className="w-4 h-4" />,
    color: "text-gray-600",
    bg: "bg-gray-100",
  },
  doacoesPartidos: {
    icon: <Vote className="w-4 h-4" />,
    color: "text-blue-600",
    bg: "bg-blue-100",
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
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-orange-50 to-amber-50/50 border-b border-orange-100/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <h2
              className="text-sm font-semibold text-gray-800"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Fichas Oficiais do IRPF 2026
            </h2>
          </div>
          <span className="text-xs text-gray-500">
            {itensPreco.filter((item) => (checklist[item.key] as number) > 0).length} fichas ativas
          </span>
        </div>
      </div>

      {/* Lista de fichas */}
      <div className="divide-y divide-gray-50">
        {itensPreco.map((item, index) => {
          const qty = checklist[item.key] as number;
          const subtotal = qty * item.precoUnitario;
          const isActive = qty > 0;
          const visual = fichaVisuals[item.key] || {
            icon: <FileText className="w-4 h-4" />,
            color: "text-gray-600",
            bg: "bg-gray-100",
          };

          return (
            <div
              key={item.key}
              className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${
                isActive ? "bg-orange-50/40" : "hover:bg-gray-50/50"
              }`}
            >
              {/* Número da ficha */}
              <div className="flex-shrink-0 w-6 text-center">
                <span className="text-[11px] font-bold text-gray-300">{String(index + 1).padStart(2, "0")}</span>
              </div>

              {/* Ícone */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${visual.bg} flex items-center justify-center ${visual.color}`}>
                {visual.icon}
              </div>

              {/* Nome da ficha e preço */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-tight ${isActive ? "text-gray-800 font-medium" : "text-gray-700"}`}>
                  {item.labelCompleto}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {formatCurrency(item.precoUnitario)} {item.descricaoUnidade}
                  {isActive && (
                    <span className="text-orange-600 font-semibold ml-1.5">
                      — {formatCurrency(subtotal)}
                    </span>
                  )}
                </p>
              </div>

              {/* Controles de quantidade */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-lg border-gray-200 hover:border-orange-300 hover:bg-orange-50 disabled:opacity-30"
                  onClick={() => onChange(item.key, Math.max(0, qty - 1) as any)}
                  disabled={qty <= 0}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <div
                  className={`w-10 h-7 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {qty}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-lg border-gray-200 hover:border-orange-300 hover:bg-orange-50"
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
}
