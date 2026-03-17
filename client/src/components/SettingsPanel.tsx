/*
 * SettingsPanel - Painel de configuração de preços unitários por ficha oficial do IRPF
 * Design: Dialog com valor base + preço unitário de cada ficha editável
 * Identidade: Numer Contabilidade (laranja, branco, cinza)
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCcw, Save, DollarSign, Package } from "lucide-react";
import { toast } from "sonner";
import type { PricingConfig, ChecklistState } from "@/hooks/useIRPFCalculator";

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: PricingConfig;
  onUpdateItemPreco: (key: keyof ChecklistState, precoUnitario: number) => void;
  onUpdateValorBase: (valor: number) => void;
  onResetConfig: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function SettingsPanel({
  open,
  onOpenChange,
  config,
  onUpdateItemPreco,
  onUpdateValorBase,
  onResetConfig,
}: SettingsPanelProps) {
  const handleResetConfig = () => {
    onResetConfig();
    toast.success("Valores restaurados para o padrão!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50/50">
          <div>
            <DialogTitle
              className="text-lg font-bold text-gray-900"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Configurar Tabela de Preços
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Defina o valor base da declaração e o preço unitário de cada ficha oficial do IRPF.
              As alterações são salvas automaticamente.
            </DialogDescription>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(85vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Valor base */}
            <div className="bg-orange-50 rounded-xl border border-orange-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-orange-600" />
                <h3
                  className="text-sm font-semibold text-gray-800"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  Valor Base da Declaração
                </h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Valor mínimo cobrado por qualquer declaração, independente da complexidade.
                Os valores das fichas serão somados a este valor base.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">R$</span>
                <Input
                  type="number"
                  min={0}
                  step={10}
                  value={config.valorBase}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0) {
                      onUpdateValorBase(val);
                    }
                  }}
                  className="w-32 h-9 text-sm text-center bg-white border-orange-200 focus:border-orange-400 font-semibold"
                />
              </div>
            </div>

            <Separator className="bg-gray-100" />

            {/* Preços unitários por ficha */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-4 h-4 text-orange-600" />
                <h3
                  className="text-sm font-semibold text-gray-800"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  Preço Unitário por Ficha
                </h3>
              </div>
              <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4">
                Defina quanto cobrar por cada unidade de cada ficha. O valor será multiplicado pela
                quantidade informada. Ex: se "Bens e Direitos" custa R$ 15,00 e o cliente tem 5 bens,
                o subtotal será R$ 75,00.
              </p>

              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-5">Ficha Oficial</div>
                  <div className="col-span-3 text-center">Preço Unitário</div>
                  <div className="col-span-3 text-right">Unidade</div>
                </div>
                <div className="divide-y divide-gray-50">
                  {config.itensPreco.map((item, index) => (
                    <div
                      key={item.key}
                      className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="col-span-1 text-center">
                        <span className="text-[11px] font-bold text-gray-300">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="col-span-5">
                        <p className="text-sm text-gray-700 leading-tight">{item.label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Atual: {formatCurrency(item.precoUnitario)}
                        </p>
                      </div>
                      <div className="col-span-3 flex items-center justify-center gap-1">
                        <span className="text-xs text-gray-400">R$</span>
                        <Input
                          type="number"
                          min={0}
                          step={5}
                          value={item.precoUnitario}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= 0) {
                              onUpdateItemPreco(item.key, val);
                            }
                          }}
                          className="w-20 h-7 text-xs text-center bg-white border-gray-200 focus:border-orange-300"
                        />
                      </div>
                      <div className="col-span-3 text-right">
                        <span className="text-[11px] text-gray-400">{item.descricaoUnidade}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetConfig}
            className="text-gray-500 hover:text-orange-600 hover:border-orange-200 gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Padrão
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onOpenChange(false);
              toast.success("Configurações salvas!");
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Fechar e Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
