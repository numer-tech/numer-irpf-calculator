/*
 * SettingsPanel - Painel de configuração com 3 abas:
 * 1. Preços (valor base + preço unitário por ficha)
 * 2. Descontos (criar, editar, remover descontos configuráveis)
 * 3. Proposta (formas de pagamento, prazo, condições, observações)
 * Cores dinâmicas via CSS variables da empresa (white label)
 */

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RotateCcw,
  Save,
  DollarSign,
  Package,
  Tag,
  Plus,
  Trash2,
  FileText,
  Percent,
} from "lucide-react";
import { toast } from "sonner";
import type {
  PricingConfig,
  ChecklistState,
  DescontoConfig,
  PropostaConfig,
} from "@/hooks/useIRPFCalculator";

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: PricingConfig;
  onUpdateItemPreco: (key: keyof ChecklistState, precoUnitario: number) => void;
  onUpdateValorBase: (valor: number) => void;
  onResetConfig: () => void;
  descontosConfig: DescontoConfig[];
  onAddDesconto: () => void;
  onUpdateDesconto: (id: string, updates: Partial<DescontoConfig>) => void;
  onRemoveDesconto: (id: string) => void;
  propostaConfig: PropostaConfig;
  onUpdatePropostaConfig: <K extends keyof PropostaConfig>(key: K, value: PropostaConfig[K]) => void;
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
  descontosConfig,
  onAddDesconto,
  onUpdateDesconto,
  onRemoveDesconto,
  propostaConfig,
  onUpdatePropostaConfig,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState("precos");

  const handleResetConfig = () => {
    onResetConfig();
    toast.success("Valores restaurados para o padrão!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 bg-empresa-lighter">
          <div>
            <DialogTitle
              className="text-lg font-bold text-gray-900"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Configurações
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Configure preços, descontos e o texto da proposta enviada ao cliente.
            </DialogDescription>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-6 pt-3 border-b border-gray-100">
            <TabsList className="bg-gray-100/80 h-9">
              <TabsTrigger value="precos" className="text-xs gap-1.5 data-[state=active]:bg-white">
                <DollarSign className="w-3.5 h-3.5" />
                Preços
              </TabsTrigger>
              <TabsTrigger value="descontos" className="text-xs gap-1.5 data-[state=active]:bg-white">
                <Tag className="w-3.5 h-3.5" />
                Descontos
              </TabsTrigger>
              <TabsTrigger value="proposta" className="text-xs gap-1.5 data-[state=active]:bg-white">
                <FileText className="w-3.5 h-3.5" />
                Proposta
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 max-h-[calc(85vh-260px)]">
            {/* === ABA PREÇOS === */}
            <TabsContent value="precos" className="p-6 space-y-6 mt-0">
              {/* Valor base */}
              <div className="bg-empresa-lighter rounded-xl border border-empresa-light p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-empresa" />
                  <h3 className="text-sm font-semibold text-gray-800" style={{ fontFamily: "'Sora', sans-serif" }}>
                    Valor Base da Declaração
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Valor mínimo cobrado por qualquer declaração, independente da complexidade.
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
                      if (!isNaN(val) && val >= 0) onUpdateValorBase(val);
                    }}
                    className="w-32 h-9 text-sm text-center bg-white border-empresa-light focus-empresa font-semibold"
                  />
                </div>
              </div>

              <Separator className="bg-gray-100" />

              {/* Preços unitários */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-4 h-4 text-empresa" />
                  <h3 className="text-sm font-semibold text-gray-800" style={{ fontFamily: "'Sora', sans-serif" }}>
                    Preço Unitário por Ficha
                  </h3>
                </div>
                <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4">
                  Defina quanto cobrar por cada unidade de cada ficha. O valor será multiplicado pela quantidade informada.
                </p>
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-5">Ficha Oficial</div>
                    <div className="col-span-3 text-center">Preço Unitário</div>
                    <div className="col-span-3 text-right">Unidade</div>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {config.itensPreco.map((item, index) => (
                      <div key={item.key} className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center hover:bg-gray-50/50 transition-colors">
                        <div className="col-span-1 text-center">
                          <span className="text-[11px] font-bold text-gray-300">{String(index + 1).padStart(2, "0")}</span>
                        </div>
                        <div className="col-span-5">
                          <p className="text-sm text-gray-700 leading-tight">{item.label}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Atual: {formatCurrency(item.precoUnitario)}</p>
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
                              if (!isNaN(val) && val >= 0) onUpdateItemPreco(item.key, val);
                            }}
                            className="w-20 h-7 text-xs text-center bg-white border-gray-200 focus-empresa"
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
            </TabsContent>

            {/* === ABA DESCONTOS === */}
            <TabsContent value="descontos" className="p-6 space-y-6 mt-0">
              <div className="bg-green-50 rounded-xl border border-green-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-green-600" />
                  <h3 className="text-sm font-semibold text-gray-800" style={{ fontFamily: "'Sora', sans-serif" }}>
                    Descontos Disponíveis
                  </h3>
                </div>
                <p className="text-xs text-gray-500">
                  Crie descontos que podem ser ativados/desativados na hora de fazer o orçamento.
                  Cada desconto pode ser em percentual (%) ou valor fixo (R$).
                </p>
              </div>

              <div className="space-y-3">
                {descontosConfig.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Tag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nenhum desconto cadastrado.</p>
                    <p className="text-xs mt-1">Clique em "Adicionar Desconto" para criar o primeiro.</p>
                  </div>
                )}

                {descontosConfig.map((desc, index) => (
                  <div key={desc.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                          Desconto {index + 1}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveDesconto(desc.id)}
                        className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Descrição</label>
                      <Input
                        value={desc.descricao}
                        onChange={(e) => onUpdateDesconto(desc.id, { descricao: e.target.value })}
                        placeholder="Ex: Desconto fidelidade"
                        className="h-8 text-sm border-gray-200 focus-empresa"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Tipo</label>
                        <Select
                          value={desc.tipo}
                          onValueChange={(val) => onUpdateDesconto(desc.id, { tipo: val as "percentual" | "fixo" })}
                        >
                          <SelectTrigger className="h-8 text-sm border-gray-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentual">Percentual (%)</SelectItem>
                            <SelectItem value="fixo">Valor Fixo (R$)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Valor {desc.tipo === "percentual" ? "(%)" : "(R$)"}
                        </label>
                        <Input
                          type="number"
                          min={0}
                          step={desc.tipo === "percentual" ? 1 : 10}
                          value={desc.valor}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= 0) onUpdateDesconto(desc.id, { valor: val });
                          }}
                          className="h-8 text-sm text-center border-gray-200 focus:border-green-300"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={onAddDesconto}
                variant="outline"
                className="w-full h-10 border-dashed border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Desconto
              </Button>
            </TabsContent>

            {/* === ABA PROPOSTA === */}
            <TabsContent value="proposta" className="p-6 space-y-6 mt-0">
              <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-800" style={{ fontFamily: "'Sora', sans-serif" }}>
                    Configurações da Proposta
                  </h3>
                </div>
                <p className="text-xs text-gray-500">
                  Personalize as informações que aparecem na proposta enviada ao cliente.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                    Formas de Pagamento
                  </label>
                  <Textarea
                    value={propostaConfig.formasPagamento}
                    onChange={(e) => onUpdatePropostaConfig("formasPagamento", e.target.value)}
                    placeholder="Ex: PIX, Boleto Bancário, Cartão de Crédito (até 3x)"
                    rows={3}
                    className="text-sm border-gray-200 focus:border-blue-300 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                    Validade da Proposta
                  </label>
                  <Input
                    value={propostaConfig.prazoValidade}
                    onChange={(e) => onUpdatePropostaConfig("prazoValidade", e.target.value)}
                    placeholder="Ex: 15 dias"
                    className="h-9 text-sm border-gray-200 focus:border-blue-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                    Condições e Observações
                  </label>
                  <Textarea
                    value={propostaConfig.condicoesGerais}
                    onChange={(e) => onUpdatePropostaConfig("condicoesGerais", e.target.value)}
                    placeholder="Ex: O valor poderá ser ajustado caso haja informações adicionais não previstas neste orçamento."
                    rows={4}
                    className="text-sm border-gray-200 focus:border-blue-300 resize-none"
                  />
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetConfig}
            className="text-gray-500 hover:text-empresa hover:border-empresa-light gap-1.5"
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
            className="bg-empresa hover:opacity-90 text-empresa-on gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Fechar e Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
