import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { Menu, ChevronDown, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast, { Toaster } from 'react-hot-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import Header from '../components/Header';
import BookingModal from '../components/BookingModal';
import AddActionModal from '../components/AddActionModal';
import VendaModal from '../components/VendaModal';
import AppointmentTooltip from '../components/AppointmentTooltip';
import EditAppointmentModal from '../components/EditAppointmentModal';
import FecharComandaModal from '../components/FecharComandaModal';

import { useBooking } from '../contexts/BookingContext';
import { useProfessional } from '../contexts/ProfessionalContext';
import { useApp } from '../contexts/AppContext';
import { supabaseService } from '../lib/supabaseService';
import { Appointment, CalendarEvent, AppointmentDetails } from '../types';

// Configuração do localizador em português
const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Criar o componente "aprimorado" com drag-and-drop
const DragAndDropCalendar = withDragAndDrop<CalendarEvent, Resource>(Calendar);

// Horários de funcionamento
const BUSINESS_HOURS = {
  OPEN_HOUR: 8,    // 8:00
  CLOSE_HOUR: 22   // 22:00
};

const minTime = new Date();
minTime.setHours(BUSINESS_HOURS.OPEN_HOUR, 0, 0);

const maxTime = new Date();
maxTime.setHours(BUSINESS_HOURS.CLOSE_HOUR, 0, 0);

// Interface dos Recursos (Profissionais)
interface Resource {
  id: string;
  title: string;
}

// Interface dos Eventos (Agendamentos)
// interface CalendarEvent {
//   id: string;
//   title: string;
//   start: Date;
//   end: Date;
//   resourceId: string;
//   client: string;
//   service: string;
//   status: string;
//   professionalName?: string;
//   appointmentData: Appointment;
// }

// Mensagens em português
const messages = {
  today: 'Hoje',
  previous: 'Anterior',
  next: 'Próximo',
  day: 'Dia',
  week: 'Semana',
  month: 'Mês',
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  allDay: 'Dia inteiro',
  showMore: (total: number) => `+${total} mais`,
};

// Componente do cabeçalho fixo dos profissionais
const ProfessionalsHeader = ({ professionals }: { professionals: any[] }) => {
  return (
    <div className="professionals-header">
      <div className="flex">
        {/* Coluna de horários - espaço vazio */}
        <div className="time-column"></div>
        
        {/* Colunas dos profissionais */}
        {professionals.map((prof) => (
          <div key={prof.id} className="professional-column">
            <div className="flex flex-col items-center space-y-2">
              <div 
                className="professional-avatar"
                style={{ backgroundColor: prof.color || '#6366f1' }}
              >
                {(() => {
                  const name = prof.name.replace('[Exemplo] ', '');
                  const names = name.split(' ');
                  if (names.length === 1) {
                    return names[0].substring(0, 2).toUpperCase();
                  }
                  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
                })()}
              </div>
              <div className="professional-name">
                {prof.name.replace('[Exemplo] ', '')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente simples do DatePicker para mobile
const DatePickerModal = ({ selectedDate, onDateSelect }: { selectedDate: Date, onDateSelect: (date: Date) => void }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDaysInMonth = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const isSelectedDay = (day: number | null) => {
    if (!day) return false;
    return day === selectedDate.getDate() && 
           currentMonth === selectedDate.getMonth() && 
           currentYear === selectedDate.getFullYear();
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return day === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear();
  };

  const selectDate = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    onDateSelect(newDate);
  };

  return (
    <div className="w-full">
      {/* Header do calendário */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft size={16} className="text-gray-600" />
        </button>
        
        <h3 className="text-base font-medium text-gray-900">
          {months[currentMonth]} {currentYear}
        </h3>
        
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronRight size={16} className="text-gray-600" />
        </button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Dias do mês */}
      <div className="grid grid-cols-7 gap-1">
        {getDaysInMonth().map((day, index) => (
          <div key={index} className="aspect-square">
            {day ? (
              <button
                onClick={() => selectDate(day)}
                className={`
                  w-full h-full flex items-center justify-center text-sm rounded-lg transition-all
                  ${isSelectedDay(day)
                    ? 'bg-indigo-600 text-white font-medium'
                    : isToday(day)
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {day}
              </button>
            ) : (
              <div></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente do header mobile
const MobileHeader = ({ 
  selectedDate, 
  onDateChange, 
  selectedProfessional, 
  onProfessionalClick,
  onAddClick,
  onToggleSidebar
}: {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  selectedProfessional: any;
  onProfessionalClick: () => void;
  onAddClick: () => void;
  onToggleSidebar?: () => void;
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    onDateChange(previousDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    onDateChange(nextDay);
  };

  const handleDateSelect = (date: Date) => {
    onDateChange(date);
    setShowDatePicker(false);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const isToday = () => {
    const today = new Date();
    return selectedDate.getDate() === today.getDate() &&
           selectedDate.getMonth() === today.getMonth() &&
           selectedDate.getFullYear() === today.getFullYear();
  };

  return (
    <div className="mobile-agenda-header bg-white border-b border-gray-200 p-4">
      {/* Linha única - Menu, Navegação de Data, Profissional e Adicionar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
        >
          <Menu size={20} className="text-gray-600" />
        </button>
        
        {/* Navegação de Data */}
        <div className="flex items-center space-x-1 flex-1 justify-center">
          <button
            onClick={goToPreviousDay}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          
          <button
            onClick={() => setShowDatePicker(true)}
            className="px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-center"
          >
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium">
                {format(selectedDate, "EEEE", { locale: ptBR })}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {format(selectedDate, "dd 'de' MMM", { locale: ptBR })}
              </span>
        </div>
          </button>
        
        <button
            onClick={goToNextDay}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
            <ChevronRight size={18} className="text-gray-600" />
        </button>
          
          {!isToday() && (
            <button
              onClick={goToToday}
              className="ml-2 px-2 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-xs font-medium"
            >
              Hoje
            </button>
          )}
      </div>
      
        {/* Seletor de Profissional e Botão Adicionar */}
        <div className="flex items-center space-x-2 flex-shrink-0">
        <button
          onClick={onProfessionalClick}
            className="flex items-center space-x-1.5 px-2 py-1.5 bg-white rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-indigo-300 shadow-sm"
        >
          <div 
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: selectedProfessional?.color || '#6366f1' }}
          >
              {(() => {
                const name = selectedProfessional?.name?.replace('[Exemplo] ', '') || 'P';
                const names = name.split(' ');
                if (names.length === 1) {
                  return names[0].substring(0, 1).toUpperCase();
                }
                return (names[0][0] + (names[names.length - 1]?.[0] || '')).toUpperCase();
              })()}
          </div>
            <ChevronDown size={12} className="text-gray-400" />
          </button>
          
          <button
            onClick={onAddClick}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} />
        </button>
      </div>
      </div>
      
      {/* Modal do DatePicker */}
      {showDatePicker && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowDatePicker(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 text-center">Selecionar Data</h3>
            </div>
            
            <div className="p-4">
              <DatePickerModal 
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
            </div>
            
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowDatePicker(false)}
                className="w-full py-2 px-3 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Agenda({ onToggleMobileSidebar, isMobile: isMobileProp }: { onToggleMobileSidebar?: () => void; isMobile?: boolean } = {}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('');
  const [showProfessionalSelector, setShowProfessionalSelector] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isVendaModalOpen, setIsVendaModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedBookingSlot, setSelectedBookingSlot] = useState<{
    time: string;
    professional: string;
  } | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  
  // Estados para o modal de fechar comanda
  const [isFecharComandaModalOpen, setIsFecharComandaModalOpen] = useState(false);
  const [fecharComandaAppointment, setFecharComandaAppointment] = useState<CalendarEvent | null>(null);
  const [fecharComandaDetails, setFecharComandaDetails] = useState<AppointmentDetails | null>(null);
  
  // Estados para o tooltip
  const [tooltip, setTooltip] = useState<{
    isVisible: boolean;
    appointment: CalendarEvent | null;
    position: { x: number; y: number };
  }>({
    isVisible: false,
    appointment: null,
    position: { x: 0, y: 0 }
  });
  const [isDragging, setIsDragging] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { appointments, refreshAppointments } = useBooking();
  const { professionals } = useProfessional();
  const { currentSalon } = useApp();

  // Hook para detectar mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Inicializar primeiro profissional em mobile
  useEffect(() => {
    if (professionals && professionals.length > 0 && !selectedProfessionalId) {
      setSelectedProfessionalId(professionals[0].id);
    }
  }, [professionals, selectedProfessionalId]);

  // Obter profissional selecionado
  const selectedProfessional = professionals?.find(prof => prof.id === selectedProfessionalId);

  // Funções para drag-and-drop
  const handleEventResize = useCallback(async ({ event, start, end }: any) => {
    handleDragStart(); // Iniciar estado de drag
    
    // Não permitir mudança no horário de início
    if (start.getTime() !== event.start.getTime()) {
      handleDragEnd(); // Finalizar estado de drag
      return;
    }

    const originalEnd = event.end.getTime();
    const newEnd = end.getTime();
    
    // Verificar se realmente houve mudança na duração
    if (newEnd === originalEnd) {
      handleDragEnd(); // Finalizar estado de drag
      return;
    }

    const toastId = toast.loading('Atualizando horário...');

    try {
      const { data, error } = await supabaseService.appointments.updateTime({
        appointmentId: event.id,
        salonId: currentSalon?.id || '',
        newDate: start.toISOString().split('T')[0],
        newStartTime: start.toTimeString().split(' ')[0],
        newEndTime: end.toTimeString().split(' ')[0],
        newProfessionalId: event.resourceId
      });

      if (error) throw error;

      if (data?.success) {
        await refreshAppointments();
        toast.success('Horário atualizado!', { id: toastId });
      } else {
        toast.error('Falha ao atualizar horário.', { id: toastId });
      }
    } catch (error) {
      console.error('Erro ao atualizar horário:', error);
      toast.error('Falha ao atualizar.', { id: toastId });
    } finally {
      handleDragEnd(); // Finalizar estado de drag
    }
  }, [refreshAppointments]);

  const handleEventMove = useCallback(async ({ event, start, end, resourceId }: any) => {
    handleDragStart(); // Iniciar estado de drag

    const toastId = toast.loading('Atualizando agendamento...');

    try {
      const { data, error } = await supabaseService.appointments.updateTime({
        appointmentId: event.id,
        salonId: currentSalon?.id || '',
        newDate: start.toISOString().split('T')[0],
        newStartTime: start.toTimeString().split(' ')[0],
        newEndTime: end.toTimeString().split(' ')[0],
        newProfessionalId: resourceId
      });

      if (error) throw error;

      if (data?.success) {
        await refreshAppointments();
        toast.success('Agendamento atualizado!', { id: toastId });
      } else {
        toast.error('Falha ao atualizar agendamento.', { id: toastId });
      }
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      toast.error('Falha ao atualizar.', { id: toastId });
    } finally {
      handleDragEnd(); // Finalizar estado de drag
    }
  }, [refreshAppointments]);

  // Função para controlar o tooltip (consolidada no CustomEvent)

  // Limpar timeouts quando componente for desmontado
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Converter profissionais para recursos do calendário
  useEffect(() => {
    if (professionals) {
      if (isMobile && selectedProfessionalId) {
        // Em mobile, mostrar apenas o profissional selecionado
        const selectedProfessional = professionals.find(prof => prof.id === selectedProfessionalId);
        if (selectedProfessional) {
          setResources([{
            id: selectedProfessional.id,
            title: selectedProfessional.name.replace('[Exemplo] ', '')
          }]);
        }
      } else {
        // Desktop - mostrar todos os profissionais
        const calendarResources = professionals.map(prof => ({
          id: prof.id,
          title: prof.name.replace('[Exemplo] ', '')
        }));
        setResources(calendarResources);
      }
    }
  }, [professionals, isMobile, selectedProfessionalId]);

  // Converter agendamentos para eventos do calendário
  useEffect(() => {
    if (appointments && appointments.length > 0 && professionals) {
      // Filtrar agendamentos cancelados
      let activeAppointments = appointments.filter((appointment: any) => 
        appointment.status !== 'cancelado'
      );
      
      // Filtrar agendamentos apenas para a data selecionada
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      activeAppointments = activeAppointments.filter((appointment: any) => 
        appointment.date === selectedDateStr
      );
      
      // Em mobile, filtrar apenas agendamentos do profissional selecionado
      if (isMobile && selectedProfessionalId) {
        activeAppointments = activeAppointments.filter((appointment: any) => 
          appointment.professional?.id === selectedProfessionalId || 
          appointment.professional_id === selectedProfessionalId
        );
      }
      
      const calendarEvents: CalendarEvent[] = activeAppointments.map((appointment: any) => {
        // Encontrar profissional
        const professional = professionals.find(p => p.id === appointment.professional?.id);
        const professionalName = professional ? professional.name.replace('[Exemplo] ', '') : appointment.professional?.name || 'Profissional';

        // Nome do cliente (pode ser null no novo formato)
        const clientName = appointment.client?.name || 'Cliente não definido';

        // Criar data/hora de início e fim garantindo timezone correto
        // Usar parseISO ou construir data manualmente para evitar problemas de timezone
        const [year, month, day] = appointment.date.split('-').map(Number);
        const [startHour, startMinute] = appointment.start_time.split(':').map(Number);
        
        const startDateTime = new Date(year, month - 1, day, startHour, startMinute);
        
        // Se end_time for null, calcular baseado na duração dos serviços
        let endDateTime: Date;
        if (appointment.end_time) {
          const [endHour, endMinute] = appointment.end_time.split(':').map(Number);
          endDateTime = new Date(year, month - 1, day, endHour, endMinute);
        } else if (appointment.services && appointment.services.length > 0) {
          // Calcular duração total dos serviços
          const totalDuration = appointment.services.reduce((total: number, service: any) => total + (service.duration || 30), 0);
          endDateTime = new Date(startDateTime.getTime() + totalDuration * 60000); // converter minutos para millisegundos
        } else {
          // Fallback: 30 minutos
          endDateTime = new Date(startDateTime.getTime() + 30 * 60000);
        }

        // Preparar lista de serviços
        const services = appointment.services || [];
        const serviceNames = services.map((s: any) => s.name).join(', ') || 'Serviço não definido';

        return {
          id: appointment.id,
          title: '', // Remover título para evitar tooltip nativo
          start: startDateTime,
          end: endDateTime,
          resourceId: appointment.professional?.id || appointment.professional_id,
          client: clientName,
          service: serviceNames, // Lista dos nomes dos serviços
          services: services, // Array completo dos serviços
          status: appointment.status,
          professionalName,
          appointmentData: appointment
        };
      });

      setEvents(calendarEvents);
    }
  }, [appointments, professionals, isMobile, selectedProfessionalId, selectedDate]);

  // Função para converter cor hex para versão mais clara
  const lightenColor = (color: string, amount: number = 0.7) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const newR = Math.round(r + (255 - r) * amount);
    const newG = Math.round(g + (255 - g) * amount);
    const newB = Math.round(b + (255 - b) * amount);
    
    return `rgb(${newR}, ${newG}, ${newB})`;
  };

  // Estilo dos eventos baseado na cor do profissional e status
  const eventStyleGetter = (event: CalendarEvent) => {
    // Encontrar o profissional para obter sua cor
    const professional = professionals?.find(p => p.id === event.resourceId);
    let baseColor = professional?.color || '#6366f1';
    let backgroundColor = lightenColor(baseColor); // Cor mais clara para texto preto
    
    // Ajustar baseado no status
    let opacity = 1;
    let borderStyle = 'solid';
    let borderColor = baseColor;
    
    switch (event.status) {
      case 'agendado':
        opacity = 1;
        backgroundColor = lightenColor(baseColor);
        break;
      case 'confirmado':
        opacity = 1;
        backgroundColor = lightenColor(baseColor, 0.6); // Um pouco menos claro para confirmado
        break;
      case 'em_andamento':
        opacity = 1;
        backgroundColor = lightenColor('#dc2626', 0.5); // Vermelho claro para em andamento
        borderColor = '#dc2626';
        break;
      case 'concluido':
        opacity = 0.8;
        borderStyle = 'dashed';
        backgroundColor = lightenColor(baseColor, 0.8);
        break;
      case 'cancelado':
        opacity = 0.6;
        backgroundColor = lightenColor('#6b7280', 0.8);
        borderColor = '#6b7280';
        borderStyle = 'dashed';
        break;
    }
    
    return {
      style: {
        backgroundColor,        
        color: '#000000', // Texto preto
        border: `2px ${borderStyle} ${borderColor}`,
        borderRadius: '8px',
        fontSize: '12px',
        padding: '6px 8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        fontWeight: '500',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        lineHeight: '1.2'
      }
    };
  };

  // Manipulador de seleção de slot vazio
  const handleSelectSlot = useCallback((slotInfo: any) => {
    const { start, resourceId } = slotInfo;
    const professional = professionals?.find(p => p.id === resourceId);
    
    if (professional) {
      const timeString = format(start, 'HH:mm');
      setSelectedBookingSlot({ 
        time: timeString, 
        professional: professional.name.replace('[Exemplo] ', '') 
      });
      setIsBookingModalOpen(true);
    }
  }, [professionals]);

  // Manipulador de seleção de evento
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    console.log('handleSelectEvent chamado com evento:', event.id);
    setSelectedAppointmentId(event.id);
    setIsEditModalOpen(true);
  }, []);

  // Manipulador de navegação de datas
  const handleNavigate = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  // Manipuladores dos modais
  const handleAddClick = () => {
    console.log('➕ Botão Adicionar clicado - abrindo AddActionModal');
    setIsActionModalOpen(true);
  };

  const handleAgendamentoSelect = () => {
    console.log('🔵 Agendamento selecionado - fechando AddActionModal e abrindo BookingModal');
    // Primeiro fechar o modal de ação
    setIsActionModalOpen(false);
    // Depois abrir o modal de agendamento
    setTimeout(() => {
    setSelectedBookingSlot(null);
    setIsBookingModalOpen(true);
    }, 100);
  };

  const handleVendaSelect = () => {
    console.log('🟢 Venda selecionada - fechando AddActionModal e abrindo VendaModal');
    // Primeiro fechar o modal de ação
    setIsActionModalOpen(false);
    // Depois abrir o modal de venda
    setTimeout(() => {
    setIsVendaModalOpen(true);
    }, 100);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedBookingSlot(null);
    // Recarregar agendamentos após fechar modal
    refreshAppointments();
  };
  
  // Função para abrir modal de fechar comanda
  const handleOpenFecharComanda = useCallback((appointment: CalendarEvent | null, appointmentDetails: AppointmentDetails | null) => {
    setFecharComandaAppointment(appointment);
    setFecharComandaDetails(appointmentDetails);
    setIsFecharComandaModalOpen(true);
  }, []);

  // Componente customizado para slots de tempo com atributo data-time
  const TimeSlotWrapper = ({ children, value, resource }: any) => {
    return (
      <div 
        className="rbc-time-slot" 
        data-time={format(value, 'HH:mm')}
        style={{ 
          minHeight: '20px',
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'block',
          pointerEvents: 'auto' // Garantir cliques
        }}
      >
        {children}
      </div>
    );
  };

  // Componente customizado para renderizar eventos
  const CustomEvent = ({ event }: any) => {
    const professional = professionals?.find(p => p.id === event.resourceId);
    const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60); // duração em minutos
    const isShort = duration < 45; // Se menos de 45 minutos, layout compacto
    const isVeryShort = duration < 30; // Se menos de 30 minutos, layout muito compacto
    
    const handleEventMouseEnterLocal = (e: React.MouseEvent) => {
      if (isDragging) return; // Não mostrar tooltip se estiver arrastando
      
      // NÃO impedir propagação para permitir click do calendário
      // e.stopPropagation();
      
      // Limpar TODOS os timeouts anteriores (mostrar E esconder)
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      
      hoverTimeoutRef.current = setTimeout(() => {
        // Buscar o elemento mais próximo que represente o evento
        const targetElement = (e.currentTarget || e.target) as HTMLElement;
        const rect = targetElement.getBoundingClientRect();
        
        // Verificar se o elemento ainda está na tela
        if (rect.width === 0 || rect.height === 0) {
          return; // Não mostrar tooltip se o elemento não estiver visível
        }
        
        // Aplicar a mesma lógica robusta de posicionamento
        const tooltipWidth = 320;
        const tooltipHeight = 300;
        const margin = 15;
        
        let x = rect.right + margin; // Posição padrão: à direita do evento
        let y = rect.top;
        
        // Se não cabe à direita, posicionar à esquerda
        if (x + tooltipWidth > window.innerWidth) {
          x = rect.left - tooltipWidth - margin;
        }
        
        // Se ainda não cabe à esquerda, centralizar horizontalmente
        if (x < 0) {
          x = Math.max(margin, (window.innerWidth - tooltipWidth) / 2);
        }
        
        // Garantir que não saia da parte superior da tela
        y = Math.max(margin, y);
        
        // Garantir que não saia da parte inferior da tela
        if (y + tooltipHeight > window.innerHeight) {
          y = window.innerHeight - tooltipHeight - margin;
        }
        
        setTooltip({
          isVisible: true,
          appointment: event,
          position: { x, y }
        });
      }, 100); // Reduzido para 100ms para resposta ainda mais rápida na transição entre agendamentos
    };

    const handleEventMouseLeaveLocal = (e: React.MouseEvent) => {
      // NÃO impedir propagação para permitir click do calendário
      // e.stopPropagation();
      
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      
      hideTimeoutRef.current = setTimeout(() => {
        setTooltip(prev => ({ ...prev, isVisible: false }));
      }, 300); // Aumentado para 300ms para dar mais tempo nas transições entre agendamentos
    };

    const handleEventClickLocal = (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const eventHeight = rect.height;
      
      // Se o click foi nos últimos 12px (área de resize), não abrir modal
      if (clickY > eventHeight - 12) return;
      
      e.stopPropagation();
      setSelectedAppointmentId(event.id);
      setIsEditModalOpen(true);
    };

    return (
      <div
        className="w-full h-full"
        onMouseEnter={handleEventMouseEnterLocal}
        onMouseLeave={handleEventMouseLeaveLocal}
        onClick={handleEventClickLocal}
        title="" // Remover qualquer tooltip nativo
        style={{ 
          pointerEvents: 'auto',
          cursor: 'pointer'
        }} // Garantir que o container principal seja clicável
      >
        {/* Horário - bem no começo, compacto */}
        <div className="text-xs font-semibold leading-tight text-black" style={{ pointerEvents: 'none' }}>
          {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
        </div>
        
        {/* Nome do cliente - logo em seguida, sem margem */}
        <div className={`font-semibold truncate leading-tight text-black ${isVeryShort ? 'text-xs' : 'text-sm'}`} style={{ pointerEvents: 'none' }}>
          {event.client}
        </div>
        
        {/* Serviços - compacto, só mostra se tem espaço e conteúdo */}
        {!isVeryShort && event.services && event.services.length > 0 && (
          <div className="text-xs leading-tight text-black space-y-0.5" style={{ pointerEvents: 'none' }}>
            {event.services.slice(0, isShort ? 1 : 2).map((service: any, index: number) => (
              <div key={service.id} className="truncate">
                {service.name}
                {event.services.length > 1 && index === 0 && event.services.length > (isShort ? 1 : 2) && (
                  <span className="text-gray-600"> +{event.services.length - (isShort ? 1 : 2)}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    setTooltip(prev => ({ ...prev, isVisible: false }));
    
    // Limpar quaisquer timeouts pendentes
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Log para debug - verificar se events está chegando
  useEffect(() => {
    console.log('Eventos carregados:', events.length);
    if (events.length > 0) {
      console.log('Primeiro evento:', events[0]);
    }
  }, [events]);

  return (
    <div className={`flex-1 flex flex-col h-full ${isMobile ? 'mobile-agenda-container' : ''}`}>
      <Toaster position="top-right" />
      
      {isMobile ? (
        <MobileHeader
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedProfessional={selectedProfessional}
          onProfessionalClick={() => setShowProfessionalSelector(true)}
          onAddClick={handleAddClick}
          onToggleSidebar={onToggleMobileSidebar}
        />
      ) : (
        <>
          <Header 
            title="Agenda do Dia"
            hasDateNavigation={true}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onAddClick={handleAddClick}
          />
          
          {/* Cabeçalho fixo dos profissionais - apenas desktop */}
          {professionals && professionals.length > 0 && (
            <ProfessionalsHeader professionals={professionals} />
          )}
        </>
      )}
      
      {/* Calendário */}
      <div className={`flex-1 bg-white overflow-auto ${isMobile ? 'mobile-calendar-container' : ''} ${isActionModalOpen ? 'pointer-events-none' : ''}`}>
        <div className={`h-full ${isMobile ? 'h-full' : 'min-h-[600px]'} ${isActionModalOpen ? 'pointer-events-none' : ''}`}>
                      <DragAndDropCalendar
              localizer={localizer}
              events={events}
              view={Views.DAY}
              onView={() => {}} // Sempre usa DAY view
              date={selectedDate}
              defaultView={Views.DAY}
              views={['day']}
              step={15}
              timeslots={4} // 4 slots por hora = 15 min cada slot
              showMultiDayTimes={false}
              min={minTime}
              max={maxTime}
              resources={resources}
              resourceIdAccessor="id"
              resourceTitleAccessor="title"
              rtl={false}
              className={`barber-calendar ${isMobile ? 'mobile-calendar mobile-responsive' : ''}`}
              
              // Funcionalidades de Interação - ajustadas para mobile
              selectable={true}
              resizable={!isMobile} // Desabilitar resize em mobile
              
              // Event Handlers
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              onNavigate={handleNavigate}
              onEventDrop={isMobile ? undefined : handleEventMove} // Desabilitar drag em mobile
              onEventResize={isMobile ? undefined : handleEventResize} // Desabilitar resize em mobile
              onDragStart={isMobile ? undefined : () => handleDragStart()}
              
              // Configurações adicionais para garantir seleção
              longPressThreshold={50} // Tempo curto para mobile
            
            // Personalização Visual
            eventPropGetter={eventStyleGetter}
            
            // Formatação de Texto
            messages={messages}
            formats={{
              timeGutterFormat: (date: Date) => format(date, 'HH:mm'),
              eventTimeRangeFormat: () => '', // Remove o horário do canto superior
              dayHeaderFormat: (date: Date) => format(date, "EEE dd MMM", { locale: ptBR }),
            }}
            
            // Remover toolbar padrão e header dos recursos
            components={{
              toolbar: () => null,
              resourceHeader: () => null, // Remove o cabeçalho padrão dos recursos
              timeSlotWrapper: TimeSlotWrapper, // Componente customizado para slots
              event: CustomEvent // Componente customizado para eventos
            }}
          />
        </div>
      </div>

      {/* Modais */}
      <AddActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        onSelectAgendamento={handleAgendamentoSelect}
        onSelectVenda={handleVendaSelect}
        isMobile={isMobile}
      />

      <VendaModal
        isOpen={isVendaModalOpen}
        onClose={() => setIsVendaModalOpen(false)}
        isMobile={isMobile}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        selectedDate={selectedDate}
        selectedTime={selectedBookingSlot?.time}
        selectedProfessional={selectedBookingSlot?.professional}
        isMobile={isMobile}
      />

      {/* Tooltip de detalhes do agendamento */}
      {tooltip.appointment && tooltip.isVisible && (
        <AppointmentTooltip
          appointment={{
            id: tooltip.appointment.id,
            start: tooltip.appointment.start,
            end: tooltip.appointment.end,
            client: tooltip.appointment.client,
            service: tooltip.appointment.service,
            services: (tooltip.appointment.services || []).map(service => ({
              ...service,
              duration: service.duration || 30 // fallback para 30 minutos
            })),
            professionalName: tooltip.appointment.professionalName || 'Profissional',
            status: tooltip.appointment.status,
            notes: tooltip.appointment.appointmentData.notes
          }}
          position={tooltip.position}
          isVisible={tooltip.isVisible}
        />
      )}
      
      {/* Modal de edição de agendamento */}
      {isEditModalOpen && (
        <EditAppointmentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedAppointmentId(null);
            // Atualizar agendamentos quando fechar o modal
            refreshAppointments();
          }}
          appointment={null}
          appointmentId={selectedAppointmentId}
        />
      )}
      
      {/* Modal de fechar comanda */}
      {isFecharComandaModalOpen && (
        <FecharComandaModal
          isOpen={isFecharComandaModalOpen}
          onClose={() => setIsFecharComandaModalOpen(false)}
          appointment={fecharComandaAppointment}
          appointmentDetails={fecharComandaDetails}
        />
      )}

      {/* Modal de seleção de profissional (mobile) */}
      {showProfessionalSelector && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 mobile-professional-selector"
          onClick={() => setShowProfessionalSelector(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-xs w-full mx-4 max-h-80 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <h3 className="text-base font-bold text-gray-900 text-center">Selecionar Profissional</h3>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {professionals?.map((professional) => (
                <button
                  key={professional.id}
                  onClick={() => {
                    setSelectedProfessionalId(professional.id);
                    setShowProfessionalSelector(false);
                  }}
                  className={`w-full flex items-center space-x-3 p-3 transition-all duration-200 mobile-professional-option ${
                    selectedProfessionalId === professional.id 
                      ? 'bg-indigo-50 border-r-4 border-indigo-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md"
                    style={{ backgroundColor: professional.color || '#6366f1' }}
                  >
                    {(() => {
                      const name = professional.name.replace('[Exemplo] ', '');
                      const names = name.split(' ');
                      if (names.length === 1) {
                        return names[0].substring(0, 2).toUpperCase();
                      }
                      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
                    })()}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-900 text-sm">
                      {professional.name.replace('[Exemplo] ', '')}
                    </p>
                  </div>
                  {selectedProfessionalId === professional.id && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="p-2 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowProfessionalSelector(false)}
                className="w-full px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium text-sm border border-gray-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}