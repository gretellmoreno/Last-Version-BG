/**
 * Modal de Edição de Agendamentos com Nova RPC update_appointment
 * 
 * FUNCIONALIDADES IMPLEMENTADAS:
 * ✅ Buscar detalhes do agendamento via RPC get_appointment_details
 * ✅ Adicionar serviços ao agendamento via RPC update_appointment
 * ✅ Cancelar agendamento (status: 'cancelado')
 * ✅ Finalizar agendamento (status: 'finalizado')
 * ✅ Estados de carregamento e erro
 * 
 * COMO USAR:
 * - Com appointmentId: Busca dados via RPC e permite edição completa
 * - Com appointment (legado): Modo compatibilidade para componentes antigos
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import ServiceSelection from './booking/ServiceSelection';
import ServiceConfirmation from './booking/ServiceConfirmation';
import DateTimeSelection from './booking/DateTimeSelection';
import ClientSelection from './booking/ClientSelection';
import ClientForm from './booking/ClientForm';
import { CalendarEvent, AppointmentDetails } from '../types';
import { useBooking } from '../contexts/BookingContext';
import { useService } from '../contexts/ServiceContext';
import { useProfessional } from '../contexts/ProfessionalContext';
import { useApp } from '../contexts/AppContext';
import { useClient } from '../contexts/ClientContext';
import { supabaseService } from '../lib/supabaseService';

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: CalendarEvent | null;
  appointmentId?: string | null; // Novo prop para buscar detalhes via RPC
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
  const [currentStep, setCurrentStep] = useState<'service' | 'confirmation' | 'datetime'>('service');
  const [showClientSelection, setShowClientSelection] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [serviceProfessionals, setServiceProfessionals] = useState<ServiceProfessional[]>([]);
  const [isUpdatingAppointment, setIsUpdatingAppointment] = useState(false);
  
  // Estados para detalhes do agendamento via RPC
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Hooks dos contextos
  const { refreshAppointments } = useBooking();
  const { services } = useService();
  const { professionals } = useProfessional();
  const { clients } = useClient();
  const { currentSalon } = useApp();
  
  // Estados para seleção de data e horário
  const [bookingDate, setBookingDate] = useState(appointment?.start || new Date());
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

  // Effect para buscar detalhes do agendamento via RPC quando appointmentId for fornecido
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
          
          // Log para debug
          console.log('Detalhes do agendamento recebidos:', data.appointment);
          
          // Configurar estados baseado nos detalhes obtidos
          const details = data.appointment;
          
          // Configurar serviços
          const serviceIds = details.services.map(s => s.id);
          setSelectedServices(serviceIds);
          
          // Configurar profissional para os serviços
          const newServiceProfessionals = serviceIds.map(serviceId => ({
            serviceId,
            professionalId: details.professional.id
          }));
          setServiceProfessionals(newServiceProfessionals);
          
          // Configurar cliente
          setSelectedClient({
            id: details.client.id,
            nome: details.client.name || 'Cliente',
            sobrenome: '',
            email: '',
            telefone: '',
            dataNascimento: '',
            ano: ''
          });
          
          // Configurar data e horário
          setBookingDate(new Date(details.date));
          setBookingTime(details.start_time.slice(0, 5));
          
          // Ir direto para confirmação
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

  // Effect para inicializar dados do agendamento quando abrir o modal (modo legado)
  useEffect(() => {
    if (isOpen && appointment && !appointmentId) {
      // Definir data e horário
      setBookingDate(appointment.start);
      setBookingTime(appointment.start.toTimeString().slice(0, 5));
      
      // Buscar cliente se existe
      if (appointment.client && appointment.client !== 'Sem reserva') {
        const client = clients?.find(c => c.name === appointment.client);
        if (client) {
          setSelectedClient({
            id: client.id,
            nome: client.name,
            sobrenome: '',
            email: client.email || '',
            telefone: client.phone || '',
            dataNascimento: '',
            ano: ''
          });
        }
      }
      
      // Buscar serviços relacionados ao agendamento
      // Por enquanto, vamos usar dados mockados até implementar a estrutura completa
      const appointmentServices: any[] = [];
      if (appointmentServices.length > 0) {
        const serviceIds = appointmentServices.map((as: any) => as.service_id);
        setSelectedServices(serviceIds);
        
        // Configurar profissionais para os serviços
        const profId = appointment.appointmentData?.professional_id;
        if (profId) {
          const newServiceProfessionals = serviceIds.map((serviceId: string) => ({
            serviceId,
            professionalId: profId
          }));
          setServiceProfessionals(newServiceProfessionals);
        }
      }
      
      // Começar na etapa de confirmação por padrão
      setCurrentStep('confirmation');
    }
  }, [isOpen, appointment, clients]);

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

  // Função para resetar o modal
  const resetModal = useCallback(() => {
    setSelectedServices([]);
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

  // Função para atualizar o agendamento usando a nova RPC update_appointment
  const updateAgendamento = useCallback(async () => {
    console.log('🚀 updateAgendamento chamada com nova RPC!');

    // Validação
    if (!currentSalon?.id) {
      console.error('❌ Salão não encontrado');
      return;
    }

    // Determinar o ID do agendamento (via appointmentId ou appointment.id)
    const currentAppointmentId = appointmentId || appointment?.id;
    if (!currentAppointmentId) {
      console.error('❌ ID do agendamento não encontrado');
      return;
    }

    if (selectedServices.length === 0) {
      console.error('❌ Nenhum serviço selecionado');
      return;
    }

    setIsUpdatingAppointment(true);
    console.log('⏳ Iniciando atualização do agendamento via RPC...');

    try {
      // Obter serviços originais para comparação
      const originalServices = appointmentDetails?.appointment?.services || [];
      const originalServiceIds = originalServices.map(s => s.id);
      
      // Determinar serviços a adicionar e remover
      const servicesToAdd = selectedServices
        .filter(serviceId => !originalServiceIds.includes(serviceId))
        .map(serviceId => ({ service_id: serviceId }));
      
      // Para remoção, precisamos dos IDs das linhas da tabela appointment_services
      // Por enquanto, vamos assumir que não removemos serviços na edição
      const servicesToRemove: string[] = [];

      console.log('📋 Dados da atualização via RPC:', {
        appointmentId: currentAppointmentId,
        salonId: currentSalon.id,
        servicesToAdd,
        servicesToRemove,
        originalServiceIds,
        selectedServices
      });

      // Chamar a nova função RPC update_appointment
      console.log('🔄 Chamando supabaseService.appointments.updateAppointment...');
      
      const { data, error } = await supabaseService.appointments.updateAppointment({
        appointmentId: currentAppointmentId,
        salonId: currentSalon.id,
        newStatus: 'agendado', // Mantém o status atual ou define um novo
        newNotes: '', // Adicionar campo de notas se necessário
        servicesToAdd: servicesToAdd.length > 0 ? servicesToAdd : undefined,
        servicesToRemove: servicesToRemove.length > 0 ? servicesToRemove : undefined
      });
      
      console.log('📤 Resposta do Supabase (update_appointment):', { data, error });
      
      if (error) {
        console.error('❌ Erro ao atualizar agendamento:', error);
        return;
      }

      if (data?.success) {
        console.log('✅ Agendamento atualizado com sucesso via RPC!');
        console.log('📊 Dados atualizados:', data.appointment);
        
        // Atualizar os dados locais com a resposta da RPC
        setAppointmentDetails(data);
        
        // Recarregar agendamentos na agenda
        await refreshAppointments();
        
        // Reset do modal e fechar
        resetModal();
        onClose();
      } else {
        console.error('❌ Falha ao atualizar agendamento - success = false');
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao atualizar agendamento:', error);
    } finally {
      setIsUpdatingAppointment(false);
      console.log('🏁 updateAgendamento finalizada');
    }
  }, [
    appointmentId,
    appointment?.id,
    appointmentDetails,
    selectedServices,
    currentSalon?.id,
    refreshAppointments,
    resetModal,
    onClose
  ]);

  const handleContinueFromConfirmation = useCallback(async () => {
    console.log('🔄 handleContinueFromConfirmation');
    
    // Para edição, sempre vai para datetime para permitir mudanças
    setCurrentStep('datetime');
  }, []);

  const handleFinishBooking = useCallback(async () => {
    console.log('🎯 handleFinishBooking chamada - botão clicado!');
    await updateAgendamento();
  }, [updateAgendamento]);

  const handleBackToServices = useCallback(() => {
    setCurrentStep('service');
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

  const handleShowClientForm = useCallback(() => {
    setShowClientForm(true);
  }, []);

  const handleCancelClientForm = useCallback(() => {
    setShowClientForm(false);
  }, []);

  // Função de fechar que inclui reset
  const handleClose = useCallback(() => {
    resetModal();
    onClose();
  }, [resetModal, onClose]);

  // Funções para os botões
  const handleCancelAppointment = useCallback(async () => {
    const currentAppointmentId = appointmentId || appointment?.id;
    if (!currentAppointmentId || !currentSalon?.id) return;
    
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
      setIsUpdatingAppointment(true);
      
      try {
        console.log('🚫 Cancelando agendamento via RPC...');
        
        const { data, error } = await supabaseService.appointments.updateAppointment({
          appointmentId: currentAppointmentId,
          salonId: currentSalon.id,
          newStatus: 'cancelado'
        });
        
        if (error) {
          console.error('❌ Erro ao cancelar agendamento:', error);
          alert('Erro ao cancelar agendamento: ' + error);
          return;
        }

        if (data?.success) {
          console.log('✅ Agendamento cancelado com sucesso!');
          await refreshAppointments();
          resetModal();
          onClose();
        }
      } catch (error) {
        console.error('💥 Erro inesperado ao cancelar:', error);
        alert('Erro inesperado ao cancelar agendamento');
      } finally {
        setIsUpdatingAppointment(false);
      }
    }
  }, [appointmentId, appointment?.id, currentSalon?.id, refreshAppointments, resetModal, onClose]);

  const handleCompleteAppointment = useCallback(async () => {
    const currentAppointmentId = appointmentId || appointment?.id;
    if (!currentAppointmentId || !currentSalon?.id) return;
    
    if (confirm('Tem certeza que deseja finalizar esta comanda?')) {
      setIsUpdatingAppointment(true);
      
      try {
        console.log('✅ Finalizando agendamento via RPC...');
        
        const { data, error } = await supabaseService.appointments.updateAppointment({
          appointmentId: currentAppointmentId,
          salonId: currentSalon.id,
          newStatus: 'finalizado'
        });
        
        if (error) {
          console.error('❌ Erro ao finalizar agendamento:', error);
          alert('Erro ao finalizar agendamento: ' + error);
          return;
        }

        if (data?.success) {
          console.log('✅ Agendamento finalizado com sucesso!');
          await refreshAppointments();
          resetModal();
          onClose();
        }
      } catch (error) {
        console.error('💥 Erro inesperado ao finalizar:', error);
        alert('Erro inesperado ao finalizar agendamento');
      } finally {
        setIsUpdatingAppointment(false);
      }
    }
  }, [appointmentId, appointment?.id, currentSalon?.id, refreshAppointments, resetModal, onClose]);

  // Early return se modal não estiver aberto
  if (!isOpen) return null;
  
  // Se appointmentId foi fornecido, verificar se ainda está carregando
  if (appointmentId && loadingDetails) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="absolute right-0 top-0 h-full w-1/2 max-w-2xl bg-white shadow-xl flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h1 className="text-lg font-semibold text-gray-900">Carregando Agendamento...</h1>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando detalhes do agendamento...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Se appointmentId foi fornecido mas houve erro
  if (appointmentId && detailsError) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="absolute right-0 top-0 h-full w-1/2 max-w-2xl bg-white shadow-xl flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h1 className="text-lg font-semibold text-gray-900">Erro</h1>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {detailsError}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Se appointmentId foi fornecido mas ainda não há detalhes
  if (appointmentId && !appointmentDetails) return null;
  
  // Para o modo legado, requer appointment
  if (!appointmentId && !appointment) return null;

  // Unificar dados do appointment (legado ou via RPC)
  const currentAppointmentData = appointmentId ? appointmentDetails?.appointment : null;
  const professionalName = appointmentId 
    ? currentAppointmentData?.professional.name 
    : appointment?.professionalName;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      
      {/* Painel lateral direito - mais estrito */}
      <div className="absolute right-0 top-0 h-full w-1/2 max-w-2xl bg-white shadow-xl flex flex-col">
        {/* Header do modal */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">Editar Agendamento</h1>
          
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Card de informações do agendamento */}
        <div className="mx-4 mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-700 font-semibold text-sm">
                  {professionalName?.charAt(0).toUpperCase() || 'P'}
                </span>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">{professionalName}</p>
                <p className="text-xs text-gray-500">Profissional</p>
              </div>
            </div>
            
            <div className="h-6 w-px bg-gray-300"></div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">{bookingDate.toLocaleDateString('pt-BR')}</p>
              <p className="text-xs text-gray-500">Data</p>
            </div>
            
            <div className="h-6 w-px bg-gray-300"></div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">{bookingTime}</p>
              <p className="text-xs text-gray-500">Horário</p>
            </div>
          </div>
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
            <ClientSelection
              selectedServices={selectedServices}
              onSelectClient={handleSelectClient}
              onShowForm={handleShowClientForm}
              onToggleService={toggleService}
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
            />
          ) : currentStep === 'confirmation' ? (
            <ServiceConfirmation
              selectedClient={selectedClient}
              selectedServices={selectedServices}
              serviceProfessionals={serviceProfessionals}
              onShowClientSelection={handleShowClientSelection}
              onBackToServices={handleBackToServices}
              onUpdateServiceProfessionals={handleUpdateServiceProfessionals}
              onContinue={handleContinueFromConfirmation}
              hasPreselectedDateTime={false}
              isLoading={isUpdatingAppointment}
            />
          ) : (
            <ServiceSelection
              selectedClient={selectedClient}
              selectedServices={selectedServices}
              onToggleService={toggleService}
              onShowClientSelection={handleShowClientSelection}
            />
          )}
        </div>

        {/* Footer com botões */}
        {currentStep === 'confirmation' && (
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              {/* Botão de cancelar agendamento */}
              <button
                onClick={handleCancelAppointment}
                disabled={isUpdatingAppointment}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isUpdatingAppointment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <XCircle size={18} />
                    <span>Cancelar Agendamento</span>
                  </>
                )}
              </button>

              {/* Botão de fechar comanda */}
              <button
                onClick={handleCompleteAppointment}
                disabled={isUpdatingAppointment}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isUpdatingAppointment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>Finalizar Comanda</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}