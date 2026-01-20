export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'APPOINTMENT_SCHEDULED'
  | 'VIEWED_PROPERTY'
  | 'NEGOTIATING'
  | 'WON'
  | 'LOST';

export type LeadSource = 'whatsapp' | 'webchat' | 'widget_testing';
export type LeadType = 'PROPERTY_LEAD' | 'SEARCH_LEAD';
export type OperationType = 'SELL' | 'RENT';

export interface LeadContact {
  name: string;
  phone: string;
  email?: string;
  whatsapp?: string;
}

export interface LeadProperty {
  propertyId?: number;
  propertyType: string;
  price: {
    amount: number;
    currency: string;
  };
  location?: {
    neighborhood: string;
    district: string;
    city: string;
  };
}

export interface LeadSearch {
  country: string;
  state: string;
  district: string;
  neighborhood: string;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  qualification: string;
}

export interface LeadAppointment {
  type: 'VISIT' | 'PHONE_CALL' | 'NOT_SCHEDULED';
  date?: string;
  title?: string;
  notes?: string;
}

export interface LeadActivity {
  id: string;
  type: 'NOTE' | 'STATUS_CHANGE' | 'APPOINTMENT' | 'CALL' | 'EMAIL' | 'WHATSAPP';
  description: string;
  createdAt: string;
  createdBy?: string;
}

export interface Lead {
  id: string;
  phonecallId: number;
  status: LeadStatus;
  leadType: LeadType;
  operationType: OperationType;
  source: LeadSource;
  contact: LeadContact;
  property?: LeadProperty;
  search?: LeadSearch;
  appointment?: LeadAppointment;
  quality?: {
    csat?: string;
    complaint?: string;
    humanRequest: boolean;
  };
  assignedTo?: string;
  tags: string[];
  notes: string;
  activities: LeadActivity[];
  createdAt: string;
  lastUpdated: string;
  lastContactedAt?: string;
}

export interface LeadFilters {
  status?: LeadStatus | LeadStatus[];
  leadType?: LeadType;
  operationType?: OperationType;
  source?: LeadSource;
  assignedTo?: string;
  tags?: string[];
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  hasAppointment?: boolean;
  sortBy?: 'createdAt' | 'lastUpdated' | 'lastContactedAt' | 'status';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  appointmentScheduled: number;
  won: number;
  lost: number;
  conversionRate: number;
  averageTimeToContact: number;
  totalValue: number;
}
