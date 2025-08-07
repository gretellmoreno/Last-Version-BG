import React from 'react';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import Smartphone from 'lucide-react/dist/esm/icons/smartphone';
import Building from 'lucide-react/dist/esm/icons/building';
import { PaymentMethod } from '../types';

interface PaymentMethodWithIcon extends PaymentMethod {
  icon?: string;
  active?: boolean;
}

interface PaymentMethodSelectionStaticProps {
  paymentMethods: PaymentMethodWithIcon[];
  onSelectPaymentMethod: (paymentMethodId: string) => void;
  selectedPaymentMethodId?: string;
  isLoading?: boolean;
}

export default function PaymentMethodSelectionStatic({
  paymentMethods,
  onSelectPaymentMethod,
  selectedPaymentMethodId,
  isLoading = false
}: PaymentMethodSelectionStaticProps) {
  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'credit-card':
      case 'cartao':
        return <CreditCard size={16} />;
      case 'dollar-sign':
      case 'dinheiro':
        return <DollarSign size={16} />;
      case 'smartphone':
      case 'pix':
        return <Smartphone size={16} />;
      case 'building':
      case 'debito':
        return <Building size={16} />;
      default:
        return <CreditCard size={16} />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-900">Método de Pagamento</h3>
        <div className="space-y-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-gray-900">Método de Pagamento</h3>
      
      {paymentMethods.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">Nenhum método de pagamento disponível</p>
          <p className="text-xs text-gray-400 mt-1">
            Configure métodos de pagamento nas configurações
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => onSelectPaymentMethod(method.id)}
              disabled={isLoading}
              className={`flex flex-col items-center space-y-1 p-2.5 rounded-lg border transition-colors ${
                selectedPaymentMethodId === method.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className={`flex-shrink-0 ${
                selectedPaymentMethodId === method.id ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {getIcon(method.icon || 'credit-card')}
              </div>
              
              <span className="text-xs font-medium text-center leading-tight">
                {method.name}
              </span>
              
              {selectedPaymentMethodId === method.id && (
                <div className="flex-shrink-0">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
      
      {selectedPaymentMethodId && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-700 font-medium">
            ✓ Método de pagamento selecionado
          </p>
        </div>
      )}
    </div>
  );
} 