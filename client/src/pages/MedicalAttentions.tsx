import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Calendar, User, Stethoscope, CreditCard, ChevronLeft, ChevronRight, Filter, Search, Trash2, AlertTriangle } from "lucide-react";
import { CsvUploader } from "@/components/CsvUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const attentionSchema = z.object({
  patientRut: z.string().min(1, "RUT del paciente es requerido"),
  patientName: z.string().min(1, "Nombre del paciente es requerido"),
  doctorId: z.string().min(1, "Doctor es requerido"),
  serviceId: z.string().min(1, "Servicio es requerido"),
  providerTypeId: z.string().min(1, "Tipo de prestador es requerido"),
  attentionDate: z.string().min(1, "Fecha de atención es requerida"),
  attentionTime: z.string().min(1, "Hora de atención es requerida"),
  scheduleType: z.string().min(1, "Tipo de horario es requerido"),
  grossAmount: z.string().min(1, "Monto bruto es requerido"),
  netAmount: z.string().min(1, "Monto líquido es requerido"),
  participatedAmount: z.string().min(1, "Monto participado es requerido"),
});

type AttentionForm = z.infer<typeof attentionSchema>;

export default function MedicalAttentions() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [dateFrom, setDateFrom] = useState(""); // Sin filtro de fecha por defecto
  const [dateTo, setDateTo] = useState(""); // Sin filtro de fecha por defecto
  const [tempDateFrom, setTempDateFrom] = useState(""); // Fechas temporales para el filtro
  const [tempDateTo, setTempDateTo] = useState(""); // Fechas temporales para el filtro
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteRecordType, setDeleteRecordType] = useState<'participacion' | 'hmq' | 'all'>('all');
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [cleanupPatientName, setCleanupPatientName] = useState('');
  const [cleanupPatientRut, setCleanupPatientRut] = useState('');
  const [showFullCleanupModal, setShowFullCleanupModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const form = useForm<AttentionForm>({
    resolver: zodResolver(attentionSchema),
    defaultValues: {
      patientRut: "",
      patientName: "",
      doctorId: "",
      serviceId: "",
      providerTypeId: "",
      attentionDate: "",
      attentionTime: "",
      scheduleType: "regular",
      grossAmount: "",
      netAmount: "",
      participatedAmount: "",
    },
  });

  // Helper functions for date presets
  const setDatePreset = (preset: string) => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - (24 * 60 * 60 * 1000));
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    const last15Days = new Date(today.getTime() - (15 * 24 * 60 * 60 * 1000));
    
    switch (preset) {
      case 'today':
        setTempDateFrom(today.toISOString().split('T')[0]);
        setTempDateTo(today.toISOString().split('T')[0]);
        break;
      case 'yesterday':
        setTempDateFrom(yesterday.toISOString().split('T')[0]);
        setTempDateTo(yesterday.toISOString().split('T')[0]);
        break;
      case 'thisMonth':
        setTempDateFrom(currentMonth.toISOString().split('T')[0]);
        setTempDateTo(today.toISOString().split('T')[0]);
        break;
      case 'lastMonth':
        setTempDateFrom(previousMonth.toISOString().split('T')[0]);
        setTempDateTo(previousMonthEnd.toISOString().split('T')[0]);
        break;
      case 'last15Days':
        setTempDateFrom(last15Days.toISOString().split('T')[0]);
        setTempDateTo(today.toISOString().split('T')[0]);
        break;
      case 'clear':
        clearFilters();
        return;
    }
    // Auto-aplicar filtros para períodos rápidos
    setTimeout(() => applyFilters(), 100);
  };

  // Aplicar filtros solo cuando se ejecute la búsqueda
  const applyFilters = () => {
    setDateFrom(tempDateFrom);
    setDateTo(tempDateTo);
    setCurrentPage(1);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setTempDateFrom("");
    setTempDateTo("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  // Mutación para borrar registros no procesados
  const deleteUnprocessedMutation = useMutation({
    mutationFn: async (recordType: 'participacion' | 'hmq' | 'all') => {
      const response = await apiRequest('/api/medical-attentions/delete-unprocessed', 'DELETE', { recordType });
      return response.json();
    },
    onSuccess: (data) => {
      const recordTypeLabel = deleteRecordType === 'all' ? 'registros' : 
                             deleteRecordType === 'participacion' ? 'registros de participaciones' : 
                             'registros HMQ';
      
      toast({
        title: "✅ Eliminación exitosa",
        description: `Se eliminaron correctamente ${data.deletedCount} ${recordTypeLabel} no procesados del sistema.`,
        duration: 5000,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/medical-attentions'] });
      setShowDeleteModal(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar registros",
        description: error.message || "No se pudieron eliminar los registros",
        variant: "destructive",
      });
    },
  });

  // New cleanup mutations
  const deleteByPatientMutation = useMutation({
    mutationFn: async ({ patientName, patientRut }: { patientName?: string; patientRut?: string }) => {
      const response = await apiRequest('/api/medical-attentions/delete-by-patient', 'DELETE', { 
        patientName, 
        patientRut 
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Eliminación exitosa",
        description: `Se eliminaron ${data.deletedCount} registros del paciente.`,
        duration: 5000,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/medical-attentions'] });
      setShowCleanupModal(false);
      setCleanupPatientName('');
      setCleanupPatientRut('');
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar registros",
        description: error.message || "No se pudieron eliminar los registros del paciente",
        variant: "destructive",
      });
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: async (confirmText: string) => {
      const response = await apiRequest('/api/medical-attentions/delete-all', 'DELETE', { 
        confirmText 
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Borrado total completado",
        description: `Se eliminaron ${data.deletedAttentions} atenciones y ${data.deletedCalculations} cálculos.`,
        duration: 5000,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/medical-attentions'] });
      setShowFullCleanupModal(false);
      setConfirmText('');
    },
    onError: (error: any) => {
      toast({
        title: "Error en borrado total",
        description: error.message || "No se pudo realizar el borrado total",
        variant: "destructive",
      });
    },
  });

  // Queries - Show all data by default, apply filters only when requested
  const { data: allAttentions = [], isLoading } = useQuery({
    queryKey: ['/api/medical-attentions', showOnlyPending, dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams();
      // Only apply status filter when checkbox is explicitly checked
      if (showOnlyPending) params.append('status', 'pending');
      // Only apply date filters when they are explicitly set
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      
      const response = await apiRequest(`/api/medical-attentions?${params.toString()}`, 'GET');
      return await response.json();
    }
  });

  // Client-side pagination
  const totalAttentions = allAttentions.length;
  const totalPages = Math.ceil(totalAttentions / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAttentions = allAttentions.slice(startIndex, endIndex);

  const { data: doctors = [] } = useQuery({
    queryKey: ['/api/doctors'],
  });

  const { data: services = [] } = useQuery({
    queryKey: ['/api/services'],
  });

  const { data: providerTypes = [] } = useQuery({
    queryKey: ['/api/provider-types'],
  });

  // Mutations
  const createAttentionMutation = useMutation({
    mutationFn: async (data: AttentionForm) => {
      const response = await apiRequest('/api/medical-attentions', 'POST', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medical-attentions'] });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const handleSubmit = (data: AttentionForm) => {
    createAttentionMutation.mutate(data);
  };

  const handleDataImported = (importedData: any[]) => {
    // Refrescar la lista de atenciones después de importar
    queryClient.invalidateQueries({ queryKey: ['/api/medical-attentions'] });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "default" as const,
      calculated: "secondary" as const,
      paid: "outline" as const,
    };
    
    const labels = {
      pending: "Pendiente",
      calculated: "Calculado",
      paid: "Pagado",
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-blue mx-auto"></div>
          <p className="mt-4">Cargando atenciones médicas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Atenciones Médicas</h1>
          <p className="text-muted-foreground">
            Gestiona las atenciones médicas y sus montos para el cálculo de pagos
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowDeleteModal(true)}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
            data-testid="button-delete-unprocessed"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpiar No Procesados
          </Button>
          <Button
            onClick={() => setShowCleanupModal(true)}
            variant="outline"
            className="border-orange-200 text-orange-600 hover:bg-orange-50"
            data-testid="button-cleanup-patient"
          >
            <User className="w-4 h-4 mr-2" />
            Limpiar Paciente
          </Button>
          <Button
            onClick={() => setShowFullCleanupModal(true)}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
            data-testid="button-cleanup-all"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Borrado Total
          </Button>
          <CsvUploader onDataImported={handleDataImported} />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Atención
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Atención</DialogTitle>
              <DialogDescription>
                Completa los datos de la atención médica realizada
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" onKeyDown={(e) => {
                // Prevenir submit automático al presionar Enter en campos de fecha
                if (e.key === 'Enter' && (e.target as HTMLInputElement).type === 'date') {
                  e.preventDefault();
                }
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="patientRut"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RUT Paciente</FormLabel>
                        <FormControl>
                          <Input placeholder="12.345.678-9" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="patientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Paciente</FormLabel>
                        <FormControl>
                          <Input placeholder="Juan Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="doctorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doctor</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar doctor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(doctors) && doctors.map((doctor: any) => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                {doctor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="serviceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Servicio</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar servicio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(services) && services.map((service: any) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="providerTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Prestador</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo de prestador" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(providerTypes) && providerTypes.map((type: any) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="attentionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="attentionTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="scheduleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo Horario</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="irregular">Irregular</SelectItem>
                            <SelectItem value="night">Nocturno</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="grossAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto Bruto</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="netAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto Líquido</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="participatedAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto Participado</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createAttentionMutation.isPending}
                  >
                    {createAttentionMutation.isPending ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Controles de filtro y paginación */}
      <Card>
        <CardHeader className="pb-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros y Navegación - Producción de Profesionales
                </CardTitle>
                <CardDescription>
                  Gestiona la trazabilidad de atenciones para procesamiento de pagos
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="pending-filter">Solo pendientes</Label>
                <Switch
                  id="pending-filter"
                  checked={showOnlyPending}
                  onCheckedChange={(checked) => {
                    setShowOnlyPending(checked);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {/* Filtros de fecha de actividades médicas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="date-from" className="text-sm font-medium">
                  Fecha Actividad Desde
                  <span className="text-xs text-muted-foreground block">Fecha de la atención médica</span>
                </Label>
                <Input
                  id="date-from"
                  type="date"
                  value={tempDateFrom}
                  onChange={(e) => setTempDateFrom(e.target.value)}
                  placeholder="dd/mm/aaaa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-to" className="text-sm font-medium">
                  Fecha Actividad Hasta  
                  <span className="text-xs text-muted-foreground block">Fecha de la atención médica</span>
                </Label>
                <Input
                  id="date-to"
                  type="date"
                  value={tempDateTo}
                  onChange={(e) => setTempDateTo(e.target.value)}
                  placeholder="dd/mm/aaaa"
                />
              </div>
              <div className="space-y-2">
                <Label>Períodos Rápidos</Label>
                <Select onValueChange={setDatePreset}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="yesterday">Ayer</SelectItem>
                    <SelectItem value="thisMonth">Este mes</SelectItem>
                    <SelectItem value="lastMonth">Mes anterior</SelectItem>
                    <SelectItem value="last15Days">Últimos 15 días</SelectItem>
                    <SelectItem value="clear">Limpiar filtros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={applyFilters}
                    size="sm"
                    className="flex items-center gap-2"
                    data-testid="button-search-filter"
                  >
                    <Search className="w-4 h-4" />
                    Buscar
                  </Button>
                  <Button 
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    data-testid="button-clear-filter"
                  >
                    Limpiar
                  </Button>
                </div>
              </div>

            </div>

            {/* Información y paginación */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-sm text-muted-foreground">
                Mostrando {paginatedAttentions.length} de {totalAttentions} atenciones 
                {showOnlyPending ? " pendientes" : " totales"}
                {(dateFrom || dateTo) && " en el período seleccionado"}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        {Array.isArray(paginatedAttentions) && paginatedAttentions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Stethoscope className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {showOnlyPending ? "No hay atenciones pendientes" : "No hay atenciones médicas registradas"}
              </h3>
              <p className="text-gray-500 text-center mb-4">
                {showOnlyPending 
                  ? "Todas las atenciones han sido calculadas o pagadas"
                  : "Comienza registrando las atenciones médicas realizadas"
                }
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Registrar Primera Atención
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {Array.isArray(paginatedAttentions) && paginatedAttentions.map((attention: any) => (
              <Card key={attention.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-medical-blue/10 rounded-lg">
                        <User className="w-5 h-5 text-medical-blue" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{attention.patientName}</CardTitle>
                        <CardDescription>RUT: {attention.patientRut}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(attention.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Fecha</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(attention.attentionDate), 'dd MMM yyyy', { locale: es })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Stethoscope className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Doctor</p>
                        <p className="text-sm text-gray-600">
                          {Array.isArray(doctors) ? doctors.find((d: any) => d.id === attention.doctorId)?.name || 'N/A' : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Montos (Bruto/Neto/Participado)</p>
                        <p className="text-sm text-gray-600">
                          ${parseFloat(attention.grossAmount).toLocaleString('es-CL')} / 
                          ${parseFloat(attention.netAmount).toLocaleString('es-CL')} / 
                          ${parseFloat(attention.participatedAmount).toLocaleString('es-CL')}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {attention.id.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Prestador</p>
                      <p className="text-sm text-gray-600">
                        {Array.isArray(providerTypes) ? providerTypes.find((p: any) => p.id === attention.providerTypeId)?.name || 'N/A' : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmación para borrar registros no procesados */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription>
              Esta acción eliminará permanentemente las atenciones médicas no procesadas (status: pendiente).
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tipo de registros a eliminar:</label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="deleteType"
                    value="all"
                    checked={deleteRecordType === 'all'}
                    onChange={(e) => setDeleteRecordType(e.target.value as 'participacion' | 'hmq' | 'all')}
                    className="text-red-600"
                  />
                  <span>Todos los registros no procesados</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="deleteType"
                    value="participacion"
                    checked={deleteRecordType === 'participacion'}
                    onChange={(e) => setDeleteRecordType(e.target.value as 'participacion' | 'hmq' | 'all')}
                    className="text-red-600"
                  />
                  <span>Solo Registros Participaciones</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="deleteType"
                    value="hmq"
                    checked={deleteRecordType === 'hmq'}
                    onChange={(e) => setDeleteRecordType(e.target.value as 'participacion' | 'hmq' | 'all')}
                    className="text-red-600"
                  />
                  <span>Solo Registros HMQ</span>
                </label>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Esta acción no se puede deshacer. Solo se eliminarán registros con estado "pendiente".
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteUnprocessedMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteUnprocessedMutation.mutate(deleteRecordType)}
              disabled={deleteUnprocessedMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteUnprocessedMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar Registros
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para limpiar registros de un paciente específico */}
      <Dialog open={showCleanupModal} onOpenChange={setShowCleanupModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-orange-600">
              <User className="w-5 h-5 mr-2" />
              Limpiar Registros de Paciente
            </DialogTitle>
            <DialogDescription>
              Elimina todos los registros de un paciente específico. Usa nombre o RUT para buscar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="cleanup-patient-name">Nombre del Paciente</Label>
              <Input
                id="cleanup-patient-name"
                placeholder="Ej: ALARCON STUARDO RAUL"
                value={cleanupPatientName}
                onChange={(e) => setCleanupPatientName(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="cleanup-patient-rut">RUT del Paciente</Label>
              <Input
                id="cleanup-patient-rut"
                placeholder="Ej: 14366756-1"
                value={cleanupPatientRut}
                onChange={(e) => setCleanupPatientRut(e.target.value)}
              />
            </div>
            
            <div className="bg-orange-50 border border-orange-200 p-3 rounded-md">
              <p className="text-sm text-orange-800">
                ⚠️ Se buscarán coincidencias parciales. Por ejemplo, "ALARCON" encontrará todos los pacientes con ese apellido.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCleanupModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => deleteByPatientMutation.mutate({ 
                patientName: cleanupPatientName || undefined, 
                patientRut: cleanupPatientRut || undefined 
              })}
              disabled={(!cleanupPatientName && !cleanupPatientRut) || deleteByPatientMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {deleteByPatientMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar Registros
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para borrado total */}
      <Dialog open={showFullCleanupModal} onOpenChange={setShowFullCleanupModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-700">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Borrado Total del Sistema
            </DialogTitle>
            <DialogDescription>
              Esta acción eliminará TODOS los registros de atenciones médicas y cálculos de pago.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 p-3 rounded-md">
              <p className="text-sm text-red-800 font-medium">
                🚨 PELIGRO: Esta acción es IRREVERSIBLE
              </p>
              <p className="text-sm text-red-700 mt-1">
                Se eliminarán permanentemente todas las atenciones médicas, cálculos de pago y datos relacionados.
              </p>
            </div>
            
            <div>
              <Label htmlFor="confirm-text">Para confirmar, escribe: <strong>CONFIRMAR BORRADO TOTAL</strong></Label>
              <Input
                id="confirm-text"
                placeholder="CONFIRMAR BORRADO TOTAL"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowFullCleanupModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => deleteAllMutation.mutate(confirmText)}
              disabled={confirmText !== 'CONFIRMAR BORRADO TOTAL' || deleteAllMutation.isPending}
              className="bg-red-700 hover:bg-red-800"
            >
              {deleteAllMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando Todo...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Borrar Todo
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}