import React from 'react';
import {
  Building2,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  MessageCircle,
  Calendar
} from 'lucide-react';
import { PropertyStats as PropertyStatsType } from '../../types/properties';

interface PropertyStatsProps {
  stats: PropertyStatsType;
}

export const PropertyStats: React.FC<PropertyStatsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number, decimals: number = 0) => {
    return num.toFixed(decimals);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Propiedades</div>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Activas:</span>
            <span className="font-semibold text-green-600">{stats.active}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Vendidas:</span>
            <span className="font-semibold text-red-600">{stats.sold}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Rentadas:</span>
            <span className="font-semibold text-blue-600">{stats.rented}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.totalValue)}
            </div>
            <div className="text-sm text-gray-500">Valor Total</div>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Precio Promedio:</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(stats.averagePrice)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Propiedades activas:</span>
            <span className="font-semibold text-green-600">{stats.active}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <MessageCircle className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{stats.totalLeads}</div>
            <div className="text-sm text-gray-500">Leads Totales</div>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Promedio por propiedad:</span>
            <span className="font-semibold text-gray-900">
              {formatNumber(stats.totalLeads / (stats.active || 1), 1)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Propiedades activas:</span>
            <span className="font-semibold text-green-600">{stats.active}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-orange-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">
              {formatNumber(stats.conversionRate, 1)}%
            </div>
            <div className="text-sm text-gray-500">Conversión</div>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Citas agendadas:</span>
            <span className="font-semibold text-gray-900">{stats.totalAppointments}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">De {stats.totalLeads} leads</span>
            <span className="font-semibold text-green-600">
              <Calendar className="h-4 w-4 inline mr-1" />
              {stats.totalAppointments}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
