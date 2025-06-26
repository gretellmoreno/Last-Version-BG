import React, { useState } from 'react';
import { User, Plus, ChevronDown, Check } from 'lucide-react';
import { useService } from '../../contexts/ServiceContext';
import { useProfessional } from '../../contexts/ProfessionalContext';

interface ServiceConfirmationProps {
  selectedClient: any;
  selectedServices: string[];
  serviceProfessionals: { serviceId: string; professionalId: string }[];
  onShowClientSelection: () => void;
  onBackToServices: () => void;
  onUpdateServiceProfessionals: (professionals: { serviceId: string; professionalId: string }[]) => void;
  onContinue: () => void;
  hasPreselectedDateTime?: boolean;
  isLoading?: boolean;
}

export default function ServiceConfirmation({
  selectedClient,
  selectedServices,
  serviceProfessionals,
  onShowClientSelection,
  onBackToServices,
  onUpdateServiceProfessionals,
  onContinue,
  hasPreselectedDateTime = false,
  isLoading = false
}: ServiceConfirmationProps) {
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const { services } = useService();
  const { professionals } = useProfessional();

  // Filtrar serviços selecionados
  const selectedServiceObjects = services?.filter(service => 
    selectedServices.includes(service.id)
  ) || [];

  const toggleDropdown = (serviceId: string) => {
    const newOpenDropdowns = new Set(openDropdowns);
    if (newOpenDropdowns.has(serviceId)) {
      newOpenDropdowns.delete(serviceId);
    } else {
      newOpenDropdowns.add(serviceId);
    }
    setOpenDropdowns(newOpenDropdowns);
  };

  const handleProfessionalSelect = (serviceId: string, professionalId: string) => {
    const newServiceProfessionals = serviceProfessionals.filter(sp => sp.serviceId !== serviceId);
    newServiceProfessionals.push({ serviceId, professionalId });
    console.log('👤 Profissional selecionado:', { serviceId, professionalId, newServiceProfessionals });
    onUpdateServiceProfessionals(newServiceProfessionals);
    
    // Fechar dropdown
    const newOpenDropdowns = new Set(openDropdowns);
    newOpenDropdowns.delete(serviceId);
    setOpenDropdowns(newOpenDropdowns);
  };

  const getSelectedProfessional = (serviceId: string) => {
    const serviceProfessional = serviceProfessionals.find(sp => sp.serviceId === serviceId);
    if (serviceProfessional) {
      return professionals?.find(p => p.id === serviceProfessional.professionalId);
    }
    return null;
  };

  const calculateTotal = () => {
    return selectedServiceObjects.reduce((total, service) => total + service.price, 0);
  };

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

  const allProfessionalsSelected = selectedServices.every(serviceId => 
    serviceProfessionals.some(sp => sp.serviceId === serviceId)
  );

  return (
    <div className="flex h-full">
      {/* Sidebar esquerda com cliente */}
      <div className="w-48 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-6 flex flex-col items-center text-center">
          {selectedClient ? (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-green-600 font-semibold text-lg">
                {selectedClient.nome.charAt(0).toUpperCase()}
              </span>
            </div>
          ) : (
            <button
              onClick={onShowClientSelection}
              className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 cursor-pointer hover:bg-purple-200 transition-colors relative group"
            >
              <User size={28} className="text-purple-600" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                <Plus size={14} className="text-white" />
              </div>
            </button>
          )}
          
          <div>
            {selectedClient ? (
              <>
                <h3 className="font-semibold text-gray-900 text-base mb-1">{selectedClient.nome}</h3>
                <p className="text-sm text-gray-500">Cliente selecionado</p>
                <button
                  onClick={onShowClientSelection}
                  className="text-xs text-indigo-600 hover:text-indigo-700 mt-2"
                >
                  Alterar cliente
                </button>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-gray-900 text-base mb-1">Adicionar cliente</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Ou deixe vazio se não há cadastro</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Confirmar serviços</h2>
          <p className="text-gray-600">Selecione o profissional para cada serviço</p>
        </div>

        {/* Lista de serviços */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {selectedServiceObjects.map((service) => {
              const selectedProfessional = getSelectedProfessional(service.id);
              const isOpen = openDropdowns.has(service.id);
              
              return (
                <div key={service.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{service.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>{formatDuration(service.estimated_time)}</span>
                        <span className="font-semibold text-gray-900">R$ {service.price.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Seleção de profissional */}
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(service.id)}
                      className={`
                        w-full flex items-center justify-between p-3 border rounded-lg transition-colors
                        ${selectedProfessional 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-gray-300 hover:border-gray-400 bg-white'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        {selectedProfessional ? (
                          <>
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 font-medium text-sm">
                                {selectedProfessional.name.charAt(0)}
                              </span>
                            </div>
                            <span className="text-green-800 font-medium">{selectedProfessional.name}</span>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <User size={16} className="text-gray-400" />
                            </div>
                            <span className="text-gray-500">Selecionar profissional</span>
                          </>
                        )}
                      </div>
                      <ChevronDown 
                        size={16} 
                        className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                      />
                    </button>

                    {/* Dropdown */}
                    {isOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                        {professionals?.map((professional) => (
                          <button
                            key={professional.id}
                            onClick={() => handleProfessionalSelect(service.id, professional.id)}
                            className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 font-medium text-sm">
                                {professional.name.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-medium text-gray-900">{professional.name}</div>
                            </div>
                            {selectedProfessional?.id === professional.id && (
                              <Check size={16} className="text-green-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Botão Adicionar Serviço */}
            <button
              onClick={onBackToServices}
              className="inline-flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer transition-all hover:border-indigo-400 hover:bg-indigo-50 text-indigo-600 text-sm"
            >
              <Plus size={16} />
              <span className="font-medium">Adicionar serviço</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">
                {selectedServices.length} serviço(s) selecionado(s)
              </div>
              <div className="text-lg font-semibold text-gray-900">
                Total: R$ {calculateTotal().toFixed(2).replace('.', ',')}
              </div>
            </div>

            <button
              onClick={() => {
                console.log('🎯 ServiceConfirmation - botão clicado!', { hasPreselectedDateTime, allProfessionalsSelected });
                onContinue();
              }}
              disabled={!allProfessionalsSelected || isLoading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading 
                ? 'Salvando...' 
                : hasPreselectedDateTime 
                  ? 'Salvar agendamento' 
                  : 'Continuar'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}