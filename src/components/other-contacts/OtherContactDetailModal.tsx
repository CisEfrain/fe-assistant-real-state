import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Hash,
  Tag,
  Mail,
  ExternalLink, MessageCircle
} from 'lucide-react';
import { OtherContactRecord } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TagManager } from './TagManager';
import { useInteractionStore } from '../../stores/useInteractionStore';

interface OtherContactDetailModalProps {
  contact: OtherContactRecord;
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to extract contact info from metadata
const extractContactInfo = (metadata: Record<string, any>) => {
  const name = metadata?.name || metadata?.nombre || 'Sin nombre';
  const phone = metadata?.phone || metadata?.telefono || metadata?.phone_number || 'Sin teléfono';
  const email = metadata?.email || 'Sin email';
  
  return { name, phone, email };
};

// Helper function to format WhatsApp number
const formatWhatsAppNumber = (phone: string): string => {
  // Limpiar número: remover espacios, guiones, paréntesis
  let cleaned = phone.replace(/[\s\-()]/g, '');
  
  // Si ya tiene +, retornar limpio
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // Si es número de 10 dígitos (México), agregar +52
  if (cleaned.length === 10 && /^\d+$/.test(cleaned)) {
    return `+52${cleaned}`;
  }
  
  // Si tiene 12+ dígitos, asumir que tiene código país sin +
  if (cleaned.length >= 12) {
    return `+${cleaned}`;
  }
  
  return cleaned;
};

export const OtherContactDetailModal: React.FC<OtherContactDetailModalProps> = ({ contact, isOpen, onClose }) => {
  const [localContact, setLocalContact] = useState<OtherContactRecord>(contact);
  const { addContactTags, removeContactTags } = useInteractionStore();

  // Update local contact when prop changes
  React.useEffect(() => {
    setLocalContact(contact);
  }, [contact]);

  const handleTagsUpdate = (contactId: string, newTags: string[]) => {
    setLocalContact({ ...localContact, tags: newTags });
  };

  if (!isOpen) return null;

  // Format session duration from seconds to readable format
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Render metadata value with intelligent formatting
  const renderMetadataValue = (key: string, value: any): React.ReactNode => {
    if (value === null || value === undefined) return 'N/A';

    try {
      switch (key) {
        case 'phone_number':
          return (
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-blue-600" />
              <span className="font-mono">{value}</span>
            </div>
          );
        
        case 'session_duration_seconds':
          return (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span>{formatDuration(value)}</span>
            </div>
          );
        
        case 'interaction_type':
          const typeColors: Record<string, string> = {
            'out_of_scope': 'bg-gray-100 text-gray-800',
            'complaint': 'bg-red-100 text-red-800',
            'general_inquiry': 'bg-blue-100 text-blue-800',
          };
          const colorClass = typeColors[value] || 'bg-gray-100 text-gray-800';
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
              {value.replace(/_/g, ' ').toUpperCase()}
            </span>
          );
        
        case 'priority':
          const priorityColors: Record<string, string> = {
            'high': 'bg-red-100 text-red-800',
            'medium': 'bg-yellow-100 text-yellow-800',
            'low': 'bg-green-100 text-green-800',
          };
          const priorityColor = priorityColors[value] || 'bg-gray-100 text-gray-800';
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor}`}>
              {value.toUpperCase()}
            </span>
          );
        
        case 'escalated_to':
        case 'referred_to':
          return (
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-purple-600" />
              <span className="font-medium">{value}</span>
            </div>
          );
        
        case 'complaint_id':
          return (
            <div className="flex items-center space-x-2">
              <Hash className="h-4 w-4 text-orange-600" />
              <span className="font-mono">{value}</span>
            </div>
          );
        
        default:
          // Handle objects and arrays
          if (typeof value === 'object') {
            return (
              <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            );
          }
          return <span>{String(value)}</span>;
      }
    } catch (error) {
      return <span className="text-red-600">Error al renderizar valor</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Detalle de Contacto</h3>
                  <p className="text-sm text-gray-200">ID: {contact.id}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Contact Information */}
            {(() => {
              const { name, phone, email } = extractContactInfo(localContact.metadata);
              return (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-4">Información de Contacto</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">Nombre</span>
                      </div>
                      <div className={`text-sm ${name === 'Sin nombre' ? 'text-gray-400 italic' : 'text-gray-900 font-medium'}`}>
                        {name}
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center space-x-2 mb-2">
                        <Phone className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">Teléfono</span>
                      </div>
                      <div className={`text-sm font-mono ${phone === 'Sin teléfono' ? 'text-gray-400 italic' : 'text-gray-900 font-medium'}`}>
                        {phone}
                      </div>
                      {localContact.channel === 'whatsapp' && phone !== 'Sin teléfono' && (
                        <a
                          href={`https://wa.me/${formatWhatsAppNumber(phone)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center mt-2 text-xs text-green-600 hover:text-green-700 font-medium"
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Abrir en WhatsApp
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      )}
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center space-x-2 mb-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">Email</span>
                      </div>
                      <div className={`text-sm ${email === 'Sin email' ? 'text-gray-400 italic' : 'text-gray-900 font-medium break-all'}`}>
                        {email}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">Fecha</span>
                </div>
                <p className="text-gray-700">
                  {format(new Date(localContact.created_at), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageSquare className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">Canal</span>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  localContact.channel === 'whatsapp' 
                    ? 'bg-green-100 text-green-800' 
                    : localContact.channel === 'call'
                    ? 'bg-blue-100 text-blue-800'
                    : localContact.channel === 'webchat'
                    ? 'bg-purple-100 text-purple-800'
                    : localContact.channel === 'widget_testing'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {localContact.channel === 'whatsapp' && '📱 WhatsApp'}
                  {localContact.channel === 'call' && '📞 Llamada'}
                  {localContact.channel === 'webchat' && '💬 Web Chat'}
                  {localContact.channel === 'widget_testing' && '🔧 Widget Testing'}
                  {!localContact.channel && '❓ No especificado'}
                </span>
              </div>
            </div>

            {/* Tags Management Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Tag className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Gestión de Tags</h4>
              </div>
              <TagManager
                contactId={localContact.id}
                currentTags={localContact.tags}
                onTagsUpdate={handleTagsUpdate}
                onAddTags={addContactTags}
                onRemoveTags={removeContactTags}
                compact={false}
              />
            </div>

            {/* Additional Comment */}
            {localContact.additional_comment && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-2">Comentario Adicional</h4>
                    <p className="text-blue-800">{localContact.additional_comment}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Complaint Section */}
            <div className={`rounded-lg p-4 border ${
              localContact.has_complaint 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-start space-x-3">
                {localContact.has_complaint ? (
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className={`font-semibold mb-2 ${
                    localContact.has_complaint ? 'text-red-900' : 'text-green-900'
                  }`}>
                    {localContact.has_complaint ? '⚠️ Queja Registrada' : '✓ Sin Quejas'}
                  </h4>
                  {localContact.has_complaint && localContact.complaint && (
                    <p className="text-red-800 italic">"{localContact.complaint}"</p>
                  )}
                </div>
              </div>
            </div>

            {/* Conversation Timeline */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                <span>Conversación</span>
                <span className="text-sm text-gray-500">({localContact.conversation.length} mensajes)</span>
              </h4>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {localContact.conversation.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                    }`}>
                      <div className="flex items-center space-x-2 mb-1">
                        {message.role === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <MessageSquare className="h-4 w-4" />
                        )}
                        <span className="text-xs font-semibold">
                          {message.role === 'user' ? 'Usuario' : 'Asistente'}
                        </span>
                        <span className="text-xs opacity-75">
                          {format(new Date(message.timestamp), 'HH:mm:ss')}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata Section */}
            {(() => {
              const contactFields = ['name', 'nombre', 'phone', 'telefono', 'phone_number', 'email'];
              const filteredMetadata = Object.entries(localContact.metadata || {}).filter(
                ([key]) => !contactFields.includes(key.toLowerCase())
              );
              
              return filteredMetadata.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Hash className="h-5 w-5 text-gray-600" />
                    <span>Metadata Adicional</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredMetadata.map(([key, value]) => (
                      <div key={key} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                          {key.replace(/_/g, ' ')}
                        </div>
                        <div className="text-sm text-gray-900">
                          {renderMetadataValue(key, value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
