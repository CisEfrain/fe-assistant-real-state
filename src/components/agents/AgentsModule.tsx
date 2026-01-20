import React, { useEffect, useState } from 'react';
import { Bot, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useAgentStore } from '../../stores/useAgentStore';
import { AgentsList } from './AgentsList';
import { AgentEditor } from './AgentEditor';
import { QuickStartOnboarding } from './QuickStartOnboarding';

const ONBOARDING_KEY = 'inmobiliario_onboarding_completed';

export const AgentsModule: React.FC = () => {
  const {
    agents,
    currentAgent,
    loading,
    error,
    isOnline,
    fetchAgents,
    checkConnection,
    initializeMockData,
    setError
  } = useAgentStore();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await checkConnection();
      try {
        await fetchAgents();
      } catch (error) {
        console.warn('API not available, using mock data');
        initializeMockData();
      } finally {
        setDataLoaded(true);
      }
    };

    loadData();
  }, [fetchAgents, checkConnection, initializeMockData]);

  useEffect(() => {
    if (dataLoaded && !loading) {
      const onboardingCompleted = localStorage.getItem(ONBOARDING_KEY) === 'true';
      const hasNoAgents = agents.length === 0;

      if (hasNoAgents && !onboardingCompleted) {
        setShowOnboarding(true);
      }
    }
  }, [dataLoaded, loading, agents.length]);

  const handleCompleteOnboarding = () => {
    setShowOnboarding(false);
  };

  const handleSkipOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return (
      <QuickStartOnboarding
        onComplete={handleCompleteOnboarding}
        onSkip={handleSkipOnboarding}
      />
    );
  }

  return (
    <div className="space-y-6">
      {!currentAgent ? (
        <React.Fragment>
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Gestión de Asistentes Conversacionales</h2>
                  <p className="text-gray-600">Configura y administra agentes IA especializados en el sector inmobiliario</p>
                </div>
              </div>

              {/* Connection Status */}
              <div className="flex items-center space-x-3">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                  isOnline
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {isOnline ? (
                    <>
                      <Wifi className="h-4 w-4" />
                      <span>API Conectada</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4" />
                      <span>Modo Local</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Aviso</h4>
                    <p className="text-sm text-yellow-700 mt-1">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="text-xs text-yellow-600 hover:text-yellow-800 mt-2"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12">
              <div className="text-center">
                <div className="inline-flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600">Cargando agentes...</span>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Agentes */}
          {!loading && <AgentsList onStartOnboarding={() => setShowOnboarding(true)} />}
        </React.Fragment>
      ) : (
        <AgentEditor />
      )}
    </div>
  );
};