import React from 'react';
import { MapPin, Home, DollarSign, TrendingUp } from 'lucide-react';

interface DistributionData {
  label: string;
  count: number;
  percentage: number;
  value?: number;
}

interface SearchDistributionProps {
  title: string;
  data: DistributionData[];
  icon: React.ComponentType<any>;
  color: string;
  showValue?: boolean;
}

export const SearchDistribution: React.FC<SearchDistributionProps> = ({
  title,
  data,
  icon: Icon,
  color,
  showValue = false
}) => {
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

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className={`px-6 py-4 bg-gradient-to-r ${color}`}>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {data.slice(0, 8).map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{item.label}</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">
                      {formatLargeNumber(item.count)}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                
                {/* Barra de progreso */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                
                {showValue && item.value && (
                  <div className="mt-1 text-sm text-green-600 font-medium">
                    Valor promedio: {formatCurrency(item.value)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {data.length > 8 && (
          <div className="mt-4 text-center">
            <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Ver más ({data.length - 8} adicionales)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};