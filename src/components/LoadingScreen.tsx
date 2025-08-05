import React, { useState, useEffect } from 'react';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';

export default function LoadingScreen() {
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    // Mostrar debug após 5 segundos
    const timeout = setTimeout(() => {
      setShowDebug(true);
      
      // Coletar informações de debug
      const info = {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        localStorage: Object.keys(localStorage).length,
        sessionStorage: Object.keys(sessionStorage).length,
      };
      setDebugInfo(info);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="text-center">
        {/* Logo */}
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
          <span className="text-white font-bold text-3xl">S</span>
        </div>
        
        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">BelaGestão</h1>
        
        {/* Loading */}
        <div className="flex items-center justify-center space-x-2 text-indigo-600">
          <Loader2 className="animate-spin h-5 w-5" />
          <span className="text-sm font-medium">Carregando...</span>
        </div>
        
        {/* Barra de progresso animada */}
        <div className="w-48 h-1 bg-gray-200 rounded-full mt-4 mx-auto overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full animate-pulse"></div>
        </div>

        {/* Debug Info */}
        {showDebug && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg max-w-md mx-auto text-left">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Debug Info:</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div><strong>URL:</strong> {debugInfo.url}</div>
              <div><strong>Timestamp:</strong> {debugInfo.timestamp}</div>
              <div><strong>LocalStorage:</strong> {debugInfo.localStorage} items</div>
              <div><strong>SessionStorage:</strong> {debugInfo.sessionStorage} items</div>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-3 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
            >
              Recarregar Página
            </button>
          </div>
        )}
      </div>
    </div>
  );
}