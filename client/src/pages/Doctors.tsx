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
import { Plus, Search, Edit, Trash2, UserCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

const doctorFormSchema = z.object({
  rut: z.string().min(1, "RUT es requerido"),
  name: z.string().min(1, "Nombre es requerido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  specialtyId: z.string().min(1, "Especialidad es requerida"),
  hmqType: z.string().optional(),
  station: z.string().optional(),
  societyType: z.enum(["individual", "society"]),
  societyRut: z.string().optional(),
  societyName: z.string().optional(),
  paymentType: z.enum(["transfer", "check", "deposit"]),
  bankAccount: z.string().optional(),
  bankName: z.string().optional(),
  accountHolderName: z.string().optional(),
  accountHolderRut: z.string().optional(),
});

type DoctorFormData = z.infer<typeof doctorFormSchema>;

export default function Doctors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: doctors, isLoading } = useQuery({
    queryKey: ["/api/doctors"],
  });

  const { data: specialties } = useQuery({
    queryKey: ["/api/specialties"],
  });

  const { data: medicalSocieties } = useQuery({
    queryKey: ["/api/medical-societies"],
  });

  const form = useForm<DoctorFormData>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      rut: "",
      name: "",
      email: "",
      phone: "",
      specialtyId: "",
      hmqType: "",
      station: "",
      societyType: "individual",
      societyRut: "",
      societyName: "",
      paymentType: "transfer",
      bankAccount: "",
      bankName: "",
      accountHolderName: "",
      accountHolderRut: "",
    },
  });

  const createDoctorMutation = useMutation({
    mutationFn: async (data: DoctorFormData) => {
      const response = await apiRequest("POST", "/api/doctors", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctors"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Médico creado",
        description: "El médico ha sido creado exitosamente.",
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
        description: "No se pudo crear el médico.",
        variant: "destructive",
      });
    },
  });

  const updateDoctorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: DoctorFormData }) => {
      const response = await apiRequest("PUT", `/api/doctors/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctors"] });
      setIsDialogOpen(false);
      setEditingDoctor(null);
      form.reset();
      toast({
        title: "Médico actualizado",
        description: "El médico ha sido actualizado exitosamente.",
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
        description: "No se pudo actualizar el médico.",
        variant: "destructive",
      });
    },
  });

  const deleteDoctorMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/doctors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctors"] });
      toast({
        title: "Médico eliminado",
        description: "El médico ha sido eliminado exitosamente.",
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
        description: "No se pudo eliminar el médico.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: DoctorFormData) => {
    // Limpiar societyRut si societyType es 'individual'
    const cleanedData = { ...data };
    if (cleanedData.societyType === 'individual') {
      cleanedData.societyRut = null;
      cleanedData.societyName = null;
    }
    
    if (editingDoctor) {
      updateDoctorMutation.mutate({ id: editingDoctor.id, data: cleanedData });
    } else {
      createDoctorMutation.mutate(cleanedData);
    }
  };

  const handleEdit = (doctor: any) => {
    setEditingDoctor(doctor);
    form.reset({
      rut: doctor.rut || "",
      name: doctor.name || "",
      email: doctor.email || "",
      phone: doctor.phone || "",
      specialtyId: doctor.specialtyId || "",
      hmqType: doctor.hmqType || "",
      station: doctor.station || "",
      societyType: doctor.societyType || "individual",
      societyRut: doctor.societyRut || "",
      societyName: doctor.societyName || "",
      paymentType: doctor.paymentType || "transfer",
      bankAccount: doctor.bankAccount || "",
      bankName: doctor.bankName || "",
      accountHolderName: doctor.accountHolderName || "",
      accountHolderRut: doctor.accountHolderRut || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este médico?")) {
      deleteDoctorMutation.mutate(id);
    }
  };

  const handleNewDoctor = () => {
    setEditingDoctor(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const filteredDoctors = (Array.isArray(doctors) ? doctors : []).filter((doctor: any) => {
    const matchesSearch = 
      doctor.rut?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = !specialtyFilter || doctor.specialtyId === specialtyFilter;
    
    return matchesSearch && matchesSpecialty;
  }) || [];

  const getSpecialtyName = (specialtyId: string) => {
    const specialty = Array.isArray(specialties) ? specialties.find((s: any) => s.id === specialtyId) : null;
    return specialty?.name || "N/A";
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Configuración Médicos</h2>
            <p className="text-gray-600 mt-1">
              Gestiona la información de los profesionales médicos
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewDoctor} className="bg-medical-blue hover:bg-medical-dark">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Médico
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingDoctor ? "Editar Médico" : "Crear Nuevo Médico"}
                </DialogTitle>
                <DialogDescription>
                  {editingDoctor
                    ? "Modifica los datos del médico."
                    : "Ingresa los datos del nuevo médico."}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="rut"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RUT *</FormLabel>
                          <FormControl>
                            <Input placeholder="12.345.678-9" {...field} />
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
                          <FormLabel>Nombre Completo *</FormLabel>
                          <FormControl>
                            <Input placeholder="Dr. Juan Pérez" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="doctor@email.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input placeholder="+56 9 1234 5678" {...field} />
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
                      name="hmqType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo HMQ</FormLabel>
                          <FormControl>
                            <Input placeholder="Tipo de HMQ" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="station"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estación/Departamento</FormLabel>
                        <FormControl>
                          <Input placeholder="Unidad de trabajo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="societyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Sociedad *</FormLabel>
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
                          <FormLabel>Tipo de Pago *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona tipo de pago" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="transfer">Transferencia</SelectItem>
                              <SelectItem value="check">Cheque</SelectItem>
                              <SelectItem value="deposit">Depósito</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch("societyType") === "society" && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="societyRut"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sociedad Médica *</FormLabel>
                            <Select onValueChange={(value) => {
                              field.onChange(value);
                              const selected = (medicalSocieties || []).find((s: any) => s.rut === value);
                              if (selected) {
                                form.setValue("societyName", selected.name);
                              }
                            }} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona una sociedad" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {(medicalSocieties || []).map((society: any) => (
                                  <SelectItem key={society.id} value={society.rut}>
                                    {society.rut} - {society.name}
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
                        name="societyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre Sociedad</FormLabel>
                            <FormControl>
                              <Input placeholder="Se llena automáticamente" {...field} disabled />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium text-gray-900">Información Bancaria</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Banco</FormLabel>
                            <FormControl>
                              <Input placeholder="Banco de Chile" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bankAccount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Cuenta</FormLabel>
                            <FormControl>
                              <Input placeholder="12345678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="accountHolderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Titular Cuenta</FormLabel>
                            <FormControl>
                              <Input placeholder="Nombre del titular" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="accountHolderRut"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>RUT Titular</FormLabel>
                            <FormControl>
                              <Input placeholder="12.345.678-9" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
                        createDoctorMutation.isPending || updateDoctorMutation.isPending
                      }
                    >
                      {editingDoctor ? "Actualizar" : "Crear"}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por RUT o nombre..."
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
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSpecialtyFilter("");
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Doctors Table */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Lista de Médicos</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <UserCheck className="w-4 h-4" />
                <span>Mostrando {filteredDoctors.length} médicos</span>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RUT</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead>Tipo Sociedad</TableHead>
                  <TableHead>Tipo Pago</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Cargando médicos...
                    </TableCell>
                  </TableRow>
                ) : filteredDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No se encontraron médicos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDoctors.map((doctor: any) => (
                    <TableRow key={doctor.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm font-medium text-medical-blue">
                        {doctor.rut}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{doctor.name}</p>
                          <p className="text-sm text-gray-500">{doctor.email || "Sin email"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900">
                          {getSpecialtyName(doctor.specialtyId)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={doctor.societyType === "individual" ? "default" : "secondary"}>
                          {doctor.societyType === "individual" ? "Individual" : "Sociedad"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900 capitalize">
                          {doctor.paymentType === "transfer" ? "Transferencia" : 
                           doctor.paymentType === "check" ? "Cheque" : "Depósito"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={doctor.isActive ? "default" : "secondary"}>
                          {doctor.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(doctor)}
                            className="text-gray-400 hover:text-warning-orange"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(doctor.id)}
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
