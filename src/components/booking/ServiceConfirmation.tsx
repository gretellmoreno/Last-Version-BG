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
  const [isProfessionalDropdownOpen, setIsProfessionalDropdownOpen] = useState(false);
  const { services } = useService();
  const { professionals } = useProfessional();

  // Filtrar serviços selecionados
  const selectedServiceObjects = services?.filter(service => 
    selectedServices.includes(service.id)
  ) || [];

  // Obter o profissional selecionado (todos os serviços usam o mesmo)
  const getSelectedProfessional = () => {
    if (serviceProfessionals.length > 0) {
      const professionalId = serviceProfessionals[0]?.professionalId;
      return professionals?.find(p => p.id === professionalId);
    }
    return null;
  };

  // Selecionar profissional para todos os serviços
  const handleProfessionalSelect = (professionalId: string) => {
    const newServiceProfessionals = selectedServices.map(serviceId => ({
      serviceId,
      professionalId
    }));
    
    console.log('👤 Profissional selecionado para todos os serviços:', { professionalId, newServiceProfessionals });
    onUpdateServiceProfessionals(newServiceProfessionals);
    setIsProfessionalDropdownOpen(false);
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

  const selectedProfessional = getSelectedProfessional();
  const allProfessionalsSelected = selectedProfessional !== null;

  return (
    <div className="flex h-full">
      {/* Sidebar esquerda com cliente */}
      <div className="w-48 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-6 flex flex-col items-center text-center">
          {selectedClient ? (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-green-600 font-semibold text-lg">
                {selectedClient.nome?.charAt(0).toUpperCase() || 'C'}
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
                <h3 className="font-semibold text-gray-900 text-base mb-1">{selectedClient.nome || 'Cliente'}</h3>
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


        {/* Seleção de profissional unificada */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profissional responsável
            </label>
            <button
              onClick={() => setIsProfessionalDropdownOpen(!isProfessionalDropdownOpen)}
              className={`
                w-full flex items-center justify-between p-4 border rounded-lg transition-colors
                ${selectedProfessional 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-red-300 bg-red-50 hover:border-red-400'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                {selectedProfessional ? (
                  <>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-medium text-base">
                        {selectedProfessional.name?.charAt(0) || 'P'}
                      </span>
                    </div>
                    <div>
                      <span className="text-green-800 font-medium">{selectedProfessional.name}</span>
                      <p className="text-xs text-green-600">Responsável por todos os serviços</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <User size={20} className="text-red-400" />
                    </div>
                    <div>
                      <span className="text-red-700 font-medium">Selecionar profissional *</span>
                      <p className="text-xs text-red-600">Obrigatório para continuar</p>
                    </div>
                  </>
                )}
              </div>
              <ChevronDown 
                size={20} 
                className={`text-gray-400 transition-transform ${isProfessionalDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Dropdown de profissionais */}
            {isProfessionalDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                {professionals?.map((professional) => (
                  <button
                    key={professional.id}
                    onClick={() => handleProfessionalSelect(professional.id)}
                    className="w-full flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-medium text-base">
                        {professional.name?.charAt(0) || 'P'}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">{professional.name}</div>
                      <div className="text-sm text-gray-500">{professional.role || 'Profissional'}</div>
                    </div>
                    {selectedProfessional?.id === professional.id && (
                      <Check size={20} className="text-green-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lista de serviços */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {selectedServiceObjects.map((service) => (
              <div key={service.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{service.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span>{formatDuration(service.estimated_time)}</span>
                      <span className="font-semibold text-gray-900">R$ {service.price.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                  
                  {/* Indicador do profissional */}
                  {selectedProfessional && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-medium text-xs">
                          {selectedProfessional.name?.charAt(0) || 'P'}
                        </span>
                      </div>
                      <span className="font-medium">{selectedProfessional.name}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

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


      </div>
    </div>
  );
}