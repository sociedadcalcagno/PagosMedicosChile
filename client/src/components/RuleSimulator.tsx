import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, CheckCircle, AlertTriangle, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RuleSimulatorProps {
  onSimulate: (data: any) => Promise<any>;
  specialties: any[];
  services: any[];
  doctors: any[];
  medicalSocieties: any[];
  result: any;
}

export default function RuleSimulator({ 
  onSimulate, 
  specialties, 
  services, 
  doctors, 
  medicalSocieties, 
  result 
}: RuleSimulatorProps) {
  const [simulationData, setSimulationData] = useState({
    date: new Date().toISOString().split('T')[0],
    specialtyId: '',
    doctorId: '',
    societyId: '',
    serviceId: '',
    baseAmount: 100000,
    scheduleType: 'regular',
    weekday: 'monday'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSimulate = async () => {
    if (!simulationData.specialtyId || !simulationData.baseAmount) {
      toast({
        title: "Datos incompletos",
        description: "Por favor complete al menos la especialidad y el monto base.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSimulate(simulationData);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Fecha de Atención</label>
          <Input 
            type="date" 
            value={simulationData.date}
            onChange={(e) => setSimulationData({...simulationData, date: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Especialidad *</label>
          <Select 
            value={simulationData.specialtyId}
            onValueChange={(value) => setSimulationData({...simulationData, specialtyId: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar especialidad" />
            </SelectTrigger>
            <SelectContent>
              {specialties?.map((specialty: any) => (
                <SelectItem key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Doctor</label>
          <Select 
            value={simulationData.doctorId}
            onValueChange={(value) => setSimulationData({...simulationData, doctorId: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors?.map((doctor: any) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  {doctor.name} ({doctor.rut})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Servicio</label>
          <Select 
            value={simulationData.serviceId}
            onValueChange={(value) => setSimulationData({...simulationData, serviceId: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar servicio" />
            </SelectTrigger>
            <SelectContent>
              {services?.filter((service: any) => 
                !simulationData.specialtyId || service.specialtyId === simulationData.specialtyId
              ).map((service: any) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Monto Base *</label>
          <Input 
            type="number" 
            value={simulationData.baseAmount}
            onChange={(e) => setSimulationData({...simulationData, baseAmount: parseInt(e.target.value) || 0})}
            placeholder="100000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tipo de Horario</label>
          <Select 
            value={simulationData.scheduleType}
            onValueChange={(value) => setSimulationData({...simulationData, scheduleType: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="irregular">Irregular</SelectItem>
              <SelectItem value="night">Nocturno</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={handleSimulate}
          disabled={isLoading || !simulationData.specialtyId || !simulationData.baseAmount}
          className="bg-green-600 hover:bg-green-700 text-white px-8"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Simulando...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Simular Reglas
            </>
          )}
        </Button>
      </div>

      {result && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Resultado de la Simulación
          </h4>
          
          {result.selectedRuleId ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Regla aplicada exitosamente</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Tipo de pago:</span> 
                  <Badge variant="outline" className="ml-2">
                    {result.applied?.paymentType === 'percentage' ? 'Porcentaje' : 'Monto fijo'}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Valor:</span> 
                  <span className="ml-2">{result.applied?.paymentValue}
                    {result.applied?.paymentType === 'percentage' ? '%' : ''}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">Monto calculado:</span> 
                  <span className="ml-2 text-lg font-bold text-green-600">
                    ${result.calculatedPayment?.toLocaleString('es-CL')}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <p className="text-sm text-blue-800">{result.explanation}</p>
              </div>
              
              {result.conflictingRules && result.conflictingRules.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                  <h5 className="font-medium text-yellow-800 mb-2">Reglas conflictivas encontradas:</h5>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {result.conflictingRules.map((rule: any, idx: number) => (
                      <li key={idx}>• {rule.name} ({rule.code})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-600">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>No se encontró ninguna regla aplicable para estos criterios.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}