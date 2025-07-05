import React, { useState } from 'react';
import { CreditCard, History } from 'lucide-react';
import FinanceiroHeader from '../components/financeiro/FinanceiroHeader';
import TaxasSection from '../components/financeiro/TaxasSection';
import HistoricoSection from '../components/financeiro/HistoricoSection';
import { useFinanceiro } from '../contexts/FinanceiroContext';

export default function Financeiro({ onToggleMobileSidebar, isMobile }: { onToggleMobileSidebar?: () => void; isMobile?: boolean } = {}) {
  const [activeSection, setActiveSection] = useState<'taxas' | 'historico'>('historico');
  
  const { historicoFechamentos } = useFinanceiro();

  const menuItems = [
    { 
      id: 'historico', 
      name: 'Histórico', 
      icon: History,
      description: 'Relatórios e histórico financeiro'
    },
    { 
      id: 'taxas', 
      name: 'Taxas de Pagamento', 
      icon: CreditCard,
      description: 'Configurar taxas e métodos'
    }
  ];

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

  const handleSectionChange = (section: string) => {
    setActiveSection(section as 'taxas' | 'historico');
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden">
      <FinanceiroHeader 
        menuItems={menuItems}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        currentDate={getCurrentDate()}
        onMenuClick={handleMenuClick}
        isMobile={isMobile}
      />
      
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {activeSection === 'historico' && (
          <HistoricoSection 
            currentDate={getCurrentDate()}
          />
        )}
        
        {activeSection === 'taxas' && (
          <TaxasSection />
        )}
      </div>
    </div>
  );
}