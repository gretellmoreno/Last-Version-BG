import { useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';

export const useAppointmentNotifications = () => {
  const { user } = useAuth();
  const { currentSalon } = useApp();

  useEffect(() => {
    if (!user?.id || !currentSalon?.id) return;

    // Inicializar serviço de notificação
    const initializeNotifications = async () => {
      const initialized = await notificationService.initialize();
      
      if (initialized) {
        // Verificar se já tem permissão
        const hasPermission = await notificationService.requestPermission();
        
        if (hasPermission) {
          // Subscrever para push notifications
          await notificationService.subscribeToPush(user.id, currentSalon.id);
        }
      }
    };

    initializeNotifications();
  }, [user?.id, currentSalon?.id]);

  const sendTestNotification = async () => {
    if (!user?.id) return;

    const testAppointment = {
      id: 'test-123',
      client_name: 'Cliente Teste',
      service_name: 'Corte Feminino',
      salon_id: currentSalon?.id
    };

    await notificationService.sendAppointmentNotification(testAppointment);
  };

  return {
    sendTestNotification
  };
}; 