import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface AppContextData {
  currentUser: {
    id: string;
    name: string;
    email: string;
    created_at: string;
  } | null;
  currentSalon: {
    id: string;
    cnpj: string | null;
    name: string;
    email: string;
    phone: string;
    active: boolean;
    currency: string;
    settings: any;
    timezone: string;
    subdomain: string | null;
    created_at: string;
  } | null;
  isReady: boolean;
}

const AppContext = createContext<AppContextData>({} as AppContextData);

export function AppProvider({ children }: { children: ReactNode }) {
  const { userContext } = useAuth();

  const currentUser = userContext?.user || null;
  const currentSalon = userContext?.salons?.[0] || null;
  const isReady = !!currentUser && !!currentSalon;

  return (
    <AppContext.Provider value={{
      currentUser,
      currentSalon,
      isReady,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  
  return context;
} 