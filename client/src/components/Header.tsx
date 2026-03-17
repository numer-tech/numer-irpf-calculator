/*
 * Header - Numer Contabilidade
 * Design: Corporate Dashboard Moderno
 * Cores: Laranja (#F57C20), branco, cinza claro
 * Tipografia: Sora (heading)
 */

import { Calculator, RotateCcw, Settings, History, LogOut, ShieldCheck, User, Users } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663390991773/hrYkQ7rTK4s8DYQBoB2Kee/NUMER_Logo_01_aa953856.png";

interface HeaderProps {
  onReset: () => void;
  onOpenSettings: () => void;
  onOpenHistorico?: () => void;
  userName?: string | null;
  userRole?: string | null;
  onLogout?: () => void;
}

export default function Header({
  onReset,
  onOpenSettings,
  onOpenHistorico,
  userName,
  userRole,
  onLogout,
}: HeaderProps) {
  const isAdmin = userRole === "admin";
  const [, navigate] = useLocation();
  const displayName = userName || "Usuário";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
            <h1
              className="text-lg font-bold text-gray-900 leading-tight"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Numer Contabilidade
            </h1>
            <p className="text-xs text-gray-500 -mt-0.5">
              Calculadora de Orçamento IRPF 2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge admin/uso interno */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-full">
            {isAdmin ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                <span className="text-xs font-medium text-orange-700">Admin</span>
              </>
            ) : (
              <>
                <Calculator className="w-3.5 h-3.5 text-orange-600" />
                <span className="text-xs font-medium text-orange-700">Uso Interno</span>
              </>
            )}
          </div>

          {onOpenHistorico && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenHistorico}
              className="text-gray-500 hover:text-orange-600 hover:border-orange-200 gap-1.5"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Histórico</span>
            </Button>
          )}
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

          {/* Menu do usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-gray-100 transition-colors ml-1">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <span className="hidden md:block text-sm text-gray-700 font-medium max-w-[120px] truncate">
                  {displayName}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">
                  {isAdmin ? "Administrador" : "Usuário"}
                </p>
              </div>
              <DropdownMenuSeparator />
              {isAdmin && (
                <DropdownMenuItem
                  onClick={() => navigate("/usuarios")}
                  className="gap-2"
                >
                  <Users className="w-4 h-4" />
                  Gerenciar Usuários
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onLogout && (
                <DropdownMenuItem
                  onClick={onLogout}
                  className="text-red-600 focus:text-red-700 focus:bg-red-50 gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
