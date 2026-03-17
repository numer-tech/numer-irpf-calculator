import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useInternalAuth } from "@/hooks/useInternalAuth";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Plus, Pencil, Trash2, ArrowLeft, Upload, Palette,
  Phone, Mail, Globe, MapPin, User, FileText, X, Eye, KeyRound
} from "lucide-react";

export default function Empresas() {
  const { user, isSuperAdmin } = useInternalAuth();
  const [, navigate] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    nome: "", cnpj: "", crc: "", responsavel: "", email: "",
    telefone: "", whatsapp: "", endereco: "", site: "",
    corPrimaria: "#F97316", corSecundaria: "#FB923C", corTextoPrimaria: "#FFFFFF",
  });
  const [adminForm, setAdminForm] = useState({
    adminNome: "", adminEmail: "", adminSenha: "",
  });
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const empresasQuery = trpc.empresa.list.useQuery(undefined, { enabled: isSuperAdmin });
  const createMutation = trpc.empresa.create.useMutation({
    onSuccess: () => { empresasQuery.refetch(); resetForm(); },
  });
  const updateMutation = trpc.empresa.update.useMutation({
    onSuccess: () => { empresasQuery.refetch(); resetForm(); },
  });
  const deleteMutation = trpc.empresa.delete.useMutation({
    onSuccess: () => empresasQuery.refetch(),
  });
  const uploadLogoMutation = trpc.empresa.uploadLogo.useMutation({
    onSuccess: () => empresasQuery.refetch(),
  });

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-500">Acesso restrito ao super administrador.</p>
          <button onClick={() => navigate("/")} className="text-sm text-orange-500 hover:underline">
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  function resetForm() {
    setForm({
      nome: "", cnpj: "", crc: "", responsavel: "", email: "",
      telefone: "", whatsapp: "", endereco: "", site: "",
      corPrimaria: "#F97316", corSecundaria: "#FB923C", corTextoPrimaria: "#FFFFFF",
    });
    setAdminForm({ adminNome: "", adminEmail: "", adminSenha: "" });
    setShowAdminPassword(false);
    setEditingId(null);
    setShowForm(false);
  }

  function handleEdit(empresa: any) {
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
    setAdminForm({ adminNome: "", adminEmail: "", adminSenha: "" });
    setEditingId(empresa.id);
    setShowForm(true);
  }

  function handleSubmit() {
    if (!form.nome.trim()) return;
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...form });
    } else {
      // Ao criar, incluir dados do admin se preenchidos
      const payload: any = { ...form };
      if (adminForm.adminNome && adminForm.adminEmail && adminForm.adminSenha) {
        payload.adminNome = adminForm.adminNome;
        payload.adminEmail = adminForm.adminEmail;
        payload.adminSenha = adminForm.adminSenha;
      }
      createMutation.mutate(payload);
    }
  }

  function handleLogoUpload(empresaId: number, file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadLogoMutation.mutate({
        id: empresaId,
        fileBase64: base64,
        fileName: file.name,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  }

  const empresas = empresasQuery.data ?? [];
  const isCreating = !editingId;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <Building2 className="w-6 h-6" style={{ color: "var(--empresa-primary, #F97316)" }} />
            <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>
              Empresas / Escritórios
            </h1>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
            style={{ backgroundColor: "var(--empresa-primary, #F97316)" }}
          >
            <Plus className="w-4 h-4" />
            Nova Empresa
          </button>
        </div>
      </div>

      <div className="container py-6">
        {/* Formulário */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingId ? "Editar Empresa" : "Nova Empresa"}
                </h2>
                <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Dados da Empresa */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nome da Empresa *</label>
                  <input
                    type="text" value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="Ex: Numer Contabilidade"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">CNPJ</label>
                  <input
                    type="text" value={form.cnpj}
                    onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="00.000.000/0001-00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">CRC</label>
                  <input
                    type="text" value={form.crc}
                    onChange={(e) => setForm({ ...form, crc: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="CRC-XX 000000/O"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Responsável</label>
                  <input
                    type="text" value={form.responsavel}
                    onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="Nome do contador responsável"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">E-mail da Empresa</label>
                  <input
                    type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="contato@empresa.com.br"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Telefone</label>
                  <input
                    type="text" value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="(00) 0000-0000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp</label>
                  <input
                    type="text" value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Site</label>
                  <input
                    type="text" value={form.site}
                    onChange={(e) => setForm({ ...form, site: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="www.empresa.com.br"
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Endereço</label>
                  <input
                    type="text" value={form.endereco}
                    onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="Rua, número, cidade - UF"
                  />
                </div>
              </div>

              {/* Cores */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Identidade Visual
                </h3>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cor Primária</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color" value={form.corPrimaria}
                        onChange={(e) => setForm({ ...form, corPrimaria: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                      />
                      <input
                        type="text" value={form.corPrimaria}
                        onChange={(e) => setForm({ ...form, corPrimaria: e.target.value })}
                        className="w-24 px-2 py-1 border border-gray-200 rounded text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cor Secundária</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color" value={form.corSecundaria}
                        onChange={(e) => setForm({ ...form, corSecundaria: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                      />
                      <input
                        type="text" value={form.corSecundaria}
                        onChange={(e) => setForm({ ...form, corSecundaria: e.target.value })}
                        className="w-24 px-2 py-1 border border-gray-200 rounded text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cor do Texto</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color" value={form.corTextoPrimaria}
                        onChange={(e) => setForm({ ...form, corTextoPrimaria: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                      />
                      <input
                        type="text" value={form.corTextoPrimaria}
                        onChange={(e) => setForm({ ...form, corTextoPrimaria: e.target.value })}
                        className="w-24 px-2 py-1 border border-gray-200 rounded text-xs font-mono"
                      />
                    </div>
                  </div>
                  {/* Preview */}
                  <div className="flex items-end">
                    <div
                      className="px-4 py-2 rounded-lg text-sm font-medium"
                      style={{
                        background: `linear-gradient(135deg, ${form.corPrimaria}, ${form.corSecundaria})`,
                        color: form.corTextoPrimaria,
                      }}
                    >
                      Preview da Cor
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção: Usuário Admin Master (apenas na criação) */}
              {isCreating && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                    <KeyRound className="w-4 h-4" /> Usuário Administrador (Master)
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Defina o usuário que será o administrador desta empresa. Ele poderá gerenciar usuários, configurações e orçamentos.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nome do Admin *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text" value={adminForm.adminNome}
                          onChange={(e) => setAdminForm({ ...adminForm, adminNome: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                          placeholder="Nome completo"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">E-mail do Admin *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email" value={adminForm.adminEmail}
                          onChange={(e) => setAdminForm({ ...adminForm, adminEmail: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                          placeholder="admin@empresa.com.br"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Senha do Admin *</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showAdminPassword ? "text" : "password"}
                          value={adminForm.adminSenha}
                          onChange={(e) => setAdminForm({ ...adminForm, adminSenha: e.target.value })}
                          className="w-full pl-9 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                          placeholder="Mínimo 6 caracteres"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPassword(!showAdminPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {adminForm.adminNome && adminForm.adminEmail && adminForm.adminSenha && adminForm.adminSenha.length >= 6 && (
                    <div className="mt-2 p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-700">
                        O usuário <strong>{adminForm.adminNome}</strong> ({adminForm.adminEmail}) será criado como administrador desta empresa.
                      </p>
                    </div>
                  )}
                  {adminForm.adminSenha && adminForm.adminSenha.length > 0 && adminForm.adminSenha.length < 6 && (
                    <div className="mt-2 p-2 bg-amber-50 rounded-lg">
                      <p className="text-xs text-amber-700">
                        A senha deve ter no mínimo 6 caracteres.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Erro da mutation */}
              {(createMutation.error || updateMutation.error) && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-700">
                    {createMutation.error?.message || updateMutation.error?.message}
                  </p>
                </div>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button onClick={resetForm} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-6 py-2 text-sm text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "var(--empresa-primary, #F97316)" }}
                >
                  {createMutation.isPending || updateMutation.isPending ? "Salvando..." : editingId ? "Salvar Alterações" : "Criar Empresa"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de empresas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {empresas.map((empresa: any) => (
            <motion.div
              key={empresa.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Header com cor da empresa */}
              <div
                className="p-4 flex items-center gap-3"
                style={{
                  background: `linear-gradient(135deg, ${empresa.corPrimaria}, ${empresa.corSecundaria})`,
                  color: empresa.corTextoPrimaria,
                }}
              >
                {empresa.logoUrl ? (
                  <img src={empresa.logoUrl} alt={empresa.nome} className="w-10 h-10 rounded-lg object-contain bg-white/20 p-1" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">{empresa.nome}</h3>
                  {empresa.responsavel && (
                    <p className="text-xs opacity-80 truncate">{empresa.responsavel}</p>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-2">
                {empresa.cnpj && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    <span>{empresa.cnpj}</span>
                  </div>
                )}
                {empresa.email && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{empresa.email}</span>
                  </div>
                )}
                {empresa.telefone && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{empresa.telefone}</span>
                  </div>
                )}
                {empresa.site && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Globe className="w-3.5 h-3.5 text-gray-400" />
                    <span>{empresa.site}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center gap-1 border-t border-gray-100">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${empresa.ativo ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {empresa.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>

              {/* Ações */}
              <div className="px-4 pb-4 flex items-center gap-2">
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload(empresa.id, file);
                    }}
                  />
                  <span className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    Logo
                  </span>
                </label>
                <button
                  onClick={() => handleEdit(empresa)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (confirm("Desativar esta empresa?")) {
                      deleteMutation.mutate({ id: empresa.id });
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {empresas.length === 0 && !empresasQuery.isLoading && (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Nenhuma empresa cadastrada ainda.</p>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="mt-3 text-sm font-medium hover:underline"
              style={{ color: "var(--empresa-primary, #F97316)" }}
            >
              Cadastrar primeira empresa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
