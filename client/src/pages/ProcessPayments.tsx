import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, DollarSign, User, CheckCircle, Clock, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const paymentSchema = z.object({
  doctorId: z.string().min(1, "Doctor es requerido"),
  month: z.string().min(1, "Mes es requerido"),
  year: z.string().min(1, "Año es requerido"),
});

type PaymentForm = z.infer<typeof paymentSchema>;

export default function ProcessPayments() {
  const [selectedPeriod, setSelectedPeriod] = useState<{ doctorId: string; month: number; year: number } | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const form = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      doctorId: "",
      month: new Date().getMonth() + 1 + "",
      year: new Date().getFullYear() + "",
    },
  });

  // Queries
  const { data: doctors = [] } = useQuery({
    queryKey: ['/api/doctors'],
  });

  const { data: calculations = [] } = useQuery({
    queryKey: ['/api/payment-calculations', selectedPeriod],
    enabled: !!selectedPeriod,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedPeriod?.doctorId) params.append('doctorId', selectedPeriod.doctorId);
      if (selectedPeriod?.month) params.append('month', selectedPeriod.month.toString());
      if (selectedPeriod?.year) params.append('year', selectedPeriod.year.toString());
      params.append('status', 'calculated');
      const response = await apiRequest(`/api/payment-calculations?${params}`, 'GET');
      return response.json();
    },
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['/api/payments'],
    queryFn: async () => {
      const response = await apiRequest('/api/payments', 'GET');
      return response.json();
    },
  });

  // Mutations
  const processPaymentMutation = useMutation({
    mutationFn: async (data: { doctorId: string; month: number; year: number }) => {
      const response = await apiRequest('/api/process-payment', 'POST', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payment-calculations'] });
      setSelectedPeriod(null);
      form.reset();
      toast({
        title: "Pago procesado",
        description: "El pago ha sido procesado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al procesar pago",
        description: error.message || "No se pudo procesar el pago",
        variant: "destructive",
      });
    },
  });

  const handlePreview = (data: PaymentForm) => {
    setSelectedPeriod({
      doctorId: data.doctorId,
      month: parseInt(data.month),
      year: parseInt(data.year),
    });
  };

  const handleProcessPayment = () => {
    if (!selectedPeriod) return;
    processPaymentMutation.mutate(selectedPeriod);
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
      approved: "success",
      paid: "success",
      processing: "outline",
    } as const;
    
    const labels = {
      pending: "Pendiente",
      calculated: "Calculado",
      approved: "Aprobado",
      paid: "Pagado",
      processing: "Procesando",
    };

    const icons = {
      pending: Clock,
      calculated: AlertCircle,
      approved: CheckCircle,
      paid: CheckCircle,
      processing: Clock,
    };

    const Icon = icons[status as keyof typeof icons] || Clock;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const calculationsArray = Array.isArray(calculations) ? calculations : [];
  const totalCalculations = calculationsArray.length;
  const totalAmount = calculationsArray.reduce((sum: number, calc: any) => 
    sum + parseFloat(calc.calculatedAmount || '0'), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Procesar Pagos</h1>
          <p className="text-muted-foreground">
            Convierte los cálculos aprobados en pagos procesados
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulario de selección */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Procesar Nuevo Pago
            </CardTitle>
            <CardDescription>
              Selecciona el doctor y período para procesar el pago
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
                          {doctors.map((doctor: any) => (
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
                  Buscar Cálculos
                </Button>
              </form>
            </Form>

            {/* Resumen de cálculos */}
            {selectedPeriod && totalCalculations > 0 && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg space-y-3">
                <h4 className="font-medium text-green-800">Resumen del Período</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{totalCalculations}</div>
                    <div className="text-sm text-green-600">Cálculos Listos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      ${totalAmount.toLocaleString('es-CL')}
                    </div>
                    <div className="text-sm text-green-600">Total a Pagar</div>
                  </div>
                </div>

                <Button 
                  onClick={handleProcessPayment} 
                  className="w-full"
                  disabled={processPaymentMutation.isPending}
                >
                  {processPaymentMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Procesar Pago
                    </>
                  )}
                </Button>
              </div>
            )}

            {selectedPeriod && totalCalculations === 0 && (
              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
                  <span className="text-orange-800">No hay cálculos listos para procesar</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historial de pagos recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Pagos Recientes
            </CardTitle>
            <CardDescription>
              Últimos pagos procesados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payments && payments.length > 0 ? (
              <div className="space-y-3">
                {payments.slice(0, 5).map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {doctors.find((d: any) => d.id === payment.doctorId)?.name || 'Doctor'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {months.find(m => m.value === payment.periodMonth.toString())?.label} {payment.periodYear}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${parseFloat(payment.totalAmount).toLocaleString('es-CL')}</div>
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay pagos procesados aún
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lista completa de pagos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial Completo de Pagos</CardTitle>
          <CardDescription>
            Todos los pagos procesados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments && payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((payment: any) => (
                <div key={payment.id} className="border rounded-lg">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <CreditCard className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-lg">
                            {doctors.find((d: any) => d.id === payment.doctorId)?.name || 'Doctor'}
                          </div>
                          <div className="text-gray-600">
                            {months.find(m => m.value === payment.periodMonth.toString())?.label} {payment.periodYear}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.totalAttentions} atenciones • Creado {format(new Date(payment.createdAt), 'dd MMM yyyy', { locale: es })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="text-2xl font-bold text-green-600">
                          ${parseFloat(payment.totalAmount).toLocaleString('es-CL')}
                        </div>
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>

                    {/* Detalles bancarios */}
                    {payment.bankAccount && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Información Bancaria</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Banco:</span>
                            <span className="ml-2 font-medium">{payment.bankName || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Cuenta:</span>
                            <span className="ml-2 font-medium">{payment.bankAccount}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Titular:</span>
                            <span className="ml-2 font-medium">{payment.accountHolderName || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">RUT:</span>
                            <span className="ml-2 font-medium">{payment.accountHolderRut || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex justify-end space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedPayment(payment)}>
                            Ver Detalles
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalles del Pago</DialogTitle>
                            <DialogDescription>
                              Información completa del pago procesado
                            </DialogDescription>
                          </DialogHeader>
                          {selectedPayment && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Doctor</label>
                                  <p className="font-medium">
                                    {doctors.find((d: any) => d.id === selectedPayment.doctorId)?.name}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Período</label>
                                  <p className="font-medium">
                                    {months.find(m => m.value === selectedPayment.periodMonth.toString())?.label} {selectedPayment.periodYear}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Total Atenciones</label>
                                  <p className="font-medium">{selectedPayment.totalAttentions}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Monto Total</label>
                                  <p className="font-medium text-green-600">
                                    ${parseFloat(selectedPayment.totalAmount).toLocaleString('es-CL')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay pagos procesados
              </h3>
              <p className="text-gray-500">
                Los pagos procesados aparecerán aquí
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}