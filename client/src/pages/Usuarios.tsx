import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useInternalAuth } from "@/hooks/useInternalAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  UserPlus,
  Pencil,
  Trash2,
  KeyRound,
  Loader2,
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react";
import Header from "@/components/Header";
import { useIRPFCalculator } from "@/hooks/useIRPFCalculator";

type UsuarioForm = {
  nome: string;
  email: string;
  senha: string;
  role: "user" | "admin";
};

type ResetSenhaForm = {
  novaSenha: string;
  confirmar: string;
};

export default function Usuarios() {
  const { user, isAdmin, logout } = useInternalAuth();
  const [, navigate] = useLocation();
  const { resetAll, pricingConfig, updateItemPreco, updateValorBase, resetConfig } = useIRPFCalculator();
  const [showSettings, setShowSettings] = useState(false);

  // Redirecionar se não for admin
  if (user && !isAdmin) {
    navigate("/");
    return null;
  }

  const utils = trpc.useUtils();

  // Queries
  const { data: usuarios, isLoading } = trpc.usuario.list.useQuery();

  // Mutations
  const createMutation = trpc.usuario.create.useMutation({
    onSuccess: () => {
      toast.success("Usuário criado com sucesso!");
      utils.usuario.list.invalidate();
      setShowCreate(false);
      setForm({ nome: "", email: "", senha: "", role: "user" });
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.usuario.update.useMutation({
    onSuccess: () => {
      toast.success("Usuário atualizado!");
      utils.usuario.list.invalidate();
      setShowEdit(false);
      setEditUser(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.usuario.delete.useMutation({
    onSuccess: () => {
      toast.success("Usuário excluído!");
      utils.usuario.list.invalidate();
      setDeleteId(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const resetSenhaMutation = trpc.usuario.resetSenha.useMutation({
    onSuccess: () => {
      toast.success("Senha redefinida com sucesso!");
      setShowResetSenha(false);
      setResetUser(null);
      setResetForm({ novaSenha: "", confirmar: "" });
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleAtivoMutation = trpc.usuario.update.useMutation({
    onSuccess: () => {
      utils.usuario.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  // State
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showResetSenha, setShowResetSenha] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editUser, setEditUser] = useState<any>(null);
  const [resetUser, setResetUser] = useState<any>(null);
  const [form, setForm] = useState<UsuarioForm>({ nome: "", email: "", senha: "", role: "user" });
  const [editForm, setEditForm] = useState<Partial<UsuarioForm & { ativo: boolean }>>({});
  const [resetForm, setResetForm] = useState<ResetSenhaForm>({ novaSenha: "", confirmar: "" });

  const handleCreate = () => {
    if (!form.nome || !form.email || !form.senha) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (form.senha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    createMutation.mutate(form);
  };

  const handleEdit = () => {
    if (!editUser) return;
    updateMutation.mutate({ id: editUser.id, ...editForm });
  };

  const handleResetSenha = () => {
    if (!resetUser) return;
    if (resetForm.novaSenha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (resetForm.novaSenha !== resetForm.confirmar) {
      toast.error("As senhas não coincidem");
      return;
    }
    resetSenhaMutation.mutate({ id: resetUser.id, novaSenha: resetForm.novaSenha });
  };

  const totalUsuarios = usuarios?.length ?? 0;
  const totalAdmins = usuarios?.filter((u) => u.role === "admin").length ?? 0;
  const totalAtivos = usuarios?.filter((u) => u.ativo).length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        onReset={resetAll}
        onOpenSettings={() => setShowSettings(true)}
        onOpenHistorico={() => navigate("/historico")}
        userName={user?.nome}
        userRole={user?.role}
        onLogout={logout}
      />

      {/* Hero */}
      <div className="relative overflow-hidden gradient-empresa">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/30" />
          <div className="absolute left-1/3 -bottom-10 w-60 h-60 rounded-full bg-white/20" />
        </div>
        <div className="container relative py-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-2"
          >
            <h2
              className="text-xl sm:text-2xl font-bold text-white mb-1"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Gerenciamento de Usuários
            </h2>
            <p className="text-sm text-white/80">
              Cadastre e gerencie os membros da equipe que têm acesso à calculadora.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-empresa-lighter flex items-center justify-center">
              <Users className="w-5 h-5 text-empresa" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalUsuarios}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalAdmins}</p>
              <p className="text-xs text-gray-500">Admins</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalAtivos}</p>
              <p className="text-xs text-gray-500">Ativos</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800" style={{ fontFamily: "'Sora', sans-serif" }}>
              Usuários cadastrados
            </h3>
            <Button
              onClick={() => setShowCreate(true)}
              className="bg-empresa hover:opacity-90 text-empresa-on gap-2 h-9 text-sm"
            >
              <UserPlus className="w-4 h-4" />
              Novo usuário
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-empresa" />
            </div>
          ) : !usuarios || usuarios.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum usuário cadastrado</p>
              <p className="text-xs mt-1">Clique em "Novo usuário" para começar</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {usuarios.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-empresa-light flex items-center justify-center text-empresa font-semibold text-sm flex-shrink-0">
                      {u.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{u.nome}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        u.role === "admin"
                          ? "border-purple-200 bg-purple-50 text-purple-700 text-xs"
                          : "border-gray-200 bg-gray-50 text-gray-600 text-xs"
                      }
                    >
                      {u.role === "admin" ? "Admin" : "Usuário"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        u.ativo
                          ? "border-green-200 bg-green-50 text-green-700 text-xs"
                          : "border-red-200 bg-red-50 text-red-600 text-xs"
                      }
                    >
                      {u.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-empresa"
                        title="Editar"
                        onClick={() => {
                          setEditUser(u);
                          setEditForm({ nome: u.nome, email: u.email, role: u.role as "user" | "admin", ativo: u.ativo });
                          setShowEdit(true);
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-blue-500"
                        title="Redefinir senha"
                        onClick={() => {
                          setResetUser(u);
                          setResetForm({ novaSenha: "", confirmar: "" });
                          setShowResetSenha(true);
                        }}
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-red-500"
                        title="Excluir"
                        onClick={() => setDeleteId(u.id)}
                        disabled={u.id === user?.id}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Criar usuário */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Sora', sans-serif" }}>Novo usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nome completo</Label>
              <Input
                placeholder="Ex: Maria Silva"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input
                type="email"
                placeholder="maria@numer.com.br"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Senha inicial</Label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Perfil</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as "user" | "admin" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário — vê apenas seus orçamentos</SelectItem>
                  <SelectItem value="admin">Admin — vê todos os orçamentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="bg-empresa hover:opacity-90 text-empresa-on"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar usuário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar usuário */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Sora', sans-serif" }}>Editar usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nome completo</Label>
              <Input
                value={editForm.nome ?? ""}
                onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={editForm.email ?? ""}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Perfil</Label>
              <Select
                value={editForm.role ?? "user"}
                onValueChange={(v) => setEditForm({ ...editForm, role: v as "user" | "admin" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={editForm.ativo ? "ativo" : "inativo"}
                onValueChange={(v) => setEditForm({ ...editForm, ativo: v === "ativo" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleEdit}
              disabled={updateMutation.isPending}
              className="bg-empresa hover:opacity-90 text-empresa-on"
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Redefinir senha */}
      <Dialog open={showResetSenha} onOpenChange={setShowResetSenha}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Sora', sans-serif" }}>
              Redefinir senha — {resetUser?.nome}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nova senha</Label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={resetForm.novaSenha}
                onChange={(e) => setResetForm({ ...resetForm, novaSenha: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Confirmar nova senha</Label>
              <Input
                type="password"
                placeholder="Repita a senha"
                value={resetForm.confirmar}
                onChange={(e) => setResetForm({ ...resetForm, confirmar: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetSenha(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleResetSenha}
              disabled={resetSenhaMutation.isPending}
              className="bg-empresa hover:opacity-90 text-empresa-on"
            >
              {resetSenhaMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Redefinir senha"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O usuário perderá o acesso imediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
