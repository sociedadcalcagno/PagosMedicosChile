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
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Building2, Download, FileText, Calendar, DollarSign } from 'lucide-react';

// Types
interface ExportEntry {
  account: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
  reference: string;
}

interface ExportSummary {
  totalEntries: number;
  totalDebits: number;
  totalCredits: number;
  balanceCheck: boolean;
  period: string;
}

const exportSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2024).max(2026),
  exportFormat: z.enum(['csv', 'excel', 'txt']),
  includeDetail: z.boolean().optional(),
  notes: z.string().optional(),
});

type ExportForm = z.infer<typeof exportSchema>;

export default function ExportacionContable() {
  const [exportSummary, setExportSummary] = useState<ExportSummary | null>(null);
  const [exportEntries, setExportEntries] = useState<ExportEntry[]>([]);
  const { toast } = useToast();

  const form = useForm<ExportForm>({
    resolver: zodResolver(exportSchema),
    defaultValues: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      exportFormat: 'csv',
      includeDetail: true,
    },
  });

  // Generate accounting export
  const generateExportMutation = useMutation({
    mutationFn: async (data: ExportForm) => {
      const response = await apiRequest('/api/generate-accounting-export', 'POST', data);
      return await response.json();
    },
    onSuccess: (data) => {
      setExportSummary(data.summary);
      setExportEntries(data.entries || []);
      toast({
        title: "Exportación generada",
        description: `Se generaron ${data.summary.totalEntries} asientos contables`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error en exportación",
        description: error.message || "No se pudo generar la exportación",
        variant: "destructive",
      });
    },
  });

  // Download export file
  const downloadExportMutation = useMutation({
    mutationFn: async (format: string) => {
      const formData = form.getValues();
      const response = await fetch('/api/download-accounting-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ...formData, format })
      });
      
      if (!response.ok) {
        throw new Error('Error al descargar archivo');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exportacion_contable_${formData.month}_${formData.year}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Descarga completada",
        description: "El archivo de exportación se descargó exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al descargar",
        description: error.message || "No se pudo descargar el archivo",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ExportForm) => {
    generateExportMutation.mutate(data);
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exportación Contable</h1>
          <p className="text-gray-600">Genera archivos para centralización contable con asientos de pagos médicos</p>
        </div>
      </div>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Configuración de Exportación
          </CardTitle>
          <CardDescription>
            Selecciona el período y formato para generar la exportación contable
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
                  name="exportFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formato</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Formato" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="txt">Texto Plano</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-end">
                  <Button 
                    type="submit"
                    disabled={generateExportMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {generateExportMutation.isPending ? 'Generando...' : 'Generar Exportación'}
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
                        placeholder="Observaciones para la exportación contable..."
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

      {/* Export Summary */}
      {exportSummary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Asientos Generados</p>
                    <p className="text-2xl font-bold">{exportSummary.totalEntries}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Débitos</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(exportSummary.totalDebits)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Créditos</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(exportSummary.totalCredits)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Balance</p>
                    <Badge variant={exportSummary.balanceCheck ? "default" : "destructive"}>
                      {exportSummary.balanceCheck ? "Cuadrado" : "Descuadrado"}
                    </Badge>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Download Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Descargar Exportación</CardTitle>
              <CardDescription>
                Descarga la exportación contable para {exportSummary.period}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button 
                  onClick={() => downloadExportMutation.mutate('csv')}
                  disabled={downloadExportMutation.isPending}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar CSV
                </Button>
                <Button 
                  onClick={() => downloadExportMutation.mutate('excel')}
                  disabled={downloadExportMutation.isPending}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Excel
                </Button>
                <Button 
                  onClick={() => downloadExportMutation.mutate('txt')}
                  disabled={downloadExportMutation.isPending}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar TXT
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Export Preview */}
          {exportEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Vista Previa de Asientos Contables
                </CardTitle>
                <CardDescription>
                  Primeros 10 asientos generados para la exportación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-semibold">Cuenta</th>
                        <th className="text-left p-2 font-semibold">Nombre Cuenta</th>
                        <th className="text-right p-2 font-semibold">Débito</th>
                        <th className="text-right p-2 font-semibold">Crédito</th>
                        <th className="text-left p-2 font-semibold">Descripción</th>
                        <th className="text-left p-2 font-semibold">Referencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exportEntries.slice(0, 10).map((entry, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-mono">{entry.account}</td>
                          <td className="p-2">{entry.accountName}</td>
                          <td className="p-2 text-right">{entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</td>
                          <td className="p-2 text-right">{entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</td>
                          <td className="p-2">{entry.description}</td>
                          <td className="p-2 font-mono text-sm">{entry.reference}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {exportEntries.length > 10 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Y {exportEntries.length - 10} asientos más...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}