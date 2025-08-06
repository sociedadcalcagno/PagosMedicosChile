import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Calculator, FileText, Mail, Download, DollarSign, Users } from 'lucide-react';

// Types
interface PayrollSummary {
  doctorId: string;
  doctorName: string;
  participacionAttentions: number;
  hmqAttentions: number;
  totalAttentions: number;
  participacionAmount: number;
  hmqAmount: number;
  totalGrossAmount: number;
  totalNetAmount: number;
  calculatedPayments: number;
  period: string;
}

interface PayrollCalculation {
  id: string;
  doctorId: string;
  periodMonth: number;
  periodYear: number;
  totalGrossAmount: string;
  totalNetAmount: string;
  participacionCount: number;
  hmqCount: number;
  status: 'calculated' | 'processed' | 'paid';
  createdAt: string;
}

const payrollSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2024).max(2026),
});

type PayrollForm = z.infer<typeof payrollSchema>;

export default function PayrollProcessing() {
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollForm | null>(null);
  const [payrollSummary, setPayrollSummary] = useState<PayrollSummary[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<PayrollForm>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
  });

  // Calculate payroll summary
  const calculatePayrollMutation = useMutation({
    mutationFn: async (data: PayrollForm) => {
      const response = await apiRequest('/api/calculate-payroll', 'POST', data);
      return await response.json();
    },
    onSuccess: (data: PayrollSummary[]) => {
      setPayrollSummary(data);
      toast({
        title: "Nómina calculada",
        description: `Se calculó la nómina para ${data.length} profesionales`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al calcular nómina",
        description: error.message || "No se pudo calcular la nómina",
        variant: "destructive",
      });
    },
  });

  // Process payroll (mark as processed)
  const processPayrollMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPeriod) throw new Error('No period selected');
      const response = await apiRequest('/api/process-payroll', 'POST', selectedPeriod);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll-calculations'] });
      toast({
        title: "Nómina procesada",
        description: "La nómina ha sido procesada exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al procesar nómina",
        description: error.message || "No se pudo procesar la nómina",
        variant: "destructive",
      });
    },
  });

  // Generate PDF for individual doctor
  const generatePdfMutation = useMutation({
    mutationFn: async (doctorId: string) => {
      if (!selectedPeriod) throw new Error('No period selected');
      const response = await apiRequest(`/api/generate-payslip/${doctorId}`, 'POST', selectedPeriod);
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `liquidacion_${doctorId}_${selectedPeriod.month}_${selectedPeriod.year}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({
        title: "PDF generado",
        description: "La liquidación ha sido descargada",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al generar PDF",
        description: error.message || "No se pudo generar el PDF",
        variant: "destructive",
      });
    },
  });

  // Send email with payslip
  const sendEmailMutation = useMutation({
    mutationFn: async (doctorId: string) => {
      if (!selectedPeriod) throw new Error('No period selected');
      const response = await apiRequest(`/api/send-payslip/${doctorId}`, 'POST', selectedPeriod);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email enviado",
        description: "La liquidación ha sido enviada por correo",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al enviar email",
        description: error.message || "No se pudo enviar el correo",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PayrollForm) => {
    setSelectedPeriod(data);
    calculatePayrollMutation.mutate(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  };

  const totalGross = payrollSummary.reduce((sum, item) => sum + item.totalGrossAmount, 0);
  const totalNet = payrollSummary.reduce((sum, item) => sum + item.totalNetAmount, 0);
  const totalParticipaciones = payrollSummary.reduce((sum, item) => sum + item.participacionAttentions, 0);
  const totalHmq = payrollSummary.reduce((sum, item) => sum + item.hmqAttentions, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <DollarSign className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Procesamiento de Nómina</h1>
          <p className="text-gray-600">Calcula y procesa la nómina completa con liquidaciones individuales</p>
        </div>
      </div>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Selección de Período
          </CardTitle>
          <CardDescription>
            Selecciona el mes y año para calcular la nómina
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4 items-end">
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mes</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Seleccionar mes" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {getMonthName(i + 1)}
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
                    <FormControl>
                      <Input
                        type="number"
                        className="w-32"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                disabled={calculatePayrollMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {calculatePayrollMutation.isPending ? 'Calculando...' : 'Calcular Nómina'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {payrollSummary.length > 0 && selectedPeriod && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Profesionales</p>
                    <p className="text-2xl font-bold">{payrollSummary.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Participaciones</p>
                    <p className="text-2xl font-bold text-blue-600">{totalParticipaciones}</p>
                  </div>
                  <Badge variant="outline" className="text-blue-600">PART</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">HMQ</p>
                    <p className="text-2xl font-bold text-purple-600">{totalHmq}</p>
                  </div>
                  <Badge variant="outline" className="text-purple-600">HMQ</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Neto</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(totalNet)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones de Nómina</CardTitle>
              <CardDescription>
                Procesa la nómina para {getMonthName(selectedPeriod.month)} {selectedPeriod.year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button 
                  onClick={() => processPayrollMutation.mutate()}
                  disabled={processPayrollMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {processPayrollMutation.isPending ? 'Procesando...' : 'Procesar Nómina Completa'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Individual Payroll Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Liquidaciones Individuales
              </CardTitle>
              <CardDescription>
                Detalles por profesional con acciones individuales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payrollSummary.map((summary) => (
                  <div key={summary.doctorId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{summary.doctorName}</h3>
                        <p className="text-sm text-gray-600">
                          {getMonthName(selectedPeriod.month)} {selectedPeriod.year}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generatePdfMutation.mutate(summary.doctorId)}
                          disabled={generatePdfMutation.isPending}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendEmailMutation.mutate(summary.doctorId)}
                          disabled={sendEmailMutation.isPending}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Participaciones</p>
                        <p className="font-semibold text-blue-600">{summary.participacionAttentions}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(summary.participacionAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">HMQ</p>
                        <p className="font-semibold text-purple-600">{summary.hmqAttentions}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(summary.hmqAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Atenciones</p>
                        <p className="font-semibold">{summary.totalAttentions}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Monto Bruto</p>
                        <p className="font-semibold">{formatCurrency(summary.totalGrossAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Monto Neto</p>
                        <p className="font-semibold text-green-600">{formatCurrency(summary.totalNetAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Estado</p>
                        <Badge variant="outline" className="text-orange-600">
                          Calculado
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}