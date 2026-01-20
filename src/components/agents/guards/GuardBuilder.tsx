import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Plus, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { GuardExpression, FactDefinition, getAvailableFacts } from '../../../types/agents';
import { validateGuard, translateGuardToNaturalLanguage, createEmptyGuard } from '../../../utils/guardUtils';
import { GuardGroup } from './GuardGroup';
import { GuardCondition } from './GuardCondition';
import { GuardPreview } from './GuardPreview';
import { useAgentStore } from '../../../stores/useAgentStore';


interface GuardBuilderProps {
  guard: GuardExpression | undefined;
  onChange: (guard: GuardExpression | undefined) => void;
}

export const GuardBuilder: React.FC<GuardBuilderProps> = ({ guard, onChange }) => {
  const { currentAgent } = useAgentStore();
  const [mode, setMode] = useState<'none' | 'configure'>('none');
  const [showPreview, setShowPreview] = useState(false);
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[] }>({ valid: true, errors: [] });

  // Get available facts (core + custom) - memoized to prevent infinite loop
  const availableFacts = useMemo(
    () => getAvailableFacts(currentAgent?.orchestration.factDefinitions || []),
    [currentAgent?.orchestration.factDefinitions]
  );

  // Initialize mode based on guard presence
  useEffect(() => {
    if (guard && Object.keys(guard).length > 0) {
      setMode('configure');
    } else {
      setMode('none');
    }
  }, [guard]);

  // Validate guard whenever it changes
  useEffect(() => {
    if (guard && mode === 'configure') {
      const result = validateGuard(guard, 'root', availableFacts);
      setValidation(result);
    } else {
      setValidation({ valid: true, errors: [] });
    }
  }, [guard, mode, availableFacts]);

  const handleModeChange = (newMode: 'none' | 'configure') => {
    setMode(newMode);
    if (newMode === 'none') {
      onChange(undefined);
    } else if (newMode === 'configure' && !guard) {
      // Initialize with empty ALL guard
      onChange(createEmptyGuard());
    }
  };

  const handleLogicOperatorChange = (operator: 'all' | 'any') => {
    if (!guard) return;

    // Convert between all and any
    if (guard.all) {
      onChange({ any: guard.all });
    } else if (guard.any) {
      onChange({ all: guard.any });
    } else {
      // Create new with operator
      onChange({ [operator]: [] });
    }
  };

  const handleAddCondition = () => {
    if (!guard) return;

    // Use first available fact as default
    const firstFactKey = Object.keys(availableFacts)[0] || 'operation_type';
    const newCondition: GuardExpression = {
      eq: [firstFactKey, null]
    };

    if (guard.all) {
      onChange({ all: [...guard.all, newCondition] });
    } else if (guard.any) {
      onChange({ any: [...guard.any, newCondition] });
    } else {
      onChange({ all: [newCondition] });
    }
  };

  const handleUpdateCondition = (index: number, condition: GuardExpression) => {
    if (!guard) return;

    if (guard.all) {
      const newAll = [...guard.all];
      newAll[index] = condition;
      onChange({ all: newAll });
    } else if (guard.any) {
      const newAny = [...guard.any];
      newAny[index] = condition;
      onChange({ any: newAny });
    }
  };

  const handleRemoveCondition = (index: number) => {
    if (!guard) return;

    if (guard.all) {
      const newAll = guard.all.filter((_, i) => i !== index);
      onChange(newAll.length > 0 ? { all: newAll } : undefined);
    } else if (guard.any) {
      const newAny = guard.any.filter((_, i) => i !== index);
      onChange(newAny.length > 0 ? { any: newAny } : undefined);
    }
  };

  const handleAddGroup = () => {
    if (!guard) return;

    const newGroup: GuardExpression = {
      any: []
    };

    if (guard.all) {
      onChange({ all: [...guard.all, newGroup] });
    } else if (guard.any) {
      onChange({ any: [...guard.any, newGroup] });
    } else {
      onChange({ all: [newGroup] });
    }
  };

  const currentOperator = guard?.all ? 'all' : guard?.any ? 'any' : 'all';
  const conditions = guard?.all || guard?.any || [];
  const naturalLanguage = translateGuardToNaturalLanguage(guard, availableFacts);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Shield className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Condiciones de Elegibilidad (Guards)</h3>
          <p className="text-sm text-gray-500">
            Define cuándo esta prioridad puede activarse basándose en el estado de la conversación
          </p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            checked={mode === 'none'}
            onChange={() => handleModeChange('none')}
            className="w-4 h-4 text-purple-600 focus:ring-purple-500"
          />
          <div>
            <span className="font-medium text-gray-900">Sin restricciones</span>
            <p className="text-sm text-gray-500">Esta prioridad siempre será elegible</p>
          </div>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            checked={mode === 'configure'}
            onChange={() => handleModeChange('configure')}
            className="w-4 h-4 text-purple-600 focus:ring-purple-500"
          />
          <div>
            <span className="font-medium text-gray-900">Configurar condiciones</span>
            <p className="text-sm text-gray-500">Definir cuándo esta prioridad puede activarse</p>
          </div>
        </label>
      </div>

      {/* Guard Configuration */}
      {mode === 'configure' && (
        <div className="space-y-4">
          {/* Logic Operator Selector */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">Regla principal:</span>
            <select
              value={currentOperator}
              onChange={(e) => handleLogicOperatorChange(e.target.value as 'all' | 'any')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todas las condiciones deben cumplirse (AND)</option>
              <option value="any">Al menos una condición debe cumplirse (OR)</option>
            </select>
          </div>

          {/* Conditions List */}
          <div className="space-y-3">
            {conditions.map((condition, index) => {
              // Check if it's a group (has all or any)
              const isGroup = condition.all || condition.any;

              return isGroup ? (
                <GuardGroup
                  key={index}
                  group={condition}
                  onChange={(updatedGroup: GuardExpression) => handleUpdateCondition(index, updatedGroup)}
                  onRemove={() => handleRemoveCondition(index)}
                  availableFacts={availableFacts}
                />
              ) : (
                <GuardCondition
                  key={index}
                  condition={condition}
                  onChange={(updatedCondition: GuardExpression) => handleUpdateCondition(index, updatedCondition)}
                  onRemove={() => handleRemoveCondition(index)}
                  availableFacts={availableFacts}
                />
              );
            })}

            {conditions.length === 0 && (
              <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                <Shield className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No hay condiciones configuradas</p>
                <p className="text-gray-400 text-xs">Agrega una condición para comenzar</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleAddCondition}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Condición
            </button>
            <button
              onClick={handleAddGroup}
              className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Grupo
            </button>
          </div>

          {/* Validation Status */}
          {conditions.length > 0 && (
            <div className={`p-3 rounded-lg border ${
              validation.valid 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start space-x-2">
                {validation.valid ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  {validation.valid ? (
                    <p className="text-sm font-medium text-green-800">
                      Guards válidos - {conditions.length} condición{conditions.length !== 1 ? 'es' : ''} configurada{conditions.length !== 1 ? 's' : ''}
                    </p>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-red-800 mb-1">Errores de validación:</p>
                      <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                        {validation.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Natural Language Summary */}
          {validation.valid && conditions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <div className="text-2xl">📊</div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    Resumen: Esta prioridad será elegible cuando:
                  </h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    {naturalLanguage.split('\n').map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview Toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            {showPreview ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <span>{showPreview ? 'Ocultar' : 'Ver'} vista previa JSON</span>
          </button>

          {/* JSON Preview */}
          {showPreview && (
            <GuardPreview guard={guard} onChange={onChange} />
          )}
        </div>
      )}
    </div>
  );
};
