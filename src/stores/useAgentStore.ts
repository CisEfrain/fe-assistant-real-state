import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Agent, Task, Priority, KnowledgeItem, ConversationResponse, PriorityAction } from '../types/agents';
import { agentAPI } from '../services/agentApi';

interface AgentStore {
  agents: Agent[];
  currentAgent: Agent | null;
  selectedTask: Task | null;
  loading: boolean;
  error: string | null;
  isOnline: boolean;

  // Actions
  setCurrentAgent: (agent: Agent | null) => void;
  setSelectedTask: (task: Task | null) => void;
  
  // API Actions
  fetchAgents: () => Promise<void>;
  fetchAgent: (id: string) => Promise<void>;
  createAgent: (agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Agent>;
  updateAgent: (agent: Agent) => void;
  saveAgent: (agent: Agent) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  
  // Enhanced Task Management
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  saveTask: (agentId: string, taskId: string, updates: Partial<Task>) => Promise<void>;
  createTask: (agentId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  bulkSaveTasks: (agentId: string) => Promise<void>;
  addTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  
  // Priority management
  updatePriority: (priorityId: string, updates: Partial<Priority>) => void;
  savePriorities: (agentId: string) => Promise<void>;
  addPriority: (priority: Priority) => void;
  removePriority: (priorityId: string) => void;
  
  // Priority Actions management
  updatePriorityActions: (priorityId: string, actions: PriorityAction[]) => void;
  addPriorityAction: (priorityId: string, action: PriorityAction) => void;
  updatePriorityAction: (priorityId: string, actionName: string, updates: Partial<PriorityAction>) => void;
  removePriorityAction: (priorityId: string, actionName: string) => void;
  
  // Knowledge base management
  updateKnowledgeItem: (itemId: string, updates: Partial<KnowledgeItem>) => void;
  saveKnowledgeBase: (agentId: string) => Promise<void>;
  addKnowledgeItem: (item: KnowledgeItem) => void;
  removeKnowledgeItem: (itemId: string) => void;
  
  // Enhanced Conversation Management
  sendMessage: (message: string, sessionId: string, agentId: string, context?: Record<string, any>) => Promise<ConversationResponse>;
  
  // Duplication features
  duplicateAgent: (agentId: string) => Promise<Agent>;
  duplicateTask: (taskId: string) => void;
  duplicatePriority: (priorityId: string) => void;
  
  // Utility
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  checkConnection: () => Promise<void>;
  
  // Mock data initialization
  initializeMockData: () => void;
}

export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
  agents: [],
  currentAgent: null,
  selectedTask: null,
  loading: false,
  error: null,
  isOnline: false,

  setCurrentAgent: (agent) => set({ currentAgent: agent }),
  
  setSelectedTask: (task) => set({ selectedTask: task }),

  // API Actions
  fetchAgents: async () => {
    set({ loading: true, error: null });
    try {
      const response = await agentAPI.getAgents();
      set({ agents: response.data, loading: false, isOnline: true });
    } catch (error) {
      console.error('Error fetching agents:', error);
      set({ 
        error: 'Error al cargar agentes. Usando datos locales.', 
        loading: false,
        isOnline: false 
      });
      // Fallback to mock data if API fails
      get().initializeMockData();
    }
  },

  fetchAgent: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const agent = await agentAPI.getAgent(id);
      set({ currentAgent: agent, loading: false });
    } catch (error) {
      console.error('Error fetching agent:', error);
      set({ 
        error: 'Error al cargar agente', 
        loading: false 
      });
    }
  },

  createAgent: async (agentData) => {
    set({ loading: true, error: null });
    try {
      const newAgent = await agentAPI.createAgent(agentData);
      set((state) => ({
        agents: [...state.agents, newAgent],
        currentAgent: newAgent,
        loading: false
      }));
      return newAgent;
    } catch (error) {
      console.error('Error creating agent:', error);
      set({ 
        error: 'Error al crear agente', 
        loading: false 
      });
      throw error;
    }
  },

  updateAgent: (agent) => {
    set((state) => ({
      agents: state.agents.map(a => a.id === agent.id ? agent : a),
      currentAgent: state.currentAgent?.id === agent.id ? agent : state.currentAgent
    }));
  },

  saveAgent: async (agent) => {
    set({ loading: true, error: null });
    try {
      // Send complete agent data including orchestration and promptVariables
      const agentUpdates = {
        alias: agent.alias,
        name: agent.name,
        description: agent.description,
        type: agent.type,
        channel: agent.channel,
        connected: agent.connected,
        businessRules: agent.businessRules,
        businessInformation: agent.businessInformation,
        agentTone: agent.agentTone,
        conversationPrompt: agent.conversationPrompt,
        conversationConfig: agent.conversationConfig,
        enabled: agent.enabled,
        analyticsType: agent.analyticsType,
        analyticsEnabled: agent.analyticsEnabled,
        status: agent.status,
        orchestration: agent.orchestration,
        tasks: agent.tasks,
      };
      
      const updatedAgent = await agentAPI.updateAgent(agent.id, agentUpdates);
      get().updateAgent(updatedAgent);
      set({ loading: false });
    } catch (error) {
      console.error('Error saving agent:', error);
      set({ 
        error: 'Error al guardar agente', 
        loading: false 
      });
    }
  },

  deleteAgent: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await agentAPI.deleteAgent(id);
      set((state) => ({
        agents: state.agents.filter(a => a.id !== id),
        currentAgent: state.currentAgent?.id === id ? null : state.currentAgent,
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting agent:', error);
      set({ 
        error: 'Error al eliminar agente', 
        loading: false 
      });
    }
  },

  updateTask: (taskId, updates) => {
    const { currentAgent } = get();
    if (!currentAgent) return;

    const updatedTasks = currentAgent.tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          ...updates,
          updatedAt: new Date()
        };
      }
      return task;
    });

    const updatedAgent = {
      ...currentAgent,
      tasks: updatedTasks,
      updatedAt: new Date()
    };

    set((state) => ({
      agents: state.agents.map(a => a.id === updatedAgent.id ? updatedAgent : a),
      currentAgent: updatedAgent,
      selectedTask: state.selectedTask?.id === taskId ? 
        updatedTasks.find(t => t.id === taskId) || state.selectedTask : 
        state.selectedTask
    }));
  },

  saveTask: async (agentId: string, taskId: string, updates: Partial<Task>) => {
    // Robust validation for taskId
    if (!taskId || taskId === 'undefined' || taskId === 'null' || typeof taskId !== 'string' || taskId.trim() === '') {
      console.error('saveTask called with invalid taskId:', taskId);
      console.error('Full context:', { agentId, taskId, updates, typeOfTaskId: typeof taskId });
      set({ 
        error: `Error: ID de tarea inválido (${taskId}). Verifica que la tarea tenga un ID válido.`, 
        loading: false 
      });
      return;
    }

    set({ loading: true, error: null });
    try {
      // Get the current task to send complete data
      const { currentAgent } = get();
      
      if (!currentAgent) {
        throw new Error('No hay agente seleccionado');
      }
      
      const currentTask = currentAgent?.tasks.find(t => t.id === taskId);
      
      if (!currentTask) {
        console.error('Task not found with ID:', taskId);
        console.error('Available task IDs:', currentAgent.tasks.map(t => t.id));
        throw new Error(`Tarea no encontrada con ID: ${taskId}. IDs disponibles: ${currentAgent.tasks.map(t => t.id).join(', ')}`);
      }

      // Merge current task with updates
      const completeTask = {
        ...currentTask,
        ...updates,
        updatedAt: new Date()
      };

      console.log('Saving task with validated data:', { 
        agentId, 
        taskId, 
        taskIdType: typeof taskId,
        taskIdLength: taskId.length,
        hasCurrentTask: !!currentTask,
        completeTask 
      });
      
      const updatedTask = await agentAPI.updateTask(agentId, taskId, completeTask);
      get().updateTask(taskId, updatedTask);
      set({ loading: false });
    } catch (error) {
      console.error('Error saving task:', error);
      set({ 
        error: `Error al guardar tarea: ${error instanceof Error ? error.message : 'Error desconocido'}`, 
        loading: false 
      });
    }
  },

  createTask: async (agentId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    set({ loading: true, error: null });
    try {
      // Crear tarea localmente primero
      const newTaskWithId: Task = {
        ...taskData,
        id: `task_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Intentar crear en el backend
      try {
        const createdTask = await agentAPI.createTask(agentId, taskData);
        // Si el backend responde exitosamente, usar su respuesta
        get().addTask(createdTask);
      } catch (apiError) {
        console.warn('API creation failed, keeping local task:', apiError);
        // Si la API falla, usar la tarea local
        get().addTask(newTaskWithId);
      }
      
      set({ loading: false });
    } catch (error) {
      console.error('Error creating task:', error);
      set({ 
        error: 'Error al crear tarea', 
        loading: false 
      });
    }
  },

  bulkSaveTasks: async (agentId: string) => {
    const { currentAgent } = get();
    if (!currentAgent) return;

    set({ loading: true, error: null });
    try {
      const updatedTasks = await agentAPI.bulkUpdateTasks(agentId, currentAgent.tasks);
      const updatedAgent = { ...currentAgent, tasks: updatedTasks };
      get().updateAgent(updatedAgent);
      set({ loading: false });
    } catch (error) {
      console.error('Error bulk saving tasks:', error);
      set({ 
        error: 'Error al guardar tareas', 
        loading: false 
      });
    }
  },
  addTask: (task) => {
    const { currentAgent } = get();
    if (!currentAgent) return;

    const updatedAgent = {
      ...currentAgent,
      tasks: [...currentAgent.tasks, task],
      updatedAt: new Date()
    };

    get().updateAgent(updatedAgent);
  },

  removeTask: (taskId) => {
    const { currentAgent } = get();
    if (!currentAgent) return;

    const updatedAgent = {
      ...currentAgent,
      tasks: currentAgent.tasks.filter(task => task.id !== taskId),
      updatedAt: new Date()
    };

    get().updateAgent(updatedAgent);
  },

  updatePriority: (priorityId, updates) => {
    const { currentAgent } = get();
    if (!currentAgent) return;

    const updatedPriorities = currentAgent.orchestration.priorities.map(priority => {
      if (priority.id === priorityId) {
        return { ...priority, ...updates };
      }
      return priority;
    });

    const updatedAgent = {
      ...currentAgent,
      orchestration: {
        ...currentAgent.orchestration,
        priorities: updatedPriorities
      },
      updatedAt: new Date()
    };

    get().updateAgent(updatedAgent);
  },

  savePriorities: async (agentId: string) => {
    const { currentAgent } = get();
    if (!currentAgent) return;

    set({ loading: true, error: null });
    try {
      const updatedOrchestration = await agentAPI.updateOrchestration(agentId, {
        priorities: currentAgent.orchestration.priorities,
        fallbackBehavior: currentAgent.orchestration.fallbackBehavior
      });
      
      const updatedAgent = {
        ...currentAgent,
        orchestration: updatedOrchestration
      };
      
      get().updateAgent(updatedAgent);
      set({ loading: false });
    } catch (error) {
      console.error('Error saving priorities:', error);
      set({ 
        error: 'Error al guardar prioridades', 
        loading: false 
      });
    }
  },

  addPriority: (priority) => {
    const { currentAgent } = get();
    if (!currentAgent) return;

    const updatedAgent = {
      ...currentAgent,
      orchestration: {
        ...currentAgent.orchestration,
        priorities: [...currentAgent.orchestration.priorities, priority]
      },
      updatedAt: new Date()
    };

    get().updateAgent(updatedAgent);
  },

  removePriority: (priorityId) => {
    const { currentAgent } = get();
    if (!currentAgent) return;

    const updatedAgent = {
      ...currentAgent,
      orchestration: {
        ...currentAgent.orchestration,
        priorities: currentAgent.orchestration.priorities.filter(p => p.id !== priorityId)
      },
      updatedAt: new Date()
    };

    get().updateAgent(updatedAgent);
  },

  updatePriorityActions: (priorityId, actions) => {
    const { currentAgent } = get();
    if (!currentAgent) return;

    const updatedPriorities = currentAgent.orchestration.priorities.map(priority => {
      if (priority.id === priorityId) {
        return { ...priority, actions };
      }
      return priority;
    });

    const updatedAgent = {
      ...currentAgent,
      orchestration: {
        ...currentAgent.orchestration,
        priorities: updatedPriorities
      },
      updatedAt: new Date()
    };

    get().updateAgent(updatedAgent);
  },

  addPriorityAction: (priorityId, action) => {
    const { currentAgent } = get();
    if (!currentAgent) return;

    const updatedPriorities = currentAgent.orchestration.priorities.map(priority => {
      if (priority.id === priorityId) {
        const existingActions = priority.actions || [];
        if (existingActions.some(a => a.name === action.name)) {
          throw new Error('Ya existe una acción con este nombre');
        }
        return { ...priority, actions: [...existingActions, action] };
      }
      return priority;
    });

    const updatedAgent = {
      ...currentAgent,
      orchestration: {
        ...currentAgent.orchestration,
        priorities: updatedPriorities
      },
      updatedAt: new Date()
    };

    get().updateAgent(updatedAgent);
  },

  updatePriorityAction: (priorityId, actionName, updates) => {
    const { currentAgent } = get();
    if (!currentAgent) return;

    const updatedPriorities = currentAgent.orchestration.priorities.map(priority => {
      if (priority.id === priorityId && priority.actions) {
        const updatedActions = priority.actions.map(action => {
          if (action.name === actionName) {
            return { ...action, ...updates };
          }
          return action;
        });
        return { ...priority, actions: updatedActions };
      }
      return priority;
    });

    const updatedAgent = {
      ...currentAgent,
      orchestration: {
        ...currentAgent.orchestration,
        priorities: updatedPriorities
      },
      updatedAt: new Date()
    };

    get().updateAgent(updatedAgent);
  },

  removePriorityAction: (priorityId, actionName) => {
    const { currentAgent } = get();
    if (!currentAgent) return;

    const updatedPriorities = currentAgent.orchestration.priorities.map(priority => {
      if (priority.id === priorityId && priority.actions) {
        return { 
          ...priority, 
          actions: priority.actions.filter(a => a.name !== actionName) 
        };
      }
      return priority;
    });

    const updatedAgent = {
      ...currentAgent,
      orchestration: {
        ...currentAgent.orchestration,
        priorities: updatedPriorities
      },
      updatedAt: new Date()
    };

    get().updateAgent(updatedAgent);
  },

  updateKnowledgeItem: (itemId, updates) => {
    const { currentAgent } = get();
    if (!currentAgent) return;

    const updatedKnowledgeBase = (currentAgent.orchestration.knowledgeBase || []).map(item => {
      if (item.id === itemId) {
        return { ...item, ...updates };
      }
      return item;
    });

    const updatedAgent = {
      ...currentAgent,
      orchestration: {
        ...currentAgent.orchestration,
        knowledgeBase: updatedKnowledgeBase
      },
      updatedAt: new Date()
    };

    get().updateAgent(updatedAgent);
  },

  saveKnowledgeBase: async (agentId: string) => {
    const { currentAgent } = get();
    if (!currentAgent) return;

    set({ loading: true, error: null });
    try {
      const updatedOrchestration = await agentAPI.updateOrchestration(agentId, {
        knowledgeBase: currentAgent.orchestration.knowledgeBase
      });
      
      const updatedAgent = {
        ...currentAgent,
        orchestration: updatedOrchestration
      };
      
      get().updateAgent(updatedAgent);
      set({ loading: false });
    } catch (error) {
      console.error('Error saving knowledge base:', error);
      set({ 
        error: 'Error al guardar base de conocimiento', 
        loading: false 
      });
    }
  },

  addKnowledgeItem: (item) => {
    const { currentAgent } = get();
    if (!currentAgent) return;

    const updatedAgent = {
      ...currentAgent,
      orchestration: {
        ...currentAgent.orchestration,
        knowledgeBase: [...(currentAgent.orchestration.knowledgeBase || []), item]
      },
      updatedAt: new Date()
    };

    get().updateAgent(updatedAgent);
  },

  removeKnowledgeItem: (itemId) => {
    const { currentAgent } = get();
    if (!currentAgent) return;

    const updatedAgent = {
      ...currentAgent,
      orchestration: {
        ...currentAgent.orchestration,
        knowledgeBase: (currentAgent.orchestration.knowledgeBase || []).filter(item => item.id !== itemId)
      },
      updatedAt: new Date()
    };

    get().updateAgent(updatedAgent);
  },

  // Conversation
  sendMessage: async (message: string, sessionId: string, agentId: string, context?: Record<string, any>) => {
    try {
      const apiResponse = await agentAPI.sendMessage({
        message,
        session_id: sessionId,
        agent_id: agentId,
        context
      });
      
      // Retornar el objeto completo de la respuesta
      return apiResponse;
    } catch (error) {
      console.error('Error sending message:', error);
      // Lanzar el error para que el componente maneje el fallback
      throw error;
    }
  },

  // Duplication features
  duplicateAgent: async (agentId: string) => {
    const { agents } = get();
    const originalAgent = agents.find(a => a.id === agentId);
    
    if (!originalAgent) {
      throw new Error('Agente no encontrado');
    }

    set({ loading: true, error: null });
    
    try {
      // Crear copia del agente con nuevos IDs
      const duplicatedAgent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'> = {
        ...originalAgent,
        alias: `${originalAgent.alias} (Copia)`,
        name: `${originalAgent.name} (Copia)`,
        status: 'draft', // Siempre crear como borrador
        enabled: false, // Deshabilitado por defecto
        connected: false, // Sin conexión inicial
        // Duplicar tareas con nuevos IDs
        tasks: originalAgent.tasks.map(task => ({
          ...task,
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: `${task.name} (Copia)`,
          enabled: false, // Deshabilitadas por defecto
          prompt: {
            ...task.prompt,
            id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: `${task.prompt.name}_copy`
          },
          createdAt: new Date(),
          updatedAt: new Date()
        })),
        // Duplicar orquestación con nuevos IDs
        orchestration: {
          ...originalAgent.orchestration,
          id: `orchestration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          priorities: originalAgent.orchestration.priorities.map(priority => ({
            ...priority,
            id: `priority_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: `${priority.name} (Copia)`,
            enabled: false, // Deshabilitadas por defecto
            // Actualizar dependencias con nuevos IDs si es necesario
            dependsOn: [], // Limpiar dependencias para evitar referencias rotas
            taskId: undefined // Limpiar referencia a tarea para evitar conflictos
          })),
          knowledgeBase: originalAgent.orchestration.knowledgeBase?.map(item => ({
            ...item,
            id: `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: `${item.title} (Copia)`
          })) || [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      // Intentar crear en el backend
      try {
        const newAgent = await agentAPI.createAgent(duplicatedAgent);
        set((state) => ({
          agents: [...state.agents, newAgent],
          loading: false
        }));
        return newAgent;
      } catch (apiError) {
        console.warn('API creation failed, creating locally:', apiError);
        // Si la API falla, crear localmente
        const localAgent: Agent = {
          ...duplicatedAgent,
          id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set((state) => ({
          agents: [...state.agents, localAgent],
          loading: false
        }));
        return localAgent;
      }
    } catch (error) {
      console.error('Error duplicating agent:', error);
      set({ 
        error: 'Error al duplicar agente', 
        loading: false 
      });
      throw error;
    }
  },

  duplicateTask: (taskId: string) => {
    const { currentAgent } = get();
    if (!currentAgent) return;

    const originalTask = currentAgent.tasks.find(t => t.id === taskId);
    if (!originalTask) return;

    const duplicatedTask: Task = {
      ...originalTask,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${originalTask.name} (Copia)`,
      enabled: false, // Deshabilitada por defecto
      prompt: {
        ...originalTask.prompt,
        id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${originalTask.prompt.name}_copy`
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    get().addTask(duplicatedTask);
  },

  duplicatePriority: (priorityId: string) => {
    const { currentAgent } = get();
    if (!currentAgent) return;

    const originalPriority = currentAgent.orchestration.priorities.find(p => p.id === priorityId);
    if (!originalPriority) return;

    const duplicatedPriority: Priority = {
      ...originalPriority,
      id: `priority_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${originalPriority.name} (Copia)`,
      enabled: false, // Deshabilitada por defecto
      weight: Math.max(1, originalPriority.weight - 5), // Peso ligeramente menor
      dependsOn: [], // Limpiar dependencias para evitar referencias rotas
      taskId: undefined // Limpiar referencia a tarea
    };

    get().addPriority(duplicatedPriority);
  },

  // Utility
  setError: (error) => set({ error }),
  
  setLoading: (loading) => set({ loading }),

  checkConnection: async () => {
    try {
      const health = await agentAPI.healthCheck();
      set({ isOnline: health.status === 'ok' });
    } catch (error) {
      set({ isOnline: false });
    }
  },

  initializeMockData: () => {
    const mockAgent: Agent = {
      id: '68c1f57a8f2247229213f61a',
      alias: 'inmobiliario-lead-capture',
      name: 'Agente Inmobiliario - Captura de Leads',
      description: 'Especialista en capturar información de leads inmobiliarios y agendar citas',
      enabled: true,
      analyticsType: 'DISABLED',
      type: 'lead-capture-specialist',
      channel: 'whatsapp',
      connected: true,
      status: 'active',
      businessRules: [
        'SIEMPRE obtener nombre completo al inicio de la conversación',
        'SIEMPRE solicitar email válido después del nombre',
        'Recopilar TODOS los requerimientos: renta/venta, lugar, tipo de propiedad, presupuesto',
        'Ofrecer agendar cita cuando se tengan todos los datos',
        'Aplicar encuesta CSAT al finalizar la conversación',
        'Mantener tono profesional pero cercano',
        'No mostrar propiedades hasta tener datos completos'
      ],
      businessInformation: [
        'Empresa: InmoTech Solutions',
        'Especialidad: Propiedades residenciales y comerciales',
        'Cobertura: Nacional con enfoque en principales ciudades',
        'Horario de atención: Lunes a Viernes 9:00-18:00, Sábados 9:00-14:00',
        'Servicios: Venta, renta, tasaciones, asesoría legal'
      ],
      agentTone: 'Eres un agente inmobiliario profesional y amigable. Mantén un tono cercano pero respetuoso, empático cuando sea necesario, y siempre dispuesto a ayudar.',
      conversationPrompt: 'Tu objetivo principal es capturar información completa de leads potenciales siguiendo un flujo estructurado pero natural. Siempre busca agendar citas cuando tengas datos suficientes.',
      conversationConfig: {
        historyLimit: 10,
        maxHistoryInRedis: 20,
        sessionTTL: 3600,
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 1000
      },
      tasks: [
        {
          id: 'capture-contact-data',
          name: 'Capturar Datos de Contacto',
          description: 'Recopila información básica del lead: nombre, email, teléfono',
          type: 'CAPTURE_CONTACT_DATA',
          enabled: true,
          priority: 10,
          prompt: {
            id: 'prompt-capture-contact',
            name: 'Prompt Captura de Contacto',
            template: 'Eres un agente inmobiliario profesional. Tu objetivo es capturar los datos de contacto del lead de manera natural y amigable.',
            model: 'gpt-4o',
            temperature: 0.2,
            maxTokens: 500
          },
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'property-search',
          name: 'Búsqueda de Propiedades',
          description: 'Recopila criterios de búsqueda y busca propiedades',
          type: 'PROPERTY_SEARCH',
          enabled: true,
          priority: 8,
          prompt: {
            id: 'prompt-property-search',
            name: 'Prompt Búsqueda de Propiedades',
            template: 'Eres un experto inmobiliario ayudando a un cliente a definir sus criterios de búsqueda.\n\nInstrucciones:\n1. Recopila: tipo de operación (renta/venta), ubicación, tipo de propiedad, presupuesto\n2. Haz preguntas específicas y relevantes\n3. Cuando tengas criterios completos, ofrece buscar propiedades\n4. Mantén el enfoque en recopilar información antes de mostrar opciones\n\nResponde de forma natural y profesional.',
            model: 'gpt-4o',
            temperature: 0.2,
            maxTokens: 600
          },
          apiConfig: {
            endpoint: 'https://api.inmotech.com/properties/search',
            method: 'POST'
          },
          metadata: {
            category: 'property_search',
            requiredFields: ['tipo_operacion', 'ubicacion', 'tipo_propiedad', 'presupuesto']
          },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'schedule-appointment',
          name: 'Agendar Cita',
          description: 'Programa citas o visitas con el cliente',
          type: 'SCHEDULE_APPOINTMENT',
          enabled: true,
          priority: 6,
          prompt: {
            id: 'prompt-schedule-appointment',
            name: 'Prompt Agendar Cita',
            template: 'Eres un agente inmobiliario que ayuda a agendar citas y visitas.\n\nDatos del cliente: {{collectedData}}\nHistorial: {{conversationHistory}}\n\nInstrucciones:\n1. Ofrece agendar cita solo cuando tengas datos completos del cliente\n2. Propón horarios disponibles dentro del horario de atención\n3. Confirma todos los detalles de la cita\n4. Explica qué documentos debe traer si aplica\n\nHorario de atención: Lunes a Viernes 9:00-18:00, Sábados 9:00-14:00\n\nResponde de forma profesional y organizada.',
            model: 'gpt-4o',
            temperature: 0.6,
            maxTokens: 400
          },
          metadata: {
            category: 'appointment_scheduling',
            requiredFields: ['nombre', 'email', 'tipo_operacion', 'ubicacion']
          },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'csat-survey',
          name: 'Encuesta CSAT',
          description: 'Aplica encuesta de satisfacción al cliente',
          type: 'CSAT_SURVEY',
          enabled: true,
          prompt: {
            id: 'prompt-csat-survey',
            name: 'Prompt Encuesta CSAT',
            template: 'Eres un agente inmobiliario aplicando una encuesta de satisfacción.\n\nContexto de la conversación: {{collectedData}}\nHistorial: {{conversationHistory}}\n\nInstrucciones:\n1. Aplica la encuesta solo al final de la conversación\n2. Pregunta: \'¿Podrías calificar tu experiencia del 1 al 5? (1=Muy malo, 5=Excelente)\'\n3. Si la calificación es baja (1-2), pregunta cómo mejorar\n4. Agradece la retroalimentación\n5. Despídete profesionalmente\n\nResponde de forma amable y agradecida.',
            model: 'gpt-4o',
            temperature: 0.5,
            maxTokens: 300
          },
          metadata: {
            category: 'customer_satisfaction',
            requiredFields: []
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      orchestration: {
        id: 'orchestration-lead-capture',
        priorities: [
          {
            id: 'captura-contacto',
            name: 'Capturar datos de contacto',
            description: 'Obtener nombre completo y email válido',
            weight: 90,
            triggers: ['hola', 'buenos días', 'buenas tardes', 'inicio', 'contacto'],
            requiredData: [],
            dependsOn: [],
            completionCriteria: 'Tener nombre y email del cliente',
            taskId: 'capture-contact-data',
            enabled: true,
            metadata: {
              phase: 'initial_contact'
            }
          },
          {
            id: 'recopilar-criterios',
            name: 'Recopilar criterios de búsqueda',
            description: 'Obtener tipo de operación, ubicación, tipo de propiedad y presupuesto',
            weight: 80,
            triggers: ['busco', 'necesito', 'quiero', 'renta', 'venta', 'comprar', 'rentar'],
            requiredData: ['nombre', 'email'],
            dependsOn: ['captura-contacto'],
            completionCriteria: 'Tener todos los criterios de búsqueda',
            taskId: 'property-search',
            enabled: true,
            metadata: {
              phase: 'requirements_gathering'
            }
          },
          {
            id: 'agendar-cita',
            name: 'Agendar cita o visita',
            description: 'Programar cita cuando se tengan datos completos',
            weight: 60,
            triggers: ['agendar', 'cita', 'visita', 'ver', 'mostrar', 'cuando'],
            requiredData: ['nombre', 'email', 'tipo_operacion', 'ubicacion', 'tipo_propiedad', 'presupuesto'],
            dependsOn: ['recopilar-criterios'],
            completionCriteria: 'Cita agendada o cliente no interesado',
            taskId: 'schedule-appointment',
            enabled: true,
            metadata: {
              phase: 'appointment_scheduling'
            }
          },
          {
            id: 'encuesta-satisfaccion',
            name: 'Aplicar encuesta CSAT',
            description: 'Obtener retroalimentación del cliente',
            weight: 30,
            triggers: ['satisfacción', 'calificar', 'experiencia', 'finalizar', 'terminar'],
            requiredData: ['nombre', 'email'],
            dependsOn: ['agendar-cita'],
            completionCriteria: 'Encuesta completada',
            taskId: 'csat-survey',
            enabled: true,
            metadata: {
              phase: 'feedback_collection'
            }
          }
        ],
        knowledgeBase: [],
        fallbackBehavior: 'Si no entiendo algo, pedir aclaración de manera amable y redirigir al flujo principal',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      createdAt: new Date('2025-09-10T22:02:34.383Z'),
      updatedAt: new Date('2025-09-11T23:06:17.000Z')
    };

    set({ agents: [mockAgent] });
  }
}),
    {
      name: 'agent-store',
      partialize: (state) => ({
        agents: state.agents,
        currentAgent: state.currentAgent
      }),
    }
  )
);