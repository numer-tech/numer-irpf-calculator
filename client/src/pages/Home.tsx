/*
 * Home - Calculadora de Orçamento IRPF 2026
 * Design: Corporate Dashboard Moderno
 * Layout: Duas colunas — formulário (esquerda) + resultado sticky (direita)
 * Identidade: Numer Contabilidade (laranja, branco, cinza)
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useInternalAuth } from "@/hooks/useInternalAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Header from "@/components/Header";
import ClientDataForm from "@/components/ClientDataForm";
import ChecklistSection from "@/components/ChecklistSection";
import ResultPanel from "@/components/ResultPanel";
import ProposalView from "@/components/ProposalView";
import SettingsPanel from "@/components/SettingsPanel";
import { useIRPFCalculator } from "@/hooks/useIRPFCalculator";

export default function Home() {
  const { user, logout } = useInternalAuth();
  const [, navigate] = useLocation();

  const {
    clientData,
    checklist,
    resultado,
    valorFinal,
    valorAjustado,
    pricingConfig,
    setValorAjustado,
    updateChecklist,
    updateClientData,
    updateItemPreco,
    updateValorBase,
    resetConfig,
    resetAll,
  } = useIRPFCalculator();

  const [showProposal, setShowProposal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const createMutation = trpc.orcamento.create.useMutation({
    onSuccess: () => {
      toast.success("Orçamento salvo com sucesso!");
      resetAll();
    },
    onError: (err) => {
      toast.error(`Erro ao salvar: ${err.message}`);
    },
  });

  const handleSalvar = () => {
    if (!clientData.nome.trim()) {
      toast.error("Informe pelo menos o nome do cliente.");
      return;
    }
    createMutation.mutate({
      clienteNome: clientData.nome,
      clienteCpf: clientData.cpf || undefined,
      clienteTelefone: clientData.telefone || undefined,
      clienteEmail: clientData.email || undefined,
      checklist: { ...checklist } as Record<string, number>,
      resultado: {
        nivelLabel: resultado.nivelLabel,
        valorBase: resultado.valorBase,
        valorItens: resultado.valorItens,
        valorTotal: resultado.valorTotal,
        totalItens: resultado.totalItens,
        totalFichas: resultado.totalFichas,
        fichasIdentificadas: resultado.fichasIdentificadas,
        lineItems: resultado.lineItems,
      },
      valorCalculado: resultado.valorTotal,
      valorFinal,
    });
  };

  const handleLogout = () => {
    logout();
  };

  if (showProposal) {
    return (
      <ProposalView
        clientData={clientData}
        resultado={resultado}
        valorFinal={valorFinal}
        onBack={() => setShowProposal(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        onReset={resetAll}
        onOpenSettings={() => setShowSettings(true)}
        onOpenHistorico={() => navigate("/historico")}
        userName={user?.nome}
        userRole={user?.role}
        onLogout={handleLogout}
      />

      {/* Settings Panel */}
      <SettingsPanel
        open={showSettings}
        onOpenChange={setShowSettings}
        config={pricingConfig}
        onUpdateItemPreco={updateItemPreco}
        onUpdateValorBase={updateValorBase}
        onResetConfig={resetConfig}
      />

      {/* Hero banner sutil */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/30" />
          <div className="absolute left-1/3 -bottom-10 w-60 h-60 rounded-full bg-white/20" />
          <div className="absolute left-10 top-5 w-40 h-40 rounded-full bg-white/10" />
        </div>
        <div className="container relative py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-1">
              <h2
                className="text-xl sm:text-2xl font-bold text-white"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Calculadora de Orçamento IRPF 2026
              </h2>
            </div>
            <p className="text-sm text-white/80 max-w-lg">
              Informe a quantidade de itens em cada ficha do cliente.
              O valor do serviço será calculado automaticamente com base no preço unitário de cada item.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main content - two columns */}
      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - Forms */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <ClientDataForm data={clientData} onChange={updateClientData} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <ChecklistSection
                checklist={checklist}
                onChange={updateChecklist}
                itensPreco={pricingConfig.itensPreco}
              />
            </motion.div>
          </div>

          {/* Right column - Result panel (sticky) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-20">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <ResultPanel
                  resultado={resultado}
                  valorFinal={valorFinal}
                  valorAjustado={valorAjustado}
                  onValorChange={setValorAjustado}
                  onGerarProposta={() => setShowProposal(true)}
                  onSalvar={handleSalvar}
                  isSaving={createMutation.isPending}
                />
              </motion.div>

              {/* Quick info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="mt-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
              >
                <p className="text-xs text-gray-500 leading-relaxed">
                  O valor é calculado somando o <strong>valor base</strong> da declaração com o
                  preço unitário de cada item multiplicado pela quantidade informada.
                  Use <strong>"Configurar Valores"</strong> para personalizar os preços.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-8">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            Numer Contabilidade — Ferramenta de uso interno
          </p>
          <p className="text-xs text-gray-400">
            Higor Araujo, Contador
          </p>
        </div>
      </footer>
    </div>
  );
}
