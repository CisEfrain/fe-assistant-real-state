import React, { useEffect, useState } from 'react';
import { Bot, Target, DollarSign, Calendar, Heart, Clock } from 'lucide-react';
import { useInteractionStore } from '../../stores/useInteractionStore';
import { GlobalImpact } from '../../types';

interface ImpactBlockProps {
  dateFilters?: {
    start_date: string;
    end_date: string;
  };
}

export const ImpactBlock: React.FC<ImpactBlockProps> = ({ dateFilters }) => {
  const { interactions, getGlobalImpact, fetchGlobalImpact } = useInteractionStore();
  const [impact, setImpact] = useState<GlobalImpact | null>(null);

  useEffect(() => {
    const loadImpactData = async () => {
      try {
        // Usar los mismos filtros de fecha que el dashboard
        const realImpact = await fetchGlobalImpact(dateFilters);
        setImpact(realImpact);
      } catch (error) {
        console.warn('Using local impact calculations');
        // Usar las mismas interacciones que el dashboard
        const filteredInteractions = dateFilters ?
          (interactions || []).filter(interaction => {
            const interactionDate = new Date(interaction.created_at).toISOString().split('T')[0];
            return interactionDate >= dateFilters.start_date && interactionDate <= dateFilters.end_date;
          }) :
          (interactions || []);
        const localImpact = calculateLocalImpact(filteredInteractions);
        setImpact(localImpact);
      }
    };
    
    loadImpactData();
  }, [dateFilters, fetchGlobalImpact, interactions]);

  const calculateLocalImpact = (interactions: any[]): GlobalImpact => {
    if (!interactions || !Array.isArray(interactions)) {
      return {
        leadsManaged: 0,
        totalPropertyValue: 0,
        appointmentsScheduled: 0,
        potentialValueWithAppointment: 0,
        satisfactionRate: 0,
        offHoursResponseRate: 0
      };
    }
    
    // Calcular satisfacción positiva
    const csatResponses = (interactions || []).filter(interaction => interaction.quality.csat);
    const positiveCsat = csatResponses.filter(interaction => {
      const csat = interaction.quality.csat;
      if (typeof csat === 'string') {
        return csat === 'Satisfecho' || csat === 'Muy satisfecho' || 
               csat === 'SATISFIED' || csat === 'VERY_SATISFIED' ||
               csat === '4' || csat === '5';
      }
      if (typeof csat === 'number') {
        return csat >= 4;
      }
      return false;
    });
    
    const satisfactionRate = csatResponses.length > 0 
      ? (positiveCsat.length / csatResponses.length) * 100 
      : 0;
    
    // Valor total de propiedades
    const totalPropertyValue = (interactions || [])
      .filter(interaction => interaction.original_property?.price?.amount)
      .reduce((sum, interaction) => sum + (interaction.original_property?.price?.amount || 0), 0);
    
    // Citas agendadas
    const appointmentsScheduled = (interactions || []).filter(interaction =>
      interaction.appointment?.type && interaction.appointment.type !== 'NOT_SCHEDULED'
    ).length;

    // Valor con cita
    const potentialValueWithAppointment = (interactions || [])
      .filter(interaction =>
        interaction.appointment?.type &&
        interaction.appointment.type !== 'NOT_SCHEDULED' &&
        interaction.original_property?.price?.amount
      )
      .reduce((sum, interaction) => sum + (interaction.original_property?.price?.amount || 0), 0);

    // Horario humano: Lunes a Viernes 9:00-18:00, Sábados 9:00-14:00
    const offHoursInteractions = (interactions || []).filter(interaction => {
      const date = new Date(interaction.created_at);
      const hour = date.getHours();
      const dayOfWeek = date.getDay(); // 0 = Domingo, 6 = Sábado
      
      // Domingo
      if (dayOfWeek === 0) return true;
      
      // Sábado: fuera de 9:00-14:00
      if (dayOfWeek === 6) {
        return hour < 9 || hour >= 14;
      }
      
      // Lunes a Viernes: fuera de 9:00-18:00
      return hour < 9 || hour >= 18;
    });
    
    const offHoursResponseRate = interactions.length > 0 
      ? (offHoursInteractions.length / interactions.length) * 100 
      : 0;
    
    return {
      leadsManaged: interactions.length,
      totalPropertyValue,
      appointmentsScheduled,
      potentialValueWithAppointment,
      satisfactionRate,
      offHoursResponseRate
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatLargeNumber = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0';
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const metrics = [
    {
      icon: Target,
      label: 'Interacciones gestionadas automáticamente',
      value: impact ? formatLargeNumber(impact.leadsManaged) : '-',
      color: 'text-orange-600'
    },
    {
      icon: DollarSign,
      label: 'Valor total de propiedades vinculadas',
      value: impact ? `${formatLargeNumber(impact.totalPropertyValue / 1000000)}M MXN` : '-',
      color: 'text-green-600'
    },
    {
      icon: Calendar,
      label: 'Citas agendadas por IA',
      value: impact ? formatLargeNumber(impact.appointmentsScheduled) : '-',
      color: 'text-purple-600'
    },
    {
      icon: DollarSign,
      label: 'Valor potencial de leads con cita',
      value: impact ? `${formatLargeNumber(impact.potentialValueWithAppointment / 1000000)}M MXN` : '-',
      color: 'text-blue-600'
    },
    {
      icon: Heart,
      label: 'Tasa de satisfacción positiva (Encuesta)',
      value: impact && impact.satisfactionRate !== undefined ? `${impact.satisfactionRate.toFixed(0)}%` : '-',
      color: 'text-pink-600'
    },
    {
      icon: Clock,
      label: '% de interacciones fuera de horario humano',
      value: impact && impact.offHoursResponseRate !== undefined ? `${impact.offHoursResponseRate.toFixed(0)}%` : '-',
      color: 'text-indigo-600'
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 text-white shadow-2xl border border-gray-700">
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-4 bg-gradient-to-r from-orange-500 to-purple-600 rounded-xl">
          <Bot className="h-8 w-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Impacto Global del Agente IA</h2>
          <p className="text-gray-300 mt-1">
            "El agente IA Santi no solo automatiza interacciones: genera impacto real en WhatsApp y Llamadas."
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div 
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:bg-gray-700/50 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg bg-gray-700/50 ${metric.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 leading-tight mb-2">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {metric.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-orange-500/10 to-purple-600/10 rounded-xl border border-orange-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-purple-600 rounded-lg">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Mensaje de Valor Estratégico</h3>
            <p className="text-gray-300 mt-1">
              Santi gestiona el 100% de las interacciones entrantes (WhatsApp y Widget en la web), atiende el {impact && impact.offHoursResponseRate !== undefined ? impact.offHoursResponseRate.toFixed(0) : '--'}% fuera de horario humano, convierte el {impact && impact.satisfactionRate !== undefined ? impact.satisfactionRate.toFixed(0) : '--'}%
              en experiencias positivas y agenda citas por valor de más de {impact ? `${formatLargeNumber(impact.potentialValueWithAppointment / 1000000)}M` : '--'} MXN mensualmente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};