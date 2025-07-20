import { create } from 'zustand';
import { Agendamento, Appointment } from '../types';
import { supabaseService } from '../lib/supabaseService';

interface BookingState {
  agendamentos: Agendamento[];
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchAppointments: (salonId: string) => Promise<void>;
  addAgendamento: (salonId: string, agendamento: Agendamento) => Promise<boolean>;
  removeAgendamento: (id: string) => void;
  updateAgendamento: (id: string, updates: Partial<Agendamento>) => void;
  refreshAppointments: (salonId: string) => Promise<void>;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  agendamentos: [],
  appointments: [],
  loading: false,
  error: null,

  fetchAppointments: async (salonId: string) => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabaseService.appointments.list({
        salonId
      });
      
      if (error) {
        set({ error, loading: false });
        return;
      }
      
      set({ appointments: data || [], loading: false });
    } catch (err) {
      set({ error: 'Erro inesperado ao carregar agendamentos', loading: false });
      console.error('Erro ao carregar agendamentos:', err);
    }
  },

  addAgendamento: async (salonId: string, agendamento: Agendamento): Promise<boolean> => {
    set({ loading: true, error: null });
    
    try {
      // Primeiro, encontrar ou criar o cliente usando a função RPC
      let clientId = agendamento.clienteId;
      
      if (!clientId || clientId === 'temp' || agendamento.clienteNome !== 'Sem reserva') {
        const { data: clientData, error: clientError } = await supabaseService.clients.findOrCreate({
          salonId,
          name: agendamento.clienteNome,
          phone: '', // Telefone não está disponível no tipo Agendamento atual
          email: '' // Email não está disponível no tipo Agendamento atual
        });
        
        if (clientError) {
          set({ error: clientError, loading: false });
          return false;
        }
        
        if (!clientData?.client_id) {
          set({ error: 'Erro ao obter ID do cliente', loading: false });
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
        salonId,
        clientId: clientId,
        professionalId: agendamento.profissionalId,
        date: agendamento.data,
        startTime: agendamento.horarioInicio,
        services: services,
        notes: agendamento.observacoes
      });
      
      if (error) {
        set({ error, loading: false });
        return false;
      }
      
      if (data?.success) {
        // Adicionar ao estado local também (para compatibilidade)
        set(state => ({
          agendamentos: [...state.agendamentos, agendamento],
          loading: false
        }));
        
        // Recarregar agendamentos do banco
        await get().fetchAppointments(salonId);
        return true;
      }
      
      set({ loading: false });
      return false;
    } catch (err) {
      set({ error: 'Erro inesperado ao criar agendamento', loading: false });
      console.error('Erro ao criar agendamento:', err);
      return false;
    }
  },

  removeAgendamento: (id: string) => {
    set(state => ({
      agendamentos: state.agendamentos.filter(agendamento => agendamento.id !== id)
    }));
  },

  updateAgendamento: (id: string, updates: Partial<Agendamento>) => {
    set(state => ({
      agendamentos: state.agendamentos.map(agendamento => 
        agendamento.id === id ? { ...agendamento, ...updates } : agendamento
      )
    }));
  },

  refreshAppointments: async (salonId: string) => {
    await get().fetchAppointments(salonId);
  },

  reset: () => {
    set({
      agendamentos: [],
      appointments: [],
      loading: false,
      error: null
    });
  }
})); 