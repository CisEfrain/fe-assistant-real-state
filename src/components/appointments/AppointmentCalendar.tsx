import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Eye, Phone, Clock } from 'lucide-react';
import { CallRecord } from '../../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

interface AppointmentCalendarProps {
  appointments: CallRecord[];
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  onDateSelect,
  selectedDate
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const appointmentsByDate = useMemo(() => {
    return appointments.reduce((acc, appointment) => {
      if (appointment.appointment?.date) {
        const date = format(new Date(appointment.appointment.date), 'yyyy-MM-dd');
        if (!acc[date]) acc[date] = [];
        acc[date].push(appointment);
      }
      return acc;
    }, {} as Record<string, CallRecord[]>);
  }, [appointments]);

  const getAppointmentIcon = (type: string) => {
    switch (type) {
      case 'VISIT': return <Eye className="h-3 w-3 text-green-600" />;
      case 'PHONE_CALL': return <Phone className="h-3 w-3 text-blue-600" />;
      default: return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  const getAppointmentColor = (type: string) => {
    switch (type) {
      case 'VISIT': return 'bg-green-100 border-green-300';
      case 'PHONE_CALL': return 'bg-blue-100 border-blue-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-1">
          {monthDays.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayAppointments = appointmentsByDate[dateKey] || [];
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const hasAppointments = dayAppointments.length > 0;
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

            return (
              <div
                key={dateKey}
                onClick={() => onDateSelect(day)}
                className={`min-h-[80px] p-2 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                  isSelected ? 'bg-purple-50 border-purple-300' : ''
                } ${
                  !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-medium ${
                    isSelected ? 'text-purple-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {hasAppointments && (
                    <span className="text-xs bg-purple-100 text-purple-600 px-1 rounded-full">
                      {dayAppointments.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {dayAppointments.slice(0, 2).map((appointment, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-1 p-1 rounded text-xs border ${getAppointmentColor(appointment.appointment?.type || '')}`}
                    >
                      {getAppointmentIcon(appointment.appointment?.type || '')}
                      <span className="truncate">
                        {appointment.appointment?.type === 'VISIT' ? 'Visita' : 'Llamada'}
                      </span>
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayAppointments.length - 2} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};