import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PlaygroundAuth } from './PlaygroundAuth';
import { AgentSelector } from './AgentSelector';
import { ChannelMetadataPanel } from './ChannelMetadataPanel';
import { ChatInterface } from './ChatInterface';
import { PONLeadForm } from './PONLeadForm';
import { env } from '../../env';
import { Agent } from '../../types/agents';
import { PlaygroundState, PONLeadFormData } from '../../types/playground';

export const PublicPlayground: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [playgroundState, setPlaygroundState] = useState<PlaygroundState>({
    isAuthenticated: false,
    selectedAgentId: null,
    selectedChannel: 'webchat',
    channelMetadata: { channel: 'webchat', intent: 'schedule_call' },
    customMetadata: []
  });
  
  // PON State
  const [showPONForm, setShowPONForm] = useState(false);
  const [ponLoading, setPonLoading] = useState(false);
  const [proactiveMessage, setProactiveMessage] = useState<string | undefined>(undefined);
  
  // UI State
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(false);

  useEffect(() => {
    // Check if password is not required (optional feature or dev mode)
    if (env.PLAYGROUND_ENABLED === 'true' && !env.PLAYGROUND_PASSWORD) {
        setIsAuthenticated(true);
    }
    // Check sessionStorage for persistence during refresh
    const sessionAuth = sessionStorage.getItem('playground_auth');
    if (sessionAuth === 'true') {
        setIsAuthenticated(true);
        const savedTester = sessionStorage.getItem('playground_tester');
        if (savedTester) {
            setPlaygroundState(prev => ({ ...prev, testerName: savedTester }));
        }
    }
  }, []);

  const handleAuthenticated = (name: string) => {
    setIsAuthenticated(true);
    setPlaygroundState(prev => ({ ...prev, testerName: name }));
    sessionStorage.setItem('playground_auth', 'true');
    sessionStorage.setItem('playground_tester', name);
  };

  const handleStateChange = (updates: Partial<PlaygroundState>) => {
    setPlaygroundState(prev => ({ ...prev, ...updates }));
  };

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    handleStateChange({ selectedAgentId: agent.id });
    setProactiveMessage(undefined); // Reset proactive message
    
    // Check if PON agent to show form initially
    if (agent.analyticsType === 'PON') {
      setShowPONForm(true);
      // Force WhatsApp channel for PON flow
      handleStateChange({ 
        selectedChannel: 'whatsapp',
        channelMetadata: { channel: 'whatsapp', phone: '+52' }
      });
    } else {
      setShowPONForm(false);
    }
  };

  const handlePONSubmit = async (formData: PONLeadFormData) => {
    setPonLoading(true);
    try {
      console.log('Sending PON lead to webhook:', formData);
      
      // Enviar datos al webhook de n8n
      const response = await axios.post(env.N8N_PON_LEAD_WEBHOOK_URL!, {
        ...formData,
        source: 'playground_test',
        tester: playgroundState.testerName || 'unknown'
      });
      
      // Update phone in metadata from form
      handleStateChange({
        channelMetadata: { 
          channel: 'whatsapp', 
          phone: formData.telefono 
        }
      });

      // Usar el mensaje devuelto por el webhook en el atributo "answer"
      if (response.data?.answer) {
        setProactiveMessage(response.data.answer);
      } else {
        // Fallback en caso de que la respuesta no tenga el formato esperado
        const fallbackResponse = `¡Hola ${formData.nombre}! 👋 Bienvenido a iad México. Recibimos tu interés en conocer más sobre nuestro modelo de negocio. Soy ${selectedAgent?.alias}, tu asistente virtual. ¿Estás listo para descubrir cómo puedes emprender en bienes raíces con nosotros?`;
        setProactiveMessage(fallbackResponse);
      }

      setShowPONForm(false);
      
    } catch (error) {
      console.error('Error creating PON lead:', error);
      alert('Error al enviar el lead al webhook. Por favor verifica la consola para más detalles.');
    } finally {
      setPonLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <PlaygroundAuth onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-lg">
             <span className="text-white font-bold text-xl">P</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Playground de Agentes</h1>
            <p className="text-xs text-gray-500">Entorno de simulación y pruebas de iad México</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
            <button 
                onClick={() => {
                    setIsAuthenticated(false);
                    sessionStorage.removeItem('playground_auth');
                    setSelectedAgent(null);
                    setShowPONForm(false);
                    setProactiveMessage(undefined);
                }}
                className="text-sm text-gray-500 hover:text-red-600 font-medium"
            >
                Cerrar Sesión
            </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col z-0">
            <div className="p-4 flex-1 overflow-hidden">
                <AgentSelector 
                    selectedAgentId={selectedAgent?.id || null}
                    onSelectAgent={handleAgentSelect}
                />
            </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {!selectedAgent ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                        <span className="text-3xl">👈</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un Agente</h3>
                    <p className="max-w-md text-center text-gray-500">
                        Elige un agente del menú lateral para comenzar a configurar la prueba y simular conversaciones.
                    </p>
                </div>
            ) : showPONForm ? (
                <PONLeadForm 
                    agent={selectedAgent} 
                    onSubmit={handlePONSubmit}
                    loading={ponLoading}
                />
            ) : (
                <div className="relative max-w-full mx-auto h-[calc(100vh-140px)]">
                    {/* Toggle Button - Always Visible */}
                    <button
                        onClick={() => setIsConfigCollapsed(!isConfigCollapsed)}
                        className="hidden lg:flex absolute top-1/2 -translate-y-1/2 left-0 z-20 bg-white border border-gray-300 rounded-r-lg p-2.5 hover:bg-purple-50 hover:border-purple-400 transition-all shadow-lg hover:shadow-xl"
                        title={isConfigCollapsed ? 'Mostrar configuración' : 'Ocultar configuración'}
                    >
                        {isConfigCollapsed ? (
                            <ChevronRight className="h-5 w-5 text-gray-700" />
                        ) : (
                            <ChevronLeft className="h-5 w-5 text-gray-700" />
                        )}
                    </button>

                    <div className={`grid gap-6 h-full transition-all duration-300 ${
                      isConfigCollapsed 
                        ? 'grid-cols-1' 
                        : 'grid-cols-1 lg:grid-cols-12'
                    }`}>
                        {/* Left Column: Config */}
                        <div className={`space-y-6 overflow-y-auto pr-2 transition-all duration-300 ${
                          isConfigCollapsed ? 'hidden' : 'lg:col-span-3'
                        }`}>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <h2 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b">
                                Configuración de Prueba
                            </h2>
                            <ChannelMetadataPanel 
                                agent={selectedAgent}
                                currentState={playgroundState}
                                onChange={handleStateChange}
                            />
                        </div>

                        {/* Agent Description */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col max-h-[300px]">
                            <h2 className="text-sm font-bold text-gray-900 mb-2 pb-2 border-b flex-shrink-0">
                                Descripción del Agente
                            </h2>
                            <div className="text-sm text-gray-600 space-y-2 overflow-y-auto pr-2">
                                <p>{selectedAgent.description || 'Sin descripción disponible.'}</p>
                                {selectedAgent.businessRules && selectedAgent.businessRules.length > 0 && (
                                    <div className="mt-3">
                                        <span className="font-medium text-xs uppercase text-gray-500 sticky top-0 bg-white block py-1">Reglas de Negocio:</span>
                                        <ul className="list-disc list-inside mt-1 pl-1 space-y-1">
                                            {selectedAgent.businessRules.map((rule, idx) => (
                                                <li key={idx} className="text-xs leading-relaxed">{rule}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Column: Chat */}
                    <div className={`h-full transition-all duration-300 ${
                      isConfigCollapsed ? 'lg:col-span-12' : 'lg:col-span-9'
                    }`}>
                        <ChatInterface 
                            agent={selectedAgent}
                            playgroundState={playgroundState}
                            initialProactiveMessage={proactiveMessage}
                        />
                    </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

