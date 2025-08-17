import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Heart, Lock, User } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";

const loginSchema = z.object({
  rut: z.string().min(1, "RUT es requerido"),
  password: z.string().min(1, "Contraseña es requerida"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function ProfessionalLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rut: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await fetch('/api/professional-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error de autenticación');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Acceso exitoso",
        description: `Bienvenido Dr./Dra. ${data.doctorName}`,
      });
      // Force page reload to trigger proper routing
      window.location.href = '/';
    },
    onError: (error: any) => {
      toast({
        title: "Error de acceso",
        description: error.message || "RUT o contraseña incorrectos",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const handleDevLogin = (profile: string) => {
    let mockUserId = '';
    switch (profile) {
      case 'admin':
        mockUserId = 'mock_admin';
        break;
      case 'supervisor':
        mockUserId = 'mock_supervisor';
        break;
      case 'doctor':
        mockUserId = 'mock_doctor_carlos';
        break;
      default:
        mockUserId = 'mock_user';
    }
    
    window.location.href = `/api/mock-login/${mockUserId}`;
  };

  const formatRUT = (value: string) => {
    // Remove all non-digits and non-K characters
    const cleaned = value.replace(/[^0-9kK]/g, '').toUpperCase();
    
    // Add dots and dash formatting
    if (cleaned.length <= 1) return cleaned;
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 7) {
      return cleaned.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + cleaned.slice(-1);
    }
    return cleaned.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + cleaned.slice(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      {/* Background medical image effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10"></div>
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            PAGOS<br />
            <span className="text-blue-600">MÉDICOS</span>
          </CardTitle>
          <div className="text-xl font-semibold text-gray-700 mt-2">
            Portal Pagos Médicos
          </div>
          <div className="text-blue-600 font-medium">Chile</div>
          <p className="text-gray-600 text-sm mt-2">
            Ingrese su usuario y contraseña
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="rut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      RUT sin puntos con guión y dígito verificador
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          {...field}
                          placeholder="12345678-9"
                          className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          onChange={(e) => {
                            const formatted = formatRUT(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Contraseña"
                          className="pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="text-center">
                <a href="#" className="text-blue-600 text-sm hover:underline">
                  ¿Olvidó mi clave?
                </a>
              </div>
              
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base"
                disabled={loginMutation.isPending}
              >
                <Lock className="w-4 h-4 mr-2" />
                {loginMutation.isPending ? "Iniciando Sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
          </Form>
          
          <div className="text-center text-sm text-gray-600">
            Desconectado con éxito.
          </div>
          
          {/* Development Section */}
          <div className="border-t pt-4">
            <div className="text-center text-sm text-gray-600 mb-3">
              Desarrollo - Seleccionar perfil
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handleDevLogin('admin')}
                className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border"
              >
                <span className="font-medium">Administrador</span> - Dr. María González
              </button>
              <button
                onClick={() => handleDevLogin('supervisor')}
                className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border"
              >
                <span className="font-medium">Supervisor</span> - Dr. Carlos Rodríguez
              </button>
              <button
                onClick={() => handleDevLogin('doctor')}
                className="w-full text-left px-3 py-2 text-sm bg-green-50 hover:bg-green-100 rounded border border-green-200"
              >
                <span className="font-medium">Médico</span> - Dr. Carlos Alberto Pérez Morales
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}