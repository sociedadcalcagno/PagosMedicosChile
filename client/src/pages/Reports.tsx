import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, Download, Filter, Search, TrendingUp, Users, Calculator, FileText } from "lucide-react";

export default function Reports() {
  const [participationFilter, setParticipationFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/services"],
  });

  const { data: specialties } = useQuery({
    queryKey: ["/api/specialties"],
  });

  const { data: doctors } = useQuery({
    queryKey: ["/api/doctors"],
  });

  const { data: rules } = useQuery({
    queryKey: ["/api/calculation-rules"],
  });

  const filteredServices = services?.filter((service: any) => {
    const matchesSearch = 
      service.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = !specialtyFilter || service.specialtyId === specialtyFilter;
    const matchesParticipation = !participationFilter || service.participationType === participationFilter;
    
    return matchesSearch && matchesSpecialty && matchesParticipation;
  }) || [];

  const getSpecialtyName = (specialtyId: string) => {
    const specialty = specialties?.find((s: any) => s.id === specialtyId);
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

  const handleExport = (format: 'pdf' | 'excel') => {
    // Mock export functionality
    console.log(`Exporting report as ${format}`);
    // In a real application, this would generate and download the report
  };

  // Calculate some basic statistics
  const totalServices = services?.length || 0;
  const totalDoctors = doctors?.length || 0;
  const totalRules = rules?.length || 0;
  const activeServices = services?.filter((s: any) => s.isActive).length || 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Reporte Prestaciones</h2>
            <p className="text-gray-600 mt-1">
              Consulta y análisis detallado de prestaciones médicas
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => handleExport('excel')}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Excel</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExport('pdf')}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="text-blue-600 text-xl" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{totalServices}</p>
                  <p className="text-sm text-gray-500">Total Prestaciones</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-success-green text-xl" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{activeServices}</p>
                  <p className="text-sm text-gray-500">Prestaciones Activas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="text-purple-600 text-xl" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{totalDoctors}</p>
                  <p className="text-sm text-gray-500">Médicos Registrados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calculator className="text-warning-orange text-xl" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{totalRules}</p>
                  <p className="text-sm text-gray-500">Reglas de Cálculo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filtros de Consulta</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar prestación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por especialidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las especialidades</SelectItem>
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
                  <SelectItem value="">Todos los tipos</SelectItem>
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

        {/* Report Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Detalle de Prestaciones</span>
              </div>
              <div className="text-sm text-gray-500">
                Mostrando {filteredServices.length} de {totalServices} prestaciones
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre de Prestación</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead>Tipo de Participación</TableHead>
                  <TableHead>Valor Base</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servicesLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Cargando prestaciones...
                    </TableCell>
                  </TableRow>
                ) : filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No se encontraron prestaciones con los filtros aplicados
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
                      <TableCell>
                        <span className="text-sm text-gray-900">
                          {service.createdAt 
                            ? new Date(service.createdAt).toLocaleDateString()
                            : "N/A"
                          }
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Additional Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Especialidad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {specialties?.slice(0, 5).map((specialty: any) => {
                  const count = services?.filter((s: any) => s.specialtyId === specialty.id).length || 0;
                  const percentage = totalServices > 0 ? (count / totalServices) * 100 : 0;
                  
                  return (
                    <div key={specialty.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{specialty.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-medical-blue h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500 w-8">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tipos de Participación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['individual', 'society', 'mixed'].map((type) => {
                  const count = services?.filter((s: any) => s.participationType === type).length || 0;
                  const percentage = totalServices > 0 ? (count / totalServices) * 100 : 0;
                  
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {getParticipationLabel(type)}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-success-green h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500 w-8">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
