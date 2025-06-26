import React from 'react';

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
}

export default function FinanceiroHeader({
  menuItems,
  activeSection,
  onSectionChange,
  currentDate
}: FinanceiroHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
            <p className="text-gray-600 mt-1">Gerencie suas finanças e relatórios</p>
          </div>
          {/* REMOVIDO: Card de data duplicado */}
        </div>

        {/* Menu de navegação moderno - reordenado com Histórico primeiro */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200 text-left group
                  ${isActive 
                    ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }
                `}
              >
                <div className="flex items-start space-x-3">
                  <div className={`
                    p-2 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-indigo-100 text-indigo-600' 
                      : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                    }
                  `}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`
                      font-semibold text-sm mb-1 transition-colors
                      ${isActive ? 'text-indigo-900' : 'text-gray-900'}
                    `}>
                      {item.name}
                    </h3>
                    <p className={`
                      text-xs leading-relaxed transition-colors
                      ${isActive ? 'text-indigo-700' : 'text-gray-500'}
                    `}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}