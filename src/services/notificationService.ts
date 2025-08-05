import { supabase } from '../lib/supabase';

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

class NotificationService {
  private registration: ServiceWorkerRegistration | null = null;

  async initialize() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications não são suportadas');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
      return true;
    } catch (error) {
      console.error('Erro ao inicializar service worker:', error);
      return false;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Este navegador não suporta notificações');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('Permissão de notificação negada');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async subscribeToPush(userId: string, salonId: string): Promise<string | null> {
    if (!this.registration) {
      console.error('Service worker não inicializado');
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.VITE_VAPID_PUBLIC_KEY || '')
      });

      // Salvar subscription no banco
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          salon_id: salonId,
          subscription: subscription,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao salvar subscription:', error);
        return null;
      }

      return subscription.endpoint;
    } catch (error) {
      console.error('Erro ao subscrever push:', error);
      return null;
    }
  }

  async unsubscribeFromPush(userId: string): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remover do banco
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId);

      return true;
    } catch (error) {
      console.error('Erro ao cancelar subscription:', error);
      return false;
    }
  }

  async sendNotification(payload: NotificationPayload): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      await this.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/icon-72x72.png',
        data: payload.data || {},
        actions: payload.actions || [],
        requireInteraction: true,
        tag: 'appointment-notification'
      });
      return true;
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      return false;
    }
  }

  async sendAppointmentNotification(appointment: any): Promise<boolean> {
    const payload: NotificationPayload = {
      title: 'Novo Agendamento! 📅',
      body: `Novo agendamento para ${appointment.client_name} - ${appointment.service_name}`,
      data: {
        type: 'appointment',
        appointment_id: appointment.id,
        salon_id: appointment.salon_id
      },
      actions: [
        {
          action: 'view',
          title: 'Ver Detalhes',
          icon: '/icons/icon-72x72.png'
        },
        {
          action: 'dismiss',
          title: 'Fechar',
          icon: '/icons/icon-72x72.png'
        }
      ]
    };

    return this.sendNotification(payload);
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const notificationService = new NotificationService(); 