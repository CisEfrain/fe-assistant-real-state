import React, { useEffect, useState } from 'react';
import { Bot, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { useAgentStore } from '../../stores/useAgentStore';
import { Agent } from '../../types/agents';

interface AgentSelectorProps {
  onSelectAgent: (agent: Agent) => void;
  selectedAgentId: string | null;
}

export const AgentSelector: React.FC<AgentSelectorProps> = ({ onSelectAgent, selectedAgentId }) => {
  const { agents, fetchAgents, loading, error } = useAgentStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // Cargar agentes al montar si no hay
    if (agents.length === 0) {
      fetchAgents();
    }
  }, [fetchAgents, agents.length]);

  const activeAgents = agents.filter(agent => 
    agent.enabled && 
    (agent.alias.toLowerCase().includes(searchTerm.toLowerCase()) || 
     agent.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
          <Bot className="h-4 w-4 mr-2 text-purple-600" />
          Seleccionar Agente
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          Elige un agente activo para comenzar la prueba
        </p>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar agente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {loading && agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            <RefreshCw className="h-6 w-6 animate-spin mb-2" />
            <span className="text-sm">Cargando agentes...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 text-red-500 p-4 text-center">
            <AlertCircle className="h-6 w-6 mb-2" />
            <span className="text-sm">{error}</span>
            <button 
              onClick={() => fetchAgents()}
              className="mt-2 text-xs text-purple-600 hover:underline"
            >
              Reintentar
            </button>
          </div>
        ) : activeAgents.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No se encontraron agentes activos
          </div>
        ) : (
          activeAgents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                selectedAgentId === agent.id
                  ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500'
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`font-medium text-sm ${
                    selectedAgentId === agent.id ? 'text-purple-900' : 'text-gray-900'
                  }`}>
                    {agent.alias}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                    {agent.description || 'Sin descripción'}
                  </p>
                </div>
                {agent.analyticsType === 'PON' && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800">
                    PON
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
      
      {/* Footer info */}
      <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
        <span className="text-[10px] text-gray-400">
          Mostrando {activeAgents.length} de {agents.length} agentes
        </span>
      </div>
    </div>
  );
};
