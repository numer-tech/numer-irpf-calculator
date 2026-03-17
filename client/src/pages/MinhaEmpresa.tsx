import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useInternalAuth } from "@/hooks/useInternalAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Building2, Upload, Palette, Phone, Mail, Globe,
  MapPin, User, FileText, Save, Loader2, Eye, Check,
} from "lucide-react";

export default function MinhaEmpresa() {
  const { user, empresa, isAdmin, refetch } = useInternalAuth();
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nome: "", cnpj: "", crc: "", responsavel: "", email: "",
    telefone: "", whatsapp: "", endereco: "", site: "",
    corPrimaria: "#F97316", corSecundaria: "#FB923C", corTextoPrimaria: "#FFFFFF",
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (empresa) {
      setForm({
        nome: empresa.nome ?? "",
        cnpj: empresa.cnpj ?? "",
        crc: empresa.crc ?? "",
        responsavel: empresa.responsavel ?? "",
        email: empresa.email ?? "",
        telefone: empresa.telefone ?? "",
        whatsapp: empresa.whatsapp ?? "",
        endereco: empresa.endereco ?? "",
        site: empresa.site ?? "",
        corPrimaria: empresa.corPrimaria ?? "#F97316",
        corSecundaria: empresa.corSecundaria ?? "#FB923C",
        corTextoPrimaria: empresa.corTextoPrimaria ?? "#FFFFFF",
      });
      setHasChanges(false);
    }
  }, [empresa]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const updateMutation = trpc.empresa.update.useMutation({
    onSuccess: () => {
      toast.success("Dados da empresa atualizados!");
      setHasChanges(false);
      refetch();
    },
    onError: (err) => toast.error("Erro: " + err.message),
  });

  const uploadLogoMutation = trpc.empresa.uploadLogo.useMutation({
    onSuccess: () => {
      toast.success("Logo atualizado!");
      refetch();
    },
    onError: (err) => toast.error("Erro ao enviar logo: " + err.message),
  });

  const handleSave = () => {
    if (!empresa) return;
    updateMutation.mutate({
      id: empresa.id,
      nome: form.nome || undefined,
      cnpj: form.cnpj || null,
      crc: form.crc || null,
      responsavel: form.responsavel || null,
      email: form.email || null,
      telefone: form.telefone || null,
      whatsapp: form.whatsapp || null,
      endereco: form.endereco || null,
      site: form.site || null,
      corPrimaria: form.corPrimaria,
      corSecundaria: form.corSecundaria,
      corTextoPrimaria: form.corTextoPrimaria,
    });
  };

  const handleLogoUpload = (file: File) => {
    if (!empresa) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadLogoMutation.mutate({
        id: empresa.id,
        fileBase64: base64,
        fileName: file.name,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  if (!isAdmin || !empresa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-500">Acesso restrito a administradores.</p>
          <button onClick={() => navigate("/")} className="text-sm text-empresa hover:underline">
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  const corPrimaria = empresa.corPrimaria || "#F97316";
  const corSecundaria = empresa.corSecundaria || "#FB923C";
  const corTextoPrimaria = empresa.corTextoPrimaria || "#FFFFFF";

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleLogoUpload(file);
          e.target.value = "";
        }}
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <Building2 className="w-6 h-6" style={{ color: corPrimaria }} />
            <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>
              Minha Empresa
            </h1>
          </div>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateMutation.isPending}
            className="gap-2 text-white"
            style={{ backgroundColor: corPrimaria }}
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Salvar Alterações
          </Button>
        </div>
      </div>

      <div className="container py-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna esquerda - Preview */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-20"
            >
              {/* Preview do header */}
              <div
                className="p-6 text-center"
                style={{
                  background: `linear-gradient(135deg, ${form.corPrimaria}, ${form.corSecundaria})`,
                  color: form.corTextoPrimaria,
                }}
              >
                {empresa.logoUrl ? (
                  <img
                    src={empresa.logoUrl}
                    alt={form.nome}
                    className="w-16 h-16 rounded-xl mx-auto mb-3 object-contain bg-white/10 p-1"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl mx-auto mb-3 bg-white/20 flex items-center justify-center">
                    <Building2 className="w-8 h-8" />
                  </div>
                )}
                <h3 className="font-bold text-lg" style={{ fontFamily: "'Sora', sans-serif" }}>
                  {form.nome || "Nome da Empresa"}
                </h3>
                {form.responsavel && (
                  <p className="text-sm mt-1" style={{ opacity: 0.8 }}>{form.responsavel}</p>
                )}
              </div>

              <div className="p-4 space-y-3">
                {/* Upload logo */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadLogoMutation.isPending}
                >
                  {uploadLogoMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {empresa.logoUrl ? "Trocar Logo" : "Enviar Logo"}
                </Button>

                <Separator />

                {/* Info resumo */}
                <div className="space-y-2 text-xs text-gray-500">
                  {form.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span>{form.email}</span>
                    </div>
                  )}
                  {form.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{form.telefone}</span>
                    </div>
                  )}
                  {form.site && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-gray-400" />
                      <span>{form.site}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Coluna direita - Formulário */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados da empresa */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                <Building2 className="w-5 h-5" style={{ color: corPrimaria }} />
                Dados da Empresa
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-xs font-medium text-gray-600">Nome da Empresa *</Label>
                  <Input
                    value={form.nome}
                    onChange={(e) => updateField("nome", e.target.value)}
                    placeholder="Ex: Numer Contabilidade"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">CNPJ</Label>
                  <Input
                    value={form.cnpj}
                    onChange={(e) => updateField("cnpj", e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">CRC</Label>
                  <Input
                    value={form.crc}
                    onChange={(e) => updateField("crc", e.target.value)}
                    placeholder="CRC-XX 000000/O"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Responsável</Label>
                  <Input
                    value={form.responsavel}
                    onChange={(e) => updateField("responsavel", e.target.value)}
                    placeholder="Nome do contador responsável"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">E-mail</Label>
                  <Input
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="contato@empresa.com.br"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Telefone</Label>
                  <Input
                    value={form.telefone}
                    onChange={(e) => updateField("telefone", e.target.value)}
                    placeholder="(00) 0000-0000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">WhatsApp</Label>
                  <Input
                    value={form.whatsapp}
                    onChange={(e) => updateField("whatsapp", e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Site</Label>
                  <Input
                    value={form.site}
                    onChange={(e) => updateField("site", e.target.value)}
                    placeholder="www.empresa.com.br"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Endereço</Label>
                  <Input
                    value={form.endereco}
                    onChange={(e) => updateField("endereco", e.target.value)}
                    placeholder="Rua, número, cidade - UF"
                    className="mt-1"
                  />
                </div>
              </div>
            </motion.div>

            {/* Identidade Visual */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                <Palette className="w-5 h-5" style={{ color: corPrimaria }} />
                Identidade Visual
              </h2>

              <p className="text-xs text-gray-500 mb-4">
                As cores escolhidas serão aplicadas em todo o sistema: login, cabeçalho, propostas e documentos.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-medium text-gray-600">Cor Primária</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={form.corPrimaria}
                      onChange={(e) => updateField("corPrimaria", e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                    />
                    <Input
                      value={form.corPrimaria}
                      onChange={(e) => updateField("corPrimaria", e.target.value)}
                      className="w-28 font-mono text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Cor Secundária</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={form.corSecundaria}
                      onChange={(e) => updateField("corSecundaria", e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                    />
                    <Input
                      value={form.corSecundaria}
                      onChange={(e) => updateField("corSecundaria", e.target.value)}
                      className="w-28 font-mono text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Cor do Texto</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={form.corTextoPrimaria}
                      onChange={(e) => updateField("corTextoPrimaria", e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                    />
                    <Input
                      value={form.corTextoPrimaria}
                      onChange={(e) => updateField("corTextoPrimaria", e.target.value)}
                      className="w-28 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Preview das cores */}
              <div className="mt-4 flex flex-wrap gap-3">
                <div
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{
                    background: `linear-gradient(135deg, ${form.corPrimaria}, ${form.corSecundaria})`,
                    color: form.corTextoPrimaria,
                  }}
                >
                  Preview do Botão
                </div>
                <div
                  className="px-4 py-2 rounded-lg text-sm font-medium border"
                  style={{
                    borderColor: form.corPrimaria,
                    color: form.corPrimaria,
                  }}
                >
                  Preview Outline
                </div>
                <div
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: form.corPrimaria + "15",
                    color: form.corPrimaria,
                  }}
                >
                  Preview Badge
                </div>
              </div>
            </motion.div>

            {/* Botão salvar fixo no mobile */}
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:hidden fixed bottom-4 left-4 right-4 z-50"
              >
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="w-full gap-2 h-12 text-white shadow-lg"
                  style={{ backgroundColor: corPrimaria }}
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Salvar Alterações
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
