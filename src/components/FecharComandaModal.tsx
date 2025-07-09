import React, { useState, useEffect } from 'react';
import { X, CreditCard, Edit2, Check, X as XIcon, Trash2, Plus, Minus } from 'lucide-react';
import { CalendarEvent, AppointmentDetails } from '../types';
import { useApp } from '../contexts/AppContext';
import { supabaseService } from '../lib/supabaseService';

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
  
  // Estado para quantidades dos produtos
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  
  // Estados para loading e erro
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  // Hook para obter dados do contexto
  const { currentSalon } = useApp();

  // Extrair dados reais do appointment
  const currentAppointmentData = appointmentDetails?.appointment;
  const professionalName = currentAppointmentData?.professional?.name || appointment?.professionalName;
  const clientName = currentAppointmentData?.client?.name || appointment?.client;
  const bookingDate = currentAppointmentData?.date 
    ? new Date(currentAppointmentData.date) 
    : appointment?.start;
  const bookingTime = currentAppointmentData?.start_time || 
    (appointment?.start ? appointment.start.toTimeString().slice(0, 5) : null);
  
  // Obter serviços e produtos reais dos dados
  const services = currentAppointmentData?.services || appointment?.services || [];
  const products = (currentAppointmentData as any)?.products || [];
  
  // Inicializar quantidades dos produtos quando o modal abrir
  useEffect(() => {
    if (isOpen && products.length > 0) {
      const initialQuantities: Record<string, number> = {};
      products.forEach((product: any) => {
        initialQuantities[product.product_id || product.id] = product.quantity || 1;
      });
      setProductQuantities(initialQuantities);
    }
  }, [isOpen, products]);
  
  // Componente de spinner para loading
  const LoadingSpinner = () => (
    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  );
  
  if (!isOpen || !currentAppointmentData) return null;

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
  const getServicePrice = (service: any) => {
    const serviceId = service.id || service.service_id;
    return editedServices[serviceId] !== undefined ? editedServices[serviceId] : service.price;
  };

  // Função para obter preço atual do produto (editado ou original)
  const getProductPrice = (product: any) => {
    const productId = product.product_id || product.id;
    return editedProducts[productId] !== undefined ? editedProducts[productId] : product.price;
  };

  // Função para obter quantidade atual do produto
  const getProductQuantity = (productId: string) => {
    return productQuantities[productId] || 1;
  };

  // Funções para controle de quantidade
  const incrementQuantity = (productId: string) => {
    setProductQuantities(prev => ({
      ...prev,
      [productId]: (prev[productId] || 1) + 1
    }));
  };

  const decrementQuantity = (productId: string) => {
    setProductQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) - 1)
    }));
  };

  // Funções para edição de serviços
  const startEditingService = (service: any) => {
    const serviceId = service.id || service.service_id;
    setEditingServiceId(serviceId);
    setTempServiceValue(getServicePrice(service).toFixed(2).replace('.', ','));
  };

  const saveServiceEdit = async () => {
    if (!editingServiceId || !tempServiceValue || !currentSalon?.id) return;
    
    const value = parseFloat(tempServiceValue.replace(',', '.'));
    if (isNaN(value) || value < 0) return;
    
    setIsUpdating(true);
    setUpdateError(null);
    
    try {
      const appointmentId = currentAppointmentData.id;
      
      if (!appointmentId) {
        throw new Error('ID do agendamento não encontrado');
      }
      
      // Encontrar o service correto e usar o appointment_service_id se disponível
      const serviceToUpdate = services.find((s: any) => (s.id || s.service_id) === editingServiceId);
      let itemRecordId = editingServiceId;
      
      if (serviceToUpdate && (serviceToUpdate as any).appointment_service_id) {
        itemRecordId = (serviceToUpdate as any).appointment_service_id;
      }
      
      const { data, error } = await supabaseService.appointments.updateComandaItem({
        salonId: currentSalon.id,
        appointmentId: appointmentId,
        itemType: 'service',
        itemRecordId: itemRecordId,
        customPrice: value
      });
      
      if (error) {
        setUpdateError('Erro ao atualizar valor do serviço: ' + error);
        return;
      }
      
      if (data?.success) {
        setEditedServices(prev => ({
          ...prev,
          [editingServiceId]: value
        }));
        
        console.log('✅ Valor do serviço atualizado com sucesso!');
      }
      
    } catch (err) {
      console.error('Erro ao atualizar serviço:', err);
      setUpdateError('Erro inesperado ao atualizar valor do serviço');
    } finally {
      setIsUpdating(false);
      setEditingServiceId(null);
      setTempServiceValue('');
    }
  };

  const cancelServiceEdit = () => {
    setEditingServiceId(null);
    setTempServiceValue('');
  };

  // Funções para edição de produtos
  const startEditingProduct = (product: any) => {
    const productId = product.product_id || product.id;
    setEditingProductId(productId);
    setTempProductValue(getProductPrice(product).toFixed(2).replace('.', ','));
  };

  const saveProductEdit = async () => {
    if (!editingProductId || !tempProductValue || !currentSalon?.id) return;
    
    const value = parseFloat(tempProductValue.replace(',', '.'));
    if (isNaN(value) || value < 0) return;
    
    setIsUpdating(true);
    setUpdateError(null);
    
    try {
      const appointmentId = currentAppointmentData.id;
      
      if (!appointmentId) {
        throw new Error('ID do agendamento não encontrado');
      }
      
      // Encontrar o produto correto e usar o product_sale_id se disponível
      const productToUpdate = products.find((p: any) => (p.product_id || p.id) === editingProductId);
      let itemRecordId = editingProductId;
      
      if (productToUpdate && productToUpdate.product_sale_id) {
        itemRecordId = productToUpdate.product_sale_id;
      }
      
      const { data, error } = await supabaseService.appointments.updateComandaItem({
        salonId: currentSalon.id,
        appointmentId: appointmentId,
        itemType: 'product',
        itemRecordId: itemRecordId,
        customPrice: value
      });
      
      if (error) {
        setUpdateError('Erro ao atualizar valor do produto: ' + error);
        return;
      }
      
      if (data?.success) {
        setEditedProducts(prev => ({
          ...prev,
          [editingProductId]: value
        }));
        
        console.log('✅ Valor do produto atualizado com sucesso!');
      }
      
    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
      setUpdateError('Erro inesperado ao atualizar valor do produto');
    } finally {
      setIsUpdating(false);
      setEditingProductId(null);
      setTempProductValue('');
    }
  };

  const cancelProductEdit = () => {
    setEditingProductId(null);
    setTempProductValue('');
  };

  // Calcular totais com valores editados e quantidades
  const totalServices = services.reduce((total: number, service: any) => {
    return total + getServicePrice(service);
  }, 0);
  
  const totalProducts = products.reduce((total: number, product: any) => {
    const quantity = getProductQuantity(product.product_id || product.id);
    const price = getProductPrice(product);
    return total + (price * quantity);
  }, 0);
  
  const totalGeral = totalServices + totalProducts;

  const handleFecharComanda = () => {
    if (!selectedPaymentMethod) {
      alert('Por favor, selecione um método de pagamento');
      return;
    }
    
    console.log('Fechando comanda com:', {
      appointment: currentAppointmentData,
      paymentMethod: selectedPaymentMethod,
      totalServices,
      totalProducts,
      totalGeral,
      editedServices,
      editedProducts,
      productQuantities
    });
    
    // TODO: Implementar chamada para API de fechamento de comanda
    alert(`Comanda fechada com sucesso!\nTotal: R$ ${totalGeral.toFixed(2).replace('.', ',')}\nPagamento: ${paymentMethods.find(p => p.id === selectedPaymentMethod)?.name}`);
    onClose();
  };

  // Se não há dados suficientes, não renderizar o modal
  if (!professionalName || !clientName) {
    return null;
  }

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
            {/* Exibir erro se houver */}
            {updateError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <XIcon className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{updateError}</p>
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      onClick={() => setUpdateError(null)}
                      className="text-red-400 hover:text-red-500"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Informações da comanda */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Profissional e Cliente */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 font-semibold text-xs">
                        {professionalName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{professionalName}</p>
                      <p className="text-xs text-gray-500">Profissional</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-700 font-semibold text-xs">
                        {clientName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{clientName}</p>
                      <p className="text-xs text-gray-500">Cliente</p>
                    </div>
                  </div>
                </div>
                
                {/* Data e Horário */}
                <div className="space-y-3">
                  <div className="text-right">
                    <p className="font-medium text-gray-900 text-sm">
                      {bookingDate ? bookingDate.toLocaleDateString('pt-BR') : 'Data não disponível'}
                    </p>
                    <p className="text-xs text-gray-500">Data</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 text-sm">
                      {bookingTime || 'Horário não disponível'}
                    </p>
                    <p className="text-xs text-gray-500">Horário</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Serviços realizados */}
            {services.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Serviços</h3>
                <div className="space-y-3">
                  {services.map((service: any, index: number) => {
                    const serviceId = service.id || service.service_id;
                    return (
                      <div key={serviceId || index} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-base">{service.name}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                              <span>{formatDuration(service.duration || 30)}</span>
                              {editingServiceId !== serviceId && (
                                <span className="font-semibold text-gray-900">
                                  R$ {getServicePrice(service).toFixed(2).replace('.', ',')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {editingServiceId === serviceId ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={tempServiceValue}
                                  onChange={(e) => setTempServiceValue(e.target.value)}
                                  className="w-20 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="0,00"
                                  autoFocus
                                  disabled={isUpdating}
                                />
                                <button
                                  onClick={saveServiceEdit}
                                  disabled={isUpdating}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isUpdating ? <LoadingSpinner /> : <Check size={16} />}
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
                    );
                  })}
                </div>
              </div>
            )}

            {/* Produtos */}
            {products.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Produtos</h3>
                <div className="space-y-3">
                  {products.map((product: any, index: number) => {
                    const productId = product.product_id || product.id;
                    return (
                      <div key={productId || index} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-base">{product.name}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                              <span>Produto</span>
                              {editingProductId !== productId && (
                                <span className="font-semibold text-gray-900">
                                  R$ {getProductPrice(product).toFixed(2).replace('.', ',')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* Edição de preço */}
                            {editingProductId === productId ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={tempProductValue}
                                  onChange={(e) => setTempProductValue(e.target.value)}
                                  className="w-20 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="0,00"
                                  autoFocus
                                  disabled={isUpdating}
                                />
                                <button
                                  onClick={saveProductEdit}
                                  disabled={isUpdating}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isUpdating ? <LoadingSpinner /> : <Check size={16} />}
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
                                  className="w-6 h-6 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Editar valor"
                                >
                                  <Edit2 size={12} />
                                </button>

                                {/* Controles de quantidade compactos */}
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => decrementQuantity(productId)}
                                    disabled={getProductQuantity(productId) === 1}
                                    className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                  >
                                    <Minus size={10} className="text-gray-600" />
                                  </button>
                                  
                                  <span className="w-6 text-center font-medium text-xs">{getProductQuantity(productId)}</span>
                                  
                                  <button
                                    onClick={() => incrementQuantity(productId)}
                                    className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all"
                                  >
                                    <Plus size={10} className="text-gray-600" />
                                  </button>
                                </div>

                                {/* Botão remover produto */}
                                <button
                                  className="w-6 h-6 flex items-center justify-center text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Remover produto"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Botões para adicionar serviço e produto */}
            <div className="mb-6 space-y-2">
              <button className="w-full py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm">
                + Adicionar serviço
              </button>
              <button className="w-full py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors text-sm">
                + Adicionar produto
              </button>
            </div>

            {/* Resumo financeiro */}
            {(services.length > 0 || products.length > 0) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="space-y-2">
                  {services.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700">Serviços:</span>
                      <span className="text-sm font-medium text-blue-700">
                        R$ {totalServices.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )}
                  {products.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700">Produtos:</span>
                      <span className="text-sm font-medium text-blue-700">
                        R$ {totalProducts.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-blue-200 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900">Total Geral:</span>
                      <span className="text-xl font-bold text-blue-900">
                        R$ {totalGeral.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Seleção de método de pagamento */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Método de Pagamento</h3>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`p-3 text-sm border rounded-lg transition-colors ${
                      selectedPaymentMethod === method.id
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {method.name}
                  </button>
                ))}
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
                disabled={!selectedPaymentMethod || totalGeral === 0}
                className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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