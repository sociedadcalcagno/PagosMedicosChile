import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Search, Edit, Trash2, PlayCircle, FileText, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Convention form schema
const conventionFormSchema = z.object({
  code: z.string().optional(), // Auto-generated
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
  const [simulationData, setSimulationData] = useState({
    doctorId: '',
    specialtyId: '',
    serviceId: '',
    baseAmount: '',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get conventions (rules marked as convention type) - ISOLATED query
  const { data: allRules, isLoading, refetch } = useQuery({
    queryKey: ["/api/calculation-rules", "conventions"],
    queryFn: () => apiRequest("/api/calculation-rules"),
    staleTime: 0, // Always fresh
    refetchOnWindowFocus: false,
  });

  // Filter conventions on the frontend for now
  const conventions = Array.isArray(allRules) ? allRules.filter(rule => rule.ruleType === 'convention' || rule.rule_type === 'convention') : [];
  
  // Debug logs removed for stability

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
      // Generate unique code for conventions
      const timestamp = Date.now().toString().slice(-6);
      const uniqueCode = `CONV_${timestamp}`;
      
      // Create as a calculation rule with convention type
      const conventionData = {
        ...data,
        code: uniqueCode, // Override with unique code
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
      // Force immediate refresh
      setTimeout(() => refetch(), 100);
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
      // Simple and reliable refresh
      refetch();
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
      // Force immediate refresh
      setTimeout(() => refetch(), 100);
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

  const handleSimulation = async () => {
    // Find applicable conventions
    const applicableConventions = filteredConventions.filter((conv: any) => {
      // Check if convention applies to selected criteria
      const matchesSpecialty = !conv.specialtyId || conv.specialtyId === simulationData.specialtyId;
      const matchesService = !conv.serviceId || conv.serviceId === simulationData.serviceId || simulationData.serviceId === 'all';
      const today = new Date();
      const validFrom = new Date(conv.validFrom || '');
      const validTo = new Date(conv.validTo || '');
      const isValid = conv.isActive && today >= validFrom && today <= validTo;
      
      return matchesSpecialty && matchesService && isValid;
    });

    // Calculate results
    const baseAmount = parseFloat(simulationData.baseAmount) || 0;
    const results = applicableConventions.map((conv: any) => {
      const calculatedAmount = conv.paymentType === 'percentage' 
        ? baseAmount * (parseFloat(conv.paymentValue) / 100)
        : parseFloat(conv.paymentValue);
      
      return {
        convention: conv,
        calculatedAmount,
        percentage: conv.paymentType === 'percentage' ? parseFloat(conv.paymentValue) : null
      };
    });

    const totalAmount = results.reduce((sum, result) => sum + result.calculatedAmount, 0);
    
    setSimulationResult({
      baseAmount,
      applicableConventions: results,
      totalAmount,
      conventionCount: results.length
    });
  };

  // Filter conventions
  const filteredConventions = Array.isArray(conventions) ? conventions.filter((convention: any) => {
    const matchesSearch = !searchTerm || 
      convention.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      convention.code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = !specialtyFilter || specialtyFilter === "all" || 
      convention.specialtyId === specialtyFilter || !convention.specialtyId;
    
    const today = new Date();
    const validFrom = convention.validFrom ? new Date(convention.validFrom) : new Date();
    const validTo = convention.validTo ? new Date(convention.validTo) : new Date(2030, 0, 1);
    
    let matchesStatus = true;
    if (statusFilter === "active") {
      matchesStatus = convention.isActive && today >= validFrom && today <= validTo;
    } else if (statusFilter === "expired") {
      matchesStatus = !convention.isActive || today > validTo;
    } else if (statusFilter === "pending") {
      matchesStatus = convention.isActive && today < validFrom;
    } else if (statusFilter === "all") {
      matchesStatus = true; // Show all regardless of status
    }
    
    return matchesSearch && matchesSpecialty && matchesStatus;
  }) : [];
  
  // Debug log removed for stability

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
            onClick={() => {
              console.log('Opening simulator...');
              setIsSimulatorOpen(true);
            }} 
            className="bg-green-600 hover:bg-green-700 text-white shadow-md"
            data-testid="button-simulator"
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

      {/* Convention Creation/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingConvention ? "Editar Convenio Médico" : "Nuevo Convenio Médico"}
            </DialogTitle>
            <DialogDescription>
              Define los parámetros para el convenio con instituciones de salud
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Se generará automáticamente" disabled />
                      </FormControl>
                      <FormDescription>
                        Se generará automáticamente al crear el convenio
                      </FormDescription>
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
                        <Input {...field} placeholder="Ej: Guillermo Arcángel" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="paymentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Pago</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
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
                        <Input {...field} placeholder="85" />
                      </FormControl>
                      <FormDescription>
                        {form.watch("paymentType") === "percentage" 
                          ? "Porcentaje (ej: 70 = 70%)"
                          : "Monto en pesos chilenos"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridad</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="100" />
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
                            <SelectValue placeholder="Primer Convenio (first_win)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="first_win">Primer Convenio (first_win)</SelectItem>
                          <SelectItem value="stack">Aplica todos los convenios coincidentes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        first_win: Solo aplica el primer convenio que coincida; stack: Aplica todos los convenios coincidentes.
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
                      <Textarea 
                        {...field} 
                        placeholder="Descripción detallada del convenio..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createConventionMutation.isPending || updateConventionMutation.isPending}
                >
                  {editingConvention ? "Actualizar" : "Crear Convenio"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Convention Simulator Dialog */}
      <Dialog open={isSimulatorOpen} onOpenChange={setIsSimulatorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Simulador de Convenios Médicos</DialogTitle>
            <DialogDescription>
              Simula la aplicación de convenios para un caso específico
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Simulation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Datos para Simulación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Doctor</label>
                    <Select onValueChange={(value) => setSimulationData({...simulationData, doctorId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor: any) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Especialidad</label>
                    <Select onValueChange={(value) => setSimulationData({...simulationData, specialtyId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar especialidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map((specialty: any) => (
                          <SelectItem key={specialty.id} value={specialty.id}>
                            {specialty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Servicio Médico</label>
                    <Select onValueChange={(value) => setSimulationData({...simulationData, serviceId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los servicios</SelectItem>
                        {services.map((service: any) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Monto Base</label>
                    <Input 
                      placeholder="100000" 
                      value={simulationData.baseAmount}
                      onChange={(e) => setSimulationData({...simulationData, baseAmount: e.target.value})}
                    />
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleSimulation}
                  disabled={!simulationData.doctorId || !simulationData.specialtyId || !simulationData.baseAmount}
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Ejecutar Simulación
                </Button>
              </CardContent>
            </Card>

            {/* Simulation Results */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resultados de Simulación</CardTitle>
              </CardHeader>
              <CardContent>
                {simulationResult ? (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          ${simulationResult.baseAmount.toLocaleString('es-CL')}
                        </p>
                        <p className="text-sm text-gray-600">Monto Base</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {simulationResult.conventionCount}
                        </p>
                        <p className="text-sm text-gray-600">Convenios Aplicables</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          ${simulationResult.totalAmount.toLocaleString('es-CL')}
                        </p>
                        <p className="text-sm text-gray-600">Total Calculado</p>
                      </div>
                    </div>

                    {/* Convention Details */}
                    {simulationResult.applicableConventions.length > 0 ? (
                      <div>
                        <h4 className="font-semibold mb-4">Convenios Aplicados:</h4>
                        <div className="space-y-3">
                          {simulationResult.applicableConventions.map((result: any, index: number) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h5 className="font-medium">{result.convention.name}</h5>
                                  <p className="text-sm text-gray-600">Código: {result.convention.code}</p>
                                  <p className="text-sm text-gray-600">
                                    Tipo: {result.convention.paymentType === 'percentage' ? 'Porcentaje' : 'Monto Fijo'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-green-600">
                                    ${result.calculatedAmount.toLocaleString('es-CL')}
                                  </p>
                                  {result.percentage && (
                                    <p className="text-sm text-gray-600">
                                      {result.percentage}%
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No se encontraron convenios aplicables para los criterios seleccionados</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <PlayCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Ejecuta una simulación para ver los convenios aplicables</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsSimulatorOpen(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}