import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Advance } from '../types';
import { financeService } from '../lib/supabaseService';
import { useApp } from './AppContext';
import { useProfessional } from './ProfessionalContext';

interface Vale {
  id: string;
  data: string;
  profissionalId: string;
  profissionalNome: string;
  valor: number;
  status: 'pendente' | 'descontado';
  observacoes?: string;
}

interface HistoricoItem {
  data: string;
  valorBruto: number;
  valorLiquido: number;
  taxas: number;
  comissoes: number;
  profissional: string;
  metodoPagamento: {
    id: string;
    nome: string;
  };
}

interface CashClosure {
  id: string;
  salon_id: string;
  professional_id: string;
  professional_name: string;
  date: string;
  created_at: string;
  services: Array<{
    date: string;
    client_name: string | null;
    service_name: string;
    gross_value: number;
    fee: number;
    commission: number;
    net_value: number;
  }>;
}

interface PeriodFilter {
  startDate: string;
  endDate: string;
}

interface FinanceiroContextType {
  vales: Vale[];
  historicoFinanceiro: HistoricoItem[];
  loading: boolean;
  error: string | null;
  addVale: (vale: Omit<Vale, 'id' | 'status'>) => Promise<boolean>;
  updateVale: (id: string, updates: Partial<Vale>) => Promise<boolean>;
  removeVale: (id: string) => Promise<boolean>;
  refreshVales: () => Promise<void>;
  loadHistorico: (period: PeriodFilter) => Promise<void>;
  loadHistoricoUltimos7Dias: () => Promise<void>;
}

const FinanceiroContext = createContext<FinanceiroContextType | undefined>(undefined);

export const useFinanceiro = () => {
  const context = useContext(FinanceiroContext);
  if (!context) {
    throw new Error('useFinanceiro deve ser usado dentro de um FinanceiroProvider');
  }
  return context;
};

interface FinanceiroProviderProps {
  children: ReactNode;
}

export const FinanceiroProvider: React.FC<FinanceiroProviderProps> = ({ children }) => {
  const [vales, setVales] = useState<Vale[]>([]);
  const [historicoFinanceiro, setHistoricoFinanceiro] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentSalon, isReady } = useApp();
  const { professionals } = useProfessional();

  const convertAdvanceToVale = (advance: Advance): Vale => {
    const professional = professionals?.find(p => p.id === advance.professional_id);
    return {
      id: advance.id,
      data: advance.created_at.split('T')[0], // Converte ISO date para YYYY-MM-DD
      profissionalId: advance.professional_id,
      profissionalNome: professional?.name || 'Profissional não encontrado',
      valor: advance.value,
      status: advance.discounted ? 'descontado' : 'pendente',
      observacoes: ''
    };
  };

  const loadHistorico = async (period: PeriodFilter) => {
    if (!currentSalon?.id || !isReady) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Iniciando carregamento de histórico financeiro para salão:', currentSalon.id);
      
      const response = await financeService.listCashClosures({
        salonId: currentSalon.id,
        dateFrom: period.startDate,
        dateTo: period.endDate
      });

      console.log('Resposta do listCashClosures:', response);

      if (response.error) {
        console.error('Erro retornado pelo financeService.listCashClosures:', response.error);
        setError(`Erro ao carregar histórico financeiro: ${response.error}`);
      } else {
        // Verificação de segurança para evitar erro de reduce em dados undefined
        if (!response.data || !Array.isArray(response.data)) {
          console.log('Nenhum dado de fechamento encontrado ou dados inválidos');
          setHistoricoFinanceiro([]);
          return;
        }

        // Converter os dados para o formato do histórico
        const historico = response.data.map((closure: any) => {
          // Verificação de segurança para closure.services
          if (!closure || !closure.services || !Array.isArray(closure.services)) {
            console.warn('Closure inválido ou sem serviços:', closure);
            return {
              data: closure?.date || 'Data desconhecida',
              valorBruto: 0,
              valorLiquido: 0,
              taxas: 0,
              comissoes: 0,
              profissional: closure?.professional_name || 'Profissional desconhecido',
              metodoPagamento: {
                id: closure?.payment_method_id || '',
                nome: closure?.payment_method_name || ''
              }
            };
          }

          // Calcular totais dos serviços com verificação de segurança
          const totais = closure.services.reduce((acc: any, service: any) => {
            // Verificação de segurança para cada serviço
            if (!service) return acc;
            
            return {
              valorBruto: acc.valorBruto + (service.gross_value || 0),
              valorLiquido: acc.valorLiquido + (service.net_value || 0),
              taxas: acc.taxas + (service.fee || 0),
              comissoes: acc.comissoes + (service.commission || 0)
            };
          }, {
            valorBruto: 0,
            valorLiquido: 0,
            taxas: 0,
            comissoes: 0
          });

          return {
            data: closure.date,
            valorBruto: totais.valorBruto,
            valorLiquido: totais.valorLiquido,
            taxas: totais.taxas,
            comissoes: totais.comissoes,
            profissional: closure.professional_name,
            metodoPagamento: {
              id: closure.payment_method_id || '',
              nome: closure.payment_method_name || ''
            }
          };
        });

        console.log('Histórico convertido:', historico);
        setHistoricoFinanceiro(historico);
      }
    } catch (err: any) {
      console.error('Erro detalhado ao carregar histórico financeiro:', err);
      
      // Captura a mensagem de erro específica
      const errorMessage = err?.message || err?.toString() || 'Ocorreu um erro desconhecido.';
      
      setError(`Erro ao carregar histórico financeiro: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshVales = async () => {
    if (!currentSalon?.id || !isReady) return;

    setLoading(true);
    setError(null);
    
    try {
      console.log('Iniciando carregamento de vales para salão:', currentSalon.id);
      
      const response = await financeService.listAdvances({
        salonId: currentSalon.id
      });
      
      console.log('Resposta do listAdvances:', response);
      
      if (response.error) {
        console.error('Erro retornado pelo financeService.listAdvances:', response.error);
        setError(`Erro ao carregar vales: ${response.error}`);
      } else {
        const convertedVales = response.data?.map(convertAdvanceToVale) || [];
        console.log('Vales convertidos:', convertedVales);
        setVales(convertedVales);
      }
    } catch (err: any) {
      console.error('Erro detalhado ao carregar vales:', err);
      
      // Captura a mensagem de erro específica
      const errorMessage = err?.message || err?.toString() || 'Ocorreu um erro desconhecido.';
      
      setError(`Erro ao carregar vales: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const addVale = async (vale: Omit<Vale, 'id' | 'status'>): Promise<boolean> => {
    if (!currentSalon?.id) return false;

    try {
      console.log('Iniciando criação de vale:', vale);
      
      const response = await financeService.createAdvance({
        salonId: currentSalon.id,
        professionalId: vale.profissionalId,
        value: vale.valor
      });
      
      console.log('Resposta do createAdvance:', response);
      
      if (response.error) {
        console.error('Erro retornado pelo financeService.createAdvance:', response.error);
        setError(`Erro ao criar vale: ${response.error}`);
        return false;
      }
      
      await refreshVales();
      return true;
    } catch (err: any) {
      console.error('Erro detalhado ao criar vale:', err);
      
      // Captura a mensagem de erro específica
      const errorMessage = err?.message || err?.toString() || 'Ocorreu um erro desconhecido.';
      
      setError(`Erro ao criar vale: ${errorMessage}`);
      return false;
    }
  };

  const updateVale = async (id: string, updates: Partial<Vale>): Promise<boolean> => {
    // Como não há RPC de update para vales, mantemos a funcionalidade local por enquanto
    setVales(prev => prev.map(vale => vale.id === id ? { ...vale, ...updates } : vale));
    return true;
  };

  const removeVale = async (id: string): Promise<boolean> => {
    if (!currentSalon?.id) return false;

    try {
      console.log('Iniciando exclusão de vale:', id);
      
      const response = await financeService.deleteAdvance({
        advanceId: id,
        salonId: currentSalon.id
      });
      
      console.log('Resposta do deleteAdvance:', response);
      
      if (response.error) {
        console.error('Erro retornado pelo financeService.deleteAdvance:', response.error);
        setError(`Erro ao deletar vale: ${response.error}`);
        return false;
      }
      
      // Atualizar a lista local removendo o vale excluído
      setVales(prev => prev.filter(vale => vale.id !== id));
      return true;
    } catch (err: any) {
      console.error('Erro detalhado ao deletar vale:', err);
      
      // Captura a mensagem de erro específica
      const errorMessage = err?.message || err?.toString() || 'Ocorreu um erro desconhecido.';
      
      setError(`Erro ao deletar vale: ${errorMessage}`);
      return false;
    }
  };

  const loadHistoricoUltimos7Dias = async () => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    
    await loadHistorico({ 
      startDate: startDate.toISOString().split('T')[0],
      endDate
    });
  };

  useEffect(() => {
    if (isReady && currentSalon?.id && professionals?.length) {
      // Carregar apenas os vales automaticamente
      // O histórico será carregado apenas quando o usuário solicitar
      refreshVales();
    }
  }, [currentSalon?.id, isReady, professionals?.length]);

  return (
    <FinanceiroContext.Provider value={{
      vales,
      historicoFinanceiro,
      loading,
      error,
      addVale,
      updateVale,
      removeVale,
      refreshVales,
      loadHistorico,
      loadHistoricoUltimos7Dias
    }}>
      {children}
    </FinanceiroContext.Provider>
  );
};