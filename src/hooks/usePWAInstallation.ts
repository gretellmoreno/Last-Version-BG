import { useState, useEffect } from 'react';

export const usePWAInstallation = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verificar se está em modo standalone (PWA instalado)
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInStandaloneMode = (window.navigator as any).standalone === true;
      
      console.log('🔍 PWA Detection:', {
        standalone,
        isInStandaloneMode,
        hostname: window.location.hostname,
        port: window.location.port
      });
      
      setIsStandalone(standalone || isInStandaloneMode);
      setIsInstalled(standalone || isInStandaloneMode);
    };

    // Verificar se está em modo standalone no carregamento
    checkStandalone();

    // Listener para mudanças no display mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      console.log('🔄 Display mode changed:', e.matches);
      setIsStandalone(e.matches);
      setIsInstalled(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const shouldShowLandingPage = !isInstalled && !isStandalone;
  
  console.log('🎯 Landing Page Logic:', {
    isInstalled,
    isStandalone,
    shouldShowLandingPage
  });

  return {
    isInstalled,
    isStandalone,
    shouldShowLandingPage
  };
}; 