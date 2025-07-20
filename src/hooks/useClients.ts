import { useClient } from '../contexts/ClientContext';

/**
 * Hook personalizado que re-exporta o ClientContext
 * Mantém compatibilidade com a API anterior
 */
export const useClients = () => {
  return useClient();
}; 