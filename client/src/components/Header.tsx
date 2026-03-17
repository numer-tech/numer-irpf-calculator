/*
 * Header - White Label
 * Usa cores e logo da empresa do tenant logado
 */

import { Calculator, RotateCcw, Settings, History, LogOut, ShieldCheck, Users, Building2, Crown } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EmpresaData } from "@/hooks/useInternalAuth";

const DEFAULT_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663390991773/hrYkQ7rTK4s8DYQBoB2Kee/NUMER_Logo_01_aa953856.png";

interface HeaderProps {
  onReset: () => void;
  onOpenSettings: () => void;
  onOpenHistorico?: () => void;
  userName?: string | null;
  userRole?: string | null;
  onLogout?: () => void;
  empresa?: EmpresaData | null;
}

export default function Header({
  onReset,
  onOpenSettings,
  onOpenHistorico,
  userName,
  userRole,
  onLogout,
  empresa,
}: HeaderProps) {
  const isAdmin = userRole === "admin" || userRole === "superadmin";
  const isSuperAdmin = userRole === "superadmin";
  const [, navigate] = useLocation();
  const displayName = userName || "Usuário";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const logoUrl = empresa?.logoUrl || DEFAULT_LOGO;
  const empresaNome = empresa?.nome || "Calculadora IRPF";
  const corPrimaria = empresa?.corPrimaria || "#F97316";
  const corTextoPrimaria = empresa?.corTextoPrimaria || "#FFFFFF";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <img
            src={logoUrl}
            alt={empresaNome}
            className="h-10 w-10 rounded-lg object-contain"
          />
          <div>
            <h1
              className="text-lg font-bold text-gray-900 leading-tight"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              {empresaNome}
            </h1>
            <p className="text-xs text-gray-500 -mt-0.5">
              Calculadora de Orçamento IRPF 2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge role */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: `${corPrimaria}15` }}>
            {isSuperAdmin ? (
              <>
                <Crown className="w-3.5 h-3.5" style={{ color: corPrimaria }} />
                <span className="text-xs font-medium" style={{ color: corPrimaria }}>Super Admin</span>
              </>
            ) : isAdmin ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: corPrimaria }} />
                <span className="text-xs font-medium" style={{ color: corPrimaria }}>Admin</span>
              </>
            ) : (
              <>
                <Calculator className="w-3.5 h-3.5" style={{ color: corPrimaria }} />
                <span className="text-xs font-medium" style={{ color: corPrimaria }}>Uso Interno</span>
              </>
            )}
          </div>

          {onOpenHistorico && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenHistorico}
              className="text-gray-500 gap-1.5"
              style={{ ["--hover-color" as any]: corPrimaria }}
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Histórico</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            className="text-gray-500 gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Configurar Valores</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="text-gray-500 gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Novo Orçamento</span>
          </Button>

          {/* Menu do usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-gray-100 transition-colors ml-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: corPrimaria, color: corTextoPrimaria }}
                >
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
                  {isSuperAdmin ? "Super Administrador" : isAdmin ? "Administrador" : "Usuário"}
                </p>
                {empresa && (
                  <p className="text-xs text-gray-400 mt-0.5">{empresa.nome}</p>
                )}
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
              {isAdmin && !isSuperAdmin && (
                <DropdownMenuItem
                  onClick={() => navigate("/minha-empresa")}
                  className="gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  Minha Empresa
                </DropdownMenuItem>
              )}
              {isSuperAdmin && (
                <DropdownMenuItem
                  onClick={() => navigate("/empresas")}
                  className="gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  Gerenciar Empresas
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
