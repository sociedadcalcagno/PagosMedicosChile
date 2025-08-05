import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
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
import { Plus, Search, Edit, Trash2, Calculator, Eye, Copy, CheckCircle, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      serviceId: "",
      doctorId: "",
      societyRut: "",
      societyName: "",
      paymentType: "percentage",
      paymentValue: "",
      scheduleType: "",
      applicableDays: [],
    },
  });

  const createRuleMutation = useMutation({
    mutationFn: async (data: RuleFormData) => {
      const submitData = {
        ...data,
        paymentValue: parseFloat(data.paymentValue),
        applicableDays: data.applicableDays || [],
      };
      const response = await apiRequest("POST", "/api/calculation-rules", submitData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calculation-rules"] });
      setIsDialogOpen(false);
      setStep(1);
      form.reset();
      toast({
        title: "Regla creada",
        description: "La regla de cálculo ha sido creada exitosamente.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo crear la regla de cálculo.",
        variant: "destructive",
      });
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RuleFormData }) => {
      const submitData = {
        ...data,
        paymentValue: parseFloat(data.paymentValue),
        applicableDays: data.applicableDays || [],
      };
      const response = await apiRequest("PUT", `/api/calculation-rules/${id}`, submitData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calculation-rules"] });
      setIsDialogOpen(false);
      setEditingRule(null);
      setStep(1);
      form.reset();
      toast({
        title: "Regla actualizada",
        description: "La regla de cálculo ha sido actualizada exitosamente.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo actualizar la regla de cálculo.",
        variant: "destructive",
      });
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/calculation-rules/${id}`);
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
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo eliminar la regla de cálculo.",
        variant: "destructive",
      });
    },
  });

  const duplicateRuleMutation = useMutation({
    mutationFn: async (rule: any) => {
      const duplicatedRule = {
        ...rule,
        code: `${rule.code}_COPY`,
        name: `${rule.name} (Copia)`,
        paymentValue: parseFloat(rule.paymentValue),
      };
      delete duplicatedRule.id;
      delete duplicatedRule.createdAt;
      delete duplicatedRule.updatedAt;
      
      const response = await apiRequest("POST", "/api/calculation-rules", duplicatedRule);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calculation-rules"] });
      toast({
        title: "Regla duplicada",
        description: "La regla de cálculo ha sido duplicada exitosamente.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo duplicar la regla de cálculo.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: RuleFormData) => {
    if (editingRule) {
      updateRuleMutation.mutate({ id: editingRule.id, data });
    } else {
      createRuleMutation.mutate(data);
    }
  };

  const handleEdit = (rule: any) => {
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
      serviceId: rule.serviceId || "",
      societyId: rule.societyId || "",
      societyRut: rule.societyRut || "",
      societyName: rule.societyName || "",
      paymentType: rule.paymentType || "percentage",
      paymentValue: rule.paymentValue ? rule.paymentValue.toString() : "",
      scheduleType: rule.scheduleType || "",
      applicableDays: rule.applicableDays || [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta regla?")) {
      deleteRuleMutation.mutate(id);
    }
  };

  const handleDuplicate = (rule: any) => {
    duplicateRuleMutation.mutate(rule);
  };

  const handleNewRule = () => {
    setEditingRule(null);
    setStep(1);
    form.reset();
    setIsDialogOpen(true);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const filteredRules = (Array.isArray(rules) ? rules : []).filter((rule: any) => {
    const matchesSearch = 
      rule.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesParticipation = !participationFilter || rule.participationType === participationFilter;
    const matchesSpecialty = !specialtyFilter || rule.specialtyId === specialtyFilter;
    
    const today = new Date();
    const validFrom = new Date(rule.validFrom);
    const validTo = new Date(rule.validTo);
    let matchesStatus = true;
    
    if (statusFilter === "active") {
      matchesStatus = rule.isActive && validFrom <= today && validTo >= today;
    } else if (statusFilter === "expired") {
      matchesStatus = validTo < today;
    } else if (statusFilter === "inactive") {
      matchesStatus = !rule.isActive;
    }
    
    return matchesSearch && matchesParticipation && matchesSpecialty && matchesStatus;
  }) || [];

  const getSpecialtyName = (specialtyId: string) => {
    const specialty = Array.isArray(specialties) ? specialties.find((s: any) => s.id === specialtyId) : null;
    return specialty?.name || "N/A";
  };

  const getServiceName = (serviceId: string) => {
    if (!serviceId) return "Todas";
    const service = Array.isArray(services) ? services.find((s: any) => s.id === serviceId) : null;
    return service?.name || "N/A";
  };

  const getRuleStatus = (rule: any) => {
    const today = new Date();
    const validFrom = new Date(rule.validFrom);
    const validTo = new Date(rule.validTo);
    
    if (!rule.isActive) return { status: "Inactiva", variant: "secondary" as const };
    if (validTo < today) return { status: "Vencida", variant: "destructive" as const };
    if (validFrom <= today && validTo >= today) return { status: "Activa", variant: "default" as const };
    return { status: "Pendiente", variant: "secondary" as const };
  };

  const getParticipationBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      individual: "default",
      society: "secondary",
      mixed: "destructive",
    };
    return variants[type] || "secondary";
  };

  const getParticipationLabel = (type: string) => {
    const labels: Record<string, string> = {
      individual: "Individual",
      society: "Sociedad",
      mixed: "Mixto",
    };
    return labels[type] || type;
  };

  // Calculate stats
  const calculateStats = () => {
    if (!rules || !Array.isArray(rules)) return { active: 0, pending: 0, expired: 0, total: 0 };
    
    const today = new Date();
    const active = rules.filter((rule: any) => {
      const validFrom = new Date(rule.validFrom);
      const validTo = new Date(rule.validTo);
      return rule.isActive && validFrom <= today && validTo >= today;
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

  const weekDays = [
    { value: "monday", label: "Lunes" },
    { value: "tuesday", label: "Martes" },
    { value: "wednesday", label: "Miércoles" },
    { value: "thursday", label: "Jueves" },
    { value: "friday", label: "Viernes" },
    { value: "saturday", label: "Sábado" },
    { value: "sunday", label: "Domingo" },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Reglas de Cálculo</h2>
            <p className="text-gray-600 mt-1">
              Gestiona las reglas que determinan los cálculos de honorarios médicos
            </p>
          </div>
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

              {/* Step Indicator */}
              <div className="mb-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                      step >= 1 ? 'bg-medical-blue text-white' : 'bg-gray-300 text-gray-600'
                    }`}>1</div>
                    <span className={`ml-2 font-medium ${step >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                      Información Básica
                    </span>
                  </div>
                  <div className="h-px bg-gray-300 flex-1"></div>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                      step >= 2 ? 'bg-medical-blue text-white' : 'bg-gray-300 text-gray-600'
                    }`}>2</div>
                    <span className={`ml-2 font-medium ${step >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>
                      Criterios
                    </span>
                  </div>
                  <div className="h-px bg-gray-300 flex-1"></div>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                      step >= 3 ? 'bg-medical-blue text-white' : 'bg-gray-300 text-gray-600'
                    }`}>3</div>
                    <span className={`ml-2 font-medium ${step >= 3 ? 'text-gray-900' : 'text-gray-500'}`}>
                      Validación
                    </span>
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (step === 3) {
                    form.handleSubmit(handleSubmit)(e);
                  }
                }} className="space-y-6">
                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Código de Regla *</FormLabel>
                              <FormControl>
                                <Input placeholder="R005" {...field} />
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
                              <FormLabel>Nombre de la Regla *</FormLabel>
                              <FormControl>
                                <Input placeholder="Nombre descriptivo" {...field} />
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
                                placeholder="Describe el propósito y aplicación de esta regla..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="validFrom"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vigencia Desde *</FormLabel>
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
                              <FormLabel>Vigencia Hasta *</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="participationType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Participación *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="individual">Profesional</SelectItem>
                                  <SelectItem value="society">Sociedad</SelectItem>
                                  <SelectItem value="mixed">Mixto</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="specialtyId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Especialidad *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {(Array.isArray(specialties) ? specialties : []).map((specialty: any) => (
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
                      </div>

                      {/* Selector de Profesional o Sociedad según tipo de participación */}
                      {form.watch("participationType") === "individual" && (
                        <FormField
                          control={form.control}
                          name="doctorId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Médico/Profesional *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar médico..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {(Array.isArray(doctors) ? doctors : []).map((doctor: any) => (
                                    <SelectItem key={doctor.id} value={doctor.id}>
                                      {doctor.rut} - {doctor.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {form.watch("participationType") === "society" && (
                        <FormField
                          control={form.control}
                          name="societyId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sociedad Médica *</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  // Auto-fill RUT and name based on selected society
                                  const selectedSociety = (Array.isArray(medicalSocieties) ? medicalSocieties : []).find((s: any) => s.id === value);
                                  if (selectedSociety) {
                                    form.setValue("societyRut", selectedSociety.rut);
                                    form.setValue("societyName", selectedSociety.name);
                                  }
                                }}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar sociedad médica..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {(Array.isArray(medicalSocieties) ? medicalSocieties : []).map((society: any) => (
                                    <SelectItem key={society.id} value={society.id}>
                                      {society.rut} - {society.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="serviceId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Prestación</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Todas las prestaciones" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="all">Todas las prestaciones</SelectItem>
                                {(Array.isArray(services) ? services : []).map((service: any) => (
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

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Configuración del Cálculo</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="paymentType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de Abono *</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar..." />
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
                                <FormLabel>Valor *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder={form.watch("paymentType") === "percentage" ? "35" : "450000"}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Criterios Avanzados</h4>
                        
                        <FormField
                          control={form.control}
                          name="scheduleType"
                          render={({ field }) => (
                            <FormItem className="mb-4">
                              <FormLabel>Tipo de Horario</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar tipo de horario" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="all">Todos los horarios</SelectItem>
                                  <SelectItem value="regular">Horario Hábil</SelectItem>
                                  <SelectItem value="irregular">Horario Inhábil</SelectItem>
                                  <SelectItem value="night">Horario Nocturno</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="applicableDays"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Días de la Semana</FormLabel>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {weekDays.map((day) => (
                                  <div key={day.value} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={day.value}
                                      checked={field.value?.includes(day.value)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([...current, day.value]);
                                        } else {
                                          field.onChange(current.filter((d) => d !== day.value));
                                        }
                                      }}
                                    />
                                    <label htmlFor={day.value} className="text-sm text-gray-700">
                                      {day.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="baseRule"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Regla Base</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe la lógica base de cálculo..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <DialogFooter className="gap-2">
                    {step > 1 && (
                      <Button type="button" variant="outline" onClick={prevStep}>
                        Anterior
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    {step < 3 ? (
                      <Button 
                        type="button" 
                        onClick={async () => {
                          // Validar campos del paso actual antes de continuar
                          if (step === 1) {
                            const isValid = await form.trigger(['code', 'name', 'validFrom', 'validTo']);
                            if (isValid) nextStep();
                          } else if (step === 2) {
                            const isValid = await form.trigger(['participationType', 'specialtyId', 'paymentType', 'paymentValue']);
                            if (isValid) nextStep();
                          }
                        }}
                      >
                        Siguiente: {step === 1 ? "Criterios" : "Validación"}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => form.handleSubmit(handleSubmit)()}
                        disabled={
                          createRuleMutation.isPending || updateRuleMutation.isPending
                        }
                        className="bg-medical-blue hover:bg-medical-dark"
                      >
                        {editingRule ? "Actualizar Regla" : "Crear Regla"}
                      </Button>
                    )}
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters Section */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros de Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Código o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={participationFilter} onValueChange={setParticipationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de participación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="individual">Profesional</SelectItem>
                  <SelectItem value="society">Sociedad</SelectItem>
                  <SelectItem value="mixed">Mixto</SelectItem>
                </SelectContent>
              </Select>
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Especialidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {(Array.isArray(specialties) ? specialties : []).map((specialty: any) => (
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
                  <SelectItem value="active">Activa</SelectItem>
                  <SelectItem value="inactive">Inactiva</SelectItem>
                  <SelectItem value="expired">Vencida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row justify-end mt-4 space-y-2 sm:space-y-0 sm:space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setParticipationFilter("");
                  setSpecialtyFilter("");
                  setStatusFilter("");
                }}
              >
                Limpiar
              </Button>
              <Button className="bg-medical-blue hover:bg-medical-dark">
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rules Table */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Lista de Reglas</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calculator className="w-4 h-4" />
                <span>Mostrando {filteredRules.length} de {(Array.isArray(rules) ? rules.length : 0)} reglas</span>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Especialidad</TableHead>
                    <TableHead>Regla Base</TableHead>
                    <TableHead>Vigencia</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Cargando reglas...
                    </TableCell>
                  </TableRow>
                ) : filteredRules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No se encontraron reglas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRules.map((rule: any) => {
                    const status = getRuleStatus(rule);
                    return (
                      <TableRow key={rule.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-mono text-sm font-medium text-medical-blue">
                          {rule.code}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{rule.name}</p>
                            {rule.description && (
                              <p className="text-sm text-gray-500 max-w-xs truncate">
                                {rule.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getParticipationBadge(rule.participationType)}>
                            {getParticipationLabel(rule.participationType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-900">
                            {getSpecialtyName(rule.specialtyId)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-900">
                            {rule.paymentType === "percentage" 
                              ? `${rule.paymentValue}% del valor base`
                              : `$${parseFloat(rule.paymentValue).toLocaleString()} fijo`
                            }
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="text-gray-900">{rule.validFrom}</p>
                            <p className="text-gray-500">{rule.validTo}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>
                            {status.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-medical-blue"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(rule)}
                              className="text-gray-400 hover:text-warning-orange"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicate(rule)}
                              className="text-gray-400 hover:text-blue-500"
                              title="Duplicar"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(rule.id)}
                              className="text-gray-400 hover:text-red-500"
                              title="Eliminar"
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

            {/* Mobile Card Layout */}
            <div className="lg:hidden space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Cargando reglas...</div>
              ) : filteredRules.length === 0 ? (
                <div className="text-center py-8">No se encontraron reglas</div>
              ) : (
                filteredRules.map((rule: any) => {
                  const status = getRuleStatus(rule);
                  return (
                    <Card key={rule.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{rule.name}</h4>
                            <p className="text-sm text-medical-blue font-mono">{rule.code}</p>
                          </div>
                          <Badge variant={status.variant}>
                            {status.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Tipo:</span>
                            <Badge variant={getParticipationBadge(rule.participationType)} className="ml-1">
                              {getParticipationLabel(rule.participationType)}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-gray-500">Especialidad:</span>
                            <span className="ml-1">{getSpecialtyName(rule.specialtyId)}</span>
                          </div>
                        </div>

                        <div className="text-sm">
                          <span className="text-gray-500">Regla Base:</span>
                          <p className="mt-1">
                            {rule.paymentType === "percentage" 
                              ? `${rule.paymentValue}% del valor base`
                              : `$${parseFloat(rule.paymentValue).toLocaleString()} fijo`
                            }
                          </p>
                        </div>

                        <div className="text-sm">
                          <span className="text-gray-500">Vigencia:</span>
                          <p className="mt-1">{rule.validFrom} - {rule.validTo}</p>
                        </div>

                        <div className="flex justify-end space-x-2 pt-2 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-medical-blue"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(rule)}
                            className="text-gray-400 hover:text-warning-orange"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicate(rule)}
                            className="text-gray-400 hover:text-blue-500"
                            title="Duplicar"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(rule.id)}
                            className="text-gray-400 hover:text-red-500"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-success-green text-xl" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                  <p className="text-sm text-gray-500">Reglas Activas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="text-warning-orange text-xl" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  <p className="text-sm text-gray-500">En Revisión</p>
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
      </div>
    </Layout>
  );
}
