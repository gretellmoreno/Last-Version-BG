import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useSalonSlug, useIsMainDomain } from '../hooks/useSubdomain';
import { salonService } from '../lib/salonService';

interface Salon {
  id: string;
  name: string;
  subdomain: string;
  public_profile_photo_url: string | null;
  public_display_name: string | null;
}

interface AppContextType {
  currentSalon: Salon | null;
  isReady: boolean;
  loading: boolean;
  error: string | null;
  salonSlug: string | null;
  isMainDomain: boolean;
  setSalon: (salon: Salon | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentSalon, setCurrentSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const salonSlug = useSalonSlug();
  const isMainDomain = useIsMainDomain();

  // Função para buscar salão pelo subdomínio
  const loadSalonBySlug = async (slug: string) => {
    console.log('🔄 Carregando salão pelo slug:', slug);
    setLoading(true);
    setError(null);

    try {
      const response = await salonService.getSalonBySlug(slug);
      
      if (response.success && response.salon) {
        console.log('✅ Salão carregado:', response.salon.name);
        setCurrentSalon(response.salon);
        setIsReady(true);
      } else {
        console.error('❌ Falha ao carregar salão:', response.error);
        setError(response.error || 'Salão não encontrado');
        setCurrentSalon(null);
        setIsReady(false);
      }
    } catch (err) {
      console.error('💥 Erro inesperado ao carregar salão:', err);
      setError('Erro inesperado ao carregar salão');
      setCurrentSalon(null);
      setIsReady(false);
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar salão do usuário (método antigo, para domínio principal)
  const loadUserSalons = async () => {
    if (!user?.id) {
      console.log('❌ Usuário não encontrado');
      setLoading(false);
      return;
    }

    console.log('🔄 Carregando salões do usuário...');
    setLoading(true);
    setError(null);

    try {
      // Buscar salões do usuário (implementar conforme necessário)
      // Por enquanto, usar dados mockados ou API existente
      
      // Simulação - você pode adaptar para sua lógica existente
      const mockSalon = {
        id: 'mock-salon-id',
        name: 'Salão Principal',
        subdomain: 'principal',
        public_profile_photo_url: null,
        public_display_name: null
      };
      
      setCurrentSalon(mockSalon);
      setIsReady(true);
    } catch (err) {
      console.error('💥 Erro ao carregar salões:', err);
      setError('Erro ao carregar dados do salão');
      setCurrentSalon(null);
      setIsReady(false);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados baseado no contexto
  useEffect(() => {
    console.log('🌐 AppProvider - Contexto:', { 
      salonSlug, 
      isMainDomain, 
      isAuthenticated,
      userId: user?.id 
    });

    // Se tem slug de salão (subdomínio), carregar pelo slug
    if (salonSlug && !isMainDomain) {
      loadSalonBySlug(salonSlug);
    }
    // Se está no domínio principal e autenticado, carregar salões do usuário
    else if (isMainDomain && isAuthenticated && user) {
      loadUserSalons();
    }
    // Se não está autenticado no domínio principal, apenas marcar como pronto
    else if (isMainDomain && !isAuthenticated) {
      setLoading(false);
      setIsReady(false);
    }
    // Fallback
    else {
      setLoading(false);
      setIsReady(false);
    }
  }, [salonSlug, isMainDomain, isAuthenticated, user?.id]);

  const setSalon = (salon: Salon | null) => {
    setCurrentSalon(salon);
    setIsReady(!!salon);
  };

  const value: AppContextType = {
    currentSalon,
    isReady,
    loading,
    error,
    salonSlug,
    isMainDomain,
    setSalon
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}; 