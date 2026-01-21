import React, { useEffect, useState } from 'react';
import {
  Phone,
  Calendar,
  CheckCircle,
  MessageSquare,
  Users,
  TrendingUp,
  Eye,
  UserCheck,
  Clock,
  BarChart3,
  RefreshCw,
  Star
} from 'lucide-react';
import { useInteractionStore } from '../../stores/useInteractionStore';
import { MetricCard } from './MetricCard';
import { ImpactBlock } from './ImpactBlock';
import { ComparisonTable } from './ComparisonTable';
import { env } from '../../env';

export const DashboardExecutive: React.FC = () => {
  const { 
    interactions, 
    loading, 
    fetchInteractions, 
    fetchDashboardMetrics, 
    getDashboardMetrics,
    checkConnection,
    dateFilters,
    setDateFilters
  } = useInteractionStore();
  
  const [metrics, setMetrics] = useState<ReturnType<typeof getDashboardMetrics> | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Crear safeMetrics con valores por defecto
  const safeMetrics = metrics && {
    totalInteractions: metrics.totalInteractions || 0,
    appointmentRate: metrics.appointmentRate || 0,
    appointmentDistribution: {
      visit: metrics.appointmentDistribution?.visit || 0,
      phone: metrics.appointmentDistribution?.phone || 0,
      none: metrics.appointmentDistribution?.none || 0
    },
    prequalificationRate: metrics.prequalificationRate || 0,
    csatResponseRate: metrics.csatResponseRate || 0,
    humanEscalationRate: metrics.humanEscalationRate || 0,
    economicImpact: {
      totalValue: metrics.economicImpact?.totalValue || 0,
      valueWithAppointment: metrics.economicImpact?.valueWithAppointment || 0,
      captureRate: metrics.economicImpact?.captureRate || 0
    },
    sellVsRent: {
      sell: {
        calls: metrics.sellVsRent?.sell?.calls || 0,
        appointmentRate: metrics.sellVsRent?.sell?.appointmentRate || 0,
        totalValue: metrics.sellVsRent?.sell?.totalValue || 0,
        valueWithAppointment: metrics.sellVsRent?.sell?.valueWithAppointment || 0
      },
      rent: {
        calls: metrics.sellVsRent?.rent?.calls || 0,
        appointmentRate: metrics.sellVsRent?.rent?.appointmentRate || 0,
        totalValue: metrics.sellVsRent?.rent?.totalValue || 0,
        valueWithAppointment: metrics.sellVsRent?.rent?.valueWithAppointment || 0
      }
    }
  };

  const handleDateChange = (field: 'start_date' | 'end_date', value: string) => {
    setDateFilters({
      ...dateFilters,
      [field]: value
    });
  };

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      // Cargar interacciones con filtros
      await fetchInteractions(dateFilters);

      // Intentar obtener métricas de la API
      try {
        const realMetrics = await fetchDashboardMetrics(dateFilters);
        setMetrics(realMetrics);
      } catch (apiError) {
        console.warn('API metrics not available');
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.warn('API not available');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await loadData();
  };

  // Efecto para actualizar cuando cambian los filtros de fecha
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilters]);
  // Calcular top de fuentes
  const topSources = React.useMemo(() => {
    if (!interactions || !Array.isArray(interactions)) {
      return [];
    }

    const sourceCount = interactions.reduce((acc, interaction) => {
      acc[interaction.source] = (acc[interaction.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sourceCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }));
  }, [interactions]);

  // Calcular satisfacción positiva corregida
  const csatResponses = (interactions || []).filter(interaction => interaction.quality.show_csat && interaction.quality.csat);
  const positiveCsat = csatResponses.filter(interaction => {
    const csat = interaction.quality.csat;
    // Manejar tanto valores numéricos como texto
    if (typeof csat === 'string') {
      return csat === 'Satisfecho' || csat === 'Muy satisfecho' ||
             csat === 'SATISFIED' || csat === 'VERY_SATISFIED' ||
             csat === '4' || csat === '5';
    }
    if (typeof csat === 'number') {
      return csat >= 4;
    }
    return false;
  });
  const satisfactionRate = csatResponses.length > 0 ? (positiveCsat.length / csatResponses.length) * 100 : 0;

  // Calcular interacciones fuera de horario
  const offHoursInteractions = (interactions || []).filter(interaction => {
    const date = new Date(interaction.created_at);
    const hour = date.getHours();
    const dayOfWeek = date.getDay(); // 0 = Domingo, 6 = Sábado

    // Domingo
    if (dayOfWeek === 0) return true;

    // Sábado: fuera de 9:00-14:00
    if (dayOfWeek === 6) {
      return hour < 9 || hour >= 14;
    }

    // Lunes a Viernes: fuera de 9:00-18:00
    return hour < 9 || hour >= 18;
  });
  const safeInteractionsLength = (interactions || []).length;
  const offHoursResponseRate = safeInteractionsLength > 0 ? (offHoursInteractions.length / safeInteractionsLength) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Selector de Período */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Período de Análisis</h3>
            <p className="text-sm text-gray-600">Selecciona el rango de fechas para el análisis</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                <input
                  type="date"
                  value={dateFilters.start_date}
                  onChange={(e) => handleDateChange('start_date', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                <input
                  type="date"
                  value={dateFilters.end_date}
                  onChange={(e) => handleDateChange('end_date', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <div className="mb-1"></div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-lg hover:from-orange-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                >
                  {isRefreshing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {isRefreshing ? 'Actualizando...' : 'Actualizar'}
                </button>
                
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          Última actualización: {lastRefresh.toLocaleString('es-MX')}
        </div>
      </div>

      {/* Impacto Global */}
      <ImpactBlock dateFilters={dateFilters} />

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="% Interacciones con Cita"
          value={safeMetrics ? `${safeMetrics.appointmentRate.toFixed(1)}%` : '—'}
          subtitle={
            safeMetrics
              ? `${(
                  safeMetrics.appointmentDistribution.visit +
                  safeMetrics.appointmentDistribution.phone
                ).toLocaleString()} citas total`
              : '—'
          }
          icon={Calendar}
          color="purple"
        />
        
        <MetricCard
          title="% Leads de Propiedad con Precalificación"
          value={safeMetrics ? `${safeMetrics.prequalificationRate.toFixed(1)}%` : '—'}
          subtitle="Solo leads de propiedad"
          icon={CheckCircle}
          color="green"
        />
        
        <MetricCard
          title="Tasa de Satisfacción Positiva (Encuesta)"
          value={`${satisfactionRate.toFixed(1)}%`}
          subtitle="Calificaciones 4-5 estrellas"
          icon={MessageSquare}
          color="green"
        />
        
        <MetricCard
          title="% que pidieron hablar con un humano"
          value={safeMetrics && safeMetrics.humanEscalationRate !== undefined ? `${safeMetrics.humanEscalationRate.toFixed(1)}%` : '—'}
          subtitle="Sobre el total de interacciones"
          icon={Users}
          color="red"
        />
      </div>

      {/* Métricas Adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total de Interacciones"
          value={safeMetrics ? safeMetrics.totalInteractions.toLocaleString() : '—'}
          subtitle="En el período seleccionado"
          icon={Phone}
          color="orange"
        />
        
        <MetricCard
          title="% Interacciones Fuera de Horario"
          value={`${offHoursResponseRate.toFixed(1)}%`}
          subtitle="Lun-Vie 9:00-18:00, Sáb 9:00-14:00"
          icon={Clock}
          color="blue"
        />
        
        <MetricCard
          title="% Respuesta a encuesta"
          value={safeMetrics ? `${safeMetrics.csatResponseRate.toFixed(1)}%` : '—'}
          subtitle="Encuestas respondidas"
          icon={Star}
          color="yellow"
        />
      </div>

      {/* Distribución de Citas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Citas de Visita"
          value={safeMetrics ? safeMetrics.appointmentDistribution.visit.toLocaleString() : '—'}
          icon={Eye}
          color="blue"
          size="small"
        />
        
        <MetricCard
          title="Llamadas de Seguimiento"
          value={safeMetrics ? safeMetrics.appointmentDistribution.phone.toLocaleString() : '—'}
          icon={Phone}
          color="green"
          size="small"
        />
        
        <MetricCard
          title="Sin Cita Agendada"
          value={safeMetrics ? safeMetrics.appointmentDistribution.none.toLocaleString() : '—'}
          icon={UserCheck}
          color="yellow"
          size="small"
        />
      </div>

      {/* Comparación SELL vs RENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Operaciones de Venta</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de interacciones</span>
              <span className="font-semibold text-gray-900">
                {safeMetrics ? safeMetrics.sellVsRent.sell.calls.toLocaleString() : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tasa de conversión a cita</span>
              <span className="font-semibold text-green-600">
                {safeMetrics ? `${safeMetrics.sellVsRent.sell.appointmentRate.toFixed(1)}%` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Valor total gestionado</span>
              <span className="font-semibold text-gray-900">
                {safeMetrics ? `$${(safeMetrics.sellVsRent.sell.totalValue / 1000000).toFixed(0)}M` : '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Operaciones de Renta</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de Interacciones</span>
              <span className="font-semibold text-gray-900">
                {safeMetrics ? safeMetrics.sellVsRent.rent.calls.toLocaleString() : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tasa de conversión a cita</span>
              <span className="font-semibold text-purple-600">
                {safeMetrics ? `${safeMetrics.sellVsRent.rent.appointmentRate.toFixed(1)}%` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Valor total gestionado</span>
              <span className="font-semibold text-gray-900">
                {safeMetrics ? `$${(safeMetrics.sellVsRent.rent.totalValue / 1000000).toFixed(1)}M` : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Comparación Económica y Top de Fuentes */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          {safeMetrics && <ComparisonTable metrics={safeMetrics} />}
        </div>
        
        {/* Top de Fuentes */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Top de Fuentes</h3>
                <p className="text-blue-100 text-sm">Principales canales de origen</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {topSources.map((item, index) => (
                <div key={item.source} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' :
                      'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{item.source}</div>
                      <div className="text-sm text-gray-500">
                        {safeInteractionsLength > 0 ? ((item.count / safeInteractionsLength) * 100).toFixed(1) : '0'}% del total
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {item.count.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};