import React, { useState, useMemo, useCallback } from 'react';
import User from 'lucide-react/dist/esm/icons/user';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Package from 'lucide-react/dist/esm/icons/package';
import Edit2 from 'lucide-react/dist/esm/icons/edit-2';
import XIcon from 'lucide-react/dist/esm/icons/x';
import UserCheck from 'lucide-react/dist/esm/icons/user-check';
import { useService } from '../../contexts/ServiceContext';
import { useProfessional } from '../../contexts/ProfessionalContext';
import { useProduct } from '../../contexts/ProductContext';
import { appointmentService } from '../../lib/supabaseService';

interface ServiceConfirmationProps {
  selectedClient: any;
  selectedServices: string[];
  selectedProducts: string[];
  serviceProfessionals: { serviceId: string; professionalId: string }[];
  onShowClientSelection: () => void;
  onShowProfessionalSelection: () => void;
  onBackToServices: () => void;
  onShowProductSelection: () => void;
  onUpdateServiceProfessionals: (professionals: { serviceId: string; professionalId: string }[]) => void;
  onContinue: () => void;
  onToggleService: (serviceId: string) => void;
  onToggleProduct?: (productId: string) => void;
  hasPreselectedDateTime?: boolean;
  isLoading?: boolean;
  isNewAppointment?: boolean; // Nova prop para distinguir novo agendamento vs edição
  hideClientSection?: boolean; // Prop para esconder seção de cliente em mobile
  appointmentId?: string; // ID do agendamento para atualizar comanda
  salonId?: string; // ID do salão
  appointmentDetails?: any; // Dados completos do agendamento para obter IDs corretos
  onRefreshAppointment?: () => Promise<void>; // Função para recarregar dados do agendamento
}

export default function ServiceConfirmation({
  selectedClient,
  selectedServices,
  selectedProducts,
  serviceProfessionals,
  onShowClientSelection,
  onShowProfessionalSelection,
  onBackToServices,
  onShowProductSelection,
  onUpdateServiceProfessionals,
  onContinue,
  onToggleService,
  onToggleProduct,
  hasPreselectedDateTime = false,
  isLoading = false,
  isNewAppointment = false,
  hideClientSection = false,
  appointmentId,
  salonId,
  appointmentDetails,
  onRefreshAppointment
}: ServiceConfirmationProps) {
  const { services } = useService();
  const { products } = useProduct();
  const { professionals } = useProfessional();
  
  // Estados para edição de valores
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editedServicePrices, setEditedServicePrices] = useState<Record<string, number>>({});
  const [editedProductPrices, setEditedProductPrices] = useState<Record<string, number>>({});
  const [editedProductQuantities, setEditedProductQuantities] = useState<Record<string, number>>({});
  const [tempServiceValue, setTempServiceValue] = useState('');
  const [tempProductValue, setTempProductValue] = useState('');
  const [tempProductQuantity, setTempProductQuantity] = useState('1');

  // Filtrar serviços selecionados
  const selectedServiceObjects = services?.filter(service => 
    selectedServices.includes(service.id)
  ) || [];

  // Obter profissional selecionado (assumindo que todos os serviços têm o mesmo profissional)
  const selectedProfessionalId = serviceProfessionals.length > 0 ? serviceProfessionals[0].professionalId : '';
  const selectedProfessional = professionals?.find(p => p.id === selectedProfessionalId);

  // Função para obter preço atual do serviço (editado, do agendamento ou original)
  const getServicePrice = (service: any) => {
    // Prioridade: 1. Editado localmente, 2. Do agendamento, 3. Original
    if (editedServicePrices[service.id] !== undefined) {
      return editedServicePrices[service.id];
    }
    
    // Se estamos editando um agendamento, usar preço do agendamento
    if (appointmentDetails?.appointment?.services) {
      const serviceInAppointment = appointmentDetails.appointment.services.find((s: any) => s.id === service.id);
      if (serviceInAppointment?.price !== undefined) {
        return serviceInAppointment.price;
      }
    }
    
    return service.price;
  };

  // Função para obter preço atual do produto (editado, do agendamento ou original)
  const getProductPrice = (product: any) => {
    // Prioridade: 1. Editado localmente, 2. Do agendamento, 3. Original
    if (editedProductPrices[product.id] !== undefined) {
      return editedProductPrices[product.id];
    }
    
    // Se estamos editando um agendamento, usar preço do agendamento
    if (appointmentDetails?.appointment?.products) {
      const productInAppointment = appointmentDetails.appointment.products.find((p: any) => p.product_id === product.id);
      if (productInAppointment?.unit_price !== undefined) {
        return productInAppointment.unit_price;
      }
    }
    
    return product.price;
  };

  // Função para obter quantidade atual do produto (editada, do agendamento ou padrão)
  const getProductQuantity = (product: any) => {
    // Prioridade: 1. Editado localmente, 2. Do agendamento, 3. Padrão (1)
    if (editedProductQuantities[product.id] !== undefined) {
      return editedProductQuantities[product.id];
    }
    
    // Se estamos editando um agendamento, usar quantidade do agendamento
    if (appointmentDetails?.appointment?.products) {
      const productInAppointment = appointmentDetails.appointment.products.find((p: any) => p.product_id === product.id);
      if (productInAppointment?.quantity !== undefined) {
        return productInAppointment.quantity;
      }
    }
    
    return 1;
  };

  // Função para formatar valor para exibição (com separador de milhares)
  const formatDisplayValue = (value: number) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Funções para edição de serviços
  const startEditingService = (service: any) => {
    setEditingServiceId(service.id);
    setTempServiceValue(getServicePrice(service).toFixed(2).replace('.', ','));
  };

  // Função para aplicar máscara de valor monetário
  const formatCurrencyInput = (value: string) => {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '');
    
    // Se não há dígitos, retorna vazio
    if (!digits) return '';
    
    // Converte para número em centavos
    const number = parseInt(digits, 10);
    
    // Converte para reais (divide por 100)
    const reais = number / 100;
    
    // Formata com separador de milhares (ponto) e decimais (vírgula)
    const formatted = reais.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return formatted;
  };

  // Função para converter valor formatado para número
  const parseFormattedValue = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return 0;
    return parseInt(digits, 10) / 100;
  };

  const saveServiceEdit = async () => {
    console.log('🔧 saveServiceEdit chamada', { editingServiceId, tempServiceValue, appointmentId, salonId });
    
    if (editingServiceId && tempServiceValue) {
      const value = parseFormattedValue(tempServiceValue);
      if (!isNaN(value) && value >= 0) {
        setEditedServicePrices(prev => ({
          ...prev,
          [editingServiceId]: value
        }));
        
        // Chamar função para atualizar comanda se estivermos editando um agendamento
        if (appointmentId && salonId && appointmentDetails) {
          // Buscar o appointment_service.id correto para este serviço
          const serviceInAppointment = appointmentDetails.appointment?.services?.find((s: any) => s.id === editingServiceId);
          const appointmentServiceId = serviceInAppointment?.appointment_service_id;
          
          if (appointmentServiceId) {
            console.log('🔧 Chamando updateComandaItem para serviço', {
              salonId,
              appointmentId,
              itemType: 'service',
              itemRecordId: appointmentServiceId, // Agora usando appointment_service_id
              customPrice: value
            });
            
            const result = await appointmentService.updateComandaItem({
              salonId,
              appointmentId,
              itemType: 'service',
              itemRecordId: appointmentServiceId,
              customPrice: value
            });
            
            console.log('🔧 Resultado updateComandaItem:', result);
            
            // Se a atualização foi bem-sucedida, recarregar dados do agendamento
            if (result.data?.success && onRefreshAppointment) {
              await onRefreshAppointment();
              // Limpar estado de edição local para usar os novos valores do agendamento
              setEditedServicePrices(prev => {
                const newPrices = { ...prev };
                delete newPrices[editingServiceId];
                return newPrices;
              });
            }
          } else {
            console.log('🔧 appointment_service_id não encontrado para o serviço:', editingServiceId);
          }
        } else {
          console.log('🔧 Não chamando updateComandaItem - dados ausentes');
        }
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
  const startEditingProduct = (product: any) => {
    setEditingProductId(product.id);
    setTempProductValue(getProductPrice(product).toFixed(2).replace('.', ','));
    setTempProductQuantity(getProductQuantity(product).toString());
  };

  const saveProductEdit = async () => {
    console.log('🔧 saveProductEdit chamada', { editingProductId, tempProductValue, tempProductQuantity, appointmentId, salonId });
    
    if (editingProductId && tempProductValue && tempProductQuantity) {
      const value = parseFormattedValue(tempProductValue);
      const quantity = parseInt(tempProductQuantity, 10);
      
      if (!isNaN(value) && value >= 0 && !isNaN(quantity) && quantity > 0) {
        setEditedProductPrices(prev => ({
          ...prev,
          [editingProductId]: value
        }));
        
        setEditedProductQuantities(prev => ({
          ...prev,
          [editingProductId]: quantity
        }));
        
        // Chamar função para atualizar comanda se estivermos editando um agendamento  
        if (appointmentId && salonId && appointmentDetails) {
          // Buscar o product_sale.id correto para este produto
          const productInAppointment = appointmentDetails.appointment?.products?.find((p: any) => p.product_id === editingProductId);
          const productSaleId = productInAppointment?.product_sale_id;
          
          if (productSaleId) {
            console.log('🔧 Chamando updateComandaItem para produto', {
              salonId,
              appointmentId,
              itemType: 'product',
              itemRecordId: productSaleId, // Agora usando product_sale_id
              customPrice: value,
              quantity: quantity
            });
            
            const result = await appointmentService.updateComandaItem({
              salonId,
              appointmentId,
              itemType: 'product',
              itemRecordId: productSaleId,
              customPrice: value,
              quantity: quantity
            });
            
            console.log('🔧 Resultado updateComandaItem:', result);
            
            // Se a atualização foi bem-sucedida, recarregar dados do agendamento
            if (result.data?.success && onRefreshAppointment) {
              await onRefreshAppointment();
              // Limpar estado de edição local para usar os novos valores do agendamento
              setEditedProductPrices(prev => {
                const newPrices = { ...prev };
                delete newPrices[editingProductId];
                return newPrices;
              });
              setEditedProductQuantities(prev => {
                const newQuantities = { ...prev };
                delete newQuantities[editingProductId];
                return newQuantities;
              });
            }
          } else {
            console.log('🔧 product_sale_id não encontrado para o produto:', editingProductId);
          }
        } else {
          console.log('🔧 Não chamando updateComandaItem - dados ausentes');
        }
      }
    }
    setEditingProductId(null);
    setTempProductValue('');
    setTempProductQuantity('1');
  };

  const cancelProductEdit = () => {
    setEditingProductId(null);
    setTempProductValue('');
    setTempProductQuantity('1');
  };

  // Handlers para mudança de valor com máscara
  const handleServiceValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setTempServiceValue(formatted);
  };

  const handleProductValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setTempProductValue(formatted);
  };

  const handleProductQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Apenas números
    if (value === '' || (parseInt(value, 10) > 0 && parseInt(value, 10) <= 999)) {
      setTempProductQuantity(value);
    }
  };

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

  // Detectar se está em mobile (hideClientSection true) ou desktop
  const isDesktop = !hideClientSection;

  return (
    <div className={`flex h-full relative overflow-hidden ${hideClientSection ? 'w-full' : ''}`}>
      {/* Sidebar esquerda com cliente - condicional */}
      {!hideClientSection && (
      <div 
        className="w-48 bg-gray-50 border-r border-gray-200 flex flex-col cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onShowClientSelection}
      >
        <div className="p-6 flex flex-col items-center text-center">
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
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 relative">
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

      {/* Conteúdo principal */}
      <div className={`flex flex-col ${hideClientSection ? 'w-full' : 'flex-1'}`}>

        {/* Header mobile com botão de voltar e título Serviços */}
        {isNewAppointment && (
          <div className="sm:hidden flex items-center p-2">
            <button
              onClick={onBackToServices}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Voltar"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left text-gray-600"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <span className="ml-2 font-semibold text-gray-900 text-lg">Serviços</span>
          </div>
        )}

        {/* Remover título duplicado de Serviços em mobile */}

        {/* Info Card */}
        {/* Removido card de serviços/quantidade/valor para mobile */}

        {/* Lista de serviços */}
        <div className="flex-1 overflow-y-auto p-6 pb-28 md:pb-6"> {/* padding-bottom maior no mobile */}
          <div className="space-y-4">
            {/* Serviços selecionados */}
            <div className="space-y-4 mt-0 md:mt-6">
              {selectedServiceObjects.map((service) => (
                <div key={service.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{service.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>{formatDuration(service.estimated_time)}</span>
                        {editingServiceId !== service.id && (
                          <span className="font-semibold text-gray-900">
                            R$ {formatDisplayValue(getServicePrice(service))}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {editingServiceId === service.id ? (
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-1">R$</span>
                            <input
                              type="text"
                              value={tempServiceValue}
                              onChange={handleServiceValueChange}
                              className="w-20 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0,00"
                              autoFocus
                            />
                          </div>
                          <button
                            onClick={saveServiceEdit}
                            className="px-2 py-1 text-xs bg-green-600 text-white hover:bg-green-700 rounded transition-colors font-medium"
                          >
                            Salvar
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
                            className="w-8 h-8 flex items-center justify-center transition-colors group"
                            title="Editar valor"
                          >
                            <Edit2 size={16} className="text-blue-600 hover:text-blue-700" />
                          </button>
                          {/* Botão de remover serviço - só aparece se houver mais de um serviço */}
                          {selectedServices.length > 1 && (
                            <button
                              onClick={() => onToggleService(service.id)}
                              className="w-8 h-8 flex items-center justify-center transition-colors group"
                              title="Remover serviço"
                            >
                              <Trash2 size={16} className="text-red-600 hover:text-red-700" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Seletores de Cliente e Profissional - só aparece em novo agendamento quando não há profissional pré-selecionado */}
            {isNewAppointment && !hasPreselectedDateTime && (
              <div className="space-y-3 mt-6">
                {/* Cliente e Profissional */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Profissional</h4>
                  <div className="flex space-x-3">
                    {/* Botão de profissional sempre */}
                    <button
                      className={`flex-1 border-2 rounded-lg px-4 py-3 flex flex-col items-center justify-center ${selectedProfessional ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white'} transition-colors`}
                      onClick={onShowProfessionalSelection}
                    >
                      {selectedProfessional?.url_foto ? (
                        <img
                          src={selectedProfessional.url_foto}
                          alt={selectedProfessional.name}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-yellow-200 mb-2"
                        />
                      ) : (
                        <UserCheck size={22} className="mb-1 text-yellow-600" />
                      )}
                      <span className="text-xs font-medium text-gray-900">{selectedProfessional ? selectedProfessional.name : 'Selecionar Profissional'}</span>
                      {selectedProfessional && <span className="text-xs text-gray-500">Profissional selecionado</span>}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Produtos selecionados */}
            {selectedProducts.length > 0 && (
              <div className="space-y-3 mt-6">
                <h3 className="text-base font-medium text-gray-900 mb-2">Produtos</h3>
                {products?.filter(product => selectedProducts.includes(product.id)).map((product) => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span>Produto</span>
                          {editingProductId !== product.id && (
                            <>
                              <span className="font-semibold text-gray-900">
                                {getProductQuantity(product)}x R$ {formatDisplayValue(getProductPrice(product))}
                              </span>
                              <span className="text-xs text-gray-400">
                                Total: R$ {formatDisplayValue(getProductPrice(product) * getProductQuantity(product))}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {editingProductId === product.id ? (
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                                <span className="text-xs text-gray-500 mr-1">Qtd:</span>
                                <input
                                  type="text"
                                  value={tempProductQuantity}
                                  onChange={handleProductQuantityChange}
                                  className="w-12 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                  placeholder="1"
                                />
                              </div>
                              <div className="flex items-center">
                                <span className="text-xs text-gray-500 mr-1">R$</span>
                                <input
                                  type="text"
                                  value={tempProductValue}
                                  onChange={handleProductValueChange}
                                  className="w-20 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="0,00"
                                />
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={saveProductEdit}
                                className="px-2 py-1 text-xs bg-green-600 text-white hover:bg-green-700 rounded transition-colors font-medium"
                              >
                                Salvar
                              </button>
                              <button
                                onClick={cancelProductEdit}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <XIcon size={16} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditingProduct(product)}
                              className="w-8 h-8 flex items-center justify-center transition-colors group"
                              title="Editar valor e quantidade"
                            >
                              <Edit2 size={16} className="text-blue-600 hover:text-blue-700" />
                            </button>
                            <button
                              onClick={() => onToggleProduct?.(product.id)}
                              className="w-8 h-8 flex items-center justify-center transition-colors group"
                              title="Remover produto"
                            >
                              <Trash2 size={16} className="text-red-600 hover:text-red-700" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Container dos botões com espaçamento */}
            <div className="flex flex-col space-y-3 mt-6">
              {/* Botão Adicionar Serviço */}
              <button
                onClick={onBackToServices}
                className="flex items-center justify-center space-x-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm"
              >
                <Plus size={16} />
                <span>Adicionar serviço</span>
              </button>

              {/* Botão Adicionar Produto - só aparece em comandas, não em novos agendamentos */}
              {!isNewAppointment && (
                <button
                  onClick={onShowProductSelection}
                  className="flex items-center justify-center space-x-2 px-4 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors text-sm"
                >
                  <Package size={16} />
                  <span>Adicionar produto</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer fixo para salvar agendamento - aparece quando é novo agendamento e tem serviços selecionados */}
        {isNewAppointment && selectedServices.length > 0 && (
          <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-end items-center px-4 py-3 z-20">
            <button
              onClick={() => {
                console.log('🔥 ServiceConfirmation - Botão Salvar clicado!');
                console.log('Estado:', { 
                  isLoading, 
                  selectedServicesLength: selectedServices.length,
                  isNewAppointment,
                  disabled: isLoading || selectedServices.length === 0
                });
                onContinue();
              }}
              disabled={isLoading || selectedServices.length === 0}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
            >
              {isLoading ? 'Salvando agendamento...' : 'Salvar agendamento'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}