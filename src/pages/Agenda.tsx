import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast, { Toaster } from 'react-hot-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import Header from '../components/Header';
import BookingModal from '../components/BookingModal';
import AddActionModal from '../components/AddActionModal';
import VendaModal from '../components/VendaModal';
import AppointmentTooltip from '../components/AppointmentTooltip';
import { useBooking } from '../contexts/BookingContext';
import { useProfessional } from '../contexts/ProfessionalContext';
import { useClient } from '../contexts/ClientContext';
import { Appointment } from '../types';

// Configuração do localizador em português
const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

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
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId: string;
  client: string;
  service: string;
  status: string;
  professionalName?: string;
  appointmentData: Appointment;
}

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

export default function Agenda() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.DAY);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isVendaModalOpen, setIsVendaModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedBookingSlot, setSelectedBookingSlot] = useState<{
    time: string;
    professional: string;
  } | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  
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
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { appointments, refreshAppointments } = useBooking();
  const { professionals } = useProfessional();
  const { clients } = useClient();

  // Funções para controlar o tooltip
  const handleEventMouseEnter = useCallback((event: CalendarEvent, mouseEvent: React.MouseEvent) => {
    // Limpar timeouts anteriores
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    // Definir novo timeout muito rápido para mostrar tooltip
    hoverTimeoutRef.current = setTimeout(() => {
      const professional = professionals?.find(p => p.id === event.resourceId);
      
      setTooltip({
        isVisible: true,
        appointment: {
          ...event,
          professionalName: professional ? professional.name.replace('[Exemplo] ', '') : 'Profissional'
        },
        position: {
          x: mouseEvent.clientX,
          y: mouseEvent.clientY
        }
      });
    }, 300); // 300ms de delay
  }, [professionals]);

  const handleEventMouseLeave = useCallback(() => {
    // Limpar timeout de mostrar
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Definir timeout para esconder (pequeno delay para suavizar)
    hideTimeoutRef.current = setTimeout(() => {
      setTooltip(prev => ({ ...prev, isVisible: false }));
    }, 100);
  }, []);

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
      const calendarResources = professionals.map(prof => ({
        id: prof.id,
        title: prof.name.replace('[Exemplo] ', '')
      }));
      setResources(calendarResources);
    }
  }, [professionals]);

  // Converter agendamentos para eventos do calendário
  useEffect(() => {
    if (appointments && appointments.length > 0 && professionals && clients) {
      const calendarEvents: CalendarEvent[] = appointments.map(appointment => {
        // Encontrar profissional
        const professional = professionals.find(p => p.id === appointment.professional_id);
        const professionalName = professional ? professional.name.replace('[Exemplo] ', '') : 'Profissional';

        // Encontrar cliente
        const client = clients.find(c => c.id === appointment.client_id);
        const clientName = client ? client.name : 'Cliente';

        // Criar data/hora de início
        const startDateTime = new Date(`${appointment.date}T${appointment.start_time}`);
        
        // Estimar duração (1 hora por padrão, pode ser ajustado)
        const endDateTime = addMinutes(startDateTime, 60);

        return {
          id: appointment.id,
          title: '', // Remover título para evitar tooltip nativo
          start: startDateTime,
          end: endDateTime,
          resourceId: appointment.professional_id,
          client: clientName,
          service: appointment.notes || '', // Usar notes como serviço
          status: appointment.status,
          appointmentData: appointment
        };
      });

      setEvents(calendarEvents);
    }
  }, [appointments, professionals, clients]);

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
        opacity,
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
    toast(`Agendamento: ${event.client} - ${format(event.start, 'HH:mm')}`);
  }, []);

  // Manipulador de navegação de datas
  const handleNavigate = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  // Manipuladores dos modais
  const handleAddClick = () => {
    setIsActionModalOpen(true);
  };

  const handleAgendamentoSelect = () => {
    setSelectedBookingSlot(null);
    setIsBookingModalOpen(true);
  };

  const handleVendaSelect = () => {
    setIsVendaModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedBookingSlot(null);
    // Recarregar agendamentos após fechar modal
    refreshAppointments();
  };

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
          display: 'block'
        }}
      >
        {children}
      </div>
    );
  };

  // Componente customizado para renderizar eventos
  const CustomEvent = ({ event }: { event: CalendarEvent }) => {
    const professional = professionals?.find(p => p.id === event.resourceId);
    const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60); // duração em minutos
    const isShort = duration < 45; // Se menos de 45 minutos, layout compacto
    const isVeryShort = duration < 30; // Se menos de 30 minutos, layout muito compacto
    
    const handleEventMouseEnterLocal = (e: React.MouseEvent) => {
      // Impedir propagação para não ativar hover do slot
      e.stopPropagation();
      handleEventMouseEnter(event, e);
    };

    const handleEventMouseLeaveLocal = (e: React.MouseEvent) => {
      // Impedir propagação
      e.stopPropagation();
      handleEventMouseLeave();
    };
    
    return (
      <div 
        className="w-full h-full flex flex-col justify-start text-black p-1 cursor-pointer relative z-10"
        onMouseEnter={handleEventMouseEnterLocal}
        onMouseLeave={handleEventMouseLeaveLocal}
        title="" // Remover qualquer tooltip nativo
        style={{ 
          // Garantir que o evento cubra completamente o slot
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10
        }}
      >
        {/* Horário - bem no começo, compacto */}
        <div className="text-xs font-semibold leading-tight">
          {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
        </div>
        
        {/* Nome do cliente - logo em seguida, sem margem */}
        <div className={`font-semibold truncate leading-tight ${isVeryShort ? 'text-xs' : 'text-sm'}`}>
          {event.client}
        </div>
        
        {/* Serviços - compacto, só mostra se tem espaço e conteúdo */}
        {!isVeryShort && event.service && event.service.trim() && (
          <div className="text-xs truncate leading-tight">
            {event.service}
          </div>
        )}
      </div>
    );
  };



  return (
    <div className="flex-1 flex flex-col h-full">
      <Toaster position="top-right" />
      
      <Header 
        title="Agenda do Dia"
        hasDateNavigation={true}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onAddClick={handleAddClick}
      />
      
      {/* Cabeçalho fixo dos profissionais */}
      {professionals && professionals.length > 0 && (
        <ProfessionalsHeader professionals={professionals} />
      )}
      
      {/* Calendário */}
      <div className="flex-1 bg-white overflow-auto">
        <div className="h-full min-h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            view={currentView}
            onView={setCurrentView}
            date={selectedDate}
            defaultView={Views.DAY}
            views={['day']}
            step={15}
            timeslots={4}
            min={minTime}
            max={maxTime}
            resources={resources}
            resourceIdAccessor="id"
            resourceTitleAccessor="title"
            rtl={false}
            className="barber-calendar"
            
            // Funcionalidades de Interação
            selectable
            
            // Event Handlers
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onNavigate={handleNavigate}
            
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
      />

      <VendaModal
        isOpen={isVendaModalOpen}
        onClose={() => setIsVendaModalOpen(false)}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        selectedDate={selectedDate}
        selectedTime={selectedBookingSlot?.time}
        selectedProfessional={selectedBookingSlot?.professional}
      />

      {/* Tooltip de detalhes do agendamento */}
      {tooltip.appointment && (
        <AppointmentTooltip
          appointment={{
            id: tooltip.appointment.id,
            start: tooltip.appointment.start,
            end: tooltip.appointment.end,
            client: tooltip.appointment.client,
            service: tooltip.appointment.service,
            professionalName: tooltip.appointment.professionalName || 'Profissional',
            status: tooltip.appointment.status,
            notes: tooltip.appointment.appointmentData.notes
          }}
          position={tooltip.position}
          isVisible={tooltip.isVisible}
        />
      )}
    </div>
  );
}