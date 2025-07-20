import React from 'react';
import { Calendar, Users, UserCircle, Scissors, DollarSign, BarChart2, Settings, Link2, X } from 'lucide-react';

interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ activeMenu, onMenuChange, isMobile = false, onClose }: SidebarProps) {
  const menuItems = [
    { id: 'agenda', name: 'Agenda', icon: Calendar },
    { id: 'clientes', name: 'Clientes', icon: Users },
    { id: 'profissionais', name: 'Profissionais', icon: UserCircle },
    { id: 'servicos', name: 'Serviços', icon: Scissors },
    { id: 'financeiro', name: 'Relatório', icon: DollarSign },
    { id: 'link-agendamento', name: 'Link de Agendamento', icon: Link2 },
    { id: 'configuracoes', name: 'Configurações', icon: Settings },
  ];

  return (
    <div className={`group h-full bg-white border-r border-gray-200 ${isMobile ? 'w-64' : 'w-16 hover:w-64'} transition-all duration-300 flex flex-col`}>
      {/* Header */}
      <div className={`flex items-center ${isMobile ? 'justify-between px-4' : 'justify-center group-hover:justify-start group-hover:px-4'} h-16 border-b border-gray-200`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <h1 className={`font-bold text-gray-900 ${isMobile ? 'block' : 'hidden group-hover:block'}`}>
            BelaGestão
          </h1>
        </div>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onMenuChange(item.id)}
                  className={`w-full flex items-center gap-x-2 px-3 py-2 rounded-lg transition-all duration-200
            ${isActive ? 'bg-indigo-50 border-l-4 border-indigo-500 text-indigo-700 font-semibold shadow-sm' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}
          `}
                >
                  <span className={`flex items-center justify-center rounded-full transition-all
            ${isActive ? 'bg-indigo-100 text-indigo-600 shadow-md' : 'text-gray-400 group-hover:text-indigo-500'}
            ${isMobile ? 'w-8 h-8' : 'w-8 h-8'}
          `}>
                    <Icon size={22} />
                  </span>
                  <span className={`truncate ${isMobile ? 'block' : 'hidden group-hover:block'}`}>{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}