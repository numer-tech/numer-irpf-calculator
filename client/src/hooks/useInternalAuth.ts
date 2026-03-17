import { trpc } from "@/lib/trpc";
import { useCallback } from "react";

export type EmpresaData = {
  id: number;
  nome: string;
  logoUrl: string | null;
  corPrimaria: string;
  corSecundaria: string;
  corTextoPrimaria: string;
  responsavel: string | null;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  cnpj: string | null;
  crc: string | null;
  endereco: string | null;
  site: string | null;
  configProposta: any;
  configPrecos: any;
  configDescontos: any;
};

export function useInternalAuth() {
  const { data: user, isLoading, refetch } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin" || user?.role === "superadmin",
    isSuperAdmin: user?.role === "superadmin",
    empresa: (user?.empresa as EmpresaData | null) ?? null,
    logout,
    refetch,
  };
}
