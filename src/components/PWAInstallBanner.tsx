import React from 'react';
import { usePWA } from '../hooks/usePWA';
import Download from 'lucide-react/dist/esm/icons/download';
import X from 'lucide-react/dist/esm/icons/x';

export const PWAInstallBanner: React.FC = () => {
  const { deferredPrompt, isInstalled, installApp } = usePWA();
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Verificar se está em um subdomínio (não no domínio principal)
    const hostname = window.location.hostname;
    const isSubdomain = hostname.includes('.') && hostname.split('.').length > 2;
    
    // Mostrar banner apenas se não estiver instalado, houver prompt disponível e estiver em subdomínio
    if (!isInstalled && deferredPrompt && isSubdomain) {
      setIsVisible(true);
    }
  }, [deferredPrompt, isInstalled]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Download size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Instalar App
            </h3>
            <p className="text-xs text-gray-600">
              Instale o app para acesso rápido e offline
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Instalar
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}; 