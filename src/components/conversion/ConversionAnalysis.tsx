import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, Filter, BarChart3, Eye } from 'lucide-react';
import { useInteractionStore } from '../../stores/useInteractionStore';
import { ConversionFunnel } from './ConversionFunnel';
import { ConversionFilters } from './ConversionFilters';
import { ConversionComparison } from './ConversionComparison';
import { Home, Calendar, CheckCircle, Users, XCircle } from 'lucide-react';

export const ConversionAnalysis: React.FC = () => {
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
    propertyType: '',
    priceRange: '',
    urgency: ''
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

  // Filtrar solo PROPERTY_LEAD
  const propertyLeads = useMemo(() => {
    return interactions.filter(interaction => {
      if (interaction.lead_type !== 'PROPERTY_LEAD') return false;
      if (!interaction.original_property) return false;

      // Aplicar filtros
      if (filters.channel && interaction.channel !== filters.channel) return false;
      if (filters.operationType && interaction.operation_type !== filters.operationType) return false;
      if (filters.propertyType && interaction.original_property.property_type !== filters.propertyType) return false;
      
      // Filtro de precio
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-').map(Number);
        const price = interaction.original_property.price.amount;
        if (price < min || price > max) return false;
      }

      // Filtro de urgencia
      if (filters.urgency && interaction.evaluation?.support_needed !== filters.urgency) return false;

      return true;
    });
  }, [interactions, filters]);

  // Calcular etapas del funnel
  const funnelStages = useMemo(() => {
    const totalLeads = propertyLeads.length;
    const withEvaluation = propertyLeads.filter(interaction => interaction.evaluation);
    const withAppointment = propertyLeads.filter(interaction => 
      interaction.appointment?.type && interaction.appointment.type !== 'NOT_SCHEDULED'
    );
    const withVisit = propertyLeads.filter(interaction => interaction.appointment?.type === 'VISIT');
    const withoutAction = propertyLeads.filter(interaction => 
      !interaction.appointment?.type || interaction.appointment.type === 'NOT_SCHEDULED'
    );

    const calculateValue = (interactions: typeof propertyLeads) => {
      return interactions.reduce((sum, interaction) => sum + (interaction.original_property?.price?.amount || 0), 0);
    };

    return [
      {
        name: 'Interacciones Recibidas',
        leads: totalLeads,
        percentage: 100,
        value: calculateValue(propertyLeads),
        color: 'from-blue-500 to-blue-600',
        icon: Home
      },
      {
        name: 'Con Precalificación',
        leads: withEvaluation.length,
        percentage: totalLeads > 0 ? (withEvaluation.length / totalLeads) * 100 : 0,
        value: calculateValue(withEvaluation),
        color: 'from-green-500 to-green-600',
        icon: CheckCircle
      },
      {
        name: 'Con Cita Agendada',
        leads: withAppointment.length,
        percentage: totalLeads > 0 ? (withAppointment.length / totalLeads) * 100 : 0,
        value: calculateValue(withAppointment),
        color: 'from-purple-500 to-purple-600',
        icon: Calendar
      },
      {
        name: 'Solo Visita Presencial',
        leads: withVisit.length,
        percentage: totalLeads > 0 ? (withVisit.length / totalLeads) * 100 : 0,
        value: calculateValue(withVisit),
        color: 'from-orange-500 to-orange-600',
        icon: Eye
      },
      {
        name: 'Sin Acción Posterior',
        leads: withoutAction.length,
        percentage: totalLeads > 0 ? (withoutAction.length / totalLeads) * 100 : 0,
        value: calculateValue(withoutAction),
        color: 'from-gray-500 to-gray-600',
        icon: XCircle
      }
    ];
  }, [propertyLeads]);

  // Datos para comparación SELL vs RENT
  const comparisonData = useMemo(() => {
    const sellLeads = propertyLeads.filter(interaction => interaction.operation_type === 'SELL');
    const rentLeads = propertyLeads.filter(interaction => interaction.operation_type === 'RENT');

    const sellWithAppointment = sellLeads.filter(interaction => 
      interaction.appointment?.type && interaction.appointment.type !== 'NOT_SCHEDULED'
    );
    const rentWithAppointment = rentLeads.filter(interaction => 
      interaction.appointment?.type && interaction.appointment.type !== 'NOT_SCHEDULED'
    );

    const sellTotalValue = sellLeads.reduce((sum, interaction) => sum + (interaction.original_property?.price?.amount || 0), 0);
    const rentTotalValue = rentLeads.reduce((sum, interaction) => sum + (interaction.original_property?.price?.amount || 0), 0);
    const sellCapturedValue = sellWithAppointment.reduce((sum, interaction) => sum + (interaction.original_property?.price?.amount || 0), 0);
    const rentCapturedValue = rentWithAppointment.reduce((sum, interaction) => sum + (interaction.original_property?.price?.amount || 0), 0);

    return {
      sell: {
        totalLeads: sellLeads.length,
        withAppointment: sellWithAppointment.length,
        conversionRate: sellLeads.length > 0 ? (sellWithAppointment.length / sellLeads.length) * 100 : 0,
        totalValue: sellTotalValue,
        capturedValue: sellCapturedValue
      },
      rent: {
        totalLeads: rentLeads.length,
        withAppointment: rentWithAppointment.length,
        conversionRate: rentLeads.length > 0 ? (rentWithAppointment.length / rentLeads.length) * 100 : 0,
        totalValue: rentTotalValue,
        capturedValue: rentCapturedValue
      }
    };
  }, [propertyLeads]);

  return (
    <div className="space-y-8">
      {/* Selector de Período */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Período de Análisis</h3>
            <p className="text-sm text-gray-600">Selecciona el período para el análisis de conversión</p>
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
          Analizando {propertyLeads.length.toLocaleString()} leads de propiedad del período seleccionado
        </div>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{propertyLeads.length.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Property Leads</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {propertyLeads.filter(interaction => interaction.evaluation).length.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Con Precalificación</div>
              <div className="text-xs text-green-600 font-medium">
                {propertyLeads.length > 0 
                  ? ((propertyLeads.filter(interaction => interaction.evaluation).length / propertyLeads.length) * 100).toFixed(1)
                  : 0}% del total
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {propertyLeads.filter(interaction => 
                  interaction.appointment?.type && interaction.appointment.type !== 'NOT_SCHEDULED' 
                ).length.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Leads de propiedad con Cita</div>
              <div className="text-xs text-purple-600 font-medium">
                {propertyLeads.length > 0 
                  ? ((propertyLeads.filter(interaction => 
                      interaction.appointment?.type && interaction.appointment.type !== 'NOT_SCHEDULED'
                    ).length / propertyLeads.length) * 100).toFixed(1)
                  : 0}% conversión
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {propertyLeads.filter(interaction => interaction.appointment?.type === 'VISIT').length.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Leads de propiedad - Visitas</div>
              <div className="text-xs text-orange-600 font-medium">
                {propertyLeads.length > 0 
                  ? ((propertyLeads.filter(interaction => interaction.appointment?.type === 'VISIT').length / propertyLeads.length) * 100).toFixed(1)
                  : 0}% del total
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <ConversionFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Funnel de Conversión */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <ConversionFunnel 
            stages={funnelStages} 
            operationType={filters.operationType as 'SELL' | 'RENT' | 'ALL' || 'ALL'} 
          />
        </div>
        <div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Resumen de Filtros</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Canal:</span>
                <span className="font-medium">{filters.channel || 'Todos'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Operación:</span>
                <span className="font-medium">{filters.operationType || 'Todas'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo de Propiedad:</span>
                <span className="font-medium">{filters.propertyType || 'Todos'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rango de Precio:</span>
                <span className="font-medium">{filters.priceRange || 'Todos'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Urgencia:</span>
                <span className="font-medium">{filters.urgency || 'Todas'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Período:</span>
                <span className="font-medium">{filters.dateRange ? `${filters.dateRange} días` : 'Todo'}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Insights del Filtro</h4>
              <p className="text-sm text-gray-600">
                {propertyLeads.length > 0 
                  ? `Analizando ${propertyLeads.length} leads que cumplen los criterios seleccionados.`
                  : 'No hay leads que cumplan con los filtros actuales.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparación SELL vs RENT */}
      <ConversionComparison data={comparisonData} />
    </div>
  );
};