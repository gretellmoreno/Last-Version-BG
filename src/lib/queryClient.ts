import { QueryClient } from '@tanstack/react-query';

// Configuração do QueryClient com configurações otimizadas para salão de beleza
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos por padrão
      staleTime: 5 * 60 * 1000,
      // Manter cache por 10 minutos
      gcTime: 10 * 60 * 1000,
      // Não revalidar quando a janela ganha foco (para evitar muitas chamadas)
      refetchOnWindowFocus: false,
      // Revalidar quando reconectar à internet
      refetchOnReconnect: true,
      // Retry failed requests 2 times
      retry: (failureCount, error: any) => {
        // Não tentar novamente para erros 404 ou 403
        if (error?.status === 404 || error?.status === 403) {
          return false;
        }
        // Para outros erros, tentar até 2 vezes
        return failureCount < 2;
      },
      // Delay entre retries (exponential backoff)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry mutations apenas 1 vez
      retry: 1,
    },
  },
});

// Configurações específicas por tipo de dados
export const queryKeys = {
  // Agendamentos
  appointments: (salonId: string) => ['appointments', salonId] as const,
  appointmentDetails: (appointmentId: string, salonId: string) => 
    ['appointments', salonId, 'details', appointmentId] as const,
  
  // Clientes
  clients: (salonId: string, searchTerm?: string) => 
    ['clients', salonId, ...(searchTerm ? [searchTerm] : [])] as const,
  
  // Profissionais
  professionals: (salonId: string) => ['professionals', salonId] as const,
  
  // Serviços
  services: (salonId: string) => ['services', salonId] as const,
  
  // Produtos
  products: (salonId: string) => ['products', salonId] as const,
  
  // Métodos de pagamento
  paymentMethods: (salonId: string) => ['paymentMethods', salonId] as const,
  
  // Dados financeiros
  finance: {
    vales: (salonId: string) => ['finance', 'vales', salonId] as const,
    summary: (salonId: string, period: string) => ['finance', 'summary', salonId, period] as const,
    cashClosures: (salonId: string) => ['finance', 'cashClosures', salonId] as const,
  },
  
  // Configurações do usuário
  userContext: () => ['userContext'] as const,
} as const;

// Tempos de cache específicos
export const cacheConfig = {
  // Dados que mudam frequentemente (1 minuto)
  realtime: {
    staleTime: 1 * 60 * 1000,
    gcTime: 2 * 60 * 1000,
  },
  
  // Dados que mudam moderadamente (5 minutos) - padrão
  moderate: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },
  
  // Dados que mudam raramente (15 minutos)
  stable: {
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  },
  
  // Dados estáticos (1 hora)
  static: {
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  },
} as const; 