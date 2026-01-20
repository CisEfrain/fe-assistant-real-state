import React, { useState } from 'react';
import { Tag, X, Plus, Loader2, AlertCircle } from 'lucide-react';

interface TagManagerProps {
  contactId: string;
  currentTags: string[];
  onTagsUpdate: (contactId: string, newTags: string[]) => void;
  onAddTags: (contactId: string, tags: string[]) => Promise<void>;
  onRemoveTags: (contactId: string, tags: string[]) => Promise<void>;
  compact?: boolean; // For use in table vs modal
}

export const TagManager: React.FC<TagManagerProps> = ({
  contactId,
  currentTags,
  onTagsUpdate,
  onAddTags,
  onRemoveTags,
  compact = false,
}) => {
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingTags, setPendingTags] = useState<string[]>([]);

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    
    // Validation
    if (!trimmedTag) {
      setError('El tag no puede estar vacío');
      return;
    }

    if (trimmedTag.length < 2) {
      setError('El tag debe tener al menos 2 caracteres');
      return;
    }

    if (trimmedTag.length > 30) {
      setError('El tag no puede tener más de 30 caracteres');
      return;
    }

    if (currentTags.includes(trimmedTag) || pendingTags.includes(trimmedTag)) {
      setError('Este tag ya existe');
      return;
    }

    // Validate special characters
    if (!/^[a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s_-]+$/.test(trimmedTag)) {
      setError('El tag solo puede contener letras, números, espacios, guiones y guiones bajos');
      return;
    }

    setPendingTags([...pendingTags, trimmedTag]);
    setNewTag('');
    setError(null);
  };

  const handleRemovePendingTag = (tag: string) => {
    setPendingTags(pendingTags.filter(t => t !== tag));
  };

  const handleSaveTags = async () => {
    if (pendingTags.length === 0) {
      setError('No hay tags para agregar');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onAddTags(contactId, pendingTags);
      onTagsUpdate(contactId, [...currentTags, ...pendingTags]);
      setPendingTags([]);
    } catch (err) {
      setError('Error al agregar tags. Intente nuevamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    setLoading(true);
    setError(null);

    try {
      await onRemoveTags(contactId, [tag]);
      onTagsUpdate(contactId, currentTags.filter(t => t !== tag));
    } catch (err) {
      setError('Error al eliminar tag. Intente nuevamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className={`${compact ? 'space-y-2' : 'space-y-4'}`}>
      {/* Current Tags */}
      <div>
        <label className={`block font-medium text-gray-700 mb-2 flex items-center space-x-2 ${compact ? 'text-xs' : 'text-sm'}`}>
          <Tag className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
          <span>Tags Actuales ({currentTags.length})</span>
        </label>
        
        {currentTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {currentTags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center bg-blue-100 text-blue-800 rounded-full font-medium ${
                  compact ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1'
                }`}
              >
                <Tag className={`mr-1 ${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  disabled={loading}
                  className="ml-1.5 hover:bg-blue-200 rounded-full p-0.5 transition-colors disabled:opacity-50"
                  title="Eliminar tag"
                >
                  <X className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className={`text-gray-500 italic ${compact ? 'text-xs' : 'text-sm'}`}>
            Sin tags
          </p>
        )}
      </div>

      {/* Pending Tags */}
      {pendingTags.length > 0 && (
        <div>
          <label className={`block font-medium text-gray-700 mb-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            Tags Pendientes ({pendingTags.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {pendingTags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center bg-green-100 text-green-800 rounded-full font-medium ${
                  compact ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1'
                }`}
              >
                <Plus className={`mr-1 ${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                {tag}
                <button
                  onClick={() => handleRemovePendingTag(tag)}
                  className="ml-1.5 hover:bg-green-200 rounded-full p-0.5 transition-colors"
                  title="Quitar de pendientes"
                >
                  <X className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add New Tag */}
      <div>
        <label className={`block font-medium text-gray-700 mb-2 ${compact ? 'text-xs' : 'text-sm'}`}>
          Agregar Nuevo Tag
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un tag..."
            disabled={loading}
            className={`flex-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
              compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'
            }`}
            maxLength={30}
          />
          <button
            onClick={handleAddTag}
            disabled={loading || !newTag.trim()}
            className={`bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
              compact ? 'px-2 py-1' : 'px-4 py-2'
            }`}
            title="Agregar a pendientes"
          >
            <Plus className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
            {!compact && <span className="ml-1">Agregar</span>}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className={`text-red-800 ${compact ? 'text-xs' : 'text-sm'}`}>{error}</p>
        </div>
      )}

      {/* Save Button */}
      {pendingTags.length > 0 && (
        <button
          onClick={handleSaveTags}
          disabled={loading}
          className={`w-full bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
            compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className={`animate-spin mr-2 ${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
              Guardando...
            </>
          ) : (
            <>
              <Tag className={`mr-2 ${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
              Guardar {pendingTags.length} Tag{pendingTags.length > 1 ? 's' : ''}
            </>
          )}
        </button>
      )}
    </div>
  );
};

