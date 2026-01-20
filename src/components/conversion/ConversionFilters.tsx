import React from 'react';
import { Filter, Calendar, Home, DollarSign, Clock, MessageCircle } from 'lucide-react';

interface ConversionFiltersProps {
  filters: {
    channel: string;
    operationType: string;
    propertyType: string;
    priceRange: string;
    urgency: string;
    dateRange: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export const ConversionFilters: React.FC<ConversionFiltersProps> = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
          <Filter className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Filtros de Análisis</h3>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Todos los canales</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="call">Llamada</option>
            <option value="webchat">Web Chat</option>
            <option value="widget_testing">Widget Testing</option>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Todas</option>
            <option value="SELL">Venta</option>
            <option value="RENT">Renta</option>
          </select>
        </div>

        {/* Tipo de Propiedad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-1">
              <Home className="h-4 w-4" />
              <span>Tipo de Propiedad</span>
            </div>
          </label>
          <select
            value={filters.propertyType}
            onChange={(e) => onFilterChange('propertyType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Todos</option>
            <option value="HOUSE">Casa</option>
            <option value="APARTMENT">Departamento</option>
            <option value="CONDO">Condominio</option>
            <option value="OFFICE">Oficina</option>
          </select>
        </div>

        {/* Rango de Precio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4" />
              <span>Rango de Precio</span>
            </div>
          </label>
          <select
            value={filters.priceRange}
            onChange={(e) => onFilterChange('priceRange', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Todos</option>
            <option value="0-2000000">Hasta $2M</option>
            <option value="2000000-5000000">$2M - $5M</option>
            <option value="5000000-10000000">$5M - $10M</option>
            <option value="10000000-999999999">Más de $10M</option>
          </select>
        </div>

        {/* Urgencia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Urgencia</span>
            </div>
          </label>
          <select
            value={filters.urgency}
            onChange={(e) => onFilterChange('urgency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Todas</option>
            <option value="IMMEDIATE">Inmediata</option>
            <option value="JUST_INFO">Solo información</option>
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