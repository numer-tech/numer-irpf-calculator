/*
 * ResultPanel - Painel lateral de resultado em tempo real
 * Design: Sticky sidebar com badge de complexidade, valor animado, fichas
 */

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gauge,
  FileCheck,
  TrendingUp,
  ArrowRight,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { CalculationResult, ComplexityLevel } from "@/hooks/useIRPFCalculator";

interface ResultPanelProps {
  resultado: CalculationResult;
  valorFinal: number;
  valorAjustado: number | null;
  onValorChange: (valor: number | null) => void;
  onGerarProposta: () => void;
}

const complexityColors: Record<ComplexityLevel, { bg: string; text: string; bar: string; badge: string }> = {
  simples: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    bar: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  medio: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    bar: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
  },
  complexo: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    bar: "bg-orange-500",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
  },
  muito_complexo: {
    bg: "bg-red-50",
    text: "text-red-700",
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
}: ResultPanelProps) {
  const colors = complexityColors[resultado.nivel];
  const maxPontos = 120;
  const barWidth = Math.min((resultado.pontos / maxPontos) * 100, 100);

  const adjustValue = (delta: number) => {
    const newVal = Math.max(0, valorFinal + delta);
    onValorChange(newVal);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header com gradiente laranja */}
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

          <p className="text-xs text-white/70 mt-1">
            Faixa: {formatCurrency(resultado.valorMinimo)} — {formatCurrency(resultado.valorMaximo)}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-5">
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
              Restaurar valor sugerido ({formatCurrency(resultado.valorSugerido)})
            </button>
          )}
        </div>

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
            <span className="text-[10px] text-gray-400">{resultado.pontos} pontos</span>
            <span className="text-[10px] text-gray-400">máx. {maxPontos}</span>
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

        {/* Botão gerar proposta */}
        <Button
          onClick={onGerarProposta}
          className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm shadow-md shadow-orange-200/50 gap-2"
        >
          <FileCheck className="w-4 h-4" />
          Gerar Proposta
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
