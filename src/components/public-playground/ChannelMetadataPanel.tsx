import React from 'react';
import { MessageSquare, Phone, Plus, Trash2, Database } from 'lucide-react';
import { 
  PlaygroundChannel, 
  WebchatMetadata, 
  WhatsappMetadata, 
  PlaygroundState
} from '../../types/playground';
import { Agent } from '../../types/agents';

interface ChannelMetadataPanelProps {
  agent: Agent;
  onChange: (state: Partial<PlaygroundState>) => void;
  currentState: PlaygroundState;
}

export const ChannelMetadataPanel: React.FC<ChannelMetadataPanelProps> = ({ 
  agent, 
  onChange,
  currentState
}) => {
  const handleChannelChange = (channel: PlaygroundChannel) => {
    let newMetadata: WebchatMetadata | WhatsappMetadata;

    if (channel === 'webchat') {
      newMetadata = { 
        channel: 'webchat', 
        intent: 'schedule_call',
        locale: 'es-MX',
        originPath: '/'
      };
    } else {
      newMetadata = { channel: 'whatsapp', phone: '+52' };
    }

    onChange({
      selectedChannel: channel,
      channelMetadata: newMetadata
    });
  };

  const updateMetadata = (field: string, value: string) => {
    onChange({
      channelMetadata: {
        ...currentState.channelMetadata,
        [field]: value
      } as WebchatMetadata | WhatsappMetadata
    });
  };

  const addCustomMetadata = () => {
    onChange({
      customMetadata: [
        ...currentState.customMetadata,
        { key: '', value: '' }
      ]
    });
  };

  const updateCustomMetadata = (index: number, field: 'key' | 'value', value: string) => {
    const newCustomMetadata = [...currentState.customMetadata];
    newCustomMetadata[index][field] = value;
    onChange({ customMetadata: newCustomMetadata });
  };

  const removeCustomMetadata = (index: number) => {
    const newCustomMetadata = currentState.customMetadata.filter((_, i) => i !== index);
    onChange({ customMetadata: newCustomMetadata });
  };

  // Determinar si es PON para mostrar un aviso
  const isPON = agent.analyticsType === 'PON';

  return (
    <div className="space-y-6">
      {/* Channel Selection */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-2">
          <button
            onClick={() => handleChannelChange('webchat')}
            className={`p-4 flex items-center justify-center space-x-2 transition-colors ${
              currentState.selectedChannel === 'webchat'
                ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="font-medium">Webchat</span>
          </button>
          <button
            onClick={() => handleChannelChange('whatsapp')}
            className={`p-4 flex items-center justify-center space-x-2 transition-colors ${
              currentState.selectedChannel === 'whatsapp'
                ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Phone className="h-5 w-5" />
            <span className="font-medium">WhatsApp</span>
          </button>
        </div>

        {/* Channel Specific Metadata */}
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="h-4 w-4 text-gray-400" />
            <h4 className="text-sm font-medium text-gray-700">
              Metadatos del Canal: <span className="capitalize">{currentState.selectedChannel}</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentState.selectedChannel === 'webchat' ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Intent</label>
                  <select
                    value={(currentState.channelMetadata as WebchatMetadata).intent || ''}
                    onChange={(e) => updateMetadata('intent', e.target.value)}
                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="schedule_call">Agendar Llamada</option>
                    <option value="schedule_visit">Agendar Visita</option>
                    <option value="">Sin Intent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Property ID</label>
                  <input
                    type="text"
                    value={(currentState.channelMetadata as WebchatMetadata).propertyId || ''}
                    onChange={(e) => updateMetadata('propertyId', e.target.value)}
                    placeholder="Ej. 144285"
                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Locale</label>
                  <input
                    type="text"
                    value={(currentState.channelMetadata as WebchatMetadata).locale || 'es-MX'}
                    onChange={(e) => updateMetadata('locale', e.target.value)}
                    placeholder="es-MX"
                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Origin Path</label>
                  <input
                    type="text"
                    value={(currentState.channelMetadata as WebchatMetadata).originPath || '/'}
                    onChange={(e) => updateMetadata('originPath', e.target.value)}
                    placeholder="/departamentos/..."
                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Teléfono (Requerido)
                </label>
                <input
                  type="text"
                  value={(currentState.channelMetadata as WhatsappMetadata).phone || ''}
                  onChange={(e) => updateMetadata('phone', e.target.value)}
                  placeholder="+52 123 456 7890"
                  className="w-full text-sm border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-xs text-gray-400 mt-1">Incluye código de país (+52)</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Metadata */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-gray-400" />
            <h4 className="text-sm font-medium text-gray-700">Metadatos Personalizados</h4>
          </div>
          <button
            onClick={addCustomMetadata}
            className="text-xs flex items-center text-purple-600 hover:text-purple-700 font-medium"
          >
            <Plus className="h-3 w-3 mr-1" />
            Agregar Campo
          </button>
        </div>

        {currentState.customMetadata.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-2">
            No hay metadatos personalizados configurados
          </p>
        ) : (
          <div className="space-y-3">
            {currentState.customMetadata.map((meta, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Clave"
                  value={meta.key}
                  onChange={(e) => updateCustomMetadata(index, 'key', e.target.value)}
                  className="flex-1 text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
                <input
                  type="text"
                  placeholder="Valor"
                  value={meta.value}
                  onChange={(e) => updateCustomMetadata(index, 'value', e.target.value)}
                  className="flex-1 text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
                <button
                  onClick={() => removeCustomMetadata(index)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isPON && currentState.selectedChannel !== 'whatsapp' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Este es un agente PON. Se recomienda probar en canal WhatsApp o Webchat, 
            pero el flujo completo de simulación de Lead PON fuerza el uso de metadatos de WhatsApp internamente.
          </p>
        </div>
      )}
    </div>
  );
};
