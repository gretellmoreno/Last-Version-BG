import React, { useState } from 'react';
import { User, Plus, ChevronDown, Check } from 'lucide-react';
import { servicos } from '../../utils/mockData';
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
  const [showProfessionalSelection, setShowProfessionalSelection] = useState<string | null>(null);
  const { professionals } = useProfessional();

  // Obter serviços selecionados
  const getSelectedServices = () => {
    const allServices = [
      { id: '1', nome: 'Corte de cabelo', preco: 40, duracao: 45, comissao: 50 },
      { id: '2', nome: 'Coloração de cabelo', preco: 57, duracao: 90, comissao: 50 },
      { id: '3', nome: 'Escova', preco: 35, duracao: 35, comissao: 50 },
      { id: '4', nome: 'Balaiagem', preco: 150, duracao: 150, comissao: 50 },
      { id: '5', nome: 'Alongamento de cílios clássico', preco: 60, duracao: 60, comissao: 50 },
    ];
    return selectedServices.map(id => allServices.find(s => s.id === id)).filter(Boolean);
  };

  // Calcular total
  const calculateTotal = () => {
    return getSelectedServices().reduce((total, service) => total + service!.preco, 0);
  };

  // Formatar duração
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

  // Obter profissional selecionado para um serviço específico
  const getSelectedProfessionalForService = (serviceId: string) => {
    const serviceProfessional = serviceProfessionals.find(sp => sp.serviceId === serviceId);
    if (!serviceProfessional) return null;
    return professionals?.find(p => p.id === serviceProfessional.professionalId);
  };

  // Selecionar profissional para um serviço específico
  const handleSelectProfessional = (serviceId: string, professionalId: string) => {
    const newServiceProfessionals = serviceProfessionals.filter(sp => sp.serviceId !== serviceId);
    if (professionalId) {
      newServiceProfessionals.push({ serviceId, professionalId });
    }
    onUpdateServiceProfessionals(newServiceProfessionals);
    setShowProfessionalSelection(null);
  };

  // Verificar se todos os serviços têm profissionais selecionados
  const allServicesHaveProfessionals = () => {
    return selectedServices.every(serviceId => 
      serviceProfessionals.some(sp => sp.serviceId === serviceId)
    );
  };

  return (
    <div className="flex h-full">
      {/* Sidebar esquerda - mais estreita */}
      <div className="w-32 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 flex flex-col items-center text-center">
          {selectedClient ? (
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-green-600 font-semibold text-sm">
                {selectedClient.nome.charAt(0).toUpperCase()}
              </span>
            </div>
          ) : (
            <button
              onClick={onShowClientSelection}
              className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 cursor-pointer hover:bg-purple-200 transition-colors relative group"
            >
              <User size={20} className="text-purple-600" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                <Plus size={10} className="text-white" />
              </div>
            </button>
          )}
          
          <div>
            {selectedClient ? (
              <>
                <h3 className="font-semibold text-gray-900 text-xs mb-1">{selectedClient.nome}</h3>
                <button
                  onClick={onShowClientSelection}
                  className="text-xs text-indigo-600 hover:text-indigo-700"
                >
                  Alterar
                </button>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-gray-900 text-xs mb-1">Adicionar cliente</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Ou deixe vazio se não há cadastro</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col">
        {/* Breadcrumb compacto */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <span>Serviços</span>
            <ChevronDown size={14} className="rotate-[-90deg]" />
            <span className="text-gray-400">Horário</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Serviços</h2>
        </div>

        {/* Lista de serviços selecionados - mais compacta */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {getSelectedServices().map((service) => (
              <div key={service!.id} className="border-l-4 border-blue-300 bg-blue-50 p-3 rounded-r-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{service!.nome}</h3>
                    <p className="text-xs text-gray-500">{formatDuration(service!.duracao)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 text-sm">R$ {service!.preco}</p>
                  </div>
                </div>

                {/* Seleção de profissional compacta */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfessionalSelection(
                      showProfessionalSelection === service!.id ? null : service!.id
                    )}
                    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg transition-colors w-full justify-between text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <User size={14} className="text-gray-400" />
                      <span className="text-gray-700">
                        {getSelectedProfessionalForService(service!.id) 
                          ? getSelectedProfessionalForService(service!.id)!.name.replace('[Exemplo] ', '') 
                          : 'Selecione um colaborador'}
                      </span>
                    </div>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  {/* Dropdown de profissionais */}
                  {showProfessionalSelection === service!.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowProfessionalSelection(null)} />
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="p-2">
                          {professionals?.map((prof) => (
                            <button
                              key={prof.id}
                              onClick={() => handleSelectProfessional(service!.id, prof.id)}
                              className="flex items-center justify-between w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors text-sm"
                            >
                              <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                                  <span className="text-purple-600 text-xs font-medium">
                                    {prof.name.charAt(prof.name.indexOf(']') + 2).toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-gray-700">{prof.name.replace('[Exemplo] ', '')}</span>
                              </div>
                              {getSelectedProfessionalForService(service!.id)?.id === prof.id && <Check size={14} className="text-indigo-600" />}
                            </button>
                          )) || []}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}

            {/* Botão adicionar serviço compacto */}
            <button
              onClick={onBackToServices}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full justify-center text-gray-700 text-sm"
            >
              <Plus size={14} />
              <span>Adicionar serviço</span>
            </button>
          </div>
        </div>

        {/* Footer compacto */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-semibold text-gray-900">R$ {calculateTotal()}</span>
          </div>
          
          <button 
            onClick={onContinue}
            disabled={!allServicesHaveProfessionals() || isLoading}
            className={`
              w-full py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-2
              ${allServicesHaveProfessionals() && !isLoading
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>
              {isLoading 
                ? 'Salvando...' 
                : hasPreselectedDateTime 
                  ? 'Salvar agendamento' 
                  : 'Continuar'
              }
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}