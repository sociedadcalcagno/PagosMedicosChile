import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Stethoscope, Building, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Profile() {
  const [isSelectingDoctor, setIsSelectingDoctor] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: doctors } = useQuery({
    queryKey: ["/api/doctors"],
  });

  const { data: userDoctor } = useQuery({
    queryKey: ["/api/user-doctor"],
    enabled: !!user?.doctorId,
  });

  const linkDoctorMutation = useMutation({
    mutationFn: async (doctorId: string) => {
      const response = await apiRequest("POST", "/api/link-doctor", { doctorId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-doctor"] });
      setIsSelectingDoctor(false);
      toast({
        title: "Perfil vinculado",
        description: "Tu cuenta ha sido vinculada al perfil médico exitosamente.",
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
        description: "No se pudo vincular el perfil médico.",
        variant: "destructive",
      });
    },
  });

  const unlinkDoctorMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/unlink-doctor", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-doctor"] });
      toast({
        title: "Perfil desvinculado",
        description: "Tu cuenta ha sido desvinculada del perfil médico.",
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
        description: "No se pudo desvincular el perfil médico.",
        variant: "destructive",
      });
    },
  });

  const handleLinkDoctor = () => {
    if (selectedDoctorId) {
      linkDoctorMutation.mutate(selectedDoctorId);
    }
  };

  const getProfileBadge = (profile: string) => {
    switch (profile) {
      case 'admin':
        return <Badge variant="destructive"><Shield className="w-3 h-3 mr-1" />Administrador</Badge>;
      case 'supervisor':
        return <Badge variant="secondary"><Building className="w-3 h-3 mr-1" />Supervisor</Badge>;
      case 'doctor':
        return <Badge variant="default"><Stethoscope className="w-3 h-3 mr-1" />Médico</Badge>;
      default:
        return <Badge variant="outline"><User className="w-3 h-3 mr-1" />Usuario</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Mi Perfil</h2>
            <p className="text-gray-600 mt-1">
              Gestiona tu perfil y vinculación con información médica
            </p>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Información de Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{user?.email || "No disponible"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre</label>
                <p className="text-gray-900">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : "No disponible"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Perfil</label>
                <div className="mt-1">
                  {getProfileBadge(user?.profile || 'user')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Doctor Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="w-5 h-5 mr-2" />
                Perfil Médico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user?.doctorId && userDoctor ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">RUT Médico</label>
                    <p className="text-gray-900">{userDoctor.rut}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nombre Profesional</label>
                    <p className="text-gray-900">{userDoctor.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Especialidad</label>
                    <p className="text-gray-900">{userDoctor.specialtyName || "No disponible"}</p>
                  </div>
                  <div className="pt-4">
                    <Button
                      variant="outline"
                      onClick={() => unlinkDoctorMutation.mutate()}
                      disabled={unlinkDoctorMutation.isPending}
                    >
                      Desvincular Perfil Médico
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    No tienes un perfil médico vinculado
                  </p>
                  <Dialog open={isSelectingDoctor} onOpenChange={setIsSelectingDoctor}>
                    <DialogTrigger asChild>
                      <Button className="bg-medical-blue hover:bg-medical-dark">
                        Vincular Perfil Médico
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Seleccionar Perfil Médico</DialogTitle>
                        <DialogDescription>
                          Elige tu perfil médico para acceder a funciones específicas del sistema
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar médico..." />
                          </SelectTrigger>
                          <SelectContent>
                            {(doctors || []).map((doctor: any) => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                {doctor.rut} - {doctor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsSelectingDoctor(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleLinkDoctor}
                          disabled={!selectedDoctorId || linkDoctorMutation.isPending}
                          className="bg-medical-blue hover:bg-medical-dark"
                        >
                          Vincular Perfil
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Access Information */}
        <Card>
          <CardHeader>
            <CardTitle>Accesos del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center p-4 border rounded-lg">
                <User className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <h4 className="font-medium">Módulo Maestros</h4>
                  <p className="text-sm text-gray-500">Gestión de datos principales</p>
                </div>
              </div>
              {user?.doctorId && (
                <div className="flex items-center p-4 border rounded-lg bg-medical-light">
                  <Stethoscope className="w-8 h-8 text-medical-blue mr-3" />
                  <div>
                    <h4 className="font-medium">Portal Médico</h4>
                    <p className="text-sm text-gray-500">Funciones específicas de médico</p>
                  </div>
                </div>
              )}
              {user?.profile === 'admin' && (
                <div className="flex items-center p-4 border rounded-lg bg-red-50">
                  <Shield className="w-8 h-8 text-red-500 mr-3" />
                  <div>
                    <h4 className="font-medium">Administración</h4>
                    <p className="text-sm text-gray-500">Acceso completo al sistema</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}