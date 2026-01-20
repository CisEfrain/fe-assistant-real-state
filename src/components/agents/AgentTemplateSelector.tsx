import React, { useState } from 'react';
import { Bot, ArrowLeft, Sparkles, MessageSquare, Search, Calendar, AlertTriangle, Users } from 'lucide-react';
import { useAgentStore } from '../../stores/useAgentStore';
import { Agent, Task, Priority, TaskType } from '../../types/agents';

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
  color: string;
  category: string;
  features: string[];
  agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>;
}

const agentTemplates: AgentTemplate[] = [
  {
    id: 'santi-whatsapp-agent',
    name: 'Santi - Asistente Virtual IAD',
    description: 'Agente conversacional de voz especializado en atención inmobiliaria para leads de llamadas telefónicas.',
    icon: Users,
    color: 'from-blue-500 to-blue-600',
    category: 'Atención Telefónica',
    features: [
      'Atención telefónica especializada con ElevenLabs',
      'Validación de ID de propiedades específicas',
      'Búsqueda genérica con criterios personalizados',
      'Agendamiento sin proponer fechas (usuario define)',
      'Encuesta CSAT integrada al final'
    ],
    agent: {
      alias: 'Santi',
      name: 'Asistente Virtual Inmobiliario IAD',
      description: 'Agente conversacional de voz especializado en atención inmobiliaria para leads de llamadas',
      enabled: true,
      analyticsType: 'DISABLED',
      type: 'lead-capture-specialist',
      channel: 'whatsapp',
      connected: true,
      status: 'active',
      businessRules: [
        'Siempre saludar en español, cambiar a inglés si el usuario lo hace',
        'No ofrecer promociones ni descuentos',
        'No contactar al usuario por otros medios',
        'No proponer fecha ni hora de cita, esperar a que el usuario lo diga',
        'Si pregunta por crédito hipotecario, sugerir Nexicrédito',
        'No dar consejos médicos ni legales',
        'Evitar repreguntar datos ya proporcionados'
      ],
      businessInformation: [
        'Agente de voz: ElevenLabs – voice_id: 11labs-Santiago',
        'Canal telefónico con ambientación whatsapp-center',
        'Duración máxima de llamada: 60 minutos',
        'Modelo de post-análisis: gpt-4o-mini'
      ],
      agentTone: 'Eres "Santi", un asistente virtual amigable y profesional. Habla de manera conversacional y clara, mantén la calma en situaciones difíciles y sé empático con los clientes.',
      conversationPrompt: 'Tu objetivo es dar información sobre propiedades, atender reclamos y asistir de forma eficiente. Respeta las restricciones: no promociones, no prometer envíos, no repetir preguntas ya respondidas.',
      conversationConfig: {
        historyLimit: 15,
        maxHistoryInRedis: 30,
        sessionTTL: 3600,
        model: 'gpt-4o-mini',
        temperature: 0.3,
        maxTokens: 1000
      },
      tasks: [],
      orchestration: {
        priorities: [],
        fallbackBehavior: 'Si no entiendes, pide aclaración amable y regresa al flujo principal de captura o búsqueda.'
      }
    }
  },
  {
    id: 'customer-support-agent',
    name: 'Agente de Soporte al Cliente',
    description: 'Especializado en resolver dudas, gestionar reclamos y brindar soporte técnico a clientes existentes.',
    icon: MessageSquare,
    color: 'from-green-500 to-green-600',
    category: 'Soporte',
    features: [
      'Gestión de reclamos y quejas',
      'Resolución de dudas técnicas',
      'Escalamiento inteligente a humanos',
      'Base de conocimiento integrada'
    ],
    agent: {
      alias: 'Agente de Soporte',
      name: 'Agente de Soporte al Cliente',
      description: 'Agente especializado en brindar soporte técnico y resolver consultas de clientes',
      enabled: true,
      analyticsType: 'DISABLED',
      type: 'customer-support-agent',
      channel: 'whatsapp',
      connected: false,
      status: 'draft',
      businessRules: [
        'PRIORIZAR reclamos sobre cualquier otra consulta',
        'Escalar a humano si no puede resolver',
        'Documentar todos los reclamos',
        'Mantener empatía en situaciones difíciles'
      ],
      businessInformation: [
        'Soporte 24/7 automatizado',
        'Escalamiento a agentes humanos disponible',
        'Base de conocimiento actualizada'
      ],
      agentTone: 'Eres un agente de soporte empático y eficiente. Mantén la calma en situaciones difíciles y muestra comprensión hacia los problemas del cliente.',
      conversationPrompt: 'Tu prioridad es resolver problemas y brindar la mejor experiencia al cliente. Escala a humanos cuando sea necesario.',
      conversationConfig: {
        historyLimit: 15,
        maxHistoryInRedis: 30,
        sessionTTL: 7200,
        model: 'gpt-4o-mini',
        temperature: 0.2,
        maxTokens: 1000
      },
      tasks: [],
      orchestration: {
        priorities: [],
        fallbackBehavior: 'Si no puedo resolver la consulta, ofrecer escalamiento a un agente humano de manera proactiva.'
      }
    }
  },
  {
    id: 'property-advisor',
    name: 'Asesor de Propiedades',
    description: 'Experto en consultas específicas sobre propiedades, valuaciones y asesoría inmobiliaria especializada.',
    icon: Search,
    color: 'from-purple-500 to-purple-600',
    category: 'Asesoría',
    features: [
      'Consultas específicas de propiedades',
      'Asesoría en valuaciones',
      'Comparación de propiedades',
      'Análisis de mercado'
    ],
    agent: {
      alias: 'Asesor de Propiedades',
      name: 'Agente Asesor de Propiedades',
      description: 'Agente especializado en brindar asesoría experta sobre propiedades y mercado inmobiliario',
      enabled: true,
      analyticsType: 'DISABLED',
      type: 'property-advisor',
      channel: 'whatsapp',
      connected: false,
      status: 'draft',
      businessRules: [
        'Proporcionar información precisa y actualizada',
        'Usar datos de mercado para asesorar',
        'Explicar conceptos técnicos de manera simple',
        'Recomendar opciones basadas en criterios del cliente'
      ],
      businessInformation: [
        'Acceso a base de datos de propiedades actualizada',
        'Información de mercado en tiempo real',
        'Especialistas en valuación certificados'
      ],
      agentTone: 'Eres un asesor inmobiliario experto y confiable. Habla con autoridad pero de manera accesible, explica conceptos técnicos de forma simple.',
      conversationPrompt: 'Tu objetivo es brindar información precisa y asesoría profesional sobre propiedades y mercado inmobiliario.',
      conversationConfig: {
        historyLimit: 12,
        maxHistoryInRedis: 25,
        sessionTTL: 5400,
        model: 'gpt-4o-mini',
        temperature: 0.2,
        maxTokens: 1000
      },
      tasks: [],
      orchestration: {
        priorities: [],
        fallbackBehavior: 'Si no tengo información específica, ofrecer conectar con un especialista humano o programar una consulta detallada.'
      }
    }
  },
  {
    id: 'appointment-coordinator',
    name: 'Coordinador de Citas',
    description: 'Especializado en la gestión y coordinación de citas, visitas y seguimientos con clientes.',
    icon: Calendar,
    color: 'from-orange-500 to-orange-600',
    category: 'Operaciones',
    features: [
      'Agendamiento inteligente de citas',
      'Gestión de disponibilidad',
      'Recordatorios automáticos',
      'Reprogramación flexible'
    ],
    agent: {
      alias: 'Coordinador de Citas',
      name: 'Agente Coordinador de Citas',
      description: 'Agente especializado en la gestión eficiente de citas y coordinación de visitas',
      enabled: true,
      analyticsType: 'DISABLED',
      type: 'appointment-coordinator',
      channel: 'whatsapp',
      connected: false,
      status: 'draft',
      businessRules: [
        'Confirmar disponibilidad antes de agendar',
        'Enviar recordatorios 24h antes',
        'Ofrecer opciones de reprogramación',
        'Capturar preferencias de horario'
      ],
      businessInformation: [
        'Sistema de calendario integrado',
        'Disponibilidad en tiempo real',
        'Notificaciones automáticas'
      ],
      agentTone: 'Eres un coordinador de citas eficiente y organizado. Habla de manera clara y estructurada, confirma siempre los detalles importantes.',
      conversationPrompt: 'Tu objetivo es facilitar el agendamiento y asegurar que todas las citas se coordinen perfectamente.',
      conversationConfig: {
        historyLimit: 8,
        maxHistoryInRedis: 15,
        sessionTTL: 2700,
        model: 'gpt-4o-mini',
        temperature: 0.2,
        maxTokens: 1000
      },
      tasks: [],
      orchestration: {
        priorities: [],
        fallbackBehavior: 'Si no puedo agendar en el horario solicitado, ofrecer alternativas cercanas y explicar disponibilidad.'
      }
    }
  },
  {
    id: 'complaint-handler',
    name: 'Gestor de Reclamos',
    description: 'Especializado en la gestión profesional de reclamos, quejas y situaciones de escalamiento.',
    icon: AlertTriangle,
    color: 'from-red-500 to-red-600',
    category: 'Calidad',
    features: [
      'Gestión empática de reclamos',
      'Documentación detallada',
      'Escalamiento inteligente',
      'Seguimiento de resolución'
    ],
    agent: {
      alias: 'Gestor de Reclamos',
      name: 'Agente Gestor de Reclamos',
      description: 'Agente especializado en la gestión empática y eficiente de reclamos y situaciones complejas',
      enabled: true,
      analyticsType: 'DISABLED',
      type: 'complaint-handler',
      channel: 'whatsapp',
      connected: false,
      status: 'draft',
      businessRules: [
        'SIEMPRE mostrar empatía y comprensión',
        'Documentar detalladamente cada reclamo',
        'Ofrecer soluciones concretas',
        'Escalar si no puede resolver en primera instancia'
      ],
      businessInformation: [
        'Protocolo de gestión de reclamos certificado',
        'Acceso directo a supervisores',
        'Sistema de seguimiento integrado'
      ],
      agentTone: 'Eres un gestor de reclamos empático y profesional. Mantén la calma, escucha activamente y muestra comprensión genuina hacia los problemas del cliente.',
      conversationPrompt: 'Tu objetivo es resolver problemas de manera efectiva y mantener la satisfacción del cliente. Documenta todo y escala cuando sea necesario.',
      conversationConfig: {
        historyLimit: 20,
        maxHistoryInRedis: 40,
        sessionTTL: 10800,
        model: 'gpt-4o-mini',
        temperature: 0.2,
        maxTokens: 1000
      },
      tasks: [],
      orchestration: {
        priorities: [],
        fallbackBehavior: 'Si no puedo resolver el reclamo, escalar inmediatamente a un supervisor humano con toda la información documentada.'
      }
    }
  },
  {
    id: 'faq-assistant',
    name: 'Asistente de Preguntas Frecuentes',
    description: 'Especializado en responder preguntas comunes y brindar información general sobre servicios.',
    icon: MessageSquare,
    color: 'from-indigo-500 to-indigo-600',
    category: 'Información',
    features: [
      'Respuestas instantáneas a FAQ',
      'Base de conocimiento extensa',
      'Redirección inteligente',
      'Información actualizada'
    ],
    agent: {
      alias: 'Asistente FAQ',
      name: 'Agente de Preguntas Frecuentes',
      description: 'Agente especializado en responder preguntas frecuentes y brindar información general',
      enabled: true,
      analyticsType: 'DISABLED',
      type: 'faq-assistant',
      channel: 'whatsapp',
      connected: false,
      status: 'draft',
      businessRules: [
        'Responder de manera clara y concisa',
        'Usar información actualizada',
        'Redirigir a especialistas cuando sea necesario',
        'Mantener respuestas consistentes'
      ],
      businessInformation: [
        'Base de conocimiento actualizada diariamente',
        'Acceso a información de servicios completa',
        'Integración con especialistas'
      ],
      agentTone: 'Eres un asistente informativo y útil. Habla de manera clara y concisa, sé paciente con las preguntas repetitivas.',
      conversationPrompt: 'Tu objetivo es responder preguntas frecuentes de manera clara y redirigir a especialistas cuando sea necesario.',
      conversationConfig: {
        historyLimit: 5,
        maxHistoryInRedis: 10,
        sessionTTL: 1800,
        model: 'gpt-4o-mini',
        temperature: 0.2,
        maxTokens: 1000
      },
      tasks: [],
      orchestration: {
        priorities: [],
        fallbackBehavior: 'Si no tengo la información solicitada, ofrecer conectar con un especialista o programar una consulta.'
      }
    }
  }
];

interface AgentTemplateSelectorProps {
  onBack: () => void;
}

export const AgentTemplateSelector: React.FC<AgentTemplateSelectorProps> = ({ onBack }) => {
  const { createAgent, setCurrentAgent } = useAgentStore();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAgent = async (template: AgentTemplate) => {
    setIsCreating(true);
    
    try {
      // Crear el agente con ID único
      const newAgent: Agent = {
        ...template.agent,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Agregar tareas predefinidas según el template
      const defaultTasks = createDefaultTasks(template.id);
      newAgent.tasks = defaultTasks;

      // Agregar prioridades predefinidas
      const defaultPriorities = createDefaultPriorities(template.id);
      newAgent.orchestration.priorities = defaultPriorities;

      // Crear agente via API
      const createdAgent = await createAgent(newAgent);
      setCurrentAgent(createdAgent);
      
    } catch (error) {
      console.error('Error creating agent:', error);
      // En caso de error, mantener en el selector
    } finally {
      setIsCreating(false);
    }
  };

  const createDefaultTasks = (templateId: string): Task[] => {
    const baseTasks: Task[] = [];
    
    switch (templateId) {
      case 'santi-whatsapp-agent':
        baseTasks.push(
          {
            id: 'capture-contact',
            name: 'Captura de Contacto',
            description: 'Solicita y guarda nombre y teléfono del usuario',
            type: TaskType.CAPTURE_CONTACT_DATA,
            enabled: true,
            prompt: {
              id: 'prompt-capture-contact',
              name: 'Prompt Captura Contacto',
              template: 'Saluda y solicita el nombre completo. Valida el número telefónico repitiéndolo en segmentos. Confirma siempre.',
              model: 'gpt-4o-mini',
              temperature: 0.2,
              maxTokens: 600
            },
            apiConfig: {
              method: 'POST',
              auth: { type: 'bearer', value: 'API_TOKEN' },
              headers: { 'Content-Type': 'application/json' }
            },
            metadata: { category: 'contact_capture' },
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'property-lookup',
            name: 'Búsqueda de Propiedad por ID',
            description: 'Consulta la información de una propiedad por su identificador',
            type: TaskType.SEARCH_SINGLE_PROPERTY,
            enabled: true,
            prompt: {
              id: 'prompt-property-id',
              name: 'Prompt Validar ID Propiedad',
              template: 'Solicita al usuario el número de propiedad. Valídalo repitiéndolo dígito por dígito y confirma con el usuario.',
              model: 'gpt-4o-mini',
              temperature: 0.2,
            },
            apiConfig: {
              endpoint: 'https://n8n-dev.iadmexico.mx/webhook/santi/get-property',
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            },
            metadata: { category: 'property_search' },
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'generic-property-search',
            name: 'Búsqueda Genérica de Propiedades',
            description: 'Recopila preferencias de búsqueda (tipo, operación, precio, ubicación)',
            type: TaskType.PROPERTY_SEARCH,
            enabled: true,
            prompt: {
              id: 'prompt-generic-search',
              name: 'Prompt Búsqueda Genérica',
              template: 'Recopila preferencias: tipo de operación (renta/venta), tipo de propiedad, presupuesto, ubicación. Confirma cada dato.',
              model: 'gpt-4o-mini',
              temperature: 0.3,
              maxTokens: 800
            },
            apiConfig: {
              endpoint: 'https://n8n-dev.iadmexico.mx/webhook/santi/generic-properties-search',
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            },
            metadata: { category: 'property_search' },
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'schedule-appointment',
            name: 'Agendar Visita o Llamada',
            description: 'Agenda visita a propiedad o llamada con agente (el usuario define fecha/hora)',
            type: TaskType.SCHEDULE_APPOINTMENT,
            enabled: true,
            prompt: {
              id: 'prompt-schedule',
              name: 'Prompt Agendar',
              template: 'Pregunta al usuario cuándo le gustaría agendar. Confirma fecha y hora. NO propongas horarios.',
              model: 'gpt-4o-mini',
              temperature: 0.2,
              maxTokens: 200
            },
            metadata: { category: 'appointment' },
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'csat-survey',
            name: 'Encuesta CSAT',
            description: 'Encuesta de satisfacción al final de la llamada',
            type: TaskType.CSAT_SURVEY,
            enabled: true,
            prompt: {
              id: 'prompt-schedule',
              name: 'Prompt Agendar',
              template: 'Pregunta al usuario cuándo le gustaría agendar. Confirma fecha y hora. NO propongas horarios.',
              model: 'gpt-4o-mini',
              temperature: 0.2,
              maxTokens: 200
            },
            metadata: { category: 'quality' },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        );
        break;

      case 'customer-support-agent':
        baseTasks.push(
          {
            id: 'complaint-handler',
            name: 'Gestión de Reclamos',
            description: 'Maneja reclamos y quejas de manera empática',
            type: TaskType.COMPLAINT,
            enabled: true,
            prompt: {
              id: 'prompt-complaint-handler',
              name: 'Prompt Gestión de Reclamos',
              template: 'Escucha activamente el reclamo del cliente. Documenta todos los detalles del problema. Ofrece soluciones concretas y específicas. Mantén la calma y profesionalismo en todo momento.',
              model: 'gpt-4o-mini',
              temperature: 0.2,
              maxTokens: 1000
            },
            metadata: { category: 'complaint_management' },
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'faq-support',
            name: 'Preguntas Frecuentes',
            description: 'Responde consultas comunes de soporte',
            type: TaskType.FAQ,
            enabled: true,
            prompt: {
              id: 'prompt-faq-support',
              name: 'Prompt FAQ Soporte',
              template: 'Responde preguntas frecuentes de manera clara y útil. Usa información de la base de conocimiento. Si no tienes la información específica, ofrece escalamiento a un especialista.',
              model: 'gpt-4o-mini',
              temperature: 0.2,
              maxTokens: 1000
            },
            metadata: { category: 'faq' },
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'human-handoff',
            name: 'Transferencia a Humano',
            description: 'Escala consultas complejas a agentes humanos',
            type: TaskType.CUSTOM,
            enabled: true,
            prompt: {
              id: 'prompt-human-handoff',
              name: 'Prompt Transferencia Humano',
              template: 'Transfiere de manera profesional a un agente humano. Explica claramente el motivo del escalamiento y proporciona un resumen de la conversación para el agente humano.',
              model: 'gpt-4o-mini',
              temperature: 0.2,
              maxTokens: 1000
            },
            metadata: { category: 'escalation' },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        );
        break;

      case 'property-advisor':
        baseTasks.push(
          {
            id: 'property-analysis',
            name: 'Análisis de Propiedades',
            description: 'Analiza propiedades específicas y brinda asesoría',
            type: TaskType.SEARCH_SINGLE_PROPERTY,
            enabled: true,
            prompt: {
              id: 'prompt-property-analysis',
              name: 'Prompt Análisis de Propiedades',
              template: 'Analiza la propiedad considerando ubicación, precio, características y condiciones del mercado. Proporciona una evaluación objetiva con pros y contras. Incluye recomendaciones específicas.',
              model: 'gpt-4o-mini',
              temperature: 0.2,
              maxTokens: 1000
            },
            metadata: { category: 'property_analysis' },
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'market-consultation',
            name: 'Consulta de Mercado',
            description: 'Brinda información sobre tendencias y precios de mercado',
            type: TaskType.FAQ,
            enabled: true,
            prompt: {
              id: 'prompt-market-consultation',
              name: 'Prompt Consulta de Mercado',
              template: 'Proporciona información actualizada sobre el mercado inmobiliario. Usa datos precisos de la base de conocimiento. Explica tendencias de manera comprensible y específica para la zona consultada.',
              model: 'gpt-4o-mini',
              temperature: 0.2,
              maxTokens: 1000
            },
            metadata: { category: 'market_analysis' },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        );
        break;

      case 'appointment-coordinator':
        baseTasks.push(
          {
            id: 'schedule-management',
            name: 'Gestión de Agenda',
            description: 'Maneja disponibilidad y agendamiento de citas',
            type: TaskType.SCHEDULE_APPOINTMENT,
            enabled: true,
            prompt: {
              id: 'prompt-schedule-management',
              name: 'Prompt Gestión de Agenda',
              template: 'Gestiona horarios y confirma disponibilidad. Agenda citas de manera organizada. Pregunta por preferencias de día y hora. Confirma todos los detalles antes de finalizar.',
              model: 'gpt-4o-mini',
              temperature: 0.2,
              maxTokens: 1000
            },
            metadata: { category: 'scheduling' },
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'appointment-reminders',
            name: 'Recordatorios de Citas',
            description: 'Envía recordatorios y gestiona reprogramaciones',
            type: TaskType.CUSTOM,
            enabled: true,
            prompt: {
              id: 'prompt-appointment-reminders',
              name: 'Prompt Recordatorios de Citas',
              template: 'Gestiona recordatorios de citas de manera proactiva. Confirma asistencia del cliente. Si no puede asistir, ofrece opciones de reprogramación con horarios alternativos.',
              model: 'gpt-4o-mini',
              temperature: 0.2,
              maxTokens: 1000
            },
            metadata: { category: 'reminders' },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        );
        break;

      case 'complaint-handler':
        baseTasks.push(
          {
            id: 'complaint-intake',
            name: 'Recepción de Reclamos',
            description: 'Recibe y documenta reclamos de manera empática',
            type: TaskType.COMPLAINT,
            enabled: true,
            prompt: {
              id: 'prompt-complaint-intake',
              name: 'Prompt Recepción de Reclamos',
              template: 'Escucha activamente el reclamo. Valida las emociones del cliente con empatía. Documenta detalladamente todos los aspectos del problema. Haz preguntas específicas para entender completamente la situación.',
              model: 'gpt-4o-mini',
              temperature: 0.2,
              maxTokens: 1000
            },
            metadata: { category: 'complaint_intake' },
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'solution-offering',
            name: 'Ofrecimiento de Soluciones',
            description: 'Propone soluciones concretas a los reclamos',
            type: TaskType.CUSTOM,
            enabled: true,
            prompt: {
              id: 'prompt-solution-offering',
              name: 'Prompt Ofrecimiento de Soluciones',
              template: 'Basándote en el reclamo documentado, ofrece soluciones concretas y viables. Sé específico en los pasos a seguir. Proporciona tiempos estimados de resolución.',
              model: 'gpt-4o-mini',
              temperature: 0.2,
              maxTokens: 1000
            },
            metadata: { category: 'solution_management' },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        );
        break;

      case 'faq-assistant':
        baseTasks.push(
          {
            id: 'faq-response',
            name: 'Respuestas FAQ',
            description: 'Responde preguntas frecuentes de manera clara',
            type: TaskType.FAQ,
            enabled: true,
            prompt: {
              id: 'prompt-faq-response',
              name: 'Prompt Respuestas FAQ',
              template: 'Responde preguntas frecuentes de manera clara y concisa. Usa información de la base de conocimiento. Mantén consistencia en las respuestas. Si no tienes la información, indica que conectarás con un especialista.',
              model: 'gpt-4o-mini',
              temperature: 0.2,
              maxTokens: 1000
            },
            metadata: { category: 'faq' },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        );
        break;
    }

    return baseTasks;
  };

  const createDefaultPriorities = (templateId: string): Priority[] => {
    const priorities: Priority[] = [];

    switch (templateId) {
      case 'santi-whatsapp-agent':
        priorities.push(
          {
            id: 'p_contact',
            name: 'Capturar Contacto',
            description: 'Obtener nombre y teléfono del usuario',
            weight: 90,
            triggers: ['hola', 'buenas', 'mi nombre', 'soy'],
            requiredData: [],
            dependsOn: [],
            completionCriteria: 'Nombre y teléfono confirmados',
            taskId: 'capture-contact',
            enabled: true,
            executeOnce: true,
            metadata: { phase: 'initial_contact' }
          },
          {
            id: 'p_property_id',
            name: 'Validar ID Propiedad',
            description: 'Solicitar número de propiedad',
            weight: 80,
            triggers: ['propiedad', 'id', 'número de propiedad'],
            requiredData: ['nombre', 'telefono'],
            dependsOn: ['p_contact'],
            completionCriteria: 'Número de propiedad validado',
            taskId: 'property-lookup',
            enabled: true,
            executeOnce: false,
            metadata: { phase: 'property' }
          },
          {
            id: 'p_property_search',
            name: 'Búsqueda de Propiedades',
            description: 'Recopilar criterios de búsqueda',
            weight: 70,
            triggers: ['busco', 'necesito', 'quiero', 'casa', 'departamento'],
            requiredData: ['nombre', 'telefono'],
            dependsOn: ['p_contact'],
            completionCriteria: 'Preferencias completas recopiladas',
            taskId: 'generic-property-search',
            enabled: true,
            executeOnce: false,
            metadata: { phase: 'requirements' }
          },
          {
            id: 'p_schedule',
            name: 'Agendar',
            description: 'Proponer agendar visita o llamada',
            weight: 60,
            triggers: ['agendar', 'cita', 'visita', 'llamada'],
            requiredData: ['nombre', 'telefono'],
            dependsOn: ['p_property_id', 'p_property_search'],
            completionCriteria: 'Cita confirmada',
            taskId: 'schedule-appointment',
            enabled: true,
            executeOnce: false,
            metadata: { phase: 'appointment' }
          },
          {
            id: 'p_csat',
            name: 'Encuesta CSAT',
            description: 'Medir satisfacción antes de terminar',
            weight: 40,
            triggers: ['finalizar', 'terminar', 'gracias'],
            requiredData: [],
            dependsOn: [],
            completionCriteria: 'Encuesta realizada o rechazada',
            taskId: 'csat-survey',
            enabled: true,
            executeOnce: true,
            metadata: { phase: 'end' }
          }
        );
        break;

      case 'customer-support-agent':
        priorities.push(
          {
            id: 'p_handle_complaint',
            name: 'Gestionar Reclamo',
            description: 'Atender reclamos con máxima prioridad',
            weight: 95,
            triggers: ['reclamo', 'queja', 'problema', 'molesto', 'insatisfecho', 'mal servicio'],
            requiredData: [],
            dependsOn: [],
            completionCriteria: 'Reclamo documentado y solución ofrecida',
            taskId: 'complaint-intake',
            enabled: true,
            executeOnce: false,
            metadata: { phase: 'complaint_handling' }
          },
          {
            id: 'p_answer_faq',
            name: 'Responder Preguntas Frecuentes',
            description: 'Atender consultas generales',
            weight: 60,
            triggers: ['pregunta', 'duda', 'información', 'cómo', 'qué', 'cuándo'],
            requiredData: [],
            dependsOn: [],
            completionCriteria: 'Pregunta respondida satisfactoriamente',
            taskId: 'faq-support',
            enabled: true,
            executeOnce: false,
            metadata: { phase: 'information' }
          }
        );
        break;

      case 'property-advisor':
        priorities.push(
          {
            id: 'p_property_analysis',
            name: 'Análisis de Propiedades',
            description: 'Analizar propiedades específicas',
            weight: 80,
            triggers: ['analizar', 'evaluar', 'opinión', 'vale la pena', 'recomendación'],
            requiredData: ['property_id'],
            dependsOn: [],
            completionCriteria: 'Análisis completo proporcionado',
            taskId: 'property-analysis',
            enabled: true,
            executeOnce: false,
            metadata: { phase: 'analysis' }
          },
          {
            id: 'p_market_consultation',
            name: 'Consulta de Mercado',
            description: 'Brindar información de mercado',
            weight: 70,
            triggers: ['mercado', 'precios', 'tendencia', 'valuación', 'costo'],
            requiredData: ['ubicacion'],
            dependsOn: [],
            completionCriteria: 'Información de mercado proporcionada',
            taskId: 'market-consultation',
            enabled: true,
            executeOnce: false,
            metadata: { phase: 'market_info' }
          }
        );
        break;

      case 'appointment-coordinator':
        priorities.push(
          {
            id: 'p_schedule_coordination',
            name: 'Coordinación de Agenda',
            description: 'Gestionar y coordinar citas',
            weight: 85,
            triggers: ['agendar', 'cita', 'horario', 'disponibilidad', 'cuándo'],
            requiredData: ['nombre', 'telefono'],
            dependsOn: [],
            completionCriteria: 'Cita agendada y confirmada',
            taskId: 'schedule-management',
            enabled: true,
            executeOnce: false,
            metadata: { phase: 'scheduling' }
          },
          {
            id: 'p_appointment_management',
            name: 'Gestión de Citas',
            description: 'Manejar recordatorios y reprogramaciones',
            weight: 65,
            triggers: ['recordatorio', 'cambiar', 'reprogramar', 'cancelar', 'confirmar'],
            requiredData: ['cita_id'],
            dependsOn: [],
            completionCriteria: 'Gestión de cita completada',
            taskId: 'appointment-reminders',
            enabled: true,
            executeOnce: false,
            metadata: { phase: 'management' }
          }
        );
        break;

      case 'faq-assistant':
        priorities.push(
          {
            id: 'responder-faq',
            name: 'Responder FAQ',
            description: 'Responder preguntas frecuentes',
            weight: 75,
            triggers: ['pregunta', 'información', 'cómo', 'qué', 'cuándo', 'dónde'],
            requiredData: [],
            dependsOn: [],
            completionCriteria: 'Pregunta respondida o redirigida',
            taskId: 'faq-response',
            enabled: true,
            executeOnce: false,
            metadata: { phase: 'information' }
          }
        );
        break;
    }

    return priorities;
  };

  const categories = [...new Set(agentTemplates.map(t => t.category))];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Agente</h1>
              <p className="text-gray-600">Selecciona un template predefinido para comenzar rápidamente</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Templates Inteligentes</span>
          </div>
        </div>
      </div>

      {/* Categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => {
          const templatesInCategory = agentTemplates.filter(t => t.category === category);
          return (
            <div key={category} className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{category}</h3>
              <p className="text-sm text-gray-600">{templatesInCategory.length} template{templatesInCategory.length !== 1 ? 's' : ''}</p>
            </div>
          );
        })}
      </div>

      {/* Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {agentTemplates.map((template) => {
          const Icon = template.icon;
          const isSelected = selectedTemplate === template.id;
          
          return (
            <div
              key={template.id}
              className={`bg-white rounded-xl border-2 overflow-hidden transition-all duration-300 cursor-pointer ${
                isSelected 
                  ? 'border-purple-500 shadow-lg transform scale-105' 
                  : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
              }`}
              onClick={() => setSelectedTemplate(isSelected ? null : template.id)}
            >
              {/* Header */}
              <div className={`p-6 bg-gradient-to-r ${template.color}`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{template.name}</h3>
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-white/20 text-white rounded-full">
                      {template.category}
                    </span>
                  </div>
                </div>
                <p className="text-white/90 text-sm">{template.description}</p>
              </div>

              {/* Features */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Características incluidas:</h4>
                <ul className="space-y-2">
                  {template.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Configuración Técnica */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">Canal:</span>
                      <span className="ml-1">{template.agent.channel === 'whatsapp' ? 'WhatsApp' : 'Llamadas'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Modelo:</span>
                      <span className="ml-1">{template.agent.conversationConfig?.model}</span>
                    </div>
                    <div>
                      <span className="font-medium">Creatividad:</span>
                      <span className="ml-1">{template.agent.conversationConfig?.temperature}</span>
                    </div>
                    <div>
                      <span className="font-medium">Respuestas:</span>
                      <span className="ml-1">{template.agent.conversationConfig?.maxTokens} tokens</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de Crear */}
              {isSelected && (
                <div className="px-6 pb-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateAgent(template);
                    }}
                    disabled={isCreating}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      isCreating
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : `bg-gradient-to-r ${template.color} text-white hover:shadow-lg`
                    }`}
                  >
                    {isCreating ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>Creando agente...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Bot className="h-4 w-4" />
                        <span>Crear Agente</span>
                      </div>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Información adicional */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-purple-800 mb-2">Templates Inteligentes</h3>
            <div className="text-sm text-purple-700 space-y-2">
              <p>
                Cada template incluye <strong>configuración completa</strong>: tareas predefinidas, prioridades optimizadas, 
                y configuración de IA ajustada para el caso de uso específico.
              </p>
              <p>
                Después de crear el agente, podrás <strong>personalizar completamente</strong> todos los aspectos: 
                comportamiento, tareas, reglas de negocio y configuración técnica.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};