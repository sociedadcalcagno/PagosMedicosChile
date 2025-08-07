import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, BookOpen, Settings, Heart } from 'lucide-react';

export default function DescargaManuales() {
  const [downloadingSistema, setDownloadingSistema] = useState(false);
  const [downloadingTecnico, setDownloadingTecnico] = useState(false);
  const { toast } = useToast();

  const downloadManual = async (type: 'sistema' | 'tecnico') => {
    const setLoading = type === 'sistema' ? setDownloadingSistema : setDownloadingTecnico;
    setLoading(true);

    try {
      const response = await fetch(`/api/download-manual/${type}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al generar el PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Manual_${type === 'sistema' ? 'Sistema' : 'Tecnico'}_Portal_Pagos_Medicos.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Descarga exitosa",
        description: `Manual ${type === 'sistema' ? 'de Sistema' : 'Técnico'} descargado correctamente`,
      });
    } catch (error: any) {
      toast({
        title: "Error en descarga",
        description: error.message || "No se pudo descargar el manual",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="h-8 w-8 text-red-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Descarga de Manuales</h1>
          <p className="text-gray-600">Documentación completa del Portal de Pagos Médicos para registro de propiedad intelectual</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <FileText className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Documentos para INAPI Chile</h3>
            <p className="text-blue-700 text-sm mb-2">
              Estos manuales han sido preparados específicamente para el registro de propiedad intelectual 
              en el Instituto Nacional de Propiedad Industrial (INAPI) de Chile.
            </p>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Documentación completa del sistema y arquitectura técnica</li>
              <li>• Elementos innovadores y patentables identificados</li>
              <li>• Formato profesional PDF listo para presentación oficial</li>
              <li>• Información confidencial y propietaria del Portal de Pagos Médicos</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual de Sistema */}
        <Card className="h-full">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-lg bg-green-100">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">Manual de Sistema</CardTitle>
                <CardDescription className="mt-1">Orientado a usuarios finales</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Contenido Incluido:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Funcionalidades completas del sistema</li>
                <li>• Flujos de trabajo y procesos de negocio</li>
                <li>• Casos de uso específicos del sector médico chileno</li>
                <li>• Interfaces de usuario y navegación</li>
                <li>• Módulos de maestros, pagos, contabilidad y tesorería</li>
                <li>• Sistema de importación y exportación</li>
                <li>• Asistente virtual con IA especializada</li>
                <li>• Terminología médica y previsional chilena</li>
              </ul>
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Páginas:</span> ~111 páginas
                <br />
                <span className="font-medium">Formato:</span> PDF Profesional
              </div>
            </div>
            
            <Button
              onClick={() => downloadManual('sistema')}
              disabled={downloadingSistema}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              {downloadingSistema ? 'Generando PDF...' : 'Descargar Manual de Sistema'}
            </Button>
          </CardContent>
        </Card>

        {/* Manual Técnico */}
        <Card className="h-full">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-lg bg-blue-100">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">Manual Técnico</CardTitle>
                <CardDescription className="mt-1">Orientado a desarrolladores e ingenieros</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Contenido Incluido:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Arquitectura completa del sistema (3-Tier)</li>
                <li>• Stack tecnológico detallado (React + Node.js)</li>
                <li>• Esquemas de base de datos PostgreSQL</li>
                <li>• APIs REST completas con especificaciones</li>
                <li>• Algoritmos de cálculo de pagos médicos</li>
                <li>• Integraciones externas (OpenAI, HIS, APIs)</li>
                <li>• <strong>Innovaciones patentables identificadas</strong></li>
                <li>• Documentación de seguridad y rendimiento</li>
                <li>• Configuraciones de deployment y DevOps</li>
              </ul>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-700">
                <strong>Elementos Patentables:</strong> Motor de cálculo adaptativo, 
                sistema de importación inteligente y generación adaptativa de documentos.
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Páginas:</span> ~95 páginas
                <br />
                <span className="font-medium">Formato:</span> PDF Profesional
              </div>
            </div>
            
            <Button
              onClick={() => downloadManual('tecnico')}
              disabled={downloadingTecnico}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              {downloadingTecnico ? 'Generando PDF...' : 'Descargar Manual Técnico'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Información Legal */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <FileText className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h4 className="font-semibold text-red-900 mb-2">Información Legal Importante</h4>
              <p className="text-red-700 text-sm mb-3">
                Estos documentos contienen información técnica propietaria y confidencial del 
                Portal de Pagos Médicos desarrollado para el sector salud chileno.
              </p>
              <ul className="text-red-700 text-sm space-y-1">
                <li>• <strong>Confidencialidad:</strong> Información de propiedad intelectual</li>
                <li>• <strong>Uso Autorizado:</strong> Registro INAPI Chile únicamente</li>
                <li>• <strong>Restricciones:</strong> Prohibida reproducción sin autorización</li>
                <li>• <strong>Derechos:</strong> Todos los derechos reservados</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">206</div>
              <div className="text-sm text-gray-600">Páginas Totales</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">15+</div>
              <div className="text-sm text-gray-600">Módulos Documentados</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">3</div>
              <div className="text-sm text-gray-600">Innovaciones Patentables</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">2025</div>
              <div className="text-sm text-gray-600">Año Chile</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}