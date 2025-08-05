import React, { useState, useEffect } from 'react';
import Menu from 'lucide-react/dist/esm/icons/menu';

interface FinanceiroHeaderProps {
  currentDate: string;
  onMenuClick?: () => void;
  isMobile?: boolean;
}

export default function FinanceiroHeader({
  currentDate,
  onMenuClick,
  isMobile: isMobileProp
}: FinanceiroHeaderProps) {
  const [internalIsMobile, setInternalIsMobile] = useState(false);
  
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

  return (
    <div className={`flex items-center bg-white border-b border-gray-200 ${isMobile ? 'px-4 py-3' : 'px-6 py-4'}`}>
      {/* Lado esquerdo: Menu mobile + Título */}
      <div className="flex items-center space-x-3">
        {isMobile && (
          <button
            onClick={onMenuClick}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
        )}
        
        <div>
          <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
            Financeiro
          </h1>
          <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {currentDate}
          </p>
        </div>
      </div>
    </div>
  );
}