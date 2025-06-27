import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, User, Plus } from 'lucide-react';
import { useBooking } from '../../contexts/BookingContext';
import { useProfessional } from '../../contexts/ProfessionalContext';
import { useService } from '../../contexts/ServiceContext';

interface DateTimeSelectionProps {
  selectedClient: any;
  selectedServices: string[];
  serviceProfessionals: { serviceId: string; professionalId: string }[];
  bookingDate: Date;
  bookingTime: string;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
  onShowClientSelection: () => void;
  onFinish: () => void;
  isLoading?: boolean;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function DateTimeSelection({
  selectedClient,
  selectedServices,
  serviceProfessionals,
  bookingDate,
  bookingTime,
  onDateChange,
  onTimeChange,
  onShowClientSelection,
  onFinish,
  isLoading = false
}: DateTimeSelectionProps) {
  const { addAgendamento } = useBooking();
  const { professionals } = useProfessional();
  const { services } = useService();
  
  // Estado para controlar a semana atual
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    return startOfWeek;
  });

  // Memoizar cálculo do total
  const total = useMemo(() => {
    return selectedServices
      .map(id => services?.find(s => s.id === id))
      .filter(Boolean)
      .reduce((total, service) => total + service!.price, 0);
  }, [selectedServices, services]);

  // Memoizar horários disponíveis - mais compacto
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 22 && minute > 0) break;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  }, []);

  // Memoizar dias da semana atual
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      days.push(date);
    }
    return days;
  }, [currentWeekStart]);

  // Obter mês e ano da semana atual
  const currentMonthYear = useMemo(() => {
    const firstDay = weekDays[0];
    const lastDay = weekDays[6];
    
    if (firstDay.getMonth() === lastDay.getMonth()) {
      return `${MONTHS[firstDay.getMonth()]} ${firstDay.getFullYear()}`;
    } else {
      return `${MONTHS[firstDay.getMonth()]} - ${MONTHS[lastDay.getMonth()]} ${firstDay.getFullYear()}`;
    }
  }, [weekDays]);

  // Callbacks otimizados para navegação semanal
  const previousWeek = useCallback(() => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  }, [currentWeekStart]);

  const nextWeek = useCallback(() => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  }, [currentWeekStart]);

  const isSelectedDay = useCallback((date: Date) => {
    return date.toDateString() === bookingDate.toDateString();
  }, [bookingDate]);

  const isToday = useCallback((date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }, []);

  // Função para finalizar o agendamento
  const handleFinishBooking = useCallback(() => {
    console.log('🔥 DateTimeSelection - botão clicado!');
    console.log('Estado:', { bookingTime, selectedServicesLength: selectedServices.length });
    
    if (!bookingTime || selectedServices.length === 0) {
      console.log('❌ Validação falhou no DateTimeSelection');
      return;
    }
    
    console.log('✅ Validação passou, chamando onFinish...');
    onFinish();
  }, [bookingTime, selectedServices, onFinish]);

  return (
    <div className="flex h-full">
      {/* Sidebar esquerda - mais compacta */}
      <div className="w-36 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 flex flex-col items-center text-center">
          {selectedClient ? (
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-green-600 font-semibold text-sm">
                {selectedClient.nome?.charAt(0).toUpperCase() || 'C'}
              </span>
            </div>
          ) : (
            <button
              onClick={onShowClientSelection}
              className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 cursor-pointer hover:bg-purple-200 transition-colors relative group"
            >
              <User size={20} className="text-purple-600" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                <Plus size={12} className="text-white" />
              </div>
            </button>
          )}
          
          <div>
            {selectedClient ? (
              <>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{selectedClient.nome || 'Cliente'}</h3>
                <button
                  onClick={onShowClientSelection}
                  className="text-xs text-indigo-600 hover:text-indigo-700"
                >
                  Alterar
                </button>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">Adicionar cliente</h3>
                <p className="text-xs text-gray-500 leading-tight">Ou deixe vazio</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col">
        {/* Header compacto */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Selecionar data e horário</h2>
          <p className="text-sm text-gray-600">Escolha quando você quer agendar</p>
        </div>

        {/* Seleção de data compacta */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <button 
              onClick={previousWeek}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
            <h3 className="font-medium text-gray-900 text-sm">{currentMonthYear}</h3>
            <button 
              onClick={nextWeek}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {WEEK_DAYS.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
            
            {weekDays.map((date) => {
              const isSelected = isSelectedDay(date);
              const isTodayDate = isToday(date);
              
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => onDateChange(date)}
                  className={`
                    py-2 text-sm rounded-md transition-all
                    ${isSelected 
                      ? 'bg-indigo-600 text-white font-medium' 
                      : isTodayDate
                        ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Seleção de horário otimizada */}
        <div className="flex-1 px-6 py-4 overflow-y-auto">
          <h3 className="font-medium text-gray-900 text-sm mb-3">Horários disponíveis</h3>
          
          <div className="grid grid-cols-6 gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => onTimeChange(time)}
                className={`
                  py-2 px-2 text-xs rounded-md border transition-all
                  ${bookingTime === time
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Footer compacto */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-600 mb-1">
                {selectedServices.length} serviço(s) • Total: R$ {total.toFixed(2).replace('.', ',')}
              </div>
            </div>

            <button
              onClick={handleFinishBooking}
              disabled={!bookingTime || selectedServices.length === 0 || isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isLoading ? 'Salvando...' : 'Salvar agendamento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}