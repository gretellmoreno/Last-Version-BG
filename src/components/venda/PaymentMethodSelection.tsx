import React from 'react';
import { ArrowLeft, CreditCard, Banknote, Smartphone, DollarSign } from 'lucide-react';
import { useTaxas } from '../../contexts/TaxasContext';

interface SelectedProduct {
  productId: string;
  quantity: number;
}

interface PaymentMethodSelectionProps {
  selectedProducts: SelectedProduct[];
  selectedPaymentMethod: string;
  onSelectPaymentMethod: (paymentMethodId: string) => void;
  onBack: () => void;
  onFinish: () => void;
}

// Produtos mockados para calcular totais
const mockProducts = [
  { id: '1', nome: 'Shampoo Profissional', preco: 45.00 },
  { id: '2', nome: 'Condicionador', preco: 38.00 },
  { id: '3', nome: 'Máscara Hidratante', preco: 65.00 },
  { id: '4', nome: 'Óleo Capilar', preco: 55.00 },
  { id: '5', nome: 'Leave-in', preco: 32.00 },
  { id: '6', nome: 'Esmalte Vermelho', preco: 18.00 }
];

export default function PaymentMethodSelection({
  selectedProducts,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  onBack,
  onFinish
}: PaymentMethodSelectionProps) {
  const { taxas } = useTaxas();

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
      const product = mockProducts.find(p => p.id === item.productId);
      return total + (product ? product.preco * item.quantity : 0);
    }, 0);
  };

  const selectedTaxa = taxas.find(taxa => taxa.id === selectedPaymentMethod);
  const subtotal = getSubtotal();
  const taxaValue = selectedTaxa ? (subtotal * selectedTaxa.taxa / 100) : 0;
  const total = subtotal + taxaValue;

  return (
    <div className="flex flex-col h-full">
      {/* Header com botão voltar */}
      <div className="p-6 border-b border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} />
          <span>Voltar aos produtos</span>
        </button>
        
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Método de Pagamento</h2>
        <p className="text-gray-600">Escolha como o cliente vai pagar:</p>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {taxas
            .filter(taxa => taxa.ativo)
            .map((taxa) => (
              <button
                key={taxa.id}
                onClick={() => onSelectPaymentMethod(taxa.id)}
                className={`
                  p-4 border-2 rounded-lg text-left transition-all duration-200
                  ${selectedPaymentMethod === taxa.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${selectedPaymentMethod === taxa.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {getIconForPaymentMethod(taxa.nome)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{taxa.nome}</h3>
                      <p className="text-sm text-gray-500">
                        {taxa.taxa === 0 ? 'Sem taxa' : `Taxa: ${taxa.taxa}%`}
                      </p>
                    </div>
                  </div>
                  
                  {selectedPaymentMethod === taxa.id && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>
            ))
          }
        </div>

        {/* Resumo da venda */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Resumo da Venda</h3>
          
          <div className="space-y-2 mb-4">
            {selectedProducts.map((item) => {
              const product = mockProducts.find(p => p.id === item.productId);
              if (!product) return null;
              
              return (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span>{product.nome} x{item.quantity}</span>
                  <span>R$ {(product.preco * item.quantity).toFixed(2).replace('.', ',')}</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-200 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
            
            {selectedTaxa && selectedTaxa.taxa > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Taxa ({selectedTaxa.nome}):</span>
                <span>R$ {taxaValue.toFixed(2).replace('.', ',')}</span>
              </div>
            )}
            
            <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
              <span>Total:</span>
              <span>R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer com botão finalizar */}
      <div className="border-t border-gray-200 p-6">
        <div className="flex justify-end">
          <button
            onClick={onFinish}
            disabled={!selectedPaymentMethod}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Finalizar Venda
          </button>
        </div>
      </div>
    </div>
  );
} 