import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, Home, DollarSign, Phone, Star } from 'lucide-react';
import { useInteractionStore } from '../../stores/useInteractionStore';
import { SearchMetrics } from './SearchMetrics';
import { SearchDistribution } from './SearchDistribution';
import { SearchFilters } from './SearchFilters';

export const SearchAnalysis: React.FC = () => {
  const { 
    interactions, 
    loading,
    fetchInteractions,
    dateFilters,
    setDateFilters,
    setPeriodDays
  } = useInteractionStore();
  
  const [filters, setFilters] = useState({
    channel: '',
    state: '',
    propertyType: '',
    priceRange: '',
    qualification: ''
  });

  // Cargar datos con filtros API
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchInteractions(dateFilters);
      } catch (error) {
        console.warn('API not available, using mock data');
      }
    };
    
    loadData();
  }, [dateFilters, fetchInteractions]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Filtrar solo SEARCH_LEAD
  const searchLeads = useMemo(() => {
    return (interactions || []).filter(interaction => {
      if (interaction.lead_type !== 'SEARCH_LEAD') return false;
      if (!interaction.search) return false;

      // Aplicar filtros
      if (filters.channel && interaction.channel !== filters.channel) return false;
      if (filters.state && interaction.search.state !== filters.state) return false;
      if (filters.propertyType && interaction.search.property_type !== filters.propertyType) return false;
      if (filters.qualification && interaction.search.qualification !== filters.qualification) return false;
      
      // Filtro de precio
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-').map(Number);
        const avgPrice = (interaction.search.minPrice + interaction.search.maxPrice) / 2;
        if (avgPrice < min || avgPrice > max) return false;
      }

      return true;
    });
  }, [interactions, filters]);

  // Calcular métricas
  const metrics = useMemo(() => {
    const totalSearches = searchLeads.length;
    
    // Rango de precio promedio
    const avgPriceRange = searchLeads.reduce((acc, call) => {
      acc.min += call.search!.minPrice;
      acc.max += call.search!.maxPrice;
      return acc;
    }, { min: 0, max: 0 });
    
    if (totalSearches > 0) {
      avgPriceRange.min = Math.round(avgPriceRange.min / totalSearches);
      avgPriceRange.max = Math.round(avgPriceRange.max / totalSearches);
    }

    // Estados principales
    const stateCount = searchLeads.reduce((acc, call) => {
      const state = call.search!.state;
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topStates = Object.entries(stateCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Tipos de propiedad principales
    const propertyTypeCount = searchLeads.reduce((acc, call) => {
      const type = call.search!.property_type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topPropertyTypes = Object.entries(propertyTypeCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Preferencia de comunicación
    const communicationPreference = searchLeads.reduce((acc, call) => {
      const method = call.search!.confirmation_method;
      if (method === 'whatsapp') acc.whatsapp++;
      else acc.phone++;
      return acc;
    }, { whatsapp: 0, phone: 0 });

    // Distribución de calificación
    const qualificationDistribution = searchLeads.reduce((acc, call) => {
      const qual = call.search!.qualification.toLowerCase();
      if (qual === 'hot') acc.hot++;
      else if (qual === 'moderate') acc.moderate++;
      else acc.unlikely++;
      return acc;
    }, { hot: 0, moderate: 0, unlikely: 0 });

    return {
      totalSearches,
      avgPriceRange,
      topStates,
      topPropertyTypes,
      communicationPreference,
      qualificationDistribution
    };
  }, [searchLeads]);

  // Datos para distribuciones
  const distributionData = useMemo(() => {
    // Distribución por estados
    const stateDistribution = metrics.topStates.map(state => ({
      label: state.name,
      count: state.count,
      percentage: (state.count / metrics.totalSearches) * 100
    }));

    // Distribución por municipios
    const districtCount = searchLeads.reduce((acc, call) => {
      const district = call.search!.district;
      acc[district] = (acc[district] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const districtDistribution = Object.entries(districtCount)
      .map(([label, count]) => ({
        label,
        count,
        percentage: (count / metrics.totalSearches) * 100
      }))
      .sort((a, b) => b.count - a.count);

    // Distribución por tipos de propiedad
    const propertyDistribution = metrics.topPropertyTypes.map(type => ({
      label: type.name,
      count: type.count,
      percentage: (type.count / metrics.totalSearches) * 100
    }));

    // Distribución por rangos de precio
    const priceRanges = [
      { label: 'Hasta $15K', min: 0, max: 15000 },
      { label: '$15K - $25K', min: 15000, max: 25000 },
      { label: '$25K - $35K', min: 25000, max: 35000 },
      { label: 'Más de $35K', min: 35000, max: Infinity }
    ];

    const priceDistribution = priceRanges.map(range => {
      const count = searchLeads.filter(call => {
        const avgPrice = (call.search!.minPrice + call.search!.maxPrice) / 2;
        return avgPrice >= range.min && avgPrice < range.max;
      }).length;

      const avgValue = searchLeads
        .filter(call => {
          const avgPrice = (call.search!.minPrice + call.search!.maxPrice) / 2;
          return avgPrice >= range.min && avgPrice < range.max;
        })
        .reduce((sum, call) => sum + (call.search!.minPrice + call.search!.maxPrice) / 2, 0) / (count || 1);

      return {
        label: range.label,
        count,
        percentage: (count / metrics.totalSearches) * 100,
        value: avgValue
      };
    });

    return {
      stateDistribution,
      districtDistribution,
      propertyDistribution,
      priceDistribution
    };
  }, [searchLeads, metrics]);

  return (
    <div className="space-y-8">
      {/* Selector de Período */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Período de Análisis</h3>
            <p className="text-sm text-gray-600">Selecciona el período para el análisis de búsquedas</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                <input
                  type="date"
                  value={dateFilters.start_date}
                  onChange={(e) => setDateFilters({ ...dateFilters, start_date: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                <input
                  type="date"
                  value={dateFilters.end_date}
                  onChange={(e) => setDateFilters({ ...dateFilters, end_date: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setPeriodDays(days)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          Analizando {searchLeads.length.toLocaleString()} leads de búsqueda del período seleccionado
        </div>
      </div>

      {/* Métricas Generales */}
      <SearchMetrics {...metrics} />

      {/* Filtros */}
      <SearchFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Distribuciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SearchDistribution
          title="Distribución por Estados"
          data={distributionData.stateDistribution}
          icon={MapPin}
          color="from-blue-500 to-blue-600"
        />

        <SearchDistribution
          title="Distribución por Municipios"
          data={distributionData.districtDistribution}
          icon={MapPin}
          color="from-green-500 to-green-600"
        />

        <SearchDistribution
          title="Tipos de Propiedad Más Buscados"
          data={distributionData.propertyDistribution}
          icon={Home}
          color="from-purple-500 to-purple-600"
        />

        <SearchDistribution
          title="Rangos de Precio Solicitados"
          data={distributionData.priceDistribution}
          icon={DollarSign}
          color="from-orange-500 to-orange-600"
          showValue={true}
        />
      </div>

    </div>
  );
};