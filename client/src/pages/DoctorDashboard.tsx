import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
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
  Download,
} from "lucide-react";
import type { User } from "@shared/schema";
import AIChat from "@/components/AIChat";
import { apiRequest } from "@/lib/queryClient";

export default function DoctorDashboard() {
  const { user } = useAuth() as { user: User | undefined; isLoading: boolean; isAuthenticated: boolean };
  const [activeTab, setActiveTab] = useState("pagos");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { toast } = useToast();

  // Query para obtener los datos del doctor autenticado
  const { data: doctorProfile } = useQuery({
    queryKey: ['/api/user-doctor'],
    enabled: !!user,
  }) as { data: any };

  // Mutación para generar PDF de cartola
  const generateCartolaRDFMutation = useMutation({
    mutationFn: async () => {
      if (!doctorProfile?.id) throw new Error('Doctor profile not found');
      
      const response = await fetch(`/api/generate-payslip/${doctorProfile.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ month: selectedMonth, year: selectedYear })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate cartola');
      }
      
      const data = await response.json();
      
      if (data.pdfId && data.downloadUrl) {
        // Abrir el documento de liquidación en nueva ventana con diálogo de impresión
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          // Obtener el contenido HTML
          fetch(`/api/download-pdf/${data.pdfId}`)
            .then(response => response.text())
            .then(html => {
              newWindow.document.write(html);
              newWindow.document.close();
              
              // Agregar estilos adicionales optimizados para impresión
              const style = newWindow.document.createElement('style');
              style.textContent = `
                @media print {
                  body { margin: 0; }
                  .container { margin: 0; padding: 20px; }
                  @page { margin: 1cm; size: A4; }
                }
              `;
              newWindow.document.head.appendChild(style);
              
              // Abrir automáticamente el diálogo de impresión
              setTimeout(() => {
                newWindow.focus();
                newWindow.print();
              }, 1000);
            });
        }
        
        return data;
      } else {
        throw new Error('PDF generation failed - no PDF ID returned');
      }
    },
    onSuccess: () => {
      toast({
        title: "Cartola generada exitosamente",
        description: "Su liquidación se abrió en nueva pestaña con opción de impresión",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al generar cartola",
        description: error.message || "No se pudo generar la cartola",
        variant: "destructive",
      });
    },
  });

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
                <p className="text-sm text-gray-600">Genere y descargue sus reportes mensuales de liquidaciones</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Selección de período */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Seleccionar Período</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Mes</label>
                        <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar mes" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                              <SelectItem key={i + 1} value={(i + 1).toString()}>
                                {new Date(2025, i).toLocaleDateString('es-CL', { month: 'long' })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Año</label>
                        <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar año" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2026">2026</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Opciones de reportes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-2 border-green-200 bg-green-50">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="bg-green-100 p-3 rounded-full">
                            <FileText className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">Cartola de Liquidación</h3>
                            <p className="text-sm text-gray-600 mb-3">
                              Descargue su liquidación detallada del período seleccionado
                            </p>
                            <Button 
                              onClick={() => generateCartolaRDFMutation.mutate()}
                              disabled={generateCartolaRDFMutation.isPending}
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              {generateCartolaRDFMutation.isPending ? "Generando..." : "Generar Cartola"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-blue-200 bg-blue-50">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-3 rounded-full">
                            <BarChart3 className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">Análisis de Pagos</h3>
                            <p className="text-sm text-gray-600 mb-3">
                              Resumen estadístico de sus atenciones y participaciones
                            </p>
                            <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Ver Análisis
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Información del doctor */}
                  {doctorProfile && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">Información del Profesional</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Nombre:</span>
                          <p className="font-medium">{doctorProfile?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">RUT:</span>
                          <p className="font-medium">{doctorProfile?.rut || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Especialidad:</span>
                          <p className="font-medium">{doctorProfile?.specialtyName || 'No especificada'}</p>
                        </div>
                      </div>
                    </div>
                  )}
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