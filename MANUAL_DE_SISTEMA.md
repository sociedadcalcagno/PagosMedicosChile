# MANUAL DE SISTEMA
## Portal de Pagos Médicos

### Información General
**Nombre del Sistema:** Portal de Pagos Médicos - Sistema de Liquidaciones Médicas  
**Versión:** 1.0  
**Fecha:** Agosto 2025  
**País:** Chile  
**Tipo:** Sistema Web de Gestión de Pagos Médicos  

---

## 1. INTRODUCCIÓN

### 1.1 Propósito del Sistema
El Portal de Pagos Médicos es una aplicación web integral diseñada para gestionar el cálculo y procesamiento de pagos a profesionales médicos en instituciones de salud chilenas. El sistema automatiza los procesos de liquidación de honorarios médicos, manejo de participaciones, y generación de documentos para contabilidad y tesorería.

### 1.2 Alcance
El sistema abarca:
- Gestión de usuarios y perfiles médicos
- Administración de prestaciones médicas y tarifas
- Cálculo automatizado de participaciones médicas
- Procesamiento de pagos según tipos de previsión chilena
- Generación de reportes y exportaciones contables
- Sistema de nómina bancaria para transferencias
- Asistente virtual con inteligencia artificial

### 1.3 Usuarios Objetivo
- **Administradores:** Gestión completa del sistema
- **Supervisores:** Mantenimiento de datos maestros
- **Médicos:** Acceso a información personal y reportes
- **Personal Administrativo:** Procesamiento de pagos y reportes

---

## 2. FUNCIONALIDADES PRINCIPALES

### 2.1 Gestión de Usuarios y Autenticación
- **Sistema de Login Profesional:** Autenticación segura con RUT chileno
- **Perfiles de Usuario:** Tres niveles de acceso (Administrador, Supervisor, Médico)
- **Sesiones Seguras:** Manejo de sesiones con timeout automático
- **Recuperación de Contraseñas:** Sistema de recuperación por correo electrónico

### 2.2 Módulo de Maestros (Administración)
#### 2.2.1 Gestión de Médicos
- **Registro de Profesionales:** RUT, nombre, especialidad, tipo de participación
- **Tipos de Participación:**
  - Individual: Médico independiente
  - Sociedad Médica: Vinculado a sociedad médica
- **Especialidades Médicas:** Catálogo de especialidades chilenas
- **Datos Bancarios:** Información para transferencias electrónicas

#### 2.2.2 Gestión de Prestaciones Médicas
- **Catálogo de Servicios:** Códigos y nombres de prestaciones médicas
- **Tipos de Participación por Servicio:**
  - Participaciones: Servicios con porcentaje de participación
  - HMQ: Servicios con tarifa fija
- **Especialidades Asociadas:** Vinculación servicio-especialidad

#### 2.2.3 Reglas de Cálculo
- **Configuración de Porcentajes:** Reglas de participación por criterios
- **Criterios de Aplicación:**
  - Médico específico
  - Especialidad médica
  - Servicio médico
  - Tipo de previsión
- **Validez Temporal:** Fechas de vigencia de las reglas
- **Montos Fijos:** Configuración de tarifas HMQ

#### 2.2.4 Sociedades Médicas
- **Registro de Sociedades:** RUT, razón social, representante legal
- **Vinculación con Médicos:** Asociación médico-sociedad
- **Datos de Facturación:** Información tributaria completa

### 2.3 Sistema de Pagos
#### 2.3.1 Registro de Atenciones Médicas
- **Captura Manual:** Ingreso individual de atenciones
- **Importación Masiva:** Carga desde archivos CSV
- **Integración API:** Conexión con sistemas hospitalarios
- **Integración HIS:** Conectividad con sistemas de información hospitalaria

#### 2.3.2 Tipos de Previsión Chilena
- **FONASA:** Tramos A, B, C, D
- **ISAPRES:** Integración con principales aseguradoras chilenas
- **Particulares:** Pacientes sin previsión
- **Otros:** Seguros complementarios

#### 2.3.3 Cálculo de Pagos
- **Motor de Cálculo Automático:** Aplicación de reglas configuradas
- **Tipos de Cálculo:**
  - Participaciones: Porcentaje sobre valor bruto
  - HMQ: Monto fijo por prestación
- **Validaciones:** Verificación de reglas y montos
- **Historial:** Trazabilidad completa de cálculos

#### 2.3.4 Procesamiento de Pagos
- **Revisión de Liquidaciones:** Validación antes del pago
- **Aprobación:** Flujo de aprobación por supervisor
- **Generación de Comprobantes:** Documentos de respaldo
- **Estados de Pago:** Pendiente, Procesado, Pagado, Anulado

### 2.4 Módulo de Contabilidad y Tesorería
#### 2.4.1 Exportación Contable
- **Generación de Asientos:** Estructura contable estándar chilena
- **Cuentas Contables:**
  - 5110001 Honorarios Médicos Profesionales (Debe)
  - 1110001 Banco Cuenta Corriente (Haber)
- **Formatos de Exportación:** CSV, Excel, TXT
- **Validación de Balance:** Verificación debe = haber
- **Período de Exportación:** Selección mensual/anual

#### 2.4.2 Nómina Bancaria
- **Formatos Bancarios Chilenos:**
  - Banco Santander
  - Banco BCI  
  - Banco de Chile
  - BancoEstado
  - Formato Universal
- **Generación de Archivos:** Formatos específicos por banco
- **Validación de Datos:** RUT, cuentas bancarias, montos
- **Selección de Transferencias:** Control individual por pago
- **Resumen de Nómina:** Totales y estadísticas

### 2.5 Sistema de Importación de Datos
#### 2.5.1 Importación CSV
- **Registros de Participaciones:** Estructura TMP_REGISTROS_PARTICIPACION
- **Registros HMQ:** Estructura TMP_REGISTROS_HMQ
- **Validación de Datos:** Verificación de formatos y referencias
- **Auto-creación:** Generación automática de médicos y servicios faltantes
- **Progreso en Tiempo Real:** Barra de progreso con estado

#### 2.5.2 Integración API
- **Conexión con Sistemas Externos:** APIs REST estándar
- **Autenticación:** Tokens de seguridad y certificados
- **Sincronización:** Actualización automática de datos
- **Log de Transacciones:** Registro detallado de importaciones

#### 2.5.3 Conectividad HIS
- **Sistemas Hospitalarios:** Integración con HIS nacionales
- **Protocolos Estándar:** HL7, FHIR para intercambio de datos
- **Mapeo de Códigos:** Conversión de códigos locales a estándar
- **Validación Médica:** Verificación de códigos CIE-10 y GES

### 2.6 Reportes y Análisis
#### 2.6.1 Dashboard de Médicos
- **Panel Personal:** Información específica por médico
- **Estadísticas de Ingresos:** Gráficos y tendencias
- **Historial de Pagos:** Consulta de liquidaciones anteriores
- **Cartolas PDF:** Generación de comprobantes detallados

#### 2.6.2 Reportes Administrativos
- **Resúmenes Ejecutivos:** KPIs del sistema
- **Análisis de Pagos:** Estadísticas por período
- **Control de Calidad:** Validaciones y excepciones
- **Auditoría:** Trazabilidad de operaciones

### 2.7 Asistente Virtual IA
#### 2.7.1 Agente Especializado
- **Nombre:** Agente HonorariosMedicos
- **Tecnología:** OpenAI GPT-4o
- **Especialización:** Conocimiento del sistema de pagos médicos chileno
- **Disponibilidad:** 24/7 para todos los usuarios

#### 2.7.2 Capacidades
- **Consultas del Sistema:** Explicación de funcionalidades
- **Ayuda con Cálculos:** Explicación de reglas aplicadas
- **Guía de Uso:** Instrucciones paso a paso
- **Resolución de Problemas:** Diagnóstico y soluciones
- **Información Regulatoria:** Conocimiento del marco legal chileno

---

## 3. FLUJOS DE TRABAJO PRINCIPALES

### 3.1 Flujo de Alta de Médico
1. **Acceso:** Login como Administrador/Supervisor
2. **Navegación:** Maestros > Médicos > Agregar Médico
3. **Captura:** RUT, nombre, especialidad, tipo participación
4. **Validación:** Verificación de RUT único y formato
5. **Vinculación:** Asignación a sociedad médica (opcional)
6. **Confirmación:** Guardado y mensaje de éxito

### 3.2 Flujo de Procesamiento de Pagos
1. **Importación:** Carga de atenciones médicas
2. **Validación:** Verificación de datos y referencias
3. **Cálculo:** Aplicación automática de reglas
4. **Revisión:** Validación de montos calculados
5. **Aprobación:** Autorización de supervisor
6. **Generación:** Creación de documentos de pago
7. **Exportación:** Archivos para contabilidad y banco

### 3.3 Flujo de Exportación Contable
1. **Selección:** Período mensual/anual
2. **Configuración:** Formato de exportación
3. **Generación:** Procesamiento de asientos contables
4. **Validación:** Verificación de balance
5. **Descarga:** Archivo listo para centralización

### 3.4 Flujo de Nómina Bancaria
1. **Período:** Selección de mes/año
2. **Formato:** Elección de banco específico
3. **Generación:** Procesamiento de transferencias
4. **Selección:** Control individual de pagos
5. **Archivo:** Generación de formato bancario
6. **Descarga:** Archivo listo para carga en banco

---

## 4. INTERFACES DE USUARIO

### 4.1 Página de Login
- **Diseño Profesional:** Identidad médica chilena
- **Campos:** RUT con formato automático, contraseña
- **Validaciones:** RUT chileno, campos requeridos
- **Recuperación:** Link para recuperar contraseña
- **Modo Desarrollo:** Acceso directo a perfiles de prueba

### 4.2 Dashboard Principal
- **Navegación Lateral:** Menú por roles y permisos
- **Área de Trabajo:** Contenido dinámico por sección
- **Breadcrumbs:** Navegación jerárquica
- **Notificaciones:** Mensajes del sistema
- **Usuario Activo:** Información de sesión actual

### 4.3 Formularios de Maestros
- **Diseño Consistente:** Campos agrupados lógicamente
- **Validaciones en Tiempo Real:** Feedback inmediato
- **Listas Desplegables:** Valores predefinidos
- **Campos Calculados:** Valores automáticos
- **Botones de Acción:** Guardar, cancelar, eliminar

### 4.4 Tablas de Datos
- **Paginación:** Navegación por páginas
- **Filtros:** Búsqueda por múltiples criterios
- **Ordenamiento:** Columnas ordenables
- **Acciones:** Editar, eliminar, ver detalle
- **Exportación:** Descarga en diferentes formatos

---

## 5. CASOS DE USO

### 5.1 Caso de Uso: Alta de Nuevo Médico
**Actor:** Administrador  
**Precondición:** Usuario autenticado con perfil administrador  
**Flujo Principal:**
1. Administrador accede a sección Médicos
2. Selecciona "Agregar Médico"
3. Ingresa RUT del profesional
4. Sistema valida formato y unicidad del RUT
5. Ingresa nombre completo
6. Selecciona especialidad médica
7. Define tipo de participación (Individual/Sociedad)
8. Si es sociedad, selecciona de lista desplegable
9. Confirma datos y guarda
10. Sistema genera ID único y confirma creación

### 5.2 Caso de Uso: Importación de Atenciones
**Actor:** Administrador/Supervisor  
**Precondición:** Archivo CSV con formato correcto  
**Flujo Principal:**
1. Usuario accede a Importación de Datos
2. Selecciona tipo de registro (Participaciones/HMQ)
3. Carga archivo CSV desde computadora
4. Sistema valida estructura del archivo
5. Muestra preview de primeros registros
6. Usuario confirma importación
7. Sistema procesa registros con barra de progreso
8. Crea médicos y servicios faltantes automáticamente
9. Muestra resumen de importación exitosa

### 5.3 Caso de Uso: Generación de Nómina Bancaria
**Actor:** Administrador  
**Precondición:** Pagos calculados y aprobados  
**Flujo Principal:**
1. Administrador accede a Nómina Bancaria
2. Selecciona período (mes/año)
3. Elige formato bancario específico
4. Sistema genera lista de transferencias
5. Administrador revisa y selecciona transferencias
6. Verifica montos totales
7. Genera archivo bancario
8. Descarga archivo para carga en banco

---

## 6. SEGURIDAD Y CONTROL

### 6.1 Autenticación
- **RUT Chileno:** Identificación única nacional
- **Contraseñas Seguras:** Políticas de complejidad
- **Sesiones Controladas:** Timeout automático
- **Intentos de Login:** Bloqueo por intentos fallidos

### 6.2 Autorización
- **Perfiles de Acceso:** Tres niveles claramente definidos
- **Control de Funciones:** Acceso según perfil
- **Validación de Permisos:** Verificación en cada operación
- **Logs de Acceso:** Registro de todas las acciones

### 6.3 Integridad de Datos
- **Validaciones de Negocio:** Reglas específicas del dominio médico
- **Constraints de Base de Datos:** Integridad referencial
- **Transacciones:** Operaciones atómicas
- **Respaldos:** Copias de seguridad automáticas

---

## 7. BENEFICIOS DEL SISTEMA

### 7.1 Operacionales
- **Automatización:** Reducción de trabajo manual en 80%
- **Precisión:** Eliminación de errores de cálculo
- **Velocidad:** Procesamiento masivo de datos
- **Trazabilidad:** Historial completo de operaciones

### 7.2 Financieros
- **Control de Costos:** Gestión precisa de pagos médicos
- **Cumplimiento:** Adherencia a regulaciones chilenas
- **Reportería:** Información para toma de decisiones
- **Auditoría:** Documentación completa para controles

### 7.3 Tecnológicos
- **Escalabilidad:** Arquitectura moderna y flexible
- **Integración:** Conectividad con sistemas existentes
- **Usabilidad:** Interfaz intuitiva y responsive
- **Mantenibilidad:** Código estructurado y documentado

---

## 8. GLOSARIO DE TÉRMINOS

- **HMQ:** Honorarios Médicos por Cantidad - Sistema de pago fijo por prestación
- **Participaciones:** Sistema de pago por porcentaje sobre valor de prestación
- **FONASA:** Fondo Nacional de Salud - Seguro público chileno
- **ISAPRE:** Institución de Salud Previsional - Seguro privado chileno
- **RUT:** Rol Único Tributario - Identificación única en Chile
- **GES:** Garantías Explícitas en Salud - Plan de beneficios chileno
- **HIS:** Hospital Information System - Sistema de información hospitalaria
- **Cartola:** Documento de liquidación de pagos médicos
- **Previsión:** Sistema de seguro de salud del paciente
- **Prestación:** Servicio médico específico con código único

---

**Documento generado para:** Instituto Nacional de Propiedad Industrial (INAPI) - Chile  
**Fecha:** Agosto 2025  
**Versión:** 1.0  
**Confidencialidad:** Documento de Propiedad Intelectual