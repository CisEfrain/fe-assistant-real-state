import React from 'react';
import { Bot, Info, Shield, Building, MessageSquare, Settings, Phone, MessageCircle, AlertTriangle, Brain } from 'lucide-react';
import { useAgentStore } from '../../../stores/useAgentStore';
import { AGENT_TYPES } from '../../../types/agents';

export const AgentSummary: React.FC = () => {
  const { currentAgent, updateAgent, saveAgent, loading } = useAgentStore();

  if (!currentAgent) return null;

  const handleUpdate = (field: string, value: any) => {
    const updatedAgent = {
      ...currentAgent,
      [field]: value,
      updatedAt: new Date()
    };
    updateAgent(updatedAgent);
  };

  const handleSave = async () => {
    if (currentAgent) {
      await saveAgent(currentAgent);
    }
  };

  return (
    <div className="space-y-8">
      {/* Información Básica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4" />
                <span>Alias del Agente</span>
              </div>
            </label>
            <input
              type="text"
              value={currentAgent.alias}
              onChange={(e) => handleUpdate('alias', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ej: Santi - Agente Inmobiliario"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              value={currentAgent.name}
              onChange={(e) => handleUpdate('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Nombre descriptivo del agente"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Agente
            </label>
            <select
              value={currentAgent.type}
              onChange={(e) => handleUpdate('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {Object.entries(AGENT_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              value={currentAgent.description || ''}
              onChange={(e) => handleUpdate('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Describe el propósito y funcionalidades del agente..."
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Estado y Configuración */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Estado y Conexión del Agente</h3>
              <button
                onClick={handleSave}
                disabled={loading}
                className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 text-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : null}
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Canal de Comunicación</span>
                <div className="flex items-center space-x-2">
                  {currentAgent.channel === 'whatsapp' && (
                    <MessageCircle className="h-4 w-4 text-green-600" />
                  )}
                  {currentAgent.channel === 'webchat' && (
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                  )}
                  {currentAgent.channel === 'widget_testing' && (
                    <Settings className="h-4 w-4 text-orange-600" />
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {currentAgent.channel === 'whatsapp' && 'WhatsApp'}
                    {currentAgent.channel === 'webchat' && 'Web Chat'}
                    {currentAgent.channel === 'widget_testing' && 'Widget Testing'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estado de Conexión</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${currentAgent.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-sm font-medium ${currentAgent.connected ? 'text-green-600' : 'text-red-600'}`}>
                    {currentAgent.connected ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estado</span>
                <select
                  value={currentAgent.status || 'draft'}
                  onChange={(e) => handleUpdate('status', e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="draft">Borrador</option>
                  <option value="active">Activo</option>
                  <option value="deprecated">Obsoleto</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Habilitado</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentAgent.enabled || false}
                    onChange={(e) => handleUpdate('enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
             
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Captura de datos para analitica</span>
                <select
                  value={currentAgent.analyticsType || 'DISABLED'}
                  onChange={(e) => handleUpdate('analyticsType', e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="DISABLED">Deshabilitado</option>
                  <option value="IAD_LEADS">IAD Leads</option>
                  <option value="PON">PON</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <div>Tareas configuradas: <span className="font-medium">{currentAgent.tasks.length}</span></div>
                  <div>Tareas habilitadas: <span className="font-medium">{currentAgent.tasks.filter(t => t.enabled).length}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personalidad y Conversación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Personalidad y Tono del Asistente</span>
            </div>
          </label>
          <textarea
            value={currentAgent.agentTone || ''}
            onChange={(e) => handleUpdate('agentTone', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Describe la personalidad y tono del asistente: amable, profesional, empático, etc..."
          />
          <p className="text-sm text-gray-500 mt-2">
            Define cómo debe sonar y comportarse tu asistente en términos de personalidad.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Objetivos e Instrucciones Generales</span>
            </div>
          </label>
          <textarea
            value={currentAgent.conversationPrompt || ''}
            onChange={(e) => handleUpdate('conversationPrompt', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Describe los objetivos principales y reglas generales del asistente..."
          />
          <p className="text-sm text-gray-500 mt-2">
            Define los objetivos principales y reglas generales que debe seguir el asistente.
          </p>
        </div>
      </div>

      {/* Variables de Personalización - REMOVIDO */}
      {/* <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Personalidad y Tono del Asistente</span>
          </div>
        </label>
        <textarea
          value={currentAgent.conversationPrompt || ''}
          onChange={(e) => handleUpdate('conversationPrompt', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Describe cómo debe comportarse tu asistente: su tono, estilo, y personalidad general..."
        />
        <p className="text-sm text-gray-500 mt-2">
          Estas instrucciones se aplicarán a todas las conversaciones del asistente.
        </p>

      {/* Reglas de Negocio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Reglas de Negocio</span>
          </div>
        </label>
        <div className="space-y-3">
          {(currentAgent.businessRules || []).map((rule, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="text"
                value={rule}
                onChange={(e) => {
                  const newRules = [...(currentAgent.businessRules || [])];
                  newRules[index] = e.target.value;
                  handleUpdate('businessRules', newRules);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ej: Siempre capturar datos de contacto completos"
              />
              <button
                onClick={() => {
                  const newRules = (currentAgent.businessRules || []).filter((_, i) => i !== index);
                  handleUpdate('businessRules', newRules);
                }}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Eliminar
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newRules = [...(currentAgent.businessRules || []), ''];
              handleUpdate('businessRules', newRules);
            }}
            className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
          >
            + Agregar Regla de Negocio
          </button>
        </div>
      </div>

      {/* Información de Negocio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Información de Negocio</span>
          </div>
        </label>
        <div className="space-y-3">
          {(currentAgent.businessInformation || []).map((info, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="text"
                value={info}
                onChange={(e) => {
                  const newInfo = [...(currentAgent.businessInformation || [])];
                  newInfo[index] = e.target.value;
                  handleUpdate('businessInformation', newInfo);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ej: Especialistas en propiedades residenciales y comerciales"
              />
              <button
                onClick={() => {
                  const newInfo = (currentAgent.businessInformation || []).filter((_, i) => i !== index);
                  handleUpdate('businessInformation', newInfo);
                }}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Eliminar
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newInfo = [...(currentAgent.businessInformation || []), ''];
              handleUpdate('businessInformation', newInfo);
            }}
            className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
          >
            + Agregar Información de Negocio
          </button>
        </div>
      </div>

      {/* Comportamiento por Defecto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Comportamiento por Defecto</span>
          </div>
        </label>
        <textarea
          value={currentAgent.orchestration?.fallbackBehavior || ''}
          onChange={(e) => {
            const updatedAgent = {
              ...currentAgent,
              orchestration: {
                ...currentAgent.orchestration,
                fallbackBehavior: e.target.value
              },
              updatedAt: new Date()
            };
            updateAgent(updatedAgent);
          }}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="¿Qué debe hacer si no entiende al usuario? Ej: Si no entiendo algo, pedir aclaración de manera amable..."
        />
        <p className="text-sm text-gray-500 mt-2">
          Define qué debe hacer el asistente cuando ninguna prioridad específica se activa o no entiende al usuario.
        </p>
      </div>
    </div>
  );
};