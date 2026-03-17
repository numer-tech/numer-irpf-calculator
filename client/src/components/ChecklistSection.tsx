/*
 * ChecklistSection - Seções do checklist IRPF
 * Design: Cards com switches/selects, feedback visual imediato
 */

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ChecklistState } from "@/hooks/useIRPFCalculator";
import {
  Banknote,
  Building2,
  Car,
  CreditCard,
  Bitcoin,
  TrendingUp,
  Zap,
  Globe,
  Users,
  Heart,
  GraduationCap,
  Scale,
  Gift,
  Tractor,
  ScrollText,
  Landmark,
  Home,
  BarChart3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ChecklistSectionProps {
  checklist: ChecklistState;
  onChange: <K extends keyof ChecklistState>(key: K, value: ChecklistState[K]) => void;
}

interface SectionConfig {
  title: string;
  icon: LucideIcon;
  items: ItemConfig[];
}

interface ItemConfig {
  type: "switch" | "select";
  key: keyof ChecklistState;
  label: string;
  icon: LucideIcon;
  options?: { value: string; label: string }[];
  pontos?: string;
}

const sections: SectionConfig[] = [
  {
    title: "Rendimentos",
    icon: Banknote,
    items: [
      {
        type: "select",
        key: "fontesRendimento",
        label: "Fontes de rendimento tributável",
        icon: Banknote,
        options: [
          { value: "1", label: "1 fonte" },
          { value: "2-3", label: "2 a 3 fontes" },
          { value: "4+", label: "4 ou mais fontes" },
        ],
      },
      {
        type: "switch",
        key: "rendimentosIsentos",
        label: "Rendimentos isentos / não tributáveis",
        icon: Banknote,
        pontos: "+3 pts",
      },
      {
        type: "switch",
        key: "rendimentosTributacaoExclusiva",
        label: "Tributação exclusiva (13º, PLR, aplicações)",
        icon: Banknote,
        pontos: "+4 pts",
      },
      {
        type: "switch",
        key: "rendimentosRRA",
        label: "Rendimentos recebidos acumuladamente (RRA)",
        icon: ScrollText,
        pontos: "+8 pts",
      },
    ],
  },
  {
    title: "Bens e Patrimônio",
    icon: Building2,
    items: [
      {
        type: "select",
        key: "imoveis",
        label: "Imóveis",
        icon: Building2,
        options: [
          { value: "0", label: "Nenhum" },
          { value: "1-2", label: "1 a 2 imóveis" },
          { value: "3+", label: "3 ou mais imóveis" },
        ],
      },
      {
        type: "select",
        key: "veiculos",
        label: "Veículos",
        icon: Car,
        options: [
          { value: "0", label: "Nenhum" },
          { value: "1-2", label: "1 a 2 veículos" },
          { value: "3+", label: "3 ou mais veículos" },
        ],
      },
      {
        type: "select",
        key: "contasBancarias",
        label: "Contas bancárias e aplicações",
        icon: CreditCard,
        options: [
          { value: "1-2", label: "1 a 2 contas" },
          { value: "3-5", label: "3 a 5 contas" },
          { value: "6+", label: "6 ou mais contas" },
        ],
      },
      {
        type: "switch",
        key: "criptoativos",
        label: "Criptoativos",
        icon: Bitcoin,
        pontos: "+15 pts",
      },
    ],
  },
  {
    title: "Investimentos e Operações Especiais",
    icon: TrendingUp,
    items: [
      {
        type: "switch",
        key: "rendaVariavel",
        label: "Renda variável (ações, FIIs)",
        icon: BarChart3,
        pontos: "+15 pts",
      },
      {
        type: "switch",
        key: "dayTrade",
        label: "Day trade",
        icon: Zap,
        pontos: "+20 pts",
      },
      {
        type: "switch",
        key: "ganhoCapital",
        label: "Ganho de capital (venda de bens)",
        icon: TrendingUp,
        pontos: "+12 pts",
      },
      {
        type: "switch",
        key: "rendimentosExterior",
        label: "Rendimentos do exterior",
        icon: Globe,
        pontos: "+18 pts",
      },
    ],
  },
  {
    title: "Deduções e Dependentes",
    icon: Users,
    items: [
      {
        type: "select",
        key: "dependentes",
        label: "Dependentes",
        icon: Users,
        options: [
          { value: "0", label: "Nenhum" },
          { value: "1-2", label: "1 a 2 dependentes" },
          { value: "3+", label: "3 ou mais dependentes" },
        ],
      },
      {
        type: "switch",
        key: "despesasMedicas",
        label: "Despesas médicas",
        icon: Heart,
        pontos: "+4 pts",
      },
      {
        type: "switch",
        key: "despesasEducacao",
        label: "Despesas com educação",
        icon: GraduationCap,
        pontos: "+3 pts",
      },
      {
        type: "switch",
        key: "pensaoAlimenticia",
        label: "Pensão alimentícia",
        icon: Scale,
        pontos: "+5 pts",
      },
      {
        type: "switch",
        key: "doacoesIncentivadas",
        label: "Doações incentivadas (ECA, idoso, cultura)",
        icon: Gift,
        pontos: "+3 pts",
      },
    ],
  },
  {
    title: "Situações Especiais",
    icon: Landmark,
    items: [
      {
        type: "switch",
        key: "atividadeRural",
        label: "Atividade rural",
        icon: Tractor,
        pontos: "+15 pts",
      },
      {
        type: "switch",
        key: "espolio",
        label: "Espólio / herança",
        icon: ScrollText,
        pontos: "+20 pts",
      },
      {
        type: "switch",
        key: "dividasOnus",
        label: "Dívidas e ônus reais",
        icon: Landmark,
        pontos: "+4 pts",
      },
      {
        type: "switch",
        key: "alugueisRecebidos",
        label: "Aluguéis recebidos",
        icon: Home,
        pontos: "+8 pts",
      },
    ],
  },
];

export default function ChecklistSection({ checklist, onChange }: ChecklistSectionProps) {
  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const SectionIcon = section.icon;
        return (
          <div
            key={section.title}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="px-5 py-3.5 bg-gradient-to-r from-orange-50 to-amber-50/50 border-b border-orange-100/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
                  <SectionIcon className="w-3.5 h-3.5 text-orange-600" />
                </div>
                <h2 className="text-sm font-semibold text-gray-800" style={{ fontFamily: "'Sora', sans-serif" }}>
                  {section.title}
                </h2>
              </div>
            </div>

            <div className="p-4 space-y-1">
              {section.items.map((item) => {
                const ItemIcon = item.icon;
                const currentValue = checklist[item.key];

                if (item.type === "select" && item.options) {
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <ItemIcon className="w-4 h-4 text-gray-400" />
                        <Label className="text-sm text-gray-700 font-normal cursor-default">
                          {item.label}
                        </Label>
                      </div>
                      <Select
                        value={currentValue as string}
                        onValueChange={(val) => onChange(item.key, val as any)}
                      >
                        <SelectTrigger className="w-[160px] h-8 text-xs bg-white border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {item.options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-xs">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between py-2.5 px-3 rounded-lg transition-all ${
                      currentValue
                        ? "bg-orange-50/60 border border-orange-100/60"
                        : "hover:bg-gray-50/80 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ItemIcon className={`w-4 h-4 ${currentValue ? "text-orange-500" : "text-gray-400"}`} />
                      <Label
                        htmlFor={item.key}
                        className={`text-sm font-normal cursor-pointer ${
                          currentValue ? "text-gray-800" : "text-gray-700"
                        }`}
                      >
                        {item.label}
                      </Label>
                      {item.pontos && currentValue && (
                        <span className="text-[10px] font-medium text-orange-500 bg-orange-100 px-1.5 py-0.5 rounded-full">
                          {item.pontos}
                        </span>
                      )}
                    </div>
                    <Switch
                      id={item.key}
                      checked={currentValue as boolean}
                      onCheckedChange={(val) => onChange(item.key, val as any)}
                      className="data-[state=checked]:bg-orange-500"
                    />
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
