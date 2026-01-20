import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Home,
  Search as SearchIcon,
  Calendar,
  Clock,
  Tag,
  Edit,
  Trash2,
  Plus,
  MessageCircle,
  Star,
  AlertCircle
} from 'lucide-react';
import { Lead } from '../../types/leads';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'activities' | 'notes'>('details');

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency === 'MXN' ? 'MXN' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      NEW: 'bg-blue-100 text-blue-800',
      CONTACTED: 'bg-purple-100 text-purple-800',
      QUALIFIED: 'bg-green-100 text-green-800',
      APPOINTMENT_SCHEDULED: 'bg-orange-100 text-orange-800',
      VIEWED_PROPERTY: 'bg-indigo-100 text-indigo-800',
      NEGOTIATING: 'bg-yellow-100 text-yellow-800',
      WON: 'bg-emerald-100 text-emerald-800',
      LOST: 'bg-gray-100 text-gray-800'
    };
    const labels: Record<string, string> = {
      NEW: 'Nuevo',
      CONTACTED: 'Contactado',
      QUALIFIED: 'Calificado',
      APPOINTMENT_SCHEDULED: 'Cita Agendada',
      VIEWED_PROPERTY: 'Visitó Propiedad',
      NEGOTIATING: 'Negociando',
      WON: 'Ganado',
      LOST: 'Perdido'
    };
    return { badge: badges[status] || badges.NEW, label: labels[status] || status };
  };

  const statusInfo = getStatusBadge(lead.status);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">{lead.contact.name}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.badge}`}>
              {statusInfo.label}
            </span>
            {lead.tags && lead.tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Editar">
              <Edit className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Eliminar">
              <Trash2 className="h-5 w-5 text-red-600" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Detalles
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'activities'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Actividades
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'notes'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Notas
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Información de Contacto</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a href={`tel:${lead.contact.phone}`} className="text-orange-600 hover:underline">
                          {lead.contact.phone}
                        </a>
                      </div>
                      {lead.contact.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <a href={`mailto:${lead.contact.email}`} className="text-orange-600 hover:underline">
                            {lead.contact.email}
                          </a>
                        </div>
                      )}
                      {lead.contact.whatsapp && (
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-gray-400" />
                          <a
                            href={`https://wa.me/${lead.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-600 hover:underline"
                          >
                            {lead.contact.whatsapp}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Tipo de Lead</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {lead.leadType === 'PROPERTY_LEAD' ? (
                          <>
                            <Home className="h-5 w-5 text-gray-400" />
                            <span className="text-gray-700">Lead de Propiedad</span>
                          </>
                        ) : (
                          <>
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                            <span className="text-gray-700">Lead de Búsqueda</span>
                          </>
                        )}
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          lead.operationType === 'SELL'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {lead.operationType === 'SELL' ? 'Venta' : 'Renta'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {lead.property && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Propiedad de Interés</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <div className="font-medium">{lead.property.location?.neighborhood}</div>
                            <div className="text-gray-600">
                              {lead.property.location?.district}, {lead.property.location?.city}
                            </div>
                          </div>
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {formatCurrency(lead.property.price.amount, lead.property.price.currency)}
                        </div>
                        <div className="text-gray-600">
                          Tipo: {lead.property.propertyType}
                        </div>
                      </div>
                    </div>
                  )}

                  {lead.search && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Búsqueda</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <div className="font-medium">{lead.search.neighborhood}</div>
                            <div className="text-gray-600">
                              {lead.search.district}, {lead.search.state}
                            </div>
                          </div>
                        </div>
                        <div className="text-gray-900">
                          Rango: {formatCurrency(lead.search.minPrice, 'MXN')} - {formatCurrency(lead.search.maxPrice, 'MXN')}
                        </div>
                        <div className="text-gray-600">
                          Tipo: {lead.search.propertyType}
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            lead.search.qualification === 'Alta'
                              ? 'bg-green-100 text-green-800'
                              : lead.search.qualification === 'Media'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            Calificación: {lead.search.qualification}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {lead.appointment && lead.appointment.type !== 'NOT_SCHEDULED' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Cita Agendada</h3>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-800">
                            {lead.appointment.type === 'VISIT' ? 'Visita a Propiedad' : 'Llamada Telefónica'}
                          </span>
                        </div>
                        {lead.appointment.date && (
                          <div className="text-sm text-green-700 mb-2">
                            {format(new Date(lead.appointment.date), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                          </div>
                        )}
                        {lead.appointment.title && (
                          <div className="text-sm text-gray-700 mb-2">
                            {lead.appointment.title}
                          </div>
                        )}
                        {lead.appointment.notes && (
                          <div className="text-sm text-gray-600 bg-white p-2 rounded">
                            {lead.appointment.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {lead.quality && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Calidad</h3>
                      <div className="space-y-2">
                        {lead.quality.csat && (
                          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                            <span className="text-sm text-gray-700">CSAT</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                              <span className="font-bold text-gray-900">{lead.quality.csat}/5</span>
                            </div>
                          </div>
                        )}
                        {lead.quality.complaint && (
                          <div className="flex items-center gap-2 bg-red-50 p-3 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <span className="text-sm text-red-800">Tiene queja registrada</span>
                          </div>
                        )}
                        {lead.quality.humanRequest && (
                          <div className="flex items-center gap-2 bg-yellow-50 p-3 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                            <span className="text-sm text-yellow-800">Solicitó escalación humana</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Sistema</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID Conversación:</span>
                        <span className="font-medium">{lead.phonecallId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fuente:</span>
                        <span className="font-medium capitalize">{lead.source}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Creado:</span>
                        <span className="font-medium">
                          {format(new Date(lead.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Actualizado:</span>
                        <span className="font-medium">
                          {format(new Date(lead.lastUpdated), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </span>
                      </div>
                      {lead.lastContactedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Último contacto:</span>
                          <span className="font-medium">
                            {format(new Date(lead.lastContactedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Actividades</h3>
                <button className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm">
                  <Plus className="h-4 w-4" />
                  Nueva Actividad
                </button>
              </div>

              {lead.activities && lead.activities.length > 0 ? (
                <div className="space-y-3">
                  {lead.activities.map(activity => (
                    <div key={activity.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{activity.description}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {format(new Date(activity.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                            {activity.createdBy && ` - ${activity.createdBy}`}
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-600">
                          {activity.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay actividades registradas
                  </h3>
                  <p className="text-gray-500">
                    Las actividades aparecerán aquí cuando se registren
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Notas Internas</h3>
                <button className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm">
                  <Plus className="h-4 w-4" />
                  Agregar Nota
                </button>
              </div>

              {lead.notes ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-gray-700">{lead.notes}</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay notas
                  </h3>
                  <p className="text-gray-500">
                    Agrega notas para recordar detalles importantes
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
