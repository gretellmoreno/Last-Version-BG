import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  servicosParaFechamento: ServicoFechamento[];
  historicoFechamentos: FechamentoHistorico[];
  addVale: (vale: Vale) => void;
  updateVale: (id: string, updates: Partial<Vale>) => void;
  removeVale: (id: string) => void;
  addFechamentoHistorico: (fechamento: FechamentoHistorico) => void;
}

const FinanceiroContext = createContext<FinanceiroContextType | undefined>(undefined);

export const useFinanceiro = () => {
  const context = useContext(FinanceiroContext);
  if (!context) {
    throw new Error('useFinanceiro must be used within a FinanceiroProvider');
  }
  return context;
};

interface FinanceiroProviderProps {
  children: ReactNode;
}

export const FinanceiroProvider: React.FC<FinanceiroProviderProps> = ({ children }) => {
  const [vales, setVales] = useState<Vale[]>([
    {
      id: '1',
      data: '2025-06-05',
      profissionalId: '1',
      profissionalNome: 'Carmen',
      valor: 10.00,
      status: 'descontado'
    }
  ]);

  // Dados mock para fechamento de caixa
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

  // Histórico de fechamentos
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

  const addVale = (vale: Vale) => {
    setVales(prev => [...prev, vale]);
  };

  const updateVale = (id: string, updates: Partial<Vale>) => {
    setVales(prev => prev.map(vale => vale.id === id ? { ...vale, ...updates } : vale));
  };

  const removeVale = (id: string) => {
    setVales(prev => prev.filter(vale => vale.id !== id));
  };

  const addFechamentoHistorico = (fechamento: FechamentoHistorico) => {
    setHistoricoFechamentos(prev => [fechamento, ...prev]);
  };

  return (
    <FinanceiroContext.Provider value={{
      vales,
      servicosParaFechamento,
      historicoFechamentos,
      addVale,
      updateVale,
      removeVale,
      addFechamentoHistorico
    }}>
      {children}
    </FinanceiroContext.Provider>
  );
};