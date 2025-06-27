import React, { useState, useEffect } from 'react';
import { X, Clock, User, Calendar, FileText, DollarSign } from 'lucide-react';
import { supabaseService } from '../lib/supabaseService';
import { useApp } from '../contexts/AppContext';
import { AppointmentDetails } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string | null;
}

export default function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointmentId
}: AppointmentDetailsModalProps) {
  const [details, setDetails] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentSalon } = useApp();

  // Buscar detalhes do agendamento
  useEffect(() => {
    const fetchDetails = async () => {
      if (!isOpen || !appointmentId || !currentSalon?.id) return;

      setLoading(true);
      setError(null);

      try {
        const { data, error: rpcError } = await supabaseService.appointments.getDetails(
          appointmentId,
          currentSalon.id
        );

        if (rpcError) {
          setError(rpcError);
          return;
        }

        if (data?.success) {
          setDetails(data);
        } else {
          setError('Agendamento não encontrado');
        }
      } catch (err) {
        setError('Erro ao carregar detalhes do agendamento');
        console.error('Erro ao buscar detalhes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [isOpen, appointmentId, currentSalon?.id]);

  // Limpar dados ao fechar
  useEffect(() => {
    if (!isOpen) {
      setDetails(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (time: string) => {
    if (!time) return '';
    return time.slice(0, 5); // Remove seconds
  };

  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'agendado': 'Agendado',
      'confirmado': 'Confirmado', 
      'em_andamento': 'Em Andamento',
      'finalizado': 'Finalizado',
      'cancelado': 'Cancelado',
      'nao_compareceu': 'Não Compareceu'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'agendado': 'bg-blue-100 text-blue-800',
      'confirmado': 'bg-green-100 text-green-800',
      'em_andamento': 'bg-yellow-100 text-yellow-800',
      'finalizado': 'bg-gray-100 text-gray-800',
      'cancelado': 'bg-red-100 text-red-800',
      'nao_compareceu': 'bg-orange-100 text-orange-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const calculateTotal = () => {
    if (!details?.appointment.services) return 0;
    return details.appointment.services.reduce((total, service) => total + service.price, 0);
  };

  const calculateDuration = () => {
    if (!details?.appointment.services) return 0;
    return details.appointment.services.reduce((total, service) => total + service.duration, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Detalhes do Agendamento
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Carregando detalhes...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {details?.appointment && !loading && (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Data</p>
                      <p className="font-medium">
                        {format(new Date(details.appointment.date), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Horário</p>
                      <p className="font-medium">
                        {formatTime(details.appointment.start_time)}
                        {details.appointment.end_time && 
                          ` - ${formatTime(details.appointment.end_time)}`
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Cliente</p>
                      <p className="font-medium">{details.appointment.client.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: details.appointment.professional.color }}
                    ></div>
                    <div>
                      <p className="text-sm text-gray-600">Profissional</p>
                      <p className="font-medium">{details.appointment.professional.name}</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(details.appointment.status)}`}>
                      {formatStatus(details.appointment.status)}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Duração Total</p>
                    <p className="font-medium">{calculateDuration()} min</p>
                  </div>
                </div>
              </div>

              {/* Serviços */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Serviços</h3>
                <div className="space-y-3">
                  {details.appointment.services.map((service, index) => (
                    <div key={service.id} className="bg-white border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                          <p className="text-sm text-gray-600">{service.duration} minutos</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            R$ {service.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <span className="text-lg font-medium text-blue-900">Total</span>
                  </div>
                  <span className="text-xl font-bold text-blue-900">
                    R$ {calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Observações */}
              {details.appointment.notes && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-900">Observações</h3>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {details.appointment.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
} 