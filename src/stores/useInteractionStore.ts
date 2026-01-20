import { create } from 'zustand';
import { InteractionRecord, DashboardMetrics, GlobalImpact, OtherContactRecord, OtherContactFilters } from '../types';
import { generateMockData } from '../data/mockData';
import { interactionAPI, InteractionFilters, DashboardFilters, GlobalImpactFilters } from '../services/api';

// Función para obtener fecha de hace N días
const getDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

// Función para obtener fecha actual
const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

interface InteractionStore {
  interactions: InteractionRecord[];
  currentModule: string;
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  dateFilters: {
    start_date: string;
    end_date: string;
  };
  
  // Other Contacts State
  otherContacts: OtherContactRecord[];
  otherContactsTotal: number;
  otherContactsPage: number;
  otherContactsLimit: number;
  otherContactsTotalPages: number;
  
  // Actions
  setCurrentModule: (module: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setDateFilters: (filters: { start_date: string; end_date: string }) => void;
  setPeriodDays: (days: number) => void;
  
  // API Actions
  fetchInteractions: (filters?: InteractionFilters) => Promise<void>;
  fetchDashboardMetrics: (filters?: DashboardFilters) => Promise<DashboardMetrics>;
  fetchGlobalImpact: (filters?: GlobalImpactFilters) => Promise<GlobalImpact>;
  checkConnection: () => Promise<void>;
  
  // Other Contacts Actions
  fetchOtherContacts: (filters?: OtherContactFilters) => Promise<void>;
  setOtherContactsPage: (page: number) => void;
  addContactTags: (id: string, tags: string[]) => Promise<void>;
  removeContactTags: (id: string, tags: string[]) => Promise<void>;
  exportContactsToCSV: (filters?: OtherContactFilters) => Promise<void>;
  
  // Computed properties
  getDashboardMetrics: () => DashboardMetrics;
  getGlobalImpact: () => GlobalImpact;
}

export const useInteractionStore = create<InteractionStore>((set, get) => ({
  interactions: generateMockData(),
  currentModule: 'dashboard',
  loading: false,
  error: null,
  isOnline: false,
  dateFilters: {
    start_date: getDaysAgo(30),
    end_date: getToday()
  },
  
  // Other Contacts initial state
  otherContacts: [],
  otherContactsTotal: 0,
  otherContactsPage: 1,
  otherContactsLimit: 20,
  otherContactsTotalPages: 0,
  
  setCurrentModule: (module: string) => set({ currentModule: module }),
  
  setLoading: (loading: boolean) => set({ loading }),
  
  setError: (error: string | null) => set({ error }),
  
  setDateFilters: (filters) => set({ dateFilters: filters }),
  
  setPeriodDays: (days: number) => {
    const end_date = getToday();
    const start_date = getDaysAgo(days);
    set({ dateFilters: { start_date, end_date } });
  },
  
  // API Actions
  fetchInteractions: async (filters?: InteractionFilters) => {
    set({ loading: true, error: null });
    
    try {
      const response = await interactionAPI.getInteractions(filters);
      set({ 
        interactions: response.data, 
        loading: false, 
        isOnline: true 
      });
    } catch (error) {
      console.error('Error fetching interactions:', error);
      set({ 
        error: 'Error al cargar interacciones. Usando datos locales.', 
        loading: false,
        isOnline: false 
      });
      // Keep using mock data as fallback
    }
  },
  
  fetchDashboardMetrics: async (filters?: DashboardFilters) => {
    set({ loading: true, error: null });
    
    try {
      const metrics = await interactionAPI.getDashboardMetrics(filters);
      set({ loading: false, isOnline: true });
      return metrics;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      set({ 
        error: 'Error al cargar métricas. Usando cálculos locales.', 
        loading: false,
        isOnline: false 
      });
      // Return local calculations as fallback
      return get().getDashboardMetrics();
    }
  },
  
  fetchGlobalImpact: async (filters?: GlobalImpactFilters) => {
    set({ loading: true, error: null });
    
    try {
      const impact = await interactionAPI.getGlobalImpact(filters);
      set({ loading: false, isOnline: true });
      return impact;
    } catch (error) {
      console.error('Error fetching global impact:', error);
      set({ 
        error: 'Error al cargar impacto global. Usando cálculos locales.', 
        loading: false,
        isOnline: false 
      });
      // Return local calculations as fallback
      return get().getGlobalImpact();
    }
  },
  
  checkConnection: async () => {
    try {
      const health = await interactionAPI.healthCheck();
      set({ isOnline: health.status === 'ok' });
    } catch (_error) {
      set({ isOnline: false });
    }
  },
  
  // Other Contacts Actions
  fetchOtherContacts: async (filters?: OtherContactFilters) => {
    set({ loading: true, error: null });
    
    try {
      const response = await interactionAPI.getOtherContacts(filters);
      set({ 
        otherContacts: response.data,
        otherContactsTotal: response.total,
        otherContactsPage: response.page,
        otherContactsLimit: response.limit,
        otherContactsTotalPages: response.totalPages,
        loading: false,
        isOnline: true 
      });
    } catch (_error) {
      console.error('Error fetching other contacts:', _error);
      set({ 
        error: 'Error al cargar otros contactos. Intente nuevamente.', 
        loading: false,
        isOnline: false 
      });
    }
  },
  
  setOtherContactsPage: (page: number) => {
    set({ otherContactsPage: page });
  },

  addContactTags: async (id: string, tags: string[]) => {
    try {
      const updatedContact = await interactionAPI.addTagsToContact(id, tags);
      
      // Update the contact in the local state
      set((state) => ({
        otherContacts: state.otherContacts.map(contact =>
          contact.id === id ? updatedContact : contact
        )
      }));
    } catch (error) {
      console.error('Error adding tags:', error);
      set({ error: 'Error al agregar tags. Intente nuevamente.' });
      throw error;
    }
  },

  removeContactTags: async (id: string, tags: string[]) => {
    try {
      const updatedContact = await interactionAPI.removeTagsFromContact(id, tags);
      
      // Update the contact in the local state
      set((state) => ({
        otherContacts: state.otherContacts.map(contact =>
          contact.id === id ? updatedContact : contact
        )
      }));
    } catch (error) {
      console.error('Error removing tags:', error);
      set({ error: 'Error al eliminar tags. Intente nuevamente.' });
      throw error;
    }
  },

  exportContactsToCSV: async (filters?: OtherContactFilters) => {
    set({ loading: true, error: null });
    
    try {
      await interactionAPI.exportOtherContactsCSV(filters);
      set({ loading: false });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      set({ 
        error: 'Error al exportar CSV. Intente nuevamente.', 
        loading: false 
      });
      throw error;
    }
  },
  
  getDashboardMetrics: (): DashboardMetrics => {
    const interactions = get().interactions;
    
    // Validar que interactions existe y es un array
    if (!interactions || !Array.isArray(interactions)) {
      return {
        totalInteractions: 0,
        appointmentRate: 0,
        appointmentDistribution: { visit: 0, phone: 0, none: 0 },
        prequalificationRate: 0,
        csatResponseRate: 0,
        humanEscalationRate: 0,
        economicImpact: { totalValue: 0, valueWithAppointment: 0, captureRate: 0 },
        sellVsRent: {
          sell: { calls: 0, appointmentRate: 0, totalValue: 0, valueWithAppointment: 0 },
          rent: { calls: 0, appointmentRate: 0, totalValue: 0, valueWithAppointment: 0 }
        }
      };
    }
    
    const totalInteractions = interactions.length;
    
    // Métricas generales
    const interactionsWithAppointment = interactions.filter(interaction => 
      interaction.appointment?.type && interaction.appointment.type !== 'NOT_SCHEDULED'
    );
    const appointmentRate = totalInteractions > 0 ? (interactionsWithAppointment.length / totalInteractions) * 100 : 0;
    
    // Distribución de citas
    const visitAppointments = interactions.filter(interaction => interaction.appointment?.type === 'VISIT').length;
    const phoneAppointments = interactions.filter(interaction => interaction.appointment?.type === 'PHONE_CALL').length;
    const noAppointments = interactions.filter(interaction => 
      !interaction.appointment?.type || interaction.appointment.type === 'NOT_SCHEDULED'
    ).length;
    
    // Precalificación (solo PROPERTY_LEAD)
    const propertyLeads = interactions.filter(interaction => interaction.lead_type === 'PROPERTY_LEAD');
    const prequalifiedLeads = propertyLeads.filter(interaction => interaction.evaluation);
    const prequalificationRate = propertyLeads.length > 0 
      ? (prequalifiedLeads.length / propertyLeads.length) * 100 
      : 0;
    
    // CSAT
    const csatShown = interactions.filter(interaction => interaction.quality.show_csat);
    const csatResponded = csatShown.filter(interaction => interaction.quality.csat);
    const csatResponseRate = csatShown.length > 0 
      ? (csatResponded.length / csatShown.length) * 100 
      : 0;
    
    // Escalamiento a humano
    const humanRequests = interactions.filter(interaction => interaction.quality.human_request).length;
    const humanEscalationRate = totalInteractions > 0 ? (humanRequests / totalInteractions) * 100 : 0;
    
    // Impacto económico
    const propertyLeadsWithPrice = interactions.filter(interaction => 
      interaction.lead_type === 'PROPERTY_LEAD' && interaction.original_property?.price?.amount
    );
    const totalValue = propertyLeadsWithPrice.reduce((sum, interaction) => 
      sum + (interaction.original_property?.price?.amount || 0), 0
    );
    
    const valueWithAppointment = propertyLeadsWithPrice
      .filter(interaction => interaction.appointment?.type && interaction.appointment.type !== 'NOT_SCHEDULED')
      .reduce((sum, interaction) => sum + (interaction.original_property?.price?.amount || 0), 0);
    
    const captureRate = totalValue > 0 ? (valueWithAppointment / totalValue) * 100 : 0;
    
    // Sell vs Rent
    const sellInteractions = interactions.filter(interaction => interaction.operation_type === 'SELL');
    const rentInteractions = interactions.filter(interaction => interaction.operation_type === 'RENT');
    
    const sellWithAppointment = sellInteractions.filter(interaction => 
      interaction.appointment?.type && interaction.appointment.type !== 'NOT_SCHEDULED'
    );
    const rentWithAppointment = rentInteractions.filter(interaction => 
      interaction.appointment?.type && interaction.appointment.type !== 'NOT_SCHEDULED'
    );
    
    const sellTotalValue = sellInteractions
      .filter(interaction => interaction.original_property?.price?.amount)
      .reduce((sum, interaction) => sum + (interaction.original_property?.price?.amount || 0), 0);
    
    const rentTotalValue = rentInteractions
      .filter(interaction => interaction.original_property?.price?.amount)
      .reduce((sum, interaction) => sum + (interaction.original_property?.price?.amount || 0), 0);
    
    const sellValueWithAppointment = sellInteractions
      .filter(interaction => interaction.appointment?.type && interaction.appointment.type !== 'NOT_SCHEDULED' && interaction.original_property?.price?.amount)
      .reduce((sum, interaction) => sum + (interaction.original_property?.price?.amount || 0), 0);
    
    const rentValueWithAppointment = rentInteractions
      .filter(interaction => interaction.appointment?.type && interaction.appointment.type !== 'NOT_SCHEDULED' && interaction.original_property?.price?.amount)
      .reduce((sum, interaction) => sum + (interaction.original_property?.price?.amount || 0), 0);
    
    return {
      totalInteractions: totalInteractions,
      appointmentRate,
      appointmentDistribution: {
        visit: visitAppointments,
        phone: phoneAppointments,
        none: noAppointments
      },
      prequalificationRate,
      csatResponseRate,
      humanEscalationRate,
      economicImpact: {
        totalValue,
        valueWithAppointment,
        captureRate
      },
      sellVsRent: {
        sell: {
          calls: sellInteractions.length,
          appointmentRate: sellInteractions.length > 0 ? (sellWithAppointment.length / sellInteractions.length) * 100 : 0,
          totalValue: sellTotalValue,
          valueWithAppointment: sellValueWithAppointment
        },
        rent: {
          calls: rentInteractions.length,
          appointmentRate: rentInteractions.length > 0 ? (rentWithAppointment.length / rentInteractions.length) * 100 : 0,
          totalValue: rentTotalValue,
          valueWithAppointment: rentValueWithAppointment
        }
      }
    };
  },
  
  getGlobalImpact: (): GlobalImpact => {
    const interactions = get().interactions;
    const metrics = get().getDashboardMetrics();
    
    if (!interactions || !Array.isArray(interactions)) {
      return {
        leadsManaged: 0,
        totalPropertyValue: 0,
        appointmentsScheduled: 0,
        potentialValueWithAppointment: 0,
        satisfactionRate: 0,
        offHoursResponseRate: 0
      };
    }
    
    // Calcular satisfacción positiva
    const csatResponses = interactions.filter(interaction => interaction.quality.csat);
    const positiveCsat = csatResponses.filter(interaction => {
      const csat = interaction.quality.csat;
      // Manejar tanto valores numéricos como texto
      if (typeof csat === 'string') {
        return csat === 'Satisfecho' || csat === 'Muy satisfecho' || 
               csat === 'SATISFIED' || csat === 'VERY_SATISFIED' ||
               csat === '4' || csat === '5';
      }
      if (typeof csat === 'number') {
        return csat >= 4;
      }
      return false;
    });
    
    const satisfactionRate = csatResponses.length > 0 
      ? (positiveCsat.length / csatResponses.length) * 100 
      : 0;
    
    // Horario humano: Lunes a Viernes 9:00-18:00, Sábados 9:00-14:00
    const offHoursInteractions = interactions.filter(interaction => {
      const date = new Date(interaction.created_at);
      const hour = date.getHours();
      const dayOfWeek = date.getDay(); // 0 = Domingo, 6 = Sábado
      
      // Domingo
      if (dayOfWeek === 0) return true;
      
      // Sábado: fuera de 9:00-14:00
      if (dayOfWeek === 6) {
        return hour < 9 || hour >= 14;
      }
      
      // Lunes a Viernes: fuera de 9:00-18:00
      return hour < 9 || hour >= 18;
    });
    
    const offHoursResponseRate = interactions.length > 0 
      ? (offHoursInteractions.length / interactions.length) * 100 
      : 0;
    
    return {
      leadsManaged: interactions.length,
      totalPropertyValue: metrics.economicImpact.totalValue,
      appointmentsScheduled: metrics.appointmentDistribution.visit + metrics.appointmentDistribution.phone,
      potentialValueWithAppointment: metrics.economicImpact.valueWithAppointment,
      satisfactionRate,
      offHoursResponseRate
    };
  }
}));