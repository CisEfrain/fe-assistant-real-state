import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, Zap, Bot, MessageSquare, Target, X } from 'lucide-react';
import { useAgentStore } from '../../stores/useAgentStore';
import { Agent, AgentChannel } from '../../types/agents';

interface AgentTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  shortDescription: string;
  type: Agent['type'];
  channel: AgentChannel;
  preconfig: Partial<Agent>;
}

const QUICK_TEMPLATES: AgentTemplate[] = [
  {
    id: 'lead-capture',
    name: 'Captura de Leads',
    icon: '🎯',
    description: 'Califica leads inmobiliarios y agenda citas automáticamente',
    shortDescription: 'Captura y califica prospectos',
    type: 'lead-capture-specialist',
    channel: 'whatsapp',
    preconfig: {
      agentTone: 'Eres un asistente inmobiliario amigable y profesional. Tu objetivo es capturar información del cliente de forma natural y agendar visitas.',
      businessRules: [
        'Saluda de forma amigable y preséntate',
        'Pregunta qué tipo de propiedad busca',
        'Captura: nombre, teléfono, presupuesto y zona de interés',
        'Sugiere agendar una visita cuando tengas los datos básicos'
      ],
      businessInformation: [
        'Operaciones: Venta y Renta',
        'Tipos de propiedad: Casa, Departamento, Terreno',
        'Cobertura: Ciudad de México y área metropolitana'
      ]
    }
  },
  {
    id: 'property-advisor',
    name: 'Asesor de Propiedades',
    icon: '🏠',
    description: 'Busca y recomienda propiedades según necesidades del cliente',
    shortDescription: 'Búsqueda inteligente de propiedades',
    type: 'property-advisor',
    channel: 'whatsapp',
    preconfig: {
      agentTone: 'Eres un experto consultor inmobiliario. Ayudas a los clientes a encontrar la propiedad perfecta haciendo preguntas inteligentes.',
      businessRules: [
        'Identifica necesidades: presupuesto, ubicación, características',
        'Busca propiedades que coincidan con el perfil',
        'Explica ventajas de cada opción',
        'Facilita el proceso de decisión'
      ],
      businessInformation: [
        'Operaciones: Venta y Renta',
        'Amplio catálogo de propiedades',
        'Información detallada de cada inmueble'
      ]
    }
  },
  {
    id: 'customer-support',
    name: 'Atención al Cliente',
    icon: '💬',
    description: 'Responde preguntas frecuentes y atiende solicitudes generales',
    shortDescription: 'Soporte y preguntas frecuentes',
    type: 'customer-support-agent',
    channel: 'whatsapp',
    preconfig: {
      agentTone: 'Eres un asistente de atención al cliente amable y eficiente. Resuelves dudas y brindas información clara.',
      businessRules: [
        'Saluda cordialmente',
        'Identifica el tipo de consulta',
        'Proporciona información precisa',
        'Deriva a humano si es necesario'
      ],
      businessInformation: [
        'Horarios de atención: Lunes a Viernes 9:00 - 18:00',
        'Canales de contacto: WhatsApp, Teléfono, Email',
        'Servicios: Compra, venta y renta de propiedades'
      ]
    }
  }
];

interface QuickStartOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const QuickStartOnboarding: React.FC<QuickStartOnboardingProps> = ({ onComplete, onSkip }) => {
  const { createAgent, loading } = useAgentStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [agentName, setAgentName] = useState('');
  const [customizing, setCustomizing] = useState(false);

  const handleTemplateSelect = (template: AgentTemplate) => {
    setSelectedTemplate(template);
    setAgentName(`${template.name} - Mi Empresa`);
    setStep(2);
  };

  const handleCustomize = () => {
    setCustomizing(true);
  };

  const handleCreateAgent = async () => {
    if (!selectedTemplate) return;

    const newAgent: Partial<Agent> = {
      alias: agentName,
      name: agentName,
      description: selectedTemplate.description,
      type: selectedTemplate.type,
      channel: selectedTemplate.channel,
      status: 'draft',
      enabled: false,
      connected: false,
      ...selectedTemplate.preconfig,
      orchestration: {
        priorities: [],
        knowledgeBase: [],
        fallbackBehavior: 'Disculpa, no entendí tu pregunta. ¿Podrías reformularla?'
      },
      tasks: [],
      conversationConfig: {
        historyLimit: 10,
        maxHistoryInRedis: 20,
        sessionTTL: 3600,
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 500
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <button
          onClick={onSkip}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center space-x-2 transition-colors"
        >
          <X className="h-5 w-5" />
          <span>Saltar introducción</span>
        </button>

        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                ¡Bienvenido a tu Panel de Asistentes IA!
              </h1>
              <p className="text-lg text-gray-600">
                Crea tu primer asistente en 30 segundos
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-8">
              <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Sin código</h3>
                  <p className="text-gray-600 text-sm">No necesitas saber programar ni configurar nada técnico</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Listo en segundos</h3>
                  <p className="text-gray-600 text-sm">Selecciona una plantilla y personalízala a tu gusto</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">IA Especializada</h3>
                  <p className="text-gray-600 text-sm">Asistentes entrenados específicamente para inmobiliarias</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Elige tu asistente ideal:</h2>

              {QUICK_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{template.icon}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600">{template.shortDescription}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && selectedTemplate && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-5xl">{selectedTemplate.icon}</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedTemplate.name}</h2>
                  <p className="text-gray-600">{selectedTemplate.description}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dale un nombre a tu asistente
                </label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Ej: Santi - Captura de Leads"
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Este es el nombre con el que se presentará a tus clientes
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-purple-600" />
                  ¿Qué hará este asistente?
                </h3>
                <ul className="space-y-2">
                  {selectedTemplate.preconfig.businessRules?.map((rule, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                  Información del negocio incluida
                </h3>
                <ul className="space-y-2">
                  {selectedTemplate.preconfig.businessInformation?.map((info, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{info}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Volver
              </button>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCreateAgent}
                  disabled={!agentName.trim() || loading}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creando...</span>
                    </>
                  ) : (
                    <>
                      <span>Crear Asistente</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
