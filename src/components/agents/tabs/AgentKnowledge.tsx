import React, { useState } from 'react';
import { Database, Plus, Trash2, Search, Tag, FileText, Edit3, Save } from 'lucide-react';
import { useAgentStore } from '../../../stores/useAgentStore';
import { KnowledgeItem, KNOWLEDGE_CATEGORIES } from '../../../types/agents';

export const AgentKnowledge: React.FC = () => {
  const { currentAgent, updateKnowledgeItem, addKnowledgeItem, removeKnowledgeItem, saveKnowledgeBase, loading } = useAgentStore();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!currentAgent) return null;

  const knowledgeBase = currentAgent.orchestration.knowledgeBase || [];

  const filteredKnowledge = knowledgeBase.filter(item => {
    const matchesCategory = !filterCategory || item.category === filterCategory;
    const matchesSearch = !searchTerm || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const handleUpdate = (itemId: string, field: string, value: any) => {
    updateKnowledgeItem(itemId, { [field]: value });
  };

  const handleTagsUpdate = (itemId: string, tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    updateKnowledgeItem(itemId, { tags });
  };

  const createNewKnowledgeItem = () => {
    const newItem: KnowledgeItem = {
      id: `kb_${Date.now()}`,
      title: 'Nuevo Artículo',
      content: '',
      category: 'faq',
      tags: [],
      relevanceScore: 0.5
    };
    addKnowledgeItem(newItem);
    setSelectedItem(newItem.id);
  };

  const handleSaveKnowledgeBase = async () => {
    if (currentAgent) {
      await saveKnowledgeBase(currentAgent.id);
    }
  };
  const getCategoryColor = (category: string) => {
    const colors = {
      properties: 'bg-blue-100 text-blue-800',
      services: 'bg-green-100 text-green-800',
      policies: 'bg-purple-100 text-purple-800',
      procedures: 'bg-orange-100 text-orange-800',
      faq: 'bg-yellow-100 text-yellow-800',
      legal: 'bg-red-100 text-red-800',
      pricing: 'bg-indigo-100 text-indigo-800',
      locations: 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-8">
      {/* Controles */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar en la base de conocimiento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por Categoría */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Todas las categorías</option>
            {Object.entries(KNOWLEDGE_CATEGORIES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSaveKnowledgeBase}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Guardando...' : 'Guardar Base'}
          </button>
          <button
            onClick={createNewKnowledgeItem}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Artículo
          </button>
        </div>
      </div>

      {/* Lista de Artículos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredKnowledge.map((item) => (
          <div
            key={item.id}
            className={`bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 cursor-pointer ${
              selectedItem === item.id ? 'ring-2 ring-purple-500 shadow-lg' : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 line-clamp-2">{item.title}</h4>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(item.category)}`}>
                  {KNOWLEDGE_CATEGORIES[item.category as keyof typeof KNOWLEDGE_CATEGORIES] || item.category}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-3">{item.content}</p>
              
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="text-xs text-gray-500">+{item.tags.length - 3} más</span>
                  )}
                </div>
              )}
            </div>

            {/* Contenido Expandido */}
            {selectedItem === item.id && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdate(item.id, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contenido</label>
                    <textarea
                      value={item.content}
                      onChange={(e) => handleUpdate(item.id, 'content', e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                      <select
                        value={item.category}
                        onChange={(e) => handleUpdate(item.id, 'category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {Object.entries(KNOWLEDGE_CATEGORIES).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relevancia ({item.relevanceScore || 0.5})
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={item.relevanceScore || 0.5}
                        onChange={(e) => handleUpdate(item.id, 'relevanceScore', parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Etiquetas (separadas por comas)
                    </label>
                    <input
                      type="text"
                      value={item.tags?.join(', ') || ''}
                      onChange={(e) => handleTagsUpdate(item.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="servicios, asesoría, legal, financiera"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        if (confirm('¿Estás seguro de que quieres eliminar este artículo?')) {
                          removeKnowledgeItem(item.id);
                          setSelectedItem(null);
                        }
                      }}
                      className="inline-flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar Artículo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Estado vacío */}
      {filteredKnowledge.length === 0 && knowledgeBase.length > 0 && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron artículos</h3>
          <p className="text-gray-500">Ajusta los filtros de búsqueda para ver más contenido.</p>
        </div>
      )}

      {knowledgeBase.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Base de conocimiento vacía</h3>
          <p className="text-gray-500 mb-6">
            Agrega artículos con información que tu asistente debe conocer para responder consultas.
          </p>
          <button
            onClick={createNewKnowledgeItem}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Crear Primer Artículo
          </button>
        </div>
      )}
    </div>
  );
};