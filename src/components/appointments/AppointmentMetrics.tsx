import React from 'react';
import { Calendar, Eye, Phone, Clock, TrendingUp, Users } from 'lucide-react';
import { InteractionRecord } from '../../types';

interface AppointmentMetricsProps {
  appointments: InteractionRecord[];
  totalInteractions: number;
}

export const AppointmentMetrics: React.FC<AppointmentMetricsProps> = ({
  appointments,
  totalInteractions
}) => {
  const visitAppointments = appointments.filter(a => a.appointment?.type === 'VISIT');
  const phoneAppointments = appointments.filter(a => a.appointment?.type === 'PHONE_CALL');
  
  const sellAppointments = appointments.filter(a => a.operation_type === 'SELL');
  const rentAppointments = appointments.filter(a => a.operation_type === 'RENT');
  
  const propertyLeadAppointments = appointments.filter(a => a.lead_type === 'PROPERTY_LEAD');
  const searchLeadAppointments = appointments.filter(a => a.lead_type === 'SEARCH_LEAD');
  
  const totalValue = appointments
    .filter(a => a.original_property?.price?.amount)
    .reduce((sum, a) => sum + (a.original_property?.price?.amount || 0), 0);

  const avgTimeToAppointment = 2.3; // Simulado - días promedio
  const conversionRate = (appointments.length / totalInteractions) * 100;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total de Citas */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{appointments.length.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total de Citas</div>
            <div className="text-xs text-purple-600 font-medium">
              {conversionRate.toFixed(1)}% de conversión
            </div>
          </div>
        </div>
      </div>

      {/* Distribución por Tipo */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
            <Eye className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Distribución por Tipo</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Visitas</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900">{visitAppointments.length}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({((visitAppointments.length / appointments.length) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Llamadas</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900">{phoneAppointments.length}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({((phoneAppointments.length / appointments.length) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Valor Total */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(totalValue)}
            </div>
            <div className="text-sm text-gray-600">Valor Total de Citas</div>
            <div className="text-xs text-green-600 font-medium">
              Promedio: {formatCurrency(totalValue / (appointments.length || 1))}
            </div>
          </div>
        </div>
      </div>

      {/* Por Operación */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Por Tipo de Operación</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Ventas</span>
                <div className="text-right">
                  <span className="font-bold text-orange-600">{sellAppointments.length}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({((sellAppointments.length / appointments.length) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Rentas</span>
                <div className="text-right">
                  <span className="font-bold text-indigo-600">{rentAppointments.length}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({((rentAppointments.length / appointments.length) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Por Tipo de Lead */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Por Tipo de Lead</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Property</span>
                <div className="text-right">
                  <span className="font-bold text-blue-600">{propertyLeadAppointments.length}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({((propertyLeadAppointments.length / appointments.length) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Search</span>
                <div className="text-right">
                  <span className="font-bold text-green-600">{searchLeadAppointments.length}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({((searchLeadAppointments.length / appointments.length) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tiempo Promedio */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{avgTimeToAppointment}</div>
            <div className="text-sm text-gray-600">Días Promedio</div>
            <div className="text-xs text-indigo-600 font-medium">
              Hasta agendamiento
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};