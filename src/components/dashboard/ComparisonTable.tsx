import React from 'react';
import { DashboardMetrics } from '../../types';

interface ComparisonTableProps {
  metrics: DashboardMetrics;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ metrics }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculateCaptureRate = (valueWithAppointment: number, totalValue: number) => {
    return totalValue > 0 ? ((valueWithAppointment / totalValue) * 100).toFixed(1) : '0.0';
  };

  const rows = [
    {
      indicator: 'Valor total de propiedades consultadas (PROPERTY_LEAD)',
      total: formatCurrency(metrics.economicImpact.totalValue),
      sell: formatCurrency(metrics.sellVsRent.sell.totalValue),
      rent: formatCurrency(metrics.sellVsRent.rent.totalValue),
    },
    {
      indicator: 'Valor total con cita agendada',
      total: formatCurrency(metrics.economicImpact.valueWithAppointment),
      sell: formatCurrency(metrics.sellVsRent.sell.valueWithAppointment),
      rent: formatCurrency(metrics.sellVsRent.rent.valueWithAppointment),
    },
    {
      indicator: '% Valor capturado por IA',
      total: `${metrics.economicImpact.captureRate.toFixed(1)}%`,
      sell: `${calculateCaptureRate(metrics.sellVsRent.sell.valueWithAppointment, metrics.sellVsRent.sell.totalValue)}%`,
      rent: `${calculateCaptureRate(metrics.sellVsRent.rent.valueWithAppointment, metrics.sellVsRent.rent.totalValue)}%`,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Métricas de Impacto Económico</h3>
        <p className="text-sm text-gray-600 mt-1">Comparación por tipo de operación (WhatsApp + Llamadas)</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Indicador
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Venta
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Renta
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {row.indicator}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-center font-semibold">
                  {row.total}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-center">
                  {row.sell}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-center">
                  {row.rent}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Se calcula usando el precio asociado a un lead de propiedad y si el usuario agendó una cita
        </p>
      </div>
    </div>
  );
};