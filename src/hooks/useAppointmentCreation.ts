import { useCallback } from 'react';
import { useBooking } from './useBooking';
import { useApp } from '../contexts/AppContext';
import { useProfessional } from '../contexts/ProfessionalContext';
import { supabaseService } from '../lib/supabaseService';
import { formatDateToLocal } from '../utils/dateUtils';

interface CreateAppointmentParams {
  selectedServices: string[];
  serviceProfessionals: Array<{ serviceId: string; professionalId: string }>;
  selectedClient: any | null;
  bookingDate: Date;
  bookingTime: string;
  selectedProfessional?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useAppointmentCreation = () => {
  const { refreshAppointments } = useBooking();
  const { currentSalon } = useApp();
  const { professionals } = useProfessional();

  const createAppointment = useCallback(async ({
    selectedServices,
    serviceProfessionals,
    selectedClient,
    bookingDate,
    bookingTime,
    selectedProfessional,
    onSuccess,
    onError
  }: CreateAppointmentParams): Promise<boolean> => {
    console.log('🚀 createAppointment chamada!');
    console.log('Debug - Parâmetros:', {
      selectedClient: selectedClient ? { id: selectedClient.id, nome: selectedClient.nome } : null,
      selectedServicesLength: selectedServices.length,
      serviceProfessionalsLength: serviceProfessionals.length,
      currentSalon: currentSalon?.id,
      bookingTime,
      selectedProfessional
    });

    // Validações básicas
    if (selectedServices.length === 0) {
      const error = 'Nenhum serviço selecionado';
      console.error('❌', error);
      onError?.(error);
      return false;
    }

    if (!currentSalon) {
      const error = 'Salão não selecionado';
      console.error('❌', error);
      onError?.(error);
      return false;
    }

    if (!bookingTime) {
      const error = 'Horário não selecionado';
      console.error('❌', error);
      onError?.(error);
      return false;
    }

    try {
      // Determinar o profissional - priorizar selectedProfessional se fornecido
      let professionalId = '';
      
      if (selectedProfessional && professionals) {
        const prof = professionals.find(p => 
          p.name.replace('[Exemplo] ', '') === selectedProfessional
        );
        if (prof) {
          professionalId = prof.id;
        }
      }
      
      // Se não encontrou pelo nome, usar o primeiro dos serviceProfessionals
      if (!professionalId && serviceProfessionals.length > 0) {
        professionalId = serviceProfessionals[0].professionalId;
      }
      
      // Se ainda não tem profissional, usar o primeiro disponível
      if (!professionalId && professionals && professionals.length > 0) {
        professionalId = professionals[0].id;
        console.log('⚠️ Usando primeiro profissional disponível:', professionals[0].name);
      }

      if (!professionalId) {
        const error = 'Nenhum profissional disponível';
        console.error('❌', error);
        onError?.(error);
        return false;
      }

      // Determinar o cliente
      let clientId = null;
      
      // Se há cliente selecionado e não é "Sem reserva"
      if (selectedClient && selectedClient.id && selectedClient.id !== 'sem-reserva') {
        clientId = selectedClient.id;
      } else if (selectedClient && selectedClient.nome && selectedClient.nome !== 'Sem reserva') {
        // Tentar criar cliente com find_or_create_client
        console.log('🔄 Tentando criar/encontrar cliente:', selectedClient.nome);
        
        const { data: clientData, error: clientError } = await supabaseService.clients.findOrCreate({
          salonId: currentSalon.id,
          name: selectedClient.nome,
          phone: selectedClient.telefone || '',
          email: selectedClient.email || ''
        });
        
        if (clientError) {
          console.error('❌ Erro ao criar/encontrar cliente:', clientError);
          onError?.(`Erro ao processar cliente: ${clientError}`);
          return false;
        }
        
        if (clientData?.client_id) {
          clientId = clientData.client_id;
          console.log('✅ Cliente criado/encontrado:', clientId);
        }
      }

      const dateString = formatDateToLocal(bookingDate);
      
      // Garantir formato correto da hora HH:MM:SS
      let formattedTime = bookingTime;
      if (bookingTime && !bookingTime.includes(':00', bookingTime.length - 3)) {
        formattedTime = bookingTime + ':00';
      }

      console.log('📋 Dados finais do agendamento:', {
        salonId: currentSalon.id,
        clientId,
        professionalId,
        date: dateString,
        startTime: formattedTime,
        services: selectedServices.length
      });

      // Preparar os serviços no formato correto
      const services = selectedServices.map(serviceId => ({
        service_id: serviceId
      }));

      // Criar o agendamento usando a função RPC
      console.log('🔄 Chamando supabaseService.appointments.create...');
      const { data, error } = await supabaseService.appointments.create({
        salonId: currentSalon.id,
        clientId: clientId, // Pode ser null para "sem reserva"
        professionalId: professionalId,
        date: dateString,
        startTime: formattedTime,
        services: services,
        notes: selectedClient?.nome === 'Sem reserva' ? 'Agendamento sem cliente específico' : ''
      });

      console.log('📋 Resposta do supabaseService:', { data, error });

      if (error) {
        console.error('❌ Erro da API:', error);
        onError?.(typeof error === 'string' ? error : 'Erro na criação do agendamento');
        return false;
      }

      if (!data) {
        console.error('❌ Dados vazios retornados');
        onError?.('Resposta vazia do servidor');
        return false;
      }

      console.log('📊 Verificando data.success:', data.success);
      
      if (data.success === true) {
        console.log('✅ Agendamento criado com sucesso!');
        // Atualizar a lista de agendamentos
        await refreshAppointments();
        onSuccess?.();
        return true;
      }

      // Se chegou aqui, data.success é false ou não existe
      const creationError = (data as any).message || 'Falha na criação do agendamento';
      console.error('❌ Falha na criação:', creationError, 'Data completa:', data);
      onError?.(creationError);
      return false;

    } catch (err) {
      const unexpectedError = 'Erro inesperado ao criar agendamento';
      console.error('❌', unexpectedError, err);
      onError?.(unexpectedError);
      return false;
    }
  }, [refreshAppointments, currentSalon, professionals]);

  return {
    createAppointment
  };
}; 