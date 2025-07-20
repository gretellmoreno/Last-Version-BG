import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
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
      </div>
    </div>
  );
}