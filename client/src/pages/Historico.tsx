/*
 * Historico - Página de histórico de orçamentos
 * Lista todos os orçamentos salvos com filtros, status, comprovante e exclusão
 */

import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Search,
  Trash2,
  FileText,
  Upload,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  Calendar,
  User,
  DollarSign,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663390991773/hrYkQ7rTK4s8DYQBoB2Kee/NUMER_Logo_01_aa953856.png";

type StatusFilter = "todos" | "pendente" | "aprovado" | "concluido" | "cancelado";

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  pendente: {
    label: "Pendente",
    icon: <Clock className="w-3.5 h-3.5" />,
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200",
  },
  aprovado: {
    label: "Aprovado",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
  },
  concluido: {
    label: "Concluído",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50 border-emerald-200",
  },
  cancelado: {
    label: "Cancelado",
    icon: <XCircle className="w-3.5 h-3.5" />,
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
  },
};

function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(num);
}

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Historico() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [filter, setFilter] = useState<StatusFilter>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();

  const { data: orcamentos, isLoading } = trpc.orcamento.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const deleteMutation = trpc.orcamento.delete.useMutation({
    onSuccess: () => {
      toast.success("Orçamento excluído com sucesso!");
      utils.orcamento.list.invalidate();
      setDeleteId(null);
    },
    onError: (err) => toast.error(`Erro ao excluir: ${err.message}`),
  });

  const updateStatusMutation = trpc.orcamento.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      utils.orcamento.list.invalidate();
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const uploadComprovanteMutation = trpc.orcamento.uploadComprovante.useMutation({
    onSuccess: () => {
      toast.success("Comprovante anexado com sucesso!");
      utils.orcamento.list.invalidate();
      setUploadingId(null);
    },
    onError: (err) => {
      toast.error(`Erro ao enviar comprovante: ${err.message}`);
      setUploadingId(null);
    },
  });

  const handleFileUpload = (orcamentoId: number) => {
    setUploadingId(orcamentoId);
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingId) {
      setUploadingId(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo: 5MB");
      setUploadingId(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadComprovanteMutation.mutate({
        id: uploadingId,
        fileBase64: base64,
        fileName: file.name,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = "";
  };

  const cycleStatus = (id: number, currentStatus: string) => {
    const order = ["pendente", "aprovado", "concluido", "cancelado"] as const;
    const currentIdx = order.indexOf(currentStatus as any);
    const nextStatus = order[(currentIdx + 1) % order.length];
    updateStatusMutation.mutate({ id, status: nextStatus });
  };

  // Filter and search
  const filtered = (orcamentos ?? []).filter((orc) => {
    if (filter !== "todos" && orc.status !== filter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        orc.clienteNome.toLowerCase().includes(term) ||
        (orc.clienteCpf && orc.clienteCpf.toLowerCase().includes(term)) ||
        (orc.clienteEmail && orc.clienteEmail.toLowerCase().includes(term))
      );
    }
    return true;
  });

  // Stats
  const stats = {
    total: orcamentos?.length ?? 0,
    pendentes: orcamentos?.filter((o) => o.status === "pendente").length ?? 0,
    aprovados: orcamentos?.filter((o) => o.status === "aprovado").length ?? 0,
    concluidos: orcamentos?.filter((o) => o.status === "concluido").length ?? 0,
    cancelados: orcamentos?.filter((o) => o.status === "cancelado").length ?? 0,
    valorTotal: orcamentos?.reduce((sum, o) => sum + parseFloat(o.valorFinal), 0) ?? 0,
    valorConcluidos: orcamentos?.filter((o) => o.status === "concluido").reduce((sum, o) => sum + parseFloat(o.valorFinal), 0) ?? 0,
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Faça login para acessar o histórico.</p>
          <Button onClick={() => (window.location.href = getLoginUrl())}>
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={onFileSelected}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100/60">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-gray-500 hover:text-orange-600 gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <img src={LOGO_URL} alt="Numer" className="h-8 w-8 rounded-lg" />
              <h1
                className="text-base font-bold text-gray-900"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Histórico de Orçamentos
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Stats cards */}
      <div className="container py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Sora', sans-serif" }}>
              {stats.total}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-amber-100 p-4 shadow-sm">
            <p className="text-xs text-amber-600 mb-1">Pendentes</p>
            <p className="text-2xl font-bold text-amber-700" style={{ fontFamily: "'Sora', sans-serif" }}>
              {stats.pendentes}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-sm">
            <p className="text-xs text-emerald-600 mb-1">Concluídos</p>
            <p className="text-2xl font-bold text-emerald-700" style={{ fontFamily: "'Sora', sans-serif" }}>
              {stats.concluidos}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-orange-100 p-4 shadow-sm">
            <p className="text-xs text-orange-600 mb-1">Valor Concluídos</p>
            <p className="text-lg font-bold text-orange-700" style={{ fontFamily: "'Sora', sans-serif" }}>
              {formatCurrency(stats.valorConcluidos)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, CPF ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200 focus:border-orange-300"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400" />
            {(["todos", "pendente", "aprovado", "concluido", "cancelado"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
                className={
                  filter === f
                    ? "bg-orange-500 hover:bg-orange-600 text-white text-xs"
                    : "text-gray-500 border-gray-200 hover:border-orange-200 hover:text-orange-600 text-xs"
                }
              >
                {f === "todos" ? "Todos" : statusConfig[f]?.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-1">Nenhum orçamento encontrado</p>
            <p className="text-xs text-gray-400">
              {searchTerm || filter !== "todos"
                ? "Tente alterar os filtros de busca"
                : "Crie um orçamento na calculadora para vê-lo aqui"}
            </p>
          </div>
        )}

        {/* Orçamentos list */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((orc) => {
              const status = statusConfig[orc.status] ?? statusConfig.pendente;
              const resultado = orc.resultado as any;

              return (
                <motion.div
                  key={orc.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      {/* Left: Client info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <h3
                            className="text-sm font-bold text-gray-800 truncate"
                            style={{ fontFamily: "'Sora', sans-serif" }}
                          >
                            {orc.clienteNome}
                          </h3>
                          {/* Status badge - clickable to cycle */}
                          <button
                            onClick={() => cycleStatus(orc.id, orc.status)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium ${status.bgColor} ${status.color} hover:opacity-80 transition-opacity`}
                            title="Clique para alterar o status"
                          >
                            {status.icon}
                            {status.label}
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                          {orc.clienteCpf && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {orc.clienteCpf}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(orc.createdAt)}
                          </span>
                          {resultado?.nivelLabel && (
                            <span className="flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {resultado.nivelLabel}
                            </span>
                          )}
                          {resultado?.totalItens != null && (
                            <span>{resultado.totalItens} itens</span>
                          )}
                        </div>

                        {/* Fichas */}
                        {resultado?.fichasIdentificadas && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {(resultado.fichasIdentificadas as string[]).slice(0, 4).map((f: string) => (
                              <span
                                key={f}
                                className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full"
                              >
                                {f}
                              </span>
                            ))}
                            {(resultado.fichasIdentificadas as string[]).length > 4 && (
                              <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full">
                                +{(resultado.fichasIdentificadas as string[]).length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: Value and actions */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Valor</p>
                          <p
                            className="text-lg font-bold text-orange-600"
                            style={{ fontFamily: "'Sora', sans-serif" }}
                          >
                            {formatCurrency(orc.valorFinal)}
                          </p>
                          {orc.valorCalculado !== orc.valorFinal && (
                            <p className="text-[10px] text-gray-400 line-through">
                              {formatCurrency(orc.valorCalculado)}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Comprovante */}
                          {orc.comprovanteUrl ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(orc.comprovanteUrl!, "_blank")}
                              className="h-8 text-xs gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Ver Comprovante
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFileUpload(orc.id)}
                              disabled={uploadComprovanteMutation.isPending && uploadingId === orc.id}
                              className="h-8 text-xs gap-1 text-gray-500 border-gray-200 hover:border-orange-200 hover:text-orange-600"
                            >
                              {uploadComprovanteMutation.isPending && uploadingId === orc.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Upload className="w-3.5 h-3.5" />
                              )}
                              Comprovante
                            </Button>
                          )}

                          {/* Delete */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteId(orc.id)}
                            className="h-8 w-8 p-0 text-gray-400 border-gray-200 hover:text-red-500 hover:border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir orçamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O orçamento será permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
