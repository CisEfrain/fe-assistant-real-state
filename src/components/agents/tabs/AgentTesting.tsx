import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, RotateCcw, Bot, User, Loader2, Play, Square, Brain, Target, AlertTriangle, Settings, Database } from 'lucide-react';
import { useAgentStore } from '../../../stores/useAgentStore';

interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  sessionId?: string;
  responseDetails?: {
    executedPriority?: string;
    brainReasoning?: string;
    missingData?: string[];
    executedTask?: string;
    metadata?: Record<string, any>;
  };
}

interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  status: 'active' | 'ended';
}

// Componente para formatear markdown
const MarkdownMessage: React.FC<{ content: string }> = ({ content }) => {
  // Validar que content existe y es string
  if (!content || typeof content !== 'string') {
    return <div className="text-sm text-gray-500 italic">Sin contenido</div>;
  }

  const formatMarkdown = (text: string) => {
    return text
      // Negrita **texto**
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Cursiva *texto*
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Código `texto`
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      // Enlaces [texto](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      // Saltos de línea
      .replace(/\n/g, '<br>');
  };

  return (
    <div 
      className="text-sm"
      dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
    />
  );
};

export const AgentTesting: React.FC = () => {
  const { currentAgent, sendMessage, isOnline } = useAgentStore();
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewSession = async () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      messages: [],
      createdAt: new Date(),
      status: 'active'
    };
    setCurrentSession(newSession);
    setIsSessionActive(true);
    setInputMessage('');
    
    // Enfocar el input automáticamente
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const addUserMessage = (content: string) => {
    if (!currentSession) return;

    const newMessage: ChatMessage = {
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

  const addAgentMessage = (content: string, responseDetails?: any) => {
    // Validar que content existe
    if (!content || typeof content !== 'string') {
      console.error('addAgentMessage called with invalid content:', content);
      content = 'Error: Respuesta vacía del agente';
    }

    setCurrentSession(prevSession => {
      if (!prevSession) return prevSession;
      
      // Usar detalles proporcionados o crear objeto vacío
      const details = responseDetails || {
        executedPriority: undefined,
        brainReasoning: undefined,
        missingData: [],
        executedTask: undefined,
        metadata: { simulation: true }
      };
      
      const newMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        type: 'agent',
        content,
        timestamp: new Date(),
        sessionId: prevSession.id,
        responseDetails: details
      };

      return {
        ...prevSession,
        messages: [...prevSession.messages, newMessage]
      };
    });
  };

  const generateSimulatedDetails = (content: string) => {
    return {
      executedPriority: 'Atención al Cliente',
      brainReasoning: 'Respuesta generada basada en el contexto de la conversación',
      missingData: [],
      executedTask: 'Responder consulta',
      metadata: { simulation: true }
    };
  };

  const simulateAgentResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    try {
      if (currentAgent) {
        try {
          // Llamar a la API real
          const apiResponse = await sendMessage(
            userMessage, 
            currentSession?.id || 'test-session', 
            currentAgent.id,
            { testing: true, channel: 'widget_testing' }
          );
         
          console.log('API Response received:', apiResponse);
          
          // Usar los datos reales de la API
          const responseDetails = {
            executedPriority: apiResponse.executedPriority,
            brainReasoning: apiResponse.brainReasoning,
            missingData: apiResponse.missingData || [],
            executedTask: apiResponse.executedTask,
            nextTask: apiResponse.next_task,
            metadata: apiResponse.metadata || {}
          };
          
          addAgentMessage(apiResponse.response, responseDetails);
          
        } catch (apiError) {
          console.error('Error with API, using fallback:', apiError);
          // Solo usar fallback cuando la API realmente falla
          const fallbackResponse = generateSimulatedResponse(userMessage);
          addAgentMessage(fallbackResponse, {
            executedPriority: 'Fallback Local',
            brainReasoning: 'API no disponible - usando respuesta simulada',
            missingData: [],
            executedTask: undefined,
            metadata: { 
              simulation: true, 
              offline: true,
              error: apiError instanceof Error ? apiError.message : 'Error de conexión'
            }
          });
        }
      }
    } catch (error) {
      console.error('Error getting agent response:', error);
      addAgentMessage('Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.', {
        executedPriority: 'Error',
        brainReasoning: 'Error en el sistema de conversación',
        missingData: [],
        executedTask: undefined,
        metadata: { 
          error: true, 
          errorMessage: error instanceof Error ? error.message : 'Error desconocido' 
        }
      });
    }
    
    setIsTyping(false);
  };

  const generateSimulatedResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Respuestas basadas en las prioridades del agente
    if (message.includes('hola') || message.includes('buenos') || message.includes('buenas')) {
      return `¡Hola! Soy ${currentAgent?.alias || 'tu asistente'}. Para ayudarte mejor, ¿podrías decirme tu nombre completo?`;
    }
    
    if (message.includes('reclamo') || message.includes('queja') || message.includes('problema')) {
      return 'Lamento escuchar que tienes un inconveniente. Voy a ayudarte a resolverlo. ¿Podrías contarme en detalle qué sucedió?';
    }
    
    if (message.includes('busco') || message.includes('necesito') || message.includes('quiero')) {
      return 'Perfecto, te ayudo a encontrar lo que buscas. ¿Estás interesado en comprar o rentar una propiedad?';
    }
    
    if (message.includes('agendar') || message.includes('cita') || message.includes('visita')) {
      return 'Excelente, puedo ayudarte a agendar una cita. ¿Qué días y horarios te convienen mejor? Nuestro horario es de lunes a viernes de 9:00 a 18:00.';
    }
    
    if (message.includes('precio') || message.includes('costo') || message.includes('cuánto')) {
      return 'Para darte información precisa sobre precios, necesito conocer qué tipo de propiedad te interesa y en qué zona. ¿Podrías darme esos detalles?';
    }
    
    // Respuesta por defecto
    const defaultResponses = [
      'Entiendo. ¿Podrías darme más detalles para ayudarte mejor?',
      'Perfecto. Para asistirte de la mejor manera, ¿podrías ser más específico?',
      'Claro, estoy aquí para ayudarte. ¿Qué más información necesitas?',
      'Te ayudo con eso. ¿Hay algo específico que te gustaría saber?'
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentSession || !isSessionActive) return;

    const message = inputMessage.trim();
    setInputMessage(''); // Limpiar input inmediatamente
    
    // Agregar mensaje del usuario
    addUserMessage(message);
    
    // Simular respuesta del agente
    await simulateAgentResponse(message);
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

  if (!currentAgent) return null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Chat Interface */}
      <div className="xl:col-span-2 space-y-6">
      {/* Controles de Sesión */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Prueba de Conversación
          </h3>
          {currentSession && (
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isSessionActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">
                Sesión: {currentSession.id.slice(-8)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {!currentSession || !isSessionActive ? (
            <button
              onClick={createNewSession}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar Nueva Sesión
            </button>
          ) : (
            <>
              <button
                onClick={endSession}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
              >
                <Square className="h-4 w-4 mr-2" />
                Finalizar Sesión
              </button>
              <button
                onClick={() => {
                  if (currentSession) {
                    setCurrentSession(null);
                    setIsSessionActive(false);
                    setInputMessage('');
                    setIsTyping(false);
                    setSelectedMessage(null);
                  }
                  setTimeout(() => {
                    createNewSession();
                  }, 100);
                }}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reiniciar Sesión
              </button>
            </>
          )}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {!currentSession ? (
          <div className="p-12 text-center">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Simulador de Conversación</h3>
            <p className="text-gray-500 mb-6">
              Inicia una nueva sesión para probar tu agente en tiempo real
            </p>
            <button
              onClick={createNewSession}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Comenzar Prueba
            </button>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{currentAgent.alias}</h3>
                    <p className="text-purple-100 text-sm">
                      {isSessionActive ? 'En línea' : 'Sesión finalizada'} • {currentSession.messages.length} mensajes
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isSessionActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-white text-sm">
                    {isSessionActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="h-96 overflow-y-auto p-6 bg-gray-50">
              <div className="space-y-4">
                {currentSession.messages.length === 0 && isSessionActive && (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <Bot className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">¡Prueba tu asistente!</h4>
                      <p className="text-sm text-gray-600 mb-6">Haz clic en alguno de estos casos de uso o escribe tu propio mensaje</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                      <button
                        onClick={() => {
                          setInputMessage('Busco casa en renta en Polanco');
                          setTimeout(() => handleSendMessage(), 100);
                        }}
                        className="px-4 py-3 bg-white border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
                      >
                        <span className="text-sm font-medium text-gray-900">🏠 "Busco casa en renta"</span>
                      </button>
                      <button
                        onClick={() => {
                          setInputMessage('Quiero comprar un departamento con 3 recámaras');
                          setTimeout(() => handleSendMessage(), 100);
                        }}
                        className="px-4 py-3 bg-white border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
                      >
                        <span className="text-sm font-medium text-gray-900">🏢 "Quiero comprar departamento"</span>
                      </button>
                      <button
                        onClick={() => {
                          setInputMessage('¿Qué propiedades tienen disponibles?');
                          setTimeout(() => handleSendMessage(), 100);
                        }}
                        className="px-4 py-3 bg-white border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
                      >
                        <span className="text-sm font-medium text-gray-900">📋 "¿Qué propiedades tienen?"</span>
                      </button>
                    </div>
                  </div>
                )}
                {currentSession.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                       : 'bg-white border border-gray-200 text-gray-900 shadow-sm cursor-pointer hover:shadow-md hover:border-purple-300 transition-all'
                    } ${selectedMessage?.id === message.id ? 'ring-2 ring-purple-500' : ''}`}
                   onClick={() => message.type === 'agent' ? setSelectedMessage(message) : null}
                    >
                      <div className="flex items-start space-x-2">
                        {message.type === 'agent' && (
                          <Bot className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        )}
                        {message.type === 'user' && (
                          <User className="h-4 w-4 text-white mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <MarkdownMessage content={message.content} />
                          <p className={`text-xs mt-1 ${
                            message.type === 'user' ? 'text-purple-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString('es-MX', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                           {message.type === 'agent' && (
                              <span className="ml-2 text-purple-600">• Click para ver detalles</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-900 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4 text-purple-600" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-gray-500">escribiendo...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-6 py-4 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={!isSessionActive || isTyping}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder={
                        !isSessionActive 
                          ? "Inicia una nueva sesión para comenzar a probar"
                          : isTyping 
                          ? "El agente está escribiendo..."
                          : "Escribe tu primer mensaje..."
                      }
                    />
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || !isSessionActive || isTyping}
                  className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTyping ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      </div>

      {/* Sidebar de Detalles */}
      <div className="space-y-6">
        {/* Panel de Detalles de Respuesta */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Detalles de Respuesta</h3>
                <p className="text-indigo-100 text-sm">Análisis interno del agente</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {selectedMessage && selectedMessage.responseDetails ? (
              <div className="space-y-6">
                {/* Prioridad Ejecutada */}
                {selectedMessage.responseDetails.executedPriority && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">Prioridad Actual</span>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <span className="text-sm font-semibold text-purple-800">
                        {selectedMessage.responseDetails.executedPriority}
                      </span>
                    </div>
                  </div>
                )}

                {/* Razonamiento del Cerebro */}
                {selectedMessage.responseDetails.brainReasoning && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Razonamiento del Agente</span>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        {selectedMessage.responseDetails.brainReasoning}
                      </p>
                    </div>
                  </div>
                )}

                {/* Datos Faltantes */}
                {selectedMessage.responseDetails.missingData && selectedMessage.responseDetails.missingData.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-gray-700">Datos Faltantes</span>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex flex-wrap gap-2">
                        {selectedMessage.responseDetails.missingData.map((data, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                            {data}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tarea Ejecutada */}
                {selectedMessage.responseDetails.executedTask && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Settings className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Tarea Ejecutada</span>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <span className="text-sm font-semibold text-green-800">
                        {selectedMessage.responseDetails.executedTask}
                      </span>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {selectedMessage.responseDetails.metadata && Object.keys(selectedMessage.responseDetails.metadata).length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Database className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Metadatos</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="space-y-1">
                        {Object.entries(selectedMessage.responseDetails.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                            <span className="font-medium text-gray-900">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Respuesta generada: {selectedMessage.timestamp.toLocaleString('es-MX')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Selecciona una respuesta</h4>
                <p className="text-gray-500 text-sm">
                  Haz clic en cualquier respuesta del agente para ver los detalles internos de procesamiento
                </p>
              </div>
            )}
          </div>
        </div>

      {/* Información de la Sesión */}
      {currentSession && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Información de la Sesión</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{currentSession.messages.length}</div>
              <div className="text-sm text-gray-600">Mensajes Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {currentSession.messages.filter(m => m.type === 'user').length}
              </div>
              <div className="text-sm text-gray-600">Mensajes Usuario</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {currentSession.messages.filter(m => m.type === 'agent').length}
              </div>
              <div className="text-sm text-gray-600">Respuestas Agente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.floor((Date.now() - currentSession.createdAt.getTime()) / 1000 / 60)}
              </div>
              <div className="text-sm text-gray-600">Minutos Activa</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">Configuración del Agente en Prueba</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-purple-800">
              <div>
                <span className="font-medium">Modelo IA:</span>
                <span className="ml-1">{currentAgent.conversationConfig?.model || 'gpt-4o'}</span>
              </div>
              <div>
                <span className="font-medium">Creatividad:</span>
                <span className="ml-1">{currentAgent.conversationConfig?.temperature || 0.7}</span>
              </div>
              <div>
                <span className="font-medium">Tareas Activas:</span>
                <span className="ml-1">{currentAgent.tasks.filter(t => t.enabled).length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Sugerencias de Prueba */}
    </div>
  );
};