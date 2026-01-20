import React, { useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps,
} from 'reactflow';
import dagre from 'dagre';
import { Brain, Plus, X, Save, Target, Trash2 } from 'lucide-react';
import { useAgentStore } from '../../../stores/useAgentStore';
import { Priority, COMMON_DATA_FIELDS } from '../../../types/agents';
import { GuardBuilder } from '../guards/GuardBuilder';
import { PriorityActionsSection } from '../priorities/index';
import 'reactflow/dist/style.css';

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

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 280;
const nodeHeight = 140;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const safeNodes = Array.isArray(nodes) ? nodes : [];
  const safeEdges = Array.isArray(edges) ? edges : [];

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, nodesep: 120, ranksep: 200 });

  safeNodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  safeEdges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = safeNodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      }
    };
  });

  return { nodes: layoutedNodes, edges: safeEdges };
};

interface PriorityDialogProps {
  priority: Priority | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (priority: Priority) => void;
  onDelete?: (priorityId: string) => void;
  isNew?: boolean;
}

const PriorityDialog: React.FC<PriorityDialogProps> = ({ 
  priority, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  isNew = false 
}) => {
  const { currentAgent } = useAgentStore();
  const [editData, setEditData] = useState<Priority>({
    id: '',
    name: '',
    description: '',
    weight: 50,
    triggers: [],
    requiredData: [],
    dependsOn: [],
    completionCriteria: '',
    enabled: true,
    executeOnce: false
  });

  React.useEffect(() => {
    if (priority) {
      setEditData(priority);
    } else if (isNew) {
      const name = 'Nueva Prioridad';
      setEditData({
        id: generateSemanticId('priority', name),
        name,
        description: '',
        weight: 50,
        triggers: [],
        requiredData: [],
        dependsOn: [],
        completionCriteria: '',
        enabled: true,
        executeOnce: false
      });
    }
  }, [priority, isNew]);

  if (!isOpen) return null;

  const handleUpdate = (field: keyof Priority, value: unknown) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleNameUpdate = (newName: string) => {
    // Only update the name, ID remains unchanged after creation
    setEditData(prev => ({ ...prev, name: newName }));
  };

  const handleTriggersUpdate = (triggers: string) => {
    const triggerArray = triggers.split('\n').filter(t => t.trim());
    handleUpdate('triggers', triggerArray);
  };

  const handleRequiredDataUpdate = (field: string, checked: boolean) => {
    const currentData = editData.requiredData || [];
    const newData = checked 
      ? [...currentData, field]
      : currentData.filter(f => f !== field);
    
    handleUpdate('requiredData', newData);
  };

  const handleDependencyUpdate = (dependencyId: string, checked: boolean) => {
    const currentDeps = editData.dependsOn || [];
    const newDeps = checked 
      ? [...currentDeps, dependencyId]
      : currentDeps.filter(d => d !== dependencyId);
    
    handleUpdate('dependsOn', newDeps);
  };

  const handleTaskIdUpdate = (taskId: string | undefined) => {
    const updates: Partial<Priority> = { taskId };
    
    // If linking a task, clear completionCriteria
    if (taskId) {
      updates.completionCriteria = '';
      setEditData(prev => ({ ...prev, ...updates }));
    } else {
      handleUpdate('taskId', taskId);
    }
  };

  const handleSave = () => {
    onSave(editData);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && editData.id && confirm('¿Estás seguro de que quieres eliminar esta prioridad?')) {
      onDelete(editData.id);
      onClose();
    }
  };

  // TODO: Implementar duplicatePriority en el store
  // const handleDuplicate = () => {
  //   if (editData.id) {
  //     duplicatePriority(editData.id);
  //     onClose();
  //   }
  // };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {isNew ? 'Crear Nueva Prioridad' : 'Editar Prioridad'}
                  </h3>
                  <p className="text-purple-100 text-sm">
                    {isNew ? 'Define una nueva meta para tu asistente' : editData.name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          <div className="px-6 py-6 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuración Básica */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Prioridad
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => handleNameUpdate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Semántico (Auto-generado)
                  </label>
                  <input
                    type="text"
                    value={editData.id}
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
                    value={editData.description || ''}
                    onChange={(e) => handleUpdate('description', e.target.value)}
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
                    Importancia (Peso: {editData.weight})
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={editData.weight}
                    onChange={(e) => handleUpdate('weight', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Baja</span>
                    <span>Media</span>
                    <span>Alta</span>
                  </div>
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orden de Ejecución (Secuencia)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editData.sequence || ''}
                    onChange={(e) => handleUpdate('sequence', e.target.value ? parseInt(e.target.value) : undefined)}
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
                    {editData.taskId && (
                      <span className="ml-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        ⚠️ Deshabilitado - Tarea vinculada
                      </span>
                    )}
                  </label>
                  <textarea
                    value={editData.taskId ? '' : (editData.completionCriteria || '')}
                    onChange={(e) => handleUpdate('completionCriteria', e.target.value)}
                    disabled={!!editData.taskId}
                    rows={8}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      editData.taskId 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                        : 'border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    }`}
                    placeholder={
                      editData.taskId 
                        ? 'Este campo está deshabilitado porque hay una tarea vinculada. Las instrucciones se toman de la tarea asociada.' 
                        : 'Cuando el reclamo ha sido registrado y se ha ofrecido una solución...'
                    }
                  />
                  {!editData.taskId && (
                    <p className="text-sm text-gray-500 mt-1">
                      Da más detalles al momento de ejecutar esta prioridad, puedes dar ejemplos y enfatizar el estilo y enfoque de la conversación. Tambien ayudar a validar datos concretos
                    </p>
                  )}
                  {editData.taskId && (
                    <p className="text-sm text-orange-600 mt-1 flex items-center space-x-1">
                      <span>ℹ️</span>
                      <span>
                        Las instrucciones y criterios se toman de la tarea "{currentAgent?.tasks.find(t => t.id === editData.taskId)?.name}".
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
                        checked={editData.enabled}
                        onChange={(e) => handleUpdate('enabled', e.target.checked)}
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
                        checked={editData.executeOnce || false}
                        onChange={(e) => handleUpdate('executeOnce', e.target.checked)}
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
                        {editData.triggers.length} trigger{editData.triggers.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </label>
                  <textarea
                    value={editData.triggers.join('\n')}
                    onChange={(e) => handleTriggersUpdate(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Tengo una queja&#10;Quiero hacer un reclamo&#10;Estoy molesto&#10;El servicio fue malo"
                  />
                  {editData.triggers.length > 0 && (
                    <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="text-xs font-medium text-purple-700 mb-1">Vista previa:</div>
                      <div className="flex flex-wrap gap-1">
                        {editData.triggers.map((trigger, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Una frase por línea. {editData.triggers.length} trigger{editData.triggers.length !== 1 ? 's' : ''} configurado{editData.triggers.length !== 1 ? 's' : ''}.
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
                            checked={editData.requiredData?.includes(key) || false}
                            onChange={(e) => handleRequiredDataUpdate(key, e.target.checked)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>

                    {/* Datos personalizados */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Datos Personalizados
                      </label>
                      {(editData.requiredData || [])
                        .filter(field => !Object.keys(COMMON_DATA_FIELDS).includes(field))
                        .map((customField, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={customField}
                              onChange={(e) => {
                                const currentData = editData.requiredData || [];
                                const newData = currentData.map(field => 
                                  field === customField ? e.target.value : field
                                );
                                handleUpdate('requiredData', newData);
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                              placeholder="nombre_del_campo"
                            />
                            <button
                              onClick={() => {
                                const currentData = editData.requiredData || [];
                                const newData = currentData.filter(field => field !== customField);
                                handleUpdate('requiredData', newData);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      
                      <button
                        onClick={() => {
                          const currentData = editData.requiredData || [];
                          const newField = `campo_personalizado_${Date.now()}`;
                          handleUpdate('requiredData', [...currentData, newField]);
                        }}
                        className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors flex items-center justify-center space-x-2 text-sm"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Agregar Campo Personalizado</span>
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-2">
                      El asistente pedirá estos datos si no los tiene antes de completar esta prioridad.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarea Vinculada (Opcional)
                  </label>
                  <select
                    value={editData.taskId || ''}
                    onChange={(e) => handleTaskIdUpdate(e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Sin tarea específica</option>
                    {currentAgent?.tasks.filter(task => task.enabled).map(task => (
                      <option key={task.id} value={task.id}>{task.name}</option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Tarea específica que se ejecutará cuando esta prioridad se active.
                    {editData.taskId && ' Al vincular una tarea, el campo "Criterios de Finalización" se limpia automáticamente.'}
                  </p>
                </div>

                {/* Dependencias */}
                {currentAgent && currentAgent.orchestration.priorities.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Depende de otras prioridades
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                      {currentAgent.orchestration.priorities
                        .filter(p => p.id !== editData.id)
                        .map(otherPriority => (
                          <label key={otherPriority.id} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={editData.dependsOn?.includes(otherPriority.id) || false}
                              onChange={(e) => handleDependencyUpdate(otherPriority.id, e.target.checked)}
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
                )}
              </div>
            </div>

            {/* Guards Section - Full Width */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <GuardBuilder
                guard={editData.guard}
                onChange={(newGuard) => handleUpdate('guard', newGuard)}
              />
            </div>

            {/* Priority Actions Section - Full Width */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <PriorityActionsSection
                priorityId={editData.id}
                actions={editData.actions || []}
                availableTasks={currentAgent?.tasks || []}
                onActionsChange={(actions) => handleUpdate('actions', actions)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 flex justify-between">
            <div>
              {!isNew && (
                <div className="flex items-center space-x-3">
                  {/* TODO: Implementar duplicatePriority en el store */}
                  {/* <button
                    onClick={handleDuplicate}
                    className="inline-flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </button> */}
                  {onDelete && (
                    <button
                      onClick={handleDelete}
                      className="inline-flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
              >
                <Save className="h-4 w-4 mr-2" />
                {isNew ? 'Crear Prioridad' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PriorityNode: React.FC<NodeProps> = ({ data }) => {
  const priority: Priority = data?.priority || {};
  const { currentAgent } = useAgentStore();
  
  const safeName = priority.name || 'Prioridad sin nombre';
  const safeWeight = priority.weight || 0;
  const safeEnabled = priority.enabled !== false;
  const safeRequiredData = Array.isArray(priority.requiredData) ? priority.requiredData : [];
  const safeDependsOn = Array.isArray(priority.dependsOn) ? priority.dependsOn : [];

  // Encontrar la tarea vinculada
  const linkedTask = currentAgent?.tasks.find(task => task.id === priority.taskId);
  const getNodeHeaderColor = (enabled: boolean) => {
    return enabled 
      ? 'from-purple-500 to-purple-600' 
      : 'from-gray-400 to-gray-500';
  };

  const getWeightColor = (weight: number) => {
    if (weight >= 80) return 'bg-red-100 text-red-800';
    if (weight >= 60) return 'bg-orange-100 text-orange-800';
    if (weight >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{
          background: '#6366f1',
          width: 12,
          height: 12,
          border: '2px solid white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{
          background: '#6366f1',
          width: 12,
          height: 12,
          border: '2px solid white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      />

      <div className={`group bg-white border-2 rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:shadow-xl ${
        safeEnabled ? 'border-purple-300 hover:border-purple-400' : 'border-gray-300 opacity-75'
      }`} style={{ width: nodeWidth, height: nodeHeight }}>
        {/* Header */}
        <div className={`px-4 py-3 bg-gradient-to-r ${getNodeHeaderColor(safeEnabled)} rounded-t-xl`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-sm leading-tight mb-1 truncate">
                {safeName}
              </h3>
              <div className="flex items-center space-x-2 flex-wrap">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getWeightColor(safeWeight)}`}>
                  Peso: {safeWeight}
                </span>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
                  safeEnabled 
                    ? 'bg-green-500/20 text-white' 
                    : 'bg-red-500/20 text-white/60'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${safeEnabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-xs font-medium">
                    {safeEnabled ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                {priority.executeOnce && (
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-blue-500/20 text-white" title="Esta prioridad se ejecuta solo una vez">
                    <span className="text-xs font-medium">🔒 Una vez</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 bg-gradient-to-br from-gray-50 to-white flex-1">
          <div className="space-y-2">
            {/* Tarea Vinculada */}
            {linkedTask ? (
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">Tarea vinculada:</div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-700 font-medium">{linkedTask.name}</span>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">Tarea vinculada:</div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-500 italic">Sin tarea específica</span>
                </div>
              </div>
            )}
            
            {/* Datos Requeridos */}
            {safeRequiredData.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">Datos necesarios:</div>
                <div className="flex flex-wrap gap-1">
                  {safeRequiredData.slice(0, 3).map((field, index) => (
                    <span key={index} className="inline-flex px-1 py-0.5 text-xs bg-blue-100 text-blue-700 rounded font-medium">
                      {COMMON_DATA_FIELDS[field as keyof typeof COMMON_DATA_FIELDS] || field}
                    </span>
                  ))}
                  {safeRequiredData.length > 3 && (
                    <span className="inline-flex px-1 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                      +{safeRequiredData.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Dependencias */}
            {safeDependsOn.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">Depende de:</div>
                <div className="text-xs text-orange-700">
                  {safeDependsOn.length} prioridad{safeDependsOn.length !== 1 ? 'es' : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const nodeTypes = {
  priority: PriorityNode,
};

export const PriorityFlowView: React.FC = () => {
  const { currentAgent, updatePriority, addPriority, removePriority } = useAgentStore();
  const [selectedPriority, setSelectedPriority] = useState<Priority | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const priorities = useMemo(() => {
    try {
      if (!currentAgent?.orchestration?.priorities) {
        return [];
      }
      
      const rawPriorities = currentAgent.orchestration.priorities;
      
      if (!Array.isArray(rawPriorities)) {
        return [];
      }
      
      const filteredPriorities = rawPriorities.filter(priority => 
        priority && 
        typeof priority === 'object' && 
        priority.id && 
        typeof priority.id === 'string'
      );
      
      return filteredPriorities;
    } catch (error) {
      console.error('Error extracting priorities:', error);
      return [];
    }
  }, [currentAgent]);

  const flowElements = useMemo(() => {
    try {
      if (!Array.isArray(priorities) || priorities.length === 0) {
        return { nodes: [], edges: [] };
      }

      // Crear nodos
      const nodes: Node[] = priorities.map((priority) => ({
        id: priority.id,
        type: 'priority',
        position: { x: 0, y: 0 },
        data: { priority },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      }));

      // Crear aristas basadas en dependencias
      const edges: Edge[] = [];
      priorities.forEach((priority) => {
        if (priority.dependsOn && Array.isArray(priority.dependsOn)) {
          priority.dependsOn.forEach((dependencyId) => {
            if (dependencyId && typeof dependencyId === 'string') {
              const sourceExists = priorities.some(p => p.id === dependencyId);
              if (sourceExists) {
                edges.push({
                  id: `${dependencyId}-${priority.id}`,
                  source: dependencyId,
                  target: priority.id,
                  sourceHandle: 'right',
                  targetHandle: 'left',
                  type: 'smoothstep',
                  animated: true,
                  style: { 
                    stroke: '#6366f1', 
                    strokeWidth: 3
                  },
                  markerEnd: {
                    type: 'arrowclosed',
                    color: '#6366f1',
                    width: 20,
                    height: 20
                  }
                });
              }
            }
          });
        }
      });

      return getLayoutedElements(nodes, edges, 'LR');
    } catch (error) {
      console.error('Error generating flow elements:', error);
      return { nodes: [], edges: [] };
    }
  }, [priorities]);

  const { nodes: initialNodes, edges: initialEdges } = flowElements;

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  React.useEffect(() => {
    if (Array.isArray(initialNodes) && Array.isArray(initialEdges)) {
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    const priority = node.data?.priority;
    if (priority) {
      setSelectedPriority(priority);
      setIsCreatingNew(false);
      setIsDialogOpen(true);
    }
  };

  const handleCreateNew = () => {
    setSelectedPriority(null);
    setIsCreatingNew(true);
    setIsDialogOpen(true);
  };

  const handleSavePriority = (priority: Priority) => {
    if (isCreatingNew) {
      addPriority(priority);
    } else {
      updatePriority(priority.id, priority);
    }
  };

  const handleDeletePriority = (priorityId: string) => {
    removePriority(priorityId);
  };

  // TODO: Implementar duplicatePriority en el store
  // const handleDuplicatePriority = (priorityId: string) => {
  //   duplicatePriority(priorityId);
  // };

  if (!currentAgent) {
    return (
      <div className="text-center py-12">
        <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No hay agente seleccionado</p>
      </div>
    );
  }

  if (!Array.isArray(priorities) || priorities.length === 0) {
    return (
      <div className="relative">
        {/* Botón flotante para crear */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Prioridad
          </button>
        </div>

        <div className="h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-gray-200 flex items-center justify-center">
          <div className="text-center">
            <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay prioridades configuradas</h3>
            <p className="text-gray-500 mb-6">
              Crea tu primera prioridad para ver el flujo visual del comportamiento de tu asistente.
            </p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Crear Primera Prioridad
            </button>
          </div>
        </div>

        {/* Dialog */}
        <PriorityDialog
          priority={selectedPriority}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSavePriority}
          onDelete={handleDeletePriority}
          isNew={isCreatingNew}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Botón flotante para crear nueva prioridad */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Prioridad
        </button>
      </div>

      {/* Flujo Visual */}
      <div className="h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-gray-200 overflow-hidden shadow-lg">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            style: {
              strokeWidth: 3,
              stroke: '#6366f1'
            },
            markerEnd: {
              type: 'arrowclosed',
              color: '#6366f1',
              width: 20,
              height: 20
            }
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background 
            color="#e2e8f0" 
            gap={20} 
            size={1}
            variant="dots"
          />
          <Controls 
            position="bottom-right"
            showZoom={true}
            showFitView={true}
            showInteractive={false}
          />
        </ReactFlow>
      </div>

      {/* Dialog de Edición */}
      <PriorityDialog
        priority={selectedPriority}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSavePriority}
        onDelete={handleDeletePriority}
        isNew={isCreatingNew}
      />
    </div>
  );
};