import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Home,
  Search as SearchIcon,
  Calendar,
  Clock,
  Tag
} from 'lucide-react';
import { Lead } from '../../types/leads';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onClick }) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency === 'MXN' ? 'MXN' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getLeadTypeIcon = () => {
    return lead.leadType === 'PROPERTY_LEAD' ? (
      <Home className="h-4 w-4" />
    ) : (
      <SearchIcon className="h-4 w-4" />
    );
  };

  const getLeadTypeLabel = () => {
    return lead.leadType === 'PROPERTY_LEAD' ? 'Propiedad' : 'Búsqueda';
  };

  const getOperationTypeBadge = () => {
    return lead.operationType === 'SELL'
      ? 'bg-orange-100 text-orange-800'
      : 'bg-blue-100 text-blue-800';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
              {lead.contact.name}
            </h4>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <Phone className="h-3 w-3" />
              <span className="truncate">{lead.contact.phone}</span>
            </div>
          </div>
          {lead.tags && lead.tags.length > 0 && (
            <span className="flex-shrink-0 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
              {lead.tags[0]}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getOperationTypeBadge()}`}>
              {getLeadTypeIcon()}
              {getLeadTypeLabel()}
            </span>
            <span className="text-xs text-gray-500">
              {lead.operationType === 'SELL' ? 'Venta' : 'Renta'}
            </span>
          </div>

          {lead.property && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="h-3 w-3" />
                <span className="truncate text-xs">
                  {lead.property.location?.neighborhood || 'Sin ubicación'}
                </span>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {formatCurrency(lead.property.price.amount, lead.property.price.currency)}
              </div>
            </div>
          )}

          {lead.search && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="h-3 w-3" />
                <span className="truncate text-xs">
                  {lead.search.neighborhood}, {lead.search.district}
                </span>
              </div>
              <div className="text-xs text-gray-600">
                {formatCurrency(lead.search.minPrice, 'MXN')} - {formatCurrency(lead.search.maxPrice, 'MXN')}
              </div>
            </div>
          )}

          {lead.appointment && lead.appointment.type !== 'NOT_SCHEDULED' && (
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              <Calendar className="h-3 w-3" />
              <span>
                {lead.appointment.date
                  ? format(new Date(lead.appointment.date), 'dd MMM', { locale: es })
                  : 'Cita programada'}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            <span>{format(new Date(lead.createdAt), 'dd MMM', { locale: es })}</span>
          </div>
          {lead.quality?.csat && (
            <div className="text-xs text-gray-600">
              ⭐ {lead.quality.csat}/5
            </div>
          )}
        </div>

        {lead.notes && (
          <div className="text-xs text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded">
            {lead.notes}
          </div>
        )}
      </div>
    </div>
  );
};
