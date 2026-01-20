import React from 'react';
import { TrendingUp, Home, Calendar, Eye, DollarSign, Users } from 'lucide-react';

interface FunnelStage {
  name: string;
  leads: number;
  percentage: number;
  value: number;
  color: string;
  icon: React.ComponentType<any>;
}

interface ConversionFunnelProps {
  stages: FunnelStage[];
  operationType?: 'SELL' | 'RENT' | 'ALL';
}

export const ConversionFunnel: React.FC<ConversionFunnelProps> = ({ stages, operationType = 'ALL' }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatLargeNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const getOperationColor = () => {
    switch (operationType) {
      case 'SELL': return 'from-orange-500 to-orange-600';
      case 'RENT': return 'from-indigo-500 to-indigo-600';
      default: return 'from-purple-500 to-purple-600';
    }
  };

  const getOperationTitle = () => {
    switch (operationType) {
      case 'SELL': return 'Funnel de Conversión - Ventas';
      case 'RENT': return 'Funnel de Conversión - Rentas';
      default: return 'Funnel de Conversión - General';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className={`px-6 py-4 bg-gradient-to-r ${getOperationColor()}`}>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{getOperationTitle()}</h3>
            <p className="text-white/80 text-sm">Análisis por número de leads y valor económico</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isLast = index === stages.length - 1;
            const width = stage.percentage;
            
            return (
              <div key={stage.name} className="relative">
                {/* Línea conectora */}
                {!isLast && (
                  <div className="absolute left-8 top-16 w-0.5 h-8 bg-gray-200 z-0"></div>
                )}
                
                <div className="relative z-10 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${stage.color}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{stage.name}</h4>
                        <p className="text-sm text-gray-600">{stage.percentage.toFixed(1)}% del total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatLargeNumber(stage.leads)}
                      </div>
                      <div className="text-sm text-gray-600">leads</div>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${stage.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${width}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Valor económico */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">Valor total:</span>
                    </div>
                    <div className="font-semibold text-green-600">
                      {formatCurrency(stage.value)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen final */}
        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">
                {formatLargeNumber(stages[0]?.leads || 0)}
              </div>
              <div className="text-sm text-gray-600">Leads iniciales</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {stages.length > 0 ? ((stages[stages.length - 1]?.leads || 0) / (stages[0]?.leads || 1) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-600">Conversión final</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {formatCurrency(stages[stages.length - 1]?.value || 0)}
              </div>
              <div className="text-sm text-gray-600">Valor capturado</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};