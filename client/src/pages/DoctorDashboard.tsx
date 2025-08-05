import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  Clock,
  FileText,
  TrendingUp,
  Calendar,
  Bot,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Heart,
  User as UserIcon,
  LogOut,
} from "lucide-react";
import type { User } from "@shared/schema";
import AIChat from "@/components/AIChat";

export default function DoctorDashboard() {
  const { user } = useAuth() as { user: User | undefined; isLoading: boolean; isAuthenticated: boolean };
  const [activeTab, setActiveTab] = useState("pagos");

  // Mock data for doctor's payments and participations
  const mockPayments = [
    {
      id: "pago-001",
      fecha: "2024-08-01",
      tipo: "Consulta Médica",
      paciente: "Juan Pérez",
      monto: 45000,
      estado: "Pagado",
      centro: "Clínica Las Condes",
    },
    {
      id: "pago-002",
      fecha: "2024-08-02",
      tipo: "Cirugía Menor",
      paciente: "María García",
      monto: 120000,
      estado: "Pendiente",
      centro: "Hospital Clínico",
    },
    {
      id: "pago-003",
      fecha: "2024-08-03",
      tipo: "Control Post-Operatorio",
      paciente: "Carlos López",
      monto: 35000,
      estado: "Procesando",
      centro: "Clínica Las Condes",
    },
  ];

  const mockParticipations = [
    {
      id: "part-001",
      fecha: "2024-08-01",
      procedimiento: "Consulta Cardiología",
      participacion: "80%",
      montoBase: 50000,
      montoDoctor: 40000,
      estado: "Confirmado",
    },
    {
      id: "part-002",
      fecha: "2024-08-02",
      procedimiento: "Electrocardiograma",
      participacion: "70%",
      montoBase: 25000,
      montoDoctor: 17500,
      estado: "Pendiente",
    },
  ];

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Pagado":
      case "Confirmado":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Procesando":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "Pagado":
      case "Confirmado":
        return <CheckCircle className="w-4 h-4" />;
      case "Pendiente":
        return <AlertCircle className="w-4 h-4" />;
      case "Procesando":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Heart className="text-blue-600 text-2xl" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Portal de Pagos Médicos
                  </h1>
                  <p className="text-sm text-gray-500">Panel del Médico</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* AI Agent Integration */}
              <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg px-4 py-2 text-white shadow-md">
                <div className="flex items-center space-x-2">
                  <Bot className="text-sm" />
                  <span className="text-sm font-medium">
                    Agente HonorariosMedicos
                  </span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>

              <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.profile || "Médico"}
                  </p>
                </div>
                {user?.profileImageUrl && (
                  <img
                    className="w-8 h-8 rounded-full object-cover"
                    src={user.profileImageUrl}
                    alt="User Avatar"
                  />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => (window.location.href = "/api/logout")}
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bienvenido, {user?.firstName}
          </h2>
          <p className="text-gray-600">
            Gestiona tus pagos, participaciones y revisa tu actividad médica.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total del Mes</p>
                  <p className="text-2xl font-bold text-gray-900">$200,000</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Atenciones</p>
                  <p className="text-2xl font-bold text-gray-900">15</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">$13,333</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pagos" className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Mis Pagos</span>
            </TabsTrigger>
            <TabsTrigger value="participaciones" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Participaciones</span>
            </TabsTrigger>
            <TabsTrigger value="reportes" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Reportes</span>
            </TabsTrigger>
            <TabsTrigger value="perfil" className="flex items-center space-x-2">
              <UserIcon className="w-4 h-4" />
              <span>Mi Perfil</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pagos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Pagos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPayments.map((pago) => (
                    <div
                      key={pago.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium text-gray-900">{pago.tipo}</p>
                            <p className="text-sm text-gray-500">
                              {pago.paciente} • {pago.centro}
                            </p>
                            <p className="text-xs text-gray-400">{pago.fecha}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            ${pago.monto.toLocaleString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(pago.estado)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(pago.estado)}
                            <span>{pago.estado}</span>
                          </div>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="participaciones" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Participaciones por Procedimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockParticipations.map((part) => (
                    <div
                      key={part.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium text-gray-900">{part.procedimiento}</p>
                            <p className="text-sm text-gray-500">
                              Participación: {part.participacion}
                            </p>
                            <p className="text-xs text-gray-400">{part.fecha}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            Base: ${part.montoBase.toLocaleString()}
                          </p>
                          <p className="font-bold text-gray-900">
                            Doctor: ${part.montoDoctor.toLocaleString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(part.estado)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(part.estado)}
                            <span>{part.estado}</span>
                          </div>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reportes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reportes de Actividad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                      <Calendar className="w-6 h-6 text-blue-600" />
                      <span>Reporte Mensual</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                      <BarChart3 className="w-6 h-6 text-green-600" />
                      <span>Análisis de Pagos</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                      <FileText className="w-6 h-6 text-purple-600" />
                      <span>Resumen Anual</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="perfil" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nombre</label>
                      <p className="font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="font-medium text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">RUT</label>
                      <p className="font-medium text-gray-900">{user?.rut || "No especificado"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Perfil</label>
                      <p className="font-medium text-gray-900 capitalize">{user?.profile}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Chat Component */}
      <AIChat />
    </div>
  );
}