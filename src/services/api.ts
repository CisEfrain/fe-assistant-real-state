import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { InteractionRecord, DashboardMetrics, GlobalImpact, OtherContactRecord, OtherContactFilters } from '../types';
import { env } from '../env';

const API_BASE_URL = env.API_BASE_URL;
// API Filters interfaces
export interface InteractionFilters {
  lead_type?: 'PROPERTY_LEAD' | 'SEARCH_LEAD' | 'LOCATION_LEAD';
  operation_type?: 'SELL' | 'RENT';
  channel?: 'whatsapp' | 'call';
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

export interface DashboardFilters {
  lead_type?: 'PROPERTY_LEAD' | 'SEARCH_LEAD' | 'LOCATION_LEAD';
  operation_type?: 'SELL' | 'RENT';
  channel?: 'whatsapp' | 'call';
  start_date?: string;
  end_date?: string;
}

export interface GlobalImpactFilters {
  start_date?: string;
  end_date?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class InteractionAnalyticsAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth
    this.client.interceptors.request.use((config) => {
      // Read JWT from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.error('Unauthorized access - token may be invalid');
          localStorage.removeItem('auth_token');
        }
        return Promise.reject(error);
      }
    );
  }


  // Set authentication token
  setAuthToken(token: string): void {
    localStorage.setItem('jwt', token);
  }

  // Remove authentication token
  clearAuthToken(): void {
    localStorage.removeItem('jwt');
  }

  // Get interaction records with pagination and filters
  async getInteractions(filters?: InteractionFilters): Promise<PaginatedResponse<InteractionRecord>> {
    const params = new URLSearchParams();
    
    // Set default limit
    params.append('limit', '10000');
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response: AxiosResponse<PaginatedResponse<InteractionRecord>> = await this.client.get(
      `/interaction-analytics/interactions?${params.toString()}`
    );
    return response.data;
  }

  // Get dashboard metrics
  async getDashboardMetrics(filters?: DashboardFilters): Promise<DashboardMetrics> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response: AxiosResponse<DashboardMetrics> = await this.client.get(
      `/interaction-analytics/metrics?${params.toString()}`
    );
    return response.data;
  }

  // Get global impact metrics
  async getGlobalImpact(filters?: GlobalImpactFilters): Promise<GlobalImpact> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response: AxiosResponse<GlobalImpact> = await this.client.get(
      `/interaction-analytics/global-impact?${params.toString()}`
    );
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await this.client.get('/api/healthcheck');
      return response.data;
    } catch (error) {
      return { status: 'error' };
    }
  }

  // Get other contacts (interactions not processed as leads)
  async getOtherContacts(filters?: OtherContactFilters): Promise<PaginatedResponse<OtherContactRecord>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Handle tags array separately
          if (key === 'tags' && Array.isArray(value)) {
            value.forEach(tag => params.append('tags', tag));
          } else if (!Array.isArray(value)) {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response: AxiosResponse<PaginatedResponse<OtherContactRecord>> = await this.client.get(
      `/interaction-analytics/other-contacts?${params.toString()}`
    );
    return response.data;
  }

  // Add tags to an other contact
  async addTagsToContact(id: string, tags: string[]): Promise<OtherContactRecord> {
    const response: AxiosResponse<OtherContactRecord> = await this.client.post(
      `/interaction-analytics/other-contacts/${id}/tags`,
      { tags }
    );
    return response.data;
  }

  // Remove tags from an other contact
  async removeTagsFromContact(id: string, tags: string[]): Promise<OtherContactRecord> {
    const response: AxiosResponse<OtherContactRecord> = await this.client.delete(
      `/interaction-analytics/other-contacts/${id}/tags`,
      { data: { tags } }
    );
    return response.data;
  }

  // Export other contacts to CSV
  async exportOtherContactsCSV(filters?: OtherContactFilters): Promise<void> {
    try {
      // Fetch all contacts with the current filters (without pagination limit)
      const exportFilters = { ...filters, limit: 10000 }; // Get up to 10000 records for export
      const response = await this.getOtherContacts(exportFilters);
      
      // Build CSV content
      const headers = [
        'ID', 
        'Canal', 
        'Fecha', 
        'Hora', 
        'Tiene Queja', 
        'Queja', 
        'Comentario', 
        'Tags',
        'Nombre Contacto',
        'Teléfono Contacto',
        'Email Contacto',
        'Property ID',
        'Tipo Operación',
        'Tipo Propiedad',
        'Tipo Lead',
        'Source',
        'Presupuesto Min',
        'Presupuesto Max',
        'Presupuesto Moneda',
        'Cita Tipo',
        'Cita Fecha',
        'Source Portal IAD'
      ];
      const csvRows = [headers.join(',')];
      
      response.data.forEach(contact => {
        const metadata = contact.metadata || {};
        
        // Extract contact info from metadata
        const contactName = metadata.name || metadata.nombre || 'N/A';
        const contactPhone = metadata.phone || metadata.telefono || metadata.phone_number || 'N/A';
        const contactEmail = metadata.email || 'N/A';
        
        // Extract property/lead info
        const propertyId = metadata.property_id || 'N/A';
        const operationType = metadata.operation_type || 'N/A';
        const propertyType = metadata.property_type || 'N/A';
        const leadType = metadata.lead_type || 'N/A';
        const source = metadata.source || 'N/A';
        const sourcePortal = metadata.source_portal_iad ? 'Sí' : 'No';
        
        // Extract budget info
        const budget = metadata.budget || {};
        const budgetMin = budget.min || 'N/A';
        const budgetMax = budget.max || 'N/A';
        const budgetUnit = budget.unit || 'N/A';
        
        // Extract appointment info
        const appointment = metadata.appointment || {};
        const appointmentType = appointment.type || 'N/A';
        const appointmentDate = appointment.date ? new Date(appointment.date).toLocaleDateString('es-ES') : 'N/A';

        const row = [
          `"${contact.id}"`,
          `"${contact.channel || 'N/A'}"`,
          `"${new Date(contact.created_at).toLocaleDateString('es-ES')}"`,
          `"${new Date(contact.created_at).toLocaleTimeString('es-ES')}"`,
          contact.has_complaint ? 'Sí' : 'No',
          `"${contact.complaint || 'N/A'}"`,
          `"${(contact.additional_comment || '').replace(/"/g, '""')}"`, // Escape quotes
          `"${contact.tags.join('|')}"`, // Tags separated by pipe
          `"${contactName}"`,
          `"${contactPhone}"`,
          `"${contactEmail}"`,
          `"${propertyId}"`,
          `"${operationType}"`,
          `"${propertyType}"`,
          `"${leadType}"`,
          `"${source}"`,
          `"${budgetMin}"`,
          `"${budgetMax}"`,
          `"${budgetUnit}"`,
          `"${appointmentType}"`,
          `"${appointmentDate}"`,
          `"${sourcePortal}"`
        ];
        csvRows.push(row.join(','));
      });
      
      const csvContent = csvRows.join('\n');
      
      // Create blob and download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `otros-contactos-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    }
  }

  // Export interactions to CSV (client-side generation)
  exportInteractionsCSV(interactions: InteractionRecord[]): void {
    try {
      // Build CSV headers with all detailed columns
      const headers = [
        'ID Interacción',
        'Fuente',
        'Canal',
        'Tipo de Lead',
        'Operación',
        'Fecha',
        'Hora',
        'Tipo de Cita',
        'Fecha de Cita',
        'Broker Status',
        'Encuesta Mostrada',
        'Encuesta Respuesta',
        'Tiene Queja',
        'Queja',
        'Solicitud Humano',
        'ID Propiedad',
        'Valor Propiedad',
        'Tipo Propiedad',
        'Moneda',
        'País Búsqueda',
        'Estado Búsqueda',
        'Distrito Búsqueda',
        'Tipo Prop. Búsqueda',
        'Precio Mín',
        'Precio Máx',
        'Nombre Contacto',
        'Teléfono Contacto',
        'Email Contacto',
        'Source Portal IAD'
      ];
      
      const csvRows = [headers.join(',')];
      
      // Helper function to escape CSV values
      const escapeCSV = (value: any): string => {
        if (value === null || value === undefined) return 'N/A';
        const stringValue = String(value);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };
      
      // Helper to format channel
      const formatChannel = (channel: string): string => {
        const channelMap: Record<string, string> = {
          'whatsapp': 'WhatsApp',
          'call': 'Llamada',
          'webchat': 'Web Chat',
          'widget_testing': 'Widget Testing'
        };
        return channelMap[channel] || channel;
      };
      
      // Helper to format lead type
      const formatLeadType = (leadType: string): string => {
        const leadTypeMap: Record<string, string> = {
          'PROPERTY_LEAD': 'Lead de Propiedad',
          'SEARCH_LEAD': 'Lead de Búsqueda',
          'LOCATION_LEAD': 'BIN Lead'
        };
        return leadTypeMap[leadType] || leadType;
      };
      
      // Helper to format appointment type
      const formatAppointmentType = (type?: string): string => {
        if (!type) return 'N/A';
        const appointmentMap: Record<string, string> = {
          'VISIT': 'Visita',
          'PHONE_CALL': 'Llamada',
          'NOT_SCHEDULED': 'Sin Cita'
        };
        return appointmentMap[type] || type;
      };
      
      // Build data rows
      interactions.forEach(interaction => {
        const metadata = interaction.metadata || {};
        const contactName = metadata.name || metadata.nombre || 'N/A';
        const contactPhone = metadata.phone || metadata.telefono || metadata.phone_number || 'N/A';
        const contactEmail = metadata.email || 'N/A';
        const sourcePortal = metadata.source_portal_iad ? 'Sí' : 'No';

        const row = [
          escapeCSV(interaction.phonecall_id),
          escapeCSV(interaction.source),
          escapeCSV(formatChannel(interaction.channel)),
          escapeCSV(formatLeadType(interaction.lead_type)),
          escapeCSV(interaction.operation_type === 'SELL' ? 'Venta' : 'Renta'),
          escapeCSV(new Date(interaction.created_at).toLocaleDateString('es-ES')),
          escapeCSV(new Date(interaction.created_at).toLocaleTimeString('es-ES')),
          escapeCSV(formatAppointmentType(interaction.appointment?.type)),
          escapeCSV(interaction.appointment?.date ? new Date(interaction.appointment.date).toLocaleDateString('es-ES') : 'N/A'),
          escapeCSV(interaction.broker_status || 'N/A'),
          escapeCSV(interaction.quality.show_csat ? 'Sí' : 'No'),
          escapeCSV(interaction.quality.csat || 'Sin respuesta'),
          escapeCSV(interaction.quality.complaint ? 'Sí' : 'No'),
          escapeCSV(interaction.quality.complaint || 'N/A'),
          escapeCSV(interaction.quality.human_request ? 'Sí' : 'No'),
          escapeCSV(interaction.original_property?.property_id || 'N/A'),
          escapeCSV(interaction.original_property?.price?.amount || 'N/A'),
          escapeCSV(interaction.original_property?.property_type || 'N/A'),
          escapeCSV(interaction.original_property?.price?.currency || 'N/A'),
          escapeCSV(interaction.search?.country || 'N/A'),
          escapeCSV(interaction.search?.state || 'N/A'),
          escapeCSV(interaction.search?.district || 'N/A'),
          escapeCSV(interaction.search?.property_type || 'N/A'),
          escapeCSV(interaction.search?.minPrice || 'N/A'),
          escapeCSV(interaction.search?.maxPrice || 'N/A'),
          escapeCSV(contactName),
          escapeCSV(contactPhone),
          escapeCSV(contactEmail),
          escapeCSV(sourcePortal)
        ];
        csvRows.push(row.join(','));
      });
      
      const csvContent = csvRows.join('\n');
      
      // Create blob and download with BOM for Excel compatibility
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `interacciones-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting interactions CSV:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const interactionAPI = new InteractionAnalyticsAPI();