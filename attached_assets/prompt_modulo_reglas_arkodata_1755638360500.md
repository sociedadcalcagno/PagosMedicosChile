# Cómo usar este archivo en Replit (pasos rápidos)
1) Abre tu proyecto en Replit y entra al **Chat del Agente** (o a la configuración del agente si aplica).
2) Copia TODO el contenido de este archivo y pégalo como **prompt/instrucciones** para el agente.
3) Pide explícitamente que ejecute los **Pasos** y cumpla los **Criterios de aceptación** definidos abajo.
4) Verifica los cambios en el repositorio (modelos Prisma, endpoints /api, UI de Rules.tsx, pruebas, seeds y docs).

---

# Prompt — Módulo de Reglas Inteligente (ArkoData)

# Objetivo
Construir/modernizar el **Módulo de Reglas de Cálculo de Honorarios** para que sea **inteligente, auditable y a prueba de conflictos**. Debe integrarse con el front existente (Rules.tsx) y exponer una API sólida. El sistema debe soportar reglas por **profesional, sociedad, especialidad, prestación, sucursal, grupos, horario, días**, vigencias, tipos de abono (porcentaje/monto fijo) y **detectar cruces/colisiones** con alertas.

> **Entrega**: Código listo, migraciones, pruebas, documentación técnica y ayudas en UI.

---

## Contexto de repositorio y alcance
- Front actual usa React + React Query + zod + shadcn/ui y consume endpoints `/api/calculation-rules`, `/api/specialties`, `/api/services`, `/api/doctors`, `/api/medical-societies`.
- Back esperado: Node/TypeScript (Next.js API routes) con Prisma + PostgreSQL.
- Se debe contemplar **migración** desde legado (PHP/Oracle – paquetes `PKG_REGLAS` con grupos/condiciones) a un modelo relacional moderno (ver “Esquema de datos”).

**No negociables**
1. **Detección de conflictos** a la hora de crear/editar reglas.
2. **Versionado** de reglas y **auditoría** completa.
3. **Simulador** de cálculo y **explicación** (por qué se aplicó una regla).
4. **Alertas** (conflictos, sumatorias > 100%, vigencias solapadas) por UI y webhook.
5. **Pruebas automatizadas** (unitarias e integración) y seed de datos.

---

## Especificación funcional
### 1) Definición de regla
Campos mínimos:
- `code`, `name`, `description` (opcional)
- `validFrom`, `validTo`, `isActive`
- `participationType`: `individual|society|mixed`
- `specialtyId` (obligatorio)
- `serviceId` (nullable = todas)
- `doctorId` (si `individual`)
- `societyId` + (`societyRut`, `societyName`) si `society`
- **`branchId` (nuevo, sucursal)**
- `paymentType`: `percentage|fixed_amount`
- `paymentValue` (numérico; si `percentage` => 0–100)
- `scheduleType`: `all|regular|irregular|night`
- `applicableDays`: lista de `monday..sunday`
- `scopeType`: `individual|group` (para soportar grupos)
- `scopeGroupId`: referencia a grupo si `scopeType=group`
- `baseRule`: descripción/DSL (ver más abajo)

### 2) Reglas de negocio clave
- Una regla solo es **aplicable** si: `isActive = true` y `validFrom ≤ hoy ≤ validTo`.
- **Especificidad** (prioridad):
  1. (branchId + doctorId + serviceId) >
  2. (branchId + doctorId + all services) >
  3. (branchId + societyId + serviceId) >
  4. (branchId + societyId + all services) >
  5. (branchId + specialtyId + serviceId) >
  6. (branchId + specialtyId + all services) >
  7. (group scope con coincidencia)
- Si hay **múltiples candidatas** con la **misma especificidad** → aplicar **resolución de conflicto** (ver sección).

### 3) Simulador de cálculo
Endpoint `POST /api/rules/simulate` con payload:
```json
{
  "date": "2025-08-19",
  "doctorId": "...",
  "societyId": null,
  "specialtyId": "...",
  "serviceId": "...",
  "branchId": "...",
  "baseAmount": 120000,
  "scheduleType": "regular",
  "weekday": "tuesday"
}
```
Respuesta:
```json
{
  "selectedRuleId": "...",
  "applied": { "paymentType": "percentage", "paymentValue": 35 },
  "calculatedPayment": 42000,
  "explanation": "Se eligió la regla R005 por ser la más específica (sucursal+doctor+prestación) y estar vigente."
}
```

### 4) Alertas y monitoreo
- Alertar al **crear/editar** si:
  - Hay **solapamiento** en mismo ámbito/periodo/horario/días.
  - `paymentType=percentage` y **suma** de reglas aplicables para el mismo ámbito en `> 100%`.
  - Vigencia inválida (`validFrom > validTo`).
- Guardar `RuleAlert` y emitir **webhook** configurable (`POST`) con payload de conflicto. Añadir cola simple (p.ej. `bullmq`) para reintentos.

---

## Esquema de datos (Prisma)
```prisma
model CalculationRule {
  id               String   @id @default(cuid())
  code             String   @unique
  name             String
  description      String?
  participationType RuleParticipation
  specialtyId      String
  serviceId        String?
  doctorId         String?
  societyId        String?
  societyRut       String?
  societyName      String?
  branchId         String?  // NUEVO
  scopeType        RuleScopeType @default(individual)
  scopeGroupId     String?
  paymentType      RulePaymentType
  paymentValue     Decimal
  scheduleType     RuleScheduleType @default(all)
  applicableDays   String[] // ["monday", ...]
  baseRule         Json?    // DSL estructurada
  validFrom        DateTime
  validTo          DateTime
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  versions         RuleVersion[]
  alerts           RuleAlert[]
  scopeGroup       RuleScopeGroup? @relation(fields: [scopeGroupId], references: [id])
}

enum RuleParticipation { individual society mixed }
enum RulePaymentType { percentage fixed_amount }
enum RuleScheduleType { all regular irregular night }
enum RuleScopeType { individual group }

model RuleVersion {
  id        String   @id @default(cuid())
  ruleId    String
  snapshot  Json
  createdAt DateTime @default(now())
  createdBy String
  rule      CalculationRule @relation(fields: [ruleId], references: [id])
}

model RuleAlert {
  id        String   @id @default(cuid())
  ruleId    String
  type      String   // overlap|sum_gt_100|invalid_range
  message   String
  details   Json
  createdAt DateTime @default(now())
  rule      CalculationRule @relation(fields: [ruleId], references: [id])
}

model RuleScopeGroup {
  id        String   @id @default(cuid())
  name      String
  type      String   // doctor|service|branch|society
  members   Json     // array de IDs de entidades
  createdAt DateTime @default(now())
}
```

---

## Motor de reglas: DSL y validaciones
### DSL JSON (opcional, para `baseRule`)
```json
{
  "conditions": [
    { "field": "patient.age", "op": ">=", "value": 65 },
    { "field": "service.code", "op": "in", "value": ["ECO-123","RX-10"] },
    { "field": "branch.id", "op": "=", "value": "SCL01" }
  ],
  "adjustments": [
    { "when": {"weekday": ["saturday","sunday"]}, "paymentType": "percentage", "paymentValue": 40 },
    { "when": {"scheduleType": "night"}, "paymentType": "fixed_amount", "paymentValue": 60000 }
  ]
}
```
**Validaciones** (en API):
- `paymentType = percentage` → `0 ≤ paymentValue ≤ 100`.
- `validFrom ≤ validTo`.
- `participationType` compatible con presencia de `doctorId`/`societyId`.
- `applicableDays` ⊆ {monday..sunday}.
- Si `scopeType=group` → `scopeGroupId` obligatorio.

---

## Resolución de conflictos (algoritmo)
1. Filtrar por vigencia y `isActive=true`.
2. Filtrar por `specialtyId`, `serviceId` (o null = todas), `branchId`, `scheduleType` y `weekday`.
3. Considerar reglas con `scopeType=group` (expandir miembros y evaluar coincidencia).
4. Ordenar por **especificidad** (ver ranking arriba).
5. Si hay **empate**: escoger la **más reciente** (`updatedAt`), luego por `paymentType=percentage` preferir la **menor** para evitar sobrepago. Registrar `RuleAlert(overlap)`.
6. Si el conjunto aplicable produce suma de porcentajes `> 100` en un mismo ámbito temporal, bloquear creación/edición y devolver 409 con detalles.

---

## Endpoints de API (Next.js /app/api/*)
- `GET /api/calculation-rules` — lista + filtros (`search`, `participationType`, `specialtyId`, `branchId`, `status`).
- `POST /api/calculation-rules` — crea (valida + detección de conflictos). Versionar snapshot.
- `PUT /api/calculation-rules/:id` — actualiza (revalida + conflictos). Versionar snapshot.
- `DELETE /api/calculation-rules/:id` — borra suave o dura (decidir). Si suave, `isActive=false`.
- `POST /api/rules/simulate` — simulación + explicación.
- `GET /api/rules/:id/alerts` — alertas históricas.
- **`/api/rule-groups`** — CRUD para definir y administrar grupos (doctores, prestaciones, sucursales, sociedades).

**Contrato de error 409 (conflicto)**
```json
{
  "code": "RULE_CONFLICT",
  "conflicts": [
    {"ruleId":"...","reason":"overlap","fields":["doctorId","serviceId","branchId","validFrom..validTo"]}
  ]
}
```

---

## Integración con UI (Rules.tsx)
- Usar las rutas anteriores. Mapear `serviceId='all'` → `null`.
- Al crear/editar, si `409 RULE_CONFLICT`, mostrar **modal** con tabla de choques y botón **“Ver simulación”**.
- Añadir campo **Sucursal** (branch) y selector **Ámbito Individual vs Grupo**.
- Al elegir Grupo → mostrar buscador de grupos disponibles.
- Reemplazar el mock `pending: 8` por conteo real desde `/api/calculation-rules?status=pending`.
- En Step 3, añadir **“Probar simulación”** inline.

---

## IA asistida (opcional pero recomendado)
- Endpoint `POST /api/rules/explain` → devuelve explicación en lenguaje natural de la regla o del motivo de conflicto.
- Endpoint `POST /api/rules/suggest` → dado un conjunto de reglas, sugiere normalizaciones (p. ej., consolidar reglas iguales, detectar duplicados latentes, advertir sumas > 100%).
- Implementar con OpenAI y **desactivar por variable de entorno** si no hay API Key.

---

## Migración desde legado
- Crear script `scripts/legacy/import_oracle_rules.ts` que lea desde vistas/CSV exportados del paquete `PKG_REGLAS` (grupos de centros, médicos, prestaciones) y los mapee a `CalculationRule` y `RuleScopeGroup`.
- Mantener tabla de correspondencia `legacyId` → `rule.id`.

---

## Pruebas
- Unitarias: resolución de conflictos, validadores, cálculo.
- Integración: `POST/PUT` con casos de choque; `simulate` con diferentes combinaciones.
- Seeds: 10 reglas variadas para demo + pruebas.

---

## Entregables
1. Esquema Prisma + migraciones (`prisma migrate dev` / `prisma migrate deploy`).
2. Implementación API + pruebas (`vitest` o `jest`) + seeds.
3. Ajustes a `Rules.tsx` (modal de conflicto, simulador inline, sucursal, grupos, métricas reales).
4. Doc técnica (`/docs/rules/README.md`) con ejemplos.

---

# Instrucciones para el Agente (prompt operativo)
> **Rol**: Eres un ingeniero senior full‑stack. Vas a implementar el Módulo de Reglas Inteligente descrito arriba en este repositorio. Sigue los pasos y criterios de aceptación.

**Pasos**
1. Añade modelos Prisma según “Esquema de datos” y corre migraciones.
2. Implementa endpoints REST bajo `/api/` con validaciones y **detección de conflictos**.
3. Implementa `POST /api/rules/simulate` con selección por especificidad + explicación.
4. Implementa emisión de `RuleAlert` y webhook opcional (`RULES_ALERT_WEBHOOK_URL`).
5. Implementa CRUD de grupos (`/api/rule-groups`) y soporte en motor.
6. Actualiza `Rules.tsx` para manejar sucursal, grupos, errores 409 con modal de conflicto y “Probar simulación”. Quita mocks.
7. Cubre con pruebas (≥ 15 tests) y añade seeds.
8. Documenta en `/docs/rules/README.md` uso de API, ejemplos y política de prioridad.

**Criterios de aceptación**
- Crear/editar una regla que choque devuelve 409 con detalle y **no** persiste.
- El simulador retorna `selectedRuleId`, `calculatedPayment` y `explanation` coherentes.
- Auditoría: se guarda un `RuleVersion` en cada alta/edición.
- Alertas: se persisten en `RuleAlert` y, si hay webhook, se envían.
- UI muestra el conflicto, permite elegir sucursal/grupo, y simular.

**Convenciones**
- TypeScript estricto, zod en entrada.
- Commits pequeños y descriptivos (convencional: `feat:`, `fix:`, `test:`...).
- `.env.example` con `DATABASE_URL`, `RULES_ALERT_WEBHOOK_URL`, `OPENAI_API_KEY` (opcional).

**Si algo no existe** en el repo (p. ej., Prisma), créalo de forma estándar.

---

## Notas finales
- Mantener compatibilidad visual con el front actual.
- Preparar puntos de extensión para lógica hospital/clínica (p. ej., reglas por **sucursal** o **grupos**) desde el inicio.
- Priorizar seguridad y trazabilidad: todas las mutaciones deben auditarse.
