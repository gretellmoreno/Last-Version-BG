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
    <div className="flex h-full">
      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col">
        {/* Header com botão de voltar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">Forma de pagamento</h2>
          </div>
        </div>

        {/* Lista de formas de pagamento */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {taxas.map((taxa) => (
              <div
                key={taxa.id}
                onClick={() => onSelectPaymentMethod(taxa.id)}
                className={`
                  p-4 border rounded-lg cursor-pointer transition-all
                  ${selectedPaymentMethod === taxa.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${selectedPaymentMethod === taxa.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}
                    `}>
                      {getIconForPaymentMethod(taxa.nome)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{taxa.nome}</h3>
                      <p className="text-sm text-gray-500">Taxa: {taxa.taxa}%</p>
                    </div>
                  </div>
                  {selectedPaymentMethod === taxa.id && (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer com resumo e botão */}
        <div className="border-t border-gray-200 p-6">
          <div className="space-y-4">
            {/* Resumo dos valores */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              {selectedTaxa && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Taxa {selectedTaxa.nome} ({selectedTaxa.taxa}%)</span>
                  <span className="text-gray-900">R$ {taxaValue.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-lg font-semibold pt-2 border-t">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <button
              onClick={onFinish}
              disabled={!selectedPaymentMethod}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Finalizar Venda
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar com resumo dos produtos */}
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Produtos selecionados</h3>
        
        <div className="space-y-3">
          {selectedProducts.map((item) => {
            const product = products?.find(p => p.id === item.productId);
            if (!product) return null;
            
            return (
              <div key={item.productId} className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                    <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      R$ {(product.price * item.quantity).toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-xs text-gray-500">
                      R$ {product.price.toFixed(2).replace('.', ',')} cada
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 