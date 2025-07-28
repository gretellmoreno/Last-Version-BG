import { useQuery } from '@tanstack/react-query';
import { supabaseService } from '../lib/supabaseService';
import { queryKeys, cacheConfig } from '../lib/queryClient';
import type { AppointmentDetails } from '../types';

/**
 * Hook customizado para buscar detalhes de um agendamento
 * 
 * Benefícios do TanStack Query:
 * - ✅ Estados de loading, error, data automaticamente gerenciados
 * - ✅ Cache inteligente com invalidação automática
 * - ✅ Retry automático com configurações personalizadas
 * - ✅ Revalidação em background
 * - ✅ Menos código boilerplate (era ~30 linhas de useEffect, agora ~15 linhas)
 * 
 * @param appointmentId - ID do agendamento
 * @param salonId - ID do salão
 * @param enabled - Se deve executar a query (padrão: true)
 * @returns Objeto com dados, loading, error e funções auxiliares
 */
export const useAppointmentDetails = (
  appointmentId: string | null,
  salonId: string | null,
  enabled: boolean = true
) => {
  const query = useQuery({
    // Chave única para cache - mudanças em appointmentId ou salonId invalidam automaticamente
    queryKey: queryKeys.appointmentDetails(appointmentId || '', salonId || ''),
    
    // Função que busca os dados
    queryFn: async (): Promise<AppointmentDetails> => {
      if (!appointmentId || !salonId) {
        throw new Error('AppointmentId e SalonId são obrigatórios');
      }

      const { data, error } = await supabaseService.appointments.getDetails(
        appointmentId,
        salonId
      );

      if (error) {
        throw new Error(error);
      }

      if (!data?.success) {
        throw new Error('Agendamento não encontrado');
      }

      return data;
    },
    
    // Só executar se IDs estão disponíveis e enabled é true
    enabled: enabled && !!appointmentId && !!salonId,
    
    // Configurações de cache otimizadas para detalhes de agendamento
    ...cacheConfig.moderate,
    
    // Configurações específicas para evitar requisições desnecessárias
    refetchOnMount: false, // Não buscar automaticamente - usar cache quando disponível
    refetchOnWindowFocus: false, // Não recarregar quando janela receber foco
    refetchOnReconnect: false, // Não recarregar ao reconectar
    staleTime: 60000, // Cache válido por 1 minuto
    gcTime: 1000 * 60 * 5, // Manter no garbage collector por 5 minutos
    
    // Estratégia de retry personalizada
    retry: (failureCount: number, error: any) => {
      // Não tentar novamente para erros 404 ou "não encontrado"
      if (error?.message?.includes('não encontrado') || 
          error?.message?.includes('404')) {
        return false;
      }
      
      // Tentar até 2 vezes para outros erros
      return failureCount < 2;
    },
    
    // Delay progressivo entre tentativas (1s, 2s, 4s)
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 4000),
  });

  // Dados computados para facilitar uso
  const appointment = query.data?.appointment;
  const client = appointment?.client;
  const professional = appointment?.professional;
  const services = appointment?.services || [];
  
  // Cálculos derivados
  const totalPrice = services.reduce((total: number, service: { price: number }) => total + service.price, 0);
  const totalDuration = services.reduce((total: number, service: { duration: number }) => total + service.duration, 0);
  
  // Formatação de dados
  const formattedDate = appointment?.date 
    ? new Date(appointment.date).toLocaleDateString('pt-BR') 
    : null;
    
  const formattedStartTime = appointment?.start_time 
    ? appointment.start_time.slice(0, 5) 
    : null;
    
  const formattedEndTime = appointment?.end_time 
    ? appointment.end_time.slice(0, 5) 
    : null;

  return {
    // Estados básicos do React Query
    ...query,
    
    // Dados específicos do agendamento (para facilitar acesso)
    appointment,
    client,
    professional,
    services,
    
    // Dados computados
    totalPrice,
    totalDuration,
    formattedDate,
    formattedStartTime,
    formattedEndTime,
    
    // Helpers para verificação de estado
    hasData: !!query.data,
    isEmpty: !query.isLoading && !query.data,
    hasError: query.isError,
    
    // Ações
    refetch: query.refetch,
    
    // Para debug
    queryKey: queryKeys.appointmentDetails(appointmentId || '', salonId || ''),
  };
};

/**
 * Hook para múltiplos agendamentos (lista)
 * 
 * @param salonId - ID do salão
 * @param filters - Filtros opcionais (data, profissional, status)
 * @returns Lista de agendamentos com cache inteligente
 */
export const useAppointments = (
  salonId: string | null,
  filters?: {
    date?: string;
    professionalId?: string;
    status?: string;
  }
) => {
  return useQuery({
    queryKey: [...queryKeys.appointments(salonId || ''), filters],
    
    queryFn: async () => {
      if (!salonId) {
        throw new Error('SalonId é obrigatório');
      }

      const { data, error } = await supabaseService.appointments.list({
        salonId,
        ...filters
      });

      if (error) {
        throw new Error(error);
      }

      return data || [];
    },
    
    enabled: !!salonId,
    
    // Agendamentos mudam com mais frequência - cache menor
    ...cacheConfig.realtime,
    
    // Atualizar automaticamente a cada 30 segundos se janela estiver ativa
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });
}; 