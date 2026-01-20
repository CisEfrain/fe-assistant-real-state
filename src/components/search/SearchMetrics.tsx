import React from 'react';
import { Search, MapPin, Home, Phone, Star } from 'lucide-react';

interface SearchMetricsProps {
  totalSearches: number;
  avgPriceRange: { min: number; max: number };
  topStates: Array<{ name: string; count: number }>;
  topPropertyTypes: Array<{ name: string; count: number }>;
  communicationPreference: { whatsapp: number; phone: number };
  qualificationDistribution: { hot: number; moderate: number; unlikely: number };
}

export const SearchMetrics: React.FC<SearchMetricsProps> = ({
  totalSearches,
  avgPriceRange,
  topStates,
  topPropertyTypes,
  communicationPreference,
  qualificationDistribution
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getQualificationColor = (qualification: string) => {
    switch (qualification) {
      case 'hot': return 'text-red-600 bg-red-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'unlikely': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total de Búsquedas */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
            <Search className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{totalSearches.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total de Búsquedas</div>
          </div>
        </div>
      </div>

      {/* Rango de Precio Promedio */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
            <Home className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(avgPriceRange.min)} - {formatCurrency(avgPriceRange.max)}
            </div>
            <div className="text-sm text-gray-600">Rango Promedio</div>
          </div>
        </div>
      </div>

      {/* Estados Principales */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Estados Principales</div>
            <div className="space-y-1">
              {topStates.slice(0, 3).map((state, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="font-medium text-gray-900">{state.name}</span>
                  <span className="text-gray-600">{state.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tipos de Propiedad */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
            <Home className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Tipos Más Buscados</div>
            <div className="space-y-1">
              {topPropertyTypes.slice(0, 3).map((type, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="font-medium text-gray-900">{type.name}</span>
                  <span className="text-gray-600">{type.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preferencia de Comunicación */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg">
            <Phone className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Comunicación Preferida</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-900">WhatsApp</span>
                <span className="text-green-600 font-semibold">
                  {((communicationPreference.whatsapp / (communicationPreference.whatsapp + communicationPreference.phone)) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-900">Teléfono</span>
                <span className="text-blue-600 font-semibold">
                  {((communicationPreference.phone / (communicationPreference.whatsapp + communicationPreference.phone)) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución de Calificación */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg">
            <Star className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Nivel de Interés</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getQualificationColor('hot')}`}>
                  HOT
                </span>
                <span className="text-sm font-medium text-gray-900">{qualificationDistribution.hot}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getQualificationColor('moderate')}`}>
                  MODERATE
                </span>
                <span className="text-sm font-medium text-gray-900">{qualificationDistribution.moderate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getQualificationColor('unlikely')}`}>
                  UNLIKELY
                </span>
                <span className="text-sm font-medium text-gray-900">{qualificationDistribution.unlikely}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};