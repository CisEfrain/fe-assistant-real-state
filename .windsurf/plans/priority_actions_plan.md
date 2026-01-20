# Plan Técnico: Implementación de Acciones de Prioridad

## 📋 Información del Plan

- **Ticket/Historia:** Sistema de Acciones de Prioridad
- **Fecha de Creación:** 2026-01-09
- **Objetivo:** Implementar configuración de acciones automáticas dentro de las prioridades del agente
- **Complejidad:** Alta
- **Estimación:** 3-4 días de desarrollo

---

## 🎯 Objetivo del Desarrollo

Permitir que los agentes ejecuten **acciones automáticas** durante la conversación cuando detectan ciertos eventos, sin intervención manual. El agente decide cuándo ejecutarlas según el contexto y las instrucciones configuradas.

### Casos de Uso Principales

1. **Marcar Hitos:** Registrar eventos importantes (ej: "enlace compartido", "CTA enviado")
2. **Ejecutar Tareas:** Disparar funciones configuradas del agente
3. **Actualizar Estado:** Modificar datos de la conversación dinámicamente
4. **Acciones Personalizadas:** Casos especiales o futuros

---

## 📊 Análisis de Requerimientos

### Estructura de Datos de una Acción

```typescript
interface PriorityAction {
  type: 'mark_milestone' | 'execute_task' | 'update_state' | 'custom';
  name: string; // snake_case, único dentro de la prioridad
  description?: string; // Máx. 500 caracteres
  executionPrompt: string; // Instrucciones de cuándo ejecutar (máx. 2000 caracteres)
  params?: Record<string, any>; // Parámetros específicos por tipo
}
```

### Parámetros por Tipo de Acción

#### 1. Mark Milestone
```typescript
{
  "type": "mark_milestone",
  "name": "enlace_compartido",
  "params": {
    "value": true // o cualquier valor a guardar
  }
}
// Se guarda como: milestone_{nombre} en collectedData
```

#### 2. Execute Task
```typescript
{
  "type": "execute_task",
  "name": "send_email_task", // Debe coincidir con task.id existente
  "params": {} // Generalmente vacío
}
```

#### 3. Update State
```typescript
{
  "type": "update_state",
  "name": "actualizar_prioridad",
  "params": {
    "collectedData": {
      "nueva_prioridad": "alta",
      "ultima_accion": "contacto_establecido"
    },
    "metadata": {
      "timestamp": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### 4. Custom
```typescript
{
  "type": "custom",
  "name": "accion_personalizada",
  "params": {
    "customField": "customValue",
    "otroCampo": 123
  }
}
```

### Validaciones Requeridas

| Validación | Regla | Mensaje de Error |
|------------|-------|------------------|
| Nombre único | No duplicados en la misma prioridad | "Ya existe una acción con este nombre" |
| Formato nombre | Solo snake_case (a-z, 0-9, _) | "Usa solo minúsculas, números y guiones bajos" |
| Tipo requerido | Debe seleccionar un tipo | "Selecciona un tipo de acción" |
| Nombre requerido | No puede estar vacío | "El nombre es requerido" |
| Task ID válido | Si type=execute_task, name debe existir en tasks | "La tarea no existe" |
| JSON válido | params debe ser JSON válido | "El JSON de parámetros es inválido" |
| Longitud descripción | Máx. 500 caracteres | "Máximo 500 caracteres" |
| Longitud prompt | Máx. 2000 caracteres | "Máximo 2000 caracteres" |

---

## 🏗️ Arquitectura de la Solución

### 1. Tipos TypeScript

**Ubicación:** `src/types/agents.ts`

```typescript
// Action types
export type PriorityActionType = 
  | 'mark_milestone' 
  | 'execute_task' 
  | 'update_state' 
  | 'custom';

// Base action interface
export interface PriorityAction {
  type: PriorityActionType;
  name: string;
  description?: string;
  executionPrompt: string;
  params?: Record<string, any>;
}

// Specific param types for better type safety
export interface MarkMilestoneParams {
  value: any;
}

export interface ExecuteTaskParams {
  // Generalmente vacío, pero puede tener overrides
  [key: string]: any;
}

export interface UpdateStateParams {
  collectedData?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface CustomActionParams {
  [key: string]: any;
}

// Extended Priority interface
export interface Priority {
  id: string;
  name: string;
  description: string;
  weight: number;
  triggers: string[];
  requiredData: string[];
  dependsOn: string[];
  completionCriteria: string;
  taskId?: string;
  enabled: boolean;
  actions?: PriorityAction[]; // Nueva propiedad
}
```

### 2. Componentes de UI

#### Estructura de Componentes

```
src/components/agents/priorities/
├── PriorityEditor.tsx           # Editor principal de prioridad (existente, modificar)
├── PriorityActionsSection.tsx   # Sección de acciones (NUEVO)
├── ActionEditor.tsx             # Editor de acción individual (NUEVO)
├── ActionTypeSelector.tsx       # Selector de tipo de acción (NUEVO)
├── ActionParamsEditor.tsx       # Editor de parámetros por tipo (NUEVO)
└── ActionTemplateSelector.tsx   # Selector de templates predefinidos (NUEVO)
```

#### 2.1 PriorityActionsSection.tsx (NUEVO)

**Responsabilidad:** Gestionar la lista de acciones de una prioridad

**Props:**
```typescript
interface PriorityActionsSectionProps {
  priorityId: string;
  actions: PriorityAction[];
  availableTasks: Task[]; // Para validar execute_task
  onActionsChange: (actions: PriorityAction[]) => void;
}
```

**Funcionalidades:**
- Listar todas las acciones configuradas
- Botón "Agregar Acción"
- Editar/Eliminar acciones individuales
- Validación de nombres únicos
- Drag & drop para reordenar (opcional)

**UI Layout:**
```
┌─ Acciones de Prioridad ─────────────────────────────┐
│                                                      │
│ Las acciones se ejecutan automáticamente cuando     │
│ el agente detecta los eventos configurados.         │
│                                                      │
│ [+ Agregar Acción]                                  │
│                                                      │
│ ┌─ Acción 1: enlace_compartido ─────────────────┐   │
│ │ Tipo: Marcar Hito                             │   │
│ │ Descripción: Marca cuando se compartió...     │   │
│ │                                    [✏️] [🗑️]  │   │
│ └───────────────────────────────────────────────┘   │
│                                                      │
│ ┌─ Acción 2: cta_enviado ───────────────────────┐   │
│ │ Tipo: Marcar Hito                             │   │
│ │ Descripción: Marca cuando se envió un CTA     │   │
│ │                                    [✏️] [🗑️]  │   │
│ └───────────────────────────────────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

#### 2.2 ActionEditor.tsx (NUEVO)

**Responsabilidad:** Editar una acción individual (modal o panel lateral)

**Props:**
```typescript
interface ActionEditorProps {
  action?: PriorityAction; // undefined para crear nueva
  existingActionNames: string[]; // Para validar unicidad
  availableTasks: Task[];
  onSave: (action: PriorityAction) => void;
  onCancel: () => void;
}
```

**Campos del Formulario:**

1. **Tipo de Acción** (Requerido)
   - Selector dropdown con 4 opciones
   - Descripción inline de cada tipo
   - Cambia el formulario dinámicamente

2. **Nombre de la Acción** (Requerido)
   - Input text con validación en tiempo real
   - Regex: `^[a-z0-9_]+$`
   - Validación de unicidad
   - Sugerencias automáticas basadas en tipo

3. **Descripción** (Opcional)
   - Textarea con contador de caracteres (máx. 500)
   - Placeholder con ejemplos

4. **Instrucciones de Ejecución** (Recomendado)
   - Textarea grande con contador (máx. 2000)
   - Editor con syntax highlighting para templates
   - Botón "Ver Templates Disponibles"
   - Ejemplos inline según tipo de acción

5. **Parámetros** (Opcional/Condicional)
   - Editor JSON con validación
   - Formulario estructurado según tipo (alternativa)
   - Botón "Ver Ejemplo"

**UI Layout:**
```
┌─ Configurar Acción ─────────────────────────────────┐
│                                                      │
│ Tipo de Acción *                                    │
│ [Marcar Hito ▼]                                     │
│ ℹ️ Registra un evento en el historial              │
│                                                      │
│ Nombre de la Acción *                               │
│ [enlace_compartido_____________________]            │
│ ✓ Nombre válido y único                             │
│                                                      │
│ Descripción                                         │
│ [Marca cuando el agente ha compartido un enlace...] │
│ 45/500 caracteres                                   │
│                                                      │
│ Instrucciones de Ejecución                          │
│ [Ejecuta esta acción cuando hayas compartido...]    │
│ 150/2000 caracteres                                 │
│ [📝 Ver Templates] [💡 Ver Ejemplos]               │
│                                                      │
│ Parámetros (JSON)                                   │
│ {                                                    │
│   "value": true                                     │
│ }                                                    │
│ ✓ JSON válido                                       │
│                                                      │
│                              [Cancelar] [Guardar]   │
└──────────────────────────────────────────────────────┘
```

#### 2.3 ActionTypeSelector.tsx (NUEVO)

**Responsabilidad:** Selector visual de tipo de acción con descripciones

**Props:**
```typescript
interface ActionTypeSelectorProps {
  selectedType: PriorityActionType | null;
  onTypeSelect: (type: PriorityActionType) => void;
}
```

**UI Layout (Cards):**
```
┌─ Selecciona el Tipo de Acción ──────────────────────┐
│                                                      │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│ │ 📍 Marcar   │ │ ⚡ Ejecutar │ │ 🔄 Actualizar│   │
│ │    Hito     │ │    Tarea    │ │    Estado    │   │
│ │             │ │             │ │              │   │
│ │ Registra un │ │ Ejecuta una │ │ Actualiza    │   │
│ │ evento      │ │ tarea       │ │ datos        │   │
│ └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                      │
│ ┌─────────────┐                                     │
│ │ ⭐ Persona- │                                     │
│ │    lizada   │                                     │
│ │             │                                     │
│ │ Para casos  │                                     │
│ │ especiales  │                                     │
│ └─────────────┘                                     │
└──────────────────────────────────────────────────────┘
```

#### 2.4 ActionParamsEditor.tsx (NUEVO)

**Responsabilidad:** Editor de parámetros específico por tipo de acción

**Props:**
```typescript
interface ActionParamsEditorProps {
  actionType: PriorityActionType;
  params: Record<string, any>;
  availableTasks?: Task[]; // Para execute_task
  onChange: (params: Record<string, any>) => void;
}
```

**Modos de Edición:**

1. **Mark Milestone:**
   - Campo "Valor" con tipo dinámico (boolean, string, number)
   - Toggle para tipo de valor
   - Preview: `milestone_{name}: {value}`

2. **Execute Task:**
   - Selector de tarea existente (autocomplete)
   - Validación de que la tarea existe
   - Campos opcionales para overrides

3. **Update State:**
   - Editor estructurado con dos secciones:
     - `collectedData`: Key-value pairs
     - `metadata`: Key-value pairs
   - Botones para agregar/quitar campos

4. **Custom:**
   - Editor JSON libre con validación
   - Ejemplos y documentación

#### 2.5 ActionTemplateSelector.tsx (NUEVO)

**Responsabilidad:** Selector de templates predefinidos para instrucciones

**Props:**
```typescript
interface ActionTemplateSelectorProps {
  actionType: PriorityActionType;
  onTemplateSelect: (template: string) => void;
}
```

**Templates Predefinidos:**

```typescript
const ACTION_TEMPLATES = {
  mark_milestone: {
    enlace_compartido: `Ejecuta esta acción cuando hayas compartido un enlace, URL o enlace de WhatsApp con el usuario en tu respuesta.

Ejemplos de situaciones donde debes ejecutarla:
- Cuando compartes un enlace de una propiedad: "Aquí está el enlace: https://..."
- Cuando compartes un enlace de WhatsApp: "Puedes contactarnos en: https://wa.me/..."
- Cuando compartes cualquier URL relevante para el usuario

NO la ejecutes si solo mencionas un enlace sin compartirlo explícitamente.`,
    
    cta_enviado: `Ejecuta esta acción cuando hayas hecho una invitación explícita a una acción.

Ejemplos:
- "¿Quieres agendar una cita?"
- "¿Te gustaría que te contacte un asesor?"
- "¿Quieres ver más propiedades?"
- "¿Deseas recibir más información?"

NO la ejecutes si solo mencionas la posibilidad sin hacer la invitación directa.`,
    
    informacion_capturada: `Ejecuta esta acción cuando hayas recopilado información importante del usuario.

Ejemplos:
- Datos de contacto (nombre, email, teléfono)
- Preferencias de búsqueda (ubicación, presupuesto, tipo)
- Información de seguimiento

Ejecuta cuando la información esté confirmada y guardada.`
  },
  
  execute_task: {
    enviar_email: `Ejecuta esta acción cuando el usuario solicite explícitamente recibir información por email.

Ejemplos:
- "Envíame la información por correo"
- "Quiero recibir el catálogo por email"
- "Mándame los detalles"

Asegúrate de tener el email del usuario antes de ejecutar.`,
    
    crear_lead: `Ejecuta esta acción cuando hayas recopilado suficiente información para crear un lead calificado.

Requisitos mínimos:
- Nombre del usuario
- Método de contacto (email o teléfono)
- Intención clara (compra/renta)

Ejecuta solo cuando la información esté completa.`
  },
  
  update_state: {
    cambiar_prioridad: `Ejecuta esta acción cuando el contexto de la conversación cambie significativamente.

Ejemplos:
- Usuario pasa de búsqueda general a propiedad específica
- Cambio de intención (renta → compra)
- Escalamiento de prioridad (consulta → reclamo)

Actualiza el estado para reflejar el nuevo contexto.`
  }
};
```

### 3. Integración en PriorityEditor

**Archivo:** `src/components/agents/priorities/PriorityEditor.tsx` (MODIFICAR)

**Cambios Necesarios:**

1. **Agregar sección de acciones** después de "Criterios de Finalización"
2. **Gestionar estado local** de acciones
3. **Validaciones** antes de guardar
4. **Sincronización** con el store

```typescript
// Estado local adicional
const [actions, setActions] = useState<PriorityAction[]>(
  selectedPriority?.actions || []
);

// Handler para cambios en acciones
const handleActionsChange = (newActions: PriorityAction[]) => {
  setActions(newActions);
  // Validar y actualizar prioridad
};

// Validación antes de guardar
const validateActions = (): boolean => {
  // Validar nombres únicos
  const names = actions.map(a => a.name);
  const uniqueNames = new Set(names);
  if (names.length !== uniqueNames.size) {
    showError("Hay acciones con nombres duplicados");
    return false;
  }
  
  // Validar formato de nombres
  const nameRegex = /^[a-z0-9_]+$/;
  for (const action of actions) {
    if (!nameRegex.test(action.name)) {
      showError(`Nombre inválido: ${action.name}`);
      return false;
    }
  }
  
  // Validar execute_task
  for (const action of actions) {
    if (action.type === 'execute_task') {
      const taskExists = availableTasks.some(t => t.id === action.name);
      if (!taskExists) {
        showError(`La tarea ${action.name} no existe`);
        return false;
      }
    }
  }
  
  return true;
};
```

### 4. Store de Agentes

**Archivo:** `src/stores/useAgentStore.ts` (MODIFICAR)

**Cambios Necesarios:**

1. **Actualizar tipo Priority** con campo `actions`
2. **Métodos para gestionar acciones** de prioridades
3. **Validaciones** en métodos de actualización

```typescript
// Nuevo método para actualizar acciones de una prioridad
updatePriorityActions: (
  agentId: string,
  priorityId: string,
  actions: PriorityAction[]
) => {
  set((state) => {
    const agent = state.agents.find(a => a.id === agentId);
    if (!agent) return state;
    
    const priority = agent.orchestration.priorities.find(p => p.id === priorityId);
    if (!priority) return state;
    
    priority.actions = actions;
    
    return {
      agents: [...state.agents],
      selectedAgent: state.selectedAgent?.id === agentId 
        ? { ...agent } 
        : state.selectedAgent
    };
  });
  
  // Sincronizar con backend
  get().syncAgentToBackend(agentId);
},

// Método para agregar una acción
addPriorityAction: (
  agentId: string,
  priorityId: string,
  action: PriorityAction
) => {
  set((state) => {
    const agent = state.agents.find(a => a.id === agentId);
    if (!agent) return state;
    
    const priority = agent.orchestration.priorities.find(p => p.id === priorityId);
    if (!priority) return state;
    
    if (!priority.actions) {
      priority.actions = [];
    }
    
    // Validar nombre único
    if (priority.actions.some(a => a.name === action.name)) {
      throw new Error('Ya existe una acción con este nombre');
    }
    
    priority.actions.push(action);
    
    return {
      agents: [...state.agents],
      selectedAgent: state.selectedAgent?.id === agentId 
        ? { ...agent } 
        : state.selectedAgent
    };
  });
  
  get().syncAgentToBackend(agentId);
},

// Método para actualizar una acción
updatePriorityAction: (
  agentId: string,
  priorityId: string,
  actionName: string,
  updates: Partial<PriorityAction>
) => {
  set((state) => {
    const agent = state.agents.find(a => a.id === agentId);
    if (!agent) return state;
    
    const priority = agent.orchestration.priorities.find(p => p.id === priorityId);
    if (!priority || !priority.actions) return state;
    
    const actionIndex = priority.actions.findIndex(a => a.name === actionName);
    if (actionIndex === -1) return state;
    
    priority.actions[actionIndex] = {
      ...priority.actions[actionIndex],
      ...updates
    };
    
    return {
      agents: [...state.agents],
      selectedAgent: state.selectedAgent?.id === agentId 
        ? { ...agent } 
        : state.selectedAgent
    };
  });
  
  get().syncAgentToBackend(agentId);
},

// Método para eliminar una acción
removePriorityAction: (
  agentId: string,
  priorityId: string,
  actionName: string
) => {
  set((state) => {
    const agent = state.agents.find(a => a.id === agentId);
    if (!agent) return state;
    
    const priority = agent.orchestration.priorities.find(p => p.id === priorityId);
    if (!priority || !priority.actions) return state;
    
    priority.actions = priority.actions.filter(a => a.name !== actionName);
    
    return {
      agents: [...state.agents],
      selectedAgent: state.selectedAgent?.id === agentId 
        ? { ...agent } 
        : state.selectedAgent
    };
  });
  
  get().syncAgentToBackend(agentId);
}
```

---

## 📝 Plan de Implementación

### Fase 1: Tipos y Estructura Base ✅
**Duración:** 0.5 días

1. **Agregar tipos TypeScript** en `src/types/agents.ts`
   - Definir `PriorityActionType`
   - Definir `PriorityAction` interface
   - Definir interfaces de parámetros específicos
   - Extender `Priority` interface con campo `actions`

2. **Actualizar Store** en `src/stores/useAgentStore.ts`
   - Agregar métodos CRUD para acciones
   - Implementar validaciones
   - Agregar sincronización con backend

3. **Testing de tipos**
   - Verificar compatibilidad con estructura existente
   - Validar tipos con datos mock

### Fase 2: Componentes Base de UI ✅
**Duración:** 1 día

1. **Crear PriorityActionsSection.tsx**
   - Layout de lista de acciones
   - Botón agregar acción
   - Cards de acciones con edit/delete
   - Integración con PriorityEditor

2. **Crear ActionTypeSelector.tsx**
   - Cards visuales de tipos
   - Descripciones inline
   - Selección interactiva

3. **Crear estructura de ActionEditor.tsx**
   - Modal/Panel lateral
   - Campos básicos (tipo, nombre, descripción)
   - Validaciones en tiempo real
   - Handlers de save/cancel

### Fase 3: Editor de Acciones Completo ✅
**Duración:** 1 día

1. **Completar ActionEditor.tsx**
   - Campo de instrucciones de ejecución
   - Contador de caracteres
   - Validaciones completas
   - Integración con templates

2. **Crear ActionParamsEditor.tsx**
   - Editor específico por tipo
   - Modo Mark Milestone
   - Modo Execute Task
   - Modo Update State
   - Modo Custom (JSON libre)

3. **Crear ActionTemplateSelector.tsx**
   - Modal con templates predefinidos
   - Categorización por tipo de acción
   - Inserción de template en editor
   - Ejemplos inline

### Fase 4: Validaciones y UX ✅
**Duración:** 0.5 días

1. **Implementar validaciones robustas**
   - Validación de nombre único
   - Validación de formato snake_case
   - Validación de task ID para execute_task
   - Validación de JSON en params
   - Validación de longitud de campos

2. **Mejorar UX**
   - Mensajes de error claros
   - Tooltips explicativos
   - Feedback visual de validación
   - Loading states
   - Confirmación antes de eliminar

3. **Agregar sugerencias automáticas**
   - Sugerencias de nombres según tipo
   - Autocompletado de task IDs
   - Ejemplos contextuales

### Fase 5: Integración y Testing ✅
**Duración:** 1 día

1. **Integrar en PriorityEditor**
   - Agregar sección de acciones
   - Gestionar estado local
   - Sincronizar con store
   - Validar antes de guardar

2. **Testing funcional**
   - Crear acciones de cada tipo
   - Editar acciones existentes
   - Eliminar acciones
   - Validar persistencia
   - Probar con datos reales

3. **Testing de validaciones**
   - Nombres duplicados
   - Formato inválido
   - Task ID inexistente
   - JSON inválido
   - Límites de caracteres

4. **Testing de integración**
   - Crear prioridad con acciones
   - Duplicar prioridad con acciones
   - Exportar/Importar configuración
   - Sincronización con backend

### Fase 6: Documentación y Refinamiento ✅
**Duración:** 0.5 días

1. **Actualizar documentación**
   - Actualizar AGENT-README.md
   - Agregar ejemplos de uso
   - Documentar tipos y validaciones
   - Crear guía de usuario

2. **Refinamiento de UI**
   - Ajustes de diseño
   - Mejoras de accesibilidad
   - Optimizaciones de performance
   - Pulido general

3. **Code review y cleanup**
   - Revisar código
   - Eliminar código muerto
   - Optimizar imports
   - Agregar comentarios

---

## 🎨 Diseño de UI/UX

### Principios de Diseño

1. **Claridad:** Cada tipo de acción debe ser fácil de entender
2. **Guía:** Proporcionar ejemplos y templates en cada paso
3. **Validación:** Feedback inmediato sobre errores
4. **Eficiencia:** Flujo rápido para usuarios experimentados
5. **Flexibilidad:** Modo simple y modo avanzado (JSON)

### Flujo de Usuario

```
1. Usuario abre PriorityEditor
   ↓
2. Navega a sección "Acciones de Prioridad"
   ↓
3. Click en "Agregar Acción"
   ↓
4. Selecciona tipo de acción (cards visuales)
   ↓
5. Completa formulario:
   - Nombre (con sugerencias)
   - Descripción (opcional)
   - Instrucciones (con templates)
   - Parámetros (editor específico)
   ↓
6. Validación en tiempo real
   ↓
7. Click en "Guardar"
   ↓
8. Acción aparece en la lista
   ↓
9. Puede editar/eliminar posteriormente
```

### Ejemplos de Interacción

#### Crear Acción "Enlace Compartido"

```
Usuario: Click "Agregar Acción"
Sistema: Muestra modal con selector de tipo

Usuario: Selecciona "Marcar Hito"
Sistema: Muestra formulario con campos

Usuario: Escribe nombre "enlace_compartido"
Sistema: ✓ Nombre válido y único

Usuario: Click "Ver Templates"
Sistema: Muestra template predefinido

Usuario: Selecciona template "enlace_compartido"
Sistema: Rellena campo de instrucciones

Usuario: Configura params: { "value": true }
Sistema: ✓ JSON válido

Usuario: Click "Guardar"
Sistema: Acción creada y agregada a la lista
```

---

## ⚠️ Consideraciones Técnicas

### Performance

1. **Validación Debounced:** Validar nombres con debounce de 300ms
2. **Lazy Loading:** Cargar ActionEditor solo cuando se necesita
3. **Memoización:** Usar React.memo para componentes pesados
4. **Virtual Scrolling:** Si hay muchas acciones (>20)

### Compatibilidad

1. **Backward Compatibility:** Prioridades sin `actions` deben funcionar
2. **Migration:** Agregar `actions: []` por defecto en prioridades existentes
3. **API Compatibility:** Verificar que el backend soporte el campo `actions`

### Seguridad

1. **Sanitización:** Sanitizar inputs antes de guardar
2. **Validación Server-Side:** Backend debe validar estructura
3. **XSS Prevention:** Escapar contenido en instrucciones

### Accesibilidad

1. **Keyboard Navigation:** Todos los controles accesibles por teclado
2. **Screen Readers:** Labels y ARIA attributes apropiados
3. **Focus Management:** Focus correcto en modales y formularios
4. **Color Contrast:** Cumplir WCAG AA

---

## 🧪 Estrategia de Testing

### Unit Tests

```typescript
// Validación de nombres
describe('Action Name Validation', () => {
  it('should accept valid snake_case names', () => {
    expect(validateActionName('enlace_compartido')).toBe(true);
    expect(validateActionName('cta_enviado_2')).toBe(true);
  });
  
  it('should reject invalid names', () => {
    expect(validateActionName('Enlace Compartido')).toBe(false);
    expect(validateActionName('enlace-compartido')).toBe(false);
    expect(validateActionName('enlace.compartido')).toBe(false);
  });
});

// Validación de unicidad
describe('Action Uniqueness', () => {
  it('should detect duplicate names', () => {
    const actions = [
      { name: 'action1', type: 'mark_milestone' },
      { name: 'action2', type: 'mark_milestone' }
    ];
    expect(isActionNameUnique('action1', actions)).toBe(false);
    expect(isActionNameUnique('action3', actions)).toBe(true);
  });
});

// Validación de task ID
describe('Execute Task Validation', () => {
  it('should validate task existence', () => {
    const tasks = [{ id: 'task1' }, { id: 'task2' }];
    expect(validateTaskId('task1', tasks)).toBe(true);
    expect(validateTaskId('task3', tasks)).toBe(false);
  });
});
```

### Integration Tests

```typescript
describe('Priority Actions Integration', () => {
  it('should create priority with actions', () => {
    // Test crear prioridad con acciones
  });
  
  it('should update priority actions', () => {
    // Test actualizar acciones
  });
  
  it('should delete action from priority', () => {
    // Test eliminar acción
  });
  
  it('should persist actions to backend', () => {
    // Test sincronización con API
  });
});
```

### E2E Tests (Manual)

1. **Flujo completo de creación**
   - Crear prioridad nueva
   - Agregar 3 acciones de diferentes tipos
   - Validar persistencia
   - Recargar página y verificar

2. **Flujo de edición**
   - Editar acción existente
   - Cambiar tipo de acción
   - Actualizar parámetros
   - Verificar cambios

3. **Flujo de validación**
   - Intentar crear acción con nombre duplicado
   - Intentar usar formato inválido
   - Intentar task ID inexistente
   - Verificar mensajes de error

---

## 📋 Checklist de Aceptación

### Funcionalidades Core

- [ ] Crear acción de tipo "Mark Milestone"
- [ ] Crear acción de tipo "Execute Task"
- [ ] Crear acción de tipo "Update State"
- [ ] Crear acción de tipo "Custom"
- [ ] Editar acción existente
- [ ] Eliminar acción
- [ ] Reordenar acciones (opcional)

### Validaciones

- [ ] Validar nombre único dentro de prioridad
- [ ] Validar formato snake_case
- [ ] Validar task ID para execute_task
- [ ] Validar JSON en params
- [ ] Validar longitud de descripción (500 chars)
- [ ] Validar longitud de instrucciones (2000 chars)

### UI/UX

- [ ] Selector visual de tipos de acción
- [ ] Editor de parámetros específico por tipo
- [ ] Templates predefinidos para instrucciones
- [ ] Sugerencias de nombres automáticas
- [ ] Feedback visual de validación
- [ ] Mensajes de error claros
- [ ] Tooltips explicativos
- [ ] Confirmación antes de eliminar

### Integración

- [ ] Integración en PriorityEditor
- [ ] Sincronización con store
- [ ] Persistencia en backend
- [ ] Compatibilidad con prioridades existentes
- [ ] Exportación/Importación de configuración

### Testing

- [ ] Unit tests de validaciones
- [ ] Integration tests de CRUD
- [ ] E2E tests de flujos principales
- [ ] Testing de edge cases
- [ ] Testing de performance

### Documentación

- [ ] Actualizar AGENT-README.md
- [ ] Agregar ejemplos de uso
- [ ] Documentar tipos TypeScript
- [ ] Crear guía de usuario
- [ ] Documentar templates disponibles

---

## 🚨 Riesgos y Mitigaciones

### Riesgo 1: Complejidad de UI
**Impacto:** Alto  
**Probabilidad:** Media

**Mitigación:**
- Implementar por fases (simple → complejo)
- Proporcionar modo JSON para usuarios avanzados
- Usar templates predefinidos para casos comunes
- Feedback constante de usuarios

### Riesgo 2: Validación de Datos
**Impacto:** Alto  
**Probabilidad:** Media

**Mitigación:**
- Validaciones robustas en frontend y backend
- Mensajes de error claros y específicos
- Modo de solo lectura si hay errores críticos
- Logging detallado de errores

### Riesgo 3: Performance con Muchas Acciones
**Impacto:** Medio  
**Probabilidad:** Baja

**Mitigación:**
- Virtual scrolling para listas largas
- Lazy loading de componentes pesados
- Memoización de componentes
- Paginación local si es necesario

### Riesgo 4: Compatibilidad con Backend
**Impacto:** Alto  
**Probabilidad:** Baja

**Mitigación:**
- Verificar estructura de datos con backend
- Agregar campo `actions` opcional
- Mantener backward compatibility
- Testing exhaustivo de sincronización

### Riesgo 5: Curva de Aprendizaje
**Impacto:** Medio  
**Probabilidad:** Media

**Mitigación:**
- Documentación clara y ejemplos
- Templates predefinidos
- Tooltips y guías inline
- Videos tutoriales (futuro)

---

## 📚 Referencias y Recursos

### Documentación Relacionada

- `AGENT-README.md` - Documentación principal del módulo
- `src/types/agents.ts` - Tipos TypeScript existentes
- `src/stores/useAgentStore.ts` - Store de agentes
- `.windsurf/rules/architecture.md` - Arquitectura del proyecto

### Ejemplos de Configuración

```json
{
  "id": "persuasion_lead",
  "name": "Persuasión del lead",
  "description": "Convencer al usuario de agendar una cita",
  "weight": 80,
  "triggers": ["agendar", "cita", "visita"],
  "requiredData": ["nombre", "telefono"],
  "dependsOn": ["capture_contact"],
  "completionCriteria": "Usuario acepta agendar cita",
  "taskId": "schedule_appointment",
  "enabled": true,
  "actions": [
    {
      "type": "mark_milestone",
      "name": "enlace_compartido",
      "description": "Marca cuando se compartió un enlace con el usuario",
      "executionPrompt": "Ejecuta esta acción cuando hayas compartido un enlace, URL o enlace de WhatsApp en tu respuesta. Por ejemplo: 'Aquí está el enlace: https://...' o 'Puedes contactarnos en: https://wa.me/...'",
      "params": {
        "value": true
      }
    },
    {
      "type": "mark_milestone",
      "name": "cta_enviado",
      "description": "Marca cuando se envió un call-to-action",
      "executionPrompt": "Ejecuta esta acción cuando hayas hecho una invitación explícita a una acción, como '¿Quieres agendar una cita?', '¿Te gustaría que te contacte un asesor?', o '¿Quieres ver más propiedades?'",
      "params": {
        "value": true
      }
    },
    {
      "type": "execute_task",
      "name": "send_followup_email",
      "description": "Envía email de seguimiento automático",
      "executionPrompt": "Ejecuta esta acción cuando el usuario solicite recibir información por email o cuando hayas prometido enviar información adicional.",
      "params": {}
    },
    {
      "type": "update_state",
      "name": "actualizar_interes",
      "description": "Actualiza el nivel de interés del usuario",
      "executionPrompt": "Ejecuta esta acción cuando detectes un cambio significativo en el nivel de interés del usuario (bajo → medio → alto).",
      "params": {
        "collectedData": {
          "nivel_interes": "alto",
          "ultima_interaccion": "cta_positivo"
        },
        "metadata": {
          "timestamp": "{{now}}"
        }
      }
    }
  ]
}
```

### Templates de Instrucciones

Ver sección "ActionTemplateSelector.tsx" para templates completos.

---

## 🎯 Criterios de Éxito

### Métricas de Éxito

1. **Funcionalidad:** 100% de funcionalidades core implementadas
2. **Validación:** 0 bugs críticos en validaciones
3. **UX:** Tiempo promedio de creación de acción < 2 minutos
4. **Performance:** Render de lista de 50 acciones < 100ms
5. **Testing:** Cobertura de código > 80%

### Definición de "Done"

Una tarea se considera completa cuando:

1. ✅ Código implementado y funcionando
2. ✅ Tests unitarios pasando
3. ✅ Tests de integración pasando
4. ✅ Validaciones funcionando correctamente
5. ✅ UI responsive y accesible
6. ✅ Documentación actualizada
7. ✅ Code review aprobado
8. ✅ Testing manual exitoso
9. ✅ Sin bugs críticos conocidos
10. ✅ Sincronización con backend funcionando

---

## 📅 Timeline Estimado

| Fase | Duración | Inicio | Fin |
|------|----------|--------|-----|
| Fase 1: Tipos y Estructura | 0.5 días | Día 1 AM | Día 1 PM |
| Fase 2: Componentes Base | 1 día | Día 1 PM | Día 2 PM |
| Fase 3: Editor Completo | 1 día | Día 2 PM | Día 3 PM |
| Fase 4: Validaciones y UX | 0.5 días | Día 3 PM | Día 4 AM |
| Fase 5: Integración y Testing | 1 día | Día 4 AM | Día 4 EOD |
| Fase 6: Documentación | 0.5 días | Día 5 AM | Día 5 PM |
| **Total** | **4.5 días** | | |

**Buffer:** 0.5 días para imprevistos = **5 días totales**

---

## 🔄 Próximos Pasos

### Inmediatos (Post-Implementación)

1. **Recopilar feedback** de usuarios beta
2. **Iterar sobre UX** basado en feedback
3. **Optimizar performance** si es necesario
4. **Agregar más templates** predefinidos

### Futuro (Roadmap)

1. **Analytics de acciones:** Tracking de ejecución de acciones
2. **Acciones condicionales:** Ejecutar solo si se cumplen condiciones
3. **Acciones en cadena:** Secuencias de acciones automáticas
4. **Marketplace de acciones:** Compartir configuraciones entre usuarios
5. **AI-assisted configuration:** Sugerencias automáticas de acciones

---

## 📝 Notas Adicionales

### Decisiones de Diseño

1. **¿Por qué snake_case para nombres?**
   - Consistencia con convenciones de backend
   - Facilita uso como identificadores en sistemas externos
   - Evita problemas con espacios y caracteres especiales

2. **¿Por qué templates predefinidos?**
   - Reduce curva de aprendizaje
   - Asegura calidad de instrucciones
   - Acelera configuración para casos comunes

3. **¿Por qué editor específico por tipo?**
   - Mejor UX que JSON genérico
   - Validaciones más específicas
   - Guía al usuario según el tipo

### Preguntas Pendientes

1. ¿El backend ya soporta el campo `actions` en Priority?
2. ¿Hay límite máximo de acciones por prioridad?
3. ¿Las acciones se ejecutan en orden específico?
4. ¿Hay analytics de ejecución de acciones?

### Dependencias Externas

- **Backend API:** Debe soportar campo `actions` en Priority
- **Documentación Backend:** Especificación de estructura de acciones
- **Testing Environment:** Ambiente de pruebas con backend funcional

---

**Última actualización:** 2026-01-09  
**Autor:** Cascade AI  
**Estado:** Pendiente de aprobación  
**Versión:** 1.0
