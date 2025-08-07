import React, { useState, useMemo, useCallback, useEffect } from 'react';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import User from 'lucide-react/dist/esm/icons/user';
import Plus from 'lucide-react/dist/esm/icons/plus';
import { useBooking } from '../../hooks/useBooking';
import { useProfessional } from '../../contexts/ProfessionalContext';
import { useService } from '../../contexts/ServiceContext';
import { supabaseService } from '../../lib/supabaseService'; // ADICIONAR

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
  onBack?: () => void; // Nova prop para voltar
  isLoading?: boolean;
  hideClientSection?: boolean;
  // Props para identificar o fluxo
  hasPreselectedDateTime?: boolean; // Se true = fluxo rápido, se false = fluxo completo
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
  onBack,
  isLoading = false,
  hideClientSection = false,
  hasPreselectedDateTime = false
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

  // Estado para horários disponíveis
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  // Obter o profissional selecionado
  const selectedProfessionalId = useMemo(() => {
    if (serviceProfessionals.length > 0) {
      return serviceProfessionals[0].professionalId;
    }
    return null;
  }, [serviceProfessionals]);

  // Calcular a duração total dos serviços selecionados
  const totalDuration = useMemo(() => {
    if (!services || selectedServices.length === 0) return 30; // fallback
    return selectedServices.reduce((sum, serviceId) => {
      const serv = services.find(s => s.id === serviceId);
      return sum + (serv?.estimated_time || 30); // fallback 30 min
    }, 0);
  }, [selectedServices, services]);

  // Buscar horários disponíveis APENAS no fluxo completo (quando não há dados pré-selecionados)
  useEffect(() => {
    async function fetchAvailability() {
      // Se é fluxo rápido (com dados pré-selecionados), não buscar disponibilidade
      if (hasPreselectedDateTime) {
        console.log('🔄 Fluxo rápido detectado - não buscando disponibilidade');
        setAvailableTimes([]);
        setLoadingTimes(false);
        return;
      }

      // Se é fluxo completo, buscar disponibilidade apenas se há profissional e data selecionados
      if (!selectedProfessionalId || !bookingDate) {
        setAvailableTimes([]);
        return;
      }

      console.log('🔍 Fluxo completo - buscando disponibilidade para:', {
        professionalId: selectedProfessionalId,
        date: (() => {
          const year = bookingDate.getFullYear();
          const month = String(bookingDate.getMonth() + 1).padStart(2, '0');
          const day = String(bookingDate.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        })(),
        totalDuration
      });

      setLoadingTimes(true);
      
      // Formatação de data que respeita o timezone local
      const year = bookingDate.getFullYear();
      const month = String(bookingDate.getMonth() + 1).padStart(2, '0');
      const day = String(bookingDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      try {
        const { data, error } = await supabaseService.professionals.getAvailability(
          selectedProfessionalId,
          dateStr,
          totalDuration
        );
        
        console.log('🔍 Resposta da API get_availability:', { data, error, dataType: typeof data, isArray: Array.isArray(data) });
        
        if (error) {
          const isPGRST202 = typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'PGRST202';
          if (isPGRST202) {
            console.warn('⚠️ Função get_availability não existe, usando horários padrão');
            setAvailableTimes(timeSlots);
          } else {
            console.warn('⚠️ Erro ao buscar disponibilidade, usando horários padrão:', error);
            setAvailableTimes(timeSlots);
          }
        } else if (Array.isArray(data)) {
          // ✅ Sucesso! A resposta é o array de horários
          console.log('✅ Horários disponíveis encontrados:', data);
          setAvailableTimes(data);
          
          if (data.length === 0) {
            console.log('ℹ️ Nenhum horário disponível para esta data');
          }
        } else {
          console.warn('⚠️ Resposta inesperada da API, usando horários padrão. Data recebida:', data);
          setAvailableTimes(timeSlots);
        }
      } catch (error) {
        console.error('❌ Exceção ao buscar disponibilidade:', error);
        setAvailableTimes(timeSlots);
      } finally {
        setLoadingTimes(false);
      }
    }
    fetchAvailability();
  }, [selectedProfessionalId, bookingDate, timeSlots, totalDuration, hasPreselectedDateTime]);

  // Lógica condicional para exibir horários baseada no fluxo
  const slotsToShow = useMemo(() => {
    // Fluxo rápido: mostrar apenas o horário pré-selecionado
    if (hasPreselectedDateTime && bookingTime) {
      return [bookingTime];
    }
    
    // Fluxo completo: usar horários disponíveis se houver, senão usar padrão
    if (!hasPreselectedDateTime && selectedProfessionalId && availableTimes.length > 0) {
      return availableTimes;
    }
    
    // Fallback: usar horários padrão
    return timeSlots;
  }, [hasPreselectedDateTime, bookingTime, selectedProfessionalId, availableTimes, timeSlots]);

  return (
    <div className={`flex h-full ${hideClientSection ? 'w-full' : ''}`}>
      {/* Sidebar esquerda - mais compacta - condicional */}
      {!hideClientSection && (
      <div 
        className="w-36 bg-gray-50 border-r border-gray-200 flex flex-col cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onShowClientSelection}
      >
        <div className="p-4 flex flex-col items-center text-center">
          {selectedClient ? (
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-green-600 font-semibold text-sm">
                {selectedClient.nome?.charAt(0).toUpperCase() || 'C'}
              </span>
            </div>
          ) : (
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 relative">
              <User size={20} className="text-purple-600" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                <Plus size={12} className="text-white" />
              </div>
            </div>
          )}
          
          <div>
            {selectedClient ? (
              <>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{selectedClient.nome || 'Cliente'}</h3>
                <p className="text-xs text-indigo-600">Alterar</p>
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
      )}

      {/* Conteúdo principal */}
      <div className={`flex flex-col ${hideClientSection ? 'w-full' : 'flex-1'}`}>
        {/* Header compacto */}
        {/* Removido título e subtítulo em mobile */}
        <div className="px-6 py-2 md:py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <button 
              onClick={previousWeek}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
            <h3 className="font-medium text-gray-900 text-xs md:text-sm">{currentMonthYear}</h3>
            <button 
              onClick={nextWeek}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {WEEK_DAYS.map((day) => (
              <div key={day} className="text-center text-[10px] md:text-xs font-medium text-gray-500 py-1">
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
                    py-1 md:py-2 text-xs md:text-sm rounded-md transition-all
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
        <div className="flex-1 px-4 md:px-6 py-2 md:py-4 overflow-y-auto">
          <h3 className="font-medium text-gray-900 text-xs md:text-sm mb-2 md:mb-3">
            {hasPreselectedDateTime ? 'Horário selecionado' : 'Horários disponíveis'}
          </h3>
          
          {hasPreselectedDateTime ? (
            // Fluxo rápido: mostrar apenas o horário pré-selecionado
            <div className="text-center py-8">
              <div className="inline-block px-6 py-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="text-indigo-700 font-medium text-lg">{bookingTime}</p>
                <p className="text-indigo-600 text-sm mt-1">Horário confirmado</p>
              </div>
            </div>
          ) : (
            // Fluxo completo: mostrar lista de horários disponíveis
            <>
              {loadingTimes ? (
                <div className="text-center text-gray-500 py-8">Carregando horários...</div>
              ) : (
                <div className="grid grid-cols-6 gap-1 md:gap-2">
                  {slotsToShow.map((time) => (
                    <button
                      key={time}
                      onClick={() => onTimeChange(time)}
                      className={`
                        py-1 md:py-2 px-1 md:px-2 text-[11px] md:text-xs rounded-md border transition-all
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
              )}
            </>
          )}
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