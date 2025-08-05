import React from 'react';

interface PhoneMockupProps {
  previewUrl: string;
  isLoading?: boolean;
  previewKey?: number;
}

export default function PhoneMockup({ previewUrl, isLoading = false, previewKey = 0 }: PhoneMockupProps) {
  return (
    <div className="relative mx-auto">
      {/* iPhone 16 Mockup - Otimizado */}
      <div className="relative">
        {/* Phone Frame */}
        <div className="w-[280px] h-[600px] bg-black rounded-[40px] p-2 shadow-2xl transform transition-all duration-300 hover:scale-105">
          {/* Screen */}
          <div className="w-full h-full bg-white rounded-[32px] overflow-hidden relative">
            {/* Dynamic Island */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-[100px] h-[24px] bg-black rounded-full z-10"></div>
            
            {/* Screen Content - Totalmente responsivo */}
            <div className="w-full h-full relative overflow-hidden">
              {/* Indicador de atualização */}
              {previewKey > 0 && (
                <div className="absolute top-2 right-2 z-20">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}
              
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="preview-iframe"
                  title="Pré-visualização do Agendamento"
                  key={`preview-${previewKey}`}
                  sandbox="allow-same-origin allow-scripts allow-forms"
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={false}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-gray-400 text-2xl">📱</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Link Inativo</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Ative o link de agendamento para ver a pré-visualização
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Phone Shadow */}
        <div className="absolute inset-0 bg-black rounded-[40px] blur-lg opacity-20 scale-105 -z-10"></div>
      </div>
      
      {/* Label */}
      <div className="text-center mt-4">
        <p className="text-sm font-medium text-gray-700">Pré-visualização</p>
        <p className="text-xs text-gray-500">Como o cliente vê</p>
      </div>
    </div>
  );
} 