import React, { useState } from 'react';
import { Search, Plus, UserPlus } from 'lucide-react';
import { useClient } from '../../contexts/ClientContext';

interface ClientSelectionVendaProps {
  selectedProducts: Array<{ productId: string; quantity: number }>;
  onSelectClient: (client: any) => void;
  onShowForm: () => void;
  onSelectProduct: (productId: string, quantity: number) => void;
}

// Dados dos produtos
const PRODUCTS = [
  { id: '1', nome: 'Shampoo Hidratante', preco: 45, categoria: 'Cuidados Capilares' },
  { id: '2', nome: 'Condicionador Nutritivo', preco: 38, categoria: 'Cuidados Capilares' },
  { id: '3', nome: 'Máscara Capilar', preco: 55, categoria: 'Cuidados Capilares' },
  { id: '4', nome: 'Óleo Argan', preco: 72, categoria: 'Óleos e Séruns' },
  { id: '5', nome: 'Sérum Anti-Frizz', preco: 68, categoria: 'Óleos e Séruns' },
  { id: '6', nome: 'Creme Para Pentear', preco: 35, categoria: 'Finalizadores' },
  { id: '7', nome: 'Spray Fixador', preco: 42, categoria: 'Finalizadores' },
  { id: '8', nome: 'Mousse Volumizador', preco: 48, categoria: 'Finalizadores' }
];

const PRODUCT_CATEGORIES = [
  {
    name: 'Cuidados Capilares',
    count: 3,
    products: PRODUCTS.filter(p => p.categoria === 'Cuidados Capilares')
  },
  {
    name: 'Óleos e Séruns',
    count: 2,
    products: PRODUCTS.filter(p => p.categoria === 'Óleos e Séruns')
  },
  {
    name: 'Finalizadores',
    count: 3,
    products: PRODUCTS.filter(p => p.categoria === 'Finalizadores')
  }
];

export default function ClientSelectionVenda({
  selectedProducts,
  onSelectClient,
  onShowForm,
  onSelectProduct
}: ClientSelectionVendaProps) {
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const { clients } = useClient();

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
                  nome: cliente.name,
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

      {/* Sidebar direita com produtos selecionados */}
      <div className="w-72 bg-gray-50 border-l border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Selecionar produtos</h3>
        
        {/* Lista de produtos por categoria */}
        <div className="space-y-4">
          {PRODUCT_CATEGORIES.map((category) => (
            <div key={category.name}>
              <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <span>{category.name}</span>
                <span className="bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                  {category.count}
                </span>
              </h4>
              
              <div className="space-y-2">
                {category.products.map((product) => (
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
                        <h5 className="font-medium text-gray-900 text-xs">{product.nome}</h5>
                        {getProductQuantity(product.id) > 0 && (
                          <p className="text-xs text-indigo-600 mt-0.5">
                            Qtd: {getProductQuantity(product.id)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-xs">R$ {product.preco}</p>
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