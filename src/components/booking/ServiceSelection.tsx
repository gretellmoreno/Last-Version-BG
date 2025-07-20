import React, { useState, useMemo, useCallback } from 'react';
import { Search, User, Plus, ArrowLeft } from 'lucide-react';
import { useService } from '../../contexts/ServiceContext';

interface ServiceSelectionProps {
  selectedClient: any;
  selectedServices: string[];
  onToggleService: (serviceId: string) => void;
  onShowClientSelection: () => void;
  onBack?: () => void;
  hideClientSection?: boolean;
}

export default function ServiceSelection({
  selectedClient,
  selectedServices,
  onToggleService,
  onShowClientSelection,
  onBack,
  hideClientSection = false
}: ServiceSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { services } = useService();

  // Memoizar serviços filtrados
  const filteredServices = useMemo(() => {
    if (!services) return [];
    
    return services.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      service.active
    );
  }, [services, searchTerm]);

  // Memoizar função de formatação
  const formatDuration = useCallback((minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours}h`;
      }
      return `${hours}h ${remainingMinutes}min`;
    }
    return `${minutes}min`;
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div className={`flex h-full ${hideClientSection ? 'w-full' : ''}`}>
      {/* Sidebar esquerda - condicional */}
      {!hideClientSection && (
      <div 
          className={`w-20 md:w-44 bg-gray-50 border-r border-gray-200 flex flex-col ${
          !selectedClient ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''
        }`}
        onClick={!selectedClient ? onShowClientSelection : undefined}
      >
          <div className="p-2 md:p-4 flex flex-col items-center text-center">
          {selectedClient ? (
              <div className="w-8 h-8 md:w-12 md:h-12 mb-2 md:mb-3 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm md:text-base">
                {selectedClient.nome?.charAt(0).toUpperCase() || 'C'}
              </span>
            </div>
          ) : (
              <div className="w-12 h-12 md:w-16 md:h-16 mb-2 md:mb-3 bg-purple-100 rounded-full flex items-center justify-center hover:bg-purple-200 transition-colors relative group border-2 border-dashed border-purple-300">
                <User size={28} className="text-purple-600" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center border-2 border-white">
                  <Plus size={16} className="text-white" />
                </div>
              </div>
          )}
          <div>
            {selectedClient ? (
              <>
                  <h3 className="font-semibold text-gray-900 text-xs md:text-sm mb-1">{selectedClient.nome || 'Cliente'}</h3>
                  <p className="text-xs text-gray-500">Cliente selecionado</p>
                <button
                  onClick={onShowClientSelection}
                    className="text-xs text-indigo-600 hover:text-indigo-700 mt-1"
                >
                  Alterar cliente
                </button>
              </>
            ) : (
              <>
                  <h3 className="font-semibold text-gray-900 text-xs md:text-sm mb-1">Adicionar cliente</h3>
              </>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Conteúdo principal */}
      <div className={`flex flex-col ${hideClientSection ? 'w-full' : 'flex-1'}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center mb-3">
            {onBack && (
              <button
                onClick={onBack}
                className="mr-3 p-1 hover:bg-gray-100 rounded-md transition-colors"
                title="Voltar"
              >
                <ArrowLeft size={18} className="text-gray-600" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-gray-900">Selecionar um serviço</h2>
          </div>
          
          {/* Barra de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar serviço por nome"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              style={{ fontSize: '16px' }}
            />
          </div>
        </div>

        {/* Lista de serviços */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredServices.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-gray-500 text-sm">
                {services?.length === 0 
                  ? 'Nenhum serviço cadastrado' 
                  : searchTerm 
                    ? 'Nenhum serviço encontrado'
                    : 'Carregando serviços...'
                }
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() => onToggleService(service.id)}
                  className={`
                    p-3 border rounded-lg cursor-pointer transition-all
                    ${selectedServices.includes(service.id)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{service.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDuration(service.estimated_time)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 text-sm">R$ {service.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}