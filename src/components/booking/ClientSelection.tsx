import React, { useState } from 'react';
import { Search, Plus, UserPlus, User } from 'lucide-react';
import { useClient } from '../../contexts/ClientContext';

interface ClientSelectionProps {
  selectedServices: string[];
  onSelectClient: (client: any) => void;
  onShowForm: () => void;
  onToggleService: (serviceId: string) => void;
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

export default function ClientSelection({
  selectedServices,
  onSelectClient,
  onShowForm,
  onToggleService
}: ClientSelectionProps) {
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const { clients } = useClient();

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
    <div className="flex h-full">
      {/* Conteúdo principal da seleção de cliente */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Selecionar cliente</h2>
          
          {/* Barra de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar cliente ou deixar em branco"
              value={clientSearchTerm}
              onChange={(e) => setClientSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Lista de opções */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {/* Cadastrar cliente */}
            <div 
              onClick={onShowForm}
              className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Plus size={20} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Cadastrar cliente</h3>
              </div>
            </div>

            {/* Sem reserva */}
            <div 
              onClick={() => onSelectClient({ nome: 'Sem reserva', id: 'no-reservation' })}
              className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <UserPlus size={20} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Sem reserva</h3>
              </div>
            </div>

            {/* Lista de clientes */}
            {filteredClients.map((cliente) => (
              <div
                key={cliente.id}
                onClick={() => onSelectClient({
                  id: cliente.id,
                  nome: cliente.name, // Converter para formato esperado pelo modal
                  name: cliente.name,
                  telefone: cliente.phone,
                  phone: cliente.phone,
                  email: cliente.email
                })}
                className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-medium text-lg">
                    {cliente.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{getClientDisplayName(cliente)}</h3>
                  <p className="text-sm text-gray-500">{cliente.email || cliente.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar direita com serviços selecionados - mais compacta */}
      <div className="w-72 bg-gray-50 border-l border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Selecionar um serviço</h3>
        
        {/* Lista de serviços (versão compacta) */}
        <div className="space-y-4">
          {SERVICE_CATEGORIES.map((category) => (
            <div key={category.name}>
              <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <span>{category.name}</span>
                <span className="bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                  {category.count}
                </span>
              </h4>
              
              <div className="space-y-2">
                {category.services.map((service) => (
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
                        <h5 className="font-medium text-gray-900 text-xs">{service.nome}</h5>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDuration(service.duracao)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-xs">R$ {service.preco}</p>
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