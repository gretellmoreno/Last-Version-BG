import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client } from '../types';
import { supabaseService } from '../lib/supabaseService';
import { useApp } from './AppContext';

interface ClientContextType {
  clients: Client[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  addClient: (client: Omit<Client, 'id' | 'created_at'>) => Promise<boolean>;
  updateClient: (clientId: string, updates: Partial<Client>) => Promise<boolean>;
  removeClient: (clientId: string) => Promise<boolean>;
  refreshClients: () => Promise<void>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const useClient = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient deve ser usado dentro de um ClientProvider');
  }
  return context;
};

interface ClientProviderProps {
  children: ReactNode;
}

export const ClientProvider: React.FC<ClientProviderProps> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentSalon, isReady } = useApp();

  // Clientes de exemplo para quando não há dados do Supabase
  const exampleClients: Client[] = [
    {
      id: 'example-1',
      salon_id: 'example',
      name: 'Maria Silva',
      phone: '(11) 99999-1111',
      email: 'maria@email.com',
      cpf: '123.456.789-01',
      birth_date: '1990-01-01',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'example-2',
      salon_id: 'example',
      name: 'Ana Santos',
      phone: '(11) 99999-2222',
      email: 'ana@email.com',
      cpf: '987.654.321-01',
      birth_date: '1985-05-15',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'example-3',
      salon_id: 'example',
      name: 'João Oliveira',
      phone: '(11) 99999-3333',
      email: 'joao@email.com',
      cpf: '456.789.123-01',
      birth_date: '1992-08-20',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Carregar clientes quando o salão estiver pronto
  useEffect(() => {
    if (isReady && currentSalon) {
      loadClients();
    } else if (isReady && !currentSalon) {
      // Se não há salão configurado, usar clientes de exemplo
      setClients(exampleClients);
    }
  }, [isReady, currentSalon?.id, searchTerm]);

  const loadClients = async () => {
    if (!currentSalon) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabaseService.clients.list(
        currentSalon.id,
        searchTerm || undefined
      );
      
      if (error) {
        console.warn('Erro ao carregar clientes do Supabase, usando clientes de exemplo:', error);
        setClients(exampleClients);
        return;
      }
      
      // Se não há dados ou lista vazia, usar clientes de exemplo
      if (!data || data.length === 0) {
        setClients(exampleClients);
      } else {
        setClients(data);
      }
    } catch (err) {
      console.warn('Erro inesperado ao carregar clientes, usando clientes de exemplo:', err);
      setClients(exampleClients);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (clientData: Omit<Client, 'id' | 'created_at'>): Promise<boolean> => {
    if (!currentSalon) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabaseService.clients.create({
        salonId: currentSalon.id,
        name: clientData.name,
        phone: clientData.phone,
        email: clientData.email,
        cpf: clientData.cpf,
        birthDate: clientData.birth_date
      });
      
      if (error) {
        setError(error);
        return false;
      }
      
      if (data?.success && data.client) {
        // Adicionar o cliente recém-criado diretamente à lista
        setClients(prev => [data.client, ...prev]);
        return true;
      }
      
      return false;
    } catch (err) {
      setError('Erro inesperado ao criar cliente');
      console.error('Erro ao criar cliente:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateClient = async (clientId: string, updates: Partial<Client>): Promise<boolean> => {
    if (!currentSalon) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabaseService.clients.update({
        clientId,
        salonId: currentSalon.id,
        name: updates.name || '',
        phone: updates.phone || '',
        email: updates.email || '',
        cpf: updates.cpf || '',
        birthDate: updates.birth_date || ''
      });
      
      if (error) {
        setError(error);
        return false;
      }
      
      if (data?.success) {
        await loadClients(); // Recarregar lista
        return true;
      }
      
      return false;
    } catch (err) {
      setError('Erro inesperado ao atualizar cliente');
      console.error('Erro ao atualizar cliente:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeClient = async (clientId: string): Promise<boolean> => {
    if (!currentSalon) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabaseService.clients.delete(clientId, currentSalon.id);
      
      if (error) {
        setError(error);
        return false;
      }
      
      if (data?.success) {
        await loadClients(); // Recarregar lista
        return true;
      }
      
      return false;
    } catch (err) {
      setError('Erro inesperado ao remover cliente');
      console.error('Erro ao remover cliente:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshClients = async () => {
    await loadClients();
  };

  return (
    <ClientContext.Provider value={{
      clients,
      loading,
      error,
      searchTerm,
      setSearchTerm,
      addClient,
      updateClient,
      removeClient,
      refreshClients
    }}>
      {children}
    </ClientContext.Provider>
  );
};