import React, { useState } from 'react';
import { Brain, Plus, Trash2, ArrowUp, ArrowDown, Target, Save } from 'lucide-react';
import { useAgentStore } from '../../../stores/useAgentStore';
import { Priority, COMMON_DATA_FIELDS } from '../../../types/agents';
import { GuardBuilder } from '../guards/GuardBuilder';
import { PriorityActionsSection } from '../priorities/PriorityActionsSection';

// Helper function to generate semantic IDs from names
const generateSemanticId = (prefix: 'priority' | 'task', name: string): string => {
  const snakeCase = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '_'); // Replace spaces with underscores
  return `${prefix}_${snakeCase}`;
};

export const AgentPriorities: React.FC = () => {
  const { currentAgent, updatePriority, addPriority, removePriority, savePriorities, loading } = useAgentStore();
  const [expandedPriority, setExpandedPriority] = useState<string | null>(null);

  if (!currentAgent) return null;

  const handleUpdate = (priorityId: string, field: keyof Priority, value: unknown) => {
    updatePriority(priorityId, { [field]: value });
  };

  const handleNameUpdate = (priorityId: string, newName: string) => {
    // Only update the name, ID remains unchanged after creation
    updatePriority(priorityId, { name: newName });
  };

  // ID is auto-generated from name and cannot be manually edited

  const handleTriggersUpdate = (priorityId: string, triggers: string) => {
    const triggerArray = triggers.split('\n').filter(t => t.trim());
    updatePriority(priorityId, { triggers: triggerArray });
  };

  const handleRequiredDataUpdate = (priorityId: string, field: string, checked: boolean) => {
    const priority = currentAgent.orchestration.priorities.find(p => p.id === priorityId);
    if (!priority) return;

    const currentData = priority.requiredData || [];
    const newData = checked 
      ? [...currentData, field]
      : currentData.filter(f => f !== field);
    
    updatePriority(priorityId, { requiredData: newData });
  };

  const handleDependencyUpdate = (priorityId: string, dependencyId: string, checked: boolean) => {
    const priority = currentAgent.orchestration.priorities.find(p => p.id === priorityId);
    if (!priority) return;

    const currentDeps = priority.dependsOn || [];
    const newDeps = checked 
      ? [...currentDeps, dependencyId]
      : currentDeps.filter(d => d !== dependencyId);
    
    updatePriority(priorityId, { dependsOn: newDeps });
  };

  const handleTaskIdUpdate = (priorityId: string, taskId: string | undefined) => {
    const updates: Partial<Priority> = { taskId };
    
    // If linking a task, clear completionCriteria
    if (taskId) {
      updates.completionCriteria = '';
    }
    
    updatePriority(priorityId, updates);
  };

  const createNewPriority = () => {
    const name = 'Nueva Prioridad';
    const newPriority: Priority = {
      id: generateSemanticId('priority', name),
      name,
      description: '',
      weight: 50,
      triggers: [],
      requiredData: [],
      completionCriteria: '',
      enabled: true,
      executeOnce: false
    };
    addPriority(newPriority);
    setExpandedPriority(newPriority.id);
  };

  const handleSavePriorities = async () => {
    if (currentAgent) {
      await savePriorities(currentAgent.id);
    }
  };
  const movePriority = (priorityId: string, direction: 'up' | 'down') => {
    const priorities = [...currentAgent.orchestration.priorities];
    const index = priorities.findIndex(p => p.id === priorityId);
    
    if (direction === 'up' && index > 0) {
      [priorities[index], priorities[index - 1]] = [priorities[index - 1], priorities[index]];
    } else if (direction === 'down' && index < priorities.length - 1) {
      [priorities[index], priorities[index + 1]] = [priorities[index + 1], priorities[index]];
    }

    const { updateAgent } = useAgentStore.getState();
    updateAgent({
      ...currentAgent,
      orchestration: {
        ...currentAgent.orchestration,
        priorities
      }
    });
  };

  const sortedPriorities = [...currentAgent.orchestration.priorities].sort((a, b) => b.weight - a.weight);

  return (
    <div className="space-y-8">
      {/* Información Explicativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-blue-800 mb-2">¿Cómo funcionan las Prioridades?</h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p>
                Las <strong>Prioridades</strong> son las metas principales de tu asistente. Cuando un usuario escribe algo, 
                el asistente evalúa qué prioridad se activa basándose en las frases clave que configuraste.
              </p>
              <p>
                El <strong>peso</strong> determina la importancia: prioridades con mayor peso se ejecutan primero. 
                Si una prioridad necesita ciertos datos, el asistente los pedirá antes de continuar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Prioridades */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Prioridades del Asistente ({currentAgent.orchestration.priorities.length})
          </h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSavePriorities}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Guardando...' : 'Guardar Prioridades'}
            </button>
            <button
              onClick={createNewPriority}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Prioridad
            </button>
          </div>
        </div>

        {sortedPriorities.map((priority, index) => (
          <div
            key={priority.id}
            className={`bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 ${
              expandedPriority === priority.id ? 'shadow-lg' : 'shadow-sm hover:shadow-md'
            }`}
          >
            {/* Header de la Prioridad */}
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedPriority(expandedPriority === priority.id ? null : priority.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${priority.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-lg font-semibold text-gray-900">{priority.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                      Peso: {priority.weight}
                    </span>
                    {priority.dependsOn && priority.dependsOn.length > 0 && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Depende de {priority.dependsOn.length} prioridad{priority.dependsOn.length !== 1 ? 'es' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      movePriority(priority.id, 'up');
                    }}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      movePriority(priority.id, 'down');
                    }}
                    disabled={index === sortedPriorities.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {priority.description && (
                <p className="text-sm text-gray-600 mt-2">{priority.description}</p>
              )}
            </div>

            {/* Contenido Expandido */}
            {expandedPriority === priority.id && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Configuración Básica */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la Prioridad
                      </label>
                      <input
                        type="text"
                        value={priority.name}
                        onChange={(e) => handleNameUpdate(priority.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Semántico (Auto-generado)
                      </label>
                      <input
                        type="text"
                        value={priority.id}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 font-mono text-sm text-gray-600 cursor-not-allowed"
                        placeholder="priority_nombre_descriptivo"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ID único en formato snake_case. Se genera al crear la prioridad y permanece fijo.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                      </label>
                      <textarea
                        value={priority.description || ''}
                        onChange={(e) => handleUpdate(priority.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Explica qué hace esta prioridad (solo informativo)..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        La descripción es solo informativa, no afecta el comportamiento del agente.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Importancia (Peso: {priority.weight})
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={priority.weight}
                        onChange={(e) => handleUpdate(priority.id, 'weight', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Baja</span>
                        <span>Media</span>
                        <span>Alta</span>
                      </div>
                    </div>

{/*                     <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Orden de Ejecución (Secuencia)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={priority.sequence || ''}
                        onChange={(e) => handleUpdate(priority.id, 'sequence', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Opcional: 1, 2, 3..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Orden de ejecución opcional. Números menores se ejecutan primero. Si no se especifica, se usa el peso.
                      </p>
                    </div> */}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instrucciones especificas solo para esta prioridad
                        {priority.taskId && (
                          <span className="ml-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                            ⚠️ Deshabilitado - Tarea vinculada
                          </span>
                        )}
                      </label>
                      <textarea
                        value={priority.taskId ? '' : (priority.completionCriteria || '')}
                        onChange={(e) => handleUpdate(priority.id, 'completionCriteria', e.target.value)}
                        disabled={!!priority.taskId}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          priority.taskId 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                            : 'border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                        }`}
                        placeholder={
                          priority.taskId 
                            ? 'Este campo está deshabilitado porque hay una tarea vinculada. Las instrucciones se toman de la tarea asociada.' 
                            : 'Cuando el reclamo ha sido registrado y se ha ofrecido una solución...'
                        }
                      />
                      {!priority.taskId && (
                        <p className="text-sm text-gray-500 mt-1">
                          Da más detalles al momento de ejecutar esta prioridad, puedes dar ejemplos y enfatizar el estilo y enfoque de la conversación. Tambien ayudar a validar datos concretos
                        </p>
                      )}
                      {priority.taskId && (
                        <p className="text-sm text-orange-600 mt-1 flex items-center space-x-1">
                          <span>ℹ️</span>
                          <span>
                            Las instrucciones y criterios se toman de la tarea "{currentAgent.tasks.find(t => t.id === priority.taskId)?.name}".
                            Para usar este campo, desvincule la tarea.
                          </span>
                        </p>
                      )}
                    </div>
                      <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">
                          ¿Esta prioridad está activa?
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={priority.enabled}
                            onChange={(e) => handleUpdate(priority.id, 'enabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <label className="block text-sm font-medium text-gray-700">
                            🔒 Ejecutar solo una vez
                          </label>
                          <div className="group relative">
                            <span className="text-gray-400 hover:text-gray-600 cursor-help">ℹ️</span>
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                              Si está activado, esta prioridad solo se ejecutará una vez por conversación.
                              Una vez completada, no volverá a activarse aunque el usuario mencione las frases clave nuevamente.
                            </div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={priority.executeOnce || false}
                            onChange={(e) => handleUpdate(priority.id, 'executeOnce', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Útil para prioridades como "Captura de contacto" que solo deben ejecutarse una vez.
                      </p>
                    </div>
                  </div>

                  {/* Configuración Avanzada */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4" />
                            <span>¿Cuándo se activa? (Frases clave)</span>
                          </div>
                          <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded">
                            {priority.triggers.length} trigger{priority.triggers.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </label>
                      <textarea
                        value={priority.triggers.join('\n')}
                        onChange={(e) => handleTriggersUpdate(priority.id, e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Tengo una queja
Quiero hacer un reclamo
Estoy molesto
El servicio fue malo"
                      />
                      {priority.triggers.length > 0 && (
                        <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="text-xs font-medium text-purple-700 mb-1">Vista previa:</div>
                          <div className="flex flex-wrap gap-1">
                            {priority.triggers.map((trigger, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                {trigger}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        Una frase por línea. {priority.triggers.length} trigger{priority.triggers.length !== 1 ? 's' : ''} configurado{priority.triggers.length !== 1 ? 's' : ''}.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Datos Necesarios
                      </label>
                     <div className="space-y-3">
                       <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        {Object.entries(COMMON_DATA_FIELDS).map(([key, label]) => (
                          <label key={key} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={priority.requiredData?.includes(key) || false}
                              onChange={(e) => handleRequiredDataUpdate(priority.id, key, e.target.checked)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                     
                     {/* Datos personalizados */}
                     <>
                       <div className="space-y-2">
                       <label className="block text-sm font-medium text-gray-700">
                         Datos Personalizados
                       </label>
                       {(priority.requiredData || [])
                         .filter(field => !Object.keys(COMMON_DATA_FIELDS).includes(field))
                         .map((customField, index) => (
                           <div key={index} className="flex items-center space-x-2">
                             <input
                               type="text"
                               value={customField}
                               onChange={(e) => {
                                 const currentData = priority.requiredData || [];
                                 const newData = currentData.map(field => 
                                   field === customField ? e.target.value : field
                                 );
                                 updatePriority(priority.id, { requiredData: newData });
                               }}
                               className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                               placeholder="nombre_del_campo"
                             />
                             <button
                               onClick={() => {
                                 const currentData = priority.requiredData || [];
                                 const newData = currentData.filter(field => field !== customField);
                                 updatePriority(priority.id, { requiredData: newData });
                               }}
                               className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                             >
                               <Trash2 className="h-4 w-4" />
                             </button>
                           </div>
                         ))}
                       
                       <button
                         onClick={() => {
                           const currentData = priority.requiredData || [];
                           const newField = `campo_personalizado_${Date.now()}`;
                           updatePriority(priority.id, { requiredData: [...currentData, newField] });
                         }}
                         className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors flex items-center justify-center space-x-2 text-sm"
                       >
                         <Plus className="h-4 w-4" />
                         <span>Agregar Campo Personalizado</span>
                       </button>
                       </div>
                     </>
                       <p className="text-sm text-gray-500 mt-2">
                        El asistente pedirá estos datos si no los tiene antes de completar esta prioridad.
                      </p>
                   </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tarea Vinculada (Opcional)
                      </label>
                      <select
                        value={priority.taskId || ''}
                        onChange={(e) => handleTaskIdUpdate(priority.id, e.target.value || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Sin tarea específica</option>
                        {currentAgent.tasks.filter(task => task.enabled).map(task => (
                          <option key={task.id} value={task.id}>{task.name}</option>
                        ))}
                      </select>
                      <p className="text-sm text-gray-500 mt-1">
                        Tarea específica que se ejecutará cuando esta prioridad se active.
                        {priority.taskId && ' Al vincular una tarea, el campo "Criterios de Finalización" se limpia automáticamente.'}
                      </p>
                    </div>
                    </div>
                  </div>
                </div>

                {/* Dependencias */}
                {currentAgent.orchestration.priorities.length > 1 && (
                  <>
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Depende de otras prioridades
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {currentAgent.orchestration.priorities
                        .filter(p => p.id !== priority.id)
                        .map(otherPriority => (
                          <label key={otherPriority.id} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={priority.dependsOn?.includes(otherPriority.id) || false}
                              onChange={(e) => handleDependencyUpdate(priority.id, otherPriority.id, e.target.checked)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span>{otherPriority.name}</span>
                          </label>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Esta prioridad solo se activará si las prioridades seleccionadas ya han sido completadas.
                    </p>
                  </div>
                  </>
                )}

                {/* Guards Section */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <GuardBuilder
                    guard={priority.guard}
                    onChange={(newGuard) => handleUpdate(priority.id, 'guard', newGuard)}
                  />
                </div>

                {/* Priority Actions Section */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <PriorityActionsSection
                    priorityId={priority.id}
                    actions={priority.actions || []}
                    availableTasks={currentAgent.tasks}
                    onActionsChange={(actions) => handleUpdate(priority.id, 'actions', actions)}
                  />
                </div>

                {/* Acciones */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      if (confirm('¿Estás seguro de que quieres eliminar esta prioridad?')) {
                        removePriority(priority.id);
                        setExpandedPriority(null);
                      }
                    }}
                    className="inline-flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Comportamiento por Defecto */}

      {/* Estado vacío */}
      {currentAgent.orchestration.priorities.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay prioridades configuradas</h3>
          <p className="text-gray-500 mb-6">
            Las prioridades definen las metas principales de tu asistente y cómo debe comportarse.
          </p>
          <button
            onClick={createNewPriority}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Crear Primera Prioridad
          </button>
        </div>
      )}
    </div>
  );
};