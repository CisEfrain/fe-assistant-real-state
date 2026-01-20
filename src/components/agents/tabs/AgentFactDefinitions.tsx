import React, { useState, useEffect } from 'react';
import { Database, Plus, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useAgentStore } from '../../../stores/useAgentStore';
import { FactDefinition, FactDefinitionType, CORE_FACTS } from '../../../types/agents';
import { FactDefinitionEditor } from '../facts/FactDefinitionEditor';
import {
  validateFactDefinitions,
  createEmptyFactDefinition,
  translateFactDefinitionToNaturalLanguage,
  detectCircularDependencies
} from '../../../utils/factDefinitionUtils';

export const AgentFactDefinitions: React.FC = () => {
  const { currentAgent, saveAgent } = useAgentStore();
  const [localDefinitions, setLocalDefinitions] = useState<FactDefinition[]>([]);
  const [validationErrors, setValidationErrors] = useState<Map<number, string[]>>(new Map());
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize from current agent
  useEffect(() => {
    if (currentAgent?.orchestration.factDefinitions) {
      setLocalDefinitions(currentAgent.orchestration.factDefinitions);
    } else {
      setLocalDefinitions([]);
    }
    setHasChanges(false);
  }, [currentAgent?.id, currentAgent?.orchestration.factDefinitions]);

  // Validate on changes
  useEffect(() => {
    if (localDefinitions.length === 0) {
      setValidationErrors(new Map());
      setGlobalErrors([]);
      return;
    }

    const result = validateFactDefinitions(localDefinitions);
    const circularErrors = detectCircularDependencies(localDefinitions);
    
    // Parse errors by definition
    const errorMap = new Map<number, string[]>();
    result.errors.forEach(error => {
      const match = error.match(/^Definition (\d+)/);
      if (match) {
        const index = parseInt(match[1]) - 1;
        const existing = errorMap.get(index) || [];
        errorMap.set(index, [...existing, error]);
      }
    });

    setValidationErrors(errorMap);
    setGlobalErrors([...result.errors.filter(e => !e.match(/^Definition \d+/)), ...circularErrors]);
  }, [localDefinitions]);

  const handleAddDefinition = (type: FactDefinitionType = 'exists') => {
    const newDef = createEmptyFactDefinition(type);
    setLocalDefinitions([...localDefinitions, newDef]);
    setHasChanges(true);
  };

  const handleUpdateDefinition = (index: number, definition: FactDefinition) => {
    const updated = [...localDefinitions];
    updated[index] = definition;
    setLocalDefinitions(updated);
    setHasChanges(true);
  };

  const handleRemoveDefinition = (index: number) => {
    setLocalDefinitions(localDefinitions.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!currentAgent) return;

    const result = validateFactDefinitions(localDefinitions);
    if (!result.valid) {
      alert('Por favor corrige los errores antes de guardar');
      return;
    }

    const updatedAgent = {
      ...currentAgent,
      orchestration: {
        ...currentAgent.orchestration,
        factDefinitions: localDefinitions
      }
    };

    await saveAgent(updatedAgent);
    setHasChanges(false);
  };

  const handleDiscard = () => {
    if (currentAgent?.orchestration.factDefinitions) {
      setLocalDefinitions(currentAgent.orchestration.factDefinitions);
    } else {
      setLocalDefinitions([]);
    }
    setHasChanges(false);
  };

  const availableFactNames = localDefinitions.map(def => def.name).filter(Boolean);
  const isValid = validationErrors.size === 0 && globalErrors.length === 0;

  if (!currentAgent) {
    return (
      <div className="p-6 text-center text-gray-500">
        No hay un agente seleccionado
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Database className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Fact Definitions</h2>
            <p className="text-sm text-gray-500">
              Define facts personalizados derivados desde collectedData
            </p>
          </div>
        </div>
        {hasChanges && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDiscard}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Descartar
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isValid
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Guardar Cambios
            </button>
          </div>
        )}
      </div>

      {/* Core Facts Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Facts Core (Siempre Disponibles)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
              {Object.entries(CORE_FACTS).map(([key, meta]) => (
                <div key={key} className="flex items-start space-x-2">
                  <span className="font-mono font-medium">{key}:</span>
                  <span className="text-blue-700">{meta.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Global Validation Status */}
      {localDefinitions.length > 0 && (
        <div className={`p-3 rounded-lg border ${
          isValid 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start space-x-2">
            {isValid ? (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              {isValid ? (
                <p className="text-sm font-medium text-green-800">
                  ✓ {localDefinitions.length} fact{localDefinitions.length !== 1 ? 's' : ''} definido{localDefinitions.length !== 1 ? 's' : ''} correctamente
                </p>
              ) : (
                <div>
                  <p className="text-sm font-medium text-red-800 mb-1">Errores globales:</p>
                  <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                    {globalErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fact Definitions List */}
      <div className="space-y-4">
        {localDefinitions.map((definition, index) => (
          <div key={index} className="space-y-2">
            <FactDefinitionEditor
              definition={definition}
              onChange={(updated) => handleUpdateDefinition(index, updated)}
              onRemove={() => handleRemoveDefinition(index)}
              availableFactNames={availableFactNames}
              errors={validationErrors.get(index)}
            />
            {/* Natural Language Preview */}
            {definition.name && (
              <div className="ml-4 p-2 bg-gray-50 border-l-4 border-blue-400 rounded">
                <p className="text-sm text-gray-700">
                  <span className="font-mono font-semibold text-blue-700">{definition.name}</span>
                  {' → '}
                  <span className="italic">{translateFactDefinitionToNaturalLanguage(definition)}</span>
                </p>
              </div>
            )}
          </div>
        ))}

        {localDefinitions.length === 0 && (
          <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
            <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">No hay facts personalizados</p>
            <p className="text-gray-400 text-sm mb-4">
              Los facts core siempre están disponibles. Agrega facts personalizados para lógica específica.
            </p>
          </div>
        )}
      </div>

      {/* Add Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleAddDefinition('exists')}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          exists
        </button>
        <button
          onClick={() => handleAddDefinition('not_exists')}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          not_exists
        </button>
        <button
          onClick={() => handleAddDefinition('equals')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          equals
        </button>
        <button
          onClick={() => handleAddDefinition('any_exists')}
          className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          any_exists
        </button>
        <button
          onClick={() => handleAddDefinition('all_exists')}
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          all_exists
        </button>
        <button
          onClick={() => handleAddDefinition('composite')}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          composite
        </button>
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">💡 Guía Rápida</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
          <div>
            <span className="font-semibold">exists:</span> Campo existe en collectedData
          </div>
          <div>
            <span className="font-semibold">not_exists:</span> Campo NO existe
          </div>
          <div>
            <span className="font-semibold">equals:</span> Campo tiene valor específico
          </div>
          <div>
            <span className="font-semibold">any_exists:</span> Al menos un campo existe
          </div>
          <div>
            <span className="font-semibold">all_exists:</span> Todos los campos existen
          </div>
          <div>
            <span className="font-semibold">composite:</span> Combina otros facts
          </div>
        </div>
      </div>
    </div>
  );
};
