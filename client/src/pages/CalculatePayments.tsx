import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calculator, Calendar, User, Play, CheckCircle, AlertCircle, Filter, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Doctor, MedicalAttention } from "@shared/schema";

const calculationSchema = z.object({
  doctorId: z.string().optional(),
  dateFrom: z.string().min(1, "Fecha desde es requerida"),
  dateTo: z.string().min(1, "Fecha hasta es requerida"),
  includeParticipaciones: z.boolean().default(true),
  includeHmq: z.boolean().default(true),
});

type CalculationForm = z.infer<typeof calculationSchema>;

interface ProductionSummary {
  doctorName: string;
  totalAttentions: number;
  totalParticipaciones: number;
  totalHmq: number;
  totalAmount: number;
  averageAmount: number;
  periodFrom: string;
  periodTo: string;
}

export default function CalculatePayments() {
  const [selectedFilters, setSelectedFilters] = useState<CalculationForm | null>(null);
  const [productionData, setProductionData] = useState<ProductionSummary | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const form = useForm<CalculationForm>({
    resolver: zodResolver(calculationSchema),
    defaultValues: {
      doctorId: "all",
      dateFrom: "2025-07-01", // Expanded to include July data
      dateTo: new Date().toISOString().split('T')[0],
      includeParticipaciones: true,
      includeHmq: true,
    },
  });

  // Queries
  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ['/api/doctors'],
  });

  const { data: attentions = [] } = useQuery<MedicalAttention[]>({
    queryKey: ['/api/medical-attentions', selectedFilters],
    enabled: !!selectedFilters,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedFilters?.doctorId && selectedFilters.doctorId !== 'all') params.append('doctorId', selectedFilters.doctorId);
      if (selectedFilters?.dateFrom) params.append('dateFrom', selectedFilters.dateFrom);
      if (selectedFilters?.dateTo) params.append('dateTo', selectedFilters.dateTo);
      
      // Add participation type filters
      const participationTypes = [];
      if (selectedFilters?.includeParticipaciones) participationTypes.push('participacion');
      if (selectedFilters?.includeHmq) participationTypes.push('hmq');
      if (participationTypes.length > 0) {
        params.append('participationTypes', participationTypes.join(','));
      }
      
      const response = await apiRequest(`/api/medical-attentions?${params}`);
      return await response.json();
    },
  });

  const { data: calculations = [] } = useQuery({
    queryKey: ['/api/payment-calculations', selectedFilters],
    enabled: !!selectedFilters,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedFilters?.doctorId && selectedFilters.doctorId !== 'all') params.append('doctorId', selectedFilters.doctorId);
      if (selectedFilters?.dateFrom) params.append('dateFrom', selectedFilters.dateFrom);
      if (selectedFilters?.dateTo) params.append('dateTo', selectedFilters.dateTo);
      const response = await apiRequest(`/api/payment-calculations?${params}`);
      return await response.json();
    },
  });

  // Mutations
  const calculateMutation = useMutation({
    mutationFn: async (data: CalculationForm) => {
      const response = await apiRequest('/api/calculate-payments', 'POST', data);
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-calculations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/medical-attentions'] });
      toast({
        title: "Cálculo exitoso",
        description: `Se calcularon ${Array.isArray(data) ? data.length : 0} pagos correctamente`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error en el cálculo",
        description: error.message || "No se pudieron calcular los pagos",
        variant: "destructive",
      });
    },
  });

  const handlePreview = (data: CalculationForm) => {
    setSelectedFilters(data);
  };

  // Calculate production summary when attentions data changes
  useEffect(() => {
    if (selectedFilters && attentions.length > 0) {
      const selectedDoctor = doctors.find(d => d.id === selectedFilters.doctorId);
      const participacionCount = attentions.filter((a: any) => a.recordType === 'participacion').length;
      const hmqCount = attentions.filter((a: any) => a.recordType === 'hmq').length;
      const totalAmount = attentions.reduce((sum: number, a: any) => sum + (parseFloat(a.participatedAmount) || 0), 0);
      
      setProductionData({
        doctorName: selectedDoctor?.name || 'Todos los médicos',
        totalAttentions: attentions.length,
        totalParticipaciones: participacionCount,
        totalHmq: hmqCount,
        totalAmount,
        averageAmount: attentions.length > 0 ? totalAmount / attentions.length : 0,
        periodFrom: selectedFilters.dateFrom,
        periodTo: selectedFilters.dateTo,
      });
    } else if (selectedFilters && attentions.length === 0) {
      // Clear production data when no attentions found
      setProductionData(null);
    }
  }, [attentions, selectedFilters, doctors]);

  const handleCalculate = () => {
    if (!selectedFilters) {
      toast({
        title: "Error",
        description: "Primero debe hacer una vista previa para seleccionar los filtros",
        variant: "destructive",
      });
      return;
    }

    calculateMutation.mutate(selectedFilters);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calcular Pagos</h1>
          <p className="text-gray-600">Analiza la producción médica y calcula pagos por participaciones</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filtros */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros de Búsqueda
              </CardTitle>
              <CardDescription>
                Selecciona los criterios para analizar la producción médica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handlePreview)} className="space-y-4">
                  {/* Doctor Selection */}
                  <FormField
                    control={form.control}
                    name="doctorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Doctor/Profesional
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "all"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue>
                                {field.value && field.value !== "all" 
                                  ? doctors.find(d => d.id === field.value)?.name 
                                  : "Todos los médicos"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">Todos los médicos</SelectItem>
                            {doctors.map((doctor) => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                {doctor.name} - {doctor.rut}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="dateFrom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha Desde</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dateTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha Hasta</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Participation Type Filters */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Tipos de Participación</Label>
                    
                    <FormField
                      control={form.control}
                      name="includeParticipaciones"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="participaciones"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <Label htmlFor="participaciones" className="text-sm">
                            Registros Participaciones
                          </Label>
                        </div>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="includeHmq"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hmq"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <Label htmlFor="hmq" className="text-sm">
                            Registros HMQ
                          </Label>
                        </div>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={!form.watch('dateFrom') || !form.watch('dateTo')}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analizar Producción
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Production Summary */}
          {productionData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Resumen de Producción
                </CardTitle>
                <CardDescription>
                  {productionData.doctorName} • {format(new Date(productionData.periodFrom), 'dd/MM/yyyy', { locale: es })} - {format(new Date(productionData.periodTo), 'dd/MM/yyyy', { locale: es })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{productionData.totalAttentions}</div>
                    <div className="text-sm text-blue-700">Total Atenciones</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{productionData.totalParticipaciones}</div>
                    <div className="text-sm text-green-700">Participaciones</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{productionData.totalHmq}</div>
                    <div className="text-sm text-purple-700">Registros HMQ</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{formatCurrency(productionData.totalAmount)}</div>
                    <div className="text-sm text-orange-700">Monto Total</div>
                  </div>
                </div>
                
                {productionData.totalAttentions > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Promedio por atención:</div>
                    <div className="text-lg font-semibold text-gray-900">{formatCurrency(productionData.averageAmount)}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pending Attentions */}
          {selectedFilters && attentions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Atenciones Pendientes de Cálculo
                  </div>
                  <Badge variant="secondary">{attentions.length} registros</Badge>
                </CardTitle>
                <CardDescription>
                  Atenciones médicas que serán incluidas en el cálculo de pagos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Servicio</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attentions.slice(0, 10).map((attention) => (
                        <TableRow key={attention.id}>
                          <TableCell>
                            <div className="font-medium">{attention.patientName}</div>
                            <div className="text-sm text-gray-500">{attention.patientRut}</div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(attention.attentionDate), 'dd/MM/yyyy', { locale: es })}
                          </TableCell>
                          <TableCell>{(attention as any).serviceName || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={(attention as any).recordType === 'participacion' ? 'default' : 'secondary'}>
                              {(attention as any).recordType === 'participacion' ? 'Participación' : 'HMQ'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(parseFloat(attention.participatedAmount))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {attentions.length > 10 && (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Y {attentions.length - 10} atenciones más...
                    </div>
                  )}
                </div>

                <div className="flex justify-center mt-6">
                  <Button 
                    onClick={handleCalculate} 
                    disabled={calculateMutation.isPending || attentions.length === 0}
                    size="lg"
                    className="px-8"
                  >
                    {calculateMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Calculando...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Calcular Pagos ({attentions.length} atenciones)
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Data State */}
          {selectedFilters && attentions.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sin datos para el período seleccionado</h3>
                <p className="text-gray-500 mb-4">
                  No se encontraron atenciones médicas pendientes con los filtros aplicados.
                </p>
                <div className="text-sm text-gray-400">
                  • Verifica el rango de fechas seleccionado<br/>
                  • Asegúrate de haber importado datos de atenciones médicas<br/>
                  • Revisa que los tipos de participación estén habilitados
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}