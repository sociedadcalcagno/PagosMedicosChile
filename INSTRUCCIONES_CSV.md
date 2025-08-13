# Formato CSV Requerido para Importación

## Estructura del archivo

Tu archivo CSV debe tener exactamente estas 46 columnas en este orden:

```
ID,NUMERO_PAGO,FECHA_SOLICITUD,FECHA_PARTICIPACION,RUT_PAGO,NOMBRE_PAGADOR,RUT_PROF,NOMBRE_PROF,ORIGEN,CODCENTRO,CENTROCOSTO,CODIGO_PRESTACION,NOMBRE_PRESTACION,PREVISION,FECHA_ATENCION,PACIENTE,COD_SISTEMA,ID_ATENCION,ID_INGRESO,ID_CONSUMO,CANTIDAD,VALOR_UNITARIO,BRUTO,PORCENTAGE_PARTICIPACION,PARTICIPADO,RETENCION,LIQUIDO,COMISION,MONTO_CANCELAR,RETENCION_MOD,ESTADO,USUARIO_DIGITADOR,USUARIO_SUPERVISOR,FECHA_MOD_DIGITADOR,FECHA_MOD_SUPERVISOR,PP_IDPAGO,PP_FECHAPAGO,PP_CODBANCO,PP_CTACTE,FECHA_CARGA,NUMERO_CARGA,USUARIO_CARGA,USUARIO_ACTUALIZA,FECHA_CANCELACION,RUT_PROV_SIN_DV,SUCURSAL
```

## Formatos importantes:

### Fechas (columnas 14 y otras fechas):
- ✅ **CORRECTO**: `01-Aug-25`, `04-Aug-25`, `31-Jul-25`
- ❌ **INCORRECTO**: `01-AUG-25` (todo mayúsculas)
- ❌ **INCORRECTO**: `2025-08-01` (formato ISO)

### Campos críticos:
- **Columna 15 (PACIENTE)**: Nombre completo del paciente (mínimo 3 caracteres)
- **Columna 14 (FECHA_ATENCION)**: Fecha en formato DD-Mmm-YY
- **Columnas 22,24,26**: Montos BRUTO, PARTICIPADO, LIQUIDO (solo números)

## Ejemplo de fila válida:
```
51270342,2343852,07-Aug-25,01-Aug-25,76375293-3,ALARCON VASQUEZ IMAGENOLOGIA MEDICA LTDA,14366756-1,ALARCON STUARDO RAUL,AMB,27,ECOTOMOGRAFIA GENERAL,04-04-016-01,ECOGRAFIA PARTES BLANDAS,CONSALUD,01-Aug-25,HUGHES GARCIA DAVID,3,3295732,0,0,1,36252,36252,27,9788,0,9788,147,9641,0,ENTESORERIA,KMADRIAZA,KM,08-Aug-25,08-Aug-25,2188,13-Aug-25,039,208051765,08-Aug-25,4230,KM,KM,,,1
```

## Pasos recomendados:

1. **Abre el archivo en Excel**
2. **Cambia el formato de fecha**: Todas las fechas de formato `DD-AUG-YY` a `DD-Aug-YY` (primera letra mayúscula, resto minúscula)
3. **Verifica que tengas 46 columnas**
4. **Guarda como CSV UTF-8**
5. **Importa usando el botón de importación en el sistema**

El sistema procesará automáticamente hasta 100 registros por importación.