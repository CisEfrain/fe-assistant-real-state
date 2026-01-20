import React, { useState } from 'react';
import { List, Plus, Settings, Eye, Trash2, ToggleLeft as Toggle, ArrowUp, ArrowDown, Brain, X, Copy } from 'lucide-react';
import { useAgentStore } from '../../../stores/useAgentStore';
import { Task, TASK_TYPES } from '../../../types/agents';
import { TaskEditor } from '../TaskEditor';

export const AgentTasks: React.FC = () => {
  const { currentAgent, selectedTask, setSelectedTask, addTask, removeTask, updateTask, duplicateTask } = useAgentStore();
  const [filterType, setFilterType] = useState<string>('');
  const [filterEnabled, setFilterEnabled] = useState<string>('');
  const [showTaskTypeSelector, setShowTaskTypeSelector] = useState(false);

  if (!currentAgent) return null;

  const filteredTasks = currentAgent.tasks.filter(task => {
    if (filterType && task.type !== filterType) return false;
    if (filterEnabled === 'enabled' && !task.enabled) return false;
    if (filterEnabled === 'disabled' && task.enabled) return false;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => b.priority - a.priority);

  const handleCreateTask = (taskType: string) => {
    const taskTypeTemplates = {
      'CAPTURE_CONTACT_DATA': {
        name: 'Capturar Datos de Contacto',
        description: 'Recopila información básica del lead: nombre, email, teléfono',
        template: 'Eres un agente inmobiliario profesional. Tu objetivo es capturar los datos de contacto del lead de manera natural y amigable.\n\nInstrucciones:\n1. Saluda cordialmente\n2. Solicita nombre completo\n3. Pide email válido\n4. Confirma teléfono de contacto\n5. Valida que la información esté completa\n\nMantén un tono profesional pero cercano.',
        temperature: 0.2,
        maxTokens: 500
      },
      'PROPERTY_SEARCH': {
        name: 'Búsqueda de Propiedades',
        description: 'Recopila criterios de búsqueda y busca propiedades',
        template: 'Eres un experto inmobiliario ayudando a un cliente a definir sus criterios de búsqueda.\n\nInstrucciones:\n1. Recopila: tipo de operación (renta/venta), ubicación, tipo de propiedad, presupuesto\n2. Haz preguntas específicas y relevantes\n3. Cuando tengas criterios completos, ofrece buscar propiedades\n4. Mantén el enfoque en recopilar información antes de mostrar opciones\n\nResponde de forma natural y profesional.',
        temperature: 0.3,
        maxTokens: 600
      },
      'URL_PROPERTY_PORTAL': {
        name: 'Buscar propiedad por url del portal',
        description: 'Se usa buscar la propiedad en nuestra base de datos en base a una url dada en un portal inmobiliario',
        template: 'El usuario ha dado clic en el boton de whatsapp de una publicación en un portal inmobiliario externo a iad. Da un pequeño resumen de las ventajas de esa propiedad y solicita su nombre, teléfono y correo para proceder. Antes de agendar pasamos a la precalificación',
        temperature: 0.3,
        maxTokens: 600
      },
      'SEARCH_RELATED_PROPERTIES': {
        name: 'Búsqueda de Propiedades Relacionadas',
        description: 'Busca propiedades similares o relacionadas a una propiedad específica',
        template: 'Eres un experto inmobiliario especializado en encontrar propiedades relacionadas.\n\nInstrucciones:\n1. Identifica las características clave de la propiedad de referencia\n2. Busca propiedades similares en: ubicación, precio, tamaño, tipo\n3. Presenta opciones alternativas que puedan interesar al cliente\n4. Explica por qué cada propiedad es relevante\n5. Ofrece agendar visitas a las propiedades de interés\n\nMantén un tono consultivo y profesional, destacando el valor de cada opción.',
        temperature: 0.3,
        maxTokens: 700
      },
      'SCHEDULE_APPOINTMENT': {
        name: 'Agendar Cita',
        description: 'Programa citas o visitas con el cliente',
        template: 'Eres un agente inmobiliario que ayuda a agendar citas y visitas.\n\nInstrucciones:\n1. Ofrece agendar cita solo cuando tengas datos completos del cliente\n2. Propón horarios disponibles dentro del horario de atención\n3. Confirma todos los detalles de la cita\n4. Explica qué documentos debe traer si aplica\n\nHorario de atención: Lunes a Viernes 9:00-18:00, Sábados 9:00-14:00\n\nResponde de forma profesional y organizada.',
        temperature: 0.2,
        maxTokens: 400
      },
      'CSAT_SURVEY': {
        name: 'Encuesta CSAT',
        description: 'Aplica encuesta de satisfacción al cliente',
        template: 'Eres un agente inmobiliario aplicando una encuesta de satisfacción.\n\nInstrucciones:\n1. Aplica la encuesta solo al final de la conversación\n2. Pregunta: "¿Podrías calificar tu experiencia del 1 al 5? (1=Muy malo, 5=Excelente)"\n3. Si la calificación es baja (1-2), pregunta cómo mejorar\n4. Agradece la retroalimentación\n5. Despídete profesionalmente\n\nResponde de forma amable y agradecida.',
        temperature: 0.5,
        maxTokens: 300
      },
      'classifier': {
        name: 'Detector de Intención',
        description: 'Identifica la intención del usuario cuando no es clara',
        template: 'Eres un detector de intención especializado en conversaciones inmobiliarias.\n\nTu objetivo es identificar qué quiere hacer el usuario cuando su mensaje no es claro.\n\nInstrucciones:\n1. Analiza el mensaje del usuario cuidadosamente\n2. Identifica si busca: información de propiedades, agendar cita, hacer reclamo, o solo saludar\n3. Haz una pregunta específica para clarificar su intención\n4. Mantén el tono amigable y profesional\n5. No asumas, siempre pregunta para confirmar\n\nEjemplos de respuestas:\n- "Veo que estás interesado en propiedades. ¿Estás buscando comprar o rentar?"\n- "¿Te gustaría que te ayude a buscar una propiedad específica o tienes alguna consulta?"\n\nResponde de forma clara y directa.',
        temperature: 0.4,
        maxTokens: 400
      },
      'COMPLAINT': {
        name: 'Gestión de Reclamos',
        description: 'Maneja reclamos y quejas de manera empática',
        template: 'Eres un agente inmobiliario especializado en gestión de reclamos.\n\nInstrucciones:\n1. Escucha activamente el reclamo del cliente\n2. Valida las emociones del cliente con empatía\n3. Documenta detalladamente todos los aspectos del problema\n4. Haz preguntas específicas para entender completamente la situación\n5. Ofrece soluciones concretas y viables\n6. Si no puedes resolver, escala a un supervisor\n\nMantén siempre un tono empático y profesional.',
        temperature: 0.2,
        maxTokens: 800
      },
      'FAQ': {
        name: 'Preguntas Frecuentes',
        description: 'Responde consultas comunes de manera clara',
        template: 'Eres un agente inmobiliario especializado en responder preguntas frecuentes.\n\nInstrucciones:\n1. Responde preguntas frecuentes de manera clara y concisa\n2. Usa información de la base de conocimiento\n3. Mantén consistencia en las respuestas\n4. Si no tienes la información específica, indica que conectarás con un especialista\n5. Proporciona información útil y actualizada\n\nResponde de forma profesional y útil.',
        temperature: 0.3,
        maxTokens: 600
      },
      'CUSTOM': {
        name: 'Función Personalizada',
        description: 'Función personalizada para casos específicos',
        template: 'Eres un asistente inmobiliario especializado. Tu objetivo es ayudar al usuario con esta función específica.\n\nInstrucciones:\n1. Escucha atentamente la consulta del usuario\n2. Proporciona información clara y útil\n3. Mantén un tono profesional y amigable\n4. Sigue las mejores prácticas de atención al cliente\n\nResponde de manera natural y conversacional.',
        temperature: 0.7,
        maxTokens: 500
      }
    };

    const template = taskTypeTemplates[taskType as keyof typeof taskTypeTemplates] || taskTypeTemplates.CUSTOM;
    
    const newTask: Task = {
      id: `t_task_${Date.now()}`,
      name: template.name,
      description: template.description,
      type: taskType as any,
      enabled: true,
      prompt: {
        id: `p_task_${Date.now()}`,
        name: template.name.toLowerCase().replace(/\s+/g, '_'),
        template: template.template,
        model: 'gpt-4o-mini',
        temperature: template.temperature,
        maxTokens: template.maxTokens
      },
      metadata: {
        category: taskType.toLowerCase(),
        isUserCreated: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Agregar la tarea al agente actual
    if (currentAgent) {
      addTask(newTask);
    }
    setSelectedTask(newTask);
    setShowTaskTypeSelector(false);
  };

  const getTaskTypeColor = (type: string) => {
    const colors = {
      classifier: 'bg-blue-100 text-blue-800',
      lead_intake: 'bg-green-100 text-green-800',
      property_lookup: 'bg-purple-100 text-purple-800',
      property_specific: 'bg-orange-100 text-orange-800',
      rag_qa: 'bg-indigo-100 text-indigo-800',
      appointment_booking: 'bg-pink-100 text-pink-800',
      complaint: 'bg-red-100 text-red-800',
      faq: 'bg-yellow-100 text-yellow-800',
      handoff: 'bg-gray-100 text-gray-800',
      moderation: 'bg-cyan-100 text-cyan-800',
      custom: 'bg-slate-100 text-slate-800'
    };
    return colors[type as keyof typeof colors] || colors.custom;
  };

  const moveTask = (taskId: string, direction: 'up' | 'down') => {
    const task = currentAgent.tasks.find(t => t.id === taskId);
    if (!task) return;

    const newPriority = direction === 'up' ? task.priority + 1 : task.priority - 1;
    updateTask(taskId, { priority: Math.max(1, newPriority) });
  };

  if (selectedTask) {
    return <TaskEditor />;
  }

  return (
    <div className="space-y-6">
      {/* Header y Filtros */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <List className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Tareas del Agente ({filteredTasks.length})
            </h3>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              {Object.entries(TASK_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            
            <select
              value={filterEnabled}
              onChange={(e) => setFilterEnabled(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="enabled">Solo habilitadas</option>
              <option value="disabled">Solo deshabilitadas</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setShowTaskTypeSelector(true)}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
          title="Crear nueva función personalizada"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Función
        </button>
      </div>

      {/* Selector de Tipo de Tarea */}
      {showTaskTypeSelector && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Seleccionar Tipo de Función</h3>
                <p className="text-sm text-gray-600">Elige el tipo de función que quieres agregar a tu asistente</p>
              </div>
            </div>
            <button
              onClick={() => setShowTaskTypeSelector(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(TASK_TYPES).map(([key, label]) => {
              const getTaskIcon = (type: string) => {
                switch (type) {
                  case 'CAPTURE_CONTACT_DATA': return '👤';
                  case 'PROPERTY_SEARCH': return '🏠';
                  case 'SCHEDULE_APPOINTMENT': return '📅';
                  case 'CSAT_SURVEY': return '⭐';
                  case 'URL_PROPERTY_PORTAL': return '🌐';
                  case 'classifier': return '🧠';
                  case 'COMPLAINT': return '⚠️';
                  case 'FAQ': return '❓';
                  default: return '⚙️';
                }
              };

              const getTaskDescription = (type: string) => {
                switch (type) {
                  case 'CAPTURE_CONTACT_DATA': return 'Recopila nombre, email y teléfono del cliente';
                  case 'PROPERTY_SEARCH': return 'Busca propiedades según criterios del cliente';
                  case 'SCHEDULE_APPOINTMENT': return 'Agenda citas y visitas con clientes';
                  case 'CSAT_SURVEY': return 'Mide satisfacción del cliente';
                  case 'URL_PROPERTY_PORTAL': return 'Busca propiedades según criterios del cliente';
                  case 'classifier': return 'Detecta la intención cuando no es clara';
                  case 'COMPLAINT': return 'Gestiona reclamos de manera empática';
                  case 'FAQ': return 'Responde preguntas frecuentes';
                  default: return 'Función personalizada para casos específicos';
                }
              };

              return (
                <button
                  key={key}
                  onClick={() => handleCreateTask(key)}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{getTaskIcon(key)}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{label}</h4>
                      <p className="text-sm text-gray-600">{getTaskDescription(key)}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {/* Lista de Funciones */}
      <div className="grid grid-cols-1 gap-4">
        {sortedTasks.map((task, index) => (
          <div
            key={task.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${task.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <div>
                    <h4 className="font-medium text-gray-900">{task.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">ID: {task.id}</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTaskTypeColor(task.type)}`}>
                        {TASK_TYPES[task.type as keyof typeof TASK_TYPES] || task.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => duplicateTask(task.id)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Duplicar tarea"
                >
                  <Copy className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => updateTask(task.id, { enabled: !task.enabled })}
                  className={`p-2 rounded-lg transition-colors ${
                    task.enabled 
                      ? 'text-green-600 hover:bg-green-50' 
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                  title={task.enabled ? 'Deshabilitar' : 'Habilitar'}
                >
                  <Toggle className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => setSelectedTask(task)}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="Configurar"
                >
                  <Settings className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => setSelectedTask(task)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Ver detalles"
                >
                  <Eye className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => {
                    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
                      removeTask(task.id);
                    }
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Información adicional */}
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Modelo IA:</span>
                <span className="ml-1">{task.prompt?.model || 'Estándar'}</span>
              </div>
              <div>
                <span className="font-medium">Creatividad:</span>
                <span className="ml-1">
                  {task.prompt?.temperature || 0.7}
                </span>
              </div>
              <div>
                <span className="font-medium">Estado:</span>
                <span className={`ml-1 font-medium ${task.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                  {task.enabled ? 'Habilitada' : 'Deshabilitada'}
                </span>
              </div>
              <div>
                <span className="font-medium">Tokens:</span>
                <span className="ml-1">{task.prompt?.maxTokens || 1000}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estado vacío */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <List className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {currentAgent.tasks.length === 0 ? 'No hay funciones configuradas' : 'No hay funciones que coincidan con los filtros'}
          </h3>
          <p className="text-gray-500 mb-6">
            {currentAgent.tasks.length === 0 
              ? 'Las funciones del asistente se configuran automáticamente'
              : 'Ajusta los filtros para ver más tareas'
            }
          </p>
        </div>
      )}
    </div>
  );
};