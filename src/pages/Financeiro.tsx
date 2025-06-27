import React, { useState } from 'react';
import { Receipt, CreditCard, History, Calculator } from 'lucide-react';
import FinanceiroHeader from '../components/financeiro/FinanceiroHeader';
import ValesSection from '../components/financeiro/ValesSection';
import FechamentoCaixaSection from '../components/financeiro/FechamentoCaixaSection';
import TaxasSection from '../components/financeiro/TaxasSection';
import HistoricoSection from '../components/financeiro/HistoricoSection';
import ValeModal from '../components/ValeModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import PeriodFilterModal from '../components/PeriodFilterModal';
import FechamentoCaixaModal from '../components/FechamentoCaixaModal';
import HistoricoFechamentoModal from '../components/HistoricoFechamentoModal';
import { useProfessional } from '../contexts/ProfessionalContext';
import { useFinanceiro } from '../contexts/FinanceiroContext';

export default function Financeiro() {
  // MUDANÇA: Relatório financeiro (historico) como padrão
  const [activeSection, setActiveSection] = useState<'vales' | 'fechamento' | 'taxas' | 'historico'>('historico');
  const [isValeModalOpen, setIsValeModalOpen] = useState(false);
  const [editingVale, setEditingVale] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [valeToDelete, setValeToDelete] = useState<any>(null);
  
  // Estados para fechamento de caixa
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isFechamentoModalOpen, setIsFechamentoModalOpen] = useState(false);
  const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<string>('');
  const [periodFilter, setPeriodFilter] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [hasSearched, setHasSearched] = useState(false);
  
  const { professionals } = useProfessional();
  const { 
    vales, 
    loading,
    error,
    addVale, 
    updateVale, 
    removeVale,
    servicosParaFechamento,
    historicoFechamentos,
    addFechamentoHistorico
  } = useFinanceiro();

  const menuItems = [
    { 
      id: 'historico', 
      name: 'Histórico', 
      icon: History,
      description: 'Relatórios e histórico financeiro'
    },
    { 
      id: 'vales', 
      name: 'Vales', 
      icon: Receipt,
      description: 'Gerenciar vales e adiantamentos'
    },
    { 
      id: 'fechamento', 
      name: 'Fechamento de Caixa', 
      icon: Calculator,
      description: 'Controle diário de caixa'
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  const formatPeriodDisplay = () => {
    if (periodFilter.start === periodFilter.end) {
      return `Hoje (${formatDate(periodFilter.start)})`;
    }
    return `${formatDate(periodFilter.start)} - ${formatDate(periodFilter.end)}`;
  };

  const handleNewVale = () => {
    setEditingVale(null);
    setIsValeModalOpen(true);
  };

  const handleEditVale = (vale: any) => {
    setEditingVale(vale);
    setIsValeModalOpen(true);
  };

  const handleSaveVale = async (vale: any) => {
    try {
      let success = false;
    if (editingVale) {
        success = await updateVale(vale.id, vale);
    } else {
        success = await addVale(vale);
      }
      
      if (success) {
        setIsValeModalOpen(false);
        setEditingVale(null);
      }
    } catch (err) {
      console.error('Erro ao salvar vale:', err);
    }
  };

  const handleDeleteClick = (vale: any) => {
    setValeToDelete(vale);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (valeToDelete) {
      try {
        const success = await removeVale(valeToDelete.id);
        if (success) {
      setDeleteModalOpen(false);
      setValeToDelete(null);
        }
      } catch (err) {
        console.error('Erro ao deletar vale:', err);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setValeToDelete(null);
  };

  const handlePeriodApply = (startDate: string, endDate: string) => {
    setPeriodFilter({ start: startDate, end: endDate });
  };

  const handleBuscar = () => {
    if (selectedProfessional && periodFilter.start && periodFilter.end) {
      setHasSearched(true);
    }
  };

  const handleProfessionalChange = (professionalId: string) => {
    setSelectedProfessional(professionalId);
    setHasSearched(false);
  };

  const handleFecharCaixa = () => {
    const totalLiquido = servicosParaFechamento.reduce((sum, s) => sum + s.valorLiquido, 0);
    const profissional = professionals.find(p => p.id === selectedProfessional);
    
    if (profissional) {
      const novoFechamento = {
        id: Date.now().toString(),
        data: getCurrentDate(),
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        profissionalNome: profissional.name,
        servicos: servicosParaFechamento,
        totalLiquido
      };
      
      addFechamentoHistorico(novoFechamento);
      setIsFechamentoModalOpen(false);
      setHasSearched(false);
      setActiveSection('historico');
    }
  };

  const getProfessionalName = (professionalId: string) => {
    const prof = professionals.find(p => p.id === professionalId);
    return prof ? prof.name : '';
  };

  const totalLiquidoFechamento = servicosParaFechamento.reduce((sum, s) => sum + s.valorLiquido, 0);
  const canSearch = selectedProfessional && periodFilter.start && periodFilter.end;

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden">
      <FinanceiroHeader 
        menuItems={menuItems}
        activeSection={activeSection}
        onSectionChange={(section) => setActiveSection(section as 'vales' | 'fechamento' | 'taxas' | 'historico')}
        currentDate={getCurrentDate()}
      />

      {/* MUDANÇA: Adicionado overflow-y-auto para permitir scroll vertical */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeSection === 'historico' && (
          <HistoricoSection currentDate={getCurrentDate()} />
        )}

        {activeSection === 'vales' && (
          <ValesSection
            vales={vales}
            loading={loading}
            error={error}
            onNewVale={handleNewVale}
            onEditVale={handleEditVale}
            onDeleteVale={handleDeleteClick}
            formatDate={formatDate}
          />
        )}

        {activeSection === 'fechamento' && (
          <FechamentoCaixaSection
            selectedProfessional={selectedProfessional}
            periodFilter={periodFilter}
            hasSearched={hasSearched}
            canSearch={!!canSearch}
            servicosParaFechamento={servicosParaFechamento}
            totalLiquidoFechamento={totalLiquidoFechamento}
            profissionais={professionals}
            onProfessionalChange={handleProfessionalChange}
            onPeriodModalOpen={() => setIsPeriodModalOpen(true)}
            onBuscar={handleBuscar}
            onHistoricoModalOpen={() => setIsHistoricoModalOpen(true)}
            onFechamentoCaixaModalOpen={() => setIsFechamentoModalOpen(true)}
            formatPeriodDisplay={formatPeriodDisplay}
            getProfessionalName={getProfessionalName}
          />
        )}

        {activeSection === 'taxas' && <TaxasSection />}
      </div>

      {/* Modais */}
      <ValeModal
        isOpen={isValeModalOpen}
        onClose={() => setIsValeModalOpen(false)}
        onSave={handleSaveVale}
        editingVale={editingVale}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir vale?"
        message="Tem certeza que deseja excluir este vale? Esta ação não pode ser desfeita."
      />

      <PeriodFilterModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        onApply={handlePeriodApply}
        currentPeriod={periodFilter}
      />

      <FechamentoCaixaModal
        isOpen={isFechamentoModalOpen}
        onClose={() => setIsFechamentoModalOpen(false)}
        onConfirm={handleFecharCaixa}
        totalLiquido={totalLiquidoFechamento}
        profissionalNome={getProfessionalName(selectedProfessional)}
        periodo={formatPeriodDisplay()}
        servicos={servicosParaFechamento}
      />

      <HistoricoFechamentoModal
        isOpen={isHistoricoModalOpen}
        onClose={() => setIsHistoricoModalOpen(false)}
        fechamentos={historicoFechamentos}
        profissionalNome="Carmen"
      />
    </div>
  );
}