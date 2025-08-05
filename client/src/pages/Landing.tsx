import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Calculator, BarChart3, Shield, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue to-medical-dark">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center text-white mb-16">
          <div className="flex justify-center mb-6">
            <Heart className="text-6xl" />
          </div>
          <h1 className="text-5xl font-bold mb-4">Portal de Pagos Médicos</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Sistema integral para la gestión de honorarios médicos con inteligencia artificial
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6 text-white">
              <Users className="w-12 h-12 mb-4 text-blue-300" />
              <h3 className="text-xl font-semibold mb-2">Gestión de Maestros</h3>
              <p className="opacity-80">
                Administra usuarios, médicos, especialidades y prestaciones desde un solo lugar
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6 text-white">
              <Calculator className="w-12 h-12 mb-4 text-green-300" />
              <h3 className="text-xl font-semibold mb-2">Reglas de Cálculo</h3>
              <p className="opacity-80">
                Define reglas complejas para el cálculo automático de honorarios médicos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6 text-white">
              <BarChart3 className="w-12 h-12 mb-4 text-purple-300" />
              <h3 className="text-xl font-semibold mb-2">Reportes Avanzados</h3>
              <p className="opacity-80">
                Genera reportes detallados y análisis de prestaciones médicas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6 text-white">
              <Shield className="w-12 h-12 mb-4 text-yellow-300" />
              <h3 className="text-xl font-semibold mb-2">Seguridad</h3>
              <p className="opacity-80">
                Autenticación segura y control de acceso basado en roles
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6 text-white">
              <Zap className="w-12 h-12 mb-4 text-orange-300" />
              <h3 className="text-xl font-semibold mb-2">Inteligencia Artificial</h3>
              <p className="opacity-80">
                Asistente IA especializado en honorarios médicos para resolver dudas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6 text-white">
              <Heart className="w-12 h-12 mb-4 text-red-300" />
              <h3 className="text-xl font-semibold mb-2">Diseñado para Médicos</h3>
              <p className="opacity-80">
                Interface intuitiva optimizada para profesionales de la salud
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-white/10 backdrop-blur border-white/20 max-w-md mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Accede al Portal
              </h2>
              <p className="text-white/80 mb-6">
                Inicia sesión para gestionar el sistema de honorarios médicos
              </p>
              <div className="space-y-3">
                <Button
                  size="lg"
                  className="bg-white text-medical-blue hover:bg-gray-100 font-semibold w-full"
                  onClick={() => (window.location.href = "/api/login")}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/50 text-white hover:bg-white/10 font-semibold w-full"
                  onClick={() => (window.location.href = "/api/logout")}
                >
                  Cambiar Cuenta
                </Button>
              </div>
              <p className="text-white/60 text-sm mt-4">
                Para cambiar de cuenta, primero cierra sesión y luego inicia sesión nuevamente
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
