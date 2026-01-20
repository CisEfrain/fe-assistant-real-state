import React, { useState, useEffect } from 'react';
import { MessageSquare, Filter, Phone, AlertTriangle, Download, X } from 'lucide-react';
import { useInteractionStore } from '../../stores/useInteractionStore';
import { OtherContactFilters } from '../../types';
import { OtherContactsTable } from './OtherContactsTable';
import { OtherContactDetailModal } from './OtherContactDetailModal';
import { OtherContactRecord } from '../../types';

export const OtherContactsDetail: React.FC = () => {
  const { 
    otherContacts,
    otherContactsTotal,
    otherContactsPage,
    otherContactsLimit,
    otherContactsTotalPages,
    dateFilters,
    setDateFilters,
    setPeriodDays,
    loading, 
    fetchOtherContacts,
    setOtherContactsPage,
    exportContactsToCSV
  } = useInteractionStore();

  const [selectedContact, setSelectedContact] = useState<OtherContactRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Local filters
  const [channelFilter, setChannelFilter] = useState<'whatsapp' | 'webchat' | 'widget_testing' | ''>('');
  const [complaintFilter, setComplaintFilter] = useState<boolean | ''>('');
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Export state
  const [exporting, setExporting] = useState(false);

  // Load data with filters
  useEffect(() => {
    const loadData = async () => {
      const filters: OtherContactFilters = {
        start_date: dateFilters.start_date,
        end_date: dateFilters.end_date,
        page: otherContactsPage,
        limit: otherContactsLimit,
        sort_by: 'created_at',
        sort_order: 'DESC',
      };

      if (channelFilter) {
        filters.channel = channelFilter;
      }

      if (complaintFilter !== '') {
        filters.has_complaint = complaintFilter;
      }

      if (tagsFilter.length > 0) {
        filters.tags = tagsFilter;
      }

      try {
        await fetchOtherContacts(filters);
      } catch (err) {
        console.warn('API not available, using fallback', err);
      }
    };
    
    loadData();
  }, [dateFilters, otherContactsPage, channelFilter, complaintFilter, tagsFilter, fetchOtherContacts, otherContactsLimit]);

  const handleContactSelect = (contact: OtherContactRecord) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContact(null);
  };

  const handlePageChange = (page: number) => {
    setOtherContactsPage(page);
  };

  const handleAddTagFilter = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tagsFilter.includes(trimmedTag)) {
      setTagsFilter([...tagsFilter, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTagFilter = (tag: string) => {
    setTagsFilter(tagsFilter.filter(t => t !== tag));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTagFilter();
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const filters: OtherContactFilters = {
        start_date: dateFilters.start_date,
        end_date: dateFilters.end_date,
        channel: channelFilter || undefined,
        has_complaint: complaintFilter !== '' ? complaintFilter : undefined,
        tags: tagsFilter.length > 0 ? tagsFilter : undefined,
      };
      await exportContactsToCSV(filters);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error al exportar CSV. Intente nuevamente.');
    } finally {
      setExporting(false);
    }
  };

  // Calculate statistics
  const contactsWithComplaint = otherContacts.filter(c => c.has_complaint).length;
  const whatsappContacts = otherContacts.filter(c => c.channel === 'whatsapp').length;
  
  // Calculate average session duration
  const avgDuration = otherContacts.reduce((sum, contact) => {
    const duration = contact.metadata?.session_duration_seconds || 0;
    return sum + duration;
  }, 0) / (otherContacts.length || 1);

  return (
    <div className="space-y-8">
      {/* Period Selector */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Período de Análisis</h3>
            <p className="text-sm text-gray-600">Selecciona el período y filtros para los contactos</p>
          </div>
          
          <div className="flex items-center space-x-4 flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                <input
                  type="date"
                  value={dateFilters.start_date}
                  onChange={(e) => setDateFilters({ ...dateFilters, start_date: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                <input
                  type="date"
                  value={dateFilters.end_date}
                  onChange={(e) => setDateFilters({ ...dateFilters, end_date: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setPeriodDays(days)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={exporting || loading}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Canal</label>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value as 'whatsapp' | 'webchat' | 'widget_testing' | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              <option value="">Todos los canales</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="webchat">Web Chat</option>
              <option value="widget_testing">Widget Testing</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiene Queja</label>
            <select
              value={complaintFilter === '' ? '' : complaintFilter ? 'true' : 'false'}
              onChange={(e) => setComplaintFilter(e.target.value === '' ? '' : e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="true">Con queja</option>
              <option value="false">Sin queja</option>
            </select>
          </div>
        </div>

        {/* Tags Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Tags (OR)</label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagInputKeyPress}
              placeholder="Escribe un tag y presiona Enter..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
            <button
              onClick={handleAddTagFilter}
              disabled={!tagInput.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Agregar
            </button>
          </div>
          
          {tagsFilter.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tagsFilter.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTagFilter(tag)}
                    className="ml-2 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Los contactos que tengan al menos uno de estos tags serán mostrados
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{otherContactsTotal.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total de Contactos</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{contactsWithComplaint.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Con Queja</div>
              <div className="text-xs text-red-600 font-medium">
                {otherContactsTotal > 0 ? ((contactsWithComplaint / otherContactsTotal) * 100).toFixed(1) : 0}% del total
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{whatsappContacts.toLocaleString()}</div>
              <div className="text-sm text-gray-600">WhatsApp</div>
              <div className="text-xs text-green-600 font-medium">
                {otherContacts.length > 0 ? ((whatsappContacts / otherContacts.length) * 100).toFixed(1) : 0}% del total
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Additional Stats */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas Adicionales</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {Math.floor(avgDuration / 60)}m {Math.floor(avgDuration % 60)}s
            </div>
            <div className="text-sm text-gray-600">Duración Promedio</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {otherContacts.length.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">En Página Actual</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {otherContactsTotalPages}
            </div>
            <div className="text-sm text-gray-600">Páginas Totales</div>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando contactos...</p>
        </div>
      ) : (
        <OtherContactsTable
          contacts={otherContacts}
          onContactSelect={handleContactSelect}
          currentPage={otherContactsPage}
          totalPages={otherContactsTotalPages}
          total={otherContactsTotal}
          onPageChange={handlePageChange}
        />
      )}

      {/* Modal */}
      {selectedContact && (
        <OtherContactDetailModal
          contact={selectedContact}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};
