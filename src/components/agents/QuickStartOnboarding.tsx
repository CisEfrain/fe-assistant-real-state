import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, UserCircle, Building2, Smile, Briefcase, Calendar, MessageSquare, TrendingUp, X } from 'lucide-react';
import { useAgentStore } from '../../stores/useAgentStore';
import { Agent } from '../../types/agents';

interface QuickStartOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

type ToneType = 'professional' | 'friendly' | 'consultant';

export const QuickStartOnboarding: React.FC<QuickStartOnboardingProps> = ({ onComplete, onSkip }) => {
  const { createAgent, loading } = useAgentStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [agentName, setAgentName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [tone, setTone] = useState<ToneType>('friendly');
  const [capabilities, setCapabilities] = useState({
    captureLeads: true,
    answerQuestions: true,
    scheduleAppointments: true,
    collectCSAT: true
  });

  const toneOptions = [
    {
      id: 'professional' as ToneType,
      name: 'Profesional',
      icon: Briefcase,
      description: 'Formal y corporativo',
      sample: 'Buenos días, soy {{name}} de {{company}}. ¿En qué puedo asistirle hoy?'
    },
    {
      id: 'friendly' as ToneType,
      name: 'Cercano',
      icon: Smile,
      description: 'Amigable y conversacional',
      sample: 'Hola, soy {{name}} de {{company}}. ¿Cómo te puedo ayudar?'
    },
    {
      id: 'consultant' as ToneType,
      name: 'Consultivo',
      icon: TrendingUp,
      description: 'Experto y orientador',
      sample: 'Hola, soy {{name}}, tu asesor inmobiliario de {{company}}. Voy a ayudarte a encontrar lo que buscas.'
    }
  ];

  const capabilityOptions = [
    {
      id: 'captureLeads' as keyof typeof capabilities,
      name: 'Capturar información de clientes',
      icon: UserCircle,
      description: 'Recopila nombre, teléfono, presupuesto y preferencias'
    },
    {
      id: 'answerQuestions' as keyof typeof capabilities,
      name: 'Responder sobre propiedades',
      icon: Building2,
      description: 'Busca y recomienda propiedades según necesidades'
    },
    {
      id: 'scheduleAppointments' as keyof typeof capabilities,
      name: 'Agendar citas y visitas',
      icon: Calendar,
      description: 'Coordina visitas y reuniones con los clientes'
    },
    {
      id: 'collectCSAT' as keyof typeof capabilities,
      name: 'Recopilar satisfacción',
      icon: MessageSquare,
      description: 'Pregunta qué tan satisfecho quedó el cliente'
    }
  ];

  const getTonePrompt = (selectedTone: ToneType): string => {
    const prompts = {
      professional: 'Eres un asistente inmobiliario profesional y formal. Utilizas un lenguaje corporativo, siempre te diriges con "usted" y mantienes un tono serio pero cordial.',
      friendly: 'Eres un asistente inmobiliario amigable y cercano. Hablas de forma conversacional usando "tú", eres empático y generas confianza con los clientes.',
      consultant: 'Eres un experto asesor inmobiliario. Actúas como consultor, haces preguntas inteligentes y orientas al cliente hacia la mejor decisión para sus necesidades.'
    };
    return prompts[selectedTone];
  };

  const getPreviewSample = () => {
    const selected = toneOptions.find(t => t.id === tone);
    if (!selected) return '';
    return selected.sample
      .replace('{{name}}', agentName || 'tu asistente')
      .replace('{{company}}', companyName || 'tu inmobiliaria');
  };

  const handleCreateAgent = async () => {
    const newAgent: Partial<Agent> = {
      alias: agentName,
      name: agentName,
      description: `Asistente inmobiliario de ${companyName || 'tu empresa'}`,
      type: 'conversational-agent',
      channel: 'whatsapp',
      status: 'active',
      enabled: true,
      connected: false,
      agentTone: getTonePrompt(tone),
      conversationPrompt: `Eres ${agentName}, asistente virtual de ${companyName}. Tu objetivo es ayudar a los clientes de forma eficiente y profesional, capturando sus necesidades y facilitando el proceso inmobiliario.`,
      businessRules: [
        'Saluda de forma apropiada según el tono configurado',
        'Identifica las necesidades del cliente',
        'Captura información relevante de forma natural',
        'No ofrecer promociones no autorizadas',
        'Deriva a un humano cuando sea necesario'
      ],
      businessInformation: [
        `Empresa: ${companyName || 'Inmobiliaria'}`,
        'Operaciones: Venta y Renta de propiedades',
        'Tipos de propiedad: Casas, Departamentos, Terrenos, Comerciales',
        'Canal: WhatsApp'
      ],
      orchestration: {
        priorities: [],
        knowledgeBase: [],
        fallbackBehavior: 'Si no entiendo tu consulta, te pido amablemente que la reformules o te contacto con un asesor humano.'
      },
      tasks: [],
      conversationConfig: {
        historyLimit: 10,
        maxHistoryInRedis: 20,
        sessionTTL: 3600,
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 1000
      }
    };

    try {
      await createAgent(newAgent as any);
      localStorage.setItem('inmobiliario_onboarding_completed', 'true');
      onComplete();
    } catch (error) {
      console.error('Error creating agent:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-cyan-50 p-6 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <button
          onClick={onSkip}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center space-x-2 transition-colors"
        >
          <X className="h-5 w-5" />
          <span>Saltar introducción</span>
        </button>

        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <div className={`h-0.5 w-16 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <div className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <div className={`h-0.5 w-16 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <div className={`h-2 w-2 rounded-full ${step >= 3 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          </div>
          <div className="text-center mt-2">
            <p className="text-sm text-gray-600">Paso {step} de 3</p>
          </div>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-4">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Tu Nuevo Asistente Inmobiliario está Listo
              </h1>
              <p className="text-lg text-gray-600">
                Vamos a configurar juntos cómo atenderá a tus clientes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col items-center text-center p-6 bg-green-50 rounded-xl">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-3">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Disponible 24/7</h3>
                <p className="text-gray-600 text-sm">Atiende a tus clientes en cualquier momento</p>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-blue-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-3">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Sin código</h3>
                <p className="text-gray-600 text-sm">Configúralo con clics, sin programar</p>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-orange-50 rounded-xl">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-3">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Listo en 2 minutos</h3>
                <p className="text-gray-600 text-sm">Comienza a usarlo de inmediato</p>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setStep(2)}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg flex items-center space-x-2 text-lg font-semibold"
              >
                <span>Comenzar Configuración</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Personaliza su Identidad</h2>
              <p className="text-gray-600">Dale nombre a tu asistente y define cómo se presentará</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del asistente <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Ej: María, Carlos, Alex..."
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  El nombre con el que se presentará a tus clientes
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de tu inmobiliaria
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ej: Inmobiliaria Premier"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tono de conversación
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {toneOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setTone(option.id)}
                      className={`p-4 border-2 rounded-xl transition-all text-left ${
                        tone === option.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <option.icon className={`h-6 w-6 mb-2 ${tone === option.id ? 'text-blue-600' : 'text-gray-600'}`} />
                      <h3 className="font-semibold text-gray-900 mb-1">{option.name}</h3>
                      <p className="text-xs text-gray-600">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {agentName && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                    Vista previa: Así se presentará
                  </h3>
                  <p className="text-gray-700 italic">"{getPreviewSample()}"</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Volver
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!agentName.trim()}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Siguiente: Especialidades</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Define sus Especialidades</h2>
              <p className="text-gray-600">Selecciona en qué se especializará tu asistente</p>
            </div>

            <div className="space-y-3 mb-6">
              {capabilityOptions.map((capability) => (
                <button
                  key={capability.id}
                  onClick={() => setCapabilities(prev => ({ ...prev, [capability.id]: !prev[capability.id] }))}
                  className={`w-full p-4 border-2 rounded-xl transition-all text-left flex items-start space-x-4 ${
                    capabilities[capability.id]
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center ${
                    capabilities[capability.id] ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {capabilities[capability.id] && <Check className="h-4 w-4 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <capability.icon className={`h-5 w-5 ${capabilities[capability.id] ? 'text-green-600' : 'text-gray-600'}`} />
                      <h3 className="font-semibold text-gray-900">{capability.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{capability.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>Nota:</strong> Puedes ajustar estas especialidades después en la sección de "Habilidades"
              </p>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Volver
              </button>
              <button
                onClick={handleCreateAgent}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Activando asistente...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Activar Asistente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
