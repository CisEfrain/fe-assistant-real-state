import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Eye,
  AlertTriangle,
  CheckCircle,
  Phone,
  MessageSquare,
  MessageCircle,
  Settings,
  Tag,
  Edit2,
  X,
  User
} from 'lucide-react';
import { OtherContactRecord } from '../../types';
import { format } from 'date-fns';
import { TagManager } from './TagManager';
import { useInteractionStore } from '../../stores/useInteractionStore';

interface OtherContactsTableProps {
  contacts: OtherContactRecord[];
  onContactSelect: (contact: OtherContactRecord) => void;
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

// Helper function to extract contact info from metadata
const extractContactInfo = (metadata: Record<string, unknown>) => {
  const name = String(metadata?.name || metadata?.nombre || 'Sin nombre');
  const phone = String(metadata?.phone || metadata?.telefono || metadata?.phone_number || 'Sin teléfono');
  const email = String(metadata?.email || 'Sin email');
  
  return { name, phone, email };
};

export const OtherContactsTable: React.FC<OtherContactsTableProps> = ({
  contacts,
  onContactSelect,
  currentPage,
  totalPages,
  total,
  onPageChange,
}) => {
  const [sortBy, setSortBy] = useState<'created_at' | 'channel'>('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [editingTagsContactId, setEditingTagsContactId] = useState<string | null>(null);
  const [localContacts, setLocalContacts] = useState<OtherContactRecord[]>(contacts);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { addContactTags, removeContactTags } = useInteractionStore();

  // Update local contacts when props change
  React.useEffect(() => {
    setLocalContacts(contacts);
  }, [contacts]);

  // Filter contacts by search term (name or phone)
  const filteredContacts = React.useMemo(() => {
    if (!searchTerm) return localContacts;
    
    return localContacts.filter(contact => {
      const { name, phone } = extractContactInfo(contact.metadata);
      return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             phone.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [localContacts, searchTerm]);

  const handleSort = (column: 'created_at' | 'channel') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('DESC');
    }
  };

  const truncateText = (text: string | null | undefined, maxLength: number): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getChannelBadge = (channel?: 'whatsapp' | 'call' | 'webchat' | 'widget_testing') => {
    if (channel === 'whatsapp') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <MessageCircle className="h-3 w-3 mr-1" />
          WhatsApp
        </span>
      );
    }
    if (channel === 'call') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Phone className="h-3 w-3 mr-1" />
          Llamada
        </span>
      );
    }
    if (channel === 'webchat') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <MessageSquare className="h-3 w-3 mr-1" />
          Web Chat
        </span>
      );
    }
    if (channel === 'widget_testing') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <Settings className="h-3 w-3 mr-1" />
          Widget Testing
        </span>
      );
    }
    // Default when channel is not provided
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <MessageSquare className="h-3 w-3 mr-1" />
        Widget Testing
      </span>
    );
  };

  const getComplaintBadge = (hasComplaint: boolean) => {
    if (hasComplaint) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Sí
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        No
      </span>
    );
  };

  const handleTagsUpdate = (contactId: string, newTags: string[]) => {
    setLocalContacts(localContacts.map(contact =>
      contact.id === contactId ? { ...contact, tags: newTags } : contact
    ));
  };

  const handleCloseTagEditor = () => {
    setEditingTagsContactId(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Lista de Contactos ({total.toLocaleString()})
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Página {currentPage} de {totalPages}
            </p>
          </div>
          <div className="flex-1 max-w-md ml-4">
            <input
              type="text"
              placeholder="Buscar por nombre o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teléfono
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('channel')}
              >
                Canal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tiene Queja
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comentario
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('created_at')}
              >
                Fecha
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <MessageSquare className="h-12 w-12 text-gray-300" />
                    <p className="text-gray-500 font-medium">No se encontraron contactos</p>
                    <p className="text-sm text-gray-400">Intenta ajustar los filtros de búsqueda</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact) => {
                const { name, phone } = extractContactInfo(contact.metadata);
                return (
                  <React.Fragment key={contact.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className={`text-sm ${name === 'Sin nombre' ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                            {name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className={`text-sm font-mono ${phone === 'Sin teléfono' ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                            {phone}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getChannelBadge(contact.channel)}
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getComplaintBadge(contact.has_complaint)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {contact.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {contact.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {truncateText(tag, 15)}
                              </span>
                            ))}
                            {contact.tags.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{contact.tags.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Sin tags</span>
                        )}
                        <button
                          onClick={() => setEditingTagsContactId(contact.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar tags"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {truncateText(contact.additional_comment ?? '', 50)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(contact.created_at), 'dd/MM/yyyy')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(contact.created_at), 'HH:mm')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => onContactSelect(contact)}
                        className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm font-medium rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalle
                      </button>
                    </td>
                    </tr>
                    {editingTagsContactId === contact.id && (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 bg-gray-50 border-t border-b border-gray-200">
                          <div className="max-w-2xl">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold text-gray-900">Editar Tags</h4>
                              <button
                                onClick={handleCloseTagEditor}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <TagManager
                              contactId={contact.id}
                              currentTags={contact.tags}
                              onTagsUpdate={handleTagsUpdate}
                              onAddTags={addContactTags}
                              onRemoveTags={removeContactTags}
                              compact={true}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando página <span className="font-medium">{currentPage}</span> de{' '}
              <span className="font-medium">{totalPages}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
                          : 'border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
