import React, { useState } from 'react';
import { Calendar, Users, UserCheck, Scissors, DollarSign, LogOut, User, X, TrendingUp, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';

interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

const menuItems = [
  { id: 'agenda', name: 'Agendamentos', icon: Calendar, color: 'from-blue-500 to-blue-600' },
  { id: 'clientes', name: 'Clientes', icon: Users, color: 'from-green-500 to-green-600' },
  { id: 'profissionais', name: 'Funcionários', icon: UserCheck, color: 'from-purple-500 to-purple-600' },
  { id: 'servicos', name: 'Serviços e Produtos', icon: Scissors, color: 'from-pink-500 to-pink-600' },
  { id: 'financeiro', name: 'Financeiro', icon: DollarSign, color: 'from-amber-500 to-amber-600' },
  { id: 'performance', name: 'Performance', icon: TrendingUp, color: 'from-emerald-500 to-emerald-600' },
  { id: 'configuracoes', name: 'Configurações', icon: Settings, color: 'from-slate-500 to-slate-600' },
];

export default function Sidebar({ activeMenu, onMenuChange, isMobile = false, onClose }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { signOut } = useAuth();
  const { currentUser, currentSalon } = useApp();

  const handleLogout = async () => {
    await signOut();
  };

  const handleMenuChange = (menu: string) => {
    onMenuChange(menu);
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Versão Mobile
  if (isMobile) {
    return (
      <div className="h-full bg-gradient-to-b from-gray-50 to-white flex flex-col">
        {/* Header Mobile Elegante */}
        <div className="p-3 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-base">
                  {currentSalon?.name?.charAt(0)?.toUpperCase() || 'D'}
                </span>
              </div>
              <div className="ml-2.5">
                <h2 className="font-bold text-gray-900 text-base">
                  {currentSalon?.name || 'Demo'}
                </h2>
                <p className="text-sm text-gray-500 font-medium">
                  BelaGestão
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <X size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Menu Items Mobile Compacto */}
        <nav className="flex-1 p-3 bg-gray-50">
          <div className="space-y-0.5">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuChange(item.id)}
                  className={`
                    w-full flex items-center px-2.5 py-2 rounded-lg
                    transition-all duration-300 text-left
                    ${isActive 
                      ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-100 border border-indigo-100' 
                      : 'text-gray-600 hover:bg-white hover:shadow-md'
                    }
                  `}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className={`
                    w-7 h-7 rounded-lg flex items-center justify-center
                    transition-all duration-300
                    ${isActive 
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                      : 'bg-gray-100 text-gray-500'
                    }
                  `}>
                    <Icon size={14} />
                  </div>
                  <span className="ml-2.5 font-semibold text-sm">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Info & Logout Mobile */}
        <div className="p-3 bg-white border-t border-gray-100">
          {/* User Info Compacto */}
          <div className="flex items-center mb-2 p-2.5 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="ml-2.5 flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-xs truncate">
                {currentUser?.name || 'Dono do Salão Demo'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentUser?.email || 'demo@belagestao.com'}
              </p>
            </div>
          </div>

          {/* Logout Button Elegante */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-2.5 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
          >
            <div className="w-7 h-7 bg-gray-100 group-hover:bg-red-100 rounded-lg flex items-center justify-center transition-all duration-300">
              <LogOut size={14} />
            </div>
            <span className="ml-2.5 font-semibold text-sm">Sair</span>
          </button>

          {/* Version Info Elegante */}
          <div className="text-center mt-2">
            <p className="text-xs text-gray-400 font-medium">Versão 1.0.0</p>
          </div>
        </div>
      </div>
    );
  }

  // Versão Desktop Redesenhada
  return (
    <div 
      className={`
        fixed left-0 top-0 h-full bg-white shadow-2xl border-r border-gray-100 z-50
        transition-all duration-300 ease-in-out
        ${isHovered ? 'w-60' : 'w-16'}
        flex flex-col overflow-hidden
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header Desktop Elegante */}
      <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
        <div className="flex items-center">
          <div className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-white font-bold text-base">
              {currentSalon?.name?.charAt(0)?.toUpperCase() || 'D'}
            </span>
          </div>
          
          <div className={`
            ml-2.5 transition-all duration-300 overflow-hidden
            ${isHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
          `}>
            <h2 className="font-bold text-gray-900 whitespace-nowrap text-base">
              {currentSalon?.name || 'Demo'}
            </h2>
            <p className="text-sm text-indigo-600 whitespace-nowrap font-semibold">
              BelaGestão
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items Desktop Elegante */}
      <nav className="flex-1 p-2.5 bg-gray-50">
        <div className="space-y-0.5">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onMenuChange(item.id)}
                className={`
                  w-full flex items-center px-2.5 py-2 rounded-lg
                  transition-all duration-300 ease-in-out
                  group relative overflow-hidden
                  ${isActive 
                    ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100 border border-indigo-100' 
                    : 'text-gray-600 hover:bg-white hover:shadow-lg'
                  }
                `}
                style={{
                  animationDelay: `${index * 80}ms`
                }}
              >
                <div className={`
                  w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                  transition-all duration-300 
                  ${isActive 
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                  }
                `}>
                  <Icon size={14} />
                </div>
                
                <span className={`
                  ml-2.5 font-semibold text-sm whitespace-nowrap
                  transition-all duration-300 overflow-hidden
                  ${isHovered 
                    ? 'opacity-100 w-auto' 
                    : 'opacity-0 w-0'
                  }
                  ${isActive ? 'text-indigo-600' : ''}
                `}>
                  {item.name}
                </span>

                {/* Tooltip Moderno */}
                {!isHovered && (
                  <div className="
                    absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-xl
                    opacity-0 pointer-events-none group-hover:opacity-100
                    transition-all duration-300 whitespace-nowrap z-50
                    shadow-2xl
                  ">
                    {item.name}
                    <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Info & Logout Desktop */}
      <div className="p-2.5 bg-white border-t border-gray-100">
        {/* User Info Compacto */}
        <div className={`
          flex items-center transition-all duration-300 overflow-hidden mb-1.5
          ${isHovered ? 'opacity-100 h-auto' : 'opacity-0 h-0'}
        `}>
          <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="ml-2.5 min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {currentUser?.name || 'Dono do Salão Demo'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {currentUser?.email || 'demo@belagestao.com'}
            </p>
          </div>
        </div>

        {/* Logout Button Elegante */}
        <button
          onClick={handleLogout}
          className="
            w-full flex items-center px-2.5 py-2 rounded-lg
            text-gray-600 hover:bg-red-50 hover:text-red-600
            transition-all duration-300 ease-in-out
            group relative
          "
        >
          <div className="w-7 h-7 bg-gray-100 group-hover:bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300">
            <LogOut size={14} />
          </div>
          
          <span className={`
            ml-2.5 font-semibold text-sm whitespace-nowrap
            transition-all duration-300 overflow-hidden
            ${isHovered 
              ? 'opacity-100 w-auto' 
              : 'opacity-0 w-0'
            }
          `}>
            Sair
          </span>

          {/* Tooltip Elegante */}
          {!isHovered && (
            <div className="
              absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-xl
              opacity-0 pointer-events-none group-hover:opacity-100
              transition-all duration-300 whitespace-nowrap z-50
              shadow-2xl
            ">
              Sair
              <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          )}
        </button>

        {/* Version Info Elegante */}
        <div className={`
          transition-all duration-300 overflow-hidden mt-1.5
          ${isHovered ? 'opacity-100 h-auto' : 'opacity-0 h-0'}
        `}>
          <div className="text-center">
            <p className="text-xs text-gray-400 whitespace-nowrap font-medium">Versão 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}