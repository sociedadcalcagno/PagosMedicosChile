import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

// Import the original logo and background images
import logoImage from "@assets/logo_1754398855957.png";
import loginBgImage from "@assets/Login_1754398849500.png";

const loginSchema = z.object({
  username: z.string().min(1, "Usuario es requerido"),
  password: z.string().min(1, "Contraseña es requerida"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function UnifiedLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await fetch('/api/unified-login', {
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
        description: `Bienvenido ${data.user.name}`,
      });
      // Force page reload to trigger proper routing
      window.location.href = '/';
    },
    onError: (error: any) => {
      toast({
        title: "Error de acceso",
        description: error.message || "Usuario o contraseña incorrectos",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${loginBgImage})`,
      }}
    >
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center">
              <img 
                src={logoImage} 
                alt="Pagos Médicos Chile" 
                className="h-16 w-auto"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Portal Pagos Médicos
              </h1>
              <p className="text-lg text-blue-600 font-medium">Chile</p>
              <p className="text-sm text-gray-500 mt-2">
                Ingrese su usuario y contraseña
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        RUT sin puntos con guión y dígito verificador
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="12345678-9"
                          className="h-12 text-center bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          data-testid="input-username"
                        />
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
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Contraseña
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Contraseña"
                            className="h-12 pr-12 bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            data-testid="input-password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-right">
                  <a 
                    href="#" 
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    ¿Olvidó mi clave?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base"
                  disabled={loginMutation.isPending}
                  data-testid="button-login"
                >
                  {loginMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Iniciando Sesión</span>
                    </div>
                  ) : (
                    <>
                      🔒 Iniciar Sesión
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Desconectado con éxito.
              </p>
            </div>

            {/* Credenciales de prueba */}
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 text-center mb-3">
                Desarrollo - Credenciales de prueba:
              </p>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="bg-gray-50 p-2 rounded">
                  <strong>Admin:</strong> admin / admin123
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <strong>Dr. Alarcón:</strong> 14366756-1 / 123
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}