import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Professional } from '../types';
import { supabaseService } from '../lib/supabaseService';
import { supabase } from '../lib/supabase';
import { useApp } from './AppContext';

interface ProfessionalContextType {
  professionals: Professional[];
  loading: boolean;
  error: string | null;
  addProfessional: (professional: Omit<Professional, 'id' | 'created_at' | 'updated_at' | 'salon_id'> & { url_foto?: string | null }) => Promise<boolean>;
  updateProfessional: (professionalId: string, updates: Partial<Professional>) => Promise<boolean>;
  removeProfessional: (professionalId: string) => Promise<boolean>;
  refreshProfessionals: () => Promise<void>;
  setProfessionals: React.Dispatch<React.SetStateAction<Professional[]>>;
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

  const addProfessional = async (professionalData: Omit<Professional, 'id' | 'created_at' | 'updated_at' | 'salon_id'> & { url_foto?: string | null }): Promise<boolean> => {
    if (!currentSalon) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🚀 Iniciando criação de funcionário via Edge Function...');
      console.log('📋 Dados enviados:', {
        salon_id: currentSalon.id,
        email: professionalData.email,
        name: professionalData.name,
        role: professionalData.role,
        phone: professionalData.phone,
        color: professionalData.color,
        commission_rate: professionalData.commission_rate
      });

      // Usar fetch para chamar a Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('❌ Variáveis de ambiente não configuradas');
        setError('Erro de configuração do sistema');
        return false;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/criar-funcionario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          salon_id: currentSalon.id,
          email: professionalData.email,
          name: professionalData.name,
          role: professionalData.role,
          phone: professionalData.phone,
          color: professionalData.color,
          commission_rate: professionalData.commission_rate,
          url_foto: professionalData.url_foto || null
        })
      });

      console.log('📦 Status da resposta:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro HTTP:', response.status, errorText);
        setError(`Erro na requisição: ${response.status}`);
        return false;
      }

      const data = await response.json();
      console.log('📦 Resposta da Edge Function:', data);
      
      if (data?.success) {
        console.log('✅ Funcionário criado com sucesso! userId:', data.userId);
        // Recarregar a lista de profissionais para incluir o novo
        await loadProfessionals();
        return true;
      } else {
        console.error('❌ Falha na criação do funcionário:', data?.message);
        setError(data?.message || 'Falha na criação do funcionário');
        return false;
      }
      
    } catch (err) {
      console.error('💥 Erro inesperado na Edge Function:', err);
      setError('Erro inesperado ao criar funcionário');
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
        active: updates.active !== undefined ? updates.active : true,
        url_foto: updates.url_foto || undefined
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
      console.log('🗑️ ProfessionalContext - Iniciando remoção do profissional:', professionalId);
      
      const { data, error } = await supabaseService.professionals.delete(professionalId, currentSalon.id);
      
      if (error) {
        console.error('❌ ProfessionalContext - Erro ao deletar:', error);
        setError(error);
        return false;
      }
      
      console.log('📦 ProfessionalContext - Resposta da deleção:', data);
      
      if (data?.success) {
        console.log('✅ ProfessionalContext - Profissional removido com sucesso');
        await loadProfessionals(); // Recarregar lista
        return true;
      } else {
        console.error('❌ ProfessionalContext - Deleção falhou:', data);
        const errorMessage = data?.message || 'Falha ao remover profissional';
        setError(errorMessage);
        return false;
      }
    } catch (err) {
      console.error('💥 ProfessionalContext - Erro inesperado:', err);
      setError('Erro inesperado ao remover profissional');
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
      refreshProfessionals,
      setProfessionals
    }}>
      {children}
    </ProfessionalContext.Provider>
  );
};