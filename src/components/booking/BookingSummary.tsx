import React from 'react';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Clock from 'lucide-react/dist/esm/icons/clock';
import User from 'lucide-react/dist/esm/icons/user';
import Scissors from 'lucide-react/dist/esm/icons/scissors';
import Package from 'lucide-react/dist/esm/icons/package';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import { useService } from '../../contexts/ServiceContext';
import { useProfessional } from '../../contexts/ProfessionalContext';
import { useProduct } from '../../contexts/ProductContext';

interface BookingSummaryProps {
  selectedServices: string[];
  selectedProducts: string[];
  selectedClient: any | null;
  serviceProfessionals: Array<{ serviceId: string; professionalId: string }>;
  bookingDate: Date;
  bookingTime: string;
  isMobile?: boolean;
}

export default function BookingSummary({
  selectedServices,
  selectedProducts,
  selectedClient,
  serviceProfessionals,
  bookingDate,
  bookingTime,
  isMobile = false
}: BookingSummaryProps) {
  const { services } = useService();
  const { professionals } = useProfessional();
  const { products } = useProduct();

  // Calcular valores totais
  const totalServicePrice = selectedServices.reduce((total, serviceId) => {
    const service = services?.find(s => s.id === serviceId);
    return total + (service?.price || 0);
  }, 0);

  const totalProductPrice = selectedProducts.reduce((total, productId) => {
    const product = products?.find(p => p.id === productId);
    return total + (product?.price || 0);
  }, 0);

  const totalPrice = totalServicePrice + totalProductPrice;

  const totalDuration = selectedServices.reduce((total, serviceId) => {
    const service = services?.find(s => s.id === serviceId);
    return total + (service?.estimated_time || 0);
  }, 0);

  // Formatação de duração
  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours}h`;
      }
      return `${hours}h ${remainingMinutes}min`;
    }
    return `${minutes}min`;
  };

  // Formatação de data
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long'
    });
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${isMobile ? 'p-4' : 'p-6'}`}>
      <h3 className={`font-semibold text-gray-900 mb-4 ${isMobile ? 'text-base' : 'text-lg'}`}>
        Resumo do Agendamento
      </h3>

      <div className="space-y-4">
        {/* Data e Horário */}
        <div className="flex items-start space-x-3">
          <Calendar className="text-indigo-600 mt-1" size={18} />
          <div>
            <p className={`font-medium text-gray-900 ${isMobile ? 'text-sm' : ''}`}>
              {formatDate(bookingDate)}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <Clock size={14} className="text-gray-500" />
              <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {bookingTime} ({formatDuration(totalDuration)})
              </p>
            </div>
          </div>
        </div>

        {/* Cliente */}
        <div className="flex items-start space-x-3">
          <User className="text-indigo-600 mt-1" size={18} />
          <div>
            <p className={`font-medium text-gray-900 ${isMobile ? 'text-sm' : ''}`}>
              {selectedClient?.nome || selectedClient?.name || 'Cliente não selecionado'}
            </p>
            {selectedClient?.telefone && (
              <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {selectedClient.telefone}
              </p>
            )}
          </div>
        </div>

        {/* Serviços */}
        {selectedServices.length > 0 && (
          <div className="flex items-start space-x-3">
            <Scissors className="text-indigo-600 mt-1" size={18} />
            <div className="flex-1">
              <p className={`font-medium text-gray-900 mb-2 ${isMobile ? 'text-sm' : ''}`}>
                Serviços ({selectedServices.length})
              </p>
              <div className="space-y-2">
                {selectedServices.map(serviceId => {
                  const service = services?.find(s => s.id === serviceId);
                  const professional = serviceProfessionals.find(sp => sp.serviceId === serviceId);
                  const prof = professional ? professionals?.find(p => p.id === professional.professionalId) : null;
                  
                  return (
                    <div key={serviceId} className={`bg-gray-50 rounded-lg p-3 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{service?.name || 'Serviço'}</p>
                          {prof && (
                            <div className="flex items-center space-x-1 mt-1">
                              <MapPin size={12} className="text-gray-400" />
                              <p className="text-gray-600">{prof.name.replace('[Exemplo] ', '')}</p>
                            </div>
                          )}
                          <p className="text-gray-500 mt-1">
                            {formatDuration(service?.estimated_time || 0)}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          R$ {(service?.price || 0).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Produtos */}
        {selectedProducts.length > 0 && (
          <div className="flex items-start space-x-3">
            <Package className="text-indigo-600 mt-1" size={18} />
            <div className="flex-1">
              <p className={`font-medium text-gray-900 mb-2 ${isMobile ? 'text-sm' : ''}`}>
                Produtos ({selectedProducts.length})
              </p>
              <div className="space-y-2">
                {selectedProducts.map(productId => {
                  const product = products?.find(p => p.id === productId);
                  
                  return (
                    <div key={productId} className={`bg-gray-50 rounded-lg p-3 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-gray-900">{product?.name || 'Produto'}</p>
                        <p className="font-semibold text-gray-900">
                          R$ {(product?.price || 0).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Total */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center">
            <p className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>
              Total
            </p>
            <p className={`font-bold text-indigo-600 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              R$ {totalPrice.toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 