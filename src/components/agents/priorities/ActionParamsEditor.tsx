import React, { useState } from 'react';
import { PriorityActionType, Task } from '../../../types/agents';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

interface ActionParamsEditorProps {
  actionType: PriorityActionType;
  params: Record<string, unknown>;
  availableTasks?: Task[];
  onChange: (params: Record<string, unknown>) => void;
}

export const ActionParamsEditor: React.FC<ActionParamsEditorProps> = ({
  actionType,
  params,
  availableTasks = [],
  onChange
}) => {
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState(JSON.stringify(params, null, 2));

  const handleMarkMilestoneChange = (value: string) => {
    let parsedValue: unknown = value;
    
    if (value === 'true') parsedValue = true;
    else if (value === 'false') parsedValue = false;
    else if (!isNaN(Number(value)) && value !== '') parsedValue = Number(value);
    
    onChange({ value: parsedValue });
  };

  const handleUpdateStateChange = (field: 'collectedData' | 'metadata', key: string, value: string) => {
    const currentParams = params as { collectedData?: Record<string, unknown>; metadata?: Record<string, unknown> };
    const updatedField = { ...(currentParams[field] || {}), [key]: value };
    onChange({ ...currentParams, [field]: updatedField });
  };

  const handleRemoveField = (field: 'collectedData' | 'metadata', key: string) => {
    const currentParams = params as { collectedData?: Record<string, unknown>; metadata?: Record<string, unknown> };
    const updatedField = { ...(currentParams[field] || {}) };
    delete updatedField[key];
    onChange({ ...currentParams, [field]: updatedField });
  };

  const handleAddField = (field: 'collectedData' | 'metadata') => {
    const currentParams = params as { collectedData?: Record<string, unknown>; metadata?: Record<string, unknown> };
    const newKey = `nuevo_campo_${Date.now()}`;
    const updatedField = { ...(currentParams[field] || {}), [newKey]: '' };
    onChange({ ...currentParams, [field]: updatedField });
  };

  const handleJsonChange = (value: string) => {
    setJsonText(value);
    try {
      const parsed = JSON.parse(value);
      onChange(parsed);
      setJsonError(null);
    } catch (error) {
      setJsonError('JSON inválido');
    }
  };

  if (actionType === 'mark_milestone') {
    const currentValue = (params as { value?: unknown })?.value;
    const valueStr = currentValue === undefined ? '' : String(currentValue);

    return (
      <div className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-900">
            El valor se guardará como <code className="bg-blue-100 px-1 rounded">milestone_{'{'}{'{'}name{'}'}{'}'}</code> en los datos de la conversación
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valor del Hito
          </label>
          <input
            type="text"
            value={valueStr}
            onChange={(e) => handleMarkMilestoneChange(e.target.value)}
            placeholder="true, false, texto, o número"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Puede ser: true, false, un número, o texto
          </p>
        </div>
      </div>
    );
  }

  if (actionType === 'execute_task') {
    return (
      <div className="space-y-3">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p className="text-sm text-purple-900">
            El nombre de la acción debe coincidir con el ID de una tarea existente
          </p>
        </div>
        {availableTasks.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tareas Disponibles
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
              <ul className="space-y-1 text-sm">
                {availableTasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-2">
                    <code className="bg-white px-2 py-1 rounded border border-gray-300 text-xs">
                      {task.id}
                    </code>
                    <span className="text-gray-600">{task.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        <p className="text-sm text-gray-500">
          Los parámetros generalmente están vacíos. El nombre de la acción debe ser el ID de la tarea.
        </p>
      </div>
    );
  }

  if (actionType === 'update_state') {
    const currentParams = params as { collectedData?: Record<string, unknown>; metadata?: Record<string, unknown> };
    const collectedData = currentParams.collectedData || {};
    const metadata = currentParams.metadata || {};

    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-900">
            Actualiza datos de la conversación con nuevos valores
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Datos Recopilados (collectedData)
            </label>
            <button
              onClick={() => handleAddField('collectedData')}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4" />
              Agregar campo
            </button>
          </div>
          <div className="space-y-2">
            {Object.entries(collectedData).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => {
                    const newKey = e.target.value;
                    const updatedData = { ...collectedData };
                    delete updatedData[key];
                    updatedData[newKey] = value;
                    onChange({ ...currentParams, collectedData: updatedData });
                  }}
                  placeholder="clave"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <input
                  type="text"
                  value={String(value)}
                  onChange={(e) => handleUpdateStateChange('collectedData', key, e.target.value)}
                  placeholder="valor"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <button
                  onClick={() => handleRemoveField('collectedData', key)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {Object.keys(collectedData).length === 0 && (
              <p className="text-sm text-gray-500 italic">No hay campos configurados</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Metadatos (metadata)
            </label>
            <button
              onClick={() => handleAddField('metadata')}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4" />
              Agregar campo
            </button>
          </div>
          <div className="space-y-2">
            {Object.entries(metadata).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => {
                    const newKey = e.target.value;
                    const updatedMeta = { ...metadata };
                    delete updatedMeta[key];
                    updatedMeta[newKey] = value;
                    onChange({ ...currentParams, metadata: updatedMeta });
                  }}
                  placeholder="clave"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <input
                  type="text"
                  value={String(value)}
                  onChange={(e) => handleUpdateStateChange('metadata', key, e.target.value)}
                  placeholder="valor"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <button
                  onClick={() => handleRemoveField('metadata', key)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {Object.keys(metadata).length === 0 && (
              <p className="text-sm text-gray-500 italic">No hay campos configurados</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
        <p className="text-sm text-orange-900">
          Configura parámetros personalizados en formato JSON
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Parámetros JSON
        </label>
        <textarea
          value={jsonText}
          onChange={(e) => handleJsonChange(e.target.value)}
          rows={8}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm ${
            jsonError ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder='{\n  "customField": "customValue",\n  "otroCampo": 123\n}'
        />
        {jsonError ? (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {jsonError}
          </p>
        ) : (
          <p className="mt-1 text-sm text-green-600">✓ JSON válido</p>
        )}
      </div>
    </div>
  );
};
