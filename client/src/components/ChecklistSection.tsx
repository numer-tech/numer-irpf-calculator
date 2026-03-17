/*
 * ChecklistSection - Checklist de fichas IRPF com quantidade por item
 * Design: Corporate Dashboard Moderno - preço unitário x quantidade
 * Identidade: Numer Contabilidade (laranja, branco, cinza)
 */

import { Minus, Plus } from "lucide-react";
import {
  Banknote,
  Building2,
  TrendingUp,
  Users,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChecklistState, ItemPrecoConfig } from "@/hooks/useIRPFCalculator";

interface ChecklistSectionProps {
  checklist: ChecklistState;
  onChange: <K extends keyof ChecklistState>(key: K, value: ChecklistState[K]) => void;
  itensPreco: ItemPrecoConfig[];
}

interface SectionVisual {
  icon: React.ReactNode;
  color: string;
}

const sectionVisuals: Record<string, SectionVisual> = {
  "Rendimentos": {
    icon: <Banknote className="w-3.5 h-3.5 text-orange-600" />,
    color: "bg-orange-100",
  },
  "Bens e Patrimônio": {
    icon: <Building2 className="w-3.5 h-3.5 text-amber-600" />,
    color: "bg-amber-100",
  },
  "Investimentos e Operações Especiais": {
    icon: <TrendingUp className="w-3.5 h-3.5 text-orange-700" />,
    color: "bg-orange-100",
  },
  "Deduções e Dependentes": {
    icon: <Users className="w-3.5 h-3.5 text-amber-700" />,
    color: "bg-amber-100",
  },
  "Situações Especiais": {
    icon: <AlertTriangle className="w-3.5 h-3.5 text-red-600" />,
    color: "bg-red-100",
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
  // Agrupar itens por seção
  const sections = itensPreco.reduce<Record<string, ItemPrecoConfig[]>>((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(sections).map(([sectionName, items]) => {
        const visual = sectionVisuals[sectionName] || {
          icon: <Banknote className="w-3.5 h-3.5 text-gray-600" />,
          color: "bg-gray-100",
        };

        // Calcular subtotal da seção
        const sectionSubtotal = items.reduce((sum, item) => {
          const qty = checklist[item.key] as number;
          return sum + qty * item.precoUnitario;
        }, 0);

        return (
          <div
            key={sectionName}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* Section header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-orange-50 to-amber-50/50 border-b border-orange-100/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg ${visual.color} flex items-center justify-center`}>
                    {visual.icon}
                  </div>
                  <h2
                    className="text-sm font-semibold text-gray-800"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    {sectionName}
                  </h2>
                </div>
                {sectionSubtotal > 0 && (
                  <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full">
                    {formatCurrency(sectionSubtotal)}
                  </span>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-50">
              {items.map((item) => {
                const qty = checklist[item.key] as number;
                const subtotal = qty * item.precoUnitario;
                const isActive = qty > 0;

                return (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between px-5 py-3 transition-colors ${
                      isActive ? "bg-orange-50/30" : "hover:bg-gray-50/50"
                    }`}
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p className={`text-sm ${isActive ? "text-gray-800 font-medium" : "text-gray-700"}`}>
                        {item.label}
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

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5">
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
      })}
    </div>
  );
}
