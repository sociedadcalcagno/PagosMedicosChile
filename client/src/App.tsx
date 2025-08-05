import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Users from "@/pages/Users";
import Doctors from "@/pages/Doctors.tsx";
import Services from "@/pages/Services.tsx";
import Rules from "@/pages/Rules.tsx";
import Reports from "@/pages/Reports.tsx";
import Profile from "@/pages/Profile";
import DoctorDashboard from "@/pages/DoctorDashboard";
import MedicalAttentions from "@/pages/MedicalAttentions";
import CalculatePayments from "@/pages/CalculatePayments";
import ProcessPayments from "@/pages/ProcessPayments";
import type { User } from "@shared/schema";

function Router() {
  const { user, isLoading } = useAuth() as { user: User | undefined; isLoading: boolean; isAuthenticated: boolean };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show login page if no user authenticated
  if (!user) {
    return <Login />;
  }

  // Route users based on their profile
  if (user.profile === "user") {
    // Regular users (doctors) get their own dashboard
    return <DoctorDashboard />;
  }

  // Admin and supervisors get the management layout with appropriate modules
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/usuarios" component={Users} />
        <Route path="/medicos" component={Doctors} />
        <Route path="/prestaciones" component={Services} />
        <Route path="/reglas" component={Rules} />
        <Route path="/atenciones-medicas" component={MedicalAttentions} />
        <Route path="/calcular-pagos" component={CalculatePayments} />
        <Route path="/procesar-pagos" component={ProcessPayments} />
        <Route path="/reportes" component={Reports} />
        <Route path="/perfil" component={Profile} />
        <Route path="/configuracion" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
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
