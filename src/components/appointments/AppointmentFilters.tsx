import React from 'react';
import { Filter, Calendar, Home, Users, Clock, MessageCircle } from 'lucide-react';

interface AppointmentFiltersProps {
  filters: {
    channel: string;
    appointmentType: string;
    leadType: string;
    operationType: string;
    dateRange: string;
    urgency: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export const AppointmentFilters: React.FC<AppointmentFiltersProps> = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
          <Filter className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Filtros de Citas</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Canal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>Canal</span>
            </div>
          </label>
          <select
            value={filters.channel}
            onChange={(e) => onFilterChange('channel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Todos los canales</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="webchat">Web Chat</option>
            <option value="widget_testing">Widget Testing</option>
          </select>
        </div>

        {/* Tipo de Cita */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Tipo de Cita</span>
            </div>
          </label>
          <select
            value={filters.appointmentType}
            onChange={(e) => onFilterChange('appointmentType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            <option value="VISIT">Visita</option>
            <option value="PHONE_CALL">Llamada</option>
          </select>
        </div>

        {/* Tipo de Operación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-1">
              <Home className="h-4 w-4" />
              <span>Operación</span>
            </div>
          </label>
          <select
            value={filters.operationType}
            onChange={(e) => onFilterChange('operationType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Todas</option>
            <option value="SELL">Venta</option>
            <option value="RENT">Renta</option>
          </select>
        </div>



      </div>

      {/* Botón de limpiar filtros */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => {
            Object.keys(filters).forEach(key => onFilterChange(key, ''));
          }}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};