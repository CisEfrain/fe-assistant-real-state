# Guía de Guards y Facts - Frontend

## 📋 Índice
1. [Introducción](#introducción)
2. [Conceptos Clave](#conceptos-clave)
3. [Nuevos Campos en DTOs](#nuevos-campos-en-dtos)
4. [DSL de Guards](#dsl-de-guards)
5. [Completion Policy](#completion-policy)
6. [Ejemplos Prácticos](#ejemplos-prácticos)
7. [Validación Frontend](#validación-frontend)
8. [Debugging y Observabilidad](#debugging-y-observabilidad)
9. [FAQ](#faq)

---

## Introducción

El sistema de **Guards y Facts** permite crear filtros deterministas para las prioridades del agente, reduciendo tokens enviados al LLM y mejorando la precisión de las decisiones.

### ¿Qué son los Guards?
Los **guards** son condiciones que deben cumplirse para que una prioridad sea elegible. Se evalúan contra **facts** (hechos derivados del estado de la conversación).

### ¿Qué son los Facts?
Los **facts** son valores canónicos derivados automáticamente de `collectedData`:
- `operation_type`: `'RENT' | 'SELL' | null`
- `property_found`: `boolean`
- `has_contact`: `boolean`
- `has_search_params`: `boolean`

---

## Conceptos Clave

### Flujo del Sistema

```
Usuario → Mensaje
    ↓
1. Sistema deriva Facts desde collectedData
    ↓
2. Sistema pre-filtra Prioridades usando Guards
    ↓
3. Sistema filtra por triggers y dependencias
    ↓
4. LLM recibe solo prioridades elegibles (ordenadas por weight)
    ↓
5. Sistema valida decisión del LLM
    ↓
6. Ejecuta tarea o continúa conversación
```

### Beneficios
- ✅ **Reducción de tokens**: Solo prioridades elegibles van al LLM
- ✅ **Consistencia**: Reglas deterministas server-side
- ✅ **Debugging**: Metadata con rechazos y decisiones
- ✅ **Flexibilidad**: DSL simple pero potente

---

## Nuevos Campos en DTOs

### CreateAgentDto / UpdateAgentDto

```typescript
orchestration?: {
  priorities?: Array<{
    // ... campos existentes ...
    
    // NUEVOS CAMPOS
    guard?: GuardExpression;              // DSL para elegibilidad
    completionPolicy?: CompletionPolicy;  // Políticas por campo
  }>;
}
```

### Tipos TypeScript

```typescript
// Guard DSL
interface GuardExpression {
  all?: GuardExpression[];   // AND - todas deben cumplirse
  any?: GuardExpression[];   // OR - al menos una debe cumplirse
  not?: GuardExpression;     // NOT - negación
  eq?: [string, any];        // Igualdad: ["factKey", value]
  neq?: [string, any];       // Desigualdad: ["factKey", value]
  exists?: string;           // Existe y no es null: "factKey"
}

// Completion Policy
interface CompletionPolicy {
  [fieldName: string]: {
    allowedKinds: ('EXACT' | 'RANGE' | 'MULTI' | 'ANY' | 'DECLINED')[];
    required: boolean;
    defaultKind?: 'EXACT' | 'RANGE' | 'MULTI' | 'ANY';
  };
}
```

---

## DSL de Guards

### Operadores Disponibles

#### 1. `eq` - Igualdad
Verifica que un fact sea igual a un valor específico.

```json
{
  "eq": ["operation_type", "RENT"]
}
```
**Significado**: Solo elegible si `operation_type === 'RENT'`

#### 2. `neq` - Desigualdad
Verifica que un fact NO sea igual a un valor.

```json
{
  "neq": ["operation_type", null]
}
```
**Significado**: Solo elegible si `operation_type !== null`

#### 3. `exists` - Existencia
Verifica que un fact exista y no sea null/undefined.

```json
{
  "exists": "property_found"
}
```
**Significado**: Solo elegible si `property_found !== undefined && property_found !== null`

#### 4. `all` - AND Lógico
Todas las condiciones deben cumplirse.

```json
{
  "all": [
    { "eq": ["operation_type", "SELL"] },
    { "eq": ["property_found", true] }
  ]
}
```
**Significado**: Solo elegible si `operation_type === 'SELL' AND property_found === true`

#### 5. `any` - OR Lógico
Al menos una condición debe cumplirse.

```json
{
  "any": [
    { "eq": ["has_contact", true] },
    { "eq": ["has_search_params", true] }
  ]
}
```
**Significado**: Solo elegible si `has_contact === true OR has_search_params === true`

#### 6. `not` - Negación
Niega una condición.

```json
{
  "not": {
    "eq": ["property_found", true]
  }
}
```
**Significado**: Solo elegible si `property_found !== true`

### Composición de Guards

Los guards pueden anidarse para crear lógica compleja:

```json
{
  "all": [
    { "eq": ["operation_type", "RENT"] },
    {
      "any": [
        { "eq": ["has_contact", true] },
        { "eq": ["has_search_params", true] }
      ]
    },
    {
      "not": {
        "eq": ["property_found", true]
      }
    }
  ]
}
```
**Significado**: 
- `operation_type` debe ser RENT
- Y (tiene contacto O tiene parámetros de búsqueda)
- Y NO ha encontrado propiedad

---

## Completion Policy

Define políticas de validación para campos específicos de `collectedData`.

### Estructura

```typescript
{
  "presupuesto": {
    "allowedKinds": ["EXACT", "RANGE", "ANY"],
    "required": true,
    "defaultKind": "RANGE"
  },
  "tipo_propiedad": {
    "allowedKinds": ["EXACT", "MULTI"],
    "required": true,
    "defaultKind": "EXACT"
  }
}
```

### Tipos de Kind

| Kind | Descripción | Ejemplo |
|------|-------------|---------|
| `EXACT` | Valor exacto | `"Casa"` |
| `RANGE` | Rango numérico | `{ min: 100000, max: 200000 }` |
| `MULTI` | Múltiples valores | `["Casa", "Departamento"]` |
| `ANY` | Cualquier valor | Usuario no tiene preferencia |
| `DECLINED` | Usuario rechazó proporcionar | Usuario no quiere especificar |

### Campos

- **`allowedKinds`**: Tipos de respuesta permitidos para este campo
- **`required`**: Si el campo es obligatorio para completar la prioridad
- **`defaultKind`**: Tipo sugerido por defecto (opcional)

---

## Ejemplos Prácticos

### Ejemplo 1: Prioridad de Búsqueda (Solo para RENT)

```json
{
  "id": "search-properties",
  "name": "Búsqueda de Propiedades",
  "weight": 80,
  "enabled": true,
  "triggers": ["buscar", "encontrar", "mostrar propiedades"],
  "taskId": "search-task-123",
  
  "guard": {
    "all": [
      { "eq": ["operation_type", "RENT"] },
      { "eq": ["has_search_params", true] },
      { "neq": ["property_found", true] }
    ]
  },
  
  "completionPolicy": {
    "tipo_propiedad": {
      "allowedKinds": ["EXACT", "MULTI"],
      "required": true,
      "defaultKind": "EXACT"
    },
    "presupuesto": {
      "allowedKinds": ["RANGE", "EXACT"],
      "required": true,
      "defaultKind": "RANGE"
    },
    "estado": {
      "allowedKinds": ["EXACT"],
      "required": true
    }
  }
}
```

**Cuándo es elegible**:
- ✅ `operation_type` es RENT
- ✅ Tiene parámetros mínimos de búsqueda
- ✅ NO ha encontrado propiedad aún

### Ejemplo 2: Prioridad de Contacto (Cualquier operación)

```json
{
  "id": "collect-contact",
  "name": "Recolectar Información de Contacto",
  "weight": 90,
  "enabled": true,
  "triggers": ["contacto", "datos", "información"],
  "taskId": "contact-task-456",
  
  "guard": {
    "all": [
      { "exists": "operation_type" },
      { "eq": ["has_contact", false] }
    ]
  },
  
  "completionPolicy": {
    "nombre": {
      "allowedKinds": ["EXACT"],
      "required": true
    },
    "email": {
      "allowedKinds": ["EXACT"],
      "required": true
    },
    "telefono": {
      "allowedKinds": ["EXACT", "DECLINED"],
      "required": false
    }
  }
}
```

**Cuándo es elegible**:
- ✅ Ya se definió `operation_type`
- ✅ NO tiene información de contacto completa

### Ejemplo 3: Prioridad de Agendar Cita (Solo con contacto)

```json
{
  "id": "schedule-appointment",
  "name": "Agendar Cita",
  "weight": 100,
  "enabled": true,
  "triggers": ["agendar", "cita", "visita", "ver propiedad"],
  "taskId": "appointment-task-789",
  "dependsOn": ["collect-contact"],
  
  "guard": {
    "all": [
      { "eq": ["has_contact", true] },
      { "eq": ["property_found", true] }
    ]
  },
  
  "completionPolicy": {
    "fecha_preferida": {
      "allowedKinds": ["EXACT", "RANGE", "ANY"],
      "required": false,
      "defaultKind": "ANY"
    },
    "tipo_cita": {
      "allowedKinds": ["EXACT"],
      "required": true,
      "defaultKind": "EXACT"
    }
  }
}
```

**Cuándo es elegible**:
- ✅ Tiene información de contacto completa
- ✅ Ya encontró una propiedad
- ✅ Completó la prioridad `collect-contact` (dependencia)

### Ejemplo 4: Prioridad Sin Guards (Siempre Elegible)

```json
{
  "id": "onboarding",
  "name": "Onboarding Inicial",
  "weight": 50,
  "enabled": true,
  "triggers": ["hola", "ayuda", "inicio"],
  "taskId": "onboarding-task-000"
  
  // Sin guard = siempre elegible
}
```

---

## Validación Frontend

### Validación de Guards

Antes de enviar al backend, valida la estructura del guard:

```typescript
function validateGuard(guard: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!guard) return { valid: true, errors: [] }; // Sin guard es válido
  
  if (typeof guard !== 'object') {
    errors.push('Guard debe ser un objeto');
    return { valid: false, errors };
  }
  
  const validOperators = ['all', 'any', 'not', 'eq', 'neq', 'exists'];
  const foundOperators = validOperators.filter(op => guard[op] !== undefined);
  
  if (foundOperators.length === 0) {
    errors.push('Guard debe tener al menos un operador válido');
  }
  
  if (foundOperators.length > 1) {
    errors.push(`Solo un operador por expresión. Encontrados: ${foundOperators.join(', ')}`);
  }
  
  // Validar estructura específica
  if (guard.eq && (!Array.isArray(guard.eq) || guard.eq.length !== 2)) {
    errors.push('Operador "eq" debe ser [key, value]');
  }
  
  if (guard.neq && (!Array.isArray(guard.neq) || guard.neq.length !== 2)) {
    errors.push('Operador "neq" debe ser [key, value]');
  }
  
  if (guard.exists && typeof guard.exists !== 'string') {
    errors.push('Operador "exists" debe ser un string');
  }
  
  if (guard.all && !Array.isArray(guard.all)) {
    errors.push('Operador "all" debe ser un array');
  }
  
  if (guard.any && !Array.isArray(guard.any)) {
    errors.push('Operador "any" debe ser un array');
  }
  
  // Validar recursivamente
  if (guard.all) {
    guard.all.forEach((sub: any, i: number) => {
      const subValidation = validateGuard(sub);
      errors.push(...subValidation.errors.map(e => `all[${i}]: ${e}`));
    });
  }
  
  if (guard.any) {
    guard.any.forEach((sub: any, i: number) => {
      const subValidation = validateGuard(sub);
      errors.push(...subValidation.errors.map(e => `any[${i}]: ${e}`));
    });
  }
  
  if (guard.not) {
    const subValidation = validateGuard(guard.not);
    errors.push(...subValidation.errors.map(e => `not: ${e}`));
  }
  
  return { valid: errors.length === 0, errors };
}
```

### Validación de Completion Policy

```typescript
function validateCompletionPolicy(policy: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!policy) return { valid: true, errors: [] };
  
  if (typeof policy !== 'object') {
    errors.push('CompletionPolicy debe ser un objeto');
    return { valid: false, errors };
  }
  
  const validKinds = ['EXACT', 'RANGE', 'MULTI', 'ANY', 'DECLINED'];
  
  for (const [fieldName, config] of Object.entries(policy)) {
    if (!config || typeof config !== 'object') {
      errors.push(`Campo "${fieldName}": configuración debe ser un objeto`);
      continue;
    }
    
    const { allowedKinds, required, defaultKind } = config as any;
    
    if (!Array.isArray(allowedKinds) || allowedKinds.length === 0) {
      errors.push(`Campo "${fieldName}": allowedKinds debe ser un array no vacío`);
    } else {
      const invalidKinds = allowedKinds.filter(k => !validKinds.includes(k));
      if (invalidKinds.length > 0) {
        errors.push(`Campo "${fieldName}": kinds inválidos: ${invalidKinds.join(', ')}`);
      }
    }
    
    if (typeof required !== 'boolean') {
      errors.push(`Campo "${fieldName}": required debe ser boolean`);
    }
    
    if (defaultKind && !validKinds.includes(defaultKind)) {
      errors.push(`Campo "${fieldName}": defaultKind inválido: ${defaultKind}`);
    }
    
    if (defaultKind && !allowedKinds.includes(defaultKind)) {
      errors.push(`Campo "${fieldName}": defaultKind debe estar en allowedKinds`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}
```

---

## Debugging y Observabilidad

### Metadata en ConversationState

El sistema persiste información de debugging en `ConversationState.metadata`:

```typescript
interface ConversationStateMetadata {
  // Facts derivados
  facts?: {
    operation_type: 'RENT' | 'SELL' | null;
    property_found: boolean;
    has_contact: boolean;
    has_search_params: boolean;
  };
  
  // Guards rechazados (para debugging)
  guardsRejected?: Array<{
    priorityId: string;
    priorityName: string;
    reason: string;
    failedCondition: string;
    timestamp: Date;
  }>;
  
  // Última decisión del cerebro
  lastDecision?: {
    selectedPriorityId: string | null;
    effectivePriorityId: string | null;
    strategy: 'execute_task' | 'continue_conversation';
    missingData: string[];
    confidence: number;
    timestamp: Date;
  };
}
```

### Endpoint de Debugging (Sugerido)

Puedes crear un endpoint para visualizar el estado de guards:

```
GET /api/agent-ai/sessions/{sessionId}/debug
```

**Response**:
```json
{
  "sessionId": "sess-123",
  "facts": {
    "operation_type": "RENT",
    "property_found": false,
    "has_contact": true,
    "has_search_params": true
  },
  "guardsRejected": [
    {
      "priorityId": "schedule-appointment",
      "priorityName": "Agendar Cita",
      "reason": "Guard condition failed",
      "failedCondition": "Expected property_found=true, got false",
      "timestamp": "2024-11-11T14:30:00Z"
    }
  ],
  "lastDecision": {
    "selectedPriorityId": "search-properties",
    "effectivePriorityId": "search-properties",
    "strategy": "execute_task",
    "missingData": [],
    "confidence": 0.95,
    "timestamp": "2024-11-11T14:30:05Z"
  },
  "eligiblePriorities": ["search-properties", "collect-contact"]
}
```

---

## FAQ

### ¿Qué pasa si no defino un guard?
Si una prioridad no tiene `guard`, se considera **siempre elegible** (fail-open). Solo se filtran por `enabled`, `executeOnce`, y `dependsOn`.

### ¿Puedo usar guards con prioridades que tienen dependsOn?
Sí. El sistema evalúa en este orden:
1. `enabled: true`
2. `guard` (si existe)
3. `dependsOn` (lógica OR)
4. `triggers` (o fallback discovery)

### ¿Qué facts están disponibles?
Actualmente:
- `operation_type`: `'RENT' | 'SELL' | null`
- `property_found`: `boolean`
- `has_contact`: `boolean`
- `has_search_params`: `boolean`

**Nota**: El sistema es extensible. Puedes solicitar nuevos facts al equipo backend.

### ¿Cómo pruebo un guard antes de guardarlo?
El backend valida guards en creación/actualización. Si hay errores, recibirás un `400 Bad Request` con detalles.

Ejemplo de error:
```json
{
  "error": "Validation failed",
  "details": {
    "orchestration.priorities[0].guard": [
      "root.eq: Must be [key, value] array"
    ]
  }
}
```

### ¿Cómo interactúan guards con triggers?
Los guards se evalúan **primero** (filtro determinista por facts), luego el sistema aplica los `triggers` existentes para filtrar aún más. El flujo es:
1. Guards (facts) → Prioridades elegibles
2. Triggers (string matching) → Prioridades con trigger match
3. Weight (ordenamiento) → LLM decide entre las ordenadas

### ¿Qué pasa si todas las prioridades son rechazadas por guards?
El LLM recibirá un array vacío de prioridades y usará el `fallbackBehavior` del agente.

### ¿Los guards afectan el performance?
No significativamente. La evaluación de guards es muy rápida (< 1ms por prioridad). El beneficio de reducir tokens al LLM compensa ampliamente.

### ¿Puedo usar guards para lógica de negocio compleja?
Los guards están diseñados para **filtros simples basados en facts**. Para lógica compleja, usa `businessRules` o crea tareas específicas.

---

## Recursos Adicionales

- **Plan de Implementación**: `.windsurf/plans/guards-and-facts-implementation-plan.md`
- **Código de Servicios**: `src/agent-ai/application/services/`
  - `fact-reducer.service.ts`
  - `guard-evaluator.service.ts`
  - `priority-filter.service.ts`
  - `decision-validator.service.ts`

---

## Contacto

Para dudas o solicitudes de nuevos facts, contacta al equipo de backend.

**Última actualización**: 11 de noviembre, 2024
