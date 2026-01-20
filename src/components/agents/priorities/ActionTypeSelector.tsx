import React from 'react';
import { PriorityActionType } from '../../../types/agents';
import { Milestone, Zap, RefreshCw, Star } from 'lucide-react';

interface ActionTypeSelectorProps {
  selectedType: PriorityActionType | null;
  onTypeSelect: (type: PriorityActionType) => void;
}

export const ActionTypeSelector: React.FC<ActionTypeSelectorProps> = ({
  selectedType,
  onTypeSelect
}) => {
  const actionTypes = [
    {
      type: 'mark_milestone' as PriorityActionType,
      icon: Milestone,
      label: 'Marcar Hito',
      description: 'Registra un evento en el historial de la conversación',
      color: 'blue'
    },
    {
      type: 'execute_task' as PriorityActionType,
      icon: Zap,
      label: 'Ejecutar Tarea',
      description: 'Ejecuta una tarea configurada del agente',
      color: 'purple'
    },
    {
      type: 'update_state' as PriorityActionType,
      icon: RefreshCw,
      label: 'Actualizar Estado',
      description: 'Actualiza datos de la conversación',
      color: 'green'
    },
    {
      type: 'custom' as PriorityActionType,
      icon: Star,
      label: 'Personalizada',
      description: 'Para casos especiales o futuros',
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      blue: isSelected
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50',
      purple: isSelected
        ? 'border-purple-500 bg-purple-50'
        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50',
      green: isSelected
        ? 'border-green-500 bg-green-50'
        : 'border-gray-200 hover:border-green-300 hover:bg-green-50',
      orange: isSelected
        ? 'border-orange-500 bg-orange-50'
        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
    };
    return colors[color as keyof typeof colors];
  };

  const getIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      green: 'text-green-600',
      orange: 'text-orange-600'
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {actionTypes.map((actionType) => {
        const Icon = actionType.icon;
        const isSelected = selectedType === actionType.type;
        
        return (
          <button
            key={actionType.type}
            onClick={() => onTypeSelect(actionType.type)}
            className={`p-4 border-2 rounded-lg text-left transition-all ${getColorClasses(
              actionType.color,
              isSelected
            )}`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-white ${getIconColor(actionType.color)}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{actionType.label}</h3>
                <p className="text-sm text-gray-600 mt-1">{actionType.description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
