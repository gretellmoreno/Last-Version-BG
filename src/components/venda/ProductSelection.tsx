import React, { useState } from 'react';
import { Package, Plus, Minus, User, Edit2, Check, X as XIcon, UserCheck } from 'lucide-react';
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
  hideClientSection?: boolean;
}

export default function ProductSelection({
  selectedProducts,
  onSelectProduct,
  onContinue,
  selectedClient,
  onShowClientSelection,
  hideClientSection = false
}: ProductSelectionProps) {



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

  // Todos os produtos disponíveis
  const filteredProducts = products || [];

  const hasSelectedProducts = selectedProducts.length > 0;

  return (
    <div className={`flex h-full ${hideClientSection ? 'w-full' : ''}`}>
      {/* Sidebar esquerda - condicional */}
      {!hideClientSection && (
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
                    {(selectedClient.nome || selectedClient.name)?.charAt(0).toUpperCase() || 'C'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-base mb-1">{selectedClient.nome || selectedClient.name || 'Cliente'}</h3>
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
      )}

      {/* Área principal de produtos */}
      <div className={`flex flex-col ${hideClientSection ? 'w-full' : 'flex-1'}`}>
        {/* Seção Cliente - aparece quando sidebar está escondida */}
        {hideClientSection && (
          <div className="p-2 border-b border-gray-200">
            <button
              onClick={onShowClientSelection}
              className="bg-white border-2 border-purple-200 rounded-lg p-2 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-left group w-full"
            >
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  {selectedClient ? (
                    <UserCheck size={12} className="text-purple-600" />
                  ) : (
                    <User size={12} className="text-purple-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-xs">
                    {selectedClient ? (selectedClient.nome || selectedClient.name || 'Cliente') : 'Selecionar Cliente'}
                  </h4>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Header compacto */}
        <div className="px-4 py-2 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">Selecionar Produtos</h3>
        </div>

        {/* Lista de produtos */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-6">
                <Package size={32} className="mx-auto text-gray-400 mb-3" />
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  Nenhum produto disponível
                </h3>
                <p className="text-xs text-gray-500">
                  Não há produtos cadastrados.
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const quantity = getQuantityForProduct(product.id);
                
                return (
                  <div
                    key={product.id}
                    className={`
                      border rounded-lg p-3 transition-all duration-200
                      ${quantity > 0 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span>Estoque: {product.stock}</span>
                          {editingProductId !== product.id && (
                            <span className="font-semibold text-gray-900">
                              R$ {formatDisplayValue(getProductPrice(product))}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Controles de quantidade e preço */}
                      <div className="flex items-center space-x-2">
                        {/* Edição de preço */}
                        {editingProductId === product.id ? (
                          <div className="flex items-center space-x-1">
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 mr-1">R$</span>
                              <input
                                type="text"
                                value={tempProductValue}
                                onChange={handleProductValueChange}
                                className="w-16 px-1 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="0,00"
                                autoFocus
                              />
                            </div>
                            <button
                              onClick={saveProductEdit}
                              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            >
                              <Check size={12} />
                            </button>
                            <button
                              onClick={cancelProductEdit}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <XIcon size={12} />
                            </button>
                          </div>
                        ) : (
                          <>
                            {/* Botão editar preço */}
                            <button
                              onClick={() => startEditingProduct(product)}
                              className="w-6 h-6 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Editar valor"
                            >
                              <Edit2 size={12} />
                            </button>

                            {/* Controles de quantidade compactos */}
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleQuantityChange(product.id, quantity - 1)}
                                disabled={quantity === 0}
                                className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              >
                                <Minus size={10} className="text-gray-600" />
                              </button>
                              
                              <span className="w-6 text-center font-medium text-xs">{quantity}</span>
                              
                              <button
                                onClick={() => handleQuantityChange(product.id, quantity + 1)}
                                disabled={quantity >= product.stock}
                                className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              >
                                <Plus size={10} className="text-gray-600" />
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

        {/* Footer compacto */}
        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              {hasSelectedProducts ? (
                <>
                  <div className="text-xs text-gray-600">
                    {selectedProducts.length} produto(s) selecionado(s)
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    Total: R$ {getTotalAmount().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </>
              ) : (
                <div className="text-xs text-gray-500">Nenhum produto selecionado</div>
              )}
            </div>

            <button
              onClick={onContinue}
              disabled={!hasSelectedProducts}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 