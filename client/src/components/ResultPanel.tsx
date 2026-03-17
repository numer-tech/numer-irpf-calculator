/*
 * ResultPanel - Painel lateral de resultado em tempo real
 * Design: Valor base + itens detalhados + descontos + complexidade + fichas
 */

import { motion, AnimatePresence } from "framer-motion";
import {
  Gauge,
  FileCheck,
  ArrowRight,
  Minus,
  Plus,
  Receipt,
  Package,
  Save,
  Loader2,
  Tag,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type {
  CalculationResult,
  ComplexityLevel,
  DescontoConfig,
} from "@/hooks/useIRPFCalculator";

interface ResultPanelProps {
  resultado: CalculationResult;
  valorFinal: number;
  valorAjustado: number | null;
  onValorChange: (valor: number | null) => void;
  onGerarProposta: () => void;
  onSalvar?: () => void;
  isSaving?: boolean;
  descontosConfig?: DescontoConfig[];
  descontosAtivos?: Record<string, boolean>;
  onToggleDesconto?: (id: string) => void;
}

const complexityColors: Record<ComplexityLevel, { bar: string; badge: string }> = {
  simples: {
    bar: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  medio: {
    bar: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
  },
  complexo: {
    bar: "bg-orange-500",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
  },
  muito_complexo: {
    bar: "bg-red-500",
    badge: "bg-red-100 text-red-700 border-red-200",
  },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function ResultPanel({
  resultado,
  valorFinal,
  valorAjustado,
  onValorChange,
  onGerarProposta,
  onSalvar,
  isSaving,
  descontosConfig = [],
  descontosAtivos = {},
  onToggleDesconto,
}: ResultPanelProps) {
  const colors = complexityColors[resultado.nivel];
  const maxScore = 100;
  const score = resultado.totalItens + resultado.totalFichas * 2;
  const barWidth = Math.min((score / maxScore) * 100, 100);

  const adjustValue = (delta: number) => {
    const newVal = Math.max(0, valorFinal + delta);
    onValorChange(newVal);
  };

  const hasDescontos = descontosConfig.length > 0;
  const descontosAtivosCount = resultado.descontosAplicados?.filter((d) => d.ativo).length ?? 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header com valor total */}
      <div className="relative px-5 py-5 bg-gradient-to-br from-orange-500 to-amber-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/20" />
          <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="w-4 h-4" />
            <span className="text-xs font-medium text-white/80 uppercase tracking-wider">
              Resultado do Orçamento
            </span>
          </div>

          <motion.div
            key={valorFinal}
            initial={{ scale: 0.95, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {formatCurrency(valorFinal)}
          </motion.div>

          <div className="flex items-center gap-3 mt-2 text-xs text-white/70 flex-wrap">
            <span>Base: {formatCurrency(resultado.valorBase)}</span>
            <span>+</span>
            <span>Itens: {formatCurrency(resultado.valorItens)}</span>
            {resultado.totalDescontos > 0 && (
              <>
                <span>-</span>
                <span className="text-green-200">Desc: {formatCurrency(resultado.totalDescontos)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Ajuste manual de valor */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">
            Ajustar valor manualmente
          </label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustValue(-50)}
              className="h-8 w-8 p-0 border-gray-200 hover:border-orange-200 hover:bg-orange-50"
            >
              <Minus className="w-3.5 h-3.5" />
            </Button>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                R$
              </span>
              <Input
                type="number"
                value={valorFinal}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onValorChange(isNaN(val) ? 0 : val);
                }}
                className="h-8 text-sm pl-9 text-center bg-gray-50/50 border-gray-200 focus:border-orange-300"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => adjustValue(50)}
              className="h-8 w-8 p-0 border-gray-200 hover:border-orange-200 hover:bg-orange-50"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
          {valorAjustado !== null && (
            <button
              onClick={() => onValorChange(null)}
              className="text-[11px] text-orange-500 hover:text-orange-600 mt-1.5 underline underline-offset-2"
            >
              Restaurar valor calculado ({formatCurrency(resultado.valorTotal)})
            </button>
          )}
        </div>

        <Separator className="bg-gray-100" />

        {/* Descontos */}
        {hasDescontos && (
          <>
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <Tag className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs font-medium text-gray-500">
                  Descontos {descontosAtivosCount > 0 && `(${descontosAtivosCount} ativo${descontosAtivosCount > 1 ? "s" : ""})`}
                </span>
              </div>
              <div className="space-y-2">
                {descontosConfig.map((desc) => {
                  const ativo = descontosAtivos[desc.id] ?? false;
                  const aplicado = resultado.descontosAplicados?.find((d) => d.id === desc.id);
                  return (
                    <div
                      key={desc.id}
                      className={`flex items-center justify-between py-2 px-3 rounded-lg border transition-colors ${
                        ativo
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Percent className={`w-3 h-3 shrink-0 ${ativo ? "text-green-500" : "text-gray-400"}`} />
                        <div className="min-w-0">
                          <span className={`text-xs block truncate ${ativo ? "text-green-700 font-medium" : "text-gray-600"}`}>
                            {desc.descricao}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {desc.tipo === "percentual" ? `${desc.valor}%` : formatCurrency(desc.valor)}
                            {ativo && aplicado ? ` = -${formatCurrency(aplicado.valorDesconto)}` : ""}
                          </span>
                        </div>
                      </div>
                      <Switch
                        checked={ativo}
                        onCheckedChange={() => onToggleDesconto?.(desc.id)}
                        className="data-[state=checked]:bg-green-500 shrink-0 ml-2"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <Separator className="bg-gray-100" />
          </>
        )}

        {/* Detalhamento dos itens */}
        {resultado.lineItems.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <Receipt className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-500">
                Detalhamento ({resultado.totalItens} itens)
              </span>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {/* Valor base */}
              <div className="flex items-center justify-between text-xs py-1.5 px-2.5 bg-gray-50 rounded-md">
                <div className="flex items-center gap-2">
                  <Package className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Valor base da declaração</span>
                </div>
                <span className="font-semibold text-gray-700">{formatCurrency(resultado.valorBase)}</span>
              </div>
              <AnimatePresence mode="popLayout">
                {resultado.lineItems.map((item) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between text-xs py-1.5 px-2.5 bg-orange-50/50 rounded-md"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                      <span className="text-gray-600 truncate">{item.label}</span>
                      <span className="text-gray-400 shrink-0">
                        {item.quantidade}x {formatCurrency(item.precoUnitario)}
                      </span>
                    </div>
                    <span className="font-semibold text-orange-700 ml-2 shrink-0">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {/* Descontos aplicados no detalhamento */}
              {resultado.descontosAplicados?.filter((d) => d.ativo).map((desc) => (
                <motion.div
                  key={desc.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between text-xs py-1.5 px-2.5 bg-green-50 rounded-md"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Tag className="w-3 h-3 text-green-500 shrink-0" />
                    <span className="text-green-700 truncate">{desc.descricao}</span>
                  </div>
                  <span className="font-semibold text-green-700 ml-2 shrink-0">
                    -{formatCurrency(desc.valorDesconto)}
                  </span>
                </motion.div>
              ))}
              {/* Total */}
              <div className="flex items-center justify-between text-xs py-2 px-2.5 bg-orange-100/60 rounded-md border border-orange-200/50 mt-1">
                <span className="font-semibold text-gray-700">Total calculado</span>
                <span className="font-bold text-orange-700">{formatCurrency(resultado.valorTotal)}</span>
              </div>
            </div>
          </div>
        )}

        <Separator className="bg-gray-100" />

        {/* Complexidade */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Complexidade</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${colors.badge}`}>
              {resultado.nivelLabel}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${colors.bar}`}
              initial={{ width: 0 }}
              animate={{ width: `${barWidth}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-400">{resultado.totalItens} itens · {resultado.totalFichas} fichas</span>
          </div>
        </div>

        <Separator className="bg-gray-100" />

        {/* Fichas identificadas */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <FileCheck className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-medium text-gray-500">
              Fichas a preencher ({resultado.fichasIdentificadas.length})
            </span>
          </div>
          <div className="space-y-1.5">
            <AnimatePresence mode="popLayout">
              {resultado.fichasIdentificadas.map((ficha) => (
                <motion.div
                  key={ficha}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 text-xs text-gray-600 py-1.5 px-2.5 bg-gray-50 rounded-md"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                  {ficha}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <Separator className="bg-gray-100" />

        {/* Botões de ação */}
        <div className="space-y-2">
          <Button
            onClick={onGerarProposta}
            className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm shadow-md shadow-orange-200/50 gap-2"
          >
            <FileCheck className="w-4 h-4" />
            Gerar Proposta
            <ArrowRight className="w-4 h-4" />
          </Button>

          {onSalvar && (
            <Button
              onClick={onSalvar}
              disabled={isSaving}
              variant="outline"
              className="w-full h-10 border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 font-medium text-sm gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? "Salvando..." : "Salvar Orçamento"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
