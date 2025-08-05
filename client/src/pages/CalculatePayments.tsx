import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calculator, Calendar, User, Play, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const calculationSchema = z.object({
  doctorId: z.string().min(1, "Doctor es requerido"),
  month: z.string().min(1, "Mes es requerido"),
  year: z.string().min(1, "Año es requerido"),
});

type CalculationForm = z.infer<typeof calculationSchema>;

export default function CalculatePayments() {
  const [selectedPeriod, setSelectedPeriod] = useState<{ doctorId: string; month: number; year: number } | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const form = useForm<CalculationForm>({
    resolver: zodResolver(calculationSchema),
    defaultValues: {
      doctorId: "",
      month: new Date().getMonth() + 1 + "",
      year: new Date().getFullYear() + "",
    },
  });

  // Queries
  const { data: doctors = [] } = useQuery({
    queryKey: ['/api/doctors'],
    queryFn: async () => await apiRequest('/api/doctors'),
  });

  const { data: attentions = [] } = useQuery({
    queryKey: ['/api/medical-attentions', selectedPeriod],
    enabled: !!selectedPeriod,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedPeriod?.doctorId) params.append('doctorId', selectedPeriod.doctorId);
      params.append('dateFrom', `${selectedPeriod?.year}-${selectedPeriod?.month.toString().padStart(2, '0')}-01`);
      params.append('dateTo', `${selectedPeriod?.year}-${selectedPeriod?.month.toString().padStart(2, '0')}-31`);
      params.append('status', 'pending');
      return await apiRequest(`/api/medical-attentions?${params}`);
    },
  });

  const { data: calculations = [] } = useQuery({
    queryKey: ['/api/payment-calculations', selectedPeriod],
    enabled: !!selectedPeriod,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedPeriod?.doctorId) params.append('doctorId', selectedPeriod.doctorId);
      if (selectedPeriod?.month) params.append('month', selectedPeriod.month.toString());
      if (selectedPeriod?.year) params.append('year', selectedPeriod.year.toString());
      return await apiRequest(`/api/payment-calculations?${params}`);
    },
  });

  // Mutations
  const calculateMutation = useMutation({
    mutationFn: async (data: { doctorId: string; month: number; year: number }) => 
      await apiRequest('/api/calculate-payments', 'POST', data),
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
    setSelectedPeriod({
      doctorId: data.doctorId,
      month: parseInt(data.month),
      year: parseInt(data.year),
    });
  };

  const handleCalculate = () => {
    if (!selectedPeriod) return;
    calculateMutation.mutate(selectedPeriod);
  };

  const months = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { value: year.toString(), label: year.toString() };
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "default",
      calculated: "secondary",
      approved: "secondary",
    } as const;
    
    const labels = {
      pending: "Pendiente",
      calculated: "Calculado",
      approved: "Aprobado",
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const totalAttentions = Array.isArray(attentions) ? attentions.length : 0;
  const totalAmount = Array.isArray(attentions) ? attentions.reduce((sum: number, att: any) => 
    sum + parseFloat(att.participatedAmount || '0'), 0) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calcular Pagos</h1>
          <p className="text-muted-foreground">
            Aplica las reglas de cálculo a las atenciones médicas pendientes
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulario de selección */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Seleccionar Período
            </CardTitle>
            <CardDescription>
              Escoge el doctor y período para calcular los pagos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handlePreview)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar doctor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(doctors) && doctors.map((doctor: any) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              {doctor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mes</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month.value} value={month.value}>
                                {month.label}
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
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Año</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year.value} value={year.value}>
                                {year.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Previsualizar
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Resumen */}
        {selectedPeriod && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Resumen del Período
              </CardTitle>
              <CardDescription>
                {months.find(m => m.value === selectedPeriod.month.toString())?.label} {selectedPeriod.year}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{totalAttentions}</div>
                  <div className="text-sm text-blue-600">Atenciones Pendientes</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ${totalAmount.toLocaleString('es-CL')}
                  </div>
                  <div className="text-sm text-green-600">Monto Total</div>
                </div>
              </div>

              {totalAttentions > 0 && (
                <div className="pt-4">
                  <Button 
                    onClick={handleCalculate} 
                    className="w-full"
                    disabled={calculateMutation.isPending}
                  >
                    {calculateMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Calculando...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4 mr-2" />
                        Calcular Pagos
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lista de atenciones */}
      {selectedPeriod && Array.isArray(attentions) && attentions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Atenciones del Período</CardTitle>
            <CardDescription>
              Revisión de las atenciones que serán calculadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.isArray(attentions) && attentions.map((attention: any) => (
                <div key={attention.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{attention.patientName}</div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(attention.attentionDate), 'dd MMM yyyy', { locale: es })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${parseFloat(attention.participatedAmount).toLocaleString('es-CL')}</div>
                    {getStatusBadge(attention.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados de cálculos */}
      {Array.isArray(calculations) && calculations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Cálculos Realizados
            </CardTitle>
            <CardDescription>
              Pagos calculados para el período seleccionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.isArray(calculations) && calculations.map((calc: any) => (
                <div key={calc.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calculator className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {calc.ruleType === 'percentage' ? `${calc.ruleValue}%` : `Fijo $${parseFloat(calc.ruleValue).toLocaleString('es-CL')}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        Base: ${parseFloat(calc.baseAmount).toLocaleString('es-CL')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      ${parseFloat(calc.calculatedAmount).toLocaleString('es-CL')}
                    </div>
                    {getStatusBadge(calc.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedPeriod && Array.isArray(attentions) && attentions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-12 h-12 text-orange-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay atenciones pendientes
            </h3>
            <p className="text-gray-500 text-center">
              No se encontraron atenciones médicas pendientes para el período seleccionado
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}