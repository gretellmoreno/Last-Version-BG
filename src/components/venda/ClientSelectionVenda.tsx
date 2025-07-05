import React, { useState } from 'react';
import { Search, Plus, UserPlus, ArrowLeft } from 'lucide-react';
import { useClient } from '../../contexts/ClientContext';
import { useProduct } from '../../contexts/ProductContext';

interface ClientSelectionVendaProps {
  selectedProducts: Array<{ productId: string; quantity: number }>;
  onSelectClient: (client: any) => void;
  onShowForm: () => void;
  onSelectProduct: (productId: string, quantity: number) => void;
  onBack?: () => void;
  hideProductsSidebar?: boolean;
}

export default function ClientSelectionVenda({
  selectedProducts,
  onSelectClient,
  onShowForm,
  onSelectProduct,
  onBack,
  hideProductsSidebar = false
}: ClientSelectionVendaProps) {
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const { clients } = useClient();
  const { products } = useProduct();

  // Filtrar clientes baseado na busca - com verificação de segurança
  const filteredClients = (clients || []).filter(cliente =>
    cliente.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    cliente.phone.includes(clientSearchTerm) ||
    (cliente.email && cliente.email.toLowerCase().includes(clientSearchTerm.toLowerCase()))
  );

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

  const getProductQuantity = (productId: string) => {
    const product = selectedProducts.find(p => p.productId === productId);
    return product ? product.quantity : 0;
  };

  const handleProductClick = (productId: string) => {
    const currentQuantity = getProductQuantity(productId);
    onSelectProduct(productId, currentQuantity > 0 ? 0 : 1);
  };

  return (
    <div className={`flex h-full ${hideProductsSidebar ? 'w-full' : ''}`}>
      {/* Área principal */}
      <div className={`flex flex-col ${hideProductsSidebar ? 'w-full' : 'flex-1'}`}>
        {/* Header */}
        <div className={`border-b border-gray-200 ${hideProductsSidebar ? 'p-4' : 'p-6'}`}>
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
            <h2 className={`font-semibold text-gray-900 ${hideProductsSidebar ? 'text-lg' : 'text-xl'}`}>
              Selecionar cliente
            </h2>
          </div>
          
          {/* Barra de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar cliente por nome, telefone ou email"
              value={clientSearchTerm}
              onChange={(e) => setClientSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                hideProductsSidebar ? 'py-2.5 text-base' : 'py-3'
              }`}
              style={hideProductsSidebar ? { fontSize: '16px' } : {}} // Evita zoom no iOS
            />
          </div>
        </div>

        {/* Lista de clientes */}
        <div className={`flex-1 overflow-y-auto ${hideProductsSidebar ? 'p-4' : 'p-6'}`}>
          <div className="space-y-3">
            {/* Opção para novo cliente */}
            <div 
              onClick={onShowForm}
              className={`border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-all hover:border-indigo-400 hover:bg-indigo-50 ${
                hideProductsSidebar ? 'p-3 mobile-client-list-item' : 'p-4'
              }`}
            >
              <div className="flex items-center space-x-3 text-indigo-600">
                <div className={`bg-indigo-100 rounded-full flex items-center justify-center ${
                  hideProductsSidebar ? 'w-8 h-8' : 'w-10 h-10'
                }`}>
                  <UserPlus size={hideProductsSidebar ? 16 : 20} />
                </div>
                <div>
                  <h3 className={`font-medium ${hideProductsSidebar ? 'text-sm' : ''}`}>
                    Novo cliente
                  </h3>
                  <p className={`text-gray-500 ${hideProductsSidebar ? 'text-xs' : 'text-sm'}`}>
                    Criar um novo cliente
                  </p>
                </div>
              </div>
            </div>

            {/* Lista de clientes existentes */}
            {filteredClients.length === 0 ? (
              <div className="text-center py-8">
                <div className={`text-gray-500 ${hideProductsSidebar ? 'text-sm' : ''}`}>
                  {clientSearchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                </div>
              </div>
            ) : (
              filteredClients.map((cliente) => (
                <div
                  key={cliente.id}
                  onClick={() => onSelectClient(cliente)}
                  className={`border border-gray-200 rounded-lg cursor-pointer transition-all hover:border-indigo-300 hover:bg-indigo-50 ${
                    hideProductsSidebar ? 'p-3 mobile-client-list-item' : 'p-4'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`bg-gray-100 rounded-full flex items-center justify-center ${
                      hideProductsSidebar ? 'w-8 h-8' : 'w-10 h-10'
                    }`}>
                      <span className={`text-gray-600 font-medium ${hideProductsSidebar ? 'text-xs' : 'text-sm'}`}>
                        {getClientDisplayName(cliente).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium text-gray-900 ${hideProductsSidebar ? 'text-sm' : ''}`}>
                        {getClientDisplayName(cliente)}
                      </h3>
                      <div className={`flex items-center space-x-2 text-gray-500 ${hideProductsSidebar ? 'text-xs' : 'text-sm'}`}>
                        <span>{cliente.phone}</span>
                        {cliente.email && (
                          <>
                            <span>•</span>
                            <span>{cliente.email}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sidebar direita com produtos - condicional */}
      {!hideProductsSidebar && (
      <div className="w-72 bg-gray-50 border-l border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Selecionar produtos</h3>
        
        {/* Lista de produtos */}
        <div className="space-y-2">
          {products?.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              Nenhum produto cadastrado
            </div>
          ) : (
            products?.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                className={`
                  p-2.5 border rounded-lg cursor-pointer transition-all text-xs
                  ${getProductQuantity(product.id) > 0
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 text-xs">{product.name}</h5>
                    {getProductQuantity(product.id) > 0 && (
                      <p className="text-xs text-indigo-600 mt-0.5">
                        Qtd: {getProductQuantity(product.id)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 text-xs">R$ {product.price.toFixed(2).replace('.', ',')}</p>
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