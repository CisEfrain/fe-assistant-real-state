import React, { useState, useMemo, useEffect } from 'react';
import {
  Phone,
  MessageCircle,
  MessageSquare,
  Settings,
  User,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Star,
  Download,
  ExternalLink
} from 'lucide-react';
import { InteractionRecord } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { interactionAPI } from '../../services/api';
import { useInteractionStore } from '../../stores/useInteractionStore';
import { extractContactFromMetadata, findLeadByContact } from '../../utils/leadMatching';

interface InteractionsTableProps {
  interactions: InteractionRecord[];
  onInteractionSelect: (interaction: InteractionRecord) => void;
  leads?: any[];
}

export const InteractionsTable: React.FC<InteractionsTableProps> = ({ interactions, onInteractionSelect, leads = [] }) => {
  const { navigateToLead } = useInteractionStore();

  const handleViewInCRM = (interaction: InteractionRecord) => {
    const contact = extractContactFromMetadata(interaction.metadata);
    const lead = findLeadByContact(leads, contact.phone, contact.email);

    if (lead && lead.id) {
      navigateToLead(lead.id);
    }
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);
  const [sortField, setSortField] = useState<keyof InteractionRecord>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({
    channel: '',
    leadType: '',
    operationType: '',
    appointmentType: '',
    brokerStatus: '',
    hasCsat: '',
    hasComplaint: '',
    hasEscalation: ''
  });

  useEffect(() => {
    const savedFilter = localStorage.getItem('interactions_filter');
    if (savedFilter) {
      try {
        const { phone, email } = JSON.parse(savedFilter);
        if (phone || email) {
          setSearchTerm(phone || email || '');
          localStorage.removeItem('interactions_filter');
        }
      } catch (error) {
        console.error('Error parsing interaction filter:', error);
        localStorage.removeItem('interactions_filter');
      }
    }
  }, []);

  // Filtrar y ordenar datos
  const filteredAndSortedInteractions = useMemo(() => {
    const filtered = (interactions || []).filter(interaction => {
      const { name, phone } = extractContactFromMetadata(interaction.metadata);
      const contactName = name || 'Sin nombre';
      const contactPhone = phone || 'Sin teléfono';
      const matchesSearch = searchTerm === '' ||
        contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contactPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interaction.source.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilters = 
        (filters.channel === '' || interaction.channel === filters.channel) &&
        (filters.leadType === '' || interaction.lead_type === filters.leadType) &&
        (filters.operationType === '' || interaction.operation_type === filters.operationType) &&
        (filters.appointmentType === '' || interaction.appointment?.type === filters.appointmentType) &&
        (filters.brokerStatus === '' || interaction.broker_status === filters.brokerStatus) &&
        (filters.hasCsat === '' || (filters.hasCsat === 'true' ? interaction.quality.csat : !interaction.quality.csat)) &&
        (filters.hasComplaint === '' || (filters.hasComplaint === 'true' ? interaction.quality.complaint : !interaction.quality.complaint)) &&
        (filters.hasEscalation === '' || (filters.hasEscalation === 'true' ? interaction.quality.human_request : !interaction.quality.human_request));

      return matchesSearch && matchesFilters;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      // Manejar campos anidados
      if (sortField === 'created_at') {
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
      } else {
        // Convertir valores a string o number para comparación
        const aRaw = a[sortField];
        const bRaw = b[sortField];
        aValue = typeof aRaw === 'string' || typeof aRaw === 'number' ? aRaw : String(aRaw);
        bValue = typeof bRaw === 'string' || typeof bRaw === 'number' ? bRaw : String(bRaw);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [interactions, searchTerm, filters, sortField, sortDirection]);

  // Paginación
  const totalPages = Math.ceil(filteredAndSortedInteractions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedInteractions = filteredAndSortedInteractions.slice(startIndex, startIndex + pageSize);

  const handleSort = (field: keyof InteractionRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
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

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageCircle className="h-4 w-4 text-green-600" />;
      case 'call':
        return <Phone className="h-4 w-4 text-blue-600" />;
      case 'webchat':
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      case 'widget_testing':
        return <Settings className="h-4 w-4 text-orange-600" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getLeadTypeColor = (leadType: string) => {
    switch (leadType) {
      case 'PROPERTY_LEAD': return 'bg-blue-100 text-blue-800';
      case 'SEARCH_LEAD': return 'bg-green-100 text-green-800';
      case 'LOCATION_LEAD': return 'bg-purple-100 text-purple-800';
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

  const getAppointmentIcon = (appointmentType?: string) => {
    switch (appointmentType) {
      case 'VISIT': return <Eye className="h-4 w-4 text-green-600" />;
      case 'PHONE_CALL': return <Phone className="h-4 w-4 text-blue-600" />;
      case 'NOT_SCHEDULED': return <XCircle className="h-4 w-4 text-gray-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleExportCSV = () => {
    setExporting(true);
    try {
      interactionAPI.exportInteractionsCSV(filteredAndSortedInteractions);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error al exportar CSV. Intente nuevamente.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controles de búsqueda y filtros */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="space-y-4 mb-6">
          {/* Primera fila: Búsqueda y Exportar */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, teléfono o fuente..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={exporting || filteredAndSortedInteractions.length === 0}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              title="Exportar datos filtrados a CSV"
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting ? 'Exportando...' : 'Exportar CSV'}
            </button>
          </div>

          {/* Segunda fila: Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            <select
              value={filters.channel}
              onChange={(e) => {
                setFilters({...filters, channel: e.target.value});
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              <option value="">Todos los canales</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="webchat">Chat Web</option>
              <option value="widget_testing">Prueba de Widget</option>
            </select>

            <select
              value={filters.leadType}
              onChange={(e) => {
                setFilters({...filters, leadType: e.target.value});
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              <option value="">Todos los tipos</option>
              <option value="PROPERTY_LEAD">Lead de Propiedad</option>
              <option value="SEARCH_LEAD">Lead de Búsqueda</option>
            </select>

            <select
              value={filters.operationType}
              onChange={(e) => {
                setFilters({...filters, operationType: e.target.value});
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              <option value="">Todas las operaciones</option>
              <option value="SELL">Venta</option>
              <option value="RENT">Renta</option>
            </select>

            <select
              value={filters.appointmentType}
              onChange={(e) => {
                setFilters({ ...filters, appointmentType: e.target.value });
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              <option value="">Todos los tipos de cita</option>
              <option value="VISIT">Visita</option>
              <option value="PHONE_CALL">Llamada</option>
              <option value="NOT_SCHEDULED">Sin cita</option>
            </select>

            <select
              value={filters.hasEscalation}
              onChange={(e) => {
                setFilters({ ...filters, hasEscalation: e.target.value });
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              <option value="">Escalamiento (todos)</option>
              <option value="true">Escaladas a humano</option>
              <option value="false">No escaladas</option>
            </select>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900">{filteredAndSortedInteractions.length}</div>
            <div className="text-gray-500">Interacciones filtradas</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-600">
              {filteredAndSortedInteractions.filter(c => c.appointment?.type && c.appointment.type !== 'NOT_SCHEDULED').length}
            </div>
            <div className="text-gray-500">Con cita</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">
              {filteredAndSortedInteractions.filter(c => c.quality.csat).length}
            </div>
            <div className="text-gray-500">Con Encuesta</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-red-600">
              {filteredAndSortedInteractions.filter(c => c.quality.human_request).length}
            </div>
            <div className="text-gray-500">Escalados</div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Canal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operación
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Fecha</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cita
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Encuesta de Satisfacción
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CRM
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedInteractions.map((interaction) => {
                const contact = extractContactFromMetadata(interaction.metadata);
                const leadInCRM = findLeadByContact(leads, contact.phone, contact.email);
                const displayName = contact.name || 'Sin nombre';
                const displayPhone = contact.phone || 'Sin teléfono';

                return (
                  <tr key={interaction.phonecall_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className={`text-sm ${!contact.name ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                          {displayName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className={`text-sm font-mono ${!contact.phone ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                          {displayPhone}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center">
                        {getChannelIcon(interaction.channel)}
                      </div>
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLeadTypeColor(interaction.lead_type)}`}>
                      {getLeadTypeLabel(interaction.lead_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOperationTypeColor(interaction.operation_type)}`}>
                      {interaction.operation_type === 'SELL' ? 'Venta' : 'Renta'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(interaction.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center">
                      {getAppointmentIcon(interaction.appointment?.type)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center space-y-1">
                      {interaction.quality.show_csat ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {interaction.quality.csat ? (
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs font-medium text-gray-700">{interaction.quality.csat}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-yellow-600">Sin respuesta</span>
                          )}
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500">No enviada</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    {interaction.original_property?.price?.amount ? (
                      <div className="flex items-center justify-center space-x-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-gray-900">
                          {formatCurrency(interaction.original_property.price.amount)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {leadInCRM ? (
                      <button
                        onClick={() => handleViewInCRM(interaction)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        title="Ver lead en CRM"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Ver en CRM
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">No en CRM</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => onInteractionSelect(interaction)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </button>
                  </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min(startIndex + pageSize, filteredAndSortedInteractions.length)}
                </span>{' '}
                de <span className="font-medium">{filteredAndSortedInteractions.length}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Números de página */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};