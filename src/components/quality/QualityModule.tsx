import React, { useState, useMemo, useEffect } from 'react';
import { MessageSquare, TrendingUp } from 'lucide-react';
import { useInteractionStore } from '../../stores/useInteractionStore';
import { QualityMetrics } from './QualityMetrics';
import { CSATDistribution } from './CSATDistribution';
import { ComplaintAnalysis } from './ComplaintAnalysis';
import { HumanEscalation } from './HumanEscalation';
import { QualityFilters } from './QualityFilters';

export const QualityModule: React.FC = () => {
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
    operationType: '',
    leadType: '',
    csatLevel: '',
    hasComplaint: '',
    humanRequest: ''
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

  // Filtrar llamadas según los filtros aplicados
  const filteredInteractions = useMemo(() => {
    return interactions.filter(interaction => {
      // Aplicar filtros
      if (filters.channel && interaction.channel !== filters.channel) return false;
      if (filters.operationType && interaction.operation_type !== filters.operationType) return false;
      if (filters.leadType && interaction.lead_type !== filters.leadType) return false;
      if (filters.csatLevel && interaction.quality.csat !== filters.csatLevel) return false;
      if (filters.hasComplaint && (filters.hasComplaint === 'true' ? !interaction.quality.complaint : interaction.quality.complaint)) return false;
      if (filters.humanRequest && (filters.humanRequest === 'true' ? !interaction.quality.human_request : interaction.quality.human_request)) return false;

      return true;
    });
  }, [interactions, filters]);

  // Métricas rápidas
  const csatShown = interactions.filter(interaction => interaction.show_csat);
  const csatResponded = csatShown.filter(interaction => interaction.quality.csat);
  const complaints = filteredInteractions.filter(interaction => interaction.quality.complaint);
  const humanRequests = filteredInteractions.filter(interaction => interaction.quality.human_request);

  return (
    <div className="space-y-8">
      {/* Selector de Período */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Período de Análisis</h3>
            <p className="text-sm text-gray-600">Selecciona el período para el análisis de calidad</p>
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
          Analizando {filteredInteractions.length.toLocaleString()} interacciones del período seleccionado
        </div>
      </div>

      {/* Métricas Principales */}
      <QualityMetrics interactions={filteredInteractions} />

      {/* Filtros */}
      <QualityFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Resumen de Filtros */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Resumen de Análisis</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-600">{filteredInteractions.length}</div>
            <div className="text-sm text-gray-600">Interacciones Analizadas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {csatShown.length > 0 ? ((csatResponded.length / csatShown.length) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-gray-600">Tasa Respuesta CSAT</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {((complaints.length / filteredInteractions.length) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Tasa de Reclamos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {((humanRequests.length / filteredInteractions.length) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Escalamiento Humano</div>
          </div>
        </div>
      </div>

      {/* Distribución CSAT */}
      <CSATDistribution interactions={filteredInteractions} />

      {/* Análisis de Reclamos y Escalamiento */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div>
          <ComplaintAnalysis interactions={filteredInteractions} />
        </div>
        <div>
          <HumanEscalation interactions={filteredInteractions} />
        </div>
      </div>

    </div>
  );
};