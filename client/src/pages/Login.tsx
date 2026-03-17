/*
 * Login - Tela de login com identidade visual da Numer Contabilidade
 */

import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { LogIn, Calculator, Shield } from "lucide-react";

const LOGO_URL = "https://manus-storage.oss-cn-beijing.aliyuncs.com/user-file-content/b9e2c1d9-d2fd-4a3d-a3a7-c98d2a5e5d6b/uploads/NUMER_Logo_01.png";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card de login */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header com gradiente laranja */}
          <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 px-8 py-10 text-center relative overflow-hidden">
            {/* Decoração */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/30" />
              <div className="absolute left-5 bottom-0 w-24 h-24 rounded-full bg-white/20" />
            </div>

            <div className="relative">
              <img
                src={LOGO_URL}
                alt="Numer Contabilidade"
                className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-lg bg-white/10 p-1"
              />
              <h1
                className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Numer Contabilidade
              </h1>
              <p className="text-sm text-white/80">
                Calculadora de Orçamento IRPF 2026
              </p>
            </div>
          </div>

          {/* Corpo */}
          <div className="px-8 py-8 space-y-6">
            <div className="text-center">
              <h2
                className="text-lg font-semibold text-gray-800 mb-2"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Acesse sua conta
              </h2>
              <p className="text-sm text-gray-500">
                Faça login para acessar a calculadora de orçamentos e gerenciar suas propostas.
              </p>
            </div>

            {/* Benefícios */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Orçamentos automáticos</p>
                  <p className="text-xs text-gray-500">Calcule valores com base nas fichas do IRPF</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Acesso seguro</p>
                  <p className="text-xs text-gray-500">Seus orçamentos são privados e protegidos</p>
                </div>
              </div>
            </div>

            {/* Botão de login */}
            <Button
              onClick={() => {
                window.location.href = getLoginUrl();
              }}
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base rounded-xl shadow-lg shadow-orange-200 transition-all hover:shadow-orange-300 gap-2"
            >
              <LogIn className="w-5 h-5" />
              Entrar com Manus
            </Button>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Ferramenta de uso interno — Higor Araujo, Contador
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
