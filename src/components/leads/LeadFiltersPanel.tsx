import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { LeadFilters } from '../../types/leads';

interface LeadFiltersPanelProps {
  filters: LeadFilters;
  onFiltersChange: (filters: LeadFilters) => void;
}

export const LeadFiltersPanel: React.FC<LeadFiltersPanelProps> = ({
  filters,
  onFiltersChange
}) => {
  const updateFilter = (key: keyof LeadFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    });
  };

  const hasActiveFilters = filters.searchTerm || filters.status || filters.leadType ||
    filters.operationType || filters.source || filters.hasAppointment !== undefined;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
          >
            <X className="h-4 w-4" />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o notas..."
            value={filters.searchTerm || ''}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <select
            value={filters.status || ''}
            onChange={(e) => updateFilter('status', e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="NEW">Nuevo</option>
            <option value="CONTACTED">Contactado</option>
            <option value="QUALIFIED">Calificado</option>
            <option value="APPOINTMENT_SCHEDULED">Cita Agendada</option>
            <option value="VIEWED_PROPERTY">Visitó Propiedad</option>
            <option value="NEGOTIATING">Negociando</option>
            <option value="WON">Ganado</option>
            <option value="LOST">Perdido</option>
          </select>

          <select
            value={filters.operationType || ''}
            onChange={(e) => updateFilter('operationType', e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Venta y Renta</option>
            <option value="SELL">Solo Venta</option>
            <option value="RENT">Solo Renta</option>
          </select>

          <select
            value={filters.source || ''}
            onChange={(e) => updateFilter('source', e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Todas las fuentes</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="webchat">Web Chat</option>
            <option value="widget_testing">Widget Testing</option>
          </select>

          <select
            value={filters.sortBy || 'createdAt'}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="createdAt">Más recientes</option>
            <option value="lastUpdated">Última actualización</option>
            <option value="lastContactedAt">Último contacto</option>
            <option value="status">Por estado</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hasAppointment === true}
              onChange={(e) => updateFilter('hasAppointment', e.target.checked ? true : undefined)}
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <span>Solo con citas agendadas</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Orden:</span>
            <button
              onClick={() => updateFilter('sortOrder', filters.sortOrder === 'ASC' ? 'DESC' : 'ASC')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              {filters.sortOrder === 'ASC' ? '↑ Ascendente' : '↓ Descendente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
