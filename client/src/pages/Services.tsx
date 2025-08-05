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
import { Plus, Search, Edit, Trash2, ClipboardList } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

const serviceFormSchema = z.object({
  code: z.string().min(1, "Código es requerido"),
  name: z.string().min(1, "Nombre es requerido"),
  description: z.string().optional(),
  participationType: z.enum(["individual", "society", "mixed"]),
  specialtyId: z.string().min(1, "Especialidad es requerida"),
  baseValue: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

export default function Services() {
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [participationFilter, setParticipationFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({
    queryKey: ["/api/services"],
  });

  const { data: specialties } = useQuery({
    queryKey: ["/api/specialties"],
  });

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      participationType: "individual",
      specialtyId: "",
      baseValue: "",
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const submitData = {
        ...data,
        baseValue: data.baseValue ? parseFloat(data.baseValue) : null,
      };
      const response = await apiRequest("/api/services", "POST", submitData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Prestación creada",
        description: "La prestación ha sido creada exitosamente.",
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
        description: "No se pudo crear la prestación.",
        variant: "destructive",
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ServiceFormData }) => {
      const submitData = {
        ...data,
        baseValue: data.baseValue ? parseFloat(data.baseValue) : null,
      };
      const response = await apiRequest(`/api/services/${id}`, "PUT", submitData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setIsDialogOpen(false);
      setEditingService(null);
      form.reset();
      toast({
        title: "Prestación actualizada",
        description: "La prestación ha sido actualizada exitosamente.",
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
        description: "No se pudo actualizar la prestación.",
        variant: "destructive",
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/services/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Prestación eliminada",
        description: "La prestación ha sido eliminada exitosamente.",
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
        description: "No se pudo eliminar la prestación.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ServiceFormData) => {
    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, data });
    } else {
      createServiceMutation.mutate(data);
    }
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    form.reset({
      code: service.code || "",
      name: service.name || "",
      description: service.description || "",
      participationType: service.participationType || "individual",
      specialtyId: service.specialtyId || "",
      baseValue: service.baseValue ? service.baseValue.toString() : "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta prestación?")) {
      deleteServiceMutation.mutate(id);
    }
  };

  const handleNewService = () => {
    setEditingService(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const filteredServices = (Array.isArray(services) ? services : []).filter((service: any) => {
    const matchesSearch = 
      service.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = !specialtyFilter || service.specialtyId === specialtyFilter;
    const matchesParticipation = !participationFilter || service.participationType === participationFilter;
    
    return matchesSearch && matchesSpecialty && matchesParticipation;
  }) || [];

  const getSpecialtyName = (specialtyId: string) => {
    const specialty = Array.isArray(specialties) ? specialties.find((s: any) => s.id === specialtyId) : null;
    return specialty?.name || "N/A";
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Gestión Prestaciones</h2>
            <p className="text-gray-600 mt-1">
              Administra el catálogo de prestaciones y servicios médicos
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewService} className="bg-medical-blue hover:bg-medical-dark">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Prestación
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? "Editar Prestación" : "Crear Nueva Prestación"}
                </DialogTitle>
                <DialogDescription>
                  {editingService
                    ? "Modifica los datos de la prestación."
                    : "Ingresa los datos de la nueva prestación."}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código *</FormLabel>
                          <FormControl>
                            <Input placeholder="P001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="baseValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Base</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="50000"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre *</FormLabel>
                        <FormControl>
                          <Input placeholder="Consulta Médica General" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe la prestación médica..."
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
                                <SelectValue placeholder="Selecciona especialidad" />
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
                          <FormLabel>Tipo de Participación *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="individual">Individual</SelectItem>
                              <SelectItem value="society">Sociedad</SelectItem>
                              <SelectItem value="mixed">Mixto</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        createServiceMutation.isPending || updateServiceMutation.isPending
                      }
                    >
                      {editingService ? "Actualizar" : "Crear"}
                    </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por código o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por especialidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las especialidades</SelectItem>
                  {specialties?.map((specialty: any) => (
                    <SelectItem key={specialty.id} value={specialty.id}>
                      {specialty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={participationFilter} onValueChange={setParticipationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de participación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="society">Sociedad</SelectItem>
                  <SelectItem value="mixed">Mixto</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSpecialtyFilter("");
                  setParticipationFilter("");
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Services Table */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Catálogo de Prestaciones</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <ClipboardList className="w-4 h-4" />
                <span>Mostrando {filteredServices.length} prestaciones</span>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead>Tipo Participación</TableHead>
                  <TableHead>Valor Base</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Cargando prestaciones...
                    </TableCell>
                  </TableRow>
                ) : filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No se encontraron prestaciones
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service: any) => (
                    <TableRow key={service.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm font-medium text-medical-blue">
                        {service.code}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{service.name}</p>
                          {service.description && (
                            <p className="text-sm text-gray-500 max-w-xs truncate">
                              {service.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900">
                          {getSpecialtyName(service.specialtyId)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getParticipationBadge(service.participationType)}>
                          {getParticipationLabel(service.participationType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900">
                          {service.baseValue 
                            ? `$${parseFloat(service.baseValue).toLocaleString()}`
                            : "No definido"
                          }
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={service.isActive ? "default" : "secondary"}>
                          {service.isActive ? "Activa" : "Inactiva"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(service)}
                            className="text-gray-400 hover:text-warning-orange"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(service.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
