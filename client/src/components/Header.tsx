/*
 * Header - Numer Contabilidade
 * Design: Corporate Dashboard Moderno
 * Cores: Laranja (#F57C20), branco, cinza claro
 * Tipografia: Sora (heading)
 */

import { Calculator, RotateCcw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663390991773/hrYkQ7rTK4s8DYQBoB2Kee/NUMER_Logo_01_aa953856.png";

interface HeaderProps {
  onReset: () => void;
  onOpenSettings: () => void;
}

export default function Header({ onReset, onOpenSettings }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100/60">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <img
            src={LOGO_URL}
            alt="Numer Contabilidade"
            className="h-10 w-10 rounded-lg"
          />
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
              Numer Contabilidade
            </h1>
            <p className="text-xs text-gray-500 -mt-0.5">
              Calculadora de Orçamento IRPF 2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-full">
            <Calculator className="w-3.5 h-3.5 text-orange-600" />
            <span className="text-xs font-medium text-orange-700">Uso Interno</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            className="text-gray-500 hover:text-orange-600 hover:border-orange-200 gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Configurar Valores</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="text-gray-500 hover:text-orange-600 hover:border-orange-200 gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Novo Orçamento</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
