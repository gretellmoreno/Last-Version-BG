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

interface ServicoFechamento {
  data: string;
  cliente: string;
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

interface FinanceiroContextType {
  vales: Vale[];
  loading: boolean;
  error: string | null;
  servicosParaFechamento: ServicoFechamento[];
  historicoFechamentos: FechamentoHistorico[];
  addVale: (vale: Omit<Vale, 'id' | 'status'>) => Promise<boolean>;
  updateVale: (id: string, updates: Partial<Vale>) => Promise<boolean>;
  removeVale: (id: string) => Promise<boolean>;
  refreshVales: () => Promise<void>;
  addFechamentoHistorico: (fechamento: FechamentoHistorico) => void;
}

interface FinanceiroProviderProps {
  children: ReactNode;
}

const FinanceiroContext = createContext<FinanceiroContextType | undefined>(undefined);

export const useFinanceiro = () => {
  const context = useContext(FinanceiroContext);
  if (!context) {
    throw new Error('useFinanceiro must be used within a FinanceiroProvider');
  }
  return context;
};

export const FinanceiroProvider: React.FC<FinanceiroProviderProps> = ({ children }) => {
  const [vales, setVales] = useState<Vale[]>([]);
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
      status: 'pendente',
      observacoes: ''
    };
  };

  const refreshVales = async () => {
    if (!currentSalon?.id || !isReady) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await financeService.listAdvances({
        salonId: currentSalon.id
      });
      
      if (response.error) {
        setError(response.error);
      } else {
        const convertedVales = response.data?.map(convertAdvanceToVale) || [];
        setVales(convertedVales);
      }
    } catch (err) {
      setError('Erro ao carregar vales');
    } finally {
      setLoading(false);
    }
  };

  const addVale = async (vale: Omit<Vale, 'id' | 'status'>): Promise<boolean> => {
    if (!currentSalon?.id) return false;

    try {
      const response = await financeService.createAdvance({
        salonId: currentSalon.id,
        professionalId: vale.profissionalId,
        value: vale.valor
      });
      
      if (response.error) {
        setError(response.error);
        return false;
      }
      
      await refreshVales();
      return true;
    } catch (err) {
      setError('Erro ao criar vale');
      return false;
    }
  };

  const updateVale = async (id: string, updates: Partial<Vale>): Promise<boolean> => {
    // Como não há RPC de update para vales, mantemos a funcionalidade local por enquanto
    setVales(prev => prev.map(vale => vale.id === id ? { ...vale, ...updates } : vale));
    return true;
  };

  const removeVale = async (id: string): Promise<boolean> => {
    // Como não há RPC de delete para vales, mantemos a funcionalidade local por enquanto
    setVales(prev => prev.filter(vale => vale.id !== id));
    return true;
  };

  // Dados mock para fechamento de caixa (mantendo como estava)
  const [servicosParaFechamento] = useState<ServicoFechamento[]>([
    {
      data: '25/06/2025',
      cliente: 'Cliente não especificado',
      servico: '[Exemplo] Corte Feminino',
      valorBruto: 80.00,
      taxa: -4.00,
      comissao: 50,
      valorLiquido: 36.00
    },
    {
      data: '25/06/2025',
      cliente: 'Cliente não especificado',
      servico: '[Exemplo] Pedicure',
      valorBruto: 25.00,
      taxa: -1.25,
      comissao: 60,
      valorLiquido: 13.75
    }
  ]);

  // Histórico de fechamentos (mantendo como estava)
  const [historicoFechamentos, setHistoricoFechamentos] = useState<FechamentoHistorico[]>([
    {
      id: '1',
      data: '25/06/2025',
      hora: '04:13',
      profissionalNome: 'Carmen',
      servicos: [
        {
          data: '25/06/2025',
          cliente: 'Cliente não especificado',
          servico: '[Exemplo] Pedicure',
          valorBruto: 25.00,
          taxa: -1.25,
          comissao: 60,
          valorLiquido: 13.75
        },
        {
          data: '25/06/2025',
          cliente: 'Cliente não especificado',
          servico: '[Exemplo] Corte Feminino',
          valorBruto: 80.00,
          taxa: -4.00,
          comissao: 50,
          valorLiquido: 36.00
        }
      ],
      totalLiquido: 49.75
    },
    {
      id: '2',
      data: '24/06/2025',
      hora: '18:30',
      profissionalNome: 'Carmen',
      servicos: [
        {
          data: '24/06/2025',
          cliente: 'Ana Silva',
          servico: '[Exemplo] Escova',
          valorBruto: 35.00,
          taxa: -1.75,
          comissao: 50,
          valorLiquido: 16.25
        }
      ],
      totalLiquido: 16.25
    }
  ]);

  const addFechamentoHistorico = (fechamento: FechamentoHistorico) => {
    setHistoricoFechamentos(prev => [fechamento, ...prev]);
  };

  useEffect(() => {
    if (isReady && currentSalon?.id && professionals?.length) {
      refreshVales();
    }
  }, [currentSalon?.id, isReady, professionals?.length]);

  return (
    <FinanceiroContext.Provider value={{
      vales,
      loading,
      error,
      servicosParaFechamento,
      historicoFechamentos,
      addVale,
      updateVale,
      removeVale,
      refreshVales,
      addFechamentoHistorico
    }}>
      {children}
    </FinanceiroContext.Provider>
  );
};