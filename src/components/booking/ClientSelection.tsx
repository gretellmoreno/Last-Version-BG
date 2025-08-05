import React, { useState } from 'react';
import Search from 'lucide-react/dist/esm/icons/search';
import Plus from 'lucide-react/dist/esm/icons/plus';
import UserPlus from 'lucide-react/dist/esm/icons/user-plus';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import { useClients } from '../../hooks/useClients';
import { useService } from '../../contexts/ServiceContext';

interface ClientSelectionProps {
  selectedServices: string[];
  onSelectClient: (client: any) => void;
  onShowForm: () => void;
  onToggleService: (serviceId: string) => void;
  onBack?: () => void;
  hideServicesSidebar?: boolean;
}

export default function ClientSelection({
  selectedServices,
  onSelectClient,
  onShowForm,
  onToggleService,
  onBack,
  hideServicesSidebar = false
}: ClientSelectionProps) {
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const { clients } = useClients();
  const { services } = useService();

  // Filtrar clientes baseado na busca - com verificação de segurança
  const filteredClients = (clients || []).filter(cliente =>
    cliente.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    cliente.phone.includes(clientSearchTerm) ||
    (cliente.email && cliente.email.toLowerCase().includes(clientSearchTerm.toLowerCase()))
  );

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

  const getClientDisplayName = (cliente: any) => {
    // Para clientes do Supabase, usar name
    if (cliente.name) {
      return cliente.name;
    }
    // Para clientes locais (compatibilidade), usar nome
    if (cliente.sobrenome) {
      return `${cliente.nome} ${cliente.sobrenome}`;
    }
    return cliente.nome || cliente.name;
  };

  return (
    <div className={`flex h-full ${hideServicesSidebar ? 'w-full' : ''}`}>
      {/* Conteúdo principal da seleção de cliente */}
      <div className={`flex flex-col ${hideServicesSidebar ? 'w-full' : 'flex-1'}`}>
        {/* Header */}
        <div className={`border-b border-gray-200 ${hideServicesSidebar ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center space-x-3 mb-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Voltar"
              >
                <ArrowLeft size={20} className="text-gray-500" />
              </button>
            )}
            <h2 className={`font-semibold text-gray-900 ${hideServicesSidebar ? 'text-lg' : 'text-xl'}`}>
              Selecionar cliente
            </h2>
          </div>
          
          {/* Barra de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar cliente ou deixar em branco"
              value={clientSearchTerm}
              onChange={(e) => setClientSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                hideServicesSidebar ? 'py-2.5 text-base' : 'py-3'
              }`}
              style={hideServicesSidebar ? { fontSize: '16px' } : {}} // Evita zoom no iOS
            />
          </div>
        </div>

        {/* Lista de opções */}
        <div className={`flex-1 overflow-y-auto ${hideServicesSidebar ? 'p-4' : 'p-6'}`}>
          <div className="space-y-3">
            {/* Cadastrar cliente */}
            <div 
              onClick={onShowForm}
              className={`flex items-center space-x-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors ${
                hideServicesSidebar ? 'p-3 mobile-client-list-item' : 'p-4'
              }`}
            >
              <div className={`bg-purple-100 rounded-full flex items-center justify-center ${
                hideServicesSidebar ? 'w-10 h-10' : 'w-12 h-12'
              }`}>
                <Plus size={hideServicesSidebar ? 18 : 20} className="text-purple-600" />
              </div>
              <div>
                <h3 className={`font-medium text-gray-900 ${hideServicesSidebar ? 'text-sm' : ''}`}>
                  Cadastrar cliente
                </h3>
              </div>
            </div>

            {/* Lista de clientes */}
            {filteredClients.map((cliente) => (
              <div
                key={cliente.id}
                onClick={() => onSelectClient({
                  id: cliente.id,
                  nome: cliente.name,
                  name: cliente.name,
                  telefone: cliente.phone,
                  phone: cliente.phone,
                  email: cliente.email
                })}
                className={`flex items-center space-x-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors ${
                  hideServicesSidebar ? 'p-3 mobile-client-list-item' : 'p-4'
                }`}
              >
                <div className={`bg-purple-100 rounded-full flex items-center justify-center ${
                  hideServicesSidebar ? 'w-10 h-10' : 'w-12 h-12'
                }`}>
                  <span className={`text-purple-600 font-medium ${hideServicesSidebar ? 'text-sm' : 'text-lg'}`}>
                    {cliente.name?.charAt(0).toUpperCase() || 'C'}
                  </span>
                </div>
                <div>
                  <h3 className={`font-medium text-gray-900 ${hideServicesSidebar ? 'text-sm' : ''}`}>
                    {getClientDisplayName(cliente)}
                  </h3>
                  <p className={`text-gray-500 ${hideServicesSidebar ? 'text-xs' : 'text-sm'}`}>
                    {cliente.email || cliente.phone}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar direita com serviços - condicional */}
      {!hideServicesSidebar && (
      <div className="w-72 bg-gray-50 border-l border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Selecionar um serviço</h3>
        
        {/* Lista de serviços */}
        <div className="space-y-2">
          {services?.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              Nenhum serviço cadastrado
            </div>
          ) : (
            services?.filter(service => service.active).map((service) => (
              <div
                key={service.id}
                onClick={() => onToggleService(service.id)}
                className={`
                  p-2.5 border rounded-lg cursor-pointer transition-all text-xs
                  ${selectedServices.includes(service.id)
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 text-xs">{service.name}</h5>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDuration(service.estimated_time)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 text-xs">R$ {service.price.toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      )}
    </div>
  );
}