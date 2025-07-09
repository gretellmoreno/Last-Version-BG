import React, { useState, useCallback, useMemo } from 'react';
import { X, Plus, User, UserCheck } from 'lucide-react';
import ServiceSelection from './booking/ServiceSelection';
import ProductSelection from './booking/ProductSelection';
import ServiceConfirmation from './booking/ServiceConfirmation';
import DateTimeSelection from './booking/DateTimeSelection';
import ClientSelection from './booking/ClientSelection';
import ClientForm from './booking/ClientForm';
import ProfessionalSelection from './booking/ProfessionalSelection';
import { useBooking } from '../contexts/BookingContext';
import { useService } from '../contexts/ServiceContext';
import { useProfessional } from '../contexts/ProfessionalContext';
import { useApp } from '../contexts/AppContext';
import { supabaseService } from '../lib/supabaseService';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  selectedTime?: string;
  selectedProfessional?: string;
  isMobile?: boolean;
  appointmentId?: string;
}

interface ClientFormData {
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  ano: string;
}

interface ServiceProfessional {
  serviceId: string;
  professionalId: string;
}

export default function BookingModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  selectedTime, 
  selectedProfessional,
  isMobile = false,
  appointmentId
}: BookingModalProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'service' | 'product' | 'confirmation' | 'datetime'>('service');
  const [showClientSelection, setShowClientSelection] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showProfessionalSelection, setShowProfessionalSelection] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [serviceProfessionals, setServiceProfessionals] = useState<ServiceProfessional[]>([]);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);

  // Hooks dos contextos
  const { refreshAppointments } = useBooking();
  const { services } = useService();
  const { professionals } = useProfessional();
  const { currentSalon } = useApp();
  
  // Estados para seleção de data e horário
  const [bookingDate, setBookingDate] = useState(selectedDate);
  const [bookingTime, setBookingTime] = useState<string>('');
  
  // Estado do formulário de cliente
  const [clientForm, setClientForm] = useState<ClientFormData>({
    nome: '',
    sobrenome: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    ano: ''
  });

  // Detectar se está em mobile (se não foi passado via props)
  const [internalIsMobile, setInternalIsMobile] = useState(false);
  
  React.useEffect(() => {
    const checkMobile = () => {
      setInternalIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isMobileDevice = isMobile || internalIsMobile;

  // Memoizar se tem data/horário pré-selecionados
  const hasPreselectedDateTime = useMemo(() => 
    Boolean(selectedTime && selectedProfessional), 
    [selectedTime, selectedProfessional]
  );

  // Calcular se deve mostrar o painel de serviços baseado no estado mobile
  const shouldShowServicesPanel = useMemo(() => {
    if (!isMobileDevice) return true; // Desktop sempre mostra
    // Mobile: não mostrar serviços quando estiver selecionando cliente, profissional ou preenchendo formulário
    return !showClientSelection && !showClientForm && !showProfessionalSelection;
  }, [isMobileDevice, showClientSelection, showClientForm, showProfessionalSelection]);

  // Effect para pré-selecionar profissional quando modal é aberto via agenda
  React.useEffect(() => {
    console.log('🔧 Effect pré-seleção profissional:', { 
      selectedProfessional, 
      selectedServicesLength: selectedServices.length,
      professionalsLength: professionals?.length 
    });
    
    if (selectedProfessional && selectedServices.length > 0 && professionals) {
      const prof = professionals.find(p => p.name.replace('[Exemplo] ', '') === selectedProfessional);
      console.log('   Profissional encontrado:', prof ? { id: prof.id, name: prof.name } : null);
      
      if (prof) {
        // Pré-selecionar o profissional para todos os serviços selecionados
        const newServiceProfessionals = selectedServices.map(serviceId => ({
          serviceId,
          professionalId: prof.id
        }));
        console.log('   Configurando serviceProfessionals:', newServiceProfessionals);
        setServiceProfessionals(newServiceProfessionals);
      }
    }
  }, [selectedProfessional, selectedServices, professionals]);

  // Effect para resetar quando modal abrir
  React.useEffect(() => {
    if (isOpen) {
      setBookingTime(selectedTime || '');
    }
  }, [isOpen, selectedTime]);

  // Callbacks otimizados para evitar re-renders
  const toggleService = useCallback((serviceId: string) => {
    setSelectedServices(prev => {
      const newSelectedServices = prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId];
      
      // Se removeu um serviço, remove também sua seleção de profissional
      if (prev.includes(serviceId)) {
        setServiceProfessionals(current => current.filter(sp => sp.serviceId !== serviceId));
      }
      
      // Se há serviços selecionados, vai direto para confirmação
      if (newSelectedServices.length > 0) {
        setCurrentStep('confirmation');
      }
      
      return newSelectedServices;
    });
  }, []);

  // Função para criar o agendamento
  const createAgendamento = useCallback(async () => {
    console.log('🚀 createAgendamento chamada!');
    console.log('Debug - Estados detalhados:', {
      selectedClient: selectedClient ? { id: selectedClient.id, nome: selectedClient.nome } : null,
      selectedServicesLength: selectedServices.length,
      selectedServices: selectedServices,
      serviceProfessionalsLength: serviceProfessionals.length,
      serviceProfessionals: serviceProfessionals,
      currentSalon: currentSalon?.id,
      bookingTime,
      selectedTime,
      hasPreselectedDateTime
    });

    // Validação mais específica
    if (selectedServices.length === 0) {
      console.error('❌ Nenhum serviço selecionado');
      return;
    }

    if (serviceProfessionals.length === 0) {
      console.error('❌ Nenhum profissional selecionado para os serviços');
      console.log('   Serviços selecionados:', selectedServices);
      console.log('   Profissionais configurados:', serviceProfessionals);
      return;
    }

    if (!currentSalon) {
      console.error('❌ Salão não selecionado');
      return;
    }

    setIsCreatingAppointment(true);
    console.log('⏳ Iniciando criação do agendamento...');

    // Determinar o clientId a ser usado
    let clientId = selectedClient?.id || null;
    console.log('📝 Cliente para agendamento:', selectedClient ? selectedClient.nome : 'Sem reserva');

    try {
      // Usar data e horário selecionados (ou pré-selecionados)
      const finalDate = bookingDate;
      const finalTime = bookingTime || selectedTime;
      
      if (!finalTime) {
        console.error('❌ Horário não selecionado');
        return;
      }

      // Pegar profissional (usar o primeiro selecionado ou encontrar por nome)
      let professionalId = serviceProfessionals[0]?.professionalId;
      
      if (selectedProfessional) {
        const prof = professionals?.find(p => p.name.replace('[Exemplo] ', '') === selectedProfessional);
        if (prof) {
          professionalId = prof.id;
        }
      }

      if (!professionalId) {
        console.error('❌ Profissional não selecionado');
        return;
      }

      console.log('📋 Dados do agendamento:', {
        salonId: currentSalon.id,
        clientId: clientId,
        professionalId: professionalId,
        date: finalDate.toISOString().split('T')[0],
        startTime: finalTime,
        status: 'agendado',
        notes: '',
        clientIdIsNull: clientId === null
      });

      // Preparar os serviços no formato correto para a nova função RPC
      const services = selectedServices.map(serviceId => ({
        service_id: serviceId,
        // Campos opcionais podem ser adicionados aqui no futuro
        // custom_price: undefined,
        // custom_time: undefined
      }));

      // Chamar a função RPC create_appointment com a nova estrutura
      console.log('🔄 Chamando supabaseService.appointments.create...');
      const { data, error } = await supabaseService.appointments.create({
        salonId: currentSalon.id,
        clientId: clientId, // Pode ser null para agendamentos sem cliente
        professionalId: professionalId,
        date: finalDate.toISOString().split('T')[0],
        startTime: finalTime,
        services: services,
        notes: ''
      });
      
      console.log('📤 Resposta do Supabase:', { data, error });
      
      if (error) {
        console.error('❌ Erro ao criar agendamento:', error);
        return;
      }

      if (data?.success) {
        console.log('✅ Agendamento criado com sucesso!');
        // Recarregar agendamentos
        await refreshAppointments();
        
        // Reset do modal
        setSelectedServices([]);
        setCurrentStep('service');
        setShowClientSelection(false);
        setShowClientForm(false);
        setSelectedClient(null);
        setServiceProfessionals([]);
        setBookingTime('');
        
        onClose();
      } else {
        console.error('❌ Falha ao criar agendamento - success = false');
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao criar agendamento:', error);
    } finally {
      setIsCreatingAppointment(false);
      console.log('🏁 createAgendamento finalizada');
    }
  }, [
    selectedClient, 
    selectedServices, 
    serviceProfessionals, 
    bookingDate, 
    bookingTime, 
    selectedTime, 
    selectedProfessional, 
    professionals, 
    currentSalon,
    refreshAppointments,
    onClose
  ]);

  const handleContinueFromConfirmation = useCallback(async () => {
    console.log('🔄 handleContinueFromConfirmation:', { 
      hasPreselectedDateTime, 
      serviceProfessionalsLength: serviceProfessionals.length 
    });
    
    if (hasPreselectedDateTime) {
      // Verificar se temos profissionais antes de criar
      if (serviceProfessionals.length === 0) {
        console.error('❌ Não é possível salvar: nenhum profissional selecionado');
        return;
      }
      await createAgendamento();
    } else {
      setCurrentStep('datetime');
    }
  }, [hasPreselectedDateTime, createAgendamento, serviceProfessionals.length]);

  const handleFinishBooking = useCallback(async () => {
    console.log('🎯 handleFinishBooking chamada - botão clicado!');
    await createAgendamento();
  }, [createAgendamento]);

  const handleBackToServices = useCallback(() => {
    setCurrentStep('service');
  }, []);

  // Função para navegar para seleção de produtos
  const handleShowProductSelection = useCallback(() => {
    setCurrentStep('product');
  }, []);

  // Função para alternar seleção de produto
  const toggleProduct = useCallback((productId: string) => {
    setSelectedProducts(prev => {
      const newProducts = prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      
      // Voltar automaticamente para a tela de confirmação após selecionar/desselecionar
      setTimeout(() => {
        setCurrentStep('confirmation');
      }, 100);
      
      return newProducts;
    });
  }, []);

  // Função para voltar da seleção de produtos
  const handleBackFromProducts = useCallback(() => {
    setCurrentStep('confirmation');
  }, []);

  // Função para voltar da seleção de serviços
  const handleBackFromServices = useCallback(() => {
    setCurrentStep('confirmation');
  }, []);

  const handleUpdateServiceProfessionals = useCallback((professionals: ServiceProfessional[]) => {
    setServiceProfessionals(professionals);
  }, []);

  const handleSelectClient = useCallback(async (client: any) => {
    setSelectedClient(client);
    setShowClientSelection(false);

    // Atualizar imediatamente o agendamento se já existir (edição de comanda)
    if (currentSalon && appointmentId) {
      await supabaseService.appointments.updateAppointment({
        appointmentId: appointmentId,
        salonId: currentSalon.id,
        newClientId: client.id
      });
    }
  }, [currentSalon, appointmentId]);

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

  const handleShowProfessionalSelection = useCallback(() => {
    setShowProfessionalSelection(true);
  }, []);

  const handleBackFromProfessionalSelection = useCallback(() => {
    setShowProfessionalSelection(false);
  }, []);

  const handleSelectProfessional = useCallback((professional: any) => {
    // Aplicar o profissional selecionado a todos os serviços
    const newServiceProfessionals = selectedServices.map(serviceId => ({
      serviceId,
      professionalId: professional.id
    }));
    setServiceProfessionals(newServiceProfessionals);
    setShowProfessionalSelection(false);
  }, [selectedServices]);

  // Função para resetar o modal
  const resetModal = useCallback(() => {
    setSelectedServices([]);
    setSelectedProducts([]);
    setCurrentStep('service');
    setShowClientSelection(false);
    setShowClientForm(false);
    setShowProfessionalSelection(false);
    setSelectedClient(null);
    setServiceProfessionals([]);
    setBookingTime('');
    setClientForm({
      nome: '',
      sobrenome: '',
      email: '',
      telefone: '',
      dataNascimento: '',
      ano: ''
    });
  }, []);

  // Função de fechar que inclui reset
  const handleClose = useCallback(() => {
    resetModal();
    onClose();
  }, [resetModal, onClose]);

  // Early return se modal não estiver aberto
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      
      {/* Modal - Layout responsivo */}
      <div className={`
        absolute bg-white shadow-xl flex
        ${isMobileDevice 
          ? 'inset-x-0 bottom-0 top-16 rounded-t-xl flex-col' // Mobile: fullscreen com cantos arredondados no topo
          : 'right-0 top-0 h-full w-1/2 max-w-2xl flex-col' // Desktop: painel lateral
        }
      `}>
        {/* Header do modal */}
        <div className={`flex items-center justify-between border-b border-gray-200 ${isMobileDevice ? 'p-3' : 'p-4'}`}>
          <h1 className={`font-semibold text-gray-900 ${isMobileDevice ? 'text-base' : 'text-lg'}`}>
            Novo Agendamento
          </h1>
          
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Card de informações pré-selecionadas */}
        {selectedTime && selectedProfessional && (
          <div className={`mx-3 mt-3 py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg ${isMobileDevice ? 'mx-3' : 'mx-4'}`}>
            {/* Linha única: Cliente | Profissional | Data | Horário */}
            <div className={`flex items-center ${isMobileDevice ? 'justify-center space-x-3' : 'justify-center space-x-4'}`}>
              
              {/* Cliente (apenas mobile) */}
              {isMobileDevice && (
                <>
                  <button
                    onClick={handleShowClientSelection}
                    className={`bg-white border-2 border-purple-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 hover:shadow-sm transition-all duration-200 group flex items-center px-2 py-1.5 space-x-1 ${
                      !selectedClient ? 'animate-gentle-pulse' : ''
                    }`}
                    title={selectedClient ? "Alterar cliente" : "Selecionar cliente"}
                  >
                    {/* Ícone do cliente */}
                    <div className="bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors relative w-4 h-4">
                      {selectedClient ? (
                        <UserCheck size={10} className="text-purple-600" />
                      ) : (
                        <>
                          <User size={10} className="text-purple-600" />
                          {/* + pequenininho */}
                          <div className="absolute -bottom-0.5 -right-0.5 bg-purple-600 rounded-full flex items-center justify-center w-2 h-2">
                            <Plus size={6} className="text-white" />
                          </div>
                        </>
                      )}
                </div>
                    
                    {/* Texto do cliente */}
                <div className="text-center">
                      <p className="font-medium text-gray-900 leading-none text-xs">
                        {selectedClient 
                          ? selectedClient.nome?.split(' ')[0] || 'Cliente'
                          : 'Cliente'
                        }
                      </p>
                </div>
                  </button>

                  <div className="w-px bg-gray-300 h-5"></div>
                </>
              )}
              
              {/* Profissional */}
              <div className="text-center">
                <p className={`font-medium text-gray-900 ${isMobileDevice ? 'text-xs' : 'text-sm'}`}>
                  {isMobileDevice ? selectedProfessional.split(' ')[0] : selectedProfessional}
                </p>
                <p className={`text-gray-500 ${isMobileDevice ? 'text-xs' : 'text-xs'}`}>Profissional</p>
              </div>
              
              <div className={`w-px bg-gray-300 ${isMobileDevice ? 'h-5' : 'h-6'}`}></div>
              
              {/* Data */}
              <div className="text-center">
                <p className={`font-medium text-gray-900 ${isMobileDevice ? 'text-xs' : 'text-sm'}`}>
                  {isMobileDevice 
                    ? selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                    : selectedDate.toLocaleDateString('pt-BR')
                  }
                </p>
                <p className={`text-gray-500 ${isMobileDevice ? 'text-xs' : 'text-xs'}`}>Data</p>
              </div>
              
              <div className={`w-px bg-gray-300 ${isMobileDevice ? 'h-5' : 'h-6'}`}></div>
              
              {/* Horário */}
              <div className="text-center">
                <p className={`font-medium text-gray-900 ${isMobileDevice ? 'text-xs' : 'text-sm'}`}>{selectedTime}</p>
                <p className={`text-gray-500 ${isMobileDevice ? 'text-xs' : 'text-xs'}`}>Horário</p>
              </div>
            </div>
          </div>
        )}

        {/* Layout do conteúdo - Responsivo */}
        <div className={`flex-1 overflow-hidden ${selectedTime && selectedProfessional ? 'mt-0' : ''}`}>
          {/* Conteúdo condicionalmente renderizado baseado no mobile e estado de seleção */}
          {shouldShowServicesPanel ? (
            // Painel principal com conteúdo dos serviços/steps
            <>
          {showClientForm ? (
            <ClientForm
              clientForm={clientForm}
              onUpdateForm={handleUpdateClientForm}
              onSave={handleSaveClient}
              onCancel={handleCancelClientForm}
            />
          ) : showClientSelection ? (
            <ClientSelection
              selectedServices={selectedServices}
              onSelectClient={handleSelectClient}
              onShowForm={handleShowClientForm}
              onToggleService={toggleService}
              onBack={handleBackFromClientSelection}
                  hideServicesSidebar={isMobileDevice}
                />
              ) : showProfessionalSelection ? (
                <ProfessionalSelection
                  selectedServices={selectedServices}
                  onSelectProfessional={handleSelectProfessional}
                  onBack={handleBackFromProfessionalSelection}
            />
          ) : currentStep === 'datetime' ? (
            <DateTimeSelection
              selectedClient={selectedClient}
              selectedServices={selectedServices}
              serviceProfessionals={serviceProfessionals}
              bookingDate={bookingDate}
              bookingTime={bookingTime}
              onDateChange={setBookingDate}
              onTimeChange={setBookingTime}
              onShowClientSelection={handleShowClientSelection}
              onFinish={handleFinishBooking}
              isLoading={isCreatingAppointment}
                  hideClientSection={isMobileDevice}
            />
          ) : currentStep === 'product' ? (
            <ProductSelection
              selectedClient={selectedClient}
              selectedProducts={selectedProducts}
              onToggleProduct={toggleProduct}
              onShowClientSelection={handleShowClientSelection}
              onBack={handleBackFromProducts}
                  hideClientSection={isMobileDevice}
            />
          ) : currentStep === 'confirmation' ? (
            <ServiceConfirmation
              selectedClient={selectedClient}
              selectedServices={selectedServices}
              selectedProducts={selectedProducts}
              serviceProfessionals={serviceProfessionals}
              onShowClientSelection={handleShowClientSelection}
                  onShowProfessionalSelection={handleShowProfessionalSelection}
              onBackToServices={handleBackToServices}
              onShowProductSelection={handleShowProductSelection}
              onUpdateServiceProfessionals={handleUpdateServiceProfessionals}
              onContinue={handleContinueFromConfirmation}
              onToggleService={toggleService}
              onToggleProduct={toggleProduct}
              hasPreselectedDateTime={hasPreselectedDateTime}
              isLoading={isCreatingAppointment}
              isNewAppointment={true}
                  hideClientSection={isMobileDevice}
            />
          ) : (
            <ServiceSelection
              selectedClient={selectedClient}
              selectedServices={selectedServices}
              onToggleService={toggleService}
              onShowClientSelection={handleShowClientSelection}
              onBack={selectedServices.length > 0 ? handleBackFromServices : undefined}
                  hideClientSection={isMobileDevice}
                />
              )}
            </>
          ) : (
            // Mobile: Mostra apenas seleção de cliente/profissional quando shouldShowServicesPanel é false
            <>
              {showClientForm ? (
                <ClientForm
                  clientForm={clientForm}
                  onUpdateForm={handleUpdateClientForm}
                  onSave={handleSaveClient}
                  onCancel={handleCancelClientForm}
                />
              ) : showProfessionalSelection ? (
                <ProfessionalSelection
                  selectedServices={selectedServices}
                  onSelectProfessional={handleSelectProfessional}
                  onBack={handleBackFromProfessionalSelection}
                />
              ) : (
                <ClientSelection
                  selectedServices={selectedServices}
                  onSelectClient={handleSelectClient}
                  onShowForm={handleShowClientForm}
                  onToggleService={toggleService}
                  onBack={handleBackFromClientSelection}
                  hideServicesSidebar={isMobileDevice}
                />
              )}
            </>
          )}
        </div>

        {/* Footer com botões condicionais - responsivo */}
        {currentStep === 'confirmation' && shouldShowServicesPanel && (
          <div className={`border-t border-gray-200 bg-white ${isMobileDevice ? 'p-3' : 'p-4'}`}>
            <div className="flex justify-end">
              {hasPreselectedDateTime ? (
                <button
                  onClick={handleContinueFromConfirmation}
                  disabled={isCreatingAppointment || serviceProfessionals.length === 0}
                  className={`flex items-center space-x-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium ${
                    isMobileDevice ? 'px-4 py-2 text-sm' : 'px-6 py-2 text-sm'
                  }`}
                >
                  {isCreatingAppointment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Salvar Agendamento</span>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleContinueFromConfirmation}
                  disabled={isCreatingAppointment || serviceProfessionals.length === 0}
                  className={`flex items-center space-x-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium ${
                    isMobileDevice ? 'px-4 py-2 text-sm' : 'px-6 py-2 text-sm'
                  }`}
                >
                  <span>Continuar</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}