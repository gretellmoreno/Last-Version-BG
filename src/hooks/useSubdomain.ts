import { useState, useEffect, useMemo } from 'react';
import { isProduction, getCurrentDomain, getSubdomainPattern } from '../config/environment';

interface SubdomainInfo {
  subdomain: string | null;
  isMainDomain: boolean;
  salonSlug: string | null;
}

export const useSubdomain = (): SubdomainInfo => {
  const [subdomainInfo, setSubdomainInfo] = useState<SubdomainInfo>(() => {
    // Inicializar com valores padrão para evitar re-renders
    const hostname = window.location.hostname;
    console.log('🌐 Inicializando subdomain info:', hostname);

    // Para desenvolvimento local
    if (hostname.includes('localhost')) {
      const parts = hostname.split('.');
      
      // Se for apenas "localhost", é o domínio principal
      if (parts.length === 1 || hostname === 'localhost:5173') {
        console.log('📍 Domínio principal detectado (inicial)');
        return {
          subdomain: null,
          isMainDomain: true,
          salonSlug: null
        };
      }
      
      // Se for "salao-a.localhost", extrair o subdomínio
      if (parts.length >= 2 && parts[1] === 'localhost') {
        const subdomain = parts[0];
        console.log('🏪 Subdomínio do salão detectado (inicial):', subdomain);
        
        return {
          subdomain,
          isMainDomain: false,
          salonSlug: subdomain
        };
      }
    }

    // Para produção - belagestao.com
    if (isProduction()) {
      const parts = hostname.split('.');
      const currentDomain = getCurrentDomain();
      
      // Se for apenas "belagestao.com" ou "www.belagestao.com", é o domínio principal
      if (parts.length === 2 && parts[1] === currentDomain) {
        if (parts[0] === 'www' || parts[0] === 'belagestao') {
          console.log('📍 Domínio principal detectado (produção inicial)');
          return {
            subdomain: null,
            isMainDomain: true,
            salonSlug: null
          };
        }
      }
      
      // Se for "salao-a.belagestao.com", extrair o subdomínio
      if (parts.length >= 3) {
        const subdomain = parts[0];
        // Verificar se não é um subdomínio de sistema
        const systemSubdomains = ['www', 'app', 'api', 'admin', 'staging', 'belagestao'];
        
        if (!systemSubdomains.includes(subdomain)) {
          console.log('🏪 Subdomínio do salão detectado (produção inicial):', subdomain);
          return {
            subdomain,
            isMainDomain: false,
            salonSlug: subdomain
          };
        }
      }
    }

    // Fallback: domínio principal
    console.log('📍 Fallback para domínio principal (inicial)');
    return {
      subdomain: null,
      isMainDomain: true,
      salonSlug: null
    };
  });

  useEffect(() => {
    const getSubdomainInfo = () => {
      const hostname = window.location.hostname;
      console.log('🌐 Detectando subdomínio:', hostname);

      // Para desenvolvimento local
      if (hostname.includes('localhost')) {
        const parts = hostname.split('.');
        
        // Se for apenas "localhost", é o domínio principal
        if (parts.length === 1 || hostname === 'localhost:5173') {
          console.log('📍 Domínio principal detectado');
          return {
            subdomain: null,
            isMainDomain: true,
            salonSlug: null
          };
        }
        
        // Se for "salao-a.localhost", extrair o subdomínio
        if (parts.length >= 2 && parts[1] === 'localhost') {
          const subdomain = parts[0];
          console.log('🏪 Subdomínio do salão detectado:', subdomain);
          
          return {
            subdomain,
            isMainDomain: false,
            salonSlug: subdomain
          };
        }
      }

      // Para produção - belagestao.com
      if (isProduction()) {
        const parts = hostname.split('.');
        const currentDomain = getCurrentDomain();
        
        // Se for apenas "belagestao.com" ou "www.belagestao.com", é o domínio principal
        if (parts.length === 2 && parts[1] === currentDomain) {
          if (parts[0] === 'www' || parts[0] === 'belagestao') {
            console.log('📍 Domínio principal detectado (produção)');
            return {
              subdomain: null,
              isMainDomain: true,
              salonSlug: null
            };
          }
        }
        
        // Se for "salao-a.belagestao.com", extrair o subdomínio
        if (parts.length >= 3) {
          const subdomain = parts[0];
          // Verificar se não é um subdomínio de sistema
          const systemSubdomains = ['www', 'app', 'api', 'admin', 'staging', 'belagestao'];
          
          if (!systemSubdomains.includes(subdomain)) {
            console.log('🏪 Subdomínio do salão detectado (produção):', subdomain);
            return {
              subdomain,
              isMainDomain: false,
              salonSlug: subdomain
            };
          }
        }
      }

      // Fallback: domínio principal
      console.log('📍 Fallback para domínio principal');
      return {
        subdomain: null,
        isMainDomain: true,
        salonSlug: null
      };
    };

    const info = getSubdomainInfo();
    
    // Só atualizar se realmente mudou
    setSubdomainInfo(prevInfo => {
      if (JSON.stringify(prevInfo) !== JSON.stringify(info)) {
        console.log('🔄 Subdomain info mudou:', prevInfo, '->', info);
        return info;
      }
      return prevInfo;
    });

    // Escutar mudanças na URL (caso mude via JavaScript)
    const handleLocationChange = () => {
      const newInfo = getSubdomainInfo();
      setSubdomainInfo(prevInfo => {
        if (JSON.stringify(prevInfo) !== JSON.stringify(newInfo)) {
          console.log('🔄 Subdomain info mudou por navegação:', prevInfo, '->', newInfo);
          return newInfo;
        }
        return prevInfo;
      });
    };

    window.addEventListener('popstate', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  return subdomainInfo;
};

// Hook auxiliar para obter apenas o slug do salão
export const useSalonSlug = (): string | null => {
  return useMemo(() => {
    const hostname = window.location.hostname;
    
    // Se for localhost direto, não tem slug
    if (hostname === 'localhost') {
      return null;
    }
    
    // Se for app.localhost, também não tem slug (é o domínio principal da app)
    if (hostname === 'app.localhost') {
      return null;
    }
    
    // Se for um subdomínio do localhost, extrair o slug
    if (hostname.endsWith('.localhost')) {
      return hostname.replace('.localhost', '');
    }
    
    // Para produção - belagestao.com
    if (isProduction()) {
      const parts = hostname.split('.');
      const currentDomain = getCurrentDomain();
      
      if (parts.length >= 3) {
        const subdomain = parts[0];
        const systemSubdomains = ['www', 'app', 'api', 'admin', 'staging', 'belagestao'];
        
        if (!systemSubdomains.includes(subdomain)) {
          return subdomain;
        }
      }
    }
    
    return null;
  }, []);
};

// Hook auxiliar para verificar se está no domínio principal
export const useIsMainDomain = (): boolean => {
  return useMemo(() => {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === 'belagestao.com' || hostname === 'www.belagestao.com';
  }, []);
};

export const useIsAppDomain = (): boolean => {
  return useMemo(() => {
    const hostname = window.location.hostname;
    
    // Para desenvolvimento
    if (hostname === 'app.localhost') {
      return true;
    }
    
    // Para produção - verificar se é app.belagestao.com ou app.vercel.app
    if (isProduction()) {
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        const subdomain = parts[0];
        return subdomain === 'app';
      }
    }
    
    return false;
  }, []);
}; 