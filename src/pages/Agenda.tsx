import React, { useState, useEffect, useCallback } from 'react';
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
  isDraggable?: boolean;
  status: string;
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

  const { appointments, loading: bookingLoading, refreshAppointments } = useBooking();
  const { professionals } = useProfessional();
  const { clients } = useClient();

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
          title: clientName,
          start: startDateTime,
          end: endDateTime,
          resourceId: appointment.professional_id,
          client: clientName,
          service: appointment.notes || 'Serviço', // Usar notes como serviço temporariamente
          status: appointment.status,
          isDraggable: appointment.status !== 'cancelado',
          appointmentData: appointment
        };
      });

      setEvents(calendarEvents);
    }
  }, [appointments, professionals, clients]);

  // Estilo dos eventos baseado no status
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad';
    let borderColor = '#265a87';
    
    // Cores baseadas no status
    switch (event.status) {
      case 'agendado':
        backgroundColor = '#2563eb';
        borderColor = '#1d4ed8';
        break;
      case 'confirmado':
        backgroundColor = '#059669';
        borderColor = '#047857';
        break;
      case 'em_andamento':
        backgroundColor = '#dc2626';
        borderColor = '#b91c1c';
        break;
      case 'concluido':
        backgroundColor = '#16a34a';
        borderColor = '#15803d';
        break;
      case 'cancelado':
        backgroundColor = '#6b7280';
        borderColor = '#4b5563';
        break;
    }
    
    return {
      style: {
        backgroundColor,
        borderColor,
        color: '#ffffff',
        border: `2px solid ${borderColor}`,
        borderRadius: '4px',
        fontSize: '12px',
        padding: '2px 4px'
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

  // Componente customizado para eventos
  const EventComponent = ({ event }: { event: CalendarEvent }) => (
    <div className="h-full w-full flex flex-col justify-center">
      <div className="font-medium text-xs truncate">{event.client}</div>
      {event.service && (
        <div className="text-xs opacity-90 truncate">{event.service}</div>
      )}
      <div className="text-xs opacity-75">
        {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
      </div>
    </div>
  );

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
      
      {/* Calendário */}
      <div className="flex-1 p-4 bg-white">
        <div className="h-full">
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
              eventTimeRangeFormat: ({ start }: { start: Date }) => `${format(start, 'HH:mm')}`,
              dayHeaderFormat: (date: Date) => format(date, "EEE dd MMM", { locale: ptBR }),
            }}
            
            // Remover toolbar padrão
            components={{
              toolbar: () => null
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
    </div>
  );
}