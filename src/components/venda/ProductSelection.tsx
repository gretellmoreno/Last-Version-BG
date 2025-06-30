import React, { useState } from 'react';
import { Package, Plus, Minus, Search, User, Edit2, Check, X as XIcon } from 'lucide-react';
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
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [tempProductValue, setTempProductValue] = useState('');
  const [editedProductPrices, setEditedProductPrices] = useState<Record<string, number>>({});
  const { products } = useProduct();
  
  const getQuantityForProduct = (productId: string) => {
    const found = selectedProducts.find(item => item.productId === productId);
    return found ? found.quantity : 0;
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    onSelectProduct(productId, newQuantity);
  };

  // Função para obter preço do produto (editado ou original)
  const getProductPrice = (product: any) => {
    return editedProductPrices[product.id] ?? product.price;
  };

  // Função para formatar valor para exibição
  const formatDisplayValue = (value: number) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Função para aplicar máscara de valor monetário
  const formatCurrencyInput = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    const number = parseInt(digits, 10);
    const reais = number / 100;
    return reais.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Função para converter valor formatado para número
  const parseFormattedValue = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return 0;
    return parseInt(digits, 10) / 100;
  };

  // Funções para edição de preços
  const startEditingProduct = (product: any) => {
    setEditingProductId(product.id);
    setTempProductValue(getProductPrice(product).toFixed(2).replace('.', ','));
  };

  const saveProductEdit = () => {
    if (editingProductId && tempProductValue) {
      const value = parseFormattedValue(tempProductValue);
      if (!isNaN(value) && value >= 0) {
        setEditedProductPrices(prev => ({
          ...prev,
          [editingProductId]: value
        }));
      }
    }
    setEditingProductId(null);
    setTempProductValue('');
  };

  const cancelProductEdit = () => {
    setEditingProductId(null);
    setTempProductValue('');
  };

  const handleProductValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setTempProductValue(formatted);
  };

  const getTotalAmount = () => {
    return selectedProducts.reduce((total, item) => {
      const product = products?.find(p => p.id === item.productId);
      return total + (product ? getProductPrice(product) * item.quantity : 0);
    }, 0);
  };

  // Filtrar produtos pela busca
  const filteredProducts = (products || []).filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasSelectedProducts = selectedProducts.length > 0;

  return (
    <div className="flex h-full">
      {/* Sidebar esquerda */}
      <div 
        className={`w-48 bg-gray-50 border-r border-gray-200 flex flex-col ${
          !selectedClient ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''
        }`}
        onClick={!selectedClient ? onShowClientSelection : undefined}
      >
        <div 
          className={`p-6 flex flex-col items-center text-center ${selectedClient ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}`}
          onClick={selectedClient ? onShowClientSelection : undefined}
        >
          {selectedClient ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-green-600 font-semibold text-lg">
                  {selectedClient.nome?.charAt(0).toUpperCase() || 'C'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base mb-1">{selectedClient.nome || 'Cliente'}</h3>
                <p className="text-sm text-gray-500">Cliente selecionado</p>
                <p className="text-xs text-indigo-600 mt-2">
                  Alterar cliente
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 hover:bg-purple-200 transition-colors relative group">
                <User size={28} className="text-purple-600" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                  <Plus size={14} className="text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base mb-1">Adicionar cliente</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Ou deixe vazio se não há cadastro</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Área principal de produtos */}
      <div className="flex-1 flex flex-col">
        {/* Header com busca */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Selecionar Produtos</h2>
          
          {/* Barra de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar produto por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                            {editingProductId !== product.id && (
                              <span className="font-semibold text-gray-900">
                                R$ {formatDisplayValue(getProductPrice(product))}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Controles de quantidade e preço */}
                      <div className="flex items-center space-x-3">
                        {/* Edição de preço */}
                        {editingProductId === product.id ? (
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-500 mr-1">R$</span>
                              <input
                                type="text"
                                value={tempProductValue}
                                onChange={handleProductValueChange}
                                className="w-20 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0,00"
                                autoFocus
                              />
                            </div>
                            <button
                              onClick={saveProductEdit}
                              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={cancelProductEdit}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <XIcon size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            {/* Botão editar preço */}
                            <button
                              onClick={() => startEditingProduct(product)}
                              className="w-7 h-7 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Editar valor"
                            >
                              <Edit2 size={14} />
                            </button>

                            {/* Controles de quantidade mais sutis */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleQuantityChange(product.id, quantity - 1)}
                                disabled={quantity === 0}
                                className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              >
                                <Minus size={12} className="text-gray-600" />
                              </button>
                              
                              <span className="w-8 text-center font-medium text-sm">{quantity}</span>
                              
                              <button
                                onClick={() => handleQuantityChange(product.id, quantity + 1)}
                                disabled={quantity >= product.stock}
                                className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              >
                                <Plus size={12} className="text-gray-600" />
                              </button>
                            </div>
                          </>
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
                    Total: R$ {getTotalAmount().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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