import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabaseService } from '../lib/supabaseService';
import { useApp } from './AppContext';
import { LinkAgendamentoConfig } from '../types';

interface LinkAgendamentoContextData {
  config: LinkAgendamentoConfig | null;
  loading: boolean;
  error: string | null;
  saveConfig: (config: LinkAgendamentoConfig) => Promise<boolean>;
}

const LinkAgendamentoContext = createContext<LinkAgendamentoContextData>({} as LinkAgendamentoContextData);

export function LinkAgendamentoProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<LinkAgendamentoConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentSalon, isReady } = useApp();

  useEffect(() => {
    const loadConfig = async () => {
      if (!currentSalon?.id || !isReady) return;

      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabaseService.linkAgendamento.getConfig(currentSalon.id);
        
        if (error) {
          setError(error);
          return;
        }

        if (data) {
          setConfig(data);
        } else {
          // Configuração padrão se não existir
          setConfig({
            corPrimaria: '#6366F1',
            corSecundaria: '#4F46E5',
            logotipo: '',
            mensagemBoasVindas: 'Bem-vindo ao nosso sistema de agendamento!',
            mostrarPrecos: true,
            mostrarDuracaoServicos: true,
          });
        }
      } catch (err) {
        setError('Erro ao carregar configurações do link');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [currentSalon?.id, isReady]);

  const saveConfig = async (newConfig: LinkAgendamentoConfig): Promise<boolean> => {
    if (!currentSalon?.id) return false;

    try {
      setLoading(true);
      setError(null);
      const { error } = await supabaseService.linkAgendamento.saveConfig(currentSalon.id, newConfig);
      
      if (error) {
        setError(error);
        return false;
      }

      setConfig(newConfig);
      return true;
    } catch (err) {
      setError('Erro ao salvar configurações do link');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinkAgendamentoContext.Provider value={{
      config,
      loading,
      error,
      saveConfig,
    }}>
      {children}
    </LinkAgendamentoContext.Provider>
  );
}

export function useLinkAgendamento() {
  const context = useContext(LinkAgendamentoContext);
  if (!context) {
    throw new Error('useLinkAgendamento must be used within a LinkAgendamentoProvider');
  }
  return context;
} 