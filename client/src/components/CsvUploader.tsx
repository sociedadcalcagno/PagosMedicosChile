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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos CSV",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Read file content
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csvData = e.target?.result as string;
        
        // Simular progreso de carga
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        const endpoint = recordType === 'participacion' 
          ? '/api/import/csv-participacion' 
          : '/api/import/csv-hmq';

        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ csvData }),
            credentials: 'include',
          });

          clearInterval(progressInterval);
          setUploadProgress(100);

          if (!response.ok) {
            throw new Error('Error al procesar el archivo CSV');
          }

          const result = await response.json();
          setImportResult(result);

          if (result.success && result.data.length > 0) {
            onDataImported(result.data);
            toast({
              title: "Importación exitosa",
              description: `Se importaron ${result.imported} de ${result.total} registros de ${recordType}`,
            });
          }
        } catch (error) {
          clearInterval(progressInterval);
          toast({
            title: "Error",
            description: "Error al procesar el archivo CSV",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al leer el archivo CSV",
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
                <span className="text-sm font-medium">Registros de Participación</span>
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
                <span className="text-sm font-medium">Actividades HMQ</span>
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
            <TabsTrigger value="csv">Archivo CSV</TabsTrigger>
            <TabsTrigger value="api">API Externa</TabsTrigger>
            <TabsTrigger value="his">Sistema HIS</TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Importar desde CSV
                </CardTitle>
                <CardDescription>
                  {recordType === 'participacion' 
                    ? 'Formato TMP_REGISTROS_PARTICIPACION: RUT Paciente, Nombre, Fecha Atención, Código Prestación, Nombre Prestación, Previsión, Valor Participado, Valor Líquido, % Participación, Horario, Especialidad ID, Estado'
                    : 'Formato TMP_REGISTROS_HMQ: RUT Paciente, Nombre, Fecha Consumo, Código Prestación, Valor Bruto, Valor Líquido, Comisión, Estado, Banco, Cuenta'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="csv-file">Seleccionar archivo CSV</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                  />
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Procesando archivo...</span>
                      <span className="text-sm">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
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
                    ? 'Conecta con API externa para importar registros de participación médica con datos de porcentajes y liquidaciones'
                    : 'Conecta con API externa para importar actividades HMQ con datos de facturación y comisiones'}
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
                  {isProcessing ? "Importando..." : "Importar desde API"}
                </Button>
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
                    ? 'Conecta con sistemas hospitalarios para importar registros de participación médica desde MINSAL, FONASA o sistemas privados'
                    : 'Conecta con sistemas hospitalarios para importar actividades HMQ de liquidación desde MINSAL, FONASA o sistemas privados'}
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
                  {isProcessing ? "Conectando..." : "Importar desde HIS"}
                </Button>
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
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Badge variant="outline">
                    Total: {importResult.total}
                  </Badge>
                </div>
                <div>
                  <Badge variant={importResult.success ? "default" : "destructive"}>
                    Importados: {importResult.imported}
                  </Badge>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Errores encontrados:</h4>
                  <div className="max-h-32 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {error}
                      </p>
                    ))}
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