import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Eye, Settings, Brain, List, Database, Code, MessageSquare, HelpCircle, GitBranch, Sparkles, Cog, BookOpen, User } from 'lucide-react';
import { useAgentStore } from '../../stores/useAgentStore';
import { AgentSummary } from './tabs/AgentSummary';
import { GuidedAgentConfig } from './GuidedAgentConfig';
import { AgentBrain } from './tabs/AgentBrain';
import { AgentTasks } from './tabs/AgentTasks';
import { AgentTesting } from './tabs/AgentTesting';
import { AgentAdvanced } from './tabs/AgentAdvanced';
import { PriorityFlowView } from './tabs/PriorityFlowView';
import { AgentFactDefinitions } from './tabs/AgentFactDefinitions';
import { AgentKnowledge } from './tabs/AgentKnowledge';
import { HelpDialog } from './HelpDialog';

type TabType = 'summary' | 'brain' | 'tasks' | 'knowledge' | 'facts' | 'flow' | 'testing' | 'advanced';

const GUIDED_MODE_KEY = 'inmobiliario_agent_mode';

export const AgentEditor: React.FC = () => {
  const { currentAgent, setCurrentAgent, saveAgent, loading } = useAgentStore();
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [showHelp, setShowHelp] = useState(false);
  const [isGuidedMode, setIsGuidedMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(GUIDED_MODE_KEY);
    return saved ? saved === 'guided' : true;
  });

  useEffect(() => {
    localStorage.setItem(GUIDED_MODE_KEY, isGuidedMode ? 'guided' : 'advanced');
  }, [isGuidedMode]);

  if (!currentAgent) return null;

  const allTabs = [
    { id: 'summary', label: 'Identidad', icon: User, guidedVisible: true },
    { id: 'knowledge', label: 'Conocimiento', icon: BookOpen, guidedVisible: true },
    { id: 'tasks', label: 'Habilidades', icon: List, guidedVisible: true },
    { id: 'testing', label: 'Probar Conversación', icon: MessageSquare, guidedVisible: true },
    { id: 'facts', label: 'Facts Personalizados', icon: Database, guidedVisible: false },
    { id: 'flow', label: 'Flujo de Prioridades', icon: Brain, guidedVisible: false },
    { id: 'advanced', label: 'Configuración Técnica', icon: Code, guidedVisible: false }
  ];

  const tabs = isGuidedMode
    ? allTabs.filter(tab => tab.guidedVisible)
    : allTabs;

  const handleModeToggle = () => {
    setIsGuidedMode(!isGuidedMode);
    if (!isGuidedMode && (activeTab === 'facts' || activeTab === 'flow' || activeTab === 'advanced')) {
      setActiveTab('summary');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'knowledge':
        return <AgentKnowledge />;
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
        return isGuidedMode ? <GuidedAgentConfig /> : <AgentSummary />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
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

        <div className="flex items-center justify-center pt-4 border-t border-gray-100">
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => !isGuidedMode && handleModeToggle()}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                isGuidedMode
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Modo Guiado
            </button>
            <button
              onClick={() => isGuidedMode && handleModeToggle()}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                !isGuidedMode
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Cog className="h-4 w-4 mr-2" />
              Modo Avanzado
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