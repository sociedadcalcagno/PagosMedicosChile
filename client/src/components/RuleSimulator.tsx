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
import { SimulationResultModal } from './SimulationResultModal';

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
    doctorId: 'all',
    societyId: '',
    serviceId: 'all',
    baseAmount: 100000,
    scheduleType: 'regular',
    weekday: 'monday'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSimulate = async () => {
    try {
      setIsLoading(true);
      
      const response = await onSimulate({
        ...simulationData,
        doctorId: simulationData.doctorId === 'all' ? '' : simulationData.doctorId,
        serviceId: simulationData.serviceId === 'all' ? '' : simulationData.serviceId,
      });

      // Agregar datos adicionales para el modal
      const resultWithData = {
        ...response,
        simulationData: {
          specialtyName: specialties?.find((s: any) => s.id === simulationData.specialtyId)?.name,
          doctorName: simulationData.doctorId && simulationData.doctorId !== 'all' 
            ? doctors?.find((d: any) => d.id === simulationData.doctorId)?.name 
            : undefined,
          serviceName: simulationData.serviceId && simulationData.serviceId !== 'all' 
            ? services?.find((s: any) => s.id === simulationData.serviceId)?.name 
            : undefined,
          baseAmount: simulationData.baseAmount,
          date: simulationData.date,
          scheduleType: simulationData.scheduleType
        }
      };

      setSimulationResult(resultWithData);
      setIsModalOpen(true);

      if (response.selectedRuleId) {
        toast({
          title: "✅ Simulación exitosa",
          description: "Se encontró una regla aplicable para los criterios especificados.",
        });
      } else {
        toast({
          title: "⚠️ Sin reglas aplicables",
          description: "No se encontraron reglas que coincidan con los criterios.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error en simulación:', error);
      toast({
        title: "❌ Error en simulación",
        description: "No se pudo completar la simulación. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-xl font-bold text-blue-900 mb-2 flex items-center gap-2">
          <Calculator className="w-6 h-6" />
          Simulador de Reglas Inteligente
        </h3>
        <p className="text-blue-700 mb-4">
          Prueba las reglas de cálculo con datos específicos para ver qué regla se aplicaría y el monto resultante.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Fecha de Atención */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Atención *
            </label>
            <Input
              type="date"
              value={simulationData.date}
              onChange={(e) => setSimulationData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          {/* Especialidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Especialidad *
            </label>
            <Select 
              value={simulationData.specialtyId} 
              onValueChange={(value) => setSimulationData(prev => ({ ...prev, specialtyId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar especialidad" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(specialties) ? specialties.map((specialty: any) => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </SelectItem>
                )) : []}
              </SelectContent>
            </Select>
          </div>

          {/* Doctor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Doctor
            </label>
            <Select 
              value={simulationData.doctorId} 
              onValueChange={(value) => setSimulationData(prev => ({ ...prev, doctorId: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los doctores</SelectItem>
                {Array.isArray(doctors) ? doctors.map((doctor: any) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name} ({doctor.rut})
                  </SelectItem>
                )) : []}
              </SelectContent>
            </Select>
          </div>

          {/* Servicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Servicio
            </label>
            <Select 
              value={simulationData.serviceId} 
              onValueChange={(value) => setSimulationData(prev => ({ ...prev, serviceId: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los servicios</SelectItem>
                {Array.isArray(services) ? services
                  .filter((service: any) => 
                    !simulationData.specialtyId || 
                    service.specialtyId === simulationData.specialtyId
                  )
                  .map((service: any) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} ({service.code})
                  </SelectItem>
                )) : []}
              </SelectContent>
            </Select>
          </div>

          {/* Monto Base */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto Base *
            </label>
            <Input
              type="number"
              value={simulationData.baseAmount}
              onChange={(e) => setSimulationData(prev => ({ ...prev, baseAmount: parseInt(e.target.value) || 0 }))}
              placeholder="500000"
              required
            />
          </div>

          {/* Tipo de Horario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Horario
            </label>
            <Select 
              value={simulationData.scheduleType} 
              onValueChange={(value) => setSimulationData(prev => ({ ...prev, scheduleType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="night">Nocturno</SelectItem>
                <SelectItem value="irregular">Irregular</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botón de Simulación */}
        <div className="mt-6">
          <Button 
            onClick={handleSimulate} 
            disabled={isLoading || !simulationData.specialtyId || simulationData.baseAmount <= 0}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium px-8 py-2 text-lg"
          >
            {isLoading ? (
              <>
                <Calculator className="w-4 h-4 mr-2 animate-spin" />
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
      </div>

      {/* Modal de Resultados */}
      <SimulationResultModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        result={simulationResult}
        simulationData={simulationResult?.simulationData}
      />
    </div>
  );
}