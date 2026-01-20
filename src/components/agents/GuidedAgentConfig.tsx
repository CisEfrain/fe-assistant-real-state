import React, { useState } from 'react';
import { Bot, Sparkles, Building2, Settings2, CheckCircle2, Home, Building, Store, Warehouse, MapPin, X } from 'lucide-react';
import { useAgentStore } from '../../stores/useAgentStore';

type ToneType = 'professional' | 'friendly' | 'consultant';
type BudgetTimingType = 'always_start' | 'if_asks' | 'after_options';
type VisitTimingType = 'always' | 'qualified_only' | 'manual';

interface GuidedConfig {
  agentName: string;
  tone: ToneType;
  operations: {
    sell: boolean;
    rent: boolean;
  };
  zones: string[];
  propertyTypes: {
    house: boolean;
    apartment: boolean;
    land: boolean;
    commercial: boolean;
    office: boolean;
    warehouse: boolean;
  };
  budgetTiming: BudgetTimingType;
  visitTiming: VisitTimingType;
  requiredFields: {
    name: boolean;
    phone: boolean;
    email: boolean;
    budget: boolean;
    zone: boolean;
    propertyType: boolean;
  };
}

const TONE_OPTIONS = {
  professional: {
    label: 'Profesional',
    description: 'Formal, técnico y directo',
    example: '"Buenos días. ¿En qué propiedad está interesado?"',
    icon: '🎯'
  },
  friendly: {
    label: 'Amigable',
    description: 'Cercano, cálido y conversacional',
    example: '"¡Hola! ¿Cómo estás? Cuéntame qué buscas 😊"',
    icon: '😊'
  },
  consultant: {
    label: 'Consultor',
    description: 'Experto, educativo y guía',
    example: '"Te ayudaré a encontrar la mejor opción. ¿Qué aspectos son más importantes para ti?"',
    icon: '💡'
  }
};

const PROPERTY_TYPES = [
  { id: 'house', label: 'Casa', icon: Home },
  { id: 'apartment', label: 'Departamento', icon: Building2 },
  { id: 'land', label: 'Terreno', icon: MapPin },
  { id: 'commercial', label: 'Local Comercial', icon: Store },
  { id: 'office', label: 'Oficina', icon: Building },
  { id: 'warehouse', label: 'Bodega', icon: Warehouse }
];

export const GuidedAgentConfig: React.FC = () => {
  const { currentAgent, updateAgent } = useAgentStore();

  const [config, setConfig] = useState<GuidedConfig>({
    agentName: currentAgent?.alias || '',
    tone: 'friendly',
    operations: {
      sell: true,
      rent: true
    },
    zones: [],
    propertyTypes: {
      house: true,
      apartment: true,
      land: false,
      commercial: false,
      office: false,
      warehouse: false
    },
    budgetTiming: 'after_options',
    visitTiming: 'qualified_only',
    requiredFields: {
      name: true,
      phone: true,
      email: false,
      budget: true,
      zone: true,
      propertyType: true
    }
  });

  const [newZone, setNewZone] = useState('');

  const handleToneChange = (tone: ToneType) => {
    setConfig({ ...config, tone });
    applyConfigToAgent({ ...config, tone });
  };

  const handleOperationToggle = (operation: 'sell' | 'rent') => {
    const newOperations = {
      ...config.operations,
      [operation]: !config.operations[operation]
    };
    setConfig({ ...config, operations: newOperations });
    applyConfigToAgent({ ...config, operations: newOperations });
  };

  const handleAddZone = () => {
    if (newZone.trim() && !config.zones.includes(newZone.trim())) {
      const newZones = [...config.zones, newZone.trim()];
      setConfig({ ...config, zones: newZones });
      setNewZone('');
      applyConfigToAgent({ ...config, zones: newZones });
    }
  };

  const handleRemoveZone = (zone: string) => {
    const newZones = config.zones.filter(z => z !== zone);
    setConfig({ ...config, zones: newZones });
    applyConfigToAgent({ ...config, zones: newZones });
  };

  const handlePropertyTypeToggle = (typeId: string) => {
    const newPropertyTypes = {
      ...config.propertyTypes,
      [typeId]: !config.propertyTypes[typeId as keyof typeof config.propertyTypes]
    };
    setConfig({ ...config, propertyTypes: newPropertyTypes });
    applyConfigToAgent({ ...config, propertyTypes: newPropertyTypes });
  };

  const applyConfigToAgent = (guidedConfig: GuidedConfig) => {
    if (!currentAgent) return;

    const tonePrompts = {
      professional: 'Eres un asistente inmobiliario profesional y directo. Usa un lenguaje formal, técnico y eficiente. Ve al grano sin ser frío.',
      friendly: 'Eres un asistente inmobiliario cercano y amigable. Usa un tono cálido, conversacional y empático. Puedes usar emojis ocasionalmente.',
      consultant: 'Eres un experto consultor inmobiliario. Tu objetivo es educar y guiar al cliente. Explica conceptos, ofrece opciones y ayuda a tomar decisiones informadas.'
    };

    const operations = [];
    if (guidedConfig.operations.sell) operations.push('Venta');
    if (guidedConfig.operations.rent) operations.push('Renta');

    const propertyTypesList = Object.entries(guidedConfig.propertyTypes)
      .filter(([_, enabled]) => enabled)
      .map(([type]) => {
        const typeMap: Record<string, string> = {
          house: 'Casa',
          apartment: 'Departamento',
          land: 'Terreno',
          commercial: 'Local Comercial',
          office: 'Oficina',
          warehouse: 'Bodega'
        };
        return typeMap[type];
      });

    const businessInformation = [
      `Operaciones: ${operations.join(', ')}`,
      `Tipos de propiedad: ${propertyTypesList.join(', ')}`,
      guidedConfig.zones.length > 0 ? `Zonas principales: ${guidedConfig.zones.join(', ')}` : ''
    ].filter(Boolean);

    const businessRules = [];

    if (guidedConfig.budgetTiming === 'always_start') {
      businessRules.push('Siempre pregunta el presupuesto al inicio de la conversación');
    } else if (guidedConfig.budgetTiming === 'if_asks') {
      businessRules.push('Solo pregunta el presupuesto si el cliente lo menciona o pregunta por precios');
    } else {
      businessRules.push('Pregunta el presupuesto después de mostrar algunas opciones iniciales');
    }

    if (guidedConfig.visitTiming === 'always') {
      businessRules.push('Sugiere agendar una visita en cuanto sea posible');
    } else if (guidedConfig.visitTiming === 'qualified_only') {
      businessRules.push('Solo sugiere visita cuando tengas: presupuesto, zona y datos de contacto');
    } else {
      businessRules.push('No sugieras visitas automáticamente, espera a que el cliente lo solicite');
    }

    const requiredFieldsList = Object.entries(guidedConfig.requiredFields)
      .filter(([_, required]) => required)
      .map(([field]) => {
        const fieldMap: Record<string, string> = {
          name: 'nombre',
          phone: 'teléfono',
          email: 'email',
          budget: 'presupuesto',
          zone: 'zona',
          propertyType: 'tipo de propiedad'
        };
        return fieldMap[field];
      });

    if (requiredFieldsList.length > 0) {
      businessRules.push(`Para calificar un lead necesitas: ${requiredFieldsList.join(', ')}`);
    }

    const updatedAgent = {
      ...currentAgent,
      alias: guidedConfig.agentName || currentAgent.alias,
      agentTone: tonePrompts[guidedConfig.tone],
      conversationPrompt: tonePrompts[guidedConfig.tone],
      businessInformation,
      businessRules,
      updatedAt: new Date()
    };

    updateAgent(updatedAgent);
  };

  const handleNameChange = (name: string) => {
    setConfig({ ...config, agentName: name });
    if (currentAgent) {
      updateAgent({
        ...currentAgent,
        alias: name,
        updatedAt: new Date()
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center space-x-3 mb-2">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">Configuración Guiada</h2>
        </div>
        <p className="text-gray-600">
          Configura tu asistente en 3 simples pasos. La configuración técnica se genera automáticamente.
        </p>
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-xl font-bold text-gray-900">Identidad del Asistente</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del asistente
              </label>
              <input
                type="text"
                value={config.agentName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej: Ana, Carlos, María"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">Este es el nombre con el que se presentará tu asistente</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tono de conversación
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(Object.entries(TONE_OPTIONS) as [ToneType, typeof TONE_OPTIONS.professional][]).map(([key, option]) => (
                  <button
                    key={key}
                    onClick={() => handleToneChange(key)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      config.tone === key
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-3xl mb-2">{option.icon}</div>
                    <div className="font-semibold text-gray-900 mb-1">{option.label}</div>
                    <div className="text-sm text-gray-600 mb-2">{option.description}</div>
                    <div className="text-xs italic text-gray-500 bg-white p-2 rounded border border-gray-100">
                      {option.example}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-xl font-bold text-gray-900">Operación Inmobiliaria</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipos de operación
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleOperationToggle('sell')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    config.operations.sell
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {config.operations.sell && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    <span className="font-semibold">Venta</span>
                  </div>
                </button>
                <button
                  onClick={() => handleOperationToggle('rent')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    config.operations.rent
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {config.operations.rent && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    <span className="font-semibold">Renta</span>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Zonas principales (3-5 recomendado)
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newZone}
                  onChange={(e) => setNewZone(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddZone()}
                  placeholder="Ej: Polanco, Roma, Condesa..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddZone}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Agregar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.zones.map((zone) => (
                  <span
                    key={zone}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm"
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    {zone}
                    <button
                      onClick={() => handleRemoveZone(zone)}
                      className="ml-2 hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipos de propiedad
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PROPERTY_TYPES.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => handlePropertyTypeToggle(id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      config.propertyTypes[id as keyof typeof config.propertyTypes]
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {config.propertyTypes[id as keyof typeof config.propertyTypes] && (
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      )}
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-xl font-bold text-gray-900">Comportamiento</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Cuándo debe preguntar el presupuesto?
              </label>
              <select
                value={config.budgetTiming}
                onChange={(e) => {
                  const newConfig = { ...config, budgetTiming: e.target.value as BudgetTimingType };
                  setConfig(newConfig);
                  applyConfigToAgent(newConfig);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="always_start">Siempre al inicio</option>
                <option value="after_options">Después de mostrar opciones</option>
                <option value="if_asks">Solo si el cliente pregunta</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Cuándo debe sugerir una visita?
              </label>
              <select
                value={config.visitTiming}
                onChange={(e) => {
                  const newConfig = { ...config, visitTiming: e.target.value as VisitTimingType };
                  setConfig(newConfig);
                  applyConfigToAgent(newConfig);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="always">Siempre que sea posible</option>
                <option value="qualified_only">Solo con leads calificados (presupuesto + zona + contacto)</option>
                <option value="manual">Dejar que yo lo maneje manualmente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Datos obligatorios para calificar un lead
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries({
                  name: 'Nombre',
                  phone: 'Teléfono',
                  email: 'Email',
                  budget: 'Presupuesto',
                  zone: 'Zona',
                  propertyType: 'Tipo de propiedad'
                }).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      const newRequiredFields = {
                        ...config.requiredFields,
                        [key]: !config.requiredFields[key as keyof typeof config.requiredFields]
                      };
                      const newConfig = { ...config, requiredFields: newRequiredFields };
                      setConfig(newConfig);
                      applyConfigToAgent(newConfig);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      config.requiredFields[key as keyof typeof config.requiredFields]
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {config.requiredFields[key as keyof typeof config.requiredFields] && (
                        <CheckCircle2 className="h-4 w-4 text-orange-600" />
                      )}
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
