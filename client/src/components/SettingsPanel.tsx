/*
 * SettingsPanel - Painel de configuração de valores da tabela
 * Design: Dialog/Sheet com abas para Pontuação e Faixas de Preço
 * Identidade: Numer Contabilidade (laranja, branco, cinza)
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCcw, Save, Sliders, DollarSign } from "lucide-react";
import { toast } from "sonner";
import type { PricingConfig, PontosConfig, FaixaPreco } from "@/hooks/useIRPFCalculator";

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: PricingConfig;
  onUpdatePontos: <K extends keyof PontosConfig>(key: K, value: PontosConfig[K]) => void;
  onUpdateFaixa: (index: number, faixa: Partial<FaixaPreco>) => void;
  onResetConfig: () => void;
}

interface PontosFieldConfig {
  section: string;
  fields: {
    key: keyof PontosConfig;
    label: string;
  }[];
}

const pontosFields: PontosFieldConfig[] = [
  {
    section: "Rendimentos",
    fields: [
      { key: "fontesRendimento_1", label: "1 fonte de rendimento" },
      { key: "fontesRendimento_2_3", label: "2 a 3 fontes de rendimento" },
      { key: "fontesRendimento_4", label: "4+ fontes de rendimento" },
      { key: "rendimentosIsentos", label: "Rendimentos isentos" },
      { key: "rendimentosTributacaoExclusiva", label: "Tributação exclusiva" },
      { key: "rendimentosRRA", label: "Rendimentos acumulados (RRA)" },
    ],
  },
  {
    section: "Bens e Patrimônio",
    fields: [
      { key: "imoveis_1_2", label: "1 a 2 imóveis" },
      { key: "imoveis_3", label: "3+ imóveis" },
      { key: "veiculos_1_2", label: "1 a 2 veículos" },
      { key: "veiculos_3", label: "3+ veículos" },
      { key: "contasBancarias_3_5", label: "3 a 5 contas bancárias" },
      { key: "contasBancarias_6", label: "6+ contas bancárias" },
      { key: "criptoativos", label: "Criptoativos" },
    ],
  },
  {
    section: "Investimentos e Operações Especiais",
    fields: [
      { key: "rendaVariavel", label: "Renda variável (ações, FIIs)" },
      { key: "dayTrade", label: "Day trade" },
      { key: "ganhoCapital", label: "Ganho de capital" },
      { key: "rendimentosExterior", label: "Rendimentos do exterior" },
    ],
  },
  {
    section: "Deduções e Dependentes",
    fields: [
      { key: "dependentes_1_2", label: "1 a 2 dependentes" },
      { key: "dependentes_3", label: "3+ dependentes" },
      { key: "despesasMedicas", label: "Despesas médicas" },
      { key: "despesasEducacao", label: "Despesas com educação" },
      { key: "pensaoAlimenticia", label: "Pensão alimentícia" },
      { key: "doacoesIncentivadas", label: "Doações incentivadas" },
    ],
  },
  {
    section: "Situações Especiais",
    fields: [
      { key: "atividadeRural", label: "Atividade rural" },
      { key: "espolio", label: "Espólio / herança" },
      { key: "dividasOnus", label: "Dívidas e ônus reais" },
      { key: "alugueisRecebidos", label: "Aluguéis recebidos" },
    ],
  },
];

export default function SettingsPanel({
  open,
  onOpenChange,
  config,
  onUpdatePontos,
  onUpdateFaixa,
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
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle
                className="text-lg font-bold text-gray-900"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Configurar Tabela de Valores
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Ajuste os pontos de cada item e as faixas de preço por nível de complexidade.
                As alterações são salvas automaticamente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="pontos" className="flex-1">
          <div className="px-6 pt-3 border-b border-gray-100">
            <TabsList className="bg-gray-100/80 h-9">
              <TabsTrigger value="pontos" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:text-orange-600">
                <Sliders className="w-3.5 h-3.5" />
                Pontuação por Item
              </TabsTrigger>
              <TabsTrigger value="faixas" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:text-orange-600">
                <DollarSign className="w-3.5 h-3.5" />
                Faixas de Preço
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 max-h-[calc(85vh-220px)]">
            <TabsContent value="pontos" className="p-6 mt-0 space-y-6">
              <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-lg p-3">
                Defina quantos pontos cada item adiciona à complexidade da declaração.
                Quanto mais pontos, maior a complexidade e o valor sugerido.
              </p>

              {pontosFields.map((section) => (
                <div key={section.section}>
                  <h3
                    className="text-sm font-semibold text-gray-700 mb-3"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    {section.section}
                  </h3>
                  <div className="space-y-2">
                    {section.fields.map((field) => (
                      <div
                        key={field.key}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Label className="text-sm text-gray-600 font-normal">
                          {field.label}
                        </Label>
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={config.pontos[field.key]}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val) && val >= 0) {
                                onUpdatePontos(field.key, val);
                              }
                            }}
                            className="w-20 h-8 text-sm text-center bg-white border-gray-200 focus:border-orange-300"
                          />
                          <span className="text-xs text-gray-400 w-8">pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator className="mt-4 bg-gray-100" />
                </div>
              ))}
            </TabsContent>

            <TabsContent value="faixas" className="p-6 mt-0 space-y-6">
              <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-lg p-3">
                Configure as faixas de preço para cada nível de complexidade.
                O "Pontos Máx." define o limite superior de pontos para aquela faixa.
              </p>

              {config.faixas.map((faixa, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50/50 border-b border-orange-100/50">
                    <div className="flex items-center justify-between">
                      <h3
                        className="text-sm font-semibold text-gray-700"
                        style={{ fontFamily: "'Sora', sans-serif" }}
                      >
                        {faixa.label}
                      </h3>
                      <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                        Faixa {index + 1}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-gray-500 font-medium">Nome da Faixa</Label>
                      <Input
                        value={faixa.label}
                        onChange={(e) => onUpdateFaixa(index, { label: e.target.value })}
                        className="w-48 h-8 text-sm bg-gray-50 border-gray-200 focus:border-orange-300"
                      />
                    </div>

                    {index < config.faixas.length - 1 && (
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-gray-500 font-medium">Pontos Máx.</Label>
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            min={1}
                            value={faixa.pontosMax}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val) && val > 0) {
                                onUpdateFaixa(index, { pontosMax: val });
                              }
                            }}
                            className="w-24 h-8 text-sm text-center bg-gray-50 border-gray-200 focus:border-orange-300"
                          />
                          <span className="text-xs text-gray-400">pts</span>
                        </div>
                      </div>
                    )}

                    <Separator className="bg-gray-100" />

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-[11px] text-gray-400 font-medium mb-1 block">
                          Valor Mínimo
                        </Label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                            R$
                          </span>
                          <Input
                            type="number"
                            min={0}
                            value={faixa.valorMinimo}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val) && val >= 0) {
                                onUpdateFaixa(index, { valorMinimo: val });
                              }
                            }}
                            className="h-8 text-sm pl-8 bg-gray-50 border-gray-200 focus:border-orange-300"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-[11px] text-gray-400 font-medium mb-1 block">
                          Valor Sugerido
                        </Label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                            R$
                          </span>
                          <Input
                            type="number"
                            min={0}
                            value={faixa.valorSugerido}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val) && val >= 0) {
                                onUpdateFaixa(index, { valorSugerido: val });
                              }
                            }}
                            className="h-8 text-sm pl-8 bg-orange-50 border-orange-200 focus:border-orange-400 font-medium text-orange-700"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-[11px] text-gray-400 font-medium mb-1 block">
                          Valor Máximo
                        </Label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                            R$
                          </span>
                          <Input
                            type="number"
                            min={0}
                            value={faixa.valorMaximo}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val) && val >= 0) {
                                onUpdateFaixa(index, { valorMaximo: val });
                              }
                            }}
                            className="h-8 text-sm pl-8 bg-gray-50 border-gray-200 focus:border-orange-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetConfig}
            className="gap-1.5 text-gray-500 hover:text-orange-600 hover:border-orange-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Padrão
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onOpenChange(false);
              toast.success("Configurações salvas com sucesso!");
            }}
            className="gap-1.5 bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Save className="w-3.5 h-3.5" />
            Fechar e Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
