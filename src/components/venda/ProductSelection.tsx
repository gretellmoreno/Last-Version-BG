import React, { useState } from 'react';
import { Package, Plus, Minus, Search } from 'lucide-react';
import { useProduct } from '../../contexts/ProductContext';

interface SelectedProduct {
  productId: string;
  quantity: number;
}

interface ProductSelectionProps {
  selectedProducts: SelectedProduct[];
  onSelectProduct: (productId: string, quantity: number) => void;
  onContinue: () => void;
  selectedClient?: any;
  onShowClientSelection?: () => void;
}

export default function ProductSelection({
  selectedProducts,
  onSelectProduct,
  onContinue,
  selectedClient,
  onShowClientSelection
}: ProductSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { products } = useProduct();
  
  const getQuantityForProduct = (productId: string) => {
    const found = selectedProducts.find(item => item.productId === productId);
    return found ? found.quantity : 0;
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    onSelectProduct(productId, newQuantity);
  };

  const getTotalAmount = () => {
    return selectedProducts.reduce((total, item) => {
      const product = products?.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  // Filtrar produtos pela busca
  const filteredProducts = (products || []).filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasSelectedProducts = selectedProducts.length > 0;

  return (
    <div className="flex h-full">
      {/* Sidebar do cliente */}
      <div className="w-64 border-r border-gray-200 p-4 flex flex-col">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Cliente</h3>
          {selectedClient ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-green-900">{selectedClient.nome}</p>
                  {selectedClient.telefone && (
                    <p className="text-sm text-green-600">{selectedClient.telefone}</p>
                  )}
                </div>
                {onShowClientSelection && (
                  <button
                    onClick={onShowClientSelection}
                    className="text-green-600 hover:text-green-800 text-xs"
                  >
                    Alterar
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm mb-3">Ou deixe vazio se não há cadastro</p>
              {onShowClientSelection && (
                <button
                  onClick={onShowClientSelection}
                  className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Adicionar Cliente
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Área principal de produtos */}
      <div className="flex-1 flex flex-col">
        {/* Header com busca */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecionar Produtos</h2>
          
          {/* Barra de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar produto por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Lista de produtos */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Tente buscar com outros termos.' : 'Não há produtos cadastrados.'}
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const quantity = getQuantityForProduct(product.id);
                
                return (
                  <div
                    key={product.id}
                    className={`
                      border rounded-lg p-4 transition-all duration-200
                      ${quantity > 0 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package size={20} className="text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{product.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Estoque: {product.stock}</span>
                            <span className="font-semibold text-gray-900">
                              R$ {product.price.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Controles de quantidade */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleQuantityChange(product.id, quantity - 1)}
                          disabled={quantity === 0}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus size={14} />
                        </button>
                        
                        <span className="w-8 text-center font-medium">{quantity}</span>
                        
                        <button
                          onClick={() => handleQuantityChange(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus size={14} />
                        </button>

                        {quantity > 0 && (
                          <div className="ml-3 text-sm font-medium text-green-600">
                            R$ {(product.price * quantity).toFixed(2).replace('.', ',')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer com resumo e botão */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              {hasSelectedProducts ? (
                <>
                  <div className="text-sm text-gray-600 mb-1">
                    {selectedProducts.length} produto(s) selecionado(s)
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    Total: R$ {getTotalAmount().toFixed(2).replace('.', ',')}
                  </div>
                </>
              ) : (
                <div className="text-gray-500">Nenhum produto selecionado</div>
              )}
            </div>

            <button
              onClick={onContinue}
              disabled={!hasSelectedProducts}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Continuar para Pagamento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 