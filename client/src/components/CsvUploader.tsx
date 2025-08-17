import { useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CsvUploaderProps {
  onDataImported: (data: any[]) => void;
}

interface ImportResult {
  success: boolean;
  data: any[];
  errors: string[];
  total: number;
  imported: number;
}

export function CsvUploader({ onDataImported }: CsvUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordType, setRecordType] = useState<'participacion' | 'hmq'>('participacion');
  const [apiConfig, setApiConfig] = useState({
    url: "",
    headers: "",
    method: "GET",
    body: "",
  });
  const [hisConfig, setHisConfig] = useState({
    endpoint: "",
    apiKey: "",
    facility: "",
    dateFrom: "",
    dateTo: "",
  });
  // Mock toast for now
  const toast = (options: any) => {
    console.log('Toast:', options.title, options.description);
  };

  // Function to interpret technical errors into operational messages
  const interpretError = (error: string): { type: string; message: string; solution: string; row?: string } => {
    const errorLower = error.toLowerCase();
    
    // Extract row number if present
    const rowMatch = error.match(/fila\s+(\d+)/i);
    const rowNumber = rowMatch ? rowMatch[1] : undefined;
    
    // Database constraint errors
    if (errorLower.includes('foreign key constraint') && errorLower.includes('specialties')) {
      return {
        type: "Especialidad no registrada",
        message: "El archivo contiene especialidades médicas que no están registradas en el sistema",
        solution: "El sistema agregará automáticamente las especialidades faltantes en la próxima importación",
        row: rowNumber
      };
    }
    
    if (errorLower.includes('foreign key constraint') && errorLower.includes('doctors')) {
      return {
        type: "Doctor no encontrado", 
        message: "Algunos doctores del archivo no están registrados en el sistema",
        solution: "Revisa que los RUTs y nombres de los doctores estén correctos",
        row: rowNumber
      };
    }
    
    // Date format errors
    if (errorLower.includes('formato de fecha') || errorLower.includes('invalid date')) {
      const dateMatch = error.match(/"([^"]+)"/);
      const invalidDate = dateMatch ? dateMatch[1] : 'fecha';
      return {
        type: "Formato de fecha incorrecto",
        message: `La fecha "${invalidDate}" no tiene el formato esperado`,
        solution: "Las fechas deben estar en formato DD-MMM-YY (ejemplo: 15-AGO-25) o DD-MM-YYYY",
        row: rowNumber
      };
    }
    
    // Missing or insufficient data
    if (errorLower.includes('columnas insuficientes') || errorLower.includes('insufficient columns')) {
      return {
        type: "Estructura del archivo incorrecta",
        message: "Esta fila del archivo no tiene todas las columnas necesarias",
        solution: "Verifica que esta fila tenga el formato CSV correcto con todas las columnas requeridas",
        row: rowNumber
      };
    }
    
    // Patient name validation
    if (errorLower.includes('nombre del paciente incompleto') || errorLower.includes('patient name')) {
      return {
        type: "Datos del paciente incompletos",
        message: "El nombre del paciente falta o es demasiado corto",
        solution: "Asegúrate de que el paciente tenga un nombre completo (mínimo 3 caracteres)",
        row: rowNumber
      };
    }
    
    // Generic processing error
    if (errorLower.includes('error al procesar')) {
      return {
        type: "Error de procesamiento",
        message: "No se pudo procesar correctamente esta línea del archivo",
        solution: "Revisa que los datos estén completos y en el formato correcto",
        row: rowNumber
      };
    }
    
    // Default case
    return {
      type: "Error en los datos",
      message: error,
      solution: "Revisa el formato y contenido de esta línea en el archivo",
      row: rowNumber
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isValidFile = file.name.toLowerCase().endsWith('.csv') || 
                       file.name.toLowerCase().endsWith('.xlsx') || 
                       file.name.toLowerCase().endsWith('.xls');
    
    if (!isValidFile) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos CSV, XLS o XLSX",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const isExcel = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');
      
      // Read file content
      const reader = new FileReader();
      reader.onload = async (e) => {
        let requestData;
        let endpoint;
        
        if (isExcel) {
          // For Excel files, send as base64
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Convert to base64 in chunks to avoid call stack overflow
          let binaryString = '';
          const chunkSize = 1024; // Process 1KB chunks
          for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.slice(i, i + chunkSize);
            binaryString += String.fromCharCode.apply(null, Array.from(chunk));
          }
          const base64 = btoa(binaryString);
          
          requestData = { excelData: base64, fileName: file.name };
          endpoint = recordType === 'participacion' 
            ? '/api/import/excel-participacion' 
            : '/api/import/excel-hmq';
        } else {
          // For CSV files, send as text
          const csvData = e.target?.result as string;
          requestData = { csvData };
          endpoint = recordType === 'participacion' 
            ? '/api/import/csv-participacion' 
            : '/api/import/csv-hmq';
        }
        
        // Simular progreso de carga
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
            credentials: 'include',
          });

          clearInterval(progressInterval);
          setUploadProgress(100);

          if (!response.ok) {
            if (response.status === 401) {
              throw new Error('Sesión expirada. Inicia sesión nuevamente y vuelve a intentar.');
            }
            throw new Error('Error al procesar el archivo CSV');
          }

          const result = await response.json();
          setImportResult(result);

          if (result.success && result.data.length > 0) {
            onDataImported(result.data);
            toast({
              title: "Importación exitosa",
              description: `Se importaron ${result.imported} de ${result.total} ${recordType === 'participacion' ? 'Registros Participaciones' : 'Registros HMQ'}`,
            });
          }
        } catch (error) {
          clearInterval(progressInterval);
          toast({
            title: "Error", 
            description: error instanceof Error ? error.message : `Error al procesar el archivo ${isExcel ? 'Excel' : 'CSV'}`,
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      };
      
      // Read file based on type
      if (isExcel) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    } catch (error) {
      const fileType = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls') ? 'Excel' : 'CSV';
      toast({
        title: "Error",
        description: `Error al leer el archivo ${fileType}`,
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleApiImport = async () => {
    if (!apiConfig.url) {
      toast({
        title: "Error",
        description: "La URL de la API es requerida",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      let headers = {};
      if (apiConfig.headers) {
        headers = JSON.parse(apiConfig.headers);
      }

      const endpoint = recordType === 'participacion' 
        ? '/api/import/api-participacion' 
        : '/api/import/api-hmq';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: apiConfig.url,
          method: apiConfig.method,
          headers,
          body: apiConfig.body ? JSON.parse(apiConfig.body) : undefined,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al importar desde API');
      }

      const result = await response.json();
      setImportResult(result);

      if (result.success && result.data.length > 0) {
        onDataImported(result.data);
        toast({
          title: "Importación exitosa",
          description: `Se importaron ${result.imported} registros desde la API`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al importar desde la API externa",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHisImport = async () => {
    if (!hisConfig.endpoint || !hisConfig.apiKey) {
      toast({
        title: "Error",
        description: "Endpoint y API Key del HIS son requeridos",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const endpoint = recordType === 'participacion' 
        ? '/api/import/his-participacion' 
        : '/api/import/his-hmq';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hisConfig),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al conectar con el HIS');
      }

      const result = await response.json();
      setImportResult(result);

      if (result.success && result.data.length > 0) {
        onDataImported(result.data);
        toast({
          title: "Importación exitosa",
          description: `Se importaron ${result.imported} registros desde el HIS`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al importar desde el sistema HIS",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetImport = () => {
    setImportResult(null);
    setUploadProgress(0);
    setIsProcessing(false);
    // Reset file input if needed
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Importar Datos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Atenciones Médicas</DialogTitle>
          <DialogDescription>
            Importa atenciones desde archivos CSV, APIs externas o sistemas HIS
          </DialogDescription>
        </DialogHeader>

        {/* Selector de tipo de registro */}
        <Card className="mb-4">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Tipo de Registro</CardTitle>
            <CardDescription>
              Selecciona el tipo de datos médicos que vas a importar
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="recordType"
                  value="participacion"
                  checked={recordType === 'participacion'}
                  onChange={(e) => setRecordType(e.target.value as 'participacion' | 'hmq')}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Registros Participaciones</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="recordType"
                  value="hmq"
                  checked={recordType === 'hmq'}
                  onChange={(e) => setRecordType(e.target.value as 'participacion' | 'hmq')}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Registros HMQ</span>
              </label>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {recordType === 'participacion' 
                ? 'Atenciones médicas individuales con datos de participación y porcentajes' 
                : 'Registros de consumos/liquidaciones médicas con datos de facturación'}
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="csv" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="csv">Archivo</TabsTrigger>
            <TabsTrigger value="api">API Externa</TabsTrigger>
            <TabsTrigger value="his">Sistema HIS</TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Importar desde Archivo
                </CardTitle>
                <CardDescription>
                  {recordType === 'participacion' 
                    ? 'Formato TMP_REGISTROS_PARTICIPACION: RUT Paciente, Nombre, Fecha Atención, Código Prestación, Nombre Prestación, Previsión, Valor Participado, Valor Líquido, % Participación, Horario, Especialidad ID, Estado, Médico ID, Sociedad ID, Nombre Sociedad, RUT Sociedad, Código Interno Médico'
                    : 'Formato TMP_REGISTROS_HMQ: RUT Paciente, Nombre, Fecha Consumo, Código Prestación, Nombre Prestación, Previsión, Valor Bruto, Valor Líquido, Comisión, Valor Recaudado, Especialidad ID, Estado, Banco Pago, Cuenta Pago, Médico ID, Sociedad ID, Nombre Sociedad, RUT Sociedad, Código Interno Médico, Participante'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="csv-file">Seleccionar archivo CSV o Excel</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Archivos soportados: CSV, XLS, XLSX (Excel recomendado para evitar problemas con comas en los datos)
                  </p>
                </div>

                {isProcessing && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg border">
                    <div className="flex items-center justify-center space-x-3">
                      {/* Spinner médico animado */}
                      <div className="relative">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-medium text-blue-700">Procesando datos médicos...</span>
                        <div className="text-xs text-blue-500 mt-1">
                          Estimado: ~{Math.round((uploadProgress * 100) / 1.1)} registros procesados
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-600">Progreso de importación</span>
                        <span className="text-sm font-bold text-blue-700">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-3 shadow-inner">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm relative" 
                          style={{ width: `${uploadProgress}%` }}
                        >
                          <div className="absolute inset-0 bg-white bg-opacity-20 animate-pulse rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-blue-500">
                        <span>
                          {uploadProgress < 50 ? "🔍 Validando estructura..." : 
                           uploadProgress < 90 ? "⚡ Procesando registros..." : 
                           "✅ Finalizando..."}
                        </span>
                        <span className="font-mono">
                          {uploadProgress < 30 ? "~0-2000 filas" :
                           uploadProgress < 60 ? "~2000-5000 filas" :
                           uploadProgress < 90 ? "~5000-8000 filas" :
                           "~8000+ filas"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Conectar con API Externa
                </CardTitle>
                <CardDescription>
                  {recordType === 'participacion' 
                    ? 'Conecta con API externa para importar Registros Participaciones con datos de porcentajes y liquidaciones'
                    : 'Conecta con API externa para importar Registros HMQ con datos de facturación y comisiones'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="api-url">URL de la API</Label>
                  <Input
                    id="api-url"
                    placeholder="https://api.ejemplo.com/atenciones"
                    value={apiConfig.url}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="api-method">Método HTTP</Label>
                    <select 
                      id="api-method"
                      className="w-full p-2 border rounded-md"
                      value={apiConfig.method}
                      onChange={(e) => setApiConfig(prev => ({ ...prev, method: e.target.value }))}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="api-headers">Headers (JSON)</Label>
                  <Textarea
                    id="api-headers"
                    placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                    value={apiConfig.headers}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, headers: e.target.value }))}
                  />
                </div>

                {apiConfig.method === "POST" && (
                  <div>
                    <Label htmlFor="api-body">Body (JSON)</Label>
                    <Textarea
                      id="api-body"
                      placeholder='{"dateFrom": "2025-01-01", "dateTo": "2025-01-31"}'
                      value={apiConfig.body}
                      onChange={(e) => setApiConfig(prev => ({ ...prev, body: e.target.value }))}
                    />
                  </div>
                )}

                <Button 
                  onClick={handleApiImport} 
                  disabled={isProcessing || !apiConfig.url}
                  className="w-full"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Importando...</span>
                    </div>
                  ) : "Importar desde API"}
                </Button>
                
                {isProcessing && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-6 h-6 border-3 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                      <span className="text-sm text-green-700">Conectando con API externa...</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="his" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Sistema HIS (Health Information System)
                </CardTitle>
                <CardDescription>
                  {recordType === 'participacion' 
                    ? 'Conecta con sistemas hospitalarios para importar Registros Participaciones desde MINSAL, FONASA o sistemas privados'
                    : 'Conecta con sistemas hospitalarios para importar Registros HMQ de liquidación desde MINSAL, FONASA o sistemas privados'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="his-endpoint">Endpoint HIS</Label>
                    <Input
                      id="his-endpoint"
                      placeholder="https://his.hospital.cl/api/v1"
                      value={hisConfig.endpoint}
                      onChange={(e) => setHisConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="his-facility">Código Establecimiento</Label>
                    <Input
                      id="his-facility"
                      placeholder="EST001"
                      value={hisConfig.facility}
                      onChange={(e) => setHisConfig(prev => ({ ...prev, facility: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="his-api-key">API Key del HIS</Label>
                  <Input
                    id="his-api-key"
                    type="password"
                    placeholder="Clave de acceso del sistema HIS"
                    value={hisConfig.apiKey}
                    onChange={(e) => setHisConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="his-date-from">Fecha Desde</Label>
                    <Input
                      id="his-date-from"
                      type="date"
                      value={hisConfig.dateFrom}
                      onChange={(e) => setHisConfig(prev => ({ ...prev, dateFrom: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="his-date-to">Fecha Hasta</Label>
                    <Input
                      id="his-date-to"
                      type="date"
                      value={hisConfig.dateTo}
                      onChange={(e) => setHisConfig(prev => ({ ...prev, dateTo: e.target.value }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleHisImport} 
                  disabled={isProcessing || !hisConfig.endpoint || !hisConfig.apiKey}
                  className="w-full"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Conectando...</span>
                    </div>
                  ) : "Importar desde HIS"}
                </Button>
                
                {isProcessing && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg border">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-6 h-6 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                      <span className="text-sm text-purple-700">Conectando con sistema HIS...</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {importResult && (
          <Card className="mt-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  {importResult.success ? (
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                  )}
                  Resultado de Importación
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={resetImport}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Badge variant="outline">
                      Total procesados: {importResult.total}
                    </Badge>
                  </div>
                  <div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      ✓ Importados: {importResult.imported}
                    </Badge>
                  </div>
                  {importResult.errors.length > 0 && (
                    <div>
                      <Badge variant="destructive">
                        Con problemas: {importResult.errors.length}
                      </Badge>
                    </div>
                  )}
                </div>
                
                {importResult.imported > 0 && (
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <div className="text-sm text-green-800">
                        <strong>¡Importación exitosa!</strong> Se procesaron correctamente {importResult.imported} de {importResult.total} registros.
                        {importResult.imported === importResult.total ? (
                          " Todos los datos se importaron sin problemas."
                        ) : (
                          " Los registros válidos ya están disponibles en el sistema."
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {importResult.errors.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-red-600">Problemas encontrados durante la importación:</h4>
                  <div className="max-h-64 overflow-y-auto space-y-3">
                    {importResult.errors.map((error, index) => {
                      const interpreted = interpretError(error);
                      return (
                        <div key={index} className="bg-red-50 border border-red-200 p-3 rounded-lg">
                          <div className="flex items-start space-x-3">
                            {interpreted.row && (
                              <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex-shrink-0">
                                Fila {interpreted.row}
                              </div>
                            )}
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                              <div className="font-medium text-red-800">{interpreted.type}</div>
                              <div className="text-sm text-red-700">{interpreted.message}</div>
                              <div className="text-xs text-red-600 bg-white p-2 rounded border">
                                <strong>Solución:</strong> {interpreted.solution}
                              </div>
                              {/* Show original error only if needed for debugging */}
                              <details className="text-xs">
                                <summary className="text-red-500 cursor-pointer hover:text-red-700">
                                  Ver detalles técnicos
                                </summary>
                                <div className="mt-1 text-red-500 font-mono bg-gray-100 p-1 rounded">
                                  {error}
                                </div>
                              </details>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <div className="text-sm text-blue-800">
                        <strong>Nota:</strong> Los registros que se pudieron procesar correctamente ya fueron guardados en el sistema. 
                        Solo las filas con problemas fueron rechazadas.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}