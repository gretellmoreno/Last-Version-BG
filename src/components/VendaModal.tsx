import React, { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import ProductSelection from './venda/ProductSelection';
import PaymentMethodSelection from './venda/PaymentMethodSelection';
import ClientSelectionVenda from './venda/ClientSelectionVenda';
import ClientForm from './booking/ClientForm';

interface VendaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SelectedProduct {
  productId: string;
  quantity: number;
}

interface ClientFormData {
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  ano: string;
}

export default function VendaModal({ 
  isOpen, 
  onClose
}: VendaModalProps) {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [currentStep, setCurrentStep] = useState<'products' | 'payment'>('products');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showClientSelection, setShowClientSelection] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [clientForm, setClientForm] = useState<ClientFormData>({
    nome: '',
    sobrenome: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    ano: ''
  });

  const handleSelectProduct = useCallback((productId: string, quantity: number) => {
    setSelectedProducts(prev => {
      const existingIndex = prev.findIndex(item => item.productId === productId);
      
      if (quantity === 0) {
        // Remove o produto se quantidade for 0
        return prev.filter(item => item.productId !== productId);
      }
      
      if (existingIndex >= 0) {
        // Atualiza quantidade do produto existente
        const newProducts = [...prev];
        newProducts[existingIndex] = { productId, quantity };
        return newProducts;
      } else {
        // Adiciona novo produto
        return [...prev, { productId, quantity }];
      }
    });
  }, []);

  const handleContinueToPayment = useCallback(() => {
    if (selectedProducts.length > 0) {
      setCurrentStep('payment');
    }
  }, [selectedProducts.length]);

  const handleBackToProducts = useCallback(() => {
    setCurrentStep('products');
  }, []);

  const handleSelectPaymentMethod = useCallback((paymentMethodId: string) => {
    setSelectedPaymentMethod(paymentMethodId);
  }, []);

  const handleSelectClient = useCallback((client: any) => {
    setSelectedClient(client);
    setShowClientSelection(false);
  }, []);

  const handleUpdateClientForm = useCallback((field: string, value: string) => {
    setClientForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSaveClient = useCallback(() => {
    if (clientForm.nome.trim() === '' || clientForm.telefone.trim() === '') return;
    
    const newClient = {
      id: Date.now().toString(),
      nome: clientForm.nome,
      sobrenome: clientForm.sobrenome,
      email: clientForm.email,
      telefone: clientForm.telefone,
      dataNascimento: clientForm.dataNascimento,
      ano: clientForm.ano
    };
    
    setSelectedClient(newClient);
    setShowClientForm(false);
    setShowClientSelection(false);
  }, [clientForm]);

  const handleShowClientSelection = useCallback(() => {
    setShowClientSelection(true);
  }, []);

  const handleBackFromClientSelection = useCallback(() => {
    setShowClientSelection(false);
  }, []);

  const handleShowClientForm = useCallback(() => {
    setShowClientForm(true);
  }, []);

  const handleCancelClientForm = useCallback(() => {
    setShowClientForm(false);
  }, []);

  const handleFinishSale = useCallback(() => {
    console.log('Venda finalizada!', {
      client: selectedClient,
      products: selectedProducts,
      paymentMethod: selectedPaymentMethod
    });
    
    // Reset do modal
    setSelectedProducts([]);
    setSelectedPaymentMethod('');
    setSelectedClient(null);
    setShowClientSelection(false);
    setShowClientForm(false);
    setClientForm({
      nome: '',
      sobrenome: '',
      email: '',
      telefone: '',
      dataNascimento: '',
      ano: ''
    });
    setCurrentStep('products');
    onClose();
  }, [selectedProducts, selectedPaymentMethod, selectedClient, onClose]);

  // Reset quando fechar o modal
  const handleClose = useCallback(() => {
    setSelectedProducts([]);
    setSelectedPaymentMethod('');
    setSelectedClient(null);
    setShowClientSelection(false);
    setShowClientForm(false);
    setClientForm({
      nome: '',
      sobrenome: '',
      email: '',
      telefone: '',
      dataNascimento: '',
      ano: ''
    });
    setCurrentStep('products');
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      
      {/* Painel lateral direito */}
      <div className="absolute right-0 top-0 h-full w-1/2 max-w-2xl bg-white shadow-xl flex flex-col">
        {/* Header do modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">Nova Venda</h1>
            {currentStep === 'payment' && (
              <div className="text-sm text-gray-500">
                {selectedProducts.length} produto(s) selecionado(s)
              </div>
            )}
          </div>
          
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Conteúdo do modal */}
        <div className="flex-1 overflow-hidden">
          {showClientForm ? (
            <ClientForm
              clientForm={clientForm}
              onUpdateForm={handleUpdateClientForm}
              onSave={handleSaveClient}
              onCancel={handleCancelClientForm}
            />
          ) : showClientSelection ? (
            <ClientSelectionVenda
              selectedProducts={selectedProducts}
              onSelectClient={handleSelectClient}
              onShowForm={handleShowClientForm}
              onSelectProduct={handleSelectProduct}
              onBack={handleBackFromClientSelection}
            />
          ) : currentStep === 'payment' ? (
            <PaymentMethodSelection
              selectedProducts={selectedProducts}
              selectedPaymentMethod={selectedPaymentMethod}
              onSelectPaymentMethod={handleSelectPaymentMethod}
              onBack={handleBackToProducts}
              onFinish={handleFinishSale}
            />
          ) : (
            <ProductSelection
              selectedProducts={selectedProducts}
              onSelectProduct={handleSelectProduct}
              onContinue={handleContinueToPayment}
              selectedClient={selectedClient}
              onShowClientSelection={handleShowClientSelection}
            />
          )}
        </div>
      </div>
    </div>
  );
} 