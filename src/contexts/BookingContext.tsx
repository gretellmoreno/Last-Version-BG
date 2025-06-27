import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Agendamento, Appointment } from '../types';
import { supabaseService } from '../lib/supabaseService';
import { useApp } from './AppContext';

interface BookingContextType {
  agendamentos: Agendamento[];
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  addAgendamento: (agendamento: Agendamento) => Promise<boolean>;
  removeAgendamento: (id: string) => void;
  updateAgendamento: (id: string, updates: Partial<Agendamento>) => void;
  refreshAppointments: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentSalon, isReady } = useApp();

  // Carregar agendamentos quando o salão estiver pronto
  useEffect(() => {
    if (isReady && currentSalon) {
      loadAppointments();
    }
  }, [isReady, currentSalon?.id]);

  const loadAppointments = async () => {
    if (!currentSalon) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabaseService.appointments.list({
        salonId: currentSalon.id
      });
      
      if (error) {
        setError(error);
        return;
      }
      
      setAppointments(data || []);
    } catch (err) {
      setError('Erro inesperado ao carregar agendamentos');
      console.error('Erro ao carregar agendamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const addAgendamento = async (agendamento: Agendamento): Promise<boolean> => {
    if (!currentSalon) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      // Primeiro, encontrar ou criar o cliente usando a função RPC
      let clientId = agendamento.clienteId;
      
      if (!clientId || clientId === 'temp' || agendamento.clienteNome !== 'Sem reserva') {
        const { data: clientData, error: clientError } = await supabaseService.clients.findOrCreate({
          salonId: currentSalon.id,
          name: agendamento.clienteNome,
          phone: '', // Telefone não está disponível no tipo Agendamento atual
          email: '' // Email não está disponível no tipo Agendamento atual
        });
        
        if (clientError) {
          setError(clientError);
          return false;
        }
        
        if (!clientData?.client_id) {
          setError('Erro ao obter ID do cliente');
          return false;
        }
        
        clientId = clientData.client_id;
      }

      // Preparar os serviços no formato correto
      const services = agendamento.servicoIds?.map(servicoId => ({
        service_id: servicoId,
        // Campos personalizados não estão disponíveis no tipo atual
        // custom_price: undefined,
        // custom_time: undefined
      })) || [];

      // Criar o agendamento usando a nova função RPC
      const { data, error } = await supabaseService.appointments.create({
        salonId: currentSalon.id,
        clientId: clientId,
        professionalId: agendamento.profissionalId,
        date: agendamento.data,
        startTime: agendamento.horarioInicio,
        services: services,
        notes: agendamento.observacoes
      });
      
      if (error) {
        setError(error);
        return false;
      }
      
      if (data?.success) {
        // Adicionar ao estado local também (para compatibilidade)
        setAgendamentos(prev => [...prev, agendamento]);
        // Recarregar agendamentos do banco
        await loadAppointments();
        return true;
      }
      
      return false;
    } catch (err) {
      setError('Erro inesperado ao criar agendamento');
      console.error('Erro ao criar agendamento:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeAgendamento = (id: string) => {
    setAgendamentos(prev => prev.filter(agendamento => agendamento.id !== id));
  };

  const updateAgendamento = (id: string, updates: Partial<Agendamento>) => {
    setAgendamentos(prev => 
      prev.map(agendamento => 
        agendamento.id === id ? { ...agendamento, ...updates } : agendamento
      )
    );
  };

  const refreshAppointments = async () => {
    await loadAppointments();
  };

  return (
    <BookingContext.Provider value={{
      agendamentos,
      appointments,
      loading,
      error,
      addAgendamento,
      removeAgendamento,
      updateAgendamento,
      refreshAppointments
    }}>
      {children}
    </BookingContext.Provider>
  );
};