import React, { useState, useEffect } from 'react';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import Smartphone from 'lucide-react/dist/esm/icons/smartphone';
import Banknote from 'lucide-react/dist/esm/icons/banknote';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import { useProduct } from '../../contexts/ProductContext';
import { createDirectSale, paymentMethodService } from '../../lib/supabaseService';
import { useApp } from '../../contexts/AppContext';
import { PaymentMethod } from '../../types';

interface PaymentMethodSelectionProps {
  selectedProducts: Array<{ productId: string; quantity: number }>;
  selectedPaymentMethod: string;
  onSelectPaymentMethod: (paymentMethodId: string) => void;
  onBack: () => void;
  onFinish: () => void;
  selectedClient: any;
  salonId: string;
  customPrices: Record<string, number>;
}

export default function PaymentMethodSelection({
  selectedProducts,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  onBack,
  onFinish,
  selectedClient,
  salonId,
  customPrices
}: PaymentMethodSelectionProps) {
  const { products } = useProduct();
  const { currentSalon } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  // Carregar métodos de pagamento
  useEffect(() => {
    const loadPaymentMethods = async () => {
      if (!currentSalon?.id) return;
      
      setLoadingPaymentMethods(true);
      try {
        const response = await paymentMethodService.list(currentSalon.id);
        if (response.error) {
          console.error('Erro ao carregar métodos de pagamento:', response.error);
          return;
        }
        setPaymentMethods(response.data || []);
      } catch (err) {
        console.error('Erro ao carregar métodos de pagamento:', err);
      } finally {
        setLoadingPaymentMethods(false);
      }
    };

    loadPaymentMethods();
  }, [currentSalon?.id]);

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
      const price = customPrices[item.productId] ?? product?.price ?? 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const selectedMethod = paymentMethods.find(method => method.id === selectedPaymentMethod);
  const subtotal = getSubtotal();
  // Remover o cálculo da taxa - não aplicar taxa na venda de produtos
  // const taxaValue = selectedMethod ? (subtotal * selectedMethod.fee / 100) : 0;
  const total = subtotal; // Total igual ao subtotal, sem taxa

  const handleFinishSale = async () => {
    setError(null);
    setSuccess(false);
    if (!selectedPaymentMethod || selectedProducts.length === 0) return;
    setLoading(true);
    const payload = {
      salonId,
      clientId: selectedClient?.id || null,
      paymentMethodId: selectedPaymentMethod,
      products: selectedProducts.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: customPrices[item.productId] ?? product?.price ?? 0
        };
      })
    };
    const { data, error } = await createDirectSale(payload);
    setLoading(false);
    if (error) {
      setError('Erro ao finalizar venda: ' + error);
      return;
    }
    setSuccess(true);
    onFinish();
  };

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
                          R$ {((customPrices[item.productId] ?? product.price) * item.quantity).toFixed(2).replace('.', ',')}
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
          {loadingPaymentMethods ? (
            <div className="text-center py-4 text-gray-500">Carregando métodos de pagamento...</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => onSelectPaymentMethod(method.id)}
                  className={`flex flex-col items-center space-y-2 p-3 rounded-lg border transition-all ${
                    selectedPaymentMethod === method.id
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`flex-shrink-0 ${
                    selectedPaymentMethod === method.id ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {getIconForPaymentMethod(method.name)}
                  </div>

                  <div className="text-center">
                    <span className="text-xs font-medium leading-tight block">
                      {method.name}
                    </span>
                  </div>
                  

                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer com botão */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <button
          onClick={handleFinishSale}
          disabled={!selectedPaymentMethod || loading}
          className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Finalizando...' : 'Finalizar Venda'}
        </button>
        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        {success && <div className="text-green-600 text-sm mt-2">Venda realizada com sucesso!</div>}
      </div>
    </div>
  );
} 