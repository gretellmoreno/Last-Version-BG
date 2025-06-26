import React, { useState, useMemo, useCallback } from 'react';
import { User, Plus, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBooking } from '../../contexts/BookingContext';
import { useProfessional } from '../../contexts/ProfessionalContext';
import { createBooking, calculateEndTime } from '../../utils/bookingUtils';

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
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEK_DAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

// Serviços estáticos para evitar re-criação
const ALL_SERVICES = [
  { id: '1', nome: 'Corte de cabelo', preco: 40, duracao: 45, comissao: 50 },
  { id: '2', nome: 'Coloração de cabelo', preco: 57, duracao: 90, comissao: 50 },
  { id: '3', nome: 'Escova', preco: 35, duracao: 35, comissao: 50 },
  { id: '4', nome: 'Balaiagem', preco: 150, duracao: 150, comissao: 50 },
  { id: '5', nome: 'Alongamento de cílios clássico', preco: 60, duracao: 60, comissao: 50 },
];

export default function DateTimeSelection({
  selectedClient,
  selectedServices,
  serviceProfessionals,
  bookingDate,
  bookingTime,
  onDateChange,
  onTimeChange,
  onShowClientSelection,
  onFinish
}: DateTimeSelectionProps) {
  const { addAgendamento } = useBooking();
  const { profissionais } = useProfessional();
  
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
      .map(id => ALL_SERVICES.find(s => s.id === id))
      .filter(Boolean)
      .reduce((total, service) => total + service!.preco, 0);
  }, [selectedServices]);

  // Memoizar horários disponíveis em grid 4x4
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 10; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 18 && minute > 0) break;
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
    if (!bookingTime || selectedServices.length === 0) return;

    // Obter serviços selecionados
    const servicos = selectedServices
      .map(id => ALL_SERVICES.find(s => s.id === id))
      .filter(Boolean) as typeof ALL_SERVICES;

    // Para cada combinação serviço-profissional, criar um agendamento
    serviceProfessionals.forEach(sp => {
      const servico = servicos.find(s => s.id === sp.serviceId);
      const profissional = profissionais.find(p => p.id === sp.professionalId);
      
      if (servico && profissional) {
        const agendamento = createBooking(
          selectedClient,
          [servico], // Um agendamento por serviço
          profissional,
          bookingDate,
          bookingTime
        );
        
        addAgendamento(agendamento);
      }
    });

    // Fechar modal e finalizar
    onFinish();
  }, [bookingTime, selectedServices, serviceProfessionals, selectedClient, bookingDate, addAgendamento, onFinish, profissionais]);

  return (
    <div className="flex h-full">
      {/* Sidebar esquerda - cliente */}
      <div className="w-32 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 flex flex-col items-center text-center">
          {selectedClient ? (
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-green-600 font-semibold text-sm">
                {selectedClient.nome.charAt(0).toUpperCase()}
              </span>
            </div>
          ) : (
            <button
              onClick={onShowClientSelection}
              className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 cursor-pointer hover:bg-purple-200 transition-colors relative group"
            >
              <User size={20} className="text-purple-600" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                <Plus size={10} className="text-white" />
              </div>
            </button>
          )}
          
          <div>
            {selectedClient ? (
              <>
                <h3 className="font-semibold text-gray-900 text-xs mb-1">{selectedClient.nome}</h3>
                <button
                  onClick={onShowClientSelection}
                  className="text-xs text-indigo-600 hover:text-indigo-700"
                >
                  Alterar
                </button>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-gray-900 text-xs mb-1">Adicionar cliente</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Ou deixe vazio se não há cadastro</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col">
        {/* Breadcrumb */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <span className="text-gray-400">Serviços</span>
            <ChevronDown size={14} className="rotate-[-90deg]" />
            <span>Horário</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Selecione um horário</h2>
        </div>

        {/* Calendário semanal compacto */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 text-sm">
              {currentMonthYear}
            </h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={previousWeek}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft size={14} className="text-gray-600" />
              </button>
              <button
                onClick={nextWeek}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight size={14} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Semana em linha horizontal */}
          <div className="flex space-x-1">
            {weekDays.map((date, index) => (
              <button
                key={index}
                onClick={() => onDateChange(date)}
                className={`
                  flex-1 h-14 flex flex-col items-center justify-center text-xs rounded-lg transition-all border
                  ${isSelectedDay(date)
                    ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                    : isToday(date)
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200 font-medium'
                    : 'text-gray-700 hover:bg-gray-100 border-gray-200'
                  }
                `}
              >
                <span className="text-xs opacity-70 mb-1">
                  {WEEK_DAYS[date.getDay()]}
                </span>
                <span className="font-medium">
                  {date.getDate()}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Horários disponíveis em grid 4x4 compacto */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="font-medium text-gray-900 text-sm mb-3">Horários disponíveis</h3>

          {/* Grid de horários - 4 colunas, mais compacto */}
          <div className="grid grid-cols-4 gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => onTimeChange(time)}
                className={`
                  py-2 px-1 text-center border rounded-lg transition-colors text-sm
                  ${bookingTime === time
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                    : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                  }
                `}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-semibold text-gray-900">R$ {total}</span>
          </div>
          <button 
            onClick={handleFinishBooking}
            disabled={!bookingTime}
            className={`
              w-full py-2.5 rounded-lg font-medium text-sm transition-colors
              ${bookingTime
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}