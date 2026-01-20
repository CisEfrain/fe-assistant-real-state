import React, { useState } from 'react';
import { PriorityAction, Task } from '../../../types/agents';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { ActionEditor } from './ActionEditor';

interface PriorityActionsSectionProps {
  priorityId: string;
  actions: PriorityAction[];
  availableTasks: Task[];
  onActionsChange: (actions: PriorityAction[]) => void;
}

export const PriorityActionsSection: React.FC<PriorityActionsSectionProps> = ({
  priorityId,
  actions = [],
  availableTasks,
  onActionsChange
}) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<PriorityAction | undefined>();

  const handleAddAction = () => {
    setEditingAction(undefined);
    setIsEditorOpen(true);
  };

  const handleEditAction = (action: PriorityAction) => {
    setEditingAction(action);
    setIsEditorOpen(true);
  };

  const handleDeleteAction = (actionName: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta acción?')) {
      const updatedActions = actions.filter(a => a.name !== actionName);
      onActionsChange(updatedActions);
    }
  };

  const handleSaveAction = (action: PriorityAction) => {
    if (editingAction) {
      const updatedActions = actions.map(a => 
        a.name === editingAction.name ? action : a
      );
      onActionsChange(updatedActions);
    } else {
      onActionsChange([...actions, action]);
    }
    setIsEditorOpen(false);
    setEditingAction(undefined);
  };

  const getActionTypeLabel = (type: string) => {
    const labels = {
      mark_milestone: 'Marcar Hito',
      execute_task: 'Ejecutar Tarea',
      update_state: 'Actualizar Estado',
      custom: 'Personalizada'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Acciones de Prioridad</h3>
          <p className="text-sm text-gray-600 mt-1">
            Las acciones se ejecutan automáticamente cuando el agente detecta los eventos configurados.
          </p>
        </div>
        <button
          onClick={handleAddAction}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar Acción
        </button>
      </div>

      {actions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">No hay acciones configuradas</p>
          <p className="text-sm text-gray-400 mt-1">Haz clic en "Agregar Acción" para comenzar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((action) => (
            <div
              key={action.name}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-gray-900">{action.name}</h4>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {getActionTypeLabel(action.type)}
                    </span>
                  </div>
                  {action.description && (
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  )}
                  {action.executionPrompt && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      {action.executionPrompt}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEditAction(action)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Editar acción"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAction(action.name)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar acción"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isEditorOpen && (
        <ActionEditor
          action={editingAction}
          existingActionNames={actions.map(a => a.name).filter(n => n !== editingAction?.name)}
          availableTasks={availableTasks}
          onSave={handleSaveAction}
          onCancel={() => {
            setIsEditorOpen(false);
            setEditingAction(undefined);
          }}
        />
      )}
    </div>
  );
};
