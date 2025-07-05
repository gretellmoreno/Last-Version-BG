import React from 'react';
import { CreditCard, Smartphone, Banknote, DollarSign, ArrowLeft } from 'lucide-react';
import { useTaxas } from '../../contexts/TaxasContext';
import { useProduct } from '../../contexts/ProductContext';

interface PaymentMethodSelectionProps {
  selectedProducts: Array<{ productId: string; quantity: number }>;
  selectedPaymentMethod: string;
  onSelectPaymentMethod: (paymentMethodId: string) => void;
  onBack: () => void;
  onFinish: () => void;
}

export default function PaymentMethodSelection({
  selectedProducts,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  onBack,
  onFinish
}: PaymentMethodSelectionProps) {
  const { taxas } = useTaxas();
  const { products } = useProduct();

  const getIconForPaymentMethod = (nome: string) => {
    const lowerName = nome.toLowerCase();
    if (lowerName.includes('cartão') || lowerName.includes('credito') || lowerName.includes('débito')) {
      return <CreditCard size={20} />;
    }
    if (lowerName.includes('pix')) {
      return <Smartphone size={20} />;
    }
    if (lowerName.includes('dinheiro')) {
      return <Banknote size={20} />;
    }
    return <DollarSign size={20} />;
  };

  const getSubtotal = () => {
    return selectedProducts.reduce((total, item) => {
      const product = products?.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const selectedTaxa = taxas.find(taxa => taxa.id === selectedPaymentMethod);
  const subtotal = getSubtotal();
  const taxaValue = selectedTaxa ? (subtotal * selectedTaxa.taxa / 100) : 0;
  const total = subtotal + taxaValue;

  return (
    <div className="flex flex-col h-full">
      {/* Header com botão de voltar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">Forma de pagamento</h2>
        </div>
      </div>

      {/* Conteúdo scrollável */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Produtos selecionados */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Produtos selecionados</h3>
          <div className="space-y-3">
            {selectedProducts.map((item) => {
              const product = products?.find(p => p.id === item.productId);
              if (!product) return null;
              
              return (
                <div key={item.productId} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-base">{product.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                        <span>Qtd: {item.quantity}</span>
                        <span className="font-semibold text-gray-900">
                          R$ {(product.price * item.quantity).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumo financeiro */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Subtotal:</span>
              <span className="text-sm font-medium text-blue-700">
                R$ {subtotal.toFixed(2).replace('.', ',')}
              </span>
            </div>
            {selectedTaxa && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Taxa {selectedTaxa.nome} ({selectedTaxa.taxa}%):</span>
                <span className="text-sm font-medium text-blue-700">
                  R$ {taxaValue.toFixed(2).replace('.', ',')}
                </span>
              </div>
            )}
            <div className="border-t border-blue-200 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total Geral:</span>
                <span className="text-xl font-bold text-blue-900">
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Métodos de pagamento */}
        <div className="mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Método de Pagamento</h3>
          <div className="grid grid-cols-3 gap-3">
            {taxas.map((taxa) => (
              <button
                key={taxa.id}
                onClick={() => onSelectPaymentMethod(taxa.id)}
                className={`flex flex-col items-center space-y-2 p-3 rounded-lg border transition-all ${
                  selectedPaymentMethod === taxa.id
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className={`flex-shrink-0 ${
                  selectedPaymentMethod === taxa.id ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {getIconForPaymentMethod(taxa.nome)}
                </div>
                
                <div className="text-center">
                  <span className="text-xs font-medium leading-tight block">
                    {taxa.nome}
                  </span>
                  <span className="text-xs text-gray-500">
                    Taxa: {taxa.taxa}%
                  </span>
                </div>
                
                {selectedPaymentMethod === taxa.id && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer com botão */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <button
          onClick={onFinish}
          disabled={!selectedPaymentMethod}
          className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Finalizar Venda
        </button>
      </div>
    </div>
  );
} 