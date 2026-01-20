import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { GuardExpression } from '../../../types/agents';
import { GuardCondition } from './GuardCondition';

interface GuardGroupProps {
  group: GuardExpression;
  onChange: (group: GuardExpression) => void;
  onRemove: () => void;
  availableFacts: Record<string, { label: string; type: 'string' | 'boolean'; values?: unknown[]; description?: string }>;
}

export const GuardGroup: React.FC<GuardGroupProps> = ({ group, onChange, onRemove, availableFacts }) => {
  const operator = group.all ? 'all' : group.any ? 'any' : 'all';
  const conditions = group.all || group.any || [];

  const handleOperatorChange = (newOperator: 'all' | 'any') => {
    if (operator === newOperator) return;

    if (newOperator === 'all') {
      onChange({ all: conditions });
    } else {
      onChange({ any: conditions });
    }
  };

  const handleAddCondition = () => {
    const firstFactKey = Object.keys(availableFacts)[0] || 'operation_type';
    const newCondition: GuardExpression = {
      eq: [firstFactKey, null]
    };

    if (operator === 'all') {
      onChange({ all: [...conditions, newCondition] });
    } else {
      onChange({ any: [...conditions, newCondition] });
    }
  };

  const handleUpdateCondition = (index: number, condition: GuardExpression) => {
    const newConditions = [...conditions];
    newConditions[index] = condition;

    if (operator === 'all') {
      onChange({ all: newConditions });
    } else {
      onChange({ any: newConditions });
    }
  };

  const handleRemoveCondition = (index: number) => {
    const newConditions = conditions.filter((_, i) => i !== index);

    if (newConditions.length === 0) {
      onRemove();
    } else if (operator === 'all') {
      onChange({ all: newConditions });
    } else {
      onChange({ any: newConditions });
    }
  };

  return (
    <div className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50">
      {/* Group Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-purple-900">Grupo de Condiciones</span>
          <select
            value={operator}
            onChange={(e) => handleOperatorChange(e.target.value as 'all' | 'any')}
            className="px-2 py-1 border border-purple-300 rounded text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">AND (todas)</option>
            <option value="any">OR (al menos una)</option>
          </select>
        </div>
        <button
          onClick={onRemove}
          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
          title="Eliminar grupo"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Conditions */}
      <div className="space-y-2">
        {conditions.map((condition, index) => {
          // Check if it's a nested group
          const isNestedGroup = condition.all || condition.any;

          return isNestedGroup ? (
            <div key={index} className="bg-white rounded p-2 text-sm text-gray-600">
              <p>⚠️ Grupos anidados no soportados en Fase 2</p>
              <button
                onClick={() => handleRemoveCondition(index)}
                className="text-red-600 hover:underline text-xs mt-1"
              >
                Eliminar
              </button>
            </div>
          ) : (
            <GuardCondition
              key={index}
              condition={condition}
              onChange={(updatedCondition) => handleUpdateCondition(index, updatedCondition)}
              onRemove={() => handleRemoveCondition(index)}
              availableFacts={availableFacts}
            />
          );
        })}

        {conditions.length === 0 && (
          <div className="text-center py-4 bg-white border border-dashed border-purple-300 rounded">
            <p className="text-sm text-gray-500">No hay condiciones en este grupo</p>
          </div>
        )}
      </div>

      {/* Add Condition Button */}
      <button
        onClick={handleAddCondition}
        className="mt-3 w-full px-3 py-2 border-2 border-dashed border-purple-300 rounded-lg text-purple-700 hover:bg-purple-100 transition-colors flex items-center justify-center space-x-2"
      >
        <Plus className="h-4 w-4" />
        <span className="text-sm">Agregar Condición al Grupo</span>
      </button>
    </div>
  );
};
