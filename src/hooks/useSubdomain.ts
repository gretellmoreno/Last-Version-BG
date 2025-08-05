import { useState, useEffect, useMemo } from 'react';

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

    // Para produção (quando implementar)
    // Exemplo: salao-a.belagestao.com
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      const subdomain = parts[0];
      // Verificar se não é um subdomínio de sistema (www, app, api, etc.)
      const systemSubdomains = ['www', 'app', 'api', 'admin', 'staging'];
      
      if (!systemSubdomains.includes(subdomain)) {
        console.log('🏪 Subdomínio do salão detectado (produção inicial):', subdomain);
        return {
          subdomain,
          isMainDomain: false,
          salonSlug: subdomain
        };
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

      // Para produção (quando implementar)
      // Exemplo: salao-a.belagestao.com
      const parts = hostname.split('.');
      if (parts.length >= 3) {
        const subdomain = parts[0];
        // Verificar se não é um subdomínio de sistema (www, app, api, etc.)
        const systemSubdomains = ['www', 'app', 'api', 'admin', 'staging'];
        
        if (!systemSubdomains.includes(subdomain)) {
          console.log('🏪 Subdomínio do salão detectado (produção):', subdomain);
          return {
            subdomain,
            isMainDomain: false,
            salonSlug: subdomain
          };
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
    
    return null;
  }, []);
};

// Hook auxiliar para verificar se está no domínio principal
export const useIsMainDomain = (): boolean => {
  return useMemo(() => {
    const hostname = window.location.hostname;
    return hostname === 'localhost';
  }, []);
};

export const useIsAppDomain = (): boolean => {
  return useMemo(() => {
    const hostname = window.location.hostname;
    return hostname === 'app.localhost';
  }, []);
}; 