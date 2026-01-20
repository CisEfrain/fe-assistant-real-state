import React, { useState } from 'react';
import { PriorityAction, PriorityActionType, Task } from '../../../types/agents';
import { X, AlertCircle } from 'lucide-react';
import { ActionTypeSelector } from './ActionTypeSelector';
import { ActionParamsEditor } from './ActionParamsEditor';

interface ActionEditorProps {
  action?: PriorityAction;
  existingActionNames: string[];
  availableTasks: Task[];
  onSave: (action: PriorityAction) => void;
  onCancel: () => void;
}

export const ActionEditor: React.FC<ActionEditorProps> = ({
  action,
  existingActionNames,
  availableTasks,
  onSave,
  onCancel
}) => {
  const [type, setType] = useState<PriorityActionType | null>(action?.type || null);
  const [name, setName] = useState(action?.name || '');
  const [description, setDescription] = useState(action?.description || '');
  const [executionPrompt, setExecutionPrompt] = useState(action?.executionPrompt || '');
  const [params, setParams] = useState<Record<string, unknown>>(action?.params || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateName = (value: string): string | null => {
    if (!value.trim()) {
      return 'El nombre es requerido';
    }
    if (!/^[a-z0-9_]+$/.test(value)) {
      return 'Solo minúsculas, números y guiones bajos';
    }
    if (existingActionNames.includes(value)) {
      return 'Ya existe una acción con este nombre';
    }
    return null;
  };

  const validateTaskId = (taskName: string): string | null => {
    if (type === 'execute_task') {
      const taskExists = availableTasks.some(t => t.id === taskName);
      if (!taskExists) {
        return 'La tarea no existe';
      }
    }
    return null;
  };

  const handleNameChange = (value: string) => {
    setName(value);
    const error = validateName(value);
    setErrors(prev => ({ ...prev, name: error || '' }));
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (!type) {
      newErrors.type = 'Selecciona un tipo de acción';
    }

    const nameError = validateName(name);
    if (nameError) {
      newErrors.name = nameError;
    }

    const taskError = validateTaskId(name);
    if (taskError) {
      newErrors.taskId = taskError;
    }

    if (description.length > 500) {
      newErrors.description = 'Máximo 500 caracteres';
    }

    if (executionPrompt.length > 2000) {
      newErrors.executionPrompt = 'Máximo 2000 caracteres';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newAction: PriorityAction = {
      type: type!,
      name: name.trim(),
      description: description.trim() || undefined,
      executionPrompt: executionPrompt.trim(),
      params: Object.keys(params).length > 0 ? params : undefined
    };

    onSave(newAction);
  };

  const getActionTypeLabel = (actionType: PriorityActionType) => {
    const labels = {
      mark_milestone: 'Marcar Hito',
      execute_task: 'Ejecutar Tarea',
      update_state: 'Actualizar Estado',
      custom: 'Personalizada'
    };
    return labels[actionType];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {action ? 'Editar Acción' : 'Nueva Acción'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!type ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de Acción <span className="text-red-500">*</span>
              </label>
              <ActionTypeSelector
                selectedType={type}
                onTypeSelect={setType}
              />
              {errors.type && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.type}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Tipo seleccionado: {getActionTypeLabel(type)}
                    </p>
                  </div>
                  <button
                    onClick={() => setType(null)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Cambiar tipo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Acción <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="enlace_compartido"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.name ? (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                ) : name && !errors.name ? (
                  <p className="mt-1 text-sm text-green-600">✓ Nombre válido y único</p>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">
                    Solo minúsculas, números y guiones bajos (snake_case)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Marca cuando el agente ha compartido un enlace con el usuario"
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.description ? (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Opcional</p>
                  )}
                  <p className="text-sm text-gray-500">{description.length}/500</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instrucciones de Ejecución
                </label>
                <textarea
                  value={executionPrompt}
                  onChange={(e) => setExecutionPrompt(e.target.value)}
                  placeholder="Ejecuta esta acción cuando hayas compartido un enlace, URL o enlace de WhatsApp en tu respuesta..."
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm ${
                    errors.executionPrompt ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.executionPrompt ? (
                    <p className="text-sm text-red-600">{errors.executionPrompt}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Instrucciones para el agente</p>
                  )}
                  <p className="text-sm text-gray-500">{executionPrompt.length}/2000</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parámetros
                </label>
                <ActionParamsEditor
                  actionType={type}
                  params={params}
                  availableTasks={availableTasks}
                  onChange={setParams}
                />
              </div>
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!type}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
