import { useQuery } from '@tanstack/react-query';
import { supabaseService } from '../lib/supabaseService';
import { queryKeys, cacheConfig } from '../lib/queryClient';

interface ServicoFechamento {
  data: string;
  cliente: string | null;
  servico: string;
  valorBruto: number;
  taxa: number;
  comissao: number;
  valorLiquido: number;
}

interface FechamentoHistorico {
  id: string;
  data: string;
  hora: string;
  profissionalNome: string;
  servicos: ServicoFechamento[];
  totalLiquido: number;
}

/**
 * Hook para buscar histórico de fechamentos de caixa
 */
export const useCashClosureHistory = (
  salonId: string | null,
  professionalId?: string,
  dateFrom?: string,
  dateTo?: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [...queryKeys.finance.cashClosures(salonId || ''), professionalId, dateFrom, dateTo],
    
    queryFn: async (): Promise<FechamentoHistorico[]> => {
      if (!salonId) {
        throw new Error('SalonId é obrigatório');
      }

      const { data, error } = await supabaseService.finance.listCashClosures({
        salonId,
        professionalId,
        dateFrom,
        dateTo
      });

      if (error) {
        throw new Error(error);
      }

      // Transformar os dados da API no formato esperado pelo frontend
      return (data || []).map((closure: any) => ({
        id: closure.id,
        data: closure?.closed_at ? new Date(closure.closed_at).toLocaleDateString('pt-BR') : '',
        hora: closure?.closed_at ? new Date(closure.closed_at).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : '',
        profissionalNome: closure.professional_name || closure.professional_id || 'Profissional não especificado',
        servicos: [],
        totalLiquido: closure?.details?.net_total ?? closure?.net_total ?? 0,
        totalBruto: closure?.details?.services_total ?? closure?.services_total ?? 0,
        totalTaxas: closure?.details?.fees_total ?? closure?.payment_fees ?? 0,
        totalComissoes: closure?.details?.commissions_total ?? closure?.commissions ?? 0,
      }));
    },
    
    enabled: enabled && !!salonId,
    ...cacheConfig.moderate,
    
    // Configurações específicas
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    
    // Retry strategy
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('não encontrado') || 
          error?.message?.includes('404')) {
        return false;
      }
      return failureCount < 2;
    },
    
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 4000),
  });
}; 