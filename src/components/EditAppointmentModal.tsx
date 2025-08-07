/**
 * Modal de Edição de Comanda
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import X from 'lucide-react/dist/esm/icons/x';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import XCircle from 'lucide-react/dist/esm/icons/x-circle';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import User from 'lucide-react/dist/esm/icons/user';
import UserCheck from 'lucide-react/dist/esm/icons/user-check';
import Plus from 'lucide-react/dist/esm/icons/plus';
import ServiceSelection from './booking/ServiceSelection';
import ProductSelection from './booking/ProductSelection';
import ServiceConfirmation from './booking/ServiceConfirmation';
import DateTimeSelection from './booking/DateTimeSelection';
import PaymentMethodSelection from './PaymentMethodSelection';
import ClientSelection from './booking/ClientSelection';
import ClientForm from './booking/ClientForm';
import AppointmentDetailsModal from './AppointmentDetailsModal';
import { CalendarEvent, AppointmentDetails } from '../types';
import { useBooking } from '../hooks/useBooking';
import { useService } from '../contexts/ServiceContext';
import { useProfessional } from '../contexts/ProfessionalContext';
import { useApp } from '../contexts/AppContext';
import { useClients } from '../hooks/useClients';
import { useProduct } from '../contexts/ProductContext';
import { supabaseService } from '../lib/supabaseService';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { supabase } from '../lib/supabase';
import { createLocalDate } from '../utils/dateUtils';

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: CalendarEvent | null;
  appointmentId?: string | null;
  paymentMethods?: any[];
}

interface ClientFormData {
  nome: string;
  telefone: string;
}

interface ServiceProfessional {
  serviceId: string;
  professionalId: string;
}

export default function EditAppointmentModal({
  isOpen,
  onClose,
  appointment,
  appointmentId,
  paymentMethods = []
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
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [editingQuantity, setEditingQuantity] = useState<string>('1');

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
  const { clients } = useClients();
  const { products } = useProduct();
  const { currentSalon } = useApp();
  const queryClient = useQueryClient();
  
  const [bookingDate, setBookingDate] = useState(appointment?.start || new Date());
  const [bookingTime, setBookingTime] = useState<string>('');
  const [clientForm, setClientForm] = useState<ClientFormData>({
    nome: '',
    telefone: '',
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

  // Função para buscar detalhes do agendamento
  const fetchAppointmentDetails = useCallback(async () => {
    if (!appointmentId || !currentSalon?.id) return;

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
          
          // Popular produtos selecionados
          const productIds = (details as any).products ? (details as any).products.map((p: any) => p.product_id) : [];
          setSelectedProducts(productIds);
          
          const newServiceProfessionals = serviceIds.map(serviceId => ({
            serviceId,
            professionalId: details.professional.id
          }));
          setServiceProfessionals(newServiceProfessionals);
          
          setSelectedClient({
            id: details.client.id,
            nome: details.client.name || 'Cliente',
            telefone: details.client.phone || ''
          });
          
          setBookingDate(createLocalDate(details.date));
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
  }, [appointmentId, currentSalon?.id]);

  // Buscar detalhes do agendamento quando modal abrir
  useEffect(() => {
    if (isOpen && appointmentId) {
      fetchAppointmentDetails();
    }
  }, [isOpen, appointmentId, fetchAppointmentDetails]);

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
            telefone: client.phone || ''
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

  const toggleProduct = useCallback(async (productId: string) => {
    const isCurrentlySelected = selectedProducts.includes(productId);
    
    // Atualizar estado local
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );

    // Atualizar imediatamente o agendamento se já existir (edição de comanda)
    const currentAppointmentId = appointmentId || appointment?.id;
    if (currentSalon && currentAppointmentId) {
      if (isCurrentlySelected) {
        // Remover produto - encontrar o product_sale_id correto
        const productToRemove = (appointmentDetails?.appointment as any)?.products?.find((p: any) => p.product_id === productId);
        if (productToRemove?.product_sale_id) {
          await supabaseService.appointments.updateAppointment({
            appointmentId: currentAppointmentId,
            salonId: currentSalon.id,
            productsToAdd: [],
            productsToRemove: [{ product_sale_id: productToRemove.product_sale_id }]
          });
        }
      } else {
        // Adicionar produto
        await supabaseService.appointments.updateAppointment({
          appointmentId: currentAppointmentId,
          salonId: currentSalon.id,
          productsToAdd: [{ product_id: productId, quantity: 1 }],
          productsToRemove: []
        });
      }
      
      // Recarregar dados do agendamento para ter dados atualizados
      await fetchAppointmentDetails();
    }

    // Transição imediata para confirmação
    setCurrentStep('confirmation');
  }, [selectedProducts, currentSalon, appointmentId, appointment?.id, appointmentDetails, fetchAppointmentDetails]);

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
      nome: '', telefone: '',
    });
    setAppointmentDetails(null);
    setDetailsError(null);
    setEditingItemId(null);
    setEditingValue('');
    setEditingQuantity('1');
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
        // Atualizar produtos também
        const productIds = (data.appointment as any).products ? (data.appointment as any).products.map((p: any) => p.product_id) : [];
        setSelectedProducts(productIds);
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
        // Atualizar produtos também
        const productIds = (data.appointment as any).products ? (data.appointment as any).products.map((p: any) => p.product_id) : [];
        setSelectedProducts(productIds);
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
    
    // Recarregar dados do agendamento para ter dados atualizados no resumo
    await fetchAppointmentDetails();
    
    // Transição rápida para confirmação
    setTimeout(() => {
      setCurrentStep('confirmation');
    }, 50);
  }, [selectedServices, appointmentDetails, addServiceToComanda, removeServiceFromComanda, fetchAppointmentDetails]);

  const handleContinueFromConfirmation = useCallback(async () => {
    setCurrentStep('datetime');
  }, []);

  const handleFinishBooking = useCallback(async () => {
    onClose();
  }, [onClose]);

  const handleUpdateServiceProfessionals = useCallback((professionals: ServiceProfessional[]) => {
    setServiceProfessionals(professionals);
  }, []);

  const handleSelectClient = useCallback(async (client: any) => {
    setSelectedClient(client);
    setShowClientSelection(false);

    // Atualizar imediatamente o agendamento se já existir (edição de comanda)
    const currentAppointmentId = appointmentId || appointment?.id;
    if (currentSalon && currentAppointmentId) {
      await supabaseService.appointments.updateAppointment({
        appointmentId: currentAppointmentId,
        salonId: currentSalon.id,
        newClientId: client.id
      });
    }
  }, [currentSalon, appointmentId, appointment?.id]);

  const handleUpdateClientForm = useCallback((field: string, value: string) => {
    setClientForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSaveClient = useCallback(async () => {
    if (clientForm.nome.trim() === '' || clientForm.telefone.trim() === '') return;
    const phoneSanitized = clientForm.telefone.replace(/\D/g, '');
    const { data, error } = await supabaseService.clients.create({
      salonId: currentSalon?.id || '',
      name: clientForm.nome.trim(),
      phone: phoneSanitized,
      email: '', // Não existe no form
      cpf: '', // Não existe no form
      birthDate: '' // Não existe no form
    });
    if (error || !data?.client?.id) {
      alert('Erro ao criar cliente!');
      return;
    }
    const newClient = {
      id: data.client.id, // UUID real
      nome: clientForm.nome,
      telefone: clientForm.telefone,
      email: ''
    };
    setSelectedClient(newClient);
    setShowClientForm(false);
    setShowClientSelection(false);
  }, [clientForm, currentSalon]);

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

  const handleCompleteAppointment = useCallback(async () => {
    // Recarregar dados do agendamento antes de mostrar resumo da comanda
    await fetchAppointmentDetails();
    setCurrentStep('payment');
  }, [fetchAppointmentDetails]);

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
        // Forçar atualização dos dados antes de fechar
        await queryClient.invalidateQueries({ 
          queryKey: queryKeys.appointmentDetails(currentAppointmentId, currentSalon.id)
        });
        resetModal();
        onClose();
      }
    } catch (error) {
      console.error('Erro inesperado ao finalizar comanda:', error);
      alert('Erro inesperado ao finalizar comanda');
    } finally {
      setIsUpdatingAppointment(false);
    }
  }, [appointmentId, appointment?.id, currentSalon?.id, selectedPaymentMethodId, refreshAppointments, onClose]);

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

      if (data?.success && data.appointment) {
        // Atualizar o estado local com o agendamento cancelado
        setAppointmentDetails(data);
        
        // Atualizar a lista principal de agendamentos
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

  // Função para atualizar valor de item da comanda
  const updateComandaItemValue = useCallback(async (
    itemType: 'service' | 'product', 
    itemRecordId: string, 
    newPrice: number,
    newQuantity?: number
  ) => {
    if (!currentSalon?.id || !appointmentId) return;

    setIsUpdatingAppointment(true);

    try {
      const { data, error } = await supabaseService.appointments.updateComandaItem({
        salonId: currentSalon.id,
        appointmentId: appointmentId,
        itemType: itemType,
        itemRecordId: itemRecordId,
        customPrice: newPrice,
        quantity: newQuantity
      });

      if (error) {
        alert('Erro ao atualizar valor: ' + error);
        return;
      }

      if (data?.success) {
        // Recarregar detalhes do agendamento
        const { data: updatedData, error: fetchError } = await supabaseService.appointments.getDetails(
          appointmentId,
          currentSalon.id
        );

        if (!fetchError && updatedData?.success) {
          setAppointmentDetails(updatedData);
        }
        
        await refreshAppointments();
      }
    } catch (error) {
      console.error('Erro inesperado ao atualizar valor:', error);
      alert('Erro inesperado ao atualizar valor');
    } finally {
      setIsUpdatingAppointment(false);
      setEditingItemId(null);
      setEditingValue('');
    }
  }, [currentSalon?.id, appointmentId, refreshAppointments]);

  // Função para iniciar edição de valor (serviços)
  const startEditingService = useCallback((serviceId: string, currentValue: number) => {
    setEditingItemId(`service-${serviceId}`);
    setEditingValue(currentValue.toFixed(2).replace('.', ','));
  }, []);

  // Função para iniciar edição de produto (valor + quantidade)
  const startEditingProduct = useCallback((productSaleId: string, currentValue: number, currentQuantity: number) => {
    setEditingItemId(`product-${productSaleId}`);
    setEditingValue(currentValue.toFixed(2).replace('.', ','));
    setEditingQuantity(currentQuantity.toString());
  }, []);

  // Função para cancelar edição
  const cancelEditing = useCallback(() => {
    setEditingItemId(null);
    setEditingValue('');
    setEditingQuantity('1');
  }, []);

  // Função para salvar valor editado
  const saveEditedValue = useCallback(async (itemType: 'service' | 'product', itemRecordId: string) => {
    const numericValue = parseFloat(editingValue.replace(',', '.'));
    if (isNaN(numericValue) || numericValue < 0) {
      alert('Por favor, insira um valor válido');
      return;
    }

    let quantity = undefined;
    if (itemType === 'product') {
      const numericQuantity = parseInt(editingQuantity);
      if (isNaN(numericQuantity) || numericQuantity < 1) {
        alert('Por favor, insira uma quantidade válida');
        return;
      }
      quantity = numericQuantity;
    }

    await updateComandaItemValue(itemType, itemRecordId, numericValue, quantity);
  }, [editingValue, editingQuantity, updateComandaItemValue]);

  // Função para formatar a data/hora do agendamento
  function formatarDataHorario(dateObj: Date | undefined, horaStr: string) {
    if (!dateObj || !horaStr) return '';
    const hoje = new Date();
    const data = new Date(dateObj);
    const isHoje = data.toDateString() === hoje.toDateString();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);
    const isAmanha = data.toDateString() === amanha.toDateString();
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = data.toLocaleString('pt-BR', { month: 'long' });
    const ano = data.getFullYear();
    const hora = horaStr;
    if (isHoje) return `Hoje, ${dia} de ${mes} às ${hora}`;
    if (isAmanha) return `Amanhã, ${dia} de ${mes} às ${hora}`;
    return `${dia} de ${mes} às ${hora}`;
  }

  async function handleLembreteWhats() {
    const appointment = appointmentDetails?.appointment;
    const appointmentId = appointment?.id;
    
    if (!appointmentId) {
      console.error('❌ ID do agendamento não encontrado');
      alert('Erro: ID do agendamento não encontrado.');
      return;
    }

    if (!currentSalon?.id) {
      console.error('❌ ID do salão não encontrado');
      alert('Erro: ID do salão não encontrado.');
      return;
    }

    try {
      console.log('📱 Gerando link do WhatsApp para:', { appointmentId, salonId: currentSalon.id });
      
      // Chamar a RPC para gerar o link do WhatsApp
      const { data, error } = await supabase.rpc('generate_whatsapp_reminder_link', {
        p_appointment_id: appointmentId,
        p_salon_id: currentSalon.id
      });

      console.log('📱 Resposta da RPC:', { data, error });

      if (error) {
        console.error('❌ Erro na RPC:', error);
        alert('Erro ao gerar link do WhatsApp');
        return;
      }

      if (data?.success && data?.link) {
        console.log('✅ Link gerado com sucesso:', data.link);
        
        // Verificar se é mobile
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobileDevice) {
          // Em mobile, tentar abrir diretamente no WhatsApp
          console.log('📱 Dispositivo móvel detectado, abrindo WhatsApp...');
          
          // Verificar se o link já tem o protocolo whatsapp://
          if (data.link.startsWith('whatsapp://')) {
            window.location.href = data.link;
          } else if (data.link.startsWith('https://wa.me/')) {
            // Converter para protocolo nativo do WhatsApp
            const phoneNumber = data.link.replace('https://wa.me/', '').split('?')[0];
            const message = data.link.includes('?text=') ? data.link.split('?text=')[1] : '';
            const whatsappUrl = `whatsapp://send?phone=${phoneNumber}${message ? `&text=${encodeURIComponent(message)}` : ''}`;
            
            // Tentar abrir o WhatsApp nativo
            try {
              // Adicionar timeout para detectar se o WhatsApp foi aberto
              const timeout = setTimeout(() => {
                console.log('⚠️ Timeout - WhatsApp pode não estar instalado, tentando web...');
                window.open(data.link, '_blank');
              }, 2000);
              
              window.location.href = whatsappUrl;
              
              // Se chegou aqui, provavelmente o WhatsApp foi aberto
              clearTimeout(timeout);
            } catch (e) {
              console.log('⚠️ Erro ao abrir WhatsApp nativo, tentando web...');
              // Fallback para web se o app não estiver instalado
              window.open(data.link, '_blank');
            }
          } else {
            // Tentar abrir normalmente
            window.open(data.link, '_blank');
          }
        } else {
          // Em desktop, abrir em nova aba
          console.log('💻 Desktop detectado, abrindo em nova aba...');
          window.open(data.link, '_blank');
        }
      } else {
        console.error('❌ Link não foi gerado corretamente:', data);
        alert('Erro: Link do WhatsApp não foi gerado corretamente');
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao gerar link do WhatsApp:', error);
      alert('Erro ao gerar link do WhatsApp');
    }
  }

  const isValidUUID = (id: string) => /^[0-9a-fA-F-]{36}$/.test(id);

  // Verificar se agendamento está finalizado e mostrar modal apropriado
  if (appointmentDetails?.appointment?.status === 'finalizado' || appointmentDetails?.appointment?.status === 'concluido') {
    return (
      <AppointmentDetailsModal
        isOpen={isOpen}
        onClose={onClose}
        appointmentId={appointmentId || null}
      />
    );
  }

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
                      const currentPrice = (service as any).price || 0;
                      const serviceId = service.appointment_service_id || service.id;
                      const isEditing = editingItemId === `service-${serviceId}`;
                      
                      return (
                        <div key={service.id} className="flex justify-between items-center py-1">
                          <span className="text-sm text-gray-800">{serviceData?.name || service.name}</span>
                          
                          {isEditing ? (
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center bg-white border border-gray-300 rounded-md px-2 py-1">
                                <span className="text-sm text-gray-500 mr-1">R$</span>
                                <input
                                  type="text"
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  className="w-16 text-sm text-right border-0 outline-none"
                                  autoFocus
                                  placeholder="0,00"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      saveEditedValue('service', serviceId);
                                    } else if (e.key === 'Escape') {
                                      cancelEditing();
                                    }
                                  }}
                                />
                              </div>
                              <button
                                onClick={() => saveEditedValue('service', serviceId)}
                                disabled={isUpdatingAppointment}
                                className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-medium"
                              >
                                Salvar
                              </button>
                              <button
                                onClick={cancelEditing}
                                disabled={isUpdatingAppointment}
                                className="text-xs px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 disabled:opacity-50"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditingService(serviceId, currentPrice)}
                              disabled={isUpdatingAppointment}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline transition-colors"
                              title="Clique para editar o valor"
                            >
                              R$ {currentPrice.toFixed(2).replace('.', ',')}
                            </button>
                          )}
                  </div>
                      );
                    })}
                </div>
              </div>

                {(appointmentDetails?.appointment as any)?.products?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Produtos:</p>
                    <div className="space-y-2">
                      {(appointmentDetails?.appointment as any)?.products?.map((productSale: any) => {
                        const productData = products?.find(p => p.id === productSale.product_id);
                        const currentPrice = productSale.unit_price || productData?.price || 0;
                        const productSaleId = productSale.product_sale_id;
                        const isEditing = editingItemId === `product-${productSaleId}`;
                        
                        return (
                          <div key={productSaleId} className="flex justify-between items-center py-1">
                            <span className="text-sm text-gray-800">{productData?.name || `Produto ${productSale.product_id}`}</span>
                            
                            {isEditing ? (
                              <div className="flex items-center space-x-2">
                                {/* Quantidade */}
                                <div className="flex items-center bg-white border border-gray-300 rounded-md px-2 py-1">
                                  <input
                                    type="number"
                                    min="1"
                                    value={editingQuantity}
                                    onChange={(e) => setEditingQuantity(e.target.value)}
                                    className="w-10 text-sm text-center border-0 outline-none"
                                    placeholder="1"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        saveEditedValue('product', productSaleId);
                                      } else if (e.key === 'Escape') {
                                        cancelEditing();
                                      }
                                    }}
                                  />
                                  <span className="text-sm text-gray-500 ml-1">x</span>
                                </div>
                                
                                {/* Valor */}
                                <div className="flex items-center bg-white border border-gray-300 rounded-md px-2 py-1">
                                  <span className="text-sm text-gray-500 mr-1">R$</span>
                                  <input
                                    type="text"
                                    value={editingValue}
                                    onChange={(e) => setEditingValue(e.target.value)}
                                    className="w-16 text-sm text-right border-0 outline-none"
                                    autoFocus
                                    placeholder="0,00"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        saveEditedValue('product', productSaleId);
                                      } else if (e.key === 'Escape') {
                                        cancelEditing();
                                      }
                                    }}
                                  />
                                </div>
                                
                                <button
                                  onClick={() => saveEditedValue('product', productSaleId)}
                                  disabled={isUpdatingAppointment}
                                  className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-medium"
                                >
                                  Salvar
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  disabled={isUpdatingAppointment}
                                  className="text-xs px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 disabled:opacity-50"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => startEditingProduct(productSaleId, currentPrice, productSale.quantity || 1)}
                                  disabled={isUpdatingAppointment}
                                  className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline transition-colors"
                                  title="Clique para editar valor e quantidade"
                                >
                                  {productSale.quantity || 1}x R$ {currentPrice.toFixed(2).replace('.', ',')}
                                </button>
                              </div>
                            )}
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
                          const currentPrice = (service as any).price || 0;
                          return total + currentPrice;
                        }, 0) || 0;
                        
                        const productsTotal = (appointmentDetails?.appointment as any)?.products?.reduce((total: number, productSale: any) => {
                          const currentPrice = productSale.unit_price || products?.find(p => p.id === productSale.product_id)?.price || 0;
                          const quantity = productSale.quantity || 1;
                          return total + (currentPrice * quantity);
                        }, 0) || 0;
                        
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
                  paymentMethods={paymentMethods}
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
              appointmentId={appointmentId || appointment?.id}
              salonId={currentSalon?.id}
              appointmentDetails={appointmentDetails}
              onRefreshAppointment={fetchAppointmentDetails}
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
            <div className={`flex ${isMobile ? 'justify-end' : 'justify-between'} items-center space-x-3`}>
              {/* Botão Lembrete WhatsApp - desktop à esquerda, mobile junto */}
              {!isMobile && (
                <button
                  className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg font-semibold shadow-sm hover:bg-green-200 transition-colors text-sm"
                  style={{ minWidth: 0 }}
                  onClick={handleLembreteWhats}
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-full" style={{ background: '#25D366' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.031-.967-.273-.099-.472-.148-.67.15-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.1 3.2 5.077 4.363.71.306 1.263.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347z"/><path fillRule="evenodd" d="M12.004 2.003c-5.514 0-9.997 4.483-9.997 9.997 0 1.762.462 3.484 1.34 4.995L2.01 21.99l5.09-1.332a9.96 9.96 0 0 0 4.904 1.245h.004c5.514 0 9.997-4.483 9.997-9.997 0-2.67-1.04-5.178-2.927-7.065-1.887-1.887-4.395-2.927-7.065-2.927zm0 17.995a7.96 7.96 0 0 1-4.07-1.13l-.292-.173-3.02.789.805-2.945-.19-.302A7.96 7.96 0 0 1 4.04 12c0-4.398 3.566-7.964 7.964-7.964 2.126 0 4.124.83 5.63 2.337a7.93 7.93 0 0 1 2.334 5.627c0 4.398-3.566 7.964-7.964 7.964z" clipRule="evenodd"/></svg>
                  </span>
                  <span className="ml-2 hidden md:inline">Lembrete</span>
                </button>
              )}
              <div className="flex space-x-3">
                {/* Botão Lembrete WhatsApp em mobile */}
                {isMobile && (
                  <button
                    className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg font-semibold shadow-sm hover:bg-green-200 transition-colors text-sm"
                    style={{ minWidth: 0 }}
                    onClick={handleLembreteWhats}
                  >
                    <span className="flex items-center justify-center w-8 h-8 rounded-full" style={{ background: '#25D366' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.031-.967-.273-.099-.472-.148-.67.15-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.1 3.2 5.077 4.363.71.306 1.263.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347z"/><path fillRule="evenodd" d="M12.004 2.003c-5.514 0-9.997 4.483-9.997 9.997 0 1.762.462 3.484 1.34 4.995L2.01 21.99l5.09-1.332a9.96 9.96 0 0 0 4.904 1.245h.004c5.514 0 9.997-4.483 9.997-9.997 0-2.67-1.04-5.178-2.927-7.065-1.887-1.887-4.395-2.927-7.065-2.927zm0 17.995a7.96 7.96 0 0 1-4.07-1.13l-.292-.173-3.02.789.805-2.945-.19-.302A7.96 7.96 0 0 1 4.04 12c0-4.398 3.566-7.964 7.964-7.964 2.126 0 4.124.83 5.63 2.337a7.93 7.93 0 0 1 2.334 5.627c0 4.398-3.566 7.964-7.964 7.964z" clipRule="evenodd"/></svg>
                    </span>
                  </button>
                )}
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