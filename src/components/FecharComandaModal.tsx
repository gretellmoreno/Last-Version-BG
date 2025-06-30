import React, { useState } from 'react';
import { X, CreditCard, Edit2, Check, X as XIcon, Trash2 } from 'lucide-react';
import { CalendarEvent, AppointmentDetails } from '../types';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration?: number;
}

interface FecharComandaModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: CalendarEvent | null;
  appointmentDetails: AppointmentDetails | null;
}

export default function FecharComandaModal({
  isOpen,
  onClose,
  appointment,
  appointmentDetails
}: FecharComandaModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  
  // Estados para edição de valores
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editedServices, setEditedServices] = useState<Record<string, number>>({});
  const [editedProducts, setEditedProducts] = useState<Record<string, number>>({});
  const [tempServiceValue, setTempServiceValue] = useState('');
  const [tempProductValue, setTempProductValue] = useState('');
  
  if (!isOpen) return null;

  // Unificar dados do appointment (legado ou via RPC)
  const currentAppointmentData = appointmentDetails?.appointment;
  const professionalName = appointmentDetails 
    ? currentAppointmentData?.professional.name 
    : appointment?.professionalName;
  const clientName = appointmentDetails
    ? currentAppointmentData?.client.name
    : appointment?.client;
  const bookingDate = appointmentDetails
    ? new Date(currentAppointmentData?.date || '')
    : appointment?.start;
  const bookingTime = appointmentDetails
    ? currentAppointmentData?.start_time
    : appointment?.start.toTimeString().slice(0, 5);
  const services = appointmentDetails
    ? currentAppointmentData?.services || []
    : appointment?.services || [];

  // Produtos mockados (posteriormente virão dos dados reais)
  const products: Product[] = [
    { id: '1', name: 'Sabonete', price: 26.90 }
  ]; // TODO: Obter produtos reais dos dados

  // Métodos de pagamento disponíveis
  const paymentMethods = [
    { id: 'dinheiro', name: 'Dinheiro' },
    { id: 'pix', name: 'PIX' },
    { id: 'cartao_debito', name: 'Cartão de Débito' },
    { id: 'cartao_credito', name: 'Cartão de Crédito' },
    { id: 'transferencia', name: 'Transferência Bancária' }
  ];

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours}h`;
      }
      return `${hours}h ${remainingMinutes}min`;
    }
    return `${minutes}min`;
  };

  // Função para obter preço atual do serviço (editado ou original)
  const getServicePrice = (service: Service) => {
    return editedServices[service.id] !== undefined ? editedServices[service.id] : service.price;
  };

  // Função para obter preço atual do produto (editado ou original)
  const getProductPrice = (product: Product) => {
    return editedProducts[product.id] !== undefined ? editedProducts[product.id] : product.price;
  };

  // Funções para edição de serviços
  const startEditingService = (service: Service) => {
    setEditingServiceId(service.id);
    setTempServiceValue(getServicePrice(service).toFixed(2).replace('.', ','));
  };

  const saveServiceEdit = () => {
    if (editingServiceId && tempServiceValue) {
      const value = parseFloat(tempServiceValue.replace(',', '.'));
      if (!isNaN(value) && value >= 0) {
        setEditedServices(prev => ({
          ...prev,
          [editingServiceId]: value
        }));
      }
    }
    setEditingServiceId(null);
    setTempServiceValue('');
  };

  const cancelServiceEdit = () => {
    setEditingServiceId(null);
    setTempServiceValue('');
  };

  // Funções para edição de produtos
  const startEditingProduct = (product: Product) => {
    setEditingProductId(product.id);
    setTempProductValue(getProductPrice(product).toFixed(2).replace('.', ','));
  };

  const saveProductEdit = () => {
    if (editingProductId && tempProductValue) {
      const value = parseFloat(tempProductValue.replace(',', '.'));
      if (!isNaN(value) && value >= 0) {
        setEditedProducts(prev => ({
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

  // Calcular totais com valores editados
  const totalServices = services.reduce((total, service) => total + getServicePrice(service), 0);
  const totalProducts = products.reduce((total, product) => total + getProductPrice(product), 0);
  const totalGeral = totalServices + totalProducts;

  const handleFecharComanda = () => {
    if (!selectedPaymentMethod) {
      alert('Por favor, selecione um método de pagamento');
      return;
    }
    
    console.log('Fechando comanda com:', {
      appointment: appointment || appointmentDetails,
      paymentMethod: selectedPaymentMethod,
      totalServices,
      totalProducts,
      totalGeral,
      editedServices,
      editedProducts
    });
    
    // TODO: Implementar chamada para API de fechamento de comanda
    alert(`Comanda fechada com sucesso!\nTotal: R$ ${totalGeral.toFixed(2).replace('.', ',')}\nPagamento: ${paymentMethods.find(p => p.id === selectedPaymentMethod)?.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Painel lateral direito */}
      <div className="absolute right-0 top-0 h-full w-1/2 max-w-2xl">
        <div className="relative bg-white h-full shadow-xl overflow-hidden flex flex-col">
          {/* Header do modal */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">Comanda</h1>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Conteúdo do modal */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Informações compactas da comanda */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Profissional e Cliente */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 font-semibold text-xs">
                        {professionalName?.charAt(0).toUpperCase() || 'V'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{professionalName || 'vini'}</p>
                      <p className="text-xs text-gray-500">Profissional</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-700 font-semibold text-xs">
                        {clientName?.charAt(0).toUpperCase() || 'C'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{clientName || 'Cliente selecionado'}</p>
                      <p className="text-xs text-gray-500">Cliente</p>
                    </div>
                  </div>
                </div>
                
                {/* Data e Horário */}
                <div className="space-y-3">
                  <div className="text-right">
                    <p className="font-medium text-gray-900 text-sm">
                      {bookingDate?.toLocaleDateString('pt-BR') || '27/06/2025'}
                    </p>
                    <p className="text-xs text-gray-500">Data</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 text-sm">
                      {bookingTime?.slice(0, 5) || '10:15'}
                    </p>
                    <p className="text-xs text-gray-500">Horário</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Serviços realizados */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Serviços</h3>
              <div className="space-y-3">
                {services.length === 0 ? (
                  // Serviços mockados para demonstração
                  <>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-base">Corte Feminino</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                            <span>1h</span>
                            {editingServiceId !== 'corte-feminino' && (
                              <span className="font-semibold text-gray-900">
                                R$ {(editedServices['corte-feminino'] || 80.00).toFixed(2).replace('.', ',')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {editingServiceId === 'corte-feminino' ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={tempServiceValue}
                                onChange={(e) => setTempServiceValue(e.target.value)}
                                className="w-20 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0,00"
                                autoFocus
                              />
                              <button
                                onClick={saveServiceEdit}
                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={cancelServiceEdit}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <XIcon size={16} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingServiceId('corte-feminino');
                                  setTempServiceValue((editedServices['corte-feminino'] || 80.00).toFixed(2).replace('.', ','));
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Editar valor"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Remover serviço"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-base">Micropigmentação</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                            <span>2h</span>
                            {editingServiceId !== 'micropigmentacao' && (
                              <span className="font-semibold text-gray-900">
                                R$ {(editedServices['micropigmentacao'] || 350.00).toFixed(2).replace('.', ',')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {editingServiceId === 'micropigmentacao' ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={tempServiceValue}
                                onChange={(e) => setTempServiceValue(e.target.value)}
                                className="w-20 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0,00"
                                autoFocus
                              />
                              <button
                                onClick={saveServiceEdit}
                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={cancelServiceEdit}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <XIcon size={16} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingServiceId('micropigmentacao');
                                  setTempServiceValue((editedServices['micropigmentacao'] || 350.00).toFixed(2).replace('.', ','));
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Editar valor"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Remover serviço"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-base">Pedicure</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                            <span>30min</span>
                            {editingServiceId !== 'pedicure' && (
                              <span className="font-semibold text-gray-900">
                                R$ {(editedServices['pedicure'] || 25.00).toFixed(2).replace('.', ',')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {editingServiceId === 'pedicure' ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={tempServiceValue}
                                onChange={(e) => setTempServiceValue(e.target.value)}
                                className="w-20 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0,00"
                                autoFocus
                              />
                              <button
                                onClick={saveServiceEdit}
                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={cancelServiceEdit}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <XIcon size={16} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingServiceId('pedicure');
                                  setTempServiceValue((editedServices['pedicure'] || 25.00).toFixed(2).replace('.', ','));
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Editar valor"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Remover serviço"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  services.map((service, index) => (
                    <div key={service.id || index} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-base">{service.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                            <span>{formatDuration(service.duration || 30)}</span>
                            {editingServiceId !== service.id && (
                              <span className="font-semibold text-gray-900">
                                R$ {getServicePrice(service).toFixed(2).replace('.', ',')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {editingServiceId === service.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={tempServiceValue}
                                onChange={(e) => setTempServiceValue(e.target.value)}
                                className="w-20 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0,00"
                                autoFocus
                              />
                              <button
                                onClick={saveServiceEdit}
                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={cancelServiceEdit}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <XIcon size={16} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditingService(service)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Editar valor"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Remover serviço"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Produtos */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Produtos</h3>
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-base">{product.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                          <span>Produto</span>
                          {editingProductId !== product.id && (
                            <span className="font-semibold text-gray-900">
                              R$ {getProductPrice(product).toFixed(2).replace('.', ',')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {editingProductId === product.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={tempProductValue}
                              onChange={(e) => setTempProductValue(e.target.value)}
                              className="w-20 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0,00"
                              autoFocus
                            />
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
                            <button
                              onClick={() => startEditingProduct(product)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Editar valor"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Remover produto"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Botões para adicionar serviço e produto */}
              <div className="mt-4 space-y-2">
                <button className="w-full py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm">
                  + Adicionar serviço
                </button>
                <button className="w-full py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors text-sm">
                  + Adicionar produto
                </button>
              </div>
            </div>

            {/* Resumo financeiro */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Serviços:</span>
                  <span className="text-sm font-medium text-blue-700">
                    R$ {(services.length === 0 ? 
                      (editedServices['corte-feminino'] || 80.00) + 
                      (editedServices['micropigmentacao'] || 350.00) + 
                      (editedServices['pedicure'] || 25.00) : 
                      totalServices).toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Produtos:</span>
                  <span className="text-sm font-medium text-blue-700">
                    R$ {totalProducts.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="border-t border-blue-200 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-900">Total Geral:</span>
                    <span className="text-xl font-bold text-blue-900">
                      R$ {(services.length === 0 ? 
                        (editedServices['corte-feminino'] || 80.00) + 
                        (editedServices['micropigmentacao'] || 350.00) + 
                        (editedServices['pedicure'] || 25.00) + 
                        totalProducts : 
                        totalGeral).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer com botões */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleFecharComanda}
                className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Fechar Comanda
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 