import React from 'react';
import { AlertTriangle, MessageSquare, TrendingDown, FileText } from 'lucide-react';
import { InteractionRecord } from '../../types';

interface ComplaintAnalysisProps {
  interactions: InteractionRecord[];
}

export const ComplaintAnalysis: React.FC<ComplaintAnalysisProps> = ({ interactions }) => {
  const interactionsWithComplaints = interactions.filter(interaction => interaction.quality.complaint);
  
  // Análisis por tipo de operación
  const complaintsBySell = interactionsWithComplaints.filter(interaction => interaction.operation_type === 'SELL').length;
  const complaintsByRent = interactionsWithComplaints.filter(interaction => interaction.operation_type === 'RENT').length;

  // Análisis por tipo de lead
  const complaintsByLeadType = {
    'Lead de propiedad': interactionsWithComplaints.filter(interaction => interaction.lead_type === 'PROPERTY_LEAD').length,
    'Lead de búsqueda': interactionsWithComplaints.filter(interaction => interaction.lead_type === 'SEARCH_LEAD').length,
    'BIN Lead': interactionsWithComplaints.filter(interaction => interaction.lead_type === 'LOCATION_LEAD').length,
  };

  const getLeadTypeLabel = (leadType: string) => {
    switch (leadType) {
      case 'PROPERTY_LEAD': return 'Lead de propiedad';
      case 'SEARCH_LEAD': return 'Lead de búsqueda';
      case 'LOCATION_LEAD': return 'BIN Lead';
      default: return leadType;
    }
  };

  return (
    <div className="space-y-6">
      {/* Métricas Generales */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Análisis de Reclamos</h3>
              <p className="text-red-100 text-sm">{interactionsWithComplaints.length} reclamos de {interactions.length} interacciones</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tasa General */}
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {((interactionsWithComplaints.length / interactions.length) * 100).toFixed(2)}%
              </div>
              <div className="text-sm text-gray-600">Tasa de Reclamos</div>
            </div>

            {/* Por Operación */}
            <div>
              <div className="text-sm text-gray-600 mb-2">Por Tipo de Operación</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Ventas</span>
                  <div className="text-right">
                    <span className="font-bold text-orange-600">{complaintsBySell}</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({interactionsWithComplaints.length > 0 ? ((complaintsBySell / interactionsWithComplaints.length) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Rentas</span>
                  <div className="text-right">
                    <span className="font-bold text-indigo-600">{complaintsByRent}</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({interactionsWithComplaints.length > 0 ? ((complaintsByRent / interactionsWithComplaints.length) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Por Tipo de Lead */}
            <div>
              <div className="text-sm text-gray-600 mb-2">Por Tipo de Lead</div>
              <div className="space-y-1">
                {Object.entries(complaintsByLeadType).map(([leadType, count]) => (
                  <div key={leadType} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{leadType}</span>
                    <span className="text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Reclamos */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Lista de Reclamos Registrados</h3>
              <p className="text-orange-100 text-sm">Reclamos textuales reportados por los usuarios</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {interactionsWithComplaints.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay reclamos registrados</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {interactionsWithComplaints.map((interaction, index) => (
                <div key={interaction.phonecall_id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">
                        Interacción #{interaction.phonecall_id}
                      </span>
                    </div>
                    <div className="text-xs text-red-600">
                      {getLeadTypeLabel(interaction.lead_type)} - {interaction.operation_type === 'SELL' ? 'Venta' : 'Renta'}
                    </div>
                  </div>
                  <p className="text-sm text-red-700 bg-white p-3 rounded border border-red-200">
                    "{interaction.quality.complaint}"
                  </p>
                  <div className="mt-2 text-xs text-red-600">
                    {new Date(interaction.created_at).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Insights */}
        </div>
      </div>
    </div>
  );
};