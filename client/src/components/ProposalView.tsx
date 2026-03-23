/*
 * ProposalView - Visualização e geração da proposta de orçamento
 * Design: Layout de documento profissional com identidade white-label
 * Lógica: detalhamento de itens com preço unitário x quantidade + descontos + config editável
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
  Package,
  Tag,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { ClientData, CalculationResult, PropostaConfig } from "@/hooks/useIRPFCalculator";
import type { EmpresaData } from "@/hooks/useInternalAuth";

const DEFAULT_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663390991773/hrYkQ7rTK4s8DYQBoB2Kee/NUMER_Logo_01_aa953856.png";
const PROPOSAL_HEADER_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663390991773/hrYkQ7rTK4s8DYQBoB2Kee/proposal-header-54h6qUingoWxgiHNzuFjAU.webp";

export interface ProposalViewProps {
  clientData: ClientData;
  resultado: CalculationResult;
  valorFinal: number;
  propostaConfig?: PropostaConfig;
  empresa?: EmpresaData | null;
  onBack: () => void;
}

const defaultPropostaForView: PropostaConfig = {
  formasPagamento: "PIX, Transferência Bancária ou Boleto",
  prazoValidade: "15 dias",
  condicoesGerais:
    "O valor poderá ser ajustado caso sejam identificadas informações adicionais durante a elaboração da declaração. O prazo de entrega é de até 5 dias úteis após o recebimento de toda a documentação.",
  observacoes: "",
};

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
  valorFinal: number,
  propConfig: PropostaConfig,
  empresa?: EmpresaData | null
): string {
  const empresaNome = empresa?.nome || "Calculadora IRPF";
  const responsavel = empresa?.responsavel || "";

  const lines = [
    `═══════════════════════════════`,
    `   ${empresaNome.toUpperCase()}`,
    `   Proposta de Serviço - IRPF 2026`,
    `═══════════════════════════════`,
    ``,
    `Data: ${formatDate()}`,
    ``,
    `━━━ DADOS DO CLIENTE ━━━`,
    clientData.nome ? `Nome: ${clientData.nome}` : "",
    clientData.cpf ? `CPF: ${clientData.cpf}` : "",
    clientData.telefone ? `Telefone: ${clientData.telefone}` : "",
    ``,
    `━━━ DETALHAMENTO DO ORÇAMENTO ━━━`,
    `Valor base da declaração: ${formatCurrency(resultado.valorBase)}`,
    ``,
    ...resultado.lineItems.map(
      (item) =>
        `  ${item.label}: ${item.quantidade}x ${formatCurrency(item.precoUnitario)} = ${formatCurrency(item.subtotal)}`
    ),
    ``,
  ];

  const descontosAtivos = resultado.descontosAplicados?.filter((d) => d.ativo) ?? [];
  if (descontosAtivos.length > 0) {
    lines.push(`━━━ DESCONTOS ━━━`);
    for (const d of descontosAtivos) {
      const tipoStr = d.tipo === "percentual" ? `${d.valor}%` : formatCurrency(d.valor);
      lines.push(`  ${d.descricao} (${tipoStr}): -${formatCurrency(d.valorDesconto)}`);
    }
    lines.push(``);
  }

  lines.push(
    `Complexidade: ${resultado.nivelLabel}`,
    `Total de itens: ${resultado.totalItens}`,
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
    `• Formas de pagamento: ${propConfig.formasPagamento}`,
    `• Validade desta proposta: ${propConfig.prazoValidade}`,
    propConfig.condicoesGerais ? `• ${propConfig.condicoesGerais}` : "",
    propConfig.observacoes ? `\nObservações: ${propConfig.observacoes}` : "",
    ``,
    `═══════════════════════════════`,
    responsavel ? `   ${responsavel}` : "",
    `   ${empresaNome}`,
    `═══════════════════════════════`,
  );

  return lines.filter((l) => l !== undefined && l !== "").join("\n");
}

function generateWhatsAppText(
  clientData: ClientData,
  resultado: CalculationResult,
  valorFinal: number,
  propConfig: PropostaConfig,
  empresa?: EmpresaData | null
): string {
  const empresaNome = empresa?.nome || "Calculadora IRPF";
  const responsavel = empresa?.responsavel || "";

  const lines = [
    `*${empresaNome.toUpperCase()}*`,
    `_Proposta de Serviço - IRPF 2026_`,
    ``,
    `📅 ${formatDate()}`,
    ``,
    clientData.nome ? `👤 *Cliente:* ${clientData.nome}` : "",
    clientData.cpf ? `📄 *CPF:* ${clientData.cpf}` : "",
    ``,
    `📊 *Detalhamento do Orçamento*`,
    `Valor base: ${formatCurrency(resultado.valorBase)}`,
    ``,
    ...resultado.lineItems.map(
      (item) =>
        `  • ${item.label}: ${item.quantidade}x ${formatCurrency(item.precoUnitario)} = *${formatCurrency(item.subtotal)}*`
    ),
    ``,
  ];

  const descontosAtivos = resultado.descontosAplicados?.filter((d) => d.ativo) ?? [];
  if (descontosAtivos.length > 0) {
    lines.push(`🏷️ *Descontos:*`);
    for (const d of descontosAtivos) {
      const tipoStr = d.tipo === "percentual" ? `${d.valor}%` : formatCurrency(d.valor);
      lines.push(`  • ${d.descricao} (${tipoStr}): *-${formatCurrency(d.valorDesconto)}*`);
    }
    lines.push(``);
  }

  lines.push(
    `Complexidade: *${resultado.nivelLabel}*`,
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
    `📌 Pagamento: ${propConfig.formasPagamento}`,
    `📌 Validade: ${propConfig.prazoValidade}`,
    propConfig.condicoesGerais ? `📌 ${propConfig.condicoesGerais}` : "",
    propConfig.observacoes ? `\n📝 _${propConfig.observacoes}_` : "",
    ``,
    responsavel ? `_${responsavel}_` : "",
    `_${empresaNome}_`,
  );

  return lines.filter((l) => l !== undefined && l !== "").join("\n");
}

export default function ProposalView({
  clientData,
  resultado,
  valorFinal,
  propostaConfig,
  empresa,
  onBack,
}: ProposalViewProps) {
  const proposalRef = useRef<HTMLDivElement>(null);
  const propConfig = propostaConfig ?? defaultPropostaForView;

  const logoUrl = empresa?.logoUrl || DEFAULT_LOGO;
  const empresaNome = empresa?.nome || "Calculadora IRPF";
  const responsavel = empresa?.responsavel || "";
  const corPrimaria = empresa?.corPrimaria || "#F97316";
  const corSecundaria = empresa?.corSecundaria || "#FB923C";
  const corTextoPrimaria = empresa?.corTextoPrimaria || "#FFFFFF";

  const handleCopy = () => {
    const text = generateProposalText(clientData, resultado, valorFinal, propConfig, empresa);
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Proposta copiada para a área de transferência!");
    });
  };

  const handleWhatsApp = () => {
    const text = generateWhatsAppText(clientData, resultado, valorFinal, propConfig, empresa);
    const phone = clientData.telefone.replace(/\D/g, "");
    const url = phone
      ? `https://wa.me/55${phone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  const descontosAtivos = resultado.descontosAplicados?.filter((d) => d.ativo) ?? [];

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
            className="text-gray-600 gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5 text-gray-600"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copiar</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 text-gray-600"
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
          {/* Header com cores da empresa */}
          <div className="relative h-28 sm:h-36 overflow-hidden">
            <img
              src={PROPOSAL_HEADER_URL}
              alt=""
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${corPrimaria}E6, ${corSecundaria}CC)`,
              }}
            />
            <div className="absolute inset-0 flex items-center px-8">
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={empresaNome}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl shadow-lg object-contain bg-white/10 p-0.5"
                  />
                ) : (
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl shadow-lg flex items-center justify-center"
                    style={{ backgroundColor: `${corPrimaria}40`, color: corTextoPrimaria }}
                  >
                    <Building2 className="w-8 h-8" />
                  </div>
                )}
                <div style={{ color: corTextoPrimaria }}>
                  <h1 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
                    {empresaNome}
                  </h1>
                  <p className="text-sm" style={{ opacity: 0.8 }}>Proposta de Serviço — IRPF 2026</p>
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
                  <User className="w-4 h-4" style={{ color: corPrimaria }} />
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
                </div>
              </div>
            )}

            {/* Detalhamento do orçamento */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                <FileText className="w-4 h-4" style={{ color: corPrimaria }} />
                Detalhamento do Orçamento
              </h3>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
                  <div className="col-span-5">Item</div>
                  <div className="col-span-2 text-center">Qtd</div>
                  <div className="col-span-2 text-center">Unit.</div>
                  <div className="col-span-3 text-right">Subtotal</div>
                </div>

                {/* Valor base */}
                <div className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center border-b border-gray-100">
                  <div className="col-span-5 flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm text-gray-700">Valor base da declaração</span>
                  </div>
                  <div className="col-span-2 text-center text-sm text-gray-400">—</div>
                  <div className="col-span-2 text-center text-sm text-gray-400">—</div>
                  <div className="col-span-3 text-right text-sm font-medium text-gray-700">
                    {formatCurrency(resultado.valorBase)}
                  </div>
                </div>

                {/* Line items */}
                {resultado.lineItems.map((item, idx) => {
                  const temFranquia = (item.franquia ?? 0) > 0;
                  const qtdCobrado = item.qtdCobrado ?? item.quantidade;
                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center border-b border-gray-50 last:border-b-0"
                    >
                      <div className="col-span-5">
                        <span className="text-sm text-gray-700">{item.label}</span>
                        {temFranquia && (
                          <span className="ml-1.5 text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
                            1ª incluída
                          </span>
                        )}
                      </div>
                      <div className="col-span-2 text-center text-sm text-gray-600">
                        {item.quantidade}
                        {temFranquia && qtdCobrado < item.quantidade && (
                          <span className="block text-[10px] text-green-600">({qtdCobrado} cobrado{qtdCobrado !== 1 ? 's' : ''})</span>
                        )}
                      </div>
                      <div className="col-span-2 text-center text-sm text-gray-500">
                        {formatCurrency(item.precoUnitario)}
                      </div>
                      <div className="col-span-3 text-right text-sm font-medium" style={{ color: qtdCobrado === 0 ? '#16a34a' : corPrimaria }}>
                        {qtdCobrado === 0 ? 'incluído' : formatCurrency(item.subtotal)}
                      </div>
                    </div>
                  );
                })}

                {/* Subtotal bruto */}
                {descontosAtivos.length > 0 && (
                  <div className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center bg-gray-50 border-t border-gray-200">
                    <div className="col-span-9">
                      <span className="text-sm font-semibold text-gray-700">Subtotal</span>
                    </div>
                    <div className="col-span-3 text-right text-sm font-semibold text-gray-700">
                      {formatCurrency(resultado.valorBruto)}
                    </div>
                  </div>
                )}

                {/* Descontos */}
                {descontosAtivos.map((desc) => (
                  <div
                    key={desc.id}
                    className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center bg-green-50/50 border-t border-green-100"
                  >
                    <div className="col-span-9 flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-sm text-green-700">
                        {desc.descricao}
                        <span className="text-xs text-green-500 ml-1">
                          ({desc.tipo === "percentual" ? `${desc.valor}%` : formatCurrency(desc.valor)})
                        </span>
                      </span>
                    </div>
                    <div className="col-span-3 text-right text-sm font-medium text-green-700">
                      -{formatCurrency(desc.valorDesconto)}
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div
                  className="grid grid-cols-12 gap-2 px-4 py-3 items-center border-t"
                  style={{ backgroundColor: `${corPrimaria}10`, borderColor: `${corPrimaria}30` }}
                >
                  <div className="col-span-9">
                    <span className="text-sm font-bold text-gray-800">Total</span>
                  </div>
                  <div className="col-span-3 text-right text-sm font-bold" style={{ color: corPrimaria }}>
                    {formatCurrency(resultado.valorTotal)}
                  </div>
                </div>
              </div>

              {/* Complexidade */}
              <div className="flex items-center justify-between mt-3 px-1">
                <span className="text-xs text-gray-500">
                  {resultado.totalItens} itens · {resultado.totalFichas} fichas
                </span>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ color: corPrimaria, backgroundColor: `${corPrimaria}15` }}
                >
                  Complexidade: {resultado.nivelLabel}
                </span>
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
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: corPrimaria }} />
                    {ficha}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Valor final destacado */}
            <div
              className="rounded-xl p-6 text-center"
              style={{
                background: `linear-gradient(135deg, ${corPrimaria}, ${corSecundaria})`,
                color: corTextoPrimaria,
              }}
            >
              <p className="text-sm mb-1" style={{ opacity: 0.8 }}>Valor do Serviço</p>
              <p className="text-3xl font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
                {formatCurrency(valorFinal)}
              </p>
              {valorFinal !== resultado.valorTotal && (
                <p className="text-xs mt-1" style={{ opacity: 0.6 }}>
                  (valor ajustado — calculado: {formatCurrency(resultado.valorTotal)})
                </p>
              )}
              {descontosAtivos.length > 0 && (
                <p className="text-xs mt-1" style={{ opacity: 0.7 }}>
                  Inclui {descontosAtivos.length} desconto{descontosAtivos.length > 1 ? "s" : ""} aplicado{descontosAtivos.length > 1 ? "s" : ""}
                </p>
              )}
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
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: corPrimaria }} />
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
                <li>• Formas de pagamento: {propConfig.formasPagamento}</li>
                <li>• Validade desta proposta: {propConfig.prazoValidade}</li>
                {propConfig.condicoesGerais && (
                  <li>• {propConfig.condicoesGerais}</li>
                )}
              </ul>
              {propConfig.observacoes && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Observações:</p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{propConfig.observacoes}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Assinatura */}
            <div className="text-center pt-2">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={empresaNome}
                  className="w-10 h-10 rounded-lg mx-auto mb-2 object-contain"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: `${corPrimaria}15`, color: corPrimaria }}
                >
                  <Building2 className="w-5 h-5" />
                </div>
              )}
              {responsavel && (
                <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: "'Sora', sans-serif" }}>
                  {responsavel}
                </p>
              )}
              <p className="text-xs text-gray-500">{empresaNome}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
