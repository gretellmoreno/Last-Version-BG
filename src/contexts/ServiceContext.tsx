import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Servico } from '../types';
import { servicos as initialServicos } from '../utils/mockData';

interface ServiceContextType {
  servicos: Servico[];
  addServico: (servico: Servico) => void;
  updateServico: (id: string, updates: Partial<Servico>) => void;
  removeServico: (id: string) => void;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const useService = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useService must be used within a ServiceProvider');
  }
  return context;
};

interface ServiceProviderProps {
  children: ReactNode;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children }) => {
  const [servicos, setServicos] = useState<Servico[]>(initialServicos);

  const addServico = (servico: Servico) => {
    setServicos(prev => [...prev, servico]);
  };

  const updateServico = (id: string, updates: Partial<Servico>) => {
    setServicos(prev => 
      prev.map(servico => 
        servico.id === id ? { ...servico, ...updates } : servico
      )
    );
  };

  const removeServico = (id: string) => {
    setServicos(prev => prev.filter(servico => servico.id !== id));
  };

  return (
    <ServiceContext.Provider value={{
      servicos,
      addServico,
      updateServico,
      removeServico
    }}>
      {children}
    </ServiceContext.Provider>
  );
};