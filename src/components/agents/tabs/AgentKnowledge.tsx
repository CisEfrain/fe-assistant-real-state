import React, { useState } from 'react';
import { BookOpen, Plus, X, Edit2, Save } from 'lucide-react';
import { useAgentStore } from '../../../stores/useAgentStore';

export const AgentKnowledge: React.FC = () => {
  const { currentAgent, updateCurrentAgent } = useAgentStore();
  const [newRule, setNewRule] = useState('');
  const [newInfo, setNewInfo] = useState('');
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);
  const [editingInfoIndex, setEditingInfoIndex] = useState<number | null>(null);
  const [editRuleValue, setEditRuleValue] = useState('');
  const [editInfoValue, setEditInfoValue] = useState('');

  if (!currentAgent) return null;

  const businessRules = currentAgent.businessRules || [];
  const businessInformation = currentAgent.businessInformation || [];

  const handleAddRule = () => {
    if (!newRule.trim()) return;
    updateCurrentAgent({
      ...currentAgent,
      businessRules: [...businessRules, newRule]
    });
    setNewRule('');
  };

  const handleRemoveRule = (index: number) => {
    updateCurrentAgent({
      ...currentAgent,
      businessRules: businessRules.filter((_, i) => i !== index)
    });
  };

  const handleStartEditRule = (index: number) => {
    setEditingRuleIndex(index);
    setEditRuleValue(businessRules[index]);
  };

  const handleSaveEditRule = () => {
    if (editingRuleIndex === null) return;
    const updated = [...businessRules];
    updated[editingRuleIndex] = editRuleValue;
    updateCurrentAgent({
      ...currentAgent,
      businessRules: updated
    });
    setEditingRuleIndex(null);
    setEditRuleValue('');
  };

  const handleAddInfo = () => {
    if (!newInfo.trim()) return;
    updateCurrentAgent({
      ...currentAgent,
      businessInformation: [...businessInformation, newInfo]
    });
    setNewInfo('');
  };

  const handleRemoveInfo = (index: number) => {
    updateCurrentAgent({
      ...currentAgent,
      businessInformation: businessInformation.filter((_, i) => i !== index)
    });
  };

  const handleStartEditInfo = (index: number) => {
    setEditingInfoIndex(index);
    setEditInfoValue(businessInformation[index]);
  };

  const handleSaveEditInfo = () => {
    if (editingInfoIndex === null) return;
    const updated = [...businessInformation];
    updated[editingInfoIndex] = editInfoValue;
    updateCurrentAgent({
      ...currentAgent,
      businessInformation: updated
    });
    setEditingInfoIndex(null);
    setEditInfoValue('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <BookOpen className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Qué debe saber tu asistente?
            </h3>
            <p className="text-gray-700 text-sm">
              Aquí defines cómo debe comportarse tu asistente y qué información conoce sobre tu negocio.
              Estos datos guiarán todas sus conversaciones con los clientes.
            </p>
          </div>
        </div>
      </div>

      {/* Reglas de Comportamiento */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Reglas de Comportamiento
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Define cómo debe actuar tu asistente en las conversaciones
        </p>

        <div className="space-y-2 mb-4">
          {businessRules.map((rule, index) => (
            <div key={index} className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg group">
              {editingRuleIndex === index ? (
                <>
                  <input
                    type="text"
                    value={editRuleValue}
                    onChange={(e) => setEditRuleValue(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEditRule}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingRuleIndex(null)}
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="text-gray-800">{rule}</p>
                  </div>
                  <button
                    onClick={() => handleStartEditRule(index)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveRule(index)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddRule()}
            placeholder="Ej: Siempre saluda al cliente por su nombre"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleAddRule}
            disabled={!newRule.trim()}
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar
          </button>
        </div>
      </div>

      {/* Información del Negocio */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Información del Negocio
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Datos que tu asistente debe conocer sobre tu inmobiliaria
        </p>

        <div className="space-y-2 mb-4">
          {businessInformation.map((info, index) => (
            <div key={index} className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg group">
              {editingInfoIndex === index ? (
                <>
                  <input
                    type="text"
                    value={editInfoValue}
                    onChange={(e) => setEditInfoValue(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEditInfo}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingInfoIndex(null)}
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="text-gray-800">{info}</p>
                  </div>
                  <button
                    onClick={() => handleStartEditInfo(index)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveInfo(index)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newInfo}
            onChange={(e) => setNewInfo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddInfo()}
            placeholder="Ej: Horarios: Lunes a Viernes 9:00 - 18:00"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleAddInfo}
            disabled={!newInfo.trim()}
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-sm text-yellow-900">
          <strong>Tip:</strong> Mientras más específica sea la información, mejor atenderá tu asistente a los clientes.
          Incluye horarios, políticas, servicios especiales y cualquier dato importante de tu negocio.
        </p>
      </div>
    </div>
  );
};
