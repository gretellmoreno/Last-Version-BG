import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Service } from '../types';
import { supabaseService } from '../lib/supabaseService';
import { useApp } from './AppContext';

interface ServiceContextType {
  services: Service[];
  loading: boolean;
  error: string | null;
  addService: (service: Omit<Service, 'id' | 'created_at' | 'updated_at' | 'salon_id'>) => Promise<boolean>;
  updateService: (serviceId: string, updates: Partial<Service>) => Promise<boolean>;
  removeService: (serviceId: string) => Promise<boolean>;
  refreshServices: () => Promise<void>;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const useService = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useService must be used within a ServiceProvider');
  }
  return context;
};

interface ServiceProviderProps {
  children: ReactNode;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children }) => {
  const { currentSalon, isReady } = useApp();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshServices = async () => {
    if (!currentSalon) return;
    setLoading(true);
    setError(null);
    
    const result = await supabaseService.services.list(currentSalon.id);
    
    if (result.error) {
      setError(result.error);
    } else {
      setServices(result.data || []);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (isReady && currentSalon) {
      refreshServices();
    }
  }, [isReady, currentSalon?.id]);

  const addService = async (service: Omit<Service, 'id' | 'created_at' | 'updated_at' | 'salon_id'>) => {
    if (!currentSalon) return false;
    
    const result = await supabaseService.services.create({
      salonId: currentSalon.id,
      name: service.name,
      price: service.price,
      estimatedTime: service.estimated_time,
      commissionRate: service.commission_rate,
      description: service.description,
      active: service.active
    });

    if (result.error) {
      setError(result.error);
      return false;
    }

    if (result.data?.success && result.data.service) {
      // Adicionar o serviço recém-criado diretamente à lista
      setServices(prev => [result.data.service, ...prev]);
      return true;
    }

    return false;
  };

  const updateService = async (serviceId: string, updates: Partial<Service>) => {
    if (!currentSalon) return false;
    
    const result = await supabaseService.services.update({
      serviceId,
      salonId: currentSalon.id,
      name: updates.name || '',
      price: updates.price || 0,
      commissionRate: updates.commission_rate || 0,
      estimatedTime: updates.estimated_time || 0,
      active: updates.active !== undefined ? updates.active : true,
      description: updates.description
    });

    if (result.error) {
      setError(result.error);
      return false;
    }

    await refreshServices();
    return true;
  };

  const removeService = async (serviceId: string) => {
    if (!currentSalon) return false;
    
    // Como não existe função de delete no serviceService, vamos apenas atualizar para inativo
    const result = await supabaseService.services.update({
      serviceId,
      salonId: currentSalon.id,
      name: '',
      price: 0,
      commissionRate: 0,
      estimatedTime: 0,
      active: false
    });

    if (result.error) {
      setError(result.error);
      return false;
    }

    await refreshServices();
    return true;
  };

  return (
    <ServiceContext.Provider value={{
      services,
      loading,
      error,
      addService,
      updateService,
      removeService,
      refreshServices
    }}>
      {children}
    </ServiceContext.Provider>
  );
};