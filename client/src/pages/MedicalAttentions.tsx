import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Calendar, User, Stethoscope, CreditCard, ChevronLeft, ChevronRight, Filter } from "lucide-react";
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
  const [showOnlyPending, setShowOnlyPending] = useState(true);
  const queryClient = useQueryClient();
  
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

  // Queries - Filter pending by default, add pagination logic client-side
  const { data: allAttentions = [], isLoading } = useQuery({
    queryKey: ['/api/medical-attentions', { showOnlyPending }],
    queryFn: async () => {
      const response = await apiRequest(`/api/medical-attentions?showOnlyPending=${showOnlyPending}`, 'GET');
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
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros y Navegación
              </CardTitle>
              <CardDescription>
                Mostrando {paginatedAttentions.length} de {totalAttentions} atenciones {showOnlyPending ? "pendientes" : "totales"}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="pending-filter">Solo pendientes</Label>
                <Switch
                  id="pending-filter"
                  checked={showOnlyPending}
                  onCheckedChange={(checked) => {
                    setShowOnlyPending(checked);
                    setCurrentPage(1); // Reset to first page when filter changes
                  }}
                />
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
                        <p className="text-sm font-medium">Monto Participado</p>
                        <p className="text-sm text-gray-600">
                          ${parseFloat(attention.participatedAmount).toLocaleString('es-CL')}
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
    </div>
  );
}