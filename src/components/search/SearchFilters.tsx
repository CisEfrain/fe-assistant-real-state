import React from 'react';
import { Filter, MapPin, Home, DollarSign, Calendar, MessageCircle } from 'lucide-react';

interface SearchFiltersProps {
  filters: {
    channel: string;
    state: string;
    propertyType: string;
    priceRange: string;
    qualification: string;
    dateRange: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
          <Filter className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Filtros de Búsqueda</h3>
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

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>Estado</span>
            </div>
          </label>
          <select
            value={filters.state}
            onChange={(e) => onFilterChange('state', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="CDMX">Ciudad de México</option>
            <option value="Estado de México">Estado de México</option>
            <option value="Jalisco">Jalisco</option>
            <option value="Nuevo León">Nuevo León</option>
            <option value="Puebla">Puebla</option>
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
            <option value="">Todos los tipos</option>
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
            <option value="">Todos los rangos</option>
            <option value="0-15000">Hasta $15K</option>
            <option value="15000-25000">$15K - $25K</option>
            <option value="25000-50000">$25K - $50K</option>
            <option value="50000-999999">Más de $50K</option>
          </select>
        </div>

        {/* Calificación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-1">
              <span>Nivel de Interés</span>
            </div>
          </label>
          <select
            value={filters.qualification}
            onChange={(e) => onFilterChange('qualification', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Todos los niveles</option>
            <option value="HOT">Caliente</option>
            <option value="MODERATE">Moderado</option>
            <option value="UNLIKELY">Improbable</option>
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