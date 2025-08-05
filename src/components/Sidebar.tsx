import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Users from 'lucide-react/dist/esm/icons/users';
import UserCircle from 'lucide-react/dist/esm/icons/user-circle';
import Scissors from 'lucide-react/dist/esm/icons/scissors';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import BarChart2 from 'lucide-react/dist/esm/icons/bar-chart-2';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Link2 from 'lucide-react/dist/esm/icons/link-2';
import X from 'lucide-react/dist/esm/icons/x';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isMobile = false, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, isEmployee } = useAuth();

  // Definir todos os itens do menu
  const allMenuItems = [
    { id: 'agenda', name: 'Agenda', icon: Calendar, path: '/agenda' },
    { id: 'clientes', name: 'Clientes', icon: Users, path: '/clientes' },
    { id: 'profissionais', name: 'Profissionais', icon: UserCircle, path: '/profissionais' },
    { id: 'servicos', name: 'Serviços', icon: Scissors, path: '/servicos' },
    { id: 'financeiro', name: 'Relatório', icon: DollarSign, path: '/financeiro' },
    { id: 'link-agendamento', name: 'Link de Agendamento', icon: Link2, path: '/link-agendamento' },
    { id: 'configuracoes', name: 'Configurações', icon: Settings, path: '/configuracoes' },
  ];

  // Filtrar itens baseado no role do usuário
  const menuItems = allMenuItems.filter(item => {
    // Se for funcionário, mostrar apenas agenda
    if (isEmployee) {
      return item.id === 'agenda';
    }
    
    // Se for admin, mostrar todos os itens
    if (isAdmin) {
      return true;
    }
    
    // Por padrão, mostrar todos (fallback)
    return true;
  });

  const handleMenuClick = (path: string) => {
    navigate(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

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
            const isActive = location.pathname === item.path;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleMenuClick(item.path)}
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