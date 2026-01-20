import React from 'react';
import { MessageSquare, Star, AlertTriangle, Users, Phone, TrendingUp } from 'lucide-react';
import { InteractionRecord } from '../../types';

interface QualityMetricsProps {
  interactions: InteractionRecord[];
}

export const QualityMetrics: React.FC<QualityMetricsProps> = ({ interactions }) => {
  // Métricas de CSAT
  const csatShown = interactions.filter(interaction => interaction.quality.show_csat);
  const csatResponded = csatShown.filter(interaction => interaction.quality.csat);
  const csatResponseRate = csatShown.length > 0 ? (csatResponded.length / csatShown.length) * 100 : 0;

  // Satisfacción positiva
  const positiveCsat = csatResponded.filter(interaction => {
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
  const satisfactionRate = csatResponded.length > 0 ? (positiveCsat.length / csatResponded.length) * 100 : 0;

  // Reclamos
  const interactionsWithComplaints = interactions.filter(interaction => interaction.quality.complaint);
  const complaintRate = (interactionsWithComplaints.length / interactions.length) * 100;

  // Escalamiento humano
  const humanRequests = interactions.filter(interaction => interaction.quality.human_request);
  const humanRequestRate = (humanRequests.length / interactions.length) * 100;

  // No respuesta de agente
  const humanNoResponse = interactions.filter(interaction => interaction.quality.human_resquest_no_response);
  const noResponseRate = humanRequests.length > 0 ? (humanNoResponse.length / humanRequests.length) * 100 : 0;

  // Usuarios que no recibieron encuesta
  const noSurveyRate = ((interactions.length - csatShown.length) / interactions.length) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Tasa de Respuesta CSAT */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{csatResponseRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Tasa de Respuesta CSAT</div>
            <div className="text-xs text-blue-600 font-medium">
              {csatResponded.length} de {csatShown.length} encuestas
            </div>
          </div>
        </div>
      </div>

      {/* Satisfacción Positiva */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
            <Star className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{satisfactionRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Satisfacción Positiva</div>
            <div className="text-xs text-green-600 font-medium">
              {positiveCsat.length} usuarios satisfechos
            </div>
          </div>
        </div>
      </div>

      {/* Tasa de Reclamos */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{complaintRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Tasa de Reclamos</div>
            <div className="text-xs text-red-600 font-medium">
              {interactionsWithComplaints.length} reclamos registrados
            </div>
          </div>
        </div>
      </div>

      {/* Escalamiento a Humano */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{humanRequestRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Escalamiento a Humano</div>
            <div className="text-xs text-orange-600 font-medium">
              {humanRequests.length} solicitudes de agente
            </div>
          </div>
        </div>
      </div>

      {/* Agente No Responde */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg">
            <Phone className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{noResponseRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Agente No Responde</div>
            <div className="text-xs text-yellow-600 font-medium">
              {humanNoResponse.length} de {humanRequests.length} escalamientos
            </div>
          </div>
        </div>
      </div>

      {/* Sin Encuesta */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{noSurveyRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Sin Encuesta Ofrecida</div>
            <div className="text-xs text-purple-600 font-medium">
              {interactions.length - csatShown.length} usuarios sin CSAT
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};