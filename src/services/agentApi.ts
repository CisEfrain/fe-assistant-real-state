import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  Agent, 
  Task, 
  Orchestration, 
  Priority, 
  KnowledgeItem,
  PaginatedResponse,
  ConversationRequest,
  ConversationResponse,
  CreateAgentDto,
} from '../types/agents';
import { env } from '../env';

const API_BASE_URL = env.API_BASE_URL;
class AgentAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 50000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - could redirect to login
          console.error('Unauthorized access - token may be invalid');
          localStorage.removeItem('auth_token');
        }
        return Promise.reject(error);
      }
    );
  }

  // Set authentication token
  setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  // Remove authentication token
  clearAuthToken(): void {
    localStorage.removeItem('auth_token');
  }

  // Agent Management
  async getAgents(page: number = 1, limit: number = 50): Promise<PaginatedResponse<Agent>> {
    const response: AxiosResponse<PaginatedResponse<Agent>> = await this.client.get('/agents', {
      params: { page, limit }
    });
    return response.data;
  }

  async getAgent(id: string): Promise<Agent> {
    const response: AxiosResponse<Agent> = await this.client.get(`/agents/${id}`);
    return response.data;
  }

  async createAgent(agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Promise<Agent> {
    // Transform Agent to CreateAgentDto
    const createDto: CreateAgentDto = {
      alias: agentData.alias,
      name: agentData.name,
      description: agentData.description,
      type: agentData.type,
      channel: agentData.channel,
      connected: agentData.connected,
      businessRules: agentData.businessRules,
      businessInformation: agentData.businessInformation,
      agentTone: agentData.agentTone,
      conversationPrompt: agentData.conversationPrompt,
      conversationConfig: agentData.conversationConfig,
      orchestration: {
        priorities: agentData.orchestration.priorities,
        knowledgeBase: agentData.orchestration.knowledgeBase,
        fallbackBehavior: agentData.orchestration.fallbackBehavior
      },
      tasks: agentData.tasks,
      enabled: agentData.enabled,
      analyticsType: agentData.analyticsType,
      status: agentData.status
    };
    
    const response: AxiosResponse<Agent> = await this.client.post('/agents', createDto);
    return response.data;
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
    // Transform Agent updates to UpdateAgentDto
    const updateDto: any = {};
    
    if (updates.alias !== undefined) updateDto.alias = updates.alias;
    if (updates.name !== undefined) updateDto.name = updates.name;
    if (updates.description !== undefined) updateDto.description = updates.description;
    if (updates.type !== undefined) updateDto.type = updates.type;
    if (updates.channel !== undefined) updateDto.channel = updates.channel;
    if (updates.connected !== undefined) updateDto.connected = updates.connected;
    if (updates.businessRules !== undefined) updateDto.businessRules = updates.businessRules;
    if (updates.businessInformation !== undefined) updateDto.businessInformation = updates.businessInformation;
    if (updates.agentTone !== undefined) updateDto.agentTone = updates.agentTone;
    if (updates.agentTone !== undefined) updateDto.agentTone = updates.agentTone;
    if (updates.conversationPrompt !== undefined) updateDto.conversationPrompt = updates.conversationPrompt;
    if (updates.conversationConfig !== undefined) updateDto.conversationConfig = updates.conversationConfig;
    if (updates.enabled !== undefined) updateDto.enabled = updates.enabled;
    if (updates.analyticsType !== undefined) updateDto.analyticsType = updates.analyticsType;
    if (updates.status !== undefined) updateDto.status = updates.status;
    
    // Include orchestration fields (priorities, knowledgeBase, factDefinitions, fallbackBehavior)
    if (updates.orchestration !== undefined) {
      updateDto.orchestration = {
        priorities: updates.orchestration.priorities,
        knowledgeBase: updates.orchestration.knowledgeBase,
        factDefinitions: updates.orchestration.factDefinitions,
        fallbackBehavior: updates.orchestration.fallbackBehavior
      };
    }
    
    // Include tasks if provided
    if (updates.tasks !== undefined) {
      updateDto.tasks = updates.tasks;
    }
    
    const response: AxiosResponse<Agent> = await this.client.put(`/agents/${id}`, updateDto);
    return response.data;
  }

  async deleteAgent(id: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.delete(`/agents/${id}`);
    return response.data;
  }

  // Task Management
  async getAgentTasks(agentId: string): Promise<Task[]> {
    const response: AxiosResponse<Task[]> = await this.client.get(`/agents/${agentId}/tasks`);
    return response.data;
  }

  async updateTask(agentId: string, taskId: string, updates: Partial<Task>): Promise<Task> {
    // Prepare DTO excluding frontend-only fields like 'priority'
    const updateDto: any = {};
    
    // Only include fields that the backend expects
    if (updates.name !== undefined) updateDto.name = updates.name;
    if (updates.description !== undefined) updateDto.description = updates.description;
    if (updates.type !== undefined) updateDto.type = updates.type;
    if (updates.enabled !== undefined) updateDto.enabled = updates.enabled;
    if (updates.prompt !== undefined) updateDto.prompt = updates.prompt;
    if (updates.apiConfig !== undefined) updateDto.apiConfig = updates.apiConfig;
    if (updates.metadata !== undefined) updateDto.metadata = updates.metadata;
    
    const response: AxiosResponse<Task> = await this.client.put(`/agents/${agentId}/tasks/${taskId}`, updateDto);
    return response.data;
  }

  // Orchestration Management
  async getOrchestration(agentId: string): Promise<Orchestration> {
    const response: AxiosResponse<Orchestration> = await this.client.get(`/agents/${agentId}/orchestration`);
    return response.data;
  }

  async updateOrchestration(agentId: string, orchestration: Partial<Orchestration>): Promise<Orchestration> {
    // Transform Orchestration to UpdateOrchestrationDto
    const updateDto: any = {};
    
    if (orchestration.priorities !== undefined) {
      updateDto.priorities = orchestration.priorities.map(priority => ({
        id: priority.id,
        name: priority.name,
        description: priority.description,
        weight: priority.weight,
        sequence: priority.sequence,
        triggers: priority.triggers,
        requiredData: priority.requiredData,
        dependsOn: priority.dependsOn || [], // Asegurar que siempre sea un array
        completionCriteria: priority.completionCriteria,
        taskId: priority.taskId,
        enabled: priority.enabled,
        executeOnce: priority.executeOnce,
        guard: priority.guard,
        completionPolicy: priority.completionPolicy,
        metadata: priority.metadata
      }));
    }
    
    if (orchestration.knowledgeBase !== undefined) {
      updateDto.knowledgeBase = orchestration.knowledgeBase;
    }
    
    if (orchestration.factDefinitions !== undefined) {
      updateDto.factDefinitions = orchestration.factDefinitions;
    }
    
    if (orchestration.fallbackBehavior !== undefined) {
      updateDto.fallbackBehavior = orchestration.fallbackBehavior;
    }
    
    console.log('Sending orchestration update:', JSON.stringify(updateDto, null, 2));
    
    const response: AxiosResponse<Orchestration> = await this.client.put(`/agents/${agentId}/orchestration`, updateDto);
    return response.data;
  }

  // Conversation
  async sendMessage(request: ConversationRequest): Promise<ConversationResponse> {
    const response: AxiosResponse<ConversationResponse> = await this.client.post('/conversation', request);
    return response.data;
  }

  // Additional Task Management (Missing endpoints)
  async createTask(agentId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const response: AxiosResponse<Task> = await this.client.post(`/agents/${agentId}/tasks`, taskData);
    return response.data;
  }

  async deleteTask(agentId: string, taskId: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.delete(`/agents/${agentId}/tasks/${taskId}`);
    return response.data;
  }

  // Bulk Operations
  async bulkUpdateTasks(agentId: string, tasks: Task[]): Promise<Task[]> {
    const response: AxiosResponse<Task[]> = await this.client.put(`/agents/${agentId}/tasks/bulk`, { tasks });
    return response.data;
  }

  // Knowledge Base Management (if supported by API)
  async updateKnowledgeBase(agentId: string, knowledgeBase: KnowledgeItem[]): Promise<Orchestration> {
    const response: AxiosResponse<Orchestration> = await this.client.put(`/agents/${agentId}/orchestration`, {
      knowledgeBase
    });
    return response.data;
  }

  // Priority Management (if supported by API)
  async updatePriorities(agentId: string, priorities: Priority[]): Promise<Orchestration> {
    const response: AxiosResponse<Orchestration> = await this.client.put(`/agents/${agentId}/orchestration`, {
      priorities
    });
    return response.data;
  }
  
  // Duplication endpoints (if supported by API)
  async duplicateAgent(agentId: string): Promise<Agent> {
    try {
      const response: AxiosResponse<Agent> = await this.client.post(`/agents/${agentId}/duplicate`);
      return response.data;
    } catch (error) {
      // If API doesn't support duplication, throw error to use local fallback
      throw new Error('API duplication not supported');
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await this.client.get('/api/healthcheck');
      return response.data;
    } catch (error) {
      return { status: 'error' };
    }
  }
}

// Export singleton instance
export const agentAPI = new AgentAPI();