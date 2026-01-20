import React from 'react';
import { Brain } from 'lucide-react';
import { useAgentStore } from '../../../stores/useAgentStore';
import { AgentPriorities } from './AgentPriorities';

export const AgentBrain: React.FC = () => {
  const { currentAgent } = useAgentStore();

  if (!currentAgent) return null;

  return (
    <div className="space-y-8">
      {/* Información Explicativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-blue-800 mb-2">¿Cómo funcionan las Prioridades?</h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p>
                Las <strong>Prioridades</strong> son las metas principales de tu asistente. Cuando un usuario escribe algo, 
                el asistente evalúa qué prioridad se activa basándose en las frases clave que configuraste.
              </p>
              <p>
                El <strong>peso</strong> determina la importancia: prioridades con mayor peso se ejecutan primero. 
                Si una prioridad necesita ciertos datos, el asistente los pedirá antes de continuar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Configuración de Prioridades */}
      <AgentPriorities />
    </div>
  );
};