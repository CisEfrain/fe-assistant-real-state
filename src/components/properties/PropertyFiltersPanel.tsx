import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { PropertyFilters } from '../../types/properties';

interface PropertyFiltersPanelProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
}

export const PropertyFiltersPanel: React.FC<PropertyFiltersPanelProps> = ({
  filters,
  onFiltersChange
}) => {
  const updateFilter = (key: keyof PropertyFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'ACTIVE',
      sortBy: 'publishedDate',
      sortOrder: 'DESC'
    });
  };

  const hasActiveFilters = filters.searchTerm || filters.type || filters.operationType ||
    filters.minPrice || filters.maxPrice || filters.minBedrooms;

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
            placeholder="Buscar por título, descripción o ubicación..."
            value={filters.searchTerm || ''}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={filters.status || ''}
            onChange={(e) => updateFilter('status', e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVE">Activas</option>
            <option value="SOLD">Vendidas</option>
            <option value="RENTED">Rentadas</option>
            <option value="INACTIVE">Inactivas</option>
          </select>

          <select
            value={filters.type || ''}
            onChange={(e) => updateFilter('type', e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            <option value="HOUSE">Casa</option>
            <option value="APARTMENT">Departamento</option>
            <option value="CONDO">Condominio</option>
            <option value="OFFICE">Oficina</option>
            <option value="LAND">Terreno</option>
            <option value="COMMERCIAL">Comercial</option>
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
            value={filters.sortBy || 'publishedDate'}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="publishedDate">Más recientes</option>
            <option value="price">Precio</option>
            <option value="views">Más vistas</option>
            <option value="leads">Más leads</option>
            <option value="lastUpdated">Última actualización</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio mínimo
            </label>
            <input
              type="number"
              placeholder="0"
              value={filters.minPrice || ''}
              onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio máximo
            </label>
            <input
              type="number"
              placeholder="Sin límite"
              value={filters.maxPrice || ''}
              onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recámaras mínimas
            </label>
            <select
              value={filters.minBedrooms || ''}
              onChange={(e) => updateFilter('minBedrooms', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Cualquiera</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
