import React, { useState, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
import ServiceSelection from './booking/ServiceSelection';
import ProductSelection from './booking/ProductSelection';
import ServiceConfirmation from './booking/ServiceConfirmation';
import DateTimeSelection from './booking/DateTimeSelection';
import ClientSelection from './booking/ClientSelection';
import ClientForm from './booking/ClientForm';
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
  selectedProfessional 
}: BookingModalProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'service' | 'product' | 'confirmation' | 'datetime'>('service');
  const [showClientSelection, setShowClientSelection] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
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

  // Memoizar se tem data/horário pré-selecionados
  const hasPreselectedDateTime = useMemo(() => 
    Boolean(selectedTime && selectedProfessional), 
    [selectedTime, selectedProfessional]
  );

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

  // Função para resetar o modal
  const resetModal = useCallback(() => {
    setSelectedServices([]);
    setSelectedProducts([]);
    setCurrentStep('service');
    setShowClientSelection(false);
    setShowClientForm(false);
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
      
      {/* Painel lateral direito */}
      <div className="absolute right-0 top-0 h-full w-1/2 max-w-2xl bg-white shadow-xl flex flex-col">
        {/* Header do modal */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">Novo Agendamento</h1>
          
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Card de informações pré-selecionadas */}
        {selectedTime && selectedProfessional && (
          <div className="mx-4 mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-semibold text-base">
                    {selectedProfessional.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{selectedProfessional}</p>
                  <p className="text-xs text-gray-500">Profissional</p>
                </div>
              </div>
              
              <div className="h-8 w-px bg-gray-300"></div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">{selectedDate.toLocaleDateString('pt-BR')}</p>
                <p className="text-xs text-gray-500">Data</p>
              </div>
              
              <div className="h-8 w-px bg-gray-300"></div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">{selectedTime}</p>
                <p className="text-xs text-gray-500">Horário</p>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo do modal */}
        <div className={`flex-1 overflow-hidden ${selectedTime && selectedProfessional ? 'mt-0' : ''}`}>
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
            />
          ) : currentStep === 'product' ? (
            <ProductSelection
              selectedClient={selectedClient}
              selectedProducts={selectedProducts}
              onToggleProduct={toggleProduct}
              onShowClientSelection={handleShowClientSelection}
              onBack={handleBackFromProducts}
            />
          ) : currentStep === 'confirmation' ? (
            <ServiceConfirmation
              selectedClient={selectedClient}
              selectedServices={selectedServices}
              selectedProducts={selectedProducts}
              serviceProfessionals={serviceProfessionals}
              onShowClientSelection={handleShowClientSelection}
              onBackToServices={handleBackToServices}
              onShowProductSelection={handleShowProductSelection}
              onUpdateServiceProfessionals={handleUpdateServiceProfessionals}
              onContinue={handleContinueFromConfirmation}
              onToggleService={toggleService}
              onToggleProduct={toggleProduct}
              hasPreselectedDateTime={hasPreselectedDateTime}
              isLoading={isCreatingAppointment}
              isNewAppointment={true}
            />
          ) : (
            <ServiceSelection
              selectedClient={selectedClient}
              selectedServices={selectedServices}
              onToggleService={toggleService}
              onShowClientSelection={handleShowClientSelection}
              onBack={selectedServices.length > 0 ? handleBackFromServices : undefined}
            />
          )}
        </div>

        {/* Footer com botões condicionais */}
        {currentStep === 'confirmation' && (
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex justify-end">
              {hasPreselectedDateTime ? (
                <button
                  onClick={handleContinueFromConfirmation}
                  disabled={isCreatingAppointment || serviceProfessionals.length === 0}
                  className="flex items-center space-x-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
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
                  className="flex items-center space-x-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
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