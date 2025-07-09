import React, { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import HistoricoSection from '../components/financeiro/HistoricoSection';
import { useFinanceiro } from '../contexts/FinanceiroContext';

export default function Financeiro({ onToggleMobileSidebar, isMobile: isMobileProp }: { onToggleMobileSidebar?: () => void; isMobile?: boolean } = {}) {
  const [internalIsMobile, setInternalIsMobile] = useState(false);
  
  const { historicoFechamentos } = useFinanceiro();

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setInternalIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isMobile = isMobileProp !== undefined ? isMobileProp : internalIsMobile;

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleMenuClick = () => {
    if (onToggleMobileSidebar) {
      onToggleMobileSidebar();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className={`flex items-center justify-between ${isMobile ? 'px-4 py-3' : 'px-6 py-4'}`}>
          {/* Lado esquerdo: Menu mobile + Título */}
          <div className="flex items-center space-x-3">
            {isMobile && (
              <button
                onClick={handleMenuClick}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            
            <div className="flex items-center space-x-2">
              <History className="text-amber-600" size={24} />
              <div>
                <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                  Histórico Financeiro
                </h1>
                <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {getCurrentDate()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 overflow-hidden">
        {/* Content com Scroll */}
        <div className="h-[calc(100vh-100px)] overflow-y-auto scrollbar-thin md:h-auto md:overflow-visible">
          <div className="p-4 md:p-6">
            <HistoricoSection 
              currentDate={getCurrentDate()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}