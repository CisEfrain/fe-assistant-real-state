// Tipos para el módulo de Gestión de Asistentes Conversacionales

export type AnalyticsType = 'DISABLED' | 'IAD_LEADS' | 'PON';

export type AgentType = 'conversational-agent';
export type AgentStatus = 'draft' | 'active' | 'deprecated';
export type AgentChannel = 'whatsapp' | 'call' | 'webchat' | 'widget_testing';
export enum TaskType {
  CAPTURE_CONTACT_DATA = 'CAPTURE_CONTACT_DATA',
  SEARCH_SINGLE_PROPERTY = 'SEARCH_SINGLE_PROPERTY',
  SEARCH_RELATED_PROPERTIES = 'SEARCH_RELATED_PROPERTIES',
  PROPERTY_SEARCH = 'PROPERTY_SEARCH',
  SCHEDULE_APPOINTMENT = 'SCHEDULE_APPOINTMENT',
  CSAT_SURVEY = 'CSAT_SURVEY',
  COMPLAINT = 'COMPLAINT',
  FAQ = 'FAQ',
  MODERATION = 'MODERATION',
  URL_PROPERTY_PORTAL = 'URL_PROPERTY_PORTAL',
  CUSTOM = 'CUSTOM'
}


// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ConversationRequest {
  message: string;
  session_id: string;
  agent_id: string;
  context?: Record<string, any>;
}

export interface ConversationResponse {
  response: string;
  next_task?: string;
  metadata?: Record<string, any>;
  collectedData?: Record<string, any>;
  executedPriority?: string;
  brainReasoning?: string;
  missingData?: string[];
  executedTask?: string;
}

// DTO types for API requests
export interface CreateAgentDto {
  alias: string;
  name: string;
  description?: string;
  type: AgentType;
  channel: AgentChannel;
  connected?: boolean;
  businessRules?: string[];
  businessInformation?: string[];
  agentTone?: string;
  conversationPrompt?: string;
  conversationConfig?: {
    historyLimit?: number;
    maxHistoryInRedis?: number;
    sessionTTL?: number;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  orchestration: {
    priorities: Priority[];
    knowledgeBase?: KnowledgeItem[] | string[] | null;
    fallbackBehavior?: string;
  };
  tasks?: Task[];
  enabled?: boolean;
  analyticsType?: AnalyticsType;
  status?: AgentStatus;
}

export interface UpdateAgentDto {
  alias?: string;
  name?: string;
  description?: string;
  type?: AgentType;
  channel?: AgentChannel;
  connected?: boolean;
  businessRules?: string[];
  businessInformation?: string[];
  agentTone?: string;
  conversationPrompt?: string;
  conversationConfig?: {
    historyLimit?: number;
    maxHistoryInRedis?: number;
    sessionTTL?: number;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  enabled?: boolean;
  analyticsType?: AnalyticsType;
  status?: AgentStatus;
}

export interface UpdateTaskDto {
  name?: string;
  type?: TaskType;
  promptVariables?: Record<string, any>;
  enabled?: boolean;
}

export interface UpdateOrchestrationDto {
  priorities?: Priority[];
  knowledgeBase?: KnowledgeItem[] | null;
  fallbackBehavior?: string;
}
// Extraction Map types for data extraction configuration
export interface ExtractionMapEntry {
  to: string; // Target field name
  map?: Record<string, string>; // Value mapping (e.g., "RENT" -> "renta")
  kind?: 'RANGE' | 'SINGLE' | 'LIST'; // Type of data extraction
  role?: 'min' | 'max' | 'exact'; // Role for range values
  unit?: string; // Unit for numeric values (e.g., "MXN", "USD")
}

export interface ExtractionMap {
  [sourceField: string]: ExtractionMapEntry;
}

// Configuración API para tareas
export interface ApiConfig {
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  auth?: {
    type: 'bearer' | 'api_key' | 'basic';
    headerName?: string;
    value?: string;
  };
  headers?: Record<string, string>;
}

// Guard DSL types for priority eligibility filtering
export interface GuardExpression {
  all?: GuardExpression[];   // AND - all conditions must be met
  any?: GuardExpression[];   // OR - at least one condition must be met
  not?: GuardExpression;     // NOT - negation
  eq?: [string, any];        // Equality: ["factKey", value]
  neq?: [string, any];       // Inequality: ["factKey", value]
  exists?: string;           // Exists and not null: "factKey"
}

// Completion Policy for field validation
export interface CompletionPolicy {
  [fieldName: string]: {
    allowedKinds: ('EXACT' | 'RANGE' | 'MULTI' | 'ANY' | 'DECLINED')[];
    required: boolean;
    defaultKind?: 'EXACT' | 'RANGE' | 'MULTI' | 'ANY';
  };
}

// Fact Definition types for configurable facts
export type FactDefinitionType = 'exists' | 'equals' | 'any_exists' | 'all_exists' | 'composite' | 'not_exists';

export interface FactDefinition {
  name: string;
  type: FactDefinitionType;
  field?: string;  // For exists, equals, not_exists
  fields?: string[];  // For any_exists, all_exists
  value?: unknown;  // For equals
  logic?: 'all' | 'any';  // For composite
  conditions?: Array<{ fact: string }>;  // For composite
}

// Core facts that are always available (derived automatically by backend)
export const CORE_FACTS = {
  operation_type: {
    label: 'Tipo de operación',
    type: 'string' as const,
    values: ['RENT', 'SELL', null],
    description: 'Tipo de operación normalizado desde tipo_operacion'
  },
  property_found: {
    label: 'Propiedad encontrada',
    type: 'boolean' as const,
    values: [true, false, null],
    description: 'Detecta si hay property_id en collectedData'
  },
  has_contact: {
    label: 'Tiene contacto',
    type: 'boolean' as const,
    values: [true, false, null],
    description: 'Verifica nombre + email válido'
  },
  has_search_params: {
    label: 'Tiene parámetros de búsqueda',
    type: 'boolean' as const,
    values: [true, false, null],
    description: 'Verifica tipo_propiedad + estado + presupuesto'
  }
};

// Legacy type for backward compatibility
export type FactKey = keyof typeof CORE_FACTS;

// Helper to get all available facts (core + custom)
export function getAvailableFacts(customFacts: FactDefinition[] = []): Record<string, { label: string; type: 'string' | 'boolean'; values?: unknown[]; description?: string }> {
  const facts: Record<string, { label: string; type: 'string' | 'boolean'; values?: unknown[]; description?: string }> = { ...CORE_FACTS };
  
  // Add custom facts (all derived facts are boolean)
  customFacts.forEach(def => {
    facts[def.name] = {
      label: def.name,
      type: 'boolean',
      values: [true, false, null],
      description: `Custom fact: ${def.type}`
    };
  });
  
  return facts;
}

// Priority Action types
export type PriorityActionType = 
  | 'mark_milestone' 
  | 'execute_task' 
  | 'update_state' 
  | 'custom';

export interface PriorityAction {
  type: PriorityActionType;
  name: string;
  description?: string;
  executionPrompt: string;
  params?: Record<string, any>;
}

// Simplified priority-based orchestration
export interface Priority {
  id: string;
  name: string;
  description?: string;
  weight: number;
  sequence?: number; // Optional execution order (lower numbers execute first)
  triggers: string[]; // Natural language triggers
  requiredData?: string[]; // Simple field names
  dependsOn?: string[]; // Other priority IDs
  completionCriteria?: string; // Natural language criteria
  taskId?: string; // Optional task to execute when this priority is activated
  enabled: boolean;
  executeOnce?: boolean; // If true, priority executes only once per conversation
  guard?: GuardExpression; // DSL for eligibility filtering
  completionPolicy?: CompletionPolicy; // Field validation policies
  actions?: PriorityAction[]; // Actions to execute automatically
  metadata?: Record<string, any>;
}

// Simplified knowledge base for LLM context
export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  relevanceScore?: number;
}

export interface Prompt {
  id: string;
  name: string;
  template: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  rag?: {
    similarityThreshold?: number;
    topK?: number;
    indexRef?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  type: TaskType;
  enabled: boolean;
  prompt: Prompt;
  apiConfig?: ApiConfig;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Orchestration {
  id?: string;
  priorities: Priority[]; // Simple priority-based guidance
  knowledgeBase?: KnowledgeItem[]; // Context for LLM
  factDefinitions?: FactDefinition[]; // Custom fact definitions
  fallbackBehavior: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Agent {
  id: string;
  alias: string;
  name: string;
  description?: string;
  enabled: boolean;
  analyticsType: AnalyticsType;
  type: AgentType;
  channel: AgentChannel;
  connected: boolean;
  businessRules?: string[];
  businessInformation?: string[];
  agentTone?: string;
  conversationPrompt?: string;
  conversationConfig?: {
    historyLimit?: number;
    maxHistoryInRedis?: number;
    sessionTTL?: number; // Session time-to-live in seconds
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  tasks: Task[];
  orchestration: Orchestration;
  status: AgentStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

// Tipos de agentes disponibles
export const AGENT_TYPES = {
  'conversational-agent': 'Agente Conversacional'
} as const;

// Tipos de tareas disponibles
export const TASK_TYPES = {
  CAPTURE_CONTACT_DATA: 'Capturar Datos de Contacto',
  SEARCH_SINGLE_PROPERTY: 'Búsqueda de Propiedad Específica',
  SEARCH_RELATED_PROPERTIES: 'Búsqueda de Propiedades Relacionadas',
  PROPERTY_SEARCH: 'Búsqueda de Propiedades',
  SCHEDULE_APPOINTMENT: 'Agendar Cita',
  CSAT_SURVEY: 'Encuesta CSAT',
  URL_PROPERTY_PORTAL: 'Busqueda por url de publicación en portal',
  classifier: 'Detector de Intención',
  COMPLAINT: 'Gestión de Reclamos',
  FAQ: 'Preguntas Frecuentes',
  MODERATION: 'Moderación',
  CUSTOM: 'Personalizada'
} as const;

// Proveedores LLM disponibles
export const LLM_PROVIDERS = {
  azure: 'Azure OpenAI',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  local: 'Modelo Local'
} as const;

// Categorías de conocimiento predefinidas
export const KNOWLEDGE_CATEGORIES = {
  properties: 'Propiedades',
  services: 'Servicios',
  policies: 'Políticas',
  procedures: 'Procedimientos',
  faq: 'Preguntas Frecuentes',
  legal: 'Información Legal',
  pricing: 'Precios y Tarifas',
  locations: 'Ubicaciones'
} as const;

// Campos de datos comunes para requiredData
export const COMMON_DATA_FIELDS = {
  nombre: 'Nombre completo',
  email: 'Correo electrónico',
  telefono: 'Teléfono',
  tipo_operacion: 'Tipo de operación (renta/venta)',
  ubicacion: 'Ubicación o zona de interés',
  tipo_propiedad: 'Tipo de propiedad',
  presupuesto: 'Presupuesto disponible',
  urgencia: 'Nivel de urgencia',
  fecha_mudanza: 'Fecha de mudanza',
  financiamiento: 'Tipo de financiamiento',
  property_id: 'ID de propiedad específica',
  complaint_details: 'Detalles del reclamo',
  preferred_contact: 'Método de contacto preferido'
} as const;