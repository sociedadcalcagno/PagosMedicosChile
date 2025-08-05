import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Users from "@/pages/Users";
import Doctors from "@/pages/Doctors.tsx";
import Services from "@/pages/Services.tsx";
import Rules from "@/pages/Rules.tsx";
import Reports from "@/pages/Reports.tsx";
import Profile from "@/pages/Profile";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/usuarios" component={Users} />
          <Route path="/medicos" component={Doctors} />
          <Route path="/prestaciones" component={Services} />
          <Route path="/reglas" component={Rules} />
          <Route path="/reportes" component={Reports} />
          <Route path="/perfil" component={Profile} />
          <Route path="/configuracion" component={Home} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
