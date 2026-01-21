import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Home,
  Search as SearchIcon,
  Calendar,
  Clock,
  Tag,
  User,
  Inbox
} from 'lucide-react';
import { Lead } from '../../types/leads';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface LeadsListProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

export const LeadsList: React.FC<LeadsListProps> = ({ leads, onLeadClick }) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency === 'MXN' ? 'MXN' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      NEW: 'bg-blue-100 text-blue-800',
      CONTACTED: 'bg-purple-100 text-purple-800',
      QUALIFIED: 'bg-green-100 text-green-800',
      APPOINTMENT_SCHEDULED: 'bg-orange-100 text-orange-800',
      VIEWED_PROPERTY: 'bg-indigo-100 text-indigo-800',
      NEGOTIATING: 'bg-yellow-100 text-yellow-800',
      WON: 'bg-emerald-100 text-emerald-800',
      LOST: 'bg-gray-100 text-gray-800'
    };
    const labels: Record<string, string> = {
      NEW: 'Nuevo',
      CONTACTED: 'Contactado',
      QUALIFIED: 'Calificado',
      APPOINTMENT_SCHEDULED: 'Cita Agendada',
      VIEWED_PROPERTY: 'Visitó Propiedad',
      NEGOTIATING: 'Negociando',
      WON: 'Ganado',
      LOST: 'Perdido'
    };
    return { badge: badges[status] || badges.NEW, label: labels[status] || status };
  };

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="p-4 bg-gray-100 rounded-full mb-4">
          <Inbox className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay leads disponibles</h3>
        <p className="text-gray-500 text-center max-w-sm">
          Comienza agregando nuevos leads o selecciona un filtro diferente para ver leads existentes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map(lead => {
        const statusInfo = getStatusBadge(lead.status);
        return (
          <div
            key={lead.id}
            onClick={() => onLeadClick(lead)}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-100 to-purple-100 rounded-lg flex-shrink-0">
                <User className="h-6 w-6 text-orange-600" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                      {lead.contact.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span>{lead.contact.phone}</span>
                      </div>
                      {lead.contact.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{lead.contact.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusInfo.badge}`}>
                      {statusInfo.label}
                    </span>
                    {lead.tags && lead.tags.length > 0 && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium whitespace-nowrap">
                        {lead.tags[0]}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      {lead.leadType === 'PROPERTY_LEAD' ? (
                        <>
                          <Home className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Lead de Propiedad</span>
                        </>
                      ) : (
                        <>
                          <SearchIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Lead de Búsqueda</span>
                        </>
                      )}
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        lead.operationType === 'SELL'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {lead.operationType === 'SELL' ? 'Venta' : 'Renta'}
                      </span>
                    </div>

                    {lead.property && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {lead.property.location?.neighborhood}, {lead.property.location?.district}
                          </span>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(lead.property.price.amount, lead.property.price.currency)}
                        </div>
                      </div>
                    )}

                    {lead.search && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {lead.search.neighborhood}, {lead.search.district}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatCurrency(lead.search.minPrice, 'MXN')} - {formatCurrency(lead.search.maxPrice, 'MXN')}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {lead.appointment && lead.appointment.type !== 'NOT_SCHEDULED' && (
                      <div className="flex items-center gap-2 text-sm bg-green-50 px-3 py-2 rounded-lg">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="font-medium text-green-800">
                            {lead.appointment.type === 'VISIT' ? 'Visita' : 'Llamada'}
                          </div>
                          {lead.appointment.date && (
                            <div className="text-xs text-green-600">
                              {format(new Date(lead.appointment.date), "dd MMM yyyy 'a las' HH:mm", { locale: es })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {lead.notes && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded line-clamp-2">
                        {lead.notes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Creado: {format(new Date(lead.createdAt), 'dd MMM yyyy', { locale: es })}</span>
                    </div>
                    {lead.lastContactedAt && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>Último contacto: {format(new Date(lead.lastContactedAt), 'dd MMM yyyy', { locale: es })}</span>
                      </div>
                    )}
                  </div>
                  {lead.quality?.csat && (
                    <div className="text-sm text-gray-600">
                      ⭐ {lead.quality.csat}/5
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
