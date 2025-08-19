import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import RuleSimulator from "@/components/RuleSimulator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Edit, Trash2, Calculator, Eye, Copy, CheckCircle, Clock, AlertTriangle, TrendingUp, PlayCircle, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const isUnauthorizedError = (error: any) => error?.status === 401 || error?.message?.includes("Unauthorized");

const ruleFormSchema = z.object({
  code: z.string().min(1, "Código es requerido"),
  name: z.string().min(1, "Nombre es requerido"),
  description: z.string().optional(),
  baseRule: z.string().optional(),
  validFrom: z.string().min(1, "Fecha de inicio es requerida"),
  validTo: z.string().min(1, "Fecha de fin es requerida"),
  participationType: z.enum(["individual", "society", "mixed"]),
  specialtyId: z.string().min(1, "Especialidad es requerida"),
  serviceId: z.string().optional(),
  doctorId: z.string().optional(),
  societyId: z.string().optional(),
  societyRut: z.string().optional(),
  societyName: z.string().optional(),
  paymentType: z.enum(["percentage", "fixed_amount"]),
  paymentValue: z.string().min(1, "Valor de pago es requerido"),
  scheduleType: z.string().optional(),
  applicableDays: z.array(z.string()).optional(),
});

type RuleFormData = z.infer<typeof ruleFormSchema>;

export default function Rules() {
  const [searchTerm, setSearchTerm] = useState("");
  const [participationFilter, setParticipationFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [lastSavedRule, setLastSavedRule] = useState<string | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [conflictDetectionResults, setConflictDetectionResults] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: rules, isLoading } = useQuery({
    queryKey: ["/api/calculation-rules"],
  });

  const { data: specialties } = useQuery({
    queryKey: ["/api/specialties"],
  });

  const { data: services } = useQuery({
    queryKey: ["/api/services"],
  });

  const { data: doctors } = useQuery({
    queryKey: ["/api/doctors"],
  });

  const { data: medicalSocieties } = useQuery({
    queryKey: ["/api/medical-societies"],
  });

  const form = useForm<RuleFormData>({
    resolver: zodResolver(ruleFormSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      baseRule: "",
      validFrom: "",
      validTo: "",
      participationType: "individual",
      specialtyId: "",
      serviceId: "all",
      doctorId: "",
      societyRut: "",
      societyName: "",
      paymentType: "percentage",
      paymentValue: "",
      scheduleType: "",
      applicableDays: [],
    },
  });

  // Mutations
  const createRuleMutation = useMutation({
    mutationFn: async (data: RuleFormData) => {
      return apiRequest("/api/calculation-rules", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calculation-rules"] });
      toast({
        title: "Regla creada",
        description: "La regla de cálculo ha sido creada exitosamente.",
      });
      setIsDialogOpen(false);
      form.reset();
      setStep(1);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sesión expirada",
          description: "Por favor, inicia sesión nuevamente.",
          variant: "destructive",
        });
      } else {
        console.error("Error creating rule:", error);
        toast({
          title: "Error",
          description: "No se pudo crear la regla. Inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RuleFormData> }) => {
      return apiRequest(`/api/calculation-rules/${id}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calculation-rules"] });
      toast({
        title: "Regla actualizada",
        description: "La regla de cálculo ha sido actualizada exitosamente.",
      });
      setIsDialogOpen(false);
      setEditingRule(null);
      form.reset();
      setStep(1);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sesión expirada",
          description: "Por favor, inicia sesión nuevamente.",
          variant: "destructive",
        });
      } else {
        console.error("Error updating rule:", error);
        toast({
          title: "Error",
          description: "No se pudo actualizar la regla. Inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/calculation-rules/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calculation-rules"] });
      toast({
        title: "Regla eliminada",
        description: "La regla de cálculo ha sido eliminada exitosamente.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sesión expirada",
          description: "Por favor, inicia sesión nuevamente.",
          variant: "destructive",
        });
      } else {
        console.error("Error deleting rule:", error);
        toast({
          title: "Error",
          description: "No se pudo eliminar la regla. Inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    },
  });

  // Event handlers
  const handleNewRule = () => {
    setEditingRule(null);
    form.reset();
    setStep(1);
    setLastSavedRule(null);
  };

  const handleEditRule = (rule: any) => {
    setEditingRule(rule);
    form.reset({
      code: rule.code || "",
      name: rule.name || "",
      description: rule.description || "",
      baseRule: rule.baseRule || "",
      validFrom: rule.validFrom || "",
      validTo: rule.validTo || "",
      participationType: rule.participationType || "individual",
      specialtyId: rule.specialtyId || "",
      serviceId: rule.serviceId || "all",
      doctorId: rule.doctorId || "",
      societyRut: rule.societyRut || "",
      societyName: rule.societyName || "",
      paymentType: rule.paymentType || "percentage",
      paymentValue: rule.paymentValue?.toString() || "",
      scheduleType: rule.scheduleType || "",
      applicableDays: rule.applicableDays || [],
    });
    setStep(1);
    setIsDialogOpen(true);
  };

  const handleDeleteRule = async (rule: any) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la regla "${rule.name}"?`)) {
      deleteRuleMutation.mutate(rule.id);
    }
  };

  const onSubmit = async (data: RuleFormData) => {
    if (editingRule) {
      updateRuleMutation.mutate({ id: editingRule.id, data });
    } else {
      createRuleMutation.mutate(data);
    }
  };

  // Filter rules based on search and filters
  const filteredRules = rules?.filter((rule: any) => {
    const matchesSearch = 
      rule.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesParticipation = !participationFilter || rule.participationType === participationFilter;
    const matchesSpecialty = !specialtyFilter || rule.specialtyId === specialtyFilter;
    
    let matchesStatus = true;
    if (statusFilter) {
      const today = new Date();
      const validFrom = new Date(rule.validFrom);
      const validTo = new Date(rule.validTo);
      
      if (statusFilter === "active") {
        matchesStatus = validFrom <= today && validTo >= today && rule.isActive;
      } else if (statusFilter === "pending") {
        matchesStatus = validFrom > today;
      } else if (statusFilter === "expired") {
        matchesStatus = validTo < today;
      }
    }
    
    return matchesSearch && matchesParticipation && matchesSpecialty && matchesStatus;
  }) || [];

  const calculateStats = () => {
    if (!rules) return { active: 0, pending: 0, expired: 0, total: 0 };
    
    const today = new Date();
    
    const active = rules.filter((rule: any) => {
      const validFrom = new Date(rule.validFrom);
      const validTo = new Date(rule.validTo);
      return validFrom <= today && validTo >= today && rule.isActive;
    }).length;
    
    const expired = rules.filter((rule: any) => 
      new Date(rule.validTo) < today
    ).length;
    
    return {
      active,
      pending: 8, // Mock data for pending rules in review
      expired,
      total: rules.length,
    };
  };

  const stats = calculateStats();

  return (
    <Layout>
      <div className="space-y-4 lg:space-y-6 w-full max-w-none">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Reglas de Cálculo</h2>
            <p className="text-sm lg:text-base text-gray-600 mt-1">
              Gestiona las reglas que determinan los cálculos de honorarios médicos
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
                <Button onClick={handleNewRule} className="bg-medical-blue hover:bg-medical-dark shadow-md">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Regla
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingRule ? "Editar Regla de Cálculo" : "Nueva Regla de Cálculo"}
                  </DialogTitle>
                  <DialogDescription>
                    Define los parámetros para el cálculo de honorarios médicos
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
                              <Input placeholder="Ej: CARD_IND_001" {...field} />
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
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: Cardiología Individual" {...field} />
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
                                {specialties?.map((specialty: any) => (
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
                        name="participationType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Participación</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="individual">Individual</SelectItem>
                                <SelectItem value="society">Sociedad</SelectItem>
                                <SelectItem value="mixed">Mixta</SelectItem>
                              </SelectContent>
                            </Select>
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
                            <FormLabel>
                              {form.watch("paymentType") === "percentage" ? "Porcentaje" : "Monto"}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder={form.watch("paymentType") === "percentage" ? "25" : "50000"} 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="validFrom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Inicio</FormLabel>
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
                            <FormLabel>Fecha de Fin</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
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
                              placeholder="Descripción detallada de la regla..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={createRuleMutation.isPending || updateRuleMutation.isPending}
                        className="bg-medical-blue hover:bg-medical-dark"
                      >
                        {createRuleMutation.isPending || updateRuleMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Guardando...
                          </>
                        ) : editingRule ? (
                          "Actualizar Regla"
                        ) : (
                          "Crear Regla"
                        )}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar reglas..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={participationFilter} onValueChange={setParticipationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de participación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="society">Sociedad</SelectItem>
                  <SelectItem value="mixed">Mixta</SelectItem>
                </SelectContent>
              </Select>
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Especialidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {specialties?.map((specialty: any) => (
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
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="active">Activas</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="expired">Vencidas</SelectItem>
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
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-green-600 text-xl" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                  <p className="text-sm text-gray-500">Activas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="text-yellow-600 text-xl" />
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
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="text-red-600 text-xl" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
                  <p className="text-sm text-gray-500">Vencidas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-blue-600 text-xl" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                  <p className="text-sm text-gray-500">Cálculos Este Mes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rules Table */}
        <Card>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Especialidad</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead>Vigencia</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue" />
                          <span className="ml-2">Cargando reglas...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredRules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No se encontraron reglas que coincidan con los filtros
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRules.map((rule: any) => {
                      const today = new Date();
                      const validFrom = new Date(rule.validFrom);
                      const validTo = new Date(rule.validTo);
                      const isActive = validFrom <= today && validTo >= today && rule.isActive;
                      const isPending = validFrom > today;
                      const isExpired = validTo < today;

                      return (
                        <TableRow key={rule.id}>
                          <TableCell className="font-mono text-sm">{rule.code}</TableCell>
                          <TableCell className="font-medium">{rule.name}</TableCell>
                          <TableCell>
                            {specialties?.find((s: any) => s.id === rule.specialtyId)?.name || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {rule.participationType === "individual" ? "Individual" : 
                               rule.participationType === "society" ? "Sociedad" : "Mixta"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {rule.paymentType === "percentage" 
                              ? `${rule.paymentValue}%` 
                              : `$${parseInt(rule.paymentValue).toLocaleString('es-CL')}`}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(rule.validFrom).toLocaleDateString('es-CL')} - <br />
                            {new Date(rule.validTo).toLocaleDateString('es-CL')}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                isActive 
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : isPending 
                                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                  : "bg-red-100 text-red-800 hover:bg-red-100"
                              }
                            >
                              {isActive ? "Activa" : isPending ? "Pendiente" : "Vencida"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditRule(rule)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteRule(rule)}
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

      {/* Rule Simulator Modal */}
      <Dialog open={isSimulatorOpen} onOpenChange={setIsSimulatorOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-blue-600" />
              Simulador de Reglas
            </DialogTitle>
            <DialogDescription>
              Prueba las reglas de cálculo con datos específicos para ver qué regla se aplicaría y el monto resultante.
            </DialogDescription>
          </DialogHeader>
          <RuleSimulator 
            onSimulate={async (data) => {
              try {
                const result = await fetch('/api/rules/simulate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                }).then(res => res.json());
                setSimulationResult(result);
                return result;
              } catch (error) {
                console.error('Simulation error:', error);
                toast({
                  title: "Error en la simulación",
                  description: "No se pudo simular las reglas. Verifique los datos.",
                  variant: "destructive"
                });
                throw error;
              }
            }}
            specialties={specialties || []}
            services={services || []}
            doctors={doctors || []}
            medicalSocieties={medicalSocieties || []}
            result={simulationResult}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}