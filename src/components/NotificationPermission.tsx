import React, { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle, X } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import toast from 'react-hot-toast';

interface NotificationPermissionProps {
  onClose?: () => void;
}

export const NotificationPermission: React.FC<NotificationPermissionProps> = ({ onClose }) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();
  const { currentSalon } = useApp();

  useEffect(() => {
    // Verificar se está em um subdomínio (não no domínio principal)
    const hostname = window.location.hostname;
    const isSubdomain = hostname.includes('.') && hostname.split('.').length > 2;
    
    // Só mostrar se estiver em subdomínio
    if (!isSubdomain) {
      return;
    }

    checkPermission();
    initializeService();
  }, []);

  const initializeService = async () => {
    const success = await notificationService.initialize();
    setIsInitialized(success);
    
    if (success && permission === 'default') {
      setIsVisible(true);
    }
  };

  const checkPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  const requestPermission = async () => {
    if (!isInitialized) {
      toast.error('Serviço de notificação não inicializado');
      return;
    }

    if (!user?.id || !currentSalon?.id) {
      toast.error('Usuário ou salão não encontrado');
      return;
    }

    setIsSubscribing(true);

    try {
      const granted = await notificationService.requestPermission();
      
      if (granted) {
        const endpoint = await notificationService.subscribeToPush(user.id, currentSalon.id);
        
        if (endpoint) {
          toast.success('Notificações ativadas com sucesso!');
          setPermission('granted');
          setIsVisible(false);
          onClose?.();
        } else {
          toast.error('Erro ao ativar notificações');
        }
      } else {
        toast.error('Permissão de notificação negada');
        setPermission('denied');
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Erro ao ativar notificações:', error);
      toast.error('Erro ao ativar notificações');
    } finally {
      setIsSubscribing(false);
    }
  };

  const unsubscribe = async () => {
    if (!user?.id) return;

    try {
      await notificationService.unsubscribeFromPush(user.id);
      toast.success('Notificações desativadas');
      setPermission('denied');
      setIsVisible(false);
    } catch (error) {
      console.error('Erro ao desativar notificações:', error);
      toast.error('Erro ao desativar notificações');
    }
  };

  if (!isVisible) {
    return null;
  }

  if (permission === 'granted') {
    return (
      <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-start space-x-3">
          <CheckCircle size={20} className="text-green-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-900">
              Notificações Ativas
            </h3>
            <p className="text-xs text-green-700 mt-1">
              Você receberá notificações sobre novos agendamentos
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-green-600 hover:text-green-800"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-start space-x-3">
          <BellOff size={20} className="text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-900">
              Notificações Bloqueadas
            </h3>
            <p className="text-xs text-red-700 mt-1">
              Para receber notificações, permita no navegador
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-red-600 hover:text-red-800"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex items-start space-x-3">
        <Bell size={20} className="text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900">
            Ativar Notificações
          </h3>
          <p className="text-xs text-blue-700 mt-1 mb-3">
            Receba notificações instantâneas sobre novos agendamentos
          </p>
          <div className="flex space-x-2">
            <button
              onClick={requestPermission}
              disabled={isSubscribing}
              className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubscribing ? 'Ativando...' : 'Ativar'}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-blue-600 hover:text-blue-800 text-xs"
            >
              Depois
            </button>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-blue-600 hover:text-blue-800"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}; 