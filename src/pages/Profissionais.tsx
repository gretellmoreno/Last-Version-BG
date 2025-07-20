import React, { useState, useEffect } from 'react';
import { Edit3, Trash2, User, UserPlus, Loader2, Users, Receipt, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Professional } from '../types';
import { useProfessional } from '../contexts/ProfessionalContext';
import { useFinanceiro } from '../contexts/FinanceiroContext';
import ProfessionalModal from '../components/ProfessionalModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import ValesSection from '../components/financeiro/ValesSection';
import FechamentoCaixaSection from '../components/financeiro/FechamentoCaixaSection';
import ValeModal from '../components/ValeModal';
import Header from '../components/Header';
import HistoricoFechamentoModal from '../components/HistoricoFechamentoModal';
import PeriodFilterModal from '../components/PeriodFilterModal';
import { supabaseService } from '../lib/supabaseService';
import { getTodayLocal, formatDateForDisplay } from '../utils/dateUtils';

const Profissionais: React.FC<{ onToggleMobileSidebar?: () => void; isMobile?: boolean }> = ({ onToggleMobileSidebar, isMobile: isMobileProp }) => {
  const { professionals, loading, error, addProfessional, updateProfessional, removeProfessional } = useProfessional();
  const { removeVale } = useFinanceiro();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [professionalToDelete, setProfessionalToDelete] = useState<Professional | null>(null);
  const [isMobile, setIsMobile] = useState(isMobileProp || false);
  const [activeTab, setActiveTab] = useState<'profissionais' | 'vales' | 'fechamento'>('profissionais');
  
  // Estados para ValeModal
  const [isValeModalOpen, setIsValeModalOpen] = useState(false);
  const [editingVale, setEditingVale] = useState<any>(null);
  
  // Estado para controlar modal de histórico
  const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Estado para modal de período
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);

  useEffect(() => {
    if (isMobileProp !== undefined) {
      setIsMobile(isMobileProp);
      return;
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobileProp]);

  const handleAddProfessional = async (professionalData: Omit<Professional, 'id' | 'created_at' | 'updated_at' | 'salon_id'>) => {
    const success = await addProfessional(professionalData);
    if (success) {
      setIsModalOpen(false);
      setEditingProfessional(null);
    }
  };

  const handleEditProfessional = async (professionalData: Omit<Professional, 'id' | 'created_at' | 'updated_at' | 'salon_id'>) => {
    if (!editingProfessional) return;
    
    const success = await updateProfessional(editingProfessional.id, professionalData);
    if (success) {
      setIsModalOpen(false);
      setEditingProfessional(null);
    }
  };

  const handleDeleteProfessional = async () => {
    if (!professionalToDelete) return;
    
    const success = await removeProfessional(professionalToDelete.id);
    if (success) {
      setProfessionalToDelete(null);
    }
  };

  const openEditModal = (professional: Professional) => {
    setEditingProfessional(professional);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (professional: Professional) => {
    setProfessionalToDelete(professional);
    setIsModalOpen(false); // Fechar o modal de edição
    setEditingProfessional(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProfessional(null);
  };

  const handleMenuClick = () => {
    if (onToggleMobileSidebar) {
      onToggleMobileSidebar();
    }
  };

  const handleNewProfessional = () => {
    setEditingProfessional(null);
    setIsModalOpen(true);
  };

  // Funções mockadas para Vales (você pode implementar com contexto próprio)
  const mockVales = [];

  const formatDate = (dateStr: string) => {
    return formatDateForDisplay(dateStr);
  };

  // Funções para Fechamento de Caixa
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [periodFilter, setPeriodFilter] = useState(() => {
    const today = getTodayLocal();
    return {
      start: today,
      end: today
    };
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [canConfirmClosure, setCanConfirmClosure] = useState(false);
  
  // Dados padrão vazios para quando não há pré-visualização
  const defaultServicos: any[] = [];
  const defaultTotal = 0;

  // Função para mapear os dados da API para o formato esperado pelo componente
  const mapApiDataToComponent = (apiData: any) => {
    if (!apiData?.preview?.services) return defaultServicos;
    
    return apiData.preview.services.map((service: any) => ({
      data: service.date.split('T')[0], // Garante que a data está no formato YYYY-MM-DD
      cliente: service.client || null,
      servico: service.service,
      valorBruto: service.grossValue,
      taxa: service.feeValue,
      comissao: service.commissionValue,
      valorLiquido: service.netValue
    }));
  };

  const formatPeriodDisplay = () => {
    if (periodFilter.start === periodFilter.end) {
      return formatDate(periodFilter.start);
    }
    return `${formatDate(periodFilter.start)} - ${formatDate(periodFilter.end)}`;
  };

  const getProfessionalName = (professionalId: string) => {
    const prof = professionals.find(p => p.id === professionalId);
    return prof ? prof.name : 'Profissional não encontrado';
  };

  if (loading && professionals.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-pink-600" />
          <span className="text-gray-700">Carregando profissionais...</span>
        </div>
      </div>
    );
  }

  const onBuscar = async () => {
    if (!selectedProfessional) return;
    
    setIsLoadingPreview(true);
    setHasSearched(false);
    setCanConfirmClosure(false);
    setPreviewData(null);
    
    const salonId = professionals.find(p => p.id === selectedProfessional)?.salon_id || '';
    const dateFrom = periodFilter.start.split('T')[0]; // Garante que a data está no formato YYYY-MM-DD
    const dateTo = (periodFilter.end || periodFilter.start).split('T')[0]; // Garante que a data está no formato YYYY-MM-DD
    
    try {
      console.log('Enviando requisição com parâmetros:', {
        salonId,
        professionalId: selectedProfessional,
        dateFrom,
        dateTo
      });

      const result = await supabaseService.finance.getCashClosurePreview({
        salonId,
        professionalId: selectedProfessional,
        dateFrom,
        dateTo
      });
      
      console.log('Resposta completa da API:', JSON.stringify(result, null, 2));
      
      if (result.error) {
        alert(`Erro ao buscar dados: ${result.error}`);
      } else if (result.data) {
        console.log('Dados recebidos:', JSON.stringify(result.data, null, 2));
        setPreviewData(result.data);
        setCanConfirmClosure(true);
      } else {
        alert('Nenhum dado retornado pela API');
      }
      
      setHasSearched(true);
    } catch (err) {
      console.error('Erro na chamada da API:', err);
      alert('Erro inesperado ao buscar dados');
      setHasSearched(true);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleConfirmarFechamento = () => {
    // Resetar todos os estados relacionados ao fechamento
    setPreviewData(null);
    setHasSearched(false);
    setCanConfirmClosure(false);
    setSelectedProfessional('');
    setPeriodFilter({
      start: getTodayLocal(),
      end: getTodayLocal()
    });
    // Abrir o modal de histórico
    setIsHistoricoModalOpen(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'vales':
        return (
          <ValesSection
            onNewVale={handleNewVale}
            onEditVale={handleEditVale}
            formatDate={formatDate}
          />
        );
      
      case 'fechamento':
        return (
          <FechamentoCaixaSection
            selectedProfessional={selectedProfessional}
            periodFilter={periodFilter}
            hasSearched={hasSearched}
            canSearch={!!selectedProfessional}
            servicosParaFechamento={previewData ? mapApiDataToComponent(previewData) : defaultServicos}
            totalLiquidoFechamento={(() => {
              if (!previewData) return defaultTotal;
              const servicos = mapApiDataToComponent(previewData);
              const total = servicos.reduce((total: number, servico: any) => total + servico.valorLiquido, 0);
              console.log('✅ Profissionais: Calculando total líquido:', {
                servicos: servicos.length,
                valoresLiquidos: servicos.map((s: any) => s.valorLiquido),
                totalCalculado: total
              });
              return total;
            })()}
            isLoadingPreview={isLoadingPreview}
            canConfirmClosure={canConfirmClosure}
            setCanConfirmClosure={setCanConfirmClosure}
            profissionais={professionals}
            onProfessionalChange={setSelectedProfessional}
            onPeriodModalOpen={() => setIsPeriodModalOpen(true)}
            onBuscar={onBuscar}
            onConfirmarFechamento={handleConfirmarFechamento}
            onHistoricoModalOpen={() => setIsHistoricoModalOpen(true)}
            formatPeriodDisplay={formatPeriodDisplay}
            getProfessionalName={getProfessionalName}
            previewData={previewData}
          />
        );
      
      default:
        return (
          <div className={`${isMobile ? 'space-y-2' : 'space-y-4'}`}>
            {/* Mensagem de erro */}
            {error && (
              <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${isMobile ? 'text-sm' : ''}`}>
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Content */}
            {professionals.length === 0 ? (
              <div className={`bg-white rounded-lg shadow-sm text-center ${isMobile ? 'p-6' : 'p-8'}`}>
                <User className={`text-gray-400 mx-auto mb-4 ${isMobile ? 'w-10 h-10' : 'w-12 h-12'}`} />
                <h3 className={`font-medium text-gray-900 mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                  Nenhum profissional cadastrado
                </h3>
                <p className={`text-gray-500 mb-4 ${isMobile ? 'text-sm' : ''}`}>
                  Comece adicionando seus profissionais à equipe
                </p>
                <button
                  onClick={handleNewProfessional}
                  className={`bg-pink-600 hover:bg-pink-700 text-white rounded-lg flex items-center space-x-2 transition-colors mx-auto ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'}`}
                >
                  <UserPlus className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
                  <span>{isMobile ? 'Adicionar' : 'Adicionar Primeiro Profissional'}</span>
                </button>
              </div>
            ) : (
              <>
                {isMobile ? (
                  /* Cards horizontais para mobile - padronizado com serviços/produtos */
                  <div className="space-y-1.5 h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin pr-1 pb-6">
                    {professionals.map((professional) => (
                      <div
                        key={professional.id}
                        onClick={() => openEditModal(professional)}
                        className="relative bg-white rounded-lg shadow-sm border border-gray-100 p-2 hover:shadow-md hover:border-pink-200 transition-all duration-200 cursor-pointer active:scale-95"
                      >
                        
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="flex-1 pr-4">
                            <h3 className="font-medium text-gray-900 text-xs">{professional.name}</h3>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-1.5">
                          <div>
                            <p className="font-semibold text-xs text-gray-900">
                              {professional.role || 'Profissional'}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-gray-600">
                              {professional.phone || 'Sem telefone'}
                            </p>
                          </div>
                          <div>
                            <p className={`font-semibold text-xs ${
                              professional.active ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {professional.active ? 'Ativo' : 'Inativo'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Tabela para desktop - como serviços */
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Profissional
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Cargo
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Telefone
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {professionals.map((professional) => (
                          <tr 
                            key={professional.id} 
                            onClick={() => openEditModal(professional)}
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div 
                                  className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden mr-4"
                                  style={{ backgroundColor: professional.photo ? 'transparent' : professional.color }}
                                >
                                  {professional.photo ? (
                                    <img
                                      src={professional.photo}
                                      alt={professional.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span>{professional.name.charAt(0).toUpperCase()}</span>
                                  )}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {professional.name}
                                  </div>
                                  {professional.email && (
                                    <div className="text-xs text-gray-500">{professional.email}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 font-medium">
                                {professional.role}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {professional.phone}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                professional.active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {professional.active ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        );
    }
  };

  // Função para obter título dinâmico
  const getPageTitle = () => {
    switch (activeTab) {
      case 'vales':
        return 'Vales';
      case 'fechamento':
        return 'Fechamento de Caixa';
      default:
        return 'Profissionais';
    }
  };

  // Função para obter handler de adicionar baseado na aba
  const getAddClickHandler = () => {
    switch (activeTab) {
      case 'profissionais':
        return handleNewProfessional;
      case 'vales':
        return handleNewVale;
      case 'fechamento':
        return undefined; // Fechamento não tem botão adicionar
      default:
        return undefined;
    }
  };

  // Handlers para ValeModal
  const handleNewVale = () => {
    setEditingVale(null);
    setIsValeModalOpen(true);
  };

  const handleEditVale = (vale: any) => {
    setEditingVale(vale);
    setIsValeModalOpen(true);
  };

  const handleSaveVale = async (vale: any) => {
    console.log('Salvando vale:', vale);
    // Aqui você pode implementar a lógica de salvar
    setIsValeModalOpen(false);
  };

  const handleDeleteVale = async (vale: any) => {
    try {
      const success = await removeVale(vale.id);
      if (success) {
        toast.success('Vale excluído com sucesso!');
      } else {
        toast.error('Erro ao excluir vale. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao excluir vale:', error);
      toast.error('Erro ao excluir vale. Tente novamente.');
    }
  };

  const handleCloseValeModal = () => {
    setIsValeModalOpen(false);
    setEditingVale(null);
  };

  // Função para aplicar período selecionado
  const handleApplyPeriod = (period: { start: string; end: string }) => {
    console.log('✅ Profissionais: Aplicando período:', period);
    setPeriodFilter(period);
    setHasSearched(false); // Reset busca quando mudar período
  };

  // Dados mockados para histórico de fechamentos
  const mockHistoricoFechamentos = [
    {
      id: '1',
      data: '15/01/2024',
      hora: '18:30',
      profissionalNome: 'Carmen Silva',
      servicos: [
        {
          data: '15/01/2024',
          cliente: 'Maria Silva',
          servico: 'Corte e Escova',
          valorBruto: 80.00,
          taxa: -4.00,
          comissao: 40.00,
          valorLiquido: 36.00
        },
        {
          data: '15/01/2024',
          cliente: 'Ana Santos',
          servico: 'Manicure',
          valorBruto: 25.00,
          taxa: -1.25,
          comissao: 12.50,
          valorLiquido: 11.25
        }
      ],
      totalLiquido: 47.25
    },
    {
      id: '2',
      data: '10/01/2024',
      hora: '19:15',
      profissionalNome: 'Carmen Silva',
      servicos: [
        {
          data: '10/01/2024',
          cliente: 'João Oliveira',
          servico: 'Corte Masculino',
          valorBruto: 35.00,
          taxa: -1.75,
          comissao: 17.50,
          valorLiquido: 15.75
        }
      ],
      totalLiquido: 15.75
    }
  ];

  // Função para mudar de aba e resetar histórico
  const handleTabChange = (tab: 'profissionais' | 'vales' | 'fechamento') => {
    setActiveTab(tab);
    // Reset histórico quando sair da aba fechamento
    if (tab !== 'fechamento') {
      setIsHistoricoModalOpen(false);
      setIsHistoryOpen(false);
    }
  };

  return (
    <div className="flex-1 overflow-hidden page-content h-screen">
      <Header
        title={getPageTitle()}
        onMenuClick={handleMenuClick}
        onAddClick={getAddClickHandler()}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 h-full">
        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => handleTabChange('profissionais')}
            className={`pb-4 text-sm font-medium ${
              activeTab === 'profissionais'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users size={20} />
              <span>Profissionais</span>
            </div>
          </button>

          <button
            onClick={() => handleTabChange('vales')}
            className={`pb-4 text-sm font-medium ${
              activeTab === 'vales'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Receipt size={20} />
              <span>Vales</span>
            </div>
          </button>

          <button
            onClick={() => handleTabChange('fechamento')}
            className={`pb-4 text-sm font-medium ${
              activeTab === 'fechamento'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <DollarSign size={20} />
              <span>Fechamento</span>
            </div>
          </button>
        </div>

        {/* Conteúdo */}
        {renderTabContent()}
      </div>

      {/* Modais */}
      {isModalOpen && (
        <ProfessionalModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={editingProfessional ? handleEditProfessional : handleAddProfessional}
          editingProfessional={editingProfessional}
          onDelete={editingProfessional ? () => handleDeleteClick(editingProfessional) : undefined}
          isMobile={isMobile}
        />
      )}

      {professionalToDelete && (
        <DeleteConfirmationModal
          isOpen={!!professionalToDelete}
          onClose={() => setProfessionalToDelete(null)}
          onConfirm={handleDeleteProfessional}
          title="Excluir Profissional"
          message={`Tem certeza que deseja excluir o profissional ${professionalToDelete.name}?`}
        />
      )}

      {isValeModalOpen && (
        <ValeModal
          isOpen={isValeModalOpen}
          onClose={handleCloseValeModal}
          onSave={handleSaveVale}
          editingVale={editingVale}
          onDelete={editingVale ? () => {
            handleDeleteVale(editingVale);
            handleCloseValeModal();
          } : undefined}
        />
      )}

      {isPeriodModalOpen && (
        <PeriodFilterModal
          isOpen={isPeriodModalOpen}
          onClose={() => setIsPeriodModalOpen(false)}
          onApply={handleApplyPeriod}
          currentPeriod={periodFilter}
        />
      )}

      {isHistoricoModalOpen && (
        <HistoricoFechamentoModal
          isOpen={isHistoricoModalOpen}
          onClose={() => setIsHistoricoModalOpen(false)}
          professionalId={selectedProfessional}
        />
      )}
    </div>
  );
};

export default Profissionais;