import React, { useState } from 'react';
import Header from '../components/Header';
import BookingModal from '../components/BookingModal';
import { useBooking } from '../contexts/BookingContext';
import { useProfessional } from '../contexts/ProfessionalContext';
import { formatDuration } from '../utils/bookingUtils';

// Gerar horários de 15 em 15 minutos das 8:00 às 18:00
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 18 && minute > 0) break; // Para em 18:00
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push({
        time: timeString,
        hour: hour,
        minute: minute,
        isHourMark: minute === 0
      });
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

export default function Agenda() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBookingSlot, setSelectedBookingSlot] = useState<{
    time: string;
    professional: string;
  } | null>(null);

  const { agendamentos } = useBooking();
  const { professionals } = useProfessional();

  // Filtrar agendamentos para a data selecionada
  const todayBookings = agendamentos.filter(agendamento => {
    const agendamentoDate = new Date(agendamento.data);
    return agendamentoDate.toDateString() === selectedDate.toDateString();
  });

  // Função para verificar se um slot tem agendamento
  const getBookingForSlot = (time: string, professionalId: string) => {
    return todayBookings.find(agendamento => {
      if (agendamento.profissionalId !== professionalId) return false;
      
      const agendamentoInicio = agendamento.horarioInicio;
      const agendamentoFim = agendamento.horarioFim;
      
      // Converter horários para minutos para comparação
      const timeToMinutes = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      const slotMinutes = timeToMinutes(time);
      const inicioMinutes = timeToMinutes(agendamentoInicio);
      const fimMinutes = timeToMinutes(agendamentoFim);
      
      return slotMinutes >= inicioMinutes && slotMinutes < fimMinutes;
    });
  };

  // Função para calcular quantos slots o agendamento ocupa
  const getBookingSpan = (agendamento: any) => {
    const timeToMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const inicioMinutes = timeToMinutes(agendamento.horarioInicio);
    const fimMinutes = timeToMinutes(agendamento.horarioFim);
    const durationMinutes = fimMinutes - inicioMinutes;
    
    return Math.ceil(durationMinutes / 15); // Cada slot é de 15 minutos
  };

  // Função para verificar se é o primeiro slot do agendamento
  const isFirstSlotOfBooking = (time: string, agendamento: any) => {
    return time === agendamento.horarioInicio;
  };

  const handleSlotClick = (time: string, professionalName: string) => {
    setSelectedBookingSlot({ time, professional: professionalName });
    setIsBookingModalOpen(true);
  };

  const handleBookingClick = () => {
    setSelectedBookingSlot(null);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <Header 
        title="Agenda do Dia"
        hasDateNavigation={true}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        action={{
          label: 'Agendar',
          onClick: handleBookingClick
        }}
      />
      
      <div className="flex-1 bg-gray-50 p-6 overflow-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header da tabela */}
          <div className="grid border-b border-gray-200 bg-gray-50/50" style={{ gridTemplateColumns: '60px repeat(3, 1fr)' }}>
            <div className="p-2 border-r border-gray-200 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center leading-tight">
                HORÁRIO
              </span>
            </div>
            {professionals.map((prof) => (
              <div key={prof.id} className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0 text-center">
                {prof.name}
              </div>
            ))}
          </div>

          {/* Slots de horários */}
          {timeSlots.map((slot, index) => {
            // Apenas horários redondos (00 minutos) E não o primeiro slot (8:00) devem ter borda superior escura
            const shouldHaveTopBorder = slot.minute === 0 && index > 0;
            
            return (
              <div 
                key={slot.time} 
                className={`
                  grid last:border-b-0
                  ${shouldHaveTopBorder ? 'border-t border-gray-300' : ''}
                  ${!shouldHaveTopBorder ? 'border-b border-gray-100' : ''}
                `} 
                style={{ 
                  gridTemplateColumns: '60px repeat(3, 1fr)',
                  height: '24px'
                }}
              >
                {/* Coluna de horário */}
                <div className={`
                  border-r border-gray-200 flex items-center justify-center px-1
                  ${slot.isHourMark ? 'bg-gray-50/50' : 'bg-white'}
                  transition-colors
                `}>
                  {slot.isHourMark ? (
                    <span className="text-xs font-medium text-gray-700 tabular-nums">
                      {slot.time}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 font-normal tabular-nums">
                      {slot.minute.toString().padStart(2, '0')}
                    </span>
                  )}
                </div>

                {/* Colunas dos profissionais */}
                {professionals.map((prof) => {
                  const booking = getBookingForSlot(slot.time, prof.id);
                  const isFirstSlot = booking && isFirstSlotOfBooking(slot.time, booking);
                  
                  if (booking && !isFirstSlot) {
                    // Slot ocupado mas não é o primeiro - não renderizar nada
                    return (
                      <div 
                        key={prof.id} 
                        className="border-r border-gray-200 last:border-r-0 bg-blue-100"
                      />
                    );
                  }
                  
                  if (booking && isFirstSlot) {
                    // Primeiro slot do agendamento - renderizar o card
                    const span = getBookingSpan(booking);
                    return (
                      <div 
                        key={prof.id} 
                        className="border-r border-gray-200 last:border-r-0 relative"
                        style={{ gridRow: `span ${span}` }}
                      >
                        <div className="absolute inset-0 bg-blue-500 text-white p-2 rounded-sm m-0.5 flex flex-col justify-center">
                          <div className="text-xs font-medium truncate">
                            {booking.clienteNome}
                          </div>
                          <div className="text-xs opacity-90 truncate">
                            {booking.servicoNomes.join(', ')}
                          </div>
                          <div className="text-xs opacity-75">
                            {booking.horarioInicio} - {booking.horarioFim}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  // Slot vazio - clicável
                  return (
                    <div 
                      key={prof.id} 
                      className={`
                        border-r border-gray-200 last:border-r-0 
                        hover:bg-purple-100 transition-all duration-150 cursor-pointer
                        group relative h-full flex items-center
                      `}
                      onClick={() => handleSlotClick(slot.time, prof.name)}
                    >
                      {/* Conteúdo do slot com hover que mostra o horário no canto esquerdo */}
                      <div className="w-full h-full flex items-center relative">
                        {/* Horário que aparece no hover no canto esquerdo */}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-purple-700 ml-2">
                          {slot.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de agendamento */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        selectedDate={selectedDate}
        selectedTime={selectedBookingSlot?.time}
        selectedProfessional={selectedBookingSlot?.professional}
      />
    </div>
  );
}