import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import { useInteractionStore } from '../../stores/useInteractionStore';
import { AppointmentCalendar } from './AppointmentCalendar';
import { AppointmentList } from './AppointmentList';
import { AppointmentMetrics } from './AppointmentMetrics';
import { AppointmentFilters } from './AppointmentFilters';

export const AppointmentsModule: React.FC = () => {
  const { 
    interactions, 
    loading,
    fetchInteractions,
    dateFilters,
    setDateFilters,
    setPeriodDays
  } = useInteractionStore();
  const [selectedDate, setSelectedDate] = useState<Date>();
  
  const [filters, setFilters] = useState({
    channel: '',
    appointmentType: '',
    leadType: '',
    operationType: '',
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

  // Filtrar solo llamadas con citas agendadas
  const appointmentsWithFilters = useMemo(() => {
    return interactions.filter(interaction => {
      // Solo llamadas con citas agendadas
      if (!interaction.appointment?.type || interaction.appointment.type === 'NOT_SCHEDULED') return false;
      if (!interaction.appointment.date) return false;

      // Aplicar filtros
      if (filters.channel && interaction.channel !== filters.channel) return false;
      if (filters.appointmentType && interaction.appointment.type !== filters.appointmentType) return false;
      if (filters.leadType && interaction.lead_type !== filters.leadType) return false;
      if (filters.operationType && interaction.operation_type !== filters.operationType) return false;
      if (filters.urgency && interaction.evaluation?.support_needed !== filters.urgency) return false;

      return true;
    });
  }, [interactions, filters]);

  const totalInteractionsWithAppointments = interactions.filter(interaction => 
    interaction.appointment?.type && interaction.appointment.type !== 'NOT_SCHEDULED'
  ).length;

  return (
    <div className="space-y-8">
      {/* Selector de Período */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Período de Análisis</h3>
            <p className="text-sm text-gray-600">Selecciona el período para el análisis de citas</p>
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
          Analizando {appointmentsWithFilters.length.toLocaleString()} citas del período seleccionado
        </div>
      </div>

      {/* Métricas Principales */}
      <AppointmentMetrics 
        appointments={appointmentsWithFilters} 
        totalInteractions={interactions.length}
      />

      {/* Filtros */}
      <AppointmentFilters filters={filters} onFilterChange={handleFilterChange} />

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
            <div className="text-2xl font-bold text-purple-600">{appointmentsWithFilters.length}</div>
            <div className="text-sm text-gray-600">Citas Filtradas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {((appointmentsWithFilters.length / totalInteractionsWithAppointments) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Del Total de Citas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {appointmentsWithFilters.filter(a => a.appointment?.type === 'VISIT').length}
            </div>
            <div className="text-sm text-gray-600">Visitas Presenciales</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {appointmentsWithFilters.filter(a => a.appointment?.type === 'PHONE_CALL').length}
            </div>
            <div className="text-sm text-gray-600">Llamadas de Seguimiento</div>
          </div>
        </div>
      </div>

      {/* Calendario y Lista */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <AppointmentCalendar
          appointments={appointmentsWithFilters}
          onDateSelect={setSelectedDate}
          selectedDate={selectedDate}
        />
        
        <AppointmentList
          appointments={appointmentsWithFilters}
          selectedDate={selectedDate}
        />
      </div>

    </div>
  );
};