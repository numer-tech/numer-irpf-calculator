import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, Eye, EyeOff, Calculator, Shield } from "lucide-react";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663390991773/hrYkQ7rTK4s8DYQBoB2Kee/NUMER_Logo_01_aa953856.png";

const COR_PRIMARIA = "#F97316";
const COR_SECUNDARIA = "#FB923C";

interface LoginProps {
  onSuccess: () => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success("Login realizado com sucesso!");
      onSuccess();
    },
    onError: (err) => {
      toast.error(err.message || "E-mail ou senha incorretos");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      toast.error("Preencha e-mail e senha");
      return;
    }
    loginMutation.mutate({ email, senha });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, ${COR_PRIMARIA}08 0%, white 50%, #f9fafb 100%)`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Numer */}
          <div
            className="px-8 py-8 text-center relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${COR_PRIMARIA}, ${COR_SECUNDARIA})`,
            }}
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
            <div className="relative">
              <div className="flex justify-center mb-4">
                <img
                  src={LOGO_URL}
                  alt="Numer Contabilidade"
                  className="h-16 w-16 rounded-xl shadow-lg object-contain bg-white/10 p-0.5"
                />
              </div>
              <h1
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Numer Contabilidade
              </h1>
              <p className="text-sm mt-1 text-white/80">
                Calculadora de Orçamento IRPF 2026
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h2
              className="text-lg font-bold text-gray-800 mb-1"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Entrar na sua conta
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Acesso restrito à equipe da Numer Contabilidade
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-gray-200"
                    autoComplete="email"
                    disabled={loginMutation.isPending}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="senha" className="text-sm font-medium text-gray-700">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="senha"
                    type={showSenha ? "text" : "password"}
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pl-10 pr-10 border-gray-200"
                    autoComplete="current-password"
                    disabled={loginMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha(!showSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full text-white font-semibold py-2.5 rounded-xl shadow-md transition-all"
                style={{
                  background: `linear-gradient(135deg, ${COR_PRIMARIA}, ${COR_SECUNDARIA})`,
                  border: "none",
                }}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 pb-6 pt-0">
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-xl border border-orange-100">
              <Shield className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <p className="text-xs text-orange-700">
                Ferramenta de uso interno — Numer Contabilidade
              </p>
            </div>
          </div>
        </div>

        {/* Créditos */}
        <div className="mt-6 text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Calculator className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-semibold text-gray-700">Numer Contabilidade</span>
          </div>
          <p className="text-xs text-gray-400">Higor Araujo, Contador</p>
        </div>
      </motion.div>
    </div>
  );
}
