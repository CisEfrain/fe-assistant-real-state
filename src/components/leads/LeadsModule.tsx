import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Grid3x3,
  List,
  Filter,
  Download
} from 'lucide-react';
import { Lead, LeadFilters, LeadStatus } from '../../types/leads';
import { LeadCard } from './LeadCard';
import { LeadsList } from './LeadsList';
import { LeadFiltersPanel } from './LeadFiltersPanel';
import { LeadStats } from './LeadStats';
import { LeadDetailModal } from './LeadDetailModal';

const mockLeads: Lead[] = [
  {
    id: '1',
    phonecallId: 12345,
    status: 'NEW',
    leadType: 'PROPERTY_LEAD',
    operationType: 'SELL',
    source: 'whatsapp',
    contact: {
      name: 'Juan Pérez',
      phone: '+52 55 1234 5678',
      email: 'juan@email.com'
    },
    property: {
      propertyType: 'HOUSE',
      price: {
        amount: 8500000,
        currency: 'MXN'
      },
      location: {
        neighborhood: 'Polanco',
        district: 'Miguel Hidalgo',
        city: 'Ciudad de México'
      }
    },
    appointment: {
      type: 'NOT_SCHEDULED'
    },
    quality: {
      humanRequest: false
    },
    tags: ['Caliente'],
    notes: 'Interesado en casa con jardín',
    activities: [],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    phonecallId: 12346,
    status: 'QUALIFIED',
    leadType: 'SEARCH_LEAD',
    operationType: 'RENT',
    source: 'webchat',
    contact: {
      name: 'María González',
      phone: '+52 55 9876 5432',
      email: 'maria@email.com'
    },
    search: {
      country: 'México',
      state: 'CDMX',
      district: 'Benito Juárez',
      neighborhood: 'Del Valle',
      propertyType: 'APARTMENT',
      minPrice: 15000,
      maxPrice: 25000,
      qualification: 'Alta'
    },
    appointment: {
      type: 'VISIT',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Visita a departamento',
      notes: 'Cliente confirmado'
    },
    quality: {
      csat: '5',
      humanRequest: false
    },
    tags: ['Caliente', 'Urgente'],
    notes: 'Necesita mudarse pronto por trabajo',
    activities: [],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    lastContactedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  }
];

export const LeadsModule: React.FC = () => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filters, setFilters] = useState<LeadFilters>({
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });

  const filteredLeads = useMemo(() => {
    let filtered = [...mockLeads];

    if (filters.status) {
      const statusArray = Array.isArray(filters.status) ? filters.status : [filters.status];
      filtered = filtered.filter(l => statusArray.includes(l.status));
    }

    if (filters.leadType) {
      filtered = filtered.filter(l => l.leadType === filters.leadType);
    }

    if (filters.operationType) {
      filtered = filtered.filter(l => l.operationType === filters.operationType);
    }

    if (filters.source) {
      filtered = filtered.filter(l => l.source === filters.source);
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(l =>
        l.contact.name.toLowerCase().includes(term) ||
        l.contact.phone.includes(term) ||
        l.notes.toLowerCase().includes(term)
      );
    }

    if (filters.sortBy && filters.sortOrder) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (filters.sortBy) {
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'lastUpdated':
            aValue = new Date(a.lastUpdated).getTime();
            bValue = new Date(b.lastUpdated).getTime();
            break;
          case 'lastContactedAt':
            aValue = new Date(a.lastContactedAt || 0).getTime();
            bValue = new Date(b.lastContactedAt || 0).getTime();
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          default:
            return 0;
        }

        if (filters.sortOrder === 'ASC') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [mockLeads, filters]);

  const leadsByStatus = useMemo(() => {
    const statuses: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'APPOINTMENT_SCHEDULED', 'WON', 'LOST'];
    const result: Record<LeadStatus, Lead[]> = {
      NEW: [],
      CONTACTED: [],
      QUALIFIED: [],
      APPOINTMENT_SCHEDULED: [],
      VIEWED_PROPERTY: [],
      NEGOTIATING: [],
      WON: [],
      LOST: []
    };

    filteredLeads.forEach(lead => {
      result[lead.status].push(lead);
    });

    return result;
  }, [filteredLeads]);

  const stats = useMemo(() => {
    const total = mockLeads.length;
    const newLeads = mockLeads.filter(l => l.status === 'NEW').length;
    const contacted = mockLeads.filter(l => l.status === 'CONTACTED').length;
    const qualified = mockLeads.filter(l => l.status === 'QUALIFIED').length;
    const appointmentScheduled = mockLeads.filter(l => l.status === 'APPOINTMENT_SCHEDULED').length;
    const won = mockLeads.filter(l => l.status === 'WON').length;
    const lost = mockLeads.filter(l => l.status === 'LOST').length;

    return {
      total,
      new: newLeads,
      contacted,
      qualified,
      appointmentScheduled,
      won,
      lost,
      conversionRate: total > 0 ? (won / total) * 100 : 0,
      averageTimeToContact: 0,
      totalValue: 0
    };
  }, [mockLeads]);

  const getStatusLabel = (status: LeadStatus) => {
    const labels: Record<LeadStatus, string> = {
      NEW: 'Nuevos',
      CONTACTED: 'Contactados',
      QUALIFIED: 'Calificados',
      APPOINTMENT_SCHEDULED: 'Cita Agendada',
      VIEWED_PROPERTY: 'Visitó Propiedad',
      NEGOTIATING: 'Negociando',
      WON: 'Ganados',
      LOST: 'Perdidos'
    };
    return labels[status];
  };

  const getStatusColor = (status: LeadStatus) => {
    const colors: Record<LeadStatus, string> = {
      NEW: 'bg-blue-50 border-blue-200',
      CONTACTED: 'bg-purple-50 border-purple-200',
      QUALIFIED: 'bg-green-50 border-green-200',
      APPOINTMENT_SCHEDULED: 'bg-orange-50 border-orange-200',
      VIEWED_PROPERTY: 'bg-indigo-50 border-indigo-200',
      NEGOTIATING: 'bg-yellow-50 border-yellow-200',
      WON: 'bg-emerald-50 border-emerald-200',
      LOST: 'bg-gray-50 border-gray-200'
    };
    return colors[status];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-orange-500" />
            Leads (CRM)
          </h1>
          <p className="text-gray-600 mt-1">Gestiona el ciclo de vida de tus leads</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-5 w-5" />
            Exportar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg">
            <Plus className="h-5 w-5" />
            Nuevo Lead
          </button>
        </div>
      </div>

      <LeadStats stats={stats} />

      <LeadFiltersPanel filters={filters} onFiltersChange={setFilters} />

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {filteredLeads.length} Leads
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-orange-100 text-orange-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Vista Kanban"
            >
              <Grid3x3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-orange-100 text-orange-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Vista Lista"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {viewMode === 'kanban' ? (
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-4 min-w-max">
              {(['NEW', 'CONTACTED', 'QUALIFIED', 'APPOINTMENT_SCHEDULED', 'WON', 'LOST'] as LeadStatus[]).map(status => (
                <div key={status} className={`flex-shrink-0 w-80 ${getStatusColor(status)} border-2 rounded-xl p-4`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{getStatusLabel(status)}</h3>
                    <span className="px-2 py-1 bg-white rounded-full text-sm font-medium text-gray-600">
                      {leadsByStatus[status].length}
                    </span>
                  </div>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {leadsByStatus[status].map(lead => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onClick={() => setSelectedLead(lead)}
                      />
                    ))}
                    {leadsByStatus[status].length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        No hay leads en esta etapa
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <LeadsList
            leads={filteredLeads}
            onLeadClick={setSelectedLead}
          />
        )}
      </div>

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
};
