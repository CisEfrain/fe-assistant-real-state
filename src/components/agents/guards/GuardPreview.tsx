import React, { useState } from 'react';
import { Copy, Edit3, Check, X } from 'lucide-react';
import { GuardExpression } from '../../../types/agents';

interface GuardPreviewProps {
  guard: GuardExpression | undefined;
  onChange: (guard: GuardExpression | undefined) => void;
}

export const GuardPreview: React.FC<GuardPreviewProps> = ({ guard, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const jsonString = JSON.stringify(guard, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleStartEdit = () => {
    setEditValue(jsonString);
    setIsEditing(true);
    setParseError(null);
  };

  const handleSaveEdit = () => {
    try {
      const parsed = JSON.parse(editValue);
      onChange(parsed);
      setIsEditing(false);
      setParseError(null);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Error al parsear JSON');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValue('');
    setParseError(null);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-100 px-4 py-2 flex items-center justify-between border-b border-gray-300">
        <span className="text-sm font-medium text-gray-700">Vista Previa (JSON)</span>
        <div className="flex items-center space-x-2">
          {!isEditing && (
            <>
              <button
                onClick={handleCopy}
                className="inline-flex items-center px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                title="Copiar JSON"
              >
                {copySuccess ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </>
                )}
              </button>
              <button
                onClick={handleStartEdit}
                className="inline-flex items-center px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                title="Editar JSON directamente"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Editar
              </button>
            </>
          )}
          {isEditing && (
            <>
              <button
                onClick={handleSaveEdit}
                className="inline-flex items-center px-2 py-1 text-xs text-green-600 hover:text-green-900 hover:bg-green-100 rounded transition-colors"
              >
                <Check className="h-3 w-3 mr-1" />
                Guardar
              </button>
              <button
                onClick={handleCancelEdit}
                className="inline-flex items-center px-2 py-1 text-xs text-red-600 hover:text-red-900 hover:bg-red-100 rounded transition-colors"
              >
                <X className="h-3 w-3 mr-1" />
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-50">
        {isEditing ? (
          <div>
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full p-4 font-mono text-sm bg-white border-0 focus:ring-0 resize-none"
              rows={15}
              spellCheck={false}
            />
            {parseError && (
              <div className="px-4 py-2 bg-red-50 border-t border-red-200">
                <p className="text-xs text-red-700">
                  <strong>Error:</strong> {parseError}
                </p>
              </div>
            )}
          </div>
        ) : (
          <pre className="p-4 text-sm font-mono text-gray-800 overflow-x-auto">
            {jsonString}
          </pre>
        )}
      </div>
    </div>
  );
};
