import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Historico from "./pages/Historico";
import Login from "./pages/Login";
import Usuarios from "./pages/Usuarios";
import Empresas from "./pages/Empresas";
import MinhaEmpresa from "./pages/MinhaEmpresa";
import { useInternalAuth } from "./hooks/useInternalAuth";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

/** Aplica as CSS variables da empresa dinamicamente */
function EmpresaThemeInjector() {
  const { empresa } = useInternalAuth();

  useEffect(() => {
    const root = document.documentElement;
    if (empresa) {
      root.style.setProperty("--empresa-primary", empresa.corPrimaria);
      root.style.setProperty("--empresa-secondary", empresa.corSecundaria);
      root.style.setProperty("--empresa-text-primary", empresa.corTextoPrimaria);
    } else {
      // Defaults (Numer)
      root.style.setProperty("--empresa-primary", "#F97316");
      root.style.setProperty("--empresa-secondary", "#FB923C");
      root.style.setProperty("--empresa-text-primary", "#FFFFFF");
    }
  }, [empresa]);

  return null;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, refetch } = useInternalAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
          <p className="text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onSuccess={() => refetch()} />;
  }

  return <>{children}</>;
}

function LoginRoute() {
  const { isAuthenticated, refetch } = useInternalAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  return <Login onSuccess={() => { refetch(); navigate("/"); }} />;
}

function Router() {
  return (
    <Switch>
      {/* Rota /login pública: permite acesso com ?empresa=ID sem auth guard */}
      <Route path="/login" component={LoginRoute} />
      <Route>
        <AuthGuard>
          <EmpresaThemeInjector />
          <Switch>
            <Route path={"/"} component={Home} />
            <Route path={"/historico"} component={Historico} />
            <Route path={"/usuarios"} component={Usuarios} />
            <Route path={"/empresas"} component={Empresas} />
            <Route path={"/minha-empresa"} component={MinhaEmpresa} />
            <Route path={"/404"} component={NotFound} />
            <Route component={NotFound} />
          </Switch>
        </AuthGuard>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
