/*
 * ProposalView - Visualização e geração da proposta de orçamento
 * Design: Layout de documento profissional com identidade Numer
 */

import { useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  MessageCircle,
  Printer,
  FileText,
  CheckCircle2,
  Calendar,
  User,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { ClientData, CalculationResult } from "@/hooks/useIRPFCalculator";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663390991773/hrYkQ7rTK4s8DYQBoB2Kee/NUMER_Logo_01_aa953856.png";
const PROPOSAL_HEADER_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663390991773/hrYkQ7rTK4s8DYQBoB2Kee/proposal-header-54h6qUingoWxgiHNzuFjAU.webp";

interface ProposalViewProps {
  clientData: ClientData;
  resultado: CalculationResult;
  valorFinal: number;
  onBack: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(): string {
  return new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function generateProposalText(
  clientData: ClientData,
  resultado: CalculationResult,
  valorFinal: number
): string {
  const lines = [
    `═══════════════════════════════`,
    `   NUMER CONTABILIDADE`,
    `   Proposta de Serviço - IRPF 2026`,
    `═══════════════════════════════`,
    ``,
    `Data: ${formatDate()}`,
    ``,
    `━━━ DADOS DO CLIENTE ━━━`,
    clientData.nome ? `Nome: ${clientData.nome}` : "",
    clientData.cpf ? `CPF: ${clientData.cpf}` : "",
    clientData.telefone ? `Telefone: ${clientData.telefone}` : "",
    clientData.email ? `E-mail: ${clientData.email}` : "",
    ``,
    `━━━ ANÁLISE DA DECLARAÇÃO ━━━`,
    `Nível de complexidade: ${resultado.nivelLabel}`,
    `Pontuação: ${resultado.pontos} pontos`,
    ``,
    `Fichas a serem preenchidas:`,
    ...resultado.fichasIdentificadas.map((f) => `  ✓ ${f}`),
    ``,
    `━━━ VALOR DO SERVIÇO ━━━`,
    `Valor: ${formatCurrency(valorFinal)}`,
    ``,
    `O serviço inclui:`,
    `  • Análise completa da documentação`,
    `  • Preenchimento de todas as fichas aplicáveis`,
    `  • Conferência e validação dos dados`,
    `  • Transmissão da declaração à Receita Federal`,
    `  • Acompanhamento do processamento`,
    `  • Suporte em caso de malha fina`,
    ``,
    `━━━ CONDIÇÕES ━━━`,
    `• Pagamento: à vista ou em até 2x`,
    `• Prazo de entrega: até 5 dias úteis após recebimento de toda documentação`,
    `• Validade desta proposta: 15 dias`,
    ``,
    `═══════════════════════════════`,
    `   Higor Araujo - Contador`,
    `   Numer Contabilidade`,
    `   CRC: Ativo`,
    `═══════════════════════════════`,
  ];

  return lines.filter((l) => l !== undefined).join("\n");
}

function generateWhatsAppText(
  clientData: ClientData,
  resultado: CalculationResult,
  valorFinal: number
): string {
  const lines = [
    `*NUMER CONTABILIDADE*`,
    `_Proposta de Serviço - IRPF 2026_`,
    ``,
    `📅 ${formatDate()}`,
    ``,
    clientData.nome ? `👤 *Cliente:* ${clientData.nome}` : "",
    clientData.cpf ? `📄 *CPF:* ${clientData.cpf}` : "",
    ``,
    `📊 *Análise da Declaração*`,
    `Complexidade: *${resultado.nivelLabel}*`,
    `Fichas identificadas: *${resultado.fichasIdentificadas.length}*`,
    ``,
    `📋 *Fichas a preencher:*`,
    ...resultado.fichasIdentificadas.map((f) => `  ✅ ${f}`),
    ``,
    `💰 *Valor do Serviço: ${formatCurrency(valorFinal)}*`,
    ``,
    `✅ *O serviço inclui:*`,
    `• Análise completa da documentação`,
    `• Preenchimento de todas as fichas`,
    `• Transmissão à Receita Federal`,
    `• Acompanhamento do processamento`,
    `• Suporte em caso de malha fina`,
    ``,
    `📌 Pagamento: à vista ou em até 2x`,
    `📌 Prazo: até 5 dias úteis`,
    `📌 Validade: 15 dias`,
    ``,
    `_Higor Araujo - Contador_`,
    `_Numer Contabilidade_`,
  ];

  return lines.filter((l) => l !== undefined).join("\n");
}

export default function ProposalView({
  clientData,
  resultado,
  valorFinal,
  onBack,
}: ProposalViewProps) {
  const proposalRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    const text = generateProposalText(clientData, resultado, valorFinal);
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Proposta copiada para a área de transferência!");
    });
  };

  const handleWhatsApp = () => {
    const text = generateWhatsAppText(clientData, resultado, valorFinal);
    const phone = clientData.telefone.replace(/\D/g, "");
    const url = phone
      ? `https://wa.me/55${phone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50/50"
    >
      {/* Action bar */}
      <div className="no-print sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container flex items-center justify-between h-14">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-600 hover:text-orange-600 gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Orçamento
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5 text-gray-600 hover:text-orange-600 hover:border-orange-200"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copiar</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 text-gray-600 hover:text-orange-600 hover:border-orange-200"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir</span>
            </Button>
            <Button
              size="sm"
              onClick={handleWhatsApp}
              className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Proposal document */}
      <div className="container py-8 max-w-3xl" ref={proposalRef}>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header com imagem */}
          <div className="relative h-28 sm:h-36 overflow-hidden">
            <img
              src={PROPOSAL_HEADER_URL}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-amber-500/80" />
            <div className="absolute inset-0 flex items-center px-8">
              <div className="flex items-center gap-4">
                <img
                  src={LOGO_URL}
                  alt="Numer"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl shadow-lg"
                />
                <div className="text-white">
                  <h1 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
                    Numer Contabilidade
                  </h1>
                  <p className="text-sm text-white/80">Proposta de Serviço — IRPF 2026</p>
                </div>
              </div>
            </div>
          </div>

          {/* Corpo da proposta */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Data */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              {formatDate()}
            </div>

            {/* Dados do cliente */}
            {(clientData.nome || clientData.cpf) && (
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                  <User className="w-4 h-4 text-orange-500" />
                  Dados do Cliente
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {clientData.nome && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-600">{clientData.nome}</span>
                    </div>
                  )}
                  {clientData.cpf && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-600">{clientData.cpf}</span>
                    </div>
                  )}
                  {clientData.telefone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-600">{clientData.telefone}</span>
                    </div>
                  )}
                  {clientData.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-600">{clientData.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Análise */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                <FileText className="w-4 h-4 text-orange-500" />
                Análise da Declaração
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-100">
                  <p className="text-xs text-orange-600 font-medium mb-1">Complexidade</p>
                  <p className="text-lg font-bold text-orange-700" style={{ fontFamily: "'Sora', sans-serif" }}>
                    {resultado.nivelLabel}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-100">
                  <p className="text-xs text-orange-600 font-medium mb-1">Fichas</p>
                  <p className="text-lg font-bold text-orange-700" style={{ fontFamily: "'Sora', sans-serif" }}>
                    {resultado.fichasIdentificadas.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Fichas */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3" style={{ fontFamily: "'Sora', sans-serif" }}>
                Fichas a serem preenchidas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {resultado.fichasIdentificadas.map((ficha) => (
                  <div
                    key={ficha}
                    className="flex items-center gap-2 text-sm text-gray-600 py-2 px-3 bg-gray-50 rounded-lg"
                  >
                    <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                    {ficha}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Valor */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl p-6 text-white text-center">
              <p className="text-sm text-white/80 mb-1">Valor do Serviço</p>
              <p className="text-3xl font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
                {formatCurrency(valorFinal)}
              </p>
            </div>

            {/* Inclui */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3" style={{ fontFamily: "'Sora', sans-serif" }}>
                O serviço inclui
              </h3>
              <div className="space-y-2">
                {[
                  "Análise completa da documentação",
                  "Preenchimento de todas as fichas aplicáveis",
                  "Conferência e validação dos dados",
                  "Transmissão da declaração à Receita Federal",
                  "Acompanhamento do processamento",
                  "Suporte em caso de malha fina",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Condições */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                Condições
              </h3>
              <ul className="space-y-1.5 text-sm text-gray-600">
                <li>• Pagamento: à vista ou em até 2x</li>
                <li>• Prazo de entrega: até 5 dias úteis após recebimento de toda documentação</li>
                <li>• Validade desta proposta: 15 dias</li>
              </ul>
            </div>

            <Separator />

            {/* Assinatura */}
            <div className="text-center pt-2">
              <img
                src={LOGO_URL}
                alt="Numer"
                className="w-10 h-10 rounded-lg mx-auto mb-2"
              />
              <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: "'Sora', sans-serif" }}>
                Higor Araujo
              </p>
              <p className="text-xs text-gray-500">Contador — Numer Contabilidade</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
