import React from 'react';
import {
  Users,
  UserPlus,
  UserCheck,
  Calendar,
  TrendingUp,
  DollarSign,
  Clock,
  Target
} from 'lucide-react';
import { LeadStats as LeadStatsType } from '../../types/leads';

interface LeadStatsProps {
  stats: LeadStatsType;
}

export const LeadStats: React.FC<LeadStatsProps> = ({ stats }) => {
  const formatNumber = (num: number, decimals: number = 0) => {
    return num.toFixed(decimals);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Leads</div>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Nuevos:</span>
            <span className="font-semibold text-blue-600">{stats.new}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Contactados:</span>
            <span className="font-semibold text-purple-600">{stats.contacted}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Calificados:</span>
            <span className="font-semibold text-green-600">{stats.qualified}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-orange-100 rounded-lg">
            <Calendar className="h-6 w-6 text-orange-600" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{stats.appointmentScheduled}</div>
            <div className="text-sm text-gray-500">Citas Agendadas</div>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Del total:</span>
            <span className="font-semibold text-gray-900">
              {stats.total > 0 ? formatNumber((stats.appointmentScheduled / stats.total) * 100, 1) : 0}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Pendientes:</span>
            <span className="font-semibold text-orange-600">{stats.appointmentScheduled}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <Target className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">
              {formatNumber(stats.conversionRate, 1)}%
            </div>
            <div className="text-sm text-gray-500">Tasa Conversión</div>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Ganados:</span>
            <span className="font-semibold text-green-600">{stats.won}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Perdidos:</span>
            <span className="font-semibold text-red-600">{stats.lost}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total intentos:</span>
            <span className="font-semibold text-gray-900">{stats.won + stats.lost}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {stats.qualified}
            </div>
            <div className="text-sm text-gray-500">Leads Calificados</div>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Tasa calificación:</span>
            <span className="font-semibold text-gray-900">
              {stats.total > 0 ? formatNumber((stats.qualified / stats.total) * 100, 1) : 0}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">En proceso:</span>
            <span className="font-semibold text-purple-600">
              {stats.contacted + stats.qualified}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
