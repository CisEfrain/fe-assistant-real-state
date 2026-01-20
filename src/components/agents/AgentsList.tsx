import React from 'react';
import { Bot, Plus, Settings, Eye, Calendar, MessageSquare, Copy } from 'lucide-react';
import { useState } from 'react';
import { useAgentStore } from '../../stores/useAgentStore';
import { AGENT_TYPES, TASK_TYPES } from '../../types/agents';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AgentTemplateSelector } from './AgentTemplateSelector';

export const AgentsList: React.FC = () => {
  const { agents, setCurrentAgent, deleteAgent, duplicateAgent, loading } = useAgentStore();
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [deletingAgent, setDeletingAgent] = useState<string | null>(null);
  const [duplicatingAgent, setDuplicatingAgent] = useState<string | null>(null);

  if (showTemplateSelector) {
    return <AgentTemplateSelector onBack={() => setShowTemplateSelector(false)} />;
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'deprecated': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'draft': return 'Borrador';
      case 'deprecated': return 'Obsoleto';
      default: return 'Sin estado';
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'classifier': return <Settings className="h-4 w-4" />;
      case 'rag_qa': return <MessageSquare className="h-4 w-4" />;
      case 'appointment_booking': return <Calendar className="h-4 w-4" />;
      case 'property_lookup': return <Eye className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const handleDeleteAgent = async (agentId: string, agentName: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar el agente "${agentName}"?`)) {
      setDeletingAgent(agentId);
      try {
        await deleteAgent(agentId);
      } catch (error) {
        console.error('Error deleting agent:', error);
      } finally {
        setDeletingAgent(null);
      }
    }
  };

  const handleDuplicateAgent = async (agentId: string, agentName: string) => {
    if (confirm(`¿Quieres crear una copia del agente "${agentName}"?`)) {
      setDuplicatingAgent(agentId);
      try {
        const duplicatedAgent = await duplicateAgent(agentId);
        // Opcional: seleccionar el agente duplicado automáticamente
        // setCurrentAgent(duplicatedAgent);
      } catch (error) {
        console.error('Error duplicating agent:', error);
      } finally {
        setDuplicatingAgent(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Botón Crear Nuevo */}
      <div className="flex justify-end">
        <button 
          onClick={() => setShowTemplateSelector(true)}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Crear Nuevo Agente
        </button>
      </div>

      {/* Grid de Agentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const taskTypes = [...new Set(agent.tasks.map(t => t.type))];
          const enabledTasks = agent.tasks.filter(t => t.enabled).length;
          
          return (
            <div
              key={agent.id}
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => setCurrentAgent(agent)}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 border-b border-purple-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{agent.alias}</h3>
                      <p className="text-sm text-purple-700">{AGENT_TYPES[agent.type as keyof typeof AGENT_TYPES] || agent.type}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(agent.status)}`}>
                    {getStatusLabel(agent.status)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">{agent.description}</p>
              </div>

              {/* Métricas */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{agent.tasks.length}</div>
                    <div className="text-xs text-gray-500">Tareas Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{enabledTasks}</div>
                    <div className="text-xs text-gray-500">Habilitadas</div>
                  </div>
                </div>

                {/* Tipos de Tareas */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Tipos de Tareas:</div>
                  <div className="flex flex-wrap gap-2">
                    {taskTypes.slice(0, 4).map((type) => (
                      <div key={type} className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {getTaskTypeIcon(type)}
                        <span>{TASK_TYPES[type as keyof typeof TASK_TYPES] || type}</span>
                      </div>
                    ))}
                    {taskTypes.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                        +{taskTypes.length - 4} más
                      </span>
                    )}
                  </div>
                </div>

                {/* Última actualización */}
                <div className="text-xs text-gray-500">
                  Actualizado: {agent.updatedAt && format(new Date(agent.updatedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${agent.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-xs text-gray-600">
                      {agent.enabled ? 'Habilitado' : 'Deshabilitado'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateAgent(agent.id, agent.alias);
                      }}
                      disabled={duplicatingAgent === agent.id}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                    >
                      {duplicatingAgent === agent.id ? 'Duplicando...' : 'Duplicar'}
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAgent(agent.id, agent.alias);
                      }}
                      disabled={deletingAgent === agent.id}
                      className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                    >
                      {deletingAgent === agent.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                    <button className="text-xs text-purple-600 hover:text-purple-800 font-medium">
                      Configurar →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estado vacío */}
      {agents.length === 0 && (
        <div className="text-center py-12">
          <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay agentes configurados</h3>
          <p className="text-gray-500 mb-6">Crea tu primer asistente conversacional para comenzar</p>
          <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg">
            <Plus className="h-5 w-5 mr-2" />
            Crear Primer Agente
          </button>
        </div>
      )}
    </div>
  );
};