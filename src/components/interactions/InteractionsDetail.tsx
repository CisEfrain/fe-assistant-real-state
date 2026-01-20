import React, { useState, useEffect } from 'react';
import { Phone, Filter, Download, BarChart3 } from 'lucide-react';
import { useInteractionStore } from '../../stores/useInteractionStore';
import { InteractionsTable } from './InteractionsTable';
import { InteractionDetailModal } from './InteractionDetailModal';
import { InteractionRecord } from '../../types';

export const InteractionsDetail: React.FC = () => {
  const { 
    interactions,
    dateFilters,
    setDateFilters,
    setPeriodDays,
    loading, 
    fetchInteractions
  } = useInteractionStore();
  const [selectedInteraction, setSelectedInteraction] = useState<InteractionRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar datos con filtros API (solo por fechas)

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

  const handleInteractionSelect = (interaction: InteractionRecord) => {
    setSelectedInteraction(interaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInteraction(null);
  };

  // Estadísticas rápidas
  const safeInteractions = interactions || [];
  const totalInteractions = safeInteractions.length;
  const interactionsWithAppointment = safeInteractions.filter(interaction =>
    interaction.appointment?.type && interaction.appointment.type !== 'NOT_SCHEDULED'
  ).length;
  const interactionsWithCsat = safeInteractions.filter(interaction => interaction.quality.show_csat && interaction.quality.csat).length;
  const escalatedInteractions = safeInteractions.filter(interaction => interaction.quality.human_request).length;

  return (
    <div className="space-y-8">
      {/* Selector de Período */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Período de Análisis</h3>
            <p className="text-sm text-gray-600">Selecciona el período para filtrar las interacciones</p>
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
          Mostrando datos del período seleccionado ({totalInteractions.toLocaleString()} interacciones)
        </div>
      </div>


      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalInteractions.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total de Interacciones</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{interactionsWithAppointment.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Con Cita Agendada</div>
              <div className="text-xs text-green-600 font-medium">
                {((interactionsWithAppointment / totalInteractions) * 100).toFixed(1)}% del total
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <Filter className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{interactionsWithCsat.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Con Encuesta Respondida</div>
              <div className="text-xs text-blue-600 font-medium">
                {((interactionsWithCsat / totalInteractions) * 100).toFixed(1)}% del total
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{escalatedInteractions.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Escaladas a Humano</div>
              <div className="text-xs text-red-600 font-medium">
                {((escalatedInteractions / totalInteractions) * 100).toFixed(1)}% del total
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución por Tipo de Lead */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Tipo de Lead</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { type: 'PROPERTY_LEAD', label: 'Lead de Propiedad' },
            { type: 'SEARCH_LEAD', label: 'Lead de Búsqueda' }
          ].map(({ type, label }) => {
            const count = safeInteractions.filter(interaction => interaction.lead_type === type).length;
            const percentage = totalInteractions > 0 ? ((count / totalInteractions) * 100).toFixed(1) : '0.0';

            return (
              <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{count.toLocaleString()}</div>
                <div className="text-sm text-gray-600">{label}</div>
                <div className="text-xs text-gray-500">{percentage}% del total</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabla de Interacciones */}
      <InteractionsTable interactions={safeInteractions} onInteractionSelect={handleInteractionSelect} />

      {/* Modal de Detalle */}
      {selectedInteraction && (
        <InteractionDetailModal
          interaction={selectedInteraction}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};