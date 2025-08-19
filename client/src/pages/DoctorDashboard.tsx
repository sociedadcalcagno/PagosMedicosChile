import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  X,
} from "lucide-react";
import type { User } from "@shared/schema";
import AIChat from "@/components/AIChat";
import { apiRequest } from "@/lib/queryClient";

export default function DoctorDashboard() {
  const { user } = useAuth() as { user: User | undefined; isLoading: boolean; isAuthenticated: boolean };
  const [activeTab, setActiveTab] = useState("pagos");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPaymentDate, setSelectedPaymentDate] = useState<string | null>(null);
  const [showPaymentDateSelector, setShowPaymentDateSelector] = useState(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState<any>(null);
  const { toast } = useToast();

  // Query para obtener los datos del doctor autenticado
  const { data: doctorProfile } = useQuery({
    queryKey: ['/api/user-doctor'],
    enabled: !!user,
  }) as { data: any };

  // Query para obtener las estadísticas reales del doctor
  const { data: doctorStats } = useQuery({
    queryKey: ['/api/doctor-stats', doctorProfile?.id, selectedMonth, selectedYear],
    enabled: !!doctorProfile?.id,
  }) as { data: { totalAttentions: number; totalGross: number; totalNet: number; pendingCount: number; totalPaid: number; averageDaily: number } | undefined };

  // Query para obtener los pagos reales del doctor
  const { data: doctorPayments } = useQuery({
    queryKey: ['/api/doctor-payments', doctorProfile?.id],
    enabled: !!doctorProfile?.id,
  }) as { data: any[] | undefined };

  // Query para obtener TODAS las atenciones médicas PAGADAS (histórico completo)
  const { data: allPaidAttentions } = useQuery({
    queryKey: ['/api/doctor-all-paid-attentions', doctorProfile?.id],
    enabled: !!doctorProfile?.id,
  }) as { data: any[] | undefined };

  // Query para obtener atenciones médicas pagadas del mes actual
  const { data: paidAttentions } = useQuery({
    queryKey: ['/api/doctor-paid-attentions', doctorProfile?.id, selectedMonth, selectedYear],
    enabled: !!doctorProfile?.id,
  }) as { data: any[] | undefined };

  // Query para obtener atenciones detalladas calculadas (pendientes)
  const { data: pendingAttentions } = useQuery({
    queryKey: ['/api/doctor-attentions-detail', doctorProfile?.id, selectedMonth, selectedYear, 'calculated'],
    enabled: !!doctorProfile?.id,
  }) as { data: any[] | undefined };

  // Función para obtener detalles de un pago específico
  const getPaymentDetails = async (payment: any) => {
    try {
      const response = await fetch(`/api/doctor-paid-attentions/${doctorProfile?.id}/${payment.periodMonth || selectedMonth}/${payment.periodYear || selectedYear}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      return [];
    }
  };

  // Query para obtener todas las atenciones del mes
  const { data: allAttentions } = useQuery({
    queryKey: ['/api/doctor-attentions-detail', doctorProfile?.id, selectedMonth, selectedYear],
    enabled: !!doctorProfile?.id,
  }) as { data: any[] | undefined };

  // Query para obtener fechas de pago disponibles en el mes seleccionado
  const { data: paymentDatesData } = useQuery({
    queryKey: ['/api/payment-dates', doctorProfile?.id, selectedMonth, selectedYear],
    queryFn: async () => {
      if (!doctorProfile?.id) return { paymentDates: [], count: 0 };
      
      const response = await fetch(`/api/payment-dates/${doctorProfile.id}/${selectedMonth}/${selectedYear}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment dates');
      }
      
      return await response.json();
    },
    enabled: !!doctorProfile?.id && showPaymentDateSelector,
  }) as { data: { paymentDates: string[]; count: number; message: string } | undefined };

  // Mutación para generar PDF de cartola
  const generateCartolaRDFMutation = useMutation({
    mutationFn: async () => {
      if (!doctorProfile?.id) throw new Error('Doctor profile not found');
      
      const requestBody: any = { month: selectedMonth, year: selectedYear };
      if (selectedPaymentDate) {
        requestBody.paymentDate = selectedPaymentDate;
      }
      
      const response = await fetch(`/api/generate-payslip/${doctorProfile.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
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
    onSuccess: (data) => {
      toast({
        title: data.hasData === false ? "Cartola generada" : "Cartola generada exitosamente",
        description: data.hasData === false 
          ? `Se generó la cartola para ${selectedMonth}/${selectedYear}, pero no se encontraron atenciones para este período.`
          : `Su liquidación se abrió en nueva pestaña con opción de impresión (${data.attentionCount || 0} atenciones)`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al generar cartola",
        description: error.message.includes("No payroll data") 
          ? `No hay datos de liquidación disponibles para ${selectedMonth}/${selectedYear}. Prueba con otro período.`
          : error.message || "No se pudo generar la cartola",
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

  // Función para traducir estados de inglés a español
  const translateStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'processed': 'Procesado',
      'paid': 'Pagado',
      'pending': 'Pendiente',
      'calculating': 'Calculando',
      'calculated': 'Calculado',
      'approved': 'Aprobado',
      'rejected': 'Rechazado'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const getStatusColor = (estado: string) => {
    // Normalizar estado para comparación
    const normalizedEstado = translateStatus(estado);
    
    switch (normalizedEstado) {
      case "Pagado":
      case "Procesado":
      case "Confirmado":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pendiente":
      case "Calculando":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Procesando":
      case "Calculado":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Aprobado":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Rechazado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (estado: string) => {
    // Normalizar estado para comparación
    const normalizedEstado = translateStatus(estado);
    
    switch (normalizedEstado) {
      case "Pagado":
      case "Procesado":
      case "Confirmado":
      case "Aprobado":
        return <CheckCircle className="w-4 h-4" />;
      case "Pendiente":
      case "Calculando":
        return <AlertCircle className="w-4 h-4" />;
      case "Procesando":
      case "Calculado":
        return <Clock className="w-4 h-4" />;
      case "Rechazado":
        return <X className="w-4 h-4" />;
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
        <div className="mb-8 relative">
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Bienvenido, Dr. {doctorProfile?.name?.split(' ')[1] || user?.firstName}
                </h1>
                <p className="text-blue-100 text-lg mb-1">
                  Especialidad: {doctorProfile?.specialtyName || 'Pediatría'}
                </p>
                <p className="text-blue-200 text-sm">
                  Gestiona tus honorarios médicos y actividad profesional
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                  <Heart className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full transform -translate-x-12 translate-y-12"></div>
          </div>
        </div>

        {/* Summary Cards - Diseño Premium con Detalles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total del Mes */}
          <Popover>
            <PopoverTrigger asChild>
              <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total del Mes</p>
                      <p className="text-3xl font-bold">${(doctorStats?.totalPaid || 0).toLocaleString('es-CL')}</p>
                      <p className="text-green-200 text-xs mt-1">+12% vs mes anterior</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                      <DollarSign className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </PopoverTrigger>
            <PopoverContent className="w-96">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Detalles de Pagos (${(doctorStats?.totalPaid || 0).toLocaleString('es-CL')})</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {allPaidAttentions && allPaidAttentions.length > 0 ? (
                    allPaidAttentions.map((detail: any, index: number) => (
                      <div key={index} className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">
                              {detail.attention?.patientName || 'Paciente no disponible'}
                            </p>
                            <p className="text-xs text-gray-600">
                              RUT: {detail.attention?.patientRut || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-600">
                              Servicio: {detail.attention?.serviceName || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-600">
                              Atención: {detail.attention?.attentionDate ? new Date(detail.attention.attentionDate).toLocaleDateString('es-CL') : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-600">
                              Pagado: {detail.payment?.paymentDate ? new Date(detail.payment.paymentDate).toLocaleDateString('es-CL') : 'Procesado'}
                            </p>
                            <p className="text-xs text-blue-600">
                              Base: ${parseFloat(detail.calculation?.baseAmount || 0).toLocaleString('es-CL')} → {detail.calculation?.ruleType === 'percentage' ? `${detail.calculation?.ruleValue}%` : 'Fijo'}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-green-600">
                              ${parseFloat(detail.calculation?.calculatedAmount || 0).toLocaleString('es-CL')}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">{detail.attention?.recordType || 'calc'}</div>
                            <div className="text-xs text-green-600">{detail.payment?.status}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No hay detalles de pago disponibles</p>
                  )}
                </div>
                <div className="border-t pt-3">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Atenciones pagadas:</span>
                      <span className="font-medium">{allPaidAttentions?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Total de detalles:</span>
                      <span className="font-medium">
                        ${allPaidAttentions ? allPaidAttentions.reduce((sum, detail) => sum + parseFloat(detail.calculation?.calculatedAmount || 0), 0).toLocaleString('es-CL') : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-semibold text-green-600">
                      <span>Total mostrado (${(doctorStats?.totalPaid || 0).toLocaleString('es-CL')}):</span>
                      <span className="text-xs">Incluye todos los pagos</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Estas son las atenciones médicas específicas que componen el total histórico pagado
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Por Procesar */}
          <Popover>
            <PopoverTrigger asChild>
              <Card className="bg-gradient-to-br from-amber-500 to-orange-500 border-0 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Por Procesar</p>
                      <p className="text-3xl font-bold">{doctorStats?.pendingCount || 0}</p>
                      <p className="text-orange-200 text-xs mt-1">Pendientes liquidación</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                      <Clock className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </PopoverTrigger>
            <PopoverContent className="w-96">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Atenciones Por Procesar - {selectedMonth}/{selectedYear}</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {pendingAttentions && pendingAttentions.length > 0 ? (
                    pendingAttentions.map((attention: any, index: number) => (
                      <div key={index} className="bg-orange-50 p-3 rounded border-l-4 border-orange-500">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">
                              {attention.patientName}
                            </p>
                            <p className="text-xs text-gray-600">
                              RUT: {attention.patientRut}
                            </p>
                            <p className="text-xs text-gray-600">
                              Fecha: {new Date(attention.attentionDate).toLocaleDateString('es-CL')}
                            </p>
                            <p className="text-xs text-gray-600">
                              Tipo: {attention.recordType}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-orange-600">
                              ${parseFloat(attention.amount || 0).toLocaleString('es-CL')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No hay atenciones pendientes</p>
                  )}
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center font-semibold text-orange-600">
                    <span>Total estimado:</span>
                    <span>${(doctorStats?.totalGross || 0).toLocaleString('es-CL')}</span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Atenciones */}
          <Popover>
            <PopoverTrigger asChild>
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Atenciones</p>
                      <p className="text-3xl font-bold">{doctorStats?.totalAttentions || 0}</p>
                      <p className="text-blue-200 text-xs mt-1">Este mes</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                      <FileText className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </PopoverTrigger>
            <PopoverContent className="w-96">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Todas las Atenciones - {selectedMonth}/{selectedYear}</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {allAttentions && allAttentions.length > 0 ? (
                    allAttentions.slice(0, 10).map((attention: any, index: number) => (
                      <div key={index} className={`p-3 rounded border-l-4 ${
                        attention.status === 'paid' ? 'bg-green-50 border-green-500' :
                        attention.status === 'calculated' ? 'bg-orange-50 border-orange-500' :
                        'bg-gray-50 border-gray-500'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">
                              {attention.patientName}
                            </p>
                            <p className="text-xs text-gray-600">
                              RUT: {attention.patientRut}
                            </p>
                            <p className="text-xs text-gray-600">
                              Fecha: {new Date(attention.attentionDate).toLocaleDateString('es-CL')}
                            </p>
                            <p className="text-xs text-gray-600">
                              Tipo: {attention.recordType}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`font-bold ${
                              attention.status === 'paid' ? 'text-green-600' :
                              attention.status === 'calculated' ? 'text-orange-600' :
                              'text-gray-600'
                            }`}>
                              ${parseFloat(attention.amount || 0).toLocaleString('es-CL')}
                            </span>
                            <div className="text-xs mt-1">
                              <Badge variant={attention.status === 'paid' ? 'default' : 'secondary'}>
                                {attention.status === 'paid' ? 'Pagado' : 
                                 attention.status === 'calculated' ? 'Calculado' : 'Pendiente'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No hay atenciones registradas</p>
                  )}
                  {allAttentions && allAttentions.length > 10 && (
                    <p className="text-xs text-gray-500 text-center">
                      ... y {allAttentions.length - 10} atenciones más
                    </p>
                  )}
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total atenciones:</span>
                    <span className="font-bold">{doctorStats?.totalAttentions || 0}</span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Promedio/Día */}
          <Popover>
            <PopoverTrigger asChild>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Promedio/Día</p>
                      <p className="text-3xl font-bold">${(doctorStats?.averageDaily || 0).toLocaleString('es-CL')}</p>
                      <p className="text-purple-200 text-xs mt-1">Últimos 30 días</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                      <TrendingUp className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </PopoverTrigger>
            <PopoverContent className="w-96">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Análisis de Rendimiento - {selectedMonth}/{selectedYear}</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Ingreso diario promedio:</span>
                    <span className="font-medium">${(doctorStats?.averageDaily || 0).toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Días con actividad:</span>
                    <span className="font-medium">
                      {allAttentions ? new Set(allAttentions.map(a => new Date(a.attentionDate).toDateString())).size : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Atenciones por día:</span>
                    <span className="font-medium">
                      {allAttentions && allAttentions.length > 0 ? 
                        Math.round(allAttentions.length / Math.max(1, new Set(allAttentions.map(a => new Date(a.attentionDate).toDateString())).size)) : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Valor promedio por atención:</span>
                    <span className="font-medium">
                      ${allAttentions && allAttentions.length > 0 ? 
                        Math.round(allAttentions.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0) / allAttentions.length).toLocaleString('es-CL') : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Especialidades atendidas:</span>
                    <span className="font-medium">
                      {allAttentions ? new Set(allAttentions.map(a => a.recordType)).size : 0}
                    </span>
                  </div>
                </div>
                
                {/* Pequeño gráfico de distribución por tipo */}
                {allAttentions && allAttentions.length > 0 && (
                  <div className="border-t pt-3">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Distribución por Tipo:</h5>
                    <div className="space-y-1">
                      {Object.entries(
                        allAttentions.reduce((acc: any, attention: any) => {
                          acc[attention.recordType] = (acc[attention.recordType] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([type, count]: [string, any]) => (
                        <div key={type} className="flex justify-between text-xs">
                          <span className="text-gray-600">{type}:</span>
                          <span className="font-medium">{count} atenciones</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-500">Análisis basado en actividad real registrada en el sistema</p>
              </div>
            </PopoverContent>
          </Popover>
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
                  {doctorPayments && doctorPayments.length > 0 ? (
                    doctorPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div>
                              <p className="font-medium text-gray-900">Pago Honorarios Médicos</p>
                              <p className="text-sm text-gray-500">
                                {payment.paymentMethod ? `Vía ${payment.paymentMethod}` : 'Transferencia bancaria'}
                                {payment.bankAccount && ` • Cta. ${payment.bankAccount}`}
                                {payment.payeeName && ` • ${payment.payeeName}`}
                              </p>
                              <p className="text-xs text-gray-400">{new Date(payment.paymentDate).toLocaleDateString('es-CL')}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <div className="text-right cursor-pointer hover:bg-blue-50 p-2 rounded-lg transition-colors" 
                                   onClick={() => {
                                     // Usar los datos ya cargados en lugar de hacer nueva petición
                                     setSelectedPaymentDetails({
                                       payment,
                                       attentions: paidAttentions || []
                                     });
                                   }}>
                                <p className="font-bold text-blue-600 hover:text-blue-800">
                                  ${parseFloat(payment.totalAmount).toLocaleString('es-CL')}
                                </p>
                                <p className="text-xs text-gray-500">Ver detalle</p>
                              </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Detalle de Pago - ${parseFloat(payment.totalAmount).toLocaleString('es-CL')}</DialogTitle>
                                <p className="text-sm text-gray-600">
                                  Período: {payment.periodMonth || selectedMonth}/{payment.periodYear || selectedYear} 
                                  • Pagado el: {new Date(payment.paymentDate).toLocaleDateString('es-CL')}
                                </p>
                              </DialogHeader>
                              <div className="space-y-4">
                                {selectedPaymentDetails?.attentions?.length > 0 ? (
                                  <>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                      <h3 className="font-semibold text-gray-900 mb-2">Resumen del Pago</h3>
                                      <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                          <p className="text-gray-600">Total Atenciones:</p>
                                          <p className="font-medium">{selectedPaymentDetails.attentions.length}</p>
                                        </div>
                                        <div>
                                          <p className="text-gray-600">Monto Bruto:</p>
                                          <p className="font-medium">${selectedPaymentDetails.attentions.reduce((sum: number, att: any) => sum + parseFloat(att.baseAmount || att.participatedAmount || 0), 0).toLocaleString('es-CL')}</p>
                                        </div>
                                        <div>
                                          <p className="text-gray-600">Monto Líquido:</p>
                                          <p className="font-medium text-green-600">${selectedPaymentDetails.attentions.reduce((sum: number, att: any) => sum + parseFloat(att.paidAmount || att.amount || 0), 0).toLocaleString('es-CL')}</p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="space-y-3">
                                      <h3 className="font-semibold text-gray-900">Detalle por Atención Médica</h3>
                                      {selectedPaymentDetails.attentions.map((attention: any, index: number) => (
                                        <div key={attention.id || index} className="border border-gray-200 rounded-lg p-4 bg-white">
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Información del Paciente */}
                                            <div>
                                              <h4 className="font-medium text-gray-900 mb-2">Paciente</h4>
                                              <div className="space-y-1 text-sm">
                                                <p><span className="text-gray-600">RUT:</span> {attention.patientRut || 'No disponible'}</p>
                                                <p><span className="text-gray-600">Nombre:</span> {attention.patientName || 'No disponible'}</p>
                                                <p><span className="text-gray-600">Fecha:</span> {new Date(attention.attentionDate).toLocaleDateString('es-CL')}</p>
                                                <p><span className="text-gray-600">Tipo:</span> {attention.recordType || 'participacion'}</p>
                                              </div>
                                            </div>
                                            
                                            {/* Información del Servicio */}
                                            <div>
                                              <h4 className="font-medium text-gray-900 mb-2">Servicio Médico</h4>
                                              <div className="space-y-1 text-sm">
                                                <p><span className="text-gray-600">Código:</span> {attention.serviceCode || 'No disponible'}</p>
                                                <p><span className="text-gray-600">Descripción:</span> {attention.serviceDescription || 'Consulta médica'}</p>
                                                <p><span className="text-gray-600">ID Atención:</span> {attention.externalId || attention.id}</p>
                                              </div>
                                            </div>
                                            
                                            {/* Información Financiera */}
                                            <div>
                                              <h4 className="font-medium text-gray-900 mb-2">Montos</h4>
                                              <div className="space-y-1 text-sm">
                                                <p><span className="text-gray-600">Monto Bruto:</span> <span className="font-medium">${parseFloat(attention.baseAmount || attention.participatedAmount || 0).toLocaleString('es-CL')}</span></p>
                                                <p><span className="text-gray-600">Participado:</span> <span className="font-medium">${parseFloat(attention.participatedAmount || 0).toLocaleString('es-CL')}</span></p>
                                                <p><span className="text-gray-600">Líquido Pagado:</span> <span className="font-medium text-green-600">${parseFloat(attention.paidAmount || attention.amount || 0).toLocaleString('es-CL')}</span></p>
                                                {attention.hasRule && (
                                                  <p className="text-blue-600 text-xs flex items-center gap-1">
                                                    <span className="text-green-600">✓</span>
                                                    <span>Regla de cálculo aplicada</span>
                                                    {attention.ruleType === 'percentage' && attention.ruleValue && (
                                                      <span className="font-medium">- {attention.ruleValue}%</span>
                                                    )}
                                                    {attention.ruleType === 'fixed_amount' && (
                                                      <span className="font-medium">- según monto</span>
                                                    )}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-center py-8 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>No se encontraron detalles de atenciones para este pago</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Badge className={getStatusColor(payment.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(payment.status)}
                              <span>{translateStatus(payment.status)}</span>
                            </div>
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No se han registrado pagos aún</p>
                    </div>
                  )}
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
                    <h3 className="font-medium text-gray-900 mb-3">Seleccionar Período para Cartola</h3>
                    
                    {/* Selectores de mes y año */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Mes</label>
                        <Select value={selectedMonth.toString()} onValueChange={(value) => {
                          setSelectedMonth(parseInt(value));
                          setSelectedPaymentDate(null); // Reset fecha específica
                          setShowPaymentDateSelector(false);
                        }}>
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
                        <Select value={selectedYear.toString()} onValueChange={(value) => {
                          setSelectedYear(parseInt(value));
                          setSelectedPaymentDate(null); // Reset fecha específica
                          setShowPaymentDateSelector(false);
                        }}>
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

                    {/* Opción para seleccionar fecha específica */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">Filtros Adicionales</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowPaymentDateSelector(!showPaymentDateSelector);
                            if (!showPaymentDateSelector) {
                              setSelectedPaymentDate(null);
                            }
                          }}
                          className="text-xs"
                        >
                          {showPaymentDateSelector ? "Ver todas las del mes" : "Por fecha específica"}
                        </Button>
                      </div>

                      {/* Selector de fechas específicas */}
                      {showPaymentDateSelector && (
                        <div className="bg-blue-50 p-3 rounded-md">
                          <label className="text-sm font-medium text-blue-900 mb-2 block">
                            Fecha de Pago Específica
                          </label>
                          {paymentDatesData && paymentDatesData.paymentDates.length > 0 ? (
                            <Select 
                              value={selectedPaymentDate || ""} 
                              onValueChange={(value) => setSelectedPaymentDate(value || null)}
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Seleccionar fecha de pago" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Todas las fechas del mes</SelectItem>
                                {paymentDatesData.paymentDates.map((date) => (
                                  <SelectItem key={date} value={date}>
                                    {new Date(date).toLocaleDateString('es-CL', { 
                                      weekday: 'short', 
                                      year: 'numeric', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="text-center py-4 text-blue-600">
                              <Clock className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                              <p className="text-sm">
                                {paymentDatesData?.message || "No hay pagos efectivos en este período"}
                              </p>
                            </div>
                          )}
                          
                          {selectedPaymentDate && (
                            <div className="mt-3 p-2 bg-blue-100 rounded text-sm text-blue-800">
                              <strong>Filtro activo:</strong> Solo atenciones pagadas el {new Date(selectedPaymentDate).toLocaleDateString('es-CL')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Opciones de reportes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="text-center space-y-4">
                          <div className="bg-green-500 p-4 rounded-full mx-auto w-fit">
                            <FileText className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">Cartola de Liquidación</h3>
                            <p className="text-sm text-gray-600 mb-4">
                              Descarga tu liquidación profesional del período seleccionado con formato PDF oficial
                            </p>
                            <div className="space-y-3">
                              {selectedPaymentDate && (
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                  <div className="flex items-center space-x-2 text-blue-800">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                      Cartola para fecha específica: {new Date(selectedPaymentDate).toLocaleDateString('es-CL')}
                                    </span>
                                  </div>
                                  <p className="text-xs text-blue-600 mt-1">
                                    Solo se incluirán atenciones pagadas en esta fecha
                                  </p>
                                </div>
                              )}
                              
                              <Button 
                                onClick={() => generateCartolaRDFMutation.mutate()}
                                disabled={generateCartolaRDFMutation.isPending}
                                className="w-full bg-green-600 hover:bg-green-700 shadow-lg text-white font-medium"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                {generateCartolaRDFMutation.isPending ? "Generando PDF..." : 
                                  selectedPaymentDate ? `Generar Cartola - ${new Date(selectedPaymentDate).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}` : 
                                  `Generar Cartola - ${new Date(2025, selectedMonth - 1).toLocaleDateString('es-CL', { month: 'long' })} ${selectedYear}`
                                }
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="text-center space-y-4">
                          <div className="bg-blue-500 p-4 rounded-full mx-auto w-fit">
                            <BarChart3 className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">Análisis de Pagos</h3>
                            <p className="text-sm text-gray-600 mb-4">
                              Resumen estadístico detallado de atenciones y participaciones profesionales
                            </p>
                            <Button 
                              variant="outline" 
                              className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg font-medium"
                              onClick={() => toast({
                                title: "Análisis de Pagos",
                                description: "Funcionalidad próximamente disponible para estadísticas avanzadas"
                              })}
                            >
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Ver Análisis Detallado
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="text-center space-y-4">
                          <div className="bg-purple-500 p-4 rounded-full mx-auto w-fit">
                            <UserIcon className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">Historial Médico</h3>
                            <p className="text-sm text-gray-600 mb-4">
                              Exporta tu historial completo de actividad profesional y facturación
                            </p>
                            <Button 
                              variant="outline" 
                              className="w-full border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white shadow-lg font-medium"
                              onClick={() => toast({
                                title: "Historial Médico",
                                description: "Exportación de historial próximamente disponible"
                              })}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Exportar Historial
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