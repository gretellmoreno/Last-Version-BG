import { useEffect } from 'react';
import { useBookingStore } from '../stores/bookingStore';
import { useApp } from '../contexts/AppContext';

/**
 * Hook personalizado que combina o bookingStore com o contexto do salão
 * Mantém compatibilidade com a API anterior e adiciona carregamento automático
 */
export const useBooking = () => {
  const { currentSalon, isReady } = useApp();
  const {
    agendamentos,
    appointments,
    loading,
    error,
    fetchAppointments,
    addAgendamento: addAgendamentoStore,
    removeAgendamento,
    updateAgendamento,
    refreshAppointments: refreshAppointmentsStore,
    reset
  } = useBookingStore();

  // Carregamento automático quando o salão estiver pronto (uma vez)
  useEffect(() => {
    if (isReady && currentSalon?.id) {
      fetchAppointments(currentSalon.id);
    }
  }, [isReady, currentSalon?.id, fetchAppointments]);

  // Funções que não precisam do salonId (ele é obtido automaticamente)
  const addAgendamento = async (agendamento: Parameters<typeof addAgendamentoStore>[1]) => {
    if (!currentSalon) return false;
    return addAgendamentoStore(currentSalon.id, agendamento);
  };

  const refreshAppointments = async () => {
    if (!currentSalon) return;
    return refreshAppointmentsStore(currentSalon.id);
  };

  return {
    agendamentos,
    appointments,
    loading,
    error,
    addAgendamento,
    removeAgendamento,
    updateAgendamento,
    refreshAppointments,
    reset
  };
}; 