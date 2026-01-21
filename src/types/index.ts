export interface InteractionRecord {
  phonecall_id: number;
  source: string;
  channel: 'whatsapp' | 'webchat' | 'widget_testing';
  lead_type: 'PROPERTY_LEAD';
  operation_type: 'SELL' | 'RENT';
  broker_status: string;
  original_property?: {
    property_id: number;
    property_type: string;
    price: {
      amount: number;
      currency: string;
    };
  };
  appointment?: {
    type: 'VISIT' | 'PHONE_CALL' | 'NOT_SCHEDULED';
    date?: string;
    title?: string;
  };
  evaluation?: Record<string, unknown>;
  search?: {
    country: string;
    state: string;
    district: string;
    neighborhood: string;
    property_type: string;
    minPrice: number;
    maxPrice: number;
    confirmation_method: string;
    qualification: string;
  };
  quality: {
    show_csat: boolean;
    csat?: string;
    complaint?: string;
    human_request: boolean;
    human_resquest_no_response?: boolean;
  };
  created_at: string;
  conversation?: ConversationMessage[];
  metadata?: Record<string, any>;
}

export interface InteractionFilters {
  operation_type?: 'SELL' | 'RENT';
  channel?: 'whatsapp' | 'webchat' | 'widget_testing';
  source?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

export interface DashboardMetrics {
  totalInteractions: number;
  appointmentRate: number;
  appointmentDistribution: {
    visit: number;
    phone: number;
    none: number;
  };
  prequalificationRate: number;
  csatResponseRate: number;
  humanEscalationRate: number;
  economicImpact: {
    totalValue: number;
    valueWithAppointment: number;
    captureRate: number;
  };
  sellVsRent: {
    sell: {
      calls: number;
      appointmentRate: number;
      totalValue: number;
      valueWithAppointment: number;
    };
    rent: {
      calls: number;
      appointmentRate: number;
      totalValue: number;
      valueWithAppointment: number;
    };
  };
  // Additional fields that might come from API
  conversionRate?: number;
  averageSessionDuration?: number;
  channelDistribution?: {
    whatsapp: number;
    webchat: number;
  };
}

export interface GlobalImpact {
  leadsManaged: number;
  totalPropertyValue: number;
  appointmentsScheduled: number;
  potentialValueWithAppointment: number;
  satisfactionRate: number;
  offHoursResponseRate: number;
  // Additional fields that might come from API
  totalRevenue?: number;
  averageLeadValue?: number;
  conversionEfficiency?: number;
}

// Authentication Types
export interface AuthError {
  type: 'DEFAULT' | 'CONTRACT_FEATURES';
  message: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  jwt: string | null;
  user_id?: string | null;
  loading: boolean;
  error: AuthError | null;
}

export interface TokenValidationResponse {
  valid: boolean;
  contractFeatures: string[];
  error?: 'DEFAULT' | 'CONTRACT_FEATURES';
}

export interface CookieConfig {
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  domain?: string;
  path: string;
  maxAge: number;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}