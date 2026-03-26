/*
 * Home - Calculadora de Orçamento IRPF 2026
 * Design: Corporate Dashboard Moderno - White Label
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
    descontosConfig,
    descontosAtivos,
    propostaConfig,
    setValorAjustado,
    updateChecklist,
    updateClientData,
    updateItemPreco,
    updateValorBase,
    resetConfig,
    resetAll,
    toggleDesconto,
    addDesconto,
    updateDesconto,
    removeDesconto,
    updatePropostaConfig,
  } = useIRPFCalculator();

  const [showProposal, setShowProposal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const corPrimaria = "#F97316";
  const corSecundaria = "#FB923C";
  const empresaNome = "Numer Contabilidade";
  const responsavel = "Higor Araujo";

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
      toast.error("Informe o nome do cliente.");
      return;
    }
    if (!clientData.cpf.trim()) {
      toast.error("Informe o CPF do cliente.");
      return;
    }
    if (!clientData.telefone.trim()) {
      toast.error("Informe o telefone do cliente.");
      return;
    }
    createMutation.mutate({
      clienteNome: clientData.nome,
      clienteCpf: clientData.cpf || undefined,
      clienteTelefone: clientData.telefone || undefined,
      checklist: { ...checklist } as Record<string, number>,
      resultado: {
        nivelLabel: resultado.nivelLabel,
        valorBase: resultado.valorBase,
        valorItens: resultado.valorItens,
        valorBruto: resultado.valorBruto,
        totalDescontos: resultado.totalDescontos,
        valorTotal: resultado.valorTotal,
        totalItens: resultado.totalItens,
        totalFichas: resultado.totalFichas,
        fichasIdentificadas: resultado.fichasIdentificadas,
        lineItems: resultado.lineItems,
        descontosAplicados: resultado.descontosAplicados.filter((d) => d.ativo),
      },
      valorCalculado: resultado.valorTotal,
      valorFinal,
    });
  };

  const handleGerarProposta = () => {
    if (!clientData.nome.trim()) {
      toast.error("Informe o nome do cliente para gerar a proposta.");
      return;
    }
    if (!clientData.cpf.trim()) {
      toast.error("Informe o CPF do cliente para gerar a proposta.");
      return;
    }
    if (!clientData.telefone.trim()) {
      toast.error("Informe o telefone do cliente para gerar a proposta.");
      return;
    }
    setShowProposal(true);
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
        propostaConfig={propostaConfig}
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
        descontosConfig={descontosConfig}
        onAddDesconto={addDesconto}
        onUpdateDesconto={updateDesconto}
        onRemoveDesconto={removeDesconto}
        propostaConfig={propostaConfig}
        onUpdatePropostaConfig={updatePropostaConfig}
      />

      {/* Hero banner com cores dinâmicas da empresa */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${corPrimaria}, ${corSecundaria})`,
        }}
      >
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
                  onGerarProposta={handleGerarProposta}
                  onSalvar={handleSalvar}
                  isSaving={createMutation.isPending}
                  descontosConfig={descontosConfig}
                  descontosAtivos={descontosAtivos}
                  onToggleDesconto={toggleDesconto}
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
                  Use <strong>"Configurar Valores"</strong> para personalizar os preços e descontos.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer dinâmico */}
      <footer className="border-t border-gray-100 bg-white mt-8">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            {empresaNome} — Ferramenta de uso interno
          </p>
          {responsavel && (
            <p className="text-xs text-gray-400">
              {responsavel}
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
