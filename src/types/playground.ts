export type PlaygroundChannel = 'webchat' | 'whatsapp';

// Metadatos por canal
export interface WebchatMetadata {
  propertyId?: string;
  intent?: 'schedule_call' | 'schedule_visit';
  channel: 'webchat';
  originPath?: string;
  locale?: string;
}

export interface WhatsappMetadata {
  phone: string; // Con prefijo de país (+52, +1, etc.)
  channel: 'whatsapp';
}

export interface CustomMetadata {
  key: string;
  value: string;
}

// Datos del Lead PON (Asesores Inmobiliarios)
export type ExperienciaBR = 
  | 'Sí' 
  | 'No';

export type ProyectoVida = 
  | 'mas_tiempo' 
  | 'mas_dinero' 
  | 'legado';

export interface PONLeadFormData {
  nombre: string;
  telefono: string;
  ciudad: string;
  email: string;
  experiencia_br: ExperienciaBR;
  meta_financiera: string;
  proyecto_vida: ProyectoVida;
  evento?: string;
}

// Estado del playground
export interface PlaygroundState {
  isAuthenticated: boolean;
  testerName?: string;
  selectedAgentId: string | null;
  selectedChannel: PlaygroundChannel;
  channelMetadata: WebchatMetadata | WhatsappMetadata;
  customMetadata: CustomMetadata[];
}

export interface PlaygroundMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  sessionId?: string;
  responseDetails?: {
    executedPriority?: string;
    brainReasoning?: string;
    missingData?: string[];
    executedTask?: string;
    nextTask?: string;
    metadata?: Record<string, unknown>;
    collectedData?: Record<string, unknown>;
  };
}

export interface ChatSession {
  id: string;
  messages: PlaygroundMessage[];
  createdAt: Date;
  status: 'active' | 'ended';
}
