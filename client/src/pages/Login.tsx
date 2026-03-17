import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, Eye, EyeOff, Calculator, Shield, Building2, ChevronDown } from "lucide-react";

const DEFAULT_LOGO =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663390991773/hrYkQ7rTK4s8DYQBoB2Kee/NUMER_Logo_01_aa953856.png";

interface LoginProps {
  onSuccess: () => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [showEmpresaSelector, setShowEmpresaSelector] = useState(false);
  const utils = trpc.useUtils();

  // Ler empresaId da query string (?empresa=1)
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<number | undefined>(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("empresa");
    return id ? parseInt(id, 10) : undefined;
  });

  // Buscar lista pública de empresas (para o seletor)
  const empresasQuery = trpc.empresa.listPublic.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Buscar branding da empresa selecionada
  const brandingInput = useMemo(
    () => (selectedEmpresaId ? { empresaId: selectedEmpresaId } : undefined),
    [selectedEmpresaId]
  );
  const brandingQuery = trpc.empresa.branding.useQuery(brandingInput, {
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const branding = brandingQuery.data;
  const logoUrl = branding?.logoUrl || DEFAULT_LOGO;
  const empresaNome = branding?.nome || "Calculadora IRPF";
  const responsavel = branding?.responsavel || "";
  const corPrimaria = branding?.corPrimaria || "#F97316";
  const corSecundaria = branding?.corSecundaria || "#FB923C";
  const corTextoPrimaria = branding?.corTextoPrimaria || "#FFFFFF";

  const empresas = empresasQuery.data ?? [];
  const hasMultipleEmpresas = empresas.length > 1;

  // Aplicar cores da empresa no fundo da página de login
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--empresa-primary", corPrimaria);
    root.style.setProperty("--empresa-secondary", corSecundaria);
    root.style.setProperty("--empresa-text-primary", corTextoPrimaria);
  }, [corPrimaria, corSecundaria, corTextoPrimaria]);

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

  function handleSelectEmpresa(id: number) {
    setSelectedEmpresaId(id);
    setShowEmpresaSelector(false);
    // Atualizar query string sem recarregar
    const url = new URL(window.location.href);
    url.searchParams.set("empresa", String(id));
    window.history.replaceState({}, "", url.toString());
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, ${corPrimaria}08 0%, white 50%, #f9fafb 100%)`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header com cores da empresa */}
          <div
            className="px-8 py-8 text-center relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${corPrimaria}, ${corSecundaria})`,
            }}
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
            <div className="relative">
              <div className="flex justify-center mb-4">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={empresaNome}
                    className="h-16 w-16 rounded-xl shadow-lg object-contain bg-white/10 p-0.5"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-xl shadow-lg flex items-center justify-center bg-white/20">
                    <Building2 className="w-8 h-8" style={{ color: corTextoPrimaria }} />
                  </div>
                )}
              </div>
              <h1
                className="text-2xl font-bold"
                style={{ fontFamily: "'Sora', sans-serif", color: corTextoPrimaria }}
              >
                {empresaNome}
              </h1>
              <p className="text-sm mt-1" style={{ color: corTextoPrimaria, opacity: 0.8 }}>
                Calculadora de Orçamento IRPF 2026
              </p>

              {/* Seletor de empresa (se houver mais de uma) */}
              {hasMultipleEmpresas && (
                <div className="mt-3 relative">
                  <button
                    type="button"
                    onClick={() => setShowEmpresaSelector(!showEmpresaSelector)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-white/20 hover:bg-white/30"
                    style={{ color: corTextoPrimaria }}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Trocar escritório
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showEmpresaSelector ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {showEmpresaSelector && (
                      <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                      >
                        <div className="p-2">
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-2 py-1">
                            Selecione o escritório
                          </p>
                          {empresas.map((emp: any) => (
                            <button
                              key={emp.id}
                              onClick={() => handleSelectEmpresa(emp.id)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                                branding?.id === emp.id
                                  ? "bg-gray-100"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              {emp.logoUrl ? (
                                <img
                                  src={emp.logoUrl}
                                  alt={emp.nome}
                                  className="w-8 h-8 rounded-lg object-contain border border-gray-100 p-0.5"
                                />
                              ) : (
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: emp.corPrimaria + "20" }}
                                >
                                  <Building2 className="w-4 h-4" style={{ color: emp.corPrimaria }} />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{emp.nome}</p>
                                {branding?.id === emp.id && (
                                  <p className="text-[10px] text-gray-400">Selecionado</p>
                                )}
                              </div>
                              {branding?.id === emp.id && (
                                <div
                                  className="ml-auto w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: emp.corPrimaria }}
                                />
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
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
              Acesso restrito à equipe da {empresaNome}
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
                    style={{ ["--tw-ring-color" as string]: `${corPrimaria}40` }}
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
                    style={{ ["--tw-ring-color" as string]: `${corPrimaria}40` }}
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
                disabled={loginMutation.isPending}
                className="w-full text-white font-semibold h-11 mt-2 rounded-xl"
                style={{
                  backgroundColor: corPrimaria,
                }}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            {/* Info cards */}
            <div className="mt-6 space-y-2">
              <div
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ backgroundColor: `${corPrimaria}08` }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${corPrimaria}15`, color: corPrimaria }}
                >
                  <Calculator className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs text-gray-600">Orçamentos automáticos com base nas fichas do IRPF</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs text-gray-600">Seus orçamentos são privados e protegidos</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              {responsavel ? `${responsavel} — ` : ""}
              {empresaNome}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
