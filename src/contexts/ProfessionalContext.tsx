import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Professional } from '../types';
import { supabaseService } from '../lib/supabaseService';
import { useApp } from './AppContext';

interface ProfessionalContextType {
  professionals: Professional[];
  loading: boolean;
  error: string | null;
  addProfessional: (professional: Omit<Professional, 'id' | 'created_at' | 'updated_at' | 'salon_id'>) => Promise<boolean>;
  updateProfessional: (professionalId: string, updates: Partial<Professional>) => Promise<boolean>;
  removeProfessional: (professionalId: string) => Promise<boolean>;
  refreshProfessionals: () => Promise<void>;
}

const ProfessionalContext = createContext<ProfessionalContextType | undefined>(undefined);

export const useProfessional = () => {
  const context = useContext(ProfessionalContext);
  if (!context) {
    throw new Error('useProfessional deve ser usado dentro de um ProfessionalProvider');
  }
  return context;
};

interface ProfessionalProviderProps {
  children: ReactNode;
}

export const ProfessionalProvider: React.FC<ProfessionalProviderProps> = ({ children }) => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentSalon, isReady } = useApp();

  // Carregar profissionais quando o salão estiver pronto
  useEffect(() => {
    if (isReady && currentSalon) {
      loadProfessionals();
    }
  }, [isReady, currentSalon?.id]);

  const loadProfessionals = async () => {
    if (!currentSalon) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Carregando profissionais para o salão:', currentSalon.id);
      const { data, error } = await supabaseService.professionals.list(currentSalon.id);
      
      if (error) {
        console.error('❌ Erro ao carregar profissionais:', error);
        setError(error);
        return;
      }
      
      console.log('✅ Profissionais carregados:', data?.length || 0, 'profissionais encontrados');
      console.log('📋 Dados dos profissionais:', data);
      setProfessionals(data || []);
    } catch (err) {
      console.error('💥 Erro inesperado ao carregar profissionais:', err);
      setError('Erro inesperado ao carregar profissionais');
    } finally {
      setLoading(false);
    }
  };

  const addProfessional = async (professionalData: Omit<Professional, 'id' | 'created_at' | 'updated_at' | 'salon_id'>): Promise<boolean> => {
    if (!currentSalon) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabaseService.professionals.create({
        salonId: currentSalon.id,
        name: professionalData.name,
        role: professionalData.role,
        phone: professionalData.phone,
        email: professionalData.email,
        color: professionalData.color,
        commissionRate: professionalData.commission_rate
      });
      
      if (error) {
        setError(error);
        return false;
      }
      
      if (data?.success && data.professional) {
        // Adicionar o profissional recém-criado diretamente à lista
        setProfessionals(prev => [data.professional, ...prev]);
        return true;
      }
      
      return false;
    } catch (err) {
      setError('Erro inesperado ao criar profissional');
      console.error('Erro ao criar profissional:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProfessional = async (professionalId: string, updates: Partial<Professional>): Promise<boolean> => {
    if (!currentSalon) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabaseService.professionals.update({
        professionalId,
        salonId: currentSalon.id,
        name: updates.name || '',
        role: updates.role || '',
        phone: updates.phone || '',
        email: updates.email || '',
        color: updates.color || '',
        commissionRate: updates.commission_rate || 0,
        active: updates.active !== undefined ? updates.active : true
      });
      
      if (error) {
        setError(error);
        return false;
      }
      
      if (data?.success) {
        await loadProfessionals(); // Recarregar lista
        return true;
      }
      
      return false;
    } catch (err) {
      setError('Erro inesperado ao atualizar profissional');
      console.error('Erro ao atualizar profissional:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeProfessional = async (professionalId: string): Promise<boolean> => {
    if (!currentSalon) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabaseService.professionals.delete(professionalId, currentSalon.id);
      
      if (error) {
        setError(error);
        return false;
      }
      
      if (data?.success) {
        await loadProfessionals(); // Recarregar lista
        return true;
      }
      
      return false;
    } catch (err) {
      setError('Erro inesperado ao remover profissional');
      console.error('Erro ao remover profissional:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfessionals = async () => {
    await loadProfessionals();
  };

  return (
    <ProfessionalContext.Provider value={{
      professionals,
      loading,
      error,
      addProfessional,
      updateProfessional,
      removeProfessional,
      refreshProfessionals
    }}>
      {children}
    </ProfessionalContext.Provider>
  );
};