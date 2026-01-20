import React, { useState } from 'react';
import { ArrowLeft, Save, Eye, Settings, Brain, List, Database, Code, MessageSquare, HelpCircle, GitBranch } from 'lucide-react';
import { useAgentStore } from '../../stores/useAgentStore';
import { AgentSummary } from './tabs/AgentSummary';
import { AgentBrain } from './tabs/AgentBrain';
import { AgentTasks } from './tabs/AgentTasks';
import { AgentTesting } from './tabs/AgentTesting';
import { AgentAdvanced } from './tabs/AgentAdvanced';
import { PriorityFlowView } from './tabs/PriorityFlowView';
import { AgentFactDefinitions } from './tabs/AgentFactDefinitions';
import { HelpDialog } from './HelpDialog';

type TabType = 'summary' | 'brain' | 'tasks' | 'facts' | 'flow' | 'testing' | 'advanced';

export const AgentEditor: React.FC = () => {
  const { currentAgent, setCurrentAgent, saveAgent, loading } = useAgentStore();
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [showHelp, setShowHelp] = useState(false);

  if (!currentAgent) return null;

  const tabs = [
    { id: 'summary', label: 'Configuración General', icon: Settings },
    { id: 'tasks', label: 'Tareas', icon: List },
    { id: 'facts', label: 'Facts Personalizados', icon: Database },
    { id: 'flow', label: 'Flujo de Comportamiento', icon: Brain },
    { id: 'testing', label: 'Probar Agente', icon: MessageSquare },
    { id: 'advanced', label: 'Configuración Avanzada', icon: Code }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tasks':
        return <AgentTasks />;
      case 'facts':
        return <AgentFactDefinitions />;
      case 'flow':
        return <PriorityFlowView />;
      case 'testing':
        return <AgentTesting />;
      case 'advanced':
        return <AgentAdvanced />;
      default:
        return <AgentSummary />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentAgent(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentAgent.alias}</h1>
              <p className="text-gray-600">{currentAgent.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              currentAgent.status === 'active' ? 'bg-green-100 text-green-800' :
              currentAgent.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {currentAgent.status === 'active' ? 'Activo' : 
               currentAgent.status === 'draft' ? 'Borrador' : 'Obsoleto'}
            </span>
            <button
              onClick={() => setShowHelp(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Ayuda contextual"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            <button 
              onClick={() => saveAgent(currentAgent)}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Help Dialog */}
      <HelpDialog
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        activeTab={activeTab}
      />
    </div>
  );
};