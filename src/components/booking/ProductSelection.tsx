import React, { useState, useMemo, useCallback } from 'react';
import { Search, User, Plus, ArrowLeft } from 'lucide-react';
import { useProduct } from '../../contexts/ProductContext';

interface ProductSelectionProps {
  selectedClient: any;
  selectedProducts: string[];
  onToggleProduct: (productId: string) => void;
  onShowClientSelection: () => void;
  onBack?: () => void;
}

export default function ProductSelection({
  selectedClient,
  selectedProducts,
  onToggleProduct,
  onShowClientSelection,
  onBack
}: ProductSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { products } = useProduct();

  // Memoizar produtos filtrados
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

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
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center mb-4">
            {onBack && (
              <button
                onClick={onBack}
                className="mr-3 p-1 hover:bg-gray-100 rounded-md transition-colors"
                title="Voltar"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
            )}
            <h2 className="text-xl font-semibold text-gray-900">Selecionar produtos</h2>
          </div>
          
          {/* Barra de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar produto por nome"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Lista de produtos */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">
                {products?.length === 0 
                  ? 'Nenhum produto cadastrado' 
                  : searchTerm 
                    ? 'Nenhum produto encontrado'
                    : 'Carregando produtos...'
                }
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => onToggleProduct(product.id)}
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-all
                    ${selectedProducts.includes(product.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Produto
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">R$ {product.price.toFixed(2).replace('.', ',')}</p>
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