# Mapeo de Columnas CSV HIS → Base de Datos

## Resumen
Este documento muestra la correspondencia exacta entre las columnas del CSV exportado desde el HIS (Oracle PL/SQL Developer) y los campos de la base de datos del sistema de pagos médicos.

## Estructura del CSV del HIS

Basado en la imagen proporcionada, el CSV contiene las siguientes columnas principales:

### Columnas Identificadas en el CSV:

| **Columna CSV HIS** | **Ejemplo de Dato** | **Campo Base de Datos** | **Descripción** |
|---------------------|-------------------|------------------------|-----------------|
| `ID` | 51270342 | `id` (auto-generado) | ID único del registro |
| `NUMERO_PAGO` | 2843852 | No mapeado | Número de pago interno |
| `FECHA_SOLICITUD` | 07-Aug-25 | No mapeado directamente | Fecha de solicitud |
| `FECHA_PARTICIPACION` | 01-Aug-25 | `attentionDate` | **Fecha de la atención médica** |
| `RUT_PAGO` | 76375293 | No mapeado | RUT entidad pagadora |
| `NOMBRE_PAGADOR` | ALARCON VASQUEZ IMAGENOLOGIA... | No mapeado | Nombre entidad pagadora |
| `RUT_PROF` | 14566756 | `patientRut` (derivado) | RUT del profesional |
| `NOMBRE_PROF` | ALARCON STUARDO RAUL | `doctorId` (búsqueda) | **Nombre del médico** |
| `ORIGEN` | AMB | No mapeado | Origen de la atención |
| `CODCENTRO` | 27 | No mapeado | Código del centro médico |
| `CENTROCOSTO` | ECOTOMOGRAFIA GENERAL | No mapeado | Centro de costo |
| `CODIGO_PRESTACION` | 04-04-016 | `serviceId` (búsqueda) | **Código del servicio médico** |
| `NOMBRE_PRESTACION` | ECOGRAFIA PARTES BLANDAS... | `serviceName` | **Nombre del servicio** |
| `PREVISION` | CONSULID | `providerTypeId` (mapeo) | **Tipo de previsión del paciente** |
| `FECHA_ATENCION` | 01-Aug-25 | `attentionDate` | **Fecha real de la atención** |
| `PACIENTE` | HUGHES GARCIA DAVID | `patientName` | **Nombre completo del paciente** |
| `COD_SISTEMA` | No visible | No mapeado | Código del sistema |
| `ID_ATENCION` | 3295732 | No mapeado | ID de la atención |
| `ID_INGRESO` | 0 | No mapeado | ID de ingreso |
| `ID_CONSUMO` | 0 | No mapeado | ID de consumo |
| `CANTIDAD` | 1 | No mapeado | Cantidad de prestaciones |
| `VALOR_UNITARIO` | 36252 | `grossAmount` | **Valor bruto unitario** |
| `BRUTO` | 36252 | `grossAmount` | **Monto bruto total** |
| `PORCENTAJE_PARTICIPACION` | 27 | `participationPercentage` | **% de participación médica** |
| `PARTICIPADO` | 9788 | `participatedAmount` | **Monto participado** |
| `RETENCION` | 0 | No mapeado | Retención aplicada |
| `LIQUIDO` | 9788 | `netAmount` | **Monto líquido a pagar** |
| `COMISION` | 147 | `commission` | **Comisión aplicada** |
| `MONTO_CANCELAR` | 9641 | `netAmount` | **Monto final a cancelar** |
| `RETENCION_MOD` | 0 | No mapeado | Retención modificada |
| `ESTADO` | ENTERESORIA | `status` (mapeo) | **Estado del pago** |
| `USUARIO_DIGITADOR` | KMADRIAZA | No mapeado | Usuario que digitó |
| `USUARIO_SUPERVISOR` | KM | No mapeado | Usuario supervisor |
| `FECHA_MOD_DIGITADOR` | 08-Aug-25 | No mapeado | Fecha modificación digitador |
| `FECHA_MOD_SUPERVISOR` | 08-Aug-25 | No mapeado | Fecha modificación supervisor |

## Mapeo Específico en el Código

### 1. Campos Críticos para la Importación:

```typescript
// Mapeo principal en server/routes.ts
const attention = {
  patientRut: extraerRutDePaciente(values[PACIENTE_COL]), // Derivado del nombre del paciente
  patientName: values[15], // PACIENTE
  doctorId: await findOrCreateDoctor(values[NOMBRE_PROF_COL]), // Búsqueda por nombre
  serviceId: await findOrCreateService(values[CODIGO_PRESTACION_COL]), // Búsqueda por código
  providerTypeId: mapProviderType(values[PREVISION_COL]), // Mapeo de previsión
  attentionDate: formatDate(values[FECHA_ATENCION_COL]), // Conversión DD-MMM-YY → YYYY-MM-DD
  attentionTime: '09:00', // Valor por defecto
  scheduleType: 'regular',
  grossAmount: values[BRUTO_COL], // BRUTO
  netAmount: values[LIQUIDO_COL], // LIQUIDO
  participatedAmount: values[PARTICIPADO_COL], // PARTICIPADO
  participationPercentage: values[PORCENTAJE_PARTICIPACION_COL], // PORCENTAJE_PARTICIPACION
  commission: values[COMISION_COL], // COMISION
  status: mapStatus(values[ESTADO_COL]), // ESTADO
  serviceName: values[NOMBRE_PRESTACION_COL], // NOMBRE_PRESTACION
  providerName: values[PREVISION_COL] // PREVISION
};
```

### 2. Campos con Transformación:

- **`FECHA_ATENCION`**: `01-Aug-25` → `2025-08-01` (formato ISO)
- **`PREVISION`**: `CONSULID` → ID de tipo de proveedor en BD
- **`ESTADO`**: `ENTERESORIA` → Estado normalizado (`pending`, `paid`, etc.)
- **`CODIGO_PRESTACION`**: Búsqueda en tabla `services` por código
- **`NOMBRE_PROF`**: Búsqueda en tabla `doctors` por nombre

### 3. Campos Calculados Automáticamente:

- **`id`**: UUID auto-generado
- **`createdAt`**: Timestamp actual
- **`scheduleType`**: Valor por defecto 'regular'
- **`attentionTime`**: Valor por defecto '09:00'

## Validaciones Aplicadas

1. **Fecha obligatoria**: `FECHA_ATENCION` debe tener formato DD-MMM-YY
2. **Paciente obligatorio**: `PACIENTE` debe tener al menos 3 caracteres
3. **Montos numéricos**: `BRUTO`, `LIQUIDO`, `PARTICIPADO` deben ser números válidos
4. **Búsqueda de entidades**: Doctor y servicio se crean automáticamente si no existen

## Ejemplo de Transformación

**Dato CSV:**
```
FECHA_ATENCION: 01-Aug-25
PACIENTE: HUGHES GARCIA DAVID
NOMBRE_PROF: ALARCON STUARDO RAUL
CODIGO_PRESTACION: 04-04-016
PREVISION: CONSULID
BRUTO: 36252
PARTICIPADO: 9788
LIQUIDO: 9788
```

**Registro en BD:**
```json
{
  "id": "992ae847-322e-45d3-88e8-87a8db123456",
  "patientName": "HUGHES GARCIA DAVID",
  "patientRut": "12345678-9",
  "doctorId": "doc001",
  "serviceId": "srv001", 
  "attentionDate": "2025-08-01",
  "providerTypeId": "prov_consulid",
  "grossAmount": "36252",
  "participatedAmount": "9788",
  "netAmount": "9788",
  "status": "pending"
}
```

## Notas Importantes

- El sistema maneja automáticamente la creación de médicos y servicios faltantes
- Las fechas se convierten del formato Oracle (DD-MMM-YY) al formato ISO (YYYY-MM-DD)
- Los RUTs de pacientes se derivan del nombre cuando no están disponibles directamente
- El mapeo de previsiones se hace mediante tabla de correspondencias predefinida
