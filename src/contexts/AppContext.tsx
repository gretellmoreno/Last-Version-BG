import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useSalonSlug, useIsMainDomain } from '../hooks/useSubdomain';
import { salonService } from '../lib/salonService';
import { supabaseService } from '../lib/supabaseService';

interface Salon {
  id: string;
  name: string;
  subdomain: string;
  public_profile_photo_url: string | null;
  public_display_name: string | null;
  has_services?: boolean;
}

interface AppContextType {
  currentSalon: Salon | null;
  isReady: boolean;
  loading: boolean;
  error: string | null;
  salonSlug: string | null;
  isMainDomain: boolean;
  hasServices: boolean;
  initialLoading: boolean;
  setSalon: (salon: Salon | null) => void;
  updateHasServices: (hasServices: boolean) => void;
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
  const [hasServices, setHasServices] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const loadingRef = useRef(false);
  
  const { user, isAuthenticated } = useAuth();
  const salonSlug = useSalonSlug();
  const isMainDomain = useIsMainDomain();

  // Função para carregar dados iniciais do salão (incluindo has_services)
  const loadInitialData = async (salonId: string) => {
    try {
      const { data, error } = await supabaseService.utilities.getUserContext();
      
      if (error) {
        console.error('❌ Erro ao carregar dados iniciais:', error);
        return;
      }
      
      if (data && data.salons && data.salons.length > 0) {
        const salonData = data.salons.find((salon: any) => salon.id === salonId);
        if (salonData) {
          setHasServices(!!salonData.has_services);
          
          // Atualizar o salão atual com os dados completos
          setCurrentSalon(prev => prev ? {
            ...prev,
            has_services: !!salonData.has_services
          } : null);
        }
      }
    } catch (err) {
      console.error('💥 Erro inesperado ao carregar dados iniciais:', err);
    }
  };

  // Função para buscar salão pelo subdomínio
  const loadSalonBySlug = async (slug: string) => {
    if (loadingRef.current) {
      return;
    }

    setLoading(true);
    setInitialLoading(true);
    setError(null);
    loadingRef.current = true;

    try {
      const response = await salonService.getSalonBySlug(slug);
      
      if (response.success && response.salon) {
        setCurrentSalon(response.salon);
        // Carregar dados iniciais incluindo has_services
        await loadInitialData(response.salon.id);
        // Só marcar como pronto após dados iniciais
        setIsReady(true);
      } else {
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
      setInitialLoading(false);
      loadingRef.current = false;
    }
  };

  // Função para carregar salão do usuário (método antigo, para domínio principal)
  const loadUserSalons = async () => {
    if (loadingRef.current) {
      return;
    }

    if (!user?.id) {
      setLoading(false);
      setInitialLoading(false);
      return;
    }

    setLoading(true);
    setInitialLoading(true);
    setError(null);
    loadingRef.current = true;

    try {
      // Simulação - adapte conforme sua lógica
      const mockSalon = {
        id: 'mock-salon-id',
        name: 'Salão Principal',
        subdomain: 'principal',
        public_profile_photo_url: null,
        public_display_name: null,
        has_services: false
      };
      
      setCurrentSalon(mockSalon);
      setHasServices(!!mockSalon.has_services);
      // Carregar dados iniciais incluindo has_services
      await loadInitialData(mockSalon.id);
      setIsReady(true);
    } catch (err) {
      console.error('💥 Erro ao carregar salões:', err);
      setError('Erro ao carregar dados do salão');
      setCurrentSalon(null);
      setIsReady(false);
    } finally {
      setLoading(false);
      setInitialLoading(false);
      loadingRef.current = false;
    }
  };

  // Carregar dados baseado no contexto
  useEffect(() => {
    if (salonSlug && !isMainDomain) {
      loadSalonBySlug(salonSlug);
    }
    else if (isMainDomain && isAuthenticated && user) {
      loadUserSalons();
    }
    else if (isMainDomain && !isAuthenticated) {
      setLoading(false);
      setIsReady(false);
      setInitialLoading(false);
    }
    else {
      setLoading(false);
      setIsReady(false);
      setInitialLoading(false);
    }
  }, [salonSlug, isMainDomain, isAuthenticated, user?.id]);

  const setSalon = (salon: Salon | null) => {
    setCurrentSalon(salon);
    if (salon) {
      setHasServices(!!salon.has_services);
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  };

  const updateHasServices = (newHasServices: boolean) => {
    setHasServices(newHasServices);
    // Atualizar também no salão atual
    if (currentSalon) {
      setCurrentSalon({
        ...currentSalon,
        has_services: newHasServices
      });
    }
  };

  const value: AppContextType = {
    currentSalon,
    isReady,
    loading,
    error,
    salonSlug,
    isMainDomain,
    hasServices,
    initialLoading,
    setSalon,
    updateHasServices
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}; 