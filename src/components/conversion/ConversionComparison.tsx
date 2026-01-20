import React from 'react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface ComparisonData {
  sell: {
    totalLeads: number;
    withAppointment: number;
    conversionRate: number;
    totalValue: number;
    capturedValue: number;
  };
  rent: {
    totalLeads: number;
    withAppointment: number;
    conversionRate: number;
    totalValue: number;
    capturedValue: number;
  };
}

interface ConversionComparisonProps {
  data: ComparisonData;
}

export const ConversionComparison: React.FC<ConversionComparisonProps> = ({ data }) => {
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

  const sellCaptureRate = data.sell.totalValue > 0 ? (data.sell.capturedValue / data.sell.totalValue) * 100 : 0;
  const rentCaptureRate = data.rent.totalValue > 0 ? (data.rent.capturedValue / data.rent.totalValue) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Comparación SELL vs RENT</h3>
            <p className="text-sm text-gray-600">Análisis comparativo de conversión por tipo de operación</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ventas */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Operaciones de Venta</h4>
                <p className="text-sm text-orange-700">Análisis de leads de venta</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total de leads</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatLargeNumber(data.sell.totalLeads)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-700">Con cita agendada</span>
                <div className="text-right">
                  <span className="text-xl font-bold text-orange-600">
                    {formatLargeNumber(data.sell.withAppointment)}
                  </span>
                  <div className="text-sm text-gray-600">
                    {data.sell.conversionRate.toFixed(1)}% conversión
                  </div>
                </div>
              </div>

              <div className="border-t border-orange-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Valor total gestionado</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(data.sell.totalValue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Valor con cita</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(data.sell.capturedValue)}
                  </span>
                </div>
                <div className="mt-2 text-right">
                  <span className="text-sm text-gray-600">
                    {sellCaptureRate.toFixed(1)}% del valor capturado
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rentas */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6 border border-indigo-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Operaciones de Renta</h4>
                <p className="text-sm text-indigo-700">Análisis de leads de renta</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total de leads</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatLargeNumber(data.rent.totalLeads)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-700">Con cita agendada</span>
                <div className="text-right">
                  <span className="text-xl font-bold text-indigo-600">
                    {formatLargeNumber(data.rent.withAppointment)}
                  </span>
                  <div className="text-sm text-gray-600">
                    {data.rent.conversionRate.toFixed(1)}% conversión
                  </div>
                </div>
              </div>

              <div className="border-t border-indigo-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Valor total gestionado</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(data.rent.totalValue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Valor con cita</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(data.rent.capturedValue)}
                  </span>
                </div>
                <div className="mt-2 text-right">
                  <span className="text-sm text-gray-600">
                    {rentCaptureRate.toFixed(1)}% del valor capturado
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
      </div>
    </div>
  );
};