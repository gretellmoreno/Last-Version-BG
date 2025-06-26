import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PaymentMethod } from '../types';
import { paymentMethodService } from '../lib/supabaseService';
import { useApp } from './AppContext';

interface Taxa {
  id: string;
  nome: string;
  taxa: number;
  ativo: boolean;
}

interface TaxasContextType {
  taxas: Taxa[];
  loading: boolean;
  error: string | null;
  addTaxa: (taxa: Omit<Taxa, 'id'>) => Promise<boolean>;
  updateTaxa: (id: string, updates: Partial<Taxa>) => Promise<boolean>;
  removeTaxa: (id: string) => Promise<boolean>;
  refreshTaxas: () => Promise<void>;
}

interface TaxasProviderProps {
  children: ReactNode;
}

const TaxasContext = createContext<TaxasContextType | undefined>(undefined);

export const useTaxas = () => {
  const context = useContext(TaxasContext);
  if (!context) {
    throw new Error('useTaxas must be used within a TaxasProvider');
  }
  return context;
};

export const TaxasProvider: React.FC<TaxasProviderProps> = ({ children }) => {
  const [taxas, setTaxas] = useState<Taxa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentSalon, isReady } = useApp();

  const convertPaymentMethodToTaxa = (paymentMethod: PaymentMethod): Taxa => ({
    id: paymentMethod.id,
    nome: paymentMethod.name,
    taxa: paymentMethod.fee,
    ativo: true
  });

  const refreshTaxas = async () => {
    if (!currentSalon?.id || !isReady) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await paymentMethodService.list(currentSalon.id);
      if (response.error) {
        setError(response.error);
      } else {
        const convertedTaxas = response.data?.map(convertPaymentMethodToTaxa) || [];
        setTaxas(convertedTaxas);
      }
    } catch (err) {
      setError('Erro ao carregar métodos de pagamento');
    } finally {
      setLoading(false);
    }
  };

  const addTaxa = async (taxa: Omit<Taxa, 'id'>): Promise<boolean> => {
    if (!currentSalon?.id) return false;

    try {
      const response = await paymentMethodService.create({
        salonId: currentSalon.id,
        name: taxa.nome,
        fee: taxa.taxa
      });
      
      if (response.error) {
        setError(response.error);
        return false;
      }
      
      await refreshTaxas();
      return true;
    } catch (err) {
      setError('Erro ao criar método de pagamento');
      return false;
    }
  };

  const updateTaxa = async (id: string, updates: Partial<Taxa>): Promise<boolean> => {
    if (!currentSalon?.id) return false;

    const currentTaxa = taxas.find(t => t.id === id);
    if (!currentTaxa) return false;

    try {
      const response = await paymentMethodService.update({
        paymentMethodId: id,
        salonId: currentSalon.id,
        name: updates.nome || currentTaxa.nome,
        fee: updates.taxa !== undefined ? updates.taxa : currentTaxa.taxa
      });
      
      if (response.error) {
        setError(response.error);
        return false;
      }
      
      await refreshTaxas();
      return true;
    } catch (err) {
      setError('Erro ao atualizar método de pagamento');
      return false;
    }
  };

  const removeTaxa = async (id: string): Promise<boolean> => {
    if (!currentSalon?.id) return false;

    try {
      const response = await paymentMethodService.delete(id, currentSalon.id);
      
      if (response.error) {
        setError(response.error);
        return false;
      }
      
      await refreshTaxas();
      return true;
    } catch (err) {
      setError('Erro ao remover método de pagamento');
      return false;
    }
  };

  useEffect(() => {
    if (isReady && currentSalon?.id) {
      refreshTaxas();
    }
  }, [currentSalon?.id, isReady]);

  return (
    <TaxasContext.Provider value={{
      taxas,
      loading,
      error,
      addTaxa,
      updateTaxa,
      removeTaxa,
      refreshTaxas
    }}>
      {children}
    </TaxasContext.Provider>
  );
};