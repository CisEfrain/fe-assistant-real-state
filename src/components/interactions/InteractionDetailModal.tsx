import React from 'react';
import { 
  X, 
  Phone, 
  Calendar, 
  User, 
  MapPin, 
  DollarSign, 
  Home, 
  MessageSquare,
  MessageCircle,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Search,
  Star,
  Hash,
  Mail,
  ExternalLink
} from 'lucide-react';
import { InteractionRecord } from '../../types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface InteractionDetailModalProps {
  interaction: InteractionRecord;
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to extract contact info from metadata
const extractContactInfo = (metadata: Record<string, any> | undefined) => {
  if (!metadata) return { name: 'Sin nombre', phone: 'Sin teléfono', email: 'Sin email' };
  
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

export const InteractionDetailModal: React.FC<InteractionDetailModalProps> = ({ interaction, isOpen, onClose }) => {
  if (!isOpen) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getLeadTypeColor = (leadType: string) => {
    switch (leadType) {
      case 'PROPERTY_LEAD': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SEARCH_LEAD': return 'bg-green-100 text-green-800 border-green-200';
      case 'LOCATION_LEAD': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLeadTypeLabel = (leadType: string) => {
    switch (leadType) {
      case 'PROPERTY_LEAD': return 'Lead de Propiedad';
      case 'SEARCH_LEAD': return 'Lead de Búsqueda';
      case 'LOCATION_LEAD': return 'Bin Lead';
      default: return leadType;
    }
  };

  const getOperationTypeColor = (operationType: string) => {
    return operationType === 'SELL' 
      ? 'bg-orange-100 text-orange-800 border-orange-200' 
      : 'bg-indigo-100 text-indigo-800 border-indigo-200';
  };

  const getAppointmentTypeIcon = (appointmentType?: string) => {
    switch (appointmentType) {
      case 'VISIT': return <Eye className="h-5 w-5 text-green-600" />;
      case 'PHONE_CALL': return <Phone className="h-5 w-5 text-blue-600" />;
      case 'NOT_SCHEDULED': return <XCircle className="h-5 w-5 text-gray-400" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getCSATColor = (csat?: string) => {
    if (!csat) return 'text-gray-600 bg-gray-100';
    
    // Manejar valores numéricos
    if (csat === '5' || csat === 'Muy satisfecho' || csat === 'VERY_SATISFIED') {
      return 'text-green-600 bg-green-100';
    }
    if (csat === '4' || csat === 'Satisfecho' || csat === 'SATISFIED') {
      return 'text-green-600 bg-green-100';
    }
    if (csat === '3' || csat === 'Neutral' || csat === 'NEUTRAL') {
      return 'text-yellow-600 bg-yellow-100';
    }
    if (csat === '2' || csat === 'Insatisfecho' || csat === 'DISSATISFIED') {
      return 'text-red-600 bg-red-100';
    }
    if (csat === '1' || csat === 'Muy insatisfecho' || csat === 'VERY_DISSATISFIED') {
      return 'text-red-600 bg-red-100';
    }
    
    return 'text-gray-600 bg-gray-100';
  };

  const getCSATStars = (csat?: string) => {
    if (!csat) return 0;
    
    // Manejar valores numéricos directos
    if (csat === '5' || csat === 'Muy satisfecho' || csat === 'VERY_SATISFIED') return 5;
    if (csat === '4' || csat === 'Satisfecho' || csat === 'SATISFIED') return 4;
    if (csat === '3' || csat === 'Neutral' || csat === 'NEUTRAL') return 3;
    if (csat === '2' || csat === 'Insatisfecho' || csat === 'DISSATISFIED') return 2;
    if (csat === '1' || csat === 'Muy insatisfecho' || csat === 'VERY_DISSATISFIED') return 1;
    
    return 0;
  };

  const getCSATLabel = (csat?: string) => {
    if (!csat) return 'Sin respuesta';
    
    // Normalizar a texto legible
    if (csat === '5' || csat === 'VERY_SATISFIED') return 'Muy satisfecho';
    if (csat === '4' || csat === 'SATISFIED') return 'Satisfecho';
    if (csat === '3' || csat === 'NEUTRAL') return 'Neutral';
    if (csat === '2' || csat === 'DISSATISFIED') return 'Insatisfecho';
    if (csat === '1' || csat === 'VERY_DISSATISFIED') return 'Muy insatisfecho';
    
    return csat; // Devolver valor original si no coincide
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageCircle className="h-5 w-5 text-green-600" />;
      case 'call':
        return <Phone className="h-5 w-5 text-blue-600" />;
      case 'webchat':
        return <MessageSquare className="h-5 w-5 text-purple-600" />;
      case 'widget_testing':
        return <Settings className="h-5 w-5 text-orange-600" />;
      default:
        return <MessageCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  // Format session duration from seconds to readable format
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Render metadata value with intelligent formatting
  const renderMetadataValue = (key: string, value: unknown): React.ReactNode => {
    if (value === null || value === undefined) return 'N/A';

    try {
      switch (key) {
        case 'phone_number':
          return (
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-blue-600" />
              <span className="font-mono">{String(value)}</span>
            </div>
          );
        
        case 'session_duration_seconds':
          return (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span>{formatDuration(Number(value))}</span>
            </div>
          );
        
        case 'interaction_type': {
          const typeColors: Record<string, string> = {
            'out_of_scope': 'bg-gray-100 text-gray-800',
            'complaint': 'bg-red-100 text-red-800',
            'general_inquiry': 'bg-blue-100 text-blue-800',
          };
          const colorClass = typeColors[String(value)] || 'bg-gray-100 text-gray-800';
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
              {String(value).replace(/_/g, ' ').toUpperCase()}
            </span>
          );
        }
        
        case 'priority': {
          const priorityColors: Record<string, string> = {
            'high': 'bg-red-100 text-red-800',
            'medium': 'bg-yellow-100 text-yellow-800',
            'low': 'bg-green-100 text-green-800',
          };
          const priorityColor = priorityColors[String(value)] || 'bg-gray-100 text-gray-800';
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor}`}>
              {String(value).toUpperCase()}
            </span>
          );
        }
        
        case 'escalated_to':
        case 'referred_to':
          return (
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-purple-600" />
              <span className="font-medium">{String(value)}</span>
            </div>
          );
        
        case 'complaint_id':
          return (
            <div className="flex items-center space-x-2">
              <Hash className="h-4 w-4 text-orange-600" />
              <span className="font-mono">{String(value)}</span>
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
    } catch {
      return <span className="text-red-600">Error al renderizar valor</span>;
    }
  };

  // Función para renderizar evaluación con estructura nueva de API
  const renderEvaluationData = (evaluation: Record<string, any>) => {
    // Manejar estructura nueva con buying/renting
    const buyingData = evaluation.buying;
    const rentingData = evaluation.renting;
    
    if (!buyingData && !rentingData) {
      // Fallback para estructura antigua
      const importantFields = [
        { key: 'seeker', label: 'Buscador', transform: (v: string) => v === 'MYSELF' ? 'Para sí mismo' : 'Para otro' },
        { key: 'status', label: 'Estado', transform: (v: string) => v === 'SEARCHING' ? 'Buscando' : v },
        { key: 'purchase_planning_time', label: 'Tiempo de compra', transform: (v: string) => v === 'LT_THREE_MONTHS' ? 'Menos de 3 meses' : v },
        { key: 'mortgage_credit', label: 'Crédito', transform: (v: string) => v },
        { key: 'credit_validation', label: 'Validación crediticia', transform: (v: string) => v === 'PREAPPROVED' ? 'Pre-aprobado' : v === 'UNSTARTED' ? 'Sin iniciar' : v },
        { key: 'support_needed', label: 'Urgencia', transform: (v: string) => v === 'IMMEDIATE' ? 'Inmediata' : 'Solo información' },
        { key: 'qualification', label: 'Calificación', transform: (v: string) => v },
        { key: 'tentative_moving_date', label: 'Fecha de mudanza', transform: (v: string) => v }
      ];

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {importantFields.map(({ key, label, transform }) => {
            const value = evaluation[key];
            if (value === null || value === undefined) return null;
            
            return (
              <div key={key}>
                <span className="text-sm text-gray-600">{label}:</span>
                <div className="font-medium text-gray-900">
                  {transform ? transform(value) : String(value)}
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    
    // Renderizar estructura nueva
    const activeData = buyingData || rentingData;
    const operationType = buyingData ? 'Compra' : 'Renta';
    
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2 mb-4">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
            buyingData ? 'bg-orange-100 text-orange-800' : 'bg-indigo-100 text-indigo-800'
          }`}>
            Evaluación de {operationType}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeData.qualification && (
            <div>
              <span className="text-sm text-gray-600">Calificación:</span>
              <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${
                activeData.qualification === 'HOT' ? 'bg-red-100 text-red-800' :
                activeData.qualification === 'MODERATE' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {activeData.qualification}
              </div>
            </div>
          )}
          
          {activeData.confirmation_method && (
            <div>
              <span className="text-sm text-gray-600">Método de confirmación:</span>
              <div className="font-medium text-gray-900">
                {activeData.confirmation_method === 'TELEPHONE' ? 'Teléfono' : 'WhatsApp'}
              </div>
            </div>
          )}
          
          {activeData.source && (
            <div>
              <span className="text-sm text-gray-600">Fuente:</span>
              <div className="font-medium text-gray-900">{activeData.source}</div>
            </div>
          )}
          
          {activeData.tentative_moving_date && (
            <div>
              <span className="text-sm text-gray-600">Fecha tentativa de mudanza:</span>
              <div className="font-medium text-gray-900">
                {format(parseISO(activeData.tentative_moving_date), 'dd/MM/yyyy', { locale: es })}
              </div>
            </div>
          )}
          
          {activeData.pet_policy && (
            <div>
              <span className="text-sm text-gray-600">Política de mascotas:</span>
              <div className="font-medium text-gray-900">
                {activeData.pet_policy === 'ALLOWED' ? 'Permitidas' : 
                 activeData.pet_policy === 'NOT_ALLOWED' ? 'No permitidas' : 'No definida'}
              </div>
            </div>
          )}
          
          {activeData.renting_requirements && Array.isArray(activeData.renting_requirements) && (
            <div className="md:col-span-2">
              <span className="text-sm text-gray-600">Requisitos de renta:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {activeData.renting_requirements.map((req: string, index: number) => (
                  <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {req === 'THREE_MONTHS' ? '3 meses de renta' :
                     req === 'ENDORSEMENT' ? 'Aval' :
                     req === 'SIGN_POLICY' ? 'Póliza' :
                     req === 'BAIL' ? 'Fianza' : req}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {activeData.additional_comment && (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Comentarios adicionales:</span>
            <p className="text-sm text-gray-900 mt-2">{activeData.additional_comment}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Interacción #{interaction.phonecall_id}
                  </h3>
                  <p className="text-orange-100">
                    {format(new Date(interaction.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          <div className="px-6 py-6 max-h-[80vh] overflow-y-auto">
            {/* Contact Information */}
            {(() => {
              const { name, phone, email } = extractContactInfo(interaction.metadata);
              return (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
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
                      {interaction.channel === 'whatsapp' && phone !== 'Sin teléfono' && (
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

            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Información General</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Fuente:</span>
                    <span className="ml-2 font-medium">{interaction.source}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Estado del Broker:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      interaction.broker_status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {getLeadTypeLabel(interaction.lead_type)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  {getChannelIcon(interaction.channel)}
                  <span className="font-medium text-gray-900">Canal de Comunicación</span>
                </div>
                <div className="text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    interaction.channel === 'whatsapp' 
                      ? 'bg-green-100 text-green-800' 
                      : interaction.channel === 'call'
                      ? 'bg-blue-100 text-blue-800'
                      : interaction.channel === 'webchat'
                      ? 'bg-purple-100 text-purple-800'
                      : interaction.channel === 'widget_testing'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {interaction.channel === 'whatsapp' && 'WhatsApp'}
                    {interaction.channel === 'call' && 'Llamada Telefónica'}
                    {interaction.channel === 'webchat' && 'Web Chat'}
                    {interaction.channel === 'widget_testing' && 'Widget Testing'}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-gray-900">Clasificación</span>
                </div>
                <div className="space-y-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getLeadTypeColor(interaction.lead_type)}`}>
                    {getLeadTypeLabel(interaction.lead_type)}
                  </span>
                  <br />
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getOperationTypeColor(interaction.operation_type)}`}>
                    {interaction.operation_type === 'SELL' ? 'Venta' : 'Renta'}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Cita</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getAppointmentTypeIcon(interaction.appointment?.type)}
                  <span className="text-sm">
                    {interaction.appointment?.type === 'VISIT' && 'Visita programada'}
                    {interaction.appointment?.type === 'PHONE_CALL' && 'Llamada de seguimiento'}
                    {interaction.appointment?.type === 'NOT_SCHEDULED' && 'Sin cita agendada'}
                  </span>
                </div>
                {interaction.appointment?.date && (
                  <div className="mt-2 text-sm text-gray-600">
                    {format(new Date(interaction.appointment.date), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </div>
                )}

                {/* Mostrar reclamo si existe */}
                {interaction.quality.complaint && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-red-800">Reclamo registrado:</span>
                        <p className="text-sm text-red-700 mt-1 bg-white p-2 rounded border border-red-200">
                          "{interaction.quality.complaint}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Propiedad Original (si aplica) */}
            {interaction.original_property && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Home className="h-5 w-5 mr-2 text-orange-600" />
                  Propiedad Consultada
                </h4>
                <div className="bg-gradient-to-r from-orange-50 to-purple-50 rounded-lg p-6 border border-orange-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">ID de Propiedad</span>
                      <div className="font-semibold text-gray-900">#{interaction.original_property.property_id}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Tipo</span>
                      <div className="font-semibold text-gray-900">{interaction.original_property.property_type}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Precio</span>
                      <div className="font-semibold text-green-600 flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {formatCurrency(interaction.original_property.price.amount)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Evaluación (si aplica) */}
            {interaction.evaluation && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Precalificación
                </h4>
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  {renderEvaluationData(interaction.evaluation)}
                </div>
              </div>
            )}

            {/* Búsqueda (si aplica) */}
            {interaction.search && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Search className="h-5 w-5 mr-2 text-blue-600" />
                  Criterios de Búsqueda
                </h4>
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Ubicación</span>
                      <div className="font-medium text-gray-900 flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                        {interaction.search.state}, {interaction.search.district}
                      </div>
                      {interaction.search.neighborhood && (
                        <div className="text-sm text-gray-600">{interaction.search.neighborhood}</div>
                      )}
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Tipo de Propiedad</span>
                      <div className="font-medium text-gray-900">{interaction.search.property_type}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Rango de Precio</span>
                      <div className="font-medium text-gray-900">
                        {formatCurrency(interaction.search.minPrice)} - {formatCurrency(interaction.search.maxPrice)}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Calificación</span>
                      <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        interaction.search.qualification === 'HOT' ? 'bg-red-100 text-red-800' :
                        interaction.search.qualification === 'MODERATE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {interaction.search.qualification}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Método de Confirmación</span>
                      <div className="font-medium text-gray-900">{interaction.search.confirmation_method}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Calidad y Satisfacción */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-purple-600" />
                Calidad y Satisfacción
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CSAT */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">Encuesta de Satisfacción</span>
                    <div className="flex items-center space-x-2">
                      {interaction.quality.show_csat ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-xs text-green-600 font-medium">Enviada</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-gray-400" />
                          <span className="text-xs text-gray-500 font-medium">No enviada</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {interaction.quality.show_csat ? (
                    interaction.quality.csat ? (
                      <div>
                        <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getCSATColor(interaction.quality.csat)}`}>
                          {getCSATLabel(interaction.quality.csat)}
                        </div>
                        <div className="flex items-center mt-2">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < getCSATStars(interaction.quality.csat) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-yellow-600 font-medium">Enviada, esperando respuesta</span>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">No se envió encuesta a este usuario</span>
                    </div>
                  )}
                </div>

                {/* Escalamiento y Reclamos */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <span className="font-medium text-gray-900 block mb-3">Escalamiento y Reclamos</span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Solicitó agente humano</span>
                      {interaction.quality.human_request ? (
                        <CheckCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    
                    {interaction.quality.human_resquest_no_response !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Agente no respondió</span>
                        {interaction.quality.human_resquest_no_response ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    )}
                    
                    {interaction.quality.complaint && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                          <div>
                            <span className="text-sm font-medium text-red-800">Reclamo:</span>
                            <p className="text-sm text-red-700 mt-1">{interaction.quality.complaint}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Conversation Timeline */}
            {interaction.conversation && interaction.conversation.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-purple-600" />
                  Conversación
                  <span className="ml-2 text-sm text-gray-500">({interaction.conversation.length} mensajes)</span>
                </h4>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {interaction.conversation.map((message, index) => (
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
              </div>
            )}

            {/* Metadata Section */}
            {(() => {
              const contactFields = ['name', 'nombre', 'phone', 'telefono', 'phone_number', 'email'];
              const filteredMetadata = Object.entries(interaction.metadata || {}).filter(
                ([key]) => !contactFields.includes(key.toLowerCase())
              );
              
              return filteredMetadata.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Hash className="h-5 w-5 mr-2 text-gray-600" />
                    Metadata Adicional
                  </h4>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
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
                </div>
              );
            })()}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};