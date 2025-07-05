import React, { useState } from 'react';
import { User, Plus, Trash2, Package, Edit2, Check, X as XIcon, UserCheck } from 'lucide-react';
import { useService } from '../../contexts/ServiceContext';
import { useProfessional } from '../../contexts/ProfessionalContext';
import { useProduct } from '../../contexts/ProductContext';

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
  hideClientSection = false
}: ServiceConfirmationProps) {
  const { services } = useService();
  const { products } = useProduct();
  const { professionals } = useProfessional();
  
  // Estados para edição de valores
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editedServicePrices, setEditedServicePrices] = useState<Record<string, number>>({});
  const [editedProductPrices, setEditedProductPrices] = useState<Record<string, number>>({});
  const [tempServiceValue, setTempServiceValue] = useState('');
  const [tempProductValue, setTempProductValue] = useState('');

  // Filtrar serviços selecionados
  const selectedServiceObjects = services?.filter(service => 
    selectedServices.includes(service.id)
  ) || [];

  // Obter profissional selecionado (assumindo que todos os serviços têm o mesmo profissional)
  const selectedProfessionalId = serviceProfessionals.length > 0 ? serviceProfessionals[0].professionalId : '';
  const selectedProfessional = professionals?.find(p => p.id === selectedProfessionalId);

  // Função para obter preço atual do serviço (editado ou original)
  const getServicePrice = (service: any) => {
    return editedServicePrices[service.id] !== undefined ? editedServicePrices[service.id] : service.price;
  };

  // Função para obter preço atual do produto (editado ou original)
  const getProductPrice = (product: any) => {
    return editedProductPrices[product.id] !== undefined ? editedProductPrices[product.id] : product.price;
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

  const saveServiceEdit = () => {
    if (editingServiceId && tempServiceValue) {
      const value = parseFormattedValue(tempServiceValue);
      if (!isNaN(value) && value >= 0) {
        setEditedServicePrices(prev => ({
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

  // Handlers para mudança de valor com máscara
  const handleServiceValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setTempServiceValue(formatted);
  };

  const handleProductValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setTempProductValue(formatted);
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

  return (
    <div className={`flex h-full ${hideClientSection ? 'w-full' : ''}`}>
      {/* Sidebar esquerda com cliente - condicional */}
      {!hideClientSection && (
      <div 
        className={`w-48 bg-gray-50 border-r border-gray-200 flex flex-col ${selectedClient ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}`}
        onClick={selectedClient ? onShowClientSelection : undefined}
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
              <button
                onClick={onShowClientSelection}
                className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 cursor-pointer hover:bg-purple-200 transition-colors relative group"
              >
                <User size={28} className="text-purple-600" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                  <Plus size={14} className="text-white" />
                </div>
              </button>
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

        {/* Lista de serviços */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Serviços selecionados */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Serviços</h3>
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
                <h3 className="text-base font-medium text-gray-900 mb-2">Cliente e Profissional</h3>
                
                {/* Grid com os dois botões */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Botão de Selecionar Cliente */}
                  <button
                    onClick={onShowClientSelection}
                    className="bg-white border-2 border-purple-200 rounded-lg p-3 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        {selectedClient ? (
                          <UserCheck size={16} className="text-purple-600" />
                        ) : (
                          <User size={16} className="text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {selectedClient ? selectedClient.nome : 'Selecionar Cliente'}
                        </h4>
                        {selectedClient && (
                          <p className="text-xs text-gray-500">Cliente selecionado</p>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Botão de Selecionar Profissional */}
                  <button
                    onClick={onShowProfessionalSelection}
                    className="bg-white border-2 border-blue-200 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        {selectedProfessional ? (
                          <UserCheck size={16} className="text-blue-600" />
                        ) : (
                          <User size={16} className="text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {selectedProfessional ? selectedProfessional.name.replace('[Exemplo] ', '') : 'Selecionar Profissional'}
                        </h4>
                        {selectedProfessional && (
                          <p className="text-xs text-gray-500">Profissional selecionado</p>
                        )}
                      </div>
                    </div>
                  </button>
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
                            <span className="font-semibold text-gray-900">
                              R$ {formatDisplayValue(getProductPrice(product))}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {editingProductId === product.id ? (
                                                  <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-1">R$</span>
                            <input
                              type="text"
                              value={tempProductValue}
                              onChange={handleProductValueChange}
                              className="w-20 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0,00"
                              autoFocus
                            />
                          </div>
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
                              className="w-8 h-8 flex items-center justify-center transition-colors group"
                              title="Editar valor"
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

              {/* Botão Adicionar Produto */}
              <button
                onClick={onShowProductSelection}
                className="flex items-center justify-center space-x-2 px-4 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors text-sm"
              >
                <Package size={16} />
                <span>Adicionar produto</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}