import React from 'react';
import { Eye, Phone, Clock, User, Home, DollarSign, ExternalLink } from 'lucide-react';
import { InteractionRecord } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useInteractionStore } from '../../stores/useInteractionStore';
import { extractContactFromMetadata, findLeadByContact } from '../../utils/leadMatching';

interface AppointmentListProps {
  appointments: InteractionRecord[];
  selectedDate?: Date;
  leads?: any[];
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  selectedDate,
  leads = []
}) => {
  const { navigateToLead } = useInteractionStore();

  const handleViewLead = (appointment: InteractionRecord) => {
    const contact = extractContactFromMetadata(appointment.metadata);
    const lead = findLeadByContact(leads, contact.phone, contact.email);
    if (lead && lead.id) {
      navigateToLead(lead.id);
    }
  };
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getAppointmentIcon = (type: string) => {
    switch (type) {
      case 'VISIT': return <Eye className="h-5 w-5 text-green-600" />;
      case 'PHONE_CALL': return <Phone className="h-5 w-5 text-blue-600" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getAppointmentColor = (type: string) => {
    switch (type) {
      case 'VISIT': return 'border-l-green-500 bg-green-50';
      case 'PHONE_CALL': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getLeadTypeColor = (leadType: string) => {
    switch (leadType) {
      case 'PROPERTY_LEAD': return 'bg-blue-100 text-blue-800';
      case 'SEARCH_LEAD': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeadTypeLabel = (leadType: string) => {
    switch (leadType) {
      case 'PROPERTY_LEAD': return 'Lead de propiedad';
      case 'SEARCH_LEAD': return 'Lead de búsqueda';
      default: return leadType;
    }
  };

  const getOperationTypeColor = (operationType: string) => {
    return operationType === 'SELL' 
      ? 'bg-orange-100 text-orange-800' 
      : 'bg-indigo-100 text-indigo-800';
  };

  const filteredAppointments = selectedDate
    ? appointments.filter(appointment => {
        if (!appointment.appointment?.date) return false;
        const appointmentDate = new Date(appointment.appointment.date);
        return appointmentDate.toDateString() === selectedDate.toDateString();
      })
    : appointments;

  const sortedAppointments = filteredAppointments.sort((a, b) => {
    if (!a.appointment?.date || !b.appointment?.date) return 0;
    return new Date(a.appointment.date).getTime() - new Date(b.appointment.date).getTime();
  });

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {selectedDate 
                ? `Citas del ${format(selectedDate, 'dd/MM/yyyy', { locale: es })}`
                : 'Todas las Citas'
              }
            </h3>
            <p className="text-indigo-100 text-sm">
              {sortedAppointments.length} cita{sortedAppointments.length !== 1 ? 's' : ''} programada{sortedAppointments.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {sortedAppointments.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {selectedDate 
                ? 'No hay citas programadas para esta fecha'
                : 'No hay citas programadas'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedAppointments.map((appointment) => {
              const contact = extractContactFromMetadata(appointment.metadata);
              const leadInCRM = findLeadByContact(leads, contact.phone, contact.email);

              return (
                <div
                  key={appointment.phonecall_id}
                  className={`p-4 border-l-4 ${getAppointmentColor(appointment.appointment?.type || '')}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getAppointmentIcon(appointment.appointment?.type || '')}
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {appointment.appointment?.title || `Cita #${appointment.phonecall_id}`}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {appointment.appointment?.date &&
                            format(new Date(appointment.appointment.date), 'HH:mm', { locale: es })
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col gap-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLeadTypeColor(appointment.lead_type)}`}>
                        {getLeadTypeLabel(appointment.lead_type)}
                      </span>
                      {leadInCRM && (
                        <button
                          onClick={() => handleViewLead(appointment)}
                          className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs font-medium transition-colors"
                          title="Ver lead en CRM"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Ver Lead
                        </button>
                      )}
                    </div>
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">ID:</span>
                    <span className="font-medium">#{appointment.phonecall_id}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOperationTypeColor(appointment.operation_type)}`}>
                      {appointment.operation_type === 'SELL' ? 'Venta' : 'Renta'}
                    </span>
                  </div>

                  {appointment.original_property && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Home className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium">{appointment.original_property.property_type}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Valor:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(appointment.original_property.price.amount)}
                        </span>
                      </div>
                    </>
                  )}

                  {appointment.search && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Home className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Buscando:</span>
                        <span className="font-medium">{appointment.search.property_type}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Rango:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(appointment.search.minPrice)} - {formatCurrency(appointment.search.maxPrice)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {appointment.evaluation?.qualification && (
                  <div className="mt-3 flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Calificación:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      appointment.evaluation.qualification === 'HOT' ? 'bg-red-100 text-red-800' :
                      appointment.evaluation.qualification === 'MODERATE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.evaluation.qualification}
                    </span>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};