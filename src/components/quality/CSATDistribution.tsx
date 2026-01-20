import React from 'react';
import { Star, TrendingUp } from 'lucide-react';
import { InteractionRecord } from '../../types';

interface CSATDistributionProps {
  interactions: InteractionRecord[];
}

export const CSATDistribution: React.FC<CSATDistributionProps> = ({ interactions }) => {
  const csatResponses = interactions.filter(interaction => interaction.quality.csat);
  
  // Normalizar valores CSAT a formato estándar
  const normalizeCSAT = (csat: string) => {
    if (csat === '5' || csat === 'Muy satisfecho') return 'VERY_SATISFIED';
    if (csat === '4' || csat === 'Satisfecho') return 'SATISFIED';
    if (csat === '3' || csat === 'Neutral') return 'NEUTRAL';
    if (csat === '2' || csat === 'Insatisfecho') return 'DISSATISFIED';
    if (csat === '1' || csat === 'Muy insatisfecho') return 'VERY_DISSATISFIED';
    return csat; // Mantener valor original si ya está normalizado
  };
  
  const distribution = {
    'VERY_SATISFIED': csatResponses.filter(interaction => normalizeCSAT(interaction.quality.csat!) === 'VERY_SATISFIED').length,
    'SATISFIED': csatResponses.filter(interaction => normalizeCSAT(interaction.quality.csat!) === 'SATISFIED').length,
    'NEUTRAL': csatResponses.filter(interaction => normalizeCSAT(interaction.quality.csat!) === 'NEUTRAL').length,
    'DISSATISFIED': csatResponses.filter(interaction => normalizeCSAT(interaction.quality.csat!) === 'DISSATISFIED').length,
    'VERY_DISSATISFIED': csatResponses.filter(interaction => normalizeCSAT(interaction.quality.csat!) === 'VERY_DISSATISFIED').length,
  };

  const getCSATColor = (level: string) => {
    switch (level) {
      case 'VERY_SATISFIED': return 'bg-green-500';
      case 'SATISFIED': return 'bg-green-400';
      case 'NEUTRAL': return 'bg-yellow-400';
      case 'DISSATISFIED': return 'bg-red-400';
      case 'VERY_DISSATISFIED': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getCSATLabel = (level: string) => {
    switch (level) {
      case 'VERY_SATISFIED': return 'Muy Satisfecho';
      case 'SATISFIED': return 'Satisfecho';
      case 'NEUTRAL': return 'Neutral';
      case 'DISSATISFIED': return 'Insatisfecho';
      case 'VERY_DISSATISFIED': return 'Muy Insatisfecho';
      default: return level;
    }
  };

  const getStars = (level: string) => {
    const ratings = {
      'VERY_SATISFIED': 5,
      'SATISFIED': 4,
      'NEUTRAL': 3,
      'DISSATISFIED': 2,
      'VERY_DISSATISFIED': 1
    };
    return ratings[level as keyof typeof ratings] || 0;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Star className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Distribución de Satisfacción (CSAT)</h3>
            <p className="text-purple-100 text-sm">{csatResponses.length} respuestas analizadas</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {Object.entries(distribution).map(([level, count]) => {
            const percentage = csatResponses.length > 0 ? (count / csatResponses.length) * 100 : 0;
            const stars = getStars(level);
            
            return (
              <div key={level} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < stars 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {getCSATLabel(level)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">{count}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getCSATColor(level)} transition-all duration-1000 ease-out`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
          <div className="flex items-center space-x-3 mb-3">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <h4 className="font-semibold text-purple-900">Resumen de Satisfacción</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {(((distribution.VERY_SATISFIED + distribution.SATISFIED) / csatResponses.length) * 100).toFixed(1)}%
              </div>
              <div className="text-gray-600">Satisfacción Positiva</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">
                {((distribution.NEUTRAL / csatResponses.length) * 100).toFixed(1)}%
              </div>
              <div className="text-gray-600">Neutral</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {(((distribution.DISSATISFIED + distribution.VERY_DISSATISFIED) / csatResponses.length) * 100).toFixed(1)}%
              </div>
              <div className="text-gray-600">Satisfacción Negativa</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};