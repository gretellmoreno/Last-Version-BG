import React, { useState, useCallback, useMemo, useEffect } from 'react';
import X from 'lucide-react/dist/esm/icons/x';
import Plus from 'lucide-react/dist/esm/icons/plus';
import User from 'lucide-react/dist/esm/icons/user';
import UserCheck from 'lucide-react/dist/esm/icons/user-check';
import ServiceSelection from './booking/ServiceSelection';
import ProductSelection from './booking/ProductSelection';
import ServiceConfirmation from './booking/ServiceConfirmation';
import DateTimeSelection from './booking/DateTimeSelection';
import ClientSelection from './booking/ClientSelection';
import ClientForm from './booking/ClientForm';
import ProfessionalSelection from './booking/ProfessionalSelection';

// Hook customizado apenas para lógica de criação
import { useAppointmentCreation } from '../hooks/useAppointmentCreation';

// Contexts
import { useBooking } from '../hooks/useBooking';
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
  telefone: string;
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
  // Estados consolidados com useState - mantendo estrutura original
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'service' | 'product' | 'confirmation' | 'datetime'>('service');
  const [showClientSelection, setShowClientSelection] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showProfessionalSelection, setShowProfessionalSelection] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [serviceProfessionals, setServiceProfessionals] = useState<ServiceProfessional[]>([]);
  
  // Estados para seleção de data e horário
  const [bookingDate, setBookingDate] = useState(selectedDate);
  const [bookingTime, setBookingTime] = useState<string>('');
  
  // Estado do formulário de cliente
  const [clientForm, setClientForm] = useState<ClientFormData>({
    nome: '',
    telefone: '',
  });

  // Estados para loading
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);

  // Detectar se está em mobile
  const [internalIsMobile, setInternalIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setInternalIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isMobileDevice = isMobile || internalIsMobile;

  // Hook customizado para criação de agendamentos
  const { createAppointment } = useAppointmentCreation();
  
  // Contextos
  const { refreshAppointments } = useBooking();
  const { services } = useService();
  const { professionals } = useProfessional();
  const { currentSalon } = useApp();

  // Reset quando modal abrir
  useEffect(() => {
    if (isOpen) {
      setBookingTime(selectedTime || '');
      setBookingDate(selectedDate);
      setSelectedServices([]);
      setSelectedProducts([]);
      setCurrentStep('service');
      setShowClientSelection(false);
      setShowClientForm(false);
      setShowProfessionalSelection(false);
      // Remover cliente padrão 'Sem reserva'
      setSelectedClient(null);
      setServiceProfessionals([]);
      setIsCreatingAppointment(false);
      setClientForm({
        nome: '',
        telefone: '',
      });
    }
  }, [isOpen, selectedDate, selectedTime]);

  // Memoizar se tem data/horário pré-selecionados
  const hasPreselectedDateTime = useMemo(() => 
    Boolean(selectedTime && selectedProfessional), 
    [selectedTime, selectedProfessional]
  );

  // Calcular se deve mostrar o painel de serviços baseado no estado mobile
  const shouldShowServicesPanel = useMemo(() => {
    if (!isMobileDevice) return true;
    return !showClientSelection && !showClientForm && !showProfessionalSelection;
  }, [isMobileDevice, showClientSelection, showClientForm, showProfessionalSelection]);

  // Effect para pré-selecionar profissional quando modal é aberto via agenda
  useEffect(() => {
    if (selectedProfessional && selectedServices.length > 0 && professionals) {
      const prof = professionals.find(p => p.name.replace('[Exemplo] ', '') === selectedProfessional);
      
      if (prof) {
        const newServiceProfessionals = selectedServices.map(serviceId => ({
          serviceId,
          professionalId: prof.id
        }));
        setServiceProfessionals(newServiceProfessionals);
      }
    }
  }, [selectedProfessional, selectedServices.length, professionals]);

  // Callbacks otimizados
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

  const toggleProduct = useCallback((productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const isValidUUID = (id: string) => /^[0-9a-fA-F-]{36}$/.test(id);

  // Handler para criar agendamento usando o hook customizado
  const handleCreateAppointment = useCallback(async () => {
    console.log('🔥 BookingModal - handleCreateAppointment chamado!');
    console.log('Estado atual:', {
      selectedServices,
      serviceProfessionals,
      selectedClient: selectedClient ? { id: selectedClient.id, nome: selectedClient.nome } : null,
      bookingDate: bookingDate.toISOString(),
      bookingTime: bookingTime || selectedTime || '',
      selectedProfessional,
      isCreatingAppointment
    });

    if (isCreatingAppointment) {
      console.log('⏳ Já está criando agendamento, ignorando...');
      return;
    }

    // Remover validação obrigatória de cliente
    // if (!selectedClient || !isValidUUID(selectedClient.id)) {
    //   alert('Selecione um cliente válido!');
    //   setIsCreatingAppointment(false);
    //   return;
    // }

    setIsCreatingAppointment(true);
    
    try {
      console.log('🚀 Chamando createAppointment...');
      const success = await createAppointment({
        selectedServices,
        serviceProfessionals,
        selectedClient,
        bookingDate,
        bookingTime: bookingTime || selectedTime || '',
        selectedProfessional,
        onSuccess: () => {
          console.log('✅ Agendamento criado com sucesso! Fechando modal...');
          setIsCreatingAppointment(false);
          onClose();
        },
        onError: (error) => {
          console.error('❌ Erro ao criar agendamento:', error);
          setIsCreatingAppointment(false);
          alert(`Erro: ${error}`);
        }
      });
      
      console.log('🔍 Resultado da criação:', success);
      
      // Se a função retornou false mas não chamou onError, significa que algo deu errado
      if (!success) {
        console.error('❌ createAppointment retornou false sem chamar onError');
        setIsCreatingAppointment(false);
        alert('Falha na criação do agendamento - verifique os logs');
      }
    } catch (error) {
      console.error('❌ Erro inesperado na criação:', error);
      setIsCreatingAppointment(false);
      alert('Erro inesperado ao criar agendamento');
    }
  }, [
    createAppointment, 
    selectedServices, 
    serviceProfessionals, 
    selectedClient,
    bookingDate, 
    bookingTime, 
    selectedTime, 
    selectedProfessional, 
    onClose,
    isCreatingAppointment
  ]);

  // Handlers para cliente
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

  const handleSaveClient = useCallback(async () => {
    if (!clientForm.nome.trim() || !clientForm.telefone.trim()) return;
    const phoneSanitized = clientForm.telefone.replace(/\D/g, '');
    const { data, error } = await supabaseService.clients.create({
      salonId: currentSalon?.id || '',
      name: clientForm.nome.trim(),
      phone: phoneSanitized,
      email: '', // Não existe no form, mas é obrigatório na tipagem
      cpf: '', // Não existe no form, mas é obrigatório na tipagem
      birthDate: '' // Não existe no form, mas é obrigatório na tipagem
    });
    if (error || !data?.client?.id) {
      alert('Erro ao criar cliente!');
      return;
    }
    const newClient = {
      id: data.client.id, // UUID real
      nome: clientForm.nome,
      name: clientForm.nome,
      telefone: clientForm.telefone,
      phone: clientForm.telefone,
      email: ''
    };
    setSelectedClient(newClient);
    setShowClientForm(false);
    setShowClientSelection(false);
  }, [clientForm, currentSalon]);

  // Handler para seleção de profissional
  const handleSelectProfessional = useCallback((professional: any) => {
    // Atualizar profissional para todos os serviços selecionados
    const newServiceProfessionals = selectedServices.map(serviceId => ({
      serviceId,
      professionalId: professional.id
    }));
    setServiceProfessionals(newServiceProfessionals);
    setShowProfessionalSelection(false);
  }, [selectedServices]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className={`absolute ${isMobileDevice ? 'inset-x-0 bottom-0 top-16 rounded-xl' : 'right-0 top-0 h-full w-1/2 max-w-2xl rounded-xl'} bg-white shadow-xl flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center border-b border-gray-200 ${isMobileDevice ? 'p-3' : 'p-4'} justify-between`}>
          <h1 className={`font-semibold text-gray-900 ${isMobileDevice ? 'text-base' : 'text-lg'}`}>Novo Agendamento</h1>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Info Card */}
        <div className={`mx-3 mt-3 py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg ${isMobileDevice ? 'mx-3' : 'mx-4'}`}> 
          <div className={`flex items-center ${isMobileDevice ? 'justify-center space-x-3' : 'justify-center space-x-4'}`}> 
            {/* Profissional (se houver) */}
            {(() => {
              // Obter profissional selecionado (do props ou dos serviceProfessionals)
              let professionalToShow = null;
              
              if (selectedProfessional && professionals) {
                professionalToShow = professionals.find(p => p.name === selectedProfessional || p.id === selectedProfessional);
              } else if (serviceProfessionals.length > 0 && professionals) {
                const selectedProfId = serviceProfessionals[0]?.professionalId;
                professionalToShow = professionals.find(p => p.id === selectedProfId);
              }
              
              if (professionalToShow) {
                return (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="bg-yellow-100 rounded-full flex items-center justify-center w-6 h-6">
                        <span className="text-yellow-700 font-bold text-sm">
                          {professionalToShow.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900 leading-none text-xs">
                          {professionalToShow.name}
                        </p>
                        <p className="text-gray-500 text-xs">Profissional</p>
                      </div>
                    </div>
                    <div className={`w-px bg-gray-300 ${isMobileDevice ? 'h-5' : 'h-6'}`}></div>
                  </>
                );
              }
              return null;
            })()}
            {/* Data */}
            <div className="text-center">
              <p className={`font-medium text-gray-900 ${isMobileDevice ? 'text-xs' : 'text-sm'}`}>{bookingDate.toLocaleDateString('pt-BR')}</p>
              <p className={`text-gray-500 ${isMobileDevice ? 'text-xs' : 'text-xs'}`}>Data</p>
            </div>
            <div className={`w-px bg-gray-300 ${isMobileDevice ? 'h-5' : 'h-6'}`}></div>
            {/* Horário */}
            <div className="text-center">
              <p className={`font-medium text-gray-900 ${isMobileDevice ? 'text-xs' : 'text-sm'}`}>{bookingTime}</p>
              <p className={`text-gray-500 ${isMobileDevice ? 'text-xs' : 'text-xs'}`}>Horário</p>
            </div>
          </div>
        </div>

        {/* Conteúdo central scrollável */}
        <div className="flex-1 overflow-hidden">
          {showClientForm ? (
            <ClientForm
              clientForm={clientForm}
              onUpdateForm={handleUpdateClientForm}
              onSave={handleSaveClient}
              onCancel={() => setShowClientForm(false)}
            />
          ) : showClientSelection ? (
            <ClientSelection
              selectedServices={selectedServices}
              onSelectClient={handleSelectClient}
              onShowForm={() => setShowClientForm(true)}
              onToggleService={toggleService}
              onBack={() => setShowClientSelection(false)}
              hideServicesSidebar={isMobileDevice}
            />
          ) : showProfessionalSelection ? (
            <ProfessionalSelection
              selectedServices={selectedServices}
              onSelectProfessional={(professional) => {
                // Atualizar profissional para todos os serviços selecionados
                const newServiceProfessionals = selectedServices.map(serviceId => ({
                  serviceId,
                  professionalId: professional.id
                }));
                setServiceProfessionals(newServiceProfessionals);
                setShowProfessionalSelection(false);
                setCurrentStep('datetime');
              }}
              onBack={() => setShowProfessionalSelection(false)}
            />
          ) : currentStep === 'service' ? (
            <ServiceSelection
              selectedServices={selectedServices}
              selectedClient={selectedClient}
              onToggleService={toggleService}
              onShowClientSelection={() => setShowClientSelection(true)}
            />
          ) : currentStep === 'confirmation' ? (
            <ServiceConfirmation
              selectedClient={selectedClient}
              selectedServices={selectedServices}
              selectedProducts={selectedProducts}
              serviceProfessionals={serviceProfessionals}
              onShowClientSelection={() => setShowClientSelection(true)}
              onShowProfessionalSelection={() => setShowProfessionalSelection(true)}
              onBackToServices={() => setCurrentStep('service')}
              onShowProductSelection={() => setCurrentStep('product')}
              onUpdateServiceProfessionals={setServiceProfessionals}
              onContinue={handleCreateAppointment}
              onToggleService={toggleService}
              onToggleProduct={toggleProduct}
              hasPreselectedDateTime={Boolean(selectedTime && selectedProfessional)}
              isLoading={isCreatingAppointment}
              isNewAppointment={true}
              hideClientSection={isMobileDevice}
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
              onShowClientSelection={() => setShowClientSelection(true)}
              onFinish={handleCreateAppointment}
              onBack={() => setCurrentStep('confirmation')}
              isLoading={isCreatingAppointment}
              hideClientSection={isMobileDevice}
              hasPreselectedDateTime={hasPreselectedDateTime}
            />
          ) : null}
        </div>
        {/* Footer fixo pode ser adicionado aqui se necessário */}
      </div>
    </div>
  );
}