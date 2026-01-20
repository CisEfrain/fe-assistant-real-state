import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { FactDefinition, FactDefinitionType } from '../../../types/agents';
import { getFactTypeIcon, getFactTypeColor } from '../../../utils/factDefinitionUtils';

interface FactDefinitionEditorProps {
  definition: FactDefinition;
  onChange: (definition: FactDefinition) => void;
  onRemove: () => void;
  availableFactNames: string[]; // For composite fact references
  errors?: string[];
}

export const FactDefinitionEditor: React.FC<FactDefinitionEditorProps> = ({
  definition,
  onChange,
  onRemove,
  availableFactNames,
  errors = []
}) => {
  const handleFieldChange = (field: keyof FactDefinition, value: unknown) => {
    onChange({ ...definition, [field]: value });
  };

  const handleAddField = () => {
    const currentFields = definition.fields || [];
    handleFieldChange('fields', [...currentFields, '']);
  };

  const handleUpdateField = (index: number, value: string) => {
    const currentFields = [...(definition.fields || [])];
    currentFields[index] = value;
    handleFieldChange('fields', currentFields);
  };

  const handleRemoveField = (index: number) => {
    const currentFields = definition.fields?.filter((_, i) => i !== index) || [];
    handleFieldChange('fields', currentFields);
  };

  const handleAddCondition = () => {
    const currentConditions = definition.conditions || [];
    handleFieldChange('conditions', [...currentConditions, { fact: '' }]);
  };

  const handleUpdateCondition = (index: number, fact: string) => {
    const currentConditions = [...(definition.conditions || [])];
    currentConditions[index] = { fact };
    handleFieldChange('conditions', currentConditions);
  };

  const handleRemoveCondition = (index: number) => {
    const currentConditions = definition.conditions?.filter((_, i) => i !== index) || [];
    handleFieldChange('conditions', currentConditions);
  };

  const typeColor = getFactTypeColor(definition.type);
  const typeIcon = getFactTypeIcon(definition.type);

  return (
    <div className={`border-2 rounded-lg p-4 ${errors.length > 0 ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <div className={`px-3 py-1 rounded-lg border ${typeColor} font-mono text-sm`}>
            {typeIcon} {definition.type}
          </div>
          <input
            type="text"
            value={definition.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            placeholder="fact_name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={onRemove}
          className="ml-3 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
          title="Eliminar fact"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Type Selector */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Fact</label>
        <select
          value={definition.type}
          onChange={(e) => handleFieldChange('type', e.target.value as FactDefinitionType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="exists">exists - Verifica si un campo existe</option>
          <option value="not_exists">not_exists - Verifica si un campo NO existe</option>
          <option value="equals">equals - Verifica igualdad exacta</option>
          <option value="any_exists">any_exists - Al menos uno de varios campos existe</option>
          <option value="all_exists">all_exists - Todos los campos existen</option>
          <option value="composite">composite - Combinación de otros facts</option>
        </select>
      </div>

      {/* Type-specific fields */}
      {(definition.type === 'exists' || definition.type === 'not_exists') && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Campo en collectedData</label>
          <input
            type="text"
            value={definition.field || ''}
            onChange={(e) => handleFieldChange('field', e.target.value)}
            placeholder="presupuesto"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Nombre del campo a verificar en collectedData
          </p>
        </div>
      )}

      {definition.type === 'equals' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Campo en collectedData</label>
            <input
              type="text"
              value={definition.field || ''}
              onChange={(e) => handleFieldChange('field', e.target.value)}
              placeholder="urgencia"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Valor esperado</label>
            <input
              type="text"
              value={String(definition.value || '')}
              onChange={(e) => handleFieldChange('value', e.target.value)}
              placeholder="alta"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {(definition.type === 'any_exists' || definition.type === 'all_exists') && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Campos en collectedData
          </label>
          <div className="space-y-2">
            {(definition.fields || []).map((field, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={field}
                  onChange={(e) => handleUpdateField(index, e.target.value)}
                  placeholder="nombre_campo"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => handleRemoveField(index)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={handleAddField}
              className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Campo</span>
            </button>
          </div>
        </div>
      )}

      {definition.type === 'composite' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Operador Lógico</label>
            <select
              value={definition.logic || 'all'}
              onChange={(e) => handleFieldChange('logic', e.target.value as 'all' | 'any')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">all - Todos los facts deben ser true</option>
              <option value="any">any - Al menos un fact debe ser true</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Condiciones (Facts)
            </label>
            <div className="space-y-2">
              {(definition.conditions || []).map((condition, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <select
                    value={condition.fact}
                    onChange={(e) => handleUpdateCondition(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar fact...</option>
                    {availableFactNames
                      .filter(name => name !== definition.name) // No self-reference
                      .map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                  </select>
                  <button
                    onClick={() => handleRemoveCondition(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddCondition}
                className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar Condición</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded-lg">
          <p className="text-xs font-medium text-red-800 mb-1">Errores:</p>
          <ul className="text-xs text-red-700 list-disc list-inside space-y-1">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
