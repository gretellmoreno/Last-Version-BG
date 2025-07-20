import React, { useState } from 'react';
import { Plus, Menu, Eye, EyeOff } from 'lucide-react';
import DatePicker from './DatePicker';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onAddClick?: () => void;
  onMenuClick?: () => void;
  hasDateNavigation?: boolean;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  showHistoryButton?: boolean;
  onHistoryToggle?: () => void;
  isHistoryOpen?: boolean;
  onHistoryClose?: () => void;
  isMobile?: boolean;
  onOnlineClick?: () => void; // ADICIONADO
}

export default function Header({ 
  title, 
  subtitle, 
  onAddClick, 
  onMenuClick,
  hasDateNavigation = false,
  selectedDate = new Date(),
  onDateChange = () => {},
  showHistoryButton = false,
  onHistoryToggle,
  isHistoryOpen = false,
  onHistoryClose,
  isMobile = false,
  onOnlineClick
}: HeaderProps) {
  const handleHistoryClick = () => {
    if (isHistoryOpen && onHistoryClose) {
      onHistoryClose();
    } else if (onHistoryToggle) {
      onHistoryToggle();
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-3">
          {/* Menu lateral no canto esquerdo */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
          )}
          
          <h1 className="text-lg font-semibold text-gray-900 flex-1 text-center">{title}</h1>
          
          <div className="flex items-center space-x-2">
            {showHistoryButton && (
              <button
                onClick={handleHistoryClick}
                className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center"
              >
                {isHistoryOpen ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            )}
            
            {onAddClick && (
              <button
                onClick={onAddClick}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
        </div>
        
        {hasDateNavigation && (
          <div className={onMenuClick ? 'ml-0' : 'ml-12'}>
            <DatePicker 
              selectedDate={selectedDate}
              onDateChange={onDateChange}
            />
          </div>
        )}
        
        {subtitle && (
          <div className={`${onMenuClick ? 'ml-0' : 'ml-12'} mt-2`}>
            <span className="text-sm text-gray-500">{subtitle}</span>
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          
          {hasDateNavigation && (
            <DatePicker 
              selectedDate={selectedDate}
              onDateChange={onDateChange}
            />
          )}
          
          {subtitle && (
            <span className="text-sm text-gray-500">{subtitle}</span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {showHistoryButton && (
            <button
              onClick={handleHistoryClick}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center space-x-2"
            >
              {isHistoryOpen ? <Eye size={16} /> : <EyeOff size={16} />}
              <span>{isHistoryOpen ? 'Fechar Histórico' : 'Ver Histórico'}</span>
            </button>
          )}
          {onOnlineClick && (
            <button
              onClick={onOnlineClick}
              className="p-2 rounded-full hover:bg-indigo-50 text-indigo-600 transition mr-1"
              title="Agendamentos Online"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="lucide lucide-globe hidden lg:block" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/></svg>
              <svg xmlns="http://www.w3.org/2000/svg" className="lucide lucide-globe lg:hidden" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/></svg>
            </button>
          )}
          {onAddClick && (
            <button
              onClick={onAddClick}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 shadow-sm"
            >
              <Plus size={16} />
              <span>Adicionar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}