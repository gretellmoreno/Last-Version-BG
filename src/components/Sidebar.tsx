import React, { useState } from 'react';
import { Calendar, Users, UserCheck, Scissors, DollarSign, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';

interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
}

const menuItems = [
  { id: 'agenda', name: 'Agendamentos', icon: Calendar },
  { id: 'clientes', name: 'Clientes', icon: Users },
  { id: 'profissionais', name: 'Funcionários', icon: UserCheck },
  { id: 'servicos', name: 'Serviços e Produtos', icon: Scissors },
  { id: 'financeiro', name: 'Financeiro', icon: DollarSign },
];

export default function Sidebar({ activeMenu, onMenuChange }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { signOut } = useAuth();
  const { currentUser, currentSalon } = useApp();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div 
      className={`
        fixed left-0 top-0 h-full bg-white shadow-sm border-r border-gray-200 z-50
        transition-all duration-300 ease-in-out
        ${isHovered ? 'w-64' : 'w-16'}
        flex flex-col
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {currentSalon?.name?.charAt(0)?.toUpperCase() || 'S'}
            </span>
          </div>
          
          <div className={`
            ml-3 transition-all duration-300 overflow-hidden
            ${isHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
          `}>
            <h2 className="font-semibold text-gray-900 whitespace-nowrap">
              {currentSalon?.name || 'Salão'}
            </h2>
            <p className="text-xs text-gray-500 whitespace-nowrap">
              {currentSalon?.phone || 'Gestão'}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onMenuChange(item.id)}
                className={`
                  w-full flex items-center px-3 py-3 rounded-lg
                  transition-all duration-200 ease-in-out
                  group relative overflow-hidden
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }
                `}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                <div className={`
                  flex items-center justify-center w-5 h-5 flex-shrink-0
                  transition-all duration-200
                  ${isActive ? 'text-indigo-600' : 'group-hover:text-gray-700'}
                `}>
                  <Icon size={20} />
                </div>
                
                <span className={`
                  ml-3 font-medium text-sm whitespace-nowrap
                  transition-all duration-300 overflow-hidden
                  ${isHovered 
                    ? 'opacity-100 w-auto' 
                    : 'opacity-0 w-0'
                  }
                  ${isActive ? 'text-indigo-600' : ''}
                `}>
                  {item.name}
                </span>

                {/* Tooltip para quando não expandido */}
                {!isHovered && (
                  <div className="
                    absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg
                    opacity-0 pointer-events-none group-hover:opacity-100
                    transition-all duration-200 whitespace-nowrap z-50
                    shadow-lg
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

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        {/* User Info */}
        <div className={`
          flex items-center transition-all duration-300 overflow-hidden
          ${isHovered ? 'opacity-100 h-auto mb-3' : 'opacity-0 h-0 mb-0'}
        `}>
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {currentUser?.name || 'Usuário'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {currentUser?.email}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="
            w-full flex items-center px-3 py-2 rounded-lg
            text-gray-500 hover:bg-red-50 hover:text-red-600
            transition-all duration-200 ease-in-out
            group relative
          "
        >
          <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
            <LogOut size={18} />
          </div>
          
          <span className={`
            ml-3 font-medium text-sm whitespace-nowrap
            transition-all duration-300 overflow-hidden
            ${isHovered 
              ? 'opacity-100 w-auto' 
              : 'opacity-0 w-0'
            }
          `}>
            Sair
          </span>

          {/* Tooltip para quando não expandido */}
          {!isHovered && (
            <div className="
              absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg
              opacity-0 pointer-events-none group-hover:opacity-100
              transition-all duration-200 whitespace-nowrap z-50
              shadow-lg
            ">
              Sair
              <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          )}
        </button>

        {/* Version Info */}
        <div className={`
          transition-all duration-300 overflow-hidden
          ${isHovered ? 'opacity-100 h-auto' : 'opacity-0 h-0'}
        `}>
          <div className="text-center">
            <p className="text-xs text-gray-400 whitespace-nowrap">Versão 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}