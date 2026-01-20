import React, { useState } from 'react';
import { ArrowLeft, Save, Settings, Zap, User, Code, Database, Brain, X, Plus, Trash2, MapPin } from 'lucide-react';
import { useAgentStore } from '../../stores/useAgentStore';
import { TASK_TYPES, LLM_PROVIDERS, ExtractionMapEntry, ExtractionMap } from '../../types/agents';

export const TaskEditor: React.FC = () => {
  const { selectedTask, setSelectedTask, updateTask, saveTask, currentAgent, loading } = useAgentStore();
  const [viewMode, setViewMode] = useState<'basic' | 'advanced'>('basic');
  const [apiEnabled, setApiEnabled] = useState<boolean>(false);
  
  // Estado local para mapeos de extracción
  const [extractionMapEntries, setExtractionMapEntries] = useState<Array<{
    id: string;
    sourceField: string;
    entry: ExtractionMapEntry;
  }>>([]);

  // Referencia para evitar loops infinitos
  const lastTaskIdRef = React.useRef<string | null>(null);

  // Sincronizar estado local con la configuración existente
  React.useEffect(() => {
    if (!selectedTask) return;
    
    // Solo ejecutar si cambió la tarea (no por updates internos)
    if (lastTaskIdRef.current === selectedTask.id) return;
    lastTaskIdRef.current = selectedTask.id;
    
    // Sincronizar API enabled (forzar true si skipLLM está activo)
    const shouldEnableApi = !!(selectedTask.apiConfig?.endpoint) || selectedTask.metadata?.skipLLM;
    setApiEnabled(shouldEnableApi);
    
    // Sincronizar extractionMap desde la metadata de la tarea
    if (selectedTask.metadata?.extractionMap) {
      const entries = Object.entries(selectedTask.metadata.extractionMap).map(([sourceField, entry]) => ({
        id: `entry_${sourceField}_${Date.now()}`, // ID más estable basado en sourceField
        sourceField,
        entry: entry as ExtractionMapEntry
      }));
      setExtractionMapEntries(entries);
    } else {
      setExtractionMapEntries([]);
    }
  }, [selectedTask]);

  if (!selectedTask) return null;

  const handleUpdate = (field: string, value: any) => {
    const updatedTask = {
      ...selectedTask,
      [field]: value,
      updatedAt: new Date().toISOString()
    };
    updateTask(selectedTask.id, { [field]: value });
  };

  const handlePromptUpdate = (field: string, value: any) => {
    const currentPrompt = selectedTask.prompt || {
      id: `p_${selectedTask.id}`,
      name: selectedTask.name.toLowerCase().replace(/\s+/g, '_'),
      template: '',
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 256
    };
    
    const updatedPrompt = { 
      ...currentPrompt, 
      [field]: value,
      updatedAt: new Date()
    };
    
    updateTask(selectedTask.id, { prompt: updatedPrompt });
  };

  const handleMetadataUpdate = (field: string, value: any) => {
    const metadata = { ...selectedTask.metadata, [field]: value };
    updateTask(selectedTask.id, { metadata });
  };

  // Funciones helper para manejar mapeo de valores
  const addValueMapping = (entryId: string) => {
    const newEntries = extractionMapEntries.map(entry => {
      if (entry.id === entryId) {
        const currentMap = entry.entry.map || {};
        const newMap = { ...currentMap, '': '' }; // Agregar mapeo vacío
        return { ...entry, entry: { ...entry.entry, map: newMap } };
      }
      return entry;
    });
    setExtractionMapEntries(newEntries);
    syncExtractionMapToTask(newEntries);
  };

  const updateValueMapping = (entryId: string, oldKey: string, newKey: string, newValue: string) => {
    const newEntries = extractionMapEntries.map(entry => {
      if (entry.id === entryId && entry.entry.map) {
        const currentMap = { ...entry.entry.map };
        // Eliminar la clave anterior si cambió
        if (oldKey !== newKey && oldKey in currentMap) {
          delete currentMap[oldKey];
        }
        // Agregar/actualizar la nueva clave
        if (newKey.trim()) {
          currentMap[newKey] = newValue;
        }
        return { ...entry, entry: { ...entry.entry, map: currentMap } };
      }
      return entry;
    });
    setExtractionMapEntries(newEntries);
    syncExtractionMapToTask(newEntries);
  };

  const removeValueMapping = (entryId: string, keyToRemove: string) => {
    const newEntries = extractionMapEntries.map(entry => {
      if (entry.id === entryId && entry.entry.map) {
        const currentMap = { ...entry.entry.map };
        delete currentMap[keyToRemove];
        return { ...entry, entry: { ...entry.entry, map: Object.keys(currentMap).length > 0 ? currentMap : undefined } };
      }
      return entry;
    });
    setExtractionMapEntries(newEntries);
    syncExtractionMapToTask(newEntries);
  };

  // Funciones helper para manejar extractionMap
  const addExtractionMapEntry = () => {
    const newEntry = {
      id: `entry_${Date.now()}_${Math.random()}`,
      sourceField: '',
      entry: { to: '' }
    };
    const newEntries = [...extractionMapEntries, newEntry];
    setExtractionMapEntries(newEntries);
    // Sincronizar inmediatamente con los nuevos datos
    syncExtractionMapToTask(newEntries);
  };

  const updateExtractionMapEntry = (id: string, field: 'sourceField' | keyof ExtractionMapEntry, value: string | Record<string, string>) => {
    const newEntries = extractionMapEntries.map(entry => 
      entry.id === id 
        ? field === 'sourceField' 
          ? { ...entry, sourceField: value as string }
          : { ...entry, entry: { ...entry.entry, [field]: value } }
        : entry
    );
    setExtractionMapEntries(newEntries);
    // Sincronizar inmediatamente con los nuevos datos
    syncExtractionMapToTask(newEntries);
  };

  const removeExtractionMapEntry = (id: string) => {
    const newEntries = extractionMapEntries.filter(entry => entry.id !== id);
    setExtractionMapEntries(newEntries);
    // Sincronizar inmediatamente con los nuevos datos
    syncExtractionMapToTask(newEntries);
  };

  const syncExtractionMapToTask = React.useCallback((entries: typeof extractionMapEntries = extractionMapEntries) => {
    // Convertir array local a objeto ExtractionMap
    const extractionMap: ExtractionMap = {};
    entries.forEach(({ sourceField, entry }) => {
      if (sourceField.trim() && entry.to.trim()) {
        extractionMap[sourceField] = entry;
      }
    });

    // Actualizar metadata con el extractionMap
    const metadata = { 
      ...selectedTask.metadata, 
      extractionMap: Object.keys(extractionMap).length > 0 ? extractionMap : undefined 
    };
    updateTask(selectedTask.id, { metadata });
  }, [selectedTask.metadata, selectedTask.id, updateTask]);

  // Nota: La sincronización del extractionMap se hace manualmente en cada cambio
  // para evitar loops infinitos con el store de Zustand

  const handleSaveTask = async () => {
    // Robust validation before saving
    if (!selectedTask) {
      console.error('Cannot save task: selectedTask is null/undefined');
      return;
    }
    
    if (!currentAgent) {
      console.error('Cannot save task: currentAgent is null/undefined');
      return;
    }
    
    if (!selectedTask.id || typeof selectedTask.id !== 'string' || selectedTask.id.trim() === '') {
      console.error('Cannot save task: invalid task ID', {
        taskId: selectedTask.id,
        taskIdType: typeof selectedTask.id,
        selectedTask: selectedTask
      });
      return;
    }
    
    console.log('Attempting to save task:', {
      agentId: currentAgent.id,
      taskId: selectedTask.id,
      taskName: selectedTask.name,
      taskType: selectedTask.type
    });
    
    try {
      await saveTask(currentAgent.id, selectedTask.id, selectedTask);
    } catch (error) {
      console.error('Error in handleSaveTask:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedTask(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Personalizar Función del Asistente</h2>
            <p className="text-gray-600">{selectedTask.name}</p>
          </div>
        </div>
        <button 
          onClick={handleSaveTask}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {/* Selector de Modo */}
      <div className="flex items-center justify-center">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('basic')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'basic'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Configuración de Comportamiento
          </button>
          <button
            onClick={() => setViewMode('advanced')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'advanced'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Code className="h-4 w-4 inline mr-2" />
            Configuración Técnica
          </button>
        </div>
      </div>

      {viewMode === 'basic' ? (
        <div className="space-y-8">
          {/* Configuración Básica */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Settings className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Información General</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Función</label>
                <input
                  type="text"
                  value={selectedTask.name}
                  onChange={(e) => handleUpdate('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ej: Gestión de Reclamos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Función</label>
                <select
                  value={selectedTask.type}
                  onChange={(e) => handleUpdate('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {Object.entries(TASK_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  value={selectedTask.description || ''}
                  onChange={(e) => handleUpdate('description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe el propósito de esta función..."
                />
              </div>

              <div className="md:col-span-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">¿Esta función está activa?</label>
                    <p className="text-xs text-gray-500 mt-1">Si está desactivada, el asistente no podrá usarla</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTask.enabled || false}
                      onChange={(e) => handleUpdate('enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>

              {/* Configuraciones de Ejecución */}
              <div className="md:col-span-3 border-t border-gray-200 pt-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Configuraciones de Ejecución</h4>
                <div className="space-y-4">
                  {/* runOnInit */}
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Ejecutar solo al inicio de la conversación</label>
                      <p className="text-xs text-gray-500 mt-1">
                        Esta función se ejecutará automáticamente al iniciar la conversación para guardar datos iniciales
                      </p>
                      {selectedTask.metadata?.runOnInit && !apiEnabled && (
                        <p className="text-xs text-red-600 mt-2 font-medium">
                          ⚠️ Debes habilitar la API externa para usar esta opción
                        </p>
                      )}
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={selectedTask.metadata?.runOnInit || false}
                        onChange={(e) => {
                          const runOnInit = e.target.checked;
                          
                          // Si runOnInit se activa, actualizar ambos campos en una sola llamada
                          if (runOnInit) {
                            const metadata = { 
                              ...selectedTask.metadata, 
                              runOnInit: true,
                              skipLLM: true
                            };
                            updateTask(selectedTask.id, { metadata });
                            
                            if (!apiEnabled) {
                              setApiEnabled(true);
                              const apiConfig = { 
                                ...selectedTask.apiConfig, 
                                endpoint: selectedTask.apiConfig?.endpoint || '',
                                method: selectedTask.apiConfig?.method || 'POST'
                              };
                              handleUpdate('apiConfig', apiConfig);
                            }
                          } else {
                            // Si se desactiva, solo actualizar runOnInit
                            handleMetadataUpdate('runOnInit', false);
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  {/* skipLLM */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Omitir procesamiento del LLM</label>
                      <p className="text-xs text-gray-500 mt-1">
                        La tarea solo ejecutará la llamada a la API externa sin procesar con el asistente
                      </p>
                      {selectedTask.metadata?.runOnInit && (
                        <p className="text-xs text-blue-600 mt-2 font-medium">
                          ℹ️ Activado automáticamente por "Ejecutar solo al inicio"
                        </p>
                      )}
                      {selectedTask.metadata?.skipLLM && !apiEnabled && (
                        <p className="text-xs text-red-600 mt-2 font-medium">
                          ⚠️ Debes habilitar la API externa para usar esta opción
                        </p>
                      )}
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={selectedTask.metadata?.skipLLM || false}
                        disabled={selectedTask.metadata?.runOnInit}
                        onChange={(e) => {
                          const skipLLM = e.target.checked;
                          handleMetadataUpdate('skipLLM', skipLLM);
                          
                          // Si skipLLM se activa, forzar API enabled
                          if (skipLLM && !apiEnabled) {
                            setApiEnabled(true);
                            const apiConfig = { 
                              ...selectedTask.apiConfig, 
                              endpoint: selectedTask.apiConfig?.endpoint || '',
                              method: selectedTask.apiConfig?.method || 'POST'
                            };
                            handleUpdate('apiConfig', apiConfig);
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className={selectedTask.metadata?.runOnInit 
                        ? "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 opacity-50 cursor-not-allowed"
                        : "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                      }></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comportamiento del Asistente */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Brain className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Comportamiento del Asistente</h3>
              {selectedTask.metadata?.skipLLM && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                  Deshabilitado (skipLLM activo)
                </span>
              )}
            </div>

            {selectedTask.metadata?.skipLLM && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> El procesamiento del LLM está deshabilitado. Esta tarea solo ejecutará la llamada a la API externa.
                  El campo de instrucciones es requerido pero no se utilizará.
                </p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instrucciones de Comportamiento</label>
                <textarea
                  value={selectedTask.prompt?.template || ''}
                  onChange={(e) => handlePromptUpdate('template', e.target.value)}
                  rows={6}
                  disabled={selectedTask.metadata?.skipLLM}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    selectedTask.metadata?.skipLLM ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                  }`}
                  placeholder={selectedTask.metadata?.skipLLM ? "Campo requerido pero no se usará (skipLLM activo)" : "Describe cómo debe comportarse el asistente en esta función..."}
                />
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Creatividad del Asistente</label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={selectedTask.prompt?.temperature || 0.7}
                    onChange={(e) => handlePromptUpdate('temperature', parseFloat(e.target.value))}
                    disabled={selectedTask.metadata?.skipLLM}
                    className={`w-full ${
                      selectedTask.metadata?.skipLLM ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Preciso</span>
                    <span className="font-medium">{selectedTask.prompt?.temperature || 0.7}</span>
                    <span>Creativo</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longitud de Respuestas</label>
                  <select
                    value={selectedTask.prompt?.maxTokens || 256}
                    onChange={(e) => handlePromptUpdate('maxTokens', parseInt(e.target.value))}
                    disabled={selectedTask.metadata?.skipLLM}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      selectedTask.metadata?.skipLLM ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value={100}>Muy cortas (100 palabras aprox)</option>
                    <option value={256}>Cortas (256 palabras aprox)</option>
                    <option value={512}>Medianas (512 palabras aprox)</option>
                    <option value={1000}>Largas (1000 palabras aprox)</option>
                    <option value={2000}>Muy largas (2000 palabras aprox)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Configuración de Búsqueda Inteligente (solo para rag_qa) */}
          {selectedTask.type === 'rag_qa' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Zap className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Configuración de Búsqueda Inteligente</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precisión de Búsqueda</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedTask.prompt?.rag?.similarityThreshold || 0.7}
                    onChange={(e) => {
                      const rag = { ...selectedTask.prompt?.rag, similarityThreshold: parseFloat(e.target.value) };
                      handlePromptUpdate('rag', rag);
                    }}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Flexible</span>
                    <span className="font-medium">{selectedTask.prompt?.rag?.similarityThreshold || 0.7}</span>
                    <span>Precisa</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de Resultados</label>
                  <select
                    value={selectedTask.prompt?.rag?.topK || 5}
                    onChange={(e) => {
                      const rag = { ...selectedTask.prompt?.rag, topK: parseInt(e.target.value) };
                      handlePromptUpdate('rag', rag);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={1}>1 resultado</option>
                    <option value={3}>3 resultados</option>
                    <option value={5}>5 resultados</option>
                    <option value={10}>10 resultados</option>
                    <option value={20}>20 resultados</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Base de Datos</label>
                  <input
                    type="text"
                    value={selectedTask.prompt?.rag?.indexRef || ''}
                    onChange={(e) => {
                      const rag = { ...selectedTask.prompt?.rag, indexRef: e.target.value };
                      handlePromptUpdate('rag', rag);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="propiedades_disponibles"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Configuración de API Externa */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Database className="h-5 w-5 text-gray-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Configuración de API Externa</h3>
                <p className="text-sm text-gray-600">Conecta esta función con APIs externas para obtener datos dinámicos</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-700">¿Esta función necesita conectarse a una API externa?</span>
                <p className="text-xs text-gray-500 mt-1">Habilita esto si la función debe obtener datos de servicios externos</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    // No permitir desactivar si skipLLM está activo
                    if (selectedTask.metadata?.skipLLM) {
                      alert('No puedes desactivar la API externa mientras skipLLM esté activo. Desactiva skipLLM primero.');
                      return;
                    }
                    setApiEnabled(false);
                    handleUpdate('apiConfig', null);
                  }}
                  disabled={selectedTask.metadata?.skipLLM}
                  className={`inline-flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm ${
                    selectedTask.metadata?.skipLLM ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title={selectedTask.metadata?.skipLLM ? 'No puedes reiniciar mientras skipLLM esté activo' : 'Reiniciar configuración de API'}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reiniciar
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={apiEnabled}
                    disabled={selectedTask.metadata?.skipLLM}
                    onChange={(e) => {
                      // No permitir desactivar si skipLLM está activo
                      if (!e.target.checked && selectedTask.metadata?.skipLLM) {
                        alert('No puedes desactivar la API externa mientras skipLLM esté activo. Desactiva skipLLM primero.');
                        return;
                      }
                      
                      setApiEnabled(e.target.checked);
                      if (e.target.checked) {
                        const apiConfig = { 
                          ...selectedTask.apiConfig, 
                          endpoint: '',
                          method: 'POST'
                        };
                        handleUpdate('apiConfig', apiConfig);
                      } else {
                        handleUpdate('apiConfig', null);
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className={selectedTask.metadata?.skipLLM 
                    ? "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 opacity-50 cursor-not-allowed"
                    : "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"
                  }></div>
                </label>
              </div>
            </div>

            {apiEnabled && (
              <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL del Endpoint</label>
                <input
                  type="url"
                  value={selectedTask.apiConfig?.endpoint || ''}
                  onChange={(e) => {
                    const apiConfig = { ...selectedTask.apiConfig, endpoint: e.target.value };
                    handleUpdate('apiConfig', apiConfig);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://api.ejemplo.com/endpoint"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Método HTTP</label>
                  <select
                    value={selectedTask.apiConfig?.method || 'POST'}
                    onChange={(e) => {
                      const apiConfig = { ...selectedTask.apiConfig, method: e.target.value as any };
                      handleUpdate('apiConfig', apiConfig);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Autenticación</label>
                  <select
                    value={selectedTask.apiConfig?.auth?.type || ''}
                    onChange={(e) => {
                      const apiConfig = { 
                        ...selectedTask.apiConfig, 
                        auth: e.target.value ? { type: e.target.value as any, value: '' } : undefined 
                      };
                      handleUpdate('apiConfig', apiConfig);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Sin autenticación</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="api_key">API Key</option>
                    <option value="basic">Basic Auth</option>
                  </select>
                </div>
              </div>

              {selectedTask.apiConfig?.auth && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedTask.apiConfig.auth.type === 'api_key' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Header</label>
                      <input
                        type="text"
                        value={selectedTask.apiConfig.auth.headerName || ''}
                        onChange={(e) => {
                          const apiConfig = { 
                            ...selectedTask.apiConfig, 
                            auth: { ...selectedTask.apiConfig.auth!, headerName: e.target.value }
                          };
                          handleUpdate('apiConfig', apiConfig);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="X-API-Key"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {selectedTask.apiConfig.auth.type === 'bearer' ? 'Bearer Token' :
                       selectedTask.apiConfig.auth.type === 'api_key' ? 'API Key' :
                       'Credenciales (Base64)'}
                    </label>
                    <input
                      type="password"
                      value={selectedTask.apiConfig.auth.value || ''}
                      onChange={(e) => {
                        const apiConfig = { 
                          ...selectedTask.apiConfig, 
                          auth: { ...selectedTask.apiConfig.auth!, value: e.target.value }
                        };
                        handleUpdate('apiConfig', apiConfig);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Token o credenciales"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Headers Personalizados (JSON)</label>
                <textarea
                  value={JSON.stringify(selectedTask.apiConfig?.headers || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const headers = JSON.parse(e.target.value);
                      const apiConfig = { ...selectedTask.apiConfig, headers };
                      handleUpdate('apiConfig', apiConfig);
                    } catch (error) {
                      // Ignorar errores de JSON inválido mientras se escribe
                    }
                  }}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  placeholder='{\n  "Content-Type": "application/json",\n  "X-Client-Version": "2.0"\n}'
                />
                <p className="text-sm text-gray-500 mt-2">
                  Headers adicionales que se enviarán con la petición API.
                </p>
              </div>

              {/* Sección de Mapeo de Respuesta */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Mapeo de Respuesta (Opcional)</h4>
                    <p className="text-sm text-gray-600">Configura cómo extraer y mapear datos de la respuesta de la API</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Campo de Categoría */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                    <input
                      type="text"
                      value={selectedTask.metadata?.category || ''}
                      onChange={(e) => handleMetadataUpdate('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      placeholder="property_search, lead_capture, etc."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Categoría para agrupar y organizar los datos extraídos
                    </p>
                  </div>
                  {/* Botón para agregar mapeo */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Mapeos de Extracción</span>
                    <button
                      onClick={addExtractionMapEntry}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Mapeo
                    </button>
                  </div>

                  {/* Lista de mapeos */}
                  {extractionMapEntries.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm">No hay mapeos configurados</p>
                      <p className="text-xs">Agrega mapeos para extraer datos específicos de la respuesta de la API</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {extractionMapEntries.map((mapEntry) => (
                        <div key={mapEntry.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Campo Origen */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Campo Origen</label>
                              <input
                                type="text"
                                value={mapEntry.sourceField}
                                onChange={(e) => updateExtractionMapEntry(mapEntry.id, 'sourceField', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                placeholder="search_property.operation_type"
                              />
                            </div>

                            {/* Campo Destino */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Campo Destino</label>
                              <input
                                type="text"
                                value={mapEntry.entry.to}
                                onChange={(e) => updateExtractionMapEntry(mapEntry.id, 'to', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                placeholder="tipo_operacion"
                              />
                            </div>

                            {/* Tipo de Mapeo */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Mapeo</label>
                              <select
                                value={mapEntry.entry.kind || 'SINGLE'}
                                onChange={(e) => updateExtractionMapEntry(mapEntry.id, 'kind', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                              >
                                <option value="SINGLE">Valor Simple</option>
                                <option value="RANGE">Rango de Valores</option>
                                <option value="LIST">Lista de Valores</option>
                              </select>
                            </div>

                            {/* Configuración específica por tipo */}
                            {mapEntry.entry.kind === 'RANGE' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rol en Rango</label>
                                <select
                                  value={mapEntry.entry.role || 'exact'}
                                  onChange={(e) => updateExtractionMapEntry(mapEntry.id, 'role', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                >
                                  <option value="exact">Valor Exacto</option>
                                  <option value="min">Valor Mínimo</option>
                                  <option value="max">Valor Máximo</option>
                                </select>
                              </div>
                            )}

                            {/* Unidad */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Unidad (Opcional)</label>
                              <input
                                type="text"
                                value={mapEntry.entry.unit || ''}
                                onChange={(e) => updateExtractionMapEntry(mapEntry.id, 'unit', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                placeholder="MXN, USD, etc."
                              />
                            </div>
                          </div>

                          {/* Mapeo de Valores */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-medium text-gray-700">Mapeo de Valores</label>
                              <button
                                onClick={() => addValueMapping(mapEntry.id)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Agregar
                              </button>
                            </div>
                            
                            {mapEntry.entry.map && Object.keys(mapEntry.entry.map).length > 0 ? (
                              <div className="bg-white rounded border border-gray-200 p-3 space-y-2">
                                {Object.entries(mapEntry.entry.map).map(([key, value], index) => (
                                  <div key={mapEntry.id + '-' + key + '-' + index} className="flex items-center space-x-2">
                                    <input
                                      type="text"
                                      value={key}
                                      onChange={(e) => updateValueMapping(mapEntry.id, key, e.target.value, value)}
                                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                      placeholder="RENT"
                                    />
                                    <span className="text-gray-500 text-sm">→</span>
                                    <input
                                      type="text"
                                      value={value}
                                      onChange={(e) => updateValueMapping(mapEntry.id, key, key, e.target.value)}
                                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                      placeholder="renta"
                                    />
                                    <button
                                      onClick={() => removeValueMapping(mapEntry.id, key)}
                                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                      title="Eliminar mapeo"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="bg-gray-50 rounded border-2 border-dashed border-gray-200 p-4 text-center">
                                <p className="text-sm text-gray-500">No hay mapeos de valores configurados</p>
                                <p className="text-xs text-gray-400 mt-1">Haz clic en "Agregar" para crear mapeos como RENT → renta</p>
                              </div>
                            )}
                          </div>

                          {/* Botón eliminar */}
                          <div className="flex justify-end mt-4">
                            <button
                              onClick={() => removeExtractionMapEntry(mapEntry.id)}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              </div>
            )}

            {!apiEnabled && (
              <div className="text-center py-8 text-gray-500">
                <Database className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>Configuración de API externa deshabilitada</p>
                <p className="text-sm">Activa el toggle para configurar llamadas a APIs externas</p>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="space-y-8">
          {/* Vista Técnica */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Configuración Técnica</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Esta sección muestra la configuración técnica subyacente. Los cambios aquí requieren conocimientos de desarrollo.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Configuración Técnica del Prompt */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Configuración Técnica del Modelo de IA</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID de Configuración</label>
                <input
                  type="text"
                  value={selectedTask.prompt?.id || ''}
                  onChange={(e) => handlePromptUpdate('id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Técnico</label>
                <input
                  type="text"
                  value={selectedTask.prompt?.name || ''}
                  onChange={(e) => handlePromptUpdate('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor LLM</label>
                <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700">
                  {LLM_PROVIDERS[selectedTask.prompt?.llmProvider as keyof typeof LLM_PROVIDERS] || 'Proveedor estándar'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
                <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700">
                  {selectedTask.prompt?.model || 'Modelo estándar'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Temperature</label>
                <input
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={selectedTask.prompt?.temperature || 0.7}
                  onChange={(e) => handlePromptUpdate('temperature', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Tokens</label>
                <input
                  type="number"
                  min="1"
                  max="4000"
                  value={selectedTask.prompt?.maxTokens || 256}
                  onChange={(e) => handlePromptUpdate('maxTokens', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Template (Prompt Técnico)</label>
              <textarea
                value={selectedTask.prompt?.template || ''}
                onChange={(e) => handlePromptUpdate('template', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                placeholder="Template técnico del prompt..."
              />
            </div>
          </div>

          {/* Configuración de API Externa */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Configuración de API Externa</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL del Endpoint</label>
                <input
                  type="url"
                  value={selectedTask.apiConfig?.endpoint || ''}
                  onChange={(e) => {
                    const apiConfig = { ...selectedTask.apiConfig, endpoint: e.target.value };
                    handleUpdate('apiConfig', apiConfig);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://api.ejemplo.com/endpoint"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Método HTTP</label>
                  <select
                    value={selectedTask.apiConfig?.method || 'POST'}
                    onChange={(e) => {
                      const apiConfig = { ...selectedTask.apiConfig, method: e.target.value as any };
                      handleUpdate('apiConfig', apiConfig);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Autenticación</label>
                  <select
                    value={selectedTask.apiConfig?.auth?.type || ''}
                    onChange={(e) => {
                      const apiConfig = { 
                        ...selectedTask.apiConfig, 
                        auth: e.target.value ? { type: e.target.value as any, value: '' } : undefined 
                      };
                      handleUpdate('apiConfig', apiConfig);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Sin autenticación</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="api_key">API Key</option>
                    <option value="basic">Basic Auth</option>
                  </select>
                </div>
              </div>

              {selectedTask.apiConfig?.auth && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedTask.apiConfig.auth.type === 'api_key' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Header</label>
                      <input
                        type="text"
                        value={selectedTask.apiConfig.auth.headerName || ''}
                        onChange={(e) => {
                          const apiConfig = { 
                            ...selectedTask.apiConfig, 
                            auth: { ...selectedTask.apiConfig.auth!, headerName: e.target.value }
                          };
                          handleUpdate('apiConfig', apiConfig);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="X-API-Key"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {selectedTask.apiConfig.auth.type === 'bearer' ? 'Bearer Token' :
                       selectedTask.apiConfig.auth.type === 'api_key' ? 'API Key' :
                       'Credenciales (Base64)'}
                    </label>
                    <input
                      type="password"
                      value={selectedTask.apiConfig.auth.value || ''}
                      onChange={(e) => {
                        const apiConfig = { 
                          ...selectedTask.apiConfig, 
                          auth: { ...selectedTask.apiConfig.auth!, value: e.target.value }
                        };
                        handleUpdate('apiConfig', apiConfig);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Token o credenciales"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Headers Personalizados (JSON)</label>
                <textarea
                  value={JSON.stringify(selectedTask.apiConfig?.headers || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const headers = JSON.parse(e.target.value);
                      const apiConfig = { ...selectedTask.apiConfig, headers };
                      handleUpdate('apiConfig', apiConfig);
                    } catch (error) {
                      // Ignorar errores de JSON inválido mientras se escribe
                    }
                  }}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  placeholder='{\n  "Content-Type": "application/json",\n  "X-Client-Version": "2.0"\n}'
                />
                <p className="text-sm text-gray-500 mt-2">
                  Headers adicionales que se enviarán con la petición API.
                </p>
              </div>
            </div>
          </div>

          {/* Metadatos Técnicos */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadatos Técnicos</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">ID Técnico:</span>
                <span className="ml-2 font-mono">{selectedTask.id}</span>
              </div>
              <div>
                <span className="font-medium">Tipo:</span>
                <span className="ml-2">{selectedTask.type}</span>
              </div>
              <div>
                <span className="font-medium">Habilitada:</span>
                <span className="ml-2">{selectedTask.enabled ? 'Sí' : 'No'}</span>
              </div>
              <div>
                <span className="font-medium">Creado:</span>
                <span className="ml-2">{selectedTask.createdAt && new Date(selectedTask.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="font-medium">Actualizado:</span>
                <span className="ml-2">{selectedTask.updatedAt && new Date(selectedTask.updatedAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Editor JSON de la Tarea */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Configuración JSON Completa</label>
              <textarea
                value={JSON.stringify(selectedTask, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    updateTask(selectedTask.id, parsed);
                  } catch (error) {
                    // Mostrar error pero no actualizar
                    console.error('JSON inválido:', error);
                  }
                }}
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};