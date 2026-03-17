import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useInternalAuth } from "@/hooks/useInternalAuth";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Plus, Pencil, Trash2, ArrowLeft, Upload, Palette,
  Phone, Mail, Globe, FileText, X, KeyRound, Users, UserPlus,
  Eye, EyeOff, ChevronDown, ChevronUp, Shield, User, Copy, Check,
  Link as LinkIcon
} from "lucide-react";
import { toast } from "sonner";

// ─── Subcomponente: Painel de Usuários de uma Empresa ─────────────────────────
function EmpresaUsuariosPanel({ empresa }: { empresa: any }) {
  const [showAddUser, setShowAddUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({ nome: "", email: "", senha: "", role: "user" as "user" | "admin" });
  const [resetTarget, setResetTarget] = useState<number | null>(null);
  const [newSenha, setNewSenha] = useState("");
  const [showNewSenha, setShowNewSenha] = useState(false);

  const utils = trpc.useUtils();

  const usuariosQuery = trpc.usuario.listByEmpresa.useQuery(
    { empresaId: empresa.id },
    { staleTime: 30_000 }
  );

  const createMutation = trpc.usuario.create.useMutation({
    onSuccess: () => {
      utils.usuario.listByEmpresa.invalidate({ empresaId: empresa.id });
      setNewUser({ nome: "", email: "", senha: "", role: "user" });
      setShowAddUser(false);
      toast.success("Usuário criado com sucesso!");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.usuario.delete.useMutation({
    onSuccess: () => {
      utils.usuario.listByEmpresa.invalidate({ empresaId: empresa.id });
      toast.success("Usuário removido.");
    },
    onError: (err) => toast.error(err.message),
  });

  const resetSenhaMutation = trpc.usuario.resetSenha.useMutation({
    onSuccess: () => {
      setResetTarget(null);
      setNewSenha("");
      toast.success("Senha redefinida com sucesso!");
    },
    onError: (err) => toast.error(err.message),
  });

  const usuarios = usuariosQuery.data ?? [];

  function handleCreateUser() {
    if (!newUser.nome || !newUser.email || !newUser.senha) {
      toast.error("Preencha todos os campos");
      return;
    }
    createMutation.mutate({
      nome: newUser.nome,
      email: newUser.email,
      senha: newUser.senha,
      role: newUser.role,
      empresaId: empresa.id,
    });
  }

  const roleLabel = (role: string) => {
    if (role === "superadmin") return { label: "Super Admin", color: "bg-purple-100 text-purple-700" };
    if (role === "admin") return { label: "Admin", color: "bg-blue-100 text-blue-700" };
    return { label: "Usuário", color: "bg-gray-100 text-gray-600" };
  };

  return (
    <div className="border-t border-gray-100 bg-gray-50/50">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">
              Usuários ({usuarios.length})
            </span>
          </div>
          <button
            onClick={() => setShowAddUser(!showAddUser)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white rounded-lg transition-colors"
            style={{ backgroundColor: empresa.corPrimaria }}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Novo Usuário
          </button>
        </div>

        {/* Formulário de novo usuário */}
        <AnimatePresence>
          {showAddUser && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 p-3 bg-white rounded-xl border border-gray-200 space-y-2 overflow-hidden"
            >
              <p className="text-xs font-semibold text-gray-600 mb-2">Novo usuário para {empresa.nome}</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Nome *</label>
                  <input
                    type="text" value={newUser.nome}
                    onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-300"
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Perfil</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as "user" | "admin" })}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-300"
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">E-mail *</label>
                <input
                  type="email" value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-300"
                  placeholder="email@empresa.com.br"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Senha * (mín. 6 caracteres)</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newUser.senha}
                    onChange={(e) => setNewUser({ ...newUser, senha: e.target.value })}
                    className="w-full px-2 py-1.5 pr-8 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-300"
                    placeholder="Senha de acesso"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setShowAddUser(false); setNewUser({ nome: "", email: "", senha: "", role: "user" }); }}
                  className="flex-1 px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateUser}
                  disabled={createMutation.isPending}
                  className="flex-1 px-3 py-1.5 text-xs text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  style={{ backgroundColor: empresa.corPrimaria }}
                >
                  {createMutation.isPending ? "Criando..." : "Criar Usuário"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de usuários */}
        {usuariosQuery.isLoading ? (
          <div className="text-center py-4">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin mx-auto" />
          </div>
        ) : usuarios.length === 0 ? (
          <div className="text-center py-4 text-xs text-gray-400">
            Nenhum usuário cadastrado nesta empresa.
          </div>
        ) : (
          <div className="space-y-2">
            {usuarios.map((u: any) => {
              const { label, color } = roleLabel(u.role);
              const isResetting = resetTarget === u.id;
              return (
                <div
                  key={u.id}
                  className="bg-white rounded-xl border border-gray-100 p-3"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                      style={{ backgroundColor: empresa.corPrimaria + "CC" }}
                    >
                      {u.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-semibold text-gray-800 truncate">{u.nome}</p>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium ${color}`}>
                          {label}
                        </span>
                        {!u.ativo && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-red-50 text-red-600">
                            Inativo
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => {
                          setResetTarget(isResetting ? null : u.id);
                          setNewSenha("");
                        }}
                        title="Redefinir senha"
                        className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                      {u.role !== "superadmin" && (
                        <button
                          onClick={() => {
                            if (confirm(`Remover ${u.nome} desta empresa?`)) {
                              deleteMutation.mutate({ id: u.id });
                            }
                          }}
                          title="Remover usuário"
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Painel de reset de senha */}
                  <AnimatePresence>
                    {isResetting && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 pt-2 border-t border-gray-100 overflow-hidden"
                      >
                        <p className="text-[10px] text-gray-500 mb-1.5">Nova senha para {u.nome}</p>
                        <div className="flex gap-1.5">
                          <div className="relative flex-1">
                            <input
                              type={showNewSenha ? "text" : "password"}
                              value={newSenha}
                              onChange={(e) => setNewSenha(e.target.value)}
                              placeholder="Mín. 6 caracteres"
                              className="w-full px-2 py-1.5 pr-7 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewSenha(!showNewSenha)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                              {showNewSenha ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              if (newSenha.length < 6) { toast.error("Senha deve ter mín. 6 caracteres"); return; }
                              resetSenhaMutation.mutate({ id: u.id, novaSenha: newSenha });
                            }}
                            disabled={resetSenhaMutation.isPending}
                            className="px-3 py-1.5 text-xs text-white font-medium rounded-lg disabled:opacity-50"
                            style={{ backgroundColor: empresa.corPrimaria }}
                          >
                            {resetSenhaMutation.isPending ? "..." : "Salvar"}
                          </button>
                          <button
                            onClick={() => { setResetTarget(null); setNewSenha(""); }}
                            className="px-2 py-1.5 text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Página principal: Empresas ───────────────────────────────────────────────
export default function Empresas() {
  const { isSuperAdmin } = useInternalAuth();
  const [, navigate] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
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
    onSuccess: () => { empresasQuery.refetch(); resetForm(); toast.success("Empresa criada!"); },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.empresa.update.useMutation({
    onSuccess: () => { empresasQuery.refetch(); resetForm(); toast.success("Empresa atualizada!"); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.empresa.delete.useMutation({
    onSuccess: () => empresasQuery.refetch(),
  });
  const uploadLogoMutation = trpc.empresa.uploadLogo.useMutation({
    onSuccess: () => { empresasQuery.refetch(); toast.success("Logo atualizada!"); },
  });

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-500">Acesso restrito ao super administrador.</p>
          <button onClick={() => navigate("/")} className="text-sm text-empresa hover:underline">
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
      nome: empresa.nome ?? "", cnpj: empresa.cnpj ?? "", crc: empresa.crc ?? "",
      responsavel: empresa.responsavel ?? "", email: empresa.email ?? "",
      telefone: empresa.telefone ?? "", whatsapp: empresa.whatsapp ?? "",
      endereco: empresa.endereco ?? "", site: empresa.site ?? "",
      corPrimaria: empresa.corPrimaria ?? "#F97316",
      corSecundaria: empresa.corSecundaria ?? "#FB923C",
      corTextoPrimaria: empresa.corTextoPrimaria ?? "#FFFFFF",
    });
    setAdminForm({ adminNome: "", adminEmail: "", adminSenha: "" });
    setEditingId(empresa.id);
    setShowForm(true);
    setExpandedUsers(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSubmit() {
    if (!form.nome.trim()) return;
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...form });
    } else {
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
      uploadLogoMutation.mutate({ id: empresaId, fileBase64: base64, fileName: file.name, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  }

  function handleCopyLink(empresaId: number) {
    const url = `${window.location.origin}/login?empresa=${empresaId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(empresaId);
      toast.success("Link copiado!");
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  const empresas = empresasQuery.data ?? [];
  const isCreating = !editingId;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <Building2 className="w-6 h-6" style={{ color: "var(--empresa-primary, #F97316)" }} />
            <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>
              Empresas / Escritórios
            </h1>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {empresas.length} cadastrada{empresas.length !== 1 ? "s" : ""}
            </span>
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "Nome da Empresa *", key: "nome", placeholder: "Ex: Numer Contabilidade", type: "text" },
                  { label: "CNPJ", key: "cnpj", placeholder: "00.000.000/0001-00", type: "text" },
                  { label: "CRC", key: "crc", placeholder: "CRC-XX 000000/O", type: "text" },
                  { label: "Responsável", key: "responsavel", placeholder: "Nome do contador responsável", type: "text" },
                  { label: "E-mail da Empresa", key: "email", placeholder: "contato@empresa.com.br", type: "email" },
                  { label: "Telefone", key: "telefone", placeholder: "(00) 0000-0000", type: "text" },
                  { label: "WhatsApp", key: "whatsapp", placeholder: "(00) 00000-0000", type: "text" },
                  { label: "Site", key: "site", placeholder: "www.empresa.com.br", type: "text" },
                  { label: "Endereço", key: "endereco", placeholder: "Rua, número, cidade - UF", type: "text" },
                ].map(({ label, key, placeholder, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <input
                      type={type} value={(form as any)[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>

              {/* Cores */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Identidade Visual
                </h3>
                <div className="flex flex-wrap gap-4">
                  {[
                    { label: "Cor Primária", key: "corPrimaria" },
                    { label: "Cor Secundária", key: "corSecundaria" },
                    { label: "Cor do Texto", key: "corTextoPrimaria" },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color" value={(form as any)[key]}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                          className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                        />
                        <input
                          type="text" value={(form as any)[key]}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                          className="w-24 px-2 py-1 border border-gray-200 rounded text-xs font-mono"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex items-end">
                    <div
                      className="px-4 py-2 rounded-lg text-sm font-medium"
                      style={{ background: `linear-gradient(135deg, ${form.corPrimaria}, ${form.corSecundaria})`, color: form.corTextoPrimaria }}
                    >
                      Preview da Cor
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Master (apenas na criação) */}
              {isCreating && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                    <KeyRound className="w-4 h-4" /> Usuário Administrador (Master)
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Defina o usuário que será o administrador desta empresa.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nome do Admin</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text" value={adminForm.adminNome}
                          onChange={(e) => setAdminForm({ ...adminForm, adminNome: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                          placeholder="Nome completo"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">E-mail do Admin</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email" value={adminForm.adminEmail}
                          onChange={(e) => setAdminForm({ ...adminForm, adminEmail: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                          placeholder="admin@empresa.com.br"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Senha do Admin</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showAdminPassword ? "text" : "password"}
                          value={adminForm.adminSenha}
                          onChange={(e) => setAdminForm({ ...adminForm, adminSenha: e.target.value })}
                          className="w-full pl-9 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                          placeholder="Mínimo 6 caracteres"
                        />
                        <button type="button" onClick={() => setShowAdminPassword(!showAdminPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(createMutation.error || updateMutation.error) && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-700">{createMutation.error?.message || updateMutation.error?.message}</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  <img src={empresa.logoUrl} alt={empresa.nome} className="w-12 h-12 rounded-xl object-contain bg-white/20 p-1 flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-base truncate">{empresa.nome}</h3>
                  {empresa.responsavel && <p className="text-xs opacity-80 truncate">{empresa.responsavel}</p>}
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${empresa.ativo ? "bg-white/20" : "bg-red-200/50 text-red-100"}`}>
                  {empresa.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>

              {/* Dados da empresa */}
              <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {empresa.cnpj && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 col-span-2">
                    <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{empresa.cnpj}</span>
                  </div>
                )}
                {empresa.email && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{empresa.email}</span>
                  </div>
                )}
                {empresa.telefone && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{empresa.telefone}</span>
                  </div>
                )}
                {empresa.site && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 col-span-2">
                    <Globe className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{empresa.site}</span>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="px-4 pb-3 flex items-center gap-1.5 flex-wrap border-t border-gray-50 pt-3">
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(empresa.id, f); }}
                  />
                  <span className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <Upload className="w-3.5 h-3.5" /> Logo
                  </span>
                </label>
                <button
                  onClick={() => handleCopyLink(empresa.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Copiar link de acesso"
                >
                  {copiedId === empresa.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <LinkIcon className="w-3.5 h-3.5" />}
                  {copiedId === empresa.id ? "Copiado!" : "Link"}
                </button>
                <button
                  onClick={() => handleEdit(empresa)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  onClick={() => setExpandedUsers(expandedUsers === empresa.id ? null : empresa.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg transition-colors"
                  style={{
                    backgroundColor: expandedUsers === empresa.id ? empresa.corPrimaria + "20" : "#f9fafb",
                    color: expandedUsers === empresa.id ? empresa.corPrimaria : "#4b5563",
                  }}
                >
                  <Users className="w-3.5 h-3.5" />
                  Usuários
                  {expandedUsers === empresa.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => { if (confirm("Desativar esta empresa?")) deleteMutation.mutate({ id: empresa.id }); }}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Painel de usuários expandido */}
              <AnimatePresence>
                {expandedUsers === empresa.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <EmpresaUsuariosPanel empresa={empresa} />
                  </motion.div>
                )}
              </AnimatePresence>
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
