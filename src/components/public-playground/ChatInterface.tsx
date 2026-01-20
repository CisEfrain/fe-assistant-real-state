import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, Send, RotateCcw, Bot, User, Loader2, Play, 
  Brain, Target, AlertTriangle, Settings, Database, Trash2 
} from 'lucide-react';
import { useAgentStore } from '../../stores/useAgentStore';
import { Agent } from '../../types/agents';
import { 
  PlaygroundState, 
  ChatSession, 
  PlaygroundMessage 
} from '../../types/playground';

interface ChatInterfaceProps {
  agent: Agent;
  playgroundState: PlaygroundState;
  initialProactiveMessage?: string;
}

// Componente para formatear markdown (reutilizado)
const MarkdownMessage: React.FC<{ content: string }> = ({ content }) => {
  if (!content || typeof content !== 'string') {
    return <div className="text-sm text-gray-500 italic">Sin contenido</div>;
  }

  const formatMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div 
      className="text-sm"
      dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
    />
  );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ agent, playgroundState, initialProactiveMessage }) => {
  const { sendMessage } = useAgentStore();
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<PlaygroundMessage | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'collected'>('analysis');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  // Reset session when agent changes
  useEffect(() => {
    setCurrentSession(null);
    setIsSessionActive(false);
    setInputMessage('');
    setSelectedMessage(null);
  }, [agent.id]);

  // Handle proactive message
  useEffect(() => {
    if (initialProactiveMessage && !isSessionActive && !currentSession) {
      startProactiveSession(initialProactiveMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProactiveMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startProactiveSession = (message: string) => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      messages: [],
      createdAt: new Date(),
      status: 'active'
    };
    
    // Add proactive agent message immediately
    const proactiveMsg: PlaygroundMessage = {
      id: `msg_${Date.now()}`,
      type: 'agent',
      content: message,
      timestamp: new Date(),
      sessionId: newSession.id,
      responseDetails: {
        executedPriority: 'Proactive Trigger',
        brainReasoning: 'Mensaje inicial disparado por creación de Lead PON',
        metadata: { trigger: 'pon_lead_created' }
      }
    };
    
    newSession.messages.push(proactiveMsg);
    
    setCurrentSession(newSession);
    setIsSessionActive(true);
    setInputMessage('');
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      messages: [],
      createdAt: new Date(),
      status: 'active'
    };
    setCurrentSession(newSession);
    setIsSessionActive(true);
    setInputMessage('');
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleCleanSession = async () => {
    if (!currentSession) return;

    try {
      // Preparar contexto
      const customMetadataObj = playgroundState.customMetadata.reduce((acc, curr) => {
        if (curr.key) acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>);

      const context = {
        ...playgroundState.channelMetadata,
        ...customMetadataObj,
        testing: true,
        testerName: playgroundState.testerName
      };

      // Enviar comando de limpieza silenciosamente
      await sendMessage(
        '!#_command:clean-session',
        currentSession.id,
        agent.id,
        context
      );
    } catch (error) {
      console.error('Error cleaning session:', error);
    } finally {
      // Reiniciar sesión visualmente
      createNewSession();
    }
  };

  const addUserMessage = (content: string) => {
    if (!currentSession) return;

    const newMessage: PlaygroundMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date(),
      sessionId: currentSession.id
    };

    setCurrentSession(prevSession => {
      if (!prevSession) return prevSession;
      return {
        ...prevSession,
        messages: [...prevSession.messages, newMessage]
      };
    });
  };

  const addAgentMessage = (content: string, responseDetails?: PlaygroundMessage['responseDetails']) => {
    setCurrentSession(prevSession => {
      if (!prevSession) return prevSession;
      
      const newMessage: PlaygroundMessage = {
        id: `msg_${Date.now()}`,
        type: 'agent',
        content,
        timestamp: new Date(),
        sessionId: prevSession.id,
        responseDetails
      };

      return {
        ...prevSession,
        messages: [...prevSession.messages, newMessage]
      };
    });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentSession || !isSessionActive) return;

    const message = inputMessage.trim();
    setInputMessage('');
    addUserMessage(message);
    setIsTyping(true);

    try {
      // Preparar contexto con metadatos
      const customMetadataObj = playgroundState.customMetadata.reduce((acc, curr) => {
        if (curr.key) acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>);

      const context = {
        ...playgroundState.channelMetadata,
        ...customMetadataObj,
        testing: true,
        testerName: playgroundState.testerName
      };

      // Llamada real a la API
      const apiResponse = await sendMessage(
        message,
        currentSession.id,
        agent.id,
        context
      );

      const responseDetails: PlaygroundMessage['responseDetails'] = {
        executedPriority: apiResponse.executedPriority,
        brainReasoning: apiResponse.brainReasoning,
        missingData: apiResponse.missingData || [],
        executedTask: apiResponse.executedTask,
        nextTask: apiResponse.next_task,
        metadata: apiResponse.metadata || {},
        collectedData: apiResponse.collectedData || {}
      };

      addAgentMessage(apiResponse.response, responseDetails);

    } catch (error) {
      console.error('Error sending message:', error);
      addAgentMessage('Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.', {
        executedPriority: 'Error',
        brainReasoning: 'Error de conexión con el agente',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    } finally {
      setIsTyping(false);
    }
  };

  const endSession = () => {
    setIsSessionActive(false);
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        status: 'ended'
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Chat Area */}
      <div className="flex flex-col h-full space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <h3 className="font-semibold text-gray-900">Conversación</h3>
            {currentSession && (
              <span className={`px-2 py-1 text-xs rounded-full ${
                isSessionActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {isSessionActive ? 'Activa' : 'Finalizada'}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            {!isSessionActive ? (
              <button
                onClick={createNewSession}
                className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                <Play className="h-4 w-4 mr-1.5" />
                Iniciar
              </button>
            ) : (
              <>
                <button
                  onClick={handleCleanSession}
                  className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Limpiar Sesión
                </button>
                <button
                  onClick={() => {
                    endSession();
                    setTimeout(createNewSession, 100);
                  }}
                  className="inline-flex items-center px-3 py-1.5 bg-purple-100 text-purple-700 text-sm rounded-lg hover:bg-purple-200 transition-colors"
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Reiniciar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          {!currentSession ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
              <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
              <p>Inicia una sesión para comenzar a interactuar con <strong>{agent.alias}</strong></p>
            </div>
          ) : (
            <>
              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {currentSession.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] rounded-lg p-3 cursor-pointer transition-all ${
                        message.type === 'user'
                          ? 'bg-purple-600 text-white'
                          : `bg-white border border-gray-200 text-gray-900 hover:border-purple-300 ${
                              selectedMessage?.id === message.id ? 'ring-2 ring-purple-500' : ''
                            }`
                      }`}
                      onClick={() => message.type === 'agent' && setSelectedMessage(message)}
                    >
                      <div className="flex items-start space-x-2">
                        {message.type === 'agent' && <Bot className="h-4 w-4 mt-1 flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <MarkdownMessage content={message.content} />
                          <div className={`text-[10px] mt-1 flex items-center justify-end ${
                            message.type === 'user' ? 'text-purple-200' : 'text-gray-400'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {message.type === 'agent' && (
                              <span className="ml-1 text-xs">• info</span>
                            )}
                          </div>
                        </div>
                        {message.type === 'user' && <User className="h-4 w-4 mt-1 flex-shrink-0" />}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!isSessionActive || isTyping}
                    placeholder={isSessionActive ? "Escribe un mensaje..." : "Inicia sesión para escribir"}
                    className="flex-1 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || !isSessionActive || isTyping}
                    className="p-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Details Panel */}
      <div className="h-full overflow-hidden">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
          {/* Header with Tabs */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="p-4 pb-0">
              <h3 className="font-semibold text-gray-900 flex items-center mb-3">
                <Brain className="h-4 w-4 mr-2 text-purple-600" />
                Detalles de Respuesta
              </h3>
            </div>
            <div className="flex border-t border-gray-200">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === 'analysis'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Análisis
              </button>
              <button
                onClick={() => setActiveTab('collected')}
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === 'collected'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Datos Recolectados
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {!selectedMessage ? (
              <div className="text-center py-8 text-gray-400">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Selecciona un mensaje del agente para ver sus detalles de procesamiento</p>
              </div>
            ) : selectedMessage.responseDetails ? (
              <div className="space-y-6">
                {/* Tab: Analysis */}
                {activeTab === 'analysis' && (
                  <>
                {/* Priority */}
                {selectedMessage.responseDetails.executedPriority && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Prioridad Ejecutada</label>
                    <div className="mt-1 p-2 bg-purple-50 text-purple-700 rounded text-sm font-medium border border-purple-100">
                      {selectedMessage.responseDetails.executedPriority}
                    </div>
                  </div>
                )}

                {/* Task */}
                {selectedMessage.responseDetails.executedTask && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Tarea</label>
                    <div className="mt-1 flex items-center text-sm text-gray-700">
                      <Settings className="h-3 w-3 mr-1.5 text-gray-400" />
                      {selectedMessage.responseDetails.executedTask}
                    </div>
                  </div>
                )}

                {/* Reasoning */}
                {selectedMessage.responseDetails.brainReasoning && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Razonamiento</label>
                    <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-100 italic">
                      "{selectedMessage.responseDetails.brainReasoning}"
                    </p>
                  </div>
                )}

                {/* Missing Data */}
                {selectedMessage.responseDetails.missingData && selectedMessage.responseDetails.missingData.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1 text-orange-500" />
                      Datos Faltantes
                    </label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedMessage.responseDetails.missingData.map((field, i) => (
                        <span key={i} className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded border border-orange-100">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                    {/* Metadata */}
                    {selectedMessage.responseDetails.metadata && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase mb-1 flex items-center">
                          <Database className="h-3 w-3 mr-1 text-blue-500" />
                          Metadatos Resultantes
                        </label>
                        <div className="bg-gray-50 rounded border border-gray-100 p-2 overflow-x-auto">
                          <pre className="text-xs text-gray-600">
                            {JSON.stringify(selectedMessage.responseDetails.metadata, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Tab: Collected Data */}
                {activeTab === 'collected' && (
                  selectedMessage.responseDetails.collectedData && Object.keys(selectedMessage.responseDetails.collectedData).length > 0 ? (
                    <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 flex items-center">
                      <Database className="h-3 w-3 mr-1 text-green-500" />
                      Datos Recolectados (Acumulados)
                    </label>
                    <div className="bg-green-50 rounded border border-green-200 p-3 space-y-2">
                      {Object.entries(selectedMessage.responseDetails.collectedData).map(([key, value]) => {
                        const currentIndex = currentSession?.messages.findIndex(m => m.id === selectedMessage.id) ?? -1;
                        const previousAgentMessages = currentSession?.messages
                          .slice(0, currentIndex)
                          .filter(m => m.type === 'agent' && m.responseDetails?.collectedData) ?? [];
                        const previousMessage = previousAgentMessages[previousAgentMessages.length - 1];
                        const previousValue = previousMessage?.responseDetails?.collectedData?.[key];
                        
                        const isNew = previousValue === undefined;
                        const isUpdated = !isNew && JSON.stringify(previousValue) !== JSON.stringify(value);
                        
                        return (
                          <div key={key} className="flex items-start justify-between p-2 bg-white rounded border border-green-100">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-700 font-mono">{key}</span>
                                {isNew && (
                                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded">
                                    NUEVO
                                  </span>
                                )}
                                {isUpdated && (
                                  <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-medium rounded">
                                    ACTUALIZADO
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 text-xs text-gray-600 break-words">
                                {typeof value === 'object' ? (
                                  <pre className="text-[11px] overflow-x-auto">
                                    {JSON.stringify(value, null, 2)}
                                  </pre>
                                ) : (
                                  <span className="font-medium text-gray-900">{String(value)}</span>
                                )}
                              </div>
                              {isUpdated && previousValue !== undefined && (
                                <div className="mt-1 text-[10px] text-gray-400 line-through">
                                  Anterior: {typeof previousValue === 'object' ? JSON.stringify(previousValue) : String(previousValue)}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                      <p className="text-[10px] text-gray-500 mt-1 italic">
                        💡 Los datos marcados como NUEVO se agregaron en este mensaje. Los ACTUALIZADOS cambiaron su valor.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Database className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No hay datos recolectados en este mensaje</p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="text-center text-sm text-gray-500">
                Este mensaje no tiene detalles técnicos asociados.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
