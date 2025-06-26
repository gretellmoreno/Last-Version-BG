import React, { useState, useMemo, useCallback } from 'react';
import { Search, User, Plus } from 'lucide-react';

interface ServiceSelectionProps {
  selectedClient: any;
  selectedServices: string[];
  onToggleService: (serviceId: string) => void;
  onShowClientSelection: () => void;
}

interface ServiceCategory {
  name: string;
  count: number;
  services: Array<{
    id: string;
    nome: string;
    preco: number;
    duracao: number;
    comissao: number;
  }>;
}

// Dados estáticos para evitar re-criação
const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    name: 'Hair & styling',
    count: 4,
    services: [
      { id: '1', nome: 'Corte de cabelo', preco: 40, duracao: 45, comissao: 50 },
      { id: '2', nome: 'Coloração de cabelo', preco: 57, duracao: 90, comissao: 50 },
      { id: '3', nome: 'Escova', preco: 35, duracao: 35, comissao: 50 },
      { id: '4', nome: 'Balaiagem', preco: 150, duracao: 150, comissao: 50 },
    ]
  },
  {
    name: 'Eyebrows & eyelashes',
    count: 1,
    services: [
      { id: '5', nome: 'Alongamento de cílios clássico', preco: 60, duracao: 60, comissao: 50 },
    ]
  }
];

export default function ServiceSelection({
  selectedClient,
  selectedServices,
  onToggleService,
  onShowClientSelection
}: ServiceSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Memoizar categorias filtradas
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return SERVICE_CATEGORIES;
    
    return SERVICE_CATEGORIES.map(category => ({
      ...category,
      services: category.services.filter(service =>
        service.nome.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(category => category.services.length > 0);
  }, [searchTerm]);

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
    <div className="flex h-full">
      {/* Sidebar esquerda */}
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Selecionar um serviço</h2>
          
          {/* Barra de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar serviço por nome"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Lista de serviços */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredCategories.map((category) => (
            <div key={category.name} className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <span>{category.name}</span>
                <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
                  {category.count}
                </span>
              </h3>
              
              <div className="space-y-3">
                {category.services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => onToggleService(service.id)}
                    className={`
                      p-4 border rounded-lg cursor-pointer transition-all
                      ${selectedServices.includes(service.id)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{service.nome}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDuration(service.duracao)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">R$ {service.preco}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}