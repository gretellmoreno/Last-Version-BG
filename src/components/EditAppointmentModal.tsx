/**
 * Modal de Edição de Comanda
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { X, CheckCircle, XCircle, ArrowLeft, User, UserCheck, Plus } from 'lucide-react';
import ServiceSelection from './booking/ServiceSelection';
import ProductSelection from './booking/ProductSelection';
import ServiceConfirmation from './booking/ServiceConfirmation';
import DateTimeSelection from './booking/DateTimeSelection';
import PaymentMethodSelection from './PaymentMethodSelection';
import ClientSelection from './booking/ClientSelection';
import ClientForm from './booking/ClientForm';
import { CalendarEvent, AppointmentDetails } from '../types';
import { useBooking } from '../contexts/BookingContext';
import { useService } from '../contexts/ServiceContext';
import { useProfessional } from '../contexts/ProfessionalContext';
import { useApp } from '../contexts/AppContext';
import { useClient } from '../contexts/ClientContext';
import { useProduct } from '../contexts/ProductContext';
import { supabaseService } from '../lib/supabaseService';

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: CalendarEvent | null;
  appointmentId?: string | null;
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

export default function EditAppointmentModal({
  isOpen,
  onClose,
  appointment,
  appointmentId
}: EditAppointmentModalProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'service' | 'product' | 'confirmation' | 'datetime' | 'payment'>('service');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');
  const [showClientSelection, setShowClientSelection] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [serviceProfessionals, setServiceProfessionals] = useState<ServiceProfessional[]>([]);
  const [isUpdatingAppointment, setIsUpdatingAppointment] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Detectar se está em mobile
  const [isMobile, setIsMobile] = useState(false);
  
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Contexts
  const { refreshAppointments } = useBooking();
  const { services } = useService();
  const { professionals } = useProfessional();
  const { clients } = useClient();
  const { products } = useProduct();
  const { currentSalon } = useApp();
  
  const [bookingDate, setBookingDate] = useState(appointment?.start || new Date());
  const [bookingTime, setBookingTime] = useState<string>('');
  const [clientForm, setClientForm] = useState<ClientFormData>({
    nome: '',
    sobrenome: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    ano: ''
  });

  // Nome do profissional para exibição
  const professionalName = useMemo(() => {
    if (appointmentDetails?.appointment?.professional) {
      return appointmentDetails.appointment.professional.name;
    }
    if (serviceProfessionals.length > 0) {
      const prof = professionals?.find(p => p.id === serviceProfessionals[0].professionalId);
      return prof?.name || 'Profissional';
    }
    return 'Profissional';
  }, [appointmentDetails, serviceProfessionals, professionals]);

  // Buscar detalhes do agendamento
  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!isOpen || !appointmentId || !currentSalon?.id) return;

      setLoadingDetails(true);
      setDetailsError(null);

      try {
        const { data, error } = await supabaseService.appointments.getDetails(
          appointmentId,
          currentSalon.id
        );

        if (error) {
          setDetailsError(error);
          return;
        }

        if (data?.success) {
          setAppointmentDetails(data);
          const details = data.appointment;
          
          const serviceIds = details.services.map(s => s.id);
          setSelectedServices(serviceIds);
          
          const newServiceProfessionals = serviceIds.map(serviceId => ({
            serviceId,
            professionalId: details.professional.id
          }));
          setServiceProfessionals(newServiceProfessionals);
          
          setSelectedClient({
            id: details.client.id,
            nome: details.client.name || 'Cliente',
            sobrenome: '', email: '', telefone: '', dataNascimento: '', ano: ''
          });
          
          setBookingDate(new Date(details.date));
          setBookingTime(details.start_time.slice(0, 5));
          setCurrentStep('confirmation');
        } else {
          setDetailsError('Agendamento não encontrado');
        }
      } catch (err) {
        setDetailsError('Erro ao carregar detalhes do agendamento');
        console.error('Erro ao buscar detalhes:', err);
      } finally {
        setLoadingDetails(false);
      }
    };

    if (appointmentId) {
      fetchAppointmentDetails();
    }
  }, [isOpen, appointmentId, currentSalon?.id]);

  // Inicializar dados do agendamento (modo legado)
  useEffect(() => {
    if (isOpen && appointment && !appointmentId) {
      setBookingDate(appointment.start);
      setBookingTime(appointment.start.toTimeString().slice(0, 5));
      
      if (appointment.client && appointment.client !== 'Sem reserva') {
        const client = clients?.find(c => c.name === appointment.client);
        if (client) {
          setSelectedClient({
            id: client.id,
            nome: client.name,
            sobrenome: '', email: client.email || '', telefone: client.phone || '',
            dataNascimento: '', ano: ''
          });
        }
      }
      
      if (appointment.service) {
        const service = services?.find(s => s.name === appointment.service);
        if (service) {
          setSelectedServices([service.id]);
          setCurrentStep('confirmation');
        }
      }
    }
  }, [isOpen, appointment, appointmentId, clients, services]);

  const toggleProduct = useCallback((productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    // Transição imediata para confirmação
    setCurrentStep('confirmation');
  }, []);

  const resetModal = useCallback(() => {
    setSelectedServices([]);
    setSelectedProducts([]);
    setCurrentStep('service');
    setSelectedPaymentMethodId('');
    setShowClientSelection(false);
    setShowClientForm(false);
    setSelectedClient(null);
    setServiceProfessionals([]);
    setClientForm({
      nome: '', sobrenome: '', email: '', telefone: '', dataNascimento: '', ano: ''
    });
    setAppointmentDetails(null);
    setDetailsError(null);
  }, []);

  // Adicionar serviço à comanda
  const addServiceToComanda = useCallback(async (serviceId: string) => {
    const currentAppointmentId = appointmentId || appointment?.id;
    if (!currentAppointmentId || !currentSalon?.id) return;

    setIsUpdatingAppointment(true);

    try {
      const { data, error } = await supabaseService.appointments.addServiceToComanda({
        appointmentId: currentAppointmentId,
        salonId: currentSalon.id,
        serviceId: serviceId
      });

      if (error) {
        alert('Erro ao adicionar serviço: ' + error);
        return;
      }

      if (data?.success) {
        setAppointmentDetails(data);
        setSelectedServices(data.appointment.services.map(s => s.id));
        await refreshAppointments();
      }
    } catch (error) {
      console.error('Erro inesperado ao adicionar serviço:', error);
      alert('Erro inesperado ao adicionar serviço');
    } finally {
      setIsUpdatingAppointment(false);
    }
  }, [appointmentId, appointment?.id, currentSalon?.id, refreshAppointments]);

  // Remover serviço da comanda
  const removeServiceFromComanda = useCallback(async (appointmentServiceId: string) => {
    if (!currentSalon?.id) return;

    setIsUpdatingAppointment(true);

    try {
      const { data, error } = await supabaseService.appointments.removeServiceFromComanda({
        appointmentServiceId: appointmentServiceId,
        salonId: currentSalon.id
      });

      if (error) {
        alert('Erro ao remover serviço: ' + error);
        return;
      }

      if (data?.success) {
        setAppointmentDetails(data);
        setSelectedServices(data.appointment.services.map(s => s.id));
        await refreshAppointments();
      }
    } catch (error) {
      console.error('Erro inesperado ao remover serviço:', error);
      alert('Erro inesperado ao remover serviço');
    } finally {
      setIsUpdatingAppointment(false);
    }
  }, [currentSalon?.id, refreshAppointments]);

  const toggleService = useCallback(async (serviceId: string) => {
    const isCurrentlySelected = selectedServices.includes(serviceId);
    
    if (isCurrentlySelected) {
      const serviceToRemove = appointmentDetails?.appointment?.services.find(s => s.id === serviceId);
      if (serviceToRemove?.appointment_service_id) {
        await removeServiceFromComanda(serviceToRemove.appointment_service_id);
      }
    } else {
      await addServiceToComanda(serviceId);
    }
    
    // Transição rápida para confirmação (50ms para dar tempo da API processar)
    setTimeout(() => {
      setCurrentStep('confirmation');
    }, 50);
  }, [selectedServices, appointmentDetails, addServiceToComanda, removeServiceFromComanda]);

  const handleContinueFromConfirmation = useCallback(async () => {
    setCurrentStep('datetime');
  }, []);

  const handleFinishBooking = useCallback(async () => {
    onClose();
  }, [onClose]);

  const handleUpdateServiceProfessionals = useCallback((professionals: ServiceProfessional[]) => {
    setServiceProfessionals(professionals);
  }, []);

  const handleSelectClient = useCallback((client: any) => {
    setSelectedClient(client);
    setShowClientSelection(false);
  }, []);

  const handleUpdateClientForm = useCallback((field: string, value: string) => {
    setClientForm(prev => ({ ...prev, [field]: value }));
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

  const handleShowClientSelection = useCallback(() => setShowClientSelection(true), []);

  const handleBackFromClientSelection = useCallback(() => {
    setShowClientSelection(false);
  }, []);

  const handleBackFromServiceSelection = useCallback(() => {
    setCurrentStep('confirmation');
  }, []);

  const handleBackFromProductSelection = useCallback(() => {
    setCurrentStep('confirmation');
  }, []);

  const handleShowClientForm = useCallback(() => setShowClientForm(true), []);
  const handleCancelClientForm = useCallback(() => setShowClientForm(false), []);
  const handleClose = useCallback(() => {
    resetModal();
    onClose();
  }, [resetModal, onClose]);

  const handleCompleteAppointment = useCallback(() => {
    setCurrentStep('payment');
  }, []);

  const handleSelectPaymentMethod = useCallback((paymentMethodId: string) => {
    setSelectedPaymentMethodId(paymentMethodId);
  }, []);

  const handleConfirmFinalization = useCallback(async () => {
    const currentAppointmentId = appointmentId || appointment?.id;
    if (!currentAppointmentId || !currentSalon?.id || !selectedPaymentMethodId) return;

    setIsUpdatingAppointment(true);

    try {
      const { data, error } = await supabaseService.appointments.finalizeComanda({
        appointmentId: currentAppointmentId,
        salonId: currentSalon.id,
        paymentMethodId: selectedPaymentMethodId
      });

      if (error) {
        alert('Erro ao finalizar comanda: ' + error);
        return;
      }

      if (data?.success) {
        setAppointmentDetails(data);
        await refreshAppointments();
        resetModal();
      onClose();
    }
    } catch (error) {
      console.error('Erro inesperado ao finalizar comanda:', error);
      alert('Erro inesperado ao finalizar comanda');
    } finally {
      setIsUpdatingAppointment(false);
    }
  }, [appointmentId, appointment?.id, currentSalon?.id, selectedPaymentMethodId, refreshAppointments, resetModal, onClose]);

  const handleBackFromPayment = useCallback(() => setCurrentStep('confirmation'), []);
  const handleOpenCancelModal = useCallback(() => setShowCancelModal(true), []);
  const handleCloseCancelModal = useCallback(() => setShowCancelModal(false), []);

  const handleConfirmCancel = useCallback(async () => {
    const currentAppointmentId = appointmentId || appointment?.id;
    if (!currentAppointmentId || !currentSalon?.id) return;

    setIsUpdatingAppointment(true);

    try {
      const { data, error } = await supabaseService.appointments.cancel(
        currentAppointmentId,
        currentSalon.id
      );

      if (error) {
        alert('Erro ao cancelar agendamento: ' + error);
        return;
      }

      if (data?.success) {
        await refreshAppointments();
        resetModal();
        onClose();
      }
    } catch (error) {
      console.error('Erro inesperado ao cancelar agendamento:', error);
      alert('Erro inesperado ao cancelar agendamento');
    } finally {
      setIsUpdatingAppointment(false);
    }
  }, [appointmentId, appointment?.id, currentSalon?.id, refreshAppointments, resetModal, onClose]);

  if (!isOpen) return null;

  if (loadingDetails) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  if (detailsError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Erro</h3>
          <p className="text-gray-700 mb-4">{detailsError}</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      
      <div className={`absolute ${isMobile ? 'inset-x-0 bottom-0 top-16 rounded-xl' : 'right-0 top-0 h-full w-1/2 max-w-2xl rounded-xl'} bg-white shadow-xl flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center border-b border-gray-200 ${isMobile ? 'p-3' : 'p-4'} ${currentStep === 'payment' ? 'justify-between' : 'justify-between'}`}>
          {/* Lado esquerdo - Botão voltar (só no payment) */}
          <div className="flex items-center">
            {currentStep === 'payment' && (
              <button
                onClick={() => setCurrentStep('confirmation')}
                disabled={isUpdatingAppointment}
                className="mr-3 p-1 hover:bg-gray-100 rounded-md transition-colors"
                title="Voltar"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
            )}
          </div>
          
          {/* Centro - Título */}
          <h1 className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'} ${currentStep === 'payment' ? 'flex-1 text-center' : ''}`}>
            {currentStep === 'payment' ? 'Fechar Comanda' : 'Comanda'}
          </h1>
          
          {/* Lado direito - Botão fechar */}
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Info Card */}
        <div className={`mx-3 mt-3 py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg ${isMobile ? 'mx-3' : 'mx-4'}`}>
          {/* Linha única: Cliente | Profissional | Data | Horário */}
          <div className={`flex items-center ${isMobile ? 'justify-center space-x-3' : 'justify-center space-x-4'}`}>
            
            {/* Cliente (sempre primeiro) */}
            <button
              onClick={handleShowClientSelection}
              className={`bg-white border-2 border-purple-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 hover:shadow-sm transition-all duration-200 group flex items-center ${
                isMobile ? 'px-2 py-1.5 space-x-1' : 'px-2 py-1.5 space-x-1.5'
              } ${!(selectedClient && selectedClient.nome && selectedClient.nome !== 'Sem reserva') ? 'animate-strong-pulse' : ''}`}
              title={selectedClient && selectedClient.nome && selectedClient.nome !== 'Sem reserva' ? "Alterar cliente" : "Selecionar cliente"}
            >
              {/* Ícone do cliente */}
              <div className={`bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors relative ${
                isMobile ? 'w-4 h-4' : 'w-5 h-5'
              }`}>
                {selectedClient && selectedClient.nome && selectedClient.nome !== 'Sem reserva' ? (
                  <UserCheck size={isMobile ? 10 : 12} className="text-purple-600" />
                ) : (
                  <>
                    <User size={isMobile ? 10 : 12} className="text-purple-600" />
                    {/* + pequenininho */}
                    <div className={`absolute -bottom-0.5 -right-0.5 bg-purple-600 rounded-full flex items-center justify-center ${
                      isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'
                    }`}>
                      <Plus size={isMobile ? 6 : 8} className="text-white" />
                    </div>
                  </>
                )}
              </div>
              
              {/* Texto do cliente */}
              <div className="text-center">
                <p className={`font-medium text-gray-900 leading-none ${isMobile ? 'text-xs' : 'text-xs'}`}>
                  {selectedClient && selectedClient.nome && selectedClient.nome !== 'Sem reserva' 
                    ? selectedClient.nome.split(' ')[0]
                    : 'Cliente'
                  }
                </p>
              </div>
            </button>

            <div className={`w-px bg-gray-300 ${isMobile ? 'h-5' : 'h-6'}`}></div>
            
            {/* Profissional */}
            <div className="text-center">
              <p className={`font-medium text-gray-900 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {isMobile ? professionalName.split(' ')[0] : professionalName}
              </p>
              <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-xs'}`}>Profissional</p>
            </div>
            
            <div className={`w-px bg-gray-300 ${isMobile ? 'h-5' : 'h-6'}`}></div>
            
            {/* Data */}
            <div className="text-center">
              <p className={`font-medium text-gray-900 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {isMobile 
                  ? bookingDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                  : bookingDate.toLocaleDateString('pt-BR')
                }
              </p>
              <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-xs'}`}>Data</p>
            </div>
            
            <div className={`w-px bg-gray-300 ${isMobile ? 'h-5' : 'h-6'}`}></div>
            
            {/* Horário */}
            <div className="text-center">
              <p className={`font-medium text-gray-900 ${isMobile ? 'text-xs' : 'text-sm'}`}>{bookingTime}</p>
              <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-xs'}`}>Horário</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
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
              hideServicesSidebar={isMobile}
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
              isLoading={isUpdatingAppointment}
              hideClientSection={isMobile}
            />
          ) : currentStep === 'product' ? (
            <ProductSelection
              selectedClient={selectedClient}
              selectedProducts={selectedProducts}
              onToggleProduct={toggleProduct}
              onShowClientSelection={handleShowClientSelection}
              onBack={handleBackFromProductSelection}
              hideClientSection={isMobile}
              isCompact={true}
            />
          ) : currentStep === 'payment' ? (
            <div className="flex flex-col h-full">
              {/* Header removido da seção interna */}
              
              {/* Content */}
              <div className={`flex-1 overflow-y-auto space-y-6 ${isMobile ? 'p-4' : 'p-6'}`}>
                {/* Resumo da Comanda */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo da Comanda</h3>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Serviços:</p>
                  <div className="space-y-2">
                    {appointmentDetails?.appointment?.services?.map((service) => {
                      const serviceData = services?.find(s => s.id === service.id);
                      return (
                        <div key={service.id} className="flex justify-between items-center py-1">
                          <span className="text-sm text-gray-800">{serviceData?.name || service.name}</span>
                          <span className="text-sm font-medium text-gray-900">
                            R$ {serviceData?.price?.toFixed(2).replace('.', ',') || '0,00'}
                          </span>
                  </div>
                      );
                    })}
                </div>
              </div>

                {selectedProducts.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Produtos:</p>
                    <div className="space-y-2">
                      {selectedProducts.map((productId) => {
                        const productData = products?.find(p => p.id === productId);
                        return (
                          <div key={productId} className="flex justify-between items-center py-1">
                            <span className="text-sm text-gray-800">{productData?.name || `Produto ${productId}`}</span>
                            <span className="text-sm font-medium text-gray-900">
                              R$ {productData?.price?.toFixed(2).replace('.', ',') || '0,00'}
                            </span>
                </div>
                        );
                      })}
                </div>
              </div>
                )}
                
                <div className="border-t border-gray-200 pt-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-gray-900">
                      R$ {(() => {
                        const servicesTotal = appointmentDetails?.appointment?.services?.reduce((total, service) => {
                          const serviceData = services?.find(s => s.id === service.id);
                          return total + (serviceData?.price || 0);
                        }, 0) || 0;
                        
                        const productsTotal = selectedProducts.reduce((total, productId) => {
                          const productData = products?.find(p => p.id === productId);
                          return total + (productData?.price || 0);
                        }, 0);
                        
                        return (servicesTotal + productsTotal).toFixed(2).replace('.', ',');
                      })()}
                    </span>
                </div>
                </div>
              </div>
              
                <PaymentMethodSelection
                  onSelectPaymentMethod={handleSelectPaymentMethod}
                  selectedPaymentMethodId={selectedPaymentMethodId}
                  isLoading={isUpdatingAppointment}
                />
              </div>
              
              {/* Footer */}
              <div className={`border-t border-gray-200 ${isMobile ? 'p-4' : 'p-6'}`}>
                <div className="flex justify-end">
                  <button
                    onClick={handleConfirmFinalization}
                    disabled={!selectedPaymentMethodId || isUpdatingAppointment}
                    className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUpdatingAppointment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Finalizando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        <span>Finalizar Comanda</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : currentStep === 'confirmation' ? (
            <ServiceConfirmation
              selectedClient={selectedClient}
              selectedServices={selectedServices}
              selectedProducts={selectedProducts}
              serviceProfessionals={serviceProfessionals}
              onShowClientSelection={handleShowClientSelection}
              onShowProfessionalSelection={() => {}}
              onBackToServices={() => setCurrentStep('service')}
              onShowProductSelection={() => setCurrentStep('product')}
              onUpdateServiceProfessionals={handleUpdateServiceProfessionals}
              onContinue={handleContinueFromConfirmation}
              onToggleService={toggleService}
              onToggleProduct={toggleProduct}
              hasPreselectedDateTime={false}
              isLoading={isUpdatingAppointment}
              isNewAppointment={false}
              hideClientSection={isMobile}
            />
          ) : (
            <ServiceSelection
              selectedClient={selectedClient}
              selectedServices={selectedServices}
              onToggleService={toggleService}
              onShowClientSelection={handleShowClientSelection}
              onBack={handleBackFromServiceSelection}
              hideClientSection={isMobile}
            />
          )}
        </div>

        {/* Footer */}
        {currentStep === 'confirmation' && (
          <div className={`border-t border-gray-200 bg-white ${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleOpenCancelModal}
                disabled={isUpdatingAppointment}
                className={`flex items-center space-x-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors ${
                  isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm'
                }`}
              >
                {isUpdatingAppointment ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>...</span>
                  </>
                ) : (
                  <>
                    <XCircle size={14} />
                    <span>Cancelar</span>
                  </>
                )}
              </button>

          <button
                onClick={handleCompleteAppointment}
                disabled={isUpdatingAppointment}
                className={`flex items-center space-x-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors ${
                  isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm'
                }`}
          >
                {isUpdatingAppointment ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} />
                    <span>Fechar Comanda</span>
                  </>
                )}
          </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmação de cancelamento */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleCloseCancelModal} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Cancelar Agendamento
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
              </p>
          
          <div className="flex space-x-3">
            <button
                  onClick={handleCloseCancelModal}
                  disabled={isUpdatingAppointment}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
                  Não
            </button>
                 
            <button
                  onClick={handleConfirmCancel}
                  disabled={isUpdatingAppointment}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingAppointment ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Cancelando...
                    </>
                  ) : (
                    'Sim'
                  )}
            </button>
          </div>
        </div>
      </div>
        </div>
      )}
    </div>
  );
} 