import React, { useState } from 'react';
import { Code, Database, Settings, AlertTriangle, Download, Upload } from 'lucide-react';
import { useAgentStore } from '../../../stores/useAgentStore';

export const AgentAdvanced: React.FC = () => {
  const { currentAgent, updateAgent } = useAgentStore();
  const [activeSection, setActiveSection] = useState<'agent' | 'orchestration' | 'tasks'>('agent');
  const [jsonError, setJsonError] = useState<string>('');

  if (!currentAgent) return null;

  const handleJsonUpdate = (section: string, jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      setJsonError('');
      
      switch (section) {
        case 'agent':
          updateAgent({ ...currentAgent, ...parsed });
          break;
        case 'orchestration':
          updateAgent({
            ...currentAgent,
            orchestration: { ...currentAgent.orchestration, ...parsed }
          });
          break;
        case 'tasks':
          updateAgent({
            ...currentAgent,
            tasks: parsed
          });
          break;
      }
    } catch (error) {
      setJsonError(`Error de formato JSON: ${error instanceof Error ? error.message : 'Formato inválido'}`);
    }
  };

  const exportConfiguration = () => {
    const config = {
      agent: currentAgent,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent_${currentAgent.alias.replace(/\s+/g, '_')}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sections = [
    { id: 'agent', label: 'Configuración del Agente', icon: Settings },
    { id: 'orchestration', label: 'Orquestación', icon: Database },
    { id: 'tasks', label: 'Tareas', icon: Code }
  ];

  const getJsonForSection = (section: string) => {
    switch (section) {
      case 'agent':
        const { orchestration, tasks, ...agentConfig } = currentAgent;
        return JSON.stringify(agentConfig, null, 2);
      case 'orchestration':
        return JSON.stringify(currentAgent.orchestration, null, 2);
      case 'tasks':
        return JSON.stringify(currentAgent.tasks, null, 2);
      default:
        return '{}';
    }
  };

  return (
    <div className="space-y-8">
      {/* Controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">Editor JSON</h3>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={exportConfiguration}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar Configuración
        </button>
      </div>

      {/* Editor JSON */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">
            {sections.find(s => s.id === activeSection)?.label}
          </h4>
        </div>
        
        <div className="p-4">
          <textarea
            value={getJsonForSection(activeSection)}
            onChange={(e) => handleJsonUpdate(activeSection, e.target.value)}
            rows={20}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
            style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
          />
          
          {jsonError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <span className="text-sm font-medium text-red-800">Error de formato:</span>
                  <p className="text-sm text-red-700 mt-1">{jsonError}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Configuración de Conversación */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Settings className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Configuración de Conversación</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Límite de Historial (mensajes)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={currentAgent.conversationConfig?.historyLimit || 10}
              onChange={(e) => {
                const newConfig = {
                  ...currentAgent.conversationConfig,
                  historyLimit: parseInt(e.target.value)
                };
                updateAgent({
                  ...currentAgent,
                  conversationConfig: newConfig
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Número de mensajes previos que el asistente recordará en cada conversación.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TTL de Sesión (segundos)
            </label>
            <input
              type="number"
              min="300"
              max="86400"
              value={currentAgent.conversationConfig?.sessionTTL || 3600}
              onChange={(e) => {
                const newConfig = {
                  ...currentAgent.conversationConfig,
                  sessionTTL: parseInt(e.target.value)
                };
                updateAgent({
                  ...currentAgent,
                  conversationConfig: newConfig
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Tiempo de vida de la sesión en segundos (3600 = 1 hora).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Máximo Historial en Redis
            </label>
            <input
              type="number"
              min="10"
              max="200"
              value={currentAgent.conversationConfig?.maxHistoryInRedis || 50}
              onChange={(e) => {
                const newConfig = {
                  ...currentAgent.conversationConfig,
                  maxHistoryInRedis: parseInt(e.target.value)
                };
                updateAgent({
                  ...currentAgent,
                  conversationConfig: newConfig
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Máximo de mensajes almacenados en caché para rendimiento.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modelo de IA por Defecto
            </label>
            <input
              type="text"
              value={currentAgent.conversationConfig?.model || 'gpt-4o'}
              onChange={(e) => {
                const newConfig = {
                  ...currentAgent.conversationConfig,
                  model: e.target.value
                };
                updateAgent({
                  ...currentAgent,
                  conversationConfig: newConfig
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="gpt-4o"
            />
            <p className="text-sm text-gray-500 mt-1">
              Modelo de IA usado para conversaciones generales.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Creatividad por Defecto
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={currentAgent.conversationConfig?.temperature || 0.7}
              onChange={(e) => {
                const newConfig = {
                  ...currentAgent.conversationConfig,
                  temperature: parseFloat(e.target.value)
                };
                updateAgent({
                  ...currentAgent,
                  conversationConfig: newConfig
                });
              }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Preciso</span>
              <span className="font-medium">{currentAgent.conversationConfig?.temperature || 0.7}</span>
              <span>Creativo</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Nivel de creatividad para conversaciones generales.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longitud de Respuestas por Defecto
            </label>
            <input
              type="number"
              min="100"
              max="2000"
              value={currentAgent.conversationConfig?.maxTokens || 1000}
              onChange={(e) => {
                const newConfig = {
                  ...currentAgent.conversationConfig,
                  maxTokens: parseInt(e.target.value)
                };
                updateAgent({
                  ...currentAgent,
                  conversationConfig: newConfig
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Longitud máxima de respuestas en conversaciones generales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};