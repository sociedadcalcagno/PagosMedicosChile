import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Banknote, Download, FileText, Calendar, DollarSign, Building } from 'lucide-react';

// Types
interface BankTransfer {
  id: string;
  doctorName: string;
  doctorRut: string;
  email: string;
  bankName: string;
  bankAccount: string;
  accountType: string;
  amount: number;
  reference: string;
  societyInfo?: {
    name: string;
    rut: string;
  };
}

interface PayrollSummary {
  totalTransfers: number;
  totalAmount: number;
  byBank: Record<string, { count: number; amount: number }>;
  period: string;
}

const payrollSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2024).max(2026),
  bankFormat: z.enum(['santander', 'bci', 'chile', 'estado', 'universal']),
  includeOnlyProcessed: z.boolean().optional(),
  notes: z.string().optional(),
});

type PayrollForm = z.infer<typeof payrollSchema>;

export default function NominaBancaria() {
  const [payrollSummary, setPayrollSummary] = useState<PayrollSummary | null>(null);
  const [bankTransfers, setBankTransfers] = useState<BankTransfer[]>([]);
  const [selectedTransfers, setSelectedTransfers] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<PayrollForm>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      bankFormat: 'santander',
      includeOnlyProcessed: true,
    },
  });

  // Generate bank payroll
  const generatePayrollMutation = useMutation({
    mutationFn: async (data: PayrollForm) => {
      const response = await apiRequest('/api/generate-bank-payroll', 'POST', data);
      return await response.json();
    },
    onSuccess: (data) => {
      setPayrollSummary(data.summary);
      setBankTransfers(data.transfers || []);
      setSelectedTransfers(data.transfers?.map((t: BankTransfer) => t.id) || []);
      toast({
        title: "Nómina bancaria generada",
        description: `Se prepararon ${data.summary.totalTransfers} transferencias`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al generar nómina",
        description: error.message || "No se pudo generar la nómina bancaria",
        variant: "destructive",
      });
    },
  });

  // Download bank file
  const downloadBankFileMutation = useMutation({
    mutationFn: async () => {
      const formData = form.getValues();
      const selectedIds = selectedTransfers;
      
      const response = await fetch('/api/download-bank-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ...formData, selectedTransfers: selectedIds })
      });
      
      if (!response.ok) {
        throw new Error('Error al generar archivo bancario');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nomina_bancaria_${formData.month}_${formData.year}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Archivo generado",
        description: "El archivo de nómina bancaria se descargó exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al generar archivo",
        description: error.message || "No se pudo generar el archivo bancario",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PayrollForm) => {
    generatePayrollMutation.mutate(data);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransfers(bankTransfers.map(t => t.id));
    } else {
      setSelectedTransfers([]);
    }
  };

  const handleSelectTransfer = (transferId: string, checked: boolean) => {
    if (checked) {
      setSelectedTransfers(prev => [...prev, transferId]);
    } else {
      setSelectedTransfers(prev => prev.filter(id => id !== transferId));
    }
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

  const getBankName = (code: string) => {
    const banks = {
      santander: 'Banco Santander',
      bci: 'Banco BCI',
      chile: 'Banco de Chile',
      estado: 'BancoEstado',
      universal: 'Formato Universal'
    };
    return banks[code as keyof typeof banks] || code;
  };

  const selectedAmount = bankTransfers
    .filter(t => selectedTransfers.includes(t.id))
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Banknote className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nómina Bancaria</h1>
          <p className="text-gray-600">Genera archivos de transferencias bancarias para pago de honorarios médicos</p>
        </div>
      </div>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Configuración de Nómina Bancaria
          </CardTitle>
          <CardDescription>
            Selecciona el período y formato bancario para generar las transferencias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                <FormField
                  control={form.control}
                  name="bankFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formato Bancario</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Banco" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="santander">Banco Santander</SelectItem>
                          <SelectItem value="bci">Banco BCI</SelectItem>
                          <SelectItem value="chile">Banco de Chile</SelectItem>
                          <SelectItem value="estado">BancoEstado</SelectItem>
                          <SelectItem value="universal">Formato Universal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-end">
                  <Button 
                    type="submit"
                    disabled={generatePayrollMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {generatePayrollMutation.isPending ? 'Generando...' : 'Generar Nómina'}
                  </Button>
                </div>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas Adicionales</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observaciones para la nómina bancaria..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Payroll Summary */}
      {payrollSummary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Transferencias</p>
                    <p className="text-2xl font-bold">{payrollSummary.totalTransfers}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monto Total</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(payrollSummary.totalAmount)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Formato</p>
                    <p className="text-lg font-semibold">{getBankName(form.getValues().bankFormat)}</p>
                  </div>
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selection Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedTransfers.length === bankTransfers.length && bankTransfers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="font-medium">
                    Seleccionar todas las transferencias ({bankTransfers.length})
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-green-600">
                    {selectedTransfers.length} seleccionadas
                  </Badge>
                  <span className="font-bold text-green-600">
                    {formatCurrency(selectedAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Transfers List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Transferencias Bancarias
              </CardTitle>
              <CardDescription>
                Selecciona las transferencias a incluir en el archivo bancario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bankTransfers.map((transfer) => (
                  <div key={transfer.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedTransfers.includes(transfer.id)}
                        onCheckedChange={(checked) => 
                          handleSelectTransfer(transfer.id, checked as boolean)
                        }
                      />
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{transfer.doctorName}</h3>
                            <p className="text-sm text-gray-600">RUT: {transfer.doctorRut}</p>
                            {transfer.societyInfo && (
                              <p className="text-sm text-blue-600">
                                Sociedad: {transfer.societyInfo.name} - {transfer.societyInfo.rut}
                              </p>
                            )}
                            <p className="text-sm text-gray-600">{transfer.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600 text-lg">
                              {formatCurrency(transfer.amount)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Banco</p>
                            <p className="font-semibold">{transfer.bankName}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Cuenta</p>
                            <p className="font-semibold font-mono">{transfer.bankAccount}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Tipo Cuenta</p>
                            <p className="font-semibold">{transfer.accountType}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Referencia</p>
                            <p className="font-semibold text-xs">{transfer.reference}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generate File */}
          <Card>
            <CardHeader>
              <CardTitle>Generar Archivo Bancario</CardTitle>
              <CardDescription>
                Descarga el archivo de transferencias para {payrollSummary.period}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button 
                  onClick={() => downloadBankFileMutation.mutate()}
                  disabled={downloadBankFileMutation.isPending || selectedTransfers.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloadBankFileMutation.isPending 
                    ? 'Generando...' 
                    : `Descargar Archivo (${selectedTransfers.length} transferencias)`
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