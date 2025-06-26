import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Taxa {
  id: string;
  nome: string;
  taxa: number;
  ativo: boolean;
}

interface TaxasContextType {
  taxas: Taxa[];
  addTaxa: (taxa: Taxa) => void;
  updateTaxa: (id: string, updates: Partial<Taxa>) => void;
  removeTaxa: (id: string) => void;
}

const TaxasContext = createContext<TaxasContextType | undefined>(undefined);

export const useTaxas = () => {
  const context = useContext(TaxasContext);
  if (!context) {
    throw new Error('useTaxas must be used within a TaxasProvider');
  }
  return context;
};

interface TaxasProviderProps {
  children: ReactNode;
}

export const TaxasProvider: React.FC<TaxasProviderProps> = ({ children }) => {
  const [taxas, setTaxas] = useState<Taxa[]>([
    {
      id: '1',
      nome: 'Cartão de crédito',
      taxa: 3.19,
      ativo: true
    },
    {
      id: '2',
      nome: 'Cartão de débito',
      taxa: 4.19,
      ativo: true
    },
    {
      id: '3',
      nome: 'Dinheiro',
      taxa: 0.00,
      ativo: true
    },
    {
      id: '4',
      nome: 'Pix',
      taxa: 0.00,
      ativo: true
    },
    {
      id: '5',
      nome: 'medit',
      taxa: 3.15,
      ativo: true
    }
  ]);

  const addTaxa = (taxa: Taxa) => {
    setTaxas(prev => [...prev, taxa]);
  };

  const updateTaxa = (id: string, updates: Partial<Taxa>) => {
    setTaxas(prev => 
      prev.map(taxa => 
        taxa.id === id ? { ...taxa, ...updates } : taxa
      )
    );
  };

  const removeTaxa = (id: string) => {
    setTaxas(prev => prev.filter(taxa => taxa.id !== id));
  };

  return (
    <TaxasContext.Provider value={{
      taxas,
      addTaxa,
      updateTaxa,
      removeTaxa
    }}>
      {children}
    </TaxasContext.Provider>
  );
};