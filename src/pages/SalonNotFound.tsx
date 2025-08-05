import React from 'react';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import Home from 'lucide-react/dist/esm/icons/home';
import { useSalonSlug } from '../hooks/useSubdomain';

export default function SalonNotFound() {
  const salonSlug = useSalonSlug();

  const handleGoHome = () => {
    window.location.href = 'https://belagestao.com';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Ícone de erro */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Salão não encontrado
        </h1>

        {/* Mensagem */}
        <div className="space-y-4 mb-8">
          <p className="text-gray-600">
            O salão <span className="font-semibold text-gray-900">"{salonSlug}"</span> não foi encontrado ou não está ativo.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="font-medium mb-2">Possíveis causas:</p>
            <ul className="text-left space-y-1">
              <li>• URL digitada incorretamente</li>
              <li>• Salão desativado temporariamente</li>
              <li>• Subdomínio não configurado</li>
            </ul>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="space-y-3">
          <button
            onClick={handleGoHome}
            className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Home className="w-5 h-5 mr-2" />
            Ir para página principal
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Tentar novamente
          </button>
        </div>

        {/* Informações de contato */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Precisa de ajuda? Entre em contato conosco
          </p>
        </div>
      </div>
    </div>
  );
} 