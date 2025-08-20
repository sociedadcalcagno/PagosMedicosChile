import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, TrendingUp, Clock, Calendar, User, Stethoscope, AlertTriangle, Zap } from 'lucide-react';

interface SimulationResult {
  selectedRuleId: string | null;
  applied: {
    paymentType: string;
    paymentValue: number;
  } | null;
  calculatedPayment: number;
  explanation: string;
  conflictingRules?: any[];
}

interface SimulationResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: SimulationResult | null;
  simulationData?: {
    specialtyName?: string;
    doctorName?: string;
    serviceName?: string;
    baseAmount?: number;
    date?: string;
    scheduleType?: string;
  };
}

export function SimulationResultModal({ 
  isOpen, 
  onClose, 
  result, 
  simulationData 
}: SimulationResultModalProps) {
  if (!result) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPaymentTypeIcon = (type: string) => {
    return type === 'percentage' ? <TrendingUp className="w-4 h-4" /> : <Zap className="w-4 h-4" />;
  };

  const getScheduleTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'regular': 'Horario Regular',
      'night': 'Horario Nocturno',
      'irregular': 'Horario Irregular',
      'all': 'Todos los Horarios'
    };
    return labels[type] || type;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            {result.selectedRuleId ? (
              <>
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Simulación Exitosa
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-6 h-6 text-amber-500" />
                <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                  Sin Reglas Aplicables
                </span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Parámetros de simulación */}
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Parámetros de Simulación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {simulationData?.specialtyName && (
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-700">Especialidad</p>
                      <p className="text-blue-700">{simulationData.specialtyName}</p>
                    </div>
                  </div>
                )}
                
                {simulationData?.doctorName && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-700">Doctor</p>
                      <p className="text-blue-700">{simulationData.doctorName}</p>
                    </div>
                  </div>
                )}

                {simulationData?.scheduleType && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-700">Horario</p>
                      <p className="text-blue-700">{getScheduleTypeLabel(simulationData.scheduleType)}</p>
                    </div>
                  </div>
                )}

                {simulationData?.baseAmount && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-700">Monto Base</p>
                      <p className="text-blue-700 font-bold">{formatCurrency(simulationData.baseAmount)}</p>
                    </div>
                  </div>
                )}

                {simulationData?.date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-700">Fecha</p>
                      <p className="text-blue-700">{new Date(simulationData.date).toLocaleDateString('es-CL')}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {result.selectedRuleId ? (
            <>
              {/* Resultado Principal */}
              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      Resultado del Cálculo
                    </span>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      Regla Aplicada
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        {getPaymentTypeIcon(result.applied!.paymentType)}
                        <div>
                          <p className="text-sm font-medium text-gray-600">Tipo de Pago</p>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {result.applied!.paymentType === 'percentage' ? 'Porcentaje' : 'Monto Fijo'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Valor de la Regla</p>
                          <p className="text-lg font-bold text-purple-700">
                            {result.applied!.paymentValue}
                            {result.applied!.paymentType === 'percentage' ? '%' : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center">
                      <div className="text-center p-6 bg-white rounded-lg border-2 border-green-200 shadow-sm">
                        <p className="text-sm font-medium text-gray-600 mb-2">MONTO CALCULADO</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {formatCurrency(result.calculatedPayment)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Explicación Detallada */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    Explicación Inteligente
                  </CardTitle>
                  <CardDescription>
                    Análisis detallado del proceso de selección de reglas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <p className="text-blue-900 leading-relaxed whitespace-pre-wrap">
                      {result.explanation}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Reglas Conflictivas */}
              {result.conflictingRules && result.conflictingRules.length > 0 && (
                <Card className="border-amber-200 bg-amber-50/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      Reglas Alternativas Consideradas
                    </CardTitle>
                    <CardDescription>
                      Otras reglas que también podrían aplicar, pero fueron descartadas por especificidad
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {result.conflictingRules.map((rule: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
                          <div>
                            <p className="font-medium text-amber-800">{rule.name}</p>
                            <p className="text-sm text-amber-600">Código: {rule.code}</p>
                          </div>
                          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                            Menor especificidad
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            /* Sin reglas aplicables */
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                  No se encontraron reglas aplicables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg border-l-4 border-amber-400">
                  <p className="text-amber-900 mb-3">{result.explanation}</p>
                  <div className="space-y-2 text-sm text-amber-800">
                    <p className="font-medium">Posibles soluciones:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Verificar que existan reglas activas para la especialidad seleccionada</li>
                      <li>Revisar las fechas de vigencia de las reglas</li>
                      <li>Considerar crear una regla general como respaldo</li>
                      <li>Validar los criterios de selección (doctor, servicio, horario)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}