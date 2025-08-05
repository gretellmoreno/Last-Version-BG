import React from 'react';
import X from 'lucide-react/dist/esm/icons/x';
import User from 'lucide-react/dist/esm/icons/user';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Scissors from 'lucide-react/dist/esm/icons/scissors';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Package from 'lucide-react/dist/esm/icons/package';
import { useApp } from '../contexts/AppContext';
import { useAppointmentDetails } from '../hooks/useAppointmentDetails';

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
  const { currentSalon } = useApp();

  // Hook customizado - ainda mais simples que o useQuery direto!
  const details = useAppointmentDetails(
    appointmentId,
    currentSalon?.id || null,
    isOpen // Só executar quando modal estiver aberto
  );
  const appointment = details.appointment;
  const client = details.client;
  const professional = details.professional;
  const services = details.services;
  const totalPrice = details.totalPrice;
  const formattedDate = details.formattedDate;
  const formattedStartTime = details.formattedStartTime;
  const formattedEndTime = details.formattedEndTime;
  const isLoading = details.isLoading;
  const isError = details.isError;
  const error = details.error;
  const hasData = details.hasData;
  const appointmentDetails = details.data;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Resumo do Agendamento</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        {/* Content */}
        <div className="px-4 py-3">
          {/* Mensagem de comanda fechada - sempre mostrar quando o modal abrir */}
          {hasData && appointment && (
            <div className="mb-2 p-2 bg-green-100 text-green-800 rounded text-center font-semibold text-base flex items-center justify-center gap-2">
              <CheckCircle size={18} className="text-green-600" />
              Comanda fechada
            </div>
          )}
          
          {/* Loading State - muito mais simples! */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Carregando detalhes...</span>
            </div>
          )}

          {/* Error State - tratamento de erro automático */}
          {isError && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-red-800 mb-2">Erro ao carregar detalhes</h3>
                <p className="text-red-600">
                  {error instanceof Error ? error.message : 'Erro inesperado ao carregar detalhes do agendamento'}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          )}

          {/* Success State - dados automaticamente disponíveis e pré-processados! */}
          {hasData && appointment && !isLoading && !isError && (
            <div className="space-y-6">
              {/* Status e Data */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center">
                    <CheckCircle size={14} className="text-green-600 mr-1" />
                    Finalizado
                  </span>
                </div>
                <div className="flex items-center text-gray-600 text-xs">
                  <Calendar size={14} className="mr-1" />
                  <span>{formattedDate}</span>
                </div>
              </div>

              {/* Cliente */}
              <div className="bg-gray-50 rounded p-2 mb-2">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{client?.name}</h3>
                    {/* Removido ID do cliente */}
                  </div>
                </div>
              </div>

              {/* Profissional e Horário */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <div className="bg-gray-50 rounded p-2">
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Profissional</p>
                      <p className="font-medium text-gray-900 text-sm">
                        {professional?.name.replace('[Exemplo] ', '')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <div className="flex items-center space-x-2">
                    <Clock size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Horário</p>
                      <p className="font-medium text-gray-900 text-sm">
                        {formattedStartTime} - {formattedEndTime || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Serviços */}
              {services && services.length > 0 && (
                <div className="mb-2">
                  <h3 className="font-medium text-gray-900 mb-1 flex items-center text-sm">
                    <Scissors size={16} className="mr-1 text-gray-400" />
                    Serviços ({services.length})
                  </h3>
                  <div className="space-y-1">
                    {services.map((service, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded p-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">{service.name}</h4>
                            {/* Removido tempo de duração */}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 text-sm">
                              R$ {service.price.toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Produtos vendidos */}
              {appointmentDetails?.appointment?.products && appointmentDetails.appointment.products.length > 0 && (
                <div className="mb-2">
                  <h3 className="font-medium text-gray-900 mb-1 flex items-center text-sm">
                    <Package size={16} className="mr-1 text-gray-400" />
                    Produtos vendidos ({appointmentDetails.appointment.products.length})
                  </h3>
                  <div className="space-y-1">
                    {(appointmentDetails.appointment.products as Array<any>).map((product: any, idx: number) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded p-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">{product.product_name || product.name}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">Qtd: {product.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 text-sm">
                              R$ {(product.unit_price * product.quantity).toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-gray-900">Total</span>
                  <span className="text-base font-bold text-indigo-600">
                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Observações */}
              {appointment.notes && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Observações</h3>
                  <p className="text-gray-600 bg-gray-50 rounded-lg p-3">
                    {appointment.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Rodapé de ações */}
        {hasData && appointment && !isLoading && !isError && (
          <div className="flex items-center justify-end gap-2 px-4 pb-4 pt-2 border-t border-gray-100 bg-white">
            {/* Aqui ficariam outros botões, ex: Cancelar, Fechar Comanda, etc */}
          </div>
        )}
      </div>
    </div>
  );
} 