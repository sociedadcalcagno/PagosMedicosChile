import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertTriangle, TrendingUp, HandHeart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ["/api/doctors"],
  });

  const { data: rules, isLoading: rulesLoading } = useQuery({
    queryKey: ["/api/calculation-rules"],
  });

  const { data: specialties, isLoading: specialtiesLoading } = useQuery({
    queryKey: ["/api/specialties"],
  });

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/services"],
  });

  const { data: conventions, isLoading: conventionsLoading } = useQuery({
    queryKey: ["/api/calculation-rules", "convention"],
    queryFn: () => apiRequest("/api/calculation-rules?ruleType=convention"),
  });

  const calculateStats = () => {
    if (!rules || !Array.isArray(rules)) return { active: 0, pending: 0, expired: 0, total: 0 };
    
    const today = new Date();
    const active = rules.filter((rule: any) => 
      rule.isActive && new Date(rule.validFrom) <= today && new Date(rule.validTo) >= today
    ).length;
    
    const expired = rules.filter((rule: any) => 
      new Date(rule.validTo) < today
    ).length;
    
    return {
      active,
      pending: 8, // Mock data for pending rules
      expired,
      total: Array.isArray(rules) ? rules.length : 0,
    };
  };

  const calculateConventionStats = () => {
    if (!conventions || !Array.isArray(conventions)) return { active: 0, expired: 0, total: 0 };
    
    const today = new Date();
    const active = conventions.filter((convention: any) => 
      convention.isActive && new Date(convention.validFrom) <= today && new Date(convention.validTo) >= today
    ).length;
    
    const expired = conventions.filter((convention: any) => 
      new Date(convention.validTo) < today
    ).length;
    
    return {
      active,
      expired,
      total: conventions.length,
    };
  };

  const stats = calculateStats();
  const conventionStats = calculateConventionStats();

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Panel de Control</h2>
          <p className="text-gray-600 mt-1">
            Resumen general del sistema de honorarios médicos
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-green-600 text-xl" />
                  </div>
                </div>
                <div className="ml-4">
                  {rulesLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                  )}
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
                    <Clock className="text-orange-600 text-xl" />
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
                  {rulesLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
                  )}
                  <p className="text-sm text-gray-500">Vencidas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <HandHeart className="text-purple-600 text-xl" />
                  </div>
                </div>
                <div className="ml-4">
                  {conventionsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{conventionStats.active}</p>
                  )}
                  <p className="text-sm text-gray-500">Convenios Activos</p>
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

        {/* Overview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Médicos Registrados</span>
                {doctorsLoading ? (
                  <Skeleton className="h-5 w-8" />
                ) : (
                  <Badge variant="secondary">{Array.isArray(doctors) ? doctors.length : 0}</Badge>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Especialidades</span>
                {specialtiesLoading ? (
                  <Skeleton className="h-5 w-8" />
                ) : (
                  <Badge variant="secondary">{Array.isArray(specialties) ? specialties.length : 0}</Badge>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Prestaciones</span>
                {servicesLoading ? (
                  <Skeleton className="h-5 w-8" />
                ) : (
                  <Badge variant="secondary">{Array.isArray(services) ? services.length : 0}</Badge>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Reglas de Cálculo</span>
                {rulesLoading ? (
                  <Skeleton className="h-5 w-8" />
                ) : (
                  <Badge variant="secondary">{stats.total}</Badge>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Convenios Médicos</span>
                {conventionsLoading ? (
                  <Skeleton className="h-5 w-8" />
                ) : (
                  <Badge variant="secondary">{conventionStats.total}</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Nueva regla R005 creada para Cardiología
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Médico Dr. García actualizado
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Regla R003 próxima a vencer
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Nueva especialidad Neurología agregada
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium text-gray-900">Crear Nueva Regla</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Configura una nueva regla de cálculo
                </p>
              </button>
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium text-gray-900">Registrar Médico</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Agrega un nuevo profesional médico
                </p>
              </button>
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium text-gray-900">Ver Reportes</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Consulta reportes de prestaciones
                </p>
              </button>
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium text-gray-900">Configuración</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Ajusta configuraciones del sistema
                </p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
