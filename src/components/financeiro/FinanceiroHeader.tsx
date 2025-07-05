import React, { useState, useEffect, useRef } from 'react';
import { Menu, MoreVertical, ChevronDown } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
}

interface FinanceiroHeaderProps {
  menuItems: MenuItem[];
  activeSection: string;
  onSectionChange: (section: string) => void;
  currentDate: string;
  onMenuClick?: () => void;
  isMobile?: boolean;
}

export default function FinanceiroHeader({
  menuItems,
  activeSection,
  onSectionChange,
  currentDate,
  onMenuClick,
  isMobile: isMobileProp
}: FinanceiroHeaderProps) {
  const [internalIsMobile, setInternalIsMobile] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
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

  // Filtrar apenas Histórico e Taxas
  const filteredMenuItems = menuItems.filter(item => 
    item.id === 'historico' || item.id === 'taxas'
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleItemClick = (itemId: string) => {
    onSectionChange(itemId);
    setIsDropdownOpen(false);
  };

  const getActiveItem = () => {
    return filteredMenuItems.find(item => item.id === activeSection) || filteredMenuItems[0];
  };

  const activeItem = getActiveItem();

  return (
    <div className={`flex items-center justify-between bg-white border-b border-gray-200 ${isMobile ? 'px-4 py-3' : 'px-6 py-4'}`}>
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

      {/* Lado direito: Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`flex items-center space-x-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'}`}
        >
          {activeItem && <activeItem.icon size={isMobile ? 14 : 16} />}
          <span className="font-medium">{activeItem?.name}</span>
          <ChevronDown 
            size={isMobile ? 14 : 16} 
            className={`transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className={`absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200 ${isMobile ? 'w-56' : 'w-64'}`}>
            {filteredMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start space-x-3 ${
                  item.id === activeSection ? 'bg-indigo-50 border-r-2 border-indigo-500' : ''
                }`}
              >
                <item.icon 
                  size={18} 
                  className={`mt-0.5 ${item.id === activeSection ? 'text-indigo-600' : 'text-gray-400'}`} 
                />
                <div>
                  <p className={`font-medium ${item.id === activeSection ? 'text-indigo-900' : 'text-gray-900'} ${isMobile ? 'text-sm' : ''}`}>
                    {item.name}
                  </p>
                  <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}