import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, PlayCircle, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Convention form schema
const conventionFormSchema = z.object({
  code: z.string().min(1, "Código es requerido"),
  name: z.string().min(1, "Nombre es requerido"),
  description: z.string().optional(),
  validFrom: z.string().min(1, "Fecha de inicio es requerida"),
  validTo: z.string().min(1, "Fecha de fin es requerida"),
  specialtyId: z.string().min(1, "Especialidad es requerida"),
  serviceId: z.string().optional(),
  paymentType: z.enum(["percentage", "fixed_amount"]),
  paymentValue: z.string().min(1, "Valor de pago es requerido"),
  priority: z.string().default("100"),
  exclusivityMode: z.enum(["first_win", "stack"]).default("first_win"),
});

type ConventionFormData = z.infer<typeof conventionFormSchema>;

interface ConventionsSectionProps {
  specialties: any[];
  services: any[];
  doctors: any[];
  medicalSocieties: any[];
}

export default function ConventionsSection({
  specialties,
  services,
  doctors,
  medicalSocieties,
}: ConventionsSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConvention, setEditingConvention] = useState<any>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get conventions (rules marked as convention type)
  const { data: conventions, isLoading } = useQuery({
    queryKey: ["/api/calculation-rules", "convention"],
    queryFn: () => apiRequest("/api/calculation-rules?ruleType=convention"),
  });

  const form = useForm<ConventionFormData>({
    resolver: zodResolver(conventionFormSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      validFrom: "",
      validTo: "",
      specialtyId: "",
      serviceId: "",
      paymentType: "percentage",
      paymentValue: "",
      priority: "100",
      exclusivityMode: "first_win",
    },
  });

  // Mutations
  const createConventionMutation = useMutation({
    mutationFn: async (data: ConventionFormData) => {
      // Create as a calculation rule with convention type
      const conventionData = {
        ...data,
        baseRule: `Convenio: ${data.name}`,
        participationType: "mixed", // Conventions can apply to both individual and society
        ruleType: "convention",
        scopeType: data.exclusivityMode === "first_win" ? "individual" : "group",
        // Ensure serviceId is handled correctly
        serviceId: data.serviceId === "all" ? null : data.serviceId,
        // Convert string values to correct types
        priority: parseInt(data.priority) || 100,
        paymentValue: parseFloat(data.paymentValue) || 0,
      };
      return apiRequest("/api/calculation-rules", "POST", conventionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calculation-rules", "convention"] });
      toast({
        title: "Convenio creado",
        description: "El convenio médico ha sido creado exitosamente.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      console.error("Error creating convention:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el convenio. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const updateConventionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ConventionFormData }) => {
      return apiRequest(`/api/calculation-rules/${id}`, "PUT", {
        ...data,
        baseRule: `Convenio: ${data.name}`,
        ruleType: "convention",
        // Convert string values to correct types
        priority: parseInt(data.priority) || 100,
        paymentValue: parseFloat(data.paymentValue) || 0,
        serviceId: data.serviceId === "all" ? null : data.serviceId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calculation-rules", "convention"] });
      toast({
        title: "Convenio actualizado",
        description: "El convenio médico ha sido actualizado exitosamente.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      console.error("Error updating convention:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el convenio. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const deleteConventionMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/calculation-rules/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calculation-rules", "convention"] });
      toast({
        title: "Convenio eliminado",
        description: "El convenio médico ha sido eliminado exitosamente.",
      });
    },
    onError: (error) => {
      console.error("Error deleting convention:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el convenio. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  // Event handlers
  const handleNewConvention = () => {
    setEditingConvention(null);
    form.reset();
  };

  const handleEditConvention = (convention: any) => {
    setEditingConvention(convention);
    form.reset({
      code: convention.code || "",
      name: convention.name || "",
      description: convention.description || "",
      validFrom: convention.validFrom || "",
      validTo: convention.validTo || "",
      specialtyId: convention.specialtyId || "",
      serviceId: convention.serviceId || "",
      paymentType: convention.paymentType || "percentage",
      paymentValue: convention.paymentValue?.toString() || "",
      priority: convention.priority?.toString() || "100",
      exclusivityMode: convention.exclusivityMode || "first_win",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteConvention = async (convention: any) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el convenio "${convention.name}"?`)) {
      deleteConventionMutation.mutate(convention.id);
    }
  };

  const onSubmit = async (data: ConventionFormData) => {
    if (editingConvention) {
      updateConventionMutation.mutate({ id: editingConvention.id, data });
    } else {
      createConventionMutation.mutate(data);
    }
  };

  // Filter conventions
  const filteredConventions = Array.isArray(conventions) ? conventions.filter((convention: any) => {
    const matchesSearch = !searchTerm || 
      convention.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      convention.code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = !specialtyFilter || specialtyFilter === "all" || convention.specialtyId === specialtyFilter;
    
    const today = new Date();
    const validFrom = new Date(convention.validFrom || '');
    const validTo = new Date(convention.validTo || '');
    
    let matchesStatus = true;
    if (statusFilter === "active") {
      matchesStatus = convention.isActive && today >= validFrom && today <= validTo;
    } else if (statusFilter === "expired") {
      matchesStatus = !convention.isActive || today > validTo;
    } else if (statusFilter === "pending") {
      matchesStatus = convention.isActive && today < validFrom;
    }
    
    return matchesSearch && matchesSpecialty && matchesStatus;
  }) : [];

  // Calculate stats
  const calculateStats = () => {
    const today = new Date();
    const active = filteredConventions.filter((conv: any) => {
      const validFrom = new Date(conv.validFrom || '');
      const validTo = new Date(conv.validTo || '');
      return conv.isActive && today >= validFrom && today <= validTo;
    }).length;
    
    const expired = filteredConventions.filter((conv: any) => {
      const validTo = new Date(conv.validTo || '');
      return !conv.isActive || today > validTo;
    }).length;
    
    const pending = filteredConventions.filter((conv: any) => {
      const validFrom = new Date(conv.validFrom || '');
      return conv.isActive && today < validFrom;
    }).length;

    return { active, expired, pending, total: filteredConventions.length };
  };

  const stats = calculateStats();

  const getStatusBadge = (convention: any) => {
    const today = new Date();
    const validFrom = new Date(convention.validFrom || '');
    const validTo = new Date(convention.validTo || '');
    
    if (!convention.isActive || today > validTo) {
      return <Badge variant="secondary">Vencido</Badge>;
    } else if (today < validFrom) {
      return <Badge variant="outline">Pendiente</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-600">Activo</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600">
            Gestiona los convenios y acuerdos con instituciones de salud
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsSimulatorOpen(true)} 
            className="bg-green-600 hover:bg-green-700 text-white shadow-md"
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Simulador
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewConvention} className="bg-medical-blue hover:bg-medical-dark shadow-md">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Convenio
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingConvention ? "Editar Convenio Médico" : "Nuevo Convenio Médico"}
                </DialogTitle>
                <DialogDescription>
                  Define los parámetros para el convenio con instituciones de salud
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: CONV_HOSP_001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Convenio</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Hospital Las Condes - Cirugía" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specialtyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Especialidad</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar especialidad" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {specialties.map((specialty: any) => (
                                <SelectItem key={specialty.id} value={specialty.id}>
                                  {specialty.name}
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
                          <FormLabel>Servicio Médico (Opcional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Todos los servicios" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all">Todos los servicios</SelectItem>
                              {services.map((service: any) => (
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

                    <FormField
                      control={form.control}
                      name="validFrom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vigencia Desde</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="validTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vigencia Hasta</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Pago</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="percentage">Porcentaje</SelectItem>
                              <SelectItem value="fixed_amount">Monto Fijo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              step="0.01"
                              placeholder={form.watch("paymentType") === "percentage" ? "70.00" : "50000"} 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            {form.watch("paymentType") === "percentage" ? "Porcentaje (ej: 70 = 70%)" : "Monto en pesos chilenos"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prioridad</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="100" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Menor número = mayor prioridad
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="exclusivityMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modo de Exclusividad</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="first_win">Primer Convenio (first_win)</SelectItem>
                              <SelectItem value="stack">Acumulativo (stack)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            first_win: Solo aplica el primer convenio que coincida. stack: Aplica todos los convenios coincidentes.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Descripción detallada del convenio..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createConventionMutation.isPending || updateConventionMutation.isPending}
                    >
                      {editingConvention ? "Actualizar" : "Crear"} Convenio
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar convenios..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Especialidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {specialties.map((specialty: any) => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="expired">Vencidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-sm text-gray-500">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                  <FileText className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-sm text-gray-500">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                  <FileText className="w-4 h-4 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
                <p className="text-sm text-gray-500">Vencidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Convenios</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conventions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead>Tipo Pago</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Cargando convenios...
                    </TableCell>
                  </TableRow>
                ) : filteredConventions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No se encontraron convenios
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredConventions.map((convention: any) => {
                    const specialty = specialties.find(s => s.id === convention.specialtyId);
                    return (
                      <TableRow key={convention.id}>
                        <TableCell className="font-medium">{convention.code}</TableCell>
                        <TableCell>{convention.name}</TableCell>
                        <TableCell>{specialty?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Desde: {convention.validFrom}</div>
                            <div>Hasta: {convention.validTo}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {convention.paymentType === 'percentage' ? 'Porcentaje' : 'Monto Fijo'}
                        </TableCell>
                        <TableCell>
                          {convention.paymentType === 'percentage' 
                            ? `${convention.paymentValue}%` 
                            : `$${convention.paymentValue}`}
                        </TableCell>
                        <TableCell>{getStatusBadge(convention)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditConvention(convention)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteConvention(convention)}
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}