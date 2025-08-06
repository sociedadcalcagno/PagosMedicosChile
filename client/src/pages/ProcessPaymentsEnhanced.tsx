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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CreditCard, Users, Filter, CheckSquare, DollarSign } from 'lucide-react';

// Types
interface Doctor {
  id: string;
  name: string;
  rut: string;
  email?: string;
  societyId?: string;
  societyName?: string;
}

interface PaymentSummary {
  doctorId: string;
  doctorName: string;
  doctorEmail?: string;
  societyId?: string;
  societyName?: string;
  participacionCount: number;
  hmqCount: number;
  totalCount: number;
  participacionAmount: number;
  hmqAmount: number;
  totalAmount: number;
  selected: boolean;
}

const processPaymentSchema = z.object({
  processingType: z.enum(['individual', 'bulk', 'society']),
  recordType: z.enum(['all', 'participacion', 'hmq']).optional(),
  month: z.number().min(1).max(12),
  year: z.number().min(2024).max(2026),
  selectedDoctors: z.array(z.string()).optional(),
  selectedSocieties: z.array(z.string()).optional(),
  paymentMethod: z.enum(['transfer', 'check', 'cash']),
  notes: z.string().optional(),
});

type ProcessPaymentForm = z.infer<typeof processPaymentSchema>;

export default function ProcessPaymentsEnhanced() {
  const [paymentSummaries, setPaymentSummaries] = useState<PaymentSummary[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<ProcessPaymentForm>({
    resolver: zodResolver(processPaymentSchema),
    defaultValues: {
      processingType: 'individual',
      recordType: 'all',
      month: 7, // July for current data
      year: 2025,
      paymentMethod: 'transfer',
    },
  });

  // Get doctors data
  const { data: doctors = [] } = useQuery({
    queryKey: ['/api/doctors'],
  });

  // Get medical societies
  const { data: societies = [] } = useQuery({
    queryKey: ['/api/medical-societies'],
  });

  // Calculate payment summaries
  const calculateSummariesMutation = useMutation({
    mutationFn: async (data: { month: number; year: number; recordType?: string }) => {
      const response = await apiRequest('/api/calculate-payment-summaries', 'POST', data);
      return await response.json();
    },
    onSuccess: (data: PaymentSummary[]) => {
      setPaymentSummaries(data.map(item => ({ ...item, selected: false })));
      toast({
        title: "Resúmenes calculados",
        description: `Se encontraron ${data.length} profesionales con pagos pendientes`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al calcular",
        description: error.message || "No se pudieron calcular los resúmenes",
        variant: "destructive",
      });
    },
  });

  // Process payments
  const processPaymentsMutation = useMutation({
    mutationFn: async (data: ProcessPaymentForm) => {
      const selectedItems = paymentSummaries.filter(item => item.selected);
      const payload = {
        ...data,
        selectedDoctors: selectedItems.map(item => item.doctorId),
        summaries: selectedItems,
      };
      const response = await apiRequest('/api/process-bulk-payments', 'POST', payload);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      toast({
        title: "Pagos procesados",
        description: `Se procesaron ${data.processedCount} pagos exitosamente`,
      });
      setPaymentSummaries([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error al procesar pagos",
        description: error.message || "No se pudieron procesar los pagos",
        variant: "destructive",
      });
    },
  });

  const onCalculate = () => {
    const formData = form.getValues();
    calculateSummariesMutation.mutate({
      month: formData.month,
      year: formData.year,
      recordType: formData.recordType,
    });
  };

  const onSubmit = (data: ProcessPaymentForm) => {
    const selectedItems = paymentSummaries.filter(item => item.selected);
    if (selectedItems.length === 0) {
      toast({
        title: "Selección requerida",
        description: "Debe seleccionar al menos un profesional para procesar",
        variant: "destructive",
      });
      return;
    }
    processPaymentsMutation.mutate(data);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setPaymentSummaries(prev => 
      prev.map(item => ({ ...item, selected: checked }))
    );
  };

  const handleSelectItem = (doctorId: string, checked: boolean) => {
    setPaymentSummaries(prev => 
      prev.map(item => 
        item.doctorId === doctorId ? { ...item, selected: checked } : item
      )
    );
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

  const selectedCount = paymentSummaries.filter(item => item.selected).length;
  const selectedTotal = paymentSummaries
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.totalAmount, 0);

  const processingType = form.watch('processingType');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Procesamiento de Pagos Avanzado</h1>
          <p className="text-gray-600">Procesa pagos individuales, masivos o por sociedades médicas</p>
        </div>
      </div>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Configuración de Procesamiento
          </CardTitle>
          <CardDescription>
            Selecciona los parámetros para calcular y procesar los pagos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              {/* Processing Type */}
              <FormField
                control={form.control}
                name="processingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Procesamiento</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="individual" id="individual" />
                          <Label htmlFor="individual">Individual</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bulk" id="bulk" />
                          <Label htmlFor="bulk">Masivo</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="society" id="society" />
                          <Label htmlFor="society">Por Sociedad</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Period Selection */}
                <FormField
                  control={form.control}
                  name="month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mes</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Mes" />
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
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Record Type Filter */}
                <FormField
                  control={form.control}
                  name="recordType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Registro</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="participacion">Participaciones</SelectItem>
                          <SelectItem value="hmq">HMQ</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment Method */}
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Pago</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Método" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="transfer">Transferencia</SelectItem>
                          <SelectItem value="check">Cheque</SelectItem>
                          <SelectItem value="cash">Efectivo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  type="button"
                  onClick={onCalculate}
                  disabled={calculateSummariesMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {calculateSummariesMutation.isPending ? 'Calculando...' : 'Calcular Resúmenes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Payment Summaries */}
      {paymentSummaries.length > 0 && (
        <>
          {/* Selection Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="font-medium">
                    Seleccionar todos ({paymentSummaries.length} profesionales)
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-blue-600">
                    {selectedCount} seleccionados
                  </Badge>
                  <span className="font-bold text-green-600">
                    {formatCurrency(selectedTotal)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Resúmenes de Pago por Profesional
              </CardTitle>
              <CardDescription>
                Selecciona los profesionales a procesar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentSummaries.map((summary) => (
                  <div key={summary.doctorId} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={summary.selected}
                        onCheckedChange={(checked) => 
                          handleSelectItem(summary.doctorId, checked as boolean)
                        }
                      />
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{summary.doctorName}</h3>
                            {summary.societyName && (
                              <p className="text-sm text-blue-600">
                                Sociedad: {summary.societyName}
                              </p>
                            )}
                            {summary.doctorEmail && (
                              <p className="text-sm text-gray-600">{summary.doctorEmail}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600 text-lg">
                              {formatCurrency(summary.totalAmount)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Participaciones</p>
                            <p className="font-semibold text-blue-600">{summary.participacionCount}</p>
                            <p className="text-xs text-gray-500">{formatCurrency(summary.participacionAmount)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">HMQ</p>
                            <p className="font-semibold text-purple-600">{summary.hmqCount}</p>
                            <p className="text-xs text-gray-500">{formatCurrency(summary.hmqAmount)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total Atenciones</p>
                            <p className="font-semibold">{summary.totalCount}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Estado</p>
                            <Badge variant="outline" className="text-orange-600">
                              Pendiente
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Process Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="flex-1 mr-4">
                      <FormControl>
                        <Input
                          placeholder="Notas adicionales para el procesamiento..."
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <Button 
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={processPaymentsMutation.isPending || selectedCount === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  {processPaymentsMutation.isPending 
                    ? 'Procesando...' 
                    : `Procesar ${selectedCount} Pagos`
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}