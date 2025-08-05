import { useEffect } from 'react';
import { updateManifest } from '../services/manifestService';

export const useSubdomainManifest = () => {
  useEffect(() => {
    const hostname = window.location.hostname;
    
    // Extrair subdomínio se existir
    let subdomain: string | undefined;
    
    if (hostname.includes('.')) {
      const parts = hostname.split('.');
      if (parts.length > 2) {
        // Tem subdomínio (ex: salon.belagestao.com)
        subdomain = parts[0];
      }
    }
    
    // Atualizar manifest baseado no subdomínio
    updateManifest(subdomain);
    
    console.log('Manifest atualizado para subdomínio:', subdomain || 'domínio principal');
  }, []);
}; 