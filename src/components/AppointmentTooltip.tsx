import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Clock from 'lucide-react/dist/esm/icons/clock';
import User from 'lucide-react/dist/esm/icons/user';
import Scissors from 'lucide-react/dist/esm/icons/scissors';
import Calendar from 'lucide-react/dist/esm/icons/calendar';

interface AppointmentTooltipProps {
  appointment: {
    id: string;
    start: Date;
    end: Date;
    client: string;
    service: string;
    services?: Array<{
      id: string;
      name: string;
      price: number;
      duration: number;
    }>;
    professionalName: string;
    status: string;
    notes?: string;
  };
  position: { x: number; y: number };
  isVisible: boolean;
}

export default function AppointmentTooltip({ 
  appointment, 
  position, 
  isVisible 
}: AppointmentTooltipProps) {
  if (!isVisible) return null;

  // Verificação adicional para garantir posição válida
  const safePosition = {
    x: Math.max(0, Math.min(position.x, window.innerWidth - 320)),
    y: Math.max(0, Math.min(position.y, window.innerHeight - 300))
  };

  const duration = Math.round((appointment.end.getTime() - appointment.start.getTime()) / (1000 * 60));
  const startTime = format(appointment.start, 'HH:mm');
  const endTime = format(appointment.end, 'HH:mm');
  const date = format(appointment.start, "d 'de' MMMM", { locale: ptBR });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'agendado':
        return { label: 'Agendado', color: 'bg-blue-100 text-blue-800' };
      case 'confirmado':
        return { label: 'Confirmado', color: 'bg-green-100 text-green-800' };
      case 'em_andamento':
        return { label: 'Em andamento', color: 'bg-yellow-100 text-yellow-800' };
      case 'concluido':
        return { label: 'Concluído', color: 'bg-gray-100 text-gray-800' };
      case 'cancelado':
        return { label: 'Cancelado', color: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Agendado', color: 'bg-blue-100 text-blue-800' };
    }
  };

  const statusInfo = getStatusInfo(appointment.status);

  return (
    <div 
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 transition-all duration-200 ease-out"
      style={{
        left: safePosition.x,
        top: safePosition.y,
        maxHeight: '90vh',
        overflow: 'auto',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-10px)',
        pointerEvents: isVisible ? 'auto' : 'none',
        backfaceVisibility: 'hidden', // Evita borramento
        WebkitBackfaceVisibility: 'hidden', // Para Safari
        WebkitFontSmoothing: 'antialiased', // Melhora a renderização da fonte
        MozOsxFontSmoothing: 'grayscale' // Para Firefox no macOS
      }}
      onMouseEnter={(e) => {
        e.stopPropagation();
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
      }}
    >
      {/* Header com horário */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Clock size={16} className="text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {startTime} - {endTime}
            </div>
            <div className="text-xs text-gray-500">
              {duration} minutos
            </div>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </div>
      </div>

      {/* Informações do cliente */}
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <User size={14} className="text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              {appointment.client || 'Sem reserva'}
            </div>
            <div className="text-xs text-gray-500">Cliente</div>
          </div>
        </div>

        {/* Serviços */}
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Scissors size={14} className="text-green-600" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">Serviços</div>
            {appointment.services && appointment.services.length > 0 ? (
              <div className="space-y-1">
                {appointment.services.map((service, index) => (
                  <div key={service.id} className="flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {service.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      R$ {service.price.toFixed(2)} • {service.duration}min
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm font-medium text-gray-900">
                {appointment.service || 'Serviço não especificado'}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              {appointment.professionalName}
            </div>
          </div>
        </div>

        {/* Data */}
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Calendar size={14} className="text-orange-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">{date}</div>
            <div className="text-xs text-gray-500">Data do agendamento</div>
          </div>
        </div>

        {/* Observações, se houver */}
        {appointment.notes && (
          <div className="mt-3 p-2 bg-gray-50 rounded-md">
            <div className="text-xs font-medium text-gray-700 mb-1">Observações:</div>
            <div className="text-xs text-gray-600">{appointment.notes}</div>
          </div>
        )}
      </div>
    </div>
  );
} 