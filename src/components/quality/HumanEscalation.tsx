import React from 'react';
import { Users, Phone, Clock, CheckCircle, XCircle } from 'lucide-react';
import { InteractionRecord } from '../../types';

interface HumanEscalationProps {
  interactions: InteractionRecord[];
}

export const HumanEscalation: React.FC<HumanEscalationProps> = ({ interactions }) => {
  const humanRequests = interactions.filter(interaction => interaction.quality.human_request);
  const humanNoResponse = interactions.filter(interaction => interaction.quality.human_resquest_no_response);
  const humanResponded = humanRequests.filter(interaction => !interaction.quality.human_resquest_no_response);

  // Análisis por tipo de operación
  const escalationBySell = humanRequests.filter(interaction => interaction.operation_type === 'SELL').length;
  const escalationByRent = humanRequests.filter(interaction => interaction.operation_type === 'RENT').length;

  // Análisis por tipo de lead
  const escalationByLeadType = {
    'Lead de propiedad': humanRequests.filter(interaction => interaction.lead_type === 'PROPERTY_LEAD').length,
    'Lead de búsqueda': humanRequests.filter(interaction => interaction.lead_type === 'SEARCH_LEAD').length,
  };

  // Tasa de respuesta de agentes
  const agentResponseRate = humanRequests.length > 0 ? (humanResponded.length / humanRequests.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Métricas Generales */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Escalamiento a Agentes Humanos</h3>
              <p className="text-orange-100 text-sm">{humanRequests.length} solicitudes de {interactions.length} interacciones</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Tasa de Escalamiento */}
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {((humanRequests.length / interactions.length) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Tasa de Escalamiento</div>
            </div>

            {/* Agentes Respondieron */}
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {humanResponded.length}
              </div>
              <div className="text-sm text-gray-600">Agentes Respondieron</div>
              <div className="text-xs text-green-600 font-medium">
                {agentResponseRate.toFixed(1)}% de respuesta
              </div>
            </div>

            {/* Agentes No Respondieron */}
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {humanNoResponse.length}
              </div>
              <div className="text-sm text-gray-600">Sin Respuesta</div>
              <div className="text-xs text-red-600 font-medium">
                {humanRequests.length > 0 ? ((humanNoResponse.length / humanRequests.length) * 100).toFixed(1) : 0}% sin atender
              </div>
            </div>

            {/* Eficiencia IA */}
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {(((interactions.length - humanRequests.length) / interactions.length) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Resuelto por IA</div>
              <div className="text-xs text-blue-600 font-medium">
                Sin intervención humana
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Análisis Detallado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por Tipo de Operación */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Escalamiento por Operación</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Ventas</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-orange-600">{escalationBySell}</span>
                <div className="text-sm text-gray-500">
                  {humanRequests.length > 0 ? ((escalationBySell / humanRequests.length) * 100).toFixed(1) : 0}% del total
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-indigo-500 rounded-full"></div>
                <span className="font-medium text-gray-900">Rentas</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-indigo-600">{escalationByRent}</span>
                <div className="text-sm text-gray-500">
                  {humanRequests.length > 0 ? ((escalationByRent / humanRequests.length) * 100).toFixed(1) : 0}% del total
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>Insight:</strong> {escalationBySell > escalationByRent ? 'Las ventas' : 'Las rentas'} requieren más intervención humana, 
              posiblemente debido a la complejidad de {escalationBySell > escalationByRent ? 'procesos crediticios' : 'requisitos específicos'}.
            </p>
          </div>
        </div>

        {/* Por Tipo de Lead */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Escalamiento por Tipo de Lead</h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(escalationByLeadType).map(([leadType, count]) => {
              const percentage = humanRequests.length > 0 ? (count / humanRequests.length) * 100 : 0;
              const color = leadType === 'PROPERTY_LEAD' ? 'blue' : leadType === 'SEARCH_LEAD' ? 'green' : 'purple';
              
              return (
                <div key={leadType} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 bg-${color}-500 rounded-full`}></div>
                    <span className="font-medium text-gray-900">{leadType}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-bold text-${color}-600`}>{count}</span>
                    <div className="text-sm text-gray-500">
                      {percentage.toFixed(1)}% del total
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Estado de Respuesta */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Estado de Respuesta de Agentes</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-600">{humanResponded.length}</div>
              <div className="text-sm text-green-800">Escalamientos Atendidos</div>
              <div className="text-xs text-green-600">
                {agentResponseRate.toFixed(1)}% de efectividad
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <XCircle className="h-8 w-8 text-red-600" />
            <div>
              <div className="text-2xl font-bold text-red-600">{humanNoResponse.length}</div>
              <div className="text-sm text-red-800">Sin Respuesta de Agente</div>
              <div className="text-xs text-red-600">
                Oportunidad de mejora
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};